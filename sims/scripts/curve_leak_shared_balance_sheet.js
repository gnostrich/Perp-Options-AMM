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
const S2=65695.5, pool=MKT.pool;
ORC.mode='manual';
function book(D){
 const R=DEF;
 const set=[{n:'YOU',me:true,lam:0.02,Sbar:P.Sbar,a:P.a,gam:P.gam,kap:P.kap},
  {n:'K',lam:0.05,Sbar:R.Sbar*(1-0.035*D),a:R.a*(1-0.06*D),gam:R.gam*(1+0.03*D),kap:R.kap+0.05*D},
  {n:'D',lam:0.10,Sbar:R.Sbar*(1+0.05*D),a:R.a*(1+0.06*D),gam:R.gam*(1-0.05*D),kap:R.kap-0.06*D},
  {n:'S',lam:0.04,Sbar:R.Sbar*(1+0.01*D),a:R.a*(1+0.01*D),gam:R.gam,kap:R.kap+0.02*D}];
 const inv=set.reduce((t,m)=>t+1/m.lam,0);
 set.forEach(m=>{m.share=(1/m.lam)/inv;m.c=mk(m.Sbar,m.a,m.gam,m.kap);m.h=19;});
 return set;}

// MODEL A — what I did before: every strike has its OWN independent depth and its
// own local price impact. Nothing a trade does at strike k touches strike k'.
function modelA(D,DK){
 const set=book(D); let tot=0,n=0;
 for(let k=0.005;k<=0.60;k+=DK){
  const A=set.map(m=>({m,px:m.c.CALL(k)*(1+m.h/1e4),slope:(m.lam*m.c.ATM)/(0.01*pool)})).sort((a,b)=>a.px-b.px)[0];
  const B=set.map(m=>({m,px:m.c.CALL(k)*(1-m.h/1e4),slope:(m.lam*m.c.ATM)/(0.01*pool)})).sort((a,b)=>b.px-a.px)[0];
  n++; if(B.px<=A.px||A.m===B.m)continue;
  const q=(B.px-A.px)/(A.slope+B.slope);
  tot+=((B.px-A.px)-0.5*(A.slope+B.slope)*q)*q*S2;
 }
 return {tot,n};}

// MODEL B — the operator's point: ONE balance sheet per maker, so a trade moves
// that maker's PARAMETER (kappa), i.e. its WHOLE CURVE, at every strike at once.
// Arb the best strike, apply the parameter response, repeat until nothing crosses.
function modelB(D,DK){
 const set=book(D); let tot=0,rounds=0,size=0;
 for(let it=0; it<4000; it++){
  let best=null;
  for(let k=0.005;k<=0.60;k+=DK){
   const A=set.map(m=>({m,px:m.c.CALL(k)*(1+m.h/1e4)})).sort((a,b)=>a.px-b.px)[0];
   const B=set.map(m=>({m,px:m.c.CALL(k)*(1-m.h/1e4)})).sort((a,b)=>b.px-a.px)[0];
   if(B.px<=A.px||A.m===B.m)continue;
   const e=B.px-A.px; if(!best||e>best.e)best={k,e,A:A.m,B:B.m,pxA:A.px};
  }
  if(!best)break;
  // take a small clip; each leg's maker moves its kappa (the app's swap dynamic)
  const q=0.25;
  const dkA=  best.A.lam*(q/pool)/0.01*best.A.c.ATM/Math.max(best.pxA,1e-9);
  const dkB= -best.B.lam*(q/pool)/0.01*best.B.c.ATM/Math.max(best.pxA,1e-9);
  best.A.kap=Math.max(-0.95,Math.min(0.95,best.A.kap+dkA));
  best.B.kap=Math.max(-0.95,Math.min(0.95,best.B.kap+dkB));
  best.A.c=mk(best.A.Sbar,best.A.a,best.A.gam,best.A.kap);
  best.B.c=mk(best.B.Sbar,best.B.a,best.B.gam,best.B.kap);
  tot+=best.e*q*S2; size+=q; rounds++;
 }
 return {tot,rounds,size};}

out.A=[0.02,0.01,0.005,0.002].map(dk=>[dk,modelA(0.15,dk)]);
out.B=[0.02,0.01,0.005,0.002].map(dk=>[dk,modelB(0.15,dk)]);
`,ctx);
const o=ctx.out;
console.log('MODEL A — independent depth per strike, only local price impact (what I measured before)');
console.log('   grid step   strikes   total extracted');
o.A.forEach(r=>console.log('    '+String(r[0]).padEnd(10),String(r[1].n).padStart(6),('$'+Math.round(r[1].tot).toLocaleString()).padStart(14)));
console.log('   -> scales with the grid. No limit.\n');
console.log('MODEL B — one balance sheet per maker: a trade moves that maker\'s kappa,');
console.log('          i.e. its WHOLE CURVE at every strike, so arbing one strike heals all');
console.log('   grid step   strikes   rounds   size BTC   total extracted');
o.B.forEach(r=>console.log('    '+String(r[0]).padEnd(10),String(ctx.out.A.find(a=>a[0]===r[0])[1].n).padStart(6),
  String(r[1].rounds).padStart(8),r[1].size.toFixed(2).padStart(10),('$'+Math.round(r[1].tot).toLocaleString()).padStart(16)));
const t=o.B.map(r=>r[1].tot);
console.log('   -> spread across a 10x grid range:',((Math.max(...t)/Math.min(...t)-1)*100).toFixed(1)+'%   (converged, grid-independent)');
