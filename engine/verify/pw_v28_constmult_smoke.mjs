// Live smoke-pass — constant-slope-multiplier lens build
//   engine/builds/temporal_mvp_v28_lens_constmult.html  (md5 8f897edc…)
// Operator entries 229/231: kurtosis/vol knob is now a CONSTANT SLOPE MULTIPLIER m.
// Run: cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/pw_v28_constmult_smoke.mjs A
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const RUN = (process.argv[2] || 'A').toUpperCase();
const here = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.resolve(here, '../builds/temporal_mvp_v28_lens_constmult.html');
const EVID = path.resolve(here, '../../evidence/v28_constmult');
fs.mkdirSync(EVID, { recursive: true });
const LOG = [];
const log = (s) => { LOG.push(s); console.log(s); };
const shot = async (page, name, sel) => {
  const f = path.join(EVID, `${RUN}_${name}.png`);
  if (sel) { const el = await page.$(sel); if (el) { await el.screenshot({ path: f }); return; } }
  await page.screenshot({ path: f });
};

const errors = [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('console', m => { if (m.type() === 'error') { errors.push('console:' + m.text()); } });
page.on('pageerror', e => errors.push('pageerror:' + e.message));
const dialogs = [];
page.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });

await page.goto('file://' + BUILD);
await page.waitForTimeout(600);

log(`=== CONSTMULT SMOKE  run ${RUN}  build ${path.basename(BUILD)} ===`);
log(`md5(build)=${execSync('md5sum ' + BUILD).toString().split(' ')[0]}`);

// ---- helpers ----
const setM = async (m) => page.evaluate((mm) => {
  const el = document.getElementById('m-input');
  el.value = String(mm);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}, m);

const showPricing = async () => page.evaluate(() => {
  const s = document.getElementById('chart-select'); s.value = 'pricing';
  s.dispatchEvent(new Event('change', { bubbles: true }));
});
const showCurve = async () => page.evaluate(() => {
  const s = document.getElementById('chart-select'); s.value = 'curve';
  s.dispatchEvent(new Event('change', { bubbles: true }));
});

const canvasStats = async (id) => page.evaluate((cid) => {
  const cv = document.getElementById(cid);
  const ctx = cv.getContext('2d');
  const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
  let lit = 0, h = 2166136261;
  for (let i = 0; i < d.length; i += 4) {
    const on = (d[i] | d[i+1] | d[i+2]) > 24 && d[i+3] > 8;
    if (on) lit++;
    h ^= d[i] ^ d[i+1] ^ d[i+2] ^ d[i+3]; h = Math.imul(h, 16777619);
  }
  return { lit, hash: (h >>> 0).toString(16) };
}, id);

// Drive a long band via the REAL UI form, click #btn-execute. Returns open band id or null.
const fillBandAndExecute = async (siUsd, biUsd, n) => page.evaluate(({ si, bi, nn }) => {
  const set = (id, v) => { const e = document.getElementById(id); e.value = String(v); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };
  const dp = document.getElementById('band-dir-sell'); if (dp && dp.dataset.dir !== 'long') dp.click();
  set('sold-inner', si); set('bought-inner', bi); set('band-notional', nn);
  document.getElementById('btn-execute').click();
  const b = Store.state.bands.find(x => x.status === 'open');
  return b ? b.id : null;
}, { si: siUsd, bi: biUsd, nn: n });

const probeSlope = async (m) => page.evaluate((mm) => {
  const st = Store.state.pool;
  const w = st.alpha / st.x;
  const gamma = w / (1 - w);
  const mode = Engine.getSNorm(st);
  const cl = [1.25, 1.5, 2, 3, 4].map(f => mode * f);
  const pl = [0.8, 0.667, 0.5, 0.333, 0.25].map(f => mode * f);
  const gloc = {};
  for (const th of [...pl, mode, ...cl]) gloc[th.toFixed(4)] = Engine.gLoc(st, th, mm);
  const sNorm = mode;
  const psi = (th, wing) => Engine.markLensed(wing, th, sNorm, Engine.gLoc(st, th, mm));
  const t1 = mode * 6, t2 = mode * 6.5;
  const p1 = psi(t1, 'call'), p2 = psi(t2, 'call');
  const callExp = (Math.log(1 - p2) - Math.log(1 - p1)) / (Math.log(t2) - Math.log(t1));
  return { w, gamma, mode, gloc, callExp, mg: mm * gamma };
}, m);

