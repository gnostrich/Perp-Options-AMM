// LIVE chart-2 OPTION C smoke — HEAD engine/builds/HEAD_temporal_mvp_v28_lens.html (md5 dd6fb955…)
// Change under test: the SECOND chart ("MARK ACROSS STRIKES" / renderPricingFrame/drawState) now plots
// the NORMALIZED STEEPNESS SHAPE — the lens wing law (mode/θ)^g for calls, (θ/mode)^g for puts, g = m·γ
// (psiShape, L3737). Mode peak = 1 AND wings steepen as SLOPE MULT M rises (knob VISIBLE). Strike markers
// (drawStrikeMark, L3804) use the SAME r^g shape. Engine/settlement math UNCHANGED (display-only).
// VERIFY: (1) peak=1.00 at mode φ_m, (2) wings fall to 0 both sides, (3) mode line meets apex at y=1,
//         (4) KURTOSIS VISIBLE — m=1 vs m=3 vs m=6 chart-2 screenshots must DIFFER (md5 distinct, higher
//             m steeper/narrower, peak stays 1), (5) markers ON the normalized curve, (6) zero errors,
//         (7) byte-stable RESULT json x2.
// Run: cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/pw_v28_chart2optC_smoke.mjs A
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import crypto from 'crypto';

const RUN = (process.argv[2] || 'A').toUpperCase();
const here = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.resolve(here, '../builds/HEAD_temporal_mvp_v28_lens.html');
const EVID = path.resolve(here, '../../evidence/v28_chart2_optC');
fs.mkdirSync(EVID, { recursive: true });
const LOG = [];
const log = (s) => { LOG.push(s); console.log(s); };
const md5file = (f) => crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex');
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

log(`=== CHART-2 OPTION C SMOKE  run ${RUN}  build ${path.basename(BUILD)} ===`);
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

// Analytic ground truth: the OPTION-C steepness shape r^g, r=sNorm/θ (call) or θ/sNorm (put), g=m·γ.
// This is what the curve & markers draw (psiShape / drawStrikeMark). Peak r=1 => 1; wings r<1 => r^g.
const shapeAt = async (thPut, thCall, thDeep) => page.evaluate(({thPut,thCall,thDeep}) => {
  const st = Store.state.pool, m = Store.state.m, sNorm = 1;
  const gMode = Engine.gLoc(st, sNorm, m);
  const shp = (theta, wing) => {
    const g = Engine.gLoc(st, theta, m);
    const r = wing === 'call' ? sNorm/theta : theta/sNorm;
    return Math.min(1, Math.pow(Math.max(0,r), g));
  };
  return {
    m, gMode,
    peakShape: shp(sNorm,'call'),         // must be 1
    shapePut: shp(thPut,'put'),
    shapeCall: shp(thCall,'call'),
    shapeDeep: shp(thDeep,'call')
  };
}, {thPut,thCall,thDeep});

const RESULT = { run: RUN, md5: execSync('md5sum ' + BUILD).toString().split(' ')[0].trim(), checks: {} };
const THP=0.4, THC=2.5, THD=5;

// ---- DEFAULT (m=1) ----
await showPricing();
await typeM(1);
const an1 = await shapeAt(THP,THC,THD);
const cv1 = await sampleCurve();
log(`\n[m=1] analytic shape: peakShape(mode)=${an1.peakShape.toFixed(4)} g_mode=${an1.gMode.toFixed(4)} shapePut(θ${THP})=${an1.shapePut.toFixed(4)} shapeCall(θ${THC})=${an1.shapeCall.toFixed(4)}`);
log(`[m=1] pixel: apex psi=${cv1.apex?cv1.apex.psi.toFixed(4):'NONE'} @x=${cv1.apex?cv1.apex.x:'-'} (y=${cv1.apex?cv1.apex.y:'-'}, y@psi=1 is ${Y_PSI1}); modeCol psi=${cv1.mode?cv1.mode.psi.toFixed(4):'NONE'}; putWing(22°) psi=${cv1.putW?cv1.putW.psi.toFixed(4):'NONE'}; callWing(68°) psi=${cv1.callW?cv1.callW.psi.toFixed(4):'NONE'}; widthAtHalf=${cv1.widthAtHalf}; curvePx=${cv1.curveCount}`);

