/* views_perps_check.js — exercises app/views_perps.js (window.ViewPerps)
   against a real app/lifecycle.js (window.Life) store, and a minimal fake
   DOM so wire() itself (not just the two render functions) is exercised.

   Sequence: open perp -> carve a bundle -> try to close the perp (blocked)
   -> close the bundle -> close the perp (now allowed).

   Run: node sims/scripts/views_perps_check.js
*/
const fs = require('fs');
const vm = require('vm');

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  OK   ' + msg); }
  else { fail++; console.log('  FAIL ' + msg); }
}

// ── minimal fake DOM, just enough for ViewPerps.wire()'s querySelectorAll +
// per-element onclick/disabled/getAttribute contract. No jsdom in this repo. ─
function FakeButton(id, disabled) {
  this._attrs = { 'data-perp-close': id };
  this.disabled = !!disabled;
  this.onclick = null;
  this._wPerp = undefined;
}
FakeButton.prototype.getAttribute = function (name) { return this._attrs[name]; };
FakeButton.prototype.click = function () { if (typeof this.onclick === 'function') this.onclick(); };

function FakeDocument() { this._buttons = []; }
FakeDocument.prototype.setButtonsFromHtml = function (html) {
  // one FakeButton per rendered <button data-perp-close="ID" [disabled]>
  const re = /<button data-perp-close="([^"]+)"( disabled)?/g;
  const list = [];
  let m;
  while ((m = re.exec(html))) list.push(new FakeButton(m[1], !!m[2]));
  this._buttons = list;
};
FakeDocument.prototype.querySelectorAll = function (sel) {
  if (sel === '[data-perp-close]') return this._buttons;
  return [];
};

// ── load lifecycle.js and views_perps.js into one vm context, same pattern
// as sims/scripts/lifecycle_check.js ──────────────────────────────────────
const lifecycleSrc = fs.readFileSync(__dirname + '/../../app/lifecycle.js', 'utf8');
const viewsSrc = fs.readFileSync(__dirname + '/../../app/views_perps.js', 'utf8');

const fakeDocument = new FakeDocument();
const ctx = { console, Math, JSON, Object, Array, String, document: fakeDocument };
vm.createContext(ctx);
vm.runInContext(lifecycleSrc, ctx);
vm.runInContext(viewsSrc, ctx);
const Life = ctx.Life;
const ViewPerps = ctx.ViewPerps;
if (!Life) throw new Error('Life did not attach to the vm context');
if (!ViewPerps) throw new Error('ViewPerps did not attach to the vm context');

// ── helpers to pull facts out of the rendered HTML strings ────────────────
function rowCount(html) { return (html.match(/<tr data-perp-row=/g) || []).length; }
function identityLine(html) {
  const m = html.match(/free \+ carved = total<\/span><b class="(pos|neg)">([^<]+)<\/b>/);
  return m ? { ok: m[1] === 'pos', text: m[2] } : null;
}
function closeButtons(html) {
  const re = /<button data-perp-close="([^"]+)"( disabled)?[^>]*>/g;
  const out = [];
  let m;
  while ((m = re.exec(html))) out.push({ id: m[1], disabled: !!m[2] });
  return out;
}
function acctFacts(html) {
  const g = (id) => { const m = html.match(new RegExp('id="' + id + '"[^>]*>([^<]+)</b>')); return m ? m[1] : null; };
  return {
    equity: g('acctEquity'), notional: g('acctNotional'), leverage: g('acctLev'),
    headroom: g('acctHeadroom'), state: g('acctState')
  };
}

function renderAndWire(life, label) {
  const table = ViewPerps.perpsTableHTML(life);
  const strip = ViewPerps.accountStripHTML(life);
  fakeDocument.setButtonsFromHtml(table);
  ViewPerps.wire(life, function () { /* rerender hook — exercised separately below */ });
  console.log('\n──── ' + label + ' ────');
  console.log('  rows: ' + rowCount(table));
  console.log('  identity: ' + JSON.stringify(identityLine(table)));
  console.log('  close buttons: ' + JSON.stringify(closeButtons(table)));
  console.log('  account: ' + JSON.stringify(acctFacts(strip)));
  return { table, strip };
}

console.log('════════════════════════════════════════════════════════════════');
console.log('VIEWS_PERPS CHECK — perpsTableHTML / accountStripHTML / wire()');
console.log('════════════════════════════════════════════════════════════════');

const life = Life.create({ spot: 65000, equityBTC: 10 });

