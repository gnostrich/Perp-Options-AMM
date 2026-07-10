// 16_e2e_final.mjs — DEFINITIVE run. Root cause fixed: the disclaimer has DISAGREE|AGREE;
// `has-text("AGREE")` also matches DISAGREE (substring) and .first() clicked DISAGREE,
// which redirects to the marketing site. Click the EXACT "AGREE" (text-is) to accept and
// unlock the app. Then tabs/toggles switch normally.
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
const acceptDisclaimer = async () => { const b = page.getByRole('button', { name: 'AGREE', exact: true }); if (await b.count()) { await b.first().click().catch(() => {}); await page.waitForTimeout(2500); return true; } return false; };
const activeTab = () => page.evaluate(() => { const e = document.querySelector('[role="tab"][data-state="active"]'); return e ? e.innerText.trim() : null; });
const switchTab = async (id, label) => { await page.evaluate((i) => { const el = document.getElementById(i); if (el) el.click(); }, id); await page.waitForTimeout(3000); const at = await activeTab(); return at; };

// ===== LANDING + ACCEPT + CONNECT =====
mark('landing');
const resp = await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
note('landing', `HTTP ${resp && resp.status()}`);
await page.waitForTimeout(7000);
await shot('01_landing_disclaimer.png');
const accepted = await acceptDisclaimer();
note('landing', `disclaimer AGREE (exact) clicked=${accepted}; url=${page.url()}`);
await page.waitForTimeout(2000);
await shot('02_connected.png');
const chip = await page.evaluate((a) => document.body.innerText.includes(a.slice(-4)), addr);
const prov = await page.evaluate(async () => { try { return { accounts: await window.ethereum.request({ method: 'eth_accounts' }), chainId: await window.ethereum.request({ method: 'eth_chainId' }) }; } catch (e) { return { err: String(e) }; } });
note('landing', `wallet chip=${chip} provider=${JSON.stringify(prov)} activeTab=${await activeTab()}`);
endMark('landing');

// ===== CREATE PERP LONG =====
mark('create_perp_long');
await switchTab('radix-_R_9clbtb_-trigger-create-perp', 'CREATE PERP');
if (await has('button:has-text("LONG/BUY")')) await page.locator('button:has-text("LONG/BUY")').first().click().catch(() => {});
await page.waitForTimeout(1200);
const lf = await page.evaluate(() => { const t = document.body.innerText; const near = (l, s = 55) => { const i = t.indexOf(l); return i < 0 ? null : t.slice(i, i + s).replace(/\n/g, ' '); }; const longBtn = [...document.querySelectorAll('button')].find(b => /LONG\/BUY/.test(b.innerText)); return { entry: near('Entry Price', 40), liq: near('Liquidation Price', 60), hl: near('Hyperliquid Tx Fees', 50), tmp: near('Temporal Tx Fees', 45), lev: (t.match(/\b\d+x\b/g) || []).slice(0, 6), createBtn: /CREATE POSITION/i.test(t), exec: near('Executed on', 30), longActiveCls: longBtn ? longBtn.className.slice(0, 60) : null }; });
note('create_perp_long', `entry=${lf.entry} | liq=${lf.liq}`);
note('create_perp_long', `HLfees=${lf.hl} | TMPfees=${lf.tmp} | ${lf.exec} | levTicks=${JSON.stringify(lf.lev)} createBtn=${lf.createBtn}`);
await shot('03_create_perp_long.png');
endMark('create_perp_long');

// ===== LEVERAGE / NOTIONAL =====
mark('leverage_notional');
const amt = page.locator('input[placeholder*="amount" i], input[placeholder*="Enter" i]').first();
if (await amt.count()) { await amt.click().catch(() => {}); await amt.fill('500').catch(() => {}); await page.waitForTimeout(800); }
const notBefore = await page.evaluate(() => { const t = document.body.innerText; const i = t.indexOf('NOTIONAL'); return i < 0 ? null : t.slice(i, i + 25).replace(/\n/g, ' '); });
const levB = (await bodyText()).match(/\b\d+x\b/);
const sl = page.locator('[role="slider"], input[type="range"]');
if (await sl.count()) { await sl.first().focus().catch(() => {}); for (let k = 0; k < 15; k++) { await sl.first().press('ArrowRight').catch(() => {}); await page.waitForTimeout(70); } }
await page.waitForTimeout(1000);
const aft = await page.evaluate(() => { const t = document.body.innerText; const near = (l, s = 55) => { const i = t.indexOf(l); return i < 0 ? null : t.slice(i, i + s).replace(/\n/g, ' '); }; return { lev: (t.match(/\b\d+x\b/) || [])[0], notional: near('NOTIONAL', 25), liq: near('Liquidation Price', 60) }; });
note('leverage_notional', `leverage ${levB && levB[0]} → ${aft.lev}; notional '${notBefore}' → '${aft.notional}'; liq=${aft.liq}`);
await shot('04_leverage_notional.png');
endMark('leverage_notional');

