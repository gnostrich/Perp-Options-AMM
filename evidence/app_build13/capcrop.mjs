import pw from '/tmp/node_modules/playwright/index.js'; const {chromium}=pw; import fs from 'fs';
const OUT='/home/user/Perp-Options-AMM/evidence/app_build13/shots_A';
const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
const pg=await br.newPage({viewport:{width:1800,height:1200}});
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file:///home/user/Perp-Options-AMM/app/index.html');await pg.waitForTimeout(400);
await pg.evaluate(()=>setView('transact'));await pg.waitForTimeout(200);
const set=(id,v)=>pg.evaluate(([i,x])=>{const e=document.getElementById(i);e.value=x;e.dispatchEvent(new Event('input',{bubbles:true}));},[id,v]);
const crop=async(x,y,w,h,s,n)=>{const u=await pg.evaluate(a=>{const [x,y,w,h,s]=a;const src=document.getElementById('cvT');const t=document.createElement('canvas');t.width=w*s;t.height=h*s;const g=t.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(src,x,y,w,h,0,0,w*s,h*s);return t.toDataURL();},[x,y,w,h,s]);
 fs.writeFileSync(OUT+'/'+n+'.png',Buffer.from(u.split(',')[1],'base64'));};
const yT=330,HB=150;
for(const [k,Q,name] of [[40,150,'CAP_k40_Q150'],[-40,150,'CAP_km40_Q150'],[12,60,'CAP_k12_Q60'],[12,240,'CAP_k12_Q240'],[12,201,'CAP_k12_Q201']]){
  await set('tk',k);await set('tkr',k);await set('tsz',Q);await pg.waitForTimeout(200);
  await crop(0,yT,980,HB,1,name+'_band');
  const my=yT+HB-Math.min(1,Q/224)*HB;
  await crop(300,Math.max(yT,my-22),680,30,3,name);
}
console.log('errs',errs.length);await br.close();
