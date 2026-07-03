// Payer-P/L-falls self-check for the entry-425 funding column build.
// Replicates the renderBands DISPLAYED formula exactly (display-layer replica)
// against the live Store/Engine from the work copy.
const fs = require('fs'), vm = require('vm');
const file = process.argv[2] || 'work_funding.html';
const t = fs.readFileSync(file, 'utf8');
function block(id) {
  const m = t.match(new RegExp('<script id="' + id + '">([\\s\\S]*?)</script>'));
  return m[1];
}
const ctx = { console }; vm.createContext(ctx);
vm.runInContext(block('engine'), ctx);
vm.runInContext(block('state'), ctx);
const { Engine, Store } = vm.runInContext('({ Engine, Store })', ctx);

Store.addPerp('long', 100000, 20000);
Store.addPerp('short', 100000, 20000);
const s = Store.state;
// Dollar strikes (oracle 80000): call spread OTM above, put spread OTM below.
const rA = Store.openBand('call', 'put', { inner: 104000, outer: 128000 }, { inner: 60000, outer: 44000 }, 0.5, 'long');
const rB = Store.openBand('put', 'call', { inner: 60000, outer: 44000 }, { inner: 128000, outer: 160000 }, 0.5, 'short');
console.log('open A:', rA && rA.ok !== false ? 'ok' : 'REJECT ' + (rA && rA.reason),
            '| open B:', rB && rB.ok !== false ? 'ok' : 'REJECT ' + (rB && rB.reason));

// == renderBands display math, replicated verbatim (post-splice formula) ==
function displayed(b) {
  const sNormPool = Engine.getSNorm(s.pool), oracleLive = s.oracle, perpMark = s.perpMark;
  const carved = b.carved || {};
  const cN = isFinite(carved.carvedNotional) ? carved.carvedNotional : 0;
  const cE = isFinite(carved.carvedEntryEquity) ? carved.carvedEntryEquity : 0;
  const cM = isFinite(carved.entryPerpMark) ? carved.entryPerpMark : b.entry.oracle;
  const attrib = (cM > 0) ? cN * (perpMark - cM) / cM : 0;
  const eqC = cE + attrib;
  function comps(leg, wing, label) {
    const ray = K => (isFinite(K) && K > 0 && oracleLive > 0) ? K / oracleLive : NaN;
    const parts = [
      { tag: 'inner', theta: ray(leg.K_inner), funding: leg.funding_inner, sign: +1 },
      { tag: 'outer', theta: ray(leg.K_outer), funding: leg.funding_outer, sign: -1 }];
    const out = [];
    for (const p of parts) {
      if (!isFinite(p.theta) || p.theta <= 0) continue;
      const m = Engine.markLensed(wing, p.theta, sNormPool, Engine.gLoc(s.pool, p.theta, s.m));
      out.push({ label, value: p.sign * leg.N * m, funding: isFinite(p.funding) ? p.funding : 0 });
    }
    return out;
  }
  const cs = [...comps(b.sold, b.sold_wing || b.wing, 'SOLD'),
              ...comps(b.bought, b.bought_wing || b.wing, 'BOUGHT')];
  const X = cs.filter(c => c.label === 'SOLD').reduce((a, c) => a + c.value, 0);
  const Y = cs.filter(c => c.label === 'BOUGHT').reduce((a, c) => a + c.value, 0);
  const raw_net = Y - X;
  const stored = cs.reduce((a, c) => a + c.funding, 0);       // trader-pays ledger
  const col = -stored;                                        // displayed column (signed P/L effect)
  const base = b.entry.L0 * raw_net * eqC;                    // funding-exclusive P/L
  const dollar = base + col * oracleLive;                     // displayed line P/L (funding-inclusive)
  return { base, stored, col, dollar };
}

const [A, B] = s.bands;
const a0 = displayed(A), b0 = displayed(B);
console.log('pre-tick  A: stored=%s col=%s P/L=%s', a0.stored.toFixed(8), a0.col.toFixed(8), a0.dollar.toFixed(4));
console.log('pre-tick  B: stored=%s col=%s P/L=%s', b0.stored.toFixed(8), b0.col.toFixed(8), b0.dollar.toFixed(4));
if (a0.stored !== 0 || b0.stored !== 0) { console.log('FAIL: nonzero funding before any tick'); process.exit(1); }

Store.setOracle(88000);          // S != 1 so funding is nonzero; pool untouched (no arb)
for (let i = 0; i < 24; i++) Store.fundingTick(1);

const a1 = displayed(A), b1 = displayed(B);
console.log('post 24h  A: stored=%s col=%s base=%s P/L=%s  dP/L(funding)=%s',
  a1.stored.toFixed(8), a1.col.toFixed(8), a1.base.toFixed(4), a1.dollar.toFixed(4), (a1.dollar - a1.base).toFixed(4));
console.log('post 24h  B: stored=%s col=%s base=%s P/L=%s  dP/L(funding)=%s',
  b1.stored.toFixed(8), b1.col.toFixed(8), b1.base.toFixed(4), b1.dollar.toFixed(4), (b1.dollar - b1.base).toFixed(4));

const payer = a1.stored > 0 ? { n: 'A', d: a1 } : (b1.stored > 0 ? { n: 'B', d: b1 } : null);
if (!payer) { console.log('FAIL: no payer band (both stored <= 0)'); process.exit(1); }
const recv = payer.n === 'A' ? { n: 'B', d: b1 } : { n: 'A', d: a1 };
const ok1 = payer.d.col < 0 && payer.d.dollar < payer.d.base;
const ok2 = recv.d.stored >= 0 ? true : (recv.d.col > 0 && recv.d.dollar > recv.d.base);
console.log('PAYER = band ' + payer.n + ': stored>0 =', payer.d.stored > 0,
  '| displayed column negative =', payer.d.col < 0,
  '| displayed P/L FALLS vs ex-funding =', payer.d.dollar < payer.d.base, ok1 ? '  -> PASS' : '  -> FAIL');
console.log('RECEIVER = band ' + recv.n + ': stored =', recv.d.stored.toFixed(8),
  '| column =', recv.d.col.toFixed(8),
  '| displayed P/L RISES vs ex-funding =', recv.d.dollar > recv.d.base, ok2 ? '  -> PASS' : '  -> FAIL');
process.exit(ok1 && ok2 ? 0 : 1);
