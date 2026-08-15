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
// THE SHEET (temporal_burr2_swap_pricer_6, 'Trade'):
//   B11 lambda = 0.01  "DIRECT kappa change from an ATM trade worth 1% of pool"
//   B35 slippage FRACTION  s = 1/2 * lam * (Q/N)/0.01 * ATMp / P
//   C14 kappa move        dk = w * lam * (Q/N)/0.01 * ATMp / P
const LAM_SHEET=0.01, N=200;
const c=mk(0.60,1.2705,1.8413,0);
const ATMp=c.ATM;
const sFrac=(Q,P,lam)=>0.5*lam*(Q/N)/0.01*ATMp/P;      // sheet B35, a FRACTION of price
const dPabs=(Q,lam)=>0.5*lam*(Q/N)/0.01*ATMp;          // = P * sFrac  -> P cancels
out.rows=[-0.30,-0.10,0.10,0.30,0.50].map(k=>{
 const P=c.CALL(k);
 return [k,P,sFrac(5,P,LAM_SHEET)*100,dPabs(5,LAM_SHEET)];});
// marginal slope implied by the sheet, and what the app ships
out.slopeSheet=LAM_SHEET*ATMp/(0.01*N);
out.slopeApp=[0.02,0.05,0.10].map(l=>[l,l*ATMp/(0.01*N)]);
// aggregate: parallel slopes over per-LP capital N_i  ->  one pool of the summed capital
const Ns=[95.24,38.10,19.05,47.62];
let invS=0; Ns.forEach(n=>{invS+=1/(LAM_SHEET*ATMp/(0.01*n));});
out.aggSlope=1/invS; out.aggDirect=LAM_SHEET*ATMp/(0.01*Ns.reduce((a,b)=>a+b,0));
`,ctx);
const o=ctx.out;
console.log("THE SHEET'S OWN MODEL  (lambda = 0.01 = kappa move from an ATM trade worth 1% of pool)\n");
console.log('   k      leg price P    slippage % on 5 BTC    absolute price move');
o.rows.forEach(r=>console.log('  '+r[0].toFixed(2).padStart(5)+'      '+r[1].toFixed(4)+'         '+r[2].toFixed(2).padStart(6)+'%              '+r[3].toFixed(6)));
console.log('\n  Note P CANCELS in the absolute move: P*s = 1/2*lam*(Q/N)/0.01*ATMp.');
console.log('  So the ABSOLUTE slope is flat across strikes and the FRACTIONAL one is not.');
console.log('  My "the placeholder has the wrong shape" claim was therefore WRONG.\n');
console.log('MARGINAL SLOPE  dP/dQ = lam*ATMp/(0.01*N)');
console.log('   sheet, lambda 0.01 :',o.slopeSheet.toExponential(3));
o.slopeApp.forEach(r=>console.log('   app,   lambda '+r[0].toFixed(2)+'   :',r[1].toExponential(3),'  ->',(r[1]/o.slopeSheet).toFixed(0)+'x the sheet'));
console.log('\nAGGREGATION over per-LP capital N_i = [95.24, 38.10, 19.05, 47.62]:');
console.log('   parallel combination :',o.aggSlope.toExponential(6));
console.log('   one pool of sum(N_i) :',o.aggDirect.toExponential(6));
console.log('   identical:',Math.abs(o.aggSlope-o.aggDirect)<1e-15);
