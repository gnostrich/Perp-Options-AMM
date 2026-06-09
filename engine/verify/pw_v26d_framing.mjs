// READ-ONLY explainer screenshots: why the live GH pool curve LOOKS flat.
// Extracts the page's OWN live-curve + anchor points and re-plots them on
// fresh canvases at chosen frames. No engine edits, no git.
import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
import path from 'path';

const BUILD = '/home/user/Perp-Options-AMM/engine/builds/temporal_mvp_v26d_volknob.html';
const OUT   = '/home/user/Perp-Options-AMM/evidence/v26d_curve_framing';

// Extracts livePts / anchorPts / frame from the page's live engine, exactly
// reproducing curveTrace (sweep arbitrageToOracle over mp0*e^(-6..6)) and
// curveTraceExplicit (w=1/2 anchor, depth = Engine.getDepth(pool)).
// NB: the UI top-level `snapshot` const is NOT bare-reachable in page.evaluate,
// so we rebuild the snap from the live pool + Engine.* (getDepth carries the
// w=1/2 reference scale; ...p carries the GH scalars arbitrageToOracle needs).
const EXTRACT = `(() => {
  const st = Store.state;
  const p = st.pool;
  const depth = Engine.getDepth(p);
  const snap = Object.assign({}, p, { w: Engine.getW(p), depth: depth, sNorm: Engine.getSNorm(p) });
  const mp0 = Engine.getMP_raw(snap);
  const N = 400;
  // live curve: on-curve points via arbitrageToOracle (GH shape preserved)
  const live = [];
  for (let i = 0; i <= N; i++) {
    const o = mp0 * Math.exp(-6 + 12 * i / N);
    const s = Engine.arbitrageToOracle(snap, o);
    if (s && s.x > 0 && s.y > 0) live.push([s.x, s.y]);
  }
  // anchor (w=1/2 reference): x = depth * m^(-1/2), y = m*x
  const modeSlope = snap.beta / snap.alpha;
  const anchor = [];
  const logRange = 6;
  for (let i = 0; i <= N; i++) {
    const u = -logRange + 2*logRange*i/N;
    const m = modeSlope * Math.exp(u);
    const x = depth * Math.pow(m, -0.5);
    const y = m * x;
    if (isFinite(x) && isFinite(y) && x > 0 && y > 0) anchor.push([x, y]);
  }
  const eqS = Engine.arbitrageToOracle(snap, st.oracle);
  const eq = eqS ? [eqS.x, eqS.y] : [snap.x, snap.y];
  return { live, anchor, frame: { xMax: eq[0]*3, yMax: eq[1]*3 }, eq, mp0,
           ghAh: snap.ghAh, oracle: st.oracle, poolX: p.x, poolY: p.y };
})()`;

