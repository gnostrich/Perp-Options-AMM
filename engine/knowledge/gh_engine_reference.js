'use strict';
// GH engine v4 — table in a module-level shape cache; pool carries SCALARS only.
// This is the exact logic block to transplant into the HTML Engine IIFE.

// ===== module-private GH curve machinery =====
const _ghCache = new Map();
function _ghI1(x){let ax=Math.abs(x),a;if(ax<3.75){let y=x/3.75;y*=y;a=ax*(0.5+y*(0.87890594+y*(0.51498869+y*(0.15084934+y*(0.2658733e-1+y*(0.301532e-2+y*0.32411e-3))))));}else{let y=3.75/ax;a=0.2282967e-1+y*(-0.2895312e-1+y*(0.1787654e-1-y*0.420059e-2));a=0.39894228+y*(-0.3988024e-1+y*(-0.362018e-2+y*(0.163801e-2+y*(-0.1031555e-1+y*a))));a*=(Math.exp(ax)/Math.sqrt(ax));}return x<0?-a:a;}
function _ghK1(x){if(x<=2.0){let y=x*x/4.0;return (Math.log(x/2.0)*_ghI1(x))+(1.0/x)*(1.0+y*(0.15443144+y*(-0.67278579+y*(-0.18156897+y*(-0.1919402e-1+y*(-0.110404e-2+y*(-0.4686e-4)))))));}else{let y=2.0/x;return (Math.exp(-x)/Math.sqrt(x))*(1.25331414+y*(0.23498619+y*(-0.3655620e-1+y*(0.1504268e-1+y*(-0.780353e-2+y*(0.325614e-2+y*(-0.68245e-3)))))));}}
function _ghBuild(ah,bh,delta){
  const vLo=-16, vHi=18, dv=0.002, N=Math.round((vHi-vLo)/dv);
  const kB=new Float64Array(N+1),kB1=new Float64Array(N+1);
  for(let i=0;i<=N;i++){const v=vLo+i*dv,r=Math.sqrt(delta*delta+v*v),e=Math.exp(-ah*r);kB[i]=e*Math.exp(bh*v);kB1[i]=e*Math.exp((bh+1)*v);}
  const Lo=new Float64Array(N+1),Lo1=new Float64Array(N+1);
  for(let i=1;i<=N;i++){Lo[i]=Lo[i-1]+0.5*(kB[i-1]+kB[i])*dv;Lo1[i]=Lo1[i-1]+0.5*(kB1[i-1]+kB1[i])*dv;}
  const tot=Lo[N],tot1=Lo1[N];
  const Hi=new Float64Array(N+1),Hi1=new Float64Array(N+1);
  for(let i=N-1;i>=0;i--){Hi[i]=Hi[i+1]+0.5*(kB[i]+kB[i+1])*dv;Hi1[i]=Hi1[i+1]+0.5*(kB1[i]+kB1[i+1])*dv;}
  const FbLo=new Float64Array(N+1),FbHi=new Float64Array(N+1),Fb1Lo=new Float64Array(N+1),Fb1Hi=new Float64Array(N+1);
  for(let i=0;i<=N;i++){FbLo[i]=Lo[i]/tot;FbHi[i]=Hi[i]/tot;Fb1Lo[i]=Lo1[i]/tot1;Fb1Hi[i]=Hi1[i]/tot1;}
  return {vLo,dv,N,FbLo,FbHi,Fb1Lo,Fb1Hi};
}
function _ghTab(ah,bh,delta){const k=ah+'_'+bh+'_'+delta;let T=_ghCache.get(k);if(!T){T=_ghBuild(ah,bh,delta);_ghCache.set(k,T);}return T;}
function _ipl(col,T,v){const x=(v-T.vLo)/T.dv;if(x<=0)return col[0];if(x>=T.N)return col[T.N];const j=x|0,f=x-j;return col[j]+(col[j+1]-col[j])*f;}
function _inv(col,T,target,incr){let lo=0,hi=T.N;if(incr){if(target<=col[0])return T.vLo;if(target>=col[T.N])return T.vLo+T.N*T.dv;while(hi-lo>1){const m=(lo+hi)>>1;if(col[m]<target)lo=m;else hi=m;}}else{if(target>=col[0])return T.vLo;if(target<=col[T.N])return T.vLo+T.N*T.dv;while(hi-lo>1){const m=(lo+hi)>>1;if(col[m]>target)lo=m;else hi=m;}}const c0=col[lo],c1=col[hi],f=(c1===c0)?0:(target-c0)/(c1-c0);return T.vLo+(lo+f)*T.dv;}
// CDF wrappers operating on pool scalars (s.ah,s.bh,s.delta,s.mu)
const _FbHi =(s,u)=>{const T=_ghTab(s.ah,s.bh,s.delta);return _ipl(T.FbHi ,T,u-s.mu);};
const _Fb1Lo=(s,u)=>{const T=_ghTab(s.ah,s.bh,s.delta);return _ipl(T.Fb1Lo,T,u-s.mu);};
const _invTail=(s,qHi)=>{const T=_ghTab(s.ah,s.bh,s.delta);return s.mu+_inv(T.FbHi ,T,qHi,false);};
const _invB1  =(s,pLo)=>{const T=_ghTab(s.ah,s.bh,s.delta);return s.mu+_inv(T.Fb1Lo,T,pLo,true);};

