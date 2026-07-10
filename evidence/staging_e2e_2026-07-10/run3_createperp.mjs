// run3_createperp.mjs — ROUND 3, the fix-and-reconcile round.
// FIX vs round-2: the deposit input's React onChange never fired under .fill()/native-setter,
// so NOTIONAL stayed blank + CREATE POSITION stayed disabled. Round-3 drives the deposit input
// with Playwright pressSequentially (real char-by-char keystrokes → React onChange fires).
// CTO video ground-truth: DEPOSIT>=12 USDC -> NOTIONAL computes -> CREATE POSITION enabled ->
// toast "BTC-PERP position saved / Recorded successfully" (backend record, no wallet signature).
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
const isStatic = (u) => /\.(png|jpg|svg|woff2?|css|ico|webp)(\?|$)|_next\/static|googletag|google-analytics|tradingview|datafeed/i.test(u);
page.on('request', (r) => { const u = r.url(); if (isStatic(u)) return; if (r.method() === 'POST') netLog.push(`REQ POST ${u.slice(0, 150)} body=${(r.postData() || '').slice(0, 900)}`); });
page.on('response', async (r) => { const u = r.url(); if (isStatic(u) || r.request().method() !== 'POST' || /rpc/.test(u)) return; let b = ''; try { b = (await r.text()).slice(0, 600); } catch (_) {} netLog.push(`RESP ${r.status()} ${u.slice(0, 150)} body=${b}`); });

const addr = await installProvider(page, wallet, provider, (m) => walletLog.push(m));
const shot = (f) => page.screenshot({ path: `${OUT}/${f}` }).catch(() => {});
const mouseClick = async (loc) => { const b = await loc.boundingBox(); if (!b) return false; await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); return true; };
const toasts = () => page.evaluate(() => { const o = []; ['[role="alert"]', '[role="status"]', '[data-sonner-toast]', '[class*="toast" i]', 'li[data-sonner-toast]'].forEach(s => document.querySelectorAll(s).forEach(e => { const t = e.innerText.trim(); if (t) o.push(t.replace(/\n/g, ' | ').slice(0, 250)); })); return [...new Set(o)]; });
const dumpInputs = () => page.evaluate(() => [...document.querySelectorAll('input')].map((el, i) => { const r = el.getBoundingClientRect(); return { i, type: el.type, ph: el.placeholder || '', val: el.value, aria: el.getAttribute('aria-label') || '', name: el.name || '', vis: r.width > 0 && r.height > 0, x: Math.round(r.x), y: Math.round(r.y) }; }));
const readForm = () => page.evaluate(() => { const t = document.body.innerText; const n = (l, s = 40) => { const i = t.indexOf(l); return i < 0 ? null : t.slice(i, i + s).replace(/\n/g, ' ').trim(); }; const b = [...document.querySelectorAll('button')].find(x => /CREATE POSITION/.test(x.innerText)); return { deposit: n('DEPOSIT', 30), notional: n('NOTIONAL', 30), entry: n('Entry Price', 34), liq: n('Liquidation Price', 40), fees: n('Hyperliquid Tx Fees', 44), btnDisabled: b ? b.disabled : 'no-btn', btnText: b ? b.innerText.replace(/\n/g, ' ') : null }; });

// Locate the DEPOSIT input: visible text/number input nearest-below the "DEPOSIT" label.
async function depositInput() {
  const idx = await page.evaluate(() => {
    const labels = [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /^DEPOSIT$/.test((e.textContent || '').trim()));
    const lab = labels[0]; if (!lab) return -1;
    const lr = lab.getBoundingClientRect();
    const cands = [...document.querySelectorAll('input')].map((el, i) => ({ el, i, r: el.getBoundingClientRect() }))
      .filter(o => !['range', 'radio', 'checkbox', 'hidden'].includes(o.el.type) && o.r.width > 0 && o.r.height > 0);
    // same row as DEPOSIT label (vertical overlap), else first visible text input
    let best = cands.find(o => Math.abs(o.r.y - lr.y) < 30) || cands[0];
    return best ? best.i : -1;
  });
  if (idx < 0) return null;
  return page.locator('input').nth(idx);
}

async function setDeposit(val) {
  const el = await depositInput();
  if (!el) { console.log('DEPOSIT input NOT FOUND'); return false; }
  await el.click();
  // clear then type char-by-char (real keystrokes -> React onChange)
  await el.press('Control+a').catch(() => {});
  await el.press('Delete').catch(() => {});
  await el.pressSequentially(String(val), { delay: 90 });
  await page.waitForTimeout(400);
  await el.press('Tab').catch(() => {});
  await page.waitForTimeout(1200);
  return true;
}

