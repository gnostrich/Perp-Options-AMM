const fs=require('fs'),vm=require('vm');
const js=/<script>([\s\S]*?)<\/script>/.exec(fs.readFileSync('app/index.html','utf8'))[1];
const el=()=>({style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',value:'0',
  querySelector:()=>el(),querySelectorAll:()=>[],appendChild(){},addEventListener(){},
  getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})}),width:900,height:300,
  getBoundingClientRect:()=>({left:0,top:0,width:900,height:300})});
const doc={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener(){},body:el()};
const ctx={document:doc,window:{addEventListener(){},devicePixelRatio:1},console,requestAnimationFrame:f=>f(),setTimeout,Math,JSON,Intl,out:{r:[]}};
ctx.window.document=doc; vm.createContext(ctx); vm.runInContext(js,ctx);
vm.runInContext(`
const S2=65695.5, pos=[{k:0.12,sz:3,side:1},{k:-0.10,sz:2,side:-1},{k:0.30,sz:1.5,side:1}];
for(const Sb of [0.30,0.60,0.95,1.00]){
 P.Sbar=Sb; const st=calc(); const mkrs=makerCurves(); aggBook(mkrs,st.book.map(m=>m.h));
 const others=mkrs.filter(m=>!m.me);
 const bookMid=(k,side)=>{const cs=others.map(m=>side>0?m.c.CALL(k):m.c.PUT(k)),hs2=others.map(m=>m.h/1e4);
   return 0.5*(Math.min(...cs.map((c,i)=>c*(1+hs2[i])))+Math.max(...cs.map((c,i)=>c*(1-hs2[i]))));};
 let v=0; pos.forEach(p=>{v+=p.sz*bookMid(p.k,p.side)*S2*p.side;});
 out.r.push([Sb,v]);
}
P.Sbar=0.60;
`,ctx);
console.log('\nAFTER FIX — marked at the BOOK, moving your own S̄:');
ctx.out.r.forEach(r=>console.log('   your S̄='+r[0].toFixed(2)+'   marked value $'+Math.round(r[1]).toLocaleString()));
const a=ctx.out.r[0][1],b=ctx.out.r[2][1];
console.log('   sensitivity to your own quote: '+((b/a-1)*100).toFixed(1)+'%   (was +363%)');
