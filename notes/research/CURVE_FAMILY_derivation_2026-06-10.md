# Curve-family derivation (pass 1) — kurtosis warp on Balancer

_research-lead, 2026-06-10. Notes-only theory pass; NO engine edit, NO submit, NO git. Operator
greenlit ("start") via the manager. Target spec: `specs/SPEC_kurtosis_curve_family_TARGET.md`.
Prior-claim corrections honored: `notes/skeptic/VERDICT_KURTOSIS_KNOB_2026-06-10.md`, CLAUDE.md §0,
`docs/feature_inventory.md` item 2. Numerics: python3 + numpy/scipy float64, RK4 (`solve_ivp`,
rtol 1e-12) and dense grids; scripts transcribed inline so the manager can re-derive. Every claim is
tagged **[analytic]**, **[numeric]**, or **[needs-Aristotle]**. This note is written to survive the
skeptic pass: it dispositions inventory #1–#16 (§4) and does NOT re-assert the two overturned claims._

---

## 0. What this pass does NOT claim (guardrails, stated up front)
- It does **not** re-assert "no clean algebraic invariant exists" — that closed form exists (§1.1).
- It does **not** re-assert "τ≡δ / the GH engine is one (W) setting" — false at curve level; the GH
  engine puts the kernel in the latent SCORE, the warp family (W) puts it in the WEIGHT; these are
  different curves and the engine is not a (W) member at any τ (skeptic, manager-verified). This note
  derives the **(W) warp family on its own terms**, not as a re-skin of the live GH engine.
- It does **not** claim carry/rebase/value-law/seam/funding survive "by carry." The Esscher slope-law
  (d log slope/du = 1) demonstrably fails mid-curve for (W). Each contract is re-derived or flagged
  open in §4; the settlement gate (§2) is the one worked in depth this pass.
- It does **not** authorize an engine edit. Curve/invariant choice is operator-tier.

---

## 1. The curve, stated precisely in the operator's hyperbolic-angle lens

### 1.1 The invariant (closed form — the existence witness)
Plain Balancer `x^{w}·y^{1−w}=k` viewed as a distribution; kurtosis is added by letting the weight
round through the ATM region with a hyperbolic profile. The reserve relation (frontier) is the level
set of

> **F(x,y) = x^{w_mid} · y^{1−w_mid} · exp( −(Δw/2)·√( τ² + ln²(y/x) ) ) = k**

with `w_mid = (w₋+w₊)/2`, `Δw = w₊−w₋`. The matching local weight profile is

> **w(u) = w_mid + (Δw/2)·u/√(τ²+u²),  u = ln(y/x)**,

and `F` is a first integral of the Balancer local-weight price law `−dy/dx = (w(u)/(1−w(u)))·(y/x)`.

**[numeric]** `log F` is constant along the RK4-integrated frontier to **std 1.4e-13 / ptp 2.1e-12**
(params (w₋,w₊,τ) = (0.6,0.8,0.3), (0.6,0.8,0.05), (2/3,3/4,1.0)). This reproduces the skeptic's
manager-verified RK4 4.8e-13 to within method/precision. **[analytic]** The first integral follows
because the √-kernel has an elementary antiderivative `∫ u/√(τ²+u²) du = √(τ²+u²)`; the impossibility
claim that was in shared truth is a non sequitur and is not repeated.

### 1.2 The hyperbolic-angle reading (the operator's lens) and why it does NOT add content
Introduce the hyperbolic angle η by `u = ln(y/x) = τ·sinh η` (so `η = asinh(u/τ)`). Then the
identity **√(τ²+u²) = τ·cosh η** holds **[analytic]** (and **[numeric]** to 9e-16). The invariant
exponent rewrites as

> exponent = −(Δw·τ/2)·cosh η,  i.e.  **F = x^{w_mid} y^{1−w_mid} · exp( −(Δw τ/2)·cosh η )**.

