// run4b_bands.mjs — ROUND 4 focused: (1) create perp with leverage REGISTERED (via +/- buttons),
// (2) fill SELL band QUANTITY properly (placeholder "------" input / slider) < perp qty, capture the
// REAL band-pricing backend response + slippage/fee, (3) portfolio read-back one long attempt for
// skeleton-vs-data proof. run4 proved the bands server-action returns numbers; this run drives it.
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
page.on('request', (r) => { const u = r.url(); if (isStatic(u)) return; if (r.method() === 'POST') netLog.push(`REQ POST ${u.slice(0, 160)} body=${(r.postData() || '').slice(0, 1200)}`); });
page.on('response', async (r) => { const u = r.url(); if (isStatic(u)) return; const m = r.request().method(); if (m !== 'POST') return; let b = ''; try { b = (await r.text()).slice(0, 1000); } catch (_) {} netLog.push(`RESP ${r.status()} ${m} ${u.slice(0, 120)} body=${b}`); });

const addr = await installProvider(page, wallet, provider, (m) => walletLog.push(m));
await page.exposeFunction('__tw_rpclog', (l) => walletLog.push(l));
await page.addInitScript(() => {
  const iv = setInterval(() => { const eth = window.ethereum; if (!eth || eth.__cc) return; eth.__cc = true;
    const oR = eth.request.bind(eth), oOn = eth.on.bind(eth), reg = {}; let cid = eth.chainId;
    eth.on = (e, f) => { (reg[e] = reg[e] || []).push(f); return oOn(e, f); };
    eth.request = async (a) => { const m = a && a.method, p = (a && a.params) || [];
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
const toastsNow = () => page.evaluate(() => { const o = []; ['[role="alert"]', '[role="status"]', '[data-sonner-toast]', '[class*="toast" i]'].forEach(s => document.querySelectorAll(s).forEach(e => { const t = e.innerText.trim(); if (t) o.push(t.replace(/\n/g, ' | ').slice(0, 250)); })); return [...new Set(o)]; });
async function pollToasts(ms) { const seen = new Set(); const t0 = Date.now(); while (Date.now() - t0 < ms) { for (const t of await toastsNow()) seen.add(t); await page.waitForTimeout(700); } return [...seen]; }
const btnState = async (loc) => { if (!(await loc.count())) return 'ABSENT'; return loc.first().evaluate(el => `text="${el.innerText.trim()}" disabled=${el.disabled === true}`); };

// ---- BOOT ----
console.log('addr', addr);
await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(8000);
const ag = page.getByRole('button', { name: 'AGREE', exact: true }); if (await ag.count()) { await ag.first().click(); await page.waitForTimeout(2500); }
const cta = page.locator('button:has-text("Connect to Arbitrum")');
if (await cta.count()) { await mouseClick(cta.first()); await page.waitForTimeout(2500); const sw = page.locator('button:has-text("Switch Network"), button:has-text("Switch to Arbitrum")'); if (await sw.count()) { await mouseClick(sw.first()); await page.waitForTimeout(3000); } }
console.log('chainId=', await page.evaluate(() => window.ethereum && window.ethereum.chainId));

// ---- STEP1: CREATE PERP with leverage REGISTERED ----
console.log('\n===== STEP1 CREATE PERP LONG 500, leverage via +button =====');
const cp = page.locator('[role="tab"]').filter({ hasText: 'CREATE PERP' }).first(); if (await cp.count()) { await mouseClick(cp); await page.waitForTimeout(2000); }
const longBtn = page.locator('button:has-text("LONG/BUY")').first(); if (await longBtn.count()) { await mouseClick(longBtn); await page.waitForTimeout(500); }
// deposit via keystrokes
const depIdx = await page.evaluate(() => { const labs = [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /^DEPOSIT$/.test((e.textContent || '').trim())); const lr = labs[0] && labs[0].getBoundingClientRect(); if (!lr) return -1; const cs = [...document.querySelectorAll('input')].map((el, i) => ({ el, i, r: el.getBoundingClientRect() })).filter(o => !['range', 'radio', 'checkbox', 'hidden'].includes(o.el.type) && o.r.width > 0); const b = cs.find(o => Math.abs(o.r.y - lr.y) < 30) || cs[0]; return b ? b.i : -1; });
if (depIdx >= 0) { const el = page.locator('input').nth(depIdx); await el.click(); await el.press('Control+a').catch(() => {}); await el.press('Delete').catch(() => {}); await el.pressSequentially('500', { delay: 90 }); await el.press('Tab').catch(() => {}); await page.waitForTimeout(1200); }
// leverage: click the "+" increment button (fires React handler) until NOTIONAL reflects 10x
const notionalNow = () => page.evaluate(() => { const m = document.body.innerText.match(/NOTIONAL\s*([\d.]+)/); return m ? parseFloat(m[1]) : null; });
// find +/- buttons near the LEVERAGE slider
const plusMinus = await page.evaluate(() => {
  const lab = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /^LEVERAGE$/.test((e.textContent || '').trim()));
  if (!lab) return null; const lr = lab.getBoundingClientRect();
  const btns = [...document.querySelectorAll('button')].map(b => ({ b, r: b.getBoundingClientRect() })).filter(o => Math.abs(o.r.y - lr.y) < 40 && o.r.width < 60 && o.r.width > 8);
  btns.sort((a, c) => a.r.x - c.r.x);
  return { minus: btns[0] ? { x: btns[0].r.x + btns[0].r.width / 2, y: btns[0].r.y + btns[0].r.height / 2 } : null, plus: btns[btns.length - 1] ? { x: btns[btns.length - 1].r.x + btns[btns.length - 1].r.width / 2, y: btns[btns.length - 1].r.y + btns[btns.length - 1].r.height / 2 } : null, n: btns.length };
});
console.log('plusMinus', JSON.stringify(plusMinus));
if (plusMinus && plusMinus.minus && plusMinus.plus) {
  // drive down to 1x then up to 10x via real clicks
  for (let k = 0; k < 45; k++) { await page.mouse.click(plusMinus.minus.x, plusMinus.minus.y); await page.waitForTimeout(35); }
  let nn = await notionalNow(); const dep = 500;
  for (let k = 0; k < 45; k++) { const lev = nn ? (nn * 64300 / dep) : 0; if (lev >= 9.5) break; await page.mouse.click(plusMinus.plus.x, plusMinus.plus.y); await page.waitForTimeout(120); nn = await notionalNow(); }
  console.log('after +clicks NOTIONAL=', nn, '≈lev', nn ? (nn * 64300 / 500).toFixed(2) : '?');
}
await page.waitForTimeout(800);
const form1 = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /CREATE POSITION/.test(x.innerText)); const g = (l) => { const m = document.body.innerText.match(new RegExp(l + '\\s*([\\d.,$]+)')); return m ? m[1] : null; }; return { notional: g('NOTIONAL'), entry: g('Entry Price \\$'), liq: /Set Leverage For Liquidation/i.test(document.body.innerText), btnDis: b ? b.disabled : 'no-btn' }; });
console.log('form1', JSON.stringify(form1));
await shot('run4b_01_perp_form.png');
const nB = netLog.length;
const createBtn = page.locator('button:has-text("CREATE POSITION")').first();
console.log('CREATE POSITION', await btnState(createBtn));
await mouseClick(createBtn);
const ts1 = await pollToasts(14000);
await shot('run4b_02_perp_result.png');
const post1 = netLog.slice(nB).filter(l => /temporal\.exchange\//.test(l) && !/candleSnapshot|Snapshot|\.png|\.js/.test(l));
console.log('perp toasts', JSON.stringify(ts1));
console.log('perp POST/RESP', JSON.stringify(post1.slice(0, 6), null, 1));

// ---- STEP3: TRADE BANDS — fill SELL qty properly ----
console.log('\n===== STEP3 TRADE BANDS fill SELL qty 0.01 =====');
const tbTab = page.locator('[role="tab"]').filter({ hasText: 'TRADE BANDS' }).first(); if (await tbTab.count()) { await mouseClick(tbTab); await page.waitForTimeout(3000); }
await page.waitForTimeout(9000);
await shot('run4b_03_bands_initial.png');

// perp qty available fetch (server action returns {long,short})
const qtyPost = netLog.filter(l => /"long":[\d.]/.test(l));
console.log('perp-qty-available POST(s)', JSON.stringify(qtyPost.slice(-2)));

// SELL quantity: the placeholder "------" text input. Type 0.01 via keystrokes.
const nB2 = netLog.length;
const sellQtyEl = page.locator('input[placeholder="------"]').first();
let qtyTyped = false;
if (await sellQtyEl.count()) {
  await sellQtyEl.click().catch(() => {});
  await sellQtyEl.press('Control+a').catch(() => {});
  await sellQtyEl.press('Delete').catch(() => {});
  await sellQtyEl.pressSequentially('0.01', { delay: 100 });
  await page.waitForTimeout(400);
  await sellQtyEl.press('Tab').catch(() => {});
  await page.waitForTimeout(2000);
  qtyTyped = true;
  console.log('sell qty typed. value now=', await sellQtyEl.inputValue().catch(() => '?'));
} else console.log('placeholder "------" input NOT FOUND');
// if still blank, move the sell slider (first range in the left transact column)
const sellVal = await sellQtyEl.inputValue().catch(() => '');
if (!sellVal) {
  const sl = page.locator('input[type="range"]');
  const n = await sl.count();
  for (let i = 0; i < n; i++) { const bx = await sl.nth(i).boundingBox().catch(() => null); if (bx && bx.x < 500 && bx.y < 350) { await sl.nth(i).focus(); for (let k = 0; k < 12; k++) { await sl.nth(i).press('ArrowRight'); await page.waitForTimeout(80); } console.log(`nudged sell slider #${i}`); break; } }
  await page.waitForTimeout(1500);
}
// set the SELL panel PRICE From=5 To=50 (the FIRST From/To pair)
const priceSet = await page.evaluate(() => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  const froms = [...document.querySelectorAll('input')].filter(i => /From - %/i.test(i.placeholder || ''));
  const tos = [...document.querySelectorAll('input')].filter(i => /To - %/i.test(i.placeholder || ''));
  const out = [];
  if (froms[0]) { setter.call(froms[0], '5'); froms[0].dispatchEvent(new Event('input', { bubbles: true })); froms[0].dispatchEvent(new Event('change', { bubbles: true })); out.push('from=5'); }
  if (tos[0]) { setter.call(tos[0], '50'); tos[0].dispatchEvent(new Event('input', { bubbles: true })); tos[0].dispatchEvent(new Event('change', { bubbles: true })); out.push('to=50'); }
  return out;
});
console.log('priceSet', JSON.stringify(priceSet));
await page.waitForTimeout(3000);
await shot('run4b_04_bands_filled.png');

const bandsState = await page.evaluate(() => {
  const t = document.body.innerText;
  const grab = (lab, span = 45) => { const i = t.search(new RegExp(lab, 'i')); return i < 0 ? null : t.slice(i, i + span).replace(/\n/g, ' '); };
  const inputs = [...document.querySelectorAll('input')].filter(i => i.type !== 'hidden').map(i => ({ ph: i.placeholder, val: i.value, type: i.type, dis: i.disabled }));
  return { inputs, deposit: grab('Deposit:', 50), notional: grab('BTC Notional', 30), slippage: grab('Slippage', 40), txfees: grab('Tx Fees', 45), dollars: (t.match(/\$[\d,]+(\.\d+)?/g) || []).slice(0, 20), pcts: (t.match(/[-\d.]+\s*%/g) || []).slice(0, 20) };
});
console.log('bandsState', JSON.stringify(bandsState, null, 1));
const bandPricePosts = netLog.slice(nB2).filter(l => /"success":true|"notional_deposit|"price_effect|"slippage|"fee_/.test(l));
console.log('band pricing POST/RESP after fill', JSON.stringify(bandPricePosts.slice(-4), null, 1));

// OPTIONS PRICING chart
const opTab = page.locator('button:has-text("OPTIONS PRICING")').first();
if (await opTab.count()) { await mouseClick(opTab); await page.waitForTimeout(4000); await shot('run4b_05_options_pricing.png'); }
const chartCensus = await page.evaluate(() => [...document.querySelectorAll('canvas')].map(c => { try { const g = c.getContext('2d'); const d = g.getImageData(0, 0, c.width, c.height).data; let nb = 0; for (let i = 3; i < d.length; i += 40) if (d[i] > 0) nb++; return { w: c.width, h: c.height, nb }; } catch (e) { return { err: 1 }; } }));
console.log('OPTIONS PRICING canvas', JSON.stringify(chartCensus));

// TRANSACT
const txBtn = page.locator('button:has-text("TRANSACT")').last();
console.log('TRANSACT', await btnState(txBtn));
const nB3 = netLog.length;
if (await txBtn.count()) await mouseClick(txBtn);
const ts3 = await pollToasts(12000);
await shot('run4b_06_bands_transact.png');
const post3 = netLog.slice(nB3).filter(l => /temporal\.exchange\//.test(l) && !/candleSnapshot|\.png|\.js/.test(l));
console.log('bands transact toasts', JSON.stringify(ts3));
console.log('bands transact POST/RESP', JSON.stringify(post3.slice(0, 6), null, 1));

// ---- STEP2: portfolio read-back long single attempt (skeleton vs data) ----
console.log('\n===== STEP2 PORTFOLIO read-back (skeleton vs data) =====');
await page.goto(APP + 'portfolio', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(15000);
const ag2 = page.getByRole('button', { name: 'AGREE', exact: true }); if (await ag2.count()) { await ag2.first().click(); await page.waitForTimeout(1500); }
const perpTab = page.locator('[role="tab"]').filter({ hasText: 'PERPS' }).first(); if (await perpTab.count()) { await mouseClick(perpTab); await page.waitForTimeout(6000); }
const pf = await page.evaluate(() => {
  const t = [...document.querySelectorAll('table')].find(x => x.offsetParent !== null);
  const heads = t ? [...t.querySelectorAll('thead th')].map(h => h.innerText.trim()) : [];
  const rows = t ? [...t.querySelectorAll('tbody tr')].map(r => [...r.querySelectorAll('td')].map(c => c.innerText.trim())) : [];
  const skeletonPulse = document.querySelectorAll('[class*="animate-pulse"],[class*="skeleton" i]').length;
  const pageLbl = (document.body.innerText.match(/Page \d+ of \d+/) || [null])[0];
  const claim = [...document.querySelectorAll('button')].filter(b => /CLAIM/i.test(b.innerText)).length;
  return { heads, rowsNonEmpty: rows.filter(r => r.some(c => c)).length, rowsTotal: rows.length, sampleRow: rows[0], skeletonPulse, pageLbl, claim };
});
console.log('PORTFOLIO perps', JSON.stringify(pf, null, 1));
await shot('run4b_07_pf_perps.png');

// ---- FLAG recheck ----
const cspHits = sink.filter(s => /Content Security Policy|sepolia-rollup|Refused to connect/i.test(s.text)).length;
const cspEndpoints = [...new Set(sink.filter(s => /Refused to connect|Content Security Policy/i.test(s.text)).map(s => (s.text.match(/https?:\/\/[^\s'"]+/) || ['?'])[0]))];
const ammTimeout = sink.filter(s => /AMM tree data|complete market_data|did not receive/i.test(s.text)).length;
const wsOpens = [...new Set(sink.filter(s => s.kind === 'ws.open').map(s => s.text))];
const perpQtyFail = sink.filter(s => /Failed to fetch perp quantit/i.test(s.text)).length;
console.log('\nFLAG-1 CSP:', cspHits, cspEndpoints.slice(0, 4), '| perp-qty-fetch-fail:', perpQtyFail);
console.log('FLAG-2 ammTimeout:', ammTimeout, 'staging-be ws:', wsOpens.some(u => /staging-be/.test(u)), wsOpens);

fs.writeFileSync(`${OUT}/run4b_network.log`, netLog.join('\n'));
fs.writeFileSync(`${OUT}/run4b_console.log`, sink.map(s => `${s.t} [${s.kind}] ${s.text}`).join('\n'));
fs.writeFileSync(`${OUT}/run4b_summary.json`, JSON.stringify({ addr, step1: { form1, toasts: ts1, post: post1 }, step3_bands: { qtyPost: qtyPost.slice(-2), bandsState, bandPricePosts: bandPricePosts.slice(-4), chartCensus, transactBtn: await btnState(txBtn), transactToasts: ts3, transactPost: post3 }, step2_readback: pf, flags: { cspHits, cspEndpoints, ammTimeout, wsOpens, perpQtyFail }, sendTx: walletLog.filter(l => /page-rpc.*sendTransaction|\[wallet\] eth_sendTransaction/.test(l)).length, signs: walletLog.filter(l => /personal_sign|signTypedData/.test(l)).length }, null, 2));
console.log('\n===== RUN4B DONE =====');
await browser.close();
