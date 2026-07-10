import { launchWithMM, EXT_ID, APP } from './run5_lib.mjs';
import { unlockMM, drainPopups, approveOnce } from './run5_connect_lib.mjs';
import fs from 'fs';
const OUT = process.cwd();
const PROFILE = '/tmp/run5_profile_main';
const PW = 'Testpass123!';
const NET=[],WS=[],CONSOLE=[];
const log=(...a)=>console.log(...a);
async function vis(pg,sel,kind='role',to=1500){ try{const l=kind==='role'?pg.getByRole('button',{name:sel}):kind==='text'?pg.getByText(sel):kind==='css'?pg.locator(sel):pg.getByTestId(sel);return(await l.first().isVisible({timeout:to}))?l.first():null;}catch{return null;} }

const ctx = await launchWithMM(PROFILE);
await new Promise(r=>setTimeout(r,3500));
// background popup drainer
let draining=true;
(async()=>{ while(draining){ const live=ctx.pages().filter(p=>!p.isClosed()&&p.url().includes('notification')); for(const pg of live){ const t=await approveOnce(pg).catch(()=>null); if(t){ log('  [bg-approve]',t); await pg.waitForTimeout(600); } } await new Promise(r=>setTimeout(r,500)); } })();

const mm = await unlockMM(ctx, PW);
log('unlocked');

const app = await ctx.newPage();
app.on('console', m=>CONSOLE.push(`[${m.type()}] ${m.text()}`));
app.on('pageerror', e=>CONSOLE.push(`[pageerror] ${e.message}`));
app.on('requestfailed', r=>NET.push(`FAIL ${r.failure()?.errorText||''} ${r.url()}`));
app.on('response', r=>{const s=r.status(),u=r.url(); if(u.includes('temporal.exchange')||u.includes('arbitrum')||u.includes('hyperliquid')||s>=400) NET.push(`${s} ${r.request().method()} ${u}`);});
app.on('websocket', ws=>{const u=ws.url(); WS.push(`OPEN ${u}`); log('WS OPEN',u);
  ws.on('framereceived',f=>WS.push(`  <= ${u.slice(0,55)} ${(f.payload||'').toString().slice(0,150)}`));
  ws.on('framesent',f=>WS.push(`  => ${u.slice(0,55)} ${(f.payload||'').toString().slice(0,150)}`));
  ws.on('close',()=>WS.push(`CLOSE ${u}`));});

await app.goto(APP,{waitUntil:'domcontentloaded',timeout:60000});
await app.waitForTimeout(3500);
for(const nm of [/^Agree$/i,/^I Agree$/i,/^Accept$/i]){ const b=await vis(app,nm); if(b){await b.click().catch(()=>{});log('disclaimer',nm.source);break;} }
await app.waitForTimeout(1500);

const cb=await vis(app,/Connect Wallet/i,'role',2500); if(cb){await cb.click().catch(()=>{});log('clicked connect');}
// in-page chooser?
await app.waitForTimeout(1500);
const mmOpt=await vis(app,/MetaMask/i,'text',1500); if(mmOpt){await mmOpt.click().catch(()=>{});log('picked MetaMask in-page');}
// give the bg drainer time to approve the (slow) popup; also actively drain
await drainPopups(ctx, 22000);
await app.waitForTimeout(3000);
await app.screenshot({path:`${OUT}/run5f_01_after_connect.png`});

// check connected: header should show an address chip, not "Connect Wallet"
const stillConnect = await vis(app,/Connect Wallet/i,'role',1500);
let headerTxt=''; try{ headerTxt=(await app.locator('header,nav').first().innerText()).replace(/\s+/g,' ').trim(); }catch{}
log('CONNECTED?', !stillConnect, '| header:', headerTxt.slice(0,160));

// let data settle & watch
await app.waitForTimeout(12000);
await app.screenshot({path:`${OUT}/run5f_02_settled.png`});
// re-read MAX / deposit hint (connected wallets show balance)
let depositMax=''; try{ depositMax=(await app.getByText(/MAX/i).first().innerText().catch(()=>'')).replace(/\s+/g,' '); }catch{}
log('deposit MAX text:', depositMax);

draining=false;
const sepoliaCsp=CONSOLE.filter(c=>c.includes('sepolia-rollup')).length;
const stagingWs=WS.filter(w=>w.startsWith('OPEN')&&w.includes('staging-be')).length;
const hlWs=WS.filter(w=>w.startsWith('OPEN')&&w.includes('hyperliquid')).length;
const ammTimeout=CONSOLE.filter(c=>/AMM tree|Did not receive|market_data/i.test(c)).length;
const rejected=CONSOLE.filter(c=>/User rejected|4001/i.test(c)).length;
fs.writeFileSync(`${OUT}/run5f_console.log`,CONSOLE.join('\n'));
fs.writeFileSync(`${OUT}/run5f_network.log`,NET.join('\n'));
fs.writeFileSync(`${OUT}/run5f_ws.log`,WS.join('\n'));
log('=== SUMMARY ===');
log('connected:',!stillConnect,'| user-rejected msgs:',rejected);
log('sepolia CSP:',sepoliaCsp,'| staging-be ws:',stagingWs,'| hl ws:',hlWs,'| amm-timeout:',ammTimeout);
log('WS OPENs:',[...new Set(WS.filter(w=>w.startsWith('OPEN')).map(w=>w.slice(5,75)))].join(' | '));
await ctx.close();
log('done-connect');