const apexPsi1 = cv1.apex ? cv1.apex.psi : 0;
const apexY1 = cv1.apex ? cv1.apex.y : 9999;
RESULT.checks.peak_eq_1_at_mode = {
  apexPsi: +apexPsi1.toFixed(4), apexY: apexY1, yPsi1: Y_PSI1,
  apexAtMode: cv1.apex ? Math.abs(cv1.apex.x - phiToX(45)) < 14 : false,
  analyticPeakShape: +an1.peakShape.toFixed(4),
  pass: apexPsi1 > 0.97 && Math.abs(apexY1 - Y_PSI1) <= 4 && (cv1.apex ? Math.abs(cv1.apex.x - phiToX(45)) < 14 : false) && Math.abs(an1.peakShape-1) < 1e-9
};
RESULT.checks.wings_fall_off = {
  putWingPsi: cv1.putW?+cv1.putW.psi.toFixed(4):null,
  callWingPsi: cv1.callW?+cv1.callW.psi.toFixed(4):null,
  analyticShapePut: +an1.shapePut.toFixed(4), analyticShapeCall: +an1.shapeCall.toFixed(4),
  pass: (cv1.putW && cv1.putW.psi < 0.98) && (cv1.callW && cv1.callW.psi < 0.98) && an1.shapePut < 1 && an1.shapeCall < 1
};
RESULT.checks.mode_line_meets_apex_at_top = {
  apexY: apexY1, yPsi1: Y_PSI1, gap_px: Math.abs(apexY1 - Y_PSI1),
  pass: Math.abs(apexY1 - Y_PSI1) <= 4
};

// ---- KURTOSIS VISIBLE: m=1 / m=3 / m=6 — per-m chart-2 PNG md5 MUST DIFFER ----
const kurt = {};
const chart2md5 = {};
for (const m of [1,3,6]) {
  await typeM(m);
  const an = await shapeAt(THP,THC,THD);
  const cv = await sampleCurve();
  const f = await shot(page, `chart2_m${m}`, '#canvas-pricing');
  const h = md5file(f);
  chart2md5[m] = h;
  kurt[m] = {
    apexPsi: cv.apex?+cv.apex.psi.toFixed(4):null, apexY: cv.apex?cv.apex.y:null,
    widthAtHalf: cv.widthAtHalf, curvePx: cv.curveCount,
    shapePut: +an.shapePut.toFixed(5), shapeCall: +an.shapeCall.toFixed(5), shapeDeep: +an.shapeDeep.toFixed(5),
    gMode: +an.gMode.toFixed(4), peakShape: +an.peakShape.toFixed(5), png_md5: h
  };
  log(`[m=${m}] apexPsi=${kurt[m].apexPsi} apexY=${kurt[m].apexY} widthAtHalf=${kurt[m].widthAtHalf} shapePut(θ${THP})=${kurt[m].shapePut} shapeCall(θ${THC})=${kurt[m].shapeCall} shapeDeep(θ${THD})=${kurt[m].shapeDeep} g_loc=${kurt[m].gMode} | chart2 PNG md5=${h}`);
}
const wOK = (kurt[1].widthAtHalf!=null && kurt[3].widthAtHalf!=null && kurt[6].widthAtHalf!=null) &&
            (kurt[3].widthAtHalf < kurt[1].widthAtHalf) && (kurt[6].widthAtHalf < kurt[3].widthAtHalf);
