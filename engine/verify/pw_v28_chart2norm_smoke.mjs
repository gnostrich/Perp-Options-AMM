// LIVE chart-2 NORMALIZATION smoke — HEAD engine/builds/HEAD_temporal_mvp_v28_lens.html (md5 6a23f93d…)
// Change under test: the SECOND chart ("MARK ACROSS STRIKES" / renderPricingFrame/drawState) now
// NORMALIZES the displayed value curve so the MODE (peak) anchors at y=1 (psiN = min(1, psiAt/peakNorm)).
// Strike markers (drawStrikeMark) get the SAME normalization (mk/peakMk). Engine/settlement math UNCHANGED.
// VERIFY: (1) peak=1.00 at mode φ_m, (2) wings fall to 0 both sides, (3) mode dashed line apex at y=1,
//         (4) higher m = steeper/narrower wings, peak stays 1, (5) markers ON the normalized curve,
//         (6) zero page/console errors, (7) byte-stable RESULT json x2.
// Run: cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/pw_v28_chart2norm_smoke.mjs A
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const RUN = (process.argv[2] || 'A').toUpperCase();
const here = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.resolve(here, '../builds/HEAD_temporal_mvp_v28_lens.html');
const EVID = path.resolve(here, '../../evidence/v28_chart2_norm');
fs.mkdirSync(EVID, { recursive: true });
const LOG = [];
const log = (s) => { LOG.push(s); console.log(s); };
const shot = async (page, name, sel) => {
  const f = path.join(EVID, `${RUN}_${name}.png`);
  if (sel) { const el = await page.$(sel); if (el) { await el.screenshot({ path: f }); return f; } }
  await page.screenshot({ path: f, fullPage: true });
  return f;
};

// ── canvas-pricing geometry (renderPricingFrame): 900x380, pad{t18,r18,b54,l50} ──
const PAD = { top: 18, right: 18, bottom: 54, left: 50 };
const CW = 900, CH = 380;
const PLOTW = CW - PAD.left - PAD.right;   // 832
const PLOTH = CH - PAD.top - PAD.bottom;   // 308
const phiToX = (phi) => PAD.left + (phi / 90) * PLOTW;
const Y_PSI1 = PAD.top; // 18 — the top gridline / y=1.00 axis tick

const errors = [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('console', m => { if (m.type() === 'error') errors.push('console:' + m.text()); });
page.on('pageerror', e => errors.push('pageerror:' + e.message));
const dialogs = [];
page.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });

await page.goto('file://' + BUILD);
await page.waitForTimeout(600);

log(`=== CHART-2 NORM SMOKE  run ${RUN}  build ${path.basename(BUILD)} ===`);
log(`md5(build)=${execSync('md5sum ' + BUILD).toString().split(' ')[0].trim()}`);

const showPricing = async () => { await page.evaluate(() => {
  const s = document.getElementById('chart-select'); s.value = 'pricing';
  s.dispatchEvent(new Event('change', { bubbles: true }));
}); await page.waitForTimeout(350); };

const typeM = async (m) => { await page.evaluate((mm) => {
  const el = document.getElementById('m-input');
  el.value = String(mm);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}, m); await page.waitForTimeout(350); };

// Sample the drawn curve: topmost colored (curve) pixel per column => psi. Also apex + width-at-half.
const sampleCurve = async () => page.evaluate(({PAD,PLOTW,PLOTH}) => {
  const cv = document.getElementById('canvas-pricing');
  const ctx = cv.getContext('2d');
  const img = ctx.getImageData(0, 0, cv.width, cv.height).data;
  const W = cv.width;
  const at = (x,y) => { const i=(y*W+x)*4; return [img[i],img[i+1],img[i+2],img[i+3]]; };
  const isCall = (r,g,b)=> Math.abs(r-10)<70 && Math.abs(g-186)<70 && Math.abs(b-181)<70;
  const isPut  = (r,g,b)=> Math.abs(r-255)<45 && Math.abs(g-133)<70 && Math.abs(b-176)<70;
  const isCurve = (r,g,b,a)=> a>120 && (isCall(r,g,b)||isPut(r,g,b));
  const topPsiAtX = (x) => { for (let y=PAD.top-3; y<=PAD.top+PLOTH+3; y++){ const [r,g,b,a]=at(x,y); if (isCurve(r,g,b,a)) return { y, psi:(PAD.top+PLOTH - y)/PLOTH }; } return null; };
  let best=null;
  for (let x=PAD.left; x<=PAD.left+PLOTW; x++){ const t=topPsiAtX(x); if (t && (!best || t.y<best.y)) best={x,y:t.y,psi:t.psi}; }
  const modeX=Math.round(PAD.left + (45/90)*PLOTW);
  const mode = topPsiAtX(modeX);
  const putW = topPsiAtX(Math.round(PAD.left + (22/90)*PLOTW));
  const callW= topPsiAtX(Math.round(PAD.left + (68/90)*PLOTW));
  const halfY = Math.round(PAD.top + 0.5*PLOTH);
  let leftHalf=null, rightHalf=null;
  for (let x=PAD.left; x<=PAD.left+PLOTW; x++){ const [r,g,b,a]=at(x,halfY); if (a>120 && (isCall(r,g,b)||isPut(r,g,b))){ if(leftHalf===null) leftHalf=x; rightHalf=x; } }
  const widthAtHalf = (leftHalf!==null) ? (rightHalf-leftHalf) : null;
  let curveCount=0;
  for (let y=PAD.top; y<=PAD.top+PLOTH; y++) for(let x=PAD.left;x<=PAD.left+PLOTW;x++){ const [r,g,b,a]=at(x,y); if(a>120 && (isCall(r,g,b)||isPut(r,g,b))) curveCount++; }
  return { apex:best, mode, putW, callW, widthAtHalf, curveCount, stateM:Store.state.m };
}, {PAD,PLOTW,PLOTH});

