// 12_e2e_flows_v3.mjs — v3: defensive disclaimer-dismiss before EVERY flow; do NOT
// click "Connect to Arbitrum" (that re-mounts the app and re-triggers the disclaimer).
// Focus: clean screenshots of every view + full portfolio sub-tabs (funding columns).
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
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' });
const page = await ctx.newPage();
instrument(page, sink);
const addr = await installProvider(page, wallet, provider, (m) => walletLog.push(m));
const shot = (f) => page.screenshot({ path: `${OUT}/${f}` }).catch(e => console.log('shot err', f, e.message));
const bodyText = () => page.evaluate(() => document.body.innerText);
const has = async (sel) => (await page.locator(sel).count()) > 0;
const killDisclaimer = async () => {
  for (let i = 0; i < 3; i++) {
    if (await has('button:has-text("AGREE")')) { await page.locator('button:has-text("AGREE")').first().click().catch(() => {}); await page.waitForTimeout(1500); }
    else break;
  }
  return !(await has('button:has-text("AGREE")'));
};
const clickIf = async (sel) => { if (await has(sel)) { await page.locator(sel).first().click().catch(() => {}); return true; } return false; };
const subtab = async (label) => { await killDisclaimer(); const sel = `button:has-text("${label}"), [role="tab"]:has-text("${label}")`; if (await has(sel)) { await page.locator(sel).first().click().catch(() => {}); await page.waitForTimeout(2500); await killDisclaimer(); return true; } return false; };
const grabHeaders = () => page.evaluate(() => [...document.querySelectorAll('th, [role="columnheader"]')].map(e => e.innerText.trim()).filter(Boolean));

// ===== LANDING + CONNECT =====
mark('landing');
const resp = await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
note('landing', `HTTP ${resp && resp.status()}`);
await page.waitForTimeout(6000);
await shot('01_landing.png');
const killed = await killDisclaimer();
note('landing', `disclaimer killed=${killed}`);
await page.waitForTimeout(1500);
await shot('01b_app_transact.png');
endMark('landing');

mark('connect');
const chip = await page.evaluate((a) => document.body.innerText.includes(a.slice(-4)), addr);
const provState = await page.evaluate(async () => { try { return { accounts: await window.ethereum.request({ method: 'eth_accounts' }), chainId: await window.ethereum.request({ method: 'eth_chainId' }), isMetaMask: window.ethereum.isMetaMask }; } catch (e) { return { err: String(e) }; } });
note('connect', `chip=${chip} provider=${JSON.stringify(provState)}`);
await shot('02_connected.png');
endMark('connect');

// ===== CREATE PERP LONG =====
mark('create_perp_long');
await subtab('CREATE PERP');
await clickIf('button:has-text("LONG/BUY")');
await killDisclaimer();
await page.waitForTimeout(1000);
const longForm = await page.evaluate(() => { const t = document.body.innerText; const near = (l, s = 60) => { const i = t.indexOf(l); return i < 0 ? null : t.slice(i, i + s).replace(/\n/g, ' '); }; return { entry: near('Entry Price', 40), liq: near('Liquidation Price', 55), hlFees: near('Hyperliquid Tx Fees', 50), tmpFees: near('Temporal Tx Fees', 45), leverage: (t.match(/\b\d+x\b/g) || []).slice(0, 6), createBtn: /CREATE POSITION/i.test(t), autoProtect: /AUTO-PROTECT/i.test(t), executedOn: near('Executed on', 30) }; });
note('create_perp_long', `entry=${longForm.entry} liq=${longForm.liq}`);
note('create_perp_long', `hlFees=${longForm.hlFees} tmpFees=${longForm.tmpFees} executedOn=${longForm.executedOn}`);
note('create_perp_long', `leverage=${JSON.stringify(longForm.leverage)} createBtn=${longForm.createBtn}`);
await shot('03_create_perp_long.png');
endMark('create_perp_long');