This is the operator's "bend through a hyperbolic angle instead of a straight one": the straight-angle
(Balancer) view has constant weight; the hyperbolic-angle view bends the weight through `tanh η`
(`w = w_mid + (Δw/2)·tanh η`, since `u/√(τ²+u²) = tanh η`). **The cosh/√ forms are the same curve** —
related by the exact algebraic change of variable `η = asinh(u/τ)`, not by a family-membership claim.

**Honoring the standing trig flag** (`notes/skeptic/VERDICT_GUDERMANNIAN_2026-06-10`: trig must earn
its place; one "d-law" already failed because the d was the amplitude relabeled): the cosh form earns
its place **only** as the operator's geometric coordinate — it makes "skew = an angle shift" and
"kurtosis = an amplitude" read off directly (§1.3). It introduces **no new degree of freedom and no
new content**; the √-kernel form is the cleaner object to compute and build with. We do **not** dress
the curve in trig for elegance, and we do not introduce a Gudermannian "d" — there is no extra dial
hiding in the angle.

### 1.3 The three required identifications
**(a) The single static amplitude/steepness/kurtosis knob.** In the operator's lens this is the
**amplitude of the cosh term**. With skew held (symmetric setting w₋ = 1−w₊ ⇔ φ=0 below), the one knob
is the ATM sharpness `w′(0) = Δw/(2τ)` — equivalently `1/τ` at fixed wing spread, the depth of the
elbow rounding. **Caveat (carried from the Gudermannian pass, NOT re-derived here):** when w₋,w₊ are
themselves fixed, `Δw` (the wing spread) and `τ` (the elbow width) are two distinct geometric handles;
collapsing them to "one amplitude" is exact only in the symmetric, fixed-wing reading the operator
intends. I flag this as the precise sense in which "one knob" is true (§4 item 3). It is set once for
the asset's vol and is **trade-invariant** — trades do not touch `τ` or the wing weights.

**(b) Skew = the trade-induced shift, not a static dial.** A trade changes `w` (with x,y following
real reserves per the paper's Trade Formula α=x·w, β=y·(1−w) conserved, w=α/x). In the angle lens this
is a **shift of the angle origin**: `η → η − φ`, i.e. the elbow re-centers away from u=0. The static
amplitude `(Δw τ/2)` is untouched; the skew is entirely the dynamic `φ`. This matches the operator's
"skew determined by x,y,w (trading)". **[analytic]** the re-centering is exact in the cosh form
(`cosh(η−φ)`). **OPEN:** the explicit composition `w-trade (paper Trade Formula) → φ` is **not worked
this pass** and is inventory #16 (UNIMPLEMENTED, operator-tier) — see §4.

**(c) Why the wings are frozen.** As `u → ±∞`, `√(τ²+u²) → |u|` (linear), so the exponent →
`∓(Δw/2)·u` and `F` → the exact Cobb–Douglas monomial `x^{w₊} y^{1−w₊}` (u→+∞) / `x^{w₋} y^{1−w₋}`
(u→−∞). **[analytic + numeric]**: the +∞ wing weight on x is exactly `w_mid+Δw/2 = w₊`, the −∞ wing
weight is exactly `w_mid−Δw/2 = w₋` (checked to machine precision). The wing exponents
`γ_± = w_±/(1−w_±)` are therefore **τ-independent**: τ rescales the elbow horizontally (`u → u/τ` in
the kernel) and vanishes from the wings as O(τ²/u²). The wings are frozen straight power-laws at every
knob setting — the whole point of the lens, and it holds in closed form, not asymptotically only.

### 1.4 Which form fits the frame — verdict
The **√-kernel invariant** is the curve. The **cosh hyperbolic-angle form** is its faithful
coordinate and is the right object to *speak* the operator's frame in (kurtosis = amplitude, skew =
angle shift, wings = frozen arms). They are identical; trig earns its place as the lens, not as new
math. **Recommendation:** state the family with the √-kernel invariant; narrate it with the angle
lens.

