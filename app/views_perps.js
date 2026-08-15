/* ─────────────────────────────────────────────────────────────────────────
   Temporal — views_perps.js

   The PERPS tab and the always-visible ACCOUNT STRIP. Plain browser script
   (no ES modules), attaches window.ViewPerps. Pure render + wire — reads
   window.Life (app/lifecycle.js) as its one source of state and mutation.
   No pricing math lives here; that is book.js's job, not this file's.

   Contract (docs/UX_FORMALISM.md, binding):
     ViewPerps.perpsTableHTML(life)     -> HTML string, the PERPS tab body
     ViewPerps.accountStripHTML(life)   -> HTML string, account x stock strip
     ViewPerps.wire(life, rerender)     -> attaches DOM handlers, idempotent

   Invariants represented here, not renegotiated (UX_FORMALISM §0.1):
     #3 A carved perp is still a perp — same columns as a free row, no
        reduced "sliver" styling. It differs only by what it is bound to.
     #4 Liquidation is account-level, LP excluded, 50x cap. NO per-position
        liquidation price is computed or shown anywhere in this file.
     #7 Accounting identity: free + carved = total, always, shown as a
        footer line under the perps table.

   Honesty note on "funding": lifecycle.js's state store does not model a
   funding rate or accrual at all (no field on a perp, no ledger event type
   for it) — see its own header comment. Rather than fabricate a number
   (which the hard rule against inventing economics forbids), the funding
   column reads "n/a" with a footnote explaining why. That is a defect to
   close in the STORE, not something this view should paper over with a
   silent 0.00 that would read as "no funding accrued" when the truth is
   "funding is not tracked yet".

   LP-origin perp-equivalent lines (docs/UX_FORMALISM.md §7.2/§7.3): a bundle
   opened with origin:'lp' carves/creates a perp with origin:'lp', but that
   perp is a display/calculation line for the LP's OWN bundle view, not a
   real perp position of this account (life.account() itself excludes
   origin:'lp' from notional for the same reason). The PERPS tab therefore
   lists origin:'opened' perps only, so its footer identity matches exactly
   what the account strip's notional is built from. This is a CHOICE, not a
   reinterpretation of an invariant: nothing here removes an LP's own view
   of its line, it simply isn't rendered inside the TRADER's perps tab.
   ───────────────────────────────────────────────────────────────────────── */
