import {ctx, evalIn} from './oracle.mjs';
const g=ctx, MKT=evalIn('MKT'); const st=g.calc();
const mkrs=st.book.map(m=>({c:st.c,h:m.h,share:m.share}));
const Qmax=224, NX=120,NY=44;
// EARN: is the field constant in k?
const row=j=>{const out=[];for(let i=0;i<NX;i++){const k=-0.7+1.4*(i+0.5)/NX;const Ld=g.ladderAt(mkrs,k,MKT.pool);const px=g.landedFrom(Ld,Qmax*(j+0.5)/NY);out.push(px===null?null:(px/Ld.best-1)*1e4);}return out;};
for(const j of [5,20,38]){const r=row(j).filter(v=>v!==null);
 console.log('EARN j='+j+' Q='+(Qmax*(j+0.5)/NY).toFixed(1)+'  min',Math.min(...r).toExponential(12),'max',Math.max(...r).toExponential(12),'spread',(Math.max(...r)-Math.min(...r)).toExponential(3));}
// EARN column profile (impact vs Q at fixed k)
{const Ld=g.ladderAt(mkrs,0,MKT.pool);
 console.log('EARN ladder@k=0 cum:',JSON.stringify(Ld.cum.map(s=>({q:+s.q.toFixed(3),px:+s.px.toFixed(6)}))),'best',Ld.best.toFixed(6));
 console.log('EARN impact vs Q:',[5,20,38,40,60,90,120,150,190,199,200,201].map(Q=>{const px=g.landedFrom(Ld,Q);return Q+':'+(px===null?'NOFIT':((px/Ld.best-1)*1e4).toFixed(4));}).join(' '));}
// TRANSACT: distribution of max-impact along k
const set=g.makerCurves(), B=g.aggBook(set,st.book.map(m=>m.h));
console.log('\nTRANSACT impact at Q=196 across k:');
let line='';
for(let i=0;i<NX;i+=6){const k=-0.7+1.4*(i+0.5)/NX;const Ld=g.ladderAt(set,k,MKT.pool);const px=g.landedFrom(Ld,196);
 line+=k.toFixed(3)+':'+(px/Ld.best-1*1?((px/Ld.best-1)*1e4).toFixed(1):'0')+'  ';}
console.log(line);
console.log('\nTRANSACT impact at k=0.12 vs Q:',[3,20,38,40,60,95,100,150,190,196,200,201,224].map(Q=>{const Ld=g.ladderAt(set,0.12,MKT.pool);const px=g.landedFrom(Ld,Q);return Q+':'+(px===null?'NOFIT':((px/Ld.best-1)*1e4).toFixed(3));}).join(' '));
// crossed / arb vs dial
console.log('\nARB DIAL sweep at k=0.12:');
for(const D of [0,0.05,0.1,0.15,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0]){
 evalIn('ARBD='+D); const s2=g.makerCurves(), B2=g.aggBook(s2,st.book.map(m=>m.h));
 const arb=(B2.bid(0.12)-B2.ask(0.12))*evalIn('S');
 console.log('  D='+D.toFixed(2),'crossed',B2.crossed(0.12),'arb$/BTC',arb.toFixed(3),'ask',B2.ask(0.12).toFixed(6),'bid',B2.bid(0.12).toFixed(6));}
evalIn('ARBD=0.15');
