// Supplementary geometry probe (READ-ONLY). The chord-sagitta bend metric in
// the main harness is dominated by the curve's asymptotic tails (u=±6) and is a
// poor lens on the *visible elbow*. Here we measure, against the live pool:
//   (a) live-vs-symmetric-anchor divergence over a shared u grid (the bend), and
//   (b) local elbow curvature in a window around the reserves point, across tau.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const ENGINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD  = path.join(ENGINE, 'builds', 'reference', 'temporal_mvp_v24_kurtosis.html');
const EVID   = path.resolve(ENGINE, '..', 'evidence', 'v24_kurtosis_pw');
const out = (n) => path.join(EVID, n);

async function setInput(page, id, val) {
  await page.evaluate(({ id, val }) => {
    const el = document.getElementById(id);
    el.value = String(val);
    el.dispatchEvent(new Event('change'));
  }, { id, val });
  await page.waitForTimeout(80);
}

// Returns metrics computed from the live pool's OWN gh params, reproducing the
// page's curveTraceTau math exactly, plus the symmetric anchor (dw=0).
function probe() {
  const p = Store.state.pool;
  const wmid = p.ghMid, dw = (p.ghTilt !== undefined ? p.ghTilt : 0), tau = p.ghTau;
  const X0 = p.ghX0, Y0 = p.ghY0, al = p.alpha, be = p.beta;
  const N = 800, logRange = 6;
  const pt = (u, useDw) => {
    const dwv = useDw ? dw : 0;
    const Wv = wmid * u + 0.5 * dwv * (Math.sqrt(tau * tau + u * u) - tau);
    const eW = Math.exp(Wv);
    return [X0 * eW * Math.exp(-u) + al, Y0 * eW + be];
  };
  // (a) max relative divergence live-vs-anchor in y at matched u, restricted to
  // the visible frame window (x,y within ~3x of the eq dot, per the frozen frame).
  const o = Store.state.oracle;
  const xEq = al + Math.sqrt(al * be / o), yEq = be + Math.sqrt(al * be * o);
  let maxRelDiv = 0, divAtU = null;
  for (let i = 0; i <= N; i++) {
    const u = -logRange + 2 * logRange * i / N;
    const [lx, ly] = pt(u, true);
    const [ax, ay] = pt(u, false);
    if (lx > 0 && lx < xEq * 3 && ly > 0 && ly < yEq * 3) {
      const rel = Math.abs(ly - ay) / ay;
      if (rel > maxRelDiv) { maxRelDiv = rel; divAtU = u; }
    }
  }
  // (b) local elbow curvature: second-difference of y(x) sampled in a tight
  // window of u near the mode (u in [-1.5, 1.5]), summed |curvature|.
  let curv = 0; const wpts = [];
  for (let u = -1.5; u <= 1.5 + 1e-9; u += 0.05) wpts.push(pt(u, true));
  for (let i = 1; i < wpts.length - 1; i++) {
    const a = wpts[i - 1], b = wpts[i], c = wpts[i + 1];
    // cross product magnitude of (b-a)x(c-b) normalised — turning per step
    const v1x = b[0] - a[0], v1y = b[1] - a[1];
    const v2x = c[0] - b[0], v2y = c[1] - b[1];
    const cross = Math.abs(v1x * v2y - v1y * v2x);
    const denom = (Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y)) || 1;
    curv += cross / denom;
  }
  return { tau: p.ghTau, tilt: p.ghTilt, xEq, yEq, maxRelDiv, divAtU, localCurv: curv };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  await page.goto('file://' + BUILD, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.click('.tabs .tab[data-subtab="settings"]');

  const res = {};
  // tilt sweep at tau=1
  await setInput(page, 'kurt-tau-input', 1);
  await setInput(page, 'kurt-tilt-input', 0);
  res.tilt0 = await page.evaluate(probe);
  await setInput(page, 'kurt-tilt-input', 0.4);
  res.tilt04 = await page.evaluate(probe);
  await setInput(page, 'kurt-tilt-input', 0.8);
  res.tilt08 = await page.evaluate(probe);
  // tau sweep at tilt=0.4
  await setInput(page, 'kurt-tilt-input', 0.4);
  await setInput(page, 'kurt-tau-input', 0.1);
  res.tau01 = await page.evaluate(probe);
  await setInput(page, 'kurt-tau-input', 1);
  res.tau1 = await page.evaluate(probe);
  await setInput(page, 'kurt-tau-input', 20);
  res.tau20 = await page.evaluate(probe);

  fs.writeFileSync(out('probe.json'), JSON.stringify(res, null, 2));
  console.log(JSON.stringify(res, null, 2));
  await browser.close();
})();
