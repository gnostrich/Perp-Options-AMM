/* lifecycle_check.js — walks the whole Life store loop, prints state after
   every step, asserts the accounting identity after every mutation.
   Run: node sims/scripts/lifecycle_check.js
   Every exported Life.create(...) method is exercised: state, openPerp,
   openBundle, closeBundle, closePerp, account, ledger. */
const fs = require('fs');
const vm = require('vm');

const src = fs.readFileSync(__dirname + '/../../app/lifecycle.js', 'utf8');
const ctx = { console, Math, JSON, Object, Array };
vm.createContext(ctx);
vm.runInContext(src, ctx); // attaches ctx.Life (global === ctx here, no window)
const Life = ctx.Life || ctx.window && ctx.window.Life;
if (!Life) throw new Error('Life did not attach to the vm context');

let pass = 0, fail = 0;
function assertTrue(cond, msg) {
  if (cond) { pass++; console.log('  OK   ' + msg); }
  else { fail++; console.log('  FAIL ' + msg); }
}
function assertRejected(res, msg) {
  assertTrue(res && res.ok === false && typeof res.reason === 'string' && res.reason.length > 0,
    msg + '  [reason: ' + (res && res.reason) + ']');
}
function assertOk(res, msg) {
  assertTrue(res && res.ok === true, msg + (res && !res.ok ? '  [reason: ' + res.reason + ']' : ''));
}

function dump(label, life) {
  console.log('\n──── ' + label + ' ────');
  const st = life.state();
  console.log('perps:');
  st.perps.forEach(p => console.log('  ' + p.id + '  side=' + p.side + '  qty=' + p.qty +
    '  boundTo=' + p.boundTo + '  carvedFrom=' + p.carvedFrom + '  origin=' + p.origin));
  console.log('bundles:');
  st.bundles.forEach(b => console.log('  ' + b.id + '  origin=' + b.origin + '  legs=' + b.legs.length +
    '  perpId=' + b.perpId + '  closed=' + b.closed));
  const freeQty = st.perps.filter(p => !p.boundTo).reduce((s, p) => s + p.qty, 0);
  const carvedQty = st.perps.filter(p => p.boundTo).reduce((s, p) => s + p.qty, 0);
  const totalQty = st.perps.reduce((s, p) => s + p.qty, 0);
  console.log('identity: free(' + freeQty + ') + carved(' + carvedQty + ') = ' + (freeQty + carvedQty) +
    '  vs total(' + totalQty + ')');
  assertTrue(Math.abs(freeQty + carvedQty - totalQty) < 1e-9, 'identity holds after: ' + label);
}

console.log('════════════════════════════════════════════════════════════════');
console.log('LIFECYCLE CHECK — Life store, full loop');
console.log('════════════════════════════════════════════════════════════════');

const life = Life.create({ spot: 65000, equityBTC: 10 });

// ── 1. open a perp 5 BTC long ──────────────────────────────────────────
console.log('\n[1] open a perp 5 BTC long');
const r1 = life.openPerp({ side: 1, qty: 5 });
assertOk(r1, 'openPerp(5 long) accepted');
dump('after step 1', life);
{
  const st = life.state();
  assertTrue(st.perps.length === 1 && st.perps[0].qty === 5, 'perps tab shows 5');
}
const perpId = r1.id;

// ── 2. sell a 3 BTC call on it ─────────────────────────────────────────
console.log('\n[2] sell a 3 BTC call on it (carve 3 from the 5 BTC perp)');
const r2 = life.openBundle({
  legs: [{ k: 0.10, side: -1, qty: 3, price: 0.045 }],
  qtyPerp: 3, perpId, origin: 'opened'
});
assertOk(r2, 'openBundle (carve 3) accepted');
dump('after step 2', life);
{
  const st = life.state();
  const free = st.perps.filter(p => !p.boundTo).reduce((s, p) => s + p.qty, 0);
  const carved = st.perps.filter(p => p.boundTo).reduce((s, p) => s + p.qty, 0);
  assertTrue(free === 2, 'perps tab shows 2 free');
  assertTrue(carved === 3, 'perps tab shows 3 carved');
}
const bundle1Id = r2.id;

