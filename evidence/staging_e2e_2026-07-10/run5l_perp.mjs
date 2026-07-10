import { launchWithMM, EXT_ID, APP } from './run5_lib.mjs';
import { unlockMM, approveOnce } from './run5_connect_lib.mjs';
import fs from 'fs';
const OUT=process.cwd();
const PROFILE='/tmp/run5_profile_main';
const PW='Testpass123!';
const CONSOLE=[],POSTS=[],WS=[];
const log=(...a)=>console.log(...a);
const ctx=await launchWithMM(PROFILE);
await new Promise(r=>setTimeout(r,3500));
let draining=true;
(async()=>{while(draining){const live=ctx.pages().filter(p=>!p.isClosed()&&p.url().startsWith(`chrome-extension://${EXT_ID}`)&&p.url().includes('notification'));for(const pg of live){const t=await approveOnce(pg).catch(()=>null);if(t){log('  [bg-approve]',t);await pg.waitForTimeout(600);}}await new Promise(r=>setTimeout(r,450));}})();
await unlockMM(ctx,PW);
log('unlocked');
const page=await ctx.newPage();
page.on('console',m=>CONSOLE.push(`[${m.type()}] ${m.text()}`));
page.on('request',r=>{if(r.method()==='POST'&&r.url().includes('temporal.exchange'))POSTS.push((r.postData()||'').slice(0,500));});
page.on('websocket',ws=>WS.push(ws.url()));
const mouseClick=async(loc)=>{const b=await loc.boundingBox();if(!b)return false;await page.mouse.click(b.x+b.width/2,b.y+b.height/2);return true;};
const readVals=()=>page.evaluate(()=>{const grab=(lab)=>{const t=document.body.innerText;const m=t.match(new RegExp(lab+'\\s*([\\d.,]+)'));return m?m[1]:null;};const b=[...document.querySelectorAll('button')].find(x=>/CREATE POSITION/.test(x.innerText));return{notional:grab('NOTIONAL'),entry:grab('Entry Price \\$'),liq:grab('Liquidation Price[^$]*\\$'),chainId:window.ethereum&&window.ethereum.chainId,btnDisabled:b?b.disabled:'no-btn',connectArb:!![...document.querySelectorAll('button')].find(x=>/Connect to Arbitrum/i.test(x.innerText)),depMax:(document.body.innerText.match(/MAX:\s*([\d.]+)/)||[])[1]};});

await page.goto(APP,{waitUntil:'domcontentloaded',timeout:60000});
await page.waitForTimeout(3500);
for(const nm of ['Agree','I Agree','Accept']){const b=page.getByRole('button',{name:new RegExp('^'+nm+'$','i')}).first();if(await b.isVisible({timeout:800}).catch(()=>false)){await b.click().catch(()=>{});break;}}
await page.waitForTimeout(1200);
const cw=page.getByRole('button',{name:/Connect Wallet/i}).first();
if(await cw.isVisible({timeout:2500}).catch(()=>false)){await mouseClick(cw);log('connect');}
await page.waitForTimeout(1500);
const mmOpt=page.getByText(/MetaMask/i).first();if(await mmOpt.isVisible({timeout:1500}).catch(()=>false))await mmOpt.click().catch(()=>{});
await page.waitForTimeout(9000);
// switch
const cta=page.locator('button:has-text("Connect to Arbitrum")').first();
if(await cta.count()){await mouseClick(cta);await page.waitForTimeout(2000);const sw=page.locator('button:has-text("Switch Network")').first();if(await sw.count()){await mouseClick(sw);log('switch');await page.waitForTimeout(6000);}}
log('vals pre-reload:',JSON.stringify(await readVals().catch(e=>({err:e.message}))));
// RELOAD so app re-reads chainId
await page.reload({waitUntil:'domcontentloaded',timeout:60000});
await page.waitForTimeout(7000);
log('vals post-reload:',JSON.stringify(await readVals().catch(e=>({err:e.message}))));
await page.screenshot({path:`${OUT}/run5l_01_reloaded.png`});
// if still connectArb, click connect again / switch again
let v=await readVals().catch(()=>({}));
if(v.connectArb){ const cta2=page.locator('button:has-text("Connect to Arbitrum")').first(); if(await cta2.count()){await mouseClick(cta2);await page.waitForTimeout(2000);const sw2=page.locator('button:has-text("Switch Network")').first();if(await sw2.count()){await mouseClick(sw2);await page.waitForTimeout(6000);}} log('vals after 2nd switch:',JSON.stringify(await readVals().catch(()=>({})))); }

