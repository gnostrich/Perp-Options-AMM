/* ─────────────────────────────────────────────────────────────────────────
   Temporal — lifecycle.js
   The state store and lifecycle engine for perps + perp-options.

   Plain browser script (no ES modules). Attaches window.Life. Pure state +
   rules — NO DOM, NO rendering. The UI wires this to buttons/tables; it does
   not live here.

   Invariants enforced (docs/UX_FORMALISM.md §0.1 — facts, not options):
     1. No naked option — every option is carved from a perp, existing or
        opened atomically in the same call.
     2. The bundle is atomic — option/spread + its carved perp open together,
        close together, in full. closeBundle takes no size argument.
     3. A carved perp is still a perp — same fields as any perp row, differs
        only by a `boundTo` tag (the bundle id it backs). No `isSliver` type.
     4. Accounting identity, every mutation:
        Σ free perp qty + Σ carved perp qty === total perp qty, exactly.
     5. Liquidation is account-level: perps + bundles, one equity pot, 50×
        cap, LP positions EXCLUDED. No per-position liquidation price.
     6. Payout is realised by trading (a closePx you pass in), not by
        settling at intrinsic |k|.
     7. Trader vs LP asymmetry: a trader owns the carved perp and it enters
        their payout; an LP does not — the LP's perp line is a display /
        calculation figure only, carried via `origin: 'opened' | 'lp'`.

   Honest simplification, out of scope for a state store: perp P&L here is
   plain linear USD pnl (side·qty·(exit−entry)), not inverse/BTC-margined
   contract math. That mechanics question belongs to the pricing/margin
   engine (book.js), not to the lifecycle store.
   ───────────────────────────────────────────────────────────────────────── */
