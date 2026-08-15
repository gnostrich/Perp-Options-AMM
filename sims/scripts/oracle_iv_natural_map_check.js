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
const S2=65695.5, a=1.2705, gam=1.8413;
function Gtil(Sbar){const c=mk(Sbar,a,gam,0);
 const cash=(Sx,K)=>c.CALL(K/Sx-1)*Sx, hS=S2*2e-3;
 let s=0,n=0;[0.85,0.95,1.0,1.05,1.15].forEach(m=>{const K=m*S2;
  const d2=(cash(S2+hS,K)-2*cash(S2,K)+cash(S2-hS,K))/(hS*hS);
  const v=Math.abs(d2*S2); if(isFinite(v)){s+=v;n++;}});
 return {G:s/n, atm:c.ATM};}
function calib(t){let lo=0.02,hi=6;for(let i=0;i<90;i++){const m=(lo+hi)/2;
  if(Gtil(m).atm<t)lo=m;else hi=m;}return (lo+hi)/2;}
// invariant check
out.inv=[0.2,0.3,0.4,0.6,0.8,1.0].map(S=>{const r=Gtil(S);return [S,r.atm,r.G,r.G*r.atm];});
// NATURAL MAP: premium tracks vol.  C(RV) = 0.18 * RV/0.60
const turn=0.30;
out.map=[0.20,0.40,0.60,0.90,1.20,1.60].map(RV=>{
 const tgt=0.18*RV/0.60, Sb=calib(tgt), r=Gtil(Sb);
 const beTrack=0.5*r.G*RV*RV/(turn*365)*1e4;          // level tracks vol
 const rF=Gtil(0.60);
 const beFrozen=0.5*rF.G*RV*RV/(turn*365)*1e4;        // level frozen at S̄=0.60
 return [RV,tgt,Sb,r.G,beTrack,beFrozen];});
`,ctx);
const o=ctx.out;
console.log('INVARIANT:  G~ x ATM premium  is nearly constant across the level parameter');
console.log('   S̄     premium    G~      G~ x premium');
o.inv.forEach(r=>console.log('  '+r[0].toFixed(2)+'    '+r[1].toFixed(4)+'   '+r[2].toFixed(3).padStart(6)+'      '+r[3].toFixed(4)));
console.log('\n  => G~ ~= 0.15 / C .  Break-even = 1/2 G~ RV^2/(turn*365) ~= 0.075 RV^2 / C /(turn*365)');
console.log('     so if the map sets C proportional to RV, break-even goes as RV, NOT RV^2.\n');
console.log('NATURAL MAP (oracle vol -> ATM premium -> S̄), turnover 0.30x/day:');
console.log('   RV     target C    S̄ solved     G~      break-even bps        vs frozen level');
o.map.forEach(r=>console.log('  '+(r[0]*100).toFixed(0).padStart(4)+'%    '+r[1].toFixed(4)+'      '+r[2].toFixed(4).padStart(7)
 +'   '+r[3].toFixed(3).padStart(6)+'       '+r[4].toFixed(1).padStart(6)+'              '+r[5].toFixed(1).padStart(6)));
const a1=o.map[0],a2=o.map[o.map.length-1];
console.log('\n  scaling exponent, tracked : ',(Math.log(a2[4]/a1[4])/Math.log(a2[0]/a1[0])).toFixed(2));
console.log('  scaling exponent, frozen  : ',(Math.log(a2[5]/a1[5])/Math.log(a2[0]/a1[0])).toFixed(2));