// EXPOSED: calibration — (X0,Y0,mp0,gamma) -> scalar GH params for the pool
function ghCalibrate(X0,Y0,mp0,gamma){
  const ah=gamma+1, bh=ah-gamma, delta=0.08;
  const psi=Math.sqrt(ah*ah-bh*bh), psi1=Math.sqrt(ah*ah-(bh+1)*(bh+1));
  const M=psi*_ghK1(delta*psi1)/(psi1*_ghK1(delta*psi));
  const T=_ghTab(ah,bh,delta);
  const Phi_b=_ipl(T.FbLo,T,3), Phi_b1=_ipl(T.Fb1Lo,T,3);
  const P=(Y0*(1-Phi_b))/(X0*M*Phi_b1);
  const u0=Math.log(mp0)-Math.log(P), mu=u0-3;
  const Nx=X0/(1-Phi_b), Ny=Y0/(M*Phi_b1);
  return {ghAh:ah, ghBh:bh, ghDelta:delta, ghMu:mu, ghNx:Nx, ghNy:Ny, ghP:P, ghM:M, ghU0:u0};
}

// ===== the four curve functions (read GH scalars off s, prefixed gh*) =====
// (in HTML these REPLACE the barrier bodies; field access uses gh-prefixed names)
function _S(s){return {ah:s.ghAh,bh:s.ghBh,delta:s.ghDelta,mu:s.ghMu};} // shape view
function getMP_raw(s){const X=s.x-s.alpha;return s.ghP*Math.exp(_invTail(_S(s),X/s.ghNx));}
function tradeUpdate(s,dy){
  const y_new=s.y+dy, Y=y_new-s.beta; if(!(Y>0))return null;
  const u=_invB1(_S(s), Y/(s.ghNy*s.ghM));
  const X=s.ghNx*_FbHi(_S(s),u); const x_new=X+s.alpha;
  if(!isFinite(x_new)||!isFinite(y_new)||x_new<=0||y_new<=0)return null;
  return {...s, x:x_new, y:y_new};
}
function rebase(s,r){return {...s, x:s.x*r, alpha:s.alpha*r, ghNx:s.ghNx*r, ghP:s.ghP/r};}
function arbitrageToOracle(s,oracle){
  if(!(oracle>0))return null;
  const us=Math.log(oracle)-Math.log(s.ghP);
  const X=s.ghNx*_FbHi(_S(s),us), Y=s.ghNy*s.ghM*_Fb1Lo(_S(s),us);
  const x=X+s.alpha, y=Y+s.beta;
  if(!isFinite(x)||!isFinite(y)||x<=0||y<=0)return null;
  return {...s, x, y};
}
function getSNorm(s){const w=s.alpha/s.x;return (1-w)/w;}

