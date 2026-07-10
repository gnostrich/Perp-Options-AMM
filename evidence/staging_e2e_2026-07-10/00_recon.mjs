// 00_recon.mjs — load the staging app, dump DOM structure (buttons, tabs, nav),
// screenshot landing. No wallet interaction yet beyond provider injection.
import fs from 'node:fs';
import { chromium } from 'playwright';
import { loadWallet, installProvider, instrument, chromiumLaunchOpts } from './lib_wallet_provider.mjs';

const OUT = '/home/user/Perp-Options-AMM/evidence/staging_e2e_2026-07-10';
const sink = [];
const walletLog = [];

const { wallet, provider } = loadWallet();
const browser = await chromium.launch(chromiumLaunchOpts());
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
});
const page = await ctx.newPage();
instrument(page, sink);
const addr = await installProvider(page, wallet, provider, (m) => walletLog.push(m));
console.log('provider installed for', addr);

const resp = await page.goto('https://app-staging.temporal.exchange/', { waitUntil: 'domcontentloaded', timeout: 60000 });
console.log('HTTP', resp && resp.status());
await page.waitForTimeout(8000); // let the SPA hydrate
await page.screenshot({ path: `${OUT}/01_landing.png`, fullPage: true });

const dump = await page.evaluate(() => {
  const vis = (el) => !!(el.offsetParent || el.getClientRects().length);
  const grab = (sel) => [...document.querySelectorAll(sel)].filter(vis).map(el => ({
    tag: el.tagName, text: (el.innerText || el.value || '').trim().slice(0, 120),
    cls: (el.className || '').toString().slice(0, 120),
    id: el.id || undefined,
    href: el.href || undefined,
    testid: el.getAttribute('data-testid') || undefined,
  }));
  return {
    title: document.title,
    url: location.href,
    buttons: grab('button'),
    links: grab('a'),
    inputs: grab('input, select, textarea, [role="slider"]'),
    tabs: grab('[role="tab"], .tab, [data-tab]'),
    headings: grab('h1,h2,h3'),
    bodyText: document.body.innerText.slice(0, 5000),
  };
});
fs.writeFileSync(`${OUT}/recon_dom.json`, JSON.stringify(dump, null, 2));
fs.writeFileSync(`${OUT}/recon_console.log`, sink.map(s => `${s.t} [${s.kind}] ${s.text}`).join('\n'));
fs.writeFileSync(`${OUT}/recon_wallet.log`, walletLog.join('\n'));
console.log('TITLE:', dump.title);
console.log('BUTTONS:', dump.buttons.map(b => b.text).filter(Boolean).join(' | '));
console.log('TABS:', dump.tabs.map(b => b.text).filter(Boolean).join(' | '));
console.log('LINKS:', dump.links.map(b => b.text).filter(Boolean).slice(0, 30).join(' | '));
console.log('BODY (first 1200):\n', dump.bodyText.slice(0, 1200));
console.log('console events:', sink.length);
await browser.close();
