import { chromium } from 'playwright';
const url='file://'+'/home/user/Perp-Options-AMM/engine'+'/builds/HEAD_temporal_mvp_v28_lens.html';
const b=await chromium.launch(); const p=await b.newPage();
await p.goto(url,{waitUntil:'networkidle'}); await p.waitForTimeout(400);
const r=await p.evaluate(async()=>{
  const sel=document.getElementById('chart-select');
  sel.value='pricing'; sel.dispatchEvent(new Event('change',{bubbles:true}));
  await new Promise(r=>setTimeout(r,200));
  // wrap renderPricingFrame? it's closure-bound. Instead instrument via __previewPool.
  const si=document.getElementById('sold-inner'),bi=document.getElementById('bought-inner'),bn=document.getElementById('band-notional');
  const set=(e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));};
  set(si,'120000');set(bi,'60000');set(bn,'0.3');
  await new Promise(r=>setTimeout(r,1000));
  const pp1 = window.__previewPool ? {x:window.__previewPool.x,y:window.__previewPool.y} : null;
  set(bn,'0.6');
  await new Promise(r=>setTimeout(r,50));
  const pp2 = window.__previewPool ? {x:window.__previewPool.x,y:window.__previewPool.y} : null;
  // sample chart-2 hash over 1s via rAF
  const cv=document.getElementById('canvas-pricing'),ctx=cv.getContext('2d');
  const hash=()=>{const d=ctx.getImageData(0,0,cv.width,cv.height).data;let h=0;for(let i=0;i<d.length;i+=257)h=(h*31+d[i])>>>0;return h;};
  const hs=new Set();let n=0;const t0=performance.now();
  await new Promise(res=>{function t(){hs.add(hash());n++;if(performance.now()-t0<1200)requestAnimationFrame(t);else res();}requestAnimationFrame(t);});
  return {pp1,pp2,distinct:hs.size,frames:n, step:window.__previewStep};
});
console.log(JSON.stringify(r,null,1));
await b.close();
