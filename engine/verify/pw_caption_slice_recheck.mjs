// CAPTION-SLICE QUICK RE-CHECK — build 0e0a006277a1c2215a3244d510691697
// (string/comment-only slice on e148c9b7: -TP339-CAPTION folded + R6 items 3/4).
// READ-ONLY on the engine. Verifies:
//   C1 load: 0 pageerrors, engine exports live, charts render (all 4 states)
//   C2 Invariant Watch caption = trade-point law (LOCAL (α_T,β_T); global α,β move
//      by design; machine-epsilon on ρ=1 paths)
//   C3 NO stale "trades preserve α, β" / "α/β-conserving" claim anywhere on page
//   C4 Pool State subtitle = "trade-point (α_T, β_T)-conserving · Identity IV on ρ=1 paths"
//   C5 chart-2 unit toggle btn = "fraction of escrow unit" (NOT "% of escrow unit"),
//      caption says "Fraction view"; toggle flips + returns byte-identical
//   C6 chart-2 values NOT rescaled: % X crossing x=462 v=0.15 + put-seam boundary
//      v=0.3307 (prior e148c9b7/7015c22c run values, ±1px)
//   C7 acceptance probe #2: Engine.tradeUpdateAt((10,10,5,5),+1,4) → 215/22 / 11 / 11/21
//   C8 one open/close round-trip restores (x,y,w,α,β) machine-exact
// Run: cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/pw_caption_slice_recheck.mjs A
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { execSync } from 'child_process';

const RUN = (process.argv[2] || 'A').toUpperCase();
const here = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.resolve(here, '../builds/HEAD_temporal_mvp_v28_lens.html');
const EVID = path.resolve(here, '../../evidence/caption_slice_recheck');
fs.mkdirSync(EVID, { recursive: true });
const LOG = []; const log = (s) => { LOG.push(s); console.log(s); };
const md5 = (f) => execSync('md5sum ' + f).toString().split(' ')[0];
const CHECKS = []; const ck = (n, p, d) => { CHECKS.push({ n, p, d }); log(`${p?'PASS':'FAIL'} ${n}  ${d}`); };
const r4 = (v) => Math.round(v * 1e4) / 1e4;

const MD5_EXP = '0e0a006277a1c2215a3244d510691697';
const md5pre = md5(BUILD);
log(`=== CAPTION-SLICE RECHECK run ${RUN}  build md5 ${md5pre} (expect ${MD5_EXP}) ===`);

const PAD = { top: 18, bottom: 54, left: 50, right: 18 };
const PLOT_W = 900 - PAD.left - PAD.right, PLOT_H = 380 - PAD.top - PAD.bottom;
const xAtPhi = (phi) => PAD.left + (phi / 90) * PLOT_W;
const vAtY = (y, yMax) => (1 - (y - PAD.top) / PLOT_H) * yMax;

const errors = [], dialogs = [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('console', m => { if (m.type() === 'error') errors.push('console:' + m.text()); });
page.on('pageerror', e => errors.push('pageerror:' + e.message));
page.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });

await page.goto('file://' + BUILD);
await page.waitForTimeout(600);

const setField = async (id, v) => page.evaluate(({ id, v }) => {
  const e = document.getElementById(id); e.value = String(v);
  e.dispatchEvent(new Event('input', { bubbles: true }));
  e.dispatchEvent(new Event('change', { bubbles: true }));
}, { id, v });
const click = async (sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; e.click(); return true; }, sel);
const canvasHash = async (id) => page.evaluate((cid) => {
  const c = document.getElementById(cid); return c ? c.toDataURL() : null;
}, id).then(d => d ? crypto.createHash('md5').update(d).digest('hex').slice(0, 12) : null);
const canvasNonBlank = async (id) => page.evaluate((cid) => {
  const c = document.getElementById(cid); if (!c) return null;
  const im = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let n = 0; for (let i = 0; i < im.length; i += 4) if (im[i + 3] > 0 && (im[i] || im[i + 1] || im[i + 2])) n++;
  return n;
}, id);
const snapPool = async () => page.evaluate(() => {
  const p = Store.state.pool;
  return { x: p.x, y: p.y, alpha: p.alpha, beta: p.beta, w: p.alpha / p.x,
           open: Store.state.bands.filter(b => b.status === 'open').length };
});
const goPage = async (p) => page.evaluate((pp) => { const n = document.querySelector(`.page-nav-link[data-page="${pp}"]`); if (n) n.click(); }, p);

