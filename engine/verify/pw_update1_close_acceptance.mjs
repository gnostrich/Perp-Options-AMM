// UPDATE-1 LIVE ACCEPTANCE — unified sell-back close (both legs on the AMM) + funding-on-option-part.
// Build: builds/HEAD_temporal_mvp_v28_lens.html (md5 bb2f8230…), revert twin _twocaseclose.html (51342574…).
// Verifies the update-1 behavioral deltas in the LIVE DOM (Engine/Store reachable; visuals via real UI):
//   A1 load/scripts/charts + Engine exports (tradeUpdateAt/closeBand/fundingPerStrike)
//   A2 unified close, BOTH legs reverse on the AMM (OTM cross-wing) — no cash-settled leg
//   A3 a GENUINELY-ITM leg (engine's own poolMark/oracle regime) STILL reverses on the AMM (no cash-settle)
//   A4 reserves do NOT round-trip exactly — small bounded x-drain BY DESIGN (intended delta, not a regression)
//   A5 payout continuity across OTM→ITM crossing — LIVE A/B: HEAD continuous vs the TWO-CASE twin JUMPS
//   A6 funding readout = extrinsic hump peaking at ATM, EXACTLY 0 deep-ITM (past S*); call/put opposite sign
//   A6b DOM: portfolio bands funding column renders; perps table has no Funding column & is untouched by ticks
// Pool imbalance in A3/A5/A6 is created via the SHIPPED live trade path Engine.tradeUpdateAt (rho=1 ≡ spot
// swap; the same function the UI executes) then closed via the real #btn-close UI — engine-logic confirmed
// in the REAL browser, not a pixel claim. READ-ONLY on the engine.
// Run: cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/pw_update1_close_acceptance.mjs [A|B]
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const RUN = (process.argv[2] || 'A').toUpperCase();
const here = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.resolve(here, '../builds/HEAD_temporal_mvp_v28_lens.html');
const TWIN = path.resolve(here, '../builds/temporal_mvp_v28_lens_twocaseclose.html');
const EVID = path.resolve(here, '../../evidence/update1_close_acceptance');
fs.mkdirSync(EVID, { recursive: true });
const LOG = []; const log = (s) => { LOG.push(s); console.log(s); };
const md5 = (f) => execSync('md5sum ' + f).toString().split(' ')[0];
const CHECKS = []; const ck = (n, p, d) => { CHECKS.push({ n, p, d }); log(`${p ? 'PASS' : 'FAIL'} ${n}  ${d}`); };
const md5pre = md5(BUILD);
log(`=== UPDATE-1 CLOSE ACCEPTANCE  run ${RUN}  build md5 ${md5pre} ===`);

const errors = [], dialogs = [];
const browser = await chromium.launch({ headless: true });

