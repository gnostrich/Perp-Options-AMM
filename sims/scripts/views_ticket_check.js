/* views_ticket_check.js — proves app/views_ticket.js (window.Ticket), plain node.
   Run: node sims/scripts/views_ticket_check.js
   Uses the REAL Book/Life modules (no re-implemented economics) and a
   hand-built minimal DOM shim for wire() (same convention as the project's
   own sims/scripts/app_render_smoke.js — not a full HTML parser; browser
   fidelity of the real markup is the tester's job, not this script's). */
'use strict';
const path = require('path');
const Book = require(path.join(__dirname, '..', '..', 'app', 'book.js'));
// lifecycle.js has no module.exports (attaches global.Life only, like book.js's
// window.Book fallback) — require() for the side effect, then read it off global.
require(path.join(__dirname, '..', '..', 'app', 'lifecycle.js'));
const Life = global.Life;
const Ticket = require(path.join(__dirname, '..', '..', 'app', 'views_ticket.js'));

let PASS = 0, FAIL = 0;
function ok(cond, label, extra) {
  if (cond) { PASS++; console.log('  OK   ' + label + (extra ? '  (' + extra + ')' : '')); }
  else { FAIL++; console.log('  FAIL ' + label + (extra ? '  (' + extra + ')' : '')); }
}
function section(t) { console.log('\n=== ' + t + ' ==='); }

function makeCurve(atm, slope) {
  return {
    ATM: atm,
    CALL: k => Math.max(0.0001, atm * (1 + slope * k)),
    PUT: k => Math.max(0.0001, atm * (1 - slope * k))
  };
}

// A book with a 'me' maker present, so self-exclusion (close pricing) is a
// REAL filter, not a no-op — otherwise #6/#5 would pass trivially.
const makers = [
  { name: 'you', me: true, cap: 50, curve: makeCurve(0.0500, 1.00), hBps: 80 },
  { name: 'lp1', me: false, cap: 30, curve: makeCurve(0.0520, 0.90), hBps: 60 },
  { name: 'lp2', me: false, cap: 20, curve: makeCurve(0.0480, 1.10), hBps: 70 }
];
const book = Book.make(makers, {});

// ── #1 + #2: fresh quote accepted, expired quote refused; px = landed, not touch
section('#1/#2 — quote(): expiry + landed-vs-touch');
{
  const K = 0.05, QTY = 2, SIDE = 'buy';
  const q = Ticket.quote(book, { k: K, qty: QTY, side: SIDE, ttlMs: 5000 });
  const rawLanded = book.landed(K, QTY, SIDE);
  const touch = book.ask(K);
  console.log('  quoted px      =', q.px);
  console.log('  Book.landed    =', rawLanded, '  <- must equal quoted px');
  console.log('  touch (ask k)  =', touch, '  <- must differ from quoted px (size > 0 moves it)');
  ok(q.ok === true, 'fresh quote is ok:true');
  ok(q.px === rawLanded, 'quoted price EQUALS Book.landed at that size', 'q.px=' + q.px + ' landed=' + rawLanded);
  ok(q.px !== touch, 'quoted price is NOT the touch price', 'q.px=' + q.px + ' touch=' + touch);
  ok(Math.abs(q.px - touch) > 1e-9, 'landed at size differs from touch by a real amount');

  const acceptNow = Ticket.accept(q, q.madeAt + 10);
  ok(acceptNow.ok === true, 'accepting BEFORE expiry succeeds', JSON.stringify(acceptNow));

  const past = q.expiresAt + 1;
  ok(Ticket.isExpired(q, past) === true, 'isExpired() true after expiresAt');
  const acceptLate = Ticket.accept(q, past);
  ok(acceptLate.ok === false, 'accepting the SAME quote AFTER expiry is REFUSED', JSON.stringify(acceptLate));
  ok(/expired/i.test(acceptLate.reason), 'refusal reason names expiry', acceptLate.reason);
}

// ── #3: open ticket HTML carries the carve amount + the headroom delta
section('#3 — openTicketHTML(): carve + headroom co-present');
let openBundleId, life, accountAfterOpen;
{
  life = Life.create({ spot: 60000, equityBTC: 10 });
  const accountBefore = life.account();

  const K = 0.05, QTY = 2, SIDE = 'buy';
  const q = Ticket.quote(book, { k: K, qty: QTY, side: SIDE, ttlMs: 10000 });
  ok(q.ok, 'open quote priced ok');

  // Actually commit through the real store to get a NON-invented headroom delta.
  const r = life.openBundle({ legs: [{ k: K, side: 1, qty: QTY, price: q.px }], qtyPerp: QTY, side: 1 });
  ok(r.ok, 'Life.openBundle succeeded (backing this ticket for real numbers)', JSON.stringify(r.reason || ''));
  openBundleId = r.id;
  accountAfterOpen = life.account();

  const ctx = { carveQty: QTY, accountBefore, accountAfter: accountAfterOpen };
  const html = Ticket.openTicketHTML(q, ctx);

  console.log('  accountBefore.headroom =', accountBefore.headroom.toFixed(4));
  console.log('  accountAfter.headroom  =', accountAfterOpen.headroom.toFixed(4));
  ok(/carve/i.test(html), 'open ticket HTML contains the word "carve"');
  ok(html.includes(QTY.toFixed(4)), 'open ticket HTML contains the carve AMOUNT', QTY.toFixed(4));
  ok(/headroom/i.test(html), 'open ticket HTML contains "headroom"');
  ok(html.includes(accountBefore.headroom.toFixed(2)) && html.includes(accountAfterOpen.headroom.toFixed(2)),
    'open ticket HTML contains BOTH headroom-before and headroom-after values',
    accountBefore.headroom.toFixed(2) + ' / ' + accountAfterOpen.headroom.toFixed(2));
  ok(html.includes('data-quote-id="' + q.id + '"'), 'ticket root carries the quote id for wire()');
}

