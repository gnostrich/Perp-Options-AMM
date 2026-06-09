'use strict';
const fs=require('fs'),vm=require('vm');
function eng(p){const h=fs.readFileSync(p,'utf8');const re=/<script\b([^>]*)>([\s\S]*?)<\/script>/g;let m,e;while((m=re.exec(h)))if(/id="engine"/.test(m[1]))e=m[2];return vm.runInNewContext('(function(){'+e+'\n;return Engine;})()',{Math,Map,Float64Array,Number,Object,Array,isFinite,isNaN,JSON,console});}
const E=eng('reference/temporal_curve_playground.html');
// elasticity d ln y / d ln x along the GH curve at (gamma,delta,betah)
function elast(g,delta,betah){
  const gh=E.ghCalibrate(5,400000,80000,g,delta,betah);
  const s=Object.assign({},gh,{alpha:5,beta:400000,x:10,y:800000});
  const pts=[];
  for(const o of [50000,65000,80000,100000,130000]){const st=E.arbitrageToOracle(s,o);if(st&&st.x>0&&st.y>0)pts.push([st.x,st.y]);}
  const es=[];
  for(let i=1;i<pts.length;i++){es.push((Math.log(pts[i][1])-Math.log(pts[i-1][1]))/(Math.log(pts[i][0])-Math.log(pts[i-1][0])));}
  return es;
}
console.log("TEST A — does GH elasticity (d ln y/d ln x) = Balancer's -w/(1-w) = -gamma?");
console.log("gamma | w=g/(g+1) | Balancer(-gamma) | GH elasticity @δ=0.08,βh=1 (engine) | @δ=30,βh=0 (Bal-limit)");
for(const g of [1.2,1.5,2,3,4]){
  const w=g/(g+1);
  const eEng=elast(g,0.08,1), eBal=elast(g,30,0);
  const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
  console.log(`  ${g.toFixed(1)}  |  ${w.toFixed(3)}  |  ${(-g).toFixed(3)}  |  ${avg(eEng).toFixed(3)} (spread ${(Math.max(...eEng)-Math.min(...eEng)).toExponential(1)})  |  ${avg(eBal).toFixed(3)} (spread ${(Math.max(...eBal)-Math.min(...eBal)).toExponential(1)})`);
}
