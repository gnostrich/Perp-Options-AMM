// Live Playwright visual confirmation of v27 (W) kurtosis curve + strong-form trade-warp.
// Engine & Store reachable inside page.evaluate. Live oracle = page's OWN Engine/Store.
// NOTE: the default pool ships SYMMETRIC wings (w-=w+=0.70 ⇒ Δw=0), which is a DEGENERATE
// (W) config: w is constant ⇒ τ does nothing and any trade is wing-range-rejected. The
// (W) features only exist with asymmetric wings (Δw>0), so this harness sets w-=0.60,
// w+=0.85 first, then tests the knob and the warp. (This degenerate default is itself a finding.)
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

async function curveProfile(page, id) {
  return await page.evaluate((cid) => {
    const cv = document.getElementById(cid);
    if (!cv) return null;
    const ctx = cv.getContext('2d');
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    const W = cv.width, H = cv.height;
    let lit = 0; const colTop = new Array(W).fill(-1);
    for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) {
      const i = (y * W + x) * 4;
      if (d[i] + d[i+1] + d[i+2] > 180 && d[i+3] > 40) { if (colTop[x] < 0) colTop[x] = y; lit++; }
    }
    return { W, H, lit, colTop };
  }, id);
}

async function liveSnap(page) {
  return await page.evaluate(() => {
    if (typeof Store === 'undefined' || typeof Engine === 'undefined') return { err: 'no Store/Engine' };
    const p = Store.state.pool;
    const o = { pool: { x: p.x, y: p.y, tau: p.tau, wMinus: p.wMinus, wPlus: p.wPlus, phi: p.phi, alpha: p.alpha, beta: p.beta } };
    try { o.mp = Engine.getMP_raw(p); } catch (e) {}
    try { o.wField = Engine.wField(p); } catch (e) {}
    try { o.gLoc = Engine.gLoc(p); } catch (e) {}
    return o;
  });
}

// set asymmetric wings through the UI handler
async function setWings(page, wm, wp) {
  await page.evaluate(([wm, wp]) => {
    const m = document.getElementById('wminus-input'); m.value = String(wm); m.dispatchEvent(new Event('change', { bubbles: true }));
    const p = document.getElementById('wplus-input'); p.value = String(wp); p.dispatchEvent(new Event('change', { bubbles: true }));
  }, [wm, wp]);
  await page.waitForTimeout(250);
}
async function setTau(page, t) {
  await page.evaluate((t) => { const e = document.getElementById('tau-input'); e.value = String(t); e.dispatchEvent(new Event('input', { bubbles: true })); }, t);
  await page.waitForTimeout(300);
}

