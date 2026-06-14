// Probe raw_net sign vs slippage across notionals, and compare to a SINGLE-LEG round trip.
// Determines whether an instant open->close yields trader gain (leak) or loss (pool-favourable).
import { chromium } from 'playwright';
import path from 'path';
const BUILD = path.resolve('builds/temporal_mvp_v28_lens_S2.html');
const url = 'file://' + BUILD;
(async () => {
  const b = await chromium.launch();
  const page = await (await b.newContext({viewport:{width:1400,height:900}})).newPage();
  const dialogs=[]; page.on('dialog', async d=>{dialogs.push(d.message()); await d.dismiss();});
  await page.goto(url,{waitUntil:'networkidle'}); await page.waitForTimeout(400);

  async function addPerp(side,n,m){
    await page.click('.tab[data-subtab="perps"]').catch(()=>{}); await page.waitForTimeout(100);
    await page.selectOption('#perp-side',side).catch(()=>{});
    await page.fill('#perp-notional',String(n)); await page.fill('#perp-margin',String(m));
    await page.click('#btn-add-perp'); await page.waitForTimeout(150);
  }
  async function roundtrip(sold,bought,notional){
    await page.click('.tab[data-subtab="bands"]').catch(()=>{}); await page.waitForTimeout(100);
    await page.fill('#sold-inner',String(sold)); await page.fill('#sold-outer','');
    await page.fill('#bought-inner',String(bought)); await page.fill('#bought-outer','');
    await page.fill('#band-notional',String(notional)); await page.dispatchEvent('#band-notional','input');
    await page.waitForTimeout(200);
    const netOpen = await page.evaluate(()=>document.getElementById('pv-net-cash')?.textContent);
    const disabled = await page.evaluate(()=>document.getElementById('btn-execute').disabled);
    if(disabled) return {opened:false};
    await page.click('#btn-execute'); await page.waitForTimeout(250);
    return await page.evaluate(({netOpen})=>{
      const band=[...Store.state.bands].reverse().find(b=>b.status==='open');
      if(!band) return {none:true};
      const slip = band.entry.slippage;
      const r = Store.closeBand(band.id);
      return { netOpenTxt:netOpen, slip_band:slip.s_band, slipUsd:slip.slipUsd,
               X:r.X, Y:r.Y, raw_net:r.raw_net, trader_payout:r.trader_payout, L0:r.L0 };
    },{netOpen});
  }
  await addPerp('long',100000,10000);
  for(const N of [0.01,0.05,0.2,0.5]){
    const r = await roundtrip(84000,76000,N);
    console.log(`N=${N}  ` + JSON.stringify(r));
  }
  console.log('---- single-leg (sold call only, no bought) ----');
  await addPerp('long',100000,10000);
  for(const N of [0.05,0.2]){
    // single sold-call leg: bought blank
    await page.click('.tab[data-subtab="bands"]').catch(()=>{}); await page.waitForTimeout(100);
    await page.fill('#sold-inner','84000'); await page.fill('#sold-outer','');
    await page.fill('#bought-inner',''); await page.fill('#bought-outer','');
    await page.fill('#band-notional',String(N)); await page.dispatchEvent('#band-notional','input');
    await page.waitForTimeout(200);
    const dis = await page.evaluate(()=>document.getElementById('btn-execute').disabled);
    const warn = await page.evaluate(()=>document.getElementById('band-warn')?.textContent||'');
    if(dis){ console.log(`N=${N} single-leg NOT openable: ${warn}`); continue; }
    await page.click('#btn-execute'); await page.waitForTimeout(250);
    const r = await page.evaluate(()=>{
      const band=[...Store.state.bands].reverse().find(b=>b.status==='open');
      if(!band) return {none:true};
      const rr=Store.closeBand(band.id);
      return {X:rr.X,Y:rr.Y,raw_net:rr.raw_net,slip:band.entry.slippage.s_band};
    });
    console.log(`N=${N} single-leg ` + JSON.stringify(r));
  }
  await b.close();
})().catch(e=>{console.error('ERR',e);process.exit(2);});