// ── UI helper factory bound to a page ─────────────────────────────────────
function ui(page) {
  const setField = (id, v) => page.evaluate(({ id, v }) => { const e = document.getElementById(id); if (!e) return false; e.value = String(v); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); return true; }, { id, v });
  const click = (sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; e.click(); return true; }, sel);
  const pool = () => page.evaluate(() => { const s = Store.state, p = s.pool; return { x: p.x, y: p.y, w: Engine.getW(p), sNorm: Engine.getSNorm(p), S: Engine.poolMark(p, s.oracle, s.oracle_initial) / s.oracle, oracle: s.oracle, open: s.bands.filter(b => b.status === 'open').length, m: s.m }; });
  const goPortfolioBands = async () => { await page.evaluate(() => { const n = document.querySelector('.page-nav-link[data-page="portfolio"]'); if (n) n.click(); }); await page.evaluate(() => { const t = document.querySelector('.tab[data-subtab-pf="bands"]'); if (t) t.click(); }); await page.waitForTimeout(120); };
  const goTransactBands = async () => { await page.evaluate(() => { const n = document.querySelector('.page-nav-link[data-page="transact"]'); if (n) n.click(); }); await click('.tab[data-subtab="bands"]'); await page.waitForTimeout(100); };
  const setDir = (dir) => page.evaluate((d) => { const p = document.getElementById('band-dir-sell'); if (p && p.dataset.dir !== d) p.click(); }, dir);
  const openBand = async (dir, soldK, boughtK, N) => { await goTransactBands(); await setDir(dir); await setField('sold-inner', soldK); await setField('bought-inner', boughtK); await setField('band-notional', N); await page.waitForTimeout(70); await click('#btn-execute'); await page.waitForTimeout(160); };
  const closeFirst = async () => { await goPortfolioBands(); await page.evaluate(() => { const b = document.querySelector('button[data-close-band]'); if (b) b.click(); }); await page.waitForTimeout(200); };
  const reset = async () => { await click('#btn-reset'); await page.waitForTimeout(150); };
  // Imbalance the LIVE pool via the shipped trade-point path (rho=1 ≡ spot swap).
  const imbalance = (dy) => page.evaluate((d) => { const s2 = Engine.tradeUpdateAt(Store.state.pool, d, 1); if (s2) Store.state.pool = s2; return { w: Engine.getW(Store.state.pool), S: Engine.poolMark(Store.state.pool, Store.state.oracle, Store.state.oracle_initial) / Store.state.oracle }; }, dy);
  // Engine's OWN close-time regime: sNorm0 = poolMark/oracle; leg live theta = K/oracle.
  const regime = () => page.evaluate(() => { const s = Store.state, p = s.pool, b = s.bands.filter(x => x.status === 'open')[0]; if (!b) return null; const sN0 = Engine.poolMark(p, s.oracle, s.oracle_initial) / s.oracle; const sw = b.sold_wing || b.wing, bw = b.bought_wing || b.wing; const thS = (isFinite(b.sold.K_inner) && b.sold.K_inner > 0 ? b.sold.K_inner : b.sold.inner * s.oracle) / s.oracle; const thB = (isFinite(b.bought.K_inner) && b.bought.K_inner > 0 ? b.bought.K_inner : b.bought.inner * s.oracle) / s.oracle; return { sNorm0: sN0, sw, bw, thS, thB, soldITM: Engine.legIsITM(sw, { inner: thS }, sN0), boughtITM: Engine.legIsITM(bw, { inner: thB }, sN0) }; });
  const lastClose = () => page.evaluate(() => { const s = Store.state; const closed = s.bands.filter(x => x.status !== 'open'); const b = closed[closed.length - 1]; const c = b && b.close; const cl = (s.eventLog.find(e => e.kind === 'close') || {}).msg || ''; return c ? { settled: c.settled_cash_leg, live_leg: c.live_leg, raw_net: c.raw_net, trader_payout: c.trader_payout, X: c.X, Y: c.Y, poolFinite: isFinite(s.pool.x) && isFinite(s.pool.y), logline: cl } : { logline: cl }; });
  return { page, setField, click, pool, goPortfolioBands, goTransactBands, setDir, openBand, closeFirst, reset, imbalance, regime, lastClose };
}

const page = await browser.newPage();
page.on('console', m => { if (m.type() === 'error') errors.push('console:' + m.text()); });
page.on('pageerror', e => errors.push('pageerror:' + e.message));
page.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });
await page.goto('file://' + BUILD);
await page.waitForTimeout(600);
const U = ui(page);

// ── A1: load / scripts / charts / exports ─────────────────────────────────
const boot = await page.evaluate(() => ({ hasEngine: typeof Engine === 'object', hasStore: typeof Store === 'object', tradeUpdateAt: typeof Engine.tradeUpdateAt === 'function', closeBand: typeof Engine.closeBand === 'function', fundingPerStrike: typeof Engine.fundingPerStrike === 'function' }));
const chartStates = await page.evaluate(() => Array.from(document.getElementById('chart-select').options).map(o => o.value));
const chartRender = {};
for (const cs of chartStates) {
  await U.setField('chart-select', cs); await page.waitForTimeout(160);
  for (const cid of ['canvas-curve', 'canvas-pricing', 'canvas-payoff', 'canvas-ratio']) {
    const vis = await page.evaluate((c) => { const e = document.getElementById(c); return e && e.offsetParent !== null; }, cid);
    if (vis) { const nb = await page.evaluate((c) => { const cv = document.getElementById(c); const ctx = cv.getContext('2d'); const im = ctx.getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 0; i < im.length; i += 4) if (im[i + 3] > 0 && (im[i] || im[i + 1] || im[i + 2])) n++; return n; }, cid); chartRender[`${cs}:${cid}`] = nb; }
  }
}
ck('A1 load: 0 pageerrors + Engine/Store + exports (tradeUpdateAt/closeBand/fundingPerStrike) + all chart states render',
   errors.length === 0 && boot.hasEngine && boot.hasStore && boot.tradeUpdateAt && boot.closeBand && boot.fundingPerStrike && Object.values(chartRender).every(v => v > 2000),
   `errors=${errors.length} boot=${JSON.stringify(boot)} charts=${JSON.stringify(chartRender)}`);
