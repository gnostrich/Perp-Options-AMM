const fs=require('fs'),vm=require('vm');
function eng(f){const s=fs.readFileSync(f,'utf8');const m=/<script id="engine">([\s\S]*?)<\/script>/.exec(s);const ctx={Math,isFinite,console};vm.createContext(ctx);vm.runInContext(m[1]+'\n;this.__E=Engine;',ctx);return ctx.__E;}
const E=eng('builds/HEAD_temporal_mvp_v28_lens.html');
const d=JSON.parse(fs.readFileSync('/home/user/Perp-Options-AMM/evidence/staging_e2e_2026-07-10/retest/marks_g2.json','utf8'));
const g=d.gamma*d.m, sN=d.s_norm;
console.log('staging config: engine=%s gamma=%s m=%s g=%s | theta window [%s,%s] (%s pts)',d.engine,d.gamma,d.m,g,d.marks[0].theta.toFixed(3),d.marks[d.marks.length-1].theta.toFixed(3),d.marks.length);
let maxC=0,maxP=0,belowIntr=0;
for(const mk of d.marks){
  const rc=E.markLensed('call',mk.theta,sN,g), rp=E.markLensed('put',mk.theta,sN,g);
  maxC=Math.max(maxC,Math.abs(rc-mk.call_mark)); maxP=Math.max(maxP,Math.abs(rp-mk.put_mark));
}
console.log('\n=== marks vs reference markLensed at g=%s ===',g);
console.log('MAX |staging-reference|: call=%s put=%s',maxC.toExponential(2),maxP.toExponential(2));
// golden §1: ATM value 0.148 at g=2; find theta nearest 1
const atm=d.marks.reduce((a,b)=>Math.abs(b.theta-1)<Math.abs(a.theta-1)?b:a);
console.log('\n=== GOLDEN §1 (g=2): ATM value should be 0.148 ===');
console.log('staging nearest-ATM theta=%s: call=%s put=%s | reference markLensed(put,1,1,2)=%s (golden 0.148)',atm.theta.toFixed(4),atm.call_mark.toFixed(4),atm.put_mark.toFixed(4),E.markLensed('put',1,1,2).toFixed(4));
// seams: put seam theta=g/(g+1)=0.667 -> exercise line 0.667K; value there 1/(g+1)=0.333
console.log('\n=== seams: put exercise line theta=0.667 (=$66.67 at K$100), value 1/3 ===');
console.log('window covers theta=0.667?',d.marks[0].theta<=0.667,'| call seam theta=1.5:',d.marks[d.marks.length-1].theta>=1.5);
