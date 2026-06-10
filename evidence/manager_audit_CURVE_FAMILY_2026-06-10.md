# Manager audit — curve-family derivation (pass 1)

_Manager independent re-derivation of `notes/research/CURVE_FAMILY_derivation_2026-06-10.md`
(research-lead). Tool: python3 + numpy/scipy float64, script `/tmp/verify_curvefamily.py` (transcribed
in this commit's chat). Analytic hand-check of smooth-pasting + numeric. NO engine touched, NO Lean
this pass. Skeptic adversarial §2.1 pass IN FLIGHT (agent a8986778) — this audit is the numeric leg only._

## Re-derived numbers — ALL reproduce the note
| claim (note loc) | note | my re-derivation | verdict |
|---|---|---|---|
| Settlement S* with varying exponent, γ=3,K=100 (§2.3) | 75.0 / 87.35 / 96.15 / 97.96 (γ′=0/.01/.05/.10) | **75.000 / 87.349 / 96.146 / 97.955** | ✓ exact |
| closed-form Kγ/(γ+1) = γ′=0 row | 75 | 75.000 | ✓ |
| invariant logF constancy along RK4 frontier (§1.1) | std 1.4e-13 | std 1.1e-13 / 3.1e-14 / 3.3e-14 (3 param sets) | ✓ |
| cosh/√ identity √(τ²+u²)=τ·cosh(asinh(u/τ)) (§1.2) | 9e-16 | max err ~1e-14 over u∈[−20,20] | ✓ |
| wing weights → exact CD, τ-independent (§1.3c) | w₊=.8, w₋=.6 exact | w(±1e6)=0.8000000000/0.6000000000 all τ | ✓ |
| elbow half-width \|u\|@γ′_loc<1e-2 (§2.4) | 0.85 / 2.80 / 6.19 (τ=.05/.3/1) | 0.85 / 2.80 / 6.19 | ✓ |

## Analytic hand-check (smooth-pasting), independent
Continuation `V=c·S^(−γ)`, intrinsic `(K−S)`: value-match `c·S*^(−γ)=K−S*`, slope-match
`V′(S*)=−1` ⇒ `(K−S*)·(γ/S* + γ′·lnS*) = 1`. At γ′=0 this gives `S*=Kγ/(γ+1)` (=75 at γ=3,K=100) —
matches the locked architecture. Non-zero γ′ shifts S* exactly as the table. Derivation is mine; the
note's formula is correct.

## Manager nuance (tempers the magnitude, NOT the verdict)
- **§2.3 is a LINEARIZED heuristic** (`V=c·S^(−γ(S))` with γ′ as a local slope), NOT the exact
  solution of the varying-coefficient pricing ODE in the elbow. It correctly demonstrates the
  inherited closed form is **non-robust** to a varying exponent, but the precise shift size is
  illustrative, not the true elbow continuation.
- **The load-bearing rigorous claim is §2.2 (structural):** on the warp curve `γ_loc(u)=w(u)/(1−w(u))`
  is constant ONLY on the frozen wings; in the elbow it varies, so the continuation is not a single
  power `S^(−γ)` and the inherited `S*=Kγ/(γ+1)` does not apply there. This is analytic and solid.
- **VERDICT "rebuild gate NOT cleared" is sound.** It clears for wing-registered strikes; fails as
  inherited for elbow strikes; whether a *different* closed form exists for the elbow continuation
  (note §2.5 path 2) is genuinely OPEN. Where strikes register (wing vs elbow) is operator/calibration.

## Provenance
Numeric + analytic by manager. Nothing trusted-from-prover or verified this pass. Curve note NOT yet
merged to main — pending the skeptic adversarial verdict (§2.1 mandatory pass before merge).