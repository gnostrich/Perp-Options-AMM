'use strict';
const {E}=require('./lib.js');
const m=2;
function openCollar(pool,oracle,Kput,Kcall,N){
  const sold={inner:Kput/oracle,outer:NaN,K_inner:Kput,K_outer:NaN};
  const bought={inner:Kcall/oracle,outer:NaN,K_inner:Kcall,K_outer:NaN};
  const r=E.executeBand(pool,'put','call',sold,bought,N,oracle,80000,m);
  if(!r.ok){console.log('OPEN FAIL',r.reason);process.exit(1);}
  const band={id:'B1',sold_wing:'put',bought_wing:'call',status:'open',
    sold:{inner:sold.inner,outer:NaN,K_inner:Kput,K_outer:NaN,K_tx:r.leg1.K_tx,arc:r.leg1.arc,mode:r.leg1.mode,N:r.N_sell},
    bought:{inner:bought.inner,outer:NaN,K_inner:Kcall,K_outer:NaN,K_tx:r.leg2.K_tx,arc:r.leg2.arc,mode:r.leg2.mode,N:r.N_buy},
    entry:{oracle,L0:1.0},
    carved:{carvedNotional:0,carvedEntryEquity:1.0,entryPerpMark:oracle}};
  return {band,finalState:r.finalState,openR:r};
}
// carvedEntryEquity=1 & L0=1 & livePerpMark=entryPerpMark => trader_payout = raw_net (escrow units) exactly.
const pool={x:10,y:800000,alpha:5,beta:400000};
const oracle=80000;
const {band,finalState,openR}=openCollar(pool,oracle,70000,95000,0.5);
console.log('OPEN: N_sell(put)=',openR.N_sell.toFixed(6),' N_buy(call)=',openR.N_buy.toFixed(6),' V_sell=',openR.V_sell.toFixed(6),' V_buy=',openR.V_buy.toFixed(6));
console.log('pool after open:',JSON.stringify(finalState));

// Now rebase down to push the PUT ITM: oracle 80000 -> oNew below Kput=70000.
const club={equity:1e12};
console.log('\n== Close at various live oracles (put goes ITM as oracle < 70000) ==');
console.log('oNew    put theta=K/o  putITM?  X(put escrow)  Y(call escrow) raw_net  trader_payout  N*(Kput-S)$  X_as_$/K  X_as_$/oNew');
for(const oNew of [80000,70000,60000,40000,20000,8000]){
  const r=oNew/oracle;
  let s=E.rebase(finalState,r);
  s=E.arbitrageToOracle(s,oNew);           // re-equilibrate ATM to new oracle
  const res=E.closeBand(s,band,club,oNew,oNew,80000,m);
  if(!res.ok){console.log(oNew,'CLOSE FAIL',res.reason);continue;}
  const thPut=70000/oNew;
  const putITM=res.settled_cash_leg==='sold';
  const trueIntr=band.sold.N*Math.max(70000-oNew,0);   // dollar intrinsic of the put leg (N contracts * (K-S))
  // X is escrow units for the put leg (=N*mark). Convert candidate dollars:
  const X_over_K = res.X; // escrow units; *K would be...
  console.log([oNew,thPut.toFixed(3),putITM,res.X.toFixed(5),res.Y.toFixed(5),res.raw_net.toFixed(5),res.trader_payout.toFixed(5),trueIntr.toFixed(1),(res.X/band.sold.N).toFixed(5),(res.X*70000).toFixed(1)].join('  '));
}
