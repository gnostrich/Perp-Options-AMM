# Brainstorm note — perpetual-option theory ⟺ info-geometry reconciliation (2026-06-09)

_Brainstorm-only capture (manager synthesis; formal verification queued for research-lead). Not a
decision; records the reconciliation + actionables for the eventual knob spec._

## Claim being reconciled (operator-supplied analysis)
γ is the **characteristic-root exponent of the perpetual American option** (Cauchy–Euler ODE
`½σ²S²V''+(r−q)SV'−rV=0`), put root `λ_-=−γ` ⇒ `V∝S^(−γ)` (our value law); Merton smooth-pasting
`S*=Kγ/(γ+1)` (our shipped boundary). Matching both wings ⇒ `λ_-=−γ`, `λ_+=γ+1`, sum=1 ⇒ **r=q
(zero net carry)** and **γ(γ+1)=2r/σ²**. Proposed knob: **σ (volatility)**, γ derived, δ a fixed AMM
smoothing constant.

## Reconciliation with the info-geometry framing — SAME OBJECT, NAMED
- The perpetual-option "fundamental quadratic" `½σ²λ(λ−1)+(r−q)λ−r` is the **Laplace exponent /
  cumulant-generating function of the log-price process** (Gaussian ⇒ quadratic CGF). **Our `μ` (the GH
  cgf) is the same object for a generalized-hyperbolic underlying** (GH is infinitely divisible ⇒
  generates a GH Lévy process whose exponent is `μ`).
- ⇒ **`γ` = the characteristic root** where `ψ(−γ)=r`; the eigenfunction `S^(−γ)` (perpetual option) **is
  the Esscher-tilted measure** (info-geo). `S*=Kγ/(γ+1)` = Merton smooth-pasting = the AIRTIGHT-generated
  boundary. Same formulas, two names.
- **Merton perpetual option = the Gaussian (quadratic-CGF) special case; the GH engine = the general
  (heavier-tailed) case of the exact same structure.** Coverage WIN: the abstract `μ`/`γ` are pinned to a
  named classical pricing theorem.
- **Fills the lift gap:** the perpetual-option ODE is 2nd-order ⇒ lives on the 2-D phase space `(S,V')` =
  the **PH lift**. So `μ` (info-geo base) = the **symbol** of the pricing operator; the **PH lift = the
  perpetual-option pricing dynamics**; the perpetual American option = the financial reading of the lift.
  The two frames lock: "info-geo base + PH lift" ⟺ "Laplace symbol + perpetual-option dynamics."

## Honest caveats
1. **`γ(γ+1)=2r/σ²` is the GAUSSIAN slice, not the GH engine.** It comes from the quadratic CGF; the GH
   engine's true `σ→γ` map is the full GH exponent (this is its Gaussian limit). Needs a NUMERIC CONFIRM
   against the live engine before any σ-formula goes behind a slider.
2. **δ is NOT meaningless — it measures departure from Gaussian.** In our GH `μ`, δ (the `√(δ²+v²)` tail
   control) IS a pricing/shape parameter. The perpetual-option analysis sees no δ because it reads the
   Gaussian limit (δ's shape effect vanishes there). The product MAY legitimately FIX δ and expose only σ
   — but that is *holding a real parameter constant*, not "δ has no pricing meaning." Both frames agree
   once stated that way.
3. **r=q (zero net carry) restriction:** the single-γ family is the zero-net-carry slice (right for a
   perp-funded product — funding handles carry), but it IS a restriction; the fully general two-root
   Merton (independent call/put exponents from free σ,r,q) is not in the current curve.

## Actionables (NOTED — not executed; brainstorm-only)
- **[queued — research-lead, after the optimality harden pass]** Formally tie `μ` = GH Laplace exponent
  and `γ` = characteristic root (`ψ(−γ)=r`); connect the AIRTIGHT-generated `S*` to the Merton
  smooth-pasting theorem. Names the singular object as the perpetual-option pricing symbol = a real
  faithfulness deepening. Confidence: directionally strong, standard math; needs the formal pin.
- **[numeric confirm — manager + research-lead]** Check `γ(γ+1)=2r/σ²` (Gaussian slice) against the live
  engine; pin where δ enters (GH pricing vs near-Gaussian smoothing); confirm r=q locus.
- **[knob spec — HELD, pending the two above]** Recommend σ as primary knob (theory- AND trader-native),
  γ/S* derived, δ fixed. But the exact σ→γ is the GH map — do NOT ship the Gaussian formula as exact
  without the confirm. "Hold dispatch" instinct is correct. Knob-label decision = operator (product/UI).
- **[guardrail]** This is the engine-faithfulness territory (does the live engine's γ match the
  characteristic-root relation?) — overlaps the still-HELD faithfulness-scaffolding pivot. The σ↔γ numeric
  confirm is naturally a first faithfulness gate. Keep separate from the formal phase.
