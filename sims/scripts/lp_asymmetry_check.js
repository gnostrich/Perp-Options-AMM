const fs=require('fs'),vm=require('vm');
const ctx={console,Math,JSON,window:{}}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('app/lifecycle.js','utf8'),ctx);
vm.runInContext(`
const L=(typeof Life!=='undefined'?Life:window.Life).create({spot:65000,equityBTC:10});
out=[];
// identical bundles, one trader one LP, and MOVE THE SPOT so the perp leg is non-zero
const t=L.openBundle({legs:[{k:0.12,side:-1,qty:3}],qtyPerp:3,side:1,origin:'opened'});
const l=L.openBundle({legs:[{k:0.12,side:-1,qty:3}],qtyPerp:3,side:1,origin:'lp'});
const tid=(t.bundle||t).id||t.id, lid=(l.bundle||l).id||l.id;
const rt=L.closeBundle(tid,{closePx:0.10,spot:71500});   // spot +10%
const rl=L.closeBundle(lid,{closePx:0.10,spot:71500});
out.push(['trader',rt.optionUsd,rt.perpUsd,rt.payoutUsd, Math.abs(rt.payoutUsd-(rt.optionUsd+rt.perpUsd))<1e-9]);
out.push(['LP    ',rl.optionUsd,rl.perpUsd,rl.payoutUsd, Math.abs(rl.payoutUsd-rl.optionUsd)<1e-9]);
// and the atomicity rejection
const z=L.openBundle({legs:[{k:0.1,side:-1,qty:2}],qtyPerp:2,side:1});
out.push(['partial-close attempt', JSON.stringify(L.closeBundle((z.bundle||z).id||z.id,{closePx:0.1,qty:1}))]);
`,ctx);
console.log('  who      optionUsd    perpUsd    payoutUsd   composition correct');
ctx.out.slice(0,2).forEach(r=>console.log('  '+r[0]+'  '+String(r[1]).padStart(10)+' '+String(r[2]).padStart(10)+' '+String(r[3]).padStart(11)+'   '+r[4]));
console.log('\n  '+ctx.out[2][0]+': '+ctx.out[2][1]);
