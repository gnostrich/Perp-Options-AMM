# VERIFY — Rebase gauge-invariance, rigorous + anti-regression LOCK design

**research-lead · 2026-07-07 (operator entry 466) · engine HEAD `abd35f4b` (`HEAD_temporal_mvp_v28_lens.html`)**
Verify-and-gate-design only — NO engine edit (the intern lands the RB.* gate after). Every number below
is a measured residual from the vm-extracted live Engine, not an assertion. Harnesses:
`scratchpad/measure_rebase.js`, `measure_close.js`, `measure_close2.js`, `neg_controls.js`, `neg2.js`, `neg3.js`
(session scratchpad; reproduce against the live `<script id="engine">`).

---

## 0. Code-confirmed rebase transform (quoted from the live engine)

`Engine.rebase` (HEAD line **1765-1767**) is a **pool-only** map:

```js
function rebase(s, r) {
  return { x: s.x * r, y: s.y, alpha: s.alpha * r, beta: s.beta };
}
```

i.e. **x → r·x, α → r·α, y invariant, β invariant** (r = S_new/S_old). It does NOT touch strike rays
or `k` directly. The rest of the operator's stated transform is realized elsewhere and is a **derived
consequence**, confirmed against the code:

- **w invariant:** `getW = α/x → (r·α)/(r·x) = α/x`. ✓ (line 1614)
- **k → r^w·k:** `getDepth = x^w·y^(1−w) → (r·x)^w·y^(1−w) = r^w·k`. ✓ (line 1616)
- **|dy/dx| → (1/r):** `getMP_raw = w·y/((1−w)·x) → /r`. ✓ (line 1617)
- **θ → θ/r (each strike ray):** rays are **derived, not stored as θ**. Strikes are stored as **dollar
  `K_inner` (the locked invariant)**; the ray is `θ = K/oracle` (closeBand line 2113/2134,
  openBand line 2620). The full gauge move is `setOracle` (line 2467-2477): `pool = rebase(pool, r)`,
  `oracle → r·oracle`, `_baseline_alpha *= r`. So any **live-derived** ray `θ = K/oracle → K/(r·o) = θ/r`
  automatically. ✓

**The application-level gauge move = `rebase(pool,r)` ⊕ `oracle→r·oracle` ⊕ `_baseline_alpha*=r`.** That
is what "a rebase" means and what the invariance table is measured against.

### Convention note (note ↔ engine) — flag for the operator, not a bug
`notes/rebasing_logic_note.md` §2/§4 frames rebase with the **ray angle θ held FIXED and the dollar strike
K = θ·oracle sliding**. The **engine stores the opposite**: dollar `K_inner` is the locked invariant and
θ = K/oracle is derived (→ θ/r). These are the same physics under two bookkeeping choices, but they imply
**different products**: θ-fixed ⇒ a constant-moneyness perpetual whose value is rebase-invariant; K-fixed
(what the engine ships) ⇒ a fixed-dollar-strike option that **legitimately reprices** when the oracle moves.
This ambiguity is fertile ground for "is it a regression?" confusion — worth pinning in the note.

---

## 1. Gauge-invariance table (measured residuals; `w∈{0.5,0.35,0.65}`, `o∈{80k,120k,50k}`, `r∈{0.5,0.8,1.1,2,5}`, `m∈{1,2,3}`)

| Quantity | Expected under rebase | Max \|resid\| | Verdict |
|---|---|---|---|
| `getW` | invariant (deg 0) | 2.2e-16 | CLEAN |
| `getSNorm` (pool **mode**) | invariant (deg 0) | 3.3e-16 | CLEAN |
| `gLoc = m·γ` | invariant (deg 0) | 0 (reads w only) | CLEAN |
| `poolMark` (dollar spot, paired oracle·r) | **invariant** | 4.4e-16 | CLEAN |
| `getMP_raw` | scales **1/r** (deg −1) | 4.4e-16 | CLEAN |
| `getDepth` | scales **r^w** (deg −w) | 1.7e-15 | CLEAN |
| **mark**, mode-space + FROZEN ray (as `fundingTick` reads stored `leg.inner`) | invariant | 8.9e-16 | CLEAN |
| **mark**, price-space (`sNorm0=poolMark/o` + live ray `K/o`), self-consistent | invariant | 1.4e-15 | CLEAN |
| **funding `dev` / output**, FROZEN stored ray (as `fundingTick` calls it) | invariant | 8.9e-16 | CLEAN |
| **closeBand `raw_net`/X/Y**, dollar strike **carried through** (K→r·K) | invariant | **0 – 4e-15** | CLEAN |