// =====================================================================
// ITEM 1
// =====================================================================
log('\n--- ITEM 1: crank m → chart-2 steepens everywhere, exponent = m·γ ---');
log('knob label literal: ' + (await page.evaluate(() => {
  const lbls = [...document.querySelectorAll('.field-label')].map(e => e.textContent.trim());
  return lbls.find(t => /SLOPE MULT/i.test(t)) || '(not found)';
})));
log('m-input attrs: ' + JSON.stringify(await page.$eval('#m-input', e => ({ min: e.min, max: e.max, step: e.step, value: e.value }))));
log('aid label: ' + JSON.stringify(await page.evaluate(() => {
  const a = [...document.querySelectorAll('.sim-aid-label')].map(e => e.textContent.trim());
  return a.find(t => /slope.multiplier/i.test(t)) || '(not found)';
})));

await showPricing();
await setM(1); await page.waitForTimeout(150);
const s_m1 = await canvasStats('canvas-pricing'); const pr_m1 = await probeSlope(1);
await shot(page, 'item1_m1', '#canvas-pricing');
await setM(2); await page.waitForTimeout(150);
const s_m2 = await canvasStats('canvas-pricing'); const pr_m2 = await probeSlope(2);
await shot(page, 'item1_m2', '#canvas-pricing');
await setM(3); await page.waitForTimeout(150);
const s_m3 = await canvasStats('canvas-pricing'); const pr_m3 = await probeSlope(3);
await shot(page, 'item1_m3', '#canvas-pricing');

log(`canvas-pricing lit px: m=1 ${s_m1.lit} (${s_m1.hash}) | m=2 ${s_m2.lit} (${s_m2.hash}) | m=3 ${s_m3.lit} (${s_m3.hash})`);
log(`pool: w=${pr_m1.w.toFixed(6)} gamma=${pr_m1.gamma.toFixed(6)} mode=${pr_m1.mode.toFixed(6)}`);
for (const [m, pr] of [[1,pr_m1],[2,pr_m2],[3,pr_m3]]) {
  const vals = Object.values(pr.gloc);
  const min = Math.min(...vals), max = Math.max(...vals);
  log(`  m=${m}: m*gamma=${pr.mg.toFixed(6)}  g_loc[min..max over 11 strikes]=[${min.toFixed(6)}..${max.toFixed(6)}]  spread=${(max-min).toExponential(2)}  renderedCallExp=${pr.callExp.toFixed(6)}`);
}
log(`m1->m2 px delta=${Math.abs(s_m2.lit-s_m1.lit)}  m2->m3 px delta=${Math.abs(s_m3.lit-s_m2.lit)}  distinctHashes=${new Set([s_m1.hash,s_m2.hash,s_m3.hash]).size}`);

// =====================================================================
// ITEM 2
// =====================================================================
log('\n--- ITEM 2: m=1 = plain curve (g_loc==gamma); theta_tx==chosen at m=1 ---');
const item2 = await page.evaluate(() => {
  const st = Store.state.pool;
  const w = st.alpha / st.x; const gamma = w / (1 - w);
  const mode = Engine.getSNorm(st);
  const g1 = Engine.gLoc(st, mode * 2, 1);
  const fx = Store.state.oracle;
  const chosen = mode * 2;
  const r = Engine.executeLeg(st, 'sell', 'call', chosen, NaN, 0.05, fx, 1);
  return { gamma, g1, mode, chosen_theta: chosen, theta_tx: r.theta_tx, K_usd: r.K_usd, K_tx: r.K_tx, dy: r.dy };
});
log(`gamma=${item2.gamma.toFixed(8)}  g_loc(2x,m=1)=${item2.g1.toFixed(8)}  EQUAL? ${Math.abs(item2.gamma-item2.g1)<1e-12}`);
log(`m=1 trade: chosen_theta=${item2.chosen_theta.toFixed(6)} theta_tx=${item2.theta_tx.toFixed(6)} lands@chosen? ${Math.abs(item2.chosen_theta-item2.theta_tx)<1e-9}`);
log(`m=1 K_usd=$${item2.K_usd.toFixed(2)} K_tx=$${item2.K_tx.toFixed(2)} dy=$${item2.dy.toFixed(2)}`);

