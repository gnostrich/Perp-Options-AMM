const fs=require('fs'),vm=require('vm');
const js=/<script>([\s\S]*?)<\/script>/.exec(fs.readFileSync('app/index.html','utf8'))[1];
const el=()=>({style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',value:'0',dataset:{},
  querySelector:()=>el(),querySelectorAll:()=>[],appendChild(){},addEventListener(){},
  getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})}),width:900,height:300,
  getBoundingClientRect:()=>({left:0,top:0,width:900,height:300})});
const doc={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener(){},body:el()};
const ctx={document:doc,window:{addEventListener(){},devicePixelRatio:1},console,requestAnimationFrame:f=>f(),setTimeout,Math,JSON,Intl,out:{a:[],b:[]}};
ctx.window.document=doc; vm.createContext(ctx); vm.runInContext(js,ctx);
vm.runInContext(`
const pool=MKT.pool; ORC.mode='oracle'; ORC.iv=0.60;
// (1) is the BOOK spread a composite - different makers on each side?
ORC.bias=0; let st=calc(); let set=makerCurves(); aggBook(set,st.book.map(m=>m.h));
for(const k of [-0.30,0,0.15,0.40]){
 const asks=set.map(m=>({n:m.n,px:m.c.CALL(k)*(1+m.h/1e4)})).sort((a,b)=>a.px-b.px);
 const bids=set.map(m=>({n:m.n,px:m.c.CALL(k)*(1-m.h/1e4)})).sort((a,b)=>b.px-a.px);
 const bookBps=(asks[0].px-bids[0].px)/((asks[0].px+bids[0].px)/2)*1e4;
 const tightest=Math.min(...set.map(m=>2*m.h));
 out.a.push([k,asks[0].n,bids[0].n,bookBps,tightest,asks[0].n!==bids[0].n]);
}
// (2) pro-rata exposure: share of a Q-sized flow you actually fill, by bias and side
function share(bias,side,Q){
 ORC.bias=bias; const s=calc(); const set=makerCurves(); aggBook(set,s.book.map(m=>m.h));
 let mine=0,tot=0;
 for(let k=-0.5;k<=0.5;k+=0.05){
  const rows=set.map(m=>({me:m.me,px:m.c.CALL(k)*(side>0?1+m.h/1e4:1-m.h/1e4),cap:m.share*pool}))
    .sort((a,b)=>side>0?a.px-b.px:b.px-a.px);
  let rem=Q; for(const r of rows){const t=Math.min(r.cap,rem); if(t<=0)break; if(r.me)mine+=t; tot+=t; rem-=t;}
 }
 return tot>0?mine/tot*100:0;}
out.b=[-0.10,-0.02,0,0.02,0.10].map(b=>[b,share(b,1,30),share(b,-1,30),share(b,1,150),share(b,-1,150)]);
ORC.bias=0;
`,ctx);
const o=ctx.out;
console.log('(1) THE BOOK SPREAD IS A COMPOSITE — different makers set each side\n');
console.log('     k      sets the ASK   sets the BID   book spread   tightest single maker   different?');
o.a.forEach(r=>console.log('   '+(r[0]*100).toFixed(0).padStart(4)+'%     '+r[1].padEnd(13)+r[2].padEnd(15)
 +(r[3].toFixed(2)+' bps').padStart(11)+'      '+(r[4].toFixed(2)+' bps').padStart(10)+'          '+(r[5]?'YES':'no')));
console.log('\n(2) PRO-RATA EXPOSURE — % of flow YOU fill, by your bias and the taker\'s side\n');
console.log('   your bias    30 BTC flow: buy / sell        150 BTC flow: buy / sell');
o.b.forEach(r=>console.log('    '+((r[0]>=0?'+':'')+(r[0]*100).toFixed(0)+'%').padStart(7)+'      '
 +(r[1].toFixed(0)+'%').padStart(6)+' / '+(r[2].toFixed(0)+'%').padStart(6)+'                '
 +(r[3].toFixed(0)+'%').padStart(6)+' / '+(r[4].toFixed(0)+'%').padStart(6)));
