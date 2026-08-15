const fs=require('fs'),vm=require('vm');
const js=/<script>([\s\S]*?)<\/script>/.exec(fs.readFileSync('app/index.html','utf8'))[1];
const el=()=>({style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',value:'0',dataset:{},
  querySelector:()=>el(),querySelectorAll:()=>[],appendChild(){},addEventListener(){},
  getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})}),width:900,height:300,
  getBoundingClientRect:()=>({left:0,top:0,width:900,height:300})});
const doc={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener(){},body:el()};
const ctx={document:doc,window:{addEventListener(){},devicePixelRatio:1},console,requestAnimationFrame:f=>f(),setTimeout,Math,JSON,Intl,out:{d:[],share:[]}};
ctx.window.document=doc; vm.createContext(ctx); vm.runInContext(js,ctx);
vm.runInContext(`
const S2=65695.5, pool=MKT.pool;
ORC.mode='manual';
function book(D){const R=DEF;
 const set=[{n:'YOU',lam:0.02,Sbar:R.Sbar,a:R.a,gam:R.gam,kap:R.kap},
  {n:'K',lam:0.05,Sbar:R.Sbar*(1-0.035*D),a:R.a*(1-0.06*D),gam:R.gam*(1+0.03*D),kap:R.kap+0.05*D},
  {n:'D',lam:0.10,Sbar:R.Sbar*(1+0.05*D),a:R.a*(1+0.06*D),gam:R.gam*(1-0.05*D),kap:R.kap-0.06*D},
  {n:'S',lam:0.04,Sbar:R.Sbar*(1+0.01*D),a:R.a*(1+0.01*D),gam:R.gam,kap:R.kap+0.02*D}];
 const inv=set.reduce((t,m)=>t+1/m.lam,0);
 set.forEach(m=>{m.share=(1/m.lam)/inv;m.c=mk(m.Sbar,m.a,m.gam,m.kap);m.h=19;m.inv=0;});
 return set;}
// eta = inventory skew: a maker that SELLS marks its level UP, one that BUYS marks DOWN.
// eta=0 reproduces the previous run (no inventory feedback at all).
function run(D,eta,CAP){
 const set=book(D); let tot=0,r=0,size=0;
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
  best.A.inv-=q; best.B.inv+=q;                     // A sold, B bought
  best.A.Sbar*=(1+eta*q/pool);                      // short  -> mark UP
  best.B.Sbar*=(1-eta*q/pool);                      // long   -> mark DOWN
  best.A.c=mk(best.A.Sbar,best.A.a,best.A.gam,best.A.kap);
  best.B.c=mk(best.B.Sbar,best.B.a,best.B.gam,best.B.kap);
  tot+=best.e*q*S2; size+=q; r++;
 }
 return {tot,r,size,healed:false};}
out.d=[];
// and the operator's density point: does a biased maker just get a DIFFERENT SHARE?
const s2=book(0.15);
[[-0.10,'biased DOWN 10%'],[-0.02,'biased DOWN 2%'],[0,'at the oracle'],[0.02,'biased UP 2%'],[0.10,'biased UP 10%']].forEach(b=>{
 const sb=DEF.Sbar*(1+b[0]), c=mk(sb,DEF.a,DEF.gam,DEF.kap);
 let winAsk=0,winBid=0,n=0;
 for(let k=-0.6;k<=0.6;k+=0.02){
  const my={ask:c.CALL(k)*(1+19/1e4),bid:c.CALL(k)*(1-19/1e4)};
  const oa=Math.min(...s2.slice(1).map(m=>m.c.CALL(k)*(1+m.h/1e4)));
  const ob=Math.max(...s2.slice(1).map(m=>m.c.CALL(k)*(1-m.h/1e4)));
  n++; if(my.ask<oa)winAsk++; if(my.bid>ob)winBid++;
 }
 out.share.push([b[1],winAsk/n*100,winBid/n*100]);});
`,ctx);
const o=ctx.out;
console.log('DOES INVENTORY FEEDBACK HEAL THE LEVEL LEAK?  (a fill marks that maker up/down)\n');
console.log('   inventory skew η   rounds   size BTC     extracted        healed?');
o.d.forEach(r=>console.log('        '+String(r[0]).padStart(5)+'         '+String(r[1].r).padStart(6)+'   '+r[1].size.toFixed(1).padStart(8)
 +'   '+('$'+Math.round(r[1].tot).toLocaleString()).padStart(12)+'   '+(r[1].healed?'  YES — closes':'  NO — never closes')));
console.log('\nTHE DENSITY READING: what a biased maker actually gets (share of strikes it wins)\n');
console.log('   your bias              wins the ASK     wins the BID');
o.share.forEach(r=>console.log('   '+r[0].padEnd(22),(r[1].toFixed(0)+'%').padStart(9),(r[2].toFixed(0)+'%').padStart(15)));
