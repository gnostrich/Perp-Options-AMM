const fs=require('fs'),vm=require('vm');
function eng(f){const s=fs.readFileSync(f,'utf8');const m=/<script id="engine">([\s\S]*?)<\/script>/.exec(s);const ctx={Math,isFinite,console};vm.createContext(ctx);vm.runInContext(m[1]+'\n;this.__E=Engine;',ctx);return ctx.__E;}
const E=eng('builds/HEAD_temporal_mvp_v28_lens.html');
const d=JSON.parse(fs.readFileSync('/home/user/Perp-Options-AMM/evidence/staging_e2e_2026-07-10/run6_api/marks_grid.json','utf8'));
let maxd=0;
console.log('staging /api/amm/marks  vs  reference markLensed(wing,theta,1,g=1):');
for(const mk of d.marks){
  const rc=E.markLensed('call',mk.theta,1,1), rp=E.markLensed('put',mk.theta,1,1);
  const dc=Math.abs(rc-mk.call_mark), dp=Math.abs(rp-mk.put_mark); maxd=Math.max(maxd,dc,dp);
}
console.log('MAX |staging - reference markLensed(g=1)| over 8 strikes =', maxd.toExponential(3));
// Now the golden gamma=2 check on the REFERENCE (what staging WOULD show if configured gamma=2)
console.log('\n=== golden gamma=2 (g=2) reference values (what staging at gamma=2 should give) ===');
console.log('ATM put value g=2:', E.markLensed('put',1,1,2).toFixed(4), '(golden 0.148)');
console.log('put @ theta for seam... put seam K*g/(g+1)=0.667 => theta=0.667 value:', E.markLensed('put',0.6667,1,2).toFixed(4),'(golden seam value 1/3=0.333)');
console.log('\n=== staging is gamma=1: its ATM value ===');
console.log('staging ATM (g=1) closed form 0.25; ref markLensed put@theta1,g1=', E.markLensed('put',1,1,1).toFixed(4));
