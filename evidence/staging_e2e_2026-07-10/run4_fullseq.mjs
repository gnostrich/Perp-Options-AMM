// run4_fullseq.mjs — ROUND 4 full-sequence: create perp → read-back portfolio → trade bands
// (gated on the perp) → reference-number capture → FLAG-1/2 recheck → claim/close.
// Reuses the round-3 proven pieces verbatim: pressSequentially deposit input, chain-chameleon
// ACCEPT of wallet_switchEthereumChain, trusted mouse-click. Namespace run4_*.
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
page.on('request', (r) => { const u = r.url(); if (isStatic(u)) return; if (r.method() === 'POST') netLog.push(`REQ POST ${u.slice(0, 160)} body=${(r.postData() || '').slice(0, 1100)}`); });
page.on('response', async (r) => { const u = r.url(); if (isStatic(u)) return; const m = r.request().method(); if (m !== 'POST' && !/perp|quantit|band|portfolio|amm|market/i.test(u)) return; if (/rpc/.test(u) && m !== 'POST') return; let b = ''; try { b = (await r.text()).slice(0, 700); } catch (_) {} netLog.push(`RESP ${r.status()} ${m} ${u.slice(0, 160)} body=${b}`); });

const addr = await installProvider(page, wallet, provider, (m) => walletLog.push(m));
await page.exposeFunction('__tw_rpclog', (l) => walletLog.push(l));
// chain-chameleon: ACCEPT any wallet_switchEthereumChain (round-3 fix)
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
const toastsNow = () => page.evaluate(() => { const o = []; ['[role="alert"]', '[role="status"]', '[data-sonner-toast]', 'li[data-sonner-toast]', '[class*="toast" i]'].forEach(s => document.querySelectorAll(s).forEach(e => { const t = e.innerText.trim(); if (t) o.push(t.replace(/\n/g, ' | ').slice(0, 250)); })); return [...new Set(o)]; });
async function pollToasts(ms) { const seen = new Set(); const t0 = Date.now(); while (Date.now() - t0 < ms) { for (const t of await toastsNow()) seen.add(t); await page.waitForTimeout(700); } return [...seen]; }
const btnState = async (loc) => { if (!(await loc.count())) return 'ABSENT'; return loc.first().evaluate(el => `text="${el.innerText.trim()}" disabled=${el.disabled === true} ariaDis=${el.getAttribute('aria-disabled')}`); };

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
const readVals = () => page.evaluate(() => { const grabAfter = (lab) => { const t = document.body.innerText; const re = new RegExp(lab + '\\s*([\\d.,]+)'); const m = t.match(re); return m ? m[1] : null; }; const b = [...document.querySelectorAll('button')].find(x => /CREATE POSITION/.test(x.innerText)); return { notionalVal: grabAfter('NOTIONAL'), entry: grabAfter('Entry Price \\$'), chainId: window.ethereum && window.ethereum.chainId, btnDisabled: b ? b.disabled : 'no-btn', connectArb: !![...document.querySelectorAll('button')].find(x => /Connect to Arbitrum/i.test(x.innerText)) }; });

// ============ BOOT ============
console.log('addr', addr);
await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(8000);
const ag = page.getByRole('button', { name: 'AGREE', exact: true }); if (await ag.count()) { await ag.first().click(); await page.waitForTimeout(2500); }
const cta = page.locator('button:has-text("Connect to Arbitrum")');
if (await cta.count()) { await mouseClick(cta.first()); await page.waitForTimeout(2500); const sw = page.locator('button:has-text("Switch Network"), button:has-text("Switch to Arbitrum")'); if (await sw.count()) { await mouseClick(sw.first()); await page.waitForTimeout(3000); } }
console.log('after switch chainId=', await page.evaluate(() => window.ethereum && window.ethereum.chainId), 'connectArb still?', await cta.count());
await shot('run4_00_after_switch.png');