// ── #4: close ticket has NO size/qty control — confirm only
section('#4 — closeTicketHTML(): no size control (bundle closes IN FULL)');
let closeBundle, closeQ;
{
  const bundleState = life.state().bundles.find(b => b.id === openBundleId);
  const K = 0.05, QTY = 2, SIDE = 'sell'; // closing a LONG (side=1) -> sell, per book.js convention
  closeQ = Ticket.quote(book, { k: K, qty: QTY, side: SIDE, close: true, ttlMs: 10000 });
  ok(closeQ.ok, 'close quote priced ok (self-excluded aggregate)', JSON.stringify(closeQ));

  const markPx = book.mark(K, 'call', true); // self-excluded mark, same basis as the closer
  const releasedQty = QTY;
  const accountBefore = accountAfterOpen;
  const cres = life.closeBundle(openBundleId, { closePx: closeQ.px, spot: life.state().account.spot });
  ok(cres.ok, 'Life.closeBundle succeeded', JSON.stringify(cres.reason || ''));
  const accountAfter = life.account();

  const html = Ticket.closeTicketHTML(closeQ, bundleState, {
    markPx, releasedPerpQty: releasedQty, accountBefore, accountAfter
  });
  closeBundle = bundleState;

  ok(!/type="number"/i.test(html), 'close ticket HTML has NO type="number" input');
  ok(!/<input/i.test(html), 'close ticket HTML has NO <input> element at all');
  ok(!/data-qty-input|name="qty"|id="qty"/i.test(html), 'close ticket HTML has no named qty control');
  ok(/IN FULL/.test(html), 'close ticket states the bundle closes IN FULL');
  ok(html.includes(releasedQty.toFixed(4)), 'close ticket shows the released perp amount', releasedQty.toFixed(4));
}

// ── #5: mark -> close is ALWAYS a cost, never a gain
section('#5 — mark→close is a cost, never a gain');
{
  // Re-derive on a FRESH bundle so this is an independent check, and sweep
  // both directions (closing a long -> sell; closing a short -> buy) to
  // assert the sign both ways, per CLAUDE.md's "sign errors" warning.
  const cases = [
    { side: 1, closeSide: 'sell', label: 'closing a LONG (sell into the book)' },
    { side: -1, closeSide: 'buy', label: 'closing a SHORT (buy from the book)' }
  ];
  for (const c of cases) {
    const K = 0.02, QTY = 3;
    const markPx = book.mark(K, 'call', true);
    const q = Ticket.quote(book, { k: K, qty: QTY, side: c.closeSide, close: true, ttlMs: 5000 });
    ok(q.ok, c.label + ': close quote priced ok');
    const gap = c.closeSide === 'sell' ? (markPx - q.px) : (q.px - markPx);
    console.log('  ' + c.label + ': mark=' + markPx.toFixed(6) + ' closePx=' + q.px.toFixed(6) + ' gap=' + gap.toFixed(6));
    ok(gap >= -1e-12, c.label + ': gap is >= 0 (a cost, never negative/a gain)', 'gap=' + gap);

    const html = Ticket.closeTicketHTML(q, { id: 'b_test', legs: [{ k: K, side: c.side, qty: QTY }] }, { markPx });
    ok(/cost/i.test(html), c.label + ': ticket HTML labels the gap "cost"');
    ok(/class="neg"[^>]*>[^<]*cost/i.test(html), c.label + ': the cost is rendered with the neg (red) class');
    ok(!/class="pos"[^>]*>[^<]*cost/i.test(html), c.label + ': the cost is NEVER rendered with the pos (gain) class');
  }
}