// ===== LEVERAGE / NOTIONAL =====
mark('leverage_notional');
await killDisclaimer();
const amt = page.locator('input[placeholder*="amount" i], input[placeholder*="Enter" i]').first();
if (await amt.count()) { await amt.click().catch(() => {}); await amt.fill('500').catch(() => {}); await page.waitForTimeout(800); }
const sl = page.locator('[role="slider"], input[type="range"]');
const levBefore = (await bodyText()).match(/\b\d+x\b/);
if (await sl.count()) { await sl.first().focus().catch(() => {}); for (let k = 0; k < 12; k++) { await sl.first().press('ArrowRight').catch(() => {}); await page.waitForTimeout(80); } }
await page.waitForTimeout(1000);
await killDisclaimer();
const afterLev = await page.evaluate(() => { const t = document.body.innerText; const near = (l, s = 50) => { const i = t.indexOf(l); return i < 0 ? null : t.slice(i, i + s).replace(/\n/g, ' '); }; return { lev: (t.match(/\b\d+x\b/) || [])[0], deposit: near('DEPOSIT', 20), notional: near('NOTIONAL', 25), liq: near('Liquidation Price', 55) }; });
note('leverage_notional', `levBefore=${levBefore && levBefore[0]} → after=${afterLev.lev}; notional=${afterLev.notional}; liq=${afterLev.liq}`);
await shot('04_leverage_notional.png');
endMark('leverage_notional');

// ===== CREATE PERP SHORT =====
mark('create_perp_short');
await killDisclaimer();
await clickIf('button:has-text("SHORT/SELL")');
await page.waitForTimeout(1200);
await killDisclaimer();
const shortForm = await page.evaluate(() => { const t = document.body.innerText; const near = (l, s = 55) => { const i = t.indexOf(l); return i < 0 ? null : t.slice(i, i + s).replace(/\n/g, ' '); }; return { shortSel: /SHORT\/SELL/.test(t), entry: near('Entry Price', 40), liq: near('Liquidation Price', 55) }; });
note('create_perp_short', `entry=${shortForm.entry} liq=${shortForm.liq}`);
await shot('05_create_perp_short.png');
endMark('create_perp_short');

// ===== TRADE BANDS =====
mark('trade_bands');
await subtab('TRADE BANDS');
await page.waitForTimeout(2000);
await killDisclaimer();
await shot('06_trade_bands.png');
const bands = await page.evaluate(() => { const t = document.body.innerText; return { strike: /strike/i.test(t), band: /band/i.test(t), funding: /funding/i.test(t), rayDev: /ray dev|curve skew|deviation|lean/i.test(t), inner: /inner bound/i.test(t), outer: /outer bound/i.test(t), intrinsic: /intrinsic/i.test(t), extrinsic: /extrinsic/i.test(t), dollars: (t.match(/\$[\d,]+(\.\d+)?/g) || []).slice(0, 24), buttons: [...document.querySelectorAll('button')].map(b => b.innerText.trim()).filter(Boolean).slice(0, 30), snippet: t.slice(0, 3000) }; });
note('trade_bands', `strike=${bands.strike} band=${bands.band} inner/outer=${bands.inner}/${bands.outer} intr/extr=${bands.intrinsic}/${bands.extrinsic} funding=${bands.funding} rayDev=${bands.rayDev}`);
note('trade_bands', `dollars=${JSON.stringify(bands.dollars)}`);
note('trade_bands', `buttons=${JSON.stringify(bands.buttons)}`);
fs.writeFileSync(`${OUT}/tradebands_text.txt`, bands.snippet);
endMark('trade_bands');

// ===== EARN =====
mark('earn');
await subtab('EARN');
await page.waitForTimeout(2000);
await killDisclaimer();
await shot('07_earn.png');
const earn = await page.evaluate(() => { const t = document.body.innerText; return { apy: /apy|apr|yield/i.test(t), deposit: /deposit/i.test(t), lp: /liquidity|pool|vault|lp|stake/i.test(t), dollars: (t.match(/\$[\d,]+(\.\d+)?/g) || []).slice(0, 20), pcts: (t.match(/[\d.]+%/g) || []).slice(0, 20), buttons: [...document.querySelectorAll('button')].map(b => b.innerText.trim()).filter(Boolean).slice(0, 30), snippet: t.slice(0, 2500) }; });
note('earn', `apy=${earn.apy} deposit=${earn.deposit} lp=${earn.lp} pcts=${JSON.stringify(earn.pcts)} dollars=${JSON.stringify(earn.dollars)}`);
note('earn', `buttons=${JSON.stringify(earn.buttons)}`);
fs.writeFileSync(`${OUT}/earn_text.txt`, earn.snippet);
endMark('earn');

