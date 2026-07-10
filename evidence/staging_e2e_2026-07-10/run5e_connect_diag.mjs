import { launchWithMM, EXT_ID, APP } from './run5_lib.mjs';
const OUT = process.cwd();
const PROFILE = '/tmp/run5_profile_main';
const PW = 'Testpass123!';
const log=(...a)=>console.log(...a);
async function present(pg,sel,kind='testid',to=600){ try{const l=kind==='testid'?pg.getByTestId(sel):kind==='role-btn'?pg.getByRole('button',{name:sel}):kind==='text'?pg.getByText(sel):pg.locator(sel);return(await l.first().isVisible({timeout:to}))?l.first():null;}catch{return null;} }

const ctx = await launchWithMM(PROFILE);
await new Promise(r=>setTimeout(r,3500));
const popups=[];
ctx.on('page', pg=>{ const u=pg.url(); if(u.includes('notification')){ popups.push(pg); log('POPUP EVENT:',u); pg.on('close',()=>log('POPUP CLOSED:',u)); } });

// unlock
let mm = ctx.pages().find(p=>p.url().startsWith(`chrome-extension://${EXT_ID}`))||await ctx.newPage();
await mm.goto(`chrome-extension://${EXT_ID}/home.html`,{waitUntil:'domcontentloaded'}).catch(()=>{});
await mm.waitForTimeout(2000);
const pf=await present(mm,'unlock-password')||await present(mm,'#password','css')||await present(mm,'unlock-with-password');
if(pf){ await pf.fill(PW); const ub=await present(mm,'unlock-submit')||await present(mm,/^Unlock$/i,'role-btn'); if(ub) await ub.click().catch(()=>{}); }
await mm.waitForTimeout(2500);
log('unlocked');

const app=await ctx.newPage();
await app.goto(APP,{waitUntil:'domcontentloaded',timeout:60000});
await app.waitForTimeout(3500);
for(const nm of [/^Agree$/i,/^I Agree$/i,/^Accept$/i]){ const b=await present(app,nm,'role-btn',1000); if(b){await b.click().catch(()=>{});break;} }
await app.waitForTimeout(1500);

const cb=await present(app,/Connect Wallet/i,'role-btn',2000); if(cb){await cb.click().catch(()=>{}); log('clicked connect');}
// poll for a live popup for up to 12s and dump it repeatedly
for(let s=0;s<24;s++){
  await app.waitForTimeout(500);
  const live = popups.filter(p=>!p.isClosed());
  if(live.length){
    const pg=live[live.length-1];
    try{
      await pg.bringToFront().catch(()=>{});
      log(`t${s} POPUP live url=${pg.url()}`);
      const btns=pg.getByRole('button'); const n=await btns.count();
      const texts=[]; for(let k=0;k<Math.min(n,15);k++){ texts.push((await btns.nth(k).innerText().catch(()=>'')).replace(/\s+/g,' ').trim()); }
      log(`   buttons(${n}): ${JSON.stringify(texts)}`);
      await pg.screenshot({path:`${OUT}/run5e_popup_t${s}.png`}).catch(()=>{});
      // try to click a connect/confirm
      for(const t of ['confirm-btn','page-container-footer-next','confirm-footer-button','connect-button','confirmation-submit-button']){
        const b=await present(pg,t,'testid',300); if(b){ await b.click().catch(()=>{}); log('   clicked testid',t); break; } }
      for(const nm of [/^Connect$/i,/^Next$/i,/^Confirm$/i,/^Approve$/i]){ const b=await present(pg,nm,'role-btn',300); if(b){ await b.click().catch(()=>{}); log('   clicked role',nm.source); break; } }
    }catch(e){ log(`t${s} popup err ${e.message}`); }
  }
  // stop once connected (header no longer shows Connect Wallet)
  const stillConnect=await present(app,/Connect Wallet/i,'role-btn',300);
  if(!stillConnect && s>3){ log('CONNECTED (header changed) at t'+s); break; }
}
await app.waitForTimeout(2000);
await app.screenshot({path:`${OUT}/run5e_app_final.png`});
// report header chip text
const header = await app.locator('header, nav').first().innerText().catch(()=>'');
log('HEADER:', header.replace(/\s+/g,' ').slice(0,200));
await ctx.close();
log('done-diag');
