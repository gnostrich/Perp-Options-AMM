import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
import { pathToFileURL } from 'url';

const HTML = '/home/user/Perp-Options-AMM/reference/temporal_curve_playground.html';
const OUT = '/home/user/Perp-Options-AMM/evidence/playground_clean_open';
const url = pathToFileURL(HTML).href;

// canvas pixel histogram over the pool-curve canvas: count teal/pink/green/red on the curve
const PIXSCAN = `(() => {
  // find the largest visible canvas (pool curve top-left chart)
  const cs = [...document.querySelectorAll('canvas')].filter(c => c.offsetParent !== null && c.width > 100 && c.height > 100);
  if (!cs.length) return { err: 'no canvas' };
  // pool curve is the first chart canvas; pick the one with id or first
  const c = cs[0];
  const ctx = c.getContext('2d');
  const { width:w, height:h } = c;
  const d = ctx.getImageData(0,0,w,h).data;
  let teal=0, pink=0, green=0, red=0, grey=0;
  const near = (r,g,b, R,G,B, tol=40) => Math.abs(r-R)<tol && Math.abs(g-G)<tol && Math.abs(b-B)<tol;
  for (let i=0;i<d.length;i+=4){
    const r=d[i],g=d[i+1],b=d[i+2],a=d[i+3];
    if (a<128) continue;
    if (near(r,g,b, 0x0A,0xBA,0xB5)) teal++;        // colCall teal
    else if (near(r,g,b, 0xFF,0x85,0xB0)) pink++;   // colPut pink
    else if (near(r,g,b, 0x14,0xE8,0x00, 60)) green++; // bought green ray
    else if (near(r,g,b, 0xFF,0x67,0x67, 60)) red++;   // sold red ray
  }
  return { w, h, n: cs.length, teal, pink, green, red, cid: c.id || '(noid)' };
})()`;

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE.ERROR: ' + m.text()); });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // ---- ITEM 1: clean open ----
  const scan0 = await page.evaluate(PIXSCAN);
  await page.screenshot({ path: OUT + '/clean_open.png' });
  console.log('ITEM1 clean-open scan:', JSON.stringify(scan0));
  console.log('ITEM1 errs-after-open:', JSON.stringify(errs));
  // read whether a default preview band exists
  const pbAtOpen = await page.evaluate(() => ({
    previewBand: window.__previewBand,
    soldInner: document.getElementById('sold-inner')?.value,
    boughtInner: document.getElementById('bought-inner')?.value,
    notional: document.getElementById('band-notional')?.value,
  }));
  console.log('ITEM1 preview/inputs at open:', JSON.stringify(pbAtOpen));

  // ---- ITEM 2: anchor coincides + gamma reshapes both ----
  const anchorVsLive = await page.evaluate(() => {
    // anchorPts and livePts both = curveTrace(snap) per source L3504-3505 => identical locus.
    // We can't call curveTrace by bare name; reproduce via Engine on the pool.
    const s = Store.state; const p = s.pool;
    return { gammaOut: document.getElementById('vk-gamma-out')?.textContent,
             alpha: p.alpha, beta: p.beta, x: p.x, y: p.y };
  });
  const beforeG = await page.evaluate(PIXSCAN);
  // change gamma dial 1.05 -> 2.0
  await page.evaluate(() => {
    const el = document.getElementById('vk-gamma');
    el.value = '2.0';
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForTimeout(600);
  const afterG = await page.evaluate(PIXSCAN);
  const gammaReadout = await page.evaluate(() => document.getElementById('vk-gamma-out')?.textContent);
  await page.screenshot({ path: OUT + '/gamma_reshaped.png' });
  console.log('ITEM2 anchorVsLive(src-coincide):', JSON.stringify(anchorVsLive));
  console.log('ITEM2 curve before gamma:', JSON.stringify(beforeG));
  console.log('ITEM2 curve after gamma=2:', JSON.stringify(afterG), 'readout', gammaReadout);

  // reset gamma back
  await page.evaluate(() => { const el=document.getElementById('vk-gamma'); el.value='1.05'; el.dispatchEvent(new Event('change',{bubbles:true})); });
  await page.waitForTimeout(400);

  // ---- ITEM 3: manual band build + execute ----
  // need a perp first to anchor (empty-state). Add via Store.
  const perpAdded = await page.evaluate(() => {
    try { Store.addPerp && Store.addPerp('long', 0.1, 1000, undefined); return true; } catch(e){ return 'ERR:'+e.message; }
  });
  console.log('ITEM3 perp add:', perpAdded);
  // switch to bands subtab
  await page.evaluate(() => {
    const b=[...document.querySelectorAll('.tabs .tab[data-subtab]')].find(t=>t.dataset.subtab==='bands');
    if(b) b.click();
  });
  await page.waitForTimeout(300);
  // fill inputs: dir=long default => sold=call (84000), bought=put (68000), N=0.05
  const fill = async (id, val) => {
    await page.evaluate(([id,val]) => {
      const el=document.getElementById(id); el.value=String(val);
      el.dispatchEvent(new Event('input',{bubbles:true}));
      el.dispatchEvent(new Event('change',{bubbles:true}));
    }, [id, val]);
    await page.waitForTimeout(150);
  };
  await fill('sold-inner', 84000);
  await fill('bought-inner', 68000);
  await fill('band-notional', 0.05);
  await page.waitForTimeout(500);
  const pbBuilt = await page.evaluate(() => {
    const pb = window.__previewBand;
    return { exists: !!pb, hasLeg1: !!(pb && pb.leg1State), sold_wing: pb&&pb.sold_wing,
             bought_wing: pb&&pb.bought_wing,
             execDisabled: document.getElementById('btn-execute')?.disabled,
             warn: document.getElementById('warn-area')?.textContent?.trim() };
  });
  const scanBand = await page.evaluate(PIXSCAN);
  await page.screenshot({ path: OUT + '/band_preview.png' });
  console.log('ITEM3 preview band built:', JSON.stringify(pbBuilt));
  console.log('ITEM3 curve scan w/ preview (expect green+red rays):', JSON.stringify(scanBand));

  // execute the band
  const bandsBefore = await page.evaluate(() => Store.state.bands ? Store.state.bands.length : (Store.state.perps?Store.state.perps.length:-1));
  const execRes = await page.evaluate(() => {
    const b=document.getElementById('btn-execute');
    if (b.disabled) return 'DISABLED';
    b.click(); return 'CLICKED';
  });
  await page.waitForTimeout(600);
  const afterExec = await page.evaluate(() => ({
    bands: Store.state.bands ? Store.state.bands.length : 'n/a',
    perps: Store.state.perps ? Store.state.perps.length : 'n/a',
    previewBand: !!window.__previewBand,
    warn: document.getElementById('warn-area')?.textContent?.trim()
  }));
  await page.screenshot({ path: OUT + '/band_executed.png' });
  console.log('ITEM3 exec:', execRes, 'bandsBefore', bandsBefore, 'afterExec', JSON.stringify(afterExec));

  // ---- ITEM 4: dials (delta, betah) reshape + labels ----
  const labels = await page.evaluate(() => {
    const lab = (sel) => document.querySelector(sel)?.textContent?.trim();
    // labels are the text of the .vk-field labels
    const fields = [...document.querySelectorAll('.vk-field')].map(f=>f.textContent.trim());
    return { fields,
      gOut: document.getElementById('vk-gamma-out')?.textContent,
      dOut: document.getElementById('vk-delta-out')?.textContent,
      bOut: document.getElementById('vk-betah-out')?.textContent };
  });
  const dBefore = await page.evaluate(PIXSCAN);
  await page.evaluate(() => { const el=document.getElementById('vk-delta'); el.value='5'; el.dispatchEvent(new Event('change',{bubbles:true})); });
  await page.waitForTimeout(400);
  const dAfter = await page.evaluate(PIXSCAN);
  const dReadout = await page.evaluate(()=>document.getElementById('vk-delta-out')?.textContent);
  await page.evaluate(() => { const el=document.getElementById('vk-betah'); el.value='0.5'; el.dispatchEvent(new Event('change',{bubbles:true})); });
  await page.waitForTimeout(400);
  const bAfter = await page.evaluate(PIXSCAN);
  const bReadout = await page.evaluate(()=>document.getElementById('vk-betah-out')?.textContent);
  await page.screenshot({ path: OUT + '/dials_delta_betah.png' });
  console.log('ITEM4 labels:', JSON.stringify(labels));
  console.log('ITEM4 delta before:', JSON.stringify(dBefore), 'after5:', JSON.stringify(dAfter), 'readout', dReadout);
  console.log('ITEM4 betah after0.5:', JSON.stringify(bAfter), 'readout', bReadout);

  console.log('FINAL errs:', JSON.stringify(errs));
  await browser.close();
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
