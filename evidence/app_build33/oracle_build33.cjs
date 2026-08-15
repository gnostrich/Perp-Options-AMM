/* INDEPENDENT node oracle for build 33.
   I load the page script for the CURVE FAMILY + STATE ONLY (mk/DEF/others/LAM are
   data + the given Burr definition). Every aggregation / impact / fill / mark
   formula below is written HERE from the stated spec, not called from the page. */
const fs=require('fs'),vm=require('vm');
const js=/<script>([\s\S]*?)<\/script>/.exec(fs.readFileSync('/home/user/Perp-Options-AMM/app/index.html','utf8'))[1];
const el=()=>({style:{},classList:{add(){},remove(){},toggle(){}},innerHTML:'',textContent:'',value:'0',dataset:{},
  querySelector:()=>el(),querySelectorAll:()=>[],appendChild(){},addEventListener(){},
  getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})}),width:900,height:300,
  getBoundingClientRect:()=>({left:0,top:0,width:900,height:300})});
const doc={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener(){},body:el()};
const ctx={document:doc,window:{addEventListener(){},devicePixelRatio:1},console,requestAnimationFrame:f=>f(),setTimeout,Math,JSON,Intl,O:{}};
ctx.window.document=doc;vm.createContext(ctx);vm.runInContext(js,ctx);
const g=n=>vm.runInContext(n,ctx);
const mk=g('mk'), LAM=g('LAM'), S=g('S'), DEF=g('DEF');
const out={};

/* the live default configuration, reconstructed HERE */
function makers(D,mode,P,iv){
  const R = mode==='oracle'
    ? {Sbar:g('sbarFromVol')(iv,DEF.a,DEF.gam,DEF.kap),a:DEF.a,gam:DEF.gam,kap:DEF.kap} : DEF;
  return [{n:'YOU',me:true,cap:P.cap,c:mk(P.Sbar,P.a,P.gam,P.kap)},
   {n:'K',me:false,cap:38,c:mk(R.Sbar*(1-0.035*D),R.a*(1-0.06*D),R.gam*(1+0.03*D),R.kap+0.05*D)},
   {n:'D',me:false,cap:19,c:mk(R.Sbar*(1+0.05*D),R.a*(1+0.06*D),R.gam*(1-0.05*D),R.kap-0.06*D)},
   {n:'S',me:false,cap:48,c:mk(R.Sbar*(1+0.01*D),R.a*(1+0.01*D),R.gam,R.kap+0.02*D)}];}
/* MY aggregation (spec: aggregate mids, one spread, parallel depth) */
function agg(ms,hbps){
  const tot=ms.reduce((t,m)=>t+m.cap,0), hAgg=Math.min(...hbps)/1e4;
  const mid=k=>ms.reduce((t,m)=>t+(m.cap/tot)*m.c.CALL(k),0);
  const invSlope=ms.reduce((t,m)=>t+(0.01*m.cap)/(LAM*m.c.ATM),0);
  return {tot,hAgg,mid,ask:k=>mid(k)*(1+hAgg),bid:k=>mid(k)*(1-hAgg),slope:1/invSlope,
          atmShareWtd:ms.reduce((t,m)=>t+(m.cap/tot)*m.c.ATM,0)};}

