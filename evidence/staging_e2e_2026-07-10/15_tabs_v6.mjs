// 15_tabs_v6.mjs — robust tab switching by radix trigger id + role=tab; verify the
// active tab actually changes; capture SHORT toggle, TRADE BANDS, EARN content.
import fs from 'node:fs';
import { chromium } from 'playwright';
import { loadWallet, installProvider, instrument, chromiumLaunchOpts } from './lib_wallet_provider.mjs';

const OUT = '/home/user/Perp-Options-AMM/evidence/staging_e2e_2026-07-10';
const APP = 'https://app-staging.temporal.exchange/';
const sink = [];
const walletLog = [];
const { wallet, provider } = loadWallet();
const browser = await chromium.launch(chromiumLaunchOpts());
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' });
const page = await ctx.newPage();
instrument(page, sink);
const addr = await installProvider(page, wallet, provider, (m) => walletLog.push(m));
const shot = (f) => page.screenshot({ path: `${OUT}/${f}` }).catch(() => {});
const hideDisclaimer = () => page.evaluate(() => { const heads = [...document.querySelectorAll('h1,h2,h3,div,section')].filter(e => /^\s*DISCLAIMER\s*$/i.test(e.textContent || '') || /Experimental Application/i.test(e.textContent || '')); let n2 = 0; for (const h of heads) { let n = h; for (let up = 0; up < 8 && n; up++) { const cs = getComputedStyle(n); if (cs.position === 'fixed' || cs.position === 'absolute' || n.getAttribute('role') === 'dialog') { n.style.setProperty('display', 'none', 'important'); n2++; break; } n = n.parentElement; } } document.querySelectorAll('[role="dialog"],[aria-modal="true"]').forEach(e => { e.style.setProperty('display', 'none', 'important'); }); return n2; });
const activeTab = () => page.evaluate(() => { const el = document.querySelector('[role="tab"][data-state="active"], [role="tab"][aria-selected="true"]'); return el ? el.innerText.trim() : null; });
// click a radix tab trigger by visible label, via role=tab
const clickTabByRole = async (label) => {
  const tab = page.locator(`[role="tab"]`).filter({ hasText: label }).first();
  if (await tab.count()) { await tab.scrollIntoViewIfNeeded().catch(() => {}); await tab.click().catch(() => {}); return true; }
  return false;
};

await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(7000);
await hideDisclaimer();
await page.waitForTimeout(500);
console.log('initial active tab:', await activeTab());

// ---- list all role=tab elements for diagnostics ----
const tabList = await page.evaluate(() => [...document.querySelectorAll('[role="tab"]')].map(e => ({ text: e.innerText.trim(), id: e.id, state: e.getAttribute('data-state') || e.getAttribute('aria-selected') })));
console.log('ROLE=TAB elements:', JSON.stringify(tabList));
fs.writeFileSync(`${OUT}/tab_diagnostics.json`, JSON.stringify(tabList, null, 2));

// ===== SHORT toggle (within CREATE PERP) =====
await hideDisclaimer();
const shortBtn = page.locator('button:has-text("SHORT/SELL")').first();
if (await shortBtn.count()) { await shortBtn.click().catch(() => {}); await page.waitForTimeout(1500); await hideDisclaimer(); }
const shortState = await page.evaluate(() => { const btns = [...document.querySelectorAll('button')].filter(b => /SHORT\/SELL|LONG\/BUY/.test(b.innerText)); return btns.map(b => ({ t: b.innerText.trim(), active: /bg-|active|data-state=.active/.test(b.className) || b.getAttribute('data-state') === 'active', cls: b.className.slice(0, 80) })); });
console.log('SHORT toggle state:', JSON.stringify(shortState));
await shot('05_create_perp_short.png');

// ===== TRADE BANDS =====
await hideDisclaimer();
let ok = await clickTabByRole('TRADE BANDS');
if (!ok) ok = await page.evaluate(() => { const el = document.getElementById('tour1-step2-trade-bands'); if (el) { el.click(); return true; } return false; });
await page.waitForTimeout(4000);
await hideDisclaimer();
console.log('after TRADE BANDS click, active tab:', await activeTab());
await page.waitForTimeout(9000); // AMM tree
await hideDisclaimer();
await shot('06_trade_bands.png');
const tb = await page.evaluate(() => { const t = document.body.innerText; return { activeTab: (document.querySelector('[role="tab"][data-state="active"]') || {}).innerText, strike: /strike/i.test(t), inner: /inner bound/i.test(t), outer: /outer bound/i.test(t), intrinsic: /intrinsic/i.test(t), extrinsic: /extrinsic/i.test(t), funding: /funding/i.test(t), rayDev: /ray dev|curve skew|deviation|lean/i.test(t), loadingOrError: /loading|did not receive|timeout|no data|unavailable|failed|retry/i.test(t), dollars: (t.match(/\$[\d,]+(\.\d+)?/g) || []).slice(0, 30), snippet: t.slice(0, 4500) }; });
console.log('TRADE BANDS content:', JSON.stringify({ ...tb, snippet: undefined }));
fs.writeFileSync(`${OUT}/tradebands_text.txt`, tb.snippet);

// ===== EARN =====
await hideDisclaimer();
let ok2 = await clickTabByRole('EARN');
if (!ok2) ok2 = await page.evaluate(() => { const els = [...document.querySelectorAll('[role="tab"]')].filter(e => /EARN/.test(e.innerText)); if (els[0]) { els[0].click(); return true; } return false; });
await page.waitForTimeout(4000);
await hideDisclaimer();
console.log('after EARN click, active tab:', await activeTab());
await page.waitForTimeout(4000);
await hideDisclaimer();
await shot('07_earn.png');
const en = await page.evaluate(() => { const t = document.body.innerText; return { activeTab: (document.querySelector('[role="tab"][data-state="active"]') || {}).innerText, apy: /apy|apr|yield/i.test(t), deposit: /deposit/i.test(t), lp: /liquidity|pool|vault|lp|stake/i.test(t), withdraw: /withdraw/i.test(t), pcts: (t.match(/[\d.]+%/g) || []).slice(0, 20), dollars: (t.match(/\$[\d,]+(\.\d+)?/g) || []).slice(0, 20), loadingOrError: /loading|did not receive|timeout|no data|unavailable|failed/i.test(t), snippet: t.slice(0, 3500) }; });
console.log('EARN content:', JSON.stringify({ ...en, snippet: undefined }));
fs.writeFileSync(`${OUT}/earn_text.txt`, en.snippet);

fs.writeFileSync(`${OUT}/v6_console.log`, sink.map(s => `${s.t} [${s.kind}] ${s.text}`).join('\n'));
await browser.close();
console.log('DONE');
