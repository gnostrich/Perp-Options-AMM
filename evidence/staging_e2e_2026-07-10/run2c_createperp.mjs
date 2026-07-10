// run2c_createperp.mjs — focused CREATE PERP submit, full same-origin POST tap.
// EARN succeeded via a backend POST to app-staging/. Check whether CREATE PERP does the
// same once the button is enabled (deposit populated). Switch to Arbitrum One first.
import fs from 'node:fs';
import { chromium } from 'playwright';
import { loadWallet, installProvider, instrument, chromiumLaunchOpts } from './lib_wallet_provider.mjs';

const OUT = '/home/user/Perp-Options-AMM/evidence/staging_e2e_2026-07-10';
const APP = 'https://app-staging.temporal.exchange/';
const sink = [], walletLog = [], netLog = [];
const { wallet, provider } = loadWallet();
const browser = await chromium.launch(chromiumLaunchOpts());
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' });
const page = await ctx.newPage();
instrument(page, sink);
page.on('dialog', async (d) => { walletLog.push(`[dialog] ${d.type()}: ${d.message().slice(0, 200)}`); await d.accept().catch(() => {}); });
const isStatic = (u) => /\.(png|jpg|svg|woff2?|css|ico|webp)(\?|$)|_next\/static|googletag|google-analytics|tradingview|datafeed/i.test(u);
page.on('request', (r) => { const u = r.url(); if (isStatic(u)) return; if (r.method() === 'POST') netLog.push(`REQ POST ${u.slice(0, 150)} body=${(r.postData() || '').slice(0, 700)}`); });
page.on('response', async (r) => { const u = r.url(); if (isStatic(u) || r.request().method() !== 'POST') return; if (/rpc/.test(u)) return; let b = ''; try { b = (await r.text()).slice(0, 500); } catch (_) {} netLog.push(`RESP ${r.status()} ${u.slice(0, 150)} body=${b}`); });

const addr = await installProvider(page, wallet, provider, (m) => walletLog.push(m));
await page.exposeFunction('__tw_rpclog', (l) => walletLog.push(l));
await page.addInitScript(() => {
  const iv = setInterval(() => { const eth = window.ethereum; if (!eth || eth.__w) return; eth.__w = true;
    const oR = eth.request, oOn = eth.on, reg = {}; let cid = eth.chainId;
    eth.on = (e, f) => { (reg[e] = reg[e] || []).push(f); return oOn(e, f); };
    eth.request = async (a) => { const m = a && a.method, p = (a && a.params) || [];
      try { window.__tw_rpclog(`[page-rpc] ${m} ${JSON.stringify(p).slice(0, 400)}`); } catch (_) {}
      if (m === 'eth_chainId') return cid;
      if (m === 'net_version') return String(parseInt(cid, 16));
      if (m === 'wallet_switchEthereumChain') { cid = (p[0].chainId || cid).toLowerCase(); eth.chainId = cid; setTimeout(() => (reg.chainChanged || []).forEach(f => { try { f(cid); } catch (_) {} }), 0); return null; }
      if (m === 'wallet_addEthereumChain') return null;
      try { const r = await oR(a); if (/send|sign/i.test(m)) window.__tw_rpclog(`[page-rpc] ${m} OK ${JSON.stringify(r).slice(0, 200)}`); return r; }
      catch (e) { window.__tw_rpclog(`[page-rpc] ${m} ERR ${String((e && e.message) || e).slice(0, 200)}`); throw e; } };
    clearInterval(iv); }, 5);
});
const shot = (f) => page.screenshot({ path: `${OUT}/${f}` }).catch(() => {});
const mouseClick = async (loc) => { const b = await loc.boundingBox(); if (!b) return false; await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); return true; };
const toasts = () => page.evaluate(() => { const o = []; ['[role="alert"]', '[role="status"]', '[data-sonner-toast]', '[class*="toast" i]'].forEach(s => document.querySelectorAll(s).forEach(e => { const t = e.innerText.trim(); if (t) o.push(t.replace(/\n/g, ' | ').slice(0, 250)); })); return [...new Set(o)]; });

await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(7000);
const ag = page.getByRole('button', { name: 'AGREE', exact: true }); if (await ag.count()) { await ag.first().click(); await page.waitForTimeout(2500); }
// switch to Arbitrum One
const cta = page.locator('button:has-text("Connect to Arbitrum")');
if (await cta.count()) { await mouseClick(cta.first()); await page.waitForTimeout(2000); const sw = page.locator('button:has-text("Switch Network")'); if (await sw.count()) await mouseClick(sw.first()); await page.waitForTimeout(4000); }
console.log('chainId', await page.evaluate(() => window.ethereum.chainId), 'cta', await cta.count());

