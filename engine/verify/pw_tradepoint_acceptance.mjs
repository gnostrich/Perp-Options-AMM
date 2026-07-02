// TRADE-POINT CONSERVATION — LIVE ACCEPTANCE (spec §3.2, operator entry 339 / go 377)
// Build under test: builds/HEAD_temporal_mvp_v28_lens.html (expect md5 e148c9b734abdff522c31c56be41fb66)
// READ-ONLY on the engine. Checks (task list from manager):
//   T1  page loads, 0 pageerrors, 3 scripts execute, charts render
//   T2  LIVE-page vm-probe: Engine.tradeUpdateAt({10,10,5,5},1,4) → x=215/22, y=11, w=11/21
//       (+ NOT the naive 22/43; + ρ=1 reduction ≡ tradeUpdate; + ρ=1 keeps α,β steady)
//   T3  open/close sweep BOTH wings, several strikes incl. deep OTM, m=1 and m=2:
//       arc reversal restores (x,y,w,α,β) machine-exact
//   T4  intervening trade: open A, open B, close A → A's own increments net out EXACTLY
//       (x,y,w deltas == −A's arc sums); then close B → pool == original
//   T5  α/β drift readout (iv-alpha / iv-beta): off-ATM trade VISIBLY moves them
//       (disclosed §4-2 delta, measured for the ledger); close returns them ~0;
//       chart-1 re-anchors (hash delta)
//   T6  depth guard at the tx-ray: (a) engine probe — reject sits at the TRADE-POINT
//       depth (tighter than old y−β on the put wing), reason cites "at the tx-ray",
//       no silent cap; (b) UI — warn banner shows the reason, execute disabled,
//       notional field un-mutated
//   T7  per-leg preview animation (framePool): sweep renders multiple distinct frames,
//       s=1 endpoint == Engine.tradeUpdateAt chain over the frozen per-leg {dy,ρ}
//       == window.__previewPool; 0 errors during animation
//   T8  build md5 unchanged pre/post (read-only)
// Run: cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/pw_tradepoint_acceptance.mjs A
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { execSync } from 'child_process';

const RUN = (process.argv[2] || 'A').toUpperCase();
const here = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.resolve(here, '../builds/HEAD_temporal_mvp_v28_lens.html');
const EVID = path.resolve(here, '../../evidence/tradepoint_acceptance');
fs.mkdirSync(EVID, { recursive: true });
const LOG = []; const log = (s) => { LOG.push(s); console.log(s); };
const md5 = (f) => execSync('md5sum ' + f).toString().split(' ')[0];
const CHECKS = []; const ck = (n, p, d) => { CHECKS.push({ n, p, d }); log(`${p?'PASS':'FAIL'} ${n}  ${d}`); };

const md5pre = md5(BUILD);
log(`=== TRADE-POINT ACCEPTANCE run ${RUN}  build md5 ${md5pre} ===`);
const errors = [], dialogs = [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('console', m => { if (m.type() === 'error') errors.push('console:' + m.text()); });
page.on('pageerror', e => errors.push('pageerror:' + e.message));
page.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });

await page.goto('file://' + BUILD);
await page.waitForTimeout(600);