// =====================================================================
// ITEM 3
// =====================================================================
log('\n--- ITEM 3: theta_tx further out with m; reject fires earlier (with $ depth) ---');
const item3 = await page.evaluate(() => {
  const st = Store.state.pool;
  const mode = Engine.getSNorm(st);
  const fx = Store.state.oracle;
  const chosen = mode * 2;
  const out = {};
  for (const m of [1, 2, 3]) {
    const r = Engine.executeLeg(st, 'sell', 'call', chosen, NaN, 0.05, fx, m);
    out['m' + m] = { theta_tx: r.theta_tx, ratio_to_mode: r.theta_tx / mode, K_tx: r.K_tx, dy: r.dy };
  }
  const depth = st.y - st.beta;
  const DEPTH_FRAC = 0.90;
  const rej = {};
  // CASH-OUT leg whose swap GROWS with m: buy-call (chosen 2x mode further OTM).
  // u_tx = m*ln(chosen/mode) AMPLIFIES the call-side strike => K_tx and the N*K_tx
  // cash-out both grow with m => the reserve-depth reject fires EARLIER at bigger m.
  const Nrej = 0.7;
  for (const m of [1, 1.5, 2, 2.5, 3]) {
    const r = Engine.executeLeg(st, 'buy', 'call', chosen, NaN, Nrej, fx, m);
    rej['m' + m] = r.rejected ? { rejected: true, reason: r.reason }
                              : { rejected: false, dy: r.dy, NKtx: Nrej * r.K_tx, K_tx: r.K_tx, theta_tx: r.theta_tx };
  }
  return { mode, chosen, depth, out, DEPTH_FRAC, Nrej, rej, threshold: DEPTH_FRAC*depth };
});
log(`mode=${item3.mode.toFixed(6)} chosen=2x=${item3.chosen.toFixed(6)} pool cash depth y-beta=$${item3.depth.toFixed(2)}`);
for (const m of [1,2,3]) {
  const o = item3.out['m'+m];
  log(`  m=${m}: theta_tx=${o.theta_tx.toFixed(6)} (=${o.ratio_to_mode.toFixed(3)}x mode)  K_tx=$${o.K_tx.toFixed(2)}  dy=$${o.dy.toFixed(2)}`);
}
log(`reserve-depth reject sweep (BUY-CALL cash-OUT, N=${item3.Nrej}, chosen=2x mode; threshold=90%·depth=$${item3.threshold.toFixed(2)}):`);
for (const m of [1,1.5,2,2.5,3]) {
  const r = item3.rej['m'+m];
  if (r.rejected) log(`  m=${m}: REJECT — "${r.reason}"`);
  else log(`  m=${m}: exec theta_tx=${r.theta_tx.toFixed(4)} K_tx=$${r.K_tx.toFixed(2)} N*K_tx(cash-out)=$${r.NKtx.toFixed(2)} dy=$${r.dy.toFixed(2)}`);
}

// =====================================================================
// ITEM 4 — analytic reserve round-trip + settle@chosen
// =====================================================================
log('\n--- ITEM 4: open->close reserves restore exact; settle at CHOSEN strike ---');
const item4 = await page.evaluate(() => {
  const st0 = JSON.parse(JSON.stringify(Store.state.pool));
  const mode = Engine.getSNorm(st0);
  const fx = Store.state.oracle;
  const chosen = mode * 2;
  const open = Engine.executeLeg(st0, 'sell', 'call', chosen, NaN, 0.05, fx, 2);
  const st1 = open.newState;
  const reverse = Engine.tradeUpdate(st1, -open.dy);
  return { mode, chosen, K_usd: open.K_usd, K_tx: open.K_tx, dy: open.dy,
           x0: st0.x, y0: st0.y, xr: reverse.x, yr: reverse.y,
           dxRes: Math.abs(reverse.x - st0.x), dyRes: Math.abs(reverse.y - st0.y) };
});
log(`open m=2: chosen=${item4.chosen.toFixed(6)} K_usd(chosen)=$${item4.K_usd.toFixed(2)} K_tx(further)=$${item4.K_tx.toFixed(2)} dy=$${item4.dy.toFixed(2)}`);
log(`reserves: x0=${item4.x0.toFixed(8)} -> reverse x=${item4.xr.toFixed(8)} |dx|=${item4.dxRes.toExponential(3)}`);
log(`reserves: y0=${item4.y0.toFixed(8)} -> reverse y=${item4.yr.toFixed(8)} |dy|=${item4.dyRes.toExponential(3)}`);
log(`SETTLE basis K_usd(chosen)=$${item4.K_usd.toFixed(2)} vs swap basis K_tx(further)=$${item4.K_tx.toFixed(2)} => ${Math.abs(item4.K_usd-item4.K_tx)>1?'DISTINCT (settle@chosen, swap@further)':'SAME'}`);

