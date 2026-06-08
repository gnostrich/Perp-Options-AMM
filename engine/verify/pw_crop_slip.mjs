import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
const ENGINE=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BUILD=path.join(ENGINE,'builds','HEAD_temporal_mvp_v26a.html');
const EVID=path.resolve(ENGINE,'..','evidence','v26a_pw');
(async()=>{
  const b=await chromium.launch({args:['--no-sandbox']});
  const p=await b.newPage({viewport:{width:1600,height:1100}});
  p.on('dialog',async d=>{await d.accept();});
  await p.goto('file://'+BUILD,{waitUntil:'networkidle'}); await p.waitForTimeout(400);
  await p.click('button.tab[data-subtab="perps"]'); await p.waitForTimeout(120);
  await p.fill('#perp-notional','1'); await p.fill('#perp-margin','20000'); await p.click('#btn-add-perp'); await p.waitForTimeout(200);
  await p.click('button.tab[data-subtab="bands"]'); await p.waitForTimeout(150);
  await p.fill('#band-notional','0.05'); await p.fill('#sold-inner','84000'); await p.fill('#bought-inner','68000');
  await p.locator('#bought-inner').press('Tab'); await p.waitForTimeout(400);
  // crop the summary block
  const sb=await p.locator('.summary-block');
  await sb.screenshot({path:path.join(EVID,'11_slippage_summary.png')});
  // also crop the slippage row specifically
  await p.locator('.summary-row:has(#band-slippage)').screenshot({path:path.join(EVID,'12_slippage_row.png')});
  await b.close();
  console.log('cropped slippage shots written');
})().catch(e=>{console.error(e);process.exit(1);});
