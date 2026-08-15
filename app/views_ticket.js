/* ─────────────────────────────────────────────────────────────────────────
   Temporal — views_ticket.js
   The FIRM QUOTE ticket (open) and the CLOSE ticket.

   Plain browser script (no ES modules). Attaches window.Ticket. Pure
   functions of (book|quote, ctx) -> data or HTML string, plus one DOM-wiring
   helper. No app-wide state, no rendering loop of its own — the caller's
   render() owns that, the same way app/index.html already does for every
   other panel.

   Invariants this file exists to make impossible to violate
   (docs/UX_FORMALISM.md §0.1, §3, §3.1 — binding, not a style preference):

     §3.1(1)  A firm quote is a price WITH AN EXPIRY. `quote()` always stamps
              `expiresAt`; `isExpired`/`accept` are the only ways to spend
              one, and an expired quote is refused, never silently re-priced.
     §0.1(5)  A close is a trade at the aggregate (own curve excluded) — it
              therefore has a price and therefore an expiry too. Same
              `quote()` path, `close:true`.
     §0.1(2)/(4)  The bundle closes IN FULL together with its sliver perp —
              `closeTicketHTML` renders no size control, only a confirm.
     §3.1(3)  The carve (perp removed on open / released on close) is shown
              before commit, every time — never a silent transfer.
     §3.1(4)  Anything moving account-level leverage/headroom vs the 50× cap
              is disclosed before commit.
     §0.1(8)  Where no counterparty exists, no price exists — quote()/
              closePx returning null renders a REFUSAL, never a fabricated
              price.
     mark→close is always a COST for the closer (book.js: landed() moves
     against the taker on both sides), never shown as a gain.

   Depends on nothing but the `book` object handed to quote() (the shape
   returned by Book.make — see app/book.js) and plain data in `ctx`. Never
   touches app/index.html, app/book.js, app/lifecycle.js or app/views_perps.js.
   ───────────────────────────────────────────────────────────────────────── */
