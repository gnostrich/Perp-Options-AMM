// Probe: does the curve VISIBLY reshape when phi moves? Distinguish "render broken"
// from "the in-band trade's phi delta is sub-pixel small". We draw the curve at a
// sequence of phi values (frame frozen at first draw) and measure the silhouette delta.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
const ENGINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD  = path.join(ENGINE, 'builds', 'temporal_mvp_v27_wkurtosis_WIP.html');
const EVID   = path.resolve(ENGINE, '..', 'evidence', 'v27_pw');
const out = (n) => path.join(EVID, n);

async function prof(page) {
  return await page.evaluate(() => {
    const cv = document.getElementById('canvas-curve'); const ctx = cv.getContext('2d');
    const d = ctx.getImageData(0,0,cv.width,cv.height).data; const W=cv.width,H=cv.height;
    const colTop = new Array(W).fill(-1); let lit=0;
    for(let x=0;x<W;x++)for(let y=0;y<H;y++){const i=(y*W+x)*4; if(d[i]+d[i+1]+d[i+2]>180&&d[i+3]>40){if(colTop[x]<0)colTop[x]=y;lit++;}}
    return {W,H,colTop,lit};
  });
}
function band(pa,pb,fa,fb){const W=pa.W,a=Math.floor(W*fa),b=Math.ceil(W*fb);let s=0,n=0,mx=0;for(let x=a;x<b;x++)if(pa.colTop[x]>=0&&pb.colTop[x]>=0){const dd=Math.abs(pa.colTop[x]-pb.colTop[x]);s+=dd;if(dd>mx)mx=dd;n++;}return n?{mean:+(s/n).toFixed(2),max:mx,n}:null;}

(async()=>{
  const browser = await chromium.launch(); const page = await browser.newPage();
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.goto('file://'+BUILD,{waitUntil:'networkidle'}); await page.waitForTimeout(700);
  await page.selectOption('#chart-select','curve'); await page.waitForTimeout(400);
  const res = { phiSweep: [], maxInBandPhi: null };

  // 1) what's the MAX phi achievable from a single in-band trade (w -> w+ edge)?
  res.tradePhiRange = await page.evaluate(()=>{
    const s = {...Store.state.pool}; const wB = Engine.wField(s); const b = s.y*(1-wB);
    const tries=[]; for(const wT of [0.62,0.70,0.78,0.84]){ const dy=b/(1-wT)-s.y; const post=Engine.tradeUpdate(s,dy);
      tries.push({wT, ok: post&&!post.rejected, phi: post&&post.phi, reason: post&&post.reason}); }
    return tries;
  });

  // 2) draw at a sweep of phi (frame frozen at first), measure silhouette delta vs phi=0
  const base = await prof(page); // phi=0 default
  for(const ph of [0.0, 0.1, 0.3, 0.6, 1.0, 2.0]){
    await page.evaluate((ph)=>{ Store.state.pool = {...Store.state.pool, phi: ph};
      if (typeof Viz!=='undefined'&&Viz) Viz.drawAll(Store.state, null); }, ph);
    await page.waitForTimeout(250);
    const p = await prof(page);
    res.phiSweep.push({ phi: ph, vsBase: band(base,p,0.05,0.95), lit: p.lit });
    if (ph===2.0) await page.screenshot({ path: out('warp_phi_2p0.png') });
    if (ph===0.0) await page.screenshot({ path: out('warp_phi_0p0.png') });
  }
  res.errs = errs;
  console.log(JSON.stringify(res,null,2));
  fs.writeFileSync(out('trace_warp_probe.json'), JSON.stringify(res,null,2));
  await browser.close();
})();
