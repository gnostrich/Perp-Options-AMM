// Adversarial re-check of book.js — the three things that have actually gone wrong here.
const fs=require('fs'),vm=require('vm');
const src=fs.readFileSync('app/book.js','utf8');
const kern=/<script>([\s\S]*?)<\/script>/.exec(fs.readFileSync('app/index.html','utf8'))[1];
const ctx={console,Math,window:{}}; vm.createContext(ctx);
vm.runInContext(kern.slice(kern.indexOf('function logGamma'),kern.indexOf('/* ─── params')),ctx);
vm.runInContext(src,ctx);
vm.runInContext(`
const mk_=mk;
const mks=[{name:'YOU',me:true,cap:95,curve:mk_(0.60,1.2705,1.8413,0),hBps:19},
 {name:'A',cap:38,curve:mk_(0.58,1.20,1.90,0.05),hBps:16},
 {name:'B',cap:19,curve:mk_(0.63,1.35,1.75,-0.06),hBps:22},
 {name:'C',cap:48,curve:mk_(0.61,1.28,1.84,0.02),hBps:18}];
const Bk=(typeof Book!=='undefined')?Book:window.Book;
const B=Bk.make(mks,{});
out=[];
// 1. does landed EVER cross the opposite touch? (the free-money shape)
let bad=0,worst=0;
for(let k=-0.6;k<=0.6;k+=0.01) for(const Q of [1,10,50,100,150]){
 const buy=B.landed(k,Q,'buy'), sell=B.landed(k,Q,'sell');
 if(buy===null||sell===null)continue;
 if(sell>=buy){bad++;}
 if(buy<B.ask(k)-1e-12||sell>B.bid(k)+1e-12)worst++;
}
out.push(['sell landed >= buy landed (would be free money)',bad]);
out.push(['landed better than the touch (wrong direction)',worst]);
// 2. Q exactly at capacity, and 1 wei over
out.push(['landed at exactly capacity',String(B.landed(0.1,B.capacity,'buy')!==null)]);
out.push(['landed just over capacity is null',String(B.landed(0.1,B.capacity*1.0000001,'buy')===null)]);
// 3. apportion with awkward sizes
[1/3,7.7777,1e-9,B.capacity].forEach(Q=>{
 const s=B.apportion(Q).reduce((t,r)=>t+r.qty,0);
 out.push(['apportion('+Q+') residual',Math.abs(s-Q).toExponential(2)]);});
// 4. zero-capacity maker must not divide by zero
try{const Z=Bk.make([{name:'z',cap:0,curve:mk_(0.6,1.27,1.84,0),hBps:19}],{});
 out.push(['zero-cap maker slope finite',String(isFinite(Z.slope(0)))]);}catch(e){out.push(['zero-cap maker','THREW: '+e.message]);}
`,ctx);
ctx.out.forEach(r=>console.log('  '+String(r[0]).padEnd(48),r[1]));
