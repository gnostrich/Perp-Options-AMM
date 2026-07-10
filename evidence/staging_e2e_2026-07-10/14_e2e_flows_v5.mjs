// 14_e2e_flows_v5.mjs — definitive pass. Root `/` first-loads the dashboard UNDER a
// disclaimer modal; clicking AGREE navigates to the marketing hero (loop). So: DO NOT
// click AGREE. Interact with the dashboard behind the modal (DOM reads/fills work), and
// hide the modal overlay via CSS for clean screenshots (visual only — no data faking,
// no navigation). Long waits for the AMM-tree backend on TRADE BANDS/EARN.
import fs from 'node:fs';
import { chromium } from 'playwright';
import { loadWallet, installProvider, instrument, chromiumLaunchOpts } from './lib_wallet_provider.mjs';

const OUT = '/home/user/Perp-Options-AMM/evidence/staging_e2e_2026-07-10';
const APP = 'https://app-staging.temporal.exchange/';
const sink = [];
const walletLog = [];
const flows = {};
function mark(n) { flows[n] = { start: sink.length, notes: [] }; return flows[n]; }
function endMark(n) { const f = flows[n]; if (f) f.errors = sink.slice(f.start).filter(s => s.kind === 'pageerror' || s.kind === 'console.error'); return f; }
const note = (n, m) => { (flows[n] || mark(n)).notes.push(m); console.log(`[${n}] ${m}`); };

const { wallet, provider } = loadWallet();
const browser = await chromium.launch(chromiumLaunchOpts());
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' });
const page = await ctx.newPage();
instrument(page, sink);
const addr = await installProvider(page, wallet, provider, (m) => walletLog.push(m));
const shot = (f) => page.screenshot({ path: `${OUT}/${f}` }).catch(() => {});
const bodyText = () => page.evaluate(() => document.body.innerText);
const has = async (sel) => (await page.locator(sel).count()) > 0;
// hide any disclaimer/dialog overlay for clean screenshots — visual only, no click, no nav
const hideDisclaimer = () => page.evaluate(() => {
  const heads = [...document.querySelectorAll('h1,h2,h3,div,section')].filter(e => /^\s*DISCLAIMER\s*$/i.test(e.textContent || '') || /Experimental Application/i.test(e.textContent || ''));
  let hidden = 0;
  for (const h of heads) {
    let n = h;
    for (let up = 0; up < 8 && n; up++) {
      const cs = getComputedStyle(n);
      if (cs.position === 'fixed' || cs.position === 'absolute' || (n.getAttribute('role') === 'dialog')) { n.style.setProperty('display', 'none', 'important'); hidden++; break; }
      n = n.parentElement;
    }
  }
  // also nuke common backdrop layers
  document.querySelectorAll('[data-state="open"][role="dialog"], [aria-modal="true"]').forEach(e => { e.style.setProperty('display', 'none', 'important'); hidden++; });
  return hidden;
});
const clickTab = async (label) => { const sel = `button:has-text("${label}"), [role="tab"]:has-text("${label}")`; if (await has(sel)) { await page.locator(sel).first().click({ force: true }).catch(() => {}); return true; } return false; };

// ===== LOAD (no AGREE) =====
mark('landing');
const resp = await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
note('landing', `HTTP ${resp && resp.status()}`);
await page.waitForTimeout(7000);
await shot('01_landing_disclaimer.png');
const onDash = (await bodyText()).includes('CREATE PERP');
note('landing', `on dashboard (CREATE PERP present)=${onDash}`);
const hid = await hideDisclaimer();
note('landing', `disclaimer overlay hidden=${hid} (no AGREE click, no navigation)`);
await page.waitForTimeout(1000);
await shot('02_connected.png');
const chip = await page.evaluate((a) => document.body.innerText.includes(a.slice(-4)), addr);
const prov = await page.evaluate(async () => { try { return { accounts: await window.ethereum.request({ method: 'eth_accounts' }), chainId: await window.ethereum.request({ method: 'eth_chainId' }) }; } catch (e) { return { err: String(e) }; } });
note('landing', `wallet chip=${chip} provider=${JSON.stringify(prov)}`);
endMark('landing');

