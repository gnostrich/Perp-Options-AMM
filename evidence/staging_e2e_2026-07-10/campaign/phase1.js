const fs=require('fs'),vm=require('vm');
function eng(f){const s=fs.readFileSync(f,'utf8');const m=/<script id="engine">([\s\S]*?)<\/script>/.exec(s);const ctx={Math,isFinite,console};vm.createContext(ctx);vm.runInContext(m[1]+'\n;this.__E=Engine;',ctx);return ctx.__E;}
const E=eng('builds/HEAD_temporal_mvp_v28_lens.html');
const d=JSON.parse(fs.readFileSync('/home/user/Perp-Options-AMM/evidence/staging_e2e_2026-07-10/campaign/marks_40.json','utf8'));
const g=d.gamma*d.m, sN=d.s_norm;
let maxC=0,maxP=0,worst=null, belowIntrinsic=0;
for(const mk of d.marks){
  const rc=E.markLensed('call',mk.theta,sN,g), rp=E.markLensed('put',mk.theta,sN,g);
  const dc=Math.abs(rc-mk.call_mark), dp=Math.abs(rp-mk.put_mark);
  if(dc>maxC){maxC=dc;} if(dp>maxP){maxP=dp; worst=mk.theta;}
  // value >= intrinsic (spot=1): call intrinsic max(0,1-theta*?)... at s_norm=1 spot=mode; put intrinsic max(0, theta-1)? check both marks >= max(0, payoff)
  const putIntr=Math.max(0, 1 - 1/mk.theta), callIntr=Math.max(0, 1 - mk.theta); // rough normalized
  if(mk.put_mark < putIntr-1e-9 || mk.call_mark < callIntr-1e-9) belowIntrinsic++;
}
console.log('PHASE 1 — marks sweep (40 strikes theta[0.5,1.5], g=%s, s_norm=%s):',g,sN);
console.log('  MAX |staging-reference markLensed|: call=%s put=%s (worst theta=%s)',maxC.toExponential(2),maxP.toExponential(2),worst);
console.log('  value>=intrinsic violations:',belowIntrinsic);
console.log('  theta coverage: [%s, %s] = +-50%% window only (ITM seams at g=1: put 0.5K@theta0.5 [edge], call 2K@theta2 [OUTSIDE window])',d.marks[0].theta,d.marks[d.marks.length-1].theta);
