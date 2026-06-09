// READ-ONLY live-browser verification of reference/temporal_curve_playground.html (honest revert).
import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
import { pathToFileURL } from 'url';

const FILE = '/home/user/Perp-Options-AMM/reference/temporal_curve_playground.html';
const OUT  = '/home/user/Perp-Options-AMM/evidence/playground_honest';
const url  = pathToFileURL(FILE).href;

const hex = (r,g,b) => '#' + [r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
function classify(r,g,b){
  // teal ~ (10,186,181); pink ~ (255,133,176); green ~ (20,232,0); orange ~ (255,165,0)
  if (g>120 && b>120 && r<120) return 'teal/cyan';
  if (r>200 && g>90 && g<190 && b>120) return 'pink';
  if (g>180 && r<120 && b<120) return 'green';
  if (r>200 && g>120 && g<200 && b<100) return 'orange';
  return 'other';
}

async function run(runIdx){
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', headless:true });
  const page = await browser.newPage({ viewport:{width:1500,height:1000} });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: '+e.message));
  page.on('console', m => { if (m.type()==='error') errs.push('CONSOLE.ERROR: '+m.text()); });
  await page.goto(url, { waitUntil:'networkidle' });
  await page.waitForTimeout(800);

  // ---- ITEM 1: sample live-curve pixel colors both sides of the mode ray ----
  // Reproduce drawCurve's frame + live trace using Engine on Store.state.pool
  // (the pool carries ghP/ghNx/ghNy/ghM/ghMu + alpha/beta/x/y; bare snapshot/curveTrace
  // UI fns are NOT reachable in evaluate, so we call Engine directly).
  const sample = await page.evaluate(() => {
    const cv = document.getElementById('canvas-curve');
    const W = cv.width, H = cv.height;
    const s = Store.state;
    const p = s.pool;
    const oracle = s.oracle;
    const eq = Engine.arbitrageToOracle(p, oracle);
    const xEq = eq?eq.x:p.x, yEq = eq?eq.y:p.y;
    const xMax = xEq*3.0, yMax = yEq*3.0;
    const modeSlope = p.beta/p.alpha;
    const pad = {top:18,right:18,bottom:44,left:64};
    const plotW = W-pad.left-pad.right, plotH = H-pad.top-pad.bottom;
    const toPx = (x,y)=>[pad.left+(x/xMax)*plotW, pad.top+(1-y/yMax)*plotH];
    // live trace = curveTrace: arbitrageToOracle over mp0*e^(-6..6)
    const mp0 = Engine.getMP_raw(p);
    const live = [];
    for (let i=0;i<=400;i++){
      const o = mp0*Math.exp(-6+12*i/400);
      const st = Engine.arbitrageToOracle(p,o);
      if (st && st.x>0 && st.y>0) live.push([st.x, st.y]);
    }
    const callSamples=[], putSamples=[];
    for (const [x,y] of live){
      if (x>xMax*1.2 || y>yMax*1.2 || x<=0) continue;
      const [px,py]=toPx(x,y);
      if (px<pad.left+2||px>W-2||py<2||py>H-pad.bottom-2) continue;
      const isCall = (y/x>modeSlope);
      const rec={x,y,px:Math.round(px),py:Math.round(py)};
      if (isCall) callSamples.push(rec); else putSamples.push(rec);
    }
    return { W,H, modeSlope, nLive:live.length, callSamples, putSamples };
  });

  async function probe(px, py){
    return await page.evaluate(({px,py})=>{
      const ctx = document.getElementById('canvas-curve').getContext('2d');
      let best=null;
      for (let dx=-3; dx<=3; dx++) for (let dy=-3; dy<=3; dy++){
        const d = ctx.getImageData(px+dx, py+dy, 1,1).data;
        if (d[3]<40) continue;
        const mx=Math.max(d[0],d[1],d[2]), mn=Math.min(d[0],d[1],d[2]);
        const sat=mx-mn;
        if (!best || sat>best.sat) best={r:d[0],g:d[1],b:d[2],a:d[3],sat,dx,dy};
      }
      return best;
    },{px,py});
  }

  // pick samples spread across each wing
  const pick = (arr,n)=>{ const out=[]; const step=Math.max(1,Math.floor(arr.length/n)); for(let i=0;i<arr.length&&out.length<n;i+=step) out.push(arr[i]); return out; };
  const callHits=[], putHits=[];
  for (const p of pick(sample.callSamples,14)){ const c=await probe(p.px,p.py); if(c) callHits.push({...p,...c}); }
  for (const p of pick(sample.putSamples,14)){ const c=await probe(p.px,p.py); if(c) putHits.push({...p,...c}); }
  const summarize = (hits)=>{
    const counts={};
    for(const h of hits){ const k=classify(h.r,h.g,h.b); counts[k]=(counts[k]||0)+1; }
    const examples = hits.slice(0,5).map(h=>`${hex(h.r,h.g,h.b)}@(${h.px},${h.py})=${classify(h.r,h.g,h.b)}`);
    return {counts, examples, n:hits.length};
  };
  const item1 = { modeSlope:sample.modeSlope, nLive:sample.nLive,
                  nCallSamp:sample.callSamples.length, nPutSamp:sample.putSamples.length,
                  call:summarize(callHits), put:summarize(putHits) };

  await page.screenshot({ path:`${OUT}/colors_restored.png`, clip:{x:0,y:0,width:760,height:560} });

  // ---- ITEM 2: cross-graph reactivity ----
  const nb = async (id)=> await page.evaluate((id)=>{
    const cv=document.getElementById(id); if(!cv) return -1;
    const ctx=cv.getContext('2d'); const d=ctx.getImageData(0,0,cv.width,cv.height).data;
    let n=0; for(let i=0;i<d.length;i+=4){ if(d[i+3]>10 && !(d[i]<8&&d[i+1]<8&&d[i+2]<8)) n++; } return n;
  }, id);
  const sig = async (id)=> await page.evaluate((id)=>{
    const cv=document.getElementById(id); if(!cv) return -1;
    const ctx=cv.getContext('2d'); const d=ctx.getImageData(0,0,cv.width,cv.height).data;
    let s=0; for(let i=0;i<d.length;i+=4){ s += d[i]*1+d[i+1]*3+d[i+2]*7+d[i+3]; } return s;
  }, id);

  async function setDial(id, val){
    await page.evaluate(({id,val})=>{
      const el=document.getElementById(id); el.value=String(val);
      el.dispatchEvent(new Event('input',{bubbles:true}));
      el.dispatchEvent(new Event('change',{bubbles:true}));
    },{id,val});
    await page.waitForTimeout(250);
  }
  async function selectView(v){
    await page.evaluate((v)=>{
      const sel=document.getElementById('chart-select'); sel.value=v;
      sel.dispatchEvent(new Event('change',{bubbles:true}));
    },v);
    await page.waitForTimeout(300);
  }

  const cross = {};
  await selectView('curve');
  const curve_g0 = await sig('canvas-curve'); const curve_nb0 = await nb('canvas-curve');
  await page.screenshot({ path:`${OUT}/cross_curve_before_gamma.png`, clip:{x:0,y:0,width:760,height:560} });
  await setDial('vk-gamma', 2.0);
  const curve_g1 = await sig('canvas-curve'); const curve_nb1 = await nb('canvas-curve');
  await page.screenshot({ path:`${OUT}/cross_curve_after_gamma.png`, clip:{x:0,y:0,width:760,height:560} });
  cross.gamma_curve = { sig_before:curve_g0, sig_after:curve_g1, sig_delta:Math.abs(curve_g1-curve_g0), changed:curve_g0!==curve_g1, nb_before:curve_nb0, nb_after:curve_nb1 };

  await selectView('pricing');
  await page.waitForTimeout(200);
  const pr0 = await sig('canvas-pricing'); const pr_nb0 = await nb('canvas-pricing');
  await page.screenshot({ path:`${OUT}/cross_pricing_before_delta.png`, clip:{x:0,y:0,width:960,height:480} });
  await setDial('vk-delta', 5);
  const pr1 = await sig('canvas-pricing'); const pr_nb1 = await nb('canvas-pricing');
  await page.screenshot({ path:`${OUT}/cross_pricing_after_delta.png`, clip:{x:0,y:0,width:960,height:480} });
  cross.delta_pricing = { sig_before:pr0, sig_after:pr1, sig_delta:Math.abs(pr1-pr0), changed:pr0!==pr1, nb_before:pr_nb0, nb_after:pr_nb1 };

  await selectView('payoff');
  await page.waitForTimeout(200);
  const py0 = await sig('canvas-payoff'); const py_nb0 = await nb('canvas-payoff');
  await page.screenshot({ path:`${OUT}/cross_payoff_before_betah.png`, clip:{x:0,y:0,width:960,height:500} });
  await setDial('vk-betah', 0.5);
  const py1 = await sig('canvas-payoff'); const py_nb1 = await nb('canvas-payoff');
  await page.screenshot({ path:`${OUT}/cross_payoff_after_betah.png`, clip:{x:0,y:0,width:960,height:500} });
  cross.betah_payoff = { sig_before:py0, sig_after:py1, sig_delta:Math.abs(py1-py0), changed:py0!==py1, nb_before:py_nb0, nb_after:py_nb1 };

  const readouts = await page.evaluate(()=>({
    gamma:document.getElementById('vk-gamma-out')?.textContent,
    delta:document.getElementById('vk-delta-out')?.textContent,
    betah:document.getElementById('vk-betah-out')?.textContent,
    sstar:document.getElementById('vk-sstar-out')?.textContent,
  }));

  await browser.close();
  return { run:runIdx, errs, item1, cross, readouts };
}

const r1 = await run(1);
const r2 = await run(2);
console.log(JSON.stringify({ r1, r2 }, null, 2));
