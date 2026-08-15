// Closed-network test: money must be conserved by trading, and only created by
// seed/faucet. If a settlement path leaks, conserved().drift catches it.
const P=require('../../app/paper.js');
const W=P.create();
const ok=(c,m)=>console.log((c?'  OK  ':'  FAIL')+'  '+m)||(!c&&(process.exitCode=1));
console.log('=== paper wallet, closed network ===\n');
['alice','bob','lp1','lp2'].forEach(a=>W.touch(a));
console.log('  seeded 4 participants at $'+W.seedUSD.toLocaleString()+' each');
let c=W.conserved();
console.log('  balances $'+c.balances.toLocaleString()+'  external $'+c.external.toLocaleString()+'  drift '+c.drift);
ok(c.ok,'conserved after seeding');

// a settlement moves money between participants and creates none
W.settle('alice','bob',12345.67,'bundle_1','option close');
c=W.conserved();
console.log('\n  after alice -> bob $12,345.67:');
console.log('    alice $'+W.balance('alice').toLocaleString()+'   bob $'+W.balance('bob').toLocaleString());
console.log('    drift '+c.drift);
ok(c.ok,'a settlement creates no money');
ok(Math.abs(W.balance('alice')+W.balance('bob')-2*W.seedUSD)<1e-6,'the pair still sums to 2x seed');

// overdraft is refused, not silently allowed
const bad=W.move('alice',-5e6,W.REASON.SETTLEMENT,null,'too big');
console.log('\n  overdraft attempt: '+(bad.ok?'ACCEPTED — BREACH':'refused — '+bad.reason));
ok(!bad.ok,'overdraft refused');
ok(W.conserved().ok,'refused overdraft left no trace');

// faucet is the only other way money appears, and it is tagged
W.faucet('alice',250000);
c=W.conserved();
console.log('\n  after faucet $250,000 to alice: balances $'+c.balances.toLocaleString()+'  external $'+c.external.toLocaleString()+'  drift '+c.drift);
ok(c.ok,'faucet accounted as external, not conjured');

// a full closed-network round: 200 random settlements
let n=0; const who=['alice','bob','lp1','lp2'];
for(let i=0;i<200;i++){
  const a=who[i%4], b=who[(i*3+1)%4]; if(a===b)continue;
  const amt=Math.round(Math.random()*5000*100)/100;
  if(W.settle(a,b,amt,'sim_'+i,'sim').ok)n++;
}
c=W.conserved();
console.log('\n  after '+n+' random settlements between 4 participants:');
W.list().forEach(a=>console.log('    '+a.id.padEnd(6)+' $'+a.balanceUSD.toFixed(2).padStart(14)));
console.log('    total $'+c.balances.toFixed(2)+'   external $'+c.external.toFixed(2)+'   drift '+c.drift.toExponential(2));
ok(c.ok,'CLOSED NETWORK CONSERVES: '+n+' settlements moved money, created none');
ok(W.ledger().length>200,'every movement is on the ledger ('+W.ledger().length+' entries)');
ok(W.ledger('alice').every(e=>e.balanceAfter!==undefined),'every entry carries the balance after it');
console.log('\n=== '+(process.exitCode?'FAILED':'ALL PASS')+' ===');
