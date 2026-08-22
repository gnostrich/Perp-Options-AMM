// Entry 606: single spread-free aggregate = divider. LP bid/ask curves stand.
// A quote CROSSING the divider is DORMANT (not clipped, not deleted, not matched).
//   live asks at k  = { ask_i(k) : ask_i(k) >= divider(k) }   effAsk = min of these
//   live bids at k  = { bid_i(k) : bid_i(k) <= divider(k) }   effBid = max of these
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
for(const D of [0,0.15,0.30,0.60,1.00]){
  ARBD=D; const st=calc(); const set=makerCurves(); aggBook(set,st.book.map(m=>m.h));
  const tot=set.reduce((t,m)=>t+m.cap,0);
  const div=k=>set.reduce((t,m)=>t+(m.cap/tot)*m.c.CALL(k),0);   // single curve, NO spread
  const effA=k=>{const l=set.map(m=>m.c.CALL(k)*(1+m.h/1e4)).filter(a=>a>=div(k));
    return l.length?Math.min(...l):null;};
  const effB=k=>{const l=set.map(m=>m.c.CALL(k)*(1-m.h/1e4)).filter(b=>b<=div(k));
    return l.length?Math.max(...l):null;};
  let n=0,emptyA=0,emptyB=0,crossed=0,spr=0,sn=0,dormA=0,dormB=0,quotes=0;
  let prevA=null,maxJump=0;
  for(let k=-0.5;k<=0.5;k+=2e-3){n++;
    const a=effA(k),b=effB(k),d=div(k);
    set.forEach(m=>{quotes++;
      if(m.c.CALL(k)*(1+m.h/1e4)<d)dormA++;
      if(m.c.CALL(k)*(1-m.h/1e4)>d)dormB++;});
    if(a===null)emptyA++; if(b===null)emptyB++;
    if(a!==null&&b!==null){ if(b>a+1e-12)crossed++; spr+=(a-b)/((a+b)/2)*1e4; sn++; }
    if(a!==null&&prevA!==null){const j=Math.abs(a-prevA)/prevA*1e4; if(j>maxJump)maxJump=j;}
    prevA=a;
  }
  out.push([D,dormA/quotes*100,dormB/quotes*100,emptyA,emptyB,crossed,spr/Math.max(sn,1),maxJump]);
}
`,ctx);
console.log('DORMANCY RULE on the app\'s real book — single spread-free aggregate as the divider\n');
console.log('   D    asks dormant  bids dormant  empty-ask k  empty-bid k  crossed  eff spread   max ask jump');
ctx.out.forEach(r=>console.log('  '+r[0].toFixed(2)+'     '+r[1].toFixed(1).padStart(5)+'%      '+r[2].toFixed(1).padStart(5)+'%       '
 +String(r[3]).padStart(4)+'        '+String(r[4]).padStart(4)+'       '+String(r[5]).padStart(3)+'    '
 +r[6].toFixed(1).padStart(7)+' bps   '+r[7].toFixed(1).padStart(7)+' bps'));
console.log('\nStructural guarantee (max >= mean >= min): the dearest maker\'s ask is always >= the');
console.log('divider and the cheapest maker\'s bid always <=, so NEITHER side can ever be empty.');
