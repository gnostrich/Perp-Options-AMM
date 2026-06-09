// READ-ONLY: side-by-side of the honest playground pool curve vs v24 Balancer curve.
import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
import { pathToFileURL } from 'url';

const PG  = '/home/user/Perp-Options-AMM/reference/temporal_curve_playground.html';
const V24 = '/home/user/Perp-Options-AMM/reference/v24_balancer_stable.html';
const OUT = '/home/user/Perp-Options-AMM/evidence/playground_honest';

async function shotCurve(file, name){
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', headless:true });
  const p = await b.newPage({ viewport:{width:1000,height:760} });
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(pathToFileURL(file).href,{waitUntil:'networkidle'});
  await p.waitForTimeout(700);
  // ensure curve view selected if a selector exists
  await p.evaluate(()=>{ const sel=document.getElementById('chart-select'); if(sel){ sel.value='curve'; sel.dispatchEvent(new Event('change',{bubbles:true})); }});
  await p.waitForTimeout(400);
  const nb = await p.evaluate(()=>{ const cv=document.getElementById('canvas-curve'); if(!cv) return -1;
    const ctx=cv.getContext('2d'); const d=ctx.getImageData(0,0,cv.width,cv.height).data; let n=0;
    for(let i=0;i<d.length;i+=4){ if(d[i+3]>10 && !(d[i]<8&&d[i+1]<8&&d[i+2]<8)) n++; } return n; });
  // screenshot the canvas element (scroll into view first; v24 needs the chart visible)
  const el = await p.$('#canvas-curve');
  if (el) { await el.scrollIntoViewIfNeeded().catch(()=>{}); await p.waitForTimeout(150); await el.screenshot({ path:`${OUT}/${name}.png` }); }
  else { await p.screenshot({ path:`${OUT}/${name}.png` }); }
  await b.close();
  return { nb, errs };
}

const pg = await shotCurve(PG, '_pg_curve');
const v24 = await shotCurve(V24, '_v24_curve');
console.log('playground curve:', JSON.stringify(pg));
console.log('v24 curve:', JSON.stringify(v24));

// compose side-by-side with labels using a headless canvas page
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', headless:true });
const p = await b.newPage({ viewport:{width:1600,height:640} });
import { readFileSync } from 'fs';
const pgB64 = readFileSync(`${OUT}/_pg_curve.png`).toString('base64');
const v24B64 = readFileSync(`${OUT}/_v24_curve.png`).toString('base64');
await p.setContent(`<html><body style="margin:0;background:#111">
<canvas id="c" width="1560" height="600"></canvas>
<script>
const c=document.getElementById('c'),x=c.getContext('2d');
x.fillStyle='#0d0d0d';x.fillRect(0,0,1560,600);
function lbl(t,X){x.fillStyle='#E4E4E4';x.font='16px sans-serif';x.fillText(t,X,28);}
const i1=new Image(),i2=new Image();let n=0;
function done(){ if(++n<2) return;
  x.drawImage(i2,20,44,740,500); x.drawImage(i1,800,44,740,500);
  lbl('v24 — Balancer weight-form (reference)',20); lbl('playground — GH honest native (teal call / pink put)',800);
  window.__ready=true; }
i1.onload=done;i2.onload=done;
i1.src='data:image/png;base64,${pgB64}'; i2.src='data:image/png;base64,${v24B64}';
</script></body></html>`);
await p.waitForFunction('window.__ready===true',{timeout:10000});
await p.waitForTimeout(200);
await p.screenshot({ path:`${OUT}/side_by_side_honest.png`, clip:{x:0,y:0,width:1560,height:560} });
await b.close();
console.log('composed side_by_side_honest.png');