const setField = async (id, v) => page.evaluate(({id,v}) => {
  const e = document.getElementById(id); e.value = String(v);
  e.dispatchEvent(new Event('input',  { bubbles:true }));
  e.dispatchEvent(new Event('change', { bubbles:true }));
}, {id,v});
const click = async (sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; e.click(); return true; }, sel);
const txt = async (id) => page.evaluate((i) => (document.getElementById(i)||{}).textContent || '', id);
const snapPool = async () => page.evaluate(() => {
  const p = Store.state.pool;
  return { x:p.x, y:p.y, alpha:p.alpha, beta:p.beta, w:p.alpha/p.x,
           open:Store.state.bands.filter(b=>b.status==='open').length };
});
const canvasHash = async (id) => page.evaluate((cid) => {
  const c = document.getElementById(cid); return c ? c.toDataURL() : null;
}, id).then(d => d ? crypto.createHash('md5').update(d).digest('hex').slice(0,12) : null);
const canvasNonBlank = async (id) => page.evaluate((cid) => {
  const c = document.getElementById(cid); if (!c) return null;
  const im = c.getContext('2d').getImageData(0,0,c.width,c.height).data;
  let n = 0; for (let i=0;i<im.length;i+=4) if (im[i+3]>0 && (im[i]||im[i+1]||im[i+2])) n++;
  return n;
}, id);
const goPage = async (p) => page.evaluate((pp) => { const n = document.querySelector(`.page-nav-link[data-page="${pp}"]`); if (n) n.click(); }, p);
const openBandUI = async ({dir, sold, bought, N}) => {
  await goPage('transact');
  await click('.tab[data-subtab="bands"]'); await page.waitForTimeout(80);
  await page.evaluate((d) => { const p = document.getElementById('band-dir-sell'); if (p.dataset.dir !== d) p.click(); }, dir);
  await setField('sold-inner', sold); await setField('bought-inner', bought); await setField('band-notional', N);
  await page.waitForTimeout(120);
  await click('#btn-execute'); await page.waitForTimeout(200);
  return page.evaluate(() => {
    const open = Store.state.bands.filter(b => b.status === 'open');
    const b = open[open.length - 1] || null;
    return b ? { id: b.id,
                 soldArc: b.sold && b.sold.arc, boughtArc: b.bought && b.bought.arc } : null;
  });
};
const closeBandUI = async (bandId) => {
  await goPage('portfolio');
  await page.evaluate(() => { const t = document.querySelector('.tab[data-subtab-pf="bands"]'); if (t) t.click(); });
  await page.waitForTimeout(120);
  const clicked = await page.evaluate((id) => {
    const b = document.querySelector(`button[data-close-band="${id}"]`); if (!b) return false; b.click(); return true;
  }, bandId);
  await page.waitForTimeout(200);
  const res = await page.evaluate((id) => {
    const b = Store.state.bands.find(x => x.id === id);
    const c = b && b.close;
    return { status: b && b.status, settled: c ? c.settled_cash_leg : undefined,
             raw_net: c ? c.raw_net : undefined, trader_payout: c ? c.trader_payout : undefined };
  }, bandId);
  return { clicked, ...res };
};

// ── T1: load, scripts, charts ──────────────────────────────────────────────
const boot = await page.evaluate(() => ({
  engine: typeof Engine === 'object' && typeof Engine.tradeUpdateAt === 'function' && typeof Engine.revertArc === 'function',
  store: typeof Store === 'object' && !!Store.state,
  ui: typeof document.getElementById('btn-execute') === 'object',
  oracle: Store.state.oracle, w: Engine.getW(Store.state.pool)
}));
const c1 = await canvasNonBlank('canvas-curve');
await setField('chart-select', 'pricing'); await page.waitForTimeout(250);
const c2 = await canvasNonBlank('canvas-pricing');
ck('T1 load: 3 scripts live (Engine.tradeUpdateAt+revertArc exported), charts render, 0 pageerrors so far',
   boot.engine && boot.store && boot.ui && c1 > 5000 && c2 > 2000 && errors.length === 0,
   `boot=${JSON.stringify(boot)} canvas-curve nonBlank=${c1} canvas-pricing nonBlank=${c2} errors=${errors.length}`);

