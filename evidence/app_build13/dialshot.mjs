import pw from '/tmp/node_modules/playwright/index.js'; const {chromium}=pw; import fs from 'fs';
const OUT='/home/user/Perp-Options-AMM/evidence/app_build13/shots_A';
const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
const pg=await br.newPage({viewport:{width:1800,height:1200}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file:///home/user/Perp-Options-AMM/evidence/app_build13/index_build13_pinned.html');await pg.waitForTimeout(400);
await pg.evaluate(()=>setView('transact'));await pg.waitForTimeout(200);
const set=(id,v)=>pg.evaluate(([i,x])=>{const e=document.getElementById(i);e.value=x;e.dispatchEvent(new Event('input',{bubbles:true}));},[id,v]);
const crop=async(x,y,w,h,s,n)=>{const u=await pg.evaluate(a=>{const[x,y,w,h,s]=a;const src=document.getElementById('cvT');const t=document.createElement('canvas');t.width=w*s;t.height=h*s;const g=t.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(src,x,y,w,h,0,0,w*s,h*s);return t.toDataURL();},[x,y,w,h,s]);
 fs.writeFileSync(OUT+'/'+n+'.png',Buffer.from(u.split(',')[1],'base64'));};
for(const D of [0,1]){ await set('arbr',D); await pg.waitForTimeout(250);
  await crop(0,0,980,330,1,'DIAL_D'+String(D).replace('.','p')+'_curves');
  // count distinct maker-line pixels in the plot area
  const c=await pg.evaluate(()=>{const d=document.getElementById('cvT').getContext('2d').getImageData(56,16,908,286).data;
    let faint=0,mine=0;for(let i=0;i<d.length;i+=4){const k=d[i]+','+d[i+1]+','+d[i+2];if(k==='36,59,61')faint++;if(k==='15,95,92')mine++;}return {faint,mine};});
  console.log('D='+D,JSON.stringify(c));}
console.log('errs',errs.length);await br.close();
