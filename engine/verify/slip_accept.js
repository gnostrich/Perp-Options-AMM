'use strict';
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('temporal_mvp_v26a_2c0337e8.html','utf8');
const re=/<script\b([^>]*)>([\s\S]*?)<\/script>/g;let m,eng;
while((m=re.exec(html)))if(/id="engine"/.test(m[1]))eng=m[2];
const E=vm.runInNewContext('(function(){'+eng+'\n;return Engine;})()',{Math,Map,Float64Array,Number,Object,Array,isFinite,isNaN,JSON,console});
const gh=E.ghCalibrate(5,400000,80000,2);const s0=Object.assign({},gh,{alpha:5,beta:400000,x:10,y:800000});
console.log('Corrected-slippage acceptance targets (γ=2, mpGeom=getMP_raw*e^-ghMu):');
for(const X of [1.02,1.2,2,6]){const p=E.arbitrageToOracle(s0,80000*X);
  const dY=Math.abs(p.y-s0.y),dX=Math.abs(p.x-s0.x),mg=E.getMP_raw(s0)*Math.exp(-s0.ghMu);
  console.log(`  x${X}: %=${(Math.abs(dY/(mg*dX)-1)*100).toFixed(2)}  $=${Math.abs(dY-mg*dX).toFixed(2)}`);}
