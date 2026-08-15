const {chromium}=require('/tmp/node_modules/playwright');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
 const p=await b.newPage({viewport:{width:1680,height:1200}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///home/user/Perp-Options-AMM/app/index.html',{waitUntil:'load'});
 await p.waitForTimeout(800);
 const st=async()=>p.evaluate(()=>{const s=LIFE.state();
  return {free:+s.perps.filter(x=>!x.boundTo).reduce((t,x)=>t+x.qty,0).toFixed(3),
          carved:+s.perps.filter(x=>x.boundTo).reduce((t,x)=>t+x.qty,0).toFixed(3),
          open:s.bundles.filter(x=>!x.closed).length};});
 for(const v of ['transact','earn','bands','perps','portfolio']){
   await p.evaluate(x=>setView(x),v); await p.waitForTimeout(350);
   const vis=await p.evaluate(()=>[...document.querySelectorAll('.grid')].filter(g=>g.style.display!=='none').length);
   console.log('view '+v.padEnd(10),'grids visible:',vis);
 }
 await p.evaluate(()=>setView('transact')); await p.waitForTimeout(300);
 await p.click('#ctaTx'); await p.waitForTimeout(400);
 console.log('after open   ',JSON.stringify(await st()));
 await p.evaluate(()=>setView('perps')); await p.waitForTimeout(500);
 const perps=await p.evaluate(()=>({
   rows:document.querySelectorAll('#perpsTable tr').length,
   strip:(document.getElementById('acctStrip').innerText||'').replace(/\s+/g,' ').slice(0,150),
   ident:/=\s*[\d.]+/.test(document.getElementById('perpsTable').innerText||''),
   liqPrice:/liq.*price|liquidation price/i.test(document.body.innerText||''),
   closeBtns:[...document.querySelectorAll('#perpsTable button')].map(b=>b.disabled)}));
 console.log('perps rows   ',perps.rows,' close disabled:',JSON.stringify(perps.closeBtns));
 console.log('identity line',perps.ident);
 console.log('liq-price string anywhere:',perps.liqPrice);
 console.log('strip        ',perps.strip);
 console.log('pageerrors   ',errs.length?errs:'NONE');
 await b.close();
})();