// ── T2: LIVE-page exhibit probe ────────────────────────────────────────────
const probe = await page.evaluate(() => {
  const s = { x: 10, y: 10, alpha: 5, beta: 5 };
  const r = Engine.tradeUpdateAt(s, 1, 4);
  const w = r ? r.alpha / r.x : NaN;
  // rho=1 reduction vs spot law
  const s2 = { x: 10, y: 800000, alpha: 5, beta: 400000 };
  const a = Engine.tradeUpdateAt(s2, 5000, 1), b = Engine.tradeUpdate(s2, 5000);
  const red = a && b ? Math.max(Math.abs(a.x-b.x)/b.x, Math.abs(a.y-b.y)/b.y, Math.abs(a.alpha-b.alpha)/b.alpha, Math.abs(a.beta-b.beta)/b.beta) : NaN;
  const atmSteady = a ? Math.max(Math.abs(a.alpha - s2.alpha)/s2.alpha, Math.abs(a.beta - s2.beta)/s2.beta) : NaN;
  return { x: r && r.x, y: r && r.y, w, red, atmSteady, srcUnchanged: s.x === 10 && s.alpha === 5 };
});
const X_EXP = 215/22, W_EXP = 11/21, W_NAIVE = 22/43;
ck('T2 exhibit in LIVE page: tradeUpdateAt((10,10,5,5),dy=+1,rho=4) → x=215/22, y=11, w=11/21 (NOT naive 22/43)',
   Math.abs(probe.x - X_EXP) <= 1e-13 && probe.y === 11 && Math.abs(probe.w - W_EXP) <= 1e-15
     && Math.abs(probe.w - W_NAIVE) > 1e-3 && probe.srcUnchanged,
   `x=${probe.x} (exp ${X_EXP}) y=${probe.y} w=${probe.w} (exp ${W_EXP}=${(11/21).toFixed(9)}; naive ${(22/43).toFixed(6)}) input-unmutated=${probe.srcUnchanged}`);
ck('T2b rho=1 reduces EXACTLY to spot tradeUpdate; ATM keeps alpha,beta steady',
   probe.red <= 1e-14 && probe.atmSteady <= 1e-14,
   `maxRel(reduction)=${probe.red} maxRel(alpha,beta drift @rho=1)=${probe.atmSteady}`);

// ── T3: open/close sweep both wings, several strikes, m=1 and m=2 ─────────
const SWEEP = [
  { name: 'L1 long call120k/put48k m=1',        m: 1, dir: 'long',  sold: 120000, bought: 48000,  N: 0.03 },
  { name: 'S1 short put60k/call100k m=1',       m: 1, dir: 'short', sold: 60000,  bought: 100000, N: 0.02 },
  { name: 'L2 long DEEP call200k/put20k m=2',   m: 2, dir: 'long',  sold: 200000, bought: 20000,  N: 0.02 },
  { name: 'S2 short DEEP put30k/call180k m=2',  m: 2, dir: 'short', sold: 30000,  bought: 180000, N: 0.01 },
  { name: 'L3 long nearATM call90k/put70k m=2', m: 2, dir: 'long',  sold: 90000,  bought: 70000,  N: 0.02 },
];
const sweepRows = [];
for (const cfg of SWEEP) {
  await setField('m-input', cfg.m); await page.waitForTimeout(100);
  const pre = await snapPool();
  const ob = await openBandUI(cfg);
  const mid = await snapPool();
  if (!ob) { sweepRows.push({ name: cfg.name, FAIL: 'band did not open', pre, mid }); continue; }
  const cl = await closeBandUI(ob.id);
  const post = await snapPool();
  const res = { dx: Math.abs(post.x - pre.x), dy: Math.abs(post.y - pre.y),
                dw: Math.abs(post.w - pre.w), dal: Math.abs(post.alpha - pre.alpha), dbe: Math.abs(post.beta - pre.beta) };
  const openMoved = Math.abs(mid.w - pre.w) > 1e-9 && Math.abs(mid.alpha - pre.alpha) > 0;
  sweepRows.push({ name: cfg.name, openDeltaW: mid.w - pre.w, openDeltaAlpha: mid.alpha - pre.alpha,
                   residuals: res, settled: cl.settled, raw_net: cl.raw_net, openMoved,
                   ok: cl.status === 'closed' && cl.settled === null && isFinite(cl.raw_net) &&
                       res.dx <= 1e-9 && res.dy <= 1e-9 && res.dw <= 1e-12 && res.dal <= 1e-9 && res.dbe <= 1e-6 });
}
ck('T3 open/close sweep: 5 bands (both wings, deep OTM, m=1+m=2) all restore (x,y,w,alpha,beta) via arc reversal',
   sweepRows.length === 5 && sweepRows.every(r => r.ok),
   sweepRows.map(r => `${r.name}: openΔw=${r.openDeltaW && r.openDeltaW.toExponential(3)} resid dx=${r.residuals && r.residuals.dx} dy=${r.residuals && r.residuals.dy} dw=${r.residuals && r.residuals.dw} dα=${r.residuals && r.residuals.dal} dβ=${r.residuals && r.residuals.dbe} settled=${r.settled} ok=${r.ok}`).join(' | '));
