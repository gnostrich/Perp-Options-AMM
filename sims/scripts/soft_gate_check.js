// Diagnosis: is the damage caused by GATING (a discontinuous in/out cut), rather
// than by the idea of filtering? Test a SOFT gate — same intent, tapered weights.
const fs=require('fs'),vm=require('vm');
const kern=/<script>([\s\S]*?)<\/script>/.exec(fs.readFileSync('app/index.html','utf8'))[1];
const ctx={console,Math}; vm.createContext(ctx);
vm.runInContext(kern.slice(kern.indexOf('function logGamma'),kern.indexOf('/* ─── params')),ctx);
vm.runInContext(`
const M=[{n:'A',w:0.30,c:mk(0.30,1.27,1.05,0)},
         {n:'B',w:0.25,c:mk(0.85,1.27,3.20,0)},
         {n:'C',w:0.25,c:mk(0.60,1.27,1.84,0)},
         {n:'D',w:0.20,c:mk(0.55,1.30,2.10,0)}];
const W=M.reduce((t,m)=>t+m.w,0); M.forEach(m=>m.w/=W);
const mid=k=>M.reduce((t,m)=>t+m.w*m.c.CALL(k),0);
// SOFT gate: an outlier is down-weighted smoothly instead of cut out.
function soft(b){ return k=>{
  const ref=mid(k); let num=0,den=0;
  M.forEach(m=>{const dev=(m.c.CALL(k)/ref-1)/b;
    const g=Math.exp(-dev*dev);        // taper, never a cliff
    num+=m.w*g*m.c.CALL(k); den+=m.w*g;});
  return den>0?num/den:null;};}
const d2=(f,k,h=2e-3)=>{const a=f(k-h),b2=f(k),c2=f(k+h);
  return (a===null||b2===null||c2===null)?null:(a-2*b2+c2)/(h*h);};
function scan(f){let worst=1e9,at=null,px=0,n=0;
  for(let k=0.05;k<=1.0;k+=2e-3){const v=f(k); if(v===null)continue; px+=v;n++;
    const d=d2(f,k); if(d!==null&&d<worst){worst=d;at=k;}}
  return {worst,at,avgPx:px/Math.max(n,1)};}
out=[];[1.0,0.50,0.30,0.20,0.12,0.08,0.05,0.03].forEach(b=>{const s=scan(soft(b));s.b=b;out.push(s);});
`,ctx);
console.log('SOFT GATE — same intent, tapered weights instead of an in/out cut\n');
console.log('  band b     worst 2nd diff    convex?    avg price');
ctx.out.forEach(s=>console.log('  ±'+(s.b*100).toFixed(0).padStart(3)+'%    '+s.worst.toExponential(2).padStart(12)
  +'     '+(s.worst>=-1e-9?'YES':'no ')+'      '+s.avgPx.toFixed(5)));
console.log('\n  (hard gate at the same bands: -2.3e+3 / -1.3e+3 / -1.7e+3 / -2.4e+3 — see /tmp/breaker.js)');
