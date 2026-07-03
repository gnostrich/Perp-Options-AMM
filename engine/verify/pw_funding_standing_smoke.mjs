// TRADE-POINT CONSERVATION — STANDING UI SMOKE-PASS (skeptic-ruled HEAD-promotion requirement)
// for the entry-339 build (specs/SPEC_tradepoint_conservation_2026-07-02.md). Derived from
// pw_display_slice_standing_smoke.mjs with ONE expectation update, S4-v2 (documented, not
// patched-toward-green): under the trade-point law an off-ATM band genuinely moves alpha,beta
// (spec §4 delta 2), so the arb equilibrium lean w = alpha/(alpha+sqrt(alpha*beta/oracle)) is no
// longer exactly 1/2 — measured 0.499962 on this build (old law: 0.5 exact; old S4 fails by
// 3.8e-5, the DISCLOSED delta). S4-v2 asserts the honest invariant: arb restores mp == oracle
// (rel <= 1e-9), w visibly moves, re-lean recorded. All other 16 checks byte-inherited.
// Every control exercised in each state; per-click visible delta measured; overlays identified;
// close a band OTM AND close one ITM (settled-to-cash); 0 console errors / 0 pageerrors.
// READ-ONLY on the engine. Run: cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
//   node verify/pw_tradepoint_standing_smoke.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { execSync } from 'child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.resolve(here, '../builds/HEAD_temporal_mvp_v28_lens.html');
const EVID = path.resolve(here, '../../evidence/funding_pnl_column/smoke');  // redirected copy for the 4bc939ec funding-column promoted-HEAD pass (checks byte-inherited)
fs.mkdirSync(EVID, { recursive: true });
const LOG = []; const log = (s) => { LOG.push(s); console.log(s); };
const md5 = (f) => execSync('md5sum ' + f).toString().split(' ')[0];
const CHECKS = []; const ck = (n, p, d) => { CHECKS.push({ n, p, d }); log(`${p?'PASS':'FAIL'} ${n}  ${d}`); };

const md5pre = md5(BUILD);
log(`=== TRADE-POINT STANDING UI SMOKE  build md5 ${md5pre} ===`);
const errors = [], dialogs = [], downloads = [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('console', m => { if (m.type() === 'error') errors.push('console:' + m.text()); });
page.on('pageerror', e => errors.push('pageerror:' + e.message));
page.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });
page.on('download', async d => { downloads.push(d.suggestedFilename()); await d.cancel().catch(()=>{}); });
page.on('filechooser', async fc => { log('filechooser opened (import) — cancelled, no file supplied'); });

await page.goto('file://' + BUILD);
await page.waitForTimeout(600);

const setField = async (id, v) => page.evaluate(({id,v}) => {
  const e = document.getElementById(id); e.value = String(v);
  e.dispatchEvent(new Event('input',  { bubbles:true }));
  e.dispatchEvent(new Event('change', { bubbles:true }));
}, {id,v});
const click = async (sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; e.click(); return true; }, sel);
const txt = async (id) => page.evaluate((i) => (document.getElementById(i)||{}).textContent || '', id);
const snapState = async () => page.evaluate(() => {
  const s = Store.state, p = s.pool, w = Engine.getW(p);
  return { t:s.t, oracle:s.oracle, m:s.m, w, sNorm:Engine.getSNorm(p),
           x:p.x, y:p.y, open:s.bands.filter(b=>b.status==='open').length,
           perps:(s.perps||[]).length, bands:s.bands.length };
});
const canvasHash = async (id) => page.evaluate((cid) => {
  const c = document.getElementById(cid); if (!c) return null;
  return c.toDataURL();
}, id).then(d => d ? crypto.createHash('md5').update(d).digest('hex').slice(0,12) : null);
const canvasCensus = async (id, rgbs) => page.evaluate(({cid, rgbs}) => {
  const c = document.getElementById(cid); if (!c) return null;
  const ctx = c.getContext('2d'); const im = ctx.getImageData(0,0,c.width,c.height).data;
  const out = { nonBlank:0 }; for (const k of Object.keys(rgbs)) out[k] = 0;
  for (let i = 0; i < im.length; i += 4) {
    if (im[i+3] > 0 && (im[i]||im[i+1]||im[i+2])) out.nonBlank++;
    for (const [k, v] of Object.entries(rgbs))
      if (im[i+3] > 200 && im[i]===v[0] && im[i+1]===v[1] && im[i+2]===v[2]) out[k]++;
  }
  return out;
}, { cid:id, rgbs });

