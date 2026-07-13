const fs=require('fs'),vm=require('vm'),path=require('path');
function engineOf(src){const m=/<script id="engine">([\s\S]*?)<\/script>/.exec(src);const ctx={Math,isFinite,console};vm.createContext(ctx);vm.runInContext(m[1]+'\n;this.__E=Engine;',ctx);return ctx.__E;}
const E=engineOf(fs.readFileSync(path.join('builds','HEAD_temporal_mvp_v28_lens.html'),'utf8'));

console.log('=== REFERENCE trade-point law: does GLOBAL alpha,beta move? ===');
// toy exhibit
let p=E.tradeUpdateAt({x:10,y:10,alpha:5,beta:5},1,4);
console.log('toy (10,10,w.5) dy+1 rho4 ->', JSON.stringify({x:p.x,y:p.y,alpha:p.alpha,beta:p.beta,w:p.alpha/p.x}));
console.log('  w\'=',p.alpha/p.x,' (11/21=',11/21,')  global alpha:5 ->',p.alpha,' beta:5 ->',p.beta);

console.log('\n=== apply reference law to STAGING before-pool, single sell trade ===');
// staging before: x=10.00063009, y=800050.4075, w=0.5 => alpha=5.00031505 beta=400025.20375
const sb={x:10.00063009375,y:800050.4075,alpha:5.000315046875,beta:400025.20375};
// staging observed after a "sell" band: y increased by ~+1789.99 (cash in). Try rho=1 (spot) and rho at the sold strike.
for(const [dy,rho] of [[1789.990813,1],[1789.990813,1.08],[-1789.99,1]]){
  const q=E.tradeUpdateAt(sb,dy,rho);
  if(q) console.log(`dy=${dy} rho=${rho} -> x'=${q.x.toFixed(6)} y'=${q.y.toFixed(4)} alpha'=${q.alpha.toFixed(6)} beta'=${q.beta.toFixed(4)} w'=${(q.alpha/q.x).toFixed(8)}`);
}
console.log('\nSTAGING OBSERVED after: x=9.97835488 y=801840.398313 alpha=5.00031505 beta=400025.20375 w=0.50111618');
console.log('  => staging kept global alpha,beta CONSTANT.');
console.log('\n=== does REFERENCE keep global alpha,beta constant on a plain spot trade (rho=1)? ===');
const q1=E.tradeUpdate({x:10.00063009375,y:800050.4075,alpha:5.000315046875,beta:400025.20375}, 1789.99);
if(q1) console.log('tradeUpdate dy+1789.99 ->', JSON.stringify({x:q1.x,y:q1.y,alpha:q1.alpha,beta:q1.beta,w:q1.alpha/q1.x}));
