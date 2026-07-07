// -FPNL-NEGZERO RECHECK — LIVE (targeted, on promoted HEAD 51342574; 2-expression
// display fix on 4bc939ec: bandFundingPnl + component cell normalize JS −0).
// Derived from verify/pw_funding_pnl_live.mjs — measurement expressions VERBATIM
// (readBandsDom, parseUSD, setup flow) so 4bc939ec numbers are directly comparable.
// Checks:
//   Z1 fresh bands, PRE-TICK: every funding cell (band + component + total rows)
//      renders exactly "0.000000" — NO minus sign ('-' or U+2212) anywhere
//   Z2 stored ledger truly 0 pre-tick (the cells are −0-normalized zeros, not tiny negatives)
//   Z3 oracle→88000, 24 ticks: exactly one PAYER negative + one RECEIVER positive
//   Z4 numbers consistent with the 4bc939ec pass: payer −0.000469 / receiver +0.000531 (6dp),
//      payer P/L −$4.50→−$45.75 falls, receiver $5.53→$52.25 rises (±$0.02)
//   Z5 sign pin intact: cell == −Σ stored trader-pays (6dp); band == Σ comps
//   Z6 zero console errors / pageerrors / dialogs
//   Z7 build md5 unchanged (READ-ONLY)
// Run: cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/pw_fpnl_negzero_recheck.mjs A|B
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const RUN = (process.argv[2] || 'A').toUpperCase();
const here = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.resolve(here, '../builds/HEAD_temporal_mvp_v28_lens.html');
const EVID = path.resolve(here, '../../evidence/fpnl_negzero_recheck');
fs.mkdirSync(EVID, { recursive: true });
const LOG = []; const log = (s) => { LOG.push(s); console.log(s); };
const md5 = (f) => execSync('md5sum ' + f).toString().split(' ')[0];
const CHECKS = []; const ck = (n, p, d) => { CHECKS.push({ n, p: !!p, d }); log(`${p ? 'PASS' : 'FAIL'} ${n}  ${d}`); };

const md5pre = md5(BUILD);
log(`=== -FPNL-NEGZERO RECHECK run ${RUN}  build md5 ${md5pre} ===`);
const errors = [], dialogs = [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('console', m => { if (m.type() === 'error') errors.push('console:' + m.text()); });
page.on('pageerror', e => errors.push('pageerror:' + e.message));
page.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });

await page.goto('file://' + BUILD);
await page.waitForTimeout(600);

const setField = async (id, v) => page.evaluate(({ id, v }) => {
  const e = document.getElementById(id); e.value = String(v);
  e.dispatchEvent(new Event('input', { bubbles: true }));
  e.dispatchEvent(new Event('change', { bubbles: true }));
}, { id, v });
const click = async (sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; e.click(); return true; }, sel);
const gotoPortfolioBands = async () => {
  await page.evaluate(() => { const n = document.querySelector('.page-nav-link[data-page="portfolio"]'); if (n) n.click(); });
  await page.evaluate(() => { const t = document.querySelector('.tab[data-subtab-pf="bands"]'); if (t) t.click(); });
  await page.waitForTimeout(150);
};
const gotoTransact = async () => {
  await page.evaluate(() => { const n = document.querySelector('.page-nav-link[data-page="transact"]'); if (n) n.click(); });
  await page.waitForTimeout(150);
};

// ── open two OPPOSITE bands via the real UI (same setup as 4bc939ec pass) ──
await gotoTransact();
await click('.tab[data-subtab="bands"]'); await page.waitForTimeout(100);
await page.evaluate(() => { const p = document.getElementById('band-dir-sell'); if (p.dataset.dir !== 'long') p.click(); });
await setField('sold-inner', 120000); await setField('bought-inner', 48000); await setField('band-notional', 0.03);
await page.waitForTimeout(250); await click('#btn-execute'); await page.waitForTimeout(250);
await page.evaluate(() => { const p = document.getElementById('band-dir-sell'); if (p.dataset.dir !== 'short') p.click(); });
await setField('sold-inner', 60000); await setField('bought-inner', 100000); await setField('band-notional', 0.03);
await page.waitForTimeout(250); await click('#btn-execute'); await page.waitForTimeout(250);