// CREATE PERP tab
const cp = page.locator('[role="tab"]').filter({ hasText: 'CREATE PERP' }).first(); if (await cp.count()) { await mouseClick(cp); await page.waitForTimeout(2500); }
// fill DEPOSIT robustly via native setter
const dep = await page.evaluate(() => { const el = [...document.querySelectorAll('input')].find(i => /amount/i.test(i.placeholder || '') && i.type === 'number'); if (!el) return null; const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(el, '500'); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); return { ph: el.placeholder, now: el.value }; });
console.log('deposit', JSON.stringify(dep));
await page.waitForTimeout(1500);
// HL Balance source
await page.evaluate(() => { const r = document.querySelector('input[type=radio][value="hl-balance"]'); if (r) r.click(); });
await page.waitForTimeout(800);
const form = await page.evaluate(() => { const t = document.body.innerText; const n = (l, s = 40) => { const i = t.indexOf(l); return i < 0 ? null : t.slice(i, i + s).replace(/\n/g, ' '); }; const b = [...document.querySelectorAll('button')].find(x => /CREATE POSITION/.test(x.innerText)); return { notional: n('NOTIONAL', 26), entry: n('Entry Price', 32), btnDisabled: b ? b.disabled : 'no-btn' }; });
console.log('form', JSON.stringify(form));
await shot('run2c_01_perp_hlbal_form.png');
const nB = netLog.length, wB = walletLog.length;
const createBtn = page.locator('button:has-text("CREATE POSITION")');
await mouseClick(createBtn.first());
await page.waitForTimeout(14000);
await shot('run2c_02_perp_hlbal_result.png');
console.log('toasts', JSON.stringify(await toasts()));
console.log('net window', JSON.stringify(netLog.slice(nB).filter(l => !/clearinghouseState|candleSnapshot|blockNumber/.test(l)).slice(0, 10)));
console.log('wallet window', JSON.stringify(walletLog.slice(wB).filter(l => /send|sign/i.test(l)).slice(0, 10)));

// try Wallet source too
await page.evaluate(() => { const r = document.querySelector('input[type=radio][value="wallet"]'); if (r) r.click(); });
await page.waitForTimeout(1000);
const nB2 = netLog.length, wB2 = walletLog.length;
await mouseClick(createBtn.first());
await page.waitForTimeout(14000);
await shot('run2c_03_perp_wallet_result.png');
console.log('toasts2', JSON.stringify(await toasts()));
console.log('net window2', JSON.stringify(netLog.slice(nB2).filter(l => !/clearinghouseState|candleSnapshot|blockNumber/.test(l)).slice(0, 10)));
console.log('wallet window2', JSON.stringify(walletLog.slice(wB2).filter(l => /send|sign/i.test(l)).slice(0, 10)));

// portfolio recheck (earn position should now be there from run2b? no, fresh context) — check PERPS/EARN
const pf = page.locator('a:has-text("PORTFOLIO")').first(); if (await pf.count()) await pf.click().catch(() => {});
await page.waitForTimeout(5000);
const ag2 = page.getByRole('button', { name: 'AGREE', exact: true }); if (await ag2.count()) { await ag2.first().click(); await page.waitForTimeout(2000); }
for (const sub of ['PERPS', 'EARN']) { const el = page.locator('[role="tab"]').filter({ hasText: sub }).first(); if (await el.count()) { await mouseClick(el); await page.waitForTimeout(2500); } const rows = await page.evaluate(() => [...document.querySelectorAll('tbody tr')].map(r => r.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean)); console.log(`PF ${sub} rows`, JSON.stringify(rows.slice(0, 5))); await shot(`run2c_04_pf_${sub.toLowerCase()}.png`); }

fs.writeFileSync(`${OUT}/run2c_network.log`, netLog.join('\n'));
fs.appendFileSync(`${OUT}/run2_wallet.log`, `\n\n===== run2c (create-perp focus) =====\n` + walletLog.join('\n'));
fs.writeFileSync(`${OUT}/run2c_console.log`, sink.map(s => `${s.t} [${s.kind}] ${s.text}`).join('\n'));
console.log('sendTx', walletLog.filter(l => /sendTransaction/i.test(l)).length, 'signs', walletLog.filter(l => /personal_sign|signTypedData/i.test(l)).length);
await browser.close();
