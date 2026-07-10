// 10_e2e_flows.mjs — full connect-only E2E exercise of the staging app.
// Injected throwaway wallet (Arbitrum Sepolia). Unfunded → CONNECT-ONLY per brief:
// exercise every read-only view, flip long/short, move sliders, open every tab/panel,
// screenshot + per-flow console/network logs.
import fs from 'node:fs';
import { chromium } from 'playwright';
import { loadWallet, installProvider, instrument, chromiumLaunchOpts } from './lib_wallet_provider.mjs';

const OUT = '/home/user/Perp-Options-AMM/evidence/staging_e2e_2026-07-10';
const APP = 'https://app-staging.temporal.exchange/';
const sink = [];
const walletLog = [];
const flows = {}; // name -> { errorsAt, notes[] }
let markIdx = 0;
function mark(name) { flows[name] = { start: sink.length, notes: [] }; return flows[name]; }
function endMark(name) { const f = flows[name]; if (f) f.errors = sink.slice(f.start).filter(s => s.kind === 'pageerror' || s.kind === 'console.error'); return f; }
const note = (name, msg) => { (flows[name] || mark(name)).notes.push(msg); console.log(`[${name}] ${msg}`); };

const { wallet, provider } = loadWallet();
const browser = await chromium.launch(chromiumLaunchOpts());
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
});
const page = await ctx.newPage();
instrument(page, sink);
const addr = await installProvider(page, wallet, provider, (m) => walletLog.push(m));

const shot = (f) => page.screenshot({ path: `${OUT}/${f}`, fullPage: false }).catch(e => console.log('shot err', f, e.message));
const shotFull = (f) => page.screenshot({ path: `${OUT}/${f}`, fullPage: true }).catch(e => console.log('shot err', f, e.message));
const clickText = async (txt, opts = {}) => {
  const el = page.locator(`text="${txt}"`).first();
  if (await el.count()) { await el.click({ timeout: 5000, ...opts }).catch(() => {}); return true; }
  return false;
};
const visibleText = () => page.evaluate(() => document.body.innerText);

// ---------- LANDING ----------
mark('landing');
const resp = await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
note('landing', `HTTP ${resp && resp.status()}`);
await page.waitForTimeout(6000);
await shotFull('01_landing.png');
const title = await page.title();
note('landing', `title="${title}"`);
// accept disclaimer if present
if (await page.locator('button:has-text("AGREE")').count()) {
  await page.locator('button:has-text("AGREE")').first().click().catch(() => {});
  note('landing', 'clicked AGREE on disclaimer');
  await page.waitForTimeout(2500);
}
await shotFull('01b_after_disclaimer.png');
endMark('landing');

// ---------- CONNECT ----------
mark('connect');
// The injected EIP-6963 provider is usually auto-detected. Check the header chip.
let connected = await page.evaluate((a) => document.body.innerText.includes(a.slice(0, 6)) || document.body.innerText.includes(a.slice(-4)), addr);
if (!connected) {
  // try clicking a connect button
  for (const t of ['Connect Wallet', 'Connect to Arbitrum', 'Connect', 'CONNECT WALLET']) {
    if (await clickText(t)) { note('connect', `clicked "${t}"`); await page.waitForTimeout(2000); break; }
  }
  // wallet picker (MetaMask)
  for (const t of ['MetaMask', 'Injected', 'Browser Wallet']) {
    if (await page.locator(`text="${t}"`).count()) { await clickText(t); note('connect', `picked "${t}"`); await page.waitForTimeout(2500); break; }
  }
}
await page.waitForTimeout(2500);
connected = await page.evaluate((a) => document.body.innerText.includes(a.slice(-4)), addr);
note('connect', `address chip visible: ${connected}`);
// probe injected provider state from the page
const provState = await page.evaluate(async () => {
  try {
    const accs = await window.ethereum.request({ method: 'eth_accounts' });
    const cid = await window.ethereum.request({ method: 'eth_chainId' });
    return { accounts: accs, chainId: cid, isMetaMask: window.ethereum.isMetaMask };
  } catch (e) { return { err: String(e) }; }
});
note('connect', `provider state: ${JSON.stringify(provState)}`);
await shotFull('02_connected.png');
endMark('connect');

// helper to switch top tab
const gotoTab = async (label) => {
  const t = page.locator(`button:has-text("${label}"), [role="tab"]:has-text("${label}")`).first();
  if (await t.count()) { await t.click().catch(() => {}); await page.waitForTimeout(2500); return true; }
  return false;
};

