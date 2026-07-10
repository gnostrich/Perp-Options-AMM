// run2_txflows.mjs — ROUND 2: attempt ACTUAL TRANSACTIONS with the unfunded wallet
// (operator entry 6: CTO says "you don't need funds to do a tx. In staging").
// Reuses round-1 lib_wallet_provider.mjs untouched; adds a page-side wrap of
// ethereum.request so EVERY wallet RPC (method+params) lands in run2_wallet.log.
import fs from 'node:fs';
import { chromium } from 'playwright';
import { loadWallet, installProvider, instrument, chromiumLaunchOpts } from './lib_wallet_provider.mjs';

const OUT = '/home/user/Perp-Options-AMM/evidence/staging_e2e_2026-07-10';
const APP = 'https://app-staging.temporal.exchange/';
const sink = [];          // console/pageerror/net instrumentation
const walletLog = [];     // ALL wallet rpc traffic
const netLog = [];        // POSTs + responses to HL / staging-be / RPC endpoints
const phases = {};
let cur = null;
const phase = (n) => { cur = n; phases[n] = { start: sink.length, wStart: walletLog.length, nStart: netLog.length, notes: [] }; console.log(`\n===== PHASE ${n} =====`); };
const note = (m) => { phases[cur].notes.push(m); console.log(`[${cur}] ${m}`); };
const endPhase = () => { const p = phases[cur]; p.errors = [...new Set(sink.slice(p.start).filter(s => ['pageerror', 'console.error'].includes(s.kind)).map(s => s.text.slice(0, 160)))]; p.wallet = walletLog.slice(p.wStart); p.net = netLog.slice(p.nStart); };

const { wallet, provider } = loadWallet();
const browser = await chromium.launch(chromiumLaunchOpts());
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' });
const page = await ctx.newPage();
instrument(page, sink);
page.on('dialog', async (d) => { walletLog.push(`[dialog] ${d.type()}: ${d.message().slice(0, 300)}`); await d.accept().catch(() => {}); });

// Backend traffic tap: HL exchange/info + staging-be + any RPC POST bodies/responses
page.on('request', (r) => {
  const u = r.url();
  if (/hyperliquid|staging-be|arbitrum|sepolia|rpc/i.test(u) && r.method() === 'POST') {
    netLog.push(`REQ  POST ${u.slice(0, 160)} body=${(r.postData() || '').slice(0, 900)}`);
  }
});
page.on('response', async (r) => {
  const u = r.url();
  if (/hyperliquid.*\/exchange|staging-be/i.test(u)) {
    let body = ''; try { body = (await r.text()).slice(0, 900); } catch (_) {}
    netLog.push(`RESP ${r.status()} ${u.slice(0, 160)} body=${body}`);
  }
});

const addr = await installProvider(page, wallet, provider, (m) => { walletLog.push(m); console.log(m); });
// Wrap ethereum.request AFTER the provider init script (init scripts run in order) so
// every method the dapp calls is logged (params truncated; never the key — key is Node-side only).
await page.exposeFunction('__tw_rpclog', (line) => { walletLog.push(line); if (/sendTransaction|sign|switch/i.test(line)) console.log(line); });
await page.addInitScript(() => {
  const iv = setInterval(() => {
    const eth = window.ethereum;
    if (!eth || eth.__r2wrapped) return;
    const orig = eth.request;
    eth.__r2wrapped = true;
    eth.request = async (args) => {
      try { window.__tw_rpclog(`[page-rpc] ${args && args.method} params=${JSON.stringify((args && args.params) || []).slice(0, 700)}`); } catch (_) {}
      try {
        const res = await orig(args);
        try { if (args && /send|sign/i.test(args.method)) window.__tw_rpclog(`[page-rpc] ${args.method} → OK ${JSON.stringify(res).slice(0, 300)}`); } catch (_) {}
        return res;
      } catch (e) {
        try { window.__tw_rpclog(`[page-rpc] ${args && args.method} → ERR ${String(e && e.message || e).slice(0, 300)}`); } catch (_) {}
        throw e;
      }
    };
    clearInterval(iv);
  }, 5);
});

