// v27 VISUAL ACCEPTANCE re-run after the render fix landed (curveTraceW centers on live
// operating point + elbow; default pool now asymmetric x10/y12 w-0.60/w+0.85 tau0.3,
// oracle 4.44; #16 label states strong-form warp ships).
// This harness tests the DEFAULT pool as it ships — NO wing-setting workaround, NO manual
// frame-lock monkeypatch. The fix is supposed to make the knob & warp visible on default load.
// Live oracle = page's OWN Engine/Store. Evidence -> evidence/v27_pw/ (R-prefixed, new run).
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const ENGINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD  = path.join(ENGINE, 'builds', 'temporal_mvp_v27_wkurtosis_WIP.html');
const EVID   = path.resolve(ENGINE, '..', 'evidence', 'v27_pw');
fs.mkdirSync(EVID, { recursive: true });
const out = (n) => path.join(EVID, n);
const log = (...a) => console.log(...a);

// Per-column topmost-lit-pixel profile of a canvas (the curve's silhouette).
async function curveProfile(page, id) {
  return await page.evaluate((cid) => {
    const cv = document.getElementById(cid);
    if (!cv) return null;
    const ctx = cv.getContext('2d');
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    const W = cv.width, H = cv.height;
    let lit = 0, minX = W, maxX = -1, minY = H, maxY = -1;
    const colTop = new Array(W).fill(-1);
    for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) {
      const i = (y * W + x) * 4;
      if (d[i] + d[i+1] + d[i+2] > 180 && d[i+3] > 40) {
        if (colTop[x] < 0) colTop[x] = y;
        lit++; if (x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y;
      }
    }
    return { W, H, lit, colTop, spanX: maxX-minX, spanY: maxY-minY, fracW: +((maxX-minX)/W).toFixed(3), fracH: +((maxY-minY)/H).toFixed(3) };
  }, id);
}

async function liveSnap(page) {
  return await page.evaluate(() => {
    if (typeof Store === 'undefined' || typeof Engine === 'undefined') return { err: 'no Store/Engine' };
    const st = Store.state, p = st.pool;
    const o = { pool: { x: p.x, y: p.y, tau: p.tau, wMinus: p.wMinus, wPlus: p.wPlus, phi: p.phi, alpha: p.alpha, beta: p.beta },
                oracle: st.oracle, oracle_initial: st.oracle_initial, perpMark: st.perpMark };
    try { o.mp = Engine.getMP_raw(p); } catch (e) {}
    try { o.u0 = Math.log(p.y/p.x); } catch (e) {}
    return o;
  });
}
async function setTau(page, t) {
  await page.evaluate((t) => { const e = document.getElementById('tau-input'); if(e){ e.value = String(t); e.dispatchEvent(new Event('input', { bubbles: true })); } }, t);
  await page.waitForTimeout(350);
}
// band-mean |colTop diff| over a fractional x-window, only where both curves are lit
function bandDiff(pa, pb, fa, fb) {
  if (!pa || !pb || pa.W !== pb.W) return null;
  const W = pa.W, a = Math.floor(W*fa), b = Math.ceil(W*fb);
  let diff = 0, n = 0, mx = 0;
  for (let x = a; x < b; x++) if (pa.colTop[x] >= 0 && pb.colTop[x] >= 0) { const dd = Math.abs(pa.colTop[x]-pb.colTop[x]); diff += dd; if(dd>mx)mx=dd; n++; }
  return n ? { mean: +(diff/n).toFixed(3), max: mx, n } : null;
}

