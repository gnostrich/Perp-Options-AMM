# SPEC — funding deviation = the REAL same-slope pool-vs-anchor read (+ splice + anti-regression LOCK)
_research-lead, 2026-07-08. Operator RULED entry 460 (verbatim `history/operator/2026-06-10_kurtosis-curve-family-brief.md`):
build the ACTUAL same-slope pool-vs-anchor ray-angle-ratio deviation, NOT the moneyness proxy; and it is a
RECURRING REGRESSION (~20–30×). Measured vs the REAL engine HEAD `bb2f8230`
(`engine/builds/HEAD_temporal_mvp_v28_lens.html`, engine block L1594–2339; vm-extract). No web / git / engine-edit /
Aristotle. Harness: scratchpad `probe.js` / `negctrl.js` / `propc.js` (gitignored). closeBand UNTOUCHED._

## 0. The operator's same-slope definition — pinned exactly (entries 386/443/459)
The funding deviation at a strike is computed by:
1. take the slope of the **POOL** curve (weight `w = getW`) at that strike's ray;
2. find the ray at which the **ANCHOR** curve (`w = ½`) attains that **SAME slope**;
3. deviation = the **RATIO of the two ray angles** (pool-ray vs anchor-ray at equal slope).
It is **ZERO at the anchor/ATM** (both coincide → same ray → ratio 1), **ZERO on an unleaned `w=½` pool at ANY
moneyness** (pool = anchor), and **grows as the pool leans**. It is a **POOL-LEAN quantity, NOT a moneyness/
OTM-distance.** This is the DUAL of the demoted entry-308 like-ray read (`docs/operator_mental_model.md` ADDENDUM
385/386), anchored so the ATM point is respected. Funding is read **through the lens** (CLAUDE.md §4 / entry 232):
the steepness is the LENSED exponent `g = m·γ`, so the knob `m` re-scales the rate by design.

---

## 1. The exact geometry in engine coords (closed form)
**Engine primitives** (L1612–1616, 1664–1698):
- `getW(s) = α/x = w`;  `getSNorm(s) = (1−w)/w = mode`;  `getMP_raw(s) = w·y/((1−w)·x)` (raw slope `|dy/dx|`).
- `gLoc(s,θ,m) = m·γ`, `γ = w/(1−w)` LIVE (L1664–1670). Strike ray `θ` and `mode` are the ONE sNorm coord
  (MUST-APPLY-1). Moneyness `ρ = θ/mode`.

**Through-the-lens value curves.** For funding the relevant "slope" is the lensed option-value steepness (entry
232). Pool value falls as `v_pool(ρ) ∝ ρ^(−g)`, `g = m·γ`; anchor (`w=½ ⇒ γ=1`) as `v_anchor(ρ) ∝ ρ^(−g_a)`,
`g_a = m·1 = m`. Local slope magnitude `|v'(ρ)| = g·ρ^(−g−1)`.

**Same-slope construction (steps i–iii).** Fix a slope σ. Pool attains it at `ρ_p = (g/σ)^{1/(g+1)}`; anchor at
`ρ_a = (g_a/σ)^{1/(g_a+1)}`. Read at the position's own strike ρ (σ = pool slope there). The **ray-angle ratio**
(deviation) is

  **D̃(ρ) = ρ_p / ρ_a = (g/g_a)^{1/(g_a+1)} · ρ^{(g_a−g)/(g_a+1)}.**

The prefactor `(g/g_a)^{1/(g_a+1)}` is the standing ATM offset; **anchoring "so the ATM point is respected"
(entry 386) = dividing it out** (D̃ measured relative to its own ATM ray-ratio). The anchored deviation is the
clean power law

  **D̃(ρ) = ρ^{c},  c = (g_a − g)/(g_a + 1) = m(1−γ)/(m+1)   (γ = w/(1−w), live).**

Funding weights on the **log ray-ratio** (the natural "ratio deviation", exactly linear in the two drivers):

  **dev(θ,w,m) = |ln D̃| = |c| · |ln ρ| = [ m·|1−γ| / (m+1) ] · |ln(θ/mode)|.**