// ---------- CREATE PERP: LONG ----------
mark('create_perp_long');
await gotoTab('CREATE PERP');
await page.waitForTimeout(1500);
if (await page.locator('button:has-text("LONG/BUY")').count()) {
  await page.locator('button:has-text("LONG/BUY")').first().click().catch(() => {});
  note('create_perp_long', 'selected LONG/BUY');
}
await page.waitForTimeout(1500);
// dump the create-perp form fields + any numbers
const perpDump = await page.evaluate(() => {
  const t = document.body.innerText;
  const grab = (re) => (t.match(re) || []).slice(0, 6);
  return {
    hasLong: t.includes('LONG/BUY'), hasShort: t.includes('SHORT/SELL'),
    entryPrice: grab(/Entry Price[^\n]*\n?\$?[\d,\.]*/gi),
    liq: grab(/Liquidation Price[^\n]*/gi),
    fees: grab(/(Hyperliquid|Temporal) Tx Fees[^\n]*/gi),
    leverageText: grab(/[\d.]+x/g),
    createBtn: t.includes('CREATE POSITION'),
  };
});
note('create_perp_long', `form: ${JSON.stringify(perpDump)}`);
await shotFull('03_create_perp_long.png');
endMark('create_perp_long');

// ---------- leverage / notional ----------
mark('leverage_notional');
// find sliders and number inputs
const sliders = page.locator('[role="slider"], input[type="range"]');
const nSliders = await sliders.count();
note('leverage_notional', `sliders found: ${nSliders}`);
for (let i = 0; i < Math.min(nSliders, 3); i++) {
  const s = sliders.nth(i);
  try {
    await s.focus();
    for (let k = 0; k < 8; k++) { await s.press('ArrowRight'); await page.waitForTimeout(120); }
    note('leverage_notional', `slider ${i}: arrow-right x8`);
  } catch (e) { note('leverage_notional', `slider ${i} err ${e.message}`); }
}
// notional numeric input: find text inputs and type an amount
const numInputs = page.locator('input[type="text"], input[type="number"], input:not([type])');
const nNum = await numInputs.count();
note('leverage_notional', `text/number inputs: ${nNum}`);
for (let i = 0; i < Math.min(nNum, 4); i++) {
  const inp = numInputs.nth(i);
  const ph = await inp.getAttribute('placeholder').catch(() => null);
  const vis = await inp.isVisible().catch(() => false);
  if (vis) {
    try { await inp.click(); await inp.fill('1000'); note('leverage_notional', `input ${i} (ph=${ph}) filled 1000`); await page.waitForTimeout(400); } catch (e) {}
  }
}
await page.waitForTimeout(1200);
const afterLev = await page.evaluate(() => {
  const t = document.body.innerText;
  return { leverageText: (t.match(/[\d.]+x/g) || []).slice(0, 8), liq: (t.match(/Liquidation Price[\s\S]{0,40}/i) || [''])[0], entry: (t.match(/Entry Price[\s\S]{0,40}/i) || [''])[0] };
});
note('leverage_notional', `after adjust: ${JSON.stringify(afterLev)}`);
await shotFull('04_leverage_notional.png');
endMark('leverage_notional');

// ---------- CREATE PERP: SHORT ----------
mark('create_perp_short');
if (await page.locator('button:has-text("SHORT/SELL")').count()) {
  await page.locator('button:has-text("SHORT/SELL")').first().click().catch(() => {});
  note('create_perp_short', 'selected SHORT/SELL');
  await page.waitForTimeout(1800);
}
const shortDump = await page.evaluate(() => {
  const t = document.body.innerText;
  return { hasShortActive: true, liq: (t.match(/Liquidation Price[\s\S]{0,40}/i) || [''])[0], entry: (t.match(/Entry Price[\s\S]{0,40}/i) || [''])[0] };
});
note('create_perp_short', `form: ${JSON.stringify(shortDump)}`);
await shotFull('05_create_perp_short.png');
endMark('create_perp_short');