// readBandsDom VERBATIM from pw_funding_pnl_live.mjs
const readBandsDom = () => page.evaluate(() => {
  const out = {}; let cur = null;
  for (const tr of document.querySelectorAll('#bands-tbody tr')) {
    if (tr.classList.contains('pf-band-row')) {
      cur = tr.getAttribute('data-band-group');
      const td = tr.querySelectorAll('td');
      out[cur] = {
        bandFundingCell: td[6].textContent.trim(),
        bandFundingTitle: td[6].getAttribute('title') || '',
        compFunding: [], total: null,
      };
    } else if (tr.classList.contains('pf-comp-row') && cur) {
      const td = tr.querySelectorAll('td');
      out[cur].compFunding.push({
        label: td[0].innerText.replace(/\s+/g, ' ').trim(),
        cell: td[6].textContent.trim(),
        title: td[6].getAttribute('title') || '',
      });
    } else if (tr.classList.contains('pf-total-row') && cur) {
      const td = tr.querySelectorAll('td');
      const dollar = tr.querySelector('.pf-dollar-cell');
      out[cur].total = {
        fundingCell: td[6].textContent.trim(),
        fundingTitle: td[6].getAttribute('title') || '',
        dollarCell: dollar ? dollar.textContent.trim() : null,
        dollarTitle: dollar ? (dollar.getAttribute('title') || '') : '',
      };
    }
  }
  const stored = {};
  for (const b of Store.state.bands) {
    if (b.status !== 'open') continue;
    let s = 0;
    for (const lk of ['sold', 'bought']) for (const sk of ['inner', 'outer']) {
      const v = b[lk]['funding_' + sk]; if (isFinite(v)) s += v;
    }
    stored[b.id] = s;
  }
  return { dom: out, stored, t: Store.state.t, oracle: Store.state.oracle };
});
const parseUSD = (s) => parseFloat(s.replace(/−/g, '-').replace(/[$,]/g, ''));
const hasMinus = (s) => /[-−]/.test(s);

// ── Z1/Z2 FRESH-BAND pre-tick read (before oracle move AND after — both must be clean) ─
await gotoPortfolioBands();
const fresh = await readBandsDom();
const ids = Object.keys(fresh.dom);
const collectFundingCells = (snap) => ids.flatMap(id => [
  { where: `${id} band-row`, cell: snap.dom[id].bandFundingCell },
  ...snap.dom[id].compFunding.map((c, i) => ({ where: `${id} comp-${i} (${c.label.slice(0, 12)})`, cell: c.cell })),
  { where: `${id} total-row`, cell: snap.dom[id].total.fundingCell },
]);
const freshCells = collectFundingCells(fresh);
log('FRESH (pre-oracle-move) funding cells: ' + freshCells.map(c => `[${c.where}]="${c.cell}"`).join(' '));
await page.screenshot({ path: path.join(EVID, `${RUN}_bands_fresh.png`), fullPage: false });
ck('Z1a fresh bands: every funding cell renders exactly "0.000000" (band+comp+total)',
  ids.length === 2 && freshCells.length === 8 && freshCells.every(c => c.cell === '0.000000'),
  freshCells.map(c => `${c.where}="${c.cell}"`).join('  '));
ck('Z1b NO minus sign (ASCII or U+2212) in any pre-tick funding cell',
  freshCells.every(c => !hasMinus(c.cell)),
  `minus-bearing: ${JSON.stringify(freshCells.filter(c => hasMinus(c.cell)))}`);
ck('Z2 stored ledger truly 0 pre-tick', ids.every(id => fresh.stored[id] === 0),
  ids.map(id => `${id}: stored=${fresh.stored[id]}`).join('  '));

// oracle move (funding alive) — cells must STILL be clean zero pre-tick
await setField('kpi-oracle', 88000); await page.waitForTimeout(300);
await gotoPortfolioBands();
const pre = await readBandsDom();
const preCells = collectFundingCells(pre);
log(`PRE-TICK (oracle=${pre.oracle}) funding cells: ` + preCells.map(c => `[${c.where}]="${c.cell}"`).join(' '));
await page.screenshot({ path: path.join(EVID, `${RUN}_bands_pretick_oracle88k.png`), fullPage: false });
ck('Z1c post-oracle-move pre-tick: still exactly "0.000000", no minus, on all 8 cells',
  preCells.length === 8 && preCells.every(c => c.cell === '0.000000' && !hasMinus(c.cell)),
  preCells.map(c => `${c.where}="${c.cell}"`).join('  '));