const shot = (f) => page.screenshot({ path: `${OUT}/${f}` }).catch(() => {});
const bodyText = () => page.evaluate(() => document.body.innerText);
const acceptDisclaimer = async () => { const b = page.getByRole('button', { name: 'AGREE', exact: true }); if (await b.count()) { await b.first().click().catch(() => {}); await page.waitForTimeout(2500); return true; } return false; };
const activeTab = () => page.evaluate(() => { const e = document.querySelector('[role="tab"][data-state="active"]'); return e ? e.innerText.trim() : null; });
const mouseClick = async (loc) => { const b = await loc.boundingBox(); if (!b) return false; await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); return true; };
const mouseTab = async (id) => { const l = page.locator(`#${id}`); if (await l.count()) { await mouseClick(l.first()); await page.waitForTimeout(3000); } return activeTab(); };
// toast / alert / error text census (sonner, toastify, radix alerts, generic)
const toasts = () => page.evaluate(() => {
  const sels = ['[role="alert"]', '[role="status"]', '.Toastify__toast', '[data-sonner-toast]', '[class*="toast" i]', '[class*="notification" i]'];
  const out = [];
  for (const s of sels) document.querySelectorAll(s).forEach(e => { const t = e.innerText.trim(); if (t) out.push(t.replace(/\n/g, ' | ').slice(0, 300)); });
  return [...new Set(out)];
});
const btnState = async (loc) => {
  if (!(await loc.count())) return 'ABSENT';
  return loc.first().evaluate(el => `text="${el.innerText.trim()}" disabled=${el.disabled === true} ariaDisabled=${el.getAttribute('aria-disabled')} cls=${(el.className || '').slice(0, 80)}`);
};

// ============ PHASE A: LOAD + AGREE + CONNECT ============
phase('A_connect');
const resp = await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
note(`HTTP ${resp && resp.status()}`);
await page.waitForTimeout(7000);
note(`disclaimer accepted=${await acceptDisclaimer()}`);
await page.waitForTimeout(2000);
const chip = await page.evaluate((a) => document.body.innerText.includes(a.slice(-4)), addr);
note(`wallet chip=${chip} activeTab=${await activeTab()}`);
// "Connect to Arbitrum" header button — record state (do NOT click yet; HL-Balance path first)
note(`ConnectToArbitrum btn: ${await btnState(page.locator('button:has-text("Connect to Arbitrum")'))}`);
await shot('run2_01_connected.png');
endPhase();

// ============ PHASE B: CREATE PERP ============
phase('B_create_perp_hlbalance');
await mouseTab('radix-_R_9clbtb_-trigger-create-perp');
// LONG active by default; make sure
const longBtn = page.locator('button:has-text("LONG/BUY")').first();
if (await longBtn.count()) await mouseClick(longBtn);
await page.waitForTimeout(800);
const amt = page.locator('input[placeholder*="amount" i], input[placeholder*="Enter" i]').first();
if (await amt.count()) { await amt.click().catch(() => {}); await amt.fill('500').catch(() => {}); await page.waitForTimeout(800); }
// leverage → nudge to ~5x
const sl = page.locator('[role="slider"], input[type="range"]').first();
if (await sl.count()) { await sl.focus().catch(() => {}); for (let k = 0; k < 4; k++) { await sl.press('ArrowRight').catch(() => {}); await page.waitForTimeout(60); } }
await page.waitForTimeout(700);
const pre = await page.evaluate(() => { const t = document.body.innerText; const near = (l, s = 45) => { const i = t.indexOf(l); return i < 0 ? null : t.slice(i, i + s).replace(/\n/g, ' '); }; return { dep: near('DEPOSIT', 30), lev: (t.match(/\b\d+x\b/) || [])[0], notional: near('NOTIONAL', 28), entry: near('Entry Price', 40), max: near('MAX:', 20) }; });
note(`form: ${JSON.stringify(pre)}`);
// DEPOSIT FROM: Hyperliquid Balance FIRST (fund-free path per CTO)
const hlRadio = page.locator('text=Hyperliquid Balance').first();
if (await hlRadio.count()) { await mouseClick(hlRadio); await page.waitForTimeout(800); note('selected DEPOSIT FROM = Hyperliquid Balance'); } else note('Hyperliquid Balance radio NOT FOUND');
const createBtn = page.locator('button:has-text("CREATE POSITION")');
note(`CREATE POSITION pre-click: ${await btnState(createBtn)}`);
await shot('run2_02_create_form_hlbal.png');
const textBefore = await bodyText();
if (await createBtn.count()) { await mouseClick(createBtn.first()); note('CREATE POSITION clicked (trusted mouse)'); }
await page.waitForTimeout(12000);
await shot('run2_03_create_hlbal_result.png');
let tt = await toasts();
note(`toasts: ${JSON.stringify(tt)}`);
const textAfter = await bodyText();
note(`body delta present=${textAfter !== textBefore}; new err-ish lines: ${JSON.stringify((textAfter.split('\n').filter(l => !textBefore.includes(l) && /error|fail|insufficient|reject|denied|success|submitted|created|position/i.test(l))).slice(0, 10))}`);
endPhase();