// Full UI-form round-trip via #btn-execute + Store.closeBand
const item4b = await (async () => {
  await page.evaluate(() => { document.querySelector('.tab[data-subtab="bands"]').click(); });
  await setM(2);
  const before = await page.evaluate(() => ({ x: Store.state.pool.x, y: Store.state.pool.y }));
  const strikes = await page.evaluate(() => {
    const fx = Store.state.oracle; const mode = Engine.getSNorm(Store.state.pool);
    return { si: Math.round(mode*1.5*fx/500)*500, bi: Math.round(mode*0.6*fx/500)*500, fx, mode };
  });
  const id = await fillBandAndExecute(strikes.si, strikes.bi, 0.03);
  await page.waitForTimeout(100);
  const r = await page.evaluate((bid) => {
    const close = bid != null ? Store.closeBand(bid) : null;
    return { after: { x: Store.state.pool.x, y: Store.state.pool.y },
             raw_net: close ? close.raw_net : null, settled: close ? close.settled_cash_leg : null, id: bid };
  }, id);
  return { strikes, before, id, ...r };
})();
log(`UI band round-trip (m=2): opened id=${item4b.id} sold_inner=$${item4b.strikes.si} bought_inner=$${item4b.strikes.bi}`);
log(`  reserves x: ${item4b.before.x.toFixed(8)} -> close ${item4b.after.x.toFixed(8)} |dx|=${Math.abs(item4b.after.x-item4b.before.x).toExponential(3)}`);
log(`  reserves y: ${item4b.before.y.toFixed(8)} -> close ${item4b.after.y.toFixed(8)} |dy|=${Math.abs(item4b.after.y-item4b.before.y).toExponential(3)}`);
log(`  close raw_net=${item4b.raw_net} settled_cash_leg=${item4b.settled}`);

// =====================================================================
// ITEM 5 — no regression
// =====================================================================
log('\n--- ITEM 5: no regression (sweep animates; chart-1 inert to m; funding/settle; errors) ---');
// fresh page (item4b drained club / drifted state)
await page.reload(); await page.waitForTimeout(600);

// 5a chart-1 inert to m (band cleared)
await page.evaluate(() => {
  const clr=(id)=>{const e=document.getElementById(id); if(e){e.value=""; e.dispatchEvent(new Event("input",{bubbles:true})); e.dispatchEvent(new Event("change",{bubbles:true}));}};
  clr("band-notional"); clr("sold-inner"); clr("bought-inner");
});
await page.evaluate(() => { document.querySelector('.tab[data-subtab="settings"]').click(); });
await showCurve();
await setM(1); await page.waitForTimeout(120); const c1_m1 = await canvasStats('canvas-curve');
await setM(3); await page.waitForTimeout(120); const c1_m3 = await canvasStats('canvas-curve');
await setM(6); await page.waitForTimeout(120); const c1_m6 = await canvasStats('canvas-curve');
log(`chart-1 (canvas-curve) vs m (band cleared): m1=${c1_m1.lit}(${c1_m1.hash}) m3=${c1_m3.lit}(${c1_m3.hash}) m6=${c1_m6.lit}(${c1_m6.hash})`);
log(`chart-1 INERT to m? ${c1_m1.hash===c1_m3.hash && c1_m3.hash===c1_m6.hash ? 'YES (identical hash all m)' : 'NO'}`);
await shot(page, 'item5_chart1', '#canvas-curve');

