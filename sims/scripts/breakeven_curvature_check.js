const fs=require('fs'),vm=require('vm');
const js=/<script>([\s\S]*?)<\/script>/.exec(fs.readFileSync('app/index.html','utf8'))[1];
const el=()=>({style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',value:'0',
  querySelector:()=>el(),querySelectorAll:()=>[],appendChild(){},addEventListener(){},
  getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})}),width:900,height:300,
  getBoundingClientRect:()=>({left:0,top:0,width:900,height:300})});
const doc={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener(){},body:el()};
const ctx={document:doc,window:{addEventListener(){},devicePixelRatio:1},console,requestAnimationFrame:f=>f(),setTimeout,Math,JSON,Intl,out:{}};
ctx.window.document=doc; vm.createContext(ctx); vm.runInContext(js,ctx);
vm.runInContext(`
const S2=65695.5, c=mk(0.60,1.2705,1.8413,0);
// NOTIONAL-basis curvature: cash value C(S)=V(K/S-1)*S ; Gt = d2C/dS2 * S  (per $1 notional)
const cash=(Sx,K)=>c.CALL(K/Sx-1)*Sx, hS=S2*2e-3;
const g1=(K)=>{const d2=(cash(S2+hS,K)-2*cash(S2,K)+cash(S2-hS,K))/(hS*hS);return Math.abs(d2*S2);};
out.five=[0.85,0.95,1.0,1.05,1.15].map(m=>[m,g1(m*S2)]);
out.appG=out.five.reduce((s,r)=>s+r[1],0)/out.five.length;
// wider chain, same estimator
const wide=[];for(let m=0.6;m<=1.6;m+=0.05)wide.push([m,g1(m*S2)]);
out.wideG=wide.reduce((s,r)=>s+r[1],0)/wide.length;
out.wideMax=Math.max(...wide.map(r=>r[1]));
out.wide=wide.filter((r,i)=>i%4===0);
`,ctx);
const o=ctx.out;
const be=(G,RV,turn)=>0.5*G*RV*RV/(turn*365)*1e4;
console.log('NOTIONAL-basis curvature G~ = |d2C/dS2|*S , C(S)=V(K/S-1)*S\n');
console.log('  moneyness   G~');
o.five.forEach(r=>console.log('   '+r[0].toFixed(2)+'      '+r[1].toFixed(3)));
console.log('\n  app estimator (5 pts, 0.85-1.15)  mean G~ =',o.appG.toFixed(3));
console.log('  wider chain  (0.60-1.60, 21 pts)  mean G~ =',o.wideG.toFixed(3),' max =',o.wideMax.toFixed(3));
console.log('\nBREAK-EVEN HALF-SPREAD  = 0.5*G~*RV^2 / (turnover*365)   [bps of notional]');
console.log('  G~      RV=40%   RV=60%   RV=90%     (turnover 0.30x/day)');
[o.appG,o.wideG,5.47].forEach(G=>console.log('  '+G.toFixed(2).padStart(5),
  ' ',be(G,0.4,0.3).toFixed(1).padStart(6),' ',be(G,0.6,0.3).toFixed(1).padStart(6),' ',be(G,0.9,0.3).toFixed(1).padStart(6)));
console.log('\n  (5.47 = the per-strike mean recorded in the BURR2 workbook, entry 535)');
