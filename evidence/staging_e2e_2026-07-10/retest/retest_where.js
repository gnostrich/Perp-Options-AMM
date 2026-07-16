const fs=require('fs'),vm=require('vm');
function eng(f){const s=fs.readFileSync(f,'utf8');const m=/<script id="engine">([\s\S]*?)<\/script>/.exec(s);const ctx={Math,isFinite,console};vm.createContext(ctx);vm.runInContext(m[1]+'\n;this.__E=Engine;',ctx);return ctx.__E;}
const E=eng('builds/HEAD_temporal_mvp_v28_lens.html');
const d=JSON.parse(fs.readFileSync('/home/user/Perp-Options-AMM/evidence/staging_e2e_2026-07-10/retest/marks_g2.json','utf8'));
console.log('theta  | stg_put  ref_put   dP    | stg_call ref_call  dC   | note');
for(const mk of d.marks){
  const rp=E.markLensed('put',mk.theta,1,2), rc=E.markLensed('call',mk.theta,1,2);
  const dP=mk.put_mark-rp, dC=mk.call_mark-rc;
  const big=Math.abs(dP)>1e-3||Math.abs(dC)>1e-3;
  if(big||Math.abs(mk.theta-0.667)<0.04||Math.abs(mk.theta-1.5)<0.04||Math.abs(mk.theta-1)<0.03)
    console.log(`${mk.theta.toFixed(3)} | ${mk.put_mark.toFixed(4)} ${rp.toFixed(4)} ${dP>=0?'+':''}${dP.toFixed(4)} | ${mk.call_mark.toFixed(4)} ${rc.toFixed(4)} ${dC>=0?'+':''}${dC.toFixed(4)} | ${big?'*DIVERGES*':''}${Math.abs(mk.theta-0.667)<0.04?' put-seam':''}${Math.abs(mk.theta-1.5)<0.04?' call-seam':''}`);
}
// where does divergence start? put seam=0.667, call seam=1.5
console.log('\nput seam theta=g/(g+1)=',2/3,' call seam=(g+1)/g=',1.5);
