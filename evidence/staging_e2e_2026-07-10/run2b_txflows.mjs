// run2b_txflows.mjs — ROUND 2, attempt B. Root causes addressed from attempt A:
//  (1) app demands ARBITRUM ONE (modal "SWITCH TO ARBITRUM ONE") — round-1 provider refused
//      the switch (4902). Here the PAGE-SIDE provider accepts wallet_switchEthereumChain and
//      reports the switched chainId + fires chainChanged; the NODE-SIDE signer stays on the
//      Sepolia RPC so any real broadcast attempt fails harmlessly (0 funds everywhere).
//  (2) network tap now captures ALL non-static requests incl. same-origin /api/* POSTs.
//  (3) bands inputs targeted per PROFITS-ON panel; EARN tab clicked by role+text.
import fs from 'node:fs';
import { chromium } from 'playwright';
import { loadWallet, installProvider, instrument, chromiumLaunchOpts } from './lib_wallet_provider.mjs';

const OUT = '/home/user/Perp-Options-AMM/evidence/staging_e2e_2026-07-10';
const APP = 'https://app-staging.temporal.exchange/';
const sink = [];
const walletLog = [];
const netLog = [];
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

// FULL network tap (skip static assets)
const isStatic = (u) => /\.(png|jpg|svg|woff2?|css|ico|webp)(\?|$)|_next\/static|fonts\.|googletagmanager|google-analytics|tradingview|datafeed/i.test(u);
page.on('request', (r) => {
  const u = r.url();
  if (isStatic(u)) return;
  if (r.method() === 'POST' || /\/api\/|hyperliquid|staging-be|arbitrum|rpc/i.test(u)) {
    netLog.push(`${new Date().toISOString()} REQ ${r.method()} ${u.slice(0, 170)}${r.method() === 'POST' ? ' body=' + (r.postData() || '').slice(0, 800) : ''}`);
  }
});
page.on('response', async (r) => {
  const u = r.url();
  if (isStatic(u)) return;
  if ((r.request().method() === 'POST' && !/temporal\.exchange\/(\?|$|portfolio)/.test(u)) || /\/exchange|staging-be|\/api\/(?!stream)/i.test(u)) {
    let body = ''; try { body = (await r.text()).slice(0, 800); } catch (_) { body = '(stream/unreadable)'; }
    netLog.push(`${new Date().toISOString()} RESP ${r.status()} ${u.slice(0, 170)} body=${body}`);
  }
});

