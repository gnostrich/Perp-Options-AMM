// PKG-ITM v2 LIVE ACCEPTANCE SWEEP — spec §6 of specs/SPEC_pkg_itm_v2_engine_coords_2026-07-02.md
// (skeptic FLAG-2 discharge protocol; operator entries 286/287/298, trust mandate 299)
// Lineage: engine/verify/pw_oracle_sweep_qc.mjs (entry-286 harness), adapted per spec §6:
//   TWO COLUMNS, each a fresh page: default pool post-arb (w=0.5 ⇒ γ=1, sNorm=1),
//   column 1 SLOPE MULT m=2 ⇒ g_loc=2 (paper g=2 column), column 2 m=6 ⇒ g_loc=6 (paper g=6).
//   Bought-put K=$60,000; oracle swept so S/K runs 1.5 → 0.2 (26 spots incl. both seam
//   neighborhoods ±0.02/±0.005 and the paper cells 0.6667/0.80/0.857/0.90/1.00/1.20).
// ACCEPTANCE IS DOM-READ OUTPUT (spec §6.2): the bands-table MARK cell text, exactly as
//   entry-286 read it — NEVER an analytic recompute of the engine expression.
// Expected values below are the SPEC §6 pinned sandbox numbers (computed from §1.3 by the
//   research-lead), NOT from the engine under test.
// READ-ONLY on the engine. Run: cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
//   node verify/pw_pkg_itm_v2_acceptance.mjs A   (then B; RESULT jsons must be byte-identical)
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const RUN = (process.argv[2] || 'A').toUpperCase();
const here = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.resolve(here, '../builds/HEAD_temporal_mvp_v28_lens.html');
const EVID = path.resolve(here, '../../evidence/pkg_itm_v2_acceptance');
fs.mkdirSync(EVID, { recursive: true });
const LOG = [];
const log = (s) => { LOG.push(s); console.log(s); };
const md5 = (f) => execSync('md5sum ' + f).toString().split(' ')[0];

const K_PUT = 60000;
// S/K targets: paper cells + seam straddles (g=2 seam 2/3: ±0.02 → .6467/.6867, ±0.005 →
// .6617/.6717; g=6 seam 6/7≈0.85714: ±0.02 → .8371/.8771, ±0.005 → .8521/.8621) + wings.
const SK_TARGETS = [1.50, 1.333, 1.20, 1.10, 1.00, 0.95, 0.90,
                    0.8771, 0.8621, 6/7, 0.8521, 0.8371,          // g=6 seam neighborhood
                    0.80, 0.75, 0.70,
                    0.6867, 0.6717, 2/3, 0.6617, 0.6467,          // g=2 seam neighborhood
                    0.60, 0.50, 0.444, 0.40, 0.30, 0.20];
const ORACLES = SK_TARGETS.map(z => Math.round(K_PUT * z));

// ---- SPEC §6 PINNED EXPECTATIONS (sandbox values, 4dp; tol 2e-4 = "3-4dp" + S/K quantization)
const PAPER_CELLS = {
  2: { 90000:0.0658, 72000:0.1029, 60000:0.1481, 57000:0.1642, 54000:0.1829,
       48000:0.2315, 42000:0.3023, 40000:0.3333 },
  6: { 72000:0.0190, 60000:0.0567, 57000:0.0771, 54000:0.1066, 51429:0.1429, 48000:0.2000 },
};
const SEAM = { 2: { oracle:40000, SK:2/3,  boundary:1/3,
                    left:[38802, 39702], right:[41202, 40302],       // [eps~0.02, eps~0.005]
                    qRight:[-0.957, -0.989] },
               6: { oracle:51429, SK:6/7, boundary:1/7,
                    left:[50226, 51126], right:[52626, 51726],
                    qRight:[-0.923, -0.980] } };
const QTOL = 0.03, CELL_TOL = 2e-4;