// Analytic: mode peak + the NORMALIZED value at fixed wing strikes (ground truth, NOT pixels).
const analytic = async () => page.evaluate(() => {
  const st = Store.state.pool, m = Store.state.m, sNorm = 1;
  const gMode = Engine.gLoc(st, sNorm, m);
  const peakRaw = Engine.markLensed('call', sNorm, sNorm, gMode);
  const thPut=0.4, thCall=2.5;
  const gPut=Engine.gLoc(st, thPut, m), gCall=Engine.gLoc(st, thCall, m);
  const vPut=Engine.markLensed('put', thPut, sNorm, gPut);
  const vCall=Engine.markLensed('call', thCall, sNorm, gCall);
  // deep wing too (to prove m-invariance is not just near the mode)
  const vDeep=Engine.markLensed('call', 5, sNorm, Engine.gLoc(st,5,m));
  return { m, gMode, peakRaw, normPut: vPut/peakRaw, normCall: vCall/peakRaw, normDeepCall: vDeep/peakRaw };
});

const RESULT = { run: RUN, md5: execSync('md5sum ' + BUILD).toString().split(' ')[0].trim(), checks: {} };

// ---- DEFAULT (m=1) ----
await showPricing();
await typeM(1);
const an1 = await analytic();
const cv1 = await sampleCurve();
log(`\n[m=1] analytic: peakRaw(mode abs)=${an1.peakRaw.toFixed(4)} g_mode=${an1.gMode.toFixed(4)} normPut(θ0.4)=${an1.normPut.toFixed(4)} normCall(θ2.5)=${an1.normCall.toFixed(4)}`);
log(`[m=1] pixel: apex psi=${cv1.apex?cv1.apex.psi.toFixed(4):'NONE'} @x=${cv1.apex?cv1.apex.x:'-'} (y=${cv1.apex?cv1.apex.y:'-'}, y@psi=1 is ${Y_PSI1}); modeCol psi=${cv1.mode?cv1.mode.psi.toFixed(4):'NONE'}; putWing(22°) psi=${cv1.putW?cv1.putW.psi.toFixed(4):'NONE'}; callWing(68°) psi=${cv1.callW?cv1.callW.psi.toFixed(4):'NONE'}; widthAtHalf=${cv1.widthAtHalf}; curvePx=${cv1.curveCount}`);
await shot(page, 'chart2_m1', '#canvas-pricing');

const apexPsi1 = cv1.apex ? cv1.apex.psi : 0;
const apexY1 = cv1.apex ? cv1.apex.y : 9999;
RESULT.checks.peak_eq_1_at_mode = {
  apexPsi: +apexPsi1.toFixed(4), apexY: apexY1, yPsi1: Y_PSI1,
  apexAtMode: cv1.apex ? Math.abs(cv1.apex.x - phiToX(45)) < 14 : false,
  pass: apexPsi1 > 0.97 && Math.abs(apexY1 - Y_PSI1) <= 4 && (cv1.apex ? Math.abs(cv1.apex.x - phiToX(45)) < 14 : false)
};
RESULT.checks.wings_fall_off = {
  putWingPsi: cv1.putW?+cv1.putW.psi.toFixed(4):null,
  callWingPsi: cv1.callW?+cv1.callW.psi.toFixed(4):null,
  analyticNormPut: +an1.normPut.toFixed(4), analyticNormCall: +an1.normCall.toFixed(4),
  pass: (cv1.putW && cv1.putW.psi < 0.9) && (cv1.callW && cv1.callW.psi < 0.9) && an1.normPut < 1 && an1.normCall < 1
};
RESULT.checks.mode_line_meets_apex_at_top = {
  apexY: apexY1, yPsi1: Y_PSI1, gap_px: Math.abs(apexY1 - Y_PSI1),
  pass: Math.abs(apexY1 - Y_PSI1) <= 4
};

