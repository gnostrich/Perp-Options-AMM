'use strict';
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('temporal_mvp_v26a.html','utf8');   // the ACTUAL v26a
const blocks=[]; const re=/<script\b([^>]*)>([\s\S]*?)<\/script>/g; let m;
while((m=re.exec(html))) blocks.push({attrs:m[1].trim(),body:m[2]});
console.log('scripts:',blocks.length,'lens:',blocks.map(b=>b.body.length));
let blobIn=false; for(const b of blocks)for(const ln of b.body.split('\n'))if(ln.length>50000)blobIn=true;
let parseOK=true; blocks.forEach((b,i)=>{try{new Function(b.body);}catch(e){parseOK=false;console.log('PARSE FAIL',i,e.message);}});
const eng=blocks.find(b=>/id="engine"/.test(b.attrs)).body;
const sigs=[/const getMP_raw = \(s\) =>/,/function tradeUpdate\(s, dy\)/,/function rebase\(s, r\)/,/function arbitrageToOracle\(s, oracle\)/,/function ghCalibrate\(X0, Y0, mp0, gamma\)/];
console.log('blob-in-script:',blobIn,'| all parse:',parseOK,'| sigs:',sigs.every(r=>r.test(eng)),'| IIFE:',/const Engine = \(function\(\) \{/.test(eng)&&/\}\)\(\);/.test(eng));
const E=vm.runInNewContext('(function(){'+eng+'\n;return Engine;})()',{Math,Map,Float64Array,Number,Object,Array,isFinite,isNaN,JSON,console});
const approx=(a,b,t)=>Math.abs(a-b)<=t*(1+Math.abs(b));
function open(g){const gh=E.ghCalibrate(5,400000,80000,g);return Object.assign({},gh,{alpha:5,beta:400000,x:10,y:800000});}
// 7 gates (engine must be untouched)
let ok=true;
for(const g of[1.5,2,3,4]){const s0=open(g);const f=[];
  f.push(approx(E.getMP_raw(s0),80000,1e-9));
  let wInv=0;for(const S of[0.3,0.5,1,1.3,2,3,5]){const st=E.arbitrageToOracle(s0,80000*S);wInv=Math.max(wInv,Math.abs(E.getMP_raw(st)/(80000*S)-1));}f.push(wInv<1e-9);
  let wReb=0;for(const rr of[0.5,1.1,2,5]){const sr=E.rebase(s0,rr);wReb=Math.max(wReb,Math.abs(E.getMP_raw(sr)/E.getMP_raw(s0)-1/rr)*rr);}f.push(wReb<1e-9);
  let bnd=true;for(const S of[0.1,0.5,1,2,10]){const st=E.arbitrageToOracle(s0,80000*S);const X=st.x-st.alpha,Y=st.y-st.beta;if(!(X>0&&X<st.ghNx&&Y>0&&Y<st.ghNy*st.ghM))bnd=false;}f.push(bnd);
  const all=f.every(Boolean);ok=ok&&all;console.log(`gates g=${g}: ${all?'PASS':'FAIL'}`);}

// FIX 2/3 enabler: snap must carry gh scalars; and the trace recipe must produce on-GH-curve points
const stateBlk=blocks.find(b=>/id="state"/.test(b.attrs)).body;
const sb=Object.assign({},{Math,Map,Float64Array,Number,Object,Array,isFinite,isNaN,JSON,console,Date,setTimeout:()=>0,document:{getElementById:()=>null},window:{}});
const out=vm.runInNewContext('(function(){'+eng+'\n'+stateBlk+'\n;return {Engine,Store};})()',sb,{timeout:20000});
let pool=null;const st=out.Store.getState?out.Store.getState():null;
if(st&&st.pool)pool=st.pool;else if(out.Store.exportJSON){const ej=JSON.parse(out.Store.exportJSON());pool=ej&&ej.pool;}
const snap=Object.assign({...pool},{w:pool.alpha/pool.x,sNorm:out.Engine.getSNorm(pool)});  // mimic curveSnap {...p,...}
console.log('\nsnap carries gh scalars (ghP,ghNx,ghNy,ghM,ghMu):',['ghP','ghNx','ghNy','ghM','ghMu'].every(k=>k in snap));
// replicate Fix-2 trace recipe and check every point is ON the GH curve (getMP_raw == intended slope)
let onCurve=0,worst=0,prevX=Infinity,mono=true;
const mp0=out.Engine.getMP_raw(snap);
for(let i=0;i<=400;i++){const o=mp0*Math.exp(-6+12*i/400);const p=out.Engine.arbitrageToOracle(snap,o);
  if(p&&p.x>0&&p.y>0){onCurve++;worst=Math.max(worst,Math.abs(out.Engine.getMP_raw(p)/o-1));if(!(p.x<prevX))mono=false;prevX=p.x;}}
console.log('Fix2 curveTrace: points on-GH-curve =',onCurve,'/401, worst slope err =',worst.toExponential(3),', x monotone =',mono);
// Fix-3 marker on curve
const eq=out.Engine.arbitrageToOracle(snap,mp0*1.7);
console.log('Fix3 marker on curve: getMP_raw(eq)=',out.Engine.getMP_raw(eq).toFixed(2),'(target',(mp0*1.7).toFixed(2)+')');
console.log('\n'+(ok?'ENGINE GATES PASS (v26a)':'ENGINE GATES FAIL'));