(async () => {
  const errs = [];
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE:' + m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR:' + e.message));
  await page.goto('file://' + BUILD, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const trace = {};
  trace.engineReachable = await page.evaluate(() => typeof Engine !== 'undefined' && typeof Store !== 'undefined');
  trace.defaultPool = (await liveSnap(page)).pool; // record the degenerate default

  await page.selectOption('#chart-select', 'curve');
  await page.waitForTimeout(200);

  // --- set ASYMMETRIC wings so (W) is non-degenerate ---
  await setWings(page, 0.60, 0.85);
  trace.asymPool = (await liveSnap(page)).pool;
  trace.asymStatus = await page.evaluate(() => document.getElementById('wcurve-status')?.textContent || '');

  // ---- item 1: KURTOSIS KNOB — two tau values, freeze frame for honest overlay ----
  // Freeze the frame once now, and prevent the tau handler from nulling it so both draws share axes.
  await page.evaluate(() => { window.__curveFrame = window.__curveFrame || null; });
  await setTau(page, 0.10);
  // capture frame after first real draw, then lock it across the second tau
  await page.evaluate(() => { window.__LOCKFRAME = window.__curveFrame; });
  trace.tauLow = (await liveSnap(page)).pool;
  await page.screenshot({ path: out('02_curve_tau_low_0p10.png') });
  const profLow = await curveProfile(page, 'canvas-curve');
  // lock frame: monkeypatch so the wing/tau handler's null is overridden right before draw
  await page.evaluate(() => { window.__curveFrame = window.__LOCKFRAME; });
  await page.evaluate((t) => {
    const e = document.getElementById('tau-input'); e.value = String(t); e.dispatchEvent(new Event('input', { bubbles: true }));
    window.__curveFrame = window.__LOCKFRAME; // restore frame the handler nulled
    if (typeof Viz !== 'undefined' && Viz) Viz.drawAll(Store.state, null);
  }, 2.50);
  await page.waitForTimeout(300);
  trace.tauHigh = (await liveSnap(page)).pool;
  await page.screenshot({ path: out('03_curve_tau_high_2p50.png') });
  const profHigh = await curveProfile(page, 'canvas-curve');
  if (profLow && profHigh && profLow.W === profHigh.W) {
    const W = profLow.W;
    const band = (a, b) => { let diff = 0, n = 0; for (let x = a; x < b; x++) if (profLow.colTop[x] >= 0 && profHigh.colTop[x] >= 0) { diff += Math.abs(profLow.colTop[x] - profHigh.colTop[x]); n++; } return n ? +(diff / n).toFixed(3) : null; };
    trace.elbowDiff = band(Math.floor(W*0.30), Math.ceil(W*0.62));
    trace.leftWingDiff  = band(Math.floor(W*0.10), Math.ceil(W*0.20));
    trace.rightWingDiff = band(Math.floor(W*0.82), Math.ceil(W*0.95));
    trace.litLow = profLow.lit; trace.litHigh = profHigh.lit;
  }
  // engine ground-truth gLoc(u) at two tau (independent of the frame/render)
  trace.engineElbowWing = await page.evaluate(() => {
    const s0 = { ...Store.state.pool, phi: 0 };
    const gAtU = (tau, u) => { const wm = 0.5*(s0.wMinus+s0.wPlus), dw2 = 0.5*(s0.wPlus-s0.wMinus); const w = wm + dw2*u/Math.sqrt(tau*tau+u*u); return w/(1-w); };
    return { atm: { lo: gAtU(0.10,0), hi: gAtU(2.50,0) }, elbow: { lo: gAtU(0.10,0.3), hi: gAtU(2.50,0.3) },
             wingR: { lo: gAtU(0.10,10), hi: gAtU(2.50,10) }, wingL: { lo: gAtU(0.10,-10), hi: gAtU(2.50,-10) } };
  });
  await setTau(page, 0.30);

  // ---- item 4: gamma>1 guard ----
  await page.evaluate(() => { const e = document.getElementById('wminus-input'); e.value = '0.40'; e.dispatchEvent(new Event('change', { bubbles: true })); });
  await page.waitForTimeout(250);
  trace.wingClamp = await page.evaluate(() => ({ wminusInput: document.getElementById('wminus-input').value, poolWMinus: Store.state.pool.wMinus, status: document.getElementById('wcurve-status')?.textContent || '' }));
  await page.screenshot({ path: out('04_wing_clamp.png') });
  await setWings(page, 0.60, 0.85); // restore asym

  // ---- item 2: THE WARP — execute trade, confirm phi moves & curve reshapes ----
  await page.evaluate(() => { window.__curveFrame = null; });
  await page.waitForTimeout(50);
  await page.evaluate(() => { if (typeof Viz !== 'undefined' && Viz) Viz.drawAll(Store.state, null); });
  await page.waitForTimeout(200);
  trace.preTrade = (await liveSnap(page)).pool;
  await page.evaluate(() => { window.__LOCKFRAME = window.__curveFrame; });
  await page.screenshot({ path: out('05_pre_trade_curve.png') });
  const profPre = await curveProfile(page, 'canvas-curve');

  trace.warpDirect = await page.evaluate(() => {
    const before = { ...Store.state.pool };
    const wB = Engine.wField(before);
    const a = before.x * wB, b = before.y * (1 - wB);
    // pick dy that lands w* comfortably inside (w-,w+): aim w*≈0.75
    const wTarget = 0.75; const yNew = b / (1 - wTarget); const dy = yNew - before.y;
    const post = Engine.tradeUpdate(before, dy);
    if (!post) return { err: 'null' };
    if (post.rejected) return { rejected: true, reason: post.reason, triedDy: dy };
    Store.state.pool = post;
    return {
      dy, before: { x: before.x, y: before.y, phi: before.phi ?? 0, w: wB },
      after: { x: post.x, y: post.y, phi: post.phi, w: Engine.wField(post) },
      phiMoved: Math.abs((post.phi ?? 0) - (before.phi ?? 0)),
      wMoved: Math.abs(Engine.wField(post) - wB),
      onTrajectory: Math.abs((post.x - a) * (post.y - b) - a * b) / (a * b)
    };
  });
  await page.evaluate(() => { window.__curveFrame = window.__LOCKFRAME; if (typeof render === 'function') render(); if (typeof Viz !== 'undefined' && Viz) { window.__curveFrame = window.__LOCKFRAME; Viz.drawAll(Store.state, null); } });
  await page.waitForTimeout(300);
  await page.screenshot({ path: out('06_post_trade_curve.png') });
  const profPost = await curveProfile(page, 'canvas-curve');
  if (profPre && profPost && profPre.W === profPost.W) {
    const W = profPre.W;
    const band = (a, b) => { let diff = 0, n = 0; for (let x = a; x < b; x++) if (profPre.colTop[x] >= 0 && profPost.colTop[x] >= 0) { diff += Math.abs(profPre.colTop[x] - profPost.colTop[x]); n++; } return n ? +(diff / n).toFixed(3) : null; };
    trace.warpElbowDiff = band(Math.floor(W*0.30), Math.ceil(W*0.62));
    trace.warpFullDiff = band(0, W);
  }

  // ---- item 3: WING-RANGE GUARD ----
  trace.guardReject = await page.evaluate(() => {
    const s = { ...Store.state.pool };
    const post = Engine.tradeUpdate(s, s.y * 50);
    return post && post.rejected ? { rejected: true, reason: post.reason, wStar: post.wStar } : { rejected: false };
  });
  trace.guardMsg = await page.evaluate(() => {
    const s = { ...Store.state.pool };
    const r = Engine.executeLeg(s, 'sell', 'call', 0.3, null, 1e12, Engine.getMP_raw(s));
    return r && r.rejected ? r.reason : (r ? 'executed' : 'null');
  });
  trace.guardInBand = await page.evaluate(() => {
    const s = { ...Store.state.pool };
    const wB = Engine.wField(s); const b = s.y * (1 - wB);
    const dy = b / (1 - 0.72) - s.y;
    const post = Engine.tradeUpdate(s, dy);
    return post && !post.rejected ? { executed: true, phi: post.phi, newW: Engine.wField(post) } : { executed: false, reason: post && post.reason };
  });

  // ---- item 5: pricing/payoff render ----
  await page.selectOption('#chart-select', 'pricing'); await page.waitForTimeout(350);
  const pricingLit = await curveProfile(page, 'canvas-pricing');
  await page.screenshot({ path: out('07_pricing_mark.png') });
  await page.selectOption('#chart-select', 'payoff'); await page.waitForTimeout(350);
  const payoffLit = await curveProfile(page, 'canvas-payoff');
  await page.screenshot({ path: out('08_payoff.png') });
  trace.pricingLit = pricingLit ? pricingLit.lit : null;
  trace.payoffLit = payoffLit ? payoffLit.lit : null;

  // ---- item 6: honest labels ----
  trace.labels = await page.evaluate(() => {
    const all = document.body.innerText;
    const els = [...document.querySelectorAll('.sim-aid-label')];
    const e = els.find(x => /Trade mechanic/i.test(x.textContent));
    return { hasFullyProven: /fully proven/i.test(all), tradeMechanicText: e ? e.textContent.replace(/\s+/g,' ').trim() : null };
  });

  trace.consoleErrors = errs;
  fs.writeFileSync(out('trace.json'), JSON.stringify(trace, null, 2));
  log(JSON.stringify(trace, null, 2));
  await browser.close();
})();