// ── C1: load + all chart states render ─────────────────────────────────────
const boot = await page.evaluate(() => ({
  engine: typeof Engine === 'object' && typeof Engine.tradeUpdateAt === 'function' && typeof Engine.revertArc === 'function',
  store: typeof Store === 'object' && !!Store.state,
  oracle: Store.state.oracle, w: Engine.getW(Store.state.pool)
}));
const chartStates = {};
for (const v of await page.evaluate(() => [...document.getElementById('chart-select').options].map(o => o.value))) {
  await setField('chart-select', v); await page.waitForTimeout(200);
  const cid = await page.evaluate(() => {
    const w = [...document.querySelectorAll('.canvas-wrap')].find(x => x.style.display !== 'none' && x.offsetParent !== null);
    const c = w && w.querySelector('canvas'); return c ? c.id : null;
  });
  chartStates[v] = cid ? await canvasNonBlank(cid) : null;
}
ck('C1 load: engine exports live, 0 pageerrors, every chart state renders',
   boot.engine && boot.store && errors.length === 0 && Object.values(chartStates).every(n => n > 1500),
   `boot=${JSON.stringify(boot)} chartStates=${JSON.stringify(chartStates)} errors=${errors.length}`);

// ── C2/C3/C4/C5(text): rendered strings ────────────────────────────────────
const txt = await page.evaluate(() => {
  const secs = [...document.querySelectorAll('.panel-section')];
  const iv = secs.find(s => (s.querySelector('.panel-section-title') || {}).textContent?.includes('Invariant Watch'));
  const ivCaption = iv ? [...iv.querySelectorAll('.sim-aid-label')].map(e => e.innerText).join(' ') : '';
  const subs = [...document.querySelectorAll('.card-subtitle')].map(e => e.innerText.trim());
  const poolSub = subs.find(s => s.includes('trade-point') || s.includes('conserving')) || '';
  const btnPct = (document.getElementById('pricing-unit-pct') || {}).textContent?.trim();
  const btnUsd = (document.getElementById('pricing-unit-usd') || {}).textContent?.trim();
  const wrap = document.querySelector('.canvas-wrap[data-chart="pricing"]');
  const pricingCaption = wrap ? (wrap.querySelector('.caption') || {}).innerText || '' : '';
  const body = document.body.innerText;
  return { ivCaption, poolSub, btnPct, btnUsd, pricingCaption,
           stale_tradesPreserve: body.includes('trades preserve'),
           stale_abConserving: body.includes('α/β-conserving'),
           stale_pctEscrow: body.includes('% of escrow unit'),
           arbCaption: (body.match(/Click to execute[^\n]*/) || [''])[0] };
});
ck('C2 Invariant Watch caption = trade-point law (LOCAL pair; global α,β move by design; machine-eps on ρ=1)',
   txt.ivCaption.includes('Trade-point law') && txt.ivCaption.includes('LOCAL pair (α_T, β_T)')
     && /global α, β MOVE/i.test(txt.ivCaption) && txt.ivCaption.includes('BY DESIGN')
     && txt.ivCaption.includes('Machine-epsilon') && txt.ivCaption.includes('ρ=1 paths'),
   JSON.stringify(txt.ivCaption));
ck('C3 NO stale claim on page: no "trades preserve", no "α/β-conserving", no "% of escrow unit"',
   !txt.stale_tradesPreserve && !txt.stale_abConserving && !txt.stale_pctEscrow,
   `tradesPreserve=${txt.stale_tradesPreserve} abConserving=${txt.stale_abConserving} pctEscrow=${txt.stale_pctEscrow} arbCaption(scoped ρ=1 claim, kept)=${JSON.stringify(txt.arbCaption)}`);
ck('C4 Pool State subtitle = "closed-form · trade-point (α_T, β_T)-conserving · Identity IV on ρ=1 paths"',
   txt.poolSub === 'closed-form · trade-point (α_T, β_T)-conserving · Identity IV on ρ=1 paths',
   JSON.stringify(txt.poolSub));
