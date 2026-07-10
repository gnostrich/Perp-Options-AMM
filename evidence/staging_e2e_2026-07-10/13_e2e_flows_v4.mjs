// 13_e2e_flows_v4.mjs — final clean transact pass. AGREE bounces to marketing → use
// ensureApp() (click "Trade") to re-enter the dashboard; killDisclaimer defensively;
// never click "Connect to Arbitrum" (it re-mounts + re-triggers disclaimer).
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
const shot = (f) => page.screenshot({ path: `${OUT}/${f}` }).catch(() => {});
const bodyText = () => page.evaluate(() => document.body.innerText);
const has = async (sel) => (await page.locator(sel).count()) > 0;
const onDash = async () => { const t = await bodyText(); return t.includes('CREATE PERP') && t.includes('TRANSACT') && !t.includes("What's Temporal"); };
const killDisclaimer = async () => { for (let i = 0; i < 2; i++) { if (await has('button:has-text("AGREE")')) { await page.locator('button:has-text("AGREE")').first().click().catch(() => {}); await page.waitForTimeout(1500); } else break; } };
const ensureDash = async () => {
  await killDisclaimer();
  if (await onDash()) return true;
  // marketing hero → click Trade
  const trade = page.locator('a:has-text("Trade"), button:has-text("Trade")').first();
  if (await trade.count()) { await trade.click().catch(() => {}); await page.waitForTimeout(3500); }
  await killDisclaimer();
  if (!(await onDash())) { await page.goto(APP, { waitUntil: 'domcontentloaded' }).catch(() => {}); await page.waitForTimeout(4000); await killDisclaimer(); const tr = page.locator('a:has-text("Trade"), button:has-text("Trade")').first(); if (!(await onDash()) && await tr.count()) { await tr.click().catch(() => {}); await page.waitForTimeout(3500); await killDisclaimer(); } }
  return onDash();
};
const clickIf = async (sel) => { if (await has(sel)) { await page.locator(sel).first().click().catch(() => {}); return true; } return false; };
const subtab = async (label) => { await ensureDash(); const sel = `button:has-text("${label}"), [role="tab"]:has-text("${label}")`; if (await has(sel)) { await page.locator(sel).first().click().catch(() => {}); await page.waitForTimeout(3000); await killDisclaimer(); return true; } return false; };

// ===== LANDING =====
mark('landing');
const resp = await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
note('landing', `HTTP ${resp && resp.status()}`);
await page.waitForTimeout(6000);
await shot('01_landing_disclaimer.png');
const dashOk = await ensureDash();
note('landing', `dashboard reached=${dashOk}`);
await page.waitForTimeout(1500);
await shot('02_connected.png');
const chip = await page.evaluate((a) => document.body.innerText.includes(a.slice(-4)), addr);
const prov = await page.evaluate(async () => { try { return { accounts: await window.ethereum.request({ method: 'eth_accounts' }), chainId: await window.ethereum.request({ method: 'eth_chainId' }) }; } catch (e) { return { err: String(e) }; } });
note('landing', `wallet chip=${chip} provider=${JSON.stringify(prov)}`);
endMark('landing');

// ===== CREATE PERP LONG =====
mark('create_perp_long');
await subtab('CREATE PERP');
await clickIf('button:has-text("LONG/BUY")');
await killDisclaimer();
await page.waitForTimeout(1000);
const lf = await page.evaluate(() => { const t = document.body.innerText; const near = (l, s = 55) => { const i = t.indexOf(l); return i < 0 ? null : t.slice(i, i + s).replace(/\n/g, ' '); }; return { entry: near('Entry Price', 40), liq: near('Liquidation Price', 60), hl: near('Hyperliquid Tx Fees', 50), tmp: near('Temporal Tx Fees', 45), lev: (t.match(/\b\d+x\b/g) || []).slice(0, 6), createBtn: /CREATE POSITION/i.test(t), exec: near('Executed on', 30) }; });
note('create_perp_long', `entry=${lf.entry} | liq=${lf.liq}`);
note('create_perp_long', `HLfees=${lf.hl} | TMPfees=${lf.tmp} | ${lf.exec} | levTicks=${JSON.stringify(lf.lev)} createBtn=${lf.createBtn}`);
await shot('03_create_perp_long.png');
endMark('create_perp_long');

