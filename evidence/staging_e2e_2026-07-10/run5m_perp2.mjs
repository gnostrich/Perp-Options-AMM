import { launchWithMM, EXT_ID, APP } from './run5_lib.mjs';
import { unlockMM, approveOnce } from './run5_connect_lib.mjs';
import fs from 'fs';
const OUT=process.cwd();const PROFILE='/tmp/run5_profile_main';const PW='Testpass123!';
const CONSOLE=[],POSTS=[];const log=(...a)=>console.log(...a);
const ctx=await launchWithMM(PROFILE);await new Promise(r=>setTimeout(r,3500));
let draining=true;
(async()=>{while(draining){const live=ctx.pages().filter(p=>!p.isClosed()&&p.url().startsWith(`chrome-extension://${EXT_ID}`)&&p.url().includes('notification'));for(const pg of live){const t=await approveOnce(pg).catch(()=>null);if(t){log('  [bg-approve]',t);await pg.waitForTimeout(600);}}await new Promise(r=>setTimeout(r,450));}})();
await unlockMM(ctx,PW);log('unlocked');
const page=await ctx.newPage();
page.on('console',m=>CONSOLE.push(`[${m.type()}] ${m.text()}`));
page.on('request',r=>{if(r.method()==='POST'&&r.url().includes('temporal.exchange'))POSTS.push((r.postData()||'').slice(0,500));});
const mouseClick=async(loc)=>{const b=await loc.boundingBox();if(!b)return false;await page.mouse.click(b.x+b.width/2,b.y+b.height/2);return true;};
const readVals=()=>page.evaluate(()=>{const t=document.body.innerText;const grab=(l)=>{const m=t.match(new RegExp(l+'\\s*([\\d.,]+)'));return m?m[1]:null;};const b=[...document.querySelectorAll('button')].find(x=>/CREATE POSITION/.test(x.innerText));const sl=document.querySelector('input[type="range"]');return{notional:grab('NOTIONAL'),lev:sl?sl.value:null,liqShown:/Set Leverage For Liquidation/i.test(t),liq:grab('Liquidation Price[^$]*\\$'),connectArb:/Connect to Arbitrum/i.test(t),btnDisabled:b?b.disabled:'no',depMaxWallet:(t.match(/MAX:\s*([\d.]+)/)||[])[1]};});
async function setLev(target){const sl=page.locator('input[type="range"]').first();if(!await sl.count())return 'no-slider';await sl.focus();const mn=await sl.evaluate(e=>+e.min);for(let k=0;k<60&&+(await sl.inputValue())>mn;k++)await sl.press('ArrowLeft');let g=0;while(+(await sl.inputValue())<target&&g++<80)await sl.press('ArrowRight');await page.waitForTimeout(600);return await sl.inputValue();}

await page.goto(APP,{waitUntil:'domcontentloaded',timeout:60000});await page.waitForTimeout(3500);
for(const nm of ['Agree','I Agree','Accept']){const b=page.getByRole('button',{name:new RegExp('^'+nm+'$','i')}).first();if(await b.isVisible({timeout:800}).catch(()=>false)){await b.click().catch(()=>{});break;}}
await page.waitForTimeout(1200);
const cw=page.getByRole('button',{name:/Connect Wallet/i}).first();if(await cw.isVisible({timeout:2500}).catch(()=>false)){await mouseClick(cw);}
await page.waitForTimeout(1500);const mmOpt=page.getByText(/MetaMask/i).first();if(await mmOpt.isVisible({timeout:1500}).catch(()=>false))await mmOpt.click().catch(()=>{});
await page.waitForTimeout(9000);
const cta=page.locator('button:has-text("Connect to Arbitrum")').first();
if(await cta.count()){await mouseClick(cta);await page.waitForTimeout(2000);const sw=page.locator('button:has-text("Switch Network")').first();if(await sw.count()){await mouseClick(sw);await page.waitForTimeout(7000);}}
log('after switch:',JSON.stringify(await readVals().catch(e=>({err:e.message}))));

