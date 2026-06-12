// Why do some openBandUI calls report opened:false with empty warn? Distinguish benign
// club-exhaustion / Transact disabled vs a silent failure. Also confirm steep-pool ITM band
// is opened IN the steep context before close.
import { chromium } from 'playwright';
import path from 'path';
const BUILD = path.resolve('builds/temporal_mvp_v28_lens_S2.html');
const url = 'file://' + BUILD;
(async () => {
  const b = await chromium.launch();
  const page = await (await b.newContext({viewport:{width:1500,height:1000}})).newPage();
  const dlg=[]; page.on('dialog', async d=>{dlg.push(d.message()); await d.dismiss();});
  page.on('pageerror',e=>console.log('PAGEERROR',e.message));
  await page.goto(url,{waitUntil:'networkidle'}); await page.waitForTimeout(400);
  async function gotoTransact(){ await page.click('.page-nav-link[data-page="transact"]').catch(()=>{}); await page.waitForTimeout(120);}
  async function setPool(x,a,y,bb){
    await page.evaluate(({x,a,y,bb})=>{const s=JSON.parse(Store.exportJSON());s.pool.x=x;s.pool.alpha=a;s.pool.y=y;s.pool.beta=bb;Store.importJSON(JSON.stringify(s));},{x,a,y,bb});
    await gotoTransact(); await page.click('.tab[data-subtab="settings"]').catch(()=>{}); await page.waitForTimeout(80);
    await page.click('#btn-tick'); await page.waitForTimeout(150);
  }
  async function addPerp(side,n,m){
    await gotoTransact(); await page.click('.tab[data-subtab="perps"]').catch(()=>{}); await page.waitForTimeout(100);
    await page.selectOption('#perp-side',side).catch(()=>{});
    await page.fill('#perp-notional',String(n)); await page.fill('#perp-margin',String(m));
    await page.click('#btn-add-perp'); await page.waitForTimeout(150);
  }
  async function tryOpen(si,bi,N,label){
    await gotoTransact(); await page.click('.tab[data-subtab="bands"]').catch(()=>{}); await page.waitForTimeout(100);
    await page.fill('#sold-inner',String(si)); await page.fill('#sold-outer','');
    await page.fill('#bought-inner',String(bi)); await page.fill('#bought-outer','');
    await page.fill('#band-notional',String(N)); await page.dispatchEvent('#band-notional','input');
    await page.waitForTimeout(220);
    const info = await page.evaluate(()=>({
      disabled: document.getElementById('btn-execute').disabled,
      warn: document.getElementById('warn-area')?.textContent||'',
      clubs: Object.entries(Store.state.clubs||{}).map(([k,c])=>({side:k, notl:c.totalNotional, eq:c.equity})),
      nBands: Store.state.bands.length,
    }));
    console.log(label+' preview: '+JSON.stringify(info));
    if(info.disabled){ console.log(label+' -> NOT openable (Transact disabled)'); return; }
    const n0=info.nBands;
    await page.click('#btn-execute'); await page.waitForTimeout(250);
    const after = await page.evaluate(({n0})=>({opened:Store.state.bands.length>n0, n:Store.state.bands.length}),{n0});
    console.log(label+' -> '+JSON.stringify(after)+' dialogs='+JSON.stringify(dlg.slice(-2)));
  }
  // steep pool, fresh perp, open steep band
  await setPool(10,7.8,800000,624000);
  const w = await page.evaluate(()=>Engine.getW(Store.state.pool));
  console.log('steep w='+w.toFixed(4));
  await addPerp('long',100000,10000);
  await tryOpen(88000,72000,0.05,'STEEP-band');
  // now the standing-smoke style: after some carves, try another
  await addPerp('long',12000,1200);
  await tryOpen(90000,72000,0.04,'SMOKE-long');
  await b.close();
})().catch(e=>{console.error('ERR',e);process.exit(2);});