ck('T3b every off-ATM open VISIBLY re-leans w AND moves alpha (trade-point law live)',
   sweepRows.every(r => r.openMoved),
   sweepRows.map(r => `${r.name}: Δw=${r.openDeltaW && r.openDeltaW.toExponential(3)} Δα=${r.openDeltaAlpha && r.openDeltaAlpha.toExponential(3)}`).join(' | '));

// ── T4: intervening trade — undo-own-increment semantics ──────────────────
await setField('m-input', 1); await page.waitForTimeout(100);
const t4pre = await snapPool();
const bandA = await openBandUI({ dir: 'long', sold: 120000, bought: 48000, N: 0.03 });
const t4afterA = await snapPool();
const bandB = await openBandUI({ dir: 'short', sold: 60000, bought: 100000, N: 0.02 });
const t4afterB = await snapPool();
const arcsA = await page.evaluate((id) => {
  const b = Store.state.bands.find(x => x.id === id);
  return { dxA: b.sold.arc.dxA + b.bought.arc.dxA, dyA: b.sold.arc.dyA + b.bought.arc.dyA,
           dwA: b.sold.arc.dwA + b.bought.arc.dwA };
}, bandA.id);
const clA = await closeBandUI(bandA.id);
const t4afterCloseA = await snapPool();
const netOut = {
  x: Math.abs((t4afterB.x - t4afterCloseA.x) - arcsA.dxA),
  y: Math.abs((t4afterB.y - t4afterCloseA.y) - arcsA.dyA),
  w: Math.abs((t4afterB.w - t4afterCloseA.w) - arcsA.dwA),
};
const nanFree = [t4afterCloseA.x, t4afterCloseA.y, t4afterCloseA.alpha, t4afterCloseA.beta].every(isFinite);
ck('T4 close WITH intervening trade: succeeds, no NaN, own increments net out EXACTLY (pool keeps B\'s moves)',
   clA.status === 'closed' && isFinite(clA.raw_net) && nanFree &&
   netOut.x <= 1e-9 && netOut.y <= 1e-9 && netOut.w <= 1e-12,
   `A arcs Σ(dxA,dyA,dwA)=(${arcsA.dxA.toExponential(4)},${arcsA.dyA},${arcsA.dwA.toExponential(4)}) net-out resid x=${netOut.x} y=${netOut.y} w=${netOut.w} raw_net=${clA.raw_net} errors=${errors.length}`);
const clB = await closeBandUI(bandB.id);
const t4final = await snapPool();
const backRes = { x: Math.abs(t4final.x - t4pre.x), y: Math.abs(t4final.y - t4pre.y), w: Math.abs(t4final.w - t4pre.w) };
ck('T4b closing B too returns the pool to the original state (additivity)',
   clB.status === 'closed' && backRes.x <= 1e-9 && backRes.y <= 1e-9 && backRes.w <= 1e-12,
   `resid x=${backRes.x} y=${backRes.y} w=${backRes.w}`);

