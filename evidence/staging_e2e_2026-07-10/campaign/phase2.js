const fs=require('fs'),vm=require('vm');
function eng(f){const s=fs.readFileSync(f,'utf8');const m=/<script id="engine">([\s\S]*?)<\/script>/.exec(s);const ctx={Math,isFinite,console};vm.createContext(ctx);vm.runInContext(m[1]+'\n;this.__E=Engine;',ctx);return ctx.__E;}
const E=eng('/tmp/testkit/temporal_staging_test_kit/builds/HEAD_temporal_mvp_v28_lens.html');
const lines=fs.readFileSync('battery.jsonl','utf8').trim().split('\n');
console.log('PHASE 2 — trade compositions, each pool transition vs reference engine:');
console.log('label                | msg            | Δx        Δw        | αconserved βconserved | ρ=1 match |Δx| | trade-pt(ρ≠1)?');
for(const ln of lines){
  let o; try{o=JSON.parse(ln);}catch(e){console.log('parse fail',ln.slice(0,60));continue;}
  const b=o.before, a=o.after, r=o.resp;
  if(!b||!a||b.x==null||a.x==null){console.log((o.label+'                ').slice(0,20),'| NO STATUS (resp msg:',r&&r.message,')');continue;}
  const dx=a.x-b.x, dw=a.w-b.w, dA=a.alpha-b.alpha, dB=a.beta-b.beta;
  // reference ρ=1 (spot) prediction from before + observed dy
  const dy=a.y-b.y;
  const p=E.tradeUpdate({x:b.x,y:b.y,alpha:b.alpha,beta:b.beta}, dy);
  const rho1=p?Math.abs(p.x-a.x):NaN;
  const aCons=Math.abs(dA)<1e-6, bCons=Math.abs(dB)<1e-6;
  console.log((o.label+'                    ').slice(0,20),'|',((r&&r.message)||'?').slice(0,14).padEnd(14),'|',dx.toExponential(2),dw.toExponential(2),'|',(''+aCons).padEnd(9),(''+bCons).padEnd(9),'|',(isFinite(rho1)?rho1.toExponential(1):'n/a').padEnd(8),'| αmoved='+(!aCons));
}
