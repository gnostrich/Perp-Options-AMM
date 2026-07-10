// 17_capture_tabs.mjs — clean captures using trusted page.mouse.click for radix tabs
// (locator.click()/el.click() don't deliver the pointer events radix activates on).
import fs from 'node:fs';
import { chromium } from 'playwright';
import { loadWallet, installProvider, instrument, chromiumLaunchOpts } from './lib_wallet_provider.mjs';

const OUT = '/home/user/Perp-Options-AMM/evidence/staging_e2e_2026-07-10';
const APP = 'https://app-staging.temporal.exchange/';
const sink = [];
const { wallet, provider } = loadWallet();
const browser = await chromium.launch(chromiumLaunchOpts());
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' });
const page = await ctx.newPage();
instrument(page, sink);
const addr = await installProvider(page, wallet, provider, () => {});
const shot = (f) => page.screenshot({ path: `${OUT}/${f}` }).catch(() => {});
const activeTab = () => page.evaluate(() => { const e = document.querySelector('[role="tab"][data-state="active"]'); return e ? e.innerText.trim() : null; });
const mouseTab = async (id) => { const box = await page.locator(`#${id}`).boundingBox(); if (box) { await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2); await page.waitForTimeout(3500); } return activeTab(); };

await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(7000);
const ag = page.getByRole('button', { name: 'AGREE', exact: true });
if (await ag.count()) await ag.first().click();
await page.waitForTimeout(3000);
await shot('02_connected.png');
console.log('connected, activeTab=', await activeTab());

// CREATE PERP LONG clean
await mouseTab('radix-_R_9clbtb_-trigger-create-perp');
await page.waitForTimeout(1000);
await shot('03_create_perp_long.png');

// leverage: fill 500 + slide
const amt = page.locator('input[placeholder*="amount" i], input[placeholder*="Enter" i]').first();
if (await amt.count()) { await amt.click().catch(() => {}); await amt.fill('500').catch(() => {}); await page.waitForTimeout(700); }
const sl = page.locator('[role="slider"], input[type="range"]');
if (await sl.count()) { await sl.first().focus().catch(() => {}); for (let k = 0; k < 15; k++) { await sl.first().press('ArrowRight').catch(() => {}); await page.waitForTimeout(60); } }
await page.waitForTimeout(1000);
await shot('04_leverage_notional.png');
const levNow = await page.evaluate(() => (document.body.innerText.match(/\b\d+x\b/) || [])[0]);
console.log('leverage now=', levNow);

// SHORT toggle
const shortBtn = page.locator('button:has-text("SHORT/SELL")').first();
if (await shortBtn.count()) { const b = await shortBtn.boundingBox(); if (b) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); }
await page.waitForTimeout(1500);
await shot('05_create_perp_short.png');
const shortState = await page.evaluate(() => { const s = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'SHORT/SELL'); return s ? (s.className.match(/bg-\[#\w+\]/g) || []) : null; });
console.log('SHORT bg after click=', JSON.stringify(shortState));

// TRADE BANDS
const tbTab = await mouseTab('tour1-step2-trade-bands');
console.log('TRADE BANDS activeTab=', tbTab);
await page.waitForTimeout(9000);
await shot('06_trade_bands.png');
const tb = await page.evaluate(() => { const t = document.body.innerText; return { activeTab: (document.querySelector('[role="tab"][data-state="active"]') || {}).innerText, sellProfits: /SELL PROFITS ON/i.test(t), buyProfits: /BUY PROFITS ON/i.test(t), quantity: /QUANTITY/i.test(t), slippage: /slippage/i.test(t), txFees: /tx fees/i.test(t), perpMark: /PERP MARK PRICING/i.test(t), optionsPricing: /OPTIONS PRICING/i.test(t), transactBtn: /TRANSACT PERP|^TRANSACT$/im.test(t), dollars: (t.match(/\$[\d,]+(\.\d+)?/g) || []).slice(0, 20), pcts: (t.match(/[\d.]+%/g) || []).slice(0, 10), snippet: t.slice(0, 5000) }; });
console.log('TRADE BANDS content:', JSON.stringify({ ...tb, snippet: undefined }));
fs.writeFileSync(`${OUT}/tradebands_text.txt`, tb.snippet);

// EARN
const enTab = await mouseTab('radix-_R_9clbtb_-trigger-earn');
console.log('EARN activeTab=', enTab);
await page.waitForTimeout(6000);
await shot('07_earn.png');
const en = await page.evaluate(() => { const t = document.body.innerText; return { activeTab: (document.querySelector('[role="tab"][data-state="active"]') || {}).innerText, apy: /apy|apr|yield/i.test(t), deposit: /deposit/i.test(t), withdraw: /withdraw/i.test(t), lp: /liquidity|pool|vault|lp|stake/i.test(t), pcts: (t.match(/[\d.]+%/g) || []).slice(0, 15), dollars: (t.match(/\$[\d,]+(\.\d+)?/g) || []).slice(0, 15), snippet: t.slice(0, 4000) }; });
console.log('EARN content:', JSON.stringify({ ...en, snippet: undefined }));
fs.writeFileSync(`${OUT}/earn_text.txt`, en.snippet);

fs.writeFileSync(`${OUT}/capture_console.log`, sink.map(s => `${s.t} [${s.kind}] ${s.text}`).join('\n'));
await browser.close();
console.log('DONE');
