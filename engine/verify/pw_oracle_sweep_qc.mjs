// QC-ONLY live-browser ORACLE SWEEP — operator entry 286 — READ-ONLY (no engine edit)
// HEAD engine/builds/HEAD_temporal_mvp_v28_lens.html (md5 dd6fb955…)
// GOAL: read the REAL quoted put mark off the running UI (bands-table live "mark" cell
//       c.m, pfComponents L4383 = Engine.markLensed(...)) at spots swept OTM→boundary→ITM.
//       Do NOT trust an analytic recompute of the mark — the cell is the engine's displayed number.
// SETUP: default pool (γ = w/(1−w) = 1 at w=0.5) + SLOPE MULT m=2  ⇒ g_loc = m·γ = 2 exactly.
//   Open a LONG band: sold-call K=$100k (OTM), bought-put K=$60k (OTM), tiny N.
//   Run arbitrage → restores w=0.5 exactly (tradeUpdate preserves α,β), so g=2 / sNorm=1 exact.
//   Sweep the ORACLE (#kpi-oracle, setOracle rebases, w & sNorm invariant): the bought-put's live
//   moneyness S/K = oracle/K_put sweeps OTM→ATM→boundary→deep-ITM while K_put stays $60k (dollars).
// READ per spot from the LIVE DOM bands table: put row K, oracle(=spot S), mark(c.m), value, regime.
//   S/K = spot/K from DISPLAYED dollars. intrinsic = max(1 − S/K, 0). sign(mark − intrinsic).
// Run: cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/pw_oracle_sweep_qc.mjs A
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const RUN = (process.argv[2] || 'A').toUpperCase();
const here = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.resolve(here, '../builds/HEAD_temporal_mvp_v28_lens.html');
const EVID = path.resolve(here, '../../evidence/dexters_lab/oracle_sweep_2026-06-26');
fs.mkdirSync(EVID, { recursive: true });
const LOG = [];
const log = (s) => { LOG.push(s); console.log(s); };
const md5 = (f) => execSync('md5sum ' + f).toString().split(' ')[0];

const K_PUT = 60000;   // fixed dollar strike of the bought-put leg
// sweep spot S (oracle, $) so S/K = oracle/60000 spans OTM → boundary → deep ITM
const SK_TARGETS = [1.50,1.333,1.20,1.10,1.00,0.95,0.90,0.85,0.82,0.80,0.78,0.75,0.70,0.6667,
                    0.60,0.50,0.48,0.46,0.45,0.444,0.43,0.40,0.35,0.30,0.20];
const ORACLES = SK_TARGETS.map(z => Math.round(K_PUT * z));

const errors = [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('console', m => { if (m.type() === 'error') errors.push('console:' + m.text()); });
page.on('pageerror', e => errors.push('pageerror:' + e.message));
const dialogs = [];
page.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });

await page.goto('file://' + BUILD);
await page.waitForTimeout(600);
log(`=== ORACLE SWEEP QC  run ${RUN}  build ${path.basename(BUILD)} ===`);
log(`md5(build)=${md5(BUILD)}`);

// ---- UI drivers (real events only) ----
const setField = async (id, v) => page.evaluate(({id,v}) => {
  const e = document.getElementById(id); e.value = String(v);
  e.dispatchEvent(new Event('input',  { bubbles:true }));
  e.dispatchEvent(new Event('change', { bubbles:true }));
}, {id,v});

// 1) add a LONG perp (band opens against club 'long'); pool untouched (addPerp only adds equity)
await setField('perp-side', 'long');
await setField('perp-notional', 2);
await setField('perp-margin', 500000);
await page.evaluate(() => document.getElementById('btn-add-perp').click());
await page.waitForTimeout(150);

// 2) SLOPE MULT m = 2  → g_loc = m·γ = 2·1 = 2
await setField('m-input', 2);
await page.waitForTimeout(100);

// 3) open a LONG band via the real form: sold-call $100k OTM, bought-put $60k OTM, tiny N
await page.evaluate(() => { const b=document.querySelector('.tab[data-subtab="bands"]'); if(b) b.click(); });
await page.waitForTimeout(120);
await page.evaluate(() => { const dp=document.getElementById('band-dir-sell'); if(dp && dp.dataset.dir!=='long') dp.click(); });
await setField('sold-inner', 100000);
await setField('bought-inner', 60000);
await setField('band-notional', 0.01);
await page.waitForTimeout(120);
const execMsg = await page.evaluate(() => document.getElementById('btn-execute').disabled);
await page.evaluate(() => document.getElementById('btn-execute').click());
await page.waitForTimeout(200);

// 4) run arbitrage → w back to 0.5 exactly (α,β invariant ⇒ unique equilibrium)
await page.evaluate(() => document.getElementById('btn-arb').click());
await page.waitForTimeout(150);

const setup2 = await page.evaluate((KP) => {
  const s = Store.state; const p = s.pool;
  const w = Engine.getW(p), sNorm = Engine.getSNorm(p);
  return { oracle:s.oracle, m:s.m, w, sNorm, gamma:w/(1-w),
           g_loc: Engine.gLoc(p, KP/s.oracle, s.m),
           openBands: s.bands.filter(b=>b.status==='open').length };
}, K_PUT);
log('SETUP after open+arb: ' + JSON.stringify(setup2));
log('btn-execute was disabled at click? ' + execMsg);
log('dialogs so far: ' + JSON.stringify(dialogs));

