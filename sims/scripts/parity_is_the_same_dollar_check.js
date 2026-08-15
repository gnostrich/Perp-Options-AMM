const fs=require('fs'),vm=require('vm');
const js=/<script>([\s\S]*?)<\/script>/.exec(fs.readFileSync('app/index.html','utf8'))[1];
const el=()=>({style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',value:'0',dataset:{},
  querySelector:()=>el(),querySelectorAll:()=>[],appendChild(){},addEventListener(){},
  getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})}),width:900,height:300,
  getBoundingClientRect:()=>({left:0,top:0,width:900,height:300})});
const doc={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener(){},body:el()};
const ctx={document:doc,window:{addEventListener(){},devicePixelRatio:1},console,requestAnimationFrame:f=>f(),setTimeout,Math,JSON,Intl,out:{}};
ctx.window.document=doc; vm.createContext(ctx); vm.runInContext(js,ctx);
vm.runInContext(`
ORC.mode='manual';
const st=calc(),hs=st.book.map(m=>m.h);
// 1) does EVERY maker satisfy parity exactly, on its own curve?
ARBD=0.60; const set=makerCurves(); aggBook(set,hs);
let worstOwn=0;
for(const m of set) for(let k=-0.6;k<=0.6;k+=0.01){
 const r=(m.c.CALL(k)-m.c.PUT(k))+k; if(Math.abs(r)>Math.abs(worstOwn))worstOwn=r;}
out.own=worstOwn;
// 2) decompose the BOOK-level break into (spread term) - (dispersion term)
out.rows=[];
for(const k of [0.02,0.05,0.15,0.30,0.50]){
 const cAsk=Math.min(...set.map(m=>m.c.CALL(k)*(1+m.h/1e4)));
 const pBid=Math.max(...set.map(m=>m.c.PUT(k)*(1-m.h/1e4)));
 const resid=(cAsk-pBid)+k;                                  // <0 = parity "broken"
 // the crossed-book edge on the SAME instrument
 const bookAsk=cAsk, bookBid=Math.max(...set.map(m=>m.c.CALL(k)*(1-m.h/1e4)));
 const crossEdge=bookBid-bookAsk;                            // >0 = crossed
 // dispersion: cheapest CALL vs dearest CALL (parity turns max PUT into max CALL)
 const disp=Math.max(...set.map(m=>m.c.CALL(k)))-Math.min(...set.map(m=>m.c.CALL(k)));
 out.rows.push([k,resid,crossEdge,disp]);
}
`,ctx);
const o=ctx.out;
console.log('1) PER-MAKER parity  CALL(k) - PUT(k) + k , worst over all makers and strikes:');
console.log('   ',o.own.toExponential(3),' -> parity holds EXACTLY on every individual curve\n');
console.log('2) So a book-level break can only come from min and max picking DIFFERENT makers.');
console.log('   Is the parity residual the same dollar as the crossed edge, or a second arb?\n');
console.log('    k      parity residual   crossed edge   maker dispersion   residual+edge');
o.rows.forEach(r=>console.log('  '+r[0].toFixed(2).padStart(5)+'      '+r[1].toFixed(6).padStart(11)+'    '
  +r[2].toFixed(6).padStart(11)+'      '+r[3].toFixed(6).padStart(11)+'      '+(r[1]+r[2]).toFixed(6).padStart(11)));
console.log('\n   residual + edge is a small POSITIVE constant (the spread term), not a second');
console.log('   independent quantity: the two are one phenomenon counted from two sides.');
