/* book_model_check.js — proof harness for app/book.js (the ONE aggregate-then-
   spread model). Every exported function is exercised. Asserts with printed
   numbers, per the build order:
     1. ask > bid at 201 strikes x 5 dispersions -> 0 crossings
     2. buy pays MORE with size, sell receives LESS -- several strikes/sizes
     3. apportion(30) sums to exactly 30; shares sum to 1
     4. mark -> close is a cost on both sides, never a gain
     5. impact matches the sheet formula to ~1e-12 in the identical-makers case
     6. self-exclusion: sweeping YOUR level must not move the mark
   Bonus coverage (still exercising exported surface, not separately numbered):
     - midPut via put-call parity  mid(k) - midPut(k) == -k
     - capacity == sum of maker caps
     - landed() returns null beyond capacity
     - no-counterparty guard: excluding the only maker -> mark NaN, closePx null
*/
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
let FAIL = 0;
function assert(cond, msg) {
  if (!cond) { FAIL++; console.log('  [FAIL] ' + msg); }
  else console.log('  [ok]   ' + msg);
}

// ---- pull mk() (Burr-2 kernel) out of app/index.html, same technique every
// other sims/scripts/*_check.js uses: extract the <script> block and run it
// in a stubbed DOM context. We only need `mk`. -----------------------------
const html = fs.readFileSync(path.join(ROOT, 'app', 'index.html'), 'utf8');
const js = /<script>([\s\S]*?)<\/script>/.exec(html)[1];
const el = () => ({ style: {}, classList: { add(){}, remove(){} }, innerHTML: '', textContent: '', value: '0',
  dataset: {}, querySelector: () => el(), querySelectorAll: () => [], appendChild(){}, addEventListener(){},
  getContext: () => new Proxy({}, { get: () => () => ({ addColorStop(){} }) }), width: 900, height: 300,
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 900, height: 300 }) });
const doc = { getElementById: () => el(), querySelector: () => el(), querySelectorAll: () => [],
  createElement: () => el(), addEventListener(){}, body: el() };
const ctx = { document: doc, window: { addEventListener(){}, devicePixelRatio: 1 }, console, requestAnimationFrame: f => f(),
  setTimeout, Math, JSON, Intl };
ctx.window.document = doc;
vm.createContext(ctx);
vm.runInContext(js, ctx);
const mk = ctx.mk; // Burr-2 kernel: mk(Sbar,a,gam,kap) -> {CALL,PUT,ATM,...}

// ---- load the model under test -------------------------------------------
const Book = require(path.join(ROOT, 'app', 'book.js'));

// ---- maker construction, mirroring index.html's makerCurves(), parameterised
// by a divergence dial D so we can sweep "5 dispersions". ------------------
const DEF = { Sbar: 0.60, a: 1.2705, gam: 1.8413, kap: 0 };
function makersAt(D) {
  return [
    { name: 'YOU', me: true, cap: 22, hBps: 30, curve: mk(DEF.Sbar, DEF.a, DEF.gam, DEF.kap) },
    { name: 'MM-Kappa', me: false, cap: 38, hBps: 34, curve: mk(DEF.Sbar * (1 - 0.035 * D), DEF.a * (1 - 0.06 * D), DEF.gam * (1 + 0.03 * D), DEF.kap + 0.05 * D) },
    { name: 'MM-Delta', me: false, cap: 19, hBps: 41, curve: mk(DEF.Sbar * (1 + 0.05 * D), DEF.a * (1 + 0.06 * D), DEF.gam * (1 - 0.05 * D), DEF.kap - 0.06 * D) },
    { name: 'MM-Sigma', me: false, cap: 48, hBps: 27, curve: mk(DEF.Sbar * (1 + 0.01 * D), DEF.a * (1 + 0.01 * D), DEF.gam, DEF.kap + 0.02 * D) }
  ];
}

console.log('=== book_model_check.js ===\n');

