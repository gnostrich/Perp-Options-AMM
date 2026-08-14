const fs=require('fs'),vm=require('vm');
const h=fs.readFileSync('app/index.html','utf8');
const js=/<script>([\s\S]*?)<\/script>/.exec(h)[1];
const el=()=>({style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',value:'0',
  querySelector:()=>el(),querySelectorAll:()=>[],appendChild(){},addEventListener(){},
  getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})}),width:900,height:300,
  getBoundingClientRect:()=>({left:0,top:0,width:900,height:300})});
const doc={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],
  createElement:()=>el(),addEventListener(){},body:el()};
const ctx={document:doc,window:{addEventListener(){},devicePixelRatio:1},console,
  requestAnimationFrame:f=>f(),setTimeout,Math,JSON,Intl,out:[]};
ctx.window.document=doc;
vm.createContext(ctx);
try{vm.runInContext(js,ctx);}catch(e){console.log('load error:',e.message);process.exit(1);}
console.log('load error: none');
vm.runInContext(`
const S2=65695.5, k=0.05;
for(const D of [0,0.15,0.6,1]){
  ARBD=D;
  const set=makerCurves();
  const st=calc(); const hs=st.book.map(m=>m.h);
  const B=aggBook(set,hs);
  const a=B.ask(k),b=B.bid(k),mid=(a+b)/2;
  const env=Math.min(...set.map(m=>m.c.CALL(k)));
  const mix=set.reduce((s,m)=>s+m.c.CALL(k),0)/set.length;
  out.push([D,a,b,(a-b)/mid*1e4/2,B.crossed(k),(b-a)*S2,env,mix]);
}
`,ctx);
for(const r of ctx.out){
 console.log('D='+r[0], 'ask',r[1].toFixed(5),'bid',r[2].toFixed(5),
  'half-spr bps',r[3].toFixed(1),'crossed',r[4],'arb $/BTC',r[4]?r[5].toFixed(0):'-',
  '| env',r[6].toFixed(5),'mixture',r[7].toFixed(5));
}