// ── Z3/Z4/Z5 24 funding ticks ──────────────────────────────────────────────
for (let i = 0; i < 24; i++) await click('#btn-tick');
await page.waitForTimeout(300);
const post = await readBandsDom();
log(`POST-TICK t=${post.t} oracle=${post.oracle} ` + ids.map(id =>
  `${id}: funding=${post.dom[id].bandFundingCell} P/L=${post.dom[id].total.dollarCell}`).join('  |  '));
await page.screenshot({ path: path.join(EVID, `${RUN}_bands_posttick.png`), fullPage: false });

const rows = ids.map(id => ({
  id,
  preF: parseFloat(pre.dom[id].bandFundingCell), postF: parseFloat(post.dom[id].bandFundingCell),
  preP: parseUSD(pre.dom[id].total.dollarCell), postP: parseUSD(post.dom[id].total.dollarCell),
  stored: post.stored[id],
}));
const payer = rows.find(r => r.postF < 0);
const recv = rows.find(r => r.postF > 0);
ck('Z3 post-tick: exactly one PAYER (negative cell) + one RECEIVER (positive)',
  !!payer && !!recv && payer.id !== recv.id,
  rows.map(r => `${r.id}: funding=${r.postF}`).join('  '));
ck('Z3b payer cell text carries a minus on screen',
  payer && hasMinus(post.dom[payer.id].bandFundingCell),
  payer ? `"${post.dom[payer.id].bandFundingCell}"` : 'no payer');
// Z4 consistency with the recorded 4bc939ec pass (same setup, same tick count)
const near = (a, b, tol) => Math.abs(a - b) <= tol;
ck('Z4a payer cell −0.000469 / receiver +0.000531 (6dp, == 4bc939ec pass)',
  payer && recv && near(payer.postF, -0.000469, 5e-7) && near(recv.postF, 0.000531, 5e-7),
  `payer=${payer && payer.postF} recv=${recv && recv.postF}`);
ck('Z4b payer P/L −$4.50→−$45.75 FALLS; receiver $5.53→$52.25 RISES (±$0.02, == 4bc939ec)',
  payer && recv && payer.postP < payer.preP && recv.postP > recv.preP
  && near(payer.preP, -4.50, 0.02) && near(payer.postP, -45.75, 0.02)
  && near(recv.preP, 5.53, 0.02) && near(recv.postP, 52.25, 0.02),
  `payer $${payer && payer.preP}→$${payer && payer.postP}  recv $${recv && recv.preP}→$${recv && recv.postP}`);
const signPin = rows.every(r => Math.abs(r.postF - (-r.stored)) < 5e-7);
ck('Z5 sign pin: displayed cell == −Σ stored trader-pays (6dp)',
  signPin, rows.map(r => `${r.id}: cell=${r.postF} −stored=${(-r.stored).toFixed(8)}`).join('  '));
const compSum = ids.every(id => {
  const s = post.dom[id].compFunding.reduce((a, c) => a + parseFloat(c.cell), 0);
  return Math.abs(s - parseFloat(post.dom[id].bandFundingCell)) < 5e-6;
});
ck('Z5b band funding cell == Σ component funding cells',
  compSum, ids.map(id => `${id}: comps=[${post.dom[id].compFunding.map(c => c.cell).join(',')}] band=${post.dom[id].bandFundingCell}`).join('  '));

// ── Z6/Z7 hygiene ──────────────────────────────────────────────────────────
ck('Z6 zero console errors / pageerrors / dialogs', errors.length === 0 && dialogs.length === 0,
  `errors=${errors.length} ${JSON.stringify(errors.slice(0, 3))} dialogs=${dialogs.length}`);
await browser.close();
const md5post = md5(BUILD);
ck('Z7 build md5 unchanged (read-only)', md5pre === md5post, `${md5pre} → ${md5post}`);

const fails = CHECKS.filter(c => !c.p);
log(`=== RESULT run ${RUN}: ${CHECKS.length - fails.length}/${CHECKS.length} PASS${fails.length ? '  FAILS: ' + fails.map(f => f.n).join('; ') : ''} ===`);
fs.writeFileSync(path.join(EVID, `RESULT_run${RUN}.json`), JSON.stringify({ build: md5pre, checks: CHECKS, rows, fresh: fresh.dom, pre: pre.dom, post: post.dom }, null, 2));
fs.writeFileSync(path.join(EVID, `RUN_LOG_run${RUN}.txt`), LOG.join('\n') + '\n');
process.exit(fails.length ? 1 : 0);