phase('B2_create_perp_wallet');
const wRadio = page.locator('text=/^Wallet$/').first();
if (await wRadio.count()) { await mouseClick(wRadio); await page.waitForTimeout(800); note('selected DEPOSIT FROM = Wallet'); } else note('Wallet radio not found by exact text — trying label search');
if (!(await wRadio.count())) { const w2 = page.locator('label:has-text("Wallet"), text=Wallet').first(); if (await w2.count()) { await mouseClick(w2); note('clicked fallback Wallet label'); } }
note(`CREATE POSITION pre-click: ${await btnState(createBtn)}`);
const tb4 = await bodyText();
if (await createBtn.count()) { await mouseClick(createBtn.first()); note('CREATE POSITION clicked (Wallet source)'); }
await page.waitForTimeout(12000);
await shot('run2_04_create_wallet_result.png');
tt = await toasts();
note(`toasts: ${JSON.stringify(tt)}`);
const ta4 = await bodyText();
note(`new err-ish lines: ${JSON.stringify((ta4.split('\n').filter(l => !tb4.includes(l) && /error|fail|insufficient|reject|denied|success|submitted|created|position|approve|bridge|deposit/i.test(l))).slice(0, 10))}`);
// If nothing happened at all, try the "Connect to Arbitrum" button then retry once
const nothing = (walletLog.filter(l => /sendTransaction|sign/i.test(l)).length === 0) && tt.length === 0;
if (nothing) {
  const cta = page.locator('button:has-text("Connect to Arbitrum")');
  if (await cta.count()) {
    note('no tx/sign/toast yet → clicking "Connect to Arbitrum" and retrying CREATE once');
    await mouseClick(cta.first()); await page.waitForTimeout(5000);
    await shot('run2_05_connect_arbitrum.png');
    note(`after ConnectToArbitrum: toasts=${JSON.stringify(await toasts())} chipBtn=${await btnState(cta)}`);
    if (await createBtn.count()) { await mouseClick(createBtn.first()); await page.waitForTimeout(10000); }
    await shot('run2_05b_create_retry_result.png');
    note(`retry toasts: ${JSON.stringify(await toasts())}`);
  }
}
endPhase();