// ===== CREATE PERP LONG =====
mark('create_perp_long');
await clickTab('CREATE PERP'); await page.waitForTimeout(1500); await hideDisclaimer();
if (await has('button:has-text("LONG/BUY")')) await page.locator('button:has-text("LONG/BUY")').first().click({ force: true }).catch(() => {});
await page.waitForTimeout(1000); await hideDisclaimer();
const lf = await page.evaluate(() => { const t = document.body.innerText; const near = (l, s = 55) => { const i = t.indexOf(l); return i < 0 ? null : t.slice(i, i + s).replace(/\n/g, ' '); }; return { entry: near('Entry Price', 40), liq: near('Liquidation Price', 60), hl: near('Hyperliquid Tx Fees', 50), tmp: near('Temporal Tx Fees', 45), lev: (t.match(/\b\d+x\b/g) || []).slice(0, 6), createBtn: /CREATE POSITION/i.test(t), exec: near('Executed on', 30), deposit: near('DEPOSIT', 20), notional: near('NOTIONAL', 25) }; });
note('create_perp_long', `entry=${lf.entry} | liq=${lf.liq}`);
note('create_perp_long', `HLfees=${lf.hl} | TMPfees=${lf.tmp} | ${lf.exec} | levTicks=${JSON.stringify(lf.lev)} createBtn=${lf.createBtn}`);
await shot('03_create_perp_long.png');
endMark('create_perp_long');

// ===== LEVERAGE / NOTIONAL =====
mark('leverage_notional');
await hideDisclaimer();
const amt = page.locator('input[placeholder*="amount" i], input[placeholder*="Enter" i]').first();
if (await amt.count()) { await amt.click().catch(() => {}); await amt.fill('500').catch(() => {}); await page.waitForTimeout(800); await hideDisclaimer(); }
const notBefore = await page.evaluate(() => { const t = document.body.innerText; const i = t.indexOf('NOTIONAL'); return i < 0 ? null : t.slice(i, i + 25).replace(/\n/g, ' '); });
const levB = (await bodyText()).match(/\b\d+x\b/);
const sl = page.locator('[role="slider"], input[type="range"]');
if (await sl.count()) { await sl.first().focus().catch(() => {}); for (let k = 0; k < 15; k++) { await sl.first().press('ArrowRight').catch(() => {}); await page.waitForTimeout(70); } }
await page.waitForTimeout(1000); await hideDisclaimer();
const aft = await page.evaluate(() => { const t = document.body.innerText; const near = (l, s = 55) => { const i = t.indexOf(l); return i < 0 ? null : t.slice(i, i + s).replace(/\n/g, ' '); }; return { lev: (t.match(/\b\d+x\b/) || [])[0], notional: near('NOTIONAL', 25), liq: near('Liquidation Price', 60), deposit: near('DEPOSIT', 20) }; });
note('leverage_notional', `leverage ${levB && levB[0]} → ${aft.lev}; deposit='${aft.deposit}'; notional '${notBefore}' → '${aft.notional}'; liq=${aft.liq}`);
await shot('04_leverage_notional.png');
endMark('leverage_notional');

// ===== SHORT =====
mark('create_perp_short');
await hideDisclaimer();
if (await has('button:has-text("SHORT/SELL")')) await page.locator('button:has-text("SHORT/SELL")').first().click({ force: true }).catch(() => {});
await page.waitForTimeout(1200); await hideDisclaimer();
const sf = await page.evaluate(() => { const t = document.body.innerText; const near = (l, s = 55) => { const i = t.indexOf(l); return i < 0 ? null : t.slice(i, i + s).replace(/\n/g, ' '); }; return { entry: near('Entry Price', 40), liq: near('Liquidation Price', 60), shortActive: /SHORT\/SELL/.test(t) }; });
note('create_perp_short', `entry=${sf.entry} | liq=${sf.liq}`);
await shot('05_create_perp_short.png');
endMark('create_perp_short');

