'use strict';
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('temporal_mvp_v26a.html','utf8');
const re=/<script\b([^>]*)>([\s\S]*?)<\/script>/g;let m,eng;
while((m=re.exec(html)))if(/id="engine"/.test(m[1]))eng=m[2];
const E=vm.runInNewContext('(function(){'+eng+'\n;return Engine;})()',{Math,Map,Float64Array,Number,Object,Array,isFinite,isNaN,JSON,console});
function open(g){const gh=E.ghCalibrate(5,400000,80000,g);return Object.assign({},gh,{alpha:5,beta:400000,x:10,y:800000});}

console.log("Q: is getMP_raw the geometric slope |dy/dx|, or e^mu * |dy/dx| ?\n");
for(const g of [1.5,2,3,4]){
  const s0=open(g);
  // arb to a few prices, then MEASURE the actual execution slope dy/dx via a tiny tradeUpdate
  for(const S of [1.0, 1.7]){
    const s=E.arbitrageToOracle(s0, 80000*S);
    const mp=E.getMP_raw(s);
    // tiny trade: measure |dy/dx| numerically (central difference)
    const dy=Math.abs(s.y)*1e-6;
    const sp=E.tradeUpdate(s, dy), sm=E.tradeUpdate(s, -dy);
    const slope=Math.abs((sp.y - sm.y)/(sp.x - sm.x));   // |Δy/Δx| geometric
    const emu=Math.exp(s.ghMu);
    console.log(`g=${g} S=${S}: getMP_raw=${mp.toFixed(3)}  |dy/dx|=${slope.toFixed(3)}  ratio getMP_raw/(dy/dx)=${(mp/slope).toFixed(4)}  e^ghMu=${emu.toFixed(4)}  (ghMu=${s.ghMu.toFixed(4)})`);
  }
}
console.log("\nIf ratio == e^ghMu -> getMP_raw = e^mu*|dy/dx| (escalation correct, getMP_raw is a price coordinate not the slope).");
console.log("If ratio == 1      -> getMP_raw IS the slope (escalation wrong).");
