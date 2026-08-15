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
const a=1.2705,gam=1.8413;
out.hi=[1,2,4,6,10,20,50].map(S=>[S,mk(S,a,gam,0).ATM]);
// what does the ATM premium converge to as S̄ grows?
out.sup=mk(1e6,a,gam,0).ATM;
// range of premiums reachable by S̄ alone
out.reach=[0.30,0.40,0.48,0.50].map(t=>{let lo=0.02,hi=1e6;
 for(let i=0;i<200;i++){const m=(lo+hi)/2; if(mk(m,a,gam,0).ATM<t)lo=m;else hi=m;}
 return [t,(lo+hi)/2,mk((lo+hi)/2,a,gam,0).ATM];});
`,ctx);
console.log('ATM premium as S̄ grows (a,γ fixed):');
ctx.out.hi.forEach(r=>console.log('   S̄='+String(r[0]).padStart(3),' ATM =',r[1].toFixed(5)));
console.log('   supremum as S̄→∞ :',ctx.out.sup.toFixed(5));
console.log('\nCan the level map reach a given target premium with S̄ alone?');
ctx.out.reach.forEach(r=>console.log('   target',r[0].toFixed(2),' S̄ needed',r[1].toExponential(2),' achieved',r[2].toFixed(5),
  r[2]<r[0]-1e-6?'  <-- UNREACHABLE':''));
