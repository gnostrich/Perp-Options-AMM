// run3b — chain-accepting provider. Round-3a proved: deposit input FIXED (pressSequentially),
// NOTIONAL computes (0.077644 BTC @ 500/10x), CREATE POSITION ENABLES — but the click no-ops
// (no toast/POST) while the header still shows "Connect to Arbitrum": my provider throws 4902 on
// the Arbitrum-One switch, so the app treats the wallet as wrong-network and the create handler
// bails silently. Fix: accept wallet_switchEthereumChain page-side (chain-chameleon), take the
// switch, THEN create. Node signer stays on Sepolia (0 funds everywhere; the create is a backend
// record, not a chain tx — matches CTO "no funds needed in staging").
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
page.on('dialog', async (d) => { walletLog.push(`[dialog] ${d.type()}: ${d.message().slice(0, 200)}`); await d.accept().catch(() => {}); });
const isStatic = (u) => /\.(png|jpg|svg|woff2?|css|ico|webp)(\?|$)|_next\/static|googletag|google-analytics|tradingview|datafeed|metamask-sdk/i.test(u);
page.on('request', (r) => { const u = r.url(); if (isStatic(u)) return; if (r.method() === 'POST') netLog.push(`REQ POST ${u.slice(0, 150)} body=${(r.postData() || '').slice(0, 900)}`); });
page.on('response', async (r) => { const u = r.url(); if (isStatic(u) || r.request().method() !== 'POST' || /rpc/.test(u)) return; let b = ''; try { b = (await r.text()).slice(0, 600); } catch (_) {} netLog.push(`RESP ${r.status()} ${u.slice(0, 150)} body=${b}`); });

const addr = await installProvider(page, wallet, provider, (m) => walletLog.push(m));
await page.exposeFunction('__tw_rpclog', (l) => walletLog.push(l));
// chain-chameleon: accept ANY wallet_switchEthereumChain, flip eth.chainId page-side, emit chainChanged
await page.addInitScript(() => {
  const iv = setInterval(() => { const eth = window.ethereum; if (!eth || eth.__cc) return; eth.__cc = true;
    const oR = eth.request.bind(eth), oOn = eth.on.bind(eth), reg = {}; let cid = eth.chainId;
    eth.on = (e, f) => { (reg[e] = reg[e] || []).push(f); return oOn(e, f); };
    eth.request = async (a) => { const m = a && a.method, p = (a && a.params) || [];
      try { window.__tw_rpclog(`[page-rpc] ${m} ${JSON.stringify(p).slice(0, 300)}`); } catch (_) {}
      if (m === 'eth_chainId') return cid;
      if (m === 'net_version') return String(parseInt(cid, 16));
      if (m === 'wallet_switchEthereumChain') { cid = (p[0].chainId || cid).toLowerCase(); try { Object.defineProperty(eth, 'chainId', { value: cid, configurable: true }); } catch (_) { eth.chainId = cid; } setTimeout(() => (reg.chainChanged || []).forEach(f => { try { f(cid); } catch (_) {} }), 0); return null; }
      if (m === 'wallet_addEthereumChain') return null;
      try { const r = await oR(a); if (/send|sign/i.test(m)) window.__tw_rpclog(`[page-rpc] ${m} OK ${JSON.stringify(r).slice(0, 200)}`); return r; }
      catch (e) { window.__tw_rpclog(`[page-rpc] ${m} ERR ${String((e && e.message) || e).slice(0, 200)}`); throw e; } };
    clearInterval(iv); }, 5);
});

const shot = (f) => page.screenshot({ path: `${OUT}/${f}` }).catch(() => {});
const mouseClick = async (loc) => { const b = await loc.boundingBox(); if (!b) return false; await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); return true; };
const toastsNow = () => page.evaluate(() => { const o = []; ['[role="alert"]', '[role="status"]', '[data-sonner-toast]', 'li[data-sonner-toast]', '[class*="toast" i]', '[class*="Toast" ]'].forEach(s => document.querySelectorAll(s).forEach(e => { const t = e.innerText.trim(); if (t) o.push(t.replace(/\n/g, ' | ').slice(0, 250)); })); return [...new Set(o)]; });
async function pollToasts(ms) { const seen = new Set(); const t0 = Date.now(); while (Date.now() - t0 < ms) { for (const t of await toastsNow()) seen.add(t); await page.waitForTimeout(700); } return [...seen]; }

