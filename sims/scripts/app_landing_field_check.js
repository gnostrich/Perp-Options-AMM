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
const st=calc(), hs=st.book.map(m=>m.h);
ARBD=0.6; const set=makerCurves(); aggBook(set,hs);
out.rows=[]; const pool=MKT.pool; out.D=ARBD;
for(const k of [-0.30,0,0.12,0.35]){
  const Ld=ladderAt(set,k,pool); const r=[k,Ld.best,Ld.total];
  for(const Q of [1,20,60,150,260]){const px=landedFrom(Ld,Q);
    r.push(px===null?null:(px/Ld.best-1)*1e4);}
  out.rows.push(r);
}
out.mono=true;
for(const k of [-0.3,0,0.2]){const Ld=ladderAt(set,k,pool);let prev=-1;
  for(let Q=0.5;Q<Ld.total;Q+=0.5){const b=(landedFrom(Ld,Q)/Ld.best-1)*1e4; if(b<prev-1e-9)out.mono=false; prev=b;}}
`,ctx);
console.log('landed-price impact (bps off best), D='+ctx.out.D+', pool=200');
console.log(' k       best     bookCap   Q=1    Q=20   Q=60   Q=150  Q=260');
ctx.out.rows.forEach(r=>console.log(' '+r[0].toFixed(2).padEnd(7),r[1].toFixed(5),' ',r[2].toFixed(0).padEnd(8),
  r.slice(3).map(v=>v===null?'  NOFIT':v.toFixed(1).padStart(6)).join(' ')));
console.log('impact monotone non-decreasing in size:',ctx.out.mono);
