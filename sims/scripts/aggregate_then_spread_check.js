const fs=require('fs'),vm=require('vm');
const js=/<script>([\s\S]*?)<\/script>/.exec(fs.readFileSync('app/index.html','utf8'))[1];
const el=()=>({style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',value:'0',dataset:{},
  querySelector:()=>el(),querySelectorAll:()=>[],appendChild(){},addEventListener(){},
  getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})}),width:900,height:300,
  getBoundingClientRect:()=>({left:0,top:0,width:900,height:300})});
const doc={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener(){},body:el()};
const ctx={document:doc,window:{addEventListener(){},devicePixelRatio:1},console,requestAnimationFrame:f=>f(),setTimeout,Math,JSON,Intl,out:{r:[],x:[]}};
ctx.window.document=doc; vm.createContext(ctx); vm.runInContext(js,ctx);
vm.runInContext(`
ORC.mode='oracle'; ORC.iv=0.60; ORC.bias=0;
for(const D of [0,0.15,0.6,1.0]){
 ARBD=D; const st=calc(); const set=makerCurves(); aggBook(set,st.book.map(m=>m.h));
 let crossEnv=0,crossAgg=0,n=0,spEnv=0,spAgg=0;
 for(let k=-0.5;k<=0.5;k+=0.01){
  // (A) SPREAD FIRST, THEN AGGREGATE  — the envelope I built
  const eAsk=Math.min(...set.map(m=>m.c.CALL(k)*(1+m.h/1e4)));
  const eBid=Math.max(...set.map(m=>m.c.CALL(k)*(1-m.h/1e4)));
  // (B) AGGREGATE FIRST, THEN SPREAD  — operator entry 580 / BOOK_FORMAL
  //     level = share-weighted mean of the maker MIDs ; half-spread = tightest
  const mid=set.reduce((t,m)=>t+m.share*m.c.CALL(k),0);
  const hAgg=Math.min(...set.map(m=>m.h))/1e4;
  const aAsk=mid*(1+hAgg), aBid=mid*(1-hAgg);
  n++; if(eBid>eAsk)crossEnv++; if(aBid>aAsk)crossAgg++;
  spEnv+=(eAsk-eBid)/((eAsk+eBid)/2)*1e4; spAgg+=(aAsk-aBid)/((aAsk+aBid)/2)*1e4;
 }
 out.r.push([D,crossEnv/n*100,crossAgg/n*100,spEnv/n,spAgg/n]);
}
// does the aggregate-then-spread book ever cross, for ANY divergence?
ARBD=1.0; const st=calc(); const set=makerCurves(); aggBook(set,st.book.map(m=>m.h));
out.proof=[];
for(const k of [-0.4,0,0.25,0.5]){
 const mid=set.reduce((t,m)=>t+m.share*m.c.CALL(k),0), h=Math.min(...set.map(m=>m.h))/1e4;
 out.proof.push([k,mid,mid*(1+h),mid*(1-h),2*h*1e4]);
}
`,ctx);
const o=ctx.out;
console.log('ORDER OF OPERATIONS — spread-then-aggregate vs aggregate-then-spread\n');
console.log('   divergence   % strikes crossed          mean book spread (bps)');
console.log('                envelope   agg-then-spread   envelope   agg-then-spread');
o.r.forEach(r=>console.log('     '+r[0].toFixed(2).padStart(5)+'       '+(r[1].toFixed(0)+'%').padStart(6)+'      '
 +(r[2].toFixed(0)+'%').padStart(8)+'        '+r[3].toFixed(1).padStart(8)+'      '+r[4].toFixed(1).padStart(8)));
console.log('\n  aggregate-then-spread at MAX divergence (D=1.0):');
console.log('     k        agg mid      ask          bid        spread');
o.proof.forEach(r=>console.log('   '+(r[0]*100).toFixed(0).padStart(4)+'%    '+r[1].toFixed(5)+'    '+r[2].toFixed(5)
 +'    '+r[3].toFixed(5)+'    '+r[4].toFixed(1)+' bps'));
console.log('\n  ask = mid(1+h), bid = mid(1-h) with h>0  =>  ask > bid ALWAYS. Crossing is');
console.log('  structurally impossible in this order. It was an artifact of the other one.');