(Equivalent monotone alternative: the raw ratio-minus-one `|D̃−1| = |ρ^c − 1|`; the gate locks the SIGNATURE, so
either reads the same qualitatively. Log-ratio chosen for clean assertions.)

**The three signatures fall straight out of `c` and `|ln ρ|`:**
- `ρ = 1` (ATM) ⇒ `|ln ρ| = 0` ⇒ **dev = 0** — respects the ATM point (entry 386, 443).
- `w = ½` ⇒ `γ = 1` ⇒ `c = 0` ⇒ **dev = 0 at EVERY strike** — the POOL-LEAN signature (killer, §5b).
- grows with `|w−½|` (via `|c|`) and with moneyness distance `|ln ρ|` — the standing lean, read per strike.

**Why this is NOT the demoted like-ray read, and why like-ray "violated the ATM point":** like-ray slope-ratio at a
fixed ray is `R(ρ) = (g/g_a)·ρ^{g_a−g}`, which at ATM (`ρ=1`) is `g/g_a ≠ 1` — a nonzero deviation at the money.
The same-slope DUAL, anchored, replaces the exponent by `(g_a−g)/(g_a+1)` and the ATM value is 1 (dev 0). Both
vanish at `w=½`; only the same-slope one also vanishes at ATM.

**Note (ray "angle").** Rays in this engine are parametrized by the sNorm value `θ` (the trade map is `ρ^power`);
"angle ratio" = ratio of the two ray parameters `θ`, not `arctan`. Using literal `arctan` would add a non-closed
form and is not how the engine represents rays. Stated so it can't drift.

---

## 2. Confirm the shape (measured vs the real engine, m=2)
Weight `dev` on a **leaned** pool `w=0.7` (mode = 0.4286, γ = 2.333, c = −0.8889), put wing:

| θ | ρ=θ/mode | region | dev |
|---|---|---|---|
| 0.05 | 0.117 | OTM deep | 1.9097 |
| 0.10 | 0.233 | OTM | 1.2936 |
| 0.20 | 0.467 | OTM | 0.6775 |
| 0.30 | 0.700 | OTM | 0.3170 |
| 0.40 | 0.933 | OTM edge | 0.0613 |
| mode | 1.000 | **ATM** | **0.0000** |
| >mode | >1 | **ITM** | **0.0000** |

Shape = **0 @ATM · 0 ∀ITM · positive OTM lobe · fades smoothly to 0 at the ATM edge** — exactly the operator's
entry-458 target. Call wing mirrors (OTM = θ>mode). **Deep-OTM behaviour is now DETERMINED by the geometry, not a
free proxy choice:** `dev ~ |c|·|ln ρ|` grows **UNBOUNDED but only logarithmically** (ρ=0.5→0.62, 0.1→2.05,
0.01→4.09, 1e-4→8.19). This is the honest consequence of the ruled construction; if the operator wants a bounded
deep-OTM cap that is a SEPARATE product call on top (flag), not a change to the same-slope law.

Grows with lean at **fixed moneyness** ρ=0.5 (put): w=0.5→0.000, 0.55→0.103, 0.6→0.231, 0.65→0.396, 0.7→0.616,
0.8→1.386 — strictly monotone in |w−½|. m-scaling at w=0.7, ρ=0.5: m=1→0.462, 2→0.616, 4→0.739, 8→0.822
(monotone up in m via m/(m+1) — entry 232 satisfied). **Caveat for gate design:** "grows with lean at fixed
STRIKE θ" is NOT monotone because raising w moves the mode, changing ρ (and can flip θ into ITM). The correct
fixture holds **moneyness ρ fixed** (θ = ρ·mode), not θ.

---

## 3. Reconcile with the shipped sign/scale — the (S−1)/S structure IS the regression root
**Shipped** `fundingPerStrike` (HEAD L2311–2327): `funding = κ·(±g)·N·ext·(S−1)/S·dt`, with
`ext = markLensed − max(intrinsic,0)`, `S = poolMark/oracle = getMP_raw/oi` (oracle cancels; VERIFY note).

Decompose what each factor IS:
- `±g = ±m·γ` — **wing sign (+call/−put) + the lensed m·γ scale.** KEEP (operator item 3).
- `κ, N, dt` — rate / size / time. KEEP.
- `ext` — a per-strike **mark/extrinsic** magnitude that **peaks at ATM** and is nonzero on a `w=½` pool. This is
  a moneyness/value object, **NOT the pool-lean deviation.**
