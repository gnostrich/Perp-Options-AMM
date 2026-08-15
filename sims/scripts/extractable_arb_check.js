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
const st=calc(),hs=st.book.map(m=>m.h),S2=65695.5,pool=MKT.pool;
out.rows=[];
for(const D of [0.02,0.05,0.15,0.6,1.0]){
 ARBD=D; const set=makerCurves(); aggBook(set,hs);
 // How much can actually be TAKEN? At each strike the arb is capped by the depth
 // of the two makers involved, and taking it moves BOTH of their prices (each is
 // an AMM). Walk it until the edge closes.
 let totalUSD=0, totalBTC=0, bestK=null, bestUSD=0;
 for(let k=0.005;k<=0.60;k+=0.01){
  const asks=set.map(m=>({m,px:m.c.CALL(k)*(1+m.h/1e4),cap:m.share*pool,
                          slope:(m.lam*m.c.ATM)/(0.01*pool)})).sort((a,b)=>a.px-b.px);
  const bids=set.map(m=>({m,px:m.c.CALL(k)*(1-m.h/1e4),cap:m.share*pool,
                          slope:(m.lam*m.c.ATM)/(0.01*pool)})).sort((a,b)=>b.px-a.px);
  const A=asks[0],B=bids[0];
  if(!A||!B||B.px<=A.px) continue;
  if(A.m===B.m) continue;                      // cannot arb yourself
  // edge closes when A's ask has risen and B's bid has fallen to meet
  const q=Math.min((B.px-A.px)/(A.slope+B.slope), A.cap, B.cap);
  if(q<=0) continue;
  const pnl=((B.px-A.px)-0.5*(A.slope+B.slope)*q)*q*S2;   // integral, not endpoint
  totalUSD+=pnl; totalBTC+=q;
  if(pnl>bestUSD){bestUSD=pnl;bestK=k;}
 }
 out.rows.push([D,totalUSD,totalBTC,bestK,bestUSD]);
}
out.poolUSD=pool*S2;
`,ctx);
console.log('WHAT CAN ACTUALLY BE EXTRACTED (integral along the walk, capped by depth,');
console.log('both legs move because each maker is an AMM). Book notional = $'+(ctx.out.poolUSD/1e6).toFixed(1)+'M\n');
console.log('  D      total arb $     size BTC    worst strike    $ at that strike   % of book notional');
ctx.out.rows.forEach(r=>console.log('  '+r[0].toFixed(2).padEnd(6),
 ('$'+Math.round(r[1]).toLocaleString()).padStart(12), r[2].toFixed(1).padStart(10),
 (r[3]===null?'—':(r[3]*100).toFixed(0)+'%').padStart(14),
 ('$'+Math.round(r[4]).toLocaleString()).padStart(18),
 ((r[1]/ctx.out.poolUSD)*100).toFixed(3).padStart(10)+'%'));
