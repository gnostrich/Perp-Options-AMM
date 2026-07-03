// FUNDING P/L COLUMN — LIVE ACCEPTANCE (operator entry 425; R6 scope-gate #2 conditions:
// sign pin + disclosure). Promoted HEAD 4bc939ec (display/read-layer slice on ratified
// 0e0a0062; engine+state script blocks byte-identical — tester node-compared separately).
// Verifies in the LIVE DOM:
//   F1 header th "Funding P/L" + disclosure title
//   F2 visible pf-units-note carries includes-accrued / ex-funding-at-close sentence
//   F3 Total dollar-cell tooltip names the funding term
//   F4 two OPPOSITE bands open via real UI (long crowded + short contrarian)
//   F5 funding column renders per band line (band row + every component row + total row)
//   F6 advance funding ticks via #btn-tick: PAYER line funding cell NEGATIVE and its
//      displayed P/L FALLS vs pre-tick; receiver's rises — numbers recorded
//   F7 sign pin: displayed cell == −Σ stored trader-pays accruals (6dp, per band)
//   F8 perps table untouched by ticks (no funding column; innerText pre==post)
//   F9 all 4 chart states render
//   F10 zero console errors / pageerrors / dialogs
//   F11 build md5 unchanged (READ-ONLY)
// Run: cd engine; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/pw_funding_pnl_live.mjs A|B
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const RUN = (process.argv[2] || 'A').toUpperCase();
const here = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.resolve(here, '../builds/HEAD_temporal_mvp_v28_lens.html');
const EVID = path.resolve(here, '../../evidence/funding_pnl_column');
fs.mkdirSync(EVID, { recursive: true });
const LOG = []; const log = (s) => { LOG.push(s); console.log(s); };
const md5 = (f) => execSync('md5sum ' + f).toString().split(' ')[0];
const CHECKS = []; const ck = (n, p, d) => { CHECKS.push({ n, p: !!p, d }); log(`${p ? 'PASS' : 'FAIL'} ${n}  ${d}`); };

const md5pre = md5(BUILD);
log(`=== FUNDING P/L COLUMN LIVE run ${RUN}  build md5 ${md5pre} ===`);
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

// ── F1/F2/F3 static disclosure surfaces (read from the LIVE DOM) ───────────
const gotoPortfolioBands = async () => {
  await page.evaluate(() => { const n = document.querySelector('.page-nav-link[data-page="portfolio"]'); if (n) n.click(); });
  await page.evaluate(() => { const t = document.querySelector('.tab[data-subtab-pf="bands"]'); if (t) t.click(); });
  await page.waitForTimeout(150);
};
const gotoTransact = async () => {
  await page.evaluate(() => { const n = document.querySelector('.page-nav-link[data-page="transact"]'); if (n) n.click(); });
  await page.waitForTimeout(150);
};
await gotoPortfolioBands();
const staticBits = await page.evaluate(() => {
  const ths = [...document.querySelectorAll('#pf-bands table thead th, .tab-panel table thead th')];
  const fth = ths.find(t => (t.textContent || '').trim() === 'Funding P/L');
  const note = document.querySelector('.pf-units-note');
  const noteVisible = note ? !!(note.offsetParent) : false;
  return {
    fthFound: !!fth,
    fthTitle: fth ? (fth.getAttribute('title') || '') : '',
    noteText: note ? note.innerText : '',
    noteVisible,
    perpHeader: [...document.querySelectorAll('#pf-perps thead th')].map(t => t.textContent.trim()).join('|'),
  };
});
ck('F1 header th "Funding P/L" with disclosure title',
  staticBits.fthFound
  && /signed: \+ = line received/.test(staticBits.fthTitle)
  && /includes accrued funding/.test(staticBits.fthTitle)
  && /settles ex-funding/.test(staticBits.fthTitle),
  `title="${staticBits.fthTitle.slice(0, 120)}…"`);
