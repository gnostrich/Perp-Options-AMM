// 11_e2e_flows_v2.mjs — corrected connect-only E2E of the staging app.
// App structure learned in v1: `/` renders the TRANSACT dashboard under a DISCLAIMER
// modal; wallet auto-connects via injected EIP-6963. AGREE can bounce to the marketing
// hero → re-enter via "Trade". Top nav: TRANSACT | PORTFOLIO. Transact sub-tabs:
// CREATE PERP | TRADE BANDS | EARN. Portfolio sub-tabs: OVERVIEW | PERPS | BANDS | EARN.
import fs from 'node:fs';
import { chromium } from 'playwright';
import { loadWallet, installProvider, instrument, chromiumLaunchOpts } from './lib_wallet_provider.mjs';

const OUT = '/home/user/Perp-Options-AMM/evidence/staging_e2e_2026-07-10';
const APP = 'https://app-staging.temporal.exchange/';
const sink = [];
const walletLog = [];
const flows = {};
function mark(n) { flows[n] = { start: sink.length, notes: [] }; return flows[n]; }
function endMark(n) { const f = flows[n]; if (f) f.errors = sink.slice(f.start).filter(s => s.kind === 'pageerror' || s.kind === 'console.error'); return f; }
const note = (n, m) => { (flows[n] || mark(n)).notes.push(m); console.log(`[${n}] ${m}`); };

const { wallet, provider } = loadWallet();
const browser = await chromium.launch(chromiumLaunchOpts());
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
});
const page = await ctx.newPage();
instrument(page, sink);
const addr = await installProvider(page, wallet, provider, (m) => walletLog.push(m));
const shot = (f) => page.screenshot({ path: `${OUT}/${f}` }).catch(e => console.log('shot err', f, e.message));
const bodyText = () => page.evaluate(() => document.body.innerText);
const has = async (sel) => (await page.locator(sel).count()) > 0;
const clickIf = async (sel, label) => { if (await has(sel)) { await page.locator(sel).first().click().catch(() => {}); return true; } return false; };
const onApp = async () => (await bodyText()).includes('TRANSACT') && (await bodyText()).includes('CREATE PERP');
const ensureApp = async (tag) => {
  if (await onApp()) return true;
  // marketing hero → click Trade
  if (await has('text="Trade"')) { await page.locator('text="Trade"').first().click().catch(() => {}); await page.waitForTimeout(3000); }
  if (!(await onApp())) { await page.goto(APP, { waitUntil: 'domcontentloaded' }).catch(() => {}); await page.waitForTimeout(4000); }
  const ok = await onApp();
  if (tag) note(tag, `ensureApp → onApp=${ok}`);
  return ok;
};
// dismiss disclaimer without leaving the app
const dismissDisclaimer = async () => {
  if (await has('button:has-text("AGREE")')) {
    await page.locator('button:has-text("AGREE")').first().click().catch(() => {});
    await page.waitForTimeout(2500);
    return true;
  }
  return false;
};

// ===== LANDING =====
mark('landing');
const resp = await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
note('landing', `HTTP ${resp && resp.status()}`);
await page.waitForTimeout(6000);
await shot('01_landing.png');
note('landing', `title="${await page.title()}"`);
const disc = await dismissDisclaimer();
note('landing', `disclaimer dismissed=${disc}`);
await ensureApp('landing');
await shot('01b_app_transact.png');
endMark('landing');

// ===== CONNECT =====
mark('connect');
const chip = await page.evaluate((a) => document.body.innerText.includes(a.slice(-4)), addr);
note('connect', `wallet chip (…${addr.slice(-4)}) visible: ${chip}`);
const provState = await page.evaluate(async () => {
  try {
    const accs = await window.ethereum.request({ method: 'eth_accounts' });
    const cid = await window.ethereum.request({ method: 'eth_chainId' });
    return { accounts: accs, chainId: cid, isMetaMask: window.ethereum.isMetaMask };
  } catch (e) { return { err: String(e) }; }
});
note('connect', `provider: ${JSON.stringify(provState)}`);
// "Connect to Arbitrum" chain-switch button — click to exercise wallet_switchEthereumChain
if (await has('button:has-text("Connect to Arbitrum")')) {
  await page.locator('button:has-text("Connect to Arbitrum")').first().click().catch(() => {});
  note('connect', 'clicked "Connect to Arbitrum" (chain switch)');
  await page.waitForTimeout(3000);
}
await shot('02_connected.png');
endMark('connect');

