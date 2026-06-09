from pathlib import Path
import hashlib

F = Path("/tmp/v26d_work.html")
txt = F.read_text()
lines = txt.splitlines(keepends=True)

def lmd5(s, n):
    return hashlib.md5(s.splitlines(keepends=True)[n-1].encode()).hexdigest()

B74, B1060 = lmd5(txt, 74), lmd5(txt, 1060)
assert B74 == "ab663f5c26f2a461c5b0ef1421d0ad74", B74
assert B1060 == "c505b08ad0e4c6b0fb9e64e9679fe291", B1060

# ─────────────────────────────────────────────────────────────────────────
# EDIT 1 — thread delta as a 5th param into ghCalibrate (line 1623-1624).
# Default 0.08 keeps every existing caller byte-identical. Guard delta>0
# (loud NaN otherwise via downstream _ghK1, but we clamp at the UI layer).
# ─────────────────────────────────────────────────────────────────────────
old1 = ''.join(lines[1622:1624])   # lines 1623-1624 (0-based 1622:1624)
assert old1 == (
"  function ghCalibrate(X0, Y0, mp0, gamma){\n"
"    const ah=gamma+1, bh=ah-gamma, delta=0.08;\n"
), repr(old1)
new1 = (
"  function ghCalibrate(X0, Y0, mp0, gamma, delta){\n"
"    if (!(delta > 0)) delta = 0.08;   // default ATM smoothing; threaded so the vol-knob unlocked mode can vary it (guard delta>0)\n"
"    const ah=gamma+1, bh=ah-gamma;\n"
)
assert txt.count(old1) == 1
txt = txt.replace(old1, new1, 1)

# ─────────────────────────────────────────────────────────────────────────
# EDIT 2 — Store: keep GH_GAMMA as the OPEN default (unchanged init), add a
# live `setShape` re-warp mutator + export it. Re-calibrate at the CURRENT
# operating point (X=x-alpha, Y=y-beta, mp0 = current marginal price) with
# the new gamma/delta, reassign ONLY the gh* scalars, keep x,y,alpha,beta,
# oracle and all positions. Baselines re-derive (k depends on shape).
# ─────────────────────────────────────────────────────────────────────────
old2 = ''.join(lines[2255:2260])   # lines 2256-2260: blank, comment x2, GH_GAMMA, initialState{
assert old2 == (
"\n"
"  // Convexity exponent of the American / power leg (γ>1). Drives the GH curve\n"
"  // calibration at open. Configurable; gates verified for γ ∈ {1.5,2,3,4}.\n"
"  const GH_GAMMA = 2.0;\n"
"  function initialState() {\n"
), repr(old2)
new2 = (
"\n"
"  // Convexity exponent of the American / power leg (γ>1). Drives the GH curve\n"
"  // calibration at open. Configurable; gates verified for γ ∈ {1.5,2,3,4}.\n"
"  // The vol-knob (setShape) re-warps this LIVE at runtime; this stays the open default.\n"
"  const GH_GAMMA = 2.0;\n"
"  function initialState() {\n"
)
assert txt.count(old2) == 1
txt = txt.replace(old2, new2, 1)