// ---- reader: pull the live BOUGHT put row cells straight from the DOM bands table ----
const num = (t) => { if(t==null) return NaN; const m=String(t).replace(/[^0-9.\-]/g,''); return parseFloat(m); };
const readPutRow = async () => page.evaluate(() => {
  const rows = Array.from(document.querySelectorAll('#bands-tbody .pf-comp-row'));
  for (const r of rows) {
    const txt = r.textContent || '';
    if (/BOUGHT/i.test(txt) && /put/i.test(txt)) {
      const tds = Array.from(r.querySelectorAll('td')).map(td => (td.textContent||'').trim());
      const markTd = r.querySelector('td[title^="mark"]');
      const regimeTd = r.querySelector('td[title^="effective strike"]');
      return { cell0:tds[0], K:tds[1], oracle:tds[2], effK:tds[3],
               mark: markTd?markTd.textContent.trim():tds[4], value:tds[5],
               regime: regimeTd?regimeTd.textContent.trim():'' };
    }
  }
  return null;
});
const readState = async (KP) => page.evaluate((K)=>{
  const s=Store.state,p=s.pool; const w=Engine.getW(p),sNorm=Engine.getSNorm(p);
  const theta=K/s.oracle;
  return { oracle:s.oracle, w, sNorm, gamma:w/(1-w), theta, g_loc:Engine.gLoc(p,theta,s.m) };
}, KP);

const rows = [];
const shotAt = { 72000:'OTM_SoverK1p20', 40000:'paperSeam_SoverK0p667', 26640:'engineSeam_SoverK0p444', 12000:'deepITM_SoverK0p20' };
for (const ora of ORACLES) {
  await setField('kpi-oracle', ora);
  await page.waitForTimeout(120);
  const put = await readPutRow();
  const st = await readState(K_PUT);
  if (!put) { log(`!! no put row at oracle ${ora}`); continue; }
  const spot = num(put.oracle);            // displayed live oracle = spot S ($)
  const Kdisp = num(put.K);                // displayed strike K ($)
  const markUI = num(put.mark);            // THE quoted mark (displayed c.m)
  const SK = spot / Kdisp;                 // S/K from displayed dollars
  const intrinsic = Math.max(1 - SK, 0);   // true (linear) put exercise payoff
  const diff = markUI - intrinsic;
  const sign = Math.abs(diff) < 5e-5 ? '0' : (diff > 0 ? '+' : '-');
  const linPaper = 1 - SK;                 // paper's linear 1 − S/K (unclamped, for magnitudes)
  rows.push({ oracle:ora, spot, K:Kdisp, SK:+SK.toFixed(4), theta:+st.theta.toFixed(4),
              g_loc:+st.g_loc.toFixed(4), w:+st.w.toFixed(6),
              markUI:+markUI.toFixed(6), intrinsic:+intrinsic.toFixed(6),
              diff:+diff.toFixed(6), sign, regime:put.regime.replace(/\s+/g,' '),
              value:put.value, paper_1_minus_SK:+linPaper.toFixed(6) });
  log(`ora=${ora} S/K=${SK.toFixed(4)} g=${st.g_loc.toFixed(3)} mark=${markUI.toFixed(6)} intr=${intrinsic.toFixed(6)} diff=${diff.toFixed(6)} [${sign}] ${put.regime.replace(/\s+/g,' ')}`);
  if (shotAt[ora]) {
    await page.evaluate(()=>{ const n=document.querySelector('.page-nav-link[data-page="portfolio"]'); if(n)n.click(); });
    await page.evaluate(()=>{ const t=document.querySelector('.tab[data-subtab-pf="bands"]'); if(t)t.click(); });
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(EVID, `${RUN}_${shotAt[ora]}.png`), fullPage:true });
    await page.evaluate(()=>{ const n=document.querySelector('.page-nav-link[data-page="transact"]'); if(n)n.click(); });
    await page.waitForTimeout(80);
  }
}

// ---- empirical seam: where continuation → intrinsic. Continuation put mark ∝ θ (rises as S/K falls),
//      boundary value = 1/(g+1). Detect the S/K at which the reading equals 1/(g+1) and the trend kinks. ----
const g = setup2.g_loc;
const boundaryVal = 1/(g+1);
// nearest reading to the boundary value 1/(g+1)
let seam = null, best = 1e9;
for (const r of rows) { const d=Math.abs(r.markUI - boundaryVal); if (d<best){best=d; seam=r;} }
log(`\nEMPIRICAL SEAM: g=${g.toFixed(4)}, boundary mark 1/(g+1)=${boundaryVal.toFixed(4)}; nearest reading S/K=${seam?seam.SK:'?'} (mark ${seam?seam.markUI:'?'})`);

const summary = {
  build: path.basename(BUILD), md5: md5(BUILD), run: RUN,
  setup: setup2, K_PUT, boundary_mark_1_over_gp1: +boundaryVal.toFixed(6),
  errors, dialogs, rows,
  signs: rows.map(r=>({SK:r.SK, sign:r.sign, diff:r.diff})),
  belowIntrinsic: rows.filter(r=>r.sign==='-').map(r=>({SK:r.SK, diff:r.diff, mark:r.markUI, intr:r.intrinsic})),
};
fs.writeFileSync(path.join(EVID, `RESULT_run${RUN}.json`), JSON.stringify(summary,null,2));
fs.writeFileSync(path.join(EVID, `RUN_LOG_run${RUN}.txt`), LOG.join('\n')+'\n');
log(`\nerrors=${errors.length} dialogs=${dialogs.length}`);
log(`md5(build) after = ${md5(BUILD)}`);
await browser.close();
