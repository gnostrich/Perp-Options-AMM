// Same breaker, but on the app's REAL maker set across its own divergence dial.
const fs=require('fs'),vm=require('vm');
const src=fs.readFileSync('app/index.html','utf8');
const js=/<script>([\s\S]*?)<\/script>/.exec(src)[1];
const el=()=>({style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',value:'0',dataset:{},
  querySelector:()=>el(),querySelectorAll:()=>[],appendChild(){},addEventListener(){},
  getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})}),width:900,height:300,
  getBoundingClientRect:()=>({left:0,top:0,width:900,height:300})});
const doc={getElementById:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],createElement:()=>el(),addEventListener(){},body:el()};
const ctx={document:doc,window:{addEventListener(){},devicePixelRatio:1},console,requestAnimationFrame:f=>f(),setTimeout,Math,JSON,Intl,out:[]};
ctx.window.document=doc; vm.createContext(ctx); vm.runInContext(js,ctx);
vm.runInContext(`
ORC.mode='manual';
for(const D of [0,0.15,0.30,0.60,1.00]){
  ARBD=D; const st=calc(); const set=makerCurves(); aggBook(set,st.book.map(m=>m.h));
  const ask=k=>Math.min(...set.map(m=>m.c.CALL(k)*(1+m.h/1e4)));
  const bid=k=>Math.max(...set.map(m=>m.c.CALL(k)*(1-m.h/1e4)));
  let n=0,cross=0,spr=0,worst=0;
  for(let k=-0.5;k<=0.5;k+=2e-3){n++;const a=ask(k),b=bid(k);
    if(b>a){cross++; if(b-a>worst)worst=b-a;} else spr+=(a-b)/((a+b)/2)*1e4;}
  const d2=(f,k,h=2e-3)=>(f(k-h)-2*f(k)+f(k+h))/(h*h);
  let wb=1e9,neg=0,negTrade=0;
  for(let k=-0.5+2e-3;k<=0.5-2e-3;k+=2e-3){const v=d2(ask,k); if(v<wb)wb=v;
    if(v<-1e-9){neg++; if(ask(k-2e-3)>=bid(k-2e-3)&&ask(k)>=bid(k)&&ask(k+2e-3)>=bid(k+2e-3))negTrade++;}}
  out.push([D,cross/n*100,(n-cross)/n*100,spr/Math.max(n-cross,1),worst,wb,neg,negTrade]);
}
`,ctx);
console.log("THE BREAKER on the app's own maker set (price at each maker's own quote)\n");
console.log('   D     overlapping   tradeable   natural spread   worst overlap   worst butterfly  neg-flies  still executable');
ctx.out.forEach(r=>console.log('  '+r[0].toFixed(2)+'      '+r[1].toFixed(1).padStart(5)+'%      '+r[2].toFixed(1).padStart(5)+'%   '
 +r[3].toFixed(1).padStart(8)+' bps      '+r[4].toFixed(6)+'       '+r[5].toExponential(2).padStart(9)+'      '+String(r[6]).padStart(3)+'          '+String(r[7]).padStart(3)));
