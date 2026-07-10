import { launchWithMM, getMMWallet, EXT_ID, APP } from './run5_lib.mjs';
import { onboard } from './run5_onboard.mjs';
import fs from 'fs';

const OUT = process.cwd();
const NET = [];   // network log
const WS = [];    // websocket log
const CONSOLE = [];
const log = (...a) => { console.log(...a); };

// ---- MetaMask notification popup auto-approver ----
async function approvePopup(pg, tag) {
  for (let n = 0; n < 6; n++) {
    await pg.waitForTimeout(600);
    let clicked = null;
    for (const t of ['confirm-btn', 'confirmation-submit-button', 'page-container-footer-next',
                     'confirm-footer-button', 'confirm-btn-connect', 'connect-button',
                     'confirm-network-approve-button', 'confirm-network-switch-button']) {
      try {
        const b = pg.getByTestId(t).first();
        if (await b.isVisible({ timeout: 500 })) { await b.click().catch(()=>{}); clicked = t; break; }
      } catch {}
    }
    if (!clicked) {
      for (const nm of [/^Connect$/i, /^Approve$/i, /^Confirm$/i, /^Next$/i, /^Sign$/i, /^Switch network$/i, /^Got it$/i]) {
        try { const b = pg.getByRole('button', { name: nm }).first();
          if (await b.isVisible({ timeout: 400 })) { await b.click().catch(()=>{}); clicked = nm.source; break; } } catch {}
      }
    }
    log(`  [popup ${tag}] step${n} clicked=${clicked||'none'} url=${pg.url().split('/').pop()}`);
    if (!clicked && n > 1) break;
  }
}

const ctx = await launchWithMM('/tmp/run5_profile_main');
await new Promise(r => setTimeout(r, 4000));

// auto-approve any MetaMask notification popups that appear
ctx.on('page', async (pg) => {
  const u = pg.url();
  if (u.startsWith(`chrome-extension://${EXT_ID}`) && (u.includes('notification') || u.includes('popup'))) {
    log('MM popup opened:', u.split('/').pop());
    await approvePopup(pg, 'auto').catch(()=>{});
  }
});

// ---- onboard ----
let mm = ctx.pages().find(p => p.url().startsWith(`chrome-extension://${EXT_ID}`));
if (!mm) mm = await ctx.newPage();
await mm.goto(`chrome-extension://${EXT_ID}/home.html`, { waitUntil: 'domcontentloaded' }).catch(()=>{});
await mm.waitForTimeout(2000);
const ob = await onboard(mm, 'run5c');
log('ONBOARD:', JSON.stringify(ob.log));
await mm.screenshot({ path: `${OUT}/run5c_00_mm_home.png` }).catch(()=>{});

// ---- open the app in a fresh tab, wire logging ----
const app = await ctx.newPage();
app.on('console', m => { const t = m.text(); CONSOLE.push(`[${m.type()}] ${t}`); });
app.on('pageerror', e => CONSOLE.push(`[pageerror] ${e.message}`));
app.on('requestfailed', r => NET.push(`FAIL ${r.failure()?.errorText||''} ${r.url()}`));
app.on('response', r => { const s = r.status(); const u = r.url();
  if (u.includes('temporal.exchange') || u.includes('arbitrum') || u.includes('hyperliquid') || s>=400)
    NET.push(`${s} ${r.request().method()} ${u}`); });
app.on('websocket', ws => {
  const u = ws.url(); WS.push(`OPEN ${u}`); log('WS OPEN', u);
  ws.on('framereceived', f => { const d = (f.payload||'').toString().slice(0,180); WS.push(`  <= ${u.slice(0,50)} ${d}`); });
  ws.on('framesent', f => { const d = (f.payload||'').toString().slice(0,180); WS.push(`  => ${u.slice(0,50)} ${d}`); });
  ws.on('close', () => WS.push(`CLOSE ${u}`));
});

await app.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60000 });
await app.waitForTimeout(3000);
await app.screenshot({ path: `${OUT}/run5c_01_landing.png` });
log('landing title:', await app.title());

// dismiss disclaimer if present
for (const nm of [/^Agree$/i, /^I Agree$/i, /^Accept$/i, /^Continue$/i]) {
  try { const b = app.getByRole('button', { name: nm }).first();
    if (await b.isVisible({ timeout: 1200 })) { await b.click().catch(()=>{}); log('disclaimer:', nm.source); break; } } catch {}
}
await app.waitForTimeout(1500);

// click Connect Wallet
let connClicked = false;
for (const nm of [/Connect Wallet/i, /Connect$/i]) {
  try { const b = app.getByRole('button', { name: nm }).first();
    if (await b.isVisible({ timeout: 1500 })) { await b.click().catch(()=>{}); connClicked = true; log('clicked connect:', nm.source); break; } } catch {}
}
await app.waitForTimeout(2000);
await app.screenshot({ path: `${OUT}/run5c_02_connect_modal.png` });

// pick MetaMask in the wallet modal if a chooser appears
for (const nm of [/MetaMask/i]) {
  try { const b = app.getByText(nm).first();
    if (await b.isVisible({ timeout: 1500 })) { await b.click().catch(()=>{}); log('picked MetaMask'); break; } } catch {}
}
// popup approver runs via ctx.on('page'); also give focus to any existing MM popup
await app.waitForTimeout(4000);
// explicitly approve any open MM notification windows
for (const pg of ctx.pages()) {
  if (pg.url().includes('notification')) await approvePopup(pg, 'explicit').catch(()=>{});
}
await app.waitForTimeout(3000);
await app.screenshot({ path: `${OUT}/run5c_03_after_connect.png` });

// let data layer settle + watch ws
await app.waitForTimeout(12000);
await app.screenshot({ path: `${OUT}/run5c_04_settled.png` });

// summarize CSP sepolia-rollup + staging-be ws
const sepoliaCsp = CONSOLE.filter(c => c.includes('sepolia-rollup')).length;
const stagingWsOpen = WS.filter(w => w.startsWith('OPEN') && w.includes('staging-be')).length;
const hlWsOpen = WS.filter(w => w.startsWith('OPEN') && w.includes('hyperliquid')).length;
const ammTimeout = CONSOLE.filter(c => /AMM tree|market_data|Did not receive/i.test(c)).length;

fs.writeFileSync(`${OUT}/run5c_console.log`, CONSOLE.join('\n'));
fs.writeFileSync(`${OUT}/run5c_network.log`, NET.join('\n'));
fs.writeFileSync(`${OUT}/run5c_ws.log`, WS.join('\n'));
log('=== SUMMARY ===');
log('sepolia-rollup CSP hits:', sepoliaCsp);
log('staging-be ws OPENs:', stagingWsOpen);
log('hyperliquid ws OPENs:', hlWsOpen);
log('AMM-tree timeout msgs:', ammTimeout);
log('WS urls:', [...new Set(WS.filter(w=>w.startsWith('OPEN')).map(w=>w.slice(5,80)))].join(' | '));

await ctx.close();
log('done');