// ============ STEP 1: CREATE PERP LONG 500 @ 10x ============
console.log('\n===== STEP1 CREATE PERP LONG 500 @10x =====');
const cp = page.locator('[role="tab"]').filter({ hasText: 'CREATE PERP' }).first(); if (await cp.count()) { await mouseClick(cp); await page.waitForTimeout(2000); }
const longBtn = page.locator('button:has-text("LONG/BUY")').first(); if (await longBtn.count()) { await mouseClick(longBtn); await page.waitForTimeout(500); }
await setDeposit(500); await setLev10();
const v1 = await readVals(); console.log('form vals', JSON.stringify(v1));
await shot('run4_01_perp_form.png');
const nB = netLog.length;
const createBtn = page.locator('button:has-text("CREATE POSITION")').first();
console.log('CREATE POSITION', await btnState(createBtn));
await mouseClick(createBtn);
const ts1 = await pollToasts(14000);
await shot('run4_02_perp_result.png');
const post1 = netLog.slice(nB).filter(l => /temporal\.exchange\//.test(l) && !/candleSnapshot|Snapshot|_rsc|\.png|\.js/.test(l));
console.log('toasts', JSON.stringify(ts1));
console.log('backend POST/RESP', JSON.stringify(post1.slice(0, 8), null, 1));
// extract btcAmount from the POST body
let perpBtcQty = null;
for (const l of post1) { const m = l.match(/"btcAmount"\s*:\s*([\d.]+)/); if (m) perpBtcQty = parseFloat(m[1]); }
console.log('perp BTC qty available (from POST btcAmount) =', perpBtcQty);

// ============ STEP 2: PORTFOLIO → PERPS read-back (with reload + retries) ============
console.log('\n===== STEP2 PORTFOLIO PERPS READ-BACK =====');
const readPerps = () => page.evaluate(() => {
  const active = [...document.querySelectorAll('table')].filter(t => t.offsetParent !== null);
  const tables = active.map(t => { const heads = [...t.querySelectorAll('thead th')].map(h => h.innerText.replace(/\s+/g, ' ').trim()); const rows = [...t.querySelectorAll('tbody tr')].map(r => [...r.querySelectorAll('td')].map(c => c.innerText.replace(/\s+/g, ' ').trim())); return { heads, rows }; });
  const claim = [...document.querySelectorAll('button')].filter(b => /CLAIM/i.test(b.innerText)).map(b => b.innerText.trim());
  const availPanel = (() => { const t = document.body.innerText; const i = t.search(/PERPS AVAILABLE/i); return i < 0 ? null : t.slice(i, i + 260).replace(/\n+/g, ' | '); })();
  return { tables, claim, availPanel };
});
let perpsReadBack = false, perpRowData = null, fundingVal = null, claimShows = false;
for (let attempt = 0; attempt < 4 && !perpsReadBack; attempt++) {
  console.log(`-- portfolio attempt ${attempt} --`);
  await page.goto(APP + 'portfolio', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(7000);
  const ag2 = page.getByRole('button', { name: 'AGREE', exact: true }); if (await ag2.count()) { await ag2.first().click(); await page.waitForTimeout(2000); }
  const perpTab = page.locator('[role="tab"]').filter({ hasText: 'PERPS' }).first(); if (await perpTab.count()) { await mouseClick(perpTab); await page.waitForTimeout(4000); }
  const d = await readPerps();
  console.log('PERPS tables', JSON.stringify(d.tables));
  console.log('CLAIM buttons', JSON.stringify(d.claim), '| PERPS AVAILABLE', d.availPanel);
  const withRows = d.tables.find(t => t.rows.length > 0);
  if (withRows) { perpsReadBack = true; perpRowData = withRows; claimShows = d.claim.length > 0;
    const heads = withRows.heads, row0 = withRows.rows[0]; const fi = heads.findIndex(h => /FUNDING/i.test(h)); fundingVal = fi >= 0 ? row0[fi] : null;
    console.log('READ-BACK YES. heads', JSON.stringify(heads), 'row', JSON.stringify(row0), 'FUNDING=', fundingVal);
  }
  await shot(`run4_03_pf_perps_try${attempt}.png`);
  if (!perpsReadBack) await page.waitForTimeout(3000);
}
console.log('perpsReadBack=', perpsReadBack, 'fundingVal=', fundingVal, 'claimShows=', claimShows);

// ============ STEP 3: TRADE BANDS — sell qty < perp qty ============
console.log('\n===== STEP3 TRADE BANDS (sell < perp qty) =====');
await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(7000);
const ag3 = page.getByRole('button', { name: 'AGREE', exact: true }); if (await ag3.count()) { await ag3.first().click(); await page.waitForTimeout(2000); }
// re-take arbitrum if prompted
const cta3 = page.locator('button:has-text("Connect to Arbitrum")'); if (await cta3.count()) { await mouseClick(cta3.first()); await page.waitForTimeout(2500); }
const tbTab = page.locator('[role="tab"]').filter({ hasText: 'TRADE BANDS' }).first(); if (await tbTab.count()) { await mouseClick(tbTab); await page.waitForTimeout(3000); }
await page.waitForTimeout(9000); // AMM tree window
await shot('run4_04_bands_initial.png');

const bandsSnapshot = () => page.evaluate(() => {
  const t = document.body.innerText;
  const inputs = [...document.querySelectorAll('input')].map(i => ({ ph: i.placeholder, val: i.value, dis: i.disabled, type: i.type, ro: i.readOnly })).filter(i => i.type !== 'hidden');
  const grab = (lab, span = 40) => { const i = t.search(new RegExp(lab, 'i')); return i < 0 ? null : t.slice(i, i + span).replace(/\n/g, ' '); };
  const dollars = (t.match(/\$[\d,]+(\.\d+)?/g) || []).slice(0, 25);
  const pcts = (t.match(/[-\d.]+\s*%/g) || []).slice(0, 20);
  return { inputs, sell: grab('SELL PROFITS ON', 30), quantity: grab('QUANTITY', 30), slippage: grab('Slippage', 40), txfees: grab('Tx Fees', 40), notional: grab('BTC Notional', 40), deposit: grab('Deposit:', 45), dollars, pcts, ammTimeout: /did not receive|timeout/i.test(t) };
});
console.log('bands snapshot (pre-fill)', JSON.stringify(await bandsSnapshot(), null, 1));

// Try to set the SELL QUANTITY. Approach 1: type into the sell-panel quantity input.
// Approach 2: move the sell-panel range slider.
const SELL_QTY = 0.01;
const fillSellQty = await page.evaluate((qty) => {
  // locate the SELL PROFITS ON panel by header text, then find an editable input within/near it
  const hdr = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /SELL PROFITS ON/i.test((e.textContent || '').trim()));
  if (!hdr) return { ok: false, why: 'no SELL header' };
  let panel = hdr; for (let k = 0; k < 6 && panel; k++) { if (panel.querySelectorAll && panel.querySelectorAll('input').length) break; panel = panel.parentElement; }
  const ins = panel ? [...panel.querySelectorAll('input')] : [];
  const info = ins.map(i => ({ ph: i.placeholder, type: i.type, val: i.value, dis: i.disabled, ro: i.readOnly }));
  return { ok: true, panelInputs: info };
}, SELL_QTY);
console.log('sell panel inputs', JSON.stringify(fillSellQty));

// Prefer a text/number input in the sell panel that isn't the % price fields
async function typeSellQty(qty) {
  const handle = await page.evaluateHandle(() => {
    const hdr = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /SELL PROFITS ON/i.test((e.textContent || '').trim()));
    if (!hdr) return null;
    let panel = hdr; for (let k = 0; k < 6 && panel; k++) { if (panel.querySelectorAll && panel.querySelectorAll('input[type="text"],input[type="number"]').length) break; panel = panel.parentElement; }
    if (!panel) return null;
    const ins = [...panel.querySelectorAll('input')].filter(i => (i.type === 'text' || i.type === 'number') && !/%|from|to/i.test((i.placeholder || '') + ' ' + (i.getAttribute('aria-label') || '')));
    // the quantity input is the topmost text input in the panel
    ins.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    return ins[0] || null;
  });
  const el = handle.asElement();
  if (!el) return { ok: false, why: 'no qty input in sell panel' };
  await el.click().catch(() => {});
  await el.press('Control+a').catch(() => {});
  await el.press('Delete').catch(() => {});
  await el.pressSequentially(String(qty), { delay: 90 }).catch(() => {});
  await page.waitForTimeout(500);
  await el.press('Tab').catch(() => {});
  await page.waitForTimeout(1500);
  return { ok: true };
}
const qtyRes = await typeSellQty(SELL_QTY);
console.log('typeSellQty', JSON.stringify(qtyRes));

