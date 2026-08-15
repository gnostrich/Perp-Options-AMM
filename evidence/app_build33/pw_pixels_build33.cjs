/* focused pixel probe: cloud geometry (both sides) + the orange "at your size"
   curve vs top-of-book (both sides).  Usage: node pw_pixels_build33.cjs A|B      */
const {chromium}=require('/tmp/node_modules/playwright');
const fs=require('fs'),path=require('path');
const RUN=process.argv[2]||'A',OUT='/home/user/Perp-Options-AMM/evidence/app_build33';
const SH=path.join(OUT,'pix_'+RUN);fs.mkdirSync(SH,{recursive:true});
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
const page=await b.newPage({viewport:{width:1900,height:1200}});
const errs=[];page.on('pageerror',e=>errs.push(String(e)));
await page.goto('file:///home/user/Perp-Options-AMM/app/index.html',{waitUntil:'load'});
await page.waitForTimeout(400);
const O={run:RUN};
const click=async s=>{await page.click(s);await page.waitForTimeout(200);};
/* ── EARN cloud, both sides ── */
for(const side of ['ask','bid']){
  await page.click('[data-nav="earn"]');await page.waitForTimeout(200);
  await click(side==='ask'?'#ebBuy':'#ebSell');
  O['earn_'+side]=await page.evaluate(sd=>{
    const cv=document.getElementById('cv'),g=cv.getContext('2d'),W=cv.width,H=cv.height;
    const d=g.getImageData(0,0,W,H).data;
    const st=calc(),L=56,R=16,T=16,Bm=32,PH=H-T-Bm-28;
    const meRow=st.book.find(m=>m.me),Qme=Math.max(0.1,(meRow?meRow.share:1)*MKT.pool);
    const dFullCaption=(Qme/MKT.pool)*100*LAM*st.c.ATM;
    const cask=[];for(let i=0;i<=140;i++){const k=-0.7+1.4*i/140;cask.push(st.c.CALL(k)*(1+(st.hEff/1e4)*MAG));}
    const ymax=Math.max(...cask)+dFullCaption*1.02;
    const X=k=>L+(k+0.7)/1.4*(W-L-R),V=y=>(1-(y-T)/PH)*ymax;
    const isC=(i)=>sd==='ask'? (d[i+1]>40&&d[i+2]>40&&d[i+1]>d[i]+25)   // teal
                             : (d[i]>60&&d[i]>d[i+1]+25&&d[i]>d[i+2]+25); // red
    const cols=[];
    for(const k of [-0.55,-0.31,-0.11,0.09,0.29,0.49]){
      const x=Math.round(X(k));let top=null,bot=null;
      for(let y=T+50;y<T+PH;y++){const i=(y*W+x)*4;if(isC(i)){if(top===null)top=y;bot=y;}}
      const edge=st.c.CALL(k)*(sd==='ask'?1+st.hEff/1e4:1-st.hEff/1e4);
      cols.push({k,topVal:top===null?null:+V(top).toFixed(4),botVal:bot===null?null:+V(bot).toFixed(4),
        edge:+edge.toFixed(4),
        bandWidth:top===null?null:+Math.abs(V(top)-V(bot)).toFixed(4),
        onCorrectSide: top===null?null:(sd==='ask'? V(bot)>=edge-0.01 : V(top)<=edge+0.01)});}
    return {side:sd,ymax:+ymax.toFixed(4),captionStretch:+dFullCaption.toFixed(4),
      trueStretch:+(st.c.ATM).toFixed(4),hEffBps:+st.hEff.toFixed(2),cols};},side);
  await page.locator('#cv').screenshot({path:path.join(SH,'earn_cloud_'+side+'.png')});}
/* ── TRANSACT orange curve vs top of book, both sides, size 50 ── */
await page.click('[data-nav="transact"]');await page.waitForTimeout(200);
await page.evaluate(()=>{const e=document.getElementById('tsz');e.value=50;e.dispatchEvent(new Event('input',{bubbles:true}));});
await page.waitForTimeout(250);
for(const side of ['ask','bid']){
  await click(side==='ask'?'#cbBuy':'#cbSell');
  O['book_'+side]=await page.evaluate(()=>{
    const cv=document.getElementById('cvT'),g=cv.getContext('2d'),W=cv.width,H=cv.height;
    const d=g.getImageData(0,0,W,H).data;
    const set=makerCurves(),st=calc(),B=aggBook(set,st.book.map(m=>m.h));
    const L=56,R=16,T=16,Bm=30,PH=H-T-Bm-28;
    const xs=[];for(let i=0;i<=140;i++)xs.push(-0.7+1.4*i/140);
    const ymax=Math.max(...xs.map(B.ask))*1.06,X=k=>L+(k+0.7)/1.4*(W-L-R),Yv=y=>(1-(y-T)/PH)*ymax;
    const Q=+document.getElementById('tsz').value;
    const LC=landedCurve(set,MKT.pool,Q,CSIDE==='ask'?'ask':'bid');
    const rows=[];
    for(const k of [-0.31,0.09,0.29]){
      const x=Math.round(X(k));const hit=[];
      for(let y=T+40;y<T+PH;y++){const i=(y*W+x)*4;
        if(d[i]>195&&d[i+1]>120&&d[i+1]<220&&d[i+2]<140&&d[i]-d[i+2]>80)hit.push(y);}
      const oy=hit.length?hit.reduce((a,c)=>a+c,0)/hit.length:null;
      const tob=CSIDE==='ask'?B.ask(k):B.bid(k);
      rows.push({k,orangeVal:oy===null?null:+Yv(oy).toFixed(5),nPix:hit.length,
        landedAnalytic:+LC(k).toFixed(5),tob:+tob.toFixed(5),
        orangeAboveTob:oy===null?null:Yv(oy)>tob,
        captionSaysWorse:true});}
    return {side:CSIDE,Q,rows,
      caption_bps:+(Math.abs(LC(0.12)/(CSIDE==='ask'?B.ask(0.12):B.bid(0.12))-1)*1e4).toFixed(0)};});
  await page.locator('#cvT').screenshot({path:path.join(SH,'book_'+side+'.png')});}
O.pageerrors=errs;
fs.writeFileSync(path.join(OUT,'PIXELS_run'+RUN+'.json'),JSON.stringify(O,null,1));
console.log(JSON.stringify(O,null,1));
await b.close();})();