// ── 1. open a perp ─────────────────────────────────────────────────────
const r1 = life.openPerp({ side: 1, qty: 5 });
ok(r1.ok, 'openPerp(5 long) accepted');
let { table: t1 } = renderAndWire(life, '[1] after openPerp(5 long)');
ok(rowCount(t1) === 1, 'assert-1: one perp row shown');
{
  const id1 = identityLine(t1);
  ok(id1 && id1.ok && id1.text === '5.0000 + 0.0000 = 5.0000', 'assert-1: identity line correct (5 free, 0 carved, 5 total)');
}
{
  const btns = closeButtons(t1);
  ok(btns.length === 1 && !btns[0].disabled, 'assert-1: close button enabled on a free, uncarved perp');
}

// ── 2. carve a bundle from it ──────────────────────────────────────────
const r2 = life.openBundle({ legs: [{ k: 0.10, side: -1, qty: 3, price: 0.045 }], qtyPerp: 3, perpId: r1.id, origin: 'opened' });
ok(r2.ok, 'openBundle (carve 3 of 5) accepted');
let { table: t2 } = renderAndWire(life, '[2] after carving a 3 BTC bundle from the 5 BTC perp');
ok(rowCount(t2) === 2, 'assert-2: TWO perp rows now (the free remainder + the carved sliver) — a carved perp is still a perp');
{
  const id2 = identityLine(t2);
  ok(id2 && id2.ok && id2.text === '2.0000 + 3.0000 = 5.0000', 'assert-1(again): identity line correct after carve (2 free, 3 carved, 5 total)');
}
// assert-2 continued: same columns on the carved row as the free row —
// prove it by checking BOTH rows carry an entry/mark/upnl/funding cell set,
// i.e. no row is missing a <td> the other has.
{
  const rowBlocks = t2.split('<tr data-perp-row=').slice(1).map(s => '<tr data-perp-row=' + s);
  ok(rowBlocks.length === 2, 'sanity: split found 2 row blocks');
  const cellCounts = rowBlocks.map(r => (r.match(/<td/g) || []).length);
  ok(cellCounts[0] === cellCounts[1], 'assert-2: carved row has the SAME column count as the free row (' + cellCounts.join(' vs ') + ')');
  ok(rowBlocks[1].indexOf('carved &rarr;') !== -1, 'assert-2: the carved row is distinguishable ONLY by its "carved -> bundle" cell, not by a different row shape');
}

// ── 3. try to close the ORIGINAL (now-free-remainder) perp — must be
//        offered but blocked with the store's OWN reason, since a bundle
//        stands carved against it ─────────────────────────────────────
let { table: t3 } = renderAndWire(life, '[3] after trying to close the perp with a bundle standing against it');
{
  const btns = closeButtons(t3);
  const origRow = btns.find(b => b.id === r1.id);
  ok(!!origRow, 'assert-3: the original perp still has an offered close control (not hidden)');
  ok(origRow.disabled, 'assert-3: close is disabled while the bundle stands against it');
  // pull the store's own reason text out of the rendered HTML and compare to
  // what life.closePerp() itself would return for the very same call.
  const dryRun = life.closePerp(r1.id);
  ok(dryRun.ok === false, 'sanity: closePerp on the carved-against perp really is rejected by the store');
  ok(t3.indexOf(dryRun.reason) !== -1, 'assert-3: the disabled button carries the STORE\'S OWN reason string verbatim: "' + dryRun.reason + '"');
  ok(life.state().perps.length === 2, 'sanity: the dry-run rejection above did not mutate state (still 2 perps)');
}
// the carved sliver itself must ALSO be offered-but-blocked, for the other
// reason (direct close of a bound perp is never allowed, close its bundle).
{
  const btns = closeButtons(t3);
  const carvedRow = btns.find(b => b.id !== r1.id);
  ok(!!carvedRow && carvedRow.disabled, 'assert-3b: the carved sliver itself is also offered-but-blocked (close its bundle instead)');
}

// ── 4. close the bundle ────────────────────────────────────────────────
const r4 = life.closeBundle(r2.id, { closePx: 0.03, spot: 66000 });
ok(r4.ok, 'closeBundle accepted');
let { table: t4 } = renderAndWire(life, '[4] after closing the bundle');
ok(rowCount(t4) === 2, 'assert: still 2 rows — the carved perp is released (un-tagged), not deleted');
{
  const id4 = identityLine(t4);
  ok(id4 && id4.ok && id4.text === '5.0000 + 0.0000 = 5.0000', 'assert-1(again): identity restored to 5 free / 0 carved / 5 total after the bundle closes');
}