// Also try moving the sell-panel slider to ~13% (0.01/0.0776) if the qty is still blank
const afterType = await bandsSnapshot();
if (!afterType.quantity || /---/.test(afterType.quantity || '') || (afterType.inputs.find(i => i.type === 'range'))) {
  const slid = page.locator('input[type="range"]');
  const n = await slid.count();
  console.log('range sliders on bands page:', n);
  // the sell slider is the first range in the transact panel (left column)
  for (let i = 0; i < n; i++) {
    const box = await slid.nth(i).boundingBox().catch(() => null);
    if (box && box.x < 500 && box.y < 400) {
      await slid.nth(i).focus();
      for (let k = 0; k < 15; k++) { await slid.nth(i).press('ArrowRight'); await page.waitForTimeout(60); }
      console.log(`nudged sell slider #${i} right 15x`);
      await page.waitForTimeout(1200);
      break;
    }
  }
}
await page.waitForTimeout(1000);
// set PRICE From/To % (5% to 50%) via the two % inputs in the sell panel
const setPrice = await page.evaluate(() => {
  const hdr = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /SELL PROFITS ON/i.test((e.textContent || '').trim()));
  let panel = hdr; for (let k = 0; k < 6 && panel; k++) { if (panel.querySelectorAll && panel.querySelectorAll('input').length >= 2) break; panel = panel.parentElement; }
  if (!panel) return null;
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  const pcts = [...panel.querySelectorAll('input')].filter(i => /from|to|%/i.test((i.placeholder || '')));
  const out = [];
  if (pcts[0]) { setter.call(pcts[0], '5'); pcts[0].dispatchEvent(new Event('input', { bubbles: true })); pcts[0].dispatchEvent(new Event('change', { bubbles: true })); out.push('from=5'); }
  if (pcts[1]) { setter.call(pcts[1], '50'); pcts[1].dispatchEvent(new Event('input', { bubbles: true })); pcts[1].dispatchEvent(new Event('change', { bubbles: true })); out.push('to=50'); }
  return out;
});
console.log('setPrice', JSON.stringify(setPrice));
await page.waitForTimeout(2000);
await shot('run4_05_bands_filled.png');
const bandsFilled = await bandsSnapshot();
console.log('bands snapshot (post-fill)', JSON.stringify(bandsFilled, null, 1));