// ── #6: no-counterparty renders the refusal, not a fabricated price
section('#6 — no counterparty -> refusal, not a price');
{
  // Only maker is 'me' -> self-excluded book has zero liquidity -> closePx null.
  const soloMakers = [{ name: 'you', me: true, cap: 10, curve: makeCurve(0.05, 1), hBps: 50 }];
  const soloBook = Book.make(soloMakers, {});
  const q = Ticket.quote(soloBook, { k: 0.05, qty: 1, side: 'sell', close: true, ttlMs: 5000 });
  console.log('  quote =', JSON.stringify(q));
  ok(q.ok === false, 'quote() itself refuses (ok:false) when self-excluded book has no liquidity');
  ok(q.px === null, 'no fabricated price — px is null');
  ok(/no counterparty/i.test(q.reason), 'reason says "no counterparty"', q.reason);

  const html = Ticket.closeTicketHTML(q, null, {});
  console.log('  html =', html.replace(/\s+/g, ' '));
  ok(/no counterparty/i.test(html), 'rendered ticket shows the REFUSAL text');
  ok(!/data-accept/.test(html), 'refusal ticket has NO accept button (nothing to confirm)');
  ok(!/\d\.\d{4,}/.test(html), 'refusal ticket contains no plausible fabricated decimal price');

  // Also exercise the OPEN-side no-liquidity path (size exceeds capacity).
  const q2 = Ticket.quote(book, { k: 0.05, qty: 1e9, side: 'buy' });
  ok(q2.ok === false, 'open quote also refuses when size does not fit the book');
  ok(/no counterparty/i.test(q2.reason), 'open-side refusal also reads "no counterparty"', q2.reason);
}

// ── wire(): countdown + accept/expire behaviour, on a hand-built DOM shim
section('wire() — accept before expiry, refuse after (hand-built DOM shim)');
{
  class FakeEl {
    constructor(tag) { this.tag = tag; this.attrs = {}; this.children = []; this.textContent = ''; this._listeners = {}; }
    setAttribute(k, v) { this.attrs[k] = String(v); }
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null; }
    hasAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attrs, k); }
    addEventListener(type, fn) { (this._listeners[type] = this._listeners[type] || []).push(fn); }
    removeEventListener(type, fn) { if (this._listeners[type]) this._listeners[type] = this._listeners[type].filter(f => f !== fn); }
    click() { (this._listeners.click || []).forEach(fn => fn()); }
    querySelector(sel) {
      const m = /^\[(data-[\w-]+)\]$/.exec(sel);
      if (!m) return null;
      const attr = m[1];
      const search = (node) => {
        if (node.hasAttribute(attr)) return node;
        for (const c of node.children) { const r = search(c); if (r) return r; }
        return null;
      };
      for (const c of this.children) { const r = search(c); if (r) return r; }
      return this.hasAttribute(attr) ? this : null;
    }
  }

  function buildTicketDom(q) {
    const container = new FakeEl('div');
    const rootEl = new FakeEl('div');
    rootEl.setAttribute('data-quote-id', q.id);
    rootEl.setAttribute('data-expires-at', q.expiresAt);
    rootEl.setAttribute('data-px', q.px);
    rootEl.setAttribute('data-k', q.k);
    rootEl.setAttribute('data-qty', q.qty);
    rootEl.setAttribute('data-side', q.side);
    const badge = new FakeEl('span'); badge.setAttribute('data-ticket-countdown', '1');
    const btn = new FakeEl('button'); btn.setAttribute('data-accept', '1'); btn.textContent = 'Accept & Open';
    rootEl.children.push(badge, btn);
    container.children.push(rootEl);
    return { container, btn, badge };
  }

  (async () => {
    // -- accept while live --
    const qLive = Ticket.quote(book, { k: 0.05, qty: 1, side: 'buy', ttlMs: 60000 });
    const { container, btn } = buildTicketDom(qLive);
    let accepted = null, expiredCalls = 0, rerenders = 0;
    const h = Ticket.wire(container, {
      onAccept: (info) => { accepted = info; },
      onExpire: () => { expiredCalls++; },
      rerender: () => { rerenders++; }
    });
    btn.click();
    ok(accepted !== null, 'clicking accept on a LIVE quote calls onAccept');
    ok(accepted && accepted.px === qLive.px, 'onAccept receives the SAME px as the quote (no re-pricing)', accepted && accepted.px);
    ok(expiredCalls === 0, 'onExpire not fired for a live quote');
    h.destroy();

    // -- refuse after expiry (short ttl, real clock) --
    const qShort = Ticket.quote(book, { k: 0.05, qty: 1, side: 'buy', ttlMs: 150 });
    const built2 = buildTicketDom(qShort);
    let accepted2 = null, expiredCalls2 = 0;
    const h2 = Ticket.wire(built2.container, {
      onAccept: (info) => { accepted2 = info; },
      onExpire: () => { expiredCalls2++; }
    });
    await new Promise(r => setTimeout(r, 400)); // let the real countdown lapse
    built2.btn.click();
    ok(accepted2 === null, 'clicking accept on an EXPIRED quote is REFUSED — onAccept never called');
    ok(expiredCalls2 >= 1, 'onExpire fired (via the ticking interval and/or the click guard)', 'count=' + expiredCalls2);
    ok(built2.btn.getAttribute('disabled') === 'disabled', 'accept button is disabled on the DOM after expiry');
    h2.destroy();

    console.log('\n=== RESULT ===');
    console.log(PASS + ' passed, ' + FAIL + ' failed');
    process.exit(FAIL === 0 ? 0 : 1);
  })();
}