// CREATE PERP LONG 12
const cpTab=page.locator('[role="tab"]').filter({hasText:'CREATE PERP'}).first();if(await cpTab.count()){await mouseClick(cpTab);await page.waitForTimeout(1200);}
// deposit
async function depositInput(){const c=page.locator('input');const n=await c.count();for(let i=0;i<n;i++){const el=c.nth(i);const ph=await el.getAttribute('placeholder').catch(()=>'');if(ph&&/enter amount/i.test(ph))return el;}return null;}
const dep=await depositInput();
if(dep){await dep.click();await dep.press('Control+a').catch(()=>{});await dep.press('Delete').catch(()=>{});await dep.pressSequentially('12',{delay:90});await page.waitForTimeout(400);await dep.press('Tab').catch(()=>{});await page.waitForTimeout(1200);}
// leverage +
const plus=page.locator('button').filter({hasText:/^\+$/}).first();
if(await plus.count()){for(let k=0;k<9;k++){await mouseClick(plus).catch(()=>{});await page.waitForTimeout(140);}}
await page.waitForTimeout(800);
log('vals perp form:',JSON.stringify(await readVals().catch(e=>({err:e.message}))));
await page.screenshot({path:`${OUT}/run5l_02_perp_form.png`});
const createBtn=page.locator('button:has-text("CREATE POSITION")').first();
const cbState=await createBtn.evaluate(b=>({dis:b.disabled})).catch(()=>({}));
log('CREATE btn:',JSON.stringify(cbState));
if(!cbState.dis){await mouseClick(createBtn);log('clicked CREATE');}
const toasts=[];
for(let s=0;s<16;s++){await page.waitForTimeout(700);const tt=await page.evaluate(()=>[...document.querySelectorAll('[data-sonner-toast],[role="status"]')].map(e=>e.innerText.replace(/\s+/g,' ').trim()).filter(Boolean)).catch(()=>[]);for(const x of tt)if(!toasts.includes(x))toasts.push(x);}
log('toasts:',JSON.stringify(toasts));
await page.screenshot({path:`${OUT}/run5l_03_perp_result.png`});

// PORTFOLIO
async function readPF(){return page.evaluate(()=>{const active=[...document.querySelectorAll('table')].filter(t=>t.offsetParent);const tables=active.map(t=>({heads:[...t.querySelectorAll('thead th')].map(h=>h.innerText.replace(/\s+/g,' ').trim()),rows:[...t.querySelectorAll('tbody tr')].map(r=>[...r.querySelectorAll('td')].map(c=>c.innerText.replace(/\s+/g,' ').trim()))}));return{tables,pulse:document.querySelectorAll('.animate-pulse').length,pageOf:(document.body.innerText.match(/Page \d+ of \d+/)||[''])[0],claim:[...document.querySelectorAll('button')].filter(b=>/CLAIM/i.test(b.innerText)).length,avail:(()=>{const t=document.body.innerText;const i=t.search(/PERPS AVAILABLE/i);return i<0?null:t.slice(i,i+200).replace(/\n+/g,' | ');})()};});}
let pf=null,readBack=false;
for(let a=0;a<3&&!readBack;a++){await page.goto(APP+'portfolio',{waitUntil:'domcontentloaded',timeout:60000});await page.waitForTimeout(6000);const pt=page.locator('[role="tab"]:has-text("PERPS"),button:has-text("PERPS")').first();if(await pt.count())await mouseClick(pt).catch(()=>{});await page.waitForTimeout(3000);pf=await readPF().catch(e=>({err:e.message}));const tbl=(pf.tables||[]).find(t=>(t.heads||[]).some(h=>/ENTRY|FUNDING|LEVERAGE/i.test(h)));const ne=tbl?tbl.rows.filter(r=>r.join('').trim().length>0).length:0;log(`PF a${a}: ${pf.pageOf} pulse=${pf.pulse} claim=${pf.claim} rows=${ne}`);if(ne>0)readBack=true;}
await page.screenshot({path:`${OUT}/run5l_04_portfolio.png`});
fs.writeFileSync(`${OUT}/run5l_pf.json`,JSON.stringify(pf,null,1));
if(readBack){const tbl=(pf.tables||[]).find(t=>(t.heads||[]).some(h=>/ENTRY|FUNDING|LEVERAGE/i.test(h)));log('PERPS heads:',JSON.stringify(tbl.heads));log('PERPS row0:',JSON.stringify(tbl.rows[0]));}
log('avail:',pf&&pf.avail);
draining=false;
fs.writeFileSync(`${OUT}/run5l_posts.log`,POSTS.join('\n'));
fs.writeFileSync(`${OUT}/run5l_console.log`,CONSOLE.join('\n'));
log('=== SUMMARY ===');
log('READBACK:',readBack,'| perp POSTs:',POSTS.length,'| amm-timeout:',CONSOLE.filter(c=>/AMM tree|Did not receive/i.test(c)).length);
POSTS.filter(p=>/perpType|usdcAmount|markPrice/i.test(p)).slice(0,3).forEach(p=>log('  PERP-POST',p.slice(0,260)));
await ctx.close();
log('done');