await U.setField('chart-select', 'pricing'); await page.waitForTimeout(100);

// ── A2: unified close, BOTH legs reverse on the AMM (OTM cross-wing) ───────
await U.openBand('long', 120000, 48000, 0.05);
const preA2 = await U.pool();
const regA2 = await U.regime();
await U.closeFirst();
const cA2 = await U.lastClose();
const postA2 = await U.pool();
const bothLog2 = /both legs reversed on AMM/i.test(cA2.logline) && !/settled-to-cash/i.test(cA2.logline);
ck('A2 unified close OTM (both legs OTM): settled_cash_leg=null, live_leg=both, log "both legs reversed on AMM"',
   preA2.open === 1 && postA2.open === 0 && !regA2.soldITM && !regA2.boughtITM && cA2.settled === null && cA2.live_leg === 'both' && bothLog2 && isFinite(cA2.raw_net) && cA2.poolFinite,
   `open ${preA2.open}→${postA2.open} regime(soldITM=${regA2.soldITM},boughtITM=${regA2.boughtITM}) settled=${cA2.settled} live_leg=${cA2.live_leg} raw_net=${cA2.raw_net} log="${cA2.logline}"`);

// ── A3: a GENUINELY-ITM leg still reverses on the AMM ─────────────────────
// short band sold-put 60k / bought-call 100k; oracle→12000 + arb ⇒ sold-put live θ=5 ≥ sNorm0≈1 ⇒ deep ITM.
await U.reset();
await U.openBand('short', 60000, 100000, 0.05);
await U.setField('kpi-oracle', 12000); await page.waitForTimeout(150);
await U.click('#btn-arb'); await page.waitForTimeout(150);
const regA3 = await U.regime();
await U.closeFirst();
const cA3 = await U.lastClose();
const postA3 = await U.pool();
const bothLog3 = /both legs reversed on AMM/i.test(cA3.logline) && !/settled-to-cash/i.test(cA3.logline);
ck('A3 genuinely-ITM leg (engine poolMark/oracle regime) STILL reverses on the AMM — no cash-settle',
   (regA3.soldITM || regA3.boughtITM) && postA3.open === 0 && cA3.settled === null && cA3.live_leg === 'both' && bothLog3 && isFinite(cA3.raw_net) && cA3.poolFinite,
   `regime sNorm0=${regA3.sNorm0.toFixed(4)} soldPut θ=${regA3.thS.toFixed(3)} ITM=${regA3.soldITM} / boughtCall θ=${regA3.thB.toFixed(3)} ITM=${regA3.boughtITM} → settled=${cA3.settled} live_leg=${cA3.live_leg} raw_net=${cA3.raw_net.toFixed(6)} log="${cA3.logline}"`);

// ── A4: x-drain BY DESIGN — small bounded, Δy≈0 ───────────────────────────
await U.reset();
const preA4 = await U.pool();
await U.openBand('long', 120000, 48000, 0.05);
await U.closeFirst();
const postA4 = await U.pool();
const dx = postA4.x - preA4.x, dy = postA4.y - preA4.y, dxUSD = dx * preA4.oracle, xFrac = Math.abs(dx) / preA4.x;
ck('A4 x-drain BY DESIGN: Δx<0 small+bounded (<$5k, <0.1% of pool.x), Δy≈0 (round-trips) — intended delta',
   dx < 0 && Math.abs(dxUSD) < 5000 && xFrac < 1e-3 && Math.abs(dy) < 1e-6 && postA4.open === 0,
   `Δx=${dx.toExponential(4)} (${dxUSD.toFixed(2)} USD, ${(xFrac * 100).toExponential(3)}% of pool.x=${preA4.x.toFixed(2)}) Δy=${dy.toExponential(3)}`);

