'use strict';
const fs=require('fs'),vm=require('vm');
function eng(path){const h=fs.readFileSync(path,'utf8');const re=/<script\b([^>]*)>([\s\S]*?)<\/script>/g;let m,e;while((m=re.exec(h)))if(/id="engine"/.test(m[1]))e=m[2];return vm.runInNewContext('(function(){'+e+'\n;return Engine;})()',{Math,Map,Float64Array,Number,Object,Array,isFinite,isNaN,JSON,console});}
function expAt(E, s0){
  // sweep oracle, collect (sNorm, mp), fit d ln(mp)/d ln(sNorm) between adjacent points
  const out=[];
  for(const o of [40000,60000,80000,120000,160000]){
    const s=E.arbitrageToOracle(s0,o); if(!s||s.x<=0||s.y<=0) continue;
    out.push([E.getSNorm(s), E.getMP_raw(s)]);
  }
  const slopes=[];
  for(let i=1;i<out.length;i++){
    const [sn0,mp0]=out[i-1],[sn1,mp1]=out[i];
    slopes.push((Math.log(mp1)-Math.log(mp0))/(Math.log(sn1)-Math.log(sn0)));
  }
  return slopes;
}
const V=eng('reference/v24_balancer_stable.html');
const v24pool={x:10,y:800000,alpha:5,beta:400000};
console.log('v24 (Balancer): d ln(mp)/d ln(sNorm) across states =', expAt(V,v24pool).map(x=>x.toFixed(4)).join(', '));
console.log('  (research-lead claim: constant -2  => value∝S^(-1), γ=1)');

const P=eng('reference/temporal_curve_playground.html');
for(const g of [1.5,2,3]){
  const gh=P.ghCalibrate(5,400000,80000,g); const s0=Object.assign({},gh,{alpha:5,beta:400000,x:10,y:800000});
  console.log(`GH γ=${g}: d ln(mp)/d ln(sNorm) =`, expAt(P,s0).map(x=>x.toFixed(4)).join(', '), `  (claim: -(γ+1) = ${-(g+1)})`);
}