async function runColumn(browser, mKnob) {
  const errors = [], dialogs = [];
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

  // entry-286 protocol, verbatim order: perp → knob → band(open) → arbitrage
  await setField('perp-side', 'long');
  await setField('perp-notional', 2);
  await setField('perp-margin', 500000);
  await page.evaluate(() => document.getElementById('btn-add-perp').click());
  await page.waitForTimeout(150);
  await setField('m-input', mKnob);
  await page.waitForTimeout(100);
  await page.evaluate(() => { const b=document.querySelector('.tab[data-subtab="bands"]'); if(b) b.click(); });
  await page.waitForTimeout(120);
  await page.evaluate(() => { const dp=document.getElementById('band-dir-sell'); if(dp && dp.dataset.dir!=='long') dp.click(); });
  await setField('sold-inner', 100000);
  await setField('bought-inner', 60000);
  await setField('band-notional', 0.01);
  await page.waitForTimeout(120);
  await page.evaluate(() => document.getElementById('btn-execute').click());
  await page.waitForTimeout(200);
  await page.evaluate(() => document.getElementById('btn-arb').click());
  await page.waitForTimeout(150);

  const setup = await page.evaluate((KP) => {
    const s = Store.state; const p = s.pool;
    const w = Engine.getW(p), sNorm = Engine.getSNorm(p);
    return { oracle:s.oracle, m:s.m, w, sNorm, gamma:w/(1-w),
             g_loc: Engine.gLoc(p, KP/s.oracle, s.m),
             openBands: s.bands.filter(b=>b.status==='open').length };
  }, K_PUT);
  log(`SETUP m=${mKnob}: ` + JSON.stringify(setup));

  const num = (t) => { if(t==null) return NaN; const m=String(t).replace(/[^0-9.\-]/g,''); return parseFloat(m); };
  const readPutRow = async () => page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#bands-tbody .pf-comp-row'));
    for (const r of rows) {
      const txt = r.textContent || '';
      if (/BOUGHT/i.test(txt) && /put/i.test(txt)) {
        const tds = Array.from(r.querySelectorAll('td')).map(td => (td.textContent||'').trim());
        const markTd = r.querySelector('td[title^="mark"]');
        const regimeTd = r.querySelector('td[title^="effective strike"]');
        return { K:tds[1], oracle:tds[2],
                 mark: markTd?markTd.textContent.trim():tds[4], value:tds[5],
                 regime: regimeTd?regimeTd.textContent.trim():'' };
      }
    }
    return null;
  });
  const readState = async (KP) => page.evaluate((K)=>{
    const s=Store.state,p=s.pool; const w=Engine.getW(p),sNorm=Engine.getSNorm(p);
    const theta=K/s.oracle;
    return { oracle:s.oracle, w, sNorm, theta, g_loc:Engine.gLoc(p,theta,s.m) };
  }, KP);

  const seam = SEAM[mKnob === 2 ? 2 : 6];
  const shotAt = mKnob === 2
    ? { 72000:'OTM_SK1p20', 40000:'SEAM_SK0p667', 38802:'seamL02_SK0p647', 26640:'oldseam_SK0p444', 12000:'deepITM_SK0p20' }
    : { 72000:'OTM_SK1p20', 51429:'SEAM_SK0p857', 50226:'seamL02_SK0p837', 12000:'deepITM_SK0p20' };

  const rows = [];
  for (const ora of ORACLES) {
    await setField('kpi-oracle', ora);
    await page.waitForTimeout(120);
    const put = await readPutRow();
    const st = await readState(K_PUT);
    if (!put) { log(`!! no put row at oracle ${ora}`); continue; }
    const spot = num(put.oracle), Kdisp = num(put.K), markUI = num(put.mark);
    const SK = spot / Kdisp;
    const intrinsic = Math.max(1 - SK, 0);
    const diff = markUI - intrinsic;
    const sign = Math.abs(diff) < 5e-5 ? '0' : (diff > 0 ? '+' : '-');
    rows.push({ oracle:ora, spot, K:Kdisp, SK:+SK.toFixed(5),
                g_loc:+st.g_loc.toFixed(4), w:+st.w.toFixed(6), sNorm:+st.sNorm.toFixed(6),
                markUI:+markUI.toFixed(6), intrinsic:+intrinsic.toFixed(6),
                diff:+diff.toFixed(6), sign, regime:put.regime.replace(/\s+/g,' ') });
    log(`m=${mKnob} ora=${ora} S/K=${SK.toFixed(4)} g=${st.g_loc.toFixed(3)} mark=${markUI.toFixed(4)} intr=${intrinsic.toFixed(4)} diff=${diff.toFixed(4)} [${sign}] ${put.regime.replace(/\s+/g,' ')}`);
    if (shotAt[ora]) {
      await page.evaluate(()=>{ const n=document.querySelector('.page-nav-link[data-page="portfolio"]'); if(n)n.click(); });
      await page.evaluate(()=>{ const t=document.querySelector('.tab[data-subtab-pf="bands"]'); if(t)t.click(); });
      await page.waitForTimeout(150);
      await page.screenshot({ path: path.join(EVID, `${RUN}_m${mKnob}_${shotAt[ora]}.png`), fullPage:true });
      await page.evaluate(()=>{ const n=document.querySelector('.page-nav-link[data-page="transact"]'); if(n)n.click(); });
      await page.waitForTimeout(80);
    }
  }
  await page.close();

  // ================= ACCEPTANCE EVALUATION (all vs DOM rows; expected = spec pins) ==========
  const byOra = Object.fromEntries(rows.map(r => [r.oracle, r]));
  const checks = [];
  const ck = (name, pass, detail) => { checks.push({ name, pass, detail }); log(`${pass?'PASS':'FAIL'} [m=${mKnob}] ${name}  ${detail}`); };

  // pin: fixed-g per column at every swept row
  const gBad = rows.filter(r => Math.abs(r.g_loc - mKnob) > 1e-6);
  ck('g_loc pinned = ' + mKnob, gBad.length === 0, `rows=${rows.length} offG=${gBad.length}`);

  // ACCEPT 1 — paper-table reproduction (DOM mark vs pinned cell, tol 2e-4)
  let cellFails = [];
  for (const [oraS, exp] of Object.entries(PAPER_CELLS[mKnob === 2 ? 2 : 6])) {
    const r = byOra[+oraS];
    const got = r ? r.markUI : NaN;
    const ok = r && Math.abs(got - exp) <= CELL_TOL;
    if (!ok) cellFails.push(`ora=${oraS} exp=${exp} got=${got}`);
    log(`  cell m=${mKnob} ora=${oraS} S/K=${r?r.SK:'?'} expected=${exp.toFixed(4)} DOM=${got.toFixed(4)} |d|=${Math.abs(got-exp).toExponential(1)} ${ok?'ok':'FAIL'}`);
  }
  ck('ACCEPT-1 paper cells', cellFails.length === 0, cellFails.join('; ') || 'all cells within 2e-4');

  // ACCEPT 2 — sign table: belowIntrinsic EMPTY; ==0 (4dp) at/below seam; >0 strictly above
  const belowIntrinsic = rows.filter(r => r.sign === '-').map(r => ({SK:r.SK, diff:r.diff, mark:r.markUI, intr:r.intrinsic}));
  const atBelow = rows.filter(r => r.SK <= seam.SK + 1e-9);
  const zeroBad = atBelow.filter(r => Math.abs(r.diff) > 1e-4);
  const strictAbove = rows.filter(r => r.SK >= seam.SK + 0.01 && r.SK <= 1.6);
  const strictBad = strictAbove.filter(r => !(r.diff > 0));
  ck('ACCEPT-2 sign table', belowIntrinsic.length === 0 && zeroBad.length === 0 && strictBad.length === 0,
     `belowIntrinsic=${belowIntrinsic.length} zeroAtBelowSeamBad=${zeroBad.length} strictAboveBad=${strictBad.length}`);

  // ACCEPT 3 — seam value + one-sided DOM difference quotients (spec §6.3)
  const rs = byOra[seam.oracle];
  const seamValOk = rs && Math.abs(rs.markUI - seam.boundary) <= 1e-4;
  ck('ACCEPT-3 seam value 1/(g+1)', !!seamValOk, `DOM=${rs?rs.markUI.toFixed(4):'?'} expected=${seam.boundary.toFixed(4)}`);
  const q = (rA, rB) => (rA.markUI - rB.markUI) / (rA.SK - rB.SK);
  const quotients = {};
  let qOk = true, qDetail = [];
  seam.left.forEach((oraL, i) => {
    const rl = byOra[oraL]; const v = q(rs, rl);
    quotients[`left_eps${i?'005':'02'}`] = +v.toFixed(4);
    const ok = Math.abs(v - (-1.0)) <= QTOL; if (!ok) qOk = false;
    qDetail.push(`qL(${i?'.005':'.02'})=${v.toFixed(3)} exp=-1.000 ${ok?'ok':'FAIL'}`);
  });
  const qr = [];
  seam.right.forEach((oraR, i) => {
    const rr = byOra[oraR]; const v = q(rr, rs);
    quotients[`right_eps${i?'005':'02'}`] = +v.toFixed(4); qr.push(v);
    const ok = Math.abs(v - seam.qRight[i]) <= QTOL; if (!ok) qOk = false;
    qDetail.push(`qR(${i?'.005':'.02'})=${v.toFixed(3)} exp=${seam.qRight[i]} ${ok?'ok':'FAIL'}`);
  });
  const monoOk = Math.abs(qr[1]) > Math.abs(qr[0]);   // → −1 as ε shrinks
  if (!monoOk) qOk = false;
  ck('ACCEPT-3 C1 quotients', qOk, qDetail.join(' | ') + ` | mono→−1=${monoOk}`);

  // ACCEPT 3b — empirical seam ≈ spec seam, NOT 0.444
  let seamLow = null, seamHigh = null;
  for (const r of rows) { if (r.sign === '0' && (seamLow === null || r.SK > seamLow)) seamLow = r.SK; }
  for (const r of [...rows].sort((a,b)=>a.SK-b.SK)) { if (r.sign === '+' ) { seamHigh = r.SK; break; } }
  // nearest DOM reading to the boundary value (entry-286 detector)
  let near = null, best = 1e9;
  for (const r of rows) { const d = Math.abs(r.markUI - seam.boundary); if (d < best) { best = d; near = r; } }
  const seamOk = near && Math.abs(near.SK - seam.SK) < 0.02;
  let notOld444 = true, r444detail = 'n/a (g=6 column)';
  if (mKnob === 2) {
    const r444 = byOra[26640];
    notOld444 = r444 && Math.abs(r444.markUI - r444.intrinsic) <= 1e-4 && Math.abs(r444.markUI - seam.boundary) > 0.1;
    r444detail = `mark@0.444=${r444?r444.markUI.toFixed(4):'?'} (intrinsic ${r444?r444.intrinsic.toFixed(4):'?'}, old boundary 0.3333 REJECTED)`;
  }
  ck('ACCEPT-3 empirical seam', !!(seamOk && notOld444),
     `nearest-to-boundary S/K=${near?near.SK:'?'} (mark ${near?near.markUI.toFixed(4):'?'}); zero-band top=${seamLow} first-strict-plus=${seamHigh}; ${r444detail}`);

  ck('zero errors/dialogs', errors.length === 0, `errors=${errors.length} dialogs=${dialogs.length} ${JSON.stringify(errors.slice(0,3))}${JSON.stringify(dialogs.slice(0,3))}`);

  return { mKnob, g: mKnob, setup, boundary_mark_1_over_gp1:+seam.boundary.toFixed(6),
           rows, checks, errors, dialogs, belowIntrinsic,
           empiricalSeam:{ nearestSK: near?near.SK:null, nearestMark: near?near.markUI:null,
                           zeroBandTop: seamLow, firstStrictPlus: seamHigh },
           quotients };
}

