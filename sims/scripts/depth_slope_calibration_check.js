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
const pool=MKT.pool, S2=65695.5;
const c=mk(DEF.Sbar,DEF.a,DEF.gam,DEF.kap);
// (1) the PLACEHOLDER I invented for the cloud
const placeholder=lam=>(lam*c.ATM)/(0.01*pool);
// (2) the DERIVED slope: a swap moves kappa, and the price moves by dC/dkappa.
//     BURR2 workbook (entry 532): a trade of 2.5% of pool moved kappa by +0.007030
const dkap_dfrac=0.007030/0.025;
const dC=(k,h=1e-4)=>(mk(DEF.Sbar,DEF.a,DEF.gam,DEF.kap+h).CALL(k)
                     -mk(DEF.Sbar,DEF.a,DEF.gam,DEF.kap-h).CALL(k))/(2*h);
out.rows=[-0.30,-0.10,0,0.12,0.30,0.50].map(k=>{
 const d=dC(k), derived=Math.abs(d)*dkap_dfrac/pool, ph=placeholder(0.10);
 return [k,c.CALL(k),d,derived,ph,ph/derived];});
// what each implies for a 1 BTC and a 20 BTC trade at k=0.12
const k0=0.12, base=c.CALL(k0);
out.imp=[1,20,60].map(Q=>{
 const d=Math.abs(dC(k0))*dkap_dfrac/pool, ph=placeholder(0.10);
 return [Q,0.5*ph*Q/base*1e4,0.5*d*Q/base*1e4];});
`,ctx);
const o=ctx.out;
console.log('WHERE THE DEPTH SLOPE COMES FROM\n');
console.log('   k       C(k)      dC/dκ     DERIVED slope    PLACEHOLDER slope    placeholder is');
o.rows.forEach(r=>console.log('  '+r[0].toFixed(2).padStart(5)+'   '+r[1].toFixed(4)+'   '+r[2].toFixed(4).padStart(8)
 +'     '+r[3].toExponential(2)+'         '+r[4].toExponential(2)+'        '+r[5].toFixed(1)+'x too steep'));
console.log('\nWHAT THAT MEANS FOR A TRADE AT k=12%  (impact in bps of the option price)');
console.log('    size      placeholder (shipped)     derived from the kernel');
o.imp.forEach(r=>console.log('   '+String(r[0]).padStart(4)+' BTC      '+r[1].toFixed(1).padStart(9)+' bps          '+r[2].toFixed(1).padStart(9)+' bps'));