// ===== LEVERAGE / NOTIONAL =====
mark('leverage_notional');
await killDisclaimer();
const amt = page.locator('input[placeholder*="amount" i], input[placeholder*="Enter" i]').first();
if (await amt.count()) { await amt.click().catch(() => {}); await amt.fill('500').catch(() => {}); await page.waitForTimeout(800); }
const notBefore = await page.evaluate(() => { const t = document.body.innerText; const i = t.indexOf('NOTIONAL'); return i < 0 ? null : t.slice(i, i + 25).replace(/\n/g, ' '); });
const levB = (await bodyText()).match(/\b\d+x\b/);
const sl = page.locator('[role="slider"], input[type="range"]');
if (await sl.count()) { await sl.first().focus().catch(() => {}); for (let k = 0; k < 12; k++) { await sl.first().press('ArrowRight').catch(() => {}); await page.waitForTimeout(80); } }
await page.waitForTimeout(1000);
await killDisclaimer();
const aft = await page.evaluate(() => { const t = document.body.innerText; const near = (l, s = 55) => { const i = t.indexOf(l); return i < 0 ? null : t.slice(i, i + s).replace(/\n/g, ' '); }; return { lev: (t.match(/\b\d+x\b/) || [])[0], notional: near('NOTIONAL', 25), liq: near('Liquidation Price', 60) }; });
note('leverage_notional', `leverage ${levB && levB[0]} → ${aft.lev}; notional '${notBefore}' → '${aft.notional}'; liq=${aft.liq}`);
await shot('04_leverage_notional.png');
endMark('leverage_notional');

// ===== SHORT =====
mark('create_perp_short');
await killDisclaimer();
await clickIf('button:has-text("SHORT/SELL")');
await page.waitForTimeout(1200);
await killDisclaimer();
const sf = await page.evaluate(() => { const t = document.body.innerText; const near = (l, s = 55) => { const i = t.indexOf(l); return i < 0 ? null : t.slice(i, i + s).replace(/\n/g, ' '); }; return { entry: near('Entry Price', 40), liq: near('Liquidation Price', 60), shortActive: /SHORT\/SELL/.test(t) }; });
note('create_perp_short', `entry=${sf.entry} | liq=${sf.liq}`);
await shot('05_create_perp_short.png');
endMark('create_perp_short');

// ===== TRADE BANDS =====
mark('trade_bands');
await subtab('TRADE BANDS');
await page.waitForTimeout(3000);
await killDisclaimer();
await shot('06_trade_bands.png');
const tb = await page.evaluate(() => { const t = document.body.innerText; return { strike: /strike/i.test(t), band: /band/i.test(t), funding: /funding/i.test(t), rayDev: /ray dev|curve skew|deviation|lean/i.test(t), inner: /inner/i.test(t), outer: /outer/i.test(t), intrinsic: /intrinsic/i.test(t), extrinsic: /extrinsic/i.test(t), loading: /loading|did not receive|timeout|no data|unavailable/i.test(t), dollars: (t.match(/\$[\d,]+(\.\d+)?/g) || []).slice(0, 24), snippet: t.slice(0, 3500) }; });
note('trade_bands', `strike=${tb.strike} band=${tb.band} inner=${tb.inner} outer=${tb.outer} intrinsic=${tb.intrinsic} extrinsic=${tb.extrinsic} funding=${tb.funding} rayDev=${tb.rayDev} loadingState=${tb.loading}`);
note('trade_bands', `dollars=${JSON.stringify(tb.dollars)}`);
fs.writeFileSync(`${OUT}/tradebands_text.txt`, tb.snippet);
endMark('trade_bands');

// ===== EARN =====
mark('earn');
await subtab('EARN');
await page.waitForTimeout(3000);
await killDisclaimer();
await shot('07_earn.png');
const en = await page.evaluate(() => { const t = document.body.innerText; return { apy: /apy|apr|yield/i.test(t), deposit: /deposit/i.test(t), lp: /liquidity|pool|vault|lp|stake/i.test(t), pcts: (t.match(/[\d.]+%/g) || []).slice(0, 20), dollars: (t.match(/\$[\d,]+(\.\d+)?/g) || []).slice(0, 20), snippet: t.slice(0, 3000) }; });
note('earn', `apy=${en.apy} deposit=${en.deposit} lp=${en.lp} pcts=${JSON.stringify(en.pcts)} dollars=${JSON.stringify(en.dollars)}`);
fs.writeFileSync(`${OUT}/earn_text.txt`, en.snippet);
endMark('earn');

// ===== WRAP =====
fs.writeFileSync(`${OUT}/e2e_v4_console.log`, sink.map(s => `${s.t} [${s.kind}] ${s.text}`).join('\n'));
const summary = {};
for (const [k, f] of Object.entries(flows)) { const errs = (f.errors || []).map(e => e.text); summary[k] = { notes: f.notes, errorCount: errs.length, uniqueErrors: [...new Set(errs.map(e => e.slice(0, 140)))].slice(0, 6) }; }
fs.writeFileSync(`${OUT}/e2e_v4_summary.json`, JSON.stringify(summary, null, 2));
console.log('\n===== V4 FLOW SUMMARY =====');
for (const [k, v] of Object.entries(summary)) console.log(`${k}: ${v.errorCount} errors`);
await browser.close();