**All clean to machine-epsilon.** The pure reframe leaks nothing.

### The one pairing that is NOT invariant — and why it is CORRECT, not a leak
- **mark, mode-space `getSNorm` (invariant) + LIVE-rebuilt ray `K/o` (→θ/r):** max resid **1.16e+3**.
- **closeBand `raw_net` with the dollar strike held FIXED while the oracle moves o→r·o:** resid ~**170×**
  (e.g. r=2: raw_net +2.4e-6 → +4.2e-4).

This is the shipped `closeBand` value path (`legPrice(s0,…)` reads `getSNorm(s0)` [invariant] against
`band.sold.inner` rebuilt live as `K/oNow` [→θ/r], lines 2206/1797/2134). It "moves" because the test
**moved the dollar oracle while pinning the dollar strike** — a real change in the option's moneyness (a
call struck at $88k is genuinely ITM once BTC is $160k). It **reprices correctly**. The proof it is a real
move and not a gauge leak: **carry the dollar strike through the reframe (K→r·K) and closeBand raw_net is
invariant to 0–4e-15** (table row 10). So the reframe degree of freedom is clean; only the genuine
economic move drives value. **Do NOT "fix" this to be invariant — that would break repricing.**

### The operator's specific `dev` question — answered
> "dev = f(θ/mode, w, m); rebase scales θ→θ/r AND moves the mode — does dev stay invariant?"

- **The mode does NOT move under rebase.** `getSNorm=(1−w)/w`, and w is rebase-invariant (measured 3.3e-16).
  The premise "rebase moves the mode" is **false for this engine** — the mode is keyed to shape w, which
  rebase leaves fixed (consistent with the rebasing note §1: "rebase does not change w, does not trigger
  funding").
- **In the shipped funding path the ray does NOT scale either.** `fundingTick` (line 2761) passes the
  **stored** `leg.inner` (frozen at K/oracle_open), not a live-rebuilt ray. So dev sees a frozen ray against
  an invariant mode ⇒ **dev is exactly rebase-invariant (8.9e-16).** ✓
- `dev = |c·ln(θ/mode)|`, `c = (g_a−g)/(g_a+1)`, `g=m·γ`, `g_a=m`. `c` depends only on **w** (shape) ⇒ dev is
  a pure **pool-lean** signal, correctly rebase-silent. **This is the geometry link the operator flagged:
  funding is shape-keyed, shape is rebase-invariant, so funding is rebase-invariant — verified.**
- **Asymmetry flagged (not a bug, an UPDATE-2/funding-semantics question):** `closeBand` rebuilds rays live
  (K/oNow) but `fundingTick` uses the frozen stored ray. Under a bare rebase, close reprices while funding
  stays put. Per the note that is intended (funding responds to shape w, not oracle position); whether an
  open band's funding ray should re-key to a moved oracle is the deferred funding formula (code line
  2299-2308: "NOT THE FINAL FUNDING FORMULA"). Escalate as an operator/UPDATE-2 decision, not a rebase fix.

### Reciprocal-vs-price geometry (context, orthogonal to rebase)
`getSNorm` (reciprocal mode) and the price-measure spot `sNorm0 = poolMark/oracle` are **different
coordinates** that coincide only at the deploy point. After arbing a symmetric pool to r·oracle,
`getSNorm(arb) = 1/√r` exactly (measured YES for r∈{2,0.5,4}) while price-spot normalizes to 1. This √r
split is pool geometry (the documented "site 1/2/3" price-vs-reciprocal distinction, MUST-APPLY-A), NOT a
rebase defect — but it is why the engine juggles two coordinates and why mixing them historically bred bugs.

---

## 2. Commute with trades, group structure

| Property | Max \|resid\| | Verdict |
|---|---|---|
| `rebase∘tradeUpdate == tradeUpdate∘rebase` (SPOT, same dy) | 2.2e-16 | COMMUTES |
| `rebase∘tradeUpdateAt(·,dy,ρ) == tradeUpdateAt(rebase,·,dy,ρ)` (fixed ρ; incl. off-ATM & close-dy) | 4.4e-16 | COMMUTES |
| group law `rebase(rebase(s,r1),r2)==rebase(s,r1·r2)` | 2.2e-16 | HOLDS |
| identity `rebase(s,1)==s` | 0 | HOLDS |
| inverse `rebase(rebase(s,r),1/r)==s` | 2.2e-16 | HOLDS |

