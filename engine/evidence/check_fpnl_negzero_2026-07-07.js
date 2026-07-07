// -FPNL-NEGZERO render-level self-check. Extracts the LIVE fmtNum definition
// and the LIVE funding-cell expressions from the target HTML (no retyping),
// opens two fresh bands in the vm, and renders the three funding cells:
//   pre-tick  -> must be "0.000000" (no minus)  [old HEAD: "-0.000000" = neg control]
//   post-tick -> payer column must render with a real minus (sign pin intact).
const fs = require('fs'), vm = require('vm');
const file = process.argv[2];
const t = fs.readFileSync(file, 'utf8');
function block(id) { return t.match(new RegExp('<script id="' + id + '">([\\s\\S]*?)</script>'))[1]; }

// live fmtNum (ui block source, extracted verbatim)
const fmtLine = t.match(/const fmtNum = [^\n]*;/)[0];
const fmtNum = eval('(' + fmtLine.replace(/^const fmtNum = /, '').replace(/;$/, '') + ')');

// live cell expressions, extracted verbatim from the file
const bandExpr = t.match(/const bandFundingPnl\s*=\s*([^\n]*);/)[1];      // RHS
const compArg = t.match(/display negates\)">\$\{fmtNum\((.*?), 6\)\}<\/td>/)[1];
console.log('extracted band RHS :', bandExpr);
console.log('extracted comp arg :', compArg);

const ctx = { console }; vm.createContext(ctx);
vm.runInContext(block('engine'), ctx);
vm.runInContext(block('state'), ctx);
const { Engine, Store } = vm.runInContext('({ Engine, Store })', ctx);

Store.addPerp('long', 100000, 20000);
Store.addPerp('short', 100000, 20000);
const s = Store.state;
const rA = Store.openBand('call', 'put', { inner: 104000, outer: 128000 }, { inner: 60000, outer: 44000 }, 0.5, 'long');
const rB = Store.openBand('put', 'call', { inner: 60000, outer: 44000 }, { inner: 128000, outer: 160000 }, 0.5, 'short');
if (!rA || rA.ok === false || !rB || rB.ok === false) { console.log('FAIL: band open rejected'); process.exit(1); }

function cells(b) {
  const legs = [b.sold, b.bought];
  const comps = [];
  for (const leg of legs)
    for (const f of [leg.funding_inner, leg.funding_outer])
      comps.push({ funding: isFinite(f) ? f : 0 });
  const bandFundingStored = comps.reduce((a, c) => a + c.funding, 0);
  const bandFundingPnl = eval(bandExpr);                       // live band/total RHS
  const compCells = comps.map(c => fmtNum(eval(compArg), 6));  // live component arg
  return { stored: bandFundingStored,
           band: fmtNum(bandFundingPnl, 6),
           total: fmtNum(bandFundingPnl, 6),
           comps: compCells };
}

let fail = 0;
const pre = [cells(s.bands[0]), cells(s.bands[1])];
for (const [i, p] of pre.entries()) {
  const all = [p.band, p.total, ...p.comps];
  const bad = all.filter(x => x !== '0.000000');
  console.log(`pre-tick band ${i}: band=${p.band} total=${p.total} comps=[${p.comps}] ->`,
              bad.length ? 'FAIL (' + bad + ')' : 'PASS');
  if (bad.length) fail = 1;
}

Store.setOracle(88000);
for (let i = 0; i < 24; i++) Store.fundingTick(1);

const post = [cells(s.bands[0]), cells(s.bands[1])];
const payer = post.find(p => p.stored > 0);
const recv = post.find(p => p.stored < 0);
if (!payer) { console.log('FAIL: no payer band'); process.exit(1); }
const payerOK = payer.band.startsWith('-') && parseFloat(payer.band.replace(/,/g, '')) < 0;
console.log('post-tick payer : stored=%s band cell=%s total=%s ->', payer.stored.toFixed(8), payer.band, payer.total, payerOK ? 'PASS (negative renders)' : 'FAIL');
if (!payerOK) fail = 1;
if (recv) {
  const recvOK = !recv.band.startsWith('-');
  console.log('post-tick recv  : stored=%s band cell=%s ->', recv.stored.toFixed(8), recv.band, recvOK ? 'PASS (positive renders)' : 'FAIL');
  if (!recvOK) fail = 1;
}
console.log(fail ? '=== -FPNL-NEGZERO CHECK: FAIL ===' : '=== -FPNL-NEGZERO CHECK: PASS ===');
process.exit(fail);