async function runOnce(tag) {
  const errs = [];
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE:' + m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR:' + e.message));
  await page.goto('file://' + BUILD, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const trace = { tag };
  trace.engineReachable = await page.evaluate(() => typeof Engine !== 'undefined' && typeof Store !== 'undefined');
  trace.defaultPool = (await liveSnap(page));

  // --- KPI / dollar readouts on DEFAULT load (oracle=4.44 blast-radius check) ---
  trace.kpis = await page.evaluate(() => {
    const grab = (id) => { const e = document.getElementById(id); return e ? (e.value !== undefined && e.tagName==='INPUT' ? e.value : e.textContent.trim()) : null; };
    const out = {};
    ['kpi-oracle','lp-x-usd','wcurve-status'].forEach(id => out[id] = grab(id));
    // sweep ALL elements that look like KPI/stat values for NaN / Infinity / absurd
    const vals = [...document.querySelectorAll('.kpi-val, .val, .stat-line .val')].map(e => e.textContent.trim()).filter(Boolean);
    out.nanLike = vals.filter(v => /nan|infinity|undefined|null/i.test(v));
    out.sampleVals = vals.slice(0, 30);
    return out;
  });

  // ===== ITEM 1: curve renders across the frame on DEFAULT load =====
  await page.selectOption('#chart-select', 'curve');
  await page.waitForTimeout(400);
  const profDefault = await curveProfile(page, 'canvas-curve');
  trace.item1_defaultCurve = profDefault ? { lit: profDefault.lit, fracW: profDefault.fracW, fracH: profDefault.fracH, spanX: profDefault.spanX, spanY: profDefault.spanY } : null;
  await page.screenshot({ path: out(tag + '_R01_default_curve.png') });

  // ===== ITEM 2: KURTOSIS KNOB — two tau on DEFAULT pool, NO frame-lock workaround =====
  await setTau(page, 0.05);
  trace.tauLow = (await liveSnap(page)).pool;
  await page.screenshot({ path: out(tag + '_R02_curve_tau_005.png') });
  const profTauLow = await curveProfile(page, 'canvas-curve');
  await setTau(page, 3.00);
  trace.tauHigh = (await liveSnap(page)).pool;
  await page.screenshot({ path: out(tag + '_R03_curve_tau_300.png') });
  const profTauHigh = await curveProfile(page, 'canvas-curve');
  trace.item2_tauElbow = bandDiff(profTauLow, profTauHigh, 0.30, 0.62);
  trace.item2_tauLeftWing = bandDiff(profTauLow, profTauHigh, 0.08, 0.20);
  trace.item2_tauRightWing = bandDiff(profTauLow, profTauHigh, 0.82, 0.95);
  await setTau(page, 0.30); // restore default

  // ===== ITEM 3: THE WARP — execute a real trade on DEFAULT pool, pre vs post curve =====
  await page.waitForTimeout(300);
  trace.preTrade = (await liveSnap(page)).pool;
  const profPre = await curveProfile(page, 'canvas-curve');
  await page.screenshot({ path: out(tag + '_R04_pre_trade.png') });
  trace.warpDirect = await page.evaluate(() => {
    const before = { ...Store.state.pool };
    const wB = Engine.wField(before);
    const a = before.x * wB, b = before.y * (1 - wB);
    const wTarget = 0.78; const yNew = b / (1 - wTarget); const dy = yNew - before.y;
    const post = Engine.tradeUpdate(before, dy);
    if (!post) return { err: 'null' };
    if (post.rejected) return { rejected: true, reason: post.reason, triedDy: dy };
    Store.state.pool = post;
    return { dy, before: { phi: before.phi ?? 0, w: wB }, after: { phi: post.phi, w: Engine.wField(post) },
             phiMoved: Math.abs((post.phi ?? 0) - (before.phi ?? 0)), wMoved: Math.abs(Engine.wField(post) - wB) };
  });
  // redraw via the app's own render path (NO frame-lock monkeypatch)
  await page.evaluate(() => { if (typeof render === 'function') render(); });
  await page.waitForTimeout(400);
  trace.postTrade = (await liveSnap(page)).pool;
  const profPost = await curveProfile(page, 'canvas-curve');
  await page.screenshot({ path: out(tag + '_R05_post_trade.png') });
  trace.item3_warpFull = bandDiff(profPre, profPost, 0.02, 0.98);
  trace.item3_warpElbow = bandDiff(profPre, profPost, 0.30, 0.62);

  // ===== ITEM 4: in-band executes; over-size shows frozen-wing message =====
  trace.item4_overSize = await page.evaluate(() => {
    const s = { ...Store.state.pool };
    const post = Engine.tradeUpdate(s, s.y * 50);
    return post && post.rejected ? { rejected: true, reason: post.reason } : { rejected: false };
  });
  trace.item4_inBand = await page.evaluate(() => {
    const s = { ...Store.state.pool };
    const wB = Engine.wField(s); const b = s.y * (1 - wB);
    const dy = b / (1 - 0.72) - s.y;
    const post = Engine.tradeUpdate(s, dy);
    return post && !post.rejected ? { executed: true, newW: Engine.wField(post) } : { executed: false, reason: post && post.reason };
  });

  // ===== ITEM 5: pricing + payoff render sane with new default pool & oracle 4.44 =====
  await page.selectOption('#chart-select', 'pricing'); await page.waitForTimeout(450);
  const prof_pricing = await curveProfile(page, 'canvas-pricing');
  await page.screenshot({ path: out(tag + '_R06_pricing.png') });
  await page.selectOption('#chart-select', 'payoff'); await page.waitForTimeout(450);
  const prof_payoff = await curveProfile(page, 'canvas-payoff');
  await page.screenshot({ path: out(tag + '_R07_payoff.png') });
  trace.item5_pricingLit = prof_pricing ? prof_pricing.lit : null;
  trace.item5_payoffLit = prof_payoff ? prof_payoff.lit : null;

  // ===== ITEM: #16 label states strong-form ships =====
  trace.label16 = await page.evaluate(() => {
    const els = [...document.querySelectorAll('.sim-aid-label')];
    const e = els.find(x => /Trade mechanic/i.test(x.textContent));
    return e ? e.textContent.replace(/\s+/g,' ').trim() : null;
  });

  trace.consoleErrors = errs;
  await browser.close();
  return trace;
}

(async () => {
  const r1 = await runOnce('A');
  const r2 = await runOnce('B');
  const summary = { runA: r1, runB: r2 };
  fs.writeFileSync(out('trace_render_accept.json'), JSON.stringify(summary, null, 2));
  log(JSON.stringify(summary, null, 2));
})();
