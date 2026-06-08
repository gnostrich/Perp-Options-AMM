'use strict';
// Splice-level check: extract the ACTUAL spliced mpGeom/legSlipFrac/legSlipUsd text from the
// HTML and run them (with getMP_raw bound to the engine) against the slip_accept targets.
// This closes the gap that slope_test.js / slip_accept.js leave open — they exercise the engine
// + an inline formula, NOT the functions as they were spliced into the file.
// Usage: node splice_level_check.js [path-to-html]   (default: temporal_mvp_v26a.html in cwd)
const fs = require('fs'), vm = require('vm');
const path = process.argv[2] || 'temporal_mvp_v26a.html';
const html = fs.readFileSync(path, 'utf8');
const blocks = []; const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/g; let m;
while ((m = re.exec(html))) blocks.push({ a: m[1], c: m[2] });
const eng = blocks.find(x => /id="engine"/.test(x.a)).c;
const E = vm.runInNewContext('(function(){' + eng + '\n;return Engine;})()',
  { Math, Map, Float64Array, Number, Object, Array, isFinite, isNaN, JSON, console });

// pull the spliced definitions out of the file text
const mpGeomDef = (html.match(/const mpGeom = \(s\) => [^\n]+/) || [null])[0];
const fracDef = (html.match(/const legSlipFrac = \(pre, post\) => \{[\s\S]*?\n {4}\};/) || [null])[0];
const usdDef = (html.match(/const legSlipUsd = \(pre, post\) => \{[\s\S]*?\n {4}\};/) || [null])[0];
if (!mpGeomDef || !fracDef || !usdDef) {
  console.log('MISSING a spliced definition:', { mpGeom: !!mpGeomDef, legSlipFrac: !!fracDef, legSlipUsd: !!usdDef });
  process.exit(1);
}
const fns = vm.runInNewContext('(function(){' + mpGeomDef + '\n' + fracDef + '\n' + usdDef + '\n;return {legSlipFrac,legSlipUsd,mpGeom};})()',
  { Math, getMP_raw: E.getMP_raw });

const gh = E.ghCalibrate(5, 400000, 80000, 2);
const pool = Object.assign({}, gh, { alpha: 5, beta: 400000, x: 10, y: 800000 });
const targ = { 1.02: [0.99, 3.46], 1.2: [9.09, 249.49], 2: [33.34, 2246.00], 6: [71.45, 6240.94] };
console.log('Spliced slippage functions vs slip_accept targets (gamma=2):');
let allok = true;
for (const X of [1.02, 1.2, 2, 6]) {
  const post = E.arbitrageToOracle(pool, 80000 * X);
  const pct = fns.legSlipFrac(pool, post) * 100, usd = fns.legSlipUsd(pool, post);
  const [tp, tu] = targ[X];
  const ok = Math.abs(pct - tp) < 0.01 && Math.abs(usd - tu) < 0.5; allok = allok && ok;
  console.log(`  x${String(X).padEnd(5)} %=${pct.toFixed(2).padStart(7)}  $=${usd.toFixed(2).padStart(9)}  (target ${tp}% / $${tu})  ${ok ? 'OK' : 'MISMATCH'}`);
}
// no-silent-default guard: mpGeom on a state lacking ghMu must be NaN (loud), not e^0
const noMu = Object.assign({}, pool); delete noMu.ghMu;
const nanOk = Number.isNaN(fns.mpGeom(noMu));
console.log(`  no-default guard: mpGeom(no ghMu) = ${fns.mpGeom(noMu)} -> ${nanOk ? 'OK (NaN, loud)' : 'FAIL (silently defaulted!)'}`);
console.log('\n' + (allok && nanOk ? 'SPLICE-LEVEL CHECK PASS' : 'SPLICE-LEVEL CHECK FAIL'));
process.exit(allok && nanOk ? 0 : 1);