const shapeFallsCall = kurt[3].shapeCall < kurt[1].shapeCall && kurt[6].shapeCall < kurt[3].shapeCall;
const shapeFallsPut  = kurt[3].shapePut  < kurt[1].shapePut  && kurt[6].shapePut  < kurt[3].shapePut;
const peakStays1 = [1,3,6].every(m => kurt[m].apexPsi!=null && kurt[m].apexPsi>0.97 && Math.abs(kurt[m].apexY-Y_PSI1)<=4 && Math.abs(kurt[m].peakShape-1)<1e-9);
// THE CRITICAL CHECK: the per-m chart-2 PNGs must NOT be md5-identical (the prior build bug).
const md5DistinctM1vsM3 = chart2md5[1] !== chart2md5[3];
const md5DistinctM3vsM6 = chart2md5[3] !== chart2md5[6];
const md5AllDistinct = md5DistinctM1vsM3 && md5DistinctM3vsM6 && chart2md5[1] !== chart2md5[6];
RESULT.checks.kurtosis_visible = {
  chart2_png_md5: { m1: chart2md5[1], m3: chart2md5[3], m6: chart2md5[6] },
  md5_m1_neq_m3: md5DistinctM1vsM3, md5_m3_neq_m6: md5DistinctM3vsM6, md5_all_distinct: md5AllDistinct,
  widthAtHalf: { m1:kurt[1].widthAtHalf, m3:kurt[3].widthAtHalf, m6:kurt[6].widthAtHalf }, width_monotone_decrease: wOK,
  shapeCall: { m1:kurt[1].shapeCall, m3:kurt[3].shapeCall, m6:kurt[6].shapeCall }, shapeCall_decrease: shapeFallsCall,
  shapePut:  { m1:kurt[1].shapePut,  m3:kurt[3].shapePut,  m6:kurt[6].shapePut },  shapePut_decrease: shapeFallsPut,
  shapeDeep: { m1:kurt[1].shapeDeep, m3:kurt[3].shapeDeep, m6:kurt[6].shapeDeep },
  apexPsi: { m1:kurt[1].apexPsi, m3:kurt[3].apexPsi, m6:kurt[6].apexPsi }, peak_stays_1: peakStays1,
  NOTE: 'CRITICAL: m=1 and m=3 chart-2 PNG md5 MUST DIFFER (last build they were identical = the bug). Shape must STEEPEN with m (width down, wing values down) while peak stays at 1.',
  pass: md5AllDistinct && wOK && shapeFallsCall && shapeFallsPut && peakStays1
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
// the dot's pixel psi must match the analytic r^g SHAPE at the dot's φ (curve & marker share identical
// math — drawStrikeMark L3804 uses the same r^g). Tolerance = dot radius / plotH ≈ 0.04 psi.
const markers = await page.evaluate(({PAD,PLOTW,PLOTH}) => {
  const cv=document.getElementById('canvas-pricing'); const ctx=cv.getContext('2d');
  const img=ctx.getImageData(0,0,cv.width,cv.height).data; const W=cv.width;
  const at=(x,y)=>{const i=(y*W+x)*4;return[img[i],img[i+1],img[i+2],img[i+3]];};
  const isRed =(r,g,b,a)=>a>200&&Math.abs(r-255)<35&&Math.abs(g-103)<45&&Math.abs(b-103)<45;
  const isGreen=(r,g,b,a)=>a>200&&Math.abs(r-20)<60&&Math.abs(g-232)<45&&Math.abs(b-0)<55;
  const collect=(pred)=>{let sx=0,sy=0,n=0;for(let y=PAD.top;y<=PAD.top+PLOTH;y++)for(let x=PAD.left;x<=PAD.left+PLOTW;x++){const[r,g,b,a]=at(x,y);if(pred(r,g,b,a)){sx+=x;sy+=y;n++;}}return n?{cx:Math.round(sx/n),cy:Math.round(sy/n),n}:null;};
  const psiOf=(y)=>(PAD.top+PLOTH-y)/PLOTH; const phiOf=(x)=>(x-PAD.left)/PLOTW*90;
  const st=Store.state.pool, m=Store.state.m, sNorm=1;
  const shapeAtPhi=(phi)=>{const th=Math.tan(phi*Math.PI/180); if(th<=0)return 0; const wing=th>sNorm?'call':'put'; const g=Engine.gLoc(st,th,m); const r=wing==='call'?sNorm/th:th/sNorm; return Math.min(1,Math.pow(Math.max(0,r),g));};
  const ev=(dot)=>{if(!dot)return null; const phi=phiOf(dot.cx); const dotPsi=psiOf(dot.cy); const expect=shapeAtPhi(phi); return {cx:dot.cx,cy:dot.cy,n:dot.n,phi:+phi.toFixed(2),dotPsi:+dotPsi.toFixed(4),curveShapeHere:+expect.toFixed(4),dPsi:+Math.abs(dotPsi-expect).toFixed(4)};};
  return { red:ev(collect(isRed)), green:ev(collect(isGreen)) };
}, {PAD,PLOTW,PLOTH});
log(`\n[markers] red(sold) ${markers.red?`@(${markers.red.cx},${markers.red.cy}) φ=${markers.red.phi}° dotPsi=${markers.red.dotPsi} curveShape=${markers.red.curveShapeHere} dPsi=${markers.red.dPsi}`:'NONE'}`);
log(`[markers] green(bought) ${markers.green?`@(${markers.green.cx},${markers.green.cy}) φ=${markers.green.phi}° dotPsi=${markers.green.dotPsi} curveShape=${markers.green.curveShapeHere} dPsi=${markers.green.dPsi}`:'NONE'}`);
await shot(page, 'chart2_band_markers', '#canvas-pricing');

const redOK = markers.red && markers.red.dPsi!=null && markers.red.dPsi<=0.04;
const greenOK = markers.green && markers.green.dPsi!=null && markers.green.dPsi<=0.04;
RESULT.checks.markers_on_curve = { bandOpened: !exec.wasDisabled, red: markers.red, green: markers.green, tol_psi: 0.04, pass: !!(redOK && greenOK) };

RESULT.checks.zero_errors = { pageerrors: errors.filter(e=>e.startsWith('pageerror')), console_errors: errors.filter(e=>e.startsWith('console')), dialogs, pass: errors.length===0 };

RESULT.kurt = kurt;
RESULT.chart2_png_md5 = chart2md5;
RESULT.verdict = Object.values(RESULT.checks).every(c=>c.pass) ? 'PASS' : 'FAIL';

fs.writeFileSync(path.join(EVID, `RESULT_run${RUN}.json`), JSON.stringify(RESULT, null, 2));
fs.writeFileSync(path.join(EVID, `RUN_LOG_run${RUN}.txt`), LOG.join('\n')+'\n');
log(`\n=== VERDICT run ${RUN}: ${RESULT.verdict} ===`);
for (const [k,c] of Object.entries(RESULT.checks)) log(`  ${c.pass?'PASS':'FAIL'}  ${k}`);
log(`chart2 PNG md5: m1=${chart2md5[1]} m3=${chart2md5[3]} m6=${chart2md5[6]}`);
log(`errors: ${errors.length}  dialogs: ${dialogs.length}`);

await browser.close();