// ===== PORTFOLIO =====
mark('portfolio');
await killDisclaimer();
if (!(await clickIf('a:has-text("PORTFOLIO")'))) await page.goto(APP + 'portfolio', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(5000);
await killDisclaimer();
await page.waitForTimeout(1500);
await shot('08_portfolio_overview.png');
const pfOverview = await page.evaluate(() => { const t = document.body.innerText; return { totalPnl: (t.match(/TOTAL PORTFOLIO PNL[\s\S]{0,15}/i) || [''])[0].replace(/\n/g, ' '), perpsPnl: (t.match(/PERPS PNL[\s\S]{0,15}/i) || [''])[0].replace(/\n/g, ' '), bandsPnl: (t.match(/BANDS PNL[\s\S]{0,15}/i) || [''])[0].replace(/\n/g, ' '), earnPnl: (t.match(/EARN PNL[\s\S]{0,15}/i) || [''])[0].replace(/\n/g, ' '), noData: /No historical PNL data/i.test(t) }; });
note('portfolio', `overview PNL: total='${pfOverview.totalPnl}' perps='${pfOverview.perpsPnl}' bands='${pfOverview.bandsPnl}' earn='${pfOverview.earnPnl}' noData=${pfOverview.noData}`);
const pfSub = async (label, file) => { const sel = `[role="tab"]:has-text("${label}"), button:has-text("${label}")`; if (await has(sel)) { await page.locator(sel).first().click().catch(() => {}); await page.waitForTimeout(3000); await killDisclaimer(); } await shot(file); return grabHeaders(); };
const perpsHeaders = await pfSub('PERPS', '08b_portfolio_perps.png');
note('portfolio', `PERPS headers: ${JSON.stringify(perpsHeaders)}`);
note('portfolio', `PERPS funding col: ${JSON.stringify(perpsHeaders.filter(h => /funding/i.test(h)))}`);
const perpsEmpty = await page.evaluate(() => { const t = document.body.innerText; return { empty: /no (open )?position|no perps|you have no|nothing here/i.test(t), close: (t.match(/\bclose\b/gi) || []).length }; });
note('portfolio', `PERPS emptyState=${perpsEmpty.empty} closeWordCount=${perpsEmpty.close}`);
const bandsHeaders = await pfSub('BANDS', '08c_portfolio_bands.png');
note('portfolio', `BANDS headers: ${JSON.stringify(bandsHeaders)}`);
note('portfolio', `BANDS funding col: ${JSON.stringify(bandsHeaders.filter(h => /funding/i.test(h)))}`);
// funding header tooltip probe
let tip = null;
const fh = page.locator('th:has-text("FUNDING"), [role="columnheader"]:has-text("FUNDING")').first();
if (await fh.count()) { await fh.hover().catch(() => {}); await page.waitForTimeout(1000); tip = await page.evaluate(() => { const els = [...document.querySelectorAll('[title]')].filter(e => /funding|ray|deviation|skew|lean|tbd/i.test(e.getAttribute('title') || '')); return els.length ? els[0].getAttribute('title') : null; }); }
note('portfolio', `funding tooltip: ${JSON.stringify(tip)}`);
const earnPfHeaders = await pfSub('EARN', '08d_portfolio_earn.png');
note('portfolio', `EARN(pf) headers: ${JSON.stringify(earnPfHeaders)}`);
const closeBtns = await page.locator('button:has-text("Close"), button:has-text("CLOSE")').count();
note('portfolio', `close-position buttons: ${closeBtns}`);
endMark('portfolio');

// ===== WRAP =====
fs.writeFileSync(`${OUT}/e2e_console.log`, sink.map(s => `${s.t} [${s.kind}] ${s.text}`).join('\n'));
fs.writeFileSync(`${OUT}/e2e_wallet.log`, walletLog.join('\n'));
const summary = {};
for (const [k, f] of Object.entries(flows)) { const errs = (f.errors || []).map(e => e.text); const uniq = [...new Set(errs.map(e => e.slice(0, 140)))]; summary[k] = { notes: f.notes, errorCount: errs.length, uniqueErrors: uniq.slice(0, 6) }; }
fs.writeFileSync(`${OUT}/e2e_summary.json`, JSON.stringify(summary, null, 2));
// global unique errors
const allUniq = [...new Set(sink.filter(s => s.kind === 'pageerror' || s.kind === 'console.error' || s.kind === 'requestfailed' || s.kind === 'http4xx5xx').map(s => `${s.kind}: ${s.text.slice(0, 160)}`))];
fs.writeFileSync(`${OUT}/e2e_unique_errors.txt`, allUniq.join('\n'));
console.log('\n===== FLOW SUMMARY =====');
for (const [k, v] of Object.entries(summary)) console.log(`${k}: ${v.errorCount} errors, ${v.uniqueErrors.length} unique`);
console.log('GLOBAL UNIQUE ERROR CLASSES:', allUniq.length);
allUniq.forEach(e => console.log('  -', e.slice(0, 150)));
await browser.close();