// ---- KURTOSIS m=1 vs m=3 vs m=6 ----
const kurt = {};
for (const m of [1,3,6]) {
  await typeM(m);
  const an = await analytic();
  const cv = await sampleCurve();
  kurt[m] = {
    apexPsi: cv.apex?+cv.apex.psi.toFixed(4):null, apexY: cv.apex?cv.apex.y:null,
    widthAtHalf: cv.widthAtHalf, curvePx: cv.curveCount,
    analyticNormPut: +an.normPut.toFixed(5), analyticNormCall: +an.normCall.toFixed(5),
    analyticNormDeepCall: +an.normDeepCall.toFixed(5),
    peakRaw: +an.peakRaw.toFixed(4), gMode: +an.gMode.toFixed(4)
  };
  log(`[m=${m}] apexPsi=${kurt[m].apexPsi} apexY=${kurt[m].apexY} widthAtHalf=${kurt[m].widthAtHalf} normPut(θ0.4)=${kurt[m].analyticNormPut} normCall(θ2.5)=${kurt[m].analyticNormCall} normDeepCall(θ5)=${kurt[m].analyticNormDeepCall} g_loc=${kurt[m].gMode} peakRaw(abs)=${kurt[m].peakRaw}`);
  if (m===1 || m===3) await shot(page, `chart2_m${m}_kurt`, '#canvas-pricing');
}
const wOK = (kurt[1].widthAtHalf!=null && kurt[3].widthAtHalf!=null && kurt[6].widthAtHalf!=null) &&
            (kurt[3].widthAtHalf < kurt[1].widthAtHalf) && (kurt[6].widthAtHalf < kurt[3].widthAtHalf);
const normFallsCall = kurt[3].analyticNormCall < kurt[1].analyticNormCall && kurt[6].analyticNormCall < kurt[3].analyticNormCall;
const normFallsPut  = kurt[3].analyticNormPut  < kurt[1].analyticNormPut  && kurt[6].analyticNormPut  < kurt[3].analyticNormPut;
const peakStays1 = [1,3,6].every(m => kurt[m].apexPsi!=null && kurt[m].apexPsi>0.97 && Math.abs(kurt[m].apexY-Y_PSI1)<=4);
RESULT.checks.higher_m_steeper_peak_stays_1 = {
  widthAtHalf: { m1:kurt[1].widthAtHalf, m3:kurt[3].widthAtHalf, m6:kurt[6].widthAtHalf }, width_monotone_decrease: wOK,
  normCall: { m1:kurt[1].analyticNormCall, m3:kurt[3].analyticNormCall, m6:kurt[6].analyticNormCall }, normCall_decrease: normFallsCall,
  normPut:  { m1:kurt[1].analyticNormPut,  m3:kurt[3].analyticNormPut,  m6:kurt[6].analyticNormPut },  normPut_decrease: normFallsPut,
  normDeepCall: { m1:kurt[1].analyticNormDeepCall, m3:kurt[3].analyticNormDeepCall, m6:kurt[6].analyticNormDeepCall },
  apexPsi: { m1:kurt[1].apexPsi, m3:kurt[3].apexPsi, m6:kurt[6].apexPsi }, peak_stays_1: peakStays1,
  NOTE: 'normalized shape must STEEPEN with m for this to PASS; if normCall/normPut identical across m the knob has no visible effect on chart-2',
  pass: wOK && normFallsCall && normFallsPut && peakStays1
};

// ---- MARKERS ON CURVE (open a band; m back to 1) ----
await typeM(1);
await page.evaluate(() => {
  const set=(id,v)=>{ const e=document.getElementById(id); if(e){ e.value=String(v); e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); } };
  const pill=document.getElementById('band-dir-sell'); if(pill && pill.dataset.dir!=='long'){ pill.click(); }
  set('sold-inner',120000); set('bought-inner',48000); set('band-notional',0.03);
});
await page.waitForTimeout(300);
const exec = await page.evaluate(() => { const b=document.getElementById('btn-execute'); const wasDisabled=b.disabled; if(!b.disabled) b.click(); return { wasDisabled }; });
await page.waitForTimeout(400);
await showPricing();
await page.waitForTimeout(300);

