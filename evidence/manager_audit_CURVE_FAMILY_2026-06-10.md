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

## ★ CORRECTION (2026-06-10, post-skeptic) — I OWN A MISS
The skeptic's §2.1 pass FLAG-OVERSELL'd §2.3, and **I re-derived it (`/tmp/verify_skeptic.py`) and the
skeptic is RIGHT.** My first audit (above) reproduced §2.3's *arithmetic* (87.349…) but did NOT check
that it solved a self-consistent object — it does not.
- **The inconsistency:** §2.3 differentiates the literal power `V=c·S^(−γ(S))` → `V′/V=−γ/S−γ′·lnS`.
  But §2.2 *defines* `γ_loc` as the value's log-log slope (`−d logV/d logS`), under which
  `V′/V=−γ_loc/S` with NO `γ′` term. The note's "γ(S)" (power) and "γ_loc" (log-log slope) are
  DIFFERENT objects. Numeric demo: for a varying-exponent V, at S=80 the power γ=2.18 but the true
  log-log slope is 4.08 — they are not equal.
- **Consistent smooth-pasting** (intrinsic K−S, value+slope match, γ_loc := −S·V′/V at S*):
  `S* = K·γ_loc(S*)/(γ_loc(S*)+1)` — a clean closed-form fixed point, **γ′ absent.** Across the elbow
  (w∈[0.6,0.8] ⇒ γ_loc∈[1.5,4]) S* is bounded **60–80** (ATM γ_loc=2.333 → S*=70). The 87–98 table is
  the artifact of the inconsistent slope.
- **Corrected status of the GATE:** the obstruction is **OVERSTATED**. Closed-form settlement is NOT
  demonstrably fragile in the elbow; the inherited fixed-point relation still holds locally. The
  REAL open question is narrower: *does value remain locally a single power with exponent γ_loc
  through the elbow, or only piecewise?* — never cleanly posed in the note.
- **My miss (own it):** charter = the more confident the claim, the harder I check; §2.3 wore the
  numbers and I verified the numbers, not the modeling consistency. 2nd time today the
  confident-magnitude piece broke (skeptic's "blind-spot pattern #1"). The §2.1 ordering (skeptic >
  manager on claims) did its job. Note carries a manager CORRECTION HEADER; §2.3 magnitude + "gate
  blocks rebuild" framing RETRACTED pending the narrower question.

## ★ PASS-2 verification (2026-06-10) — settlement blend + magnitude
Re-derived `notes/research/CURVE_FAMILY_settlement_pass2_2026-06-10.md` (`/tmp/verify_pass2_mag.py`):
- **Qualitative verdict CONFIRMED:** under the dynamic optimal-stopping reading (Reading B), value is
  a genuine blend through the elbow (Riccati slope −p ≠ curve γ_loc); base case S*_dyn 65.32 (τ=0.3) /
  63.66 (τ=0.05) reproduce the note byte-close; shift vs local fixed point +6.2% / +6.0%. Settlement
  EXACT on wings / under Reading A / wing-registered strikes. The `γ_loc′/(2γ_loc+1)` correction is real.
- **Skeptic FLAG-OVERSELL CONFIRMED (magnitude parameter-dependent):** wider skew band
  (w_mid=0.6,Δw=0.3) → +12.1% (τ=0.3) / +11.8% (τ=0.05) / +8.3% (τ=1.0) on the SAME Gaussian-slice
  generator — ~2× the base headline, before any full-GH-ψ effect. So "few percent / substantially
  passable" is NOT settled truth; magnitude grows with Δw and 1/τ; exact-GH elbow size = [needs-numeric].
- **I told the operator "a few percent, small and bounded" in a status update — that was OVERSOLD;**
  corrected to the operator. Note carries a manager CORRECTION HEADER. Settlement remains a Reading-A-vs-B
  semantics fork (operator-tier, §7) — escalated, NOT presented as small/passable.

## Provenance
Numeric + analytic by manager (both the original reproduction AND the correction). Nothing
trusted-from-prover or verified. Curve note NOT merged to main; the skeptic FLAG stands on §2.3/§2.5
and is a §2.1 halt on promoting "gate fails" as truth — resolved here by retraction, not by out-waiting.