ck('C5a toggle btn = "fraction of escrow unit" (+ "$ value"); caption says "Fraction view"',
   txt.btnPct === 'fraction of escrow unit' && txt.btnUsd === '$ value' && txt.pricingCaption.includes('Fraction view'),
   `btnPct=${JSON.stringify(txt.btnPct)} btnUsd=${JSON.stringify(txt.btnUsd)} captionHasFractionView=${txt.pricingCaption.includes('Fraction view')}`);

// ── C6: chart-2 values NOT rescaled (prior-run anchors) ────────────────────
await setField('band-notional', ''); await setField('sold-inner', ''); await setField('bought-inner', '');
await setField('chart-select', 'pricing'); await page.waitForTimeout(200);
await setField('m-input', 2); await page.waitForTimeout(250);
const prof = await page.evaluate(({ pad, plotW, plotH }) => {
  const c = document.getElementById('canvas-pricing');
  const im = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  const W = c.width;
  const match = (i, v) => im[i + 3] > 200 && im[i] === v[0] && im[i + 1] === v[1] && im[i + 2] === v[2];
  const COLORS = { put: [255, 133, 176], call: [10, 186, 181] };
  const out = { put: {}, call: {} };
  for (let x = pad.left; x <= pad.left + plotW; x++)
    for (let y = pad.top - 2; y <= pad.top + plotH + 2; y++) {
      const i = (y * W + x) * 4;
      for (const [k, v] of Object.entries(COLORS)) if (match(i, v)) {
        const o = out[k]; if (!o[x]) o[x] = { yMin: y, yMax: y }; o[x].yMin = Math.min(o[x].yMin, y); o[x].yMax = Math.max(o[x].yMax, y);
      }
    }
  return out;
}, { pad: PAD, plotW: PLOT_W, plotH: PLOT_H });
const midY = (p, x) => { const c = p[x]; return c ? (c.yMin + c.yMax) / 2 : null; };
const xATM = xAtPhi(45);
let best = null;
for (let x = Math.round(xATM) - 10; x <= Math.round(xATM) + 10; x++) {
  const a = midY(prof.put, x), b = midY(prof.call, x);
  if (a !== null && b !== null) { const g = Math.abs(a - b); if (!best || g < best.gap) best = { x, gap: g, y: (a + b) / 2 }; }
}
const vCross = best ? r4(vAtY(best.y, 1.05)) : NaN;
// prior R3c anchor VERBATIM: nearestMidY(P, round(xAtPhi(PHI_PUT_SEAM)) - 3, 3)
const xSeam = Math.round(xAtPhi(Math.atan(1.5) * 180 / Math.PI)) - 3;
let seamMid = null;
for (let d = 0; d <= 3 && seamMid === null; d++) for (const xx of [xSeam - d, xSeam + d]) { const m = midY(prof.put, xx); if (m !== null) { seamMid = { x: xx, y: m }; break; } }
const vSeam = seamMid ? r4(vAtY(seamMid.y, 1.05)) : NaN;
await page.screenshot({ path: path.join(EVID, `${RUN}_chart2_pct_m2.png`),
  clip: await page.evaluate(() => { const r = document.getElementById('canvas-pricing').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }) });
ck('C6 chart-2 NOT rescaled: % X crossing x=462 v=0.15 + put-seam boundary v=0.3307 (prior-run anchors ±1px)',
   best && Math.abs(best.x - 462) <= 1 && Math.abs(vCross - 0.15) <= 0.005 && Math.abs(vSeam - 0.3307) <= 1.05 / PLOT_H + 1e-9,
   `crossing x=${best && best.x} (prior 462) v=${vCross} (prior 0.15) · seam v=${vSeam} (prior 0.3307) @x=${seamMid && seamMid.x}`);

// C5b: toggle flips + returns byte-identical
const hPct0 = await canvasHash('canvas-pricing');
await click('#pricing-unit-usd'); await page.waitForTimeout(250);
const hUsd = await canvasHash('canvas-pricing');
const usdActive = await page.evaluate(() => document.getElementById('pricing-unit-usd').classList.contains('active'));
await click('#pricing-unit-pct'); await page.waitForTimeout(250);
const hPct1 = await canvasHash('canvas-pricing');
ck('C5b unit toggle flips ($ hash differs, active class moves) and returns byte-identical',
   hUsd !== hPct0 && usdActive && hPct1 === hPct0,
   `pct0=${hPct0} usd=${hUsd} pct1=${hPct1} usdActive=${usdActive}`);

