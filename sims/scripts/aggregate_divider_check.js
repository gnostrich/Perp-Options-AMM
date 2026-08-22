// Operator entry 603: quotes stand; the AGGREGATE is a divider inside the overlap.
//   effAsk(k) = max( bestAsk(k), mid(k) )      a taker may not buy below the divider
//   effBid(k) = min( bestBid(k), mid(k) )      a taker may not sell above it
// Where there is no overlap the divider is inactive and each maker's own quote stands.
const fs=require('fs'),vm=require('vm');
const js=/<script>([\s\S]*?)<\/script>/.exec(fs.readFileSync('app/index.html','utf8'))[1];
const el=()=>({style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',value:'0',dataset:{},
  querySelector:()=>el(),querySelectorAll:()=>[],appendChild(){},addEventListener(){},
  getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})}),width:900,height:300,
  getBoundingClientRect:()=>({left:0,top:0,width:900,height:300})});
const doc={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener(){},body:el()};
const ctx={document:doc,window:{addEventListener(){},devicePixelRatio:1},console,requestAnimationFrame:f=>f(),setTimeout,Math,JSON,Intl,out:[]};
ctx.window.document=doc; vm.createContext(ctx); vm.runInContext(js,ctx);
vm.runInContext(`
ORC.mode='manual';
const d2=(f,k,h=2e-3)=>(f(k-h)-2*f(k)+f(k+h))/(h*h);
for(const D of [0,0.05,0.15,0.30,0.60,1.00]){
  ARBD=D; const st=calc(); const set=makerCurves(); aggBook(set,st.book.map(m=>m.h));
  const tot=set.reduce((t,m)=>t+m.cap,0);
  const mid=k=>set.reduce((t,m)=>t+(m.cap/tot)*m.c.CALL(k),0);
  const bestAsk=k=>Math.min(...set.map(m=>m.c.CALL(k)*(1+m.h/1e4)));
  const bestBid=k=>Math.max(...set.map(m=>m.c.CALL(k)*(1-m.h/1e4)));
  const effAsk=k=>Math.max(bestAsk(k),mid(k));
  const effBid=k=>Math.min(bestBid(k),mid(k));
  let n=0,crossRaw=0,crossEff=0,bindA=0,sprNat=0,natN=0,sprEff=0,wb=1e9;
  for(let k=-0.5;k<=0.5;k+=2e-3){n++;
    const a=bestAsk(k),b=bestBid(k),ea=effAsk(k),eb=effBid(k);
    if(b>a)crossRaw++;
    if(eb>ea+1e-12)crossEff++;
    if(ea>a+1e-12)bindA++;                       // divider actually binding
    if(b<=a){sprNat+=(a-b)/((a+b)/2)*1e4;natN++;}
    sprEff+=(ea-eb)/((ea+eb)/2)*1e4;
    const v=d2(effAsk,k); if(v<wb)wb=v;
  }
  out.push([D,crossRaw/n*100,crossEff/n*100,bindA/n*100,natN?sprNat/natN:0,sprEff/n,wb]);
}
`,ctx);
console.log('THE DIVIDER — quotes stand; the aggregate splits the overlap\n');
console.log('   D    raw overlap   overlap AFTER   divider binds   natural spread   effective spread   worst 2nd diff');
ctx.out.forEach(r=>console.log('  '+r[0].toFixed(2)+'     '+r[1].toFixed(1).padStart(5)+'%       '
 +r[2].toFixed(1).padStart(5)+'%        '+r[3].toFixed(1).padStart(5)+'%      '
 +r[4].toFixed(1).padStart(7)+' bps     '+r[5].toFixed(1).padStart(7)+' bps      '+r[6].toExponential(2).padStart(9)));