// tab helpers within transact
const transactSubtab = async (label) => {
  const sel = `button:has-text("${label}"), [role="tab"]:has-text("${label}")`;
  if (await has(sel)) { await page.locator(sel).first().click().catch(() => {}); await page.waitForTimeout(2500); return true; }
  return false;
};

// ===== CREATE PERP LONG =====
mark('create_perp_long');
await ensureApp('create_perp_long');
await transactSubtab('CREATE PERP');
await clickIf('button:has-text("LONG/BUY")');
await page.waitForTimeout(1200);
const longForm = await page.evaluate(() => {
  const t = document.body.innerText;
  const near = (label, span = 60) => { const i = t.indexOf(label); return i < 0 ? null : t.slice(i, i + span).replace(/\n/g, ' '); };
  return {
    longActive: /LONG\/BUY/.test(t), entry: near('Entry Price'), liq: near('Liquidation Price'),
    hlFees: near('Hyperliquid Tx Fees'), tmpFees: near('Temporal Tx Fees'),
    leverage: (t.match(/\b\d+x\b/g) || []).slice(0, 8), notional: near('NOTIONAL', 30) || near('Notional', 30),
    autoProtect: /AUTO-PROTECT/i.test(t), createBtn: /CREATE POSITION/i.test(t),
    executedOn: near('Executed on', 40),
  };
});
note('create_perp_long', `entry=${longForm.entry} | liq=${longForm.liq}`);
note('create_perp_long', `hlFees=${longForm.hlFees} | tmpFees=${longForm.tmpFees} | executedOn=${longForm.executedOn}`);
note('create_perp_long', `leverageTicks=${JSON.stringify(longForm.leverage)} createBtn=${longForm.createBtn} autoProtect=${longForm.autoProtect}`);
await shot('03_create_perp_long.png');
endMark('create_perp_long');

// ===== LEVERAGE / NOTIONAL =====
mark('leverage_notional');
// DEPOSIT amount input
const amt = page.locator('input[placeholder*="amount" i], input[placeholder*="Enter" i]').first();
if (await amt.count()) { await amt.click().catch(() => {}); await amt.fill('500').catch(() => {}); note('leverage_notional', 'DEPOSIT filled 500'); await page.waitForTimeout(1000); }
// leverage slider
const sl = page.locator('[role="slider"], input[type="range"]');
const nsl = await sl.count();
note('leverage_notional', `sliders=${nsl}`);
let levBefore = (await bodyText()).match(/\b\d+x\b/g);
if (nsl) {
  try {
    await sl.first().focus();
    for (let k = 0; k < 12; k++) { await sl.first().press('ArrowRight'); await page.waitForTimeout(90); }
    note('leverage_notional', 'leverage slider ArrowRight x12');
  } catch (e) { note('leverage_notional', `slider err ${e.message}`); }
}
await page.waitForTimeout(1200);
const afterLev = await page.evaluate(() => {
  const t = document.body.innerText;
  const near = (l, s = 60) => { const i = t.indexOf(l); return i < 0 ? null : t.slice(i, i + s).replace(/\n/g, ' '); };
  return { lev: (t.match(/\b\d+x\b/g) || []).slice(0, 8), notional: near('NOTIONAL', 40), liq: near('Liquidation Price', 50), entry: near('Entry Price', 40) };
});
note('leverage_notional', `levBefore=${JSON.stringify(levBefore)} → after=${JSON.stringify(afterLev.lev)}`);
note('leverage_notional', `notional=${afterLev.notional} | liq=${afterLev.liq}`);
await shot('04_leverage_notional.png');
endMark('leverage_notional');

