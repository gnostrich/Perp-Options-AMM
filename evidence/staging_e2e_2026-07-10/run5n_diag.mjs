import { launchWithMM, EXT_ID, APP } from './run5_lib.mjs';
import { unlockMM, approveOnce } from './run5_connect_lib.mjs';
import fs from 'fs';
const OUT=process.cwd();const PROFILE='/tmp/run5_profile_main';const PW='Testpass123!';
const CONSOLE=[],NETFAIL=[],PFREQ=[];const log=(...a)=>console.log(...a);
const ctx=await launchWithMM(PROFILE);await new Promise(r=>setTimeout(r,3500));
let draining=true;(async()=>{while(draining){const live=ctx.pages().filter(p=>!p.isClosed()&&p.url().includes('notification'));for(const pg of live){const t=await approveOnce(pg).catch(()=>null);if(t)await pg.waitForTimeout(500);}await new Promise(r=>setTimeout(r,450));}})();
await unlockMM(ctx,PW);log('unlocked');
const page=await ctx.newPage();
page.on('console',m=>CONSOLE.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror',e=>CONSOLE.push(`[pageerror] ${e.message}`));
page.on('requestfailed',r=>NETFAIL.push(`${r.failure()?.errorText||''} ${r.url().slice(0,110)}`));
const mouseClick=async(loc)=>{const b=await loc.boundingBox();if(!b)return false;await page.mouse.click(b.x+b.width/2,b.y+b.height/2);return true;};
await page.goto(APP,{waitUntil:'domcontentloaded',timeout:60000});await page.waitForTimeout(3500);
for(const nm of ['Agree','I Agree','Accept']){const b=page.getByRole('button',{name:new RegExp('^'+nm+'$','i')}).first();if(await b.isVisible({timeout:800}).catch(()=>false)){await b.click().catch(()=>{});break;}}
await page.waitForTimeout(1200);
const cw=page.getByRole('button',{name:/Connect Wallet/i}).first();if(await cw.isVisible({timeout:2500}).catch(()=>false))await mouseClick(cw);
await page.waitForTimeout(1500);const mmOpt=page.getByText(/MetaMask/i).first();if(await mmOpt.isVisible({timeout:1500}).catch(()=>false))await mmOpt.click().catch(()=>{});
await page.waitForTimeout(9000);
const cta=page.locator('button:has-text("Connect to Arbitrum")').first();if(await cta.count()){await mouseClick(cta);await page.waitForTimeout(2000);const sw=page.locator('button:has-text("Switch Network")').first();if(await sw.count()){await mouseClick(sw);await page.waitForTimeout(7000);}}
// toggle Hyperliquid Balance source and read MAX
const hlRadio=page.locator('text=Hyperliquid Balance').first();
if(await hlRadio.count()){await mouseClick(hlRadio);await page.waitForTimeout(2500);}
const srcInfo=await page.evaluate(()=>{const t=document.body.innerText;const maxes=[...t.matchAll(/MAX:\s*([\d.,]+)/g)].map(m=>m[1]);const hl=(t.match(/Hyperliquid Balance[^\n]{0,40}/)||[''])[0];return{maxes,hl};}).catch(()=>({}));
log('deposit-source info (HL Balance selected):',JSON.stringify(srcInfo));
await page.screenshot({path:`${OUT}/run5n_01_hlbalance.png`});

// TRADE BANDS state (no perp exists)
const tb=page.locator('[role="tab"]:has-text("TRADE BANDS"),button:has-text("TRADE BANDS")').first();if(await tb.count()){await mouseClick(tb);await page.waitForTimeout(4000);}
const bands=await page.evaluate(()=>{const t=document.body.innerText;return{maxBadge:(t.match(/MAX:\s*[\d.]+\s*BTC/)||[''])[0],slippage:(t.match(/Slippage[^\n]{0,25}/)||[''])[0],txfees:(t.match(/Tx Fees[^\n]{0,25}/)||[''])[0],sellProfits:/SELL PROFITS ON/i.test(t),ammTimeout:/did not receive|timeout/i.test(t),transactDisabled:(()=>{const b=[...document.querySelectorAll('button')].find(x=>/TRANSACT/i.test(x.innerText));return b?b.disabled:'no-btn';})()};}).catch(e=>({err:e.message}));
log('BANDS (no perp):',JSON.stringify(bands));
await page.screenshot({path:`${OUT}/run5n_02_bands.png`});
// options pricing sub-view
const op=page.locator('button:has-text("OPTIONS PRICING"),[role="tab"]:has-text("OPTIONS")').first();if(await op.count()){await mouseClick(op);await page.waitForTimeout(3000);}
const canv=await page.evaluate(()=>[...document.querySelectorAll('canvas')].map(c=>{try{const x=c.getContext('2d');const d=x.getImageData(0,0,c.width,c.height).data;let nb=0;for(let i=3;i<d.length;i+=40)if(d[i]>0)nb++;return{w:c.width,h:c.height,nb};}catch(e){return{err:1};}})).catch(()=>[]);
log('OPTIONS PRICING canvases:',JSON.stringify(canv));
await page.screenshot({path:`${OUT}/run5n_03_options.png`});

// PORTFOLIO skeleton diagnosis
NETFAIL.length=0;
await page.goto(APP+'portfolio',{waitUntil:'domcontentloaded',timeout:60000});await page.waitForTimeout(8000);
const pt=page.locator('[role="tab"]:has-text("PERPS"),button:has-text("PERPS")').first();if(await pt.count())await mouseClick(pt).catch(()=>{});
await page.waitForTimeout(4000);
const pfDiag=await page.evaluate(()=>{const t=document.body.innerText;return{pulse:document.querySelectorAll('.animate-pulse').length,pageOf:(t.match(/Page \d+ of \d+/)||[''])[0],noPositions:/no position|no perps|nothing here|no open/i.test(t),failedFetch:/failed to fetch|error/i.test(t)};}).catch(e=>({err:e.message}));
log('PORTFOLIO diag:',JSON.stringify(pfDiag));
log('portfolio NET failures:',NETFAIL.slice(0,8).join(' || ')||'none');
await page.screenshot({path:`${OUT}/run5n_04_portfolio.png`});
draining=false;
fs.writeFileSync(`${OUT}/run5n_console.log`,CONSOLE.join('\n'));
fs.writeFileSync(`${OUT}/run5n_netfail.log`,NETFAIL.join('\n'));
log('=== amm-timeout total:',CONSOLE.filter(c=>/AMM tree|Did not receive/i.test(c)).length,'| sepolia-csp:',CONSOLE.filter(c=>c.includes('sepolia-rollup')).length);
await ctx.close();log('done');