// deposit 12
async function depIn(){const c=page.locator('input');const n=await c.count();for(let i=0;i<n;i++){const el=c.nth(i);const ph=await el.getAttribute('placeholder').catch(()=>'');if(ph&&/enter amount/i.test(ph))return el;}return null;}
const dep=await depIn();if(dep){await dep.click();await dep.press('Control+a').catch(()=>{});await dep.press('Delete').catch(()=>{});await dep.pressSequentially('12',{delay:90});await dep.press('Tab').catch(()=>{});await page.waitForTimeout(1000);}
const levSet=await setLev(10);log('leverage set to:',levSet);
await page.waitForTimeout(800);
log('perp vals:',JSON.stringify(await readVals().catch(e=>({err:e.message}))));
await page.screenshot({path:`${OUT}/run5m_01_perp_form.png`});
const createBtn=page.locator('button:has-text("CREATE POSITION")').first();
const dis=await createBtn.evaluate(b=>b.disabled).catch(()=>true);
log('CREATE disabled?',dis);
if(!dis){await mouseClick(createBtn);log('clicked CREATE');
  const toasts=[];for(let s=0;s<18;s++){await page.waitForTimeout(700);const tt=await page.evaluate(()=>[...document.querySelectorAll('[data-sonner-toast],[role="status"]')].map(e=>e.innerText.replace(/\s+/g,' ').trim()).filter(Boolean)).catch(()=>[]);for(const x of tt)if(!toasts.includes(x))toasts.push(x);}
  log('toasts:',JSON.stringify(toasts));
}
await page.screenshot({path:`${OUT}/run5m_02_result.png`});
// portfolio read-back
async function readPF(){return page.evaluate(()=>{const active=[...document.querySelectorAll('table')].filter(t=>t.offsetParent);const tables=active.map(t=>({heads:[...t.querySelectorAll('thead th')].map(h=>h.innerText.replace(/\s+/g,' ').trim()),rows:[...t.querySelectorAll('tbody tr')].map(r=>[...r.querySelectorAll('td')].map(c=>c.innerText.replace(/\s+/g,' ').trim()))}));return{tables,pulse:document.querySelectorAll('.animate-pulse').length,pageOf:(document.body.innerText.match(/Page \d+ of \d+/)||[''])[0],claim:[...document.querySelectorAll('button')].filter(b=>/CLAIM/i.test(b.innerText)).length,avail:(()=>{const t=document.body.innerText;const i=t.search(/PERPS AVAILABLE/i);return i<0?null:t.slice(i,i+200).replace(/\n+/g,' | ');})()};});}
let pf=null,readBack=false;
for(let a=0;a<3&&!readBack;a++){await page.goto(APP+'portfolio',{waitUntil:'domcontentloaded',timeout:60000});await page.waitForTimeout(6000);const pt=page.locator('[role="tab"]:has-text("PERPS"),button:has-text("PERPS")').first();if(await pt.count())await mouseClick(pt).catch(()=>{});await page.waitForTimeout(3000);pf=await readPF().catch(e=>({err:e.message}));const tbl=(pf.tables||[]).find(t=>(t.heads||[]).some(h=>/ENTRY|FUNDING|LEVERAGE/i.test(h)));const ne=tbl?tbl.rows.filter(r=>r.join('').trim().length>0).length:0;log(`PF a${a}: ${pf.pageOf} pulse=${pf.pulse} claim=${pf.claim} rows=${ne}`);if(ne>0)readBack=true;}
await page.screenshot({path:`${OUT}/run5m_03_portfolio.png`});
fs.writeFileSync(`${OUT}/run5m_pf.json`,JSON.stringify(pf,null,1));
if(readBack){const tbl=(pf.tables||[]).find(t=>(t.heads||[]).some(h=>/ENTRY|FUNDING|LEVERAGE/i.test(h)));log('PERPS heads:',JSON.stringify(tbl.heads));log('PERPS row0:',JSON.stringify(tbl.rows[0]));}
log('avail:',pf&&pf.avail);
draining=false;
fs.writeFileSync(`${OUT}/run5m_posts.log`,POSTS.join('\n'));
log('=== SUMMARY ===');log('READBACK:',readBack,'| POSTs:',POSTS.length,'| amm-timeout:',CONSOLE.filter(c=>/AMM tree|Did not receive/i.test(c)).length,'| rejected:',CONSOLE.filter(c=>/User rejected|4001/i.test(c)).length);
POSTS.filter(p=>/perpType|usdcAmount|markPrice|btcAmount/i.test(p)).slice(0,3).forEach(p=>log('  PERP-POST',p.slice(0,300)));
await ctx.close();log('done');
