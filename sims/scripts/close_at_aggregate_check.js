const fs=require('fs'),vm=require('vm');
const js=/<script>([\s\S]*?)<\/script>/.exec(fs.readFileSync('app/index.html','utf8'))[1];
const el=()=>({style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',value:'0',dataset:{},
  querySelector:()=>el(),querySelectorAll:()=>[],appendChild(){},addEventListener(){},
  getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})}),width:900,height:300,
  getBoundingClientRect:()=>({left:0,top:0,width:900,height:300})});
const doc={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener(){},body:el()};
const ctx={document:doc,window:{addEventListener(){},devicePixelRatio:1},console,requestAnimationFrame:f=>f(),setTimeout,Math,JSON,Intl,out:{r:[]}};
ctx.window.document=doc; vm.createContext(ctx); vm.runInContext(js,ctx);
vm.runInContext(`
const S2=65695.5;
ORC.mode='oracle'; ORC.iv=0.60;
const pos=[{k:0.12,sz:3,side:1},{k:-0.10,sz:2,side:-1},{k:0.30,sz:1.5,side:1}];
for(const b of [-0.10,-0.02,0,0.02,0.10,0.30]){
 ORC.bias=b; const st=calc(); const set=makerCurves(); aggBook(set,st.book.map(m=>m.h));
 const me=set.find(m=>m.me), oth=set.filter(m=>!m.me);
 // CLOSING a long = you SELL, so you hit a BID. Two candidate rules:
 const bidAll=(k,side)=>Math.max(...set.map(m=>(side>0?m.c.CALL(k):m.c.PUT(k))*(1-m.h/1e4)));
 const bidOth=(k,side)=>Math.max(...oth.map(m=>(side>0?m.c.CALL(k):m.c.PUT(k))*(1-m.h/1e4)));
 let vAll=0,vOth=0,selfWins=0,n=0;
 pos.forEach(p=>{const a=bidAll(p.k,p.side),o=bidOth(p.k,p.side);
   vAll+=p.sz*a*S2; vOth+=p.sz*o*S2; n++;
   const mine=(p.side>0?me.c.CALL(p.k):me.c.PUT(p.k))*(1-me.h/1e4);
   if(mine>=o-1e-12)selfWins++;});
 out.r.push([b,vAll,vOth,vAll-vOth,selfWins,n]);
}
ORC.bias=0;
`,ctx);
console.log('CLOSING A POSITION when payout is via BUY/SELL, not intrinsic.');
console.log('Rule A: close against the whole book (your own curve included)');
console.log('Rule B: close against the aggregate EXCLUDING your own curve\n');
console.log('  your bias    close @ A      close @ B      A − B       strikes where YOUR own quote is best');
ctx.out.r.forEach(r=>console.log('   '+((r[0]>=0?'+':'')+(r[0]*100).toFixed(0)+'%').padStart(7)+'    $'
 +Math.round(r[1]).toLocaleString().padStart(9)+'    $'+Math.round(r[2]).toLocaleString().padStart(9)
 +'   $'+Math.round(r[3]).toLocaleString().padStart(7)+'            '+r[4]+' of '+r[5]));
const worst=ctx.out.r[ctx.out.r.length-1];
console.log('\n  At +30% bias you close '+((worst[1]/worst[2]-1)*100).toFixed(1)+'% richer against yourself');
console.log('  — and you set that price, so it is not a market price at all.');