const addr = await installProvider(page, wallet, provider, (m) => { walletLog.push(m); console.log(m); });
await page.exposeFunction('__tw_rpclog', (line) => { walletLog.push(line); if (/sendTransaction|sign|switch|chainChanged/i.test(line)) console.log(line); });
// Chain-chameleon wrapper: accept wallet_switchEthereumChain, track chainId, own the
// listener registry so chainChanged reaches the dapp. Registered AFTER lib's init script.
await page.addInitScript(() => {
  const iv = setInterval(() => {
    const eth = window.ethereum;
    if (!eth || eth.__r2bWrapped) return;
    eth.__r2bWrapped = true;
    const origRequest = eth.request;
    const origOn = eth.on;
    const reg = {};                       // our listener registry (dapp registers post-wrap)
    let chainId = eth.chainId;            // starts 0x66eee
    const fire = (ev, ...a) => (reg[ev] || []).forEach(f => { try { f(...a); } catch (_) {} });
    eth.on = (ev, fn) => { (reg[ev] = reg[ev] || []).push(fn); return origOn(ev, fn); };
    eth.removeListener = (ev, fn) => { reg[ev] = (reg[ev] || []).filter(f => f !== fn); return eth; };
    eth.request = async (args) => {
      const m = args && args.method;
      const p = (args && args.params) || [];
      try { window.__tw_rpclog(`[page-rpc] ${m} params=${JSON.stringify(p).slice(0, 700)}`); } catch (_) {}
      if (m === 'eth_chainId') return chainId;
      if (m === 'net_version') return String(parseInt(chainId, 16));
      if (m === 'wallet_switchEthereumChain') {
        const want = p[0] && p[0].chainId;
        if (want) {
          chainId = want.toLowerCase();
          eth.chainId = chainId; eth.networkVersion = String(parseInt(chainId, 16));
          try { window.__tw_rpclog(`[page-rpc] wallet_switchEthereumChain ACCEPTED → ${chainId} (page-side claim only; node signer stays on Sepolia RPC)`); } catch (_) {}
          setTimeout(() => fire('chainChanged', chainId), 0);
          return null;
        }
        return null;
      }
      if (m === 'wallet_addEthereumChain') return null;
      try {
        const res = await origRequest(args);
        try { if (/send|sign/i.test(m)) window.__tw_rpclog(`[page-rpc] ${m} → OK ${JSON.stringify(res).slice(0, 300)}`); } catch (_) {}
        return res;
      } catch (e) {
        try { window.__tw_rpclog(`[page-rpc] ${m} → ERR ${String((e && e.message) || e).slice(0, 300)}`); } catch (_) {}
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
const tabByText = async (label) => { const l = page.locator('[role="tab"]').filter({ hasText: label }).first(); if (await l.count()) { await mouseClick(l); await page.waitForTimeout(3000); } return activeTab(); };
const toasts = () => page.evaluate(() => {
  const sels = ['[role="alert"]', '[role="status"]', '.Toastify__toast', '[data-sonner-toast]', '[class*="toast" i]', '[class*="notification" i]'];
  const out = [];
  for (const s of sels) document.querySelectorAll(s).forEach(e => { const t = e.innerText.trim(); if (t) out.push(t.replace(/\n/g, ' | ').slice(0, 300)); });
  return [...new Set(out)];
});
const btnState = async (loc) => { if (!(await loc.count())) return 'ABSENT'; return loc.first().evaluate(el => `text="${el.innerText.trim()}" disabled=${el.disabled === true} cls=${(el.className || '').slice(0, 60)}`); };

// ============ A: LOAD + AGREE + SWITCH TO ARBITRUM ONE ============
phase('A_connect_switch');
const resp = await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
note(`HTTP ${resp && resp.status()}`);
await page.waitForTimeout(7000);
note(`disclaimer accepted=${await acceptDisclaimer()}`);
await page.waitForTimeout(2000);
note(`wallet chip=${await page.evaluate((a) => document.body.innerText.includes(a.slice(-4)), addr)} activeTab=${await activeTab()}`);
const cta = page.locator('button:has-text("Connect to Arbitrum")');
if (await cta.count()) {
  await mouseClick(cta.first());
  await page.waitForTimeout(2500);
  await shot('run2b_01_switch_modal.png');
  const sw = page.locator('button:has-text("Switch Network")');
  note(`switch modal: ${await sw.count() ? 'OPEN' : 'not found'}`);
  if (await sw.count()) { await mouseClick(sw.first()); note('Switch Network clicked'); }
  await page.waitForTimeout(5000);
  note(`ConnectToArbitrum btn after switch: ${await btnState(cta)}`);
  note(`page-side chainId now: ${await page.evaluate(() => window.ethereum.chainId)}`);
  await shot('run2b_02_after_switch.png');
}
endPhase();

// ============ B: CREATE PERP (HL Balance first, then Wallet) ============
const tryCreate = async (label, src) => {
  phase(label);
  await tabByText('CREATE PERP');
  const longBtn = page.locator('button:has-text("LONG/BUY")').first();
  if (await longBtn.count()) await mouseClick(longBtn);
  await page.waitForTimeout(600);
  const amt = page.locator('input[placeholder*="amount" i]').first();
  if (await amt.count()) { await amt.click().catch(() => {}); await amt.fill('500').catch(() => {}); await page.waitForTimeout(800); }
  const radio = page.locator(`input[type="radio"][value="${src}"]`).first();
  if (await radio.count()) { await radio.evaluate(el => { el.click(); }); await page.waitForTimeout(600); note(`DEPOSIT FROM radio value=${src} selected=${await radio.evaluate(el => el.checked)}`); }
  const form = await page.evaluate(() => { const t = document.body.innerText; const near = (l, s = 42) => { const i = t.indexOf(l); return i < 0 ? null : t.slice(i, i + s).replace(/\n/g, ' '); }; return { max: near('MAX:', 14), notional: near('NOTIONAL', 26), entry: near('Entry Price', 32) }; });
  note(`form: ${JSON.stringify(form)}`);
  const createBtn = page.locator('button:has-text("CREATE POSITION")');
  note(`CREATE pre-click: ${await btnState(createBtn)}`);
  const before = await bodyText();
  const wBefore = walletLog.length, nBefore = netLog.length;
  if (await createBtn.count()) { await mouseClick(createBtn.first()); note('CREATE POSITION clicked'); }
  await page.waitForTimeout(14000);
  await shot(`${label}_result.png`.replace(/^/, 'run2b_'));
  note(`toasts: ${JSON.stringify(await toasts())}`);
  note(`wallet rpc during click-window: ${JSON.stringify(walletLog.slice(wBefore).slice(0, 20))}`);
  note(`net during click-window: ${JSON.stringify(netLog.slice(nBefore).filter(l => !/clearinghouseState|candleSnapshot|eth_blockNumber/.test(l)).slice(0, 15))}`);
  const after = await bodyText();
  note(`new lines: ${JSON.stringify(after.split('\n').filter(l => !before.includes(l) && /error|fail|insufficient|reject|success|submitted|created|position|balance/i.test(l)).slice(0, 10))}`);
  endPhase();
};
await tryCreate('B1_create_hlbalance', 'hl-balance');
await tryCreate('B2_create_wallet', 'wallet');

// ============ C: PORTFOLIO ============
phase('C_portfolio');
const pfLink = page.locator('a:has-text("PORTFOLIO")').first();
if (await pfLink.count()) await pfLink.click().catch(() => {}); else await page.goto(APP + 'portfolio', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(5000);
await acceptDisclaimer();
await shot('run2b_05_portfolio.png');
for (const sub of ['PERPS', 'BANDS', 'EARN']) {
  const el = page.locator('[role="tab"]').filter({ hasText: sub }).first();
  if (await el.count()) { await mouseClick(el); await page.waitForTimeout(2500); }
  const rows = await page.evaluate(() => [...document.querySelectorAll('tbody tr')].map(r => r.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean));
  note(`${sub} rows: ${JSON.stringify(rows.slice(0, 5))}`);
  await shot(`run2b_06_portfolio_${sub.toLowerCase()}.png`);
}
note(`close buttons: ${await page.locator('button:has-text("CLOSE"), button:has-text("Close")').count()}`);
endPhase();

// ============ D: TRADE BANDS ============
phase('D_trade_bands');
const txLink = page.locator('a:has-text("TRANSACT")').first();
if (await txLink.count()) await txLink.click().catch(() => {});
await page.waitForTimeout(4000);
await acceptDisclaimer();
note(`activeTab=${await tabByText('TRADE BANDS')}`);
await page.waitForTimeout(9000);
await shot('run2b_07_trade_bands.png');
// classify inputs by PROFITS-ON panel
const panelInputs = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('input').forEach((inp, idx) => {
    let el = inp, panel = null;
    for (let d = 0; d < 12 && el; d++, el = el.parentElement) {
      const t = (el.innerText || '');
      if (/SELL PROFITS ON/.test(t) && !/BUY PROFITS ON/.test(t)) { panel = 'SELL'; break; }
      if (/BUY PROFITS ON/.test(t) && !/SELL PROFITS ON/.test(t)) { panel = 'BUY'; break; }
    }
    if (panel) out.push({ idx, panel, ph: inp.placeholder, val: inp.value, type: inp.type, dis: inp.disabled });
  });
  return out;
});
note(`panel inputs: ${JSON.stringify(panelInputs)}`);
const fillPanelQty = async (panel, val) => page.evaluate(({ panel, val }) => {
  const cands = [];
  document.querySelectorAll('input').forEach((inp) => {
    let el = inp;
    for (let d = 0; d < 12 && el; d++, el = el.parentElement) {
      const t = (el.innerText || '');
      if (new RegExp(`^${panel} PROFITS ON`, 'm').test(t) && t.length < 400) { if (!/From|To/.test(inp.placeholder || '')) cands.push(inp); break; }
    }
  });
  const el = cands[0];
  if (!el) return null;
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(el, val);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return { ph: el.placeholder, now: el.value, type: el.type };
}, { panel, val });
note(`fill SELL qty: ${JSON.stringify(await fillPanelQty('SELL', '0.001'))}`);
await page.waitForTimeout(1500);
note(`fill BUY qty: ${JSON.stringify(await fillPanelQty('BUY', '0.001'))}`);
await page.waitForTimeout(2500);
const bandsRead = await page.evaluate(() => { const t = document.body.innerText; return { slippage: (t.match(/Slippage %[\s\S]{0,30}/) || [null])[0], fees: (t.match(/Tx Fees %[\s\S]{0,30}/) || [null])[0], deposit: (t.match(/Deposit:[\s\S]{0,60}/) || [null])[0] }; });
note(`bands readout: ${JSON.stringify(bandsRead).replace(/\n/g, ' ')}`);
const txBtn = page.locator('button:has-text("TRANSACT")').last();
note(`TRANSACT pre-click: ${await btnState(txBtn)}`);
const wB = walletLog.length, nB = netLog.length, tB = await bodyText();
if (await txBtn.count()) { await mouseClick(txBtn); note('TRANSACT clicked'); }
await page.waitForTimeout(10000);
await shot('run2b_08_bands_transact.png');
note(`toasts: ${JSON.stringify(await toasts())}`);
note(`wallet rpc window: ${JSON.stringify(walletLog.slice(wB).slice(0, 15))}`);
note(`net window: ${JSON.stringify(netLog.slice(nB).filter(l => !/clearinghouseState|candleSnapshot|eth_blockNumber/.test(l)).slice(0, 12))}`);
note(`new lines: ${JSON.stringify((await bodyText()).split('\n').filter(l => !tB.includes(l) && /error|fail|insufficient|success|submitted|band/i.test(l)).slice(0, 8))}`);
// OPTIONS PRICING re-check
const opTab = page.locator('[role="tab"]:has-text("OPTIONS PRICING"), button:has-text("OPTIONS PRICING")').first();
if (await opTab.count()) { await mouseClick(opTab); await page.waitForTimeout(4000); }
await shot('run2b_09_options_pricing.png');
note(`canvases in options view: ${await page.evaluate(() => document.querySelectorAll('canvas').length)}`);
note(`options panel text: ${JSON.stringify(await page.evaluate(() => { const p = document.querySelector('[role="tabpanel"][data-state="active"]'); return p ? p.innerText.slice(0, 300) : null; }))}`);
endPhase();

// ============ E: EARN ============
phase('E_earn');
note(`activeTab=${await tabByText('EARN')}`);
await page.waitForTimeout(5000);
await shot('run2b_10_earn.png');
const earnInputs = await page.evaluate(() => {
  const panel = [...document.querySelectorAll('[role="tabpanel"]')].find(p => p.getAttribute('data-state') === 'active');
  if (!panel) return null;
  return [...panel.querySelectorAll('input')].map(i => ({ ph: i.placeholder, val: i.value, type: i.type, dis: i.disabled }));
});
note(`earn active-panel inputs: ${JSON.stringify(earnInputs)}`);
const earnFilled = await page.evaluate(() => {
  const panel = [...document.querySelectorAll('[role="tabpanel"]')].find(p => p.getAttribute('data-state') === 'active');
  if (!panel) return null;
  const el = [...panel.querySelectorAll('input')].find(i => !i.disabled && (i.type === 'number' || i.type === 'text'));
  if (!el) return null;
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(el, '100');
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return { ph: el.placeholder, now: el.value };
});
note(`earn filled: ${JSON.stringify(earnFilled)}`);
await page.waitForTimeout(1500);
const earnState = await page.evaluate(() => { const t = document.body.innerText; return { aprs: (t.match(/[\d.]+ ?%/g) || []).slice(0, 12), tvl: (t.match(/TVL[\s\S]{0,40}/) || [null])[0], dashes: /--%/.test(t) }; });
note(`earn state: ${JSON.stringify(earnState).replace(/\n/g, ' ')}`);
const eBtn = page.locator('button:has-text("TRANSACT")').last();
note(`EARN TRANSACT pre-click: ${await btnState(eBtn)}`);
const wE = walletLog.length, nE = netLog.length;
if (await eBtn.count()) { await mouseClick(eBtn); note('EARN TRANSACT clicked'); }
await page.waitForTimeout(10000);
await shot('run2b_11_earn_result.png');
note(`toasts: ${JSON.stringify(await toasts())}`);
note(`wallet rpc window: ${JSON.stringify(walletLog.slice(wE).slice(0, 15))}`);
note(`net window: ${JSON.stringify(netLog.slice(nE).filter(l => !/clearinghouseState|candleSnapshot|eth_blockNumber/.test(l)).slice(0, 12))}`);
endPhase();

// ============ F: FLAG RECHECK ============
phase('F_flag_recheck');
note(`sepolia-rollup CSP errors: ${sink.filter(s => /sepolia-rollup/i.test(s.text)).length}`);
note(`ws.open set: ${JSON.stringify([...new Set(sink.filter(s => s.kind === 'ws.open').map(s => s.text))])}`);
note(`staging-be ws opened: ${sink.some(s => s.kind === 'ws.open' && /staging-be/.test(s.text))}`);
note(`AMM-tree msgs: ${JSON.stringify([...new Set(sink.filter(s => /AMM tree|incomplete market_data/i.test(s.text)).map(s => s.text.slice(0, 110)))])}`);
note(`market-data stream requests: ${netLog.filter(l => /stream\/market-data/.test(l)).length}`);
endPhase();

// ============ WRAP ============
fs.writeFileSync(`${OUT}/run2b_console.log`, sink.map(s => `${s.t} [${s.kind}] ${s.text}`).join('\n'));
fs.appendFileSync(`${OUT}/run2_wallet.log`, `\n\n===== run2b (attempt B) =====\n` + (walletLog.join('\n') || '(no wallet rpc traffic)'));
fs.writeFileSync(`${OUT}/run2b_network.log`, netLog.join('\n') || '(none)');
const summary = {};
for (const [k, p] of Object.entries(phases)) summary[k] = { notes: p.notes, errors: p.errors };
fs.writeFileSync(`${OUT}/run2b_summary.json`, JSON.stringify(summary, null, 2));
console.log('\n===== RUN2B DONE =====');
console.log('sendTransaction:', walletLog.filter(l => /sendTransaction/i.test(l)).length, '| signs:', walletLog.filter(l => /personal_sign|signTypedData/i.test(l)).length, '| switch:', walletLog.filter(l => /switchEthereumChain/i.test(l)).length);
await browser.close();
