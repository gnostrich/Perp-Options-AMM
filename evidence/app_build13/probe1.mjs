import {ctx, indepLanded} from './oracle.mjs';
const g=ctx;
console.log('globals:', ['mk','makerCurves','aggBook','ladderAt','landedFrom','calc','drawHeat','render'].map(n=>n+':'+typeof g[n]).join(' '));
// default state
const st=g.calc();
console.log('P=',JSON.stringify(g.P),'MKT=',JSON.stringify(g.MKT),'volIndexed=',g.volIndexed,'ARBD=',g.ARBD,'HK=',g.HK);
console.log('hFair',st.hFair,'hEff',st.hEff,'Gt',st.Gt,'bleed',st.bleed);
console.log('book h:',st.book.map(m=>m.n+'='+m.h.toFixed(4)+' share='+m.share.toFixed(4)).join(' | '));
// EARN heat field
const mkrs=st.book.map(m=>({c:st.c,h:m.h,share:m.share}));
const tot=mkrs.reduce((s,m)=>s+m.share*g.MKT.pool,0), Qmax=Math.max(1.12*tot,1);
console.log('EARN tot',tot,'Qmax',Qmax);
const NX=120,NY=44;
let mx=0, arg=null, nullCount=0, tot_cells=0;
for(let i=0;i<NX;i++){const k=-0.7+1.4*(i+0.5)/NX, Ld=g.ladderAt(mkrs,k,g.MKT.pool);
 for(let j=0;j<NY;j++){const Q=Qmax*(j+0.5)/NY; const px=g.landedFrom(Ld,Q); tot_cells++;
  if(px===null){nullCount++;continue;} const b=(px/Ld.best-1)*1e4; if(b>mx){mx=b;arg={i,j,k,Q};}}}
console.log('EARN field max impact bps =',mx,'at',JSON.stringify(arg),'nullCells',nullCount,'/',tot_cells,'=',(nullCount/tot_cells*100).toFixed(1)+'%');
const fq=q=>q<1?q.toFixed(2):q<10?q.toFixed(1):q.toFixed(0);
console.log('EARN legend would read: 0 |', fq(mx/2)+' bp |', fq(mx)+' bp | no fit');
// marker
const mk1=g.ladderAt(mkrs,g.HK,g.MKT.pool), pxm=g.landedFrom(mk1,5);
console.log('EARN marker k=HK',g.HK,'Q=5 -> landed',pxm,'best',mk1.best,'bps',(pxm/mk1.best-1)*1e4);
console.log('  indep:',JSON.stringify(indepLanded(mkrs,g.MKT.pool,g.HK,5)));
