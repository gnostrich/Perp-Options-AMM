import { launchWithMM, EXT_ID, APP } from './run5_lib.mjs';
import fs from 'fs';
const OUT = process.cwd();
const PROFILE = '/tmp/run5_profile_main';
const PW = 'Testpass123!';
const NET = [], WS = [], CONSOLE = [];
const log = (...a) => console.log(...a);

async function present(pg, sel, kind='testid', to=500){
  try { const l = kind==='testid'?pg.getByTestId(sel):kind==='role-btn'?pg.getByRole('button',{name:sel}):kind==='text'?pg.getByText(sel):pg.locator(sel);
    return (await l.first().isVisible({timeout:to}))?l.first():null; } catch { return null; }
}
async function approvePopup(pg, tag){
  for(let n=0;n<8;n++){
    await pg.waitForTimeout(500);
    let clicked=null;
    for(const t of ['confirm-btn','confirmation-submit-button','page-container-footer-next','confirm-footer-button','connect-button','confirm-network-switch-button','confirm-network-approve-button','submit-add-network']){
      const b=await present(pg,t,'testid',400); if(b){ await b.click().catch(()=>{}); clicked=t; break; } }
    if(!clicked) for(const nm of [/^Connect$/i,/^Approve$/i,/^Confirm$/i,/^Next$/i,/^Sign$/i,/^Switch network$/i,/^Approve$/i,/^Got it$/i]){
      const b=await present(pg,nm,'role-btn',350); if(b){ await b.click().catch(()=>{}); clicked=nm.source; break; } }
    log(`  [popup ${tag}] s${n} clicked=${clicked||'none'} u=${pg.url().split('/').pop().slice(0,40)}`);
    if(!clicked && n>1) break;
  }
}

const ctx = await launchWithMM(PROFILE);
await new Promise(r=>setTimeout(r,3500));
ctx.on('page', async pg=>{ const u=pg.url();
  if(u.startsWith(`chrome-extension://${EXT_ID}`) && (u.includes('notification')||u.includes('popup'))){ log('MM popup:',u.split('/').pop()); await approvePopup(pg,'auto').catch(()=>{}); }
});

// ---- unlock MM ----
let mm = ctx.pages().find(p=>p.url().startsWith(`chrome-extension://${EXT_ID}`)) || await ctx.newPage();
await mm.goto(`chrome-extension://${EXT_ID}/home.html`,{waitUntil:'domcontentloaded'}).catch(()=>{});
await mm.waitForTimeout(2000);
let unlocked=false;
const pwField = await present(mm,'unlock-password') || await present(mm,'#password','css') || await present(mm,'unlock-with-password');
if(pwField){ await pwField.fill(PW).catch(()=>{});
  const ub = await present(mm,'unlock-submit') || await present(mm,'unlock-wallet-button') || await present(mm,/^Unlock$/i,'role-btn');
  if(ub){ await ub.click().catch(()=>{}); unlocked=true; }
}
await mm.waitForTimeout(2500);
// dismiss any post-unlock popover
for(const nm of [/Maybe later/i,/Not now/i,/Got it/i,/Done/i]){ const b=await present(mm,nm,'role-btn',600)||await present(mm,nm,'text',600); if(b){ await b.click().catch(()=>{}); break; } }
await mm.screenshot({path:`${OUT}/run5d_00_mm_unlocked.png`});
log('unlocked:',unlocked);

// ---- app ----
const app = await ctx.newPage();
app.on('console', m=>CONSOLE.push(`[${m.type()}] ${m.text()}`));
app.on('pageerror', e=>CONSOLE.push(`[pageerror] ${e.message}`));
app.on('requestfailed', r=>NET.push(`FAIL ${r.failure()?.errorText||''} ${r.url()}`));
app.on('response', r=>{ const s=r.status(),u=r.url();
  if(u.includes('temporal.exchange')||u.includes('arbitrum')||u.includes('hyperliquid')||s>=400) NET.push(`${s} ${r.request().method()} ${u}`); });
app.on('websocket', ws=>{ const u=ws.url(); WS.push(`OPEN ${u}`); log('WS OPEN',u);
  ws.on('framereceived', f=>WS.push(`  <= ${u.slice(0,55)} ${(f.payload||'').toString().slice(0,160)}`));
  ws.on('framesent', f=>WS.push(`  => ${u.slice(0,55)} ${(f.payload||'').toString().slice(0,160)}`));
  ws.on('close', ()=>WS.push(`CLOSE ${u}`)); });

await app.goto(APP,{waitUntil:'domcontentloaded',timeout:60000});
await app.waitForTimeout(3500);
await app.screenshot({path:`${OUT}/run5d_01_landing.png`});
log('title:',await app.title());
// disclaimer
for(const nm of [/^Agree$/i,/^I Agree$/i,/^Accept$/i,/^Continue$/i,/^Enter/i]){ const b=await present(app,nm,'role-btn',1000); if(b){ await b.click().catch(()=>{}); log('disclaimer',nm.source); break; } }
await app.waitForTimeout(1500);
// connect
for(const nm of [/Connect Wallet/i,/Connect$/i]){ const b=await present(app,nm,'role-btn',1500); if(b){ await b.click().catch(()=>{}); log('connect',nm.source); break; } }
await app.waitForTimeout(2000);
await app.screenshot({path:`${OUT}/run5d_02_connect_modal.png`});
// pick MetaMask
const mmOpt = await present(app,/MetaMask/i,'text',1500); if(mmOpt){ await mmOpt.click().catch(()=>{}); log('picked MetaMask'); }
await app.waitForTimeout(4000);
for(const pg of ctx.pages()){ if(pg.url().includes('notification')) await approvePopup(pg,'explicit').catch(()=>{}); }
await app.waitForTimeout(3000);
await app.screenshot({path:`${OUT}/run5d_03_after_connect.png`});
// approve any lingering popups + settle
for(const pg of ctx.pages()){ if(pg.url().includes('notification')) await approvePopup(pg,'explicit2').catch(()=>{}); }
await app.waitForTimeout(12000);
await app.screenshot({path:`${OUT}/run5d_04_settled.png`,fullPage:false});

const sepoliaCsp = CONSOLE.filter(c=>c.includes('sepolia-rollup')).length;
const stagingWs = WS.filter(w=>w.startsWith('OPEN')&&w.includes('staging-be')).length;
const hlWs = WS.filter(w=>w.startsWith('OPEN')&&w.includes('hyperliquid')).length;
const ammTimeout = CONSOLE.filter(c=>/AMM tree|market_data|Did not receive|Timeout/i.test(c)).length;
fs.writeFileSync(`${OUT}/run5d_console.log`,CONSOLE.join('\n'));
fs.writeFileSync(`${OUT}/run5d_network.log`,NET.join('\n'));
fs.writeFileSync(`${OUT}/run5d_ws.log`,WS.join('\n'));
log('=== SUMMARY ===');
log('sepolia-rollup CSP hits:',sepoliaCsp);
log('staging-be ws OPENs:',stagingWs);
log('hyperliquid ws OPENs:',hlWs);
log('AMM/timeout msgs:',ammTimeout);
log('distinct WS OPEN:',[...new Set(WS.filter(w=>w.startsWith('OPEN')).map(w=>w.slice(5,75)))].join(' | '));
log('net sample:',NET.slice(0,8).join(' || '));
await ctx.close();
log('done-connect');