// ── S1: boot render — chart-1 + KPIs ──────────────────────────────────────
let st0 = await snapState();
const c1boot = await canvasCensus('canvas-curve', {});
ck('S1 boot: chart-1 renders', !!c1boot && c1boot.nonBlank > 5000, `canvas-curve nonBlank=${c1boot&&c1boot.nonBlank} state=${JSON.stringify(st0)}`);

// ── S2: perp controls (add long, add short, remove one) ───────────────────
await setField('perp-side', 'long'); await setField('perp-notional', 2); await setField('perp-margin', 500000);
await click('#btn-add-perp'); await page.waitForTimeout(120);
let st = await snapState();
const perpLongOk = st.perps === st0.perps + 1;
await setField('perp-side', 'short'); await setField('perp-notional', 1); await setField('perp-margin', 200000);
await click('#btn-add-perp'); await page.waitForTimeout(120);
let st2 = await snapState();
await page.evaluate(() => { const b = document.querySelector('button[data-remove-perp]'); if (b) b.click(); });
await page.waitForTimeout(120);
let st3 = await snapState();
ck('S2 perps: add long + add short + remove (per-click delta)', perpLongOk && st2.perps === st.perps + 1 && st3.perps === st2.perps - 1,
   `perps ${st0.perps}→${st.perps}→${st2.perps}→${st3.perps}`);

// ── S3: open LONG band (both-direction trade #1); w must move (visible delta) ──
await click('.tab[data-subtab="bands"]'); await page.waitForTimeout(100);
await page.evaluate(() => { const p = document.getElementById('band-dir-sell'); if (p.dataset.dir !== 'long') p.click(); });
await setField('sold-inner', 120000); await setField('bought-inner', 48000); await setField('band-notional', 0.03);
await page.waitForTimeout(100);
const wBefore = (await snapState()).w;
await click('#btn-execute'); await page.waitForTimeout(200);
st = await snapState();
const kpiW = await txt('kpi-w');
ck('S3 LONG band executes; w moves (KPI delta)', st.open === 1 && Math.abs(st.w - wBefore) > 1e-6,
   `open=${st.open} w ${wBefore.toFixed(6)}→${st.w.toFixed(6)} kpi-w="${kpiW.trim()}"`);

// ── S4-v2: RUN ARBITRAGE — mp restored to oracle; w re-leans (trade-point law) ──
// Old S4 asserted w→0.5 EXACTLY — true only under the fixed-alpha,beta spot law. The
// entry-339 trade-point law moves alpha,beta on off-ATM opens (spec §4 delta 2), so the
// arb equilibrium lean is beta/alpha-dependent. Honest invariant: |mp/oracle − 1| ≤ 1e-9.
// The residual re-lean |w−0.5| is MEASURED and recorded (disclosed delta, ~3.8e-5 here).
await click('#btn-arb'); await page.waitForTimeout(150);
st2 = await snapState();
const mpPost = await page.evaluate(() => Engine.getMP_raw(Store.state.pool) / Store.state.oracle);
ck('S4-v2 RUN ARBITRAGE: mp → oracle exactly; w re-leans (|w−0.5| = disclosed §4-2 delta)',
   Math.abs(mpPost - 1) < 1e-9 && Math.abs(st2.w - st.w) > 1e-6 && Math.abs(st2.w - 0.5) < 1e-2,
   `mp/oracle=${mpPost} w ${st.w.toFixed(6)}→${st2.w.toFixed(6)} |w−0.5|=${Math.abs(st2.w-0.5).toExponential(3)}`);

