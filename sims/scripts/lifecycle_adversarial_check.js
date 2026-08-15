// Adversarial pass on lifecycle.js — try to BREAK the invariants, not confirm them.
const fs=require('fs'),vm=require('vm');
const ctx={console,Math,JSON,window:{}}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('app/lifecycle.js','utf8'),ctx);
vm.runInContext(`
const L=(typeof Life!=='undefined'?Life:window.Life).create({spot:65000,equityBTC:10});
out=[];
const ident=(tag)=>{const st=L.state();
 const free=st.perps.filter(p=>!p.boundTo).reduce((t,p)=>t+p.qty,0);
 const carv=st.perps.filter(p=>p.boundTo).reduce((t,p)=>t+p.qty,0);
 const tot=st.perps.reduce((t,p)=>t+p.qty,0);
 out.push([tag,'free+carved='+(free+carv).toFixed(6)+' total='+tot.toFixed(6),Math.abs(free+carv-tot)<1e-9?'ok':'BROKEN']);};

// 1 naked option, every way I can think of
[{legs:[{k:0.1,side:-1,qty:1}]},
 {legs:[{k:0.1,side:-1,qty:1}],qtyPerp:0},
 {legs:[{k:0.1,side:-1,qty:1}],qtyPerp:-5,side:1},
 {legs:[],qtyPerp:5,side:1}].forEach((a,i)=>{
  const r=L.openBundle(a); out.push(['naked attempt '+(i+1), r&&r.ok?'ACCEPTED — BREACH':'rejected: '+((r&&r.reason)||'').slice(0,44),(r&&r.ok)?'BREACH':'ok']);});

// 2 carve more than exists
const p=L.openPerp({side:1,qty:5});
const over=L.openBundle({legs:[{k:0.1,side:-1,qty:9}],qtyPerp:9,perpId:(p.perp||p).id||p.id});
out.push(['carve 9 from a 5 BTC perp',over&&over.ok?'ACCEPTED — BREACH':'rejected',over&&over.ok?'BREACH':'ok']);
ident('after over-carve attempt');

// 3 partial close — is there ANY path?
const b=L.openBundle({legs:[{k:0.1,side:-1,qty:3}],qtyPerp:3,perpId:(p.perp||p).id||p.id});
const bid=(b.bundle||b).id||b.id;
const half=L.closeBundle(bid,{closePx:0.14,qty:1.5});
out.push(['closeBundle with a qty argument', half&&half.ok? 'accepted (qty ignored?)':'rejected','check']);
const st2=L.state(); const bb=st2.bundles.find(x=>x.id===bid);
out.push(['bundle fully closed, not half', bb?('closed='+bb.closed+' legs='+bb.legs.map(l=>l.qty).join('/')):'gone', bb&&bb.closed?'ok':'CHECK']);
ident('after close');

// 4 double close
const dbl=L.closeBundle(bid,{closePx:0.14});
out.push(['double close', dbl&&dbl.ok?'ACCEPTED — BREACH':'rejected',dbl&&dbl.ok?'BREACH':'ok']);

// 5 LP payout must exclude the perp leg
const lp=L.openBundle({legs:[{k:0.1,side:-1,qty:2}],qtyPerp:2,side:1,origin:'lp'});
const lpid=(lp.bundle||lp).id||lp.id;
const lpc=L.closeBundle(lpid,{closePx:0.14});
const le=L.ledger().slice(-1)[0];
out.push(['LP payout == option leg only', JSON.stringify({opt:le.optionUsd,perp:le.perpUsd,pay:le.payoutUsd}),
  (le.perpUsd!==0 && Math.abs(le.payoutUsd-le.optionUsd)<1e-9)?'ok':'CHECK']);
ident('final');
`,ctx);
ctx.out.forEach(r=>console.log('  '+String(r[0]).padEnd(34),String(r[1]).padEnd(52),r[2]));