# Insert setShape after setOracle (anchor on the end of setOracle).
old3 = (
"    state.perpMark = newOracle;   // carved perp tracks the oracle (external perp DEX feed)\n"
"    log('rebase', `Oracle → $${newOracle.toFixed(0)} (r=${r.toFixed(4)}); x→r·x, α→r·α, β invariant.`);\n"
"  }\n"
)
assert txt.count(old3) == 1
new3 = old3 + (
"\n"
"  // ── Vol-knob: re-warp the GH curve IN PLACE under open positions ──────\n"
"  // Re-calibrate the pool's GH scalars at the CURRENT operating point with a\n"
"  // new convexity γ (and ATM-smoothing δ if the off-theory shape is unlocked).\n"
"  // Operating point = current shifted reserves (X=x−α, Y=y−β) and current\n"
"  // marginal price mp0 = getMP_raw(pool), so the live spot/mark is preserved\n"
"  // and ONLY the curvature changes. x,y,α,β,oracle and all bands/perps are\n"
"  // KEPT — open positions persist and re-price on the new shape. Baseline_k\n"
"  // re-derives (depth is shape-dependent); α/β baselines are frame anchors\n"
"  // and stay. γ>1 is a HARD floor (locked curve family); δ>0 (GH-table guard).\n"
"  // Returns the realised γ/δ (after clamps) for the read-out, or null if the\n"
"  // re-calibration produced a non-finite scalar (loud — caller keeps old shape).\n"
"  function setShape(gamma, delta) {\n"
"    const p = state.pool;\n"
"    if (!(p.x > 0) || !(p.y > 0)) return null;\n"
"    let g = gamma;\n"
"    if (!(g > 1)) g = 1.0001;            // HARD floor: γ>1 (locked GH/Merton family)\n"
"    let d = (delta > 0) ? delta : 0.08;  // δ>0 guard for the GH-table build\n"
"    const X0 = p.x - p.alpha, Y0 = p.y - p.beta;\n"
"    const mp0 = Engine.getMP_raw(p);     // current marginal price (carry coordinate)\n"
"    if (!(X0 > 0) || !(Y0 > 0) || !(mp0 > 0)) return null;\n"
"    const cal = Engine.ghCalibrate(X0, Y0, mp0, g, d);\n"
"    // Guard: never assign a NaN/Inf scalar onto the live pool (would silently\n"
"    // break arbitrageToOracle / the draw layer). Keep the old shape on failure.\n"
"    for (const k of ['ghAh','ghBh','ghDelta','ghMu','ghNx','ghNy','ghP','ghM']) {\n"
"      if (!isFinite(cal[k])) return null;\n"
"    }\n"
"    p.ghAh = cal.ghAh; p.ghBh = cal.ghBh; p.ghDelta = cal.ghDelta; p.ghMu = cal.ghMu;\n"
"    p.ghNx = cal.ghNx; p.ghNy = cal.ghNy; p.ghP = cal.ghP; p.ghM = cal.ghM; p.ghU0 = cal.ghU0;\n"
"    state._baseline_k = Engine.getDepth(p);   // depth is shape-dependent; re-anchor\n"
"    log('shape', `Re-warp: γ=${g.toFixed(4)}, δ=${d.toFixed(4)} (re-calibrated in place; positions kept).`);\n"
"    return { gamma: g, delta: d };\n"
"  }\n"
)
txt = txt.replace(old3, new3, 1)

# Export setShape in the Store public API.
old4 = "    setOracle, setPerpMark, setKappa, setTickHours, runArbitrage,\n"
assert txt.count(old4) == 1
new4 = "    setOracle, setShape, setPerpMark, setKappa, setTickHours, runArbitrage,\n"
txt = txt.replace(old4, new4, 1)

# ─────────────────────────────────────────────────────────────────────────
# EDIT 3 — control panel HTML, inserted inside the curve canvas-wrap just
# before the legend (line 1388). Number-stepper inputs, lock/unlock checkbox.
# ─────────────────────────────────────────────────────────────────────────
old5 = ''.join(lines[1385:1388])   # lines 1386-1388 (unique: preview-w-readout span + stepper close + legend)
assert old5 == (
'              <span class="preview-w-readout" id="preview-w-readout"></span>\n'
'            </div>\n'
'            <div class="legend">\n'
), repr(old5)
panel = (
'              <span class="preview-w-readout" id="preview-w-readout"></span>\n'
'            </div>\n'
'            <!-- ── Volatility-knob control panel (σ-dial; γ/S* derived) ── -->\n'
'            <div class="vol-knob" id="vol-knob">\n'
'              <div class="vk-row vk-title">\n'
'                <span class="vk-mode-label" id="vk-mode-label">Perpetual-option mode</span>\n'
'                <label class="vk-lock"><input type="checkbox" id="vk-unlock"> <span>Free shape — off-theory</span></label>\n'
'              </div>\n'
'              <!-- locked-mode primary inputs: σ (vol) and r (rate) are freely editable -->\n'
'              <div class="vk-row" id="vk-locked-inputs">\n'
'                <label class="vk-field">σ vol <input type="number" id="vk-sigma" step="0.005" min="0" value="0.129"></label>\n'
'                <label class="vk-field">r rate <input type="number" id="vk-rate" step="0.01" min="0" value="0.05"></label>\n'
'              </div>\n'
'              <!-- unlocked off-theory raw shape knobs: γ and δ editable; σ derived -->\n'
'              <div class="vk-row vk-hidden" id="vk-unlocked-inputs">\n'
'                <label class="vk-field">γ raw <input type="number" id="vk-gamma-raw" step="0.05" min="1.0001" value="2"></label>\n'
'                <label class="vk-field">δ raw <input type="number" id="vk-delta-raw" step="0.01" min="0.0001" value="0.08"></label>\n'
'              </div>\n'
'              <div class="vk-row vk-derived">\n'
'                <span class="vk-readout">γ <b id="vk-gamma-out">2.000</b></span>\n'
'                <span class="vk-readout">S* <b id="vk-sstar-out">—</b></span>\n'
'                <span class="vk-readout" id="vk-sigma-derived-wrap">σ <b id="vk-sigma-out">0.129</b></span>\n'
'                <span class="vk-readout">δ <b id="vk-delta-out">0.080</b> <small>ATM smoothing</small></span>\n'
'                <span class="vk-readout">β <b>1</b> <small>value∝S^−γ</small></span>\n'
'              </div>\n'
'              <div class="vk-note" id="vk-note">σ → γ via Merton: γ=(−1+√(1+8r/σ²))/2. Hard floor γ&gt;1 (locked GH family); upper side soft.</div>\n'
'            </div>\n'
'            <div class="legend">\n'
)
assert txt.count(old5) == 1
txt = txt.replace(old5, panel, 1)