// ===== SHORT toggle =====
mark('create_perp_short');
if (await has('button:has-text("SHORT/SELL")')) await page.locator('button:has-text("SHORT/SELL")').first().click().catch(() => {});
await page.waitForTimeout(1500);
const sf = await page.evaluate(() => { const t = document.body.innerText; const near = (l, s = 55) => { const i = t.indexOf(l); return i < 0 ? null : t.slice(i, i + s).replace(/\n/g, ' '); }; const shortBtn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'SHORT/SELL'); const longBtn = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'LONG/BUY'); return { entry: near('Entry Price', 40), liq: near('Liquidation Price', 60), shortCls: shortBtn ? shortBtn.className.match(/bg-\[#\w+\]/g) : null, longCls: longBtn ? longBtn.className.match(/bg-\[#\w+\]/g) : null }; });
note('create_perp_short', `entry=${sf.entry} | liq=${sf.liq}`);
note('create_perp_short', `SHORT bg=${JSON.stringify(sf.shortCls)} LONG bg=${JSON.stringify(sf.longCls)} (active side differs)`);
await shot('05_create_perp_short.png');
endMark('create_perp_short');

// ===== TRADE BANDS =====
mark('trade_bands');
const tbTab = await switchTab('tour1-step2-trade-bands', 'TRADE BANDS');
note('trade_bands', `activeTab after switch=${tbTab}`);
await page.waitForTimeout(10000); // AMM tree backend
await shot('06_trade_bands.png');
const tb = await page.evaluate(() => { const t = document.body.innerText; return { activeTab: (document.querySelector('[role="tab"][data-state="active"]') || {}).innerText, strike: /strike/i.test(t), inner: /inner bound/i.test(t), outer: /outer bound/i.test(t), intrinsic: /intrinsic/i.test(t), extrinsic: /extrinsic/i.test(t), funding: /funding/i.test(t), rayDev: /ray dev|curve skew|deviation|lean/i.test(t), loadingOrError: /loading|did not receive|timeout|no data|unavailable|failed|retry/i.test(t), dollars: (t.match(/\$[\d,]+(\.\d+)?/g) || []).slice(0, 30), snippet: t.slice(0, 5000) }; });
note('trade_bands', `activeTab=${tb.activeTab} strike=${tb.strike} inner=${tb.inner} outer=${tb.outer} intrinsic=${tb.intrinsic} extrinsic=${tb.extrinsic} funding=${tb.funding} rayDev=${tb.rayDev} loadingOrError=${tb.loadingOrError}`);
note('trade_bands', `dollars=${JSON.stringify(tb.dollars)}`);
fs.writeFileSync(`${OUT}/tradebands_text.txt`, tb.snippet);
endMark('trade_bands');

// ===== EARN =====
mark('earn');
const enTab = await switchTab('radix-_R_9clbtb_-trigger-earn', 'EARN');
note('earn', `activeTab after switch=${enTab}`);
await page.waitForTimeout(5000);
await shot('07_earn.png');
const en = await page.evaluate(() => { const t = document.body.innerText; return { activeTab: (document.querySelector('[role="tab"][data-state="active"]') || {}).innerText, apy: /apy|apr|yield/i.test(t), deposit: /deposit/i.test(t), lp: /liquidity|pool|vault|lp|stake/i.test(t), withdraw: /withdraw/i.test(t), pcts: (t.match(/[\d.]+%/g) || []).slice(0, 20), dollars: (t.match(/\$[\d,]+(\.\d+)?/g) || []).slice(0, 20), loadingOrError: /loading|did not receive|timeout|no data|unavailable|failed/i.test(t), snippet: t.slice(0, 4000) }; });
note('earn', `activeTab=${en.activeTab} apy=${en.apy} deposit=${en.deposit} lp=${en.lp} withdraw=${en.withdraw} pcts=${JSON.stringify(en.pcts)} dollars=${JSON.stringify(en.dollars)}`);
fs.writeFileSync(`${OUT}/earn_text.txt`, en.snippet);
endMark('earn');

// ===== PORTFOLIO (nav) =====
mark('portfolio');
if (await has('a:has-text("PORTFOLIO")')) { await page.locator('a:has-text("PORTFOLIO")').first().click().catch(() => {}); } else { await page.goto(APP + 'portfolio', { waitUntil: 'domcontentloaded' }); }
await page.waitForTimeout(5000);
await acceptDisclaimer();
await page.waitForTimeout(1500);
await shot('08_portfolio_overview.png');
const grabHeaders = () => page.evaluate(() => [...document.querySelectorAll('th, [role="columnheader"]')].map(e => e.innerText.trim()).filter(Boolean));
const pfOverview = await page.evaluate(() => { const t = document.body.innerText; const near = (l, s = 18) => { const i = t.indexOf(l); return i < 0 ? null : t.slice(i, i + s).replace(/\n/g, ' '); }; return { total: near('TOTAL PORTFOLIO PNL'), perps: near('PERPS PNL'), bands: near('BANDS PNL'), earn: near('EARN PNL'), noData: /No historical PNL data/i.test(t) }; });
note('portfolio', `PNL: ${pfOverview.total} | ${pfOverview.perps} | ${pfOverview.bands} | ${pfOverview.earn} | noData=${pfOverview.noData}`);
const pfSub = async (label, file) => { const el = page.locator(`[role="tab"]`).filter({ hasText: label }).first(); if (await el.count()) { await el.click().catch(() => {}); await page.waitForTimeout(3000); } await acceptDisclaimer(); await shot(file); return grabHeaders(); };
const perpsH = await pfSub('PERPS', '08b_portfolio_perps.png');
note('portfolio', `PERPS headers: ${JSON.stringify(perpsH.slice(0, 13))}`);
note('portfolio', `PERPS funding col present: ${perpsH.some(h => /funding/i.test(h))}`);
const bandsH = await pfSub('BANDS', '08c_portfolio_bands.png');
note('portfolio', `BANDS(portfolio) headers: ${JSON.stringify(bandsH.slice(13, 25))}`);
note('portfolio', `BANDS funding col present: ${bandsH.some(h => /funding/i.test(h))}`);
const emptyStates = await page.evaluate(() => { const t = document.body.innerText; return { positions: (t.match(/no (open )?position|you have no|nothing here|no perps|no bands/gi) || []), close: (t.match(/\bclose\b/gi) || []).length }; });
note('portfolio', `empty-state phrases: ${JSON.stringify(emptyStates.positions)}; close word count=${emptyStates.close}`);
const earnH = await pfSub('EARN', '08d_portfolio_earn.png');
note('portfolio', `EARN(portfolio) headers slice: ${JSON.stringify(earnH.slice(25))}`);
const closeBtns = await page.locator('button:has-text("Close"), button:has-text("CLOSE")').count();
note('portfolio', `close-position buttons: ${closeBtns} (unfunded → no positions to close)`);
endMark('portfolio');

// ===== WRAP =====
fs.writeFileSync(`${OUT}/e2e_console.log`, sink.map(s => `${s.t} [${s.kind}] ${s.text}`).join('\n'));
fs.writeFileSync(`${OUT}/e2e_wallet.log`, walletLog.join('\n'));
const summary = {};
for (const [k, f] of Object.entries(flows)) { const errs = (f.errors || []).map(e => e.text); summary[k] = { notes: f.notes, errorCount: errs.length, uniqueErrors: [...new Set(errs.map(e => e.slice(0, 140)))].slice(0, 6) }; }
fs.writeFileSync(`${OUT}/e2e_summary.json`, JSON.stringify(summary, null, 2));
const allUniq = [...new Set(sink.filter(s => ['pageerror', 'console.error', 'requestfailed', 'http4xx5xx', 'ws.open', 'ws.close'].includes(s.kind)).map(s => `${s.kind}: ${s.text.slice(0, 170)}`))];
fs.writeFileSync(`${OUT}/e2e_unique_errors.txt`, allUniq.join('\n'));
console.log('\n===== FINAL FLOW SUMMARY =====');
for (const [k, v] of Object.entries(summary)) console.log(`${k}: ${v.errorCount} errors`);
console.log('\nGLOBAL UNIQUE NETWORK/CONSOLE CLASSES:', allUniq.length);
allUniq.forEach(e => console.log('  -', e.slice(0, 165)));
await browser.close();
