import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
import { pathToFileURL } from 'url';
import path from 'path';
const HEAD = path.resolve('builds/HEAD_temporal_mvp_v26c.html');
const b = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage(); await p.setViewportSize({ width: 1500, height: 900 });
await p.goto(pathToFileURL(HEAD).href, { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
await p.evaluate(() => {
  const o = document.getElementById('kpi-oracle'); o.value = '80000'; o.dispatchEvent(new Event('change', { bubbles: true }));
  Store.addPerp('long', 1.0, 50000, 80000);
  const cs = Object.keys(Store.state.clubs).find(k => Store.state.clubs[k].totalNotional > 0);
  const rr = Store.openBand('call', 'put', { inner: 120000, outer: 140000 }, { inner: 68000, outer: 50000 }, 0.1, cs);
  window.__dbg = { ok: rr && rr.ok, reason: rr && rr.reason, bands: Store.state.bands.length, cs };
  if (typeof render === 'function') render();
});
console.log('DBG', JSON.stringify(await p.evaluate(()=>window.__dbg)));
await p.evaluate(() => {
  const nav = document.querySelector('[data-page="portfolio"]'); if (nav) nav.click();
  const bt = document.querySelector('[data-subtab-pf="bands"]');
  if (bt) bt.click();
  if (typeof render === 'function') render();
});
await p.waitForTimeout(300);
const info = await p.evaluate(() => {
  const bt = document.getElementById('bands-tbody');
  return { rows: bt.querySelectorAll('tr').length, cls: [...bt.querySelectorAll('tr')].map(r => r.className.trim()) };
});
console.log(JSON.stringify(info));
const el = await p.$('#bands-table');
if (el) await el.screenshot({ path: '../evidence/v26c_verify_4items/bands_table_6rows.png' });
else await p.screenshot({ path: '../evidence/v26c_verify_4items/bands_table_6rows.png' });
await b.close();
