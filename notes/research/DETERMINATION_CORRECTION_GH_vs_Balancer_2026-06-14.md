# CORRECTION — the singular object's μ is the BALANCER constant-product potential, NOT the GH CGF

**2026-06-14, manager. Operator entry 240 ("but we arent using gu[GH] curve right?") caught a
conflation in this morning's structure determination. Re-opens / qualifies it.**

## The error
This morning's determination (note `PH_UNIFICATION_whole_exchange_2026-06-13.md` L9; research-lead
MEMORY L63/72/78; source = spec addendum `port_hamiltonian_consistency.md` §★, 2026-06-09) stated the
singular object as **"μ = the GH cumulant-generating function (CGF), R=∇²μ=Fisher metric,
information-geometric / dually-flat exponential family."** That addendum was written **2026-06-09,
when GH was still the live curve.** GH was **DEMOTED 2026-06-10 (entry 28).** The framing was carried
onto the now-live object without re-checking the curve.

## The live object actually is (verified at source, MonolithConstM.lean + PHUnification.lean)
The **plain v24 Balancer / constant-product** curve + the constant-m lens:
- invariant `(x−α)(y−β) = αβ`  (constant-product hyperbola; `x = α·y/(y−β)`)
- `poolPotential μ(t) = (t−β)³ / (3αβ)`
- `price = μ′ = (y−β)² / (αβ)`
- `R = μ″ = 2(t−β)/(αβ) ≥ 0` ONLY on the operating domain `t ≥ β`
- lens `g_loc = m·γ` rides on top as a calibration field.

## What's solid vs what's GH-line baggage
- **SOLID for the live curve (proven, trusted-from-prover):** it is a **convex-/Hessian-potential
  port-Hamiltonian object** — `price = ∇μ`, `R = ∇²μ ⪰ 0` (on t≥β). `price_is_grad` + `R_psd`. The
  PH-cotangent-lift / ω≡0 / not-metriplectic structural points stand.
- **GH-LINE BAGGAGE — does NOT transfer as stated:** "μ = the **GH** cumulant-generating function,"
  "R = **Fisher** metric of the GH measure," "**dually-flat exponential family**." The GH CGF
  (CLOSEOUT_cgf/GHmeasure: ψ(θ)=mθ+δ(√(α²−β²)−…)) is a *different* μ from the Balancer cubic. The
  Balancer cubic is convex only on t≥β ⇒ it is **not even a global CGF**.
- **OPEN (was asserted, now downgraded):** whether the Balancer constant-product potential has ANY
  genuine information-geometric / CGF / exponential-family reading. Unestablished. Do NOT claim
  "information-geometric base" for the live curve until re-derived clean.

## Status
- The morning answer to operator entry 239 ("info-geo base = GH CGF") is **PARTIALLY RETRACTED**: the
  PH/Hessian-potential structure holds; the GH-CGF/Fisher/info-geometry identification is GH-line and
  unverified for the live Balancer curve.
- Re-examination commissioned: research-lead to re-derive the encompassing structure for the LIVE
  Balancer+constant-m curve, stripped of GH baggage; skeptic to re-gate. Until then the honest
  singular-object label is: **a convex-/Hessian-potential port-Hamiltonian object on the Balancer
  constant-product curve** (NOT GH, info-geo reading OPEN).
- Second framing overreach in a row (after the proof-weld FLAG) — pattern noted; tightening.