The live `tradeUpdateAt` path (entry-339) commutes with rebase at fixed ρ — the trade-point law is
rebase-consistent, extending the archived L2 SPOT-trade result to the live path.

### Shipped invariants under rebase (operator Q3)
- Funding `dev = 0` on a **symmetric w=½ pool ∀ strikes/wings/m/oracle** — measured **exactly 0** (killer).
- Funding `dev = 0` at ATM (ρ=1) on a skewed pool — measured **exactly 0**.
- `lens_selfcheck.js` **35 PASS / 0 FAIL**, `a16_atm_gate.js` **5 PASS / 0 FAIL** on HEAD (unaffected).
- Pool spot trio (`tradeUpdate`/`arbitrageToOracle`/`rebase`) source byte-identical to v24 (lens gate P/CM8-v2.1).

---

## 3. ⚠ CRITICAL GAP — the current "rebase gate" does NOT test the live engine

`engine/verify/faith_rebase.js` (the gate the brief pointed to) **SKIPs on HEAD**:
`FAITH-REBASE: SKIP — engine has no ghCalibrate (pre-GH build). Nothing to assert.`
It was written for the demoted v26c GH engine (`ghCalibrate`/`ghNx`/`ghP`) and asserts nothing on v28.
The only live rebase coverage in `lens_selfcheck.js` is a **source byte-identity** check (rebase source ==
v24) — fragile: any refactor preserving behavior but changing bytes would red it, and any behavior change
that keeps the v24 source pattern would pass. **There is currently NO behavioral gauge-invariance gate on
the live rebase.** This is precisely how a 40+-time regression can recur. The RB.* lock below closes it.

### The four historical regression modes, pinned
From the rebasing note §3 the transform has exactly four scalar degrees; the historical break classes map to:
(a) forget `x→r·x`; (b) wrongly scale `y` (must be invariant); (c) forget `α→r·α` (w breaks); (d) wrongly
scale `β` (must be invariant). **Measured coverage** (`neg_controls.js`/`neg2.js`): the pool-intrinsic
checks (getSNorm/getMP_raw/poolMark) catch (a),(b),(c) — but **(d) β-scaled SLIPS every intrinsic check**
(getW/getSNorm/getMP_raw/getDepth never read β). Only **field-exact bookkeeping (RB.2)** or the
**trade-commute check (RB.5)** catch the β-class (β enters the `tradeUpdate` hyperbola: M3 commute resid
5.3e-1). **⇒ RB.2 is mandatory; the intrinsic checks alone are insufficient.**

---

## 4. THE LOCK — splice-ready `RB.*` checks for `lens_selfcheck.js` (all negative-controlled)

Grid: `w∈{0.5,0.6,0.42}`, `r∈{0.5,0.8,1.1,2,5}`, `m∈{1,2,3}`, `o∈{80k,120k}`; `TOL=1e-12` (measured worst
1.7e-15 ⇒ ~3 orders headroom). Extract Engine via the existing `engineOf`. Pool builder
`makePool(w,x,o)={x, y:o*(1-w)*x/w, alpha:w*x, beta:(1-w)*y}`.

**RB.1 — pool-intrinsic gauge degrees.** For `sr=rebase(s,r)`:
`rel(getW(sr),getW(s))≤TOL`; `rel(getSNorm(sr),getSNorm(s))≤TOL`; `rel(getMP_raw(sr)*r,getMP_raw(s))≤TOL`;
`rel(getDepth(sr)/r**getW(s),getDepth(s))≤TOL`; `rel(poolMark(sr,r*o,oi),poolMark(s,o,oi))≤TOL`.
_Neg-control M1 (y→r·y): getMP_raw·r & poolMark resid 4.0 → FIRES._

**RB.2 — bookkeeping BIT-EXACT (the β-class killer — mandatory).**
`sr.x===s.x*r && sr.y===s.y && sr.alpha===s.alpha*r && sr.beta===s.beta` (strict `===`).
_Neg-controls: M3 (β→r·β) β-field FAIL; M1 (y→r·y) y & β FAIL; M2 (drop α) α FAIL._