// ============ PHASE C: PORTFOLIO — position present? close? ============
phase('C_portfolio');
const pfLink = page.locator('a:has-text("PORTFOLIO")').first();
if (await pfLink.count()) await pfLink.click().catch(() => {}); else await page.goto(APP + 'portfolio', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(5000);
await acceptDisclaimer();
await page.waitForTimeout(1500);
await shot('run2_06_portfolio_overview.png');
const pfSub = async (label, file) => { const el = page.locator('[role="tab"]').filter({ hasText: label }).first(); if (await el.count()) { await mouseClick(el); await page.waitForTimeout(3000); } await acceptDisclaimer(); await shot(file); };
await pfSub('PERPS', 'run2_07_portfolio_perps.png');
const perpRows = await page.evaluate(() => [...document.querySelectorAll('tbody tr')].map(r => r.innerText.replace(/\n/g, ' | ').slice(0, 400)));
note(`PERPS rows: ${JSON.stringify(perpRows.slice(0, 6))}`);
await pfSub('BANDS', 'run2_08_portfolio_bands.png');
const bandRows = await page.evaluate(() => [...document.querySelectorAll('tbody tr')].map(r => r.innerText.replace(/\n/g, ' | ').slice(0, 400)));
note(`BANDS rows: ${JSON.stringify(bandRows.slice(0, 6))}`);
const closeBtns = page.locator('button:has-text("CLOSE"), button:has-text("Close")');
note(`close buttons: ${await closeBtns.count()}`);
if (await closeBtns.count()) {
  await mouseClick(closeBtns.first());
  note('CLOSE clicked');
  await page.waitForTimeout(10000);
  await shot('run2_09_after_close.png');
  note(`toasts after close: ${JSON.stringify(await toasts())}`);
  const rowsAfter = await page.evaluate(() => [...document.querySelectorAll('tbody tr')].map(r => r.innerText.replace(/\n/g, ' | ').slice(0, 400)));
  note(`rows after close: ${JSON.stringify(rowsAfter.slice(0, 6))}`);
}
endPhase();

// ============ PHASE D: TRADE BANDS TRANSACT ============
phase('D_trade_bands');
// back to transact page
const txLink = page.locator('a:has-text("TRANSACT")').first();
if (await txLink.count()) await txLink.click().catch(() => {});
await page.waitForTimeout(4000);
await acceptDisclaimer();
note(`activeTab=${await mouseTab('tour1-step2-trade-bands')}`);
await page.waitForTimeout(9000); // AMM tree window
await shot('run2_10_trade_bands.png');
const tbState = await page.evaluate(() => { const t = document.body.innerText; return { dollars: (t.match(/\$[\d,]+(\.\d+)?/g) || []).slice(0, 20), pcts: (t.match(/[\d.]+%/g) || []).slice(0, 10), maxLine: (t.match(/MAX:[^\n]*/g) || []).slice(0, 3), timeout: /did not receive|timeout/i.test(t) }; });
note(`bands state: ${JSON.stringify(tbState)}`);
// options pricing chart re-check
const opTab = page.locator('[role="tab"]:has-text("OPTIONS PRICING"), button:has-text("OPTIONS PRICING")').first();
if (await opTab.count()) { await mouseClick(opTab); await page.waitForTimeout(4000); await shot('run2_11_options_pricing.png'); }
const chartCensus = await page.evaluate(() => { const cs = [...document.querySelectorAll('canvas')]; return cs.map(c => { try { const ctx = c.getContext('2d'); if (!ctx) return { w: c.width, h: c.height, nb: 'webgl/na' }; const d = ctx.getImageData(0, 0, c.width, c.height).data; let nb = 0; for (let i = 3; i < d.length; i += 40) if (d[i] > 0) nb++; return { w: c.width, h: c.height, nb }; } catch (e) { return { err: String(e).slice(0, 60) }; } }); });
note(`canvas census (OPTIONS PRICING view): ${JSON.stringify(chartCensus)}`);
// fill quantities and TRANSACT
const qtyInputs = page.locator('input').filter({ hasNot: page.locator('[type="checkbox"]') });
const inputsInfo = await page.evaluate(() => [...document.querySelectorAll('input')].map(i => ({ ph: i.placeholder, val: i.value, dis: i.disabled, type: i.type })).slice(0, 12));
note(`inputs: ${JSON.stringify(inputsInfo)}`);
// The BUY PROFITS ON qty showed 0.000000 in round1 — fill any enabled text/number input with 0.001
const filled = await page.evaluate(() => {
  const ins = [...document.querySelectorAll('input')].filter(i => !i.disabled && (i.type === 'text' || i.type === 'number') && !/from|to/i.test(i.placeholder || ''));
  if (!ins.length) return null;
  const el = ins[0];
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(el, '0.001');
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return { ph: el.placeholder, now: el.value };
});
note(`qty filled: ${JSON.stringify(filled)}`);
await page.waitForTimeout(2500);
const txBtn = page.locator('button:has-text("TRANSACT")').last();
note(`TRANSACT pre-click: ${await btnState(txBtn)}`);
const tbBefore = await bodyText();
if (await txBtn.count()) { await mouseClick(txBtn); note('TRANSACT clicked (direction 1)'); }
await page.waitForTimeout(10000);
await shot('run2_12_bands_transact1.png');
note(`toasts: ${JSON.stringify(await toasts())}`);
const tbAfter = await bodyText();
note(`new lines: ${JSON.stringify((tbAfter.split('\n').filter(l => !tbBefore.includes(l) && /error|fail|insufficient|success|submitted|band|position/i.test(l))).slice(0, 8))}`);
// swap direction (the arrows button between SELL/BUY panels) and retry
const swap = page.locator('button:has([class*="arrow" i]), button[class*="swap" i]').first();
const swapped = await page.evaluate(() => {
  // find small icon-button between the two PROFITS ON panels
  const btns = [...document.querySelectorAll('button')].filter(b => b.innerText.trim() === '' && b.querySelector('svg'));
  const cand = btns.find(b => { const r = b.getBoundingClientRect(); return r.top > 300 && r.top < 420 && r.left < 500 && r.width < 50; });
  if (cand) { const r = cand.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }
  return null;
});
if (swapped) { await page.mouse.click(swapped.x, swapped.y); await page.waitForTimeout(2500); note(`direction swap clicked at ${JSON.stringify(swapped)}`); await shot('run2_13_bands_swapped.png'); if (await txBtn.count()) { await mouseClick(txBtn); note('TRANSACT clicked (direction 2)'); await page.waitForTimeout(9000); await shot('run2_13b_bands_transact2.png'); note(`toasts: ${JSON.stringify(await toasts())}`); } }
else note('swap button not located');
endPhase();

// ============ PHASE E: EARN LP TRANSACT ============
phase('E_earn');
note(`activeTab=${await mouseTab('radix-_R_9clbtb_-trigger-earn')}`);
await page.waitForTimeout(5000);
await shot('run2_14_earn.png');
const enInfo = await page.evaluate(() => [...document.querySelectorAll('input')].map(i => ({ ph: i.placeholder, val: i.value, dis: i.disabled, type: i.type })).slice(0, 8));
note(`earn inputs: ${JSON.stringify(enInfo)}`);
const enFilled = await page.evaluate(() => {
  const ins = [...document.querySelectorAll('input')].filter(i => !i.disabled && (i.type === 'text' || i.type === 'number'));
  if (!ins.length) return null;
  const el = ins[0];
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(el, '100');
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return { ph: el.placeholder, now: el.value };
});
note(`earn amount filled: ${JSON.stringify(enFilled)}`);
await page.waitForTimeout(1500);
const enBtn = page.locator('button:has-text("TRANSACT")').last();
note(`EARN TRANSACT pre-click: ${await btnState(enBtn)}`);
const enBefore = await bodyText();
if (await enBtn.count()) { await mouseClick(enBtn); note('EARN TRANSACT clicked'); }
await page.waitForTimeout(10000);
await shot('run2_15_earn_result.png');
note(`toasts: ${JSON.stringify(await toasts())}`);
const enAfter = await bodyText();
note(`new lines: ${JSON.stringify((enAfter.split('\n').filter(l => !enBefore.includes(l) && /error|fail|insufficient|success|submitted|deposit|vault|lp/i.test(l))).slice(0, 8))}`);
endPhase();

// ============ PHASE F: FLAG-1 / FLAG-2 RECHECK ============
phase('F_flag_recheck');
const cspHits = [...new Set(sink.filter(s => /Content Security Policy|Refused to connect/i.test(s.text)).map(s => (s.text.match(/https?:\/\/[^\s'"]+/) || ['?'])[0]))];
note(`CSP-refused endpoints this round: ${JSON.stringify(cspHits.slice(0, 8))}`);
const sepoliaRollup = sink.filter(s => /sepolia-rollup/i.test(s.text)).length;
note(`sepolia-rollup mentions in errors: ${sepoliaRollup}`);
const wsOpens = [...new Set(sink.filter(s => s.kind === 'ws.open').map(s => s.text))];
note(`ws.open set: ${JSON.stringify(wsOpens)}`);
const stagingBeWs = wsOpens.some(u => /staging-be/.test(u));
note(`staging-be ws opened: ${stagingBeWs}`);
const ammTimeout = sink.filter(s => /AMM tree|did not receive/i.test(s.text)).length;
note(`AMM-tree timeout messages: ${ammTimeout}`);
const failedFetch = [...new Set(sink.filter(s => s.kind === 'requestfailed').map(s => s.text.slice(0, 140)))];
note(`requestfailed classes: ${JSON.stringify(failedFetch.slice(0, 10))}`);
endPhase();

// ============ WRAP ============
fs.writeFileSync(`${OUT}/run2_console.log`, sink.map(s => `${s.t} [${s.kind}] ${s.text}`).join('\n'));
fs.writeFileSync(`${OUT}/run2_wallet.log`, walletLog.join('\n') || '(no wallet rpc traffic captured)');
fs.writeFileSync(`${OUT}/run2_network_posts.log`, netLog.join('\n') || '(no matching POST traffic)');
const summary = {};
for (const [k, p] of Object.entries(phases)) summary[k] = { notes: p.notes, errors: p.errors, walletRpc: (p.wallet || []).slice(0, 40), backendPosts: (p.net || []).slice(0, 30) };
fs.writeFileSync(`${OUT}/run2_summary.json`, JSON.stringify(summary, null, 2));
console.log('\n===== RUN2 DONE =====');
console.log('wallet rpc lines:', walletLog.length, '| backend POST/RESP lines:', netLog.length);
console.log('sendTransaction count:', walletLog.filter(l => /sendTransaction/i.test(l)).length);
console.log('sign count:', walletLog.filter(l => /personal_sign|signTypedData/i.test(l)).length);
await browser.close();
