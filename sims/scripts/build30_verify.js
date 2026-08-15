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
ORC.mode='oracle'; ORC.iv=0.60; ORC.bias=0;
out.cross=[]; out.fill=[]; out.imp=[];
for(const D of [0,0.15,0.6,1.0]){
 ARBD=D; const st=calc(); const set=makerCurves(); const B=aggBook(set,st.book.map(m=>m.h));
 let c=0,n=0,sp=0;
 for(let k=-0.5;k<=0.5;k+=0.01){n++; if(B.bid(k)>B.ask(k))c++; sp+=(B.ask(k)-B.bid(k))/B.mid(k)*1e4;}
 out.cross.push([D,c,n,sp/n]);
}
ARBD=0.15; const st=calc(); const set=makerCurves(); const B=aggBook(set,st.book.map(m=>m.h));
// pro-rata fills
const Ld=ladderAt(set,0.12,MKT.pool,'ask');
out.fill=set.map(m=>[m.n,m.share*100,30*m.share]);
out.imp=[1,20,60,150,199,201].map(Q=>{const px=landedFrom(Ld,Q);
 return [Q,px,px===null?null:(px/Ld.best-1)*1e4];});
out.tot=Ld.total; out.best=Ld.best;
`,ctx);
const o=ctx.out;
console.log('CROSSING, after the re-order:');
console.log('   divergence   crossed strikes   mean spread');
o.cross.forEach(r=>console.log('     '+r[0].toFixed(2).padStart(5)+'        '+String(r[1]).padStart(3)+' of '+r[2]
 +'        '+r[3].toFixed(2)+' bps'));
console.log('\nPRO-RATA FILLS on a 30 BTC order (everyone participates, by density):');
o.fill.forEach(r=>console.log('   '+r[0].padEnd(10),(r[1].toFixed(1)+'%').padStart(7),' -> ',r[2].toFixed(2)+' BTC'));
console.log('   sum:',o.fill.reduce((t,r)=>t+r[2],0).toFixed(2),'BTC');
console.log('\nIMPACT along the single aggregate curve (best',o.best.toFixed(5),', capacity',o.tot.toFixed(0),'BTC):');
o.imp.forEach(r=>console.log('   Q='+String(r[0]).padStart(4),' px',r[1]===null?'NO FIT ':r[1].toFixed(5),
 ' impact',r[2]===null?'—':r[2].toFixed(1)+' bps'));