ck('F2 pf-units-note visible + includes-accrued/ex-funding sentence',
  staticBits.noteVisible
  && /Funding column = signed P\/L effect \(\+ received, − paid/.test(staticBits.noteText)
  && /INCLUDES accrued funding/.test(staticBits.noteText)
  && /settles EX-funding until\s+the funding transfer layer ships/.test(staticBits.noteText),
  `visible=${staticBits.noteVisible} text="${staticBits.noteText.replace(/\s+/g, ' ').slice(0, 180)}…"`);

// ── F4 open two OPPOSITE bands via the real UI (transact page) ─────────────
await gotoTransact();
await click('.tab[data-subtab="bands"]'); await page.waitForTimeout(100);
await page.evaluate(() => { const p = document.getElementById('band-dir-sell'); if (p.dataset.dir !== 'long') p.click(); });
await setField('sold-inner', 120000); await setField('bought-inner', 48000); await setField('band-notional', 0.03);
await page.waitForTimeout(250); await click('#btn-execute'); await page.waitForTimeout(250);
await page.evaluate(() => { const p = document.getElementById('band-dir-sell'); if (p.dataset.dir !== 'short') p.click(); });
await setField('sold-inner', 60000); await setField('bought-inner', 100000); await setField('band-notional', 0.03);
await page.waitForTimeout(250); await click('#btn-execute'); await page.waitForTimeout(250);
const opened = await page.evaluate(() => {
  const s = Store.state;
  return s.bands.filter(b => b.status === 'open').map(b => ({
    id: b.id, sold_wing: b.sold_wing || b.wing, bought_wing: b.bought_wing || b.wing,
    soldK: b.sold.K_inner, boughtK: b.bought.K_inner,
  }));
});
ck('F4 two opposite bands open (crowded long + contrarian short)',
  opened.length === 2 && opened[0].sold_wing !== opened[1].sold_wing,
  JSON.stringify(opened));

// ── move oracle via the UI so S≠1 (funding alive), then read PRE-TICK ─────
await setField('kpi-oracle', 88000); await page.waitForTimeout(300);

const readBandsDom = () => page.evaluate(() => {
  // Walk the bands tbody in order; group rows per band id.
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
  // stored ledger truth (negated = displayed convention) per band
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
const parseUSD = (s) => parseFloat(s.replace(/\u2212/g, '-').replace(/[$,]/g, ''));

await gotoPortfolioBands();
const pre = await readBandsDom();
const ids = Object.keys(pre.dom);
log(`PRE-TICK  t=${pre.t} oracle=${pre.oracle} ` + ids.map(id =>
  `${id}: funding=${pre.dom[id].bandFundingCell} P/L=${pre.dom[id].total.dollarCell}`).join('  |  '));
await page.screenshot({ path: path.join(EVID, `${RUN}_bands_pretick.png`), fullPage: false });

// F5 column renders per band line (band row + 2 component rows + total row, numeric)
const perLineOk = ids.length === 2 && ids.every(id => {
  const d = pre.dom[id];
  return isFinite(parseFloat(d.bandFundingCell)) && d.compFunding.length === 2
    && d.compFunding.every(c => isFinite(parseFloat(c.cell)))
    && d.total && isFinite(parseFloat(d.total.fundingCell));
});
ck('F5 funding column renders on EVERY band line (band + components + total), numeric',
  perLineOk, ids.map(id => `${id}: band=${pre.dom[id].bandFundingCell} comps=[${pre.dom[id].compFunding.map(c => c.cell).join(',')}] total=${pre.dom[id].total.fundingCell}`).join('  '));
ck('F3 Total dollar-cell tooltip names the funding term',
  ids.every(id => /PLUS funding P\/L × oracle/.test(pre.dom[id].total.dollarTitle)
    && /INCLUDES accrued\s+funding/.test(pre.dom[id].total.dollarTitle)
    && /settles ex-funding/.test(pre.dom[id].total.dollarTitle)),
  `title="${pre.dom[ids[0]].total.dollarTitle.slice(0, 140)}…"`);
ck('F5b pre-tick funding cells are exactly 0 (no ticks yet)',
  ids.every(id => parseFloat(pre.dom[id].bandFundingCell) === 0 && pre.stored[id] === 0),
  ids.map(id => `${id}: cell=${pre.dom[id].bandFundingCell} stored=${pre.stored[id]}`).join('  '));

// perps table snapshot BEFORE ticks
const perpsPre = await page.evaluate(() => document.getElementById('perps-tbody').innerText);

// ── F6 advance funding ticks via the UI button (24 × 1h) ──────────────────
for (let i = 0; i < 24; i++) await click('#btn-tick');
await page.waitForTimeout(300);
const post = await readBandsDom();
log(`POST-TICK t=${post.t} oracle=${post.oracle} ` + ids.map(id =>
  `${id}: funding=${post.dom[id].bandFundingCell} P/L=${post.dom[id].total.dollarCell}`).join('  |  '));
await page.screenshot({ path: path.join(EVID, `${RUN}_bands_posttick.png`), fullPage: false });
await page.screenshot({ path: path.join(EVID, `${RUN}_fullpage_posttick.png`), fullPage: true });

const rows = ids.map(id => ({
  id,
  preF: parseFloat(pre.dom[id].bandFundingCell), postF: parseFloat(post.dom[id].bandFundingCell),
  preP: parseUSD(pre.dom[id].total.dollarCell), postP: parseUSD(post.dom[id].total.dollarCell),
  stored: post.stored[id],
}));
const payer = rows.find(r => r.postF < 0);
const recv = rows.find(r => r.postF > 0);
ck('F6a exactly one payer (funding cell NEGATIVE) + one receiver (POSITIVE) on screen',
  !!payer && !!recv && payer.id !== recv.id,
  rows.map(r => `${r.id}: funding=${r.postF}`).join('  '));
ck('F6b PAYER displayed P/L FALLS vs pre-tick',
  payer && payer.postP < payer.preP,
  payer ? `${payer.id}: P/L $${payer.preP.toFixed(2)} → $${payer.postP.toFixed(2)} (Δ ${(payer.postP - payer.preP).toFixed(2)}), funding cell ${payer.postF}` : 'no payer');
ck('F6c RECEIVER displayed P/L RISES vs pre-tick',
  recv && recv.postP > recv.preP,
  recv ? `${recv.id}: P/L $${recv.preP.toFixed(2)} → $${recv.postP.toFixed(2)} (Δ ${(recv.postP - recv.preP).toFixed(2)}), funding cell ${recv.postF}` : 'no receiver');

// F7 sign pin: displayed cell == −(stored trader-pays sum) at 6dp; P/L delta == cell × oracle
const signPin = rows.every(r => Math.abs(r.postF - (-r.stored)) < 5e-7);
ck('F7 sign pin: displayed cell == −Σ stored trader-pays (6dp)',
  signPin, rows.map(r => `${r.id}: cell=${r.postF} −stored=${(-r.stored).toFixed(8)}`).join('  '));
const dollarPin = rows.every(r => Math.abs((r.postP - r.preP) - r.postF * post.oracle) < Math.max(1, Math.abs(r.postF * post.oracle) * 1e-3));
ck('F7b P/L delta == funding cell × oracle (funding-inclusive line P/L)',
  dollarPin, rows.map(r => `${r.id}: ΔP/L=${(r.postP - r.preP).toFixed(2)} cell×oracle=${(r.postF * post.oracle).toFixed(2)}`).join('  '));

// component-row sign coherence: band cell == Σ displayed component cells (6dp rounding slop)
const compSum = ids.every(id => {
  const s = post.dom[id].compFunding.reduce((a, c) => a + parseFloat(c.cell), 0);
  return Math.abs(s - parseFloat(post.dom[id].bandFundingCell)) < 5e-6;
});
ck('F7c band funding cell == Σ component funding cells',
  compSum, ids.map(id => `${id}: comps=[${post.dom[id].compFunding.map(c => c.cell).join(',')}] band=${post.dom[id].bandFundingCell}`).join('  '));

// ── F8 perps table untouched ───────────────────────────────────────────────
const perpsPost = await page.evaluate(() => document.getElementById('perps-tbody').innerText);
ck('F8 perps table untouched by ticks + no Funding column in perps header',
  perpsPre === perpsPost && !/Funding/i.test(staticBits.perpHeader),
  `header=[${staticBits.perpHeader}] tbody pre==post: ${perpsPre === perpsPost}`);

// ── F9 all 4 chart states render (transact page; per-state visible canvases) ─
await gotoTransact();
const chartRender = {};
for (const opt of await page.evaluate(() => [...document.getElementById('chart-select').options].map(o => o.value))) {
  await page.evaluate((v) => { const s = document.getElementById('chart-select'); s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); }, opt);
  await page.waitForTimeout(350);
  chartRender[opt] = await page.evaluate(() => {
    let n = 0;
    for (const cid of ['canvas-curve', 'canvas-pricing', 'canvas-payoff', 'canvas-ratio']) {
      const c = document.getElementById(cid); if (!c || !c.offsetParent) continue;
      const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data;
      // full-pixel nonBlank census (same convention as the standing smoke)
      for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0 && (d[i] || d[i + 1] || d[i + 2])) n++;
    }
    return n;
  });
}
ck('F9 every chart state renders non-blank', Object.values(chartRender).every(v => v > 2000),
  JSON.stringify(chartRender));

// ── F10/F11 hygiene ────────────────────────────────────────────────────────
ck('F10 zero console errors / pageerrors / dialogs', errors.length === 0 && dialogs.length === 0,
  `errors=${errors.length} ${JSON.stringify(errors.slice(0, 3))} dialogs=${dialogs.length}`);
await browser.close();
const md5post = md5(BUILD);
ck('F11 build md5 unchanged (read-only)', md5pre === md5post, `${md5pre} → ${md5post}`);

const fails = CHECKS.filter(c => !c.p);
log(`=== RESULT run ${RUN}: ${CHECKS.length - fails.length}/${CHECKS.length} PASS${fails.length ? '  FAILS: ' + fails.map(f => f.n).join('; ') : ''} ===`);
fs.writeFileSync(path.join(EVID, `RESULT_run${RUN}.json`), JSON.stringify({ build: md5pre, checks: CHECKS, rows, pre: pre.dom, post: post.dom }, null, 2));
fs.writeFileSync(path.join(EVID, `RUN_LOG_run${RUN}.txt`), LOG.join('\n') + '\n');
process.exit(fails.length ? 1 : 0);
