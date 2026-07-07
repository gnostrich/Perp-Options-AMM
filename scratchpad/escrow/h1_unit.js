'use strict';
const {E}=require('./lib.js');
// Default deploy pool, w=0.5 => getSNorm=1. Use m=2 => g=m*gamma=2 (gamma=1 at w=.5).
const pool={x:10,y:800000,alpha:5,beta:400000};
const m=2, oracle=80000;
const sNorm=E.getSNorm(pool);       // =1
const g=E.gLoc(pool,1,m);            // m*gamma
console.log('sNorm(mode)=',sNorm,' g=m*gamma=',g,' seam put theta*=(g+1)/g=',(g+1)/g,' seam call theta*=g/(g+1)=',g/(g+1));
console.log('\n== PUT wing: mark vs theta (theta=K/oracle, sNorm=1 fixed) ==');
console.log('theta     K          mark      1-1/theta(intr)  intr$=K-S   mark*K     mark*oracle');
for(const th of [0.9,1.0,1.5,2.0,4.0,10.0,100.0,1e6]){
  const mk=E.markLensed('put',th,sNorm,g);
  const K=th*oracle, S=oracle;
  console.log([th.toExponential(2),K.toExponential(3),mk.toFixed(6),(1-1/th).toFixed(6),(K-S).toExponential(3),(mk*K).toExponential(4),(mk*oracle).toExponential(4)].join('  '));
}
console.log('\n== CALL wing: mark vs theta ==');
console.log('theta     K          mark      1-theta(intr)   intr$=S-K   mark*oracle   mark*K');
for(const th of [1.1,1.0,0.667,0.5,0.25,0.1,0.01,1e-6]){
  const mk=E.markLensed('call',th,sNorm,g);
  const K=th*oracle, S=oracle;
  console.log([th.toFixed(3),K.toExponential(3),mk.toFixed(6),(1-th).toFixed(6),(S-K).toExponential(3),(mk*oracle).toExponential(4),(mk*K).toExponential(4)].join('  '));
}
console.log('\n== Reflection identity: put(theta,sNorm) vs call(theta, theta^2/sNorm) ==');
// operator: put at s = call reflected s->theta^2/s. Here coord is sNorm; test put(th,sN) == call(th, th^2/sN)
for(const th of [1.2,1.5,2.0,4.0]) for(const sN of [0.5,1.0,2.0]){
  const p=E.markLensed('put',th,sN,g);
  const c=E.markLensed('call',th,th*th/sN,g);
  console.log(`theta=${th} sNorm=${sN}  put=${p.toFixed(8)}  call(refl)=${c.toFixed(8)}  diff=${(p-c).toExponential(2)}`);
}