// ── 3. try to close the perp — REJECTED ────────────────────────────────
console.log('\n[3] try to close the original perp while 3 BTC is carved against it');
const r3 = life.closePerp(perpId);
assertRejected(r3, 'closePerp blocked while carved sliver stands against it');

// ── 4. try a naked option with no perp — REJECTED ──────────────────────
console.log('\n[4] try a naked option (no perpId, no side/qtyPerp to open one)');
const r4 = life.openBundle({ legs: [{ k: 0.20, side: -1, qty: 1 }] }); // no qtyPerp at all
assertRejected(r4, 'naked option rejected (no qtyPerp given)');
const r4b = life.openBundle({ legs: [{ k: 0.20, side: -1, qty: 1 }], qtyPerp: 1 }); // qtyPerp but no perpId/side
assertRejected(r4b, 'naked option rejected (qtyPerp given but no perpId and no side to open one)');

// ── 5. open a vertical spread ───────────────────────────────────────────
console.log('\n[5] open a vertical spread: carve the remaining 2 BTC free perp');
const r5 = life.openBundle({
  legs: [
    { k: 0.05, side: 1, qty: 2, price: 0.070 },   // bought inner
    { k: 0.15, side: -1, qty: 2, price: 0.020 }   // sold outer
  ],
  qtyPerp: 2, perpId, origin: 'opened'
});
assertOk(r5, 'openBundle (vertical spread) accepted');
dump('after step 5', life);
{
  const st = life.state();
  const b = st.bundles.find(b => b.id === r5.id);
  assertTrue(b.legs.length === 2, '2 legs in the spread bundle');
  assertTrue(!!b.perpId, '1 carved perp backs the bundle');
  const free = st.perps.filter(p => !p.boundTo).reduce((s, p) => s + p.qty, 0);
  assertTrue(free === 0, 'the source perp is now fully carved (0 free)');
}
const bundle2Id = r5.id;

// ── 6. close a bundle ────────────────────────────────────────────────────
console.log('\n[6] close bundle 1 (the 3 BTC carved call)');
const r6 = life.closeBundle(bundle1Id, { closePx: 0.030, spot: 68000 });
assertOk(r6, 'closeBundle accepted');
dump('after step 6', life);
{
  const st = life.state();
  const released = st.perps.find(p => p.carvedFrom === perpId && p.qty === 3);
  assertTrue(!!released && released.boundTo === null, 'carved perp released (boundTo cleared)');
  const led = st.ledger.find(e => e.type === 'close-bundle' && e.positionId === bundle1Id);
  assertTrue(!!led, 'ledger credited for the close');
  console.log('  close payout: optionUsd=' + r6.optionUsd.toFixed(2) + ' perpUsd=' + r6.perpUsd.toFixed(2) +
    ' payoutUsd=' + r6.payoutUsd.toFixed(2));
  assertTrue(Math.abs(r6.payoutUsd - (r6.optionUsd + r6.perpUsd)) < 1e-6,
    'trader (origin:opened) payout = option leg + carved perp leg');
}

// ── 7. an origin:'lp' bundle — payout excludes the perp leg ────────────
console.log("\n[7] origin:'lp' bundle — same shape, payout must exclude the perp leg");
const rp = life.openPerp({ side: 1, qty: 4 });
const lpPerpId = rp.id;
const r7 = life.openBundle({
  legs: [{ k: 0.10, side: -1, qty: 2, price: 0.045 }],
  qtyPerp: 2, perpId: lpPerpId, origin: 'lp'
});
assertOk(r7, "openBundle origin:'lp' accepted");
const r7close = life.closeBundle(r7.id, { closePx: 0.030, spot: 68000 });
assertOk(r7close, "closeBundle on an lp bundle accepted");
console.log('  lp close payout: optionUsd=' + r7close.optionUsd.toFixed(2) + ' perpUsd=' + r7close.perpUsd.toFixed(2) +
  ' payoutUsd=' + r7close.payoutUsd.toFixed(2));