// ============================================================ TEST 1 ======
console.log('1. ask > bid at 201 strikes x 5 dispersions -> 0 crossings');
{
  const dispersions = [0, 0.15, 0.30, 0.60, 1.00];
  let totalChecked = 0, totalCrossed = 0;
  dispersions.forEach(D => {
    const book = Book.make(makersAt(D));
    let crossed = 0, n = 0;
    for (let i = 0; i <= 200; i++) {
      const k = -0.5 + 1.0 * i / 200;
      const a = book.ask(k), b = book.bid(k);
      n++;
      if (!(a > b)) crossed++;
    }
    totalChecked += n; totalCrossed += crossed;
    console.log(`     D=${D.toFixed(2)}  strikes=${n}  crossed=${crossed}  hAgg=${(book.hAgg*1e4).toFixed(2)}bps`);
  });
  assert(totalCrossed === 0, `0 crossings across ${totalChecked} (strike,dispersion) pairs (got ${totalCrossed})`);
}

// ============================================================ TEST 2 ======
console.log('\n2. buy pays MORE with size, sell receives LESS');
{
  const book = Book.make(makersAt(0.6));
  const strikes = [-0.30, -0.10, 0.00, 0.10, 0.30];
  const sizes = [1, 5, 20, 50];
  let ok = true;
  strikes.forEach(k => {
    const askTop = book.ask(k), bidTop = book.bid(k);
    let prevBuy = askTop, prevSell = bidTop;
    console.log(`   k=${(k*100).toFixed(0)}%  ask=${askTop.toFixed(6)}  bid=${bidTop.toFixed(6)}`);
    sizes.forEach(Q => {
      const buyPx = book.landed(k, Q, 'buy');
      const sellPx = book.landed(k, Q, 'sell');
      const monotoneBuy = buyPx >= prevBuy;   // pays more (or equal at Q->0) as size grows
      const monotoneSell = sellPx <= prevSell; // receives less (or equal) as size grows
      const worseThanTop = buyPx > askTop && sellPx < bidTop;
      console.log(`     Q=${String(Q).padStart(2)}  buy=${buyPx.toFixed(6)} (>ask: ${buyPx>askTop})   sell=${sellPx.toFixed(6)} (<bid: ${sellPx<bidTop})`);
      if (!(monotoneBuy && monotoneSell && worseThanTop)) ok = false;
      prevBuy = buyPx; prevSell = sellPx;
    });
  });
  assert(ok, 'buy landed price rises with Q above ask; sell landed price falls with Q below bid, at every strike tested');

  // capacity boundary: beyond total capacity, landed() is null (no fabricated fill)
  const cap = book.capacity;
  assert(book.landed(0, cap + 1, 'buy') === null, `landed() beyond capacity (${cap} BTC) returns null, not a price`);
  assert(book.landed(0, cap - 1, 'buy') !== null, 'landed() within capacity returns a real price');
}

// ============================================================ TEST 3 ======
console.log('\n3. apportion(30) sums to exactly 30; shares sum to 1');
{
  const book = Book.make(makersAt(0.3));
  const Q = 30;
  const parts = book.apportion(Q);
  const sumQ = parts.reduce((t, p) => t + p.qty, 0);
  console.log('   apportion(30):', parts.map(p => `${p.name}=${p.qty.toFixed(6)}`).join('  '));
  console.log(`   sum = ${sumQ} , |sum-30| = ${Math.abs(sumQ - Q).toExponential(3)}`);
  assert(Math.abs(sumQ - Q) < 1e-12, 'apportion(30) sums to 30 within 1e-12');

  const shares = book.shares();
  const sumShare = shares.reduce((t, s) => t + s.share, 0);
  console.log('   shares():', shares.map(s => `${s.name}=${s.share.toFixed(6)}`).join('  '));
  console.log(`   sum = ${sumShare} , |sum-1| = ${Math.abs(sumShare - 1).toExponential(3)}`);
  assert(Math.abs(sumShare - 1) < 1e-12, 'shares() sums to 1 within 1e-12');

  // apportion respects capital weighting exactly (qty_i / Q === share_i)
  let weightOk = true;
  parts.forEach((p, i) => { if (Math.abs(p.qty / Q - shares[i].share) > 1e-12) weightOk = false; });
  assert(weightOk, 'apportion is exactly pro-rata by capital share (qty_i/Q === share_i)');
}

