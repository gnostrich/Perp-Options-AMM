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
const S0=65695.5;                     // perp mark at open
const c0=mk(0.60,1.2705,1.8413,0);
const k=0.12, Q=3;                    // sell 3 BTC of a +12% call
const P0=c0.CALL(k);                  // option price: FRACTION OF SPOT, per unit
out.open={S0,k,Q,P0, btc:Q*P0, usd:Q*P0*S0};
// close later, spot moved +8%, curve level unchanged
const S1=S0*1.08, c1=mk(0.60,1.2705,1.8413,0);
// the strike is a RAY: k is relative to spot, so a fixed strike K re-expresses as k1
const K=S0*(1+k), k1=K/S1-1;
const P1=c1.CALL(k1);
out.close={S1,K,k1,P1, btc:Q*P1, usd:Q*P1*S1};
// the two legs of the payout
out.optLeg={btc:Q*(P0-P1), usd:Q*(P0-P1)*S1};        // short the option: sold at P0, buys back at P1
out.perpLeg={btc:Q*(1-S0/S1), usd:Q*(S1-S0)};        // the carved slice: long Q BTC of perp
out.net={btc:Q*(P0-P1)+Q*(1-S0/S1), usd:Q*(P0-P1)*S1+Q*(S1-S0)};
`,ctx);
const o=ctx.out;
const f=(x,n=5)=>x.toFixed(n), $=x=>'$'+Math.round(x).toLocaleString();
console.log('WORKED CHAIN — perp units to dollars.  Sell 3 BTC of a +12% call, close after spot +8%.\n');
console.log('OPEN    perp mark S0     ',$(o.open.S0));
console.log('        strike k         ',(o.open.k*100).toFixed(0)+'%   -> fixed strike K = '+$(o.close.K));
console.log('        option price P0  ',f(o.open.P0),' <- a FRACTION OF SPOT, per unit');
console.log('        size Q           ',o.open.Q,'BTC');
console.log('        premium          ',f(o.open.btc,5),'BTC   =',$(o.open.usd));
console.log('\nCLOSE   perp mark S1     ',$(o.close.S1),'  (+8%)');
console.log('        same K re-reads as k1 =',(o.close.k1*100).toFixed(2)+'%  (the strike is a RAY)');
console.log('        option price P1  ',f(o.close.P1));
console.log('        buy-back cost    ',f(o.close.btc,5),'BTC   =',$(o.close.usd));
console.log('\nPAYOUT  option leg (short)',f(o.optLeg.btc,5),'BTC  =',$(o.optLeg.usd));
console.log('        carved perp leg  ',f(o.perpLeg.btc,5),'BTC  =',$(o.perpLeg.usd));
console.log('        NET              ',f(o.net.btc,5),'BTC  =',$(o.net.usd));
console.log('\n  Both legs are in BTC first. Dollars appear ONLY at the exit, at S1.');