// ===== CREATE PERP SHORT =====
mark('create_perp_short');
await clickIf('button:has-text("SHORT/SELL")');
await page.waitForTimeout(1500);
const shortForm = await page.evaluate(() => {
  const t = document.body.innerText;
  const near = (l, s = 60) => { const i = t.indexOf(l); return i < 0 ? null : t.slice(i, i + s).replace(/\n/g, ' '); };
  return { shortActive: /SHORT\/SELL/.test(t), entry: near('Entry Price', 40), liq: near('Liquidation Price', 50) };
});
note('create_perp_short', `entry=${shortForm.entry} | liq=${shortForm.liq}`);
await shot('05_create_perp_short.png');
endMark('create_perp_short');

// ===== TRADE BANDS =====
mark('trade_bands');
await ensureApp('trade_bands');
await transactSubtab('TRADE BANDS');
await page.waitForTimeout(2500);
await shot('06_trade_bands.png');
const bands = await page.evaluate(() => {
  const t = document.body.innerText;
  return {
    strike: /strike/i.test(t), band: /band/i.test(t), funding: /funding/i.test(t),
    rayDev: /ray dev|curve skew|deviation|lean/i.test(t),
    inner: /inner bound/i.test(t), outer: /outer bound/i.test(t), intrinsic: /intrinsic/i.test(t), extrinsic: /extrinsic/i.test(t),
    dollars: (t.match(/\$[\d,]+(\.\d+)?/g) || []).slice(0, 24),
    buttons: [...document.querySelectorAll('button')].map(b => b.innerText.trim()).filter(Boolean).slice(0, 30),
    snippet: t.slice(0, 2500),
  };
});
note('trade_bands', `strike=${bands.strike} band=${bands.band} inner/outer=${bands.inner}/${bands.outer} intrinsic/extrinsic=${bands.intrinsic}/${bands.extrinsic}`);
note('trade_bands', `funding=${bands.funding} rayDev=${bands.rayDev}`);
note('trade_bands', `dollars=${JSON.stringify(bands.dollars)}`);
note('trade_bands', `buttons=${JSON.stringify(bands.buttons)}`);
fs.writeFileSync(`${OUT}/tradebands_text.txt`, bands.snippet);
endMark('trade_bands');

// ===== EARN =====
mark('earn');
await ensureApp('earn');
await transactSubtab('EARN');
await page.waitForTimeout(2500);
await shot('07_earn.png');
const earn = await page.evaluate(() => {
  const t = document.body.innerText;
  return {
    apy: /apy|apr|yield/i.test(t), deposit: /deposit/i.test(t), lp: /liquidity|pool|vault|lp|stake/i.test(t),
    dollars: (t.match(/\$[\d,]+(\.\d+)?/g) || []).slice(0, 20), pcts: (t.match(/[\d.]+%/g) || []).slice(0, 20),
    buttons: [...document.querySelectorAll('button')].map(b => b.innerText.trim()).filter(Boolean).slice(0, 30),
    snippet: t.slice(0, 2000),
  };
});
note('earn', `apy=${earn.apy} deposit=${earn.deposit} lp=${earn.lp} pcts=${JSON.stringify(earn.pcts)} dollars=${JSON.stringify(earn.dollars)}`);
note('earn', `buttons=${JSON.stringify(earn.buttons)}`);
fs.writeFileSync(`${OUT}/earn_text.txt`, earn.snippet);
endMark('earn');

