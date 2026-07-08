// FUNDING = SAME-SLOPE DEVIATION (PLACEHOLDER) — LIVE ACCEPTANCE (tester, focused)
// HEAD abd35f4b of bb2f8230. Funding-only change (closeBand UNTOUCHED). Verifies the LIVE layer:
//  A1 load: 0 pageerrors, 3 scripts run (Engine+Store), charts render, Engine.fundingPerStrike present.
//  A2 placeholder LABEL renders live: header th text + full title on hover + units-note placeholder sentence.
//  A3 live funding profile (vm-in-page, the SHIPPED Engine.fundingPerStrike):
//       LEANED pool (w!=1/2) — OTM lobe fading to ZERO at the money, ZERO in-the-money, put-/call+ mirror.
//       SYMMETRIC pool (w=1/2) — ZERO at every strike (pool-lean signature). Strikes chosen off getSNorm mode.
//  A4 perps table untouched by the funding change (thead has no Funding col; #perps-tbody stable across ticks).
//  A5 build md5 unchanged pre/post; run label A/B for byte-stability (run twice via CLI arg).
// READ-ONLY on the engine. Run: cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
//   NODE_PATH=/opt/node22/lib/node_modules node verify/pw_funding_sameslope_acceptance.mjs A
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const RUN = process.argv[2] || 'A';
const here = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.resolve(here, '../builds/HEAD_temporal_mvp_v28_lens.html');
const EVID = path.resolve(here, '../../evidence/funding_sameslope_acceptance');
fs.mkdirSync(EVID, { recursive: true });
const LOG = []; const log = (s) => { LOG.push(s); console.log(s); };
const md5 = (f) => execSync('md5sum ' + f).toString().split(' ')[0];
const CHECKS = []; const ck = (n, p, d) => { CHECKS.push({ n, p, d }); log(`${p?'PASS':'FAIL'} ${n}  ${d}`); };

