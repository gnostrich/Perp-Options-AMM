# Heterogeneous-weight Balancer: closed-form implied density, and GENERALIZE-vs-RECOVER

_2026-06-09, research-lead. DERIVATION deliverable (operator wants the closed form). No engine edits,
no Aristotle submits, no git. Grounded in `engine/knowledge/GH_MATH.md`,
`formal/temporal_lean_verified/RequestProject/AMMCurve.lean`, and the prior notes
`curves/gh/REPARAM_balancer_kurtosis_dropin_2026-06-09.md`,
`curves/gh/CURVE_SWAP_GH_vs_CES_analysis_2026-06-09.md`,
`notes/perpetual_option_reconciliation_2026-06-09.md`. All numerics this pass mpmath, 30–50 digit, by direct
integration (not formula-arguing). Confident vs conjectural marked inline._

---

## HEADLINE (the closed form, derived from x, y, w)

A Balancer AMM with a **position-dependent weight** `w = w(u)` (`u = log p − log P`, `p` = marginal
price, `P` = carry constant) has marginal price, by definition,

    p(u) = (w(u)/(1−w(u))) · (y/x).

Taking the log and using the reserve depletion this profile induces gives the **closed-form log of the
implied (Balancer) marginal log-price as a function of the latent driver `u`:**

    q(u) := log p(u) = u + log( w(u)/(1−w(u)) ) + const.                      (★)

with the **exact slope law (the score-level relation the operator anticipated):**

    dq/du = d log p/du = 1 + w'(u) / ( w(u)·(1−w(u)) ).                       (★★)