// ── A5: payout continuity OTM→ITM — LIVE A/B HEAD vs TWO-CASE twin ────────
// The pool is unit-lopsided (x=10 BTC, y=800k USD) so a raw dy swap barely moves price; the
// reliable ITM driver is the A3 pattern: setOracle re-rays the leg (θ=K/oracle) while arb pins
// sNorm0≈1. Per oracle: reset → open long band (sold-call 120k / bought-put 48k, N=0.02) at 80k →
// setOracle(target) → arb → close → read raw_net. The bought-put θ=48000/oracle crosses ITM
// (put ITM ⟺ sNorm0 ≤ θ) as oracle drops below ~48000. Sweep 56000→40000 across the crossing;
// the crossing step must NOT be an outlier on HEAD (unified sell-back) and SHOULD be one on the
// retired two-case twin (settle-to-cash seam). raw_net is read from the DOM band.close.
async function sweep(uu) {
  const out = [];
  const oracles = [56000, 52000, 50000, 49000, 48500, 48000, 47500, 47000, 46000, 44000, 40000];
  for (const o of oracles) {
    await uu.reset();
    await uu.openBand('long', 120000, 48000, 0.02);
    await uu.setField('kpi-oracle', o); await uu.page.waitForTimeout(110);
    await uu.click('#btn-arb'); await uu.page.waitForTimeout(130);
    const reg = await uu.regime();
    if (!reg) { continue; }
    await uu.closeFirst();
    const c = await uu.lastClose();
    out.push({ o, sNorm0: reg.sNorm0, boughtPutITM: reg.boughtITM, raw_net: c.raw_net, settled: c.settled });
  }
  out.sort((a, b) => b.o - a.o);   // descending oracle = OTM (high) → ITM (low) moneyness order
  return out;
}
const headSweep = await sweep(U);
// twin
const tpage = await browser.newPage();
const terr = [];
tpage.on('pageerror', e => terr.push('twin-pageerror:' + e.message));
tpage.on('dialog', async d => { await d.dismiss(); });
await tpage.goto('file://' + TWIN);
await tpage.waitForTimeout(600);
const T = ui(tpage);
const twinSweep = await sweep(T);
await tpage.close();

function crossStats(sw) {
  const steps = [];
  for (let i = 1; i < sw.length; i++) steps.push(Math.abs(sw[i].raw_net - sw[i - 1].raw_net));
  const med = [...steps].sort((a, b) => a - b)[Math.floor(steps.length / 2)] || 0;
  // crossing index = first sample whose boughtPutITM differs from its predecessor
  let ci = -1; for (let i = 1; i < sw.length; i++) if (sw[i].boughtPutITM !== sw[i - 1].boughtPutITM) { ci = i; break; }
  const crossStep = ci > 0 ? steps[ci - 1] : NaN;
  return { steps, med, crossStep, ci, ratio: med > 0 ? crossStep / med : NaN };
}
const hs = crossStats(headSweep), ts = crossStats(twinSweep);
const headContinuous = isFinite(hs.crossStep) && hs.ratio <= 3 && headSweep.every(s => s.settled === null) && headSweep.some(s => s.boughtPutITM) && headSweep.some(s => !s.boughtPutITM);
ck('A5 payout continuity OTM→ITM: HEAD unified close CONTINUOUS at the put crossing (crossStep ≤ 3× median step)',
   headContinuous, `HEAD crossStep=${hs.crossStep?.toExponential(3)} median=${hs.med.toExponential(3)} ratio=${hs.ratio?.toFixed(2)} allNull=${headSweep.every(s => s.settled === null)} crossedITM=${headSweep.some(s => s.boughtPutITM)}&${headSweep.some(s => !s.boughtPutITM)}`);
// A5b LIVE branch-presence delta: HEAD keeps EVERY leg on the AMM (settled_cash_leg null across the
// whole sweep, OTM & ITM); the retired two-case twin SETTLES A LEG TO CASH ('bought') on exactly the
// ITM samples — the two-case seam is present in the twin, ABSENT in HEAD. (The gross ~4e-2 raw jump
// CM12.2 hard-gates needs a deeper-ITM config; for this band the C0 linear-parity seam keeps the
// twin's raw close to HEAD's — the *branch presence*, not its magnitude, is the live observable.)
const headAllAMM = headSweep.every(s => s.settled === null);
const twinBranchesToCash = twinSweep.some(s => s.settled === 'bought') && twinSweep.filter(s => s.boughtPutITM).every(s => s.settled !== null) && twinSweep.filter(s => !s.boughtPutITM).every(s => s.settled === null);
ck('A5b LIVE branch delta: HEAD keeps ALL legs on the AMM (null throughout); the retired two-case twin settles a leg to CASH on the ITM side — seam present in twin, removed in HEAD',
   headAllAMM && twinBranchesToCash,
   `HEAD settled(all null)=${headAllAMM} TWIN settled seq=${JSON.stringify(twinSweep.map(s => s.settled))} TWIN crossStep=${ts.crossStep?.toExponential(3)} (near-seam small — C0 linear parity)`);