// ============================================================ TEST 4 ======
console.log('\n4. mark -> close is a COST on both sides, never a gain');
{
  const book = Book.make(makersAt(0.6));
  const strikes = [-0.30, -0.10, 0.00, 0.10, 0.30];
  const sizes = [1, 8, 25];
  let ok = true;
  strikes.forEach(k => {
    const mrk = book.mark(k, 'call', true); // your own curve excluded, as a real close would be
    sizes.forEach(Q => {
      const sellClose = book.closePx(k, 'sell', Q, true); // closing a LONG: you sell
      const buyClose = book.closePx(k, 'buy', Q, true);   // closing a SHORT: you buy
      const costOnLong = mrk - sellClose;   // must be >= 0 (you get LESS than mark closing a long)
      const costOnShort = buyClose - mrk;   // must be >= 0 (you pay MORE than mark closing a short)
      console.log(`   k=${(k*100).toFixed(0)}% Q=${Q}  mark=${mrk.toFixed(6)}  sellClose=${sellClose.toFixed(6)} (cost ${costOnLong.toFixed(6)})  buyClose=${buyClose.toFixed(6)} (cost ${costOnShort.toFixed(6)})`);
      if (!(costOnLong >= -1e-12 && costOnShort >= -1e-12)) ok = false;
    });
  });
  assert(ok, 'mark - sellClose >= 0 AND buyClose - mark >= 0 at every (strike,size) tested — close never beats mark');
}

// ============================================================ TEST 5 ======
console.log('\n5. impact matches the sheet formula to ~1e-12 (identical-makers case)');
{
  // N identical makers, each capital C, vs ONE maker with capital N*C. Parallel
  // combination collapses to exactly one pool of the summed capital:
  //   1/slope = Sum (0.01*cap_i)/(LAM*ATM_i)
  const curve = mk(0.62, 1.30, 1.9, 0.02);
  const N = 4, C = 15, LAM = 0.01;
  const identical = [];
  for (let i = 0; i < N; i++) identical.push({ name: 'M' + i, me: false, cap: C, hBps: 25, curve });
  const bookMulti = Book.make(identical, { LAM });
  const bookSingle = Book.make([{ name: 'SOLO', me: false, cap: N * C, hBps: 25, curve }], { LAM });

  const slopeMulti = bookMulti.slope(0);
  const slopeSingle = bookSingle.slope(0);
  console.log(`   ${N} identical makers (cap ${C} each): slope = ${slopeMulti}`);
  console.log(`   1 maker with pooled capital ${N*C}:      slope = ${slopeSingle}`);
  console.log(`   |diff| = ${Math.abs(slopeMulti - slopeSingle).toExponential(3)}`);
  assert(Math.abs(slopeMulti - slopeSingle) < 1e-12, 'N identical makers collapse to one pool of Sum(cap) to within 1e-12');

  // direct formula check against the sheet's closed form
  const sheetSlope = LAM * curve.ATM / (0.01 * (N * C));
  console.log(`   sheet closed form LAM*ATM/(0.01*N*C) = ${sheetSlope}`);
  console.log(`   |diff vs bookMulti.slope| = ${Math.abs(slopeMulti - sheetSlope).toExponential(3)}`);
  assert(Math.abs(slopeMulti - sheetSlope) < 1e-12, 'book.slope() matches the closed-form sheet formula to within 1e-12');
}

