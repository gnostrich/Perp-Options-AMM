// Does PRO-RATA APPORTIONMENT resurrect the mixture at the EXECUTION layer,
// even though the QUOTE layer is an envelope?
const fs=require('fs'),vm=require('vm');
const h=fs.readFileSync('app/index.html','utf8');
const js=/<script>([\s\S]*?)<\/script>/.exec(h)[1];
const el=()=>({style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',value:'0',
  querySelector:()=>el(),querySelectorAll:()=>[],appendChild(){},addEventListener(){},
  getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})}),width:900,height:300,
  getBoundingClientRect:()=>({left:0,top:0,width:900,height:300})});
const doc={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener(){},body:el()};
const ctx={document:doc,window:{addEventListener(){},devicePixelRatio:1},console,requestAnimationFrame:f=>f(),setTimeout,Math,JSON,Intl,out:{}};
ctx.window.document=doc; vm.createContext(ctx);
vm.runInContext(js,ctx);
vm.runInContext(`
const st=calc(), hs=st.book.map(m=>m.h);
ARBD=0.6; const set=makerCurves(); const B=aggBook(set,hs);
out.r=[];
for(const k of [0.02,0.05,0.10,0.20,0.35,0.50]){
  const asks=set.map(m=>({n:m.n,px:m.c.CALL(k)*(1+m.h/1e4),share:m.share}));
  const envelope = Math.min(...asks.map(a=>a.px));                  // LADDER / PRIORITY fill
  const prorata  = asks.reduce((s,a)=>s+a.share*a.px,0);            // PRO-RATA fill = a MIXTURE
  out.r.push([k,envelope,prorata,(prorata-envelope)/envelope*1e4]);
}
// ladder fill for a size that EXHAUSTS the best maker: is the avg price still an envelope?
const pool=200; const k=0.10;
const asks=set.map(m=>({n:m.n,px:m.c.CALL(k)*(1+m.h/1e4),cap:m.share*pool})).sort((a,b)=>a.px-b.px);
out.lad=[];
for(const Q of [1,20,60,150]){
  let rem=Q,cost=0,legs=[];
  for(const a of asks){const t=Math.min(a.cap,rem); if(t>0){cost+=t*a.px;legs.push(a.n+':'+t.toFixed(1));rem-=t;}}
  out.lad.push([Q,cost/(Q-rem),legs.join(' ')]);
}
out.env=Math.min(...asks.map(a=>a.px));
`,ctx);
console.log('QUOTE layer, D=0.6 — envelope (best) vs PRO-RATA blend (a mixture):');
console.log(' k      envelope   pro-rata   pro-rata premium');
ctx.out.r.forEach(r=>console.log(' '+r[0].toFixed(2).padEnd(6),r[1].toFixed(5),'  ',r[2].toFixed(5),'  ',r[3].toFixed(0)+' bps'));
console.log('\nEXECUTION layer, LADDER (price-priority) fill at k=0.10, best ask '+ctx.out.env.toFixed(5)+':');
ctx.out.lad.forEach(r=>console.log('  Q='+String(r[0]).padEnd(5),'avg fill '+r[1].toFixed(5),' legs: '+r[2]));
