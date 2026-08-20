const fs=require('fs'),vm=require('vm');
const kern=/<script>([\s\S]*?)<\/script>/.exec(fs.readFileSync('app/index.html','utf8'))[1];
const ctx={console,Math}; vm.createContext(ctx);
vm.runInContext(kern.slice(kern.indexOf('function logGamma'),kern.indexOf('/* ─── params')),ctx);
vm.runInContext(`
const A=mk(0.30,1.27,1.05,0), B=mk(0.85,1.27,3.20,0);   // makers that genuinely cross
const w=0.5;
const mix=k=>w*A.CALL(k)+(1-w)*B.CALL(k);
const env=k=>Math.min(A.CALL(k),B.CALL(k));
const d2=(f,k,h=2e-3)=>(f(k-h)-2*f(k)+f(k+h))/(h*h);
function worst(f){let m=1e9,at=null;for(let k=0.05;k<=1.0;k+=2e-3){const v=d2(f,k);if(v<m){m=v;at=k;}}return [m,at];}
out={};
out.A=worst(k=>A.CALL(k)); out.B=worst(k=>B.CALL(k));
out.mix=worst(mix); out.env=worst(env);
// lower CONVEX ENVELOPE of the min, by a monotone-slope sweep on a grid
const ks=[],ys=[]; for(let k=0.05;k<=1.0;k+=2e-3){ks.push(k);ys.push(env(k));}
const hull=[];                      // lower convex hull of the points
for(let i=0;i<ks.length;i++){
  while(hull.length>=2){
    const [x1,y1]=hull[hull.length-2],[x2,y2]=hull[hull.length-1];
    if((y2-y1)*(ks[i]-x1) >= (ys[i]-y1)*(x2-x1)) hull.pop(); else break;
  }
  hull.push([ks[i],ys[i]]);
}
const ce=k=>{ for(let i=0;i<hull.length-1;i++){const [x1,y1]=hull[i],[x2,y2]=hull[i+1];
    if(k>=x1&&k<=x2) return y1+(y2-y1)*(k-x1)/(x2-x1);} return env(k);};
out.ce=worst(ce);
out.hullPts=hull.length; out.gridPts=ks.length;
let maxGap=0,gapAt=null;
for(let k=0.05;k<=1.0;k+=2e-3){const g=env(k)-ce(k); if(g>maxGap){maxGap=g;gapAt=k;}}
out.gap=[maxGap,gapAt];
`,ctx);
const o=ctx.out, f=x=>x.toExponential(2);
console.log('WORST BUTTERFLY (2nd difference in k; < 0 = not convex = negative density)\n');
console.log('  maker A alone                    ',f(o.A[0]));
console.log('  maker B alone                    ',f(o.B[0]));
console.log('  MIXTURE  w*A+(1-w)*B  (our book) ',f(o.mix[0]),'   <- a convex COMBINATION');
console.log('  ENVELOPE min(A,B)                ',f(o.env[0]),' at k='+o.env[1].toFixed(3),'  <- NOT convex');
console.log('  CONVEX ENVELOPE of the min       ',f(o.ce[0]),'   <- repaired');
console.log('\n  hull retains',o.hullPts,'of',o.gridPts,'grid points');
console.log('  max repair gap  env - convexEnvelope =',o.gap[0].toFixed(6),'at k='+o.gap[1].toFixed(3));
