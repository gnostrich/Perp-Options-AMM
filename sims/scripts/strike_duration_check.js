const fs=require('fs'),vm=require('vm');
const js=/<script>([\s\S]*?)<\/script>/.exec(fs.readFileSync('app/index.html','utf8'))[1];
const el=()=>({style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',value:'0',dataset:{},
  querySelector:()=>el(),querySelectorAll:()=>[],appendChild(){},addEventListener(){},
  getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})}),width:900,height:300,
  getBoundingClientRect:()=>({left:0,top:0,width:900,height:300})});
const doc={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener(){},body:el()};
const ctx={document:doc,window:{addEventListener(){},devicePixelRatio:1},console,requestAnimationFrame:f=>f(),setTimeout,Math,JSON,Intl,out:{}};
ctx.window.document=doc; vm.createContext(ctx); vm.runInContext(js,ctx);
vm.runInContext(`
const c=mk(0.60,1.2705,1.8413,0), h=1e-4;
const D=k=>-(c.CALL(k+h)-c.CALL(k-h))/(2*h);      // dV/dk ; sign so long-call has +ve weight
// a sample LP book: accruals across strikes
const book=[{k:-0.30,q:4},{k:-0.10,q:9},{k:0.05,q:12},{k:0.12,q:7},{k:0.30,q:5},{k:0.50,q:3}];
let W=0,sK=0,sV=0,sVK=0;
const rows=book.map(p=>{const d=Math.abs(D(p.k)), w=d*p.q, v=c.CALL(p.k)*p.q;
 W+=w; sK+=w*p.k; sV+=v; sVK+=v*p.k; return [p.k,p.q,d,w,v];});
const KD=sK/W, KV=sVK/sV;
let disp=0; rows.forEach(r=>{disp+=(r[3]/W)*Math.pow(r[0]-KD,2);});
out.rows=rows.map(r=>[...r,r[3]/W*100]);
out.KD=KD; out.KV=KV; out.disp=Math.sqrt(disp); out.W=W; out.V=sV;
// sensitivity reading: does KD predict where value moves as S shifts?
const shift=0.01;
const before=book.reduce((t,p)=>t+c.CALL(p.k)*p.q,0);
const after =book.reduce((t,p)=>t+c.CALL(p.k+shift)*p.q,0);
out.dV=(after-before), out.pred=-W*shift;
`,ctx);
const o=ctx.out;
console.log('STRIKE DURATION on a sample LP book (Δ·q weights)\n');
console.log('    k      size    |Δ|      Δ·q      value     weight');
o.rows.forEach(r=>console.log('  '+r[0].toFixed(2).padStart(5)+'   '+r[1].toFixed(0).padStart(5)+'   '
 +r[2].toFixed(3)+'   '+r[3].toFixed(3).padStart(6)+'   '+r[4].toFixed(3).padStart(7)+'   '+r[5].toFixed(1).padStart(5)+'%'));
console.log('\n  strike duration  K_D = Σ w_i k_i        =',(o.KD*100).toFixed(2)+'%   (Δ·q-weighted)');
console.log('  value-weighted alternative                =',(o.KV*100).toFixed(2)+'%');
console.log('  strike dispersion sqrt(Σ w_i (k_i-K_D)²)  =',(o.disp*100).toFixed(2)+'%   (the convexity analogue)');
console.log('  total exposure   Σ Δ·q                    =',o.W.toFixed(3),'₿-perp');
console.log('\n  DOES IT BEHAVE LIKE DURATION? shift every strike by +1%:');
console.log('    actual ΔV      =',o.dV.toFixed(5));
console.log('    predicted -Σ Δ·q · shift =',o.pred.toFixed(5));
console.log('    first-order error        =',Math.abs(o.dV-o.pred).toExponential(2),
  '  (',(Math.abs(o.dV-o.pred)/Math.abs(o.pred)*100).toFixed(2)+'% )');