(function (root) {
  'use strict';

  // Q9 (UX_FORMALISM §5): "Placeholder 10s pending real latency data." A
  // parameter, not an invariant — callers may override per-quote via
  // params.ttlMs, but the default lives here so nobody has to know the
  // number to get the behaviour right.
  var DEFAULT_TTL_MS = 10000;

  var seq = 0;
  function nextId() { return 'q_' + (++seq) + '_' + Date.now(); }

  // ── quote() ──────────────────────────────────────────────────────────────
  // Ticket.quote(book, {k, qty, side, close, ttlMs}) -> firm quote object.
  //   side  — 'buy' | 'sell', the direction of THIS trade (Book's convention:
  //           for a close, 'sell' closes a long, 'buy' closes a short).
  //   close — falsy: price at OPEN, via book.landed(k, qty, side) (no self-
  //           exclusion — the whole book, because opening trades against
  //           the live book same as any other taker).
  //           truthy: price at CLOSE, via book.closePx(k, side, qty, true)
  //           — self-excluded aggregate (§0.1(5)).
  // Both paths return null when there's no fillable price (no liquidity, or
  // Q doesn't fit) — that is invariant #8, not an error to paper over: the
  // returned quote has ok:false and a human reason, no fabricated px.
  function quote(book, params) {
    params = params || {};
    var k = params.k, qty = params.qty, side = params.side, close = !!params.close;
    var ttlMs = typeof params.ttlMs === 'number' ? params.ttlMs : DEFAULT_TTL_MS;
    if (!book) throw new Error('Ticket.quote: book is required');
    if (typeof k !== 'number') throw new Error('Ticket.quote: k (strike, moneyness) must be a number');
    if (!(qty > 0)) throw new Error('Ticket.quote: qty must be > 0');
    if (side !== 'buy' && side !== 'sell') throw new Error("Ticket.quote: side must be 'buy' or 'sell'");

    var touchPx = side === 'buy' ? book.ask(k) : book.bid(k);
    var px = close ? book.closePx(k, side, qty, true) : book.landed(k, qty, side);
    var now = Date.now();
    var id = nextId();

    if (px == null) {
      return {
        ok: false,
        reason: close ? 'no counterparty — cannot close' : 'no counterparty — cannot fill this size',
        id: id, k: k, qty: qty, side: side, close: close,
        px: null, touchPx: touchPx, madeAt: now, expiresAt: now // dead on arrival
      };
    }
    return {
      ok: true,
      id: id, k: k, qty: qty, side: side, close: close,
      px: px, touchPx: touchPx,
      madeAt: now, expiresAt: now + ttlMs
    };
  }

  // isExpired(q, now?) — the ONLY question a caller should ask before acting
  // on a quote. Never re-derive this inline; that's how silent re-pricing
  // creeps back in.
  function isExpired(q, now) {
    now = now == null ? Date.now() : now;
    if (!q) return true;
    return now >= q.expiresAt;
  }

  // accept(q, now?) — the single gate a commit action must pass through.
  // Refuses: a refused (ok:false) quote, and an expired quote. Never
  // re-prices; the caller must call quote() again for a fresh one.
  function accept(q, now) {
    now = now == null ? Date.now() : now;
    if (!q || !q.ok) return { ok: false, reason: (q && q.reason) || 'no quote' };
    if (isExpired(q, now)) return { ok: false, reason: 'quote expired — re-quote required' };
    return { ok: true, id: q.id, px: q.px, k: q.k, qty: q.qty, side: q.side };
  }

  // ── formatting (module-local; matches app/index.html's f()/usd() intent
  //    without importing them — this file owns no shared state) ───────────
  function fmtPx(x) { return (x == null || !isFinite(x)) ? '—' : x.toFixed(5); }
  function fmtQty(x) { return (x == null || !isFinite(x)) ? '—' : x.toFixed(4) + ' BTC'; }
  function fmtBps(x) { return (x == null || !isFinite(x)) ? '—' : (x >= 0 ? '+' : '') + x.toFixed(1); }
  function fmtLev(x) { return (x == null || !isFinite(x)) ? '—' : x.toFixed(2) + '×'; }
  function fmtSigned(x) { return (x == null || !isFinite(x)) ? '—' : (x >= 0 ? '+' : '') + x.toFixed(2); }
  function esc(s) { return String(s == null ? '' : s); }

  // touchSlipBps(q) — signed so that POSITIVE always means "worse for the
  // trader than the touch", regardless of buy/sell direction:
  //   buy:  paying MORE than touch is worse  -> (px-touch)/touch
  //   sell: receiving LESS than touch is worse -> (touch-px)/touch
  function touchSlipBps(q) {
    if (q.px == null || !(q.touchPx > 0)) return null;
    var raw = q.side === 'buy' ? (q.px - q.touchPx) : (q.touchPx - q.px);
    return (raw / q.touchPx) * 1e4;
  }

  function secsLeft(q, now) {
    now = now == null ? Date.now() : now;
    return Math.max(0, Math.ceil((q.expiresAt - now) / 1000));
  }

  // refusalHTML(q) — invariant #8: no counterparty, no price. This is the
  // ENTIRE ticket in that case; there is nothing else to show.
  function refusalHTML(q) {
    var reason = (q && q.reason) ? q.reason : 'no counterparty — cannot close';
    return '<div class="panel ticket-refused" data-ticket-refused="1">'
      + '<div class="chead"><b>No price</b></div>'
      + '<div class="m"><span>status</span><b class="neg">' + esc(reason) + '</b></div>'
      + '</div>';
  }

  // ── openTicketHTML(q, ctx) ───────────────────────────────────────────────
  // ctx = {
  //   carveQty        — BTC perp opened/carved by this trade (defaults q.qty)
  //   accountBefore   — {leverage, headroom, cap, notionalUSD, equityUSD}
  //   accountAfter    — same shape, AFTER this trade — caller computes this
  //                     (e.g. by projecting Life.account() with the trade
  //                     applied); Ticket never mutates the store itself.
  // }
  // Co-presence required at commit (UX_FORMALISM §3, §3.1): price @ size +
  // distance from touch, the carve, and the leverage/headroom delta. All
  // three are on this one sheet, unconditionally, whenever q.ok.
  function openTicketHTML(q, ctx) {
    ctx = ctx || {};
    if (!q || q.ok === false) return refusalHTML(q);

    var expired = isExpired(q);
    var dirWord = q.side === 'buy' ? 'BUY' : 'SELL';
    var slip = touchSlipBps(q);
    var carveQty = ctx.carveQty != null ? ctx.carveQty : q.qty;
    var ab = ctx.accountBefore || {};
    var aa = ctx.accountAfter || {};
    var hDelta = (aa.headroom != null && ab.headroom != null) ? (aa.headroom - ab.headroom) : null;
    var lDelta = (aa.leverage != null && ab.leverage != null) ? (aa.leverage - ab.leverage) : null;

    return '<div class="panel ticket-open" data-quote-id="' + esc(q.id) + '"'
      + ' data-expires-at="' + q.expiresAt + '" data-px="' + q.px + '" data-k="' + q.k
      + '" data-qty="' + q.qty + '" data-side="' + esc(q.side) + '">'
      + '<div class="chead"><b>Confirm — Open</b>'
      + '<span class="badge ' + (expired ? 'neg' : 'amb') + '" data-ticket-countdown>'
      + (expired ? 'QUOTE EXPIRED — re-quote' : 'expires in ' + secsLeft(q) + 's') + '</span></div>'
      + '<div class="m"><span>side</span><b>' + dirWord + ' ' + fmtQty(q.qty) + ' @ k=' + (q.k * 100).toFixed(1) + '%</b></div>'
      + '<div class="m"><span>price at your size</span><b class="tl">' + fmtPx(q.px) + '</b></div>'
      + '<div class="m"><span>touch (zero-size)</span><b>' + fmtPx(q.touchPx) + '</b></div>'
      + '<div class="m"><span>distance from touch</span><b class="' + (slip >= 0 ? 'neg' : 'pos') + '">'
      + fmtBps(slip) + ' bps worse than touch</b></div>'
      + '<div class="m" style="border-top:1px solid var(--rule);margin-top:5px;padding-top:6px">'
      + '<span>carve — perp removed from your perps tab, listed under this option</span>'
      + '<b>' + fmtQty(carveQty) + '</b></div>'
      + '<div class="m"><span>account leverage</span><b>' + fmtLev(ab.leverage) + ' → ' + fmtLev(aa.leverage)
      + ' (Δ ' + fmtSigned(lDelta) + '×)</b></div>'
      + '<div class="m"><span>headroom vs 50× cap</span><b class="' + (hDelta != null && hDelta < 0 ? 'neg' : 'pos') + '">'
      + fmtLev(ab.headroom) + ' → ' + fmtLev(aa.headroom) + ' (Δ ' + fmtSigned(hDelta) + '×)</b></div>'
      + '<button class="cta" data-accept' + (expired ? ' disabled' : '') + '>'
      + (expired ? 'Quote expired — re-quote' : 'Accept & Open') + '</button>'
      + '</div>';
  }

  // ── closeTicketHTML(q, bundle, ctx) ──────────────────────────────────────
  // ctx = {
  //   markPx           — mark at this strike/side, own curve excluded
  //                       (Book.mark(k, side, true)); caller supplies it —
  //                       Ticket never calls into Book itself here.
  //   releasedPerpQty  — BTC released back to the perps tab on close
  //                       (defaults to the sum of the bundle's leg qtys).
  //   accountBefore/accountAfter — same shape as openTicketHTML.
  // }
  // No size control anywhere on this sheet — the bundle closes IN FULL,
  // together with its perp (invariant #2/#4). mark→close is ALWAYS rendered
  // as a cost (book.js's landed() guarantees the sign; asserted in the
  // check script, not just claimed here).
  function closeTicketHTML(q, bundle, ctx) {
    ctx = ctx || {};
    if (!q || q.ok === false) return refusalHTML(q);

    var expired = isExpired(q);
    var slip = touchSlipBps(q);
    var markPx = ctx.markPx != null ? ctx.markPx : q.touchPx;
    // gap is a COST by construction: closePx always sits worse than mark for
    // the closer (book.js landed() moves against the taker both sides).
    var gap = q.side === 'sell' ? (markPx - q.px) : (q.px - markPx);
    var releasedQty = ctx.releasedPerpQty != null
      ? ctx.releasedPerpQty
      : (bundle && Array.isArray(bundle.legs) ? bundle.legs.reduce(function (s, L) { return s + L.qty; }, 0) : 0);
    var ab = ctx.accountBefore || {};
    var aa = ctx.accountAfter || {};
    var hDelta = (aa.headroom != null && ab.headroom != null) ? (aa.headroom - ab.headroom) : null;
    var lDelta = (aa.leverage != null && ab.leverage != null) ? (aa.leverage - ab.leverage) : null;

    return '<div class="panel ticket-close" data-quote-id="' + esc(q.id) + '"'
      + ' data-expires-at="' + q.expiresAt + '" data-px="' + q.px + '" data-k="' + q.k
      + '" data-qty="' + q.qty + '" data-side="' + esc(q.side) + '"'
      + (bundle && bundle.id ? ' data-bundle-id="' + esc(bundle.id) + '"' : '') + '>'
      + '<div class="chead"><b>Confirm — Close' + (bundle && bundle.id ? ' ' + esc(bundle.id) : '') + '</b>'
      + '<span class="badge ' + (expired ? 'neg' : 'amb') + '" data-ticket-countdown>'
      + (expired ? 'QUOTE EXPIRED — re-quote' : 'expires in ' + secsLeft(q) + 's') + '</span></div>'
      + '<div class="m"><span>closes at (aggregate, your own curve excluded)</span><b class="tl">' + fmtPx(q.px) + '</b></div>'
      + '<div class="m"><span>touch (zero-size)</span><b>' + fmtPx(q.touchPx) + '</b></div>'
      + '<div class="m"><span>distance from touch</span><b class="' + (slip >= 0 ? 'neg' : 'pos') + '">'
      + fmtBps(slip) + ' bps worse than touch</b></div>'
      + '<div class="m"><span>mark</span><b>' + fmtPx(markPx) + '</b></div>'
      + '<div class="m"><span>mark → close gap — the spread you pay</span><b class="neg">'
      + fmtPx(Math.abs(gap)) + ' cost</b></div>'
      + '<div class="m" style="border-top:1px solid var(--rule);margin-top:5px;padding-top:6px">'
      + '<span>the bundle closes IN FULL, together with its carved perp — no partial close</span>'
      + '<b>' + fmtQty(releasedQty) + ' released</b></div>'
      + '<div class="m"><span>account leverage</span><b>' + fmtLev(ab.leverage) + ' → ' + fmtLev(aa.leverage)
      + ' (Δ ' + fmtSigned(lDelta) + '×)</b></div>'
      + '<div class="m"><span>headroom vs 50× cap</span><b class="' + (hDelta != null && hDelta < 0 ? 'neg' : 'pos') + '">'
      + fmtLev(ab.headroom) + ' → ' + fmtLev(aa.headroom) + ' (Δ ' + fmtSigned(hDelta) + '×)</b></div>'
      + '<button class="cta" data-accept' + (expired ? ' disabled' : '') + '>'
      + (expired ? 'Quote expired — re-quote' : 'Accept & Close') + '</button>'
      + '</div>';
  }

  // ── wire(el, {onAccept, onExpire, rerender}) ─────────────────────────────
  // Attaches countdown + accept behaviour to an already-rendered ticket
  // (el.innerHTML already set from openTicketHTML/closeTicketHTML, or el
  // itself IS the '[data-quote-id]' root). DOM-attribute-driven, same
  // convention app/index.html already uses (e.g. `data-close`, `dataset.close`
  // at index.html:727-730) — no hidden JS-side quote object required.
  //
  // - Ticks a countdown into [data-ticket-countdown] every 250ms.
  // - On expiry (attribute-driven, re-checked every tick AND at click time —
  //   never trusts a stale in-memory flag): disables [data-accept], fires
  //   onExpire() exactly once, calls rerender() so the caller can re-quote.
  // - Clicking [data-accept] on a live quote calls onAccept(info) with the
  //   quote's own data-* fields (id, px, k, qty, side) — never re-prices.
  // - Clicking [data-accept] on an EXPIRED quote is refused: onExpire()
  //   fires (if not already) and onAccept() is NEVER called.
  //
  // Returns { destroy() } to detach (interval + listener) — callers that
  // re-render on every tick (as app/index.html's render() does) should call
  // destroy() on the old ticket before wiring the new one.
  function wire(el, opts) {
    opts = opts || {};
    var onAccept = typeof opts.onAccept === 'function' ? opts.onAccept : function () {};
    var onExpire = typeof opts.onExpire === 'function' ? opts.onExpire : function () {};
    var rerender = typeof opts.rerender === 'function' ? opts.rerender : function () {};
    if (!el) throw new Error('Ticket.wire: el is required');

    function root() {
      if (el.hasAttribute && el.hasAttribute('data-quote-id')) return el;
      return el.querySelector ? el.querySelector('[data-quote-id]') : null;
    }
    function readExpiresAt() {
      var r = root();
      if (!r || !r.getAttribute) return null;
      var v = r.getAttribute('data-expires-at');
      return v == null ? null : +v;
    }
    function readQuoteInfo() {
      var r = root();
      if (!r || !r.getAttribute) return null;
      return {
        id: r.getAttribute('data-quote-id'),
        px: +r.getAttribute('data-px'),
        k: +r.getAttribute('data-k'),
        qty: +r.getAttribute('data-qty'),
        side: r.getAttribute('data-side')
      };
    }

    var expiredFired = false;

    function markExpiredUI() {
      var badge = el.querySelector && el.querySelector('[data-ticket-countdown]');
      if (badge) badge.textContent = 'QUOTE EXPIRED — re-quote';
      var btn = el.querySelector && el.querySelector('[data-accept]');
      if (btn) {
        if (btn.setAttribute) btn.setAttribute('disabled', 'disabled');
        btn.textContent = 'Quote expired — re-quote';
      }
    }

    function tick() {
      var exp = readExpiresAt();
      if (exp == null) return;
      var now = Date.now();
      if (now >= exp) {
        if (!expiredFired) {
          expiredFired = true;
          markExpiredUI();
          onExpire();
          rerender();
        }
        return;
      }
      var badge = el.querySelector && el.querySelector('[data-ticket-countdown]');
      if (badge) badge.textContent = 'expires in ' + Math.max(0, Math.ceil((exp - now) / 1000)) + 's';
    }

    var acceptBtn = el.querySelector && el.querySelector('[data-accept]');
    function onClick() {
      var exp = readExpiresAt();
      var now = Date.now();
      if (exp == null || now >= exp) {
        // NEVER silently re-price and NEVER accept: refuse, surface expiry.
        if (!expiredFired) { expiredFired = true; markExpiredUI(); onExpire(); }
        rerender();
        return;
      }
      onAccept(readQuoteInfo());
    }
    if (acceptBtn && acceptBtn.addEventListener) acceptBtn.addEventListener('click', onClick);

    var timer = setInterval(tick, 250);
    tick();

    return {
      destroy: function () {
        clearInterval(timer);
        if (acceptBtn && acceptBtn.removeEventListener) acceptBtn.removeEventListener('click', onClick);
      }
    };
  }

  var Ticket = {
    DEFAULT_TTL_MS: DEFAULT_TTL_MS,
    quote: quote,
    isExpired: isExpired,
    accept: accept,
    openTicketHTML: openTicketHTML,
    closeTicketHTML: closeTicketHTML,
    wire: wire
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Ticket;
  }
  root.Ticket = Ticket;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
