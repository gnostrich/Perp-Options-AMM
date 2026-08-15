// The ONE test no .value=-setting script can do: a real mouse drag.
const {chromium}=require('/tmp/node_modules/playwright');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
 const p=await b.newPage({viewport:{width:1680,height:1200}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///home/user/Perp-Options-AMM/app/index.html',{waitUntil:'load'});
 await p.waitForTimeout(600);
 await p.click('[data-nav="earn"]'); await p.waitForTimeout(400);
 const sel='input[type=range][data-k="gam"]';
 const box=await p.locator(sel).first().boundingBox();
 const y=box.y+box.height/2, x0=box.x+box.width*0.45;
 await p.mouse.move(x0,y); await p.mouse.down();
 const seen=[];
 for(let i=1;i<=6;i++){
  await p.mouse.move(x0+i*14,y,{steps:3}); await p.waitForTimeout(120);
  seen.push(await p.locator(sel).first().inputValue());
 }
 await p.mouse.up();
 console.log('γ during a real drag :',seen.join(' → '));
 const uniq=new Set(seen).size;
 console.log(uniq>2?'PASS — the drag keeps moving':'FAIL — frozen after '+uniq+' distinct value(s)');
 // and the oracle slider, same treatment
 await p.click('[data-nav="transact"]').catch(()=>{});
 await p.click('[data-nav="earn"]'); await p.waitForTimeout(300);
 const s2='input[type=range][data-o="iv"]';
 if(await p.locator(s2).count()){
   const b2=await p.locator(s2).first().boundingBox();
   await p.mouse.move(b2.x+b2.width*0.4,b2.y+b2.height/2); await p.mouse.down();
   const s2v=[];
   for(let i=1;i<=5;i++){await p.mouse.move(b2.x+b2.width*0.4+i*16,b2.y+b2.height/2,{steps:3});
     await p.waitForTimeout(120); s2v.push(await p.locator(s2).first().inputValue());}
   await p.mouse.up();
   console.log('oracle vol during a real drag :',s2v.join(' → '));
   console.log(new Set(s2v).size>2?'PASS':'FAIL — frozen');
 } else console.log('oracle slider not present');
 console.log('pageerrors:',errs.length?errs:'NONE');
 await b.close();
})();