// ── T5: alpha/beta drift readout + chart-1 re-anchor ───────────────────────
await goPage('transact');
const ivBefore = { a: (await txt('iv-alpha')).trim(), b: (await txt('iv-beta')).trim() };
const chart1Before = await canvasHash('canvas-curve');
const driftBand = await openBandUI({ dir: 'long', sold: 120000, bought: 48000, N: 0.03 });
await goPage('transact'); await page.waitForTimeout(150);
const ivAfter = { a: (await txt('iv-alpha')).trim(), b: (await txt('iv-beta')).trim() };
const driftNum = await page.evaluate(() => {
  const s = Store.state;
  return { alpha_drift: s.pool.alpha - s._baseline_alpha, beta_drift: s.pool.beta - s._baseline_beta };
});
const chart1After = await canvasHash('canvas-curve');
await page.screenshot({ path: path.join(EVID, `${RUN}_drift_readout.png`), fullPage: true });
const clDrift = await closeBandUI(driftBand.id);
await goPage('transact'); await page.waitForTimeout(150);
const ivClosed = { a: (await txt('iv-alpha')).trim(), b: (await txt('iv-beta')).trim() };
const driftClosed = await page.evaluate(() => {
  const s = Store.state;
  return { alpha_drift: s.pool.alpha - s._baseline_alpha, beta_drift: s.pool.beta - s._baseline_beta };
});
ck('T5 iv-alpha/iv-beta VISIBLY move on off-ATM open (disclosed §4-2 delta, measured) and return ~0 on close',
   ivAfter.a !== ivBefore.a && ivAfter.b !== ivBefore.b &&
   Math.abs(driftNum.alpha_drift) > 1e-6 && Math.abs(driftNum.beta_drift) > 1e-2 &&
   Math.abs(driftClosed.alpha_drift) <= 1e-9 && Math.abs(driftClosed.beta_drift) <= 1e-6,
   `iv-alpha "${ivBefore.a}"→"${ivAfter.a}"→closed "${ivClosed.a}" (num ${driftNum.alpha_drift.toExponential(4)}→${driftClosed.alpha_drift.toExponential(4)}); ` +
   `iv-beta "${ivBefore.b}"→"${ivAfter.b}"→closed "${ivClosed.b}" (num ${driftNum.beta_drift.toExponential(4)}→${driftClosed.beta_drift.toExponential(4)})`);
ck('T5b chart-1 re-anchors on off-ATM trade (hash delta)', chart1Before !== chart1After,
   `hash ${chart1Before}→${chart1After}`);

// ── T6: depth guard at the tx-ray ──────────────────────────────────────────
const guard = await page.evaluate(() => {
  const s0 = Store.state.pool;
  const s = { x: s0.x, y: s0.y, alpha: s0.alpha, beta: s0.beta };
  const oracle = Store.state.oracle;
  const oldDepth = s.y - s.beta;
  const w0 = s.alpha / s.x;
  // sell-put chosen theta=0.5, m=2 ⇒ rho=0.25 ⇒ trade-point depth = w·y·rho^w
  const rho = Math.pow(0.5, 2);
  const newDepth = w0 * s.y * Math.pow(rho, w0);
  const N = 10; // N·K_tx = 10·0.25·oracle = 200000 — over 0.9·newDepth, UNDER 0.9·oldDepth
  const r = Engine.executeLeg(s, 'sell', 'put', 0.5, NaN, N, oracle, 2);
  const cash = N * rho * oracle;
  return { oldDepth, newDepth, cash, rejected: !!(r && r.rejected), reason: r && r.reason,
           poolUnmoved: s.x === s0.x && s.y === s0.y };
});
ck('T6a engine depth guard: put-wing cash-out rejects at TRADE-POINT depth (tighter than old y−beta), honest reason',
   guard.rejected && /at the tx-ray/.test(guard.reason || '') &&
   guard.cash < 0.9 * guard.oldDepth && guard.cash >= 0.9 * guard.newDepth,
   `cash=$${guard.cash} newDepth=$${guard.newDepth} (0.9×=${0.9*guard.newDepth}) oldDepth=$${guard.oldDepth} (0.9×=${0.9*guard.oldDepth}) reason="${guard.reason}"`);
await setField('m-input', 2); await page.waitForTimeout(100);
await goPage('transact'); await click('.tab[data-subtab="bands"]'); await page.waitForTimeout(80);
await page.evaluate(() => { const p = document.getElementById('band-dir-sell'); if (p.dataset.dir !== 'short') p.click(); });
await setField('sold-inner', 40000); await setField('bought-inner', 100000); await setField('band-notional', 10);
await page.waitForTimeout(200);
const uiGuard = await page.evaluate(() => ({
  warn: (document.getElementById('warn-area') || {}).textContent || '',
  execDisabled: (document.getElementById('btn-execute') || {}).disabled,
  notionalField: (document.getElementById('band-notional') || {}).value,
  open: Store.state.bands.filter(b => b.status === 'open').length
}));
await page.screenshot({ path: path.join(EVID, `${RUN}_depth_guard.png`), fullPage: false });
ck('T6b UI depth guard: warn banner cites tx-ray depth, execute disabled, notional NOT silently capped, no band opened',
   /at the tx-ray/.test(uiGuard.warn) && uiGuard.execDisabled === true &&
   uiGuard.notionalField === '10' && uiGuard.open === 0,
   `warn="${uiGuard.warn.trim().slice(0,140)}" execDisabled=${uiGuard.execDisabled} notional="${uiGuard.notionalField}" open=${uiGuard.open}`);
