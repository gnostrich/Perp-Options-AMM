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
const st=calc(), hs=st.book.map(m=>m.h), S2=65695.5, pool=MKT.pool;
out.par=[]; out.blend=[];
for(const D of [0,0.15,0.6,1]){
  ARBD=D; const set=makerCurves(); aggBook(set,hs);
  // book-level parity: buy the best CALL ask, sell at the best PUT bid, same strike
  let worst=0,wk=null,n=0,cross=0;
  for(let k=0.005;k<=0.60;k+=0.005){
    const cAsk=Math.min(...set.map(m=>m.c.CALL(k)*(1+m.h/1e4)));
    const pBid=Math.max(...set.map(m=>m.c.PUT(k)*(1-m.h/1e4)));
    const res=(cAsk-pBid)-(-k);          // parity requires C - P = -k
    n++; if(res<0)cross++;
    if(res<worst){worst=res;wk=k;}
  }
  out.par.push([D,worst,wk,worst*S2,cross/n*100]);
  // execution-layer blend: does a large order average across makers?
  const k=0.05, Ld=ladderAt(set,k,pool);
  const cap0=set.map(m=>({n:m.n,px:m.c.CALL(k)*(1+m.h/1e4),cap:m.share*pool})).sort((a,b)=>a.px-b.px);
  const wt=Q=>{let rem=Q,w=[];for(const a of cap0){const t=Math.min(a.cap,rem);if(t>0)w.push(a.n+' '+(100*t/Q).toFixed(1)+'%');rem-=t;}return w.join(' / ');};
  const avg=Q=>landedFrom(Ld,Q);
  out.blend.push([D,cap0[0].cap,avg(38),avg(60),avg(150),(avg(60)/Ld.best-1)*1e4,wt(60)]);
}
`,ctx);
console.log('BOOK-LEVEL PARITY  C_ask(k) - P_bid(k) vs -k   (negative = synthetic perp below the cleared perp)');
console.log(' D     worst residual   at k     $/BTC      % of strikes crossed');
ctx.out.par.forEach(r=>console.log(' '+r[0].toFixed(2),'  ',r[1].toExponential(3),'  ',r[2]===null?'  -  ':r[2].toFixed(3),'  ',
  (r[3]).toFixed(0).padStart(7),'   ',r[4].toFixed(1)+'%'));
console.log('\nEXECUTION-LAYER BLEND at k=0.05 (does a big order average across makers?)');
console.log(' D     top cap   avg@38    avg@60    avg@150   impact@60   weights@60');
ctx.out.blend.forEach(r=>console.log(' '+r[0].toFixed(2),'  ',r[1].toFixed(1).padStart(6),'  ',r[2].toFixed(5),' ',r[3].toFixed(5),' ',r[4].toFixed(5),' ',r[5].toFixed(1).padStart(6)+'bp  ',r[6]));