async function depositInput() {
  const idx = await page.evaluate(() => {
    const labels = [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /^DEPOSIT$/.test((e.textContent || '').trim()));
    const lab = labels[0]; if (!lab) return -1; const lr = lab.getBoundingClientRect();
    const cands = [...document.querySelectorAll('input')].map((el, i) => ({ el, i, r: el.getBoundingClientRect() })).filter(o => !['range', 'radio', 'checkbox', 'hidden'].includes(o.el.type) && o.r.width > 0 && o.r.height > 0);
    const best = cands.find(o => Math.abs(o.r.y - lr.y) < 30) || cands[0]; return best ? best.i : -1;
  });
  return idx < 0 ? null : page.locator('input').nth(idx);
}
async function setDeposit(val) { const el = await depositInput(); if (!el) return false; await el.click(); await el.press('Control+a').catch(() => {}); await el.press('Delete').catch(() => {}); await el.pressSequentially(String(val), { delay: 90 }); await page.waitForTimeout(400); await el.press('Tab').catch(() => {}); await page.waitForTimeout(1200); return true; }
async function setLev10() { const sl = page.locator('input[type="range"]').first(); if (!await sl.count()) return; await sl.focus(); const mn = await page.evaluate(() => +document.querySelector('input[type="range"]').min); for (let k = 0; k < 60 && +(await sl.inputValue()) > mn; k++) await sl.press('ArrowLeft'); let g = 0; while (+(await sl.inputValue()) < 10 && g++ < 60) await sl.press('ArrowRight'); await page.waitForTimeout(500); }
const readVals = () => page.evaluate(() => { const q = (sel) => { const e = document.querySelector(sel); return e ? (e.value !== undefined ? e.value : e.innerText) : null; }; const findByLabel = (lab) => { const el = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && (e.textContent || '').trim() === lab); if (!el) return null; let row = el.closest('div'); for (let k = 0; k < 4 && row; k++) { const inp = row.querySelector('input'); if (inp) return inp.value; row = row.parentElement; } return null; }; const b = [...document.querySelectorAll('button')].find(x => /CREATE POSITION/.test(x.innerText)); const grabAfter = (lab) => { const t = document.body.innerText; const re = new RegExp(lab + '\\s*([\\d.,]+)'); const m = t.match(re); return m ? m[1] : null; }; return { depositVal: findByLabel('DEPOSIT') || grabAfter('DEPOSIT'), notionalVal: grabAfter('NOTIONAL'), entry: grabAfter('Entry Price \\$'), chainId: window.ethereum && window.ethereum.chainId, btnDisabled: b ? b.disabled : 'no-btn', connectArb: !![...document.querySelectorAll('button')].find(x => /Connect to Arbitrum/i.test(x.innerText)) }; });