- `(S−1)/S` — the **pool-vs-ORACLE gap**, ONE global scalar for all strikes, zero at the deploy anchor `S→1`.
  This is a **different object** from the pool-vs-anchor lean: it is nonzero on a symmetric `w=½` pool whenever the
  oracle has drifted (`S≠1`), and it is the same for every strike.

**Determination (operator item 3 — this is bigger than a weight swap, and I say so):** the same-slope `dev`
**REPLACES the whole `ext·(S−1)/S` magnitude structure.** `dev` is the complete per-strike pool-vs-anchor
deviation and carries the standing signal by itself. `(S−1)/S` is **NOT the lean** — it is the pool-vs-oracle
gap, and keying funding magnitude off it is precisely the recurring drift the operator flagged: **the shipped
formula funds a symmetric pool** (measured §5). `ext` is the moneyness/value confound (peaks at ATM). **Removing
`(S−1)/S` and `ext`, and substituting `dev`, is the structural fix — and it is the likely root of the 20–30×
regression** (the "deviation" kept being re-expressed as mark / value / (S−1) weights, none of which is the
same-slope lean).

**Target formula (primary):**

  **funding = κ · (±g) · N · dev(θ,w,m) · dt,   dev = (intr>0 ? 0 : |c·ln(θ/mode)|),   c = (g_a−g)/(g_a+1).**

`±g` = wing sign + m-scale (KEPT); `g = gLoc = m·γ`; `g_a = m` (anchor γ=1). **`(S−1)/S` and `ext` GONE.**
Consequence (by design, property b): funding no longer depends on oracle drift — a symmetric pool never funds,
whatever the oracle does. The `oracle`/`oracle_initial` args stay in the signature for ABI/back-compat but are
unused.

**Operator-tier flags (funding semantics — Gate 2, escalate via manager, do not self-adopt):**
- (F1) **Removing `(S−1)/S`** materially changes funding semantics (funding becomes purely curve-lean, independent
  of pool-vs-oracle disequilibrium). RECOMMENDED (it is the regression root) but operator must ratify. If instead
  the operator wants to RETAIN the pool-vs-oracle coupling, multiply by `(S-1)/S` — the gate still passes because
  `dev = 0` at ATM / ITM / `w=½` forces funding to 0 there regardless of the global scalar. Both forms satisfy the
  four signatures; only the scalar magnitude/semantics differ.
- (F2) `m` now enters BOTH `±g` (=m·γ) and `dev` (via m/(m+1)) — funding scales ~m² not ~m. Still monotone up in m
  (entry 232 "m re-scales the rate" honoured), but if a single-power m is wanted, drop `±g→±sign` and let `dev`
  carry the scale. Operator-tier calibration call.
- (F3) deep-OTM is unbounded-logarithmic (§2) — a determined consequence, not a free choice; a bounded cap is a
  separate product decision if desired.

---

## 4. Splice-ready code for `fundingPerStrike` (exact JS; replaces HEAD L2311–2327)
```js
  function fundingPerStrike(state, strike_theta, wing, N, dt, kappa, oracle, oracle_initial, tau) {
    // SAME-SLOPE pool-vs-anchor deviation (operator entries 386/443/459, RULED 460).
    // Fix a slope; read the ray each curve attains it at; deviation = anchored ray-ratio
    // D̃ = ρ^c, c = (g_a − g)/(g_a + 1); ρ = strike_theta/mode. Weight = |ln D̃| = |c·lnρ|.
    //   ZERO at ATM (ρ=1) — respects the ATM point (entry 386)
    //   ZERO ∀ strikes when w=½ (g=g_a ⇒ c=0) — POOL-LEAN signature, NOT moneyness (killer)
    //   grows with |w−½| and |lnρ| — the standing lean, read per strike (entry 232: m re-scales)
    const mode = getSNorm(state);                         // single sNorm mode (MUST-APPLY-1)
    const g  = gLoc(state, strike_theta, tau);            // pool lensed steepness m·γ, γ LIVE; tau = m
    const gA = tau;                                       // ANCHOR (w=½) lensed steepness = m·1 = m
    const c  = (gA + 1 !== 0) ? (gA - g) / (gA + 1) : 0;  // anchored same-slope ray-ratio exponent
    const intr = (wing === 'call') ? Math.max(0, 1 - strike_theta / mode)
                                   : Math.max(0, 1 - mode / strike_theta);   // intr>0 ⟺ ITM
    const dev = (intr > 0 || !(mode > 0) || !(strike_theta > 0)) ? 0
              : Math.abs(c * Math.log(strike_theta / mode));                  // OTM-only lean weight
    const gamma = (wing === 'call') ? +g : -g;            // ±g_loc: wing sign + m-scale (KEPT)
    return kappa * gamma * N * dev * dt;                  // (S−1)/S and ext REMOVED (§3); OTM-gated
  }
```
Measured full-fn profile (w=0.7, m=2, κ=N=dt=1): put OTM lobe `−8.91 … −3.16 … 0` up to ATM, `0` all ITM; call
mirrors `+`. Sign = shipped `±g` per wing; ATM/ITM hard zero both wings.

