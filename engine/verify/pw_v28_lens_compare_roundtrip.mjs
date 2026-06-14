// Compare instant open->close raw_net across S2 (settle-through-lens) vs S1 vs v24 base.
// Determines whether the positive (trader-favourable) round-trip residual is NEW to Stage-2
// settlement or inherited from the v24 closeBand.
import { chromium } from 'playwright';
import path from 'path';
const builds = {
  S2:  path.resolve('builds/temporal_mvp_v28_lens_S2.html'),
  S1:  path.resolve('builds/temporal_mvp_v28_lens_S1.html'),
  v24: path.resolve('builds/temporal_mvp_v24_rebase_fixed_2.html'),
};
async function probe(page){
  // add perp
  await page.click('.tab[data-subtab="perps"]').catch(()=>{}); await page.waitForTimeout(120);
  await page.selectOption('#perp-side','long').catch(()=>{});
  await page.fill('#perp-notional','100000').catch(()=>{}); await page.fill('#perp-margin','10000').catch(()=>{});
  await page.click('#btn-add-perp').catch(()=>{}); await page.waitForTimeout(150);
  const out = [];
  for(const N of [0.01,0.05,0.2]){
    await page.click('.tab[data-subtab="bands"]').catch(()=>{}); await page.waitForTimeout(100);
    await page.fill('#sold-inner','84000').catch(()=>{}); await page.fill('#sold-outer','').catch(()=>{});
    await page.fill('#bought-inner','76000').catch(()=>{}); await page.fill('#bought-outer','').catch(()=>{});
    await page.fill('#band-notional',String(N)).catch(()=>{}); await page.dispatchEvent('#band-notional','input').catch(()=>{});
    await page.waitForTimeout(200);
    const dis = await page.evaluate(()=>document.getElementById('btn-execute')?.disabled);
    if(dis){ out.push({N, opened:false}); continue; }
    await page.click('#btn-execute'); await page.waitForTimeout(250);
    const r = await page.evaluate(()=>{
      const band=[...Store.state.bands].reverse().find(b=>b.status==='open');
      if(!band) return {none:true};
      const slip = band.entry?.slippage?.s_band;
      const rr = Store.closeBand(band.id);
      return { X:rr.X, Y:rr.Y, raw_net:rr.raw_net, slip };
    });
    out.push({N, ...r});
  }
  return out;
}
(async ()=>{
  const b = await chromium.launch();
  for(const [name,fp] of Object.entries(builds)){
    const page = await (await b.newContext({viewport:{width:1400,height:900}})).newPage();
    const errs=[]; page.on('pageerror',e=>errs.push(e.message));
    page.on('dialog', async d=>{await d.dismiss();});
    try {
      await page.goto('file://'+fp,{waitUntil:'networkidle'}); await page.waitForTimeout(400);
      const res = await probe(page);
      console.log('=== '+name+' ===');
      for(const r of res) console.log('  '+JSON.stringify(r));
      if(errs.length) console.log('  pageerrors: '+errs.length+' '+errs.slice(0,2).join(' | '));
    } catch(e){ console.log('=== '+name+' === PROBE-ERR '+e.message); }
    await page.close();
  }
  await b.close();
})().catch(e=>{console.error('ERR',e);process.exit(2);});
