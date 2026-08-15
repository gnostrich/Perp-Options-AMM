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
const S2=65695.5;
// 1) the map reproduces today's default at the reference point
ORC.mode='oracle'; ORC.iv=0.60; ORC.bias=0; let st=calc();
out.ref=[P.Sbar, mk(P.Sbar,P.a,P.gam,P.kap).ATM];
// 2) level tracks oracle vol; break-even stays ~flat in bps
out.track=[0.20,0.40,0.60,0.90,1.20,1.60].map(v=>{
 ORC.iv=v; ORC.bias=0; const s=calc();
 return [v,P.Sbar,s.Gt,0.5*s.Gt*v*v/(MKT.turn*365)*1e4];});
// 3) bias tilts YOUR level only, and does not move YOUR mark
ORC.iv=0.60;
const pos=[{k:0.12,sz:3,side:1},{k:-0.10,sz:2,side:-1},{k:0.30,sz:1.5,side:1}];
out.bias=[-0.30,-0.10,0,0.10,0.30].map(b=>{
 ORC.bias=b; const s=calc(); const mkrs=makerCurves(); aggBook(mkrs,s.book.map(m=>m.h));
 const oth=mkrs.filter(m=>!m.me);
 const bm=(k,side)=>{const cs=oth.map(m=>side>0?m.c.CALL(k):m.c.PUT(k)),h2=oth.map(m=>m.h/1e4);
   return 0.5*(Math.min(...cs.map((c,i)=>c*(1+h2[i])))+Math.max(...cs.map((c,i)=>c*(1-h2[i]))));};
 let mv=0; pos.forEach(p=>{mv+=p.sz*bm(p.k,p.side)*S2*p.side;});
 return [b,P.Sbar,mk(P.Sbar,P.a,P.gam,P.kap).ATM,mv];});
// 4) MANUAL mode leaves S̄ alone
ORC.mode='manual'; P.Sbar=0.33; calc(); out.man=P.Sbar;
`,ctx);
const o=ctx.out;
console.log('1) reference point  IV 60%, bias 0  -> S̄ =',o.ref[0].toFixed(4),' ATM =',o.ref[1].toFixed(6),' (default S̄ was 0.60)');
console.log('\n2) level tracks the oracle; break-even in bps (turnover 0.30x/day):');
console.log('   oracle vol    solved S̄     G~        break-even bps');
o.track.forEach(r=>console.log('     '+(r[0]*100).toFixed(0).padStart(4)+'%      '+r[1].toFixed(4).padStart(8)+'   '+r[2].toFixed(3).padStart(6)+'      '+r[3].toFixed(1).padStart(6)));
console.log('\n3) your bias tilts YOUR level only — and must NOT move your mark:');
console.log('   bias      solved S̄    your ATM     your marked value');
o.bias.forEach(r=>console.log('   '+((r[0]>=0?'+':'')+(r[0]*100).toFixed(0)+'%').padStart(6)+'    '+r[1].toFixed(4).padStart(8)+'    '+r[2].toFixed(4)+'      $'+Math.round(r[3]).toLocaleString()));
const mv=o.bias.map(r=>r[3]);
console.log('   mark spread across the whole bias range:',((Math.max(...mv)/Math.min(...mv)-1)*100).toFixed(3)+'%');
console.log('\n4) MANUAL mode: set S̄=0.33 -> after calc(), S̄ =',o.man.toFixed(4),o.man===0.33?'(untouched)':'(OVERWRITTEN - bug)');
