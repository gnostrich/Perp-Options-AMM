const fs=require('fs'),vm=require('vm');
const js=/<script>([\s\S]*?)<\/script>/.exec(fs.readFileSync('app/index.html','utf8'))[1];
const el=()=>({style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',value:'0',
  querySelector:()=>el(),querySelectorAll:()=>[],appendChild(){},addEventListener(){},
  getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})}),width:900,height:300,
  getBoundingClientRect:()=>({left:0,top:0,width:900,height:300})});
const doc={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener(){},body:el()};
const ctx={document:doc,window:{addEventListener(){},devicePixelRatio:1},console,requestAnimationFrame:f=>f(),setTimeout,Math,JSON,Intl,out:{g:[]}};
ctx.window.document=doc; vm.createContext(ctx); vm.runInContext(js,ctx);
vm.runInContext(`
const st=calc(),hs=st.book.map(m=>m.h),S2=65695.5,pool=MKT.pool;
ARBD=0.15; const set=makerCurves(); aggBook(set,hs);
for(const DK of [0.02,0.01,0.005,0.002,0.001]){
 let tot=0,maxQ=0,capHits=0,n=0;
 for(let k=0.005;k<=0.60;k+=DK){
  const asks=set.map(m=>({m,px:m.c.CALL(k)*(1+m.h/1e4),cap:m.share*pool,slope:(m.lam*m.c.ATM)/(0.01*pool)})).sort((a,b)=>a.px-b.px);
  const bids=set.map(m=>({m,px:m.c.CALL(k)*(1-m.h/1e4),cap:m.share*pool,slope:(m.lam*m.c.ATM)/(0.01*pool)})).sort((a,b)=>b.px-a.px);
  const A=asks[0],B=bids[0]; n++;
  if(!A||!B||B.px<=A.px||A.m===B.m) continue;
  const qUnc=(B.px-A.px)/(A.slope+B.slope), q=Math.min(qUnc,A.cap,B.cap);
  if(q>maxQ)maxQ=q; if(qUnc>=Math.min(A.cap,B.cap))capHits++;
  tot+=((B.px-A.px)-0.5*(A.slope+B.slope)*q)*q*S2;
 }
 out.g.push([DK,tot,maxQ,capHits,n,Math.min(...set.map(m=>m.share*pool))]);
}
`,ctx);
console.log('GRID SENSITIVITY of the $2,212 figure (D=0.15), summing independent per-strike walks:\n');
console.log('  strike step   strikes   total $      max size taken   times depth cap bound');
ctx.out.g.forEach(r=>console.log('   '+String(r[0]).padEnd(12),String(r[4]).padStart(6),
  ('$'+Math.round(r[1]).toLocaleString()).padStart(11), (r[2].toFixed(2)+' BTC').padStart(15), String(r[3]).padStart(22)));
const g=ctx.out.g;
console.log('\n  smallest maker capacity:',g[0][5].toFixed(1),'BTC');
console.log('  total scales',(g[4][1]/g[0][1]).toFixed(1)+'x  for a',(0.02/0.001)+'x finer grid  -> pure grid count, no limit');
