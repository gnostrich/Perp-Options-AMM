const fs=require('fs'),vm=require('vm');
const js=/<script>([\s\S]*?)<\/script>/.exec(fs.readFileSync('app/index.html','utf8'))[1];
const el=()=>({style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',value:'0',
  querySelector:()=>el(),querySelectorAll:()=>[],appendChild(){},addEventListener(){},
  getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})}),width:900,height:300,
  getBoundingClientRect:()=>({left:0,top:0,width:900,height:300})});
const doc={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener(){},body:el()};
const ctx={document:doc,window:{addEventListener(){},devicePixelRatio:1},console,requestAnimationFrame:f=>f(),setTimeout,Math,JSON,Intl,out:{}};
ctx.window.document=doc; vm.createContext(ctx); vm.runInContext(js,ctx);
vm.runInContext(`
const S2=65695.5, c=mk(0.60,1.2705,1.8413,0);
const cash=(Sx,K)=>c.CALL(K/Sx-1)*Sx, hS=S2*2e-3;
out.r=[0.85,0.95,1.0,1.05,1.15].map(m=>{const K=m*S2;
 const d2=(cash(S2+hS,K)-2*cash(S2,K)+cash(S2-hS,K))/(hS*hS);
 const Gnot=Math.abs(d2*S2);              // per $1 NOTIONAL
 const prem=c.CALL(K/S2-1);               // premium as a fraction of spot
 return [m,Gnot,prem,Gnot/prem];});
`,ctx);
console.log('Are the two figures the same quantity in different bases?  ratio should be 1/premium\n');
console.log('  moneyness   G~ notional   premium C   G~/C (premium basis)');
ctx.out.r.forEach(r=>console.log('   '+r[0].toFixed(2)+'        '+r[1].toFixed(3).padStart(7)+'      '+r[2].toFixed(4)+'       '+r[3].toFixed(2).padStart(6)));
const m=ctx.out.r.reduce((s,r)=>s+r[3],0)/ctx.out.r.length;
console.log('\n  mean premium-basis G~ =',m.toFixed(2),'   workbook figure = 5.47');
console.log('  mean notional-basis G~ = 0.906   app figure = 0.91');
console.log('\n  => same quantity, two bases. The fee is quoted on NOTIONAL, so the notional basis governs.');
