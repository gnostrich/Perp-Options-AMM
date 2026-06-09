# AIRTIGHT Task 1b — smooth-pasting = optimal exercise boundary (the GENERATED fragment)

Toolchain: Lean 4.28.0 + Mathlib v4.28.0.

## Capability context (from probe c9bd9638 — honest scope)
Mathlib v4.28.0 has stopping-time / optional-stopping / hitting-time plumbing and a full
convexity-optimality toolkit (`IsMinOn`, `IsMinOn.of_isLocalMin_of_convex_univ`, `ConvexOn`,
`HasDerivAt`), but has NO Snell envelope, NO optimal-stopping-value/existence, NO variational
inequality / obstacle problem, NO free-boundary / smooth-fit machinery. So the full chain
"smooth-pasting = the Snell-envelope optimal stopping time" CANNOT be generated from Mathlib —
that stays CARRIED as the standard free-boundary principle.

What CAN be GENERATED with the available toolkit, and is the real optimality content: the
American holder's value, viewed as a function of the chosen exercise boundary `B`, is MAXIMIZED
exactly at the smooth-pasting boundary `S*`. The smooth-pasting point is the stationary point of
the value-over-boundaries objective, and it is a global maximum. This is the deterministic
variational characterization of the free boundary — the part that does not need Snell-envelope
theory.

## Intended math (re-derived by me)
### Call wing
A holder who commits to exercise boundary `B ∈ (0, K)` must value-match the continuation onto the
intrinsic AT B: continuation `a(B)·S^(−γ)` with `a(B) := (1 − B/K)·B^γ` (forced by value-match at B,
no slope condition imposed yet). Since the continuation value `a(B)·S^(−γ)` at any fixed reference
spot is strictly increasing in the coefficient `a(B)`, the holder maximizes `a(B)` over `B`.
  `a(B) = B^γ − B^(γ+1)/K`,  `a'(B) = B^(γ-1)·(γ − (γ+1)·B/K)`.
`a'(B) = 0 ⇔ B = Kγ/(γ+1) = S*_A` (the unique interior critical point on `(0,K)`), and `a` is
strictly concave-then-decreasing there so it is the global MAX on `(0,K)`. AT that maximizing `B`
the value-matched coefficient ALSO satisfies the slope-match (this is the content of "smooth-pasting
= optimum"): the optimal-boundary condition `a'(S*)=0` is EQUIVALENT to the slope-match of R1.

### Put wing (analogous)
Boundary `B > K`, `a(B) := (1 − K/B)·B^(−γ)` (value-match), holder maximizes (continuation
`b·S^γ` increasing in coefficient). `a'(B)=0 ⇔ B = K(γ+1)/γ = S*_B`, the global optimum on `(K,∞)`.

`γ > 1`, `K > 0`.

## Lean (project `RequestProject`, file `RequestProject/Optimality.lean`, standalone `import Mathlib`)

### GENERATED targets (prove these with the available toolkit — they are the deliverable)
Define `coeffOfBoundary_A K γ (B : ℝ) : ℝ := (1 - B/K) * B ^ γ` (the value-matched coefficient for a
chosen call-wing boundary `B`; `Real.rpow`). Then:

- **`opt_boundary_is_critical_A`**: `HasDerivAt (coeffOfBoundary_A K γ) 0 (Sstar_A K γ)` where
  `Sstar_A K γ = K*γ/(γ+1)` — the smooth-pasting boundary is a CRITICAL point of the holder's
  value-over-boundaries objective. (This is the GENERATED optimality stationarity.)
- **`critical_iff_smoothfit_A`**: the stationarity `a'(B)=0` (for `B ∈ (0,K)`, `B>0`) holds IFF
  `B = Sstar_A K γ` — i.e. the optimal boundary is UNIQUELY the smooth-pasting boundary. (Couple
  to R1/Task-1a: at this B the value-matched coefficient equals `coeffA K γ` and the slope matches.)
- **`opt_boundary_is_max_A`**: `coeffOfBoundary_A K γ` attains its maximum over `B ∈ Set.Ioo 0 K`
  at `Sstar_A K γ`: `∀ B ∈ Set.Ioo (0:ℝ) K, coeffOfBoundary_A K γ B ≤ coeffOfBoundary_A K γ (Sstar_A K γ)`.
  (Use the sign of `a'`: increasing on `(0,S*)`, decreasing on `(S*,K)`; or `StrictConcaveOn` +
  stationarity via the convexity toolkit. The holder's value is GENUINELY maximized at S*.)
- Put wing analogues: `coeffOfBoundary_B K γ B := (1 - K/B) * B ^ (-γ)`,
  `opt_boundary_is_critical_B`, `critical_iff_smoothfit_B`, `opt_boundary_is_max_B` on `Set.Ioi K`.

### CARRIED target (state honestly as a CARRIED standard principle — do NOT fake)
- Add ONE clearly-labelled `def`/structure capturing the standard free-boundary principle as a
  CARRIED hypothesis: e.g.
  ```
  /-- CARRIED (standard free-boundary / Snell-envelope principle, NOT proved in Mathlib v4.28.0):
      the value-over-boundaries optimum coincides with the optimal stopping time of the American
      problem (Snell envelope). Mathlib lacks Snell-envelope / optimal-stopping-value machinery. -/
  structure AmericanOptimalityPrinciple (K γ : ℝ) : Prop where
    boundary_is_snell_optimum : True   -- placeholder for the carried principle
  ```
  Do NOT prove this as if it were generated; it is the explicitly-named carried bridge from
  "deterministic value-maximizing boundary" to "Snell-envelope optimal stopping time". State in
  ARISTOTLE_SUMMARY.md exactly what is GENERATED (the deterministic variational characterization)
  vs CARRIED (the Snell-envelope identification).

## HARD CONSTRAINTS (violation = reject)
- The GENERATED targets must be real: the critical-point, the iff, and the maximum must be proved,
  not assumed. The CARRIED principle must be clearly marked as carried (a named hypothesis/structure),
  never dressed up as a Mathlib-generated theorem.
- No `sorry`/`admit`/`native_decide`/`sorryAx`/`opaque`/`unsafe`, no new `axiom` (the carried
  principle is a `structure`/`def` field, NOT an `axiom` declaration).
- Prefer concrete proofs; FLAG `grind`/`exact?`/search tactics in final bodies under "FRAGILE
  TACTICS". If a GENERATED target cannot close, leave ONE `sorry` and report under "COULD NOT CLOSE".

## Output spec
- `RequestProject/Optimality.lean` compiles server-side.
- `#print axioms` for each GENERATED theorem ⊆ {propext, Classical.choice, Quot.sound}.
- ARISTOTLE_SUMMARY.md: GENERATED vs CARRIED split, SIGNATURE ADJUSTMENTS, FRAGILE TACTICS, COULD NOT CLOSE.
- Only `RequestProject/Optimality.lean` changes; do NOT touch `lakefile.toml`, `lean-toolchain`.