(function (global) {
  'use strict';

  // Partition-consistency check — a real code defect if it ever fires, not
  // a user-input rejection. Called after every mutation.
  function assertIdentity(state) {
    let free = 0, carved = 0, total = 0;
    for (const p of state.perps) {
      total += p.qty;
      if (p.boundTo) carved += p.qty; else free += p.qty;
    }
    if (Math.abs(free + carved - total) > 1e-9) {
      throw new Error(
        'ACCOUNTING IDENTITY VIOLATED: free(' + free + ') + carved(' + carved +
        ') !== total(' + total + ')'
      );
    }
    return true;
  }

  function create(opts) {
    opts = opts || {};
    const spot0 = opts.spot, equityBTC0 = opts.equityBTC;
    if (!(spot0 > 0)) throw new Error('Life.create requires spot > 0');
    if (!(equityBTC0 >= 0)) throw new Error('Life.create requires equityBTC >= 0');

    let seq = 0;
    const nid = (prefix) => prefix + '_' + (++seq);

    const state = {
      perps: [],
      bundles: [],
      ledger: [],
      account: { spot: spot0, equityBTC: equityBTC0 }
    };

    function pushLedger(entry) {
      state.ledger.push(Object.assign(
        { id: nid('lg'), ts: state.ledger.length },
        entry
      ));
    }

    function findPerp(id) { return state.perps.find(p => p.id === id); }
    function findBundle(id) { return state.bundles.find(b => b.id === id); }

    // ── openPerp ──────────────────────────────────────────────────────────
    function openPerp({ side, qty } = {}) {
      if (side !== 1 && side !== -1) return { ok: false, reason: 'side must be +1 (long) or -1 (short)' };
      if (!(qty > 0)) return { ok: false, reason: 'qty must be > 0' };
      const p = {
        id: nid('perp'), side, qty, entryPx: state.account.spot,
        boundTo: null, carvedFrom: null, origin: 'opened'
      };
      state.perps.push(p);
      pushLedger({
        type: 'open-perp', positionId: p.id, origin: p.origin,
        side, qty, px: p.entryPx, amountUSD: 0, note: 'perp opened'
      });
      assertIdentity(state);
      return { ok: true, id: p.id, perp: clone(p) };
    }

    // ── internal: carve from an existing free perp, or open one atomically ─
    function carveOrCreate({ perpId, qtyPerp, side, spot, origin }) {
      if (!(qtyPerp > 0)) {
        return { ok: false, reason: 'no naked option: qtyPerp (the perp size backing this bundle) is required and must be > 0' };
      }
      if (perpId != null) {
        const src = findPerp(perpId);
        if (!src) return { ok: false, reason: 'no such perp to carve from: ' + perpId };
        if (src.boundTo) return { ok: false, reason: 'cannot carve from an already-carved perp — carve from a free perp' };
        if (qtyPerp > src.qty + 1e-9) {
          return { ok: false, reason: 'insufficient free perp qty to carve: have ' + src.qty + ', need ' + qtyPerp };
        }
        src.qty -= qtyPerp;
        const carved = {
          id: nid('perp'), side: src.side, qty: qtyPerp, entryPx: src.entryPx,
          boundTo: null, carvedFrom: src.id, origin
        };
        state.perps.push(carved);
        return { ok: true, perp: carved, createdNew: false };
      }
      // No source perp given: open one atomically, and it is born carved —
      // this satisfies "no naked option" the other way (invariant 1).
      if (side !== 1 && side !== -1) {
        return { ok: false, reason: 'no naked option: pass an existing perpId to carve from, or side (+1/-1) to open one atomically' };
      }
      const created = {
        id: nid('perp'), side, qty: qtyPerp,
        entryPx: spot != null ? spot : state.account.spot,
        boundTo: null, carvedFrom: null, origin
      };
      state.perps.push(created);
      pushLedger({
        type: 'open-perp', positionId: created.id, origin,
        side, qty: qtyPerp, px: created.entryPx, amountUSD: 0,
        note: 'perp opened atomically to back a bundle'
      });
      return { ok: true, perp: created, createdNew: true };
    }

    // ── openBundle ───────────────────────────────────────────────────────
    function openBundle({ legs, qtyPerp, spot, perpId, side, origin } = {}) {
      origin = origin || 'opened';
      if (origin !== 'opened' && origin !== 'lp') {
        return { ok: false, reason: 'origin must be "opened" or "lp"' };
      }
      if (!Array.isArray(legs) || legs.length < 1 || legs.length > 2) {
        return { ok: false, reason: 'legs must be an array of 1 (single option) or 2 (vertical spread)' };
      }
      for (const L of legs) {
        if (typeof L.k !== 'number') return { ok: false, reason: 'each leg needs a numeric strike k' };
        if (L.side !== 1 && L.side !== -1) return { ok: false, reason: 'each leg side must be +1 (long) or -1 (short)' };
        if (!(L.qty > 0)) return { ok: false, reason: 'each leg qty must be > 0' };
      }

      const carve = carveOrCreate({ perpId, qtyPerp, side, spot, origin });
      if (!carve.ok) return carve; // reason string propagates — no naked option, or insufficient size

      const usedSpot = spot != null ? spot : state.account.spot;
      const bundle = {
        id: nid('bundle'),
        legs: legs.map(L => ({
          k: L.k, side: L.side, qty: L.qty,
          entryPx: L.price != null ? L.price : 0 // fraction-of-spot, per unit — matches the venue's option-price basis
        })),
        perpId: carve.perp.id,
        origin,
        openSpot: usedSpot,
        closed: false, closePx: null, closedAt: null
      };
      carve.perp.boundTo = bundle.id;
      state.bundles.push(bundle);
      pushLedger({
        type: 'open-bundle', positionId: bundle.id, origin,
        legs: bundle.legs.length, qtyPerp, amountUSD: 0,
        note: 'bundle opened, carved perp ' + carve.perp.id
      });
      assertIdentity(state);
      return { ok: true, id: bundle.id, bundle: clone(bundle), carvedPerpId: carve.perp.id };
    }

    // ── closeBundle ──────────────────────────────────────────────────────
    // Atomic: whole bundle + its carved perp, in full. No size argument.
    function closeBundle(id, { closePx, spot } = {}) {
      const b = findBundle(id);
      if (!b) return { ok: false, reason: 'no such bundle: ' + id };
      if (b.closed) return { ok: false, reason: 'bundle already closed: ' + id };
      if (closePx == null) {
        return { ok: false, reason: 'closePx is required — payout is realised by trading, not by settling at intrinsic' };
      }
      const perp = findPerp(b.perpId);
      if (!perp) return { ok: false, reason: 'internal: carved perp missing for bundle ' + id };
      const exitSpot = spot != null ? spot : state.account.spot;

      let optionUsd = 0;
      for (const L of b.legs) {
        const exitPx = L.closePx != null ? L.closePx : closePx; // fraction-of-spot exit price for this leg
        const btc = L.side * L.qty * (exitPx - L.entryPx);
        optionUsd += btc * exitSpot;
      }
      const perpUsd = perp.side * perp.qty * (exitSpot - perp.entryPx);

      // Trader/LP asymmetry (invariant 7): the LP does not own the carved
      // perp — it never enters the LP's payout, only the option leg does.
      const payoutUsd = b.origin === 'opened' ? optionUsd + perpUsd : optionUsd;

      // Release: the carved perp un-tags back to a free perp — still the
      // same row, same fields, just no longer bound (invariant 3).
      perp.boundTo = null;

      b.closed = true;
      b.closePx = closePx;
      b.closedAt = state.ledger.length;

      pushLedger({
        type: 'close-bundle', positionId: b.id, origin: b.origin,
        closePx, optionUsd, perpUsd, amountUSD: payoutUsd,
        note: b.origin === 'lp'
          ? 'LP payout: option leg only, perp leg excluded'
          : 'trader payout: option leg + carved perp leg'
      });
      assertIdentity(state);
      return { ok: true, id: b.id, payoutUsd, optionUsd, perpUsd, releasedPerpId: perp.id };
    }

    // ── closePerp ────────────────────────────────────────────────────────
    // Blocked while any carved sliver still stands against this perp.
    function closePerp(id) {
      const p = findPerp(id);
      if (!p) return { ok: false, reason: 'no such perp: ' + id };
      if (p.boundTo) {
        return { ok: false, reason: 'cannot close a carved perp directly — close its bundle (' + p.boundTo + ') instead' };
      }
      const against = state.perps.filter(x => x.carvedFrom === id && x.boundTo);
      if (against.length) {
        const qty = against.reduce((s, x) => s + x.qty, 0);
        return {
          ok: false,
          reason: 'cannot close: ' + qty + ' BTC carved against this position by open bundle(s) ' +
            against.map(x => x.boundTo).join(', ')
        };
      }
      const exitSpot = state.account.spot;
      const usd = p.side * p.qty * (exitSpot - p.entryPx);
      state.perps = state.perps.filter(x => x.id !== id);
      pushLedger({
        type: 'close-perp', positionId: id, origin: p.origin,
        side: p.side, qty: p.qty, amountUSD: usd, note: 'perp closed'
      });
      assertIdentity(state);
      return { ok: true, id, amountUSD: usd };
    }

    // ── account ──────────────────────────────────────────────────────────
    // Account-level only (invariant 5): perps + bundles, one equity pot,
    // 50× cap, LP positions excluded entirely. No per-position liq price.
    function account() {
      const spot = state.account.spot;

      const perpNotional = state.perps
        .filter(p => p.origin !== 'lp')
        .reduce((s, p) => s + Math.abs(p.qty) * spot, 0);

      const optionNotional = state.bundles
        .filter(b => !b.closed && b.origin !== 'lp')
        .reduce((s, b) => s + b.legs.reduce((s2, L) => s2 + Math.abs(L.qty * L.entryPx) * spot, 0), 0);

      const realizedUsd = state.ledger
        .filter(e => (e.type === 'close-bundle' || e.type === 'close-perp') && e.origin !== 'lp')
        .reduce((s, e) => s + e.amountUSD, 0);

      const equityUSD = state.account.equityBTC * spot + realizedUsd;
      const notionalUSD = perpNotional + optionNotional;
      const CAP = 50;
      const leverage = notionalUSD / Math.max(equityUSD, 1e-9);
      const headroom = CAP - leverage;

      return {
        spot, equityUSD, perpNotional, optionNotional, notionalUSD,
        leverage, cap: CAP, headroom, safe: headroom > 0
      };
    }

    // ── ledger ───────────────────────────────────────────────────────────
    function ledger() { return clone(state.ledger); }

    // ── state ────────────────────────────────────────────────────────────
    function stateSnapshot() { return clone(state); }

    return {
      state: stateSnapshot,
      openPerp,
      openBundle,
      closeBundle,
      closePerp,
      account,
      ledger
    };
  }

  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  global.Life = { create, _assertIdentity: assertIdentity };
})(typeof window !== 'undefined' ? window : globalThis);
