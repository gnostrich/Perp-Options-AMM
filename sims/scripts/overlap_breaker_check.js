// Operator entry 602, tested as stated: makers post their OWN bid/ask; the breaker
// refuses any match that would create an overlap (someone's bid above someone's ask).
const fs=require('fs'),vm=require('vm');
const kern=/<script>([\s\S]*?)<\/script>/.exec(fs.readFileSync('app/index.html','utf8'))[1];
const ctx={console,Math}; vm.createContext(ctx);
vm.runInContext(kern.slice(kern.indexOf('function logGamma'),kern.indexOf('/* ─── params')),ctx);
vm.runInContext(`
const M=[{n:'A',w:.30,c:mk(0.30,1.27,1.05,0),h:19},
         {n:'B',w:.25,c:mk(0.85,1.27,3.20,0),h:16},
         {n:'C',w:.25,c:mk(0.60,1.27,1.84,0),h:22},
         {n:'D',w:.20,c:mk(0.55,1.30,2.10,0),h:18}];
const W=M.reduce((t,m)=>t+m.w,0); M.forEach(m=>m.w/=W);
const ask=k=>Math.min(...M.map(m=>m.c.CALL(k)*(1+m.h/1e4)));
const bid=k=>Math.max(...M.map(m=>m.c.CALL(k)*(1-m.h/1e4)));
const mid=k=>M.reduce((t,m)=>t+m.w*m.c.CALL(k),0);

// 1) how often does the book actually overlap, and by how much?
let n=0,cross=0,worst=0,atK=null,spr=0;
for(let k=0.05;k<=1.0;k+=2e-3){n++; const a=ask(k),b=bid(k);
  if(b>a){cross++; if(b-a>worst){worst=b-a;atK=k;}} else spr+=(a-b)/((a+b)/2)*1e4;}
out={n,cross,pctCross:cross/n*100,worstOverlap:worst,atK,avgSprUncrossed:spr/Math.max(n-cross,1)};

// 2) THE BREAKER, as stated: no match may execute inside an overlap.
//    Tradeable at k only when ask(k) >= bid(k). Price = the maker's own quote.
const tradeable=k=>ask(k)>=bid(k);
let tn=0; for(let k=0.05;k<=1.0;k+=2e-3) if(tradeable(k))tn++;
out.tradeablePct=tn/n*100;

// 3) does it also kill the BUTTERFLY arb (a different arb: 3 strikes, not 1)?
const d2=(f,k,h=2e-3)=>(f(k-h)-2*f(k)+f(k+h))/(h*h);
let wb=1e9,wbk=null,wbTradeable=null;
for(let k=0.05+2e-3;k<=1.0-2e-3;k+=2e-3){
  const v=d2(ask,k); if(v<wb){wb=v;wbk=k;wbTradeable=tradeable(k-2e-3)&&tradeable(k)&&tradeable(k+2e-3);}}
out.worstButterfly=wb; out.wbk=wbk; out.wbAllLegsTradeable=wbTradeable;
// count butterflies that are negative AND fully executable under the breaker
let bad=0,badTot=0;
for(let k=0.05+2e-3;k<=1.0-2e-3;k+=2e-3){const v=d2(ask,k);
  if(v<-1e-9){badTot++; if(tradeable(k-2e-3)&&tradeable(k)&&tradeable(k+2e-3))bad++;}}
out.negButterflies=badTot; out.negButterfliesStillExecutable=bad;
`,ctx);
const o=ctx.out;
console.log('THE BREAKER AS STATED — makers post their own bid/ask, no match inside an overlap\n');
console.log('1) DOES THE BOOK OVERLAP AT ALL?');
console.log('   strikes scanned            ',o.n);
console.log('   strikes where bid > ask    ',o.cross,'  ('+o.pctCross.toFixed(1)+'%)');
console.log('   worst overlap              ',o.worstOverlap.toFixed(6),o.atK?'at k='+o.atK.toFixed(3):'');
console.log('   natural spread where uncrossed', o.avgSprUncrossed.toFixed(1),'bps  <- each makers own, not imposed');
console.log('\n2) THE BREAKER');
console.log('   tradeable strikes          ',o.tradeablePct.toFixed(1)+'%   (it only blocks where there IS an overlap)');
console.log('\n3) DOES IT ALSO STOP THE BUTTERFLY ARB? (3 strikes, not 1)');
console.log('   worst 2nd difference       ',o.worstButterfly.toExponential(2),'at k='+o.wbk.toFixed(3));
console.log('   all three legs tradeable?  ',o.wbAllLegsTradeable);
console.log('   negative butterflies       ',o.negButterflies);
console.log('   ...still fully executable  ',o.negButterfliesStillExecutable,
  '  ('+(o.negButterflies?(o.negButterfliesStillExecutable/o.negButterflies*100).toFixed(0):0)+'%)');
