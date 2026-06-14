// -A14b KURTOSIS-vs-WARP targeted live test — HEAD de28c937 (READ-ONLY).
// Operator entries 184/185/203. Two halves of one honest nuance:
//   ITEM 1 — the UNDERLYING swap-warp (dy = N·θ·oracle, premium-free) is
//            kurtosis-FREE: Δw / Δsteepness IDENTICAL across τ = 1.0/0.3/0.05.
//   ITEM 2 — the SEEN warp (chart-2 lensed option-value reshape) DOES depend
//            on kurtosis: sharper τ ⇒ bigger reshape near the money.
//   ITEM 3 — net for operator: entry-185 intuition confirmed/corrected.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUILD = resolve(__dirname, '../builds/HEAD_temporal_mvp_v28_lens.html');
const RUN = process.argv[2] || 'A';
const OUT = resolve(__dirname, '../../evidence/v28_a14_kurtosis');
mkdirSync(OUT, { recursive: true });
const url = 'file://' + BUILD;
const L = [];
const log = (s) => { L.push(s); console.log(s); };
const consoleErrs = [], pageErrs = [];

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', m => { if (m.type() === 'error') consoleErrs.push(m.text()); });
  page.on('pageerror', e => pageErrs.push(String(e)));
  const dialogs = [];
  page.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  log(`=== -A14b KURTOSIS-vs-WARP run ${RUN} — ${BUILD} ===`);

  // ─────────────────────────────────────────────────────────────────────────
  // ITEM 1 — UNDERLYING swap-warp is kurtosis-FREE.
  // Same single sold call (fixed N + strike) executed at τ = 1.0/0.3/0.05.
  // executeLeg's dy = (wingSign·legSign)·N·(θ·oracle) — τ is NOT an input to
  // the swap. Δsteepness = dy/β. Expect dy, Δw, Δsteepness IDENTICAL across τ.
  // ─────────────────────────────────────────────────────────────────────────
  log('\n--- ITEM 1: UNDERLYING swap-warp vs kurtosis (sold call N=0.1, K=120000, oracle 80000) ---');
  const item1 = await page.evaluate(() => {
    const oracle = 80000, N = 0.1, theta = 1.5;   // K = θ·oracle = $120,000 (1.5× = OTM call)
    const base = JSON.parse(JSON.stringify(Store.state.pool));
    const w0 = Engine.getW(base);
    const beta = base.beta;
    const rows = [];
    for (const tau of [1.0, 0.3, 0.05]) {
      const leg = Engine.executeLeg(base, 'sell', 'call', theta, NaN, N, oracle, tau);
      if (!leg || leg.rejected) { rows.push({ tau, rejected: leg && leg.reason }); continue; }
      const wPost = Engine.getW(leg.newState);
      rows.push({
        tau,
        K_usd: leg.K_usd,
        dy: leg.dy,
        dw: wPost - w0,
        dSteepness_dyOverBeta: leg.dy / beta,   // the operator's Δsteepness proxy
        dxReserve: leg.newState.x - base.x,
        dyReserve: leg.newState.y - base.y,
        V_lensed: leg.V                          // the LENSED leg value (this DOES move with τ) — for contrast
      });
    }
    // identity check across the τ rows
    const dys = rows.filter(r=>!r.rejected).map(r=>r.dy);
    const dws = rows.filter(r=>!r.rejected).map(r=>r.dw);
    const maxDyDiff = Math.max(...dys) - Math.min(...dys);
    const maxDwDiff = Math.max(...dws) - Math.min(...dws);
    return { rows, w0, beta, maxDyDiff, maxDwDiff };
  });
  log('  w0=' + item1.w0 + '  beta=' + item1.beta);
  for (const r of item1.rows) log('  τ=' + r.tau + ' : ' + JSON.stringify(r));
  log('  >> spread across τ:  max|Δdy|=' + item1.maxDyDiff.toExponential(3) +
      '   max|Δw spread|=' + item1.maxDwDiff.toExponential(3));
  log('  >> (V_lensed shown for contrast — the LENSED leg value DOES move with τ; the SWAP dy does not.)');

  // ─────────────────────────────────────────────────────────────────────────
  // ITEM 2 — SEEN warp (chart-2 option-value reshape) DOES depend on kurtosis.
  // Fix the trade (same sold-call band staged). Sweep τ. At each τ measure the
  // option-value reshape = | ψ_post(θ) − ψ_pre(θ) | at representative strikes,
  // where ψ = markLensed(wing, θ, sNorm, gLoc(pool, θ, τ)). pre = live pool /
  // live mode; post = preview pool / shifted mode. Bigger near-money reshape at
  // sharper τ. Also rendered perpendicular px separation pre→post on chart-2.
  // ─────────────────────────────────────────────────────────────────────────
  log('\n--- ITEM 2: SEEN warp (chart-2 lensed reshape) vs kurtosis ---');
  const item2 = await page.evaluate(() => {
    // Build pre/post pools for a fixed sold-call trade (the UNDERLYING warp is
    // τ-free, so the SAME dy is used for every τ — only the lens reading changes).
    const oracle = 80000, N = 0.5, theta = 1.5;    // K=$120k OTM call, 0.5 BTC for a legible warp
    const pre = JSON.parse(JSON.stringify(Store.state.pool));
    const legRef = Engine.executeLeg(pre, 'sell', 'call', theta, NaN, N, oracle, 0.3);
    const post = legRef.newState;                  // τ-independent post pool
    const sPre = Engine.getSNorm(pre), sPost = Engine.getSNorm(post);
    // representative call-side strikes (θ = K/oracle), near-money → far-OTM
    const thetas = [
      { lbl: 'ATM θ=1.0  ($80k)',  th: 1.0 },
      { lbl: 'near θ=1.25 ($100k)',th: 1.25 },
      { lbl: 'at   θ=1.5  ($120k)',th: 1.5 },
      { lbl: 'OTM  θ=2.0  ($160k)',th: 2.0 },
      { lbl: 'far  θ=4.0  ($320k)',th: 4.0 },
    ];
    const psi = (pool, sNorm, th, tau) => {
      const g = Engine.gLoc(pool, th, tau);
      if (!isFinite(g) || g <= 0) return Math.min(1, sNorm/th); // call ATM/flat-top
      const v = Engine.markLensed('call', th, sNorm, g);
      return (isFinite(v) && v >= 0) ? Math.min(1, v) : 0;
    };
    const out = [];
    for (const tau of [1.0, 0.3, 0.05]) {
      const gaps = thetas.map(t => {
        const pPre = psi(pre, sPre, t.th, tau);
        const pPost = psi(post, sPost, t.th, tau);
        return { lbl: t.lbl, pre: pPre, post: pPost, gap: Math.abs(pPost - pPre) };
      });
      const maxGap = Math.max(...gaps.map(g => g.gap));
      const nearMoneyGap = gaps[1].gap;   // θ=1.25
      out.push({ tau, maxGap, nearMoneyGap, gaps });
    }
    return { sPre, sPost, dy: legRef.dy, out };
  });
  log('  fixed trade: sold call N=0.5 K=$120k → dy=' + item2.dy.toFixed(2) +
      '  mode sNorm ' + item2.sPre.toFixed(6) + ' → ' + item2.sPost.toFixed(6) + ' (τ-free shift)');
  for (const o of item2.out) {
    log('  τ=' + o.tau + ' : max option-value reshape = ' + o.maxGap.toFixed(6) +
        '  | near-money(θ=1.25) reshape = ' + o.nearMoneyGap.toFixed(6));
    for (const g of o.gaps) log('        ' + g.lbl + ' : ψ ' + g.pre.toFixed(5) + ' → ' + g.post.toFixed(5) + '  Δ=' + g.gap.toFixed(6));
  }

  // ── ITEM 2 (rendered): chart-2 dashed-curve perpendicular px separation
  // pre→post for the SAME fixed trade, at each τ. Bigger px at sharper τ.
  log('\n--- ITEM 2 (rendered px): chart-2 pre vs post dashed-curve separation per τ ---');
  for (const tau of [1.0, 0.3, 0.05]) {
    const px = await measureRenderedReshape(page, tau);
    log('  τ=' + tau + ' : rendered chart-2 pre→post pxdiff = ' + px.pxdiff +
        '  litPre=' + px.litPre + '  litPost=' + px.litPost +
        (px.warn ? '  [warn: ' + px.warn + ']' : ''));
    await page.screenshot({ path: `${OUT}/${RUN}_item2_tau${String(tau).replace('.','p')}.png` });
  }

  // ── On-screen value capture: the live slippage readout beside the band at
  // each τ (a quoted on-screen value that moves with kurtosis), for the record.
  log('\n--- on-screen band slippage readout vs τ (quoted) ---');
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const onscreen = await page.evaluate(async () => {
    const sel = document.getElementById('chart-select');
    sel.value='pricing'; sel.dispatchEvent(new Event('change',{bubbles:true}));
    const dpill = document.getElementById('band-dir-sell');
    if (dpill && dpill.dataset.dir !== 'long') dpill.click();
    function set(id,v){ const e=document.getElementById(id); if(e){ e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); } }
    set('sold-inner','120000'); set('bought-inner','60000'); set('band-notional','0.3');
    await new Promise(r=>setTimeout(r,500));
    const tau = document.getElementById('tau-input');
    const rows = [];
    for (const t of [1.0, 0.3, 0.05]) {
      tau.value = String(t); tau.dispatchEvent(new Event('input',{bubbles:true}));
      await new Promise(r=>setTimeout(r,400));
      const sl = document.getElementById('band-slippage');
      rows.push({ tau: t, slippage: sl ? sl.textContent.trim() : null });
    }
    return rows;
  });
  for (const r of onscreen) log('  τ=' + r.tau + ' : band-slippage on screen = ' + JSON.stringify(r.slippage));

  log('\n--- ERRORS ---');
  log('  console errors: ' + consoleErrs.length + (consoleErrs.length?' '+JSON.stringify(consoleErrs.slice(0,5)):''));
  log('  page errors   : ' + pageErrs.length + (pageErrs.length?' '+JSON.stringify(pageErrs.slice(0,5)):''));
  log('  dialogs       : ' + dialogs.length + (dialogs.length?' '+JSON.stringify(dialogs):''));

  await browser.close();
  writeFileSync(`${OUT}/RUN_LOG_run${RUN}.txt`, L.join('\n') + '\n');
}

