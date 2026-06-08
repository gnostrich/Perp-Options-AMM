'use strict';
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('temporal_mvp_v25_gh.html','utf8');
const re=/<script\b([^>]*)>([\s\S]*?)<\/script>/g;let m,eng;
while((m=re.exec(html)))if(/id="engine"/.test(m[1]))eng=m[2];
const E=vm.runInNewContext('(function(){'+eng+'\n;return Engine;})()',{Math,Map,Float64Array,Number,Object,Array,isFinite,isNaN,JSON,console});
function open(g){const gh=E.ghCalibrate(5,400000,80000,g);return Object.assign({},gh,{alpha:5,beta:400000,x:10,y:800000});}
const K=80000;                       // strike = open price -> theta = sNorm(K) = 1
const sN=(s0,S)=>E.getSNorm(E.arbitrageToOracle(s0,S));

console.log("Option (b): continuation = c*sNorm (the GH curve), paste onto intrinsic (1-S/K) at a smooth-pasting boundary.\n");
console.log("gamma | boundary sNorm* | boundary S*/K | fraction@bdry | value match | slope match");
for(const g of [1.5,2,3,4]){
  const s0=open(g);
  const sNstar=Math.pow((g+1)/g, g);   // closed form: theta*((g+1)/g)^g, theta=1
  const Sstar = K*g/(g+1);             // closed form: K*g/(g+1)
  const c = 1/((g+1)*sNstar);          // from value-match at boundary
  // engine-measured paste at S*:
  const h=1e-3*K;
  const markC = c*sN(s0,Sstar);                       // continuation value at boundary
  const markS = 1 - Sstar/K;                          // intrinsic at boundary = 1/(g+1)
  const dC = c*(sN(s0,Sstar+h)-sN(s0,Sstar-h))/(2*h); // d(continuation)/dS
  const dS = -1/K;                                    // d(intrinsic)/dS
  console.log(`${g.toFixed(1).padStart(5)} | ${sNstar.toFixed(4).padStart(15)} | ${(Sstar/K).toFixed(4).padStart(13)} | ${markS.toFixed(4).padStart(13)} | ${markC.toFixed(6)} vs ${markS.toFixed(6)} (${(Math.abs(markC/markS-1)*100).toFixed(3)}%) | ${dC.toExponential(3)} vs ${dS.toExponential(3)} (${(Math.abs(dC/dS-1)*100).toFixed(3)}%)`);
}
console.log("\nSo: exercise switch sits at sNorm* = ((g+1)/g)^g (PAST the strike, theta=1), not at the strike.");
console.log("At the boundary the fraction is 1/(g+1); it reaches 1 only at full exercise. Both value and slope match.");