---

## 2. THE REBUILD GATE — does closed-form American settlement survive? (the operator's hard gate)

The operator's gate: "Prove closed-form settlement survives on the new curve before committing the
rebuild." Re-derived from scratch; **not** assumed to carry from GH.

### 2.1 Where the closed-form S* comes from (re-derivation)
The perpetual-American smooth-pasting boundary `S* = Kγ/(γ+1)` is derived for a continuation value
that is a **pure power law** `V(S) = c·S^(−γ)` with **constant** γ. Value-match + C¹ slope-match at S*
give, **[analytic]** and **[numeric]** (verified C¹ to ≤7e-15 at γ=1.5/2/3/4): `S* = K·γ/(γ+1)` and
the coefficient. The closed form depends on γ being **constant in S near the boundary**.

### 2.2 The structural fact: γ_loc is constant only on the frozen wings
On this curve the local pricing exponent is `γ_loc(u) = w(u)/(1−w(u))`, and
`γ′_loc(u) = w′(u)/(1−w(u))²` with `w′(u) = (Δw/2)·τ²/(τ²+u²)^{3/2}`. So:
- **On a frozen wing** (`|u| ≫ τ`): `w′ → 0`, `γ_loc → γ_±` constant ⇒ continuation **is** a pure
  power `S^(−γ_±)` ⇒ the GH/Merton smooth-pasting algebra carries **verbatim**, `S* = K·γ_±/(γ_±+1)`,
  C¹ seam closed-form. **[analytic]** — the wing is exact CD (§1.3c), and settlement is a wing object.
- **In the ATM elbow** (`|u| ≲ τ`): `γ_loc` varies; `γ′_loc(0) = (Δw/2τ)/(1−w_mid)²` is O(1) and
  large for small τ. The pure-power continuation no longer holds, and the closed-form S* is **not**
  guaranteed.

### 2.3 How much the elbow breaks it (quantified)
**[numeric]** Re-solving value+slope-match with a linearized varying exponent `V = c·S^(−γ(S))` (slope
picks up the extra `−γ′·ln S` term) at γ₀=3, K=100:

| γ′ at boundary | S* | closed-form (γ′=0) | shift |
|---|---|---|---|
| 0.00 | 75.000 | 75.000 | 0 |
| 0.01 | 87.35 | 75.000 | +12.3 |
| 0.05 | 96.15 | 75.000 | +21.1 |
| 0.10 | 97.96 | 75.000 | +23.0 |

A boundary exponent slope of just 0.01 moves S* by ~16%. The closed form is **not robust** to a
varying exponent — so the survival question is entirely "does the relevant strike sit in the frozen
wing or the elbow?"

### 2.4 Where the elbow lives (quantified)
**[numeric]** Half-width of the non-constant-exponent region (w_mid=0.7, Δw=0.2), measured as the |u|
beyond which γ′_loc drops below a threshold:

| τ | γ′_loc(0) | \|u\| where γ′_loc<1e-2 | \|u\| where γ′_loc<1e-3 |
|---|---|---|---|
| 0.05 | 22.2 | 0.85 | 1.84 |
| 0.30 | 3.70 | 2.80 | 6.07 |
| 1.00 | 1.11 | 6.19 | 13.5 |

`u = ln(y/x)` is the carry-relative log-price coordinate, so `|u|<W` means the strike is within `e^W`
of carry P. For τ=0.3 the elbow (γ′_loc>1e-2) spans price within ~16× of carry; for τ=0.05 within
~2.3×. **ATM and near-ATM strikes — the most-traded band — sit squarely in the elbow**, exactly where
the closed-form S* is not guaranteed.

### 2.5 VERDICT
**Settlement survives closed-form on the frozen wings [analytic]; in the ATM elbow it does NOT survive
as the inherited `S*=Kγ/(γ+1)` closed form [analytic obstruction, numeric magnitude].** Since the
strikes a perpetual-options venue most cares about register in or near the elbow, **the inherited
closed form does not carry to the operative region** — this is a genuine obstruction to the rebuild
gate, not a paperwork gap.

