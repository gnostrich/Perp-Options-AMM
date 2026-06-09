// Compose a labeled side-by-side: v24_curve.png (left) vs playground_g1p3.png (right).
// READ-ONLY; renders to a canvas in a blank page and screenshots it.
import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
import { readFileSync } from 'fs';

const OUT = '/home/user/Perp-Options-AMM/evidence/playground_vs_v24';
const b64 = p => 'data:image/png;base64,' + readFileSync(p).toString('base64');
const left  = b64(`${OUT}/v24_curve.png`);
const right = b64(`${OUT}/playground_g1p3.png`);

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1480, height: 560 } });
await page.setContent(`<html><body style="margin:0;background:#0a0e12">
<canvas id="c" width="1480" height="560"></canvas>
<script>
  const imgL=new Image(), imgR=new Image();
  let n=0;
  function draw(){
    if(++n<2) return;
    const cv=document.getElementById('c'), x=cv.getContext('2d');
    x.fillStyle='#0a0e12'; x.fillRect(0,0,1480,560);
    x.drawImage(imgL, 20, 60, 700, 460);
    x.drawImage(imgR, 760, 60, 700, 460);
    x.font='16px monospace'; x.fillStyle='#e0e0e0';
    x.fillText('v24 — Balancer weight-form (slope = price, reads ~45 deg curve)', 20, 40);
    x.fillText('playground (current) — GH native, gamma~1.3 (closest candidate)', 760, 40);
    x.font='13px monospace'; x.fillStyle='#9fb';
    x.fillText('LIVE teal curve hugs axes; grey = w=1/2 anchor (in BOTH builds)', 760, 545);
    window.__done=true;
  }
  imgL.onload=draw; imgR.onload=draw;
  imgL.src=${JSON.stringify(left)}; imgR.src=${JSON.stringify(right)};
</script></body></html>`, { waitUntil: 'load' });
await page.waitForFunction('window.__done===true', { timeout: 10000 });
await page.waitForTimeout(200);
await page.locator('#c').screenshot({ path: `${OUT}/side_by_side.png` });
await browser.close();
console.log('side_by_side.png written');
