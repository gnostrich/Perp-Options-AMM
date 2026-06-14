// TEST-ONLY live verification — HEAD v27 (md5 1eebfcd6), NO build edit.
// CHECK 1: premium-controlled warp (operator entry 30).
// CHECK 2: vertical-spread == single composite-ray AMM tx.
// Drives the REAL UI (Add Perp -> Trade Bands), reads rendered DOM, AND reads the
// live page Engine/Store for the phi-warp truth + curveTraceW pixel displacement.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = 'file://' + path.resolve(__dirname, '../builds/HEAD_temporal_mvp_v27_wkurtosis.html');
const OUT = path.resolve(__dirname, '../../evidence/v27_premwarp');
fs.mkdirSync(OUT, { recursive: true });

const log = (...a) => console.log(...a);

async function setNum(page, id, val) {
  await page.fill('#' + id, '');
  await page.fill('#' + id, String(val));
  await page.dispatchEvent('#' + id, 'input');
  await page.dispatchEvent('#' + id, 'change');
}

async function addPerp(page) {
  await page.click('.tab[data-subtab="perps"]');
  await setNum(page, 'perp-notional', '2');     // 2 BTC notional perp to give the club room
  await setNum(page, 'perp-margin', '40000');   // generous margin
  await page.click('#btn-add-perp');
  await page.waitForTimeout(150);
}

// Read the live-engine warp + curve pixel-displacement metric for a sold-only leg.
// Returns { phiSold, phiBand, dyUsd, mark, thetaStar, Vsell, slipBandPct, pxDisp, rejected, reason }
async function probe(page, { soldInner, soldOuter, notional, boughtInner }) {
  return await page.evaluate(({ soldInner, soldOuter, notional, boughtInner }) => {
    const s = Store.state;
    const o = s.oracle;
    const sold = { inner: soldInner / o, outer: (soldOuter && soldOuter > 0) ? soldOuter / o : NaN };
    // bought leg: a put OTM (below spot) to keep band valid; auto-N derived in engine
    const bought = { inner: boughtInner / o, outer: NaN };
    const sim = Engine.executeBand(s.pool, 'call', 'put', sold, bought, notional, o, s.oracle_initial);
    if (!sim.ok) return { rejected: true, reason: sim.reason };

    // --- premium-warp truth: phi of the post-SOLD-leg state (sold leg in isolation) ---
    const phi0 = (typeof s.pool.phi === 'number') ? s.pool.phi : 0;
    const phiSold = sim.leg1.newState.phi;
    const phiBand = sim.finalState.phi;
    const dyUsd = sim.leg1.dy * o;            // sold-leg cash delta (USD)
    const Vsell = sim.V_sell * o;             // premium received (USD) = option price * notional

    // --- on-screen curve pixel displacement: re-project curveTraceW of base vs post-sold
    //     using the SAME canvas-curve mapping the app uses (drawCurve). We re-create the
    //     trace and project to the live canvas extents to get a real px shift. ---
    function traceW(snap) {
      const wm = 0.5 * (snap.wMinus + snap.wPlus), dw2 = 0.5 * (snap.wPlus - snap.wMinus), tau = snap.tau;
      const phi = (typeof snap.phi === 'number') ? snap.phi : 0;
      const u0 = Math.log(snap.y / snap.x);
      const kCur = wm * Math.log(snap.x) + (1 - wm) * Math.log(snap.y) - dw2 * Math.sqrt(tau*tau + (u0-phi)*(u0-phi));
      const uC = 0.5*(u0+phi), uSpan = Math.max(Math.abs(u0-phi),0)*0.5 + 6;
      const uLo = uC-uSpan, uHi = uC+uSpan; const pts = [];
      for (let i=0;i<=400;i++){ const u=uLo+(uHi-uLo)*i/400;
        const lnx = kCur-(1-wm)*u+dw2*Math.sqrt(tau*tau+(u-phi)*(u-phi));
        const x=Math.exp(lnx), y=x*Math.exp(u); if(isFinite(x)&&isFinite(y)&&x>0&&y>0) pts.push([x,y]); }
      return pts;
    }
    const base = traceW(s.pool);
    const post = traceW(sim.leg1.newState);
    // project both onto a shared [xmin..xmax]x[ymin..ymax] box at canvas px scale.
    const cv = document.getElementById('canvas-curve');
    const W = cv ? cv.width : 600, H = cv ? cv.height : 400;
    const all = base.concat(post);
    let xmn=Infinity,xmx=-Infinity,ymn=Infinity,ymx=-Infinity;
    for (const [x,y] of all){ xmn=Math.min(xmn,x);xmx=Math.max(xmx,x);ymn=Math.min(ymn,y);ymx=Math.max(ymx,y); }
    const px=(x)=> (x-xmn)/(xmx-xmn)*W, py=(y)=> H-(y-ymn)/(ymx-ymn)*H;
    // mean vertical px gap between base and post at matched x (both same N samples)
    let sum=0, mx=0, n=Math.min(base.length, post.length);
    for (let i=0;i<n;i++){ const d=Math.hypot(px(base[i][0])-px(post[i][0]), py(base[i][1])-py(post[i][1])); sum+=d; mx=Math.max(mx,d); }
    const pxDisp = sum/n, pxMax = mx;

    return { rejected:false, phi0, phiSold, phiBand, dPhiSold: phiSold-phi0, dPhiBand: phiBand-phi0,
             dyUsd, Vsell, mark: sim.leg1.m_star, thetaStar: sim.leg1.theta_star,
             slipBandPct: sim.slippage.s_band*100, slipUsd: sim.slippage.slipUsd,
             Nbuy: sim.N_buy, pxDisp, pxMax };
  }, { soldInner, soldOuter, notional, boughtInner });
}

