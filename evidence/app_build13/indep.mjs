import {ctx, indepLanded, evalIn} from './oracle.mjs';
const g=ctx, MKT=evalIn('MKT'); const st=g.calc();
const set=g.makerCurves(); g.aggBook(set, st.book.map(m=>m.h));
console.log('INDEPENDENT re-derivation (spec-written, not the page fns):');
for(const [k,Q] of [[0.40,150],[-0.40,150],[0.12,60],[0.12,3],[0.12,201],[0.12,240]]){
 const I=indepLanded(set,MKT.pool,k,Q);
 const Ld=g.ladderAt(set,k,MKT.pool),px=g.landedFrom(Ld,Q);
 const pageBps = px===null?null:(px/Ld.best-1)*1e4;
 console.log(` k=${k} Q=${Q}  indep_bps=${I.bps===null?'NOFIT':I.bps.toFixed(7)}  page_bps=${pageBps===null?'NOFIT':pageBps.toFixed(7)}  UIrounds=${I.bps===null?'no fit':I.bps.toFixed(1)}  agree=${(I.bps===null)===(pageBps===null) && (I.bps===null||Math.abs(I.bps-pageBps)<1e-9)}  totalCap=${I.total.toFixed(6)}`);}
