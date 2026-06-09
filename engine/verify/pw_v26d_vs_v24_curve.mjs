// READ-ONLY apple-to-apple curve comparison: v24 (Balancer weight-form) vs v26d (GH native).
// No engine edits. Loads each build file://, screenshots the default-open Pool Curve canvas,
// composes a side-by-side, and re-plots the GH curve auto-fit to its own range.
import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;

const V24  = process.env.V24_PATH;
const V26D = '/home/user/Perp-Options-AMM/engine/builds/temporal_mvp_v26d_volknob.html';
const OUT  = '/home/user/Perp-Options-AMM/evidence/v26d_vs_v24_curve';

async function loadBuild(browser, path, label) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + path, { waitUntil: 'load' });
  // curve view is the default-active canvas-wrap; give the draw a beat
  await page.waitForTimeout(1500);
  // ensure curve view selected explicitly (idempotent)
  await page.evaluate(() => {
    const s = document.getElementById('chart-select');
    if (s && s.value !== 'curve') { s.value = 'curve'; s.dispatchEvent(new Event('change')); }
  });
  await page.waitForTimeout(800);

  // canvas non-blank check
  const diag = await page.evaluate(() => {
    const cv = document.getElementById('canvas-curve');
    if (!cv) return { found: false };
    const ctx = cv.getContext('2d');
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let nz = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) nz++;
    return { found: true, w: cv.width, h: cv.height, nonblank: nz, total: d.length / 4 };
  });
  console.log(`[${label}] canvas`, JSON.stringify(diag), 'pageerrors=', errs.length);

  // crop the curve canvas region for the screenshot
  const cvBox = await page.locator('#canvas-curve').boundingBox();
  return { page, diag, cvBox, errs };
}

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox']
  });

  // ---- v24 ----
  const v24 = await loadBuild(browser, V24, 'v24');
  await v24.page.locator('#canvas-curve').screenshot({ path: `${OUT}/v24_curve.png` });

  // ---- v26d ----
  const v26 = await loadBuild(browser, V26D, 'v26d');
  await v26.page.locator('#canvas-curve').screenshot({ path: `${OUT}/current_curve.png` });

  // ---- extract the GH curve's real data + range from the current build ----
  const gh = await v26.page.evaluate(() => {
    // reproduce the page's own curveTrace via Engine.arbitrageToOracle over mp0*e^(-6..6)
    const snap = (typeof Store !== 'undefined' && Store.state)
      ? (typeof snapshot === 'function' ? null : null) : null;
    // snapshot() is a UI fn not bare-reachable; rebuild from Engine + Store.state.pool
    const pool = Store.state.pool;
    const oracle = Store.state.oracle;
    // build a snap object the Engine fns accept: they take the pool snap shape
    // Engine.getMP_raw / arbitrageToOracle operate on the pool snapshot; the UI
    // snapshot() just wraps Store.state.pool. Use the live snapshot the page made
    // by calling Engine on the pool directly.
    const s = Object.assign({}, pool);
    const mp0 = Engine.getMP_raw(s);
    const N = 400, pts = [];
    for (let i = 0; i <= N; i++) {
      const o = mp0 * Math.exp(-6 + 12 * i / N);
      const st = Engine.arbitrageToOracle(s, o);
      if (st && st.x > 0 && st.y > 0) pts.push([st.x, st.y]);
    }
    const eq = Engine.arbitrageToOracle(s, oracle);
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    return {
      mp0, oracle,
      eq: eq ? { x: eq.x, y: eq.y } : null,
      frame: { xMax: (eq ? eq.x : s.x) * 3, yMax: (eq ? eq.y : s.y) * 3 },
      n: pts.length,
      xMin: Math.min(...xs), xMax: Math.max(...xs),
      yMin: Math.min(...ys), yMax: Math.max(...ys),
      pts
    };
  });
  console.log('[v26d] GH curve range:', JSON.stringify({
    mp0: gh.mp0, oracle: gh.oracle, eq: gh.eq, frame: gh.frame,
    n: gh.n, xMin: gh.xMin, xMax: gh.xMax, yMin: gh.yMin, yMax: gh.yMax
  }));

  // ---- re-plot the SAME GH data on a fresh canvas, axes auto-fit to the curve ----
  const replotPage = await browser.newPage({ viewport: { width: 760, height: 520 } });
  await replotPage.setContent('<canvas id="c" width="700" height="460" style="background:#0d1117"></canvas>');
  await replotPage.evaluate((data) => {
    const cv = document.getElementById('c');
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H);
    const pad = { top: 22, right: 18, bottom: 46, left: 78 };
    const pw = W - pad.left - pad.right, ph = H - pad.top - pad.bottom;
    // auto-fit to curve range (with a small margin)
    const x0 = 0, x1 = data.xMax * 1.02;
    const y0 = data.yMin * 0.98, y1 = data.yMax * 1.02;
    const toPx = (x, y) => [pad.left + ((x - x0) / (x1 - x0)) * pw,
                            pad.top + (1 - (y - y0) / (y1 - y0)) * ph];
    // axes
    ctx.strokeStyle = '#9B9FA3'; ctx.lineWidth = 1;
    const [ox, oy] = toPx(x0, y0); const [xE] = toPx(x1, y0); const [, yE] = toPx(x0, y1);
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(xE, oy); ctx.moveTo(ox, oy); ctx.lineTo(ox, yE); ctx.stroke();
    // curve
    ctx.strokeStyle = '#0ABAB5'; ctx.lineWidth = 2.5; ctx.beginPath();
    data.pts.forEach((p, i) => { const [px, py] = toPx(p[0], p[1]); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
    ctx.stroke();
    // eq marker
    if (data.eq) { const [px, py] = toPx(data.eq.x, data.eq.y);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px, py, 4, 0, 7); ctx.fill(); }
    // labels
    ctx.fillStyle = '#E4E4E4'; ctx.font = '12px sans-serif';
    ctx.fillText('y reserve (USD)', 6, 14);
    ctx.fillText('x reserve (BTC)', W - 110, H - 8);
    ctx.fillStyle = '#9B9FA3'; ctx.font = '11px sans-serif';
    ctx.fillText('y: $' + Math.round(y0).toLocaleString() + '  –  $' + Math.round(y1).toLocaleString(), pad.left, H - 26);
    ctx.fillText('x: 0  –  ' + x1.toFixed(0) + ' BTC', pad.left, H - 12);
  }, gh);
  await replotPage.locator('#c').screenshot({ path: `${OUT}/current_slope_corrected.png` });

  await browser.close();

  // emit a small JSON of the measured numbers for the README
  console.log('RANGE_JSON ' + JSON.stringify({
    v24: { canvas: v24.diag, pageerrors: v24.errs.length },
    v26d: { canvas: v26.diag, pageerrors: v26.errs.length,
            eq: gh.eq, oracle: gh.oracle, mp0: gh.mp0,
            curve_xrange: [gh.xMin, gh.xMax], curve_yrange: [gh.yMin, gh.yMax],
            frame_eqx3: gh.frame }
  }));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
