import { launchWithMM, EXT_ID, APP } from './run5_lib.mjs';
import { unlockMM, drainPopups, approveOnce } from './run5_connect_lib.mjs';
import fs from 'fs';
const OUT=process.cwd();
const PROFILE='/tmp/run5_profile_main';
const PW='Testpass123!';
const NET=[],WS=[],CONSOLE=[];
const log=(...a)=>console.log(...a);
async function vis(pg,sel,kind='role',to=1500){try{const l=kind==='role'?pg.getByRole('button',{name:sel}):kind==='text'?pg.getByText(sel):kind==='css'?pg.locator(sel):pg.getByTestId(sel);return(await l.first().isVisible({timeout:to}))?l.first():null;}catch{return null;}}

const ctx=await launchWithMM(PROFILE);
await new Promise(r=>setTimeout(r,3500));
let draining=true;
(async()=>{while(draining){const live=ctx.pages().filter(p=>!p.isClosed()&&p.url().startsWith(`chrome-extension://${EXT_ID}`)&&p.url().includes('notification'));for(const pg of live){const t=await approveOnce(pg).catch(()=>null);if(t){log('  [bg-approve]',t);await pg.waitForTimeout(600);}}await new Promise(r=>setTimeout(r,450));}})();
await unlockMM(ctx,PW);
log('unlocked');

const app=await ctx.newPage();
app.on('console',m=>CONSOLE.push(`[${m.type()}] ${m.text()}`));
app.on('pageerror',e=>CONSOLE.push(`[pageerror] ${e.message}`));
app.on('requestfailed',r=>NET.push(`FAIL ${r.failure()?.errorText||''} ${r.url()}`));
app.on('response',r=>{const s=r.status(),u=r.url();if(u.includes('temporal.exchange')||u.includes('arbitrum')||u.includes('hyperliquid')||s>=400)NET.push(`${s} ${r.request().method()} ${u}`);});
app.on('websocket',ws=>{const u=ws.url();WS.push(`OPEN ${u}`);log('WS OPEN',u);
  ws.on('framereceived',f=>WS.push(`  <= ${u.slice(0,55)} ${(f.payload||'').toString().slice(0,140)}`));
  ws.on('framesent',f=>WS.push(`  => ${u.slice(0,55)} ${(f.payload||'').toString().slice(0,140)}`));
  ws.on('close',()=>WS.push(`CLOSE ${u}`));});

await app.goto(APP,{waitUntil:'domcontentloaded',timeout:60000});
await app.waitForTimeout(3500);
for(const nm of [/^Agree$/i,/^I Agree$/i,/^Accept$/i]){const b=await vis(app,nm);if(b){await b.click().catch(()=>{});break;}}
await app.waitForTimeout(1200);
// connect
const cb=await vis(app,/Connect Wallet/i,'role',2500);if(cb){await cb.click().catch(()=>{});log('clicked connect');}
await app.waitForTimeout(1500);
const mmOpt=await vis(app,/MetaMask/i,'text',1500);if(mmOpt){await mmOpt.click().catch(()=>{});}
await drainPopups(ctx,18000);
await app.waitForTimeout(2500);
await app.screenshot({path:`${OUT}/run5j_01_connected.png`});
let header='';try{header=(await app.locator('header,nav').first().innerText()).replace(/\s+/g,' ').trim();}catch{}
log('after-connect header:',header.slice(0,160));

// click "Connect to Arbitrum" / "Switch to Arbitrum" to trigger network switch
let switched=false;
for(const nm of [/Connect to Arbitrum/i,/Switch to Arbitrum/i,/Switch Network/i,/Arbitrum/i]){
  const b=await vis(app,nm,'role',1500)||await vis(app,nm,'text',1000);
  if(b){await b.click().catch(()=>{});log('clicked network:',nm.source);switched=true;break;}
}
// approve the add/switch network popup in MM
await drainPopups(ctx,18000);
await app.waitForTimeout(4000);
await app.screenshot({path:`${OUT}/run5j_02_after_switch.png`});
let header2='';try{header2=(await app.locator('header,nav').first().innerText()).replace(/\s+/g,' ').trim();}catch{}
log('after-switch header:',header2.slice(0,160));

// WATCH data layer for 20s (does staging-be ws open + AMM tree load now?)
await app.waitForTimeout(20000);
await app.screenshot({path:`${OUT}/run5j_03_settled.png`});

draining=false;
const sepoliaCsp=CONSOLE.filter(c=>c.includes('sepolia-rollup')).length;
const cspAny=CONSOLE.filter(c=>/Content Security Policy|CSP|Refused to connect/i.test(c)).length;
const stagingWs=WS.filter(w=>w.startsWith('OPEN')&&w.includes('staging-be')).length;
const stagingBeAny=NET.filter(n=>n.includes('staging-be')).length;
const hlWs=WS.filter(w=>w.startsWith('OPEN')&&w.includes('hyperliquid')).length;
const ammTimeout=CONSOLE.filter(c=>/AMM tree|Did not receive|market_data/i.test(c)).length;
fs.writeFileSync(`${OUT}/run5j_console.log`,CONSOLE.join('\n'));
fs.writeFileSync(`${OUT}/run5j_network.log`,NET.join('\n'));
fs.writeFileSync(`${OUT}/run5j_ws.log`,WS.join('\n'));
log('=== SUMMARY ===');
log('sepolia-rollup CSP:',sepoliaCsp,'| any-CSP-refused:',cspAny);
log('staging-be ws OPEN:',stagingWs,'| staging-be http hits:',stagingBeAny,'| hl ws:',hlWs,'| amm-timeout:',ammTimeout);
log('WS OPENs:',[...new Set(WS.filter(w=>w.startsWith('OPEN')).map(w=>w.slice(5,75)))].join(' | '));
log('staging-be NET sample:',NET.filter(n=>n.includes('staging-be')).slice(0,6).join(' || '));
log('arbitrum NET sample:',NET.filter(n=>n.includes('arbitrum')).slice(0,4).join(' || '));
await ctx.close();
log('done');