// ── S5: ADVANCE TIME — t increments, funding accrues (kpi-t delta) ────────
const tA = await txt('kpi-t');
await click('#btn-tick'); await page.waitForTimeout(150);
st3 = await snapState();
const tB = await txt('kpi-t');
ck('S5 ADVANCE TIME: t delta visible', st3.t === st2.t + 1 && tA !== tB, `t ${st2.t}→${st3.t} kpi "${tA.trim()}"→"${tB.trim()}"`);

// ── S5b: kappa knob — funding rate input accepted ─────────────────────────
await setField('kappa-input', 0.1); await click('#btn-tick'); await page.waitForTimeout(120);
const kap = await page.evaluate(() => ({ k: Store.state.kappa ?? document.getElementById('kappa-input').value, t: Store.state.t }));
ck('S5b kappa-input + second tick', String(kap.k).includes('0.1') && kap.t === st3.t + 1, JSON.stringify(kap));

// ── S6: SLOPE MULT M — clamp [1,6] + per-click chart-2 delta ──────────────
await setField('chart-select', 'pricing'); await page.waitForTimeout(200);
await setField('m-input', 0.1); await page.waitForTimeout(150);
const mLo = await page.evaluate(() => ({ m: Store.state.m, field: document.getElementById('m-input').value }));
const h1 = await canvasHash('canvas-pricing');
await setField('m-input', 10); await page.waitForTimeout(150);
const mHi = await page.evaluate(() => ({ m: Store.state.m, field: document.getElementById('m-input').value }));
const h6 = await canvasHash('canvas-pricing');
await setField('m-input', 3); await page.waitForTimeout(150);
const mMid = await page.evaluate(() => ({ m: Store.state.m, field: document.getElementById('m-input').value }));
const h3 = await canvasHash('canvas-pricing');
ck('S6 M clamp: 0.1→1, 10→6, 3→3', mLo.m === 1 && mLo.field === '1' && mHi.m === 6 && mHi.field === '6' && mMid.m === 3,
   `lo=${JSON.stringify(mLo)} hi=${JSON.stringify(mHi)} mid=${JSON.stringify(mMid)}`);
ck('S6b chart-2 per-click delta (m knob visible)', h1 !== h6 && h6 !== h3 && h1 !== h3, `hash m1=${h1} m6=${h6} m3=${h3}`);
await setField('m-input', 2); await page.waitForTimeout(150);

// ── S7: chart-2 overlays — band markers ON the lensed curve (colors from canon) ──
const cen = await canvasCensus('canvas-pricing', { red:[255,103,103], green:[20,232,0], teal:[10,186,181], pink:[255,133,176] });
ck('S7 chart-2 overlays: red sold dot + green bought dot + both curve arms',
   !!cen && cen.red > 10 && cen.green > 10 && cen.teal > 100 && cen.pink > 100,
   `census=${JSON.stringify(cen)}`);
await page.screenshot({ path: path.join(EVID, 'TP_SMOKE_chart2_band_m2.png'), fullPage: false, clip: await page.evaluate(() => { const r = document.getElementById('canvas-pricing').getBoundingClientRect(); return { x:r.x, y:r.y, width:r.width, height:r.height }; }) });

// ── S8: all chart-select states render ────────────────────────────────────
const chartStates = await page.evaluate(() => Array.from(document.getElementById('chart-select').options).map(o => o.value));
const chartRender = {};
for (const cs of chartStates) {
  await setField('chart-select', cs); await page.waitForTimeout(200);
  for (const cid of ['canvas-curve','canvas-pricing','canvas-payoff','canvas-ratio']) {
    const vis = await page.evaluate((c) => { const e = document.getElementById(c); return e && e.offsetParent !== null; }, cid);
    if (vis) { const cc = await canvasCensus(cid, {}); chartRender[`${cs}:${cid}`] = cc ? cc.nonBlank : null; }
  }
}
ck('S8 every chart state renders non-blank', Object.values(chartRender).every(v => v > 2000),
   JSON.stringify(chartRender));
