// TESTER Node oracle for app/index.html build 13.
// Runs the page's OWN <script> in a vm with a DOM shim, then calls its own
// mk / makerCurves / aggBook / ladderAt / landedFrom.  ALSO carries an
// INDEPENDENT re-derivation of landed(k,Q) (indepLanded) written from the
// stated spec, not from the page source, for cross-checking the marker caption.
import fs from 'fs';
import vm from 'vm';

const HTML = fs.readFileSync('/home/user/Perp-Options-AMM/app/index.html', 'utf8');
const m = HTML.match(/<script>([\s\S]*)<\/script>/);
if (!m) throw new Error('no script block');
const SRC = m[1];

function mkEl(id) {
  const el = {
    id, value: '', _html: '', _text: '', className: '', dataset: {},
    style: { width: '', display: '' },
    get innerHTML() { return this._html; }, set innerHTML(v) { this._html = String(v); },
    get textContent() { return this._text; }, set textContent(v) { this._text = String(v); },
    querySelector: () => mkEl('sub'), querySelectorAll: () => [],
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 980, height: 540 }),
    getContext: () => CTX, width: 980, height: 540,
    classList: { toggle() {}, add() {}, remove() {} },
    closest: () => null, addEventListener() {},
  };
  return el;
}
const CTX = new Proxy({ measureText: () => ({ width: 40 }), canvas: { width: 980, height: 540 } }, {
  get(t, p) { if (p in t) return t[p]; return () => {}; }, set() { return true; },
});
const els = {};
const document = {
  getElementById: (i) => (els[i] || (els[i] = mkEl(i))),
  querySelectorAll: () => [], addEventListener() {}, createElement: () => mkEl('tmp'),
};
const ctx = vm.createContext({ document, window: {}, console, Math, Number, String, Array, JSON, isFinite, parseFloat });
vm.runInContext(SRC, ctx);

// ---- INDEPENDENT re-derivation (written from the header comment's stated math,
// not copied from ladderAt/landedFrom): walk makers cheapest-first, VWAP.
function indepLanded(makers, pool, k, Q) {
  const rows = makers.map(mm => ({
    px: mm.c.CALL(k) * (1 + mm.h / 1e4),
    cap: Math.max(1e-9, mm.share * pool),
  }));
  rows.sort((x, y) => x.px - y.px);
  const best = rows[0].px;
  let rem = Q, cost = 0, tot = 0;
  for (const r of rows) {
    tot += r.cap;
    const t = Math.min(r.cap, Math.max(0, rem));
    cost += t * r.px; rem -= t;
  }
  if (rem > 1e-12) return { landed: null, best, total: tot, bps: null };
  const landed = cost / Q;
  return { landed, best, total: tot, bps: (landed / best - 1) * 1e4 };
}

const evalIn = (expr) => vm.runInContext(expr, ctx);
export { ctx, indepLanded, els, SRC, evalIn };
