const fs=require('fs'),vm=require('vm'),path=require('path');
function eng(f){const s=fs.readFileSync(f,'utf8');const m=/<script id="engine">([\s\S]*?)<\/script>/.exec(s);const ctx={Math,isFinite,console};vm.createContext(ctx);vm.runInContext(m[1]+'\n;this.__E=Engine;',ctx);return ctx.__E;}
const H3=eng('builds/HEAD_temporal_mvp_v28_lens.html');
const sb={x:10.00063009375,y:800050.4075,alpha:5.000315046875,beta:400025.20375};
const obs={x:9.97835488336705,y:801840.398312587,alpha:5.000315046875,beta:400025.20375,w:0.50111618};
// find dy that reproduces staging's y', at rho=1
const dy=obs.y-sb.y;
const p=H3.tradeUpdate({...sb}, dy);
console.log('REFERENCE tradeUpdate (=tradeUpdateAt rho=1) on staging pool, dy=',dy.toFixed(6));
console.log('  pred  x=%s y=%s alpha=%s beta=%s w=%s',p.x.toPrecision(12),p.y.toPrecision(12),p.alpha.toPrecision(12),p.beta.toPrecision(12),(p.alpha/p.x).toPrecision(12));
console.log('  stag  x=%s y=%s alpha=%s beta=%s w=%s',obs.x.toPrecision(12),obs.y.toPrecision(12),obs.alpha.toPrecision(12),obs.beta.toPrecision(12),obs.w);
console.log('  |Δx|=%s |Δw|=%s |Δalpha|=%s',Math.abs(p.x-obs.x).toExponential(2),Math.abs(p.alpha/p.x-obs.w).toExponential(2),Math.abs(p.alpha-obs.alpha).toExponential(2));
console.log('\nKEY: at rho=1 (spot) the reference law CONSERVES global alpha,beta (%s,%s unchanged).',p.alpha.toFixed(6),p.beta.toFixed(4));
console.log('The H3-DISTINGUISHING trade-point warp only MOVES global alpha,beta at rho != 1:');
for(const rho of [1,1.5,2,4]){const q=H3.tradeUpdateAt({...sb},dy,rho);console.log('  rho=%s -> alpha\'=%s (moves from 5.000315 iff rho!=1)  w\'=%s',rho,q.alpha.toFixed(6),(q.alpha/q.x).toFixed(8));}