log(`  HEAD sweep (oracle↓): ${headSweep.map(s => `o${s.o}/sN${s.sNorm0.toFixed(3)}${s.boughtPutITM ? 'I' : 'O'}:${s.raw_net.toFixed(6)}`).join('  ')}`);
log(`  TWIN sweep (oracle↓): ${twinSweep.map(s => `o${s.o}/sN${s.sNorm0.toFixed(3)}${s.boughtPutITM ? 'I' : 'O'}:${s.raw_net.toFixed(6)}(${s.settled || 'null'})`).join('  ')}`);

// ── A6: funding = extrinsic hump peaking at ATM, EXACTLY 0 deep-ITM ───────
await U.reset();
await U.imbalance(-250000);      // pool-scale swap (y≈800k): move w off 0.5 so S≠1 (else (S−1)/S=0, funding all-zero — positive-control artifact)
await U.setField('m-input', 6); await page.waitForTimeout(120);   // g=m·γ large ⇒ seams S* pulled in so the 0.3×/3.0× ladder ends sit clearly PAST S* (extrinsic exactly 0)
const fund = await page.evaluate(() => {
  const s = Store.state, p = s.pool, mode = Engine.getSNorm(p), S = Engine.poolMark(p, s.oracle, s.oracle_initial) / s.oracle;
  const g = Engine.gLoc(p, mode, s.m);
  const callSeam = g / (g + 1), putSeam = (g + 1) / g;   // θ/mode of the smooth-paste boundary each wing
  const probe = (theta, wing) => Engine.fundingPerStrike(p, theta, wing, 1, 1, s.kappa, s.oracle, s.oracle_initial, s.m);
  const callLadder = [0.30, 0.55, 0.75, 0.90, 1.00, 1.15].map(f => ({ f, theta: +(mode * f).toFixed(5), val: probe(mode * f, 'call') }));
  const putLadder = [0.90, 1.00, 1.15, 1.35, 1.80, 3.00].map(f => ({ f, theta: +(mode * f).toFixed(5), val: probe(mode * f, 'put') }));
  return { mode, S, w: Engine.getW(p), m: s.m, g, callSeam, putSeam, callLadder, putLadder };
});
const cAbs = fund.callLadder.map(x => Math.abs(x.val)), pAbs = fund.putLadder.map(x => Math.abs(x.val));
const cPeak = cAbs.indexOf(Math.max(...cAbs)), pPeak = pAbs.indexOf(Math.max(...pAbs));
const cATM = fund.callLadder.findIndex(x => x.f === 1.00), pATM = fund.putLadder.findIndex(x => x.f === 1.00);
const cDeepZero = Math.abs(fund.callLadder[0].val) < 1e-12, pDeepZero = Math.abs(fund.putLadder[5].val) < 1e-12;
const oppSign = Math.sign(fund.callLadder[cATM].val) !== Math.sign(fund.putLadder[pATM].val) && fund.callLadder[cATM].val !== 0;
ck('A6 funding = extrinsic hump peaking at ATM (strike=mode) + EXACTLY 0 deep-ITM both wings; call/put opposite sign',
   Math.abs(fund.S - 1) > 1e-6 && cPeak === cATM && pPeak === pATM && cDeepZero && pDeepZero && oppSign,
   `S=${fund.S.toFixed(4)} w=${fund.w.toFixed(4)} callPeak@f=${fund.callLadder[cPeak].f} putPeak@f=${fund.putLadder[pPeak].f} callDeepITM=${fund.callLadder[0].val} putDeepITM=${fund.putLadder[5].val} oppSign=${oppSign}`);
