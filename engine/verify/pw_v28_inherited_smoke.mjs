// Live smoke-pass — INHERITED-FROM-v24 contracts on the constant-slope-multiplier HEAD
//   engine/builds/HEAD_temporal_mvp_v28_lens.html  (md5 8f897edc…)
// Closes skeptic completeness-audit FLAG-OMISSION #2: carry, rebase, strike-registration,
// dollar/settlement pipe never live-confirmed on THIS build this session; + funding-through-lens
// smoke (operator entry 232: funding = ±m·γ through-the-lens quantity).
// Run: cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/pw_v28_inherited_smoke.mjs A
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const RUN = (process.argv[2] || 'A').toUpperCase();
const here = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.resolve(here, '../builds/HEAD_temporal_mvp_v28_lens.html');
const EVID = path.resolve(here, '../../evidence/v28_constmult_inherited');
fs.mkdirSync(EVID, { recursive: true });
const LOG = [];
const log = (s) => { LOG.push(s); console.log(s); };
const shot = async (page, name) => { await page.screenshot({ path: path.join(EVID, `${RUN}_${name}.png`) }); };

const errors = [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('console', m => { if (m.type() === 'error') errors.push('console:' + m.text()); });
page.on('pageerror', e => errors.push('pageerror:' + e.message));
const dialogs = [];
page.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });

await page.goto('file://' + BUILD);
await page.waitForTimeout(600);
log(`=== INHERITED-CONTRACTS SMOKE  run ${RUN}  build ${path.basename(BUILD)} ===`);
log(`md5(build)=${execSync('md5sum ' + BUILD).toString().split(' ')[0]}`);

const setM = async (m) => page.evaluate((mm) => {
  const el = document.getElementById('m-input');
  el.value = String(mm);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}, m);
const setOracle = async (v) => page.evaluate((vv) => {
  const el = document.getElementById('kpi-oracle');
  el.value = String(vv);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}, v);

// ---------- ITEM 1: CARRY P = Ny/Nx, u-coordinate ----------
log('\n--- ITEM 1: CARRY P=Ny/Nx, u=log(price)-log(P) ---');
const item1 = await page.evaluate(() => {
  const s = Store.state;
  const p = s.pool;
  const w = Engine.getW(p);
  const mp_raw = Engine.getMP_raw(p);          // carry P (Ny/Nx form = w*y/((1-w)*x))
  const pm = Engine.poolMark(p, s.oracle, s.oracle_initial);
  const sNorm = Engine.getSNorm(p);
  const u = Math.log(s.oracle) - Math.log(mp_raw);
  return { w, mp_raw, pm, sNorm, oracle: s.oracle, u,
    finite: isFinite(u) && isFinite(mp_raw) && isFinite(pm),
    nan: isNaN(u) || isNaN(mp_raw) };
});
log(JSON.stringify(item1));

// ---------- ITEM 2: REBASE via oracle change ----------
log('\n--- ITEM 2: REBASE (oracle change → x→r·x, α→r·α, β,y,w invariant; θ→θ/r; P→P/r) ---');
const item2 = [];
for (const newO of [100000, 64000]) {
  const before = await page.evaluate(() => {
    const p = Store.state.pool;
    return { x: p.x, y: p.y, alpha: p.alpha, beta: p.beta, w: Engine.getW(p),
      sNorm: Engine.getSNorm(p), mp_raw: Engine.getMP_raw(p), oracle: Store.state.oracle };
  });
  await setOracle(newO);
  await page.waitForTimeout(150);
  const after = await page.evaluate(() => {
    const p = Store.state.pool;
    return { x: p.x, y: p.y, alpha: p.alpha, beta: p.beta, w: Engine.getW(p),
      sNorm: Engine.getSNorm(p), mp_raw: Engine.getMP_raw(p), oracle: Store.state.oracle };
  });
  const r = newO / before.oracle;
  const rec = { newO, r,
    x_ratio: after.x / before.x, alpha_ratio: after.alpha / before.alpha,
    beta_inv: after.beta === before.beta, y_inv: after.y === before.y,
    dw: after.w - before.w, dsNorm: after.sNorm - before.sNorm,
    mp_ratio: after.mp_raw / before.mp_raw, expect_1_over_r: 1 / r,
    theta_after: 1.5 / r };
  item2.push(rec);
  log(JSON.stringify(rec));
}
// reset oracle to 80000 for clean strike-registration & rest
await setOracle(80000);
await page.waitForTimeout(150);

