// End-to-end in a real browser: does clicking actually change state?
const {chromium}=require('/tmp/node_modules/playwright');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
 const p=await b.newPage({viewport:{width:1680,height:1200}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///home/user/Perp-Options-AMM/app/index.html',{waitUntil:'load'});
 await p.waitForTimeout(800);
 const st=async()=>p.evaluate(()=>{const s=LIFE.state();
   return {perps:s.perps.length,free:+s.perps.filter(x=>!x.boundTo).reduce((t,x)=>t+x.qty,0).toFixed(4),
     carved:+s.perps.filter(x=>x.boundTo).reduce((t,x)=>t+x.qty,0).toFixed(4),
     open:s.bundles.filter(x=>!x.closed).length, ledger:s.ledger.length};});
 console.log('start          ',JSON.stringify(await st()));
 await p.evaluate(()=>setView('transact')); await p.waitForTimeout(300);
 await p.click('#ctaTx'); await p.waitForTimeout(400);
 console.log('after Create   ',JSON.stringify(await st()));
 console.log('  toast:',(await p.locator('#toast').textContent()||'').slice(0,90));
 await p.click('[data-t="bands"], [data-nav="bands"]').catch(async()=>{await p.evaluate(()=>setView('bands'));}); await p.waitForTimeout(300);
 await p.click('#ctaBand'); await p.waitForTimeout(400);
 console.log('after Band     ',JSON.stringify(await st()));
 console.log('  toast:',(await p.locator('#toast').textContent()||'').slice(0,90));
 await p.evaluate(()=>setView('portfolio')); await p.waitForTimeout(500);
 const rows=await p.locator('#ppos tbody tr').count();
 console.log('portfolio rows ',rows);
 if(await p.locator('[data-close]').count()){
   await p.locator('[data-close]').first().click(); await p.waitForTimeout(400);
   console.log('after close    ',JSON.stringify(await st()));
   console.log('  toast:',(await p.locator('#toast').textContent()||'').slice(0,90));
 } else console.log('  no close control found');
 const id=await p.evaluate(()=>{const s=LIFE.state();
   const f=s.perps.filter(x=>!x.boundTo).reduce((t,x)=>t+x.qty,0);
   const c=s.perps.filter(x=>x.boundTo).reduce((t,x)=>t+x.qty,0);
   const t=s.perps.reduce((a,x)=>a+x.qty,0); return Math.abs(f+c-t)<1e-9;});
 console.log('identity holds ',id);
 console.log('pageerrors     ',errs.length?errs:'NONE');
 await b.close();
})();
