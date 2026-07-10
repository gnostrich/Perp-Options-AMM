import { chromium } from 'playwright';
import { loadWallet, installProvider, chromiumLaunchOpts } from './lib_wallet_provider.mjs';
const OUT = '/home/user/Perp-Options-AMM/evidence/staging_e2e_2026-07-10';
const { wallet, provider } = loadWallet();
const browser = await chromium.launch(chromiumLaunchOpts());
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 90)); });
await installProvider(page, wallet, provider, () => {});
await page.goto('https://app-staging.temporal.exchange/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
const ag = page.getByRole('button', { name: 'AGREE', exact: true }); if (await ag.count()) await ag.first().click();
await page.waitForTimeout(3000);
const mouseTab = async (id) => { const b = await page.locator('#' + id).boundingBox(); if (b) { await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(3500); } };
await mouseTab('tour1-step2-trade-bands');
await page.waitForTimeout(4000);
const op = page.locator('text=OPTIONS PRICING').first();
const b = await op.boundingBox();
if (b) { await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(7000); }
await page.screenshot({ path: `${OUT}/06b_options_pricing_chart.png` });
const info = await page.evaluate(() => {
  const t = document.body.innerText;
  return { optionsActive: /OPTIONS PRICING/i.test(t), numCanvas: document.querySelectorAll('canvas').length, strike: /strike/i.test(t), moneyness: /moneyness|ITM|OTM|ATM/i.test(t), dollars: (t.match(/\$[\d,]+(\.\d+)?/g) || []).slice(0, 15), snippet: t.slice(0, 800).replace(/\n+/g, ' ') };
});
console.log('OPTIONS PRICING:', JSON.stringify(info));
console.log('AMM tree timeout seen:', errs.some(e => /AMM tree/i.test(e)));
await browser.close();
