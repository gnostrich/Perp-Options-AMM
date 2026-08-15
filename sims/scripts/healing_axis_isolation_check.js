const fs=require('fs'),vm=require('vm');
const js=/<script>([\s\S]*?)<\/script>/.exec(fs.readFileSync('app/index.html','utf8'))[1];
const el=()=>({style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',value:'0',dataset:{},
  querySelector:()=>el(),querySelectorAll:()=>[],appendChild(){},addEventListener(){},
  getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})}),width:900,height:300,
  getBoundingClientRect:()=>({left:0,top:0,width:900,height:300})});
const doc={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener(){},body:el()};
const ctx={document:doc,window:{addEventListener(){},devicePixelRatio:1},console,requestAnimationFrame:f=>f(),setTimeout,Math,JSON,Intl,out:{d:[]}};
ctx.window.document=doc; vm.createContext(ctx); vm.runInContext(js,ctx);
vm.runInContext(`
const S2=65695.5, pool=MKT.pool, CAP=20000;
ORC.mode='manual';
function book(D,dim){
 const R=DEF, L=x=>dim==='kap'?1:x, K=x=>dim==='sbar'?0:x;
 const set=[{n:'YOU',lam:0.02,Sbar:R.Sbar,a:R.a,gam:R.gam,kap:R.kap},
  {n:'K',lam:0.05,Sbar:R.Sbar*L(1-0.035*D),a:R.a*L(1-0.06*D),gam:R.gam*L(1+0.03*D),kap:R.kap+K(0.05*D)},
  {n:'D',lam:0.10,Sbar:R.Sbar*L(1+0.05*D),a:R.a*L(1+0.06*D),gam:R.gam*L(1-0.05*D),kap:R.kap-K(0.06*D)},
  {n:'S',lam:0.04,Sbar:R.Sbar*L(1+0.01*D),a:R.a*L(1+0.01*D),gam:R.gam,kap:R.kap+K(0.02*D)}];
 const inv=set.reduce((t,m)=>t+1/m.lam,0);
 set.forEach(m=>{m.share=(1/m.lam)/inv;m.c=mk(m.Sbar,m.a,m.gam,m.kap);m.h=19;});
 return set;}
function run(D,dim){
 const set=book(D,dim); let tot=0,r=0,size=0;
 for(let it=0;it<CAP;it++){
  let best=null;
  for(let k=0.005;k<=0.60;k+=0.02){
   const A=set.map(m=>({m,px:m.c.CALL(k)*(1+m.h/1e4)})).sort((a,b)=>a.px-b.px)[0];
   const B=set.map(m=>({m,px:m.c.CALL(k)*(1-m.h/1e4)})).sort((a,b)=>b.px-a.px)[0];
   if(B.px<=A.px||A.m===B.m)continue;
   const e=B.px-A.px; if(!best||e>best.e)best={k,e,A:A.m,B:B.m,pxA:A.px};
  }
  if(!best)return {tot,r,size,healed:true};
  const q=0.25;
  const dA= best.A.lam*(q/pool)/0.01*best.A.c.ATM/Math.max(best.pxA,1e-9);
  const dB=-best.B.lam*(q/pool)/0.01*best.B.c.ATM/Math.max(best.pxA,1e-9);
  best.A.kap=Math.max(-0.95,Math.min(0.95,best.A.kap+dA));
  best.B.kap=Math.max(-0.95,Math.min(0.95,best.B.kap+dB));
  best.A.c=mk(best.A.Sbar,best.A.a,best.A.gam,best.A.kap);
  best.B.c=mk(best.B.Sbar,best.B.a,best.B.gam,best.B.kap);
  tot+=best.e*q*S2; size+=q; r++;
 }
 return {tot,r,size,healed:false};}
out.d.push(['skew (kappa) ONLY — the axis a trade moves', run(0.15,'kap')]);
out.d.push(['level+shape ONLY (S-bar, a, gamma)',         run(0.15,'sbar')]);
out.d.push(['all three together (the shipped dial)',      run(0.15,'all')]);
`,ctx);
console.log('CAN TRADING HEAL THE DISAGREEMENT?  trades move kappa only; D=0.15, 30 strikes\n');
console.log('   disagreement lives in                          rounds   size BTC     extracted     healed?');
ctx.out.d.forEach(r=>console.log('   '+r[0].padEnd(46),String(r[1].r).padStart(6),r[1].size.toFixed(1).padStart(10),
 ('$'+Math.round(r[1].tot).toLocaleString()).padStart(13),(r[1].healed?'  YES — closes':'  NO — never closes')));