// ===== TRADE BANDS (long wait for AMM tree) =====
mark('trade_bands');
await clickTab('TRADE BANDS'); await page.waitForTimeout(4000); await hideDisclaimer();
await page.waitForTimeout(9000); // AMM tree backend can take ~10s
await hideDisclaimer();
await shot('06_trade_bands.png');
const tb = await page.evaluate(() => { const t = document.body.innerText; return { strike: /strike/i.test(t), band: /band/i.test(t), funding: /funding/i.test(t), rayDev: /ray dev|curve skew|deviation|lean/i.test(t), inner: /inner/i.test(t), outer: /outer/i.test(t), intrinsic: /intrinsic/i.test(t), extrinsic: /extrinsic/i.test(t), loading: /loading|did not receive|timeout|no data|unavailable|failed/i.test(t), dollars: (t.match(/\$[\d,]+(\.\d+)?/g) || []).slice(0, 24), snippet: t.slice(0, 4000) }; });
note('trade_bands', `strike=${tb.strike} band=${tb.band} inner=${tb.inner} outer=${tb.outer} intrinsic=${tb.intrinsic} extrinsic=${tb.extrinsic} funding=${tb.funding} rayDev=${tb.rayDev} loadingOrError=${tb.loading}`);
note('trade_bands', `dollars=${JSON.stringify(tb.dollars)}`);
fs.writeFileSync(`${OUT}/tradebands_text.txt`, tb.snippet);
endMark('trade_bands');

// ===== EARN =====
mark('earn');
await clickTab('EARN'); await page.waitForTimeout(4000); await hideDisclaimer();
await page.waitForTimeout(6000);
await hideDisclaimer();
await shot('07_earn.png');
const en = await page.evaluate(() => { const t = document.body.innerText; return { apy: /apy|apr|yield/i.test(t), deposit: /deposit/i.test(t), lp: /liquidity|pool|vault|lp|stake/i.test(t), pcts: (t.match(/[\d.]+%/g) || []).slice(0, 20), dollars: (t.match(/\$[\d,]+(\.\d+)?/g) || []).slice(0, 20), snippet: t.slice(0, 3500) }; });
note('earn', `apy=${en.apy} deposit=${en.deposit} lp=${en.lp} pcts=${JSON.stringify(en.pcts)} dollars=${JSON.stringify(en.dollars)}`);
fs.writeFileSync(`${OUT}/earn_text.txt`, en.snippet);
endMark('earn');

// ===== WRAP =====
fs.writeFileSync(`${OUT}/e2e_console.log`, sink.map(s => `${s.t} [${s.kind}] ${s.text}`).join('\n'));
fs.writeFileSync(`${OUT}/e2e_wallet.log`, walletLog.join('\n'));
const summary = {};
for (const [k, f] of Object.entries(flows)) { const errs = (f.errors || []).map(e => e.text); summary[k] = { notes: f.notes, errorCount: errs.length, uniqueErrors: [...new Set(errs.map(e => e.slice(0, 140)))].slice(0, 6) }; }
fs.writeFileSync(`${OUT}/e2e_summary.json`, JSON.stringify(summary, null, 2));
const allUniq = [...new Set(sink.filter(s => s.kind === 'pageerror' || s.kind === 'console.error' || s.kind === 'requestfailed' || s.kind === 'http4xx5xx' || s.kind === 'ws.open' || s.kind === 'ws.close').map(s => `${s.kind}: ${s.text.slice(0, 170)}`))];
fs.writeFileSync(`${OUT}/e2e_unique_errors.txt`, allUniq.join('\n'));
console.log('\n===== V5 FLOW SUMMARY =====');
for (const [k, v] of Object.entries(summary)) console.log(`${k}: ${v.errorCount} errors`);
console.log('\nGLOBAL UNIQUE NETWORK/CONSOLE CLASSES:', allUniq.length);
allUniq.forEach(e => console.log('  -', e.slice(0, 160)));
await browser.close();
