const fs=require('fs'),vm=require('vm');
const js=/<script>([\s\S]*?)<\/script>/.exec(fs.readFileSync('app/index.html','utf8'))[1];
const el=()=>({style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',value:'0',dataset:{},
  querySelector:()=>el(),querySelectorAll:()=>[],appendChild(){},addEventListener(){},
  getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})}),width:900,height:300,
  getBoundingClientRect:()=>({left:0,top:0,width:900,height:300})});
const doc={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener(){},body:el()};
const ctx={document:doc,window:{addEventListener(){},devicePixelRatio:1},console,requestAnimationFrame:f=>f(),setTimeout,Math,JSON,Intl,out:{}};
ctx.window.document=doc; vm.createContext(ctx); vm.runInContext(js,ctx);
vm.runInContext(`
ORC.mode='oracle';ORC.iv=0.60;ORC.bias=0;ARBD=0.15;
const st=calc(); const set=makerCurves(); const B=aggBook(set,st.book.map(m=>m.h));
out.caps=set.map(m=>[m.n,m.cap,m.share*100]);
out.pool=B.poolTot;
const Ld=ladderAt(set,0.10,MKT.pool,'ask');
out.slope=Ld.slope; out.best=Ld.best; out.total=Ld.total;
// sheet cross-check: 5 BTC at k=0.10, one pool of the summed capital, lambda 0.01
const c=mk(0.60,1.2705,1.8413,0), ATMp=c.ATM, Pk=c.CALL(0.10), N=out.pool;
out.sheetFrac=0.5*0.01*(5/N)/0.01*ATMp/Pk;
out.appFrac=(landedFrom(Ld,5)/Ld.best-1);
out.imp=[1,5,20,60,150].map(Q=>{const px=landedFrom(Ld,Q);
 return [Q,px===null?null:(px/Ld.best-1)*1e4];});
let cr=0,n=0; for(let k=-0.5;k<=0.5;k+=0.01){n++; if(B.bid(k)>B.ask(k))cr++;}
out.cross=[cr,n];
`,ctx);
const o=ctx.out;
console.log('PER-LP CAPITAL (lambda is now one mechanism constant 0.01, from the sheet):');
o.caps.forEach(r=>console.log('   '+r[0].padEnd(10),String(r[1]).padStart(4)+' BTC  ->  share '+r[2].toFixed(1)+'%'));
console.log('   pool = sum of capital:',o.pool.toFixed(0),'BTC');
console.log('\nSHEET CROSS-CHECK, 5 BTC at k=10%:');
console.log('   sheet formula  ½·λ·(Q/N)/0.01·ATMp/P  =',(o.sheetFrac*100).toFixed(4)+'%');
console.log('   app landed vs best                    =',(o.appFrac*100).toFixed(4)+'%');
console.log('   match:',Math.abs(o.sheetFrac-o.appFrac)<1e-9);
console.log('\nIMPACT NOW (was 31.4 bps at 1 BTC in build 30):');
o.imp.forEach(r=>console.log('   Q='+String(r[0]).padStart(4),' ',r[1]===null?'NO FIT':r[1].toFixed(1).padStart(7)+' bps'));
console.log('\nCrossing:',o.cross[0],'of',o.cross[1],'strikes');