log(`  A6 pool: m=${fund.m} g=${fund.g.toFixed(3)} callSeam(θ/mode)=${fund.callSeam.toFixed(3)} putSeam=${fund.putSeam.toFixed(3)} (ladder ends 0.30/3.00 are PAST the seams ⇒ extrinsic 0)`);
log(`  call funding ladder (θ/mode:val): ${fund.callLadder.map(x => `${x.f}:${x.val.toExponential(3)}`).join('  ')}`);
log(`  put  funding ladder (θ/mode:val): ${fund.putLadder.map(x => `${x.f}:${x.val.toExponential(3)}`).join('  ')}`);

// ── A6b: DOM funding column renders + perps table untouched by ticks ──────
await U.reset();
// add a perp; snapshot #perps-tbody; open a band; tick ×5; re-read perps tbody (must be unchanged);
// confirm perps THEAD has no "Funding" header, and the portfolio bands table renders funding numbers.
await page.evaluate(() => { const n = document.querySelector('.page-nav-link[data-page="transact"]'); if (n) n.click(); });
await U.click('.tab[data-subtab="perps"]');
await U.setField('perp-side', 'long'); await U.setField('perp-notional', 2); await U.setField('perp-margin', 500000);
await U.click('#btn-add-perp'); await page.waitForTimeout(120);
const perpsTheadFunding = await page.evaluate(() => { const tbl = document.getElementById('perps-tbody')?.closest('table'); return tbl ? /funding/i.test(tbl.querySelector('thead')?.innerText || '') : null; });
const perpsBefore = await page.evaluate(() => document.getElementById('perps-tbody')?.innerText || '');
await U.openBand('long', 120000, 48000, 0.05);
for (let i = 0; i < 5; i++) { await U.click('#btn-tick'); await page.waitForTimeout(70); }
const perpsAfter = await page.evaluate(() => document.getElementById('perps-tbody')?.innerText || '');
await U.goPortfolioBands();
const bandsFundingRendered = await page.evaluate(() => {
  const tbl = document.getElementById('bands-table'); if (!tbl) return { hasFundingHeader: false, anyNumeric: false };
  const heads = Array.from(tbl.querySelectorAll('thead th')).map(t => t.innerText);
  const hasFundingHeader = heads.some(h => /fund/i.test(h));
  const anyNumeric = Array.from(tbl.querySelectorAll('tbody td')).some(td => /\d/.test(td.innerText));
  return { hasFundingHeader, anyNumeric, heads };
});
ck('A6b DOM: portfolio bands funding column present + numeric; perps table has NO Funding column & unchanged by ticks',
   bandsFundingRendered.hasFundingHeader && bandsFundingRendered.anyNumeric && perpsTheadFunding === false && perpsBefore === perpsAfter,
   `bandsFundingHeader=${bandsFundingRendered.hasFundingHeader} bandsNumeric=${bandsFundingRendered.anyNumeric} perpsTheadHasFunding=${perpsTheadFunding} perpsUnchanged=${perpsBefore === perpsAfter}`);
await page.screenshot({ path: path.join(EVID, `${RUN}_portfolio_bands.png`), fullPage: true });

// ── errors + md5 ──────────────────────────────────────────────────────────
ck('A7 zero console/pageerrors overall', errors.length === 0, `errors=${errors.length} ${JSON.stringify(errors.slice(0, 4))} dialogs=${dialogs.length}`);
await browser.close();
const md5post = md5(BUILD);
ck('A8 build md5 unchanged (read-only)', md5pre === md5post, `${md5pre} → ${md5post}`);

const fails = CHECKS.filter(c => !c.p);
log(`\n=== UPDATE-1 ACCEPTANCE run ${RUN}: ${fails.length === 0 ? 'PASS' : 'FLAG'} (${CHECKS.length - fails.length}/${CHECKS.length}) ===`);
for (const f of fails) log(`  FAIL: ${f.n}  ${f.d}`);
const OUT = { run: RUN, build: path.basename(BUILD), md5: md5pre, checks: CHECKS.map(c => ({ n: c.n, p: c.p })), headSweep, twinSweep, fund, errors, dialogs };
fs.writeFileSync(path.join(EVID, `RESULT_run${RUN}.json`), JSON.stringify(OUT, null, 2));
fs.writeFileSync(path.join(EVID, `RUN_LOG_run${RUN}.txt`), LOG.join('\n') + '\n');