// ===== PORTFOLIO =====
mark('portfolio');
await clickIf('a:has-text("PORTFOLIO")') || await page.goto(APP + 'portfolio', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000);
await shot('08_portfolio_overview.png');
const pfSub = async (label) => { const sel = `[role="tab"]:has-text("${label}"), button:has-text("${label}")`; if (await has(sel)) { await page.locator(sel).first().click().catch(() => {}); await page.waitForTimeout(2500); return true; } return false; };
const grabHeaders = () => page.evaluate(() => [...document.querySelectorAll('th, [role="columnheader"]')].map(e => e.innerText.trim()).filter(Boolean));
const overviewHeaders = await grabHeaders();
const pfOverview = await page.evaluate(() => {
  const t = document.body.innerText;
  return { totalPnl: (t.match(/TOTAL PORTFOLIO PNL\s*\$[\-\d,.]+/i) || [''])[0], noData: /No historical PNL data/i.test(t), sub: (t.match(/OVERVIEW|PERPS|BANDS|EARN/g) || []) };
});
note('portfolio', `overview: ${pfOverview.totalPnl} | noData=${pfOverview.noData}`);
// PERPS subtab
await pfSub('PERPS');
await shot('08b_portfolio_perps.png');
const perpsHeaders = await grabHeaders();
note('portfolio', `PERPS headers: ${JSON.stringify(perpsHeaders)}`);
const perpsFundingCol = perpsHeaders.filter(h => /funding/i.test(h));
note('portfolio', `PERPS funding column: ${JSON.stringify(perpsFundingCol)}`);
const perpsBody = await page.evaluate(() => { const t = document.body.innerText; return { empty: /no (open )?position|no perps|nothing/i.test(t), close: /close/i.test(t) }; });
note('portfolio', `PERPS empty=${perpsBody.empty} closeMention=${perpsBody.close}`);
// BANDS subtab
await pfSub('BANDS');
await shot('08c_portfolio_bands.png');
const bandsHeaders = await grabHeaders();
note('portfolio', `BANDS headers: ${JSON.stringify(bandsHeaders)}`);
note('portfolio', `BANDS funding column: ${JSON.stringify(bandsHeaders.filter(h => /funding/i.test(h)))}`);
// hover the funding header to catch any tooltip (ray dev / TBD)
let fundingTip = null;
const fh = page.locator('th:has-text("FUNDING"), [role="columnheader"]:has-text("FUNDING")').first();
if (await fh.count()) {
  await fh.hover().catch(() => {});
  await page.waitForTimeout(1200);
  fundingTip = await page.evaluate(() => {
    const el = document.querySelector('th [title], [role="columnheader"] [title], th[title]');
    return el ? (el.getAttribute('title') || el.textContent) : null;
  });
}
note('portfolio', `funding header tooltip: ${JSON.stringify(fundingTip)}`);
// EARN subtab
await pfSub('EARN');
await shot('08d_portfolio_earn.png');
const earnPfHeaders = await grabHeaders();
note('portfolio', `EARN(portfolio) headers: ${JSON.stringify(earnPfHeaders)}`);
// close-position buttons
const closeBtns = await page.locator('button:has-text("Close"), button:has-text("CLOSE")').count();
note('portfolio', `close-position buttons found: ${closeBtns} (no positions → expected 0)`);
endMark('portfolio');

// ===== WRAP =====
fs.writeFileSync(`${OUT}/e2e_console.log`, sink.map(s => `${s.t} [${s.kind}] ${s.text}`).join('\n'));
fs.writeFileSync(`${OUT}/e2e_wallet.log`, walletLog.join('\n'));
// dedup console errors for a compact per-flow view
const summary = {};
for (const [k, f] of Object.entries(flows)) {
  const errs = (f.errors || []).map(e => e.text);
  const uniq = [...new Set(errs.map(e => e.slice(0, 120)))];
  summary[k] = { notes: f.notes, errorCount: errs.length, uniqueErrors: uniq.slice(0, 6) };
}
fs.writeFileSync(`${OUT}/e2e_summary.json`, JSON.stringify(summary, null, 2));
console.log('\n===== FLOW SUMMARY =====');
for (const [k, v] of Object.entries(summary)) console.log(`${k}: ${v.errorCount} errors, ${v.uniqueErrors.length} unique`);
await browser.close();
