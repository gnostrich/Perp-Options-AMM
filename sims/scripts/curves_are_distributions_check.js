// Is the operator right that "the curves are actually distributions"?
// Test: C(k) = E[(S_T/S - (1+k))+]  =>  dC/dk = -(1-F(1+k)),  d2C/dk2 = f(1+k) >= 0, integrates to 1.
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
const c=mk(0.60,1.2705,1.8413,0.0);
const h=1e-4;
const d2=k=>(c.CALL(k+h)-2*c.CALL(k)+c.CALL(k-h))/(h*h);
const d1=k=>(c.CALL(k+h)-c.CALL(k-h))/(2*h);
// (1) density non-negative + total mass
let mass=0,minf=1e9,mink=null; const dk=2e-3;
for(let k=-0.999+dk;k<12;k+=dk){const f=d2(k); if(f<minf){minf=f;mink=k;} mass+=f*dk;}
out.mass=mass; out.minf=minf; out.mink=mink;
// (2) slope = -(survival prob)
out.slope=[-0.5,-0.2,0,0.2,0.5,1.0].map(k=>[k,d1(k),1+d1(k)]);
// (3) the SAME test on the RFQ ENVELOPE (min of two distinct makers) -> negative density?
const A=mk(0.30,1.27,1.05,0.0), Bq=mk(0.85,1.27,3.20,0.0);
const env=k=>Math.min(A.CALL(k),Bq.CALL(k));
const e2=k=>(env(k+h)-2*env(k)+env(k-h))/(h*h);
let emin=1e9,ek=null; for(let k=0.30;k<0.65;k+=2e-4){const f=e2(k); if(f<emin){emin=f;ek=k;}}
out.env=[emin,ek];
// aggregate mass of the envelope (does it still integrate to 1?)
let em=0; for(let k=-0.999+dk;k<12;k+=dk) em+=e2(k)*dk; out.envmass=em;
`,ctx);
const o=ctx.out;
console.log('SINGLE MAKER CURVE  C(k), Burr-2 (S=0.60, a=1.2705, g=1.8413, kap=0)');
console.log('  total mass  ∫ d²C/dk² dk        =',o.mass.toFixed(6),'   (a probability density integrates to 1)');
console.log('  min density  min d²C/dk²        =',o.minf.toExponential(3),'at k =',o.mink.toFixed(3),'  (>=0 required)');
console.log('  slope test   dC/dk = -(1-F):');
o.slope.forEach(r=>console.log('     k='+r[0].toFixed(2).padStart(5),'  dC/dk =',r[1].toFixed(6),'  => F(1+k) =',r[2].toFixed(6)));
console.log('\nRFQ ENVELOPE  min(A,B) of two DISTINCT makers');
console.log('  min density  min d²/dk²         =',o.env[0].toExponential(3),'at k =',o.env[1].toFixed(4));
console.log('  total mass                      =',o.envmass.toFixed(6));
