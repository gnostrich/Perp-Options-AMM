const fs=require('fs'),vm=require('vm');
const js=/<script>([\s\S]*?)<\/script>/.exec(fs.readFileSync('app/index.html','utf8'))[1];
const el=()=>({style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',value:'0',dataset:{},
  querySelector:()=>el(),querySelectorAll:()=>[],appendChild(){},addEventListener(){},
  getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})}),width:900,height:300,
  getBoundingClientRect:()=>({left:0,top:0,width:900,height:300})});
const doc={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener(){},body:el()};
const ctx={document:doc,window:{addEventListener(){},devicePixelRatio:1},console,requestAnimationFrame:f=>f(),setTimeout,Math,JSON,Intl,out:{r:[]}};
ctx.window.document=doc; vm.createContext(ctx); vm.runInContext(js,ctx);
vm.runInContext(`
// LIKE FOR LIKE with the sheet: one book, no dispersion, no spread.
ORC.mode='manual'; P.Sbar=0.60;P.a=1.2705;P.gam=1.8413;P.kap=0; ARBD=0;
const st=calc(); const set=makerCurves();
set.forEach(m=>{m.Sbar=0.60;m.a=1.2705;m.gam=1.8413;m.kap=0;m.c=mk(0.60,1.2705,1.8413,0);});
const B=aggBook(set,set.map(()=>0));            // zero half-spread
const N=B.poolTot, c=mk(0.60,1.2705,1.8413,0), ATMp=c.ATM;
for(const k of [-0.30,-0.10,0.10,0.30,0.50]){
 const Pk=c.CALL(k), Ld=ladderAt(set,k,N,'ask');
 const sheet=0.5*0.01*(5/N)/0.01*ATMp/Pk;        // sheet 'Trade'!B35
 const app=landedFrom(Ld,5)/Ld.best-1;
 out.r.push([k,Pk,sheet*100,app*100,Math.abs(sheet-app)]);
}
out.N=N;
`,ctx);
console.log('LIKE-FOR-LIKE vs the sheet  (no dispersion, zero spread, 5 BTC, N='+ctx.out.N+')\n');
console.log('    k      leg price     sheet B35      app        |diff|');
ctx.out.r.forEach(r=>console.log('  '+r[0].toFixed(2).padStart(5)+'      '+r[1].toFixed(4)+'      '
 +r[2].toFixed(4).padStart(8)+'%   '+r[3].toFixed(4).padStart(8)+'%    '+r[4].toExponential(2)));
const m=Math.max(...ctx.out.r.map(r=>r[4]));
console.log('\n   worst absolute difference:',m.toExponential(2),m<1e-12?' -> EXACT':' -> mismatch');
