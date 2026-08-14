import {ctx, indepLanded, evalIn} from './oracle.mjs';
const g=ctx;
const P=evalIn('P'), MKT=evalIn('MKT');
console.log('P=',JSON.stringify(P),'MKT=',JSON.stringify(MKT),'volIndexed=',evalIn('volIndexed'),'ARBD=',evalIn('ARBD'),'HK=',evalIn('HK'),'S=',evalIn('S'));
const st=g.calc();
console.log('hFair',st.hFair,'hEff',st.hEff,'Gt',st.Gt,'bleed',st.bleed);
console.log('book h:',st.book.map(m=>m.n+'='+m.h.toFixed(4)+' share='+m.share.toFixed(4)).join(' | '));
const mkrs=st.book.map(m=>({c:st.c,h:m.h,share:m.share}));
const tot=mkrs.reduce((s,m)=>s+m.share*MKT.pool,0), Qmax=Math.max(1.12*tot,1);
console.log('EARN tot',tot,'Qmax',Qmax);
const NX=120,NY=44; let mx=0,arg=null,nullC=0,zeroC=0,cells=0;
for(let i=0;i<NX;i++){const k=-0.7+1.4*(i+0.5)/NX,Ld=g.ladderAt(mkrs,k,MKT.pool);
 for(let j=0;j<NY;j++){const Q=Qmax*(j+0.5)/NY;const px=g.landedFrom(Ld,Q);cells++;
  if(px===null){nullC++;continue;}const b=(px/Ld.best-1)*1e4;if(b<=1e-12)zeroC++;if(b>mx){mx=b;arg={i,j,k,Q};}}}
const fq=q=>q<1?q.toFixed(2):q<10?q.toFixed(1):q.toFixed(0);
console.log('EARN MAX impact bps =',mx,'at',JSON.stringify(arg),'| nullCells',nullC,'('+(nullC/cells*100).toFixed(1)+'%) zeroCells',zeroC,'('+(zeroC/cells*100).toFixed(1)+'%)');
console.log('EARN legend text: [0] ['+fq(mx/2)+' bp] ['+fq(mx)+' bp] [no fit]');
const HK=evalIn('HK'); const Ldm=g.ladderAt(mkrs,HK,MKT.pool),pxm=g.landedFrom(Ldm,5);
console.log('EARN marker k=',HK,'Q=5 -> bps',(pxm/Ldm.best-1)*1e4,' indep',JSON.stringify(indepLanded(mkrs,MKT.pool,HK,5)));
// TRANSACT field
const set=g.makerCurves(), hs=st.book.map(m=>m.h), B=g.aggBook(set,hs);
console.log('TRANSACT makers:',set.map(m=>m.n+' h='+m.h.toFixed(3)+' share='+m.share.toFixed(4)+' Sbar='+m.Sbar.toFixed(5)).join(' | '));
let mx2=0,arg2=null,n2=0,z2=0,c2=0;
for(let i=0;i<NX;i++){const k=-0.7+1.4*(i+0.5)/NX,Ld=g.ladderAt(set,k,MKT.pool);
 for(let j=0;j<NY;j++){const Q=Qmax*(j+0.5)/NY;const px=g.landedFrom(Ld,Q);c2++;
  if(px===null){n2++;continue;}const b=(px/Ld.best-1)*1e4;if(b<=1e-12)z2++;if(b>mx2){mx2=b;arg2={i,j,k,Q};}}}
console.log('TRANSACT MAX impact bps =',mx2,'at',JSON.stringify(arg2),'nullCells',n2,'zeroCells',z2,'/',c2);
console.log('TRANSACT legend text: [0] ['+fq(mx2/2)+' bp] ['+fq(mx2)+' bp] [no fit]');
const Ld3=g.ladderAt(set,0.12,MKT.pool),px3=g.landedFrom(Ld3,3);
console.log('TRANSACT marker k=0.12 Q=3 -> bps',(px3/Ld3.best-1)*1e4,'indep',JSON.stringify(indepLanded(set,MKT.pool,0.12,3)));
