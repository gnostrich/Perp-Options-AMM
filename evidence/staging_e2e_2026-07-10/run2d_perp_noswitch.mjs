// run2d — CREATE PERP without the Arbitrum-One switch (stays 0x66eee, as round-1), full
// same-origin POST tap, to settle whether the enabled CREATE POSITION click fires a backend
// write (like EARN) or is a true silent no-op.
import fs from 'node:fs';
import { chromium } from 'playwright';
import { loadWallet, installProvider, instrument, chromiumLaunchOpts } from './lib_wallet_provider.mjs';
const OUT = '/home/user/Perp-Options-AMM/evidence/staging_e2e_2026-07-10';
const APP = 'https://app-staging.temporal.exchange/';
const sink = [], walletLog = [], netLog = [];
const { wallet, provider } = loadWallet();
const browser = await chromium.launch(chromiumLaunchOpts());
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
instrument(page, sink);
page.on('dialog', async (d) => { walletLog.push(`[dialog] ${d.message().slice(0, 200)}`); await d.accept().catch(() => {}); });
const isStatic = (u) => /\.(png|jpg|svg|woff2?|css|ico|webp)(\?|$)|_next\/static|googletag|analytics|tradingview|datafeed/i.test(u);
page.on('request', (r) => { const u = r.url(); if (!isStatic(u) && r.method() === 'POST') netLog.push(`REQ POST ${u.slice(0, 140)} body=${(r.postData() || '').slice(0, 700)}`); });
page.on('response', async (r) => { const u = r.url(); if (isStatic(u) || r.request().method() !== 'POST' || /rpc/.test(u)) return; let b = ''; try { b = (await r.text()).slice(0, 500); } catch (_) {} netLog.push(`RESP ${r.status()} ${u.slice(0, 140)} body=${b}`); });
const addr = await installProvider(page, wallet, provider, (m) => walletLog.push(m));
const shot = (f) => page.screenshot({ path: `${OUT}/${f}` }).catch(() => {});
const mouseClick = async (loc) => { const b = await loc.boundingBox(); if (!b) return false; await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); return true; };
const toasts = () => page.evaluate(() => { const o = []; ['[role="alert"]', '[role="status"]', '[data-sonner-toast]', '[class*="toast" i]'].forEach(s => document.querySelectorAll(s).forEach(e => { const t = e.innerText.trim(); if (t) o.push(t.replace(/\n/g, ' | ').slice(0, 250)); })); return [...new Set(o)]; });

await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(7000);
const ag = page.getByRole('button', { name: 'AGREE', exact: true }); if (await ag.count()) { await ag.first().click(); await page.waitForTimeout(2500); }
console.log('chainId', await page.evaluate(() => window.ethereum.chainId), '(no switch)');
const cp = page.locator('[role="tab"]').filter({ hasText: 'CREATE PERP' }).first(); if (await cp.count()) { await mouseClick(cp); await page.waitForTimeout(2000); }
// LONG default; fill deposit
const dep = await page.evaluate(() => { const el = [...document.querySelectorAll('input')].find(i => /amount/i.test(i.placeholder || '') && i.type === 'number'); if (!el) return null; const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(el, '500'); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); return el.value; });
console.log('deposit', dep);
await page.waitForTimeout(1500);
// default source is Wallet
const form = await page.evaluate(() => { const t = document.body.innerText; const n = (l, s = 30) => { const i = t.indexOf(l); return i < 0 ? null : t.slice(i, i + s).replace(/\n/g, ' '); }; const b = [...document.querySelectorAll('button')].find(x => /CREATE POSITION/.test(x.innerText)); return { notional: n('NOTIONAL', 24), source: n('DEPOSIT FROM', 40), btnDisabled: b ? b.disabled : 'no-btn' }; });
console.log('form', JSON.stringify(form));
await shot('run2d_01_form.png');
const nB = netLog.length;
await mouseClick(page.locator('button:has-text("CREATE POSITION")').first());
console.log('clicked CREATE POSITION');
await page.waitForTimeout(14000);
await shot('run2d_02_result.png');
console.log('toasts', JSON.stringify(await toasts()));
console.log('POST window', JSON.stringify(netLog.slice(nB).filter(l => !/clearinghouseState|candleSnapshot|Snapshot|info body/.test(l)).slice(0, 12)));
console.log('sign/tx', JSON.stringify(walletLog.filter(l => /send|sign/i.test(l)).slice(0, 6)));
fs.writeFileSync(`${OUT}/run2d_network.log`, netLog.join('\n'));
fs.appendFileSync(`${OUT}/run2_wallet.log`, `\n\n===== run2d (perp no-switch) =====\n` + walletLog.join('\n'));
await browser.close();
console.log('DONE sendTx', walletLog.filter(l => /sendTransaction/i.test(l)).length);
