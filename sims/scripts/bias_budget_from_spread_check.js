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
// TWO CURVE SETS: every maker publishes an ask curve C(1+h) and a bid curve C(1-h).
// Book: ask = min over ask curves, bid = max over bid curves. So the spread is not a
// separate mechanism - it falls out of the aggregation. Question: how much BIAS can a
// maker carry before its own bid crosses someone else's ask?
ORC.mode='oracle'; ORC.iv=0.60;
const oracleSbar=sbarFromVol(0.60,DEF.a,DEF.gam,DEF.kap);
const cO=mk(oracleSbar,DEF.a,DEF.gam,DEF.kap);
function crossed(bias,hYou,hOth){
 const sb=sbarFromVol(0.60*(1+bias),DEF.a,DEF.gam,DEF.kap), cY=mk(sb,DEF.a,DEF.gam,DEF.kap);
 for(let k=-0.6;k<=0.6;k+=0.01){
  const yAsk=cY.CALL(k)*(1+hYou/1e4), yBid=cY.CALL(k)*(1-hYou/1e4);
  const oAsk=cO.CALL(k)*(1+hOth/1e4), oBid=cO.CALL(k)*(1-hOth/1e4);
  if(yBid>oAsk||oBid>yAsk) return true;
 }
 return false;}
function maxSafeBias(hYou,hOth){let lo=0,hi=0.5;
 for(let i=0;i<60;i++){const m=(lo+hi)/2; if(crossed(m,hYou,hOth))hi=m;else lo=m;}
 return lo;}
out.rows=[[5,5],[10,10],[19,19],[19,16],[30,30],[50,50],[100,100]].map(p=>
  [p[0],p[1],maxSafeBias(p[0],p[1]),(p[0]+p[1])/1e4]);
// and the aggregation claim: is the book spread <= every individual spread?
const mk2=(b,h)=>({c:mk(sbarFromVol(0.60*(1+b),DEF.a,DEF.gam,DEF.kap),DEF.a,DEF.gam,DEF.kap),h});
const set=[mk2(0,19),mk2(0.002,16),mk2(-0.001,22),mk2(0.0005,18)];
out.tight=[-0.3,0,0.3].map(k=>{
 const ask=Math.min(...set.map(m=>m.c.CALL(k)*(1+m.h/1e4)));
 const bid=Math.max(...set.map(m=>m.c.CALL(k)*(1-m.h/1e4)));
 const bookBps=(ask-bid)/((ask+bid)/2)*1e4;
 const indiv=set.map(m=>2*m.h);
 return [k,bookBps,Math.min(...indiv)];});
`,ctx);
const o=ctx.out;
console.log('HOW MUCH BIAS DOES YOUR SPREAD BUY YOU?  (two curve sets, oracle at 60% vol)\n');
console.log('  your h   others h   max safe bias    h_you+h_oth   ratio');
o.rows.forEach(r=>console.log('   '+String(r[0]).padStart(4)+'bp   '+String(r[1]).padStart(5)+'bp     '
  +(r[2]*100).toFixed(3)+'% vol      '+(r[3]*100).toFixed(2)+'%     '+(r[2]/r[3]).toFixed(2)));
console.log('\n  => the safe-bias budget IS the summed half-spread. Not a coincidence:');
console.log('     premium is ~linear in vol under the map, so you cross when bias > h_you + h_oth.\n');
console.log('AGGREGATION: is the book spread tighter than any single maker?');
console.log('   strike     book spread     tightest individual');
o.tight.forEach(r=>console.log('    '+(r[0]*100).toFixed(0).padStart(4)+'%      '+r[1].toFixed(2).padStart(8)+' bps      '+r[2].toFixed(2).padStart(8)+' bps'));
console.log('\n  build-25 bias slider range: +/-30%  =  ',(0.30/o.rows[2][3]).toFixed(0)+'x the safe budget at 19bp spreads');