**Variant retaining pool-vs-oracle coupling (F1, only if operator rules it):** change the return to
`kappa * gamma * N * dev * (S - 1) / S * dt;` and restore `const S = (oracle>0 && oracle_initial>0) ?
poolMark(state,oracle,oracle_initial)/oracle : getSNorm(state);` with `if (S<=0) return 0;`. Gate still passes.

---

## 5. THE LOCK — hard gate (`lens_selfcheck.js`), negative-controlled, anti-regression
**RETIRE two shipped checks that ENCODE the regression** (they assert the wrong shape and must not stay green):
- **RETIRE FE.2** ("extrinsic profile = single hump peaking at ATM") — directly contradicts same-slope
  `dev(ATM)=0`. This check is the regression, written as a gate.
- **RETIRE / REPLACE FE.3** ("source ±g·(S−1)/S with weight = ext") — asserts the confounded structure. Replace
  with FS.5 (source-token check for the same-slope weight).
- **KEEP FE.1** (funding = 0 ITM — still true) and **FE.4** (negative control vs old full-mark).

**ADD checks FS.1–FS.6** (`FS` = Funding Same-slope). `mkPool(x,y,w) = {x,y,alpha:x*w,beta:y*(1-w)}`;
`chk(label,bool,detail)`; `grabFn(engineBody,'fundingPerStrike')`. Fixtures use `orc≠oi` so **S≠1** (else the
killer would pass vacuously). Negative-control weights defined in-gate: `extW` (shipped), `proxyW = |ln(θ/mode)|`.

