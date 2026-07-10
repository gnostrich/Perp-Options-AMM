// run2e — get CREATE POSITION enabled (deposit + leverage → notional) on 0x66eee, then click
// with full same-origin POST tap. Settles step-1: does an enabled perp-create click submit?
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
await page.waitForTimeout(8000);
const ag = page.getByRole('button', { name: 'AGREE', exact: true }); if (await ag.count()) { await ag.first().click(); await page.waitForTimeout(2500); }
const cp = page.locator('[role="tab"]').filter({ hasText: 'CREATE PERP' }).first(); if (await cp.count()) { await mouseClick(cp); await page.waitForTimeout(2000); }
const amt = page.locator('input[placeholder*="amount" i]').first();
if (await amt.count()) { await amt.click(); await amt.fill('500'); }
await page.waitForTimeout(1000);
const sl = page.locator('input[type="range"]').first();
if (await sl.count()) { await sl.focus(); for (let k = 0; k < 15; k++) { await sl.press('ArrowRight'); await page.waitForTimeout(70); } }
await page.waitForTimeout(2500);
const form = await page.evaluate(() => { const t = document.body.innerText; const n = (l, s = 26) => { const i = t.indexOf(l); return i < 0 ? null : t.slice(i, i + s).replace(/\n/g, ' '); }; const b = [...document.querySelectorAll('button')].find(x => /CREATE POSITION/.test(x.innerText)); return { lev: (t.match(/\b\d+x\b/) || [])[0], notional: n('NOTIONAL', 24), entry: n('Entry Price', 30), btnDisabled: b ? b.disabled : 'no-btn' }; });
console.log('form', JSON.stringify(form));
await shot('run2e_01_form_enabled.png');
const nB = netLog.length;
const btn = page.locator('button:has-text("CREATE POSITION")').first();
await mouseClick(btn);
console.log('clicked; btnDisabled was', form.btnDisabled);
await page.waitForTimeout(15000);
await shot('run2e_02_result.png');
console.log('toasts', JSON.stringify(await toasts()));
console.log('POST window', JSON.stringify(netLog.slice(nB).filter(l => !/clearinghouseState|candleSnapshot|Snapshot|info body/.test(l)).slice(0, 12)));
console.log('any temporal.exchange POST', JSON.stringify(netLog.slice(nB).filter(l => /temporal\.exchange\/ /.test(l) || /is_transcat|user_wallet|initial_deposit/.test(l)).slice(0, 6)));
console.log('sign/tx', JSON.stringify(walletLog.filter(l => /send|sign/i.test(l)).slice(0, 6)));
// portfolio perps check
const pf = page.locator('a:has-text("PORTFOLIO")').first(); if (await pf.count()) await pf.click().catch(() => {});
await page.waitForTimeout(5000);
const ag2 = page.getByRole('button', { name: 'AGREE', exact: true }); if (await ag2.count()) { await ag2.first().click(); await page.waitForTimeout(2000); }
const pe = page.locator('[role="tab"]').filter({ hasText: 'PERPS' }).first(); if (await pe.count()) { await mouseClick(pe); await page.waitForTimeout(2500); }
const rows = await page.evaluate(() => [...document.querySelectorAll('tbody tr')].map(r => r.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean));
console.log('PF PERPS rows', JSON.stringify(rows.slice(0, 5)));
await shot('run2e_03_pf_perps.png');
fs.writeFileSync(`${OUT}/run2e_network.log`, netLog.join('\n'));
fs.appendFileSync(`${OUT}/run2_wallet.log`, `\n\n===== run2e (perp enabled click) =====\n` + walletLog.join('\n'));
await browser.close();
console.log('DONE sendTx', walletLog.filter(l => /sendTransaction/i.test(l)).length);
