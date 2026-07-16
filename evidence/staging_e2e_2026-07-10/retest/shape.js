const fs=require('fs'),vm=require('vm');
function eng(f){const s=fs.readFileSync(f,'utf8');const m=/<script id="engine">([\s\S]*?)<\/script>/.exec(s);const ctx={Math,isFinite,console};vm.createContext(ctx);vm.runInContext(m[1]+'\n;this.__E=Engine;',ctx);return ctx.__E;}
const E=eng('builds/HEAD_temporal_mvp_v28_lens.html');
const d=JSON.parse(fs.readFileSync('/home/user/Perp-Options-AMM/evidence/staging_e2e_2026-07-10/retest/marks_g2.json','utf8'));
console.log('staging reports g_loc per strike:', [...new Set(d.marks.map(m=>m.g_loc))]);
const Vatm=0.148148148; // markLensed ATM at g=2
console.log('\nHypothesis A: staging put = Vatm·θ^1 (LINEAR, wrong)   vs  ref put = Vatm·θ^2 (power, correct)');
console.log('theta | stg_put | Vatm·θ^1 | Vatm·θ^2 | ref markLensed(put,θ,1,2)');
for(const mk of d.marks.filter((_,i)=>i%8===0)){
  const th=mk.theta;
  console.log(`${th.toFixed(3)} | ${mk.put_mark.toFixed(4)} | ${(Vatm*th).toFixed(4)} | ${(Vatm*th*th).toFixed(4)} | ${E.markLensed('put',th,1,2).toFixed(4)}`);
}
// quantify: is staging put == Vatm*theta to high precision?
let maxLin=0; for(const mk of d.marks){maxLin=Math.max(maxLin,Math.abs(mk.put_mark-Vatm*mk.theta));}
console.log('\nMAX |staging_put - Vatm·θ| =',maxLin.toExponential(2),'(if ~0, staging is LINEAR in θ, i.e. wing exponent=1 NOT g=2)');