**The obstruction, stated precisely (so it can be settled):** on the warp curve the continuation value
near an elbow strike is not a single power `S^(−γ)`; the smooth-pasting ODE has a position-dependent
exponent `γ_loc(u)`. Three ways forward, in order of cost:
1. **[needs-numeric]** Confirm/deny that the **traded strike band** is engineered to sit in the frozen
   wings (`|u_K| ≫ τ`). If the product registers strikes far enough from carry for the chosen τ, the
   closed form holds and the gate passes for that band. This is a **product/calibration question for
   the operator** (which strikes, which τ), not a pure-math question.
2. **[needs-analytic]** Look for a *generalized* closed-form free boundary for the varying-exponent
   continuation. The continuation solves a known ODE (the warp pricing equation); whether its
   free-boundary problem admits a closed form for the `u/√(τ²+u²)` profile is an open analytic
   question — plausibly yes given the elementary integral in §1.1, but NOT shown this pass.
3. **[needs-Aristotle]** Once a candidate generalized boundary or a "strikes-in-wing" restriction is
   pinned, the C¹ seam at the warped boundary is a Lean obligation in the established
   smooth-pasting/seam scaffold (cf. AIRTIGHT T1a `Sstar_forced`, PH-5). I would phrase it as: given
   constant-exponent on the strike-side wing, the forced-boundary derivation re-instantiates; given
   varying exponent, the seam C¹ must be re-proved against the new continuation.

**Bottom line for the gate:** the operator's "prove settlement survives before rebuilding" gate is
**NOT yet cleared**. It clears trivially for wing-registered strikes and fails (as inherited) for
elbow strikes. The decision of where strikes register is operator/calibration-tier.

---

## 3. Analytic vs numeric vs needs-Aristotle — honest ledger
- **[analytic]** closed-form invariant is a first integral; cosh/√ identity; wing → exact CD monomial;
  τ-independence of wing exponents; S*=Kγ/(γ+1) for constant γ; γ_loc varies in elbow / constant on
  wing.
- **[numeric]** invariant constancy 1.4e-13; cosh identity 9e-16; wing weights exact; C¹ match
  ≤7e-15; boundary-shift table (§2.3); elbow-width table (§2.4).
- **[needs-numeric]** whether the operative strike band is wing-registered for a chosen τ.
- **[needs-analytic]** existence of a generalized closed-form free boundary for the elbow continuation.
- **[needs-Aristotle]** Lean certification of the seam (only after a candidate boundary is pinned).
- Nothing here is **trusted-from-prover** (no submit this pass) and nothing is **verified**.

---