await setField('chart-select', 'pricing'); await page.waitForTimeout(100);

// ── S9: close the LONG band OTM (settled_cash_leg null) ───────────────────
await page.evaluate(() => { const n = document.querySelector('.page-nav-link[data-page="portfolio"]'); if (n) n.click(); });
await page.evaluate(() => { const t = document.querySelector('.tab[data-subtab-pf="bands"]'); if (t) t.click(); });
await page.waitForTimeout(150);
const preClose = await snapState();
await page.evaluate(() => { const b = document.querySelector('button[data-close-band]'); if (b) b.click(); });
await page.waitForTimeout(200);
const postClose = await page.evaluate(() => {
  const s = Store.state;
  const closed = s.bands.filter(x => x.status !== 'open');
  const last = closed[closed.length - 1] || null;
  return { open: s.bands.filter(x => x.status === 'open').length,
           status: last && last.status,
           settled: last && last.close ? last.close.settled_cash_leg : undefined,
           live_leg: last && last.close ? last.close.live_leg : undefined,
           raw_net: last && last.close ? last.close.raw_net : undefined,
           trader_payout: last && last.close ? last.close.trader_payout : undefined };
});
ck('S9 close band OTM: closes, both legs reversed on AMM (no cash-settled leg)',
   preClose.open === 1 && postClose.open === 0 && postClose.settled === null && isFinite(postClose.raw_net),
   `open ${preClose.open}→${postClose.open} status=${postClose.status} settled_cash_leg=${postClose.settled} live_leg=${postClose.live_leg} raw_net=${postClose.raw_net} trader_payout=${postClose.trader_payout}`);

// ── S10: open SHORT band (both-direction trade #2) ────────────────────────
await page.evaluate(() => { const n = document.querySelector('.page-nav-link[data-page="transact"]'); if (n) n.click(); });
await click('.tab[data-subtab="bands"]'); await page.waitForTimeout(100);
await page.evaluate(() => { const p = document.getElementById('band-dir-sell'); if (p.dataset.dir !== 'short') p.click(); });
await page.waitForTimeout(100);
await setField('sold-inner', 60000); await setField('bought-inner', 100000); await setField('band-notional', 0.02);
await page.waitForTimeout(100);
await click('#btn-execute'); await page.waitForTimeout(200);
st = await snapState();
const shortLegs = await page.evaluate(() => {
  const b = Store.state.bands.filter(x => x.status === 'open')[0];
  if (!b) return null;
  return { dir: (b.entry && b.entry.dir) || b.dir || null,
           sold_inner: b.sold && b.sold.inner, bought_inner: b.bought && b.bought.inner,
           keys: Object.keys(b).join(',') };
});
ck('S10 SHORT band executes (opposite direction)', st.open === 1 && !!shortLegs,
   `open=${st.open} legs=${JSON.stringify(shortLegs)}`);

// ── S11: force deep ITM (oracle 12000: sold-put θ=5) + arb; close → settled-to-cash ──
await setField('kpi-oracle', 12000); await page.waitForTimeout(150);
await click('#btn-arb'); await page.waitForTimeout(150);
await page.evaluate(() => { const n = document.querySelector('.page-nav-link[data-page="portfolio"]'); if (n) n.click(); });
await page.evaluate(() => { const t = document.querySelector('.tab[data-subtab-pf="bands"]'); if (t) t.click(); });
await page.waitForTimeout(200);
await page.screenshot({ path: path.join(EVID, 'TP_SMOKE_deepITM_preclose.png'), fullPage: true });
await page.evaluate(() => { const b = document.querySelector('button[data-close-band]'); if (b) b.click(); });
await page.waitForTimeout(250);
const itmClose = await page.evaluate(() => {
  const s = Store.state;
  const closed = s.bands.filter(x => x.status !== 'open');
  const last = closed[closed.length - 1] || null;
  const c = last && last.close;
  return { open: s.bands.filter(x => x.status === 'open').length, status: last && last.status,
           settled: c ? c.settled_cash_leg : undefined, live_leg: c ? c.live_leg : undefined,
           raw_net: c ? c.raw_net : undefined, trader_payout: c ? c.trader_payout : undefined,
           floored: c ? c.floored : undefined,
           poolFinite: isFinite(s.pool.x) && isFinite(s.pool.y) };
});
await page.waitForTimeout(150);
await page.screenshot({ path: path.join(EVID, 'TP_SMOKE_deepITM_postclose.png'), fullPage: true });
ck('S11 close band deep-ITM: sold-put settled-to-cash, finite',
   itmClose.open === 0 && itmClose.settled === 'sold' && itmClose.live_leg === 'bought' &&
   isFinite(itmClose.raw_net) && isFinite(itmClose.trader_payout) && itmClose.poolFinite,
   `settled_cash_leg=${itmClose.settled} live_leg=${itmClose.live_leg} raw_net=${itmClose.raw_net} trader_payout=${itmClose.trader_payout} floored=${itmClose.floored} poolFinite=${itmClose.poolFinite}`);