const md5pre = md5(BUILD);
log(`=== FUNDING SAME-SLOPE PLACEHOLDER — LIVE ACCEPTANCE  run ${RUN}  build md5 ${md5pre} ===`);
const errors = [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('console', m => { if (m.type() === 'error') errors.push('console:' + m.text()); });
page.on('pageerror', e => errors.push('pageerror:' + e.message));
await page.goto('file://' + BUILD);
await page.waitForTimeout(600);

// ── A1: load / exports / charts ───────────────────────────────────────────
const boot = await page.evaluate(() => {
  // NOTE: Engine is a lexical script global, NOT a window property — probe the
  // bare identifier (window.Engine is undefined even though Engine works). Fixed
  // reader, not engine: A3 calls Engine.fundingPerStrike directly and it returns.
  const out = { engine: typeof Engine, store: typeof Store,
    fundingPerStrike: typeof Engine.fundingPerStrike,
    markLensed: typeof Engine.markLensed,
    closeBand: typeof Engine.closeBand,
    getSNorm: typeof Engine.getSNorm };
  const c = document.getElementById('canvas-curve');
  if (c) { const ctx = c.getContext('2d'); const im = ctx.getImageData(0,0,c.width,c.height).data;
    let nb = 0; for (let i = 0; i < im.length; i += 4) if (im[i+3] > 0 && (im[i]||im[i+1]||im[i+2])) nb++;
    out.curveNonBlank = nb; }
  return out;
});
ck('A1 load: Engine+Store objects, fundingPerStrike present, chart-1 renders',
   boot.engine === 'object' && boot.store === 'object' && boot.fundingPerStrike === 'function' &&
   boot.closeBand === 'function' && boot.curveNonBlank > 5000,
   `Engine=${boot.engine} Store=${boot.store} fundingPerStrike=${boot.fundingPerStrike} closeBand=${boot.closeBand} getSNorm=${boot.getSNorm} curveNonBlank=${boot.curveNonBlank}`);

// ── A2: placeholder LABEL renders live (R6 / gate condition) ──────────────
// Navigate to portfolio bands so the bands-table thead + pf-units-note are in the layout.
await page.evaluate(() => { const n = document.querySelector('.page-nav-link[data-page="portfolio"]'); if (n) n.click(); });
await page.evaluate(() => { const t = document.querySelector('.tab[data-subtab-pf="bands"]'); if (t) t.click(); });
await page.waitForTimeout(200);
const label = await page.evaluate(() => {
  // find the bands-table thead th whose text starts with "Funding"
  const tbody = document.getElementById('bands-tbody');
  const table = tbody ? tbody.closest('table') : null;
  const ths = table ? Array.from(table.querySelectorAll('thead th')) : [];
  const fth = ths.find(th => /Funding/i.test(th.textContent));
  const note = document.querySelector('.pf-units-note');
  return { header: fth ? fth.textContent.trim() : null,
           title:  fth ? (fth.getAttribute('title') || '') : null,
           noteText: note ? note.textContent.replace(/\s+/g, ' ').trim() : null,
           noteVisible: note ? (note.offsetParent !== null) : false };
});
const headerOk = label.header === 'Funding (lean; TBD)';
const titleOk  = /PLACEHOLDER/.test(label.title) && /same-slope pool-vs-anchor/i.test(label.title) &&
                 /formula TBD, update-2/i.test(label.title) && /\+ = line received/.test(label.title);
const noteOk   = /PLACEHOLDER/.test(label.noteText) && /same-slope pool-vs-anchor/i.test(label.noteText) &&
                 /LEAN \(deviation\)/i.test(label.noteText) && /formula is TBD \(update-2\)/i.test(label.noteText) &&
                 label.noteVisible;
ck('A2a header th reads exactly "Funding (lean; TBD)" (not "Funding P/L")', headerOk, `header="${label.header}"`);
ck('A2b full-title disclosure on hover carries PLACEHOLDER / same-slope pool-vs-anchor / formula TBD, update-2', titleOk, `title="${label.title}"`);
ck('A2c units-note carries the PLACEHOLDER same-slope LEAN (deviation)…formula TBD (update-2) sentence, VISIBLE', noteOk, `noteVisible=${label.noteVisible} note="${label.noteText}"`);

// ── A3: live funding profile via the SHIPPED Engine.fundingPerStrike (vm-in-page) ──
// pool object: {x, y, alpha} ; w=alpha/x ; mode=getSNorm=(1-w)/w ; g=gLoc=m*gamma, gamma=w/(1-w) ; gA=m.
// Strikes are chosen as multiples of the pool's ACTUAL mode (getSNorm), NOT 1.0.
const profile = await page.evaluate(() => {
  const mkPool = (w) => ({ x: 10, y: 800000, alpha: w * 10 });
  const kappa = 1, N = 1, dt = 1, oracle = 80000, oI = 80000;
  const scan = (w, m) => {
    const p = mkPool(w);
    const mode = Engine.getSNorm(p);
    const g = Engine.gLoc(p, mode, m);
    // ladder of moneyness ratios rho = theta/mode
    const rungs = [0.25, 0.5, 0.8, 0.95, 1.0, 1.05, 1.25, 2.0, 4.0];
    const rows = rungs.map(r => {
      const theta = r * mode;
      return { rho: r, theta,
        call: Engine.fundingPerStrike(p, theta, 'call', N, dt, kappa, oracle, oI, m),
        put:  Engine.fundingPerStrike(p, theta, 'put',  N, dt, kappa, oracle, oI, m) };
    });
    return { w, m, mode, gamma: w/(1-w), g, rows };
  };
  return { leaned: scan(0.30, 6), symmetric: scan(0.5, 6), symMid: scan(0.5, 3) };
});

// LEANED pool assertions: mode = getSNorm != 1 (w=0.30 -> mode = 0.7/0.3 = 2.3333)
const L = profile.leaned;
const at = (rho, wing) => { const r = L.rows.find(x => Math.abs(x.rho - rho) < 1e-9); return r ? r[wing] : NaN; };
// call OTM = theta > mode (rho>1); call ITM = theta < mode (rho<1); ATM = rho=1
const callATM = at(1.0, 'call'), putATM = at(1.0, 'put');
const callOTM = [at(1.05,'call'), at(1.25,'call'), at(2.0,'call'), at(4.0,'call')];
const callITM = [at(0.25,'call'), at(0.5,'call'), at(0.8,'call'), at(0.95,'call')];
const putOTM  = [at(0.95,'put'),  at(0.8,'put'),  at(0.5,'put'),  at(0.25,'put')];
const putITM  = [at(1.05,'put'),  at(1.25,'put'), at(2.0,'put'),  at(4.0,'put')];
const modeOff1 = Math.abs(L.mode - 1.0) > 0.1;                         // mode is NOT 1
const atmZero  = Math.abs(callATM) < 1e-12 && Math.abs(putATM) < 1e-12; // zero at the money
const callOTMnz = callOTM.every(v => v > 0);                           // call OTM lobe positive (+g)
const putOTMnz  = putOTM.every(v => v < 0);                            // put OTM lobe negative (-g)
const callITMz  = callITM.every(v => Math.abs(v) < 1e-12);             // zero ITM (call)
const putITMz   = putITM.every(v => Math.abs(v) < 1e-12);              // zero ITM (put)
// fading to zero at the money: |funding| monotone decreasing toward the mode from OTM side
const callFades = at(4.0,'call') > at(2.0,'call') && at(2.0,'call') > at(1.25,'call') && at(1.25,'call') > at(1.05,'call') && at(1.05,'call') > 0;
const putFades  = Math.abs(at(0.25,'put')) > Math.abs(at(0.5,'put')) && Math.abs(at(0.5,'put')) > Math.abs(at(0.8,'put')) && Math.abs(at(0.8,'put')) > Math.abs(at(0.95,'put')) && Math.abs(at(0.95,'put')) > 0;
// mirror: put OTM at rho=r equals -(call OTM at rho=1/r) in magnitude? sign-mirror check: call+ / put- opposite sign
const signMirror = callOTM.every(v => v > 0) && putOTM.every(v => v < 0);

ck('A3a LEANED pool mode = getSNorm (NOT 1.0)', modeOff1, `w=${L.w} mode(getSNorm)=${L.mode.toFixed(6)} gamma=${L.gamma.toFixed(6)} g_loc=${L.g.toFixed(6)}`);
ck('A3b LEANED: funding = 0 at the money (rho=1)', atmZero, `call@ATM=${callATM} put@ATM=${putATM}`);
ck('A3c LEANED: OTM lobe nonzero — call +g, put -g (opposite sign)', callOTMnz && putOTMnz && signMirror,
   `callOTM=[${callOTM.map(v=>v.toExponential(3))}] putOTM=[${putOTM.map(v=>v.toExponential(3))}]`);
ck('A3d LEANED: OTM lobe FADES to zero toward the money (monotone)', callFades && putFades,
   `call ${at(4.0,'call').toExponential(3)}>${at(2.0,'call').toExponential(3)}>${at(1.25,'call').toExponential(3)}>${at(1.05,'call').toExponential(3)} | put |.| ${Math.abs(at(0.25,'put')).toExponential(3)}>${Math.abs(at(0.5,'put')).toExponential(3)}>${Math.abs(at(0.8,'put')).toExponential(3)}>${Math.abs(at(0.95,'put')).toExponential(3)}`);
ck('A3e LEANED: ZERO in-the-money (both wings)', callITMz && putITMz,
   `callITM=[${callITM.map(v=>v.toExponential(2))}] putITM=[${putITM.map(v=>v.toExponential(2))}]`);

// SYMMETRIC pool assertions: ZERO at every strike (pool-lean signature, killer FS.2b)
const S = profile.symmetric, S3 = profile.symMid;
const symAllZero = S.rows.every(r => Math.abs(r.call) < 1e-12 && Math.abs(r.put) < 1e-12) &&
                   S3.rows.every(r => Math.abs(r.call) < 1e-12 && Math.abs(r.put) < 1e-12);
ck('A3f SYMMETRIC pool (w=1/2): funding = 0 at EVERY strike, both wings, m=6 AND m=3 (lean signature)',
   symAllZero && Math.abs(S.mode - 1.0) < 1e-12,
   `mode=${S.mode} sample call/put @rho2.0 m6=(${S.rows.find(r=>r.rho===2.0).call},${S.rows.find(r=>r.rho===2.0).put}) @rho0.5 m6=(${S.rows.find(r=>r.rho===0.5).call},${S.rows.find(r=>r.rho===0.5).put})`);

// record the numeric ladders
fs.writeFileSync(path.join(EVID, `PROFILE_run${RUN}.json`), JSON.stringify(profile, null, 2));

// ── A4: perps table untouched by the funding change ───────────────────────
await page.evaluate(() => { const n = document.querySelector('.page-nav-link[data-page="transact"]'); if (n) n.click(); });
await page.waitForTimeout(120);
const perps = await page.evaluate(() => {
  const tb = document.getElementById('perps-tbody');
  const table = tb ? tb.closest('table') : null;
  const headers = table ? Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim()) : [];
  return { headers, hasFundingCol: headers.some(h => /Funding/i.test(h)), tbody: tb ? tb.innerText : null };
});
// tick a couple of times, confirm perps tbody stable
await page.evaluate(() => { const n = document.querySelector('.page-nav-link[data-page="transact"]'); if (n) n.click(); });
for (let i = 0; i < 3; i++) { await page.evaluate(() => { const b = document.getElementById('btn-tick'); if (b) b.click(); }); await page.waitForTimeout(80); }
const perps2 = await page.evaluate(() => { const tb = document.getElementById('perps-tbody'); return tb ? tb.innerText : null; });
ck('A4 perps table has NO Funding column and #perps-tbody unchanged across 3 ticks',
   !perps.hasFundingCol && perps.tbody === perps2,
   `perpsHeaders=[${perps.headers.join(' | ')}] tbodyStable=${perps.tbody === perps2}`);

await page.screenshot({ path: path.join(EVID, `FUNDING_bands_label_run${RUN}.png`), fullPage: true });
ck('A5 zero pageerrors / console errors', errors.length === 0, `errors=${errors.length} ${JSON.stringify(errors.slice(0,4))}`);

await browser.close();
const md5post = md5(BUILD);
ck('A6 build md5 unchanged (read-only)', md5pre === md5post, `${md5pre} → ${md5post}`);

const fails = CHECKS.filter(c => !c.p);
log(`\n=== ACCEPTANCE VERDICT (run ${RUN}): ${fails.length === 0 ? 'PASS' : 'FLAG'} (${CHECKS.length - fails.length}/${CHECKS.length}) ===`);
for (const f of fails) log(`  FAIL: ${f.n}  ${f.d}`);
fs.writeFileSync(path.join(EVID, `RESULT_run${RUN}.json`), JSON.stringify({ build: path.basename(BUILD), md5: md5pre, run: RUN, label, checks: CHECKS, errors }, null, 2));
fs.writeFileSync(path.join(EVID, `RUN_LOG_${RUN}.txt`), LOG.join('\n') + '\n');