**RB.3 — carried-strike invariance (the θ→θ/r killer).** Dollar strike carried through the reframe:
`markLensed(wing, (r*K)/(r*o), getSNorm(sr), gLoc(sr,(r*K)/(r*o),m)) == markLensed(wing, K/o, getSNorm(s), gLoc(s,K/o,m))` ≤TOL,
both wings, `K∈{0.7,1.0,1.3}·o`. (Optional stronger form: drive `closeBand` with strikes K→r·K ⇒ raw_net/X/Y invariant, measured 0.)
_Neg-control M4 (x unscaled ⇒ k/getSNorm wrong): getSNorm/mark leak → FIRES; M5 (additive) carriedMark resid ~1 → FIRES._

**RB.4 — group structure.** `rebase(rebase(s,r1),r2)==rebase(s,r1*r2)` field-rel ≤TOL; `rebase(s,1)===s`;
`rebase(rebase(s,r),1/r)` field-rel ≤TOL. _Neg-control M5 (additive): group resid 0.5 → FIRES._

**RB.5 — trade/rebase commute.** `rebase(tradeUpdate(s,dy),r)` vs `tradeUpdate(rebase(s,r),dy)` field-rel
≤TOL (dy∈{+5000,−3000,+20000}); and `rebase(tradeUpdateAt(s,dy,ρ),r)` vs `tradeUpdateAt(rebase(s,r),dy,ρ)`
field-rel ≤TOL (fixed ρ∈{1,2,0.5}). _Neg-control M3 (β→r·β): commute resid 5.3e-1 → FIRES (β-class second net)._

**RB.6 — funding rebase-silence + pool-lean killer (the operator's dev pin + the 20-30× regression pin).**
(i) `fundingPerStrike(rebase(s,r), θ_stored, wing, N,dt,κ,r*o,oi,m) == fundingPerStrike(s, θ_stored, …,o,oi,m)`
≤TOL with `θ_stored=K/o` **held FROZEN** (the way `fundingTick` calls it) ⇒ dev rebase-invariant.
(ii) **KILLER:** `fundingPerStrike` on a **symmetric w=½ pool == 0** (≤TOL) for all strikes/wings/m/oracle.
(iii) `fundingPerStrike` at ATM (θ=getSNorm(s)) `== 0`.
_Neg-control: a **moneyness-weighted** funding (weight `|ln ρ|` without the pool-lean `c=(g_a−g)/(g_a+1)`
factor) is **2.0e-2 ≠ 0 on the symmetric pool** → FIRES the killer. `c=0` at w=½ is what forces the correct
zero; the historical ~20-30× regression funded a symmetric pool via a moneyness/value weight or an
oracle-gap `(S−1)` term — RB.6(ii) is the check no broken funding can fake._

### The single most robust killer
**RB.2 (field-exact) + RB.6(ii) (symmetric-pool-funding-is-zero).** RB.2 catches every one of the four
scalar transform regressions including the β-class that slips all intrinsic reads; RB.6(ii) catches the
funding-a-symmetric-pool class that is the actual recurring economic regression. RB.1/RB.3 add the
semantic gauge degrees as defense-in-depth.

**Negative-control summary (all validated in `neg_controls.js`/`neg2.js`/`neg3.js`):**
M1 y-scaled → RB.1,RB.2 fire. M2 drop-α → RB.1,RB.2 fire. M3 β-scaled → **RB.2,RB.5 fire (RB.1 slips —
documented)**. M4 x-unscaled → RB.1,RB.3 fire. M5 additive → RB.1,RB.3,RB.4 fire. Moneyness-funding →
RB.6(ii) fires. The REAL rebase passes all six clean.

---

## 5. Verdict
Rebase on HEAD `abd35f4b` is a **CLEAN gauge move**: every normalized/economic quantity is rebase-invariant
to machine-epsilon; the price coordinate scales 1/r and depth scales r^w exactly; it commutes with both
trade laws; group/identity/inverse hold; funding is correctly rebase-silent (dev shape-keyed, w invariant).
The one apparent non-invariance (fixed-dollar-strike close value) is **correct repricing of a real oracle
move**, proven by the strikes-carried-through test (resid 0). **No residual, no broken invariant.** The real
exposure is **procedural**: the shipped rebase gate (`faith_rebase.js`) SKIPs on v28, leaving only a source
byte-identity check — the RB.* lock replaces that with six behavioral, negative-controlled checks. **This is
a VERIFY + GATE-DESIGN; the intern lands RB.* into `lens_selfcheck.js` (no engine edit here).**