// ── S12: export / import / LP / reset ─────────────────────────────────────
await page.evaluate(() => { const n = document.querySelector('.page-nav-link[data-page="transact"]'); if (n) n.click(); });
await click('#btn-export'); await page.waitForTimeout(300);
await click('#btn-import'); await page.waitForTimeout(300);   // filechooser opens; cancelled (no file)
await click('.tab[data-subtab="earn"]'); await page.waitForTimeout(100);
const lpBefore = await page.evaluate(() => ({ y: Store.state.pool.y, x: Store.state.pool.x }));
await setField('lp-amount', 50000);
await click('#btn-lp-deposit'); await page.waitForTimeout(150);
const lpMid = await page.evaluate(() => ({ y: Store.state.pool.y, x: Store.state.pool.x }));
await setField('lp-amount', 20000);
await click('#btn-lp-withdraw'); await page.waitForTimeout(150);
const lpAfter = await page.evaluate(() => ({ y: Store.state.pool.y, x: Store.state.pool.x }));
ck('S12 export + import-chooser + LP deposit/withdraw (per-click deltas)',
   downloads.length >= 0 && lpMid.y > lpBefore.y && lpAfter.y < lpMid.y,
   `download=${JSON.stringify(downloads)} pool.y ${lpBefore.y.toFixed(0)}→${lpMid.y.toFixed(0)}→${lpAfter.y.toFixed(0)}`);
await click('.tab[data-subtab="settings"]'); await page.waitForTimeout(100);
await click('#btn-reset'); await page.waitForTimeout(250);
const stReset = await snapState();
ck('S12b RESET restores boot state', stReset.t === 0 && stReset.open === 0 && Math.abs(stReset.w - 0.5) < 1e-9 && stReset.oracle === 80000,
   JSON.stringify(stReset));

// ── S13: zero errors overall ──────────────────────────────────────────────
ck('S13 zero console errors / zero pageerrors', errors.length === 0, `errors=${errors.length} ${JSON.stringify(errors.slice(0,4))} dialogs=${dialogs.length} ${JSON.stringify(dialogs.slice(0,4))}`);

await browser.close();
const md5post = md5(BUILD);
ck('S14 build md5 unchanged (read-only)', md5pre === md5post, `${md5pre} → ${md5post}`);

const fails = CHECKS.filter(c => !c.p);
log(`\n=== SMOKE VERDICT: ${fails.length === 0 ? 'PASS' : 'FLAG'} (${CHECKS.length - fails.length}/${CHECKS.length}) ===`);
for (const f of fails) log(`  FAIL: ${f.n}  ${f.d}`);
fs.writeFileSync(path.join(EVID, 'TP_SMOKE_RESULT.json'), JSON.stringify({ build: path.basename(BUILD), md5: md5pre, checks: CHECKS, errors, dialogs, downloads }, null, 2));
fs.writeFileSync(path.join(EVID, 'TP_SMOKE_RUN_LOG.txt'), LOG.join('\n') + '\n');