// OPTIONS PRICING chart census
const opTab = page.locator('button:has-text("OPTIONS PRICING"), [role="tab"]:has-text("OPTIONS PRICING")').first();
if (await opTab.count()) { await mouseClick(opTab); await page.waitForTimeout(4000); await shot('run4_06_options_pricing.png'); }
const chartCensus = await page.evaluate(() => [...document.querySelectorAll('canvas')].map(c => { try { const ctx = c.getContext('2d'); if (!ctx) return { w: c.width, h: c.height, nb: 'na' }; const d = ctx.getImageData(0, 0, c.width, c.height).data; let nb = 0; for (let i = 3; i < d.length; i += 40) if (d[i] > 0) nb++; return { w: c.width, h: c.height, nb }; } catch (e) { return { err: String(e).slice(0, 50) }; } }));
console.log('OPTIONS PRICING canvas census', JSON.stringify(chartCensus));

// TRANSACT
const txBtn = page.locator('button:has-text("TRANSACT")').last();
console.log('TRANSACT', await btnState(txBtn));
const nB2 = netLog.length;
if (await txBtn.count()) { await mouseClick(txBtn); }
const ts3 = await pollToasts(12000);
await shot('run4_07_bands_transact_result.png');
const post3 = netLog.slice(nB2).filter(l => /temporal\.exchange\//.test(l) && !/candleSnapshot|Snapshot|_rsc|\.png|\.js/.test(l));
console.log('bands toasts', JSON.stringify(ts3));
console.log('bands backend POST/RESP', JSON.stringify(post3.slice(0, 8), null, 1));

// ============ STEP 6: CLAIM/CLOSE the perp ============
console.log('\n===== STEP6 CLAIM/CLOSE =====');
await page.goto(APP + 'portfolio', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(7000);
const ag4 = page.getByRole('button', { name: 'AGREE', exact: true }); if (await ag4.count()) { await ag4.first().click(); await page.waitForTimeout(1500); }
const perpTab2 = page.locator('[role="tab"]').filter({ hasText: 'PERPS' }).first(); if (await perpTab2.count()) { await mouseClick(perpTab2); await page.waitForTimeout(4000); }
const claimBtn = page.locator('button:has-text("CLAIM"), button:has-text("CLOSE")').first();
console.log('CLAIM/CLOSE', await btnState(claimBtn));
let claimResult = null;
if (await claimBtn.count()) {
  const nB3 = netLog.length;
  await mouseClick(claimBtn);
  const tsC = await pollToasts(12000);
  await shot('run4_08_claim_result.png');
  const postC = netLog.slice(nB3).filter(l => /temporal\.exchange\//.test(l) && !/candleSnapshot|_rsc|\.png|\.js/.test(l));
  claimResult = { toasts: tsC, post: postC.slice(0, 6) };
  console.log('claim toasts', JSON.stringify(tsC));
  console.log('claim POST/RESP', JSON.stringify(postC.slice(0, 6), null, 1));
}

// ============ STEP 5: FLAG recheck ============
const cspHits = sink.filter(s => /Content Security Policy|sepolia-rollup|Refused to connect/i.test(s.text)).length;
const cspEndpoints = [...new Set(sink.filter(s => /Refused to connect|Content Security Policy/i.test(s.text)).map(s => (s.text.match(/https?:\/\/[^\s'"]+/) || ['?'])[0]))];
const ammTimeout = sink.filter(s => /AMM tree data|complete market_data|did not receive/i.test(s.text)).length;
const wsOpens = [...new Set(sink.filter(s => s.kind === 'ws.open').map(s => s.text))];
const stagingBeWs = wsOpens.some(u => /staging-be\.temporal/.test(u));
const perpQtyFetchFail = sink.filter(s => /Failed to fetch perp quantit/i.test(s.text)).length;
console.log('\nFLAG-1 CSP hits:', cspHits, 'endpoints', JSON.stringify(cspEndpoints.slice(0, 6)));
console.log('FLAG-2 ammTimeout:', ammTimeout, 'staging-be ws opened:', stagingBeWs, 'wsOpens', JSON.stringify(wsOpens));
console.log('perp-quantities fetch failures:', perpQtyFetchFail);

// ============ WRAP ============
fs.writeFileSync(`${OUT}/run4_network.log`, netLog.join('\n'));
fs.writeFileSync(`${OUT}/run4_console.log`, sink.map(s => `${s.t} [${s.kind}] ${s.text}`).join('\n'));
fs.appendFileSync(`${OUT}/run3_wallet.log`, `\n\n===== run4 (full sequence) =====\n` + walletLog.join('\n'));
const summary = { addr, step1: { form: v1, toasts: ts1, post: post1, perpBtcQty }, step2: { perpsReadBack, perpRowData, fundingVal, claimShows }, step3_bands: { preFill: null, filled: bandsFilled, chartCensus, toasts: ts3, post: post3 }, step6_claim: claimResult, flags: { cspHits, cspEndpoints, ammTimeout, stagingBeWs, wsOpens, perpQtyFetchFail }, sendTx: walletLog.filter(l => /sendTransaction/i.test(l) && !/page-rpc/.test(l)).length, signs: walletLog.filter(l => /personal_sign|signTypedData/i.test(l) && !/page-rpc/.test(l)).length };
fs.writeFileSync(`${OUT}/run4_summary.json`, JSON.stringify(summary, null, 2));
console.log('\n===== RUN4 DONE ===== sendTx=', summary.sendTx, 'signs=', summary.signs);
await browser.close();