// ── 5. now closePerp must be ENABLED for both rows (both free) ────────
{
  const btns = closeButtons(t4);
  ok(btns.every(b => !b.disabled), 'assert-3(again): close is enabled on every row once nothing carved stands against it');
}
// exercise wire()'s actual click path (not just the store call) end to end,
// through the fake DOM, on the now-enabled original perp.
{
  fakeDocument.setButtonsFromHtml(t4);
  let rerenderCalledWith = null;
  ViewPerps.wire(life, function (res) { rerenderCalledWith = res; });
  const btn = fakeDocument._buttons.find(b => b.getAttribute('data-perp-close') === r1.id);
  ok(!!btn && !btn.disabled, 'sanity: fake DOM button for original perp is present and enabled');
  btn.click();
  ok(!!rerenderCalledWith && rerenderCalledWith.ok === true, 'wire(): clicking an enabled close button calls life.closePerp and invokes rerender with the result');
  ok(life.state().perps.find(p => p.id === r1.id) === undefined, 'wire(): the perp is actually gone from the store after the click');
}
// also exercise wire()'s disabled no-op path directly (construct a disabled
// fake button by hand and confirm clicking it never reaches life.closePerp).
{
  const spyLife = {
    closePerp: function () { spyLife._called = true; return { ok: true }; },
    _called: false
  };
  const disabledBtn = new FakeButton('perp_doesnotmatter', true);
  fakeDocument._buttons = [disabledBtn];
  ViewPerps.wire(spyLife, function () {});
  disabledBtn.click();
  ok(spyLife._called === false, 'wire(): a disabled control is a true no-op — never calls closePerp');
}

let { table: t5, strip: s5 } = renderAndWire(life, '[5] final state after closing the remaining perp too');
ok(rowCount(t5) === 1, 'assert: 1 row left (the carved sliver, released, still standing)');

// ── 6. LP-origin positions must NOT move the account numbers, and must
//        NOT appear as rows in the trader's PERPS tab ───────────────────
console.log('\n──── [6] LP-origin exclusion ────');
const acctBeforeLp = life.account();
// Atomic open (no perpId): a separate origin:'lp' perp is born carved,
// touching NONE of the trader's own perps — the realistic shape per
// UX_FORMALISM §7.3 (an LP is a different account; carving FROM the
// trader's own free perp for an lp-origin bundle isn't the modeled case).
const rLpBundle = life.openBundle({
  legs: [{ k: 0.10, side: -1, qty: 10, price: 0.02 }],
  qtyPerp: 10, side: 1, origin: 'lp'
});
ok(rLpBundle.ok, 'openBundle(origin: lp, atomic) accepted');
const acctAfterLpCarve = life.account();
ok(Math.abs(acctAfterLpCarve.optionNotional - acctBeforeLp.optionNotional) < 1e-9,
  'assert-5: an origin:lp bundle adds ZERO to account optionNotional');
ok(Math.abs(acctAfterLpCarve.perpNotional - acctBeforeLp.perpNotional) < 1e-9,
  'assert-5: an origin:lp bundle adds ZERO to account perpNotional either (its perp-equivalent line is excluded too)');
const { table: t6, strip: s6 } = renderAndWire(life, '[6] after opening an origin:lp bundle');
ok(t6.indexOf('carved &rarr; ' + rLpBundle.id) === -1, 'assert-5: the LP-origin carved perp does not appear as a row in the trader PERPS tab');
{
  const acctBeforeStr = JSON.stringify(acctFacts(s5));
  const acctAfterStr = JSON.stringify(acctFacts(s6));
  console.log('  account strip before LP bundle: ' + acctBeforeStr);
  console.log('  account strip after  LP bundle: ' + acctAfterStr);
  ok(acctBeforeStr === acctAfterStr, 'assert-5: account strip NUMBERS are unchanged by the LP-origin bundle');
}

// ── 7. no liquidation-price string anywhere in anything we rendered ────
console.log('\n──── [7] liquidation-price absence ────');
const everything = [t1, t2, t3, t4, t5, t6, s5, s6].join('\n');
const liqRe = /liq.*price|liquidation price/i;
ok(!liqRe.test(everything), 'assert-4: no string matching /liq.*price|liquidation price/i appears anywhere rendered');

console.log('\n════════════════════════════════════════════════════════════════');
console.log('RESULT: ' + pass + ' passed, ' + fail + ' failed');
console.log('════════════════════════════════════════════════════════════════');
if (fail > 0) process.exit(1);