// ===== harness (uses gh-prefixed pool) =====
function openState(X0,Y0,mp0,gamma){const g=ghCalibrate(X0,Y0,mp0,gamma);const alpha=X0,beta=Y0;return {...g,alpha,beta,x:X0+alpha,y:Y0+beta};}
function approx(a,b,tol){return Math.abs(a-b)<=tol*(1+Math.abs(b));}
function runGates(label,X0,Y0,mp0,gamma){
  const s0=openState(X0,Y0,mp0,gamma);const out=[];const log=(g,ok,d)=>out.push((ok?'PASS':'**FAIL**')+' '+g+(d?'  '+d:''));
  log('open mp0',approx(getMP_raw(s0),mp0,1e-9),`mp=${getMP_raw(s0).toExponential(9)}`);
  let wInv=0,wU=0;for(const S of[0.3,0.5,0.8,1,1.3,2,3,5]){const st=arbitrageToOracle(s0,mp0*S);const X=st.x-st.alpha,Y=st.y-st.beta;const u=_invTail(_S(st),X/st.ghNx);wInv=Math.max(wInv,Math.abs(_Fb1Lo(_S(st),u)-Y/(st.ghNy*st.ghM)));wU=Math.max(wU,Math.abs(u-(Math.log(mp0*S)-Math.log(st.ghP))));}
  log('GATE2 invariant resid',wInv<1e-10,`${wInv.toExponential(3)}`);log('GATE2 u-recovery',wU<1e-10,`${wU.toExponential(3)}`);
  let mono=true,prev=Infinity;for(let i=0;i<=60;i++){const X=s0.ghNx*(0.0005+0.999*i/60);const mp=getMP_raw({...s0,x:X+s0.alpha});if(!(mp<prev))mono=false;prev=mp;}
  log('GATE3 monotone',mono,'mp ↓ in X');
  let wPL=0;const base=getSNorm(s0);for(let i=0;i<=30;i++){const S=1+2*i/30;const st=arbitrageToOracle(s0,mp0*S);wPL=Math.max(wPL,Math.abs((getSNorm(st)/base)/Math.pow(S,-gamma)-1));}
  log('GATE4 value∝S^-γ',wPL<0.01,`${(wPL*100).toFixed(3)}%`);
  let wArb=0;for(const S of[0.3,0.5,0.8,1,1.2,1.7,2.6,4]){const st=arbitrageToOracle(s0,mp0*S);wArb=Math.max(wArb,Math.abs(getMP_raw(st)/(mp0*S)-1));}
  log('GATE5 arb round-trip',wArb<1e-9,`${wArb.toExponential(3)}`);
  let wReb=0,wPM=0;for(const r of[0.5,0.9,1.1,2,5]){const sr=rebase(s0,r);wReb=Math.max(wReb,Math.abs(getMP_raw(sr)/getMP_raw(s0)-1/r)*r);wPM=Math.max(wPM,Math.abs((getMP_raw(sr)*r)/(getMP_raw(s0))-1));}
  log('GATE6 rebase /r',wReb<1e-9,`${wReb.toExponential(3)}`);log('GATE6 poolMark inv',wPM<1e-9,`${wPM.toExponential(3)}`);
  let bnd=true;for(const S of[0.1,0.3,0.5,1,2,5,10]){const st=arbitrageToOracle(s0,mp0*S);const X=st.x-st.alpha,Y=st.y-st.beta;if(!(X>0&&X<st.ghNx&&Y>0&&Y<st.ghNy*st.ghM))bnd=false;}
  log('GATE7 bounds',bnd,'X∈(0,Nx),Y∈(0,Ny·M)');
  console.log(`\n=== ${label} (γ=${gamma}) ===`);out.forEach(l=>console.log('  '+l));return out.every(l=>!l.includes('FAIL'));
}
let ok=true;
for(const g of[1.5,2,3,4])ok=runGates('reference 1,1,1',1,1,1,g)&&ok;
for(const g of[1.5,2,3,4])ok=runGates('LIVE 5,400000,80000',5,400000,80000,g)&&ok;
// import/export round-trip: scalars survive JSON, table re-derives
{const s=openState(5,400000,80000,2);const j=JSON.parse(JSON.stringify(s));const mpA=getMP_raw(s),mpB=getMP_raw(j);
 console.log('\nJSON round-trip getMP_raw equal:',approx(mpA,mpB,1e-12),`(${mpA.toExponential(6)} vs ${mpB.toExponential(6)})`);
 console.log('scalar pool JSON size (bytes):',JSON.stringify(s).length,'(table NOT serialized)');}
console.log('\n'+(ok?'ALL GATES PASS':'SOME GATES FAILED'));
{const s=openState(5,400000,80000,2);let t0=process.hrtime.bigint();for(let i=0;i<50000;i++){getMP_raw({...s,x:s.alpha+s.ghNx*(0.2+0.6*Math.random())});}let t1=process.hrtime.bigint();console.log('getMP_raw avg µs:',(Number(t1-t0)/1e3/50000).toFixed(3));}