// ── C7: acceptance probe #2 (tradeUpdateAt exhibit) ────────────────────────
const probe = await page.evaluate(() => {
  const s = { x: 10, y: 10, alpha: 5, beta: 5 };
  const r = Engine.tradeUpdateAt(s, 1, 4);
  const w = r ? r.alpha / r.x : NaN;
  return { x: r && r.x, y: r && r.y, w, srcUnchanged: s.x === 10 && s.alpha === 5 };
});
ck('C7 exhibit: tradeUpdateAt((10,10,5,5),+1,4) → x=215/22, y=11, w=11/21 (NOT naive 22/43)',
   Math.abs(probe.x - 215 / 22) <= 1e-13 && probe.y === 11 && Math.abs(probe.w - 11 / 21) <= 1e-15
     && Math.abs(probe.w - 22 / 43) > 1e-3 && probe.srcUnchanged,
   `x=${probe.x} y=${probe.y} w=${probe.w}`);

// ── C8: one open/close round-trip machine-exact ────────────────────────────
await setField('m-input', 1); await page.waitForTimeout(100);
const pre = await snapPool();
await goPage('transact');
await click('.tab[data-subtab="bands"]'); await page.waitForTimeout(80);
await page.evaluate(() => { const p = document.getElementById('band-dir-sell'); if (p.dataset.dir !== 'long') p.click(); });
await setField('sold-inner', 120000); await setField('bought-inner', 48000); await setField('band-notional', 0.03);
await page.waitForTimeout(120);
await click('#btn-execute'); await page.waitForTimeout(200);
const mid = await snapPool();
const band = await page.evaluate(() => { const o = Store.state.bands.filter(b => b.status === 'open'); return o.length ? o[o.length - 1].id : null; });
await goPage('portfolio');
await page.evaluate(() => { const t = document.querySelector('.tab[data-subtab-pf="bands"]'); if (t) t.click(); });
await page.waitForTimeout(120);
await page.evaluate((id) => { const b = document.querySelector(`button[data-close-band="${id}"]`); if (b) b.click(); }, band);
await page.waitForTimeout(200);
const post = await snapPool();
const rel = (a, b) => Math.abs(a - b) / Math.max(1e-30, Math.abs(b));
ck('C8 open/close round-trip restores (x,y,w,α,β) machine-exact (open re-leans w)',
   band !== null && mid.open === pre.open + 1 && post.open === pre.open
     && Math.abs(mid.w - pre.w) > 1e-9
     && rel(post.x, pre.x) <= 1e-9 && rel(post.y, pre.y) <= 1e-9 && rel(post.w, pre.w) <= 1e-9
     && rel(post.alpha, pre.alpha) <= 1e-9 && rel(post.beta, pre.beta) <= 1e-9,
   `openΔw=${(mid.w - pre.w).toExponential(3)} restore rel: x=${rel(post.x, pre.x).toExponential(2)} y=${rel(post.y, pre.y).toExponential(2)} w=${rel(post.w, pre.w).toExponential(2)} α=${rel(post.alpha, pre.alpha).toExponential(2)} β=${rel(post.beta, pre.beta).toExponential(2)}`);

// ── wrap-up ────────────────────────────────────────────────────────────────
ck('C9 zero errors/dialogs across the whole run', errors.length === 0 && dialogs.length === 0,
   `errors=${JSON.stringify(errors)} dialogs=${JSON.stringify(dialogs)}`);
await browser.close();
const md5post = md5(BUILD);
ck('C10 build md5 unchanged pre/post AND == expected slice md5',
   md5pre === MD5_EXP && md5post === MD5_EXP, `pre=${md5pre} post=${md5post}`);

const nFail = CHECKS.filter(c => !c.p).length;
log(`=== RESULT: ${CHECKS.length - nFail}/${CHECKS.length} PASS ===`);
fs.writeFileSync(path.join(EVID, `RESULT_run${RUN}.json`), JSON.stringify({ build: md5pre, checks: CHECKS }, null, 2));
fs.writeFileSync(path.join(EVID, `RUN_LOG_run${RUN}.txt`), LOG.join('\n') + '\n');
process.exit(nFail ? 1 : 0);