const md5pre = md5(BUILD);
log(`=== PKG-ITM v2 ACCEPTANCE SWEEP  run ${RUN}  build ${path.basename(BUILD)} ===`);
log(`md5(build) pre = ${md5pre}`);
const browser = await chromium.launch({ headless: true });
const col2 = await runColumn(browser, 2);
const col6 = await runColumn(browser, 6);
await browser.close();
const md5post = md5(BUILD);
log(`md5(build) post = ${md5post}  unchanged=${md5pre===md5post}`);

const allChecks = [...col2.checks, ...col6.checks];
const fails = allChecks.filter(c => !c.pass);
const verdict = (fails.length === 0 && md5pre === md5post) ? 'PASS' : 'FLAG';
log(`\n=== SWEEP VERDICT (this run): ${verdict}  (${allChecks.length - fails.length}/${allChecks.length} checks) ===`);
for (const f of fails) log(`  FAIL: [${f.name}] ${f.detail}`);

const summary = { build: path.basename(BUILD), md5: md5pre, md5_post: md5post,
                  spec: 'specs/SPEC_pkg_itm_v2_engine_coords_2026-07-02.md §6',
                  K_PUT, columns: { g2: col2, g6: col6 }, verdict,
                  checks_total: allChecks.length, checks_failed: fails.length };
fs.writeFileSync(path.join(EVID, `RESULT_run${RUN}.json`), JSON.stringify(summary, null, 2));
fs.writeFileSync(path.join(EVID, `RUN_LOG_run${RUN}.txt`), LOG.join('\n') + '\n');