// Detect the FULL-OPACITY dot disc (alpha>200; the faint 0.4-alpha stem is excluded). On-curve test:
// the dot's pixel psi must match the analytic NORMALIZED curve value at the dot's φ (curve & marker
// share identical math — proven). Tolerance = dot radius / plotH ≈ 0.04 psi.
const markers = await page.evaluate(({PAD,PLOTW,PLOTH}) => {
  const cv=document.getElementById('canvas-pricing'); const ctx=cv.getContext('2d');
  const img=ctx.getImageData(0,0,cv.width,cv.height).data; const W=cv.width;
  const at=(x,y)=>{const i=(y*W+x)*4;return[img[i],img[i+1],img[i+2],img[i+3]];};
  const isRed =(r,g,b,a)=>a>200&&Math.abs(r-255)<35&&Math.abs(g-103)<45&&Math.abs(b-103)<45;
  const isGreen=(r,g,b,a)=>a>200&&Math.abs(r-20)<60&&Math.abs(g-232)<45&&Math.abs(b-0)<55;
  const collect=(pred)=>{let sx=0,sy=0,n=0;for(let y=PAD.top;y<=PAD.top+PLOTH;y++)for(let x=PAD.left;x<=PAD.left+PLOTW;x++){const[r,g,b,a]=at(x,y);if(pred(r,g,b,a)){sx+=x;sy+=y;n++;}}return n?{cx:Math.round(sx/n),cy:Math.round(sy/n),n}:null;};
  const psiOf=(y)=>(PAD.top+PLOTH-y)/PLOTH; const phiOf=(x)=>(x-PAD.left)/PLOTW*90;
  const st=Store.state.pool, m=Store.state.m, sNorm=1;
  const gMode=Engine.gLoc(st,sNorm,m); const peak=Engine.markLensed('call',sNorm,sNorm,gMode);
  const curveNormAtPhi=(phi)=>{const th=Math.tan(phi*Math.PI/180); if(th<=0)return 0; const wing=th>sNorm?'call':'put'; const g=Engine.gLoc(st,th,m); const v=Engine.markLensed(wing,th,sNorm,g); return Math.min(1,v/peak);};
  const ev=(dot)=>{if(!dot)return null; const phi=phiOf(dot.cx); const dotPsi=psiOf(dot.cy); const expect=curveNormAtPhi(phi); return {cx:dot.cx,cy:dot.cy,n:dot.n,phi:+phi.toFixed(2),dotPsi:+dotPsi.toFixed(4),curveNormHere:+expect.toFixed(4),dPsi:+Math.abs(dotPsi-expect).toFixed(4)};};
  return { red:ev(collect(isRed)), green:ev(collect(isGreen)) };
}, {PAD,PLOTW,PLOTH});
log(`\n[markers] red(sold) ${markers.red?`@(${markers.red.cx},${markers.red.cy}) φ=${markers.red.phi}° dotPsi=${markers.red.dotPsi} curveNorm=${markers.red.curveNormHere} dPsi=${markers.red.dPsi}`:'NONE'}`);
log(`[markers] green(bought) ${markers.green?`@(${markers.green.cx},${markers.green.cy}) φ=${markers.green.phi}° dotPsi=${markers.green.dotPsi} curveNorm=${markers.green.curveNormHere} dPsi=${markers.green.dPsi}`:'NONE'}`);
await shot(page, 'chart2_band_markers', '#canvas-pricing');

const redOK = markers.red && markers.red.dPsi!=null && markers.red.dPsi<=0.04;
const greenOK = markers.green && markers.green.dPsi!=null && markers.green.dPsi<=0.04;
RESULT.checks.markers_on_curve = { bandOpened: !exec.wasDisabled, red: markers.red, green: markers.green, tol_psi: 0.04, pass: !!(redOK && greenOK) };

RESULT.checks.zero_errors = { pageerrors: errors.filter(e=>e.startsWith('pageerror')), console_errors: errors.filter(e=>e.startsWith('console')), dialogs, pass: errors.length===0 };

RESULT.kurt = kurt;
RESULT.verdict = Object.values(RESULT.checks).every(c=>c.pass) ? 'PASS' : 'FAIL';

fs.writeFileSync(path.join(EVID, `RESULT_run${RUN}.json`), JSON.stringify(RESULT, null, 2));
fs.writeFileSync(path.join(EVID, `RUN_LOG_run${RUN}.txt`), LOG.join('\n')+'\n');
log(`\n=== VERDICT run ${RUN}: ${RESULT.verdict} ===`);
for (const [k,c] of Object.entries(RESULT.checks)) log(`  ${c.pass?'PASS':'FAIL'}  ${k}`);
log(`errors: ${errors.length}  dialogs: ${dialogs.length}`);

await browser.close();