function ranges(pts) {
  let xmin=1/0,xmax=-1/0,ymin=1/0,ymax=-1/0;
  for (const [x,y] of pts){ if(x<xmin)xmin=x; if(x>xmax)xmax=x; if(y<ymin)ymin=y; if(y>ymax)ymax=y; }
  return {xmin,xmax,ymin,ymax};
}

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + BUILD, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // ---- 1. as_is.png : the live Pool Curve chart exactly as it renders ----
  await page.selectOption('#chart-select', 'curve').catch(()=>{});
  await page.waitForTimeout(400);
  const curveCanvas = await page.$('#canvas-curve');
  await curveCanvas.screenshot({ path: path.join(OUT, 'as_is_canvas.png') });
  await page.screenshot({ path: path.join(OUT, 'as_is.png'), clip: { x: 0, y: 0, width: 1100, height: 720 } });

  // ---- extract default (sigma 0.129) ----
  const base = await page.evaluate(EXTRACT);
  console.log('BASE ghAh=%s oracle=%s mp0=%s eq=%j', base.ghAh, base.oracle, base.mp0, base.eq);
  console.log('  live  ranges %j', ranges(base.live));
  console.log('  anchor ranges %j', ranges(base.anchor));
  console.log('  frame %j', base.frame);

  // ---- drive sigma to two vols for the deform plot ----
  async function setSigma(v) {
    await page.fill('#vk-sigma', String(v));
    await page.dispatchEvent('#vk-sigma', 'input');
    await page.dispatchEvent('#vk-sigma', 'change');
    await page.waitForTimeout(300);
    return page.evaluate(EXTRACT);
  }
  // pick two clearly-distinct vols; report whatever gamma the engine lands on.
  const loVol = await setSigma(0.20);  // higher vol -> lower gamma (flatter)
  console.log('sigma0.20 ghAh=%s live=%j', loVol.ghAh, ranges(loVol.live));
  const hiVol = await setSigma(0.10);  // lower vol -> higher gamma (steeper)
  console.log('sigma0.10 ghAh=%s live=%j', hiVol.ghAh, ranges(hiVol.live));
  await setSigma(0.129); // restore default

  // ---- helper: paint arbitrary point-sets in a detached page canvas ----
  const RENDER = async (spec) => page.evaluate((spec) => {
    const cv = document.createElement('canvas');
    cv.width = spec.W; cv.height = spec.H;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#11141a'; ctx.fillRect(0,0,spec.W,spec.H);
    function panel(pn) {
      const pad = { t: 56, r: 24, b: 56, l: 90 };
      const plotW = pn.pw - pad.l - pad.r, plotH = spec.H - pad.t - pad.b;
      const ox = pn.px + pad.l, oy = pad.t;
      const X = x => ox + (x - pn.xMin) / (pn.xMax - pn.xMin) * plotW;
      const Y = y => oy + plotH - (y - pn.yMin) / (pn.yMax - pn.yMin) * plotH;
      ctx.strokeStyle = '#3a3f48'; ctx.lineWidth = 1; ctx.strokeRect(ox, oy, plotW, plotH);
      ctx.fillStyle = '#9B9FA3'; ctx.font = '13px sans-serif';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (let g=0; g<=4; g++){
        const yy = oy + plotH*g/4;
        const yv = pn.yMax - (pn.yMax-pn.yMin)*g/4;
        ctx.strokeStyle = '#23272e'; ctx.beginPath(); ctx.moveTo(ox,yy); ctx.lineTo(ox+plotW,yy); ctx.stroke();
        ctx.fillStyle = '#9B9FA3'; ctx.fillText('$'+(yv/1000).toFixed(0)+'k', ox-8, yy);
      }
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (let g=0; g<=4; g++){
        const xx = ox + plotW*g/4;
        const xv = pn.xMin + (pn.xMax-pn.xMin)*g/4;
        ctx.fillText(xv.toFixed(xv>=100?0:1), xx, oy+plotH+8);
      }
      ctx.fillText('BTC reserve (x)', ox+plotW/2, oy+plotH+30);
      function drawPts(pts, color, w, dash) {
        ctx.strokeStyle = color; ctx.lineWidth = w; ctx.setLineDash(dash||[]);
        ctx.beginPath(); let started=false;
        for (const [x,y] of pts){
          const sx=X(x), sy=Y(y);
          if (sx<ox-2||sx>ox+plotW+2||sy<oy-2||sy>oy+plotH+2){ started=false; continue; }
          if(!started){ ctx.moveTo(sx,sy); started=true; } else ctx.lineTo(sx,sy);
        }
        ctx.stroke(); ctx.setLineDash([]);
      }
      for (const layer of pn.layers) drawPts(layer.pts, layer.color, layer.w, layer.dash);
      if (pn.eq){ const ex=X(pn.eq[0]), ey=Y(pn.eq[1]);
        if(ex>=ox&&ex<=ox+plotW&&ey>=oy&&ey<=oy+plotH){
          ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(ex,ey,5,0,7); ctx.fill();
          ctx.strokeStyle='#000'; ctx.lineWidth=1; ctx.stroke();
          ctx.fillStyle='#fff'; ctx.font='12px sans-serif'; ctx.textAlign='left'; ctx.textBaseline='bottom';
          ctx.fillText(' equilibrium', ex+6, ey); } }
      ctx.fillStyle = '#E4E4E4'; ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(pn.title, ox, oy-32);
      ctx.fillStyle = '#9B9FA3'; ctx.font = '12px sans-serif';
      ctx.fillText(pn.sub, ox, oy-14);
    }
    for (const pn of spec.panels) panel(pn);
    if (spec.legend){
      ctx.font='13px sans-serif'; ctx.textBaseline='middle'; ctx.textAlign='left';
      let maxw = 0;
      for (const it of spec.legend) maxw = Math.max(maxw, ctx.measureText(it.label).width);
      const bw = maxw + 64, bh = spec.legend.length*22 + 14;
      const bx = spec.W - bw - 34, by = spec.H - bh - 64;
      ctx.fillStyle='rgba(10,12,16,0.82)'; ctx.fillRect(bx,by,bw,bh);
      ctx.strokeStyle='#3a3f48'; ctx.lineWidth=1; ctx.strokeRect(bx,by,bw,bh);
      let lx = bx + 12, ly = by + 18;
      for (const it of spec.legend){
        ctx.strokeStyle=it.color; ctx.lineWidth=it.w; ctx.setLineDash(it.dash||[]);
        ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(lx+34,ly); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle='#E4E4E4'; ctx.textAlign='left'; ctx.fillText(it.label, lx+42, ly);
        ly += 22;
      }
    }
    return cv.toDataURL('image/png');
  }, spec);

  const fs = await import('fs');
  const save = (name, dataURL) =>
    fs.writeFileSync(path.join(OUT, name), Buffer.from(dataURL.split(',')[1],'base64'));

  const TEAL='#0ABAB5', GREY='#9B9FA3', PINK='#FF85B0';

  // ---- 2. same_data_two_frames.png ----
  {
    const W=1500,H=620;
    const lr = ranges(base.live);
    const fit = { xMin: 0, xMax: lr.xmax*1.04, yMin: lr.ymin*0.96, yMax: lr.ymax*1.02 };
    const dataURL = await RENDER({ W,H,
      legend: [
        {label:'live GH pool curve', color:TEAL, w:2.5},
        {label:'grey w=1/2 anchor curve', color:GREY, w:1.5, dash:[5,4]}
      ],
      panels: [
        { px:0, pw:750, xMin:0, xMax:base.frame.xMax, yMin:0, yMax:base.frame.yMax, eq:base.eq,
          title:'(a) CURRENT chart frame  [x:0–'+base.frame.xMax.toFixed(0)+' BTC, y:0–$'+(base.frame.yMax/1e6).toFixed(1)+'M]',
          sub:'frame = eq×3 = ('+base.eq[0].toFixed(0)+' BTC, $'+(base.eq[1]/1000).toFixed(0)+'k)×3 — GH curve squished into bottom-left; the bend is off the right edge',
          layers:[ {pts:base.anchor,color:GREY,w:1.5,dash:[5,4]}, {pts:base.live,color:TEAL,w:2.5} ] },
        { px:750, pw:750, ...fit, eq:base.eq,
          title:'(b) AUTO-FIT to the live curve’s real range',
          sub:'x:0–'+fit.xMax.toFixed(0)+' BTC, y:$'+(fit.yMin/1000).toFixed(0)+'k–$'+(fit.yMax/1000).toFixed(0)+'k — SAME data: a genuine bending GH curve',
          layers:[ {pts:base.live,color:TEAL,w:2.5} ] }
      ]
    });
    save('same_data_two_frames.png', dataURL);
  }

  // ---- 3. visible_window_zoom.png ----
  {
    const xWin = 30;
    const inWin = base.live.filter(([x])=>x>=0 && x<=xWin);
    const yw = ranges(inWin);
    const pad = (yw.ymax-yw.ymin)*0.15;
    const dataURL = await RENDER({ W:900,H:600,
      legend:[{label:'live GH pool curve (x≤30 BTC)',color:TEAL,w:3}],
      panels:[ { px:0, pw:900, xMin:0, xMax:xWin, yMin: yw.ymin-pad, yMax: yw.ymax+pad, eq: base.eq,
        title:'Visible window x∈[0,30 BTC], y AUTO-FIT to ~$'+(yw.ymin/1000).toFixed(0)+'k–$'+(yw.ymax/1000).toFixed(0)+'k',
        sub:'across the on-screen BTC range the $ only moves ~$'+((yw.ymax-yw.ymin)/1000).toFixed(0)+'k — a gentle bend, NOT a flat line',
        layers:[ {pts:inWin,color:TEAL,w:3} ] } ]
    });
    save('visible_window_zoom.png', dataURL);
    console.log('VISIBLE WINDOW x<=30: y %j span $%sk', yw, ((yw.ymax-yw.ymin)/1000).toFixed(1));
  }

  // ---- 4. deforms_with_vol.png ----
  {
    // clip each curve to a sensible shared window so the warp is legible
    const xWin = 60;
    const lo = loVol.live.filter(([x])=>x<=xWin), hi = hiVol.live.filter(([x])=>x<=xWin);
    const a = ranges([...lo, ...hi]);
    const dataURL = await RENDER({ W:900,H:600,
      legend:[
        {label:'σ=0.20 → γ≈'+loVol.ghAh.toFixed(2)+' (higher vol, flatter)',color:PINK,w:2.5},
        {label:'σ=0.10 → γ≈'+hiVol.ghAh.toFixed(2)+' (lower vol, steeper)',color:TEAL,w:2.5}
      ],
      panels:[ { px:0, pw:900, xMin:0, xMax:xWin, yMin: a.ymin*0.97, yMax: a.ymax*1.02,
        title:'Same auto-fit axes (x≤60 BTC): the live curve RESHAPES with vol σ',
        sub:'σ→γ via Merton; higher vol → lower γ → flatter convexity. The curve warps — it is genuinely vol-dependent',
        layers:[ {pts:lo,color:PINK,w:2.5}, {pts:hi,color:TEAL,w:2.5} ] } ]
    });
    save('deforms_with_vol.png', dataURL);
  }

  console.log('PAGEERRORS:', errs.length, errs.slice(0,3));
  console.log('JSON_RANGES', JSON.stringify({
    base_live: ranges(base.live), base_anchor: ranges(base.anchor),
    frame: base.frame, eq: base.eq, ghAh: base.ghAh, oracle: base.oracle,
    loVol_ghAh: loVol.ghAh, loVol_live: ranges(loVol.live),
    hiVol_ghAh: hiVol.ghAh, hiVol_live: ranges(hiVol.live)
  }));
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