// ---------- ITEM 3: STRIKE REGISTRATION θ=sNorm(K) ----------
log('\n--- ITEM 3: STRIKE REGISTRATION θ=K/oracle; mark consistent display vs chart ---');
const item3 = await page.evaluate(() => {
  const s = Store.state;
  const oracle = s.oracle;
  const sNorm = Engine.getSNorm(s.pool);
  const out = [];
  for (const K of [120000, 80000, 48000]) {
    const theta = K / oracle;                  // registration
    const wing = K >= oracle ? 'call' : 'put';
    const g = Engine.gLoc(s.pool, theta, s.m); // m from state
    const mk = Engine.markLensed(wing, theta, sNorm, g);
    // free-boundary crossover@K (continuation→intrinsic): price multiple S*=K*g/(g+1)
    const Sstar_mult = g / (g + 1);
    out.push({ K, theta, wing, g, mark: mk, Sstar_mult, finite: isFinite(mk) });
  }
  return { oracle, sNorm, m: s.m, rows: out };
});
log(JSON.stringify(item3));

// ---------- ITEM 4: DOLLAR / SETTLEMENT PIPE — open & settle OTM + ITM ----------
log('\n--- ITEM 4: DOLLAR/SETTLEMENT PIPE (UI band open → closeBand; OTM-expiry & ITM-exercise) ---');
const openBand = async (soldInner, boughtInner, notional, dir) => page.evaluate((args) => {
  const set = (id, v) => { const el = document.getElementById(id); el.value = String(v);
    el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
  set('sold-inner', args.soldInner);
  set('bought-inner', args.boughtInner);
  set('band-notional', args.notional);
  const pill = document.getElementById('band-dir-sell');
  if (pill && pill.dataset.dir !== args.dir) pill.click();
  document.getElementById('btn-execute').click();
}, { soldInner, boughtInner, notional, dir });

// --- OTM expiry: oracle stays near 80k so both strikes are OTM-ish; close immediately ---
const beforeReserves = await page.evaluate(() => ({ ...Store.state.pool }));
await openBand(120000, 48000, 0.02, 'long');
await page.waitForTimeout(250);
const afterOpen = await page.evaluate(() => {
  const s = Store.state;
  const ids = Object.keys(s.bands || {});
  return { x: s.pool.x, y: s.pool.y, bandIds: ids,
    nBands: ids.length };
});
log('OTM open: ' + JSON.stringify(afterOpen));
const otmClose = await page.evaluate(() => {
  const s = Store.state;
  const id = Object.keys(s.bands)[0];
  if (!id) return { err: 'no band' };
  const r = Engine.closeBand(s.pool, s.bands[id], s.clubs[s.bands[id].entry.club], s.perpMark, s.oracle, s.oracle_initial, s.m);
  return { raw_net: r.raw_net, trader_payout: r.trader_payout, club_delta: r.club_delta,
    L0: r.L0, X: r.X, Y: r.Y, settled_cash_leg: r.settled_cash_leg, floored: r.floored,
    finite: isFinite(r.trader_payout) && isFinite(r.raw_net),
    fx: Number.isFinite(r.X) && Math.abs(r.trader_payout) < 1e12 };
});
log('OTM settle (closeBand, oracle≈80k): ' + JSON.stringify(otmClose));
// actually close it through Store to move reserves
await page.evaluate(() => { const id = Object.keys(Store.state.bands)[0]; if (id) Store.closeBand(id); });
await page.waitForTimeout(200);
const afterOtmReserves = await page.evaluate(() => ({ ...Store.state.pool }));
log('OTM reserves after Store.closeBand: ' + JSON.stringify({
  dx: afterOtmReserves.x - beforeReserves.x, dy: afterOtmReserves.y - beforeReserves.y }));

// --- ITM exercise: drive oracle up so sold-call (K=120k) goes ITM, then settle ---
const beforeITM = await page.evaluate(() => ({ ...Store.state.pool }));
await openBand(120000, 48000, 0.02, 'long');
await page.waitForTimeout(250);
await setOracle(160000);   // oracle ↑ → call wing ITM (rebase happens, but settlement uses live oracle)
await page.waitForTimeout(200);
const itmClose = await page.evaluate(() => {
  const s = Store.state;
  const id = Object.keys(s.bands)[0];
  if (!id) return { err: 'no band' };
  const b = s.bands[id];
  const r = Engine.closeBand(s.pool, b, s.clubs[b.entry.club], s.perpMark, s.oracle, s.oracle_initial, s.m);
  return { raw_net: r.raw_net, trader_payout: r.trader_payout, club_delta: r.club_delta,
    L0: r.L0, X: r.X, Y: r.Y, settled_cash_leg: r.settled_cash_leg, live_leg: r.live_leg,
    floored: r.floored,
    finite: isFinite(r.trader_payout) && isFinite(r.raw_net),
    sane: Number.isFinite(r.trader_payout) && Math.abs(r.trader_payout) < 1e12 };
});
log('ITM settle (closeBand, oracle=160k, sold-call ITM): ' + JSON.stringify(itmClose));
await page.evaluate(() => { const id = Object.keys(Store.state.bands)[0]; if (id) Store.closeBand(id); });
await page.waitForTimeout(200);
const afterItmReserves = await page.evaluate(() => ({ ...Store.state.pool }));
log('ITM reserves after Store.closeBand: ' + JSON.stringify({
  x: afterItmReserves.x, y: afterItmReserves.y,
  finite: isFinite(afterItmReserves.x) && isFinite(afterItmReserves.y) }));
await setOracle(80000);
await page.waitForTimeout(150);

// ---------- ITEM 5: FUNDING THROUGH LENS (m=1,2,4), sign-flip on wing ----------
log('\n--- ITEM 5: FUNDING THROUGH LENS (entry 232: funding = ±m·γ quantity) ---');
const item5 = await page.evaluate(() => {
  const s = Store.state;
  // steepen pool off w=0.5 (else S=mp/oracle=1 → (S-1)/S=0, funding 0/0 positive-control artifact)
  const sp = Engine.tradeUpdate(s.pool, 60000);
  const S = Engine.poolMark(sp, s.oracle, s.oracle_initial) / s.oracle;
  const rows = [];
  for (const m of [1, 2, 4]) {
    const fCall = Engine.fundingPerStrike(sp, 1.5, 'call', 1.0, 1.0, 0.01, s.oracle, s.oracle_initial, m);
    const fPut  = Engine.fundingPerStrike(sp, 0.7, 'put',  1.0, 1.0, 0.01, s.oracle, s.oracle_initial, m);
    rows.push({ m, fCall, fPut, signflip: Math.sign(fCall) !== Math.sign(fPut),
      finite: isFinite(fCall) && isFinite(fPut) });
  }
  // scaling check m=1->4
  const ratioCall = rows[2].fCall / rows[0].fCall;
  return { w: Engine.getW(sp), S, rows, ratioCall_1to4: ratioCall };
});
log(JSON.stringify(item5));

await shot(page, 'fullpage_end');
log('\nconsole/pageerrors: ' + JSON.stringify(errors));
log('dialogs: ' + JSON.stringify(dialogs));

// dump a stable result blob for byte-diff between runs
const RESULT = { item1, item2, item3,
  item4: { otmClose, otmReserveDelta: { dx: afterOtmReserves.x - beforeReserves.x, dy: afterOtmReserves.y - beforeReserves.y },
           itmClose, itmReserves: afterItmReserves },
  item5, errors, dialogs };
fs.writeFileSync(path.join(EVID, `RESULT_run${RUN}.json`), JSON.stringify(RESULT, null, 2));
fs.writeFileSync(path.join(EVID, `RUN_LOG_run${RUN}.txt`), LOG.join('\n') + '\n');
await browser.close();
log(`\n=== done run ${RUN} ===`);
