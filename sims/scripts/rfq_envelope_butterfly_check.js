const fs=require('fs'),vm=require('vm');
const h=fs.readFileSync('app/index.html','utf8');
const js=/<script>([\s\S]*?)<\/script>/.exec(h)[1];
const el=()=>({style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',value:'0',
  querySelector:()=>el(),querySelectorAll:()=>[],appendChild(){},addEventListener(){},
  getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})}),width:900,height:300,
  getBoundingClientRect:()=>({left:0,top:0,width:900,height:300})});
const doc={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener(){},body:el()};
const ctx={document:doc,window:{addEventListener(){},devicePixelRatio:1},console,requestAnimationFrame:f=>f(),setTimeout,Math,JSON,Intl,out:{}};
ctx.window.document=doc; vm.createContext(ctx);
vm.runInContext(js,ctx);
vm.runInContext(`
const A=mk(0.30,1.27,1.05,0.0), Bc=mk(0.85,1.27,3.20,0.0);
const env=k=>Math.min(A.CALL(k),Bc.CALL(k)), mix=k=>0.5*(A.CALL(k)+Bc.CALL(k));
out.tbl=[]; for(let k=0.02;k<=1.2;k+=0.08) out.tbl.push([k,A.CALL(k),Bc.CALL(k),env(k),A.CALL(k)<Bc.CALL(k)?'A':'B']);
const dk=0.002; let we=0,ke=null,wm=0,wa=0,wb=0;
for(let k=0.03;k<=1.2;k+=dk){const f=g=>g(k-dk)-2*g(k)+g(k+dk);
 const e=f(env); if(e<we){we=e;ke=k;} const m=f(mix); if(m<wm)wm=m;
 const a=f(x=>A.CALL(x)); if(a<wa)wa=a; const b=f(x=>Bc.CALL(x)); if(b<wb)wb=b;}
out.bf=[we,ke,wm,wa,wb,dk];
const dl=0.02; let mxLC=-1e9,evLC=-1e9,kx=null;
for(let x=Math.log(0.05);x<=Math.log(1.2);x+=dl){
 const L=g=>u=>Math.log(g(Math.exp(u))); const d2=g=>L(g)(x-dl)-2*L(g)(x)+L(g)(x+dl);
 mxLC=Math.max(mxLC,d2(mix)); const e=d2(env); if(e>evLC){evLC=e;kx=Math.exp(x);}}
out.lc=[mxLC,evLC,kx];
`,ctx);
console.log('k       A         B         envelope  winner');
ctx.out.tbl.forEach(r=>console.log(r[0].toFixed(2).padEnd(7),r[1].toFixed(5),' ',r[2].toFixed(5),' ',r[3].toFixed(5),' ',r[4]));
const b=ctx.out.bf;
console.log('\nworst butterfly (dk='+b[5]+'):  envelope '+b[0].toExponential(3)+' at k='+(b[1]?b[1].toFixed(3):'-')
 +' | mixture '+b[2].toExponential(3)+' | A '+b[3].toExponential(3)+' | B '+b[4].toExponential(3));
console.log('max log-log 2nd diff: mixture '+ctx.out.lc[0].toExponential(3)+'  envelope '+ctx.out.lc[1].toExponential(3)+' at k='+(ctx.out.lc[2]||0).toFixed(3));