async function attempt(label, dir, dep) {
  console.log(`\n===== ${label}: ${dir} deposit=${dep} =====`);
  const pill = dir === 'short' ? page.locator('button:has-text("SHORT/SELL")').first() : page.locator('button:has-text("LONG/BUY")').first();
  if (await pill.count()) { await mouseClick(pill); await page.waitForTimeout(700); }
  await setDeposit(dep); await setLev10();
  const v = await readVals();
  console.log('vals', JSON.stringify(v));
  await shot(`run3b_${label}_form.png`);
  const nB = netLog.length, wB = walletLog.length;
  const btn = page.locator('button:has-text("CREATE POSITION")').first();
  await mouseClick(btn);
  const ts = await pollToasts(13000);
  await shot(`run3b_${label}_result.png`);
  const postWin = netLog.slice(nB).filter(l => /temporal\.exchange\//.test(l) && !/candleSnapshot|Snapshot|_rsc/.test(l));
  const walletWin = walletLog.slice(wB).filter(l => /send|sign/i.test(l));
  console.log('toasts', JSON.stringify(ts));
  console.log('backend POST', JSON.stringify(postWin.slice(0, 6)));
  console.log('wallet send/sign', JSON.stringify(walletWin.slice(0, 6)));
  return { label, dir, dep, vals: v, toasts: ts, postWin, walletWin };
}

// ---- boot ----
await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(8000);
const ag = page.getByRole('button', { name: 'AGREE', exact: true }); if (await ag.count()) { await ag.first().click(); await page.waitForTimeout(2500); }
// take the Arbitrum switch
const cta = page.locator('button:has-text("Connect to Arbitrum")');
if (await cta.count()) { await mouseClick(cta.first()); await page.waitForTimeout(2500); const sw = page.locator('button:has-text("Switch Network"), button:has-text("Switch to Arbitrum")'); if (await sw.count()) { await mouseClick(sw.first()); await page.waitForTimeout(3000); } }
console.log('after switch chainId=', await page.evaluate(() => window.ethereum && window.ethereum.chainId), 'connectArb still?', await cta.count());
await shot('run3b_00_after_switch.png');

const cp = page.locator('[role="tab"]').filter({ hasText: 'CREATE PERP' }).first(); if (await cp.count()) { await mouseClick(cp); await page.waitForTimeout(2000); }

const results = [];
results.push(await attempt('L1_long12', 'long', 12));
results.push(await attempt('L2_long500', 'long', 500));
results.push(await attempt('S1_short500', 'short', 500));

// ---- Portfolio ----
console.log('\n===== PORTFOLIO =====');
const pf = page.locator('a:has-text("PORTFOLIO"), button:has-text("PORTFOLIO")').first(); if (await pf.count()) await mouseClick(pf).catch(() => {});
await page.waitForTimeout(6000);
const ag2 = page.getByRole('button', { name: 'AGREE', exact: true }); if (await ag2.count()) { await ag2.first().click(); await page.waitForTimeout(2000); }
await shot('run3b_pf_overview.png');
const pfData = {};
for (const sub of ['PERPS', 'BANDS', 'EARN']) {
  const el = page.locator('[role="tab"]').filter({ hasText: sub }).first(); if (await el.count()) { await mouseClick(el); await page.waitForTimeout(2500); }
  const d = await page.evaluate(() => { const active = [...document.querySelectorAll('table')].filter(t => t.offsetParent !== null); const rows = active.flatMap(t => [...t.querySelectorAll('tbody tr')]).map(r => r.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean); return { rows: rows.slice(0, 8) }; });
  pfData[sub] = d; console.log(`PF ${sub} rows`, JSON.stringify(d.rows)); await shot(`run3b_pf_${sub.toLowerCase()}.png`);
}

// ---- data layer recheck ----
const cspHits = sink.filter(s => /Content Security Policy|sepolia-rollup/.test(s.text)).length;
const ammTimeout = sink.filter(s => /AMM tree data|complete market_data/.test(s.text)).length;
const stagingBeWs = sink.filter(s => s.kind === 'ws.open' && /staging-be\.temporal/.test(s.text)).length;
const hlWs = sink.filter(s => s.kind === 'ws.open' && /hyperliquid/.test(s.text)).length;
console.log('\nFLAG-1 CSP:', cspHits, '| FLAG-2 ammTimeout:', ammTimeout, 'staging-be ws:', stagingBeWs, 'HL ws:', hlWs);

fs.writeFileSync(`${OUT}/run3b_network.log`, netLog.join('\n'));
fs.writeFileSync(`${OUT}/run3b_console.log`, sink.map(s => `${s.t} [${s.kind}] ${s.text}`).join('\n'));
fs.appendFileSync(`${OUT}/run3_wallet.log`, `\n\n===== run3b (chain-accept + create) =====\n` + walletLog.join('\n'));
fs.writeFileSync(`${OUT}/run3b_summary.json`, JSON.stringify({ addr, results, pfData, flags: { cspHits, ammTimeout, stagingBeWs, hlWs }, sendTx: walletLog.filter(l => /sendTransaction/i.test(l)).length, signs: walletLog.filter(l => /personal_sign|signTypedData/i.test(l)).length }, null, 2));
console.log('\nDONE sendTx=', walletLog.filter(l => /sendTransaction/i.test(l)).length, 'signs=', walletLog.filter(l => /personal_sign|signTypedData/i.test(l)).length);
await browser.close();
