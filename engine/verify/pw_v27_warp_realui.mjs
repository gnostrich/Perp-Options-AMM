// v27 WARP test driven through the REAL UI (the prior harness's render()/Viz calls were
// no-ops: Viz and render are NOT reachable in page.evaluate — only Engine/Store are). The
// app's own event handlers call the in-scope Viz.drawAll. So: add a perp, configure a band,
// let previewBand() draw the post-trade DOTTED curve, then click #btn-execute and capture the
// shifted SOLID curve. Compare curve silhouettes by COLOR channel (teal call / pink put =
// LIVE curve; grey anchor & rays excluded) to avoid the anchor masking the live curve.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
const ENGINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD  = path.join(ENGINE, 'builds', 'temporal_mvp_v27_wkurtosis_WIP.html');
const EVID   = path.resolve(ENGINE, '..', 'evidence', 'v27_pw');
const out = (n) => path.join(EVID, n);

async function liveProfile(page) {
  return await page.evaluate(() => {
    const cv = document.getElementById('canvas-curve'); const ctx = cv.getContext('2d');
    const d = ctx.getImageData(0,0,cv.width,cv.height).data; const W=cv.width,H=cv.height;
    const colTop = new Array(W).fill(-1); let lit=0;
    const isTeal=(r,g,b)=>g>120&&b>120&&r<120;
    const isPink=(r,g,b)=>r>200&&g>=90&&g<185&&b>110&&b<215;
    for(let x=0;x<W;x++)for(let y=0;y<H;y++){const i=(y*W+x)*4;
      if(d[i+3]>40&&(isTeal(d[i],d[i+1],d[i+2])||isPink(d[i],d[i+1],d[i+2]))){if(colTop[x]<0)colTop[x]=y;lit++;}}
    return {W,H,colTop,lit};
  });
}
function band(pa,pb,fa,fb){if(!pa||!pb||pa.W!==pb.W)return null;const W=pa.W,a=Math.floor(W*fa),b=Math.ceil(W*fb);let s=0,n=0,mx=0;for(let x=a;x<b;x++)if(pa.colTop[x]>=0&&pb.colTop[x]>=0){const dd=Math.abs(pa.colTop[x]-pb.colTop[x]);s+=dd;if(dd>mx)mx=dd;n++;}return n?{mean:+(s/n).toFixed(2),max:mx,n}:null;}
const setVal=async(page,id,v)=>{await page.evaluate(([id,v])=>{const e=document.getElementById(id);e.value=String(v);e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));},[id,v]);await page.waitForTimeout(120);};

async function runOnce(tag){
  const errs=[];
  const browser=await chromium.launch();const page=await browser.newPage();
  page.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE:'+m.text());});
  page.on('pageerror',e=>errs.push('PAGEERROR:'+e.message));
  await page.goto('file://'+BUILD,{waitUntil:'networkidle'});await page.waitForTimeout(700);
  const trace={tag,errs:null};
  await page.selectOption('#chart-select','curve');await page.waitForTimeout(400);

  trace.prePool=await page.evaluate(()=>({...Store.state.pool, oracle:Store.state.oracle}));
  const profPre=await liveProfile(page);
  await page.screenshot({path:out(tag+'_W01_pre_realui.png')});

  // ---- add a perp (Create Perp subtab is the default-active one) ----
  await setVal(page,'perp-notional','0.5');
  await setVal(page,'perp-margin','1');
  await page.click('#btn-add-perp'); await page.waitForTimeout(300);
  trace.afterPerp=await page.evaluate(()=>{const c=Store.state.clubs; return {long:c.long.totalNotional, short:c.short.totalNotional};});

  // ---- switch to TRADE BANDS subtab so the band form + execute button are VISIBLE ----
  await page.click('button[data-subtab="bands"]'); await page.waitForTimeout(250);

  // ---- configure a band: long => sold CALL K>oracle, bought PUT K<oracle (oracle=4.44) ----
  await setVal(page,'band-notional','0.3');
  await setVal(page,'sold-inner','6');
  await setVal(page,'bought-inner','3');
  await page.waitForTimeout(400); // previewBand fires → dotted post-trade curve drawn

  trace.previewBandSet=await page.evaluate(()=>!!window.__previewBand);
  await page.screenshot({path:out(tag+'_W02_preview_dotted.png')});
  trace.executeEnabled=await page.evaluate(()=>!document.getElementById('btn-execute').disabled);
  trace.warnMsg=await page.evaluate(()=>document.getElementById('band-warn')?.textContent || document.querySelector('.warn,.band-warn')?.textContent || '');

  let executed=false;
  if(trace.executeEnabled){
    await page.click('#btn-execute'); await page.waitForTimeout(500); executed=true;
  }
  trace.executed=executed;
  trace.postPool=await page.evaluate(()=>({...Store.state.pool, oracle:Store.state.oracle}));
  trace.phiMoved=Math.abs((trace.postPool.phi??0)-(trace.prePool.phi??0));
  const profPost=await liveProfile(page);
  await page.screenshot({path:out(tag+'_W03_post_execute.png')});

  trace.item3_warpFull=band(profPre,profPost,0.05,0.95);
  trace.item3_warpElbow=band(profPre,profPost,0.30,0.62);
  trace.litPre=profPre.lit; trace.litPost=profPost.lit;
  trace.errs=errs;
  await browser.close();
  return trace;
}
(async()=>{
  const a=await runOnce('A'); const b=await runOnce('B');
  const summary={runA:a,runB:b};
  fs.writeFileSync(out('trace_warp_realui.json'),JSON.stringify(summary,null,2));
  console.log(JSON.stringify(summary,null,2));
})();
