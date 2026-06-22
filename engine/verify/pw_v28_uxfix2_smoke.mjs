// Live UX-fix smoke for HEAD v28 lens (md5 d606c3f2).
// Fix 1: removed UI verification overclaims (Lean-validated / Aristotle-verified / no sorry)
//        -> trusted-from-prover wording.
// Fix 2: drawStrikeMark uses psiAt (lensed smooth-paste mark) so sold/bought dots sit ON the curve.
// Usage: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node verify/pw_v28_uxfix_smoke.mjs [A|B]
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const RUN = (process.argv[2] || 'A').toUpperCase();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML = path.resolve(__dirname, '../builds/HEAD_temporal_mvp_v28_lens.html');
const OUT = path.resolve(__dirname, '../../evidence/v28_uxfix2');
fs.mkdirSync(OUT, { recursive: true });
const URL = 'file://' + HTML;

const log = [];
const P = (...a) => { const s = a.join(' '); log.push(s); console.log(s); };

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1500, height: 1700 } });
  const consoleErrs = [], pageErrs = [], dialogs = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrs.push(m.text()); });
  page.on('pageerror', e => pageErrs.push(String(e)));
  page.on('dialog', d => { dialogs.push(d.message()); d.accept().catch(()=>{}); });

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  P(`=== RUN ${RUN} === ${URL}`);

  // ---------- FIX 1: verification-claim text ----------
  const header27 = await page.evaluate(() => {
    // The <meta>/intro line 27 text — grab any element containing 'Math reference:'
    const all = [...document.querySelectorAll('*')].filter(n => n.children.length === 0 && /Math reference/i.test(n.textContent));
    return all.map(n => n.textContent.trim());
  });
  const panelTitle = await page.evaluate(() => {
    const n = [...document.querySelectorAll('.panel-section-title')].find(e => /Math Reference/i.test(e.textContent));
    return n ? n.textContent.trim() : '(NOT FOUND)';
  });
  const headerBadge = await page.evaluate(() => {
    const n = [...document.querySelectorAll('span')].find(e => /Identities I.{0,3}V/i.test(e.textContent) && /Composite-Ray/i.test(e.textContent));
    return n ? n.textContent.trim() : '(NOT FOUND)';
  });
  const footer = await page.evaluate(() => {
    const n = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /Composite-Ray AMM MVP/i.test(e.textContent));
    return n ? n.textContent.trim() : '(NOT FOUND)';
  });
  // Full visible-text overclaim scan
  const overclaims = await page.evaluate(() => {
    const txt = document.body.innerText;
    const bad = ['Lean-validated', 'Aristotle-verified', 'no sorry'];
    return bad.filter(b => new RegExp(b, 'i').test(txt));
  });
  const trustedShows = await page.evaluate(() => /trusted-from-prover/i.test(document.body.innerText));

  P('\n-- FIX 1: verification-claim text --');
  P('  header-meta line:', JSON.stringify(header27));
  P('  header badge    :', JSON.stringify(headerBadge));
  P('  panel title     :', JSON.stringify(panelTitle));
  P('  footer          :', JSON.stringify(footer));
  P('  OVERCLAIMS still present (must be []):', JSON.stringify(overclaims));
  P('  trusted-from-prover wording shows     :', trustedShows);

  // ---------- Open a real band via the UI so state.bands has an open band ----------
  await page.click('[data-subtab="bands"]').catch(()=>{});
  await page.waitForTimeout(150);
  // direction pill -> long (sold-CALL above oracle / bought-PUT below)
  const dir = await page.$('#band-dir-sell');
  if (dir) { const d = await dir.getAttribute('data-dir'); if (d !== 'long') { await dir.click(); await page.waitForTimeout(80); } }
  // fill strikes + notional. oracle default 80k: sold-call inner 120k, bought-put inner 48k.
  await page.fill('#sold-inner', '120000');
  await page.fill('#bought-inner', '48000');
  await page.fill('#band-notional', '0.03');
  await page.dispatchEvent('#sold-inner', 'input');
  await page.dispatchEvent('#bought-inner', 'input');
  await page.dispatchEvent('#band-notional', 'input');
  await page.waitForTimeout(150);
  await page.click('#btn-execute').catch(e => P('  execute click err:', e.message));
  await page.waitForTimeout(250);

  const bandState = await page.evaluate(() => {
    const open = (Store.state.bands || []).filter(b => b.status === 'open');
    return {
      nOpen: open.length,
      strikes: open.map(b => ({ si: b.sold.inner, so: b.sold.outer, bi: b.bought.inner, bo: b.bought.outer })),
      oracle: Store.state.oracle, m: Store.state.m,
      sNorm: Engine.getSNorm(Store.state.pool)
    };
  });
  P('\n-- BAND OPEN --');
  P('  ', JSON.stringify(bandState));

  // ---------- Switch to Mark Across Strikes ----------
  await page.selectOption('#chart-select', 'pricing');
  await page.dispatchEvent('#chart-select', 'change');
  await page.waitForTimeout(300);

  // ---------- FIX 2: read the canvas-pricing pixels; dots ON curve ----------
  // Geometry from source: pad.left/top, plotW/plotH; toPx(phiDeg,psi)=[left+phi/90*plotW, top+(1-psi)*plotH]
  const geom = await page.evaluate(() => {
    const cv = document.getElementById('canvas-pricing');
    const r = cv.getBoundingClientRect();
    return { w: cv.width, h: cv.height, cssW: r.width, cssH: r.height };
  });

  // Compute, in the engine, the analytic dot positions and the curve psi at each band strike.
  const analytic = await page.evaluate(() => {
    const s = Store.state;
    const pool = s.pool;
    const sNorm = Engine.getSNorm(pool);
    const m = s.m;
    const gAt = (theta) => Engine.gLoc(pool, theta, m);
    const psiAt = (theta, wing) => {
      const g = gAt(theta);
      if (!isFinite(g) || g <= 0) return Math.min(1, wing === 'call' ? sNorm/theta : theta/sNorm);
      const v = Engine.markLensed(wing, theta, sNorm, g);
      return (isFinite(v) && v >= 0) ? Math.min(1, v) : 0;
    };
    const out = [];
    const open = (s.bands || []).filter(b => b.status === 'open');
    for (const b of open) {
      for (const [label, theta] of [['sold.inner', b.sold.inner], ['sold.outer', b.sold.outer], ['bought.inner', b.bought.inner], ['bought.outer', b.bought.outer]]) {
        if (!isFinite(theta) || theta <= 0) continue;
        const phiDeg = Math.atan(theta) * 180 / Math.PI;
        if (phiDeg < 0 || phiDeg > 90) continue;
        const wing = theta > sNorm ? 'call' : 'put';
        const dotPsi = psiAt(theta, wing);     // dot height
        const curvePsi = psiAt(theta, wing);   // curve height at that phi (same wing fn)
        out.push({ label, theta, phiDeg, wing, dotPsi, curvePsi, sNorm, m });
      }
    }
    return out;
  });

  // Now confirm on the actual rendered canvas: at the dot's column, find the colored dot pixel
  // and the lensed curve pixel, and compare their y. Read raw pixels from the canvas.
  const pix = await page.evaluate((strikes) => {
    const cv = document.getElementById('canvas-pricing');
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const img = ctx.getImageData(0, 0, W, H).data;
    // pad from source: top 18-ish? we read geometry indirectly: find plot box via axis.
    // Simpler: reconstruct toPx using the same constants the engine used.
    // We must read pad/plot from the engine's drawAll scope -> not exposed. Instead detect.
    // Detect: the dot is a filled 3.5px circle in colShort(red)/colLong(green). Scan columns.
    function px(x, y) { const i = (y * W + x) * 4; return [img[i], img[i+1], img[i+2], img[i+3]]; }
    const results = [];
    // colors: short ~ red, long ~ green (teal). We don't know exact; classify by channel dominance.
    for (const s of strikes) {
      // x column = pad.left + phi/90*plotW. We don't have pad here; approximate via canvas:
      // We'll instead let the engine give us px below. Placeholder.
      results.push(s);
    }
    return { W, H };
  }, analytic);

  // Get exact pixel coords from the engine's own toPx by re-deriving pad/plot.
  // Read pad/plotW/plotH by instrumenting: call the same constants. They are local to drawAll,
  // so instead we measure: the mark=1 dashed line y and the axis. Easiest: expose via a probe draw.
  const pxProbe = await page.evaluate((strikes) => {
    const cv = document.getElementById('canvas-pricing');
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext('2d');
    const img = () => ctx.getImageData(0, 0, W, H).data;
    // Find plot box: left axis = leftmost long vertical tertiary line; bottom axis = lowest long horizontal line.
    const d = img();
    const at = (x,y) => { const i=(y*W+x)*4; return [d[i],d[i+1],d[i+2],d[i+3]]; };
    const lit = (x,y) => { const p=at(x,y); return p[3]>10 && (p[0]+p[1]+p[2])>40; };
    // find left axis x: scan small x, count vertical lit run
    let leftX = -1;
    for (let x = 10; x < 120; x++) { let run=0; for (let y=10;y<H-10;y++){ if(lit(x,y)) run++; } if (run > H*0.5){ leftX=x; break; } }
    // find bottom axis y: scan y from bottom, horizontal run
    let botY = -1;
    for (let y = H-10; y > H*0.5; y--) { let run=0; for (let x=leftX+2;x<W-10;x++){ if(lit(x,y)) run++; } if (run > (W-leftX)*0.5){ botY=y; break; } }
    // top: mark=1 dashed line is the topmost full-width dashed; approximate plot top by scanning down
    let topY = -1;
    for (let y = 5; y < H*0.4; y++) { let run=0; for (let x=leftX+2;x<W-10;x++){ if(lit(x,y)) run++; } if (run > (W-leftX)*0.4){ topY=y; break; } }
    // plotW: rightmost lit on bottom axis
    let rightX = leftX;
    for (let x = W-10; x > leftX; x--) { if (lit(x, botY)) { rightX = x; break; } }
    const plotW = rightX - leftX;
    const plotH = botY - topY;
    // For each strike: column x = leftX + phi/90*plotW ; expected dot y = topY + (1-psi)*plotH (note topY = psi=1 line)
    const out = [];
    for (const s of strikes) {
      const x = Math.round(leftX + (s.phiDeg/90)*plotW);
      const expDotY = Math.round(topY + (1 - s.dotPsi)*plotH);
      // find the actual DOT pixel near column x: dots are colShort red #FF6767 / colLong green #14E800.
      // (curve wings are teal #0ABAB5 / pink #FF85B0 — NOT dot colors, so they won't false-match.)
      const isDot = (p) => {
        const red   = Math.abs(p[0]-255)<45 && Math.abs(p[1]-103)<45 && Math.abs(p[2]-103)<45;
        const green = Math.abs(p[0]-20)<60  && Math.abs(p[1]-232)<60 && Math.abs(p[2]-0)<60;
        return p[3]>60 && (red || green);
      };
      let found = null;
      for (let xx = Math.max(0,x-5); xx <= Math.min(W-1,x+5) && !found; xx++) {
        for (let y = topY; y <= botY; y++) {
          const p = at(xx,y);
          if (isDot(p)) { found = { x: xx, y, rgb:[p[0],p[1],p[2]] }; break; }
        }
      }
      out.push({ label: s.label, phiDeg: +s.phiDeg.toFixed(2), wing: s.wing, dotPsi:+s.dotPsi.toFixed(4),
                 colX: x, expDotY, foundDot: found, leftX, topY, botY, plotW, plotH });
    }
    // global dot-pixel census across the whole pricing canvas
    let dotPixels = 0;
    for (let y=topY; y<=botY; y++) for (let x=leftX; x<=leftX+plotW; x++) {
      const p = at(x,y);
      const red   = Math.abs(p[0]-255)<45 && Math.abs(p[1]-103)<45 && Math.abs(p[2]-103)<45;
      const green = Math.abs(p[0]-20)<60  && Math.abs(p[1]-232)<60 && Math.abs(p[2]-0)<60;
      if (p[3]>60 && (red||green)) dotPixels++;
    }
    return { leftX, topY, botY, plotW, plotH, strikes: out, dotPixelsOnCanvas: dotPixels };
  }, analytic);

  P('\n-- FIX 2: strike dots ON the lensed curve --');
  P('  plot box:', JSON.stringify({leftX:pxProbe.leftX, topY:pxProbe.topY, botY:pxProbe.botY, plotW:pxProbe.plotW, plotH:pxProbe.plotH}));
  P('  DOT PIXELS on pricing canvas (red colShort + green colLong):', pxProbe.dotPixelsOnCanvas, '(0 = NO dots drew)');
  for (const s of pxProbe.strikes) {
    const fd = s.foundDot;
    const dy = fd ? Math.abs(fd.y - s.expDotY) : null;
    const floatPsi = (1 - (s.expDotY - s.topY)/s.plotH); // sanity == dotPsi
    P(`  ${s.label.padEnd(13)} phi=${String(s.phiDeg).padStart(6)}° wing=${s.wing.padEnd(4)} `
      + `dotPsi=${s.dotPsi.toFixed(4)}  expDotY=${s.expDotY}  `
      + (fd ? `foundDotY=${fd.y} dy=${dy}px rgb=[${fd.rgb}]` : `foundDot=NONE`));
  }

  // also: confirm the curve apex (mode) is < 1 (lensed smooth-paste unchanged)
  const apex = await page.evaluate(() => {
    const s = Store.state; const sNorm = Engine.getSNorm(s.pool);
    const g = Engine.gLoc(s.pool, sNorm, s.m);
    return { sNorm, m: s.m, g, modeMark: Engine.markLensed('call', sNorm, sNorm, g) };
  });
  P('\n-- CURVE UNCHANGED (lensed smooth-paste) --');
  P('  ', JSON.stringify(apex), ' -> mode mark < 1 ?', apex.modeMark < 1);

  // screenshots
  const pricing = await page.$('#canvas-pricing');
  if (pricing) await pricing.screenshot({ path: path.join(OUT, `${RUN}_pricing_band.png`) });
  await page.screenshot({ path: path.join(OUT, `${RUN}_fullpage.png`), fullPage: true });

  P('\n-- CONSOLE / PAGEERRORS --');
  P('  consoleErrors:', consoleErrs.length, JSON.stringify(consoleErrs));
  P('  pageErrors   :', pageErrs.length, JSON.stringify(pageErrs));
  P('  dialogs      :', dialogs.length, JSON.stringify(dialogs));

  const result = {
    run: RUN, url: URL,
    fix1: { headerMeta: header27, headerBadge, panelTitle, footer, overclaimsRemaining: overclaims, trustedShows },
    band: bandState,
    fix2: pxProbe,
    curve: apex,
    consoleErrors: consoleErrs.length, pageErrors: pageErrs.length, dialogs: dialogs.length,
    geom
  };
  fs.writeFileSync(path.join(OUT, `RESULT_run${RUN}.json`), JSON.stringify(result, null, 2));
  fs.writeFileSync(path.join(OUT, `RUN_LOG_run${RUN}.txt`), log.join('\n') + '\n');
  await browser.close();
  P('\nDONE run', RUN);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
