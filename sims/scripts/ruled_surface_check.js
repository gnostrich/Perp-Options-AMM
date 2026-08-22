// EXECUTABLE RULINGS REGISTER (operator entry 617). RED = hand-back is BLOCKED.
// Every entry cites the operator ruling it enforces. A regression the operator has
// to point out means a missing assertion HERE.
const fs=require('fs');
const h=fs.readFileSync('app/index.html','utf8');
let fail=0; const ok=(c,m)=>{console.log((c?'  ok    ':'  FAIL  ')+m); if(!c)fail++;};

// e614/616: header nav is EXACTLY Transact | Portfolio
const navs=[...h.matchAll(/data-nav="([a-z]+)"/g)].map(m=>m[1]);
ok(JSON.stringify([...new Set(navs)])==='["transact","portfolio"]','nav == [transact, portfolio], nothing else (e614/616)');
// e614/615/616: subtabs are EXACTLY Create Perp | Trade Bands | Earn
const subs=[...h.matchAll(/data-sub="([a-z]+)"/g)].map(m=>m[1]);
ok(JSON.stringify([...new Set(subs)])==='["perp","bands","earn"]','subtabs == [create perp, trade bands, earn] (e614-616)');
ok(/Executed on Hyperliquid/.test(h),'"Executed on Hyperliquid" present (e616)');
// e609: no third column; two-column grid
ok(/grid-template-columns:430px 1fr[;}]/.test(h)||/grid-template-columns:440px 1fr[;}]/.test(h),'two-column layout, no third column (e609)');
// e609/610: the v28 background
ok(/url\('bg\.webp'\)/.test(h)&&fs.existsSync('app/bg.webp'),'v28 backdrop wired (e609/610)');
// e616: chart tabs Perp Mark | Options Pricing; dollar strikes with Put/Call
ok(/Perp Mark Pricing/.test(h)&&/Options Pricing/.test(h),'chart tabs perp-mark | options-pricing (e616)');
ok(/← Put/.test(h)&&/Call →/.test(h)&&/Strike Price/.test(h),'options chart: dollar strikes, Put ← → Call (e616)');
// e606/607: dormancy divider is the pricing rule (in Book)
const bk=fs.readFileSync('app/book.js','utf8');
ok(/DORMANCY DIVIDER/.test(bk),'dormancy divider is the pricing rule in Book (e606/607)');
// e607: LP inputs are exposure limits ONLY — no notional/leverage input on Earn
ok(/long limit E\+/.test(h)&&/short limit E−/.test(h),'Earn takes exposure limits (e607)');
{const earn=h.slice(h.indexOf('id="sub-earn"'),h.indexOf('</section>',h.indexOf('id="sub-earn"')));
 ok(!/<(input|select)[^>]*(lev|notional)|label>\s*(leverage|notional)/i.test(earn),'Earn has NO notional/leverage input (e607; perp-side leverage is a different surface)');}
// e587: bundle atomic — closeBundle takes no size anywhere in the UI layer
ok(!/closeBundle\([^)]*qty/.test(h),'no sized closeBundle call in the UI (e587)');
// e592/578: close prices from Book closePx (self-excluded), never a constant
ok(/closePx\(/.test(h)&&!/closePx:0\.\d+/.test(h),'closes use Book.closePx, no hardcoded close price (e578/592, tester #F-close)');
// e566: no competitor maker names on the surface
ok(!/MM-Kappa|MM-Delta|MM-Sigma/.test(h),'no competitor names rendered (e566)');
// Q3: no per-position liquidation price
// forbid a per-position liq-price READOUT (label+value cell); the honest denial sentence is allowed
ok(!/liq(uidation)? price<\/(label|span)>|Liquidation Price<\/th>/i.test(h),'no per-position liquidation-price readout (Q3)');
// tester #9 class: no innerHTML rebuild of a control container on input events
ok(!/oninput[^}]*innerHTML/.test(h),'no drag-destroying innerHTML rebuild on input (tester #9)');
// dead-control class: every id read is declared
const read=new Set([...h.matchAll(/\$\('([A-Za-z0-9_-]+)'\)/g)].map(m=>m[1]));
const decl=new Set([...h.matchAll(/id="([A-Za-z0-9_-]+)"/g)].map(m=>m[1]));
const missing=[...read].filter(x=>!decl.has(x));
ok(missing.length===0,'no dead controls — ids read are declared ('+(missing.join(',')||'none')+')');
console.log(fail?('\nBLOCKED — '+fail+' ruled-surface failure(s)'):'\nRULED SURFACE GREEN');
process.exit(fail?1:0);