## 4. Inventory disposition (`docs/feature_inventory.md` #1–#16)
| # | Feature | Disposition |
|---|---------|-------------|
| 1 | Balancer base | **Considered** — the exact base; wings ARE this monomial (§1.3c). |
| 2 | The curve warp (position-dependent weight) | **Considered** — this note's subject; stated as the √-kernel invariant / cosh-angle lens (§1). Overturned claims NOT re-asserted (§0). |
| 3 | Kurtosis knob τ | **Considered** — the static amplitude/steepness knob = ATM sharpness w′(0)=Δw/2τ (§1.3a). Flagged: "one knob" is exact in the symmetric fixed-wing reading; Δw vs τ are two geometric handles otherwise. β=1 moment-coupling caveat carried, NOT re-derived this pass. |
| 4 | Carry P=Ny/Nx, u=log p−log P | **OPEN** — u here is ln(y/x) (reserve-ratio), recentered. The skeptic's #4 slip (dq/du≠1 for (W)) means the carry/log-price identification is NOT clean for the warp family; not worked this pass. Flag. |
| 5 | Rebase (P→P/r, θ→θ/r, anchor w=½) | **OPEN** — not established for the warp family; anchor "w=½" is ambiguous when w is a field. Not worked this pass. Flag. |
| 6 | Pricing law value∝S^(−γ) | **Considered (partial)** — holds exactly on the frozen wings (γ_±); does NOT hold pointwise through the elbow (γ_loc varies, §2.2). This is the crux of the settlement obstruction. |
| 7 | ITM American smooth-pasting (the GATE) | **Considered — VERDICT: survives on wings, fails-as-inherited in elbow** (§2). The rebuild gate is NOT cleared; obstruction + three resolution paths given. |
| 8 | Uniform strike registration θ=sNorm(K), crossover@K | **OPEN/load-bearing** — whether the strike registers in wing vs elbow IS the settlement question (§2.4). The registration map through the τ-keyed curve must be re-checked (dir_gate analogue). Flag. |
| 9 | Funding = slope-deviation vs w=½ anchor | **OPEN** — must generalize when w is a field; the w=½ anchor is not canonical for a warp family. Not worked this pass. Flag. |
| 10 | Slippage basis mpGeom=getMP_raw·e^(−ghMu) | **N-A this pass** — no engine/slippage object touched; THE gotcha is an engine-coordinate issue, deferred to any build pass. |
| 11 | Dollar/settlement pipe | **N-A this pass** — no dollar path proposed (§6 HARD-STOP respected; theory only). |
| 12 | THE gotcha (getMP_raw is price, not slope) | **N-A this pass** — engine-coordinate; no engine math here. Flag carried for any build. |
| 13 | Solvency boundary (B1) | **Excluded(why)** — extrinsic floor, operator ship-gate; geometry does not close it. Carried caveat: τ redistributes wing reserve depth (skeptic/REPARAM ~6× over τ range) ⇒ a shipped τ re-prices the B1 floor. Not closed here; flag. |
| 14 | Esscher tilt / latent rapidity group | **Considered (negative)** — the Esscher slope-law d log slope/du=1 FAILS mid-curve for (W) (skeptic); the warp is NOT a clean Esscher tilt of a CPMM product. Stated, not re-asserted as carrying. |
| 15 | File-safety gate | **N-A this pass** — no HTML/blob edit; theory note only. |
| 16 | Warp-with-trades (skew-from-trading) | **Considered — OPEN/UNIMPLEMENTED** — skew = φ (angle shift) is the operator's frame (§1.3b); the explicit paper-Trade-Formula → φ map is NOT worked and the live engine does not implement the w-warp trade. Operator-tier, sequenced after the faithfulness pivot. Flag. |

No silent absences.

---

## 5. Flags for the operator (via the manager)
1. **Curve/invariant choice is operator-tier** — this note characterizes the family; it does not pick
   it. The √-kernel invariant is recommended as the object; the cosh-angle as the lens.
2. **The rebuild gate is NOT cleared.** Closed-form American settlement survives on the frozen wings
   but does NOT survive as the inherited `S*=Kγ/(γ+1)` for strikes in the ATM elbow — and the
   most-traded band lives in the elbow. This is the operator's hard gate and it currently **blocks the
   rebuild** absent one of §2.5's resolutions.
3. **Where strikes register (wing vs elbow) is a product/calibration decision** that the settlement
   survival hinges on — operator/calibration-tier, not pure math.
4. **"One amplitude knob" is exact only in the symmetric, fixed-wing reading;** otherwise Δw (skew
   spread) and τ (elbow width) are two handles. Worth confirming the operator means the symmetric
   reading.
5. **Skew-as-φ-from-trading is the operator's frame but the paper-Trade-Formula → φ map is
   UNIMPLEMENTED** (inventory #16), as is the warp-with-trades engine mechanic.
6. Carry/rebase/funding for the warp family are **OPEN, not shown** — they do not carry from GH and
   were not worked this pass; they are the next derivation targets if the gate is resolved.