// 5b continuous warp sweep on chart-2 (trade preview)
await page.reload(); await page.waitForTimeout(600);
await showPricing();
await page.evaluate(() => { document.querySelector('.tab[data-subtab="bands"]').click(); });
const sweep = await page.evaluate(async () => {
  const mode = Engine.getSNorm(Store.state.pool); const fx = Store.state.oracle;
  const set = (id,v)=>{const e=document.getElementById(id); e.value=String(v); e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true}));};
  const dp = document.getElementById('band-dir-sell'); if (dp.dataset.dir!=='long') dp.click();
  set('sold-inner', Math.round(mode*1.5*fx/500)*500);
  set('bought-inner', Math.round(mode*0.6*fx/500)*500);
  set('band-notional', 0.4);
  const cv = document.getElementById('canvas-pricing'); const ctx = cv.getContext('2d');
  const hashes = new Set(); const t0 = performance.now();
  return await new Promise(res => {
    function tick() {
      const d = ctx.getImageData(0,0,cv.width,cv.height).data;
      let h=2166136261; for (let i=0;i<d.length;i+=64){h^=d[i];h=Math.imul(h,16777619);} hashes.add((h>>>0).toString(16));
      if (performance.now()-t0 < 1000) requestAnimationFrame(tick); else res({ distinct: hashes.size });
    }
    requestAnimationFrame(tick);
  });
});
log(`continuous warp sweep on chart-2: ${sweep.distinct} distinct frames over ~1s (animates if >1)`);
await shot(page, 'item5_sweep_landed', '#canvas-pricing');

// 5c funding works
const funding = await page.evaluate(() => {
  const st = Store.state.pool; const mode = Engine.getSNorm(st);
  try {
    const fCall = Engine.fundingPerStrike(st, mode*2, 'call', 0.05, 1, Store.state.kappa, Store.state.oracle, Store.state.oracle_initial, 2);
    const fPut  = Engine.fundingPerStrike(st, mode*0.5, 'put', 0.05, 1, Store.state.kappa, Store.state.oracle, Store.state.oracle_initial, 2);
    return { fCall, fPut, finite: isFinite(JSON.stringify(fCall).length) };
  } catch(e){ return { err: String(e) }; }
});
log(`funding per-strike (m=2): call=${JSON.stringify(funding.fCall)} put=${JSON.stringify(funding.fPut)}`);

// 5d settlement ITM path via UI open + oracle drive ITM + close
await page.reload(); await page.waitForTimeout(600);
await page.evaluate(() => { document.querySelector('.tab[data-subtab="settings"]').click(); });
await setM(2);
await page.evaluate(() => { document.querySelector('.tab[data-subtab="bands"]').click(); });
const settleStrikes = await page.evaluate(() => {
  const fx = Store.state.oracle; const mode = Engine.getSNorm(Store.state.pool);
  return { si: Math.round(mode*1.5*fx/500)*500, bi: Math.round(mode*0.6*fx/500)*500, fx };
});
const settleId = await fillBandAndExecute(settleStrikes.si, settleStrikes.bi, 0.05);
const settle = await page.evaluate((bid) => {
  try {
    const fx = Store.state.oracle;
    Store.setOracle(fx*2.5); Store.setPerpMark(fx*2.5); Store.runArbitrage();
    const close = bid!=null ? Store.closeBand(bid) : null;
    return { openId: bid, settled_cash_leg: close&&close.settled_cash_leg, raw_net: close&&close.raw_net, finite: close? isFinite(close.raw_net):false };
  } catch(e){ return { err: String(e) }; }
}, settleId);
log(`settlement ITM path (m=2): ${JSON.stringify(settle)}`);

log(`\n=== ERRORS: console+pageerror count = ${errors.length} ===`);
errors.forEach(e => log('  ' + e));
log(`=== DIALOGS captured = ${dialogs.length} ===`);
dialogs.forEach(d => log('  dialog: ' + d));

log(`md5(build, post-run)=${execSync('md5sum ' + BUILD).toString().split(' ')[0]}`);

fs.writeFileSync(path.join(EVID, `RUN_LOG_run${RUN}.txt`), LOG.join('\n') + '\n');
await browser.close();
console.log('\nwrote ' + path.join(EVID, `RUN_LOG_run${RUN}.txt`));
