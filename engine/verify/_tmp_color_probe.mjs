import { chromium } from 'playwright';
const BUILD='/home/user/Perp-Options-AMM/engine/builds/temporal_mvp_v27_wkurtosis_WIP.html';
const EVID='/home/user/Perp-Options-AMM/evidence/v27_pw/';
async function profColor(page, pred){
  return await page.evaluate((predStr)=>{
    const pred=eval('('+predStr+')');
    const cv=document.getElementById('canvas-curve'); const ctx=cv.getContext('2d');
    const d=ctx.getImageData(0,0,cv.width,cv.height).data; const W=cv.width,H=cv.height;
    const colTop=new Array(W).fill(-1); let lit=0;
    for(let x=0;x<W;x++)for(let y=0;y<H;y++){const i=(y*W+x)*4;
      if(d[i+3]>40&&pred(d[i],d[i+1],d[i+2])){if(colTop[x]<0)colTop[x]=y;lit++;}}
    return {W,colTop,lit};
  }, pred.toString());
}
function band(pa,pb){let s=0,n=0,mx=0;for(let x=0;x<pa.W;x++)if(pa.colTop[x]>=0&&pb.colTop[x]>=0){const dd=Math.abs(pa.colTop[x]-pb.colTop[x]);s+=dd;if(dd>mx)mx=dd;n++;}return n?{mean:+(s/n).toFixed(2),max:mx,n}:{mean:null,n:0};}
(async()=>{
  const b=await chromium.launch();const page=await b.newPage();
  await page.goto('file://'+BUILD,{waitUntil:'networkidle'});await page.waitForTimeout(700);
  await page.selectOption('#chart-select','curve');await page.waitForTimeout(400);
  // teal call curve ~ (10,186,181); pink put ~ (255,133,176). LIVE curve = teal+pink.
  const teal=(r,g,bl)=>g>120&&bl>120&&r<120;       // teal-ish
  const pink=(r,g,bl)=>r>200&&g>90&&g<180&&bl>120&&bl<210; // pink-ish
  const liveOnly=(r,g,bl)=>teal(r,g,bl)||pink(r,g,bl);
  const draw=(ph)=>page.evaluate((ph)=>{Store.state.pool={...Store.state.pool,phi:ph};Viz.drawAll(Store.state,null);},ph);
  await draw(0); await page.waitForTimeout(200);
  const t0=await profColor(page,teal), p0=await profColor(page,pink), l0=await profColor(page,liveOnly);
  await draw(2); await page.waitForTimeout(200);
  const t2=await profColor(page,teal), p2=await profColor(page,pink), l2=await profColor(page,liveOnly);
  await page.screenshot({path:EVID+'warp_phi2_colorcheck.png'});
  console.log('TEAL (call live curve)  phi0 lit',t0.lit,'phi2 lit',t2.lit,' silhouette delta',JSON.stringify(band(t0,t2)));
  console.log('PINK (put live curve)   phi0 lit',p0.lit,'phi2 lit',p2.lit,' silhouette delta',JSON.stringify(band(p0,p2)));
  console.log('LIVE (teal+pink)        phi0 lit',l0.lit,'phi2 lit',l2.lit,' silhouette delta',JSON.stringify(band(l0,l2)));
  await b.close();
})();