The implied log-price density is the pushforward of the latent driver's density `f_u` through (★):

    f_q(q) = f_u(u(q)) / (dq/du) = f_u(u(q)) / [ 1 + w'(u)/(w(u)(1−w(u))) ].   (CLOSED FORM)

**This is the headline closed form expressed from the Balancer components `x, y, w` themselves**: the
weight enters the density *only* through the single scalar field `w'/(w(1−w))` — the
**logarithmic derivative of the odds `w/(1−w)`** — added to the constant `1`. Everything (convexity,
skew, kurtosis, wings) is read off this one functional of `w(u)`.

Equivalent statements of (★★), all verified to 12+ digits:
- `d log(w/(1−w))/du = w'/(w(1−w))` — so `q(u) = u + log-odds(w(u))` is exact, no integral needed.
- constant `w` ⇒ `w'=0` ⇒ `dq/du ≡ 1` ⇒ `q = u + const` ⇒ **pure linear warp** ⇒ the latent density is
  reproduced *unchanged* (Gaussian stays Gaussian: skew = 0, excess kurtosis = 0 to 1e-8 numerically).
  This is the δ→∞ / Cobb–Douglas / log-normal corner. **Confirmed numerically.**
- heterogeneous `w` ⇒ `dq/du` is a non-constant positive field ⇒ a **nonlinear monotone warp** that
  injects skew AND kurtosis from one profile. **Confirmed numerically.**

### Which density object — stated explicitly (the operator asked)
There are three candidate "densities"; they are NOT the same and I name the one used and why:

1. **Implied log-price / return density `f_q` (USED — the headline).** The pushforward (★). Two-sided,
   proper when the latent `f_u` is proper. This is the natural "implied return distribution."
2. **Reserve / liquidity density `−dX/dp` (Breeden–Litzenberger on RESERVES).** For a *pure*
   heterogeneous-Balancer frontier this is **IMPROPER**: reserves are unbounded (`X ∼ p^{−(1−w_−)}` as
   `p→0`, the Cobb–Douglas unbounded-reserve fact from the prior note), so `−dX/dp ∼ p^{−(2−w_−)}` is
   **non-integrable at `p=0`** unless `w_−→1`. The one-sided X-leg only normalizes the upper half. So
   the reserve-curvature reading is the wrong "return density" object for the pure-Balancer family; it
   needs the other leg or the GH bounded-reserve tail/CDF construction (`X∈(0,Nx)`). **Verified.**
3. **Latent GH return density `f_β`** with score `d log f_β/dv = β − α·v/√(δ²+v²)` (GH_MATH.md). This is
   the object whose skew/kurtosis the prior note characterized; it is the *latent* `f_u` in reading 1
   for the GH member.

**The answer DOES differ across objects** — this is the load-bearing honesty point (see §3/§Verdict):
the operator's `value ∝ S^(−γ)` "wing power law" lives in reading 1's *value/slope* exponent
`γ_loc(u) = w(u)/(1−w(u))`, NOT in reading 2's reserve tail and NOT necessarily in the latent density's
tail. I keep reading 1 as the headline and flag where the readings split.

---

## 1. The score / depletion derivation (where `w(u)` enters)

Pin the local depletion rates (the operator's expectation — **confirmed as the consistent definition**):

    d log X/du = −(1 − w(u)),        d log Y/du = +w(u).                       (depletion ODE)

Integrating: `X(u) = X₀ · exp(−∫(1−w))`, `Y(u) = Y₀ · exp(∫ w)`. Then the geometric marginal price

    |dy/dx| = (dY/du)/(−dX/du) = (w/(1−w))·(Y/X)  ≡  Balancer p = (w/(1−w))(y/x).   ✓ exact, by construction.

So the depletion ODE **is** Balancer-with-local-weight. Differentiating `log p = log(w/(1−w)) + logY − logX`:

    d log p/du = w'/(w(1−w)) + w + (1−w) = 1 + w'/(w(1−w)).                    = (★★), confirmed.

**The score is exactly where the weight profile enters** — through `w'/(w(1−w))`, the log-derivative of
the odds. This is the pin the operator asked for, in clean closed form.

---

## 2. The map: profile → (convexity, skew, kurtosis)

From the asymptotic weights `w_± = w(±∞)` (the profile flattens, `w'→0`, in the wings):

- **Wing exponents (the put/call roots):** `γ_± = w_±/(1−w_±)`  — the local value-law exponent
  `γ_loc(u) = w(u)/(1−w(u))` flattens to `γ_±` in the wings. **Numerically confirmed:** `dγ_loc/du →
  1e-10` at `|u|=8` ⇒ each wing is a clean `value ∝ S^(−γ_±)`.
- **CONVEXITY** = average of the wing exponents: `γ̄ = (γ_− + γ_+)/2`.
- **SKEW** = difference of the wing exponents: `Δγ = γ_+ − γ_−` (= 0 for a symmetric profile;
  numerically a symmetric tanh gives skew = 0.000, an asymmetric one gives skew ≠ 0).
- **KURTOSIS** = **transition sharpness** of `w(u)` at the centre — the size/scale of `w'(0)` (or the
  curvature scale of the `√(δ²+·²)` elbow). Sharper transition ⇒ more excess kurtosis (in the latent /
  return-density reading); softer ⇒ toward Gaussian. **Numerically confirmed** monotone in the GH
  member: sharper (smaller δ) ⇒ larger excess kurtosis (δ=0.08→2.65, 1→0.70, 3→0.25, monotone).

CAVEAT on kurtosis SIGN by reading (verified, important): in the **pushforward reading 1** with a
*Gaussian* latent `f_u`, the warp (★) *steepens* the middle (price runs fast through ATM where `w'`
is large), which spreads central mass and yields **negative** excess kurtosis (platykurtic): symmetric
tanh `w_∓=0.3/0.7, k=2` gave excess kurtosis **−1.016** (skew 0); asymmetric `0.4/0.85` gave skew
**+0.071**, excess kurtosis −1.10. In the **latent return-density reading 3** (GH `f_β`), the sharpness
gives **positive** excess kurtosis (Laplace-ward). Both are real; they describe different objects
(implied price-of-trade density vs latent driver density). **State which density before quoting a
kurtosis sign.** (Operator-facing: this is a labeling call, flagged below.)

---

## 3. GH as a special case — written out; and the concrete NON-GH member

### GH recovered as the `√`-profile
The GH engine's value/slope law is **exactly** `|dy/dx| = (Ny·M/Nx)·e^u` (the Esscher tilt
`f_{β+1}/f_β = e^v`, GH_MATH.md) ⇒ `d log slope/du = 1` exactly ⇒ in the slope/value sense GH (engine,
β=1) is effectively a **single-γ (put-only) member**: `value ∝ S^(−γ)` globally. GH's *nonlinearity*
(skew/kurtosis) lives in the **latent return density** `f_β`, whose score is the GH sigmoid:

    d log f_β/dv = β − α·v/√(δ²+v²).

The normalized score is the **GH `√`-sigmoid** (runs 0→1, transition sharpness `1/(2δ)`):

    σ_GH(v) = (1 + v/√(δ²+v²))/2.                                              (the specific profile)

- asymptotes `σ_GH(−∞)=0, σ_GH(+∞)=1`; sharpness `σ_GH'(0)=1/(2δ)` = the kurtosis knob;
- `(α, β, δ) ↔` (score asymptotes `β±α` + elbow scale `δ`): the wing decay rate is `α−|β|`, the skew
  offset is `β`, the elbow sharpness is `1/δ`. **Cross-checked numerically:** the `√`-profile reproduces
  the prior note's GH excess kurtosis exactly — δ=0.08→**2.6530** (note 2.653), 0.3→**1.6885** (1.688),
  1→**0.6961** (0.696), 3→**0.2472** (0.247). Match to <1e-3. **Confirmed.**

### A DIFFERENT monotone profile that is NOT GH but is valid and wing-power-law-preserving
Replace the `√`-score sigmoid by a **tanh** score sigmoid (same asymptotes, matched centre-slope):

    d log f/dv = β − α·tanh(v/δ).

Both are smooth, monotone, run between the same asymptotes, and give the **same wing decay**
`exp(−(α−|β|)|v|)` (so the same power-law/Laplace wings). But they are **distinct distributions**:
at α=4, β=0, δ=0.5, the `√`-score gives excess kurtosis **1.2184**, the tanh-score gives **1.2000**
— same wings, different middle. **Numerically confirmed.** So a general monotone score sigmoid produces
a valid, wing-matched distribution that is **not GH**. GH is the **specific `v/√(δ²+v²)` member**.

---

## 4. AMM-validity constraints on `w(u)` (the `AMMCurve` gate)

For the frontier `y(x)` to be a valid `AMMCurve` (`AMMCurve.lean`: `antitone_y`, `convex_y`,
`coercive`):

1. **`w(u) ∈ (0,1)` for all `u`** ⇒ Balancer price `p = (w/(1−w))(y/x) > 0` ⇒ `y` strictly antitone in
   `x` (downward-sloping frontier). [`antitone_y`]
2. **Marginal price strictly increasing in the latent driver:** `dq/du = 1 + w'/(w(1−w)) > 0`, i.e.

       w'(u) > −w(u)·(1−w(u)).                                                (convexity bound)

   This is exactly the convex-frontier / monotone-demand condition. **Sufficient:** `w'(u) ≥ 0`
   (monotone-NONDECREASING weight) ⇒ always valid. **Numerically confirmed:** a monotone-increasing
   tanh weight has `dq/du > 0` everywhere; a sharply *decreasing* weight (`w' < −w(1−w)`) gives
   `dq/du = −8 < 0` ⇒ **non-convex / invalid frontier ⇒ correctly excluded by the gate.** [`convex_y`]
3. **Bounded asymptotes `w_± ∈ (0,1)`** ⇒ wing exponents `γ_± = w_±/(1−w_±)` finite and positive ⇒
   `value ∝ S^(−γ_±)` power-law wings on both legs ⇒ bounded-below value set. [`coercive`]

So the admissible profiles are exactly: **`w:ℝ→(0,1)`, smooth, with `w' > −w(1−w)` (e.g. monotone
non-decreasing), and finite asymptotes `w_± ∈ (0,1)`.** Any such `w` instantiates `AMMCurve`; the
short-gamma bridge (`poolValue_concaveOn`, `hedge_gap_concaveOn`) then transfers for free.

---

## 5. Numeric sanity checks (mpmath, 30–50 digit; raw kept in my context)

- **C1 — linear warp preserves Gaussian.** constant `w` ⇒ `dq/du≡1` ⇒ pushforward of Gaussian latent:
  mean 0, var 1, skew 0.00000000, excess kurtosis 0.00000000 (to 1e-8). ✓
- **C2 — wing power laws preserved.** non-GH tanh weight `w_∓=0.25/0.75`: deep-wing
  `d log f/du = −0.75000000` (lower, = `−(1−w_−)`) and `−0.25000000` (upper, = `−(1−w_+)`), to 8
  digits ⇒ clean `S^(−(1−w_±))` price tails. And the value-law exponent `γ_loc → γ_±` with
  `dγ_loc/du → 1e-10` at `|u|=8`. ✓
- **C3 — heterogeneous case does BOTH (skew + kurtosis).** symmetric tanh: skew 0, excess kurtosis
  −1.016 (pushforward reading); asymmetric tanh `w_∓=0.4/0.85`: skew +0.0708, excess kurtosis −1.104.
  Skew tracks `w_+−w_−` asymmetry, kurtosis tracks transition sharpness. ✓
- **C4 — GH `√`-profile reproduces the known GH kurtosis** (vs prior note CHECK 6): δ=0.08→2.6530,
  0.3→1.6885, 1→0.6961, 3→0.2472 — match the note's 2.653/1.688/0.696/0.247 to <1e-3. ✓
- **C5 — GENERALIZE discriminator.** `√`-score vs tanh-score, same (α,β,δ)=(4,0,0.5): same wing decay
  `α−|β|=4`, but excess kurtosis 1.2184 (`√`) vs 1.2000 (tanh) ⇒ **distinct valid distributions**. ✓
- **C6 — AMM validity gate.** monotone-increasing weight ⇒ `dq/du>0` everywhere (valid convex
  frontier); sharply-decreasing weight ⇒ `dq/du=−8<0` (invalid, excluded). ✓

---

## VERDICT (plain)

**The heterogeneous-weight warp GENERALIZES GH. It does NOT merely recover it.**

- The implied distribution is fixed by **one** functional of the profile — the log-odds derivative
  `w'/(w(1−w))` in (★★) — and **any** smooth monotone `w:ℝ→(0,1)` with finite asymptotes gives a valid
  `AMMCurve` whose two legs carry clean wing power laws `value ∝ S^(−γ_±)`, `γ_± = w_±/(1−w_±)`,
  **automatically**, because `w` flattens to constants in the wings.
- **GH is the specific member** whose latent-density score is the `√`-sigmoid `σ_GH(v) =
  (1 + v/√(δ²+v²))/2` (sharpness `1/2δ`, asymmetry `β`). A **different** monotone profile
  (e.g. the tanh-score `β − α·tanh(v/δ)`) yields a **valid, power-law-/Laplace-wing-preserving
  distribution that is NOT GH** — same wings, different kurtosis (1.2184 vs 1.2000). So the family is
  strictly bigger than GH; GH is the `√`-member.
- The smoothness/monotone/power-law-wing constraints do **NOT** force the `√`-form: the tanh member is
  an explicit counterexample to "forcing." (If the operator additionally demanded that `w` come from a
  *variance-mean mixture with the inverse-Gaussian mixing law* — the structural property that makes GH
  GH — then the `√` is forced and it RECOVERS; but that is an extra, GH-specific modeling assumption,
  not implied by "monotone + smooth + power-law wings.")

**Concrete non-GH member (the demonstration):** the tanh-score profile `d log f/dv = β − α·tanh(v/δ)`
(equivalently the weight whose value-law-exponent profile flattens to `γ_± = w_±/(1−w_±)`): valid AMM
frontier, same wing power laws, different middle moments than GH.

---

## OPERATOR-ESCALATION FLAGS (curve/economic-object territory — research-lead DERIVES, does not decide)

1. **The curve choice is the operator's.** I derived and characterized the family; *which* member to
   ship (GH `√`, the tanh generalization, or a calibrated free profile) is a curve/invariant decision,
   = re-opening locked architecture. Flag, don't decide.
2. **Density-object ambiguity is real and changes the answer.** "Implied return distribution" can mean
   (1) the pushforward implied price-of-trade density `f_q` (USED here), (2) the reserve-curvature
   liquidity density (IMPROPER for pure Balancer — needs both legs / GH's bounded reserves), or (3) the
   latent driver density `f_β`. The **wing power-law `value∝S^(−γ_±)`** lives in the value/slope
   exponent `γ_loc=w/(1−w)`; the **kurtosis SIGN flips** between the pushforward reading (platykurtic,
   from steepening the ATM warp) and the latent-density reading (leptokurtic, Laplace-ward). Any UI/
   paper "kurtosis" or "fat tails" label must name the object — consistent with the prior note's finding
   that δ is an ATM-elbow/return-kurtosis knob, NOT a tradeable-wing-fatness knob (γ is the wing knob).
3. **Asymmetric `w_± ⇒ two distinct wing exponents `γ_±`** = both eigenfunctions `S^(±γ)` live; this is
   the βh=0/two-root settlement-semantics change already flagged in the REPARAM note (FULL fork). The
   heterogeneous weight is the *general* mechanism behind that fork: independent `w_−, w_+` is exactly
   the independent put/call exponent freedom (Merton two-root), which is operator-owned settlement
   semantics. The single-γ engine (β=1) is the `w_−=w_+` slice.
4. **Validity is a hard gate, not a tuning suggestion:** `w∈(0,1)` and `w'>−w(1−w)` (convexity) are
   required for `AMMCurve`; a too-sharply-decreasing weight is not a "riskier curve," it is an invalid
   (non-convex) curve the type-checker rejects.

## Confidence ledger
- **CONFIDENT (numerically verified this pass):** the closed form (★)/(★★) and the score relation
  `w'/(w(1−w))` (C1, exact identity); wing power-law preservation `γ_loc→γ_±` (C2); profile→(convexity,
  skew,kurtosis) map via (avg, diff, sharpness) (C2/C3); GH `√`-sigmoid reproduces known GH kurtosis
  (C4); the tanh member is a concrete valid non-GH generalization with matched wings (C5); AMM-validity
  constraints `w∈(0,1)`, `w'>−w(1−w)` (C6). GENERALIZE verdict.
- **CONJECTURAL / scope:** the kurtosis-sign reconciliation across the three density objects is derived
  but the *product* reading (which object the trader/paper means) is operator-owned; the "RECOVER under
  an extra inverse-Gaussian-mixing constraint" clause is the standard GH characterization, stated but
  not re-proven here; no Lean re-instantiation attempted (this is a derivation pass, not a submit pass).