```js
if (typeof E.fundingPerStrike === 'function') {
  const m = 2, kappa = 1, N = 1, dt = 1;
  const orc = 125000, oi = 100000;                       // DRIFTED oracle ⇒ S = getMP_raw/oi ≠ 1 (essential)
  const md   = (s) => E.getSNorm(s);
  const isITMput = (s,th) => th > md(s);                 // put ITM ⟺ θ>mode
  // negative-control weights (what the regression keeps drifting to):
  const extW   = (s,th,wg) => { const g=E.gLoc(s,th,m), mk=E.markLensed(wg,th,md(s),g);
      const it=(wg==='call')?Math.max(0,1-th/md(s)):Math.max(0,1-md(s)/th); return Math.max(0,mk-it); };
  const proxyW = (s,th)    => Math.abs(Math.log(th/md(s)));      // moneyness proxy θ/mode
  const F = (s,th,wg) => E.fundingPerStrike(s,th,wg,N,dt,kappa,orc,oi,m);

  // (FS.1 = property a) funding = 0 at ATM (strike = mode) for ALL w. A mark/ext weight FAILS (peaks at ATM).
  { let ok=true, det=[];
    for (const w of [0.5,0.6,0.7,0.8]) { const s=mkPool(10,100000,w), mo=md(s);
      if (Math.abs(F(s,mo,'put'))>1e-12 || Math.abs(F(s,mo,'call'))>1e-12) { ok=false; det.push('w='+w); }
      // negative control: shipped ext weight is NONZERO at ATM (would fund the money)
      if (!(extW(s,mo,'put')>1e-9)) det.push('NCa-broke@'+w); }
    chk('(FS.1/a) funding = 0 at ATM ∀w [same-slope; ext/mark weight FAILS: ext(ATM)>0]', ok, det.join(' ')||'0 ∀w'); }

  // (FS.2 = property b) KILLER — funding = 0 on UNLEANED w=½ pool at EVERY OTM strike, WITH S≠1.
  //   A moneyness proxy FAILS (θ/mode≠1 OTM even at w=½); the shipped ext·(S−1)/S FAILS (nonzero).
  { const s=mkPool(10,100000,0.5); let ok=true, det=[];
    for (const th of [0.1,0.3,0.5,0.7,0.9]) {            // all OTM for the put on a w=½ pool (mode=1)
      if (Math.abs(F(s,th,'put'))>1e-12) { ok=false; det.push('f@'+th); }
      if (!(proxyW(s,th)>1e-9))  det.push('NCproxy-broke@'+th);   // proxy must be NONZERO here (it fails b)
      if (!(extW(s,th,'put')>1e-9)) det.push('NCext-broke@'+th); }
    chk('(FS.2/b) KILLER: funding = 0 on w=½ pool ∀OTM with S≠1 [pool-lean signature; proxy & ext both FAIL b]',
        ok, det.join(' ')||('S='+(E.poolMark(s,orc,oi)/orc).toExponential(2)+' all f=0')); }

  // (FS.3 = property c) magnitude grows strictly with |w−½| at FIXED MONEYNESS ρ (θ = ρ·mode), both wings.
  { let ok=true, prevP=-1, prevC=-1, det=[];
    for (const w of [0.5,0.55,0.6,0.65,0.7,0.75,0.8]) { const s=mkPool(10,100000,w), mo=md(s);
      const fp=Math.abs(F(s,0.5*mo,'put')), fc=Math.abs(F(s,2*mo,'call'));   // ρ=0.5 put OTM, ρ=2 call OTM
      if (fp<prevP-1e-12 || fc<prevC-1e-12) { ok=false; det.push('nonmono@'+w); } prevP=fp; prevC=fc; }
    chk('(FS.3/c) funding magnitude strictly ↑ with |w−½| at fixed moneyness (put ρ=0.5, call ρ=2)', ok, det.join(' ')||'monotone'); }

  // (FS.4 = property d) funding = 0 ITM, both wings, leaned pool. (Subsumes/retains FE.1.)
  { const s=mkPool(10,100000,0.7), mo=md(s); let ok=true, det=[];
    for (const mult of [1.2,1.5,3.0]) if (Math.abs(F(s,mo*mult,'put'))>1e-12){ok=false;det.push('put@'+mult);}   // θ>mode ITM put
    for (const mult of [0.8,0.5,0.2]) if (Math.abs(F(s,mo*mult,'call'))>1e-12){ok=false;det.push('call@'+mult);} // θ<mode ITM call
    chk('(FS.4/d) funding = 0 ∀ITM both wings (leaned pool)', ok, det.join(' ')||'0 ITM'); }

  // (FS.5) SOURCE-TOKEN LOCK — weight IS the same-slope deviation, NOT ext, NOT (S−1)/S.
  //   Guards a silent revert of the WEIGHT even if numbers happen to line up on a fixture.
  { const src = grabFn(engineBody,'fundingPerStrike') || '';
    const hasDev  = /\(\s*gA\s*-\s*g\s*\)\s*\/\s*\(\s*gA\s*\+\s*1\s*\)/.test(src)      // c = (g_a−g)/(g_a+1)
                 && /Math\.abs\(\s*c\s*\*\s*Math\.log\(\s*strike_theta\s*\/\s*mode\s*\)\s*\)/.test(src)
                 && /gA\s*=\s*tau/.test(src);
    const noExtWt = !/\*\s*ext\s*\*/.test(src);                                        // ext weight GONE
    const noPoolOracleWt = !/ext\s*\*\s*\(\s*S\s*-\s*1\s*\)/.test(src);                // ext·(S−1) GONE
    chk('(FS.5) source lock: weight = |c·ln(θ/mode)|, c=(g_a−g)/(g_a+1); NOT ext, NOT ext·(S−1)/S',
        hasDev && noExtWt && noPoolOracleWt, 'dev='+hasDev+' noExt='+noExtWt+' noPoolOracle='+noPoolOracleWt); }

  // (FS.6) COMBINED FINGERPRINT — (a)+(b) TOGETHER reject BOTH regressions, on ONE fixture set.
  //   mark/ext weight: FAILS (a) [ext(ATM)>0].   moneyness proxy: FAILS (b) [proxy(OTM,w=½)>0].
  //   same-slope: passes both. This is the unique fingerprint.
  { const sSym=mkPool(10,100000,0.5), moS=md(sSym);
    const markFailsA  = extW(sSym,moS,'put') > 1e-9;          // mark/ext nonzero at ATM  ⇒ can't be same-slope
    const proxyFailsB = proxyW(sSym,0.5) > 1e-9;              // proxy nonzero on w=½ OTM ⇒ can't be same-slope
    const sameSlopePassesBoth = Math.abs(F(sSym,moS,'put'))<=1e-12 && Math.abs(F(sSym,0.5,'put'))<=1e-12;
    chk('(FS.6) combined fingerprint: mark-weight FAILS(a), proxy-weight FAILS(b), same-slope PASSES both',
        markFailsA && proxyFailsB && sameSlopePassesBoth,
        'markFailsA='+markFailsA+' proxyFailsB='+proxyFailsB+' sameSlopeOK='+sameSlopePassesBoth); }
}
```

