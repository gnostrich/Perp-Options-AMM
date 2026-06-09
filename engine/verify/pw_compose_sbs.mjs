// Compose v24_curve.png + current_curve.png side-by-side with captions. READ-ONLY.
import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
import { readFileSync } from 'node:fs';
const OUT = '/home/user/Perp-Options-AMM/evidence/v26d_vs_v24_curve';

const b64 = p => readFileSync(p).toString('base64');
const v24 = b64(`${OUT}/v24_curve.png`);
const cur = b64(`${OUT}/current_curve.png`);

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1480, height: 600 } });
  const html = `<body style="margin:0;background:#0d1117;font-family:sans-serif;color:#E4E4E4">
    <div style="display:flex;gap:24px;padding:18px">
      <div style="flex:1;text-align:center">
        <div style="font-size:16px;font-weight:600;margin-bottom:8px;color:#C7B7A5">v24 — Balancer weight-form</div>
        <img src="data:image/png;base64,${v24}" style="width:700px;border:1px solid #333"/>
        <div style="font-size:12px;color:#9B9FA3;margin-top:6px">slope = price &rarr; reads as a ~45&deg; curve</div>
      </div>
      <div style="flex:1;text-align:center">
        <div style="font-size:16px;font-weight:600;margin-bottom:8px;color:#0ABAB5">current (v26d) — GH native</div>
        <img src="data:image/png;base64,${cur}" style="width:700px;border:1px solid #333"/>
        <div style="font-size:12px;color:#9B9FA3;margin-top:6px">slope = price &divide; ~44.5 &rarr; reads nearly flat in price-scaled axes</div>
      </div>
    </div>
    <div style="text-align:center;font-size:12px;color:#9B9FA3;padding-bottom:10px">
      Same Pool-Curve view, default open state. Both frame axes to the equilibrium/price.</div>
  </body>`;
  await page.setContent(html);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/side_by_side.png` });
  await browser.close();
  console.log('side_by_side.png written');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
