// READ-ONLY: after Execute, do the preview (dotted) ray and the open-band
// (dashed) ray point the SAME way (no crossing contradiction)? Plus pixel
// histogram of the curve canvas to confirm both rays sit on the call/put side.
import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
const ROOT = '/home/user/Perp-Options-AMM';
const OUT = ROOT + '/evidence/playground_v24_behavioral';
const PG = ROOT + '/reference/temporal_curve_playground.html';

const PROBE = `(() => {
  const s = Store.state; const oracle = s.oracle; const p = s.pool;
  const modeSlope = p.beta/p.alpha;
  const live = (Ki,Ko)=>{const ri=(isFinite(Ki)&&Ki>0)?Ki/oracle:NaN;const ro=(isFinite(Ko)&&Ko>0)?Ko/oracle:NaN;return (isFinite(ro)&&ro>0)?Math.sqrt(ri*ro):ri;};
  const open=[];
  for(const b of s.bands){ if(b.status!=='open')continue;
    open.push({sold_wing:b.sold_wing,sold_rawSlope:live(b.sold.K_inner,b.sold.K_outer)*oracle,
               bought_wing:b.bought_wing,bought_rawSlope:live(b.bought.K_inner,b.bought.K_outer)*oracle});}
  let prev=null;
  if(window.__previewBand){const pb=window.__previewBand;
    prev={sold_wing:pb.sold_wing,sold_rawSlope:pb.sold&&pb.sold.K_inner!=null?live(pb.sold.K_inner,pb.sold.K_outer)*oracle:null,
          bought_wing:pb.bought_wing,bought_rawSlope:pb.bought&&pb.bought.K_inner!=null?live(pb.bought.K_inner,pb.bought.K_outer)*oracle:null};}
  return {oracle,modeSlope,open,prev,bandCount:s.bands.length};
})()`;

(async()=>{
  const errs=[];
  const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const page=await browser.newPage({viewport:{width:1500,height:1100}});
  page.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  page.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE.ERR: '+m.text());});
  await page.goto('file://'+PG); await page.waitForTimeout(800);
  await page.evaluate(()=>{const sel=document.getElementById('chart-select');sel.value='curve';sel.dispatchEvent(new Event('change',{bubbles:true}));});
  await page.waitForTimeout(200);

  const before=await page.evaluate(PROBE);
  // Execute the default band so an OPEN band ray exists, then re-open a preview
  // by nudging the input so a dotted preview ray coexists with the dashed open ray.
  await page.evaluate(()=>{const b=document.getElementById('btn-execute'); if(b) b.click();});
  await page.waitForTimeout(400);
  // re-arm a preview (slightly different call strike) so both overlays show
  await page.evaluate(()=>{const el=document.getElementById('sold-inner'); if(el){el.value='86000';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}});
  await page.waitForTimeout(300);
  const after=await page.evaluate(PROBE);
  const cv=await page.$('#canvas-curve');
  if(cv) await cv.screenshot({path:OUT+'/A_pg_3_open_plus_preview.png'});

  console.log(JSON.stringify({before,after,errs},null,2));
  await browser.close();
})();