(function (root) {
  'use strict';

  function fmt(v, dp) {
    if (typeof v !== 'number' || !isFinite(v)) return '—';
    return v.toFixed(dp == null ? 2 : dp);
  }

  function usd(v) {
    if (typeof v !== 'number' || !isFinite(v)) return '—';
    var sign = v < 0 ? '-' : '';
    return sign + '$' + Math.abs(v).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Manager, integration: this used to REIMPLEMENT lifecycle.js's closePerp guards,
  // because the store had no way to ask "can I close?" without mutating. Two copies
  // of one rule drift apart silently, so the store now exposes canClosePerp() and
  // this asks it. One source of truth for the rule AND for the wording.
  function closeBlockReason(perp, allPerps, life) {
    if (life && typeof life.canClosePerp === 'function') {
      var g = life.canClosePerp(perp.id);
      return g && g.ok ? null : (g && g.reason) || 'cannot close';
    }
    return null;   // no gate available: offer the control, let the store refuse
  }

  // ── perpsTableHTML ───────────────────────────────────────────────────
  function perpsTableHTML(life) {
    var st = life.state();
    var acct = life.account();
    var spot = acct.spot;
    var allPerps = st.perps;
    var rows = allPerps.filter(function (p) { return p.origin !== 'lp'; });

    var free = 0, carved = 0;
    var trs = rows.map(function (p) {
      var mark = spot; // linear perp, marked at spot — same basis account() uses
      var upnl = p.side * p.qty * (mark - p.entryPx);
      var reason = closeBlockReason(p, allPerps, life);
      if (p.boundTo) { carved += p.qty; } else { free += p.qty; }
      var carvedLabel = p.boundTo ? ('carved &rarr; ' + esc(p.boundTo)) : 'free';
      var btn = reason
        ? '<button data-perp-close="' + esc(p.id) + '" disabled title="' + esc(reason) + '">close</button>' +
          '<div class="t2" style="color:var(--mute);margin-top:2px">' + esc(reason) + '</div>'
        : '<button data-perp-close="' + esc(p.id) + '">close</button>';
      return '<tr data-perp-row="' + esc(p.id) + '">' +
        '<td class="t2" style="color:var(--mute)">' + esc(p.id) + '</td>' +
        '<td>' + (p.side > 0 ? 'LONG' : 'SHORT') + '</td>' +
        '<td>' + fmt(p.qty, 4) + '</td>' +
        '<td>' + fmt(p.entryPx, 2) + '</td>' +
        '<td>' + fmt(mark, 2) + '</td>' +
        '<td class="' + (upnl >= 0 ? 'pos' : 'neg') + '">' + usd(upnl) + '</td>' +
        '<td class="amb">n/a</td>' +
        '<td>' + carvedLabel + '</td>' +
        '<td>' + btn + '</td>' +
        '</tr>';
    }).join('');

    var total = free + carved;
    var identityOk = Math.abs(free + carved - total) < 1e-9;

    return (
      '<table id="perpsTable">' +
        '<thead><tr>' +
          '<th>id</th><th>side</th><th>size</th><th>entry</th><th>mark</th>' +
          '<th>unrealised P&amp;L</th><th>funding</th><th>carved</th><th></th>' +
        '</tr></thead>' +
        '<tbody>' + (trs || '<tr><td colspan="9" class="t2" style="color:var(--mute)">no perp positions</td></tr>') + '</tbody>' +
      '</table>' +
      '<div class="m" id="perpsIdentity" style="border-top:1px solid var(--rule);margin-top:6px;padding-top:6px">' +
        '<span>free + carved = total</span>' +
        '<b class="' + (identityOk ? 'pos' : 'neg') + '">' +
          fmt(free, 4) + ' + ' + fmt(carved, 4) + ' = ' + fmt(total, 4) +
        '</b>' +
      '</div>' +
      '<div class="t2" style="color:var(--mute);margin-top:4px">' +
        'funding: not modeled by the state store yet &mdash; shown as n/a, not fabricated as zero. ' +
        'LP-accrued perp-equivalent lines are display/calculation lines for the LP\'s own bundle view ' +
        '(UX_FORMALISM &sect;7.2/7.3) and are not listed here as perp positions.' +
      '</div>'
    );
  }

  // ── accountStripHTML ─────────────────────────────────────────────────
  function accountStripHTML(life) {
    var a = life.account();
    var stateLabel = a.safe ? 'SAFE' : 'LIQUIDATED';
    return (
      '<div class="card" id="accountStrip">' +
        '<div class="chead"><b>Account</b><span class="t2" style="color:var(--coffee)">perps + options, one pot &mdash; LP excluded</span></div>' +
        '<div class="m"><span>equity</span><b id="acctEquity">' + usd(a.equityUSD) + '</b></div>' +
        '<div class="m"><span>notional</span><b id="acctNotional">' + usd(a.notionalUSD) + '</b></div>' +
        '<div class="m"><span>account leverage</span><b id="acctLev" class="' + (a.leverage > a.cap ? 'neg' : '') + '">' + fmt(a.leverage, 2) + '&times;</b></div>' +
        '<div class="m"><span>cap</span><b id="acctCap">' + fmt(a.cap, 0) + '&times;</b></div>' +
        '<div class="m" style="border-top:1px solid var(--rule);margin-top:5px;padding-top:6px">' +
          '<span>headroom vs cap</span><b id="acctHeadroom" class="' + (a.headroom > 0 ? 'pos' : 'neg') + '">' + fmt(a.headroom, 2) + '&times;</b>' +
        '</div>' +
        '<div class="m"><span>status</span><b id="acctState" class="' + (a.safe ? 'pos' : 'neg') + '">' + stateLabel + '</b></div>' +
        '<div class="t2" style="color:var(--mute);margin-top:4px">' +
          'LP positions are excluded from this account entirely &mdash; this strip is not your total across ' +
          'every role, only this trader account. There is no per-position figure for when a single position ' +
          'would be force-closed: that risk is assessed once, for the whole account (perps + carved bundles ' +
          'together, 50&times; cap), never for one row.' +
        '</div>' +
      '</div>'
    );
  }

  // ── wire ─────────────────────────────────────────────────────────────
  // Idempotent per-element wiring (matches app/index.html's own convention:
  // mark the element `_w` once wired, re-safe to call after every rerender).
  // No-op outside a DOM (Node require without a `document` global).
  function wire(life, rerender) {
    if (typeof document === 'undefined' || !document.querySelectorAll) return;
    var buttons = document.querySelectorAll('[data-perp-close]');
    for (var i = 0; i < buttons.length; i++) {
      (function (el) {
        if (el._wPerp) return;
        el._wPerp = true;
        el.onclick = function () {
          if (el.disabled) return; // blocked control does nothing, never a silent failure state
          var id = el.getAttribute('data-perp-close');
          var res = life.closePerp(id);
          if (typeof rerender === 'function') rerender(res);
        };
      })(buttons[i]);
    }
  }

  var ViewPerps = { perpsTableHTML: perpsTableHTML, accountStripHTML: accountStripHTML, wire: wire };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ViewPerps;
  }
  root.ViewPerps = ViewPerps;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