await setField('band-notional', 0.02); await page.waitForTimeout(150);

// ── T7: per-leg preview animation (framePool path) ─────────────────────────
await setField('m-input', 1); await page.waitForTimeout(100);
await setField('chart-select', 'pricing'); await page.waitForTimeout(250);
await page.evaluate(() => { const p = document.getElementById('band-dir-sell'); if (p.dataset.dir !== 'long') p.click(); });
await setField('sold-inner', 130000); await setField('bought-inner', 40000);
const errsBeforeAnim = errors.length;
await setField('band-notional', 0.4);   // stages a NEW preview → triggers the sweep
const hashes = [];
for (let i = 0; i < 16; i++) { hashes.push(await canvasHash('canvas-pricing')); await page.waitForTimeout(70); }
const distinct = new Set(hashes).size;
const endpoint = await page.evaluate(() => {
  const pb = window.__previewBand, pp = window.__previewPool;
  if (!pb || !pb.legs || pb.legs.length !== 2 || !pp) return null;
  let pool = Store.state.pool;
  for (const l of pb.legs) pool = Engine.tradeUpdateAt(pool, l.dy, l.rho);
  const rel = (a, b) => Math.abs(a - b) / Math.max(1e-12, Math.abs(b));
  return { legs: pb.legs, chainMatches: pool ? Math.max(rel(pool.x, pp.x), rel(pool.y, pp.y), rel(pool.alpha, pp.alpha), rel(pool.beta, pp.beta)) : NaN,
           previewW: pp.alpha / pp.x, legsFinite: pb.legs.every(l => isFinite(l.dy) && isFinite(l.rho) && l.rho > 0) };
});
await page.screenshot({ path: path.join(EVID, `${RUN}_preview_endstate.png`), fullPage: false });
ck('T7 preview animation: multi-frame sweep renders, per-leg {dy,rho} frozen+finite, s=1 endpoint == tradeUpdateAt chain == __previewPool, no errors',
   distinct >= 4 && endpoint && endpoint.legsFinite && endpoint.chainMatches <= 1e-12 && errors.length === errsBeforeAnim,
   `distinct-frames=${distinct}/16 legs=${endpoint && JSON.stringify(endpoint.legs.map(l=>({dy:+l.dy.toFixed(2),rho:+l.rho.toFixed(6)})))} chainRel=${endpoint && endpoint.chainMatches} previewW=${endpoint && endpoint.previewW} animErrors=${errors.length - errsBeforeAnim}`);
// clear preview
await setField('band-notional', ''); await setField('sold-inner', ''); await setField('bought-inner', ''); await page.waitForTimeout(150);

// ── zero errors overall ────────────────────────────────────────────────────
ck('T-ERR zero console errors / zero pageerrors overall', errors.length === 0,
   `errors=${errors.length} ${JSON.stringify(errors.slice(0,4))} dialogs=${dialogs.length}`);

await browser.close();
const md5post = md5(BUILD);
ck('T8 build md5 unchanged (read-only)', md5pre === md5post, `${md5pre} → ${md5post}`);

const fails = CHECKS.filter(c => !c.p);
log(`\n=== TRADE-POINT ACCEPTANCE run ${RUN} VERDICT: ${fails.length === 0 ? 'PASS' : 'FLAG'} (${CHECKS.length - fails.length}/${CHECKS.length}) ===`);
for (const f of fails) log(`  FAIL: ${f.n}  ${f.d}`);
fs.writeFileSync(path.join(EVID, `RESULT_run${RUN}.json`),
  JSON.stringify({ run: RUN, build: path.basename(BUILD), md5: md5pre, checks: CHECKS, errors, dialogs }, null, 2));
fs.writeFileSync(path.join(EVID, `RUN_LOG_run${RUN}.txt`), LOG.join('\n') + '\n');