**Measured negative-control outcomes (real engine, m=2, confirming the controls actually fire):**
- FS.1/a: same-slope funding = 0 at ATM ∀w; ext weight at ATM = 0.148 / 0.106 / 0.071 (w=.5/.6/.7) — **ext FAILS (a).**
- FS.2/b KILLER: same-slope funding = 0 on w=½ OTM; proxy |ln| = 2.30/1.20/0.69 and ext = 0.0015/0.013/0.037
  there — **proxy & ext both FAIL (b).** Shipped `fundingPerStrike` on the same w=½/S≠1 fixture = 2.64/7.33/14.4
  (**nonzero — the regression, caught**).
- FS.3/c: monotone 0.000→0.103→0.231→0.396→0.616→0.924→1.386 across w=0.5…0.8 (ρ=0.5 put). ✓

**Why (a)+(b) together are the unique fingerprint:** the mark/value/ext family is nonzero at ATM (fails a) but the
proxy family is nonzero on a symmetric pool OTM (fails b). Only a **pool-lean, same-slope** weight — one that
vanishes at ATM *and* on `w=½` — passes both. FS.6 asserts exactly this on one fixture set, so no future
weight-swap toward either regression can stay green. **FS.2/b is the anti-regression anchor** (the operator's
"killer check").

---

## Verdict / acceptance
- The operator's same-slope pool-vs-anchor ray-angle-ratio deviation has the **closed form
  `dev = |c·ln(θ/mode)|`, `c = (g_a−g)/(g_a+1) = m(1−γ)/(m+1)`**, `g=m·γ` (pool), `g_a=m` (anchor). Reproduces
  `0 @ATM · 0 ∀ITM · positive OTM lobe · smooth ATM edge`, **≡0 on a w=½ pool at every strike** (killer), grows
  with lean and m — all **measured against the real engine HEAD `bb2f8230`.**
- The regression root is **structural, not a weight swap:** the shipped `ext·(S−1)/S` magnitude keys off the
  pool-vs-ORACLE gap + a moneyness/value weight, neither of which is the pool-vs-anchor lean; on a symmetric pool
  it funds (measured). Target = replace with `dev`; keep `±g`, κ, N, dt. **`(S−1)/S` removal is operator-tier (F1).**
- The LOCK adds FS.1–FS.6, retires FE.2/FE.3; FS.2/b (+FS.6) uniquely fingerprint same-slope and reject both the
  value-weight and moneyness-proxy regressions, negative-controlled.
- **closeBand UNTOUCHED.** Splice + gate are the intern/manager's to land; funding-semantics flags F1–F3 are the
  operator's (route via manager). Label: **measured/derived here (research-lead), NOT yet gated in a build.**