async function setLeverage10x() {
  const sl = page.locator('input[type="range"]').first();
  if (!await sl.count()) return;
  const info = await page.evaluate(() => { const s = document.querySelector('input[type="range"]'); return s ? { min: +s.min, max: +s.max, step: +s.step || 1, val: +s.value } : null; });
  if (!info) return;
  await sl.focus();
  // walk to min, then step up to 10
  for (let k = 0; k < 60 && +(await sl.inputValue()) > info.min; k++) await sl.press('ArrowLeft');
  let guard = 0;
  while (+(await sl.inputValue()) < 10 && guard++ < 60) await sl.press('ArrowRight');
  await page.waitForTimeout(600);
}

async function attemptCreate(label, dir, dep) {
  console.log(`\n===== ${label}: dir=${dir} deposit=${dep} =====`);
  // dir pill
  const pill = dir === 'short'
    ? page.locator('button:has-text("SHORT/SELL")').first()
    : page.locator('button:has-text("LONG/BUY")').first();
  if (await pill.count()) { await mouseClick(pill); await page.waitForTimeout(800); }
  await setDeposit(dep);
  await setLeverage10x();
  const form = await readForm();
  console.log('form', JSON.stringify(form));
  await shot(`run3_${label}_form.png`);
  const nB = netLog.length, wB = walletLog.length;
  const btn = page.locator('button:has-text("CREATE POSITION")').first();
  const enabled = form.btnDisabled === false;
  console.log('CREATE POSITION enabled?', enabled, '| notional=', form.notional);
  await mouseClick(btn);
  await page.waitForTimeout(12000);
  await shot(`run3_${label}_result.png`);
  const ts = await toasts();
  const postWin = netLog.slice(nB).filter(l => /temporal\.exchange\//.test(l) && !/clearinghouseState|candleSnapshot|Snapshot|blockNumber|_rsc/.test(l));
  const walletWin = walletLog.slice(wB).filter(l => /send|sign/i.test(l));
  console.log('toasts', JSON.stringify(ts));
  console.log('backend POST', JSON.stringify(postWin.slice(0, 8)));
  console.log('wallet RPC send/sign', JSON.stringify(walletWin.slice(0, 8)));
  return { label, dir, dep, enabled, notional: form.notional, entry: form.entry, btnDisabled: form.btnDisabled, toasts: ts, postWin, walletWin };
}

// ---- boot ----
await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(8000);
const ag = page.getByRole('button', { name: 'AGREE', exact: true }); if (await ag.count()) { await ag.first().click(); await page.waitForTimeout(2500); }
await shot('run3_00_landing.png');
// CREATE PERP tab
const cp = page.locator('[role="tab"]').filter({ hasText: 'CREATE PERP' }).first(); if (await cp.count()) { await mouseClick(cp); await page.waitForTimeout(2500); }
console.log('INPUTS on CREATE PERP form:', JSON.stringify(await dumpInputs()));
console.log('chainId', await page.evaluate(() => window.ethereum && window.ethereum.chainId));

const results = [];
results.push(await attemptCreate('L1_long12', 'long', 12));
results.push(await attemptCreate('L2_long500', 'long', 500));
results.push(await attemptCreate('S1_short500', 'short', 500));

// ---- Portfolio ----
console.log('\n===== PORTFOLIO =====');
const pf = page.locator('a:has-text("PORTFOLIO"), button:has-text("PORTFOLIO")').first(); if (await pf.count()) await mouseClick(pf).catch(() => {});
await page.waitForTimeout(5000);
const ag2 = page.getByRole('button', { name: 'AGREE', exact: true }); if (await ag2.count()) { await ag2.first().click(); await page.waitForTimeout(2000); }
await shot('run3_pf_overview.png');
const pfData = {};
for (const sub of ['PERPS', 'BANDS', 'EARN']) {
  const el = page.locator('[role="tab"]').filter({ hasText: sub }).first();
  if (await el.count()) { await mouseClick(el); await page.waitForTimeout(2500); }
  const d = await page.evaluate(() => {
    const heads = [...document.querySelectorAll('thead th')].map(h => h.innerText.replace(/\s+/g, ' ').trim());
    const rows = [...document.querySelectorAll('tbody tr')].map(r => r.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean);
    return { heads, rows: rows.slice(0, 8) };
  });
  pfData[sub] = d;
  console.log(`PF ${sub} heads`, JSON.stringify(d.heads));
  console.log(`PF ${sub} rows`, JSON.stringify(d.rows));
  await shot(`run3_pf_${sub.toLowerCase()}.png`);
}
// try CLOSE on first perp if present
let closeOut = null;
const closeBtn = page.locator('button:has-text("CLOSE")').first();
if (await closeBtn.count()) {
  const pePerp = page.locator('[role="tab"]').filter({ hasText: 'PERPS' }).first(); if (await pePerp.count()) { await mouseClick(pePerp); await page.waitForTimeout(1500); }
  const cb2 = page.locator('button:has-text("CLOSE")').first();
  if (await cb2.count()) {
    const nB = netLog.length;
    await mouseClick(cb2); await page.waitForTimeout(6000);
    // confirm dialog?
    const conf = page.locator('button:has-text("Confirm"), button:has-text("CLOSE POSITION")').first();
    if (await conf.count()) { await mouseClick(conf); await page.waitForTimeout(6000); }
    closeOut = { toasts: await toasts(), postWin: netLog.slice(nB).filter(l => /temporal\.exchange\//.test(l) && !/_rsc|Snapshot/.test(l)).slice(0, 6) };
    console.log('CLOSE toasts', JSON.stringify(closeOut.toasts));
    await shot('run3_pf_close.png');
  }
}

// ---- Data layer re-check (now that create works) ----
console.log('\n===== DATA LAYER RECHECK =====');
const transactNav = page.locator('a:has-text("TRANSACT"), button:has-text("TRANSACT")').first(); if (await transactNav.count()) await mouseClick(transactNav).catch(() => {});
await page.waitForTimeout(3000);
// TRADE BANDS tab
const tb = page.locator('[role="tab"]').filter({ hasText: 'TRADE BANDS' }).first(); if (await tb.count()) { await mouseClick(tb); await page.waitForTimeout(4000); }
await shot('run3_tradebands.png');
const bandData = await page.evaluate(() => { const t = document.body.innerText; const g = (l, s = 30) => { const i = t.indexOf(l); return i < 0 ? null : t.slice(i, i + s).replace(/\n/g, ' ').trim(); }; return { quantity: g('QUANTITY', 30), slippage: g('Slippage', 30), txfees: g('Tx Fees', 30) }; });
console.log('BANDS data', JSON.stringify(bandData));
// options pricing chart nonblank
const chartInfo = await page.evaluate(() => { const cs = [...document.querySelectorAll('canvas')].map(c => { try { const ctx = c.getContext('2d'); const d = ctx.getImageData(0, 0, c.width, c.height).data; let nz = 0; for (let i = 3; i < d.length; i += 40) if (d[i] > 0) nz++; return { w: c.width, h: c.height, nz }; } catch (e) { return { w: c.width, h: c.height, err: String(e).slice(0, 40) }; } }); return cs; });
console.log('canvases', JSON.stringify(chartInfo));
await shot('run3_options_pricing.png');
// EARN APRs
const earn = page.locator('[role="tab"]').filter({ hasText: 'EARN' }).first(); if (await earn.count()) { await mouseClick(earn); await page.waitForTimeout(3000); }
const earnData = await page.evaluate(() => { const t = document.body.innerText; const m = t.match(/[\d.]+\s*%|--\s*%/g) || []; return m.slice(0, 12); });
console.log('EARN percentages', JSON.stringify(earnData));
await shot('run3_earn.png');

// ---- FLAG-1 / FLAG-2 status from console ----
const cspHits = sink.filter(s => /Content Security Policy|sepolia-rollup/.test(s.text)).length;
const ammTimeout = sink.filter(s => /AMM tree data|complete market_data/.test(s.text)).length;
const stagingBeWs = sink.filter(s => s.kind === 'ws.open' && /staging-be\.temporal/.test(s.text)).length;
const hlWs = sink.filter(s => s.kind === 'ws.open' && /hyperliquid/.test(s.text)).length;
console.log('\n===== FLAG STATUS =====');
console.log('FLAG-1 CSP sepolia-rollup refusals:', cspHits);
console.log('FLAG-2 AMM-tree timeout count:', ammTimeout, '| staging-be ws opens:', stagingBeWs, '| HL ws opens:', hlWs);

// ---- persist ----
fs.writeFileSync(`${OUT}/run3_network.log`, netLog.join('\n'));
fs.writeFileSync(`${OUT}/run3_console.log`, sink.map(s => `${s.t} [${s.kind}] ${s.text}`).join('\n'));
fs.appendFileSync(`${OUT}/run3_wallet.log`, `===== run3 (create-perp FIXED input) =====\n` + walletLog.join('\n'));
fs.writeFileSync(`${OUT}/run3_summary.json`, JSON.stringify({ addr, results, pfData, closeOut, bandData, chartInfo, earnData, flags: { cspHits, ammTimeout, stagingBeWs, hlWs }, sendTx: walletLog.filter(l => /sendTransaction/i.test(l)).length, signs: walletLog.filter(l => /personal_sign|signTypedData/i.test(l)).length }, null, 2));
console.log('\nDONE. sendTx=', walletLog.filter(l => /sendTransaction/i.test(l)).length, 'signs=', walletLog.filter(l => /personal_sign|signTypedData/i.test(l)).length);
await browser.close();