// Find notional that holds premium (Vsell USD) ~ target, by bisection on the live engine.
async function notionalForPremium(page, soldInner, boughtInner, targetUsd) {
  return await page.evaluate(({ soldInner, boughtInner, targetUsd }) => {
    const s = Store.state, o = s.oracle;
    const sold = { inner: soldInner/o, outer: NaN };
    const bought = { inner: boughtInner/o, outer: NaN };
    // Vsell scales linearly in N (mark fixed), so one eval gives the exact N.
    const sim = Engine.executeBand(s.pool, 'call','put', sold, bought, 1.0, o, s.oracle_initial);
    if (!sim.ok) return { ok:false, reason: sim.reason };
    const VperN = sim.V_sell * o;          // USD premium per 1 BTC notional
    return { ok:true, N: targetUsd / VperN, VperN };
  }, { soldInner, boughtInner, targetUsd });
}

async function run(tag) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errs = [];
  page.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERR: ' + e.message));
  await page.goto(FILE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  await addPerp(page);

  const result = { tag, errs, check1: {}, check2: {} };

  // ================= CHECK 1 =================
  // OTM call ladder, inner bound moving FURTHER OTM. bought leg = a fixed OTM put.
  // Default spot = $80k. Calls OTM => inner > 80000. Put OTM => < 80000.
  const boughtPut = 68000;
  const rungs = [88000, 96000, 104000, 112000]; // near-OTM -> further-OTM
  const NOTIONAL_CONST = 0.5;                    // constant-notional ladder

  // (A) CONSTANT NOTIONAL ladder
  log(`\n[${tag}] CHECK 1A — CONSTANT NOTIONAL = ${NOTIONAL_CONST} BTC, inner OTM ladder`);
  const A = [];
  for (const inner of rungs) {
    const p = await probe(page, { soldInner: inner, soldOuter: 0, notional: NOTIONAL_CONST, boughtInner: boughtPut });
    A.push({ inner, ...p });
    if (p.rejected) { log(`  inner=${inner}: REJECTED ${p.reason}`); continue; }
    log(`  inner=$${inner}  prem=$${p.Vsell.toFixed(2)}  mark=${p.mark.toFixed(6)}  dPhiSold=${p.dPhiSold.toExponential(4)}  pxDisp=${p.pxDisp.toFixed(3)}px  slip=${p.slipBandPct.toFixed(4)}%`);
  }

  // (B) CONSTANT PREMIUM ladder — same inner ladder, notional scaled so premium == premium of rung0
  // target premium = the rung0 premium at NOTIONAL_CONST
  const p0 = A[0];
  const targetPrem = p0 && !p0.rejected ? p0.Vsell : null;
  log(`\n[${tag}] CHECK 1B — CONSTANT PREMIUM = $${targetPrem ? targetPrem.toFixed(2) : '?'} (option price x notional held), inner OTM ladder`);
  const B = [];
  for (const inner of rungs) {
    const nf = await notionalForPremium(page, inner, boughtPut, targetPrem);
    if (!nf.ok) { B.push({ inner, rejected:true, reason: nf.reason }); log(`  inner=${inner}: N-solve REJECTED ${nf.reason}`); continue; }
    const p = await probe(page, { soldInner: inner, soldOuter: 0, notional: nf.N, boughtInner: boughtPut });
    B.push({ inner, Nsolved: nf.N, VperN: nf.VperN, ...p });
    if (p.rejected) { log(`  inner=${inner}: probe REJECTED ${p.reason} (N=${nf.N.toFixed(4)})`); continue; }
    log(`  inner=$${inner}  N=${nf.N.toFixed(4)}BTC  prem=$${p.Vsell.toFixed(2)}  mark=${p.mark.toFixed(6)}  dPhiSold=${p.dPhiSold.toExponential(4)}  pxDisp=${p.pxDisp.toFixed(3)}px  slip=${p.slipBandPct.toFixed(4)}%`);
  }
  result.check1 = { constNotional: A, constPremium: B, targetPrem, NOTIONAL_CONST, boughtPut, rungs };

  // ---- Screenshot the curve before/after a constant-premium near vs far rung via REAL UI ----
  // near rung (rungs[0]) at solved N, then far rung (last) at its solved N — capture curve canvas.
  async function uiSoldOnlyBand(inner, N, boughtInner) {
    await page.click('.tab[data-subtab="bands"]');
    await setNum(page, 'band-notional', N.toFixed(4));
    await setNum(page, 'sold-inner', String(inner));
    await page.fill('#sold-outer', '');
    await setNum(page, 'bought-inner', String(boughtInner));
    await page.fill('#bought-outer', '');
    await page.dispatchEvent('#bought-inner', 'input');
    await page.waitForTimeout(150);
  }
  // ensure curve view
  await page.selectOption('#chart-select', 'curve').catch(()=>{});
  const Bnear = B[0], Bfar = B[B.length-1];
  if (Bnear && !Bnear.rejected) {
    await uiSoldOnlyBand(Bnear.inner, Bnear.Nsolved, boughtPut);
    await page.locator('#canvas-curve').screenshot({ path: path.join(OUT, `${tag}_C1_curve_near_constprem.png`) }).catch(()=>{});
  }
  if (Bfar && !Bfar.rejected) {
    await uiSoldOnlyBand(Bfar.inner, Bfar.Nsolved, boughtPut);
    await page.locator('#canvas-curve').screenshot({ path: path.join(OUT, `${tag}_C1_curve_far_constprem.png`) }).catch(()=>{});
  }
  await page.screenshot({ path: path.join(OUT, `${tag}_C1_fullpage.png`), fullPage: false });

  // ================= CHECK 2 =================
  // Vertical spread (two strikes theta1, theta2) on the SOLD call wing.
  // Confirm engine resolves to single AMM tx at theta*=sqrt(t1 t2) carrying value diff.
  log(`\n[${tag}] CHECK 2 — vertical spread => single composite-ray tx`);
  const c2 = await page.evaluate(() => {
    const s = Store.state, o = s.oracle;
    const K1 = 96000, K2 = 120000;          // sold call vertical: inner 96k, outer 120k
    const t1 = K1/o, t2 = K2/o;
    const N = 0.5;
    const sold = { inner: t1, outer: t2 };
    const bought = { inner: 68000/o, outer: NaN };
    const sim = Engine.executeBand(s.pool, 'call','put', sold, bought, N, o, s.oracle_initial);
    if (!sim.ok) return { ok:false, reason: sim.reason };

    // engine compositeRay direct
    const lo = Math.min(t1,t2), hi = Math.max(t1,t2);
    const cr = Engine.compositeRay(lo, hi);
    const thetaStarExpect = Math.sqrt(t1*t2);
    const deltaExpect = 0.5*Math.log(hi/lo);
    // value via vsValue with engine's own m_star
    const vsExpect = Engine.vsValue(N, sim.leg1.m_star, sim.leg1.delta);

    // direct legPrice spread branch on the base pool
    const lp = Engine.legPrice(s.pool, 'call', t1, t2, N);

    return { ok:true, K1, K2, t1, t2, N,
      // from the spread leg the engine actually executed:
      mode: sim.leg1.mode, thetaStar: sim.leg1.theta_star, delta: sim.leg1.delta, mStar: sim.leg1.m_star, Vsell: sim.V_sell,
      // expectations
      thetaStarExpect, deltaExpect, vsExpect,
      crThetaStar: cr.theta_star, crDelta: cr.delta,
      legPrice: { mode: lp.mode, V: lp.V, theta_star: lp.theta_star, delta: lp.delta, m_star: lp.m_star },
      // between the two strikes?
      between: (thetaStarExpect > Math.min(t1,t2) && thetaStarExpect < Math.max(t1,t2)),
      // residual: executed V vs vsValue identity
      residV: Math.abs(sim.leg1.V - vsExpect),
      residTheta: Math.abs(sim.leg1.theta_star - thetaStarExpect),
      slipBandPct: sim.slippage.s_band*100 };
  });
  result.check2 = c2;
  if (c2.ok) {
    log(`  spread K1=$${c2.K1} K2=$${c2.K2}  mode=${c2.mode}`);
    log(`  theta*=${c2.thetaStar.toFixed(6)}  expect sqrt(t1 t2)=${c2.thetaStarExpect.toFixed(6)}  residTheta=${c2.residTheta.toExponential(3)}`);
    log(`  delta=${c2.delta.toFixed(6)}  expect=${c2.deltaExpect.toFixed(6)}`);
    log(`  between t1=${c2.t1.toFixed(4)} and t2=${c2.t2.toFixed(4)}? ${c2.between}`);
    log(`  V_sell(asset)=${c2.Vsell.toFixed(8)}  vsValue identity=${c2.vsExpect.toFixed(8)}  residV=${c2.residV.toExponential(3)}`);
    log(`  legPrice spread branch: mode=${c2.legPrice.mode} V=${c2.legPrice.V.toFixed(8)} theta*=${c2.legPrice.theta_star.toFixed(6)}`);
  } else { log(`  CHECK2 setup REJECTED: ${c2.reason}`); }

  // UI screenshot of the spread setup + resolved single-tx readout (audit strip)
  await page.click('.tab[data-subtab="bands"]');
  await setNum(page, 'band-notional', '0.5');
  await setNum(page, 'sold-inner', '96000');
  await setNum(page, 'sold-outer', '120000');
  await setNum(page, 'bought-inner', '68000');
  await page.fill('#bought-outer', '');
  await page.dispatchEvent('#bought-inner', 'input');
  await page.waitForTimeout(200);
  // read DOM audit strip
  const dom = await page.evaluate(() => {
    const g = id => { const e = document.getElementById(id); return e ? e.textContent.trim() : null; };
    return { mode_sell: g('band-mode-sell'), pv_sold_theta: g('pv-sold-theta'), pv_sold_delta: g('pv-sold-delta'),
             pv_sold_mark: g('pv-sold-mark'), pv_sold_V: g('pv-sold-V'), slippage: g('band-slippage'),
             execDisabled: document.getElementById('btn-execute').disabled };
  });
  result.check2.dom = dom;
  log(`  DOM: mode-sell="${dom.mode_sell}" pv-sold-theta=${dom.pv_sold_theta} pv-sold-V=${dom.pv_sold_V} slip=${dom.slippage} exec-disabled=${dom.execDisabled}`);
  await page.screenshot({ path: path.join(OUT, `${tag}_C2_spread_setup.png`), fullPage: false });
  await page.locator('#canvas-curve').screenshot({ path: path.join(OUT, `${tag}_C2_curve.png`) }).catch(()=>{});

  log(`\n[${tag}] console errors: ${errs.length}`);
  errs.forEach(e => log('   ! ' + e));
  await browser.close();
  return result;
}

const r1 = await run('R1');
const r2 = await run('R2');
fs.writeFileSync(path.join(OUT, 'trace_premwarp.json'), JSON.stringify({ r1, r2 }, null, 2));
log('\nWROTE ' + path.join(OUT, 'trace_premwarp.json'));