// Rendered chart-2 reshape (pre vs post the SAME fixed sold-call trade) at a
// given τ. Loads fresh, sets τ, captures chart-2 with band CLEARED (pre), then
// stages the fixed band and lets the sweep land (post), diffs.
async function measureRenderedReshape(page, tau) {
  return await page.evaluate(async (tau) => {
    const sel = document.getElementById('chart-select');
    sel.value='pricing'; sel.dispatchEvent(new Event('change',{bubbles:true}));
    await new Promise(r=>setTimeout(r,150));
    const tauI = document.getElementById('tau-input');
    tauI.value = String(tau); tauI.dispatchEvent(new Event('input',{bubbles:true}));
    await new Promise(r=>setTimeout(r,250));
    const cv = document.getElementById('canvas-pricing'); const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const read = () => ctx.getImageData(0,0,W,H).data;
    const litCount = (d) => { let n=0; for (let i=0;i<d.length;i+=4){ if (d[i+3]>10 && (d[i]+d[i+1]+d[i+2])>60) n++; } return n; };
    const si = document.getElementById('sold-inner'), bi = document.getElementById('bought-inner'), bn = document.getElementById('band-notional');
    function set(e,v){ if(e){ e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); } }
    // PRE: clear band, capture solid curve only
    for (const e of [si,bi,bn]) set(e,'');
    await new Promise(r=>setTimeout(r,500));
    const pre = read().slice(); const litPre = litCount(pre);
    // POST: stage the fixed sold call, let sweep land
    const dpill = document.getElementById('band-dir-sell');
    if (dpill && dpill.dataset.dir !== 'long') dpill.click();
    set(si,'120000'); set(bi,'60000'); set(bn,'0.5');
    await new Promise(r=>setTimeout(r,1400));
    const post = read(); const litPost = litCount(post);
    let pd=0; for (let i=0;i<pre.length;i+=4){ if (pre[i]!==post[i]||pre[i+1]!==post[i+1]||pre[i+2]!==post[i+2]) pd++; }
    const warn = document.getElementById('warn-area');
    return { pxdiff: pd, litPre, litPost, warn: warn && warn.textContent.trim() ? warn.textContent.trim() : null };
  }, tau);
}

main().catch(e => { console.error(e); process.exit(1); });
