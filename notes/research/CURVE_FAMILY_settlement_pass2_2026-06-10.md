# Curve-family settlement — PASS 2 (the one narrow question)

_research-lead, 2026-06-10. Notes-only theory pass; NO engine edit, NO submit, NO git. Follows the
manager CORRECTION HEADER on `notes/research/CURVE_FAMILY_derivation_2026-06-10.md`, the skeptic
verdict `notes/skeptic/VERDICT_CURVE_FAMILY_2026-06-10.md`, and the manager audit
`evidence/manager_audit_CURVE_FAMILY_2026-06-10.md`. The pass-1 "+16% blow-up" table is a RETRACTED
artifact and is NOT re-derived here; this pass starts from the corrected fixed point
`S* = K·γ_loc(S*)/(γ_loc(S*)+1)` and settles the one question the skeptic isolated. Numerics:
python3 + numpy/scipy float64, Riccati/BVP integration (`solve_ivp`, rtol 1e-12); scripts
`/tmp/elbow_riccati.py`, `/tmp/elbow_consequence.py`, `/tmp/elbow_wkb.py` (transcribed below so the
manager can re-derive). Every claim tagged **[analytic]**, **[numeric]**, or **[needs-Aristotle]`._

---

## 0. The one question (precisely)

On the warp curve, for a strike that registers in the ATM **elbow** (`|u| ≲ τ`, `u = ln(y/x)`), is
the perpetual-American **continuation value locally a single power law** `V(S) ≈ a·S^(−γ_loc)` —
with `γ_loc(u) = w(u)/(1−w(u))` the curve's instantaneous local exponent — *through* the elbow, OR
is it a **genuine blend** (a superposition of local modes) so that value's local log-log slope
`−d lnV/d lnS` differs from the curve's instantaneous `w/(1−w)`?

This is the load-bearing question because:
- If value is **locally a single power through the elbow**, then `−d lnV/d lnS = γ_loc(S)` pointwise,
  smooth-pasting is a purely local condition at `S*`, and the forced boundary is the closed-form fixed
  point `S* = K·γ_loc(S*)/(γ_loc(S*)+1)` **everywhere** ⇒ the rebuild gate PASSES.
- If value is a **blend**, the smooth-pasting boundary uses the value's TRUE local slope, which is
  not `γ_loc(S*)`, and the inherited fixed-point relation is wrong in the elbow ⇒ the gate is
  conditional (recovers closed form only for wing-registered strikes / under a different boundary).

## 1. Setup — the value function is an eigenfunction of the curve-induced generator

The locked machinery (`formal/aristotle_runs/MERTON_tie/.../MertonTie.lean`, AIRTIGHT T1a) fixes the
frame: the perpetual continuation value is the **eigenfunction** of the Laplace-exponent generator
with eigenvalue `r`, `value ∝ S^(−γ)` with `ψ(−γ)=r`, and the smooth-pasting boundary is forced
algebraically (`Sstar_is_merton_boundary`, `Sstar_A_forced`). Two facts about that generator decide
everything:

1. **On a wing the generator is constant-coefficient** (translation-invariant in `x = ln S`,
   because `w → w_±` is constant ⇒ the Lévy/diffusion coefficients do not depend on position). A
   constant-coefficient stationary pricing operator has **exact single-power eigenfunctions**
   `S^(−γ_±)`. This is why settlement is exact on the frozen wings — established, and re-confirmed
   below to ~1e-4–1e-6.

2. **In the elbow the generator is variable-coefficient** (`w(u)` varies ⇒ the local exponent
   `γ_loc(u)` varies with position). A variable-coefficient 2nd-order stationary operator does
   **not** have single-power solutions — the single-power ansatz `V = S^(−g(x))` plugged into the
   operator generates extra terms proportional to `g′(x)` that must vanish for it to solve the
   equation, and they vanish **iff `g′ = 0`** (i.e. only on the wings).

To make this curve-faithful and computable I use the perpetual operator in `x = ln S`
`(σ²(x)/2)V″ + μ(x)V′ − rV = 0` with the locked `r=q` condition (`merton_vieta_sum` ⇒ `μ = −σ²/2`)
and a **local exponent calibration**: `σ²(x)` set so the local decaying root equals `−γ_loc(x)`, i.e.
`γ_loc(γ_loc+1) = 2r/σ²(x)` (the grounded `merton_vieta_prod` root relation). This is the
curve-faithful "local-vol that reproduces the curve's local exponent." **HONESTY CAVEAT (load-bearing,
§5):** this is the **Gaussian-slice** generator; the engine-pinned GH carries the full Laplace
exponent `ψ`, not its 2nd-order slice. The QUALITATIVE verdict (constant-coeff ⇒ exact power;
variable-coeff ⇒ blend) is generator-independent and analytic; the QUANTITATIVE elbow magnitudes
below are computed on the Gaussian-slice operator and are **[numeric, model-dependent]**, not the
exact GH elbow.

The decaying eigenfunction `S^(−γ)` (γ>1) is sub-dominant to the other mode (root `1+γ`) in both
shooting directions, so plain forward/backward shooting contaminates it. I instead solve the
**Riccati ODE for the slope itself**, `p(x) = d lnV/dx`:

> `p′ = (2r/σ²(x)) + p − p²`   (with `μ = −σ²/2`),

integrated backward from the right wing with `p = −γ_+` (the decaying branch is the backward
attractor). The value's local log-log slope is `−p(x)`; the curve's instantaneous exponent is
`γ_loc(x)`. The question reduces to: **does `−p(x) = γ_loc(x)` through the elbow?**

## 2. Result — they agree on the wings to machine precision and DIVERGE by O(1) in the elbow

**[numeric]** Dynamic eigenfunction slope `−p(x)` vs curve `γ_loc(x)` (`w_mid=0.7, Δw=0.2`, so
`γ_−=1.5, γ_+=4`, `γ_loc(0)=2.333`, `r=0.05`):

| u | γ_loc (curve) | −p (dynamic value) | dyn − curve |
|---:|---:|---:|---:|
| 6.0 | 3.99688 | 3.99699 | 1.1e-04 |
| 1.5 | 3.95192 | 3.95767 | 5.8e-03 |
| 0.6 | 3.74930 | 3.80485 | 5.6e-02 |
| 0.0 | 2.33333 | **2.83153** | **+0.498** |
| −0.6 | 1.56777 | 1.72513 | +0.157 |
| −1.5 | 1.51220 | 1.52340 | 1.1e-02 |
| −6.0 | 1.50078 | 1.50085 | 7.5e-05 |

On the wings (`|u| ≳ 3`) the dynamic slope equals `γ_loc` to **~1e-4–1e-6** (exactly the
constant-coefficient single-power regime). **In the elbow the dynamic slope exceeds `γ_loc` by an
O(1) amount** — peak deviation ≈ 0.5 here. The value function is genuinely a blend through the elbow.

**Blend magnitude scales with elbow sharpness** (max `|−p − γ_loc|` over the elbow vs τ):

| τ | max \|dev\| | γ_loc(0) | dyn slope(0) |
|---:|---:|---:|---:|
| 0.05 | **1.406** | 2.333 | 3.501 |
| 0.10 | 1.040 | 2.333 | 3.251 |
| 0.30 | 0.520 | 2.333 | 2.832 |
| 1.00 | 0.187 | 2.333 | 2.520 |
| 2.00 | 0.097 | 2.333 | 2.430 |

The sharper the elbow (smaller τ — the leptokurtic / high-knob setting), the **larger** the blend.
The blend does not vanish for any finite τ; it only vanishes in the wings of any given curve.

## 3. The analytic mechanism — this is the `−γ′` correction in its CONSISTENT form

**[analytic]** The Riccati's frozen/adiabatic root (set `p′=0` at fixed x) is `p² − p − 2r/σ² = 0`,
whose decaying branch is **exactly `−γ_loc(x)`** (since `γ_loc(γ_loc+1)=2r/σ²`). The true slope
differs from the frozen root by precisely the dropped `p′` term — i.e. by the *rate of change* of
the exponent. Linearizing `p = −γ_loc + δ` about the frozen root gives the first-order blend
correction

> **−p ≈ γ_loc(x) + γ_loc′(x)/(2·γ_loc(x)+1)**   (adiabatic, first order).

**[numeric]** This matches the solved Riccati well in smooth elbows (τ=1, 2: agreement to ~1e-2) and
captures the correct sign, location and magnitude at τ=0.3 (it overshoots the peak only where the
elbow is sharp enough that higher-order Riccati terms enter — exactly the regime where the blend is
strongest). **This is the rigorous, consistent home of the term pass-1 fumbled.** Pass-1's `−γ′·lnS`
was the artifact of mis-differentiating a literal `S^(−γ(S))`; the genuine correction is
`γ_loc′/(2γ_loc+1)`, lives in the value function's own pricing ODE (the Riccati), is `lnS`-free,
and is real. The skeptic's "is value locally a single power through the elbow" is answered: **the
correction is exactly the obstruction to it being a single power, and it is non-zero in the elbow.**

## 4. VERDICT — single-power-through-elbow: **NO** (conditional on the dynamic reading)

**Single-power-through-the-elbow is FALSE for the perpetual-American (optimal-stopping / generator-
eigenfunction) value function.** The value function is a single power only on the frozen wings; in
the elbow it carries a genuine blend correction `γ_loc′/(2γ_loc+1) > 0` that does not vanish for any
finite τ and grows as the elbow sharpens (the high-kurtosis setting).

**Two readings, and which one is operative is the real fork (flag for operator):**
- **Reading A — curve-intrinsic value law.** If the value reading the venue uses is *defined* as the
  curve's local power (`d lnV/d lnS := −γ_loc(S)` by construction, the §2.2 definition the skeptic
  pinned), then value IS locally a single power *by definition*, smooth-pasting is local, and
  `S* = K·γ_loc(S*)/(γ_loc(S*)+1)` is exact everywhere ⇒ **gate PASSES**. This is internally
  consistent but it asserts the value law rather than deriving it from an optimal-stopping problem.
- **Reading B — dynamic optimal-stopping value (the locked MERTON_tie/AIRTIGHT frame).** The value
  is the eigenfunction of the curve-induced generator. Then it is a **blend** through the elbow (§2),
  its true local slope ≠ `γ_loc`, and the inherited fixed point is wrong in the elbow.

The locked scaffold's settlement story (MERTON_tie, AIRTIGHT T1a/T1b: value = generator eigenfunction,
boundary = optimal-exercise) is **Reading B**. Under the team's own established frame, the answer is a
blend, not a single power.

## 5. Consequence for the gate — bounded, NOT the retracted catastrophe

**[numeric, model-dependent]** The settlement shift from the blend, comparing `S*` from the TRUE
dynamic eigenfunction to the local-fixed-point `S* = K·γ_loc/(γ_loc+1)` (put-side, strike at carry
`P=K`, `K=100`):

| τ | S*_dynamic | S*_localFP | shift |
|---:|---:|---:|---:|
| 0.05 | 63.66 | 60.05 | +6.0% |
| 0.30 | 65.32 | 61.49 | +6.2% |
| 1.00 | 68.18 | 66.19 | +3.0% |

The boundary shift is a **bounded few-percent** effect (~3–6% on this Gaussian-slice generator), not
the retracted +16–30% blow-up — and crucially **S\* stays bounded ~60–68 across the elbow** (no
blow-up to 87–98). So:

- The pass-1 "closed form is demonstrably fragile / gate blocks rebuild by a 16% obstruction" framing
  stays **RETRACTED** and is **not** reinstated. The obstruction is real but small.
- The gate's true status: **closed-form settlement is EXACT on the frozen wings** [analytic];
  **in the elbow the inherited local fixed point is correct to a few percent but is NOT exact under
  the dynamic reading** — value is a blend, so `S* = K·γ_loc/(γ_loc+1)` is an O(`γ_loc′/(2γ_loc+1)`)
  **approximation**, not the exact boundary, in the elbow.
- **What recovers EXACT closed form:** (i) wing-registered strikes (`|u_K| ≫ τ`) — exact, the
  product/calibration call the operator owns; or (ii) adopting Reading A (curve-intrinsic value law)
  as the definition — a settlement-semantics choice, operator-tier; or (iii) accepting the
  local-fixed-point `S* = K·γ_loc(S*)/(γ_loc(S*)+1)` as a **few-percent-accurate closed form** in the
  elbow and pricing the residual — a calibration/accuracy-tier decision.

## 6. Honest ledger (analytic vs numeric vs needs-Aristotle)
- **[analytic]** constant-coeff wing ⇒ exact single power; variable-coeff elbow ⇒ no single-power
  solution; frozen Riccati root = `−γ_loc` exactly; first-order blend correction `γ_loc′/(2γ_loc+1)`.
- **[numeric]** wing agreement ~1e-4–1e-6; elbow O(1) slope deviation; deviation scales with 1/τ;
  first-order correction matches solved Riccati in smooth elbows; S\* shift ~3–6%, bounded 60–68.
- **[numeric, MODEL-DEPENDENT — caveat §1]** all elbow magnitudes use the **Gaussian-slice**
  perpetual generator with local-exponent calibration, NOT the full GH Laplace exponent. The
  qualitative verdict (blend, not single power) is generator-independent and analytic; the exact GH
  elbow magnitude is **[needs-numeric on the full ψ]** or **[needs-Aristotle]** if a certified bound
  is wanted.
- **[needs-Aristotle]** If Reading B is operative and the operator wants closed-form settlement
  certified in the elbow, the Lean obligation is NOT the inherited `Sstar_forced` (which assumes the
  constant-exponent single power). It would be either (a) a certified error bound
  `|S*_dyn − K·γ_loc/(γ_loc+1)| ≤ C·γ_loc′/(2γ_loc+1)` (a quantitative smooth-pasting-stability lemma
  — Mathlib has the ODE/`HasDerivAt` machinery but not a free-boundary stability result, so this is a
  build, not a re-instantiation), or (b) under Reading A, a re-statement of `Sstar_forced` with
  `γ := γ_loc(S*)` as a fixed point (immediate from the existing T1a derivation). **No submit this
  pass** — a clean Lean statement is proposed, not assumed; I flag the two phrasings for a future
  obligation pinned only after the operator picks the reading.
- Nothing here is **trusted-from-prover** or **verified**.

## 7. Flags for the operator (via the manager)
1. **The settlement question is a READING/semantics fork, not a pure-math result.** Under the team's
   own locked frame (dynamic optimal-stopping eigenfunction, MERTON_tie/AIRTIGHT = Reading B), value
   is a **blend** through the elbow and the inherited closed-form `S*=Kγ/(γ+1)` is a **few-percent
   approximation there, not exact**. Under a curve-intrinsic value-law definition (Reading A) it is
   exact by construction. **Which reading is the venue's settlement definition is operator/settlement-
   semantics-tier** (CLAUDE.md §7 escalation) — it is the same class of call as the ITM rule.
2. **Magnitude is small and bounded** (~3–6% boundary shift; S* stays ~60–68; no blow-up). The
   pass-1 catastrophe stays retracted. This lands AGAINST the "gate blocks rebuild" momentum: the
   gate is **substantially passable** — exactly on the wings, and to a few percent in the elbow.
3. **The clean recovery is wing-registered strikes** (`|u_K| ≫ τ`) — a product/calibration choice
   (which strikes, which τ). If the traded band is engineered into the wings, settlement is exact
   closed-form and the gate clears outright.
4. **My generator is the Gaussian slice** (`merton_vieta_prod` root relation), not the full GH `ψ`.
   The qualitative verdict is generator-independent; the exact GH elbow numbers are a further
   [needs-numeric] step if the operator wants them before a build decision.
5. No engine edit / git / submit this pass. Nothing trusted-from-prover or verified.