# ─────────────────────────────────────────────────────────────────────────
# EDIT 4 — UI wiring (event listeners), inserted after the oracle KPI block.
# ─────────────────────────────────────────────────────────────────────────
old6 = (
"// ── Oracle (KPI strip input) ──────────────────────────────────────────────\n"
"const kpiOracle = document.getElementById('kpi-oracle');\n"
"kpiOracle.addEventListener('change', () => {\n"
"  const v = parseFloat(kpiOracle.value);\n"
"  if (v > 0) { Store.setOracle(v); render(); }\n"
"});\n"
)
assert txt.count(old6) == 1
new6 = old6 + (
"\n"
"// ── Volatility-knob control panel (σ-dial → γ/S* derived; lock/unlock) ─────\n"
"// Locked (default): σ and r are the live inputs; γ and S* are derived and\n"
"// shown read-only. Unlocked (off-theory): raw γ and δ are the live inputs and\n"
"// σ becomes a derived read-out. On any change we re-warp the curve in place\n"
"// (Store.setShape) at the new γ (and δ if unlocked) and redraw everything.\n"
"(function(){\n"
"  const elUnlock = document.getElementById('vk-unlock');\n"
"  const elSigma  = document.getElementById('vk-sigma');\n"
"  const elRate   = document.getElementById('vk-rate');\n"
"  const elGammaRaw = document.getElementById('vk-gamma-raw');\n"
"  const elDeltaRaw = document.getElementById('vk-delta-raw');\n"
"  const outGamma = document.getElementById('vk-gamma-out');\n"
"  const outSstar = document.getElementById('vk-sstar-out');\n"
"  const outSigma = document.getElementById('vk-sigma-out');\n"
"  const outDelta = document.getElementById('vk-delta-out');\n"
"  const lockedBox   = document.getElementById('vk-locked-inputs');\n"
"  const unlockedBox = document.getElementById('vk-unlocked-inputs');\n"
"  const sigmaDerWrap= document.getElementById('vk-sigma-derived-wrap');\n"
"  const modeLabel   = document.getElementById('vk-mode-label');\n"
"  const noteEl      = document.getElementById('vk-note');\n"
"  if (!elUnlock || !elSigma) return;   // panel absent (defensive)\n"
"  const GMIN = 1.0001;                 // hard architectural floor γ>1\n"
"  // σ → γ : positive root of γ(γ+1)=2r/σ², then clamp γ>1 (upper side soft).\n"
"  function gammaFromSigma(sigma, r){\n"
"    if (!(sigma > 0) || !(r > 0)) return NaN;\n"
"    const g = (-1 + Math.sqrt(1 + 8*r/(sigma*sigma))) / 2;\n"
"    return g;\n"
"  }\n"
"  // γ → σ (inverse, for the unlocked derived read-out): σ=√(2r/(γ(γ+1))).\n"
"  function sigmaFromGamma(g, r){\n"
"    if (!(g > 0) || !(r > 0)) return NaN;\n"
"    return Math.sqrt(2*r / (g*(g+1)));\n"
"  }\n"
"  // Active strike for the S* read-out: the live pool spot (sNorm·oracle).\n"
"  function activeStrike(){\n"
"    const s = Store.state, p = s.pool;\n"
"    return Engine.getSNorm(p) * s.oracle;\n"
"  }\n"
"  function apply(){\n"
"    const unlocked = elUnlock.checked;\n"
"    const r = parseFloat(elRate.value);\n"
"    let g, d, sigma;\n"
"    if (unlocked) {\n"
"      g = parseFloat(elGammaRaw.value);\n"
"      d = parseFloat(elDeltaRaw.value);\n"
"      sigma = sigmaFromGamma(g, r);\n"
"    } else {\n"
"      sigma = parseFloat(elSigma.value);\n"
"      g = gammaFromSigma(sigma, r);\n"
"      d = 0.08;\n"
"    }\n"
"    // Hard floor γ>1 (locked family); δ>0 guard. Upper γ side soft (gates guard).\n"
"    let gClamped = g, floored = false;\n"
"    if (!(gClamped > 1)) { gClamped = GMIN; floored = true; }\n"
"    if (!(d > 0)) d = 0.0001;\n"
"    const res = Store.setShape(gClamped, d);\n"
"    if (!res) {\n"
"      if (noteEl) noteEl.textContent = 'Re-calibration failed (non-finite shape); kept previous curve. Try a value closer to γ∈(1,4).';\n"
"      return;\n"
"    }\n"
"    // Read-outs: realised γ, the live S*=K·γ/(γ+1) at the active strike, σ, δ.\n"
"    const gOut = res.gamma;\n"
"    if (outGamma) outGamma.textContent = gOut.toFixed(4);\n"
"    if (outDelta) outDelta.textContent = res.delta.toFixed(4);\n"
"    const K = activeStrike();\n"
"    if (outSstar) outSstar.textContent = isFinite(K) ? ('$' + (K * gOut/(gOut+1)).toLocaleString('en-US',{maximumFractionDigits:0})) : '—';\n"
"    const sigOut = unlocked ? sigmaFromGamma(gOut, r) : sigma;\n"
"    if (outSigma) outSigma.textContent = isFinite(sigOut) ? sigOut.toFixed(4) : '—';\n"
"    if (noteEl) {\n"
"      noteEl.textContent = floored\n"
"        ? 'γ clamped to >1 (locked GH/Merton family floor). σ would imply γ≤1 — off the convexity range.'\n"
"        : (unlocked\n"
"           ? 'Off-theory: raw γ,δ free; σ shown is the implied vol. NOT the shipped product.'\n"
"           : 'σ → γ via Merton: γ=(−1+√(1+8r/σ²))/2. Hard floor γ>1; upper side soft (gates guard).');\n"
"    }\n"
"    render();\n"
"  }\n"
"  function syncMode(){\n"
"    const unlocked = elUnlock.checked;\n"
"    if (unlockedBox)  unlockedBox.classList.toggle('vk-hidden', !unlocked);\n"
"    if (lockedBox)    lockedBox.classList.toggle('vk-readonly', unlocked);\n"
"    // In locked mode σ is the live input and the derived-σ read-out is hidden;\n"
"    // in unlocked mode σ becomes derived (shown) and the σ input is disabled.\n"
"    if (sigmaDerWrap) sigmaDerWrap.style.display = unlocked ? '' : 'none';\n"
"    if (elSigma) elSigma.disabled = unlocked;\n"
"    if (elRate)  elRate.disabled  = false;\n"
"    if (modeLabel) modeLabel.textContent = unlocked ? 'Free shape (off-theory)' : 'Perpetual-option mode';\n"
"  }\n"
"  ['change','input'].forEach(ev => {\n"
"    [elSigma, elRate, elGammaRaw, elDeltaRaw].forEach(el => el && el.addEventListener(ev, apply));\n"
"  });\n"
"  elUnlock.addEventListener('change', () => { syncMode(); apply(); });\n"
"  syncMode();\n"
"  apply();   // initialise read-outs to the open default (γ=2)\n"
"})();\n"
)
txt = txt.replace(old6, new6, 1)

F.write_text(txt)

# ── post-edit blob check ──
after = F.read_text()
assert lmd5(after, 74) == B74, "webp blob changed!"
assert lmd5(after, 1060) == B1060, "svg blob changed!"
print("blobs intact:", lmd5(after,74), lmd5(after,1060))
print("edits applied OK")
