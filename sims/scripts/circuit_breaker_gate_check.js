// Operator entry 601: price at each maker's OWN quote; the aggregate only GATES.
// Question: does a permissibility band restore the convexity the raw envelope loses?
const fs=require('fs'),vm=require('vm');
const kern=/<script>([\s\S]*?)<\/script>/.exec(fs.readFileSync('app/index.html','utf8'))[1];
const ctx={console,Math}; vm.createContext(ctx);
vm.runInContext(kern.slice(kern.indexOf('function logGamma'),kern.indexOf('/* ─── params')),ctx);
vm.runInContext(`
// four makers, deliberately including two that cross (cheap+fat vs rich+thin)
const M=[{n:'A',w:0.30,c:mk(0.30,1.27,1.05,0)},
         {n:'B',w:0.25,c:mk(0.85,1.27,3.20,0)},
         {n:'C',w:0.25,c:mk(0.60,1.27,1.84,0)},
         {n:'D',w:0.20,c:mk(0.55,1.30,2.10,0)}];
const W=M.reduce((t,m)=>t+m.w,0); M.forEach(m=>m.w/=W);
const mid=k=>M.reduce((t,m)=>t+m.w*m.c.CALL(k),0);

// permissible = within band b of the aggregate. Price = BEST permissible quote.
function gated(b){
  return k=>{
    const ref=mid(k);
    const ok=M.filter(m=>Math.abs(m.c.CALL(k)/ref-1)<=b);
    if(!ok.length) return null;                       // breaker trips: no match
    return Math.min(...ok.map(m=>m.c.CALL(k)));
  };
}
const raw=k=>Math.min(...M.map(m=>m.c.CALL(k)));

const d2=(f,k,h=2e-3)=>{const a=f(k-h),b2=f(k),c2=f(k+h);
  return (a===null||b2===null||c2===null)?null:(a-2*b2+c2)/(h*h);};
function scan(f){let worst=1e9,at=null,trips=0,n=0,sumPx=0,px=0;
  for(let k=0.05;k<=1.0;k+=2e-3){n++;
    const v=f(k); if(v===null){trips++;continue;} sumPx+=v; px++;
    const d=d2(f,k); if(d!==null&&d<worst){worst=d;at=k;}}
  return {worst,at,tripPct:trips/n*100,avgPx:sumPx/Math.max(px,1)};}

out={raw:scan(raw), mixture:scan(mid), bands:[]};
[0.50,0.30,0.20,0.12,0.08,0.05,0.03,0.02].forEach(b=>{
  const s=scan(gated(b)); s.b=b; out.bands.push(s);});
`,ctx);
const o=ctx.out, e=x=>(x===null?'  n/a  ':x.toExponential(2));
console.log('CIRCUIT-BREAKER GATE — price at the best PERMISSIBLE maker quote\n');
console.log('  design                         worst 2nd diff    breaker trips   avg price');
console.log('  raw envelope (no gate)         '+e(o.raw.worst).padStart(10)+'         '+o.raw.tripPct.toFixed(1)+'%        '+o.raw.avgPx.toFixed(5));
console.log('  aggregate mixture (shipped)    '+e(o.mixture.worst).padStart(10)+'         '+o.mixture.tripPct.toFixed(1)+'%        '+o.mixture.avgPx.toFixed(5));
console.log('');
console.log('  band b   worst 2nd diff   convex?   trips     avg price   vs raw envelope');
o.bands.forEach(s=>{
  const conv=s.worst>=-1e-9;
  console.log('  ±'+(s.b*100).toFixed(0).padStart(3)+'%   '+e(s.worst).padStart(12)+'    '+(conv?'YES':'no ')
    +'      '+s.tripPct.toFixed(1).padStart(5)+'%   '+s.avgPx.toFixed(5)+'   '
    +((s.avgPx/o.raw.avgPx-1)*1e4).toFixed(0).padStart(6)+' bps');
});
