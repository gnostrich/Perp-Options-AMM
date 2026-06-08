import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
const BUILD = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),'builds','HEAD_temporal_mvp_v26a.html');
const log=(...a)=>console.log(...a);
(async()=>{
  const b=await chromium.launch({args:['--no-sandbox']});
  const p=await b.newPage({viewport:{width:1600,height:1100}});
  const dlg=[]; p.on('dialog',async d=>{dlg.push(d.message());await d.accept();});
  await p.goto('file://'+BUILD,{waitUntil:'networkidle'}); await p.waitForTimeout(400);
  const spot0=await p.locator('#hdr-pool-spot').textContent().catch(()=>null);
  const kspot0=await p.locator('#kpi-spot-usd').textContent().catch(()=>null);
  log('FRESH hdrSpot:',spot0,'| kpiSpot:',kspot0);
  // add perp
  await p.click('button.tab[data-subtab="perps"]'); await p.waitForTimeout(150);
  await p.fill('#perp-notional','1'); await p.fill('#perp-margin','20000');
  await p.click('#btn-add-perp'); await p.waitForTimeout(250);
  const spot1=await p.locator('#hdr-pool-spot').textContent().catch(()=>null);
  log('after add-perp hdrSpot:',spot1,'dlg:',JSON.stringify(dlg));
  await p.click('button.tab[data-subtab="bands"]'); await p.waitForTimeout(200);
  // gentle strikes per suggestStrikes: sold call 1.05*80k=84000, bought put 0.85*80k=68000
  for(const [n,si,bi] of [['0.05','84000','68000'],['0.05','88000','72000'],['0.2','100000','60000']]){
    await p.fill('#band-notional',n); await p.fill('#sold-inner',si); await p.fill('#bought-inner',bi);
    await p.locator('#bought-inner').press('Tab'); await p.waitForTimeout(300);
    const slip=await p.locator('#band-slippage').textContent();
    const dis=await p.locator('#btn-execute').isDisabled();
    log(`N=${n} call=${si} put=${bi} -> slip=${JSON.stringify(slip)} execDisabled=${dis}`);
  }
  await b.close();
})().catch(e=>{console.error('ERR',e);process.exit(1);});
