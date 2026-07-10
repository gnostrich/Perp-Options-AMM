import { launchWithMM, EXT_ID, APP } from './run5_lib.mjs';
import { unlockMM, approveOnce } from './run5_connect_lib.mjs';
const OUT = process.cwd();
const PROFILE='/tmp/run5_profile_main';
const PW='Testpass123!';
const log=(...a)=>console.log(...a);
async function vis(pg,sel,kind='role',to=1500){try{const l=kind==='role'?pg.getByRole('button',{name:sel}):kind==='text'?pg.getByText(sel):pg.getByTestId(sel);return(await l.first().isVisible({timeout:to}))?l.first():null;}catch{return null;}}

const ctx=await launchWithMM(PROFILE);
await new Promise(r=>setTimeout(r,3500));
const CONSOLE=[];
const mm=await unlockMM(ctx,PW);
log('unlocked; mm url', mm.url());

const app=await ctx.newPage();
app.on('console',m=>{const t=`[${m.type()}] ${m.text()}`; CONSOLE.push(t); if(/reject|4001|connect|account|permission/i.test(t)&&!/woff|\.css/.test(t)) log('APPC',t.slice(0,120));});
await app.goto(APP,{waitUntil:'domcontentloaded',timeout:60000});
await app.waitForTimeout(3500);
for(const nm of [/^Agree$/i,/^I Agree$/i,/^Accept$/i]){const b=await vis(app,nm);if(b){await b.click().catch(()=>{});break;}}
await app.waitForTimeout(1200);
const cb=await vis(app,/Connect Wallet/i,'role',2500);if(cb){await cb.click().catch(()=>{});log('clicked connect');}

// for 18s: enumerate all ext pages, dump their testid-buttons, approve, screenshot
for(let s=0;s<36;s++){
  await app.waitForTimeout(500);
  const ext=ctx.pages().filter(p=>!p.isClosed()&&p.url().startsWith(`chrome-extension://${EXT_ID}`));
  for(const pg of ext){
    let route=''; try{route=pg.url().split('#')[1]||pg.url().split('/').pop();}catch{}
    // list visible testids quickly via known connect ones
    const found=[];
    for(const t of ['confirm-btn','page-container-footer-next','confirm-footer-button','permission-connect','choose-account-list-operate-all-check','connect-more-accounts']){
      try{if(await pg.getByTestId(t).first().isVisible({timeout:150})) found.push(t);}catch{}
    }
    if(found.length) log(`s${s} EXT route=${route} testids=${found.join(',')}`);
    const tag=await approveOnce(pg).catch(()=>null);
    if(tag) log(`s${s} approved ${tag} on route=${route}`);
  }
  // snapshot mm tab at a few points
  if(s===2||s===6||s===12){ try{await mm.screenshot({path:`${OUT}/run5g_mm_s${s}.png`});}catch{} }
  const stillConnect=await vis(app,/Connect Wallet/i,'role',250);
  if(!stillConnect && s>4){ log('CONNECTED at s'+s); break; }
}
await app.waitForTimeout(2000);
await app.screenshot({path:`${OUT}/run5g_app.png`});
const stillConnect=await vis(app,/Connect Wallet/i,'role',1200);
log('FINAL connected:',!stillConnect);
log('rejected msgs:',CONSOLE.filter(c=>/reject|4001/i.test(c)).length);
await ctx.close();
log('done');
