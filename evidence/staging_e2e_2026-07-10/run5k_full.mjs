import { launchWithMM, EXT_ID, APP } from './run5_lib.mjs';
import { unlockMM, approveOnce } from './run5_connect_lib.mjs';
import fs from 'fs';
const OUT=process.cwd();
const PROFILE='/tmp/run5_profile_main';
const PW='Testpass123!';
const NET=[],WS=[],CONSOLE=[];
const log=(...a)=>console.log(...a);

const ctx=await launchWithMM(PROFILE);
await new Promise(r=>setTimeout(r,3500));
let draining=true, approvedTags=[];
(async()=>{while(draining){const live=ctx.pages().filter(p=>!p.isClosed()&&p.url().startsWith(`chrome-extension://${EXT_ID}`)&&p.url().includes('notification'));for(const pg of live){const t=await approveOnce(pg).catch(()=>null);if(t){approvedTags.push(t);log('  [bg-approve]',t);await pg.waitForTimeout(600);}}await new Promise(r=>setTimeout(r,450));}})();
await unlockMM(ctx,PW);
log('unlocked');

const page=await ctx.newPage();
page.on('console',m=>CONSOLE.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror',e=>CONSOLE.push(`[pageerror] ${e.message}`));
page.on('response',r=>{const s=r.status(),u=r.url();if((u.includes('temporal.exchange')&&r.request().method()==='POST')||u.includes('arbitrum')||s>=400)NET.push(`${s} ${r.request().method()} ${u.slice(0,90)}`);});
const POSTS=[];
page.on('request',r=>{ if(r.method()==='POST'&&r.url().includes('temporal.exchange')){ POSTS.push({url:r.url(),body:(r.postData()||'').slice(0,400)}); } });
page.on('websocket',ws=>{const u=ws.url();WS.push(`OPEN ${u}`);});

const mouseClick=async(loc)=>{const b=await loc.boundingBox();if(!b)return false;await page.mouse.click(b.x+b.width/2,b.y+b.height/2);return true;};
async function depositInput(){ const cands=page.locator('input'); const n=await cands.count(); for(let i=0;i<n;i++){ const el=cands.nth(i); const ph=await el.getAttribute('placeholder').catch(()=>''); if(ph&&/enter amount/i.test(ph)) return el; } return null; }
async function setDeposit(val){ const el=await depositInput(); if(!el)return false; await el.click(); await el.press('Control+a').catch(()=>{}); await el.press('Delete').catch(()=>{}); await el.pressSequentially(String(val),{delay:90}); await page.waitForTimeout(400); await el.press('Tab').catch(()=>{}); await page.waitForTimeout(1200); return true; }
const readVals=()=>page.evaluate(()=>{const grabAfter=(lab)=>{const t=document.body.innerText;const re=new RegExp(lab+'\\s*([\\d.,]+)');const m=t.match(re);return m?m[1]:null;};const b=[...document.querySelectorAll('button')].find(x=>/CREATE POSITION/.test(x.innerText));return{notional:grabAfter('NOTIONAL'),entry:grabAfter('Entry Price \\$'),chainId:window.ethereum&&window.ethereum.chainId,btnDisabled:b?b.disabled:'no-btn',connectArb:!![...document.querySelectorAll('button')].find(x=>/Connect to Arbitrum/i.test(x.innerText))};});

await page.goto(APP,{waitUntil:'domcontentloaded',timeout:60000});
await page.waitForTimeout(3500);
for(const nm of ['Agree','I Agree','Accept']){ const b=page.getByRole('button',{name:new RegExp('^'+nm+'$','i')}).first(); if(await b.isVisible({timeout:800}).catch(()=>false)){ await b.click().catch(()=>{}); break; } }
await page.waitForTimeout(1200);

// CONNECT
const cw=page.getByRole('button',{name:/Connect Wallet/i}).first();
if(await cw.isVisible({timeout:2500}).catch(()=>false)){ await mouseClick(cw); log('clicked connect'); }
await page.waitForTimeout(1500);
const mmOpt=page.getByText(/MetaMask/i).first(); if(await mmOpt.isVisible({timeout:1500}).catch(()=>false)){ await mmOpt.click().catch(()=>{}); }
await page.waitForTimeout(9000); // bg drainer approves connect
await page.screenshot({path:`${OUT}/run5k_01_connected.png`});
log('vals after connect:',JSON.stringify(await readVals().catch(e=>({err:e.message}))));

// SWITCH TO ARBITRUM
const cta=page.locator('button:has-text("Connect to Arbitrum")').first();
if(await cta.count()){ await mouseClick(cta); await page.waitForTimeout(2500);
  const sw=page.locator('button:has-text("Switch Network"), button:has-text("Switch to Arbitrum")').first();
  if(await sw.count()){ await mouseClick(sw); log('clicked Switch Network'); await page.waitForTimeout(9000); } }
await page.screenshot({path:`${OUT}/run5k_02_after_switch.png`});
log('vals after switch:',JSON.stringify(await readVals().catch(e=>({err:e.message}))));

// CREATE PERP LONG 12 @ ~10x
const cpTab=page.locator('[role="tab"]').filter({hasText:'CREATE PERP'}).first(); if(await cpTab.count()){ await mouseClick(cpTab); await page.waitForTimeout(1500); }
// ensure LONG
const lb=page.locator('button:has-text("LONG"), [role="tab"]:has-text("LONG")').first(); if(await lb.count()) await mouseClick(lb).catch(()=>{});
await setDeposit(12);
// leverage: click the + increment button ~9 times (keyboard arrows unreliable)
const plus=page.locator('button').filter({hasText:/^\+$/}).first();
if(await plus.count()){ for(let k=0;k<9;k++){ await mouseClick(plus).catch(()=>{}); await page.waitForTimeout(150);} }
else { const sl=page.locator('input[type="range"]').first(); if(await sl.count()){ await sl.focus(); for(let k=0;k<9;k++) await sl.press('ArrowRight').catch(()=>{}); } }
await page.waitForTimeout(1000);
await page.screenshot({path:`${OUT}/run5k_03_perp_form.png`});
log('vals perp form:',JSON.stringify(await readVals().catch(e=>({err:e.message}))));
// DEPOSIT FROM Wallet radio (default) then CREATE POSITION
const createBtn=page.locator('button:has-text("CREATE POSITION")').first();
const cbState=await createBtn.evaluate(b=>({dis:b.disabled,txt:b.innerText})).catch(()=>({}));
log('CREATE btn state:',JSON.stringify(cbState));
if(!cbState.dis){ await mouseClick(createBtn); log('clicked CREATE POSITION'); }
// watch for toast + approve any MM signature popup
const toasts=[];
for(let s=0;s<16;s++){ await page.waitForTimeout(700);
  const tt=await page.evaluate(()=>[...document.querySelectorAll('[data-sonner-toast],[role="status"],.toast')].map(e=>e.innerText.replace(/\s+/g,' ').trim()).filter(Boolean)).catch(()=>[]);
  for(const x of tt) if(!toasts.includes(x)) toasts.push(x);
}
log('toasts:',JSON.stringify(toasts));
await page.screenshot({path:`${OUT}/run5k_04_perp_result.png`});

// PORTFOLIO read-back with retries
async function readPortfolio(){ return page.evaluate(()=>{
  const active=[...document.querySelectorAll('table')].filter(t=>t.offsetParent);
  const tables=active.map(t=>({heads:[...t.querySelectorAll('thead th')].map(h=>h.innerText.replace(/\s+/g,' ').trim()),
    rows:[...t.querySelectorAll('tbody tr')].map(r=>[...r.querySelectorAll('td')].map(c=>c.innerText.replace(/\s+/g,' ').trim()))}));
  const pulse=document.querySelectorAll('.animate-pulse').length;
  const pageOf=(document.body.innerText.match(/Page \d+ of \d+/)||[''])[0];
  const claim=[...document.querySelectorAll('button')].filter(b=>/CLAIM/i.test(b.innerText)).length;
  const avail=(()=>{const t=document.body.innerText;const i=t.search(/PERPS AVAILABLE/i);return i<0?null:t.slice(i,i+220).replace(/\n+/g,' | ');})();
  return {tables,pulse,pageOf,claim,avail};
}); }
let pf=null, readBack=false;
for(let a=0;a<3&&!readBack;a++){
  await page.goto(APP+'portfolio',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForTimeout(6000);
  const pt=page.locator('[role="tab"]:has-text("PERPS"), button:has-text("PERPS")').first(); if(await pt.count()) await mouseClick(pt).catch(()=>{});
  await page.waitForTimeout(3000);
  pf=await readPortfolio().catch(e=>({err:e.message}));
  const perpsTbl=(pf.tables||[]).find(t=>(t.heads||[]).some(h=>/ENTRY|FUNDING|LEVERAGE/i.test(h)));
  const nonEmpty=perpsTbl?perpsTbl.rows.filter(r=>r.join('').trim().length>0).length:0;
  log(`PF attempt${a}: pageOf=${pf.pageOf} pulse=${pf.pulse} claim=${pf.claim} perpsRowsNonEmpty=${nonEmpty}`);
  if(nonEmpty>0){ readBack=true; }
}
await page.screenshot({path:`${OUT}/run5k_05_portfolio_perps.png`});
fs.writeFileSync(`${OUT}/run5k_portfolio.json`,JSON.stringify(pf,null,1));
log('READBACK:',readBack);
if(readBack){ const perpsTbl=(pf.tables||[]).find(t=>(t.heads||[]).some(h=>/ENTRY|FUNDING|LEVERAGE/i.test(h))); log('PERPS heads:',JSON.stringify(perpsTbl.heads)); log('PERPS row0:',JSON.stringify(perpsTbl.rows[0])); }
log('avail:',pf.avail);

draining=false;
const ammTimeout=CONSOLE.filter(c=>/AMM tree|Did not receive|market_data/i.test(c)).length;
const stagingWs=WS.filter(w=>w.includes('staging-be')).length;
const rejected=CONSOLE.filter(c=>/User rejected|4001/i.test(c)).length;
fs.writeFileSync(`${OUT}/run5k_console.log`,CONSOLE.join('\n'));
fs.writeFileSync(`${OUT}/run5k_posts.log`,POSTS.map(p=>p.url+' :: '+p.body).join('\n'));
fs.writeFileSync(`${OUT}/run5k_net.log`,NET.join('\n'));
log('=== SUMMARY ===');
log('approvedTags:',JSON.stringify(approvedTags));
log('perp POSTs:',POSTS.length,'| rejected:',rejected,'| amm-timeout:',ammTimeout,'| staging-be ws:',stagingWs);
POSTS.slice(0,4).forEach(p=>log('  POST',p.url.slice(0,60),p.body.slice(0,200)));
await ctx.close();
log('done');
