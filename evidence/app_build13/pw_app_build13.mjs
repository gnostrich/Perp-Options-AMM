// TESTER live pass — app/index.html build 13 "landing map".
// usage: node pw_app_build13.mjs A|B
import pw from '/tmp/node_modules/playwright/index.js';
const { chromium } = pw;
import fs from 'fs';

const RUN = process.argv[2] || 'A';
const OUT = '/home/user/Perp-Options-AMM/evidence/app_build13';
const SHOT = OUT + '/shots_' + RUN;
fs.mkdirSync(SHOT, { recursive: true });
const R = { run: RUN, phases: {} }, errs = [], cons = [];

const geo = { earn: { cv: 'cv', W: 980, H: 540, L: 56, Rr: 16, T: 16, Bm: 32, HB: 150 },
              transact: { cv: 'cvT', W: 980, H: 510, L: 56, Rr: 16, T: 16, Bm: 30, HB: 150 } };
for (const k in geo) { const g = geo[k]; g.PH = g.H - g.T - g.Bm - g.HB - 28; g.yT = g.T + g.PH + 28; }

(async () => {
  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const pg = await br.newPage({ viewport: { width: 1800, height: 1200 } });
  pg.on('console', m => cons.push(m.type() + ': ' + m.text()));
  pg.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  pg.on('dialog', d => { errs.push('DIALOG: ' + d.message()); d.dismiss(); });
  await pg.goto('file:///home/user/Perp-Options-AMM/app/index.html');
  await pg.waitForTimeout(400);

  // ---------- helpers in page ----------
  await pg.addScriptTag({ content: `
    window.__set = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', {bubbles:true})); return e.value; };
    window.__txt = (id) => { const e = document.getElementById(id); return e ? (e.innerText !== undefined ? e.innerText : e.textContent) : null; };
    window.__px = (cvid, x, y) => { const c = document.getElementById(cvid).getContext('2d'); const d = c.getImageData(x,y,1,1).data; return [d[0],d[1],d[2],d[3]]; };
    window.__region = (cvid, x, y, w, h) => Array.from(document.getElementById(cvid).getContext('2d').getImageData(x,y,w,h).data);
    window.__hash = (cvid) => { const c = document.getElementById(cvid); const d = c.getContext('2d').getImageData(0,0,c.width,c.height).data;
      let h1=0x811c9dc5; for (let i=0;i<d.length;i+=7){ h1 ^= d[i]; h1 = Math.imul(h1, 0x01000193) >>> 0; } return h1.toString(16); };
    window.__crop = (cvid, x, y, w, h, scale) => { const src = document.getElementById(cvid);
      const t = document.createElement('canvas'); t.width = w*scale; t.height = h*scale; const g = t.getContext('2d');
      g.imageSmoothingEnabled = false; g.drawImage(src, x, y, w, h, 0, 0, w*scale, h*scale); return t.toDataURL('image/png'); };
    window.__nonblank = (cvid, x, y, w, h) => { const d = document.getElementById(cvid).getContext('2d').getImageData(x,y,w,h).data;
      let n=0, set=new Set(); for(let i=0;i<d.length;i+=4){ if(d[i+3]>0 && (d[i]|d[i+1]|d[i+2])) n++; set.add(d[i]+','+d[i+1]+','+d[i+2]); } return {n, distinct:set.size, total:(w*h)}; };
  ` });

  const set = (id, v) => pg.evaluate(([i, x]) => window.__set(i, x), [id, v]);
  const txt = (id) => pg.evaluate(i => window.__txt(i), id);
  const hash = (c) => pg.evaluate(i => window.__hash(i), c);
  const rail = () => pg.evaluate(() => ['s-rungs','s-not','s-peak','s-hs','s-prem','s-notd','y-fees','y-bleed','y-base','y-lev','q-fair','q-mine','q-marg','r-gt','r-be','r-bet','r-par','notional','poolLev','lpLev']
     .map(i => i + '=' + (document.getElementById(i) ? document.getElementById(i).innerText : 'NULL')).join(' | '));
  const sig = async (c) => ({ rail: await rail(), canvas: await hash(c) });
  const shot = async (n) => { const p = SHOT + '/' + n + '.png'; await pg.screenshot({ path: p, fullPage: true }); return p; };
  const crop = async (cvid, x, y, w, h, s, name) => { const u = await pg.evaluate(a => window.__crop(...a), [cvid, x, y, w, h, s]);
    const p = SHOT + '/' + name + '.png'; fs.writeFileSync(p, Buffer.from(u.split(',')[1], 'base64')); return p; };
  const view = async (v) => { await pg.evaluate(vv => setView(vv), v); await pg.waitForTimeout(120); };

  // ================= PHASE 1 : NAV =================
  {
    const p = {};
    for (const v of ['earn', 'transact', 'bands', 'portfolio']) {
      if (v === 'bands') await pg.click('#gridTransact .tab[data-t="bands"]');
      else await pg.click(`nav a[data-nav="${v}"]`);
      await pg.waitForTimeout(150);
      const st = await pg.evaluate(() => ({
        VIEW: (typeof VIEW !== 'undefined') ? VIEW : null,
        disp: ['gridEarn','gridTransact','gridBands','gridPortfolio'].map(i => i + ':' + getComputedStyle(document.getElementById(i)).display).join(' '),
        h: document.body.innerText.length,
      }));
      p[v] = { ...st, shot: await shot('P1_' + v) };
    }
    R.phases.P1_nav = p;
  }

  // ================= PHASE 2 : EARN controls =================
  await view('earn');
  {
    const SPECS = [['Sbar',0.05,1.0],['a',0.2,3],['gam',0.3,4],['kap',-0.9,0.9],['lam',0.01,1.0],['fee',0,0.2],['depth',1,80]];
    const p = { params: {} };
    const base = await sig('cv');
    for (const [k, lo, hi] of SPECS) {
      const inp = `[data-k="${k}"]`;
      const before = await pg.evaluate(kk => P[kk], k);
      await pg.evaluate(([kk, v]) => { const e = document.querySelector(`input[type=number][data-k="${kk}"]`); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [k, lo]);
      await pg.waitForTimeout(60); const sLo = await sig('cv');
      await pg.evaluate(([kk, v]) => { const e = document.querySelector(`input[type=number][data-k="${kk}"]`); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [k, hi]);
      await pg.waitForTimeout(60); const sHi = await sig('cv');
      await pg.evaluate(([kk, v]) => { const e = document.querySelector(`input[type=number][data-k="${kk}"]`); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [k, before]);
      await pg.waitForTimeout(60); const sBack = await sig('cv');
      p.params[k] = { lo, hi, railChanged: sLo.rail !== sHi.rail, canvasChanged: sLo.canvas !== sHi.canvas,
        restored: sBack.rail === base.rail && sBack.canvas === base.canvas,
        railLo: sLo.rail.slice(0, 200), railHi: sHi.rail.slice(0, 200) };
    }
    // reset link
    await pg.evaluate(() => { P.Sbar = 0.3; render(); });
    await pg.click('#reset'); await pg.waitForTimeout(80);
    p.reset = { P: await pg.evaluate(() => JSON.stringify(P)), railRestored: (await rail0(pg)) };
    async function rail0(page) { return (await page.evaluate(() => document.getElementById('r-gt').innerText)); }
    // margin
    const m0 = await sig('cv'); await set('margin', 40); await pg.waitForTimeout(60); const m1 = await sig('cv');
    const n40 = await txt('notional'), lev40 = await txt('lpLev');
    await set('margin', 1); await pg.waitForTimeout(60); const m2 = await sig('cv');
    const n1 = await txt('notional'), lev1 = await txt('lpLev');
    await set('margin', 15); await pg.waitForTimeout(60);
    p.margin = { up: m1.rail !== m0.rail, down: m2.rail !== m1.rail, at40: n40, lev40, at1: n1, lev1, at15: await txt('notional') };
    // magnifier
    const g0 = await hash('cv'); await set('mag', 1); await pg.waitForTimeout(60); const g1 = await hash('cv'); const lab1 = await txt('magv');
    await set('mag', 60); await pg.waitForTimeout(60); const g2 = await hash('cv'); const lab2 = await txt('magv');
    await set('mag', 25); await pg.waitForTimeout(60);
    p.mag = { h0: g0, h1: g1, h2: g2, distinct: new Set([g0, g1, g2]).size, lab1, lab2, inlineCaption: await txt('magc') };
    // size box
    const q0 = await hash('cv'); await set('qsz', 40); await pg.waitForTimeout(60); const q1 = await hash('cv');
    const cap40 = await pg.evaluate(() => document.getElementById('hoverbar').innerText);
    await set('qsz', 5); await pg.waitForTimeout(60);
    p.qsz = { changed: q0 !== q1, hoverbar_at40: cap40.replace(/\n/g, ' / ') };
    // vol toggle
    const v0 = await txt('q-mine'); await pg.click('#volbtn'); await pg.waitForTimeout(80);
    const v1 = { mine: await txt('q-mine'), lab: await txt('modelab'), btn: await txt('volbtn'), marg: await txt('q-marg'), verdict: (await txt('verdict')).slice(0, 60) };
    await pg.click('#volbtn'); await pg.waitForTimeout(80);
    p.volToggle = { on_mine: v0, off: v1, back_mine: await txt('q-mine'), roundtrip: v0 === (await txt('q-mine')) };
    // market sliders
    p.mkt = {};
    for (const [k, lo, hi] of [['rv', 0.1, 1.4], ['turn', 0.05, 3], ['Q', 0.5, 40]]) {
      const b = await pg.evaluate(kk => MKT[kk], k);
      await pg.evaluate(([kk, v]) => { const e = document.querySelector(`input[data-m="${kk}"]`); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [k, lo]);
      await pg.waitForTimeout(60);
      const A = { be: await txt('r-be'), bet: await txt('r-bet'), par: await txt('r-par'), base: await txt('y-base'), lev: await txt('y-lev'), qlab: await txt('qlab'), hs: await txt('s-hs') };
      await pg.evaluate(([kk, v]) => { const e = document.querySelector(`input[data-m="${kk}"]`); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [k, hi]);
      await pg.waitForTimeout(60);
      const B = { be: await txt('r-be'), bet: await txt('r-bet'), par: await txt('r-par'), base: await txt('y-base'), lev: await txt('y-lev'), qlab: await txt('qlab'), hs: await txt('s-hs') };
      await pg.evaluate(([kk, v]) => { const e = document.querySelector(`input[data-m="${kk}"]`); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [k, b]);
      await pg.waitForTimeout(60);
      p.mkt[k] = { lo, hi, A, B, changed: JSON.stringify(A) !== JSON.stringify(B) };
    }
    // ladder table
    p.ladderRows = await pg.evaluate(() => Array.from(document.querySelectorAll('#ladder tbody tr')).map(r => r.innerText.replace(/\s+/g, ' ').trim()));
    R.phases.P2_earn = p;
  }

  // ================= PHASE 3 : hover =================
  {
    const p = { samples: [] };
    const box = await pg.locator('#cv').boundingBox();
    for (const frac of [0.08, 0.2, 0.35, 0.5, 0.65, 0.8, 0.95]) {
      await pg.mouse.move(box.x + box.width * frac, box.y + box.height * 0.25);
      await pg.waitForTimeout(70);
      const cells = await pg.evaluate(() => Array.from(document.getElementById('hoverbar').children).map(d => d.innerText.replace(/\n/g, '=')));
      const hk = await pg.evaluate(() => HK);
      const exact = await pg.evaluate(() => { const st = calc(); return { C: st.c.CALL(HK), P: st.c.PUT(HK), parity: (st.c.CALL(HK) - st.c.PUT(HK)) + HK }; });
      p.samples.push({ frac, HK: hk, cells, exactParity: exact.parity, C: exact.C, P: exact.P });
    }
    p.maxAbsParity = Math.max(...p.samples.map(s => Math.abs(s.exactParity)));
    p.r_par = await txt('r-par');
    p.continuous = p.samples.every((s, i) => i === 0 || s.HK > p.samples[i - 1].HK);
    R.phases.P3_hover = p;
  }

  // ================= PHASE 5A : LANDING MAP — EARN =================
  const mapAudit = async (vw) => {
    const G = geo[vw];
    const out = {};
    const fx = G.L, fy = G.yT, fw = G.W - G.L - G.Rr, fh = G.HB;
    out.field = await pg.evaluate(a => window.__nonblank(...a), [G.cv, fx, fy, fw, fh]);
    // clipping: canvas element vs panel
    out.clip = await pg.evaluate(id => { const c = document.getElementById(id); const r = c.getBoundingClientRect(); const pr = c.parentElement.getBoundingClientRect();
      return { cvBottom: r.bottom, panelBottom: pr.bottom, cvH: r.height, clipped: r.bottom > pr.bottom + 1 }; }, G.cv);
    // colour census + hottest cell
    const cen = await pg.evaluate(a => { const [cv, x, y, w, h] = a; const d = document.getElementById(cv).getContext('2d').getImageData(x, y, w, h).data;
      const cnt = {}; for (let i = 0; i < d.length; i += 4) { const k = d[i] + ',' + d[i + 1] + ',' + d[i + 2]; cnt[k] = (cnt[k] || 0) + 1; }
      return Object.entries(cnt).sort((p, q) => q[1] - p[1]).slice(0, 14); }, [G.cv, fx, fy, fw, fh]);
    out.topColours = cen;
    // hottest = rgb(255,103,103) present? where?
    out.hottest = await pg.evaluate(a => { const [cv, x, y, w, h] = a; const d = document.getElementById(cv).getContext('2d').getImageData(x, y, w, h).data;
      let n = 0, minx = 1e9, maxx = -1, miny = 1e9, maxy = -1;
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const o = (j * w + i) * 4;
        if (d[o] === 255 && d[o + 1] === 103 && d[o + 2] === 103) { n++; if (i < minx) minx = i; if (i > maxx) maxx = i; if (j < miny) miny = j; if (j > maxy) maxy = j; } }
      return { n, minx, maxx, miny, maxy }; }, [G.cv, fx, fy, fw, fh]);
    // "no fit" colour #4a1218 = 74,18,24
    out.nofit = await pg.evaluate(a => { const [cv, x, y, w, h] = a; const d = document.getElementById(cv).getContext('2d').getImageData(x, y, w, h).data;
      let n = 0, miny = 1e9, maxy = -1; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const o = (j * w + i) * 4;
        if (d[o] === 74 && d[o + 1] === 18 && d[o + 2] === 24) { n++; if (j < miny) miny = j; if (j > maxy) maxy = j; } }
      return { n, miny, maxy, frac: n / (w * h) }; }, [G.cv, fx, fy, fw, fh]);
    // legend swatches: row yT-9, scan for 9px blocks
    out.legend = await pg.evaluate(a => { const [cv, y, x0, x1] = a; const d = document.getElementById(cv).getContext('2d').getImageData(x0, y, x1 - x0, 1).data;
      const runs = []; let cur = null; for (let i = 0; i < (x1 - x0); i++) { const k = d[i * 4] + ',' + d[i * 4 + 1] + ',' + d[i * 4 + 2];
        if (k === '0,0,0') { cur = null; continue; } if (!cur || cur.c !== k) { cur = { c: k, x0: x0 + i, n: 1 }; runs.push(cur); } else cur.n++; }
      return runs.filter(r => r.n >= 4); }, [G.cv, G.yT - 9, G.L, G.W - G.Rr]);
    // marker DOT: filled 3.4r pure-white disc.  score = # of pure-white px in a 7x7 window
    // (glyph strokes of the caption text score much lower than a filled disc).
    out.marker = await pg.evaluate(a => { const [cv, x, y, w, h] = a; const d = document.getElementById(cv).getContext('2d').getImageData(x, y, w, h).data;
      const W1 = new Uint8Array(w * h);
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const o = (j * w + i) * 4;
        if (d[o] >= 250 && d[o + 1] >= 250 && d[o + 2] >= 250) W1[j * w + i] = 1; }
      const cand = [];
      for (let j = 3; j < h - 3; j++) for (let i = 3; i < w - 3; i++) { let n = 0;
        for (let b = -3; b <= 3; b++) for (let a2 = -3; a2 <= 3; a2++) n += W1[(j + b) * w + i + a2];
        if (n >= 18) cand.push({ i, j, n }); }
      cand.sort((p, q) => q.n - p.n);
      const top = cand.slice(0, 3);
      return { mxp: top.length ? top[0].i : -1, my: top.length ? top[0].j : -1, score: top.length ? top[0].n : 0, top }; }, [G.cv, fx, fy, fw, fh]);
    return out;
  };
  const mapToKQ = (vw, mk, Qmax) => { const G = geo[vw];
    const k = -0.7 + (mk.mxp) / (G.W - G.L - G.Rr) * 1.4;
    const Q = (G.HB - mk.my) / G.HB * Qmax; return { k, Q }; };

  await view('earn');
  {
    const p = {};
    p.audit = await mapAudit('earn');
    p.kq = mapToKQ('earn', p.audit.marker, 224);
    p.legendCrop = await crop('cv', 560, geo.earn.yT - 16, 420, 16, 3, 'P5_earn_legend');
    p.markerCrop = await crop('cv', 56, geo.earn.yT + 100, 500, 50, 3, 'P5_earn_marker');
    p.axisCrop = await crop('cv', 0, geo.earn.yT - 16, 120, 166, 3, 'P5_earn_axis');
    p.bandCrop = await crop('cv', 0, geo.earn.yT - 18, 980, 176, 1, 'P5_earn_band');
    // marker tracking: move strike (hover) and size
    const box = await pg.locator('#cv').boundingBox();
    const track = [];
    for (const [frac, size] of [[0.25, 5], [0.75, 5], [0.75, 60], [0.75, 150], [0.75, 210], [0.75, 240]]) {
      await pg.mouse.move(box.x + box.width * frac, box.y + box.height * 0.25); await pg.waitForTimeout(50);
      await set('qsz', size); await pg.waitForTimeout(80);
      const mk = (await mapAudit('earn')).marker;
      const hk = await pg.evaluate(() => HK);
      track.push({ frac, size, HK: hk, mk, kq: mapToKQ('earn', mk, 224) });
    }
    p.track = track;
    // per-click size delta (step 0.5)
    await set('qsz', 5); await pg.waitForTimeout(60); const mA = (await mapAudit('earn')).marker;
    await pg.focus('#qsz'); await pg.keyboard.press('ArrowUp'); await pg.waitForTimeout(120);
    const mB = (await mapAudit('earn')).marker; const vB = await pg.evaluate(() => document.getElementById('qsz').value);
    p.perClickSize = { before: mA, after: mB, value: vB, movedPx: Math.abs(mB.my - mA.my) };
    await set('qsz', 5); await pg.waitForTimeout(60);
    R.phases.P5_map_earn = p;
  }

  // ================= PHASE 4 : TRANSACT =================
  await view('transact');
  {
    const p = {};
    p.sideBuy0 = await txt('tquote');
    await pg.click('#sideSell'); await pg.waitForTimeout(100);
    p.sell = { quote: (await txt('tquote')).replace(/\n/g, ' | '), fillHdr: await txt('tfl'), rows: await pg.evaluate(() => Array.from(document.querySelectorAll('#tfill tbody tr')).map(r => r.innerText.replace(/\s+/g, ' ').trim())) };
    await pg.click('#sideBuy'); await pg.waitForTimeout(100);
    p.buy = { quote: (await txt('tquote')).replace(/\n/g, ' | '), fillHdr: await txt('tfl'), rows: await pg.evaluate(() => Array.from(document.querySelectorAll('#tfill tbody tr')).map(r => r.innerText.replace(/\s+/g, ' ').trim())) };
    p.sideDiffers = p.sell.quote !== p.buy.quote;
    // strike box -> slider
    await set('tk', -25); await pg.waitForTimeout(80);
    p.syncBoxToSlider = { box: await pg.evaluate(() => document.getElementById('tk').value), slider: await pg.evaluate(() => document.getElementById('tkr').value), best: (await txt('tbest')).replace(/\n/g, ' | ') };
    // slider -> box
    await set('tkr', 42); await pg.waitForTimeout(80);
    p.syncSliderToBox = { box: await pg.evaluate(() => document.getElementById('tk').value), slider: await pg.evaluate(() => document.getElementById('tkr').value), best: (await txt('tbest')).replace(/\n/g, ' | ') };
    // out-of-range typed value
    await set('tk', 200); await pg.waitForTimeout(80);
    p.outOfRange = { box: await pg.evaluate(() => document.getElementById('tk').value), slider: await pg.evaluate(() => document.getElementById('tkr').value), fillWidth: await pg.evaluate(() => document.getElementById('tkf').style.width) };
    await set('tk', 12); await set('tkr', 12); await pg.waitForTimeout(80);
    // size
    const z0 = await txt('tfl'); await set('tsz', 45); await pg.waitForTimeout(80);
    p.size = { at3: z0, at45: await txt('tfl'), rows45: await pg.evaluate(() => Array.from(document.querySelectorAll('#tfill tbody tr')).map(r => r.innerText.replace(/\s+/g, ' ').trim())) };
    await set('tsz', 3); await pg.waitForTimeout(80);
    // maker divergence dial
    const dial = [];
    for (const D of [0, 0.01, 0.05, 0.15, 0.3, 0.5, 0.75, 1]) {
      await set('arbr', D); await pg.waitForTimeout(90);
      const t = (await txt('tbest'));
      dial.push({ D, label: await txt('arbv'), fillW: await pg.evaluate(() => document.getElementById('arbf').style.width),
        state: (t.match(/book state\s*\n?\s*(\S[\S ]*)/) || [])[1], arb: (t.match(/arb available\s*\n?\s*(\S+[^\n]*)/) || [])[1],
        best: t.replace(/\n/g, ' | '), imp: (await txt('timp')).replace(/\n/g, ' | '), canvas: await hash('cvT') });
    }
    p.dial = dial;
    // per-click (keyboard step) on the dial
    await set('arbr', 0.15); await pg.waitForTimeout(80);
    const pcA = { arbv: await txt('arbv'), best: (await txt('tbest')).replace(/\n/g, ' | '), canvas: await hash('cvT') };
    await pg.focus('#arbr'); await pg.keyboard.press('ArrowRight'); await pg.waitForTimeout(120);
    const pcB = { arbv: await txt('arbv'), best: (await txt('tbest')).replace(/\n/g, ' | '), canvas: await hash('cvT') };
    await pg.keyboard.press('ArrowRight'); await pg.waitForTimeout(120);
    const pcC = { arbv: await txt('arbv'), best: (await txt('tbest')).replace(/\n/g, ' | '), canvas: await hash('cvT') };
    p.perClickDial = { A: pcA, B: pcB, C: pcC, labelMoved: pcA.arbv !== pcB.arbv, numbersMoved: pcA.best !== pcB.best, canvasMoved: pcA.canvas !== pcB.canvas };
    await set('arbr', 0.15); await pg.waitForTimeout(100);
    R.phases.P4_transact = p;
  }

  // ================= PHASE 5B : LANDING MAP — TRANSACT =================
  {
    const p = {};
    p.audit = await mapAudit('transact');
    p.kq = mapToKQ('transact', p.audit.marker, 224);
    p.legendCrop = await crop('cvT', 560, geo.transact.yT - 16, 420, 16, 3, 'P5_transact_legend');
    p.markerCrop = await crop('cvT', 56, geo.transact.yT + 100, 500, 50, 3, 'P5_transact_marker');
    p.axisCrop = await crop('cvT', 0, geo.transact.yT - 16, 120, 166, 3, 'P5_transact_axis');
    p.bandCrop = await crop('cvT', 0, geo.transact.yT - 18, 980, 176, 1, 'P5_transact_band');
    const track = [];
    for (const [k, size] of [[12, 3], [-40, 3], [40, 3], [40, 60], [40, 150], [40, 210], [40, 240]]) {
      await set('tk', k); await set('tkr', k); await set('tsz', size); await pg.waitForTimeout(110);
      const mk = (await mapAudit('transact')).marker;
      track.push({ k, size, mk, kq: mapToKQ('transact', mk, 224) });
    }
    p.track = track;
    await set('tk', 12); await set('tkr', 12); await set('tsz', 3); await pg.waitForTimeout(100);
    // marker caption re-derivation: read the in-page landed(k,Q) for a set of inputs
    const derive = await pg.evaluate(() => {
      const st = calc(), s = makerCurves(), B = aggBook(s, st.book.map(m => m.h)), out = [];
      for (const [k, Q] of [[0.12, 3], [0.12, 60], [0.40, 150], [-0.40, 150], [0.12, 210], [0.12, 240]]) {
        const Ld = ladderAt(s, k, MKT.pool), px = landedFrom(Ld, Q);
        out.push({ k, Q, best: Ld.best, landed: px, bps: px === null ? null : (px / Ld.best - 1) * 1e4, total: Ld.total });
      } return out; });
    p.derive = derive;
    // field max (what the legend should say)
    p.fieldMax = await pg.evaluate(() => { const st = calc(), s = makerCurves(); aggBook(s, st.book.map(m => m.h));
      const tot = s.reduce((a, m) => a + m.share * MKT.pool, 0), Qmax = Math.max(1.12 * tot, 1); let mx = 0;
      for (let i = 0; i < 120; i++) { const k = -0.7 + 1.4 * (i + 0.5) / 120, Ld = ladderAt(s, k, MKT.pool);
        for (let j = 0; j < 44; j++) { const px = landedFrom(Ld, Qmax * (j + 0.5) / 44); if (px !== null) { const b = (px / Ld.best - 1) * 1e4; if (b > mx) mx = b; } } }
      return { mx, Qmax, tot }; });
    R.phases.P5_map_transact = p;
  }

  // ================= PHASE 6 : near-zero field stress =================
  await view('earn');
  {
    const p = {};
    await pg.evaluate(() => { MKT.rv = 0.1; MKT.turn = 3; render(); }); await pg.waitForTimeout(150);
    p.state = { rv: 0.1, turn: 3, hs: await txt('s-hs'), be: await txt('r-be') };
    p.fieldMax = await pg.evaluate(() => { const st = calc(); const mkrs = st.book.map(m => ({ c: st.c, h: m.h, share: m.share }));
      const tot = mkrs.reduce((a, m) => a + m.share * MKT.pool, 0), Qmax = Math.max(1.12 * tot, 1); let mx = 0;
      for (let i = 0; i < 120; i++) { const Ld = ladderAt(mkrs, -0.7 + 1.4 * (i + 0.5) / 120, MKT.pool);
        for (let j = 0; j < 44; j++) { const px = landedFrom(Ld, Qmax * (j + 0.5) / 44); if (px !== null) { const b = (px / Ld.best - 1) * 1e4; if (b > mx) mx = b; } } } return mx; });
    p.audit = await mapAudit('earn');
    p.legendCrop = await crop('cv', 560, geo.earn.yT - 16, 420, 16, 3, 'P6_nearzero_legend');
    p.bandCrop = await crop('cv', 0, geo.earn.yT - 18, 980, 176, 1, 'P6_nearzero_band');
    p.shot = await shot('P6_nearzero_full');
    await pg.evaluate(() => { MKT.rv = 0.6; MKT.turn = 0.3; render(); }); await pg.waitForTimeout(120);
    R.phases.P6_nearzero = p;
  }

  // ================= PHASE 7 : BANDS + PORTFOLIO =================
  await view('bands');
  {
    const p = {};
    const rd = async () => ({ out: (await txt('bout')).replace(/\n/g, ' | '), state: (await txt('bstate')).replace(/\n/g, ' | '), cv: await hash('cvB') });
    p.base = await rd();
    for (const [id, lo, hi] of [['bs', 2, 55], ['bb', -55, -2], ['bsz', 0.5, 40]]) {
      await set(id, lo); await pg.waitForTimeout(90); const A = await rd();
      await set(id, hi); await pg.waitForTimeout(90); const B = await rd();
      p[id] = { lo, hi, A, B, changed: JSON.stringify(A) !== JSON.stringify(B) };
    }
    await set('bs', 10); await set('bb', -10); await set('bsz', 5); await pg.waitForTimeout(100);
    p.restored = await rd();
    p.canvasNonblank = await pg.evaluate(() => window.__nonblank('cvB', 0, 0, 980, 330));
    p.shot = await shot('P7_bands');
    R.phases.P7_bands = p;
  }
  await view('portfolio');
  {
    const p = {};
    const rd = async () => ({ pos: await pg.evaluate(() => Array.from(document.querySelectorAll('#ppos tbody tr')).map(r => r.innerText.replace(/\s+/g, ' ').trim())),
      acct: (await txt('pacct')).replace(/\n/g, ' | '), carve: (await txt('pcarve')).replace(/\n/g, ' | '),
      hedge: (await txt('phedge')).replace(/\n/g, ' | '), liq: (await txt('pliq')).replace(/\n/g, ' | ') });
    p.base = await rd();
    // portfolio has no own controls: drive it via the shared curve params
    await pg.evaluate(() => { P.gam = 3.5; render(); }); await pg.waitForTimeout(90); p.gamHigh = await rd();
    await pg.evaluate(() => { P.gam = 0.4; render(); }); await pg.waitForTimeout(90); p.gamLow = await rd();
    await pg.evaluate(() => { P.gam = 1.8413; render(); }); await pg.waitForTimeout(90); p.restored = await rd();
    p.responds = JSON.stringify(p.gamHigh) !== JSON.stringify(p.gamLow);
    p.shot = await shot('P7_portfolio');
    R.phases.P7_portfolio = p;
  }

  // ================= PHASE 8 : targeted defect probes =================
  {
    const p = {};
    // 8a: fee slider under VOL-INDEXED OFF (it is inert while ON)
    await view('earn');
    await pg.evaluate(() => { volIndexed = false; render(); }); await pg.waitForTimeout(80);
    const setK = async (k, v) => pg.evaluate(([kk, vv]) => { const e = document.querySelector(`input[type=number][data-k="${kk}"]`); e.value = vv; e.dispatchEvent(new Event('input', { bubbles: true })); }, [k, v]);
    await setK('fee', 0.005); await pg.waitForTimeout(70); const fA = { hs: await txt('s-hs'), mine: await txt('q-mine'), bet: await txt('r-bet') };
    await setK('fee', 0.2); await pg.waitForTimeout(70); const fB = { hs: await txt('s-hs'), mine: await txt('q-mine'), bet: await txt('r-bet') };
    await setK('fee', 0); await pg.waitForTimeout(70); const fZ = { hs: await txt('s-hs'), mine: await txt('q-mine'), bet: await txt('r-bet') };
    await setK('fee', 0.02); await pg.evaluate(() => { volIndexed = true; render(); }); await pg.waitForTimeout(80);
    p.feeVolOff = { at0p005: fA, at0p2: fB, at0: fZ, movesWhenOff: JSON.stringify(fA) !== JSON.stringify(fB) };
    // 8b: strike-slider fill bar tracking
    await view('transact');
    const fills = [];
    for (const v of [-60, -30, 0, 30, 60, 12]) { await set('tkr', v); await pg.waitForTimeout(70);
      fills.push({ v, tkf: await pg.evaluate(() => document.getElementById('tkf').style.width), box: await pg.evaluate(() => document.getElementById('tk').value) }); }
    p.strikeFillBar = { fills, distinctWidths: new Set(fills.map(x => x.tkf)).size };
    // 8c: "improvement vs single maker" over strikes + divergence
    const imps = [];
    for (const D of [0, 0.3, 1]) { await set('arbr', D);
      for (const k of [-40, 0, 25]) { await set('tk', k); await set('tkr', k); await pg.waitForTimeout(80);
        imps.push({ D, k, timp: (await txt('timp')).replace(/\n/g, ' | ') }); } }
    await set('arbr', 0.15); await set('tk', 12); await set('tkr', 12); await pg.waitForTimeout(80);
    p.improvement = imps;
    // 8d: marker caption vs independent value, at a NON-trivial and a NO-FIT point
    const caps = [];
    for (const [k, Q] of [[40, 150], [-40, 150], [12, 60], [12, 240]]) {
      await set('tk', k); await set('tkr', k); await set('tsz', Q); await pg.waitForTimeout(140);
      const a = await mapAudit('transact');
      const inpage = await pg.evaluate(([kk, QQ]) => { const st = calc(), s = makerCurves(); aggBook(s, st.book.map(m => m.h));
        const Ld = ladderAt(s, kk / 100, MKT.pool), px = landedFrom(Ld, QQ);
        return { best: Ld.best, landed: px, bps: px === null ? null : (px / Ld.best - 1) * 1e4, total: Ld.total }; }, [k, Q]);
      const nm = 'P8_cap_k' + k + '_Q' + Q;
      const G = geo.transact;
      const cy = a.marker.my < 0 ? 60 : Math.max(0, Math.min(G.HB - 22, a.marker.my - 14));
      caps.push({ k, Q, inpage, marker: a.marker, crop: await crop('cvT', G.L, G.yT + cy, 460, 22, 3, nm) });
    }
    p.captions = caps;
    await set('tk', 12); await set('tkr', 12); await set('tsz', 3); await pg.waitForTimeout(100);
    // 8e: per-click on the size boxes (true keyboard step)
    const pc = {};
    for (const [vw, id, cvid] of [['transact', 'tsz', 'cvT'], ['earn', 'qsz', 'cv']]) {
      await view(vw); await set(id, vw === 'earn' ? 5 : 3); await pg.waitForTimeout(90);
      const a0 = (await mapAudit(vw)).marker;
      await pg.focus('#' + id); await pg.keyboard.press('ArrowUp'); await pg.waitForTimeout(140);
      const a1 = (await mapAudit(vw)).marker, v1 = await pg.evaluate(i => document.getElementById(i).value, id);
      await pg.keyboard.press('ArrowUp'); await pg.waitForTimeout(140);
      const a2 = (await mapAudit(vw)).marker, v2 = await pg.evaluate(i => document.getElementById(i).value, id);
      pc[id] = { start: a0, afterOneClick: a1, v1, afterTwoClicks: a2, v2, pxMoved1: a1.my - a0.my, pxMoved2: a2.my - a0.my };
    }
    p.perClickSizeBoxes = pc;
    // 8f: Earn map strike-independence, measured on the PIXELS
    await view('earn');
    p.earnRowUniformity = await pg.evaluate(a => { const [x, y, w, h] = a; const d = document.getElementById('cv').getContext('2d').getImageData(x, y, w, h).data;
      const rows = []; for (const j of [30, 60, 90, 120]) { const set2 = new Set();
        for (let i = 20; i < w - 20; i++) { const o = (j * w + i) * 4; set2.add(d[o] + ',' + d[o + 1] + ',' + d[o + 2]); }
        rows.push({ row: j, distinctColoursAcrossRow: set2.size, sample: Array.from(set2).slice(0, 4) }); } return rows; },
      [geo.earn.L, geo.earn.yT, geo.earn.W - geo.earn.L - geo.earn.Rr, geo.earn.HB]);
    R.phases.P8_probes = p;
  }

  R.console = cons; R.pageerrors = errs;
  R.md5 = 'see file';
  await br.close();
  fs.writeFileSync(OUT + '/RESULT_run' + RUN + '.json', JSON.stringify(R, null, 1));
  console.log('run', RUN, 'pageerrors', errs.length, 'console', cons.length);
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(1); });