/* ── 1. sheet identity in the LIVE (heterogeneous) configuration ────────── */
{
 const P={...DEF,cap:95};
 const ms=makers(0.15,'oracle',P,0.60);
 // half-spreads as the app computes them are irrelevant to the SLOPE, use 19bps flat
 const A=agg(ms,ms.map(()=>19));
 const singlePool_arith = LAM*A.atmShareWtd/(0.01*A.tot);   // "one pool of ΣN" with share-wtd ATM
 out.slope_check={agg_parallel_slope:A.slope,single_pool_slope:singlePool_arith,
   rel_gap_pct:(A.slope/singlePool_arith-1)*100,
   ATMs:ms.map(m=>+m.c.ATM.toFixed(6))};
 // sheet fractional impact at 5 BTC vs app's landed
 out.sheet_rows=[];
 for(const k of [-0.30,-0.10,0,0.10,0.30,0.50]){
   const best=A.ask(k), Q=5;
   const app_frac=(0.5*A.slope*Q)/best;
   const sheet_frac=0.5*LAM*(Q/A.tot)/0.01*A.atmShareWtd/best;
   out.sheet_rows.push({k,best:+best.toFixed(6),app_pct:+(app_frac*100).toFixed(4),
     sheet_pct:+(sheet_frac*100).toFixed(4),rel_err_pct:+((app_frac/sheet_frac-1)*100).toFixed(4)});}
}
/* ── 2. crossing over divergence, my own ask/bid ────────────────────────── */
{
 out.crossing=[];
 for(const D of [0,0.05,0.15,0.5,1.0]){
  const ms=makers(D,'oracle',{...DEF,cap:95},0.60);
  const A=agg(ms,[19,20,21,22]);
  let cross=0,n=0,minS=1e9;
  for(let i=0;i<=400;i++){const k=-0.6+1.2*i/400;const a=A.ask(k),b=A.bid(k);
   if(b>a)cross++;minS=Math.min(minS,(a-b)/((a+b)/2)*1e4);n++;}
  out.crossing.push({D,crossedFrac:cross/n,minSpreadBps:+minS.toFixed(4)});}
 // and the pathological case: what if the tightest maker has h=0?
 const ms=makers(0.15,'oracle',{...DEF,cap:95},0.60);const A=agg(ms,[0,20,21,22]);
 out.crossing_h0={hAgg:A.hAgg,spreadBps:(A.ask(0.1)-A.bid(0.1))/A.mid(0.1)*1e4};
}
/* ── 3. sell-side sign of the impact term ───────────────────────────────── */
{
 const ms=makers(0.15,'oracle',{...DEF,cap:95},0.60);const A=agg(ms,[19,20,21,22]);
 out.sell_side=[];
 for(const k of [-0.3,0,0.12,0.3]) for(const Q of [1,10,50]){
   const best=A.bid(k), app_landed=best+0.5*A.slope*Q;   // what the app computes
   const correct=best-0.5*A.slope*Q;                     // what a sell walk should give
   out.sell_side.push({k,Q,bestBid:+best.toFixed(6),app_landed:+app_landed.toFixed(6),
     spec_landed:+correct.toFixed(6),app_pays_you_more:app_landed>best,
     err_bps:+((app_landed/correct-1)*1e4).toFixed(2)});}
}
/* ── 4. pro-rata fills + capacity ───────────────────────────────────────── */
{
 const ms=makers(0.15,'oracle',{...DEF,cap:95},0.60);const tot=ms.reduce((t,m)=>t+m.cap,0);
 out.prorata={tot,shares:ms.map(m=>({n:m.n,share:+(m.cap/tot).toFixed(6)})),
   sums:[1,3,17.5,60,200,201].map(Q=>({Q,sum:+ms.reduce((t,m)=>t+Q*(m.cap/tot),0).toFixed(10),fits:Q<=tot}))};
}
/* ── 5. mark independence from YOUR OWN Sbar (MANUAL mode) ──────────────── */
{
 out.selfmark=[];
 const pos=[{k:0.12,sz:3,side:1},{k:-0.10,sz:2,side:-1},{k:0.30,sz:1.5,side:1}];
 for(const sb of [0.05,0.30,0.60,0.95,1.00]){
  const P={...DEF,Sbar:sb,cap:95};
  const ms=makers(0.15,'manual',P,0.60);
  // the app's half-spreads: hFair from YOUR Gt, others = hFair*aggr  -> re-derived here
  const c=mk(P.Sbar,P.a,P.gam,P.kap);
  const cash=(Sx,K)=>c.CALL(K/Sx-1)*Sx, hS=S*2e-3;let gg=0,n=0;
  [0.85,0.95,1.0,1.05,1.15].forEach(mn=>{const K=mn*S;
    const d2=(cash(S+hS,K)-2*cash(S,K)+cash(S-hS,K))/(hS*hS);const v=Math.abs(d2*S);if(isFinite(v)){gg+=v;n++;}});
  const Gt=gg/n, bleed=0.5*Gt*0.60*0.60, hFair=(bleed/(0.30*365))*1e4;
  const hs=[hFair*1.25,hFair*1.10,hFair*1.45,hFair*1.22];
  const others=ms.slice(1), oh=hs.slice(1);
  const bookMid=(k,side)=>{const cs=others.map(m=>side>0?m.c.CALL(k):m.c.PUT(k));
    return 0.5*(Math.min(...cs.map((x,i)=>x*(1+oh[i]/1e4)))+Math.max(...cs.map((x,i)=>x*(1-oh[i]/1e4))));};
  let v=0;pos.forEach(p=>{v+=p.sz*bookMid(p.k,p.side)*S*p.side;});
  out.selfmark.push({sbar:sb,hFair:+hFair.toFixed(4),markedValue:+v.toFixed(2)});}
 const a=out.selfmark[0].markedValue,b=out.selfmark[out.selfmark.length-1].markedValue;
 out.selfmark_spread_pct=+((b/a-1)*100).toFixed(4);
}
console.log(JSON.stringify(out,null,1));
fs.writeFileSync('/home/user/Perp-Options-AMM/evidence/app_build33/ORACLE.json',JSON.stringify(out,null,1));
