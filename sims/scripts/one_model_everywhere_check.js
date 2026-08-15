const {chromium}=require('/tmp/node_modules/playwright');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
 const p=await b.newPage({viewport:{width:1680,height:1200}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///home/user/Perp-Options-AMM/app/index.html',{waitUntil:'load'});
 await p.waitForTimeout(700);
 const r=await p.evaluate(()=>{
   const st=calc();
   const you=st.sorted.find(m=>m.me);
   const tot=st.sorted.reduce((t,m)=>t+m.fill,0);
   // portfolio path: mark vs close on the same position
   const mk=makerCurves(); aggBook(mk,st.book.map(m=>m.h));
   const B=Book.make(mk.map(m=>({name:m.n,me:!!m.me,cap:m.cap,curve:m.c,hBps:m.h})),{});
   const k=0.12, mark=B.mark(k,'call',true), cl=B.closePx(k,'sell',1e-9,true);
   return {yourFill:you?you.fill:null, yourShare:you?you.cap/st.sorted.reduce((t,m)=>t+m.cap,0):null,
           totFill:tot, mktQ:MKT.Q, mark, close:cl, gapIsCost: cl!==null && mark-cl>=0};
 });
 console.log('EARN fills, pro-rata now:');
 console.log('  your fill      ',r.yourFill.toFixed(4),'BTC   of RFQ size',r.mktQ);
 console.log('  your capital share',(r.yourShare*100).toFixed(1)+'%   -> matches:',Math.abs(r.yourFill/r.mktQ-r.yourShare)<1e-9);
 console.log('  all fills sum  ',r.totFill.toFixed(6),'  (== RFQ size:',Math.abs(r.totFill-r.mktQ)<1e-9,')');
 console.log('\nPORTFOLIO through Book:');
 console.log('  mark ',r.mark.toFixed(6),'  close ',r.close===null?'null':r.close.toFixed(6));
 console.log('  mark -> close is a COST:',r.gapIsCost);
 console.log('\npageerrors:',errs.length?errs:'NONE');
 await b.close();
})();
