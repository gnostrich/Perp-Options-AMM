const {chromium}=require('/tmp/node_modules/playwright');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
 const p=await b.newPage({viewport:{width:1680,height:1200}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///home/user/Perp-Options-AMM/app/index.html',{waitUntil:'load'});
 await p.waitForTimeout(800);
 await p.evaluate(()=>setView('perps')); await p.waitForTimeout(500);
 const read=async()=>p.evaluate(()=>({txt:(document.getElementById('paperBox').innerText||'').replace(/\s+/g,' '),
   who:WHO, total:PAPER.conserved().balances, ok:PAPER.conserved().ok}));
 console.log('start :',JSON.stringify(await read()));
 await p.click('#faucetBtn'); await p.waitForTimeout(400);
 console.log('faucet:',JSON.stringify(await read()));
 await p.locator('[data-who="lp-1"]').first().click(); await p.waitForTimeout(400);
 const r=await read(); console.log('switch:',r.who,' total',r.total.toLocaleString(),' conserved',r.ok);
 // a closed-network settlement from the console, then re-check conservation on screen
 await p.evaluate(()=>{PAPER.settle('you','lp-1',77777.77,'sim','closed-network test');});
 await p.evaluate(()=>render()); await p.waitForTimeout(300);
 const r2=await read();
 console.log('settle:',r2.txt.slice(0,150));
 console.log('conserved after settlement:',r2.ok,' total',r2.total.toLocaleString());
 console.log('pageerrors:',errs.length?errs:'NONE');
 await b.close();
})();
