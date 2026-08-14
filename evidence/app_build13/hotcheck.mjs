import {ctx, indepLanded, evalIn} from './oracle.mjs';
const g=ctx, MKT=evalIn('MKT'); const st=g.calc(); const set=g.makerCurves(); g.aggBook(set,st.book.map(m=>m.h));
// pixel -> (k,Q) for the hottest painted pixels measured live: x 886..906, rows 18..20 of the field
for(const [x,row] of [[886,18],[896,19],[906,20]]){
 const k=-0.7+x/908*1.4, Q=(150-row)/150*224;
 const I=indepLanded(set,MKT.pool,k,Q);
 console.log(`pixel x=${x} row=${row} -> k=${k.toFixed(4)} Q=${Q.toFixed(1)}  indep impact=${I.bps.toFixed(3)} bps  (legend max 210 bp, true mx=209.660)`);}
// earn: same pixels
const mkrs=st.book.map(m=>({c:st.c,h:m.h,share:m.share}));
for(const [x,row] of [[100,19],[500,19],[900,19]]){
 const k=-0.7+x/908*1.4, Q=(150-row)/150*224;
 const I=indepLanded(mkrs,MKT.pool,k,Q);
 console.log(`EARN pixel x=${x} row=${row} -> k=${k.toFixed(4)} Q=${Q.toFixed(1)}  indep impact=${I.bps.toFixed(6)} bps  (legend max 1.9 bp, true mx=1.917809)`);}