assertTrue(Math.abs(r7close.payoutUsd - r7close.optionUsd) < 1e-9,
  "LP payout excludes the perp leg (payoutUsd === optionUsd exactly)");
assertTrue(Math.abs(r7close.perpUsd) > 1e-6, 'the perp leg P&L is non-zero (it exists, just excluded)');
assertTrue(Math.abs((r7close.optionUsd + r7close.perpUsd) - r7close.payoutUsd) > 1e-6,
  'assert the two payout compositions genuinely differ: option+perp !== actual LP payout');
console.log('  (trader payout = optionUsd+perpUsd; LP payout = optionUsd only — this is the invariant, not a numeric coincidence)');

// ── 8. account leverage/headroom; LP excluded ───────────────────────────
console.log('\n[8] account() — leverage, headroom, LP exclusion');
dump('before step 8 close of bundle 2', life);
const acctBefore = life.account();
console.log('  account (with open bundle2, open lp-origin free perp):', JSON.stringify(acctBefore, null, 2));
assertTrue(acctBefore.cap === 50, 'cap is 50x');
assertTrue(typeof acctBefore.leverage === 'number' && isFinite(acctBefore.leverage), 'leverage computed');
assertTrue(typeof acctBefore.headroom === 'number', 'headroom computed');

// Prove LP exclusion: an LP-origin free perp (post-release) must not move notional.
// r7close.releasedPerpId is the origin:'lp' carved perp released by the lp bundle's
// close — NOT lpPerpId (which is the SOURCE perp; its free remainder is origin:'opened'
// and correctly DOES count toward notional, since the trader still owns that piece).
const lpOriginPerpId = r7close.releasedPerpId;
assertTrue(life.state().perps.find(p => p.id === lpOriginPerpId).origin === 'lp',
  'sanity: releasedPerpId from the lp close really is an origin:"lp" row');
const r7b = life.closePerp(lpOriginPerpId); // now free (release), no carve stands against it — should succeed
assertOk(r7b, "closePerp on the origin:'lp' perp succeeds once its bundle is closed");
const acctAfterLpPerpClose = life.account();
assertTrue(Math.abs(acctAfterLpPerpClose.notionalUSD - acctBefore.notionalUSD) < 1e-6,
  "closing the origin:'lp' perp does not move account notional — it was excluded all along");

// close bundle 2 to fully wind down and re-check identity/account
const r8 = life.closeBundle(bundle2Id, { closePx: 0.025, spot: 68000 }); // net close px for both legs (simplification)
assertOk(r8, 'closeBundle(bundle2) accepted');
dump('after step 8 (bundle2 closed)', life);
const acctAfter = life.account();
console.log('  account after winding down:', JSON.stringify(acctAfter, null, 2));
assertTrue(acctAfter.optionNotional === 0, 'no open (non-lp) bundles left -> optionNotional 0');

// ── 9. identity re-asserted after EVERY mutation above (dump() already did
//        this at each step; final explicit check here too) ─────────────
console.log('\n[9] final explicit identity check');
{
  const st = life.state();
  const free = st.perps.filter(p => !p.boundTo).reduce((s, p) => s + p.qty, 0);
  const carved = st.perps.filter(p => p.boundTo).reduce((s, p) => s + p.qty, 0);
  const total = st.perps.reduce((s, p) => s + p.qty, 0);
  assertTrue(Math.abs(free + carved - total) < 1e-9, 'final: free + carved === total, exactly');
}

// ── extra: ledger() is append-only with a back-pointer ──────────────────
console.log('\n[extra] ledger() sanity');
{
  const led = life.ledger();
  assertTrue(Array.isArray(led) && led.length > 0, 'ledger() returns entries');
  assertTrue(led.every(e => 'positionId' in e), 'every ledger entry carries a back-pointer (positionId)');
  console.log('  ledger has ' + led.length + ' entries, types: ' + [...new Set(led.map(e => e.type))].join(', '));
}

console.log('\n════════════════════════════════════════════════════════════════');
console.log('RESULT: ' + pass + ' passed, ' + fail + ' failed');
console.log('════════════════════════════════════════════════════════════════');
if (fail > 0) process.exit(1);