// ============================================================ TEST 6 ======
console.log('\n6. self-exclusion: sweeping YOUR level must not move the mark');
{
  const others = () => [
    { name: 'MM-Kappa', me: false, cap: 38, hBps: 34, curve: mk(DEF.Sbar * 0.97, DEF.a, DEF.gam, DEF.kap) },
    { name: 'MM-Delta', me: false, cap: 19, hBps: 41, curve: mk(DEF.Sbar * 1.05, DEF.a, DEF.gam, DEF.kap) }
  ];
  const k = 0.10;
  const sweepSbar = [0.10, 0.30, 0.50, 0.60, 0.80, 0.95];
  let marks = [];
  sweepSbar.forEach(sb => {
    const makers = [{ name: 'YOU', me: true, cap: 22, hBps: 30, curve: mk(sb, DEF.a, DEF.gam, DEF.kap) }, ...others()];
    const book = Book.make(makers);
    const m = book.mark(k, 'call', true);
    marks.push(m);
    console.log(`   your Sbar=${sb.toFixed(2)}  mark(excludeMe=true)=${m.toFixed(8)}`);
  });
  const spread = Math.max(...marks) - Math.min(...marks);
  console.log(`   mark range across the whole Sbar sweep = ${spread.toExponential(3)}`);
  assert(spread < 1e-12, 'mark(k, side, excludeMe=true) does not move at all as YOUR level is swept');

  // contrast: WITHOUT self-exclusion the mark DOES move (sanity that the guard is doing something)
  let marksIncl = sweepSbar.map(sb => {
    const makers = [{ name: 'YOU', me: true, cap: 22, hBps: 30, curve: mk(sb, DEF.a, DEF.gam, DEF.kap) }, ...others()];
    return Book.make(makers).mark(k, 'call', false);
  });
  const spreadIncl = Math.max(...marksIncl) - Math.min(...marksIncl);
  console.log(`   (contrast) mark(excludeMe=false) range across the same sweep = ${spreadIncl.toExponential(3)}`);
  assert(spreadIncl > 1e-6, 'sanity: WITHOUT self-exclusion the mark visibly moves with your own quote (confirms the guard is load-bearing)');

  // no-counterparty guard: exclude the only maker -> no price, not a fabricated one
  const soleBook = Book.make([{ name: 'YOU', me: true, cap: 22, hBps: 30, curve: mk(DEF.Sbar, DEF.a, DEF.gam, DEF.kap) }]);
  const soleMark = soleBook.mark(0, 'call', true);
  const soleClose = soleBook.closePx(0, 'sell', 1, true);
  console.log(`   sole maker, excludeMe=true -> mark=${soleMark}  closePx=${soleClose}`);
  assert(Number.isNaN(soleMark), 'excluding the only maker leaves no price for mark() -> NaN, not fabricated');
  assert(soleClose === null, 'excluding the only maker leaves no price for closePx() -> null, not fabricated');
}

// ======================================================= BONUS: midPut ====
console.log('\nbonus. midPut via put-call parity  mid(k) - midPut(k) === -k');
{
  const book = Book.make(makersAt(0.6));
  const strikes = [-0.4, -0.2, -0.05, 0, 0.05, 0.2, 0.4];
  let ok = true;
  strikes.forEach(k => {
    const c = book.mid(k), p = book.midPut(k);
    const resid = (c - p) - (-k);
    console.log(`   k=${(k*100).toFixed(0)}%  mid=${c.toFixed(6)}  midPut=${p.toFixed(6)}  (C-P)-(-k)=${resid.toExponential(3)}`);
    if (Math.abs(resid) > 1e-9) ok = false;
  });
  assert(ok, 'mid(k) - midPut(k) === -k to 1e-9 at every strike tested (parity is preserved through weighted aggregation)');
}

// ======================================================= BONUS: capacity ==
console.log('\nbonus. capacity === sum of maker caps');
{
  const makers = makersAt(0.4);
  const book = Book.make(makers);
  const sumCap = makers.reduce((t, m) => t + m.cap, 0);
  console.log(`   capacity=${book.capacity}  sum(caps)=${sumCap}`);
  assert(book.capacity === sumCap, 'capacity is exactly Sum(cap_i)');
}

console.log('\n=== ' + (FAIL === 0 ? 'ALL PASS' : FAIL + ' FAILURE(S)') + ' ===');
process.exit(FAIL === 0 ? 0 : 1);