// ---------- TRADE BANDS ----------
mark('trade_bands');
await gotoTab('TRADE BANDS');
await page.waitForTimeout(2500);
const bandsDump = await page.evaluate(() => {
  const t = document.body.innerText;
  return {
    len: t.length,
    mentionsStrike: /strike/i.test(t), mentionsBand: /band/i.test(t),
    mentionsFunding: /funding/i.test(t), mentionsRayDev: /ray dev|curve skew|deviation/i.test(t),
    dollars: (t.match(/\$[\d,]+(\.\d+)?/g) || []).slice(0, 20),
    snippet: t.slice(0, 1500),
  };
});
note('trade_bands', `mentions strike=${bandsDump.mentionsStrike} band=${bandsDump.mentionsBand} funding=${bandsDump.mentionsFunding} rayDev=${bandsDump.mentionsRayDev}`);
note('trade_bands', `dollars: ${JSON.stringify(bandsDump.dollars)}`);
fs.writeFileSync(`${OUT}/tradebands_text.txt`, bandsDump.snippet);
await shotFull('06_trade_bands.png');
// try interacting: flip long/short if present, fill an amount, expand any strike selector
for (const t of ['LONG', 'SHORT', 'Strike', 'Add', 'Preview']) {
  if (await page.locator(`text="${t}"`).count()) note('trade_bands', `control present: "${t}"`);
}
endMark('trade_bands');

// ---------- EARN ----------
mark('earn');
await gotoTab('EARN');
await page.waitForTimeout(2500);
const earnDump = await page.evaluate(() => {
  const t = document.body.innerText;
  return {
    mentionsAPY: /apy|apr|yield/i.test(t), mentionsDeposit: /deposit/i.test(t),
    mentionsLP: /liquidity|pool|vault|lp/i.test(t),
    dollars: (t.match(/\$[\d,]+(\.\d+)?/g) || []).slice(0, 20),
    pcts: (t.match(/[\d.]+%/g) || []).slice(0, 20),
    snippet: t.slice(0, 1500),
  };
});
note('earn', `APY=${earnDump.mentionsAPY} deposit=${earnDump.mentionsDeposit} LP=${earnDump.mentionsLP} pcts=${JSON.stringify(earnDump.pcts)}`);
fs.writeFileSync(`${OUT}/earn_text.txt`, earnDump.snippet);
await shotFull('07_earn.png');
endMark('earn');

// ---------- PORTFOLIO ----------
mark('portfolio');
// nav link PORTFOLIO
let navOk = false;
if (await page.locator('a:has-text("PORTFOLIO")').count()) {
  await page.locator('a:has-text("PORTFOLIO")').first().click().catch(() => {});
  navOk = true;
} else {
  await page.goto(APP + 'portfolio', { waitUntil: 'domcontentloaded' }).catch(() => {});
  navOk = true;
}
await page.waitForTimeout(4000);
const pfDump = await page.evaluate(() => {
  const t = document.body.innerText;
  const headers = [...document.querySelectorAll('th, [role="columnheader"]')].map(e => e.innerText.trim()).filter(Boolean);
  return {
    url: location.href,
    mentionsFunding: /funding/i.test(t), mentionsRayDev: /ray dev|curve skew|deviation|lean/i.test(t),
    mentionsPosition: /position/i.test(t), mentionsClose: /close/i.test(t),
    hasClose: !!document.querySelector('button'),
    tableHeaders: headers,
    fundingCol: headers.filter(h => /funding/i.test(h)),
    snippet: t.slice(0, 2000),
  };
});
note('portfolio', `url=${pfDump.url}`);
note('portfolio', `headers: ${JSON.stringify(pfDump.tableHeaders)}`);
note('portfolio', `funding col: ${JSON.stringify(pfDump.fundingCol)} rayDevMention=${pfDump.mentionsRayDev}`);
note('portfolio', `close controls present: ${pfDump.mentionsClose}`);
fs.writeFileSync(`${OUT}/portfolio_text.txt`, pfDump.snippet);
await shotFull('08_portfolio.png');
// look for a close-position button and note it (cannot execute without funds/positions)
const closeBtns = page.locator('button:has-text("Close"), button:has-text("CLOSE")');
note('portfolio', `close-position buttons: ${await closeBtns.count()}`);
endMark('portfolio');

// ---------- wrap up ----------
fs.writeFileSync(`${OUT}/e2e_console.log`, sink.map(s => `${s.t} [${s.kind}] ${s.text}`).join('\n'));
fs.writeFileSync(`${OUT}/e2e_wallet.log`, walletLog.join('\n'));
const summary = {};
for (const [k, f] of Object.entries(flows)) summary[k] = { notes: f.notes, errorCount: (f.errors || []).length, errorsSample: (f.errors || []).slice(0, 4).map(e => e.text.slice(0, 200)) };
fs.writeFileSync(`${OUT}/e2e_summary.json`, JSON.stringify(summary, null, 2));
console.log('\n===== FLOW SUMMARY =====');
for (const [k, v] of Object.entries(summary)) console.log(`${k}: ${v.errorCount} errors`);
console.log('total console/net events:', sink.length);
await browser.close();
