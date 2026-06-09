# Manager audit — Aristotle RUN-2 (CTPH clean + GH-grounding) + a SELF-CORRECTION (2026-06-09)

## ⚠ SELF-CORRECTION on my RUN-1 audit method (own it)
My RUN-1 token-scan command used `grep -rnED '<pattern>' …`. **`-D` takes an argument** (device action),
so it SILENTLY CONSUMED the pattern and matched nothing — the scan was broken in both RUN-1 and RUN-2.
I read "no forbidden tokens" for the wrong reason. I caught it only because I ALSO **read the files** and
saw bare `sorry` in the RUN-2 dir-root templates — which is exactly why "read the proofs" is in the
discipline and a token-scan is never sufficient alone.

**Re-scanned CORRECTLY** (`grep -rnE`, no `-D`) on the RETURNED SOLUTION files of BOTH runs:
- The dir-root `<NAME>.lean` files in RUN-2 (`GHJ_grounded/GHJgrounded.lean`, etc.) are the **submitted
  TEMPLATES** (sorry placeholders to fill) — NOT proofs. The **returned solutions** live under
  `<dir>/extracted/proj_aristotle/RequestProject/<NAME>.lean`.
- **All returned solution obligation files (RUN-1 + RUN-2): `sorry`=0, `admit`=0, `native_decide`=0,
  `sorryAx`=0, no `opaque`/`unsafe`/`axiom` decls.** The only token matches are inside COMMENTS
  (e.g. CTPH_clean's "`exact?` … replaced by", GHcoercive's "instead of being an opaque hypothesis").
- The ONLY live `exact?` is in the **superseded** RUN-1 `CTPH` (`CTPH.lean:33`), already HELD; the
  RUN-1 conclusion is therefore re-confirmed by a correct scan, not just luck.
- **HYGIENE FLAG:** the sorry-bearing RUN-2 templates are committed under `formal/aristotle_runs/` (NOT
  in any build path — canonical lib = `formal/temporal_lean_verified/`, so they don't poison anything).
  Convention: dir-root `<NAME>.lean` = submitted template; `extracted/.../<NAME>.lean` = returned proof.

## RUN-2 independent verification (corrected basis)
- **Canonical tree untouched** — `git status formal/temporal_lean_verified/` empty. ✓
- **Base modules byte-identical** to canonical in all 5 RUN-2 archives (AMMCurve/Temporal/Seam). ✓
- **CTPH_clean:** the `exact?` is GONE from the returned solution — replaced by the concrete term
  `skew_quadForm_zero hJ z` (verified: live `exact?`=0, comment-only mentions). The dissipation
  inequality `dH/dt = uᵀy − zᵀRz ≤ uᵀy` stands clean. **The HOLD is lifted.** The strengthened
  discrete↔continuous link is an HONEST forward-Euler correspondence on the *sampled storage*
  (per-tick dissipation ≥0 derived from R PSD; telescoping Riemann sum) — research-lead correctly did
  NOT tie it to a storage floor (floor = B1, external; a fabricated one would fail audit). Not a
  uniqueness claim about the engine's system. Fold as trusted-from-prover.
- **GHJ_grounded — solution proofs verified by me:** `esscher_core`
  (`exp(−αh√(δ²+v²)+(βh+1)v)=exp(v)·exp(…+βh·v)`, true as `(βh+1)v=βh·v+v`), `density_ratio`,
  `gh_slope_law`, `slope_translation` — all real exp-algebra; hypotheses `Cβ≠0`/`fb≠0` are genuine
  non-degeneracy, NOT vacuous/false. Genuinely GH-closed-form-derived.
- **PH3_grounded:** GH arb-leak ≥0 derived from the monotone GH slope law (LVR one-way), not an
  abstract PSD matrix. Necessary-not-sufficient preserved.
- **GHcoercive_grounded / PH4b_grounded — PARTIAL (honest):** GH reserve ranges / bounded-above
  poolValue DERIVED from `T∈(0,1)` (tail prob) / `C∈(0,1)` (CDF), but `T<1`/`C<1` carried as hypotheses
  (the defining property of a tail/CDF; the GH special-function tables aren't formalized). Reasonable —
  "grounded modulo standard probability facts." Full GH `AMMCurve` instance stays the open lift.

## ECONOMIC-OBJECT FINDING — characterization, NOT a defect (relay to operator)
The long-standing watch-flag ("if the GH trade conserves no clean invariant → economic object") is
**RESOLVED, and NOT tripped in the bad sense.** **GH conserves no algebraic X·Y-style product invariant**
— numerically X·Y spans orders of magnitude along the frontier — but that's **by construction** (GH is
value∝S^(−γ), explicitly NOT constant-product). What GH **does** conserve, now DERIVED from the closed
forms: the **latent one-parameter (rapidity) group `u↦u+δ` + the Esscher tilt** (the slope law
`slope = P·e^(u−μ)` scaling by `e^δ`). So the PH-2 lossless-routing / skew-J structure **holds for GH**,
realized as a group action on the slope law rather than a product invariant. **No engine change. One
paper implication:** describe PH-2's conserved quantity as the rapidity-group/Esscher structure, NOT as
a CPMM X·Y-analogue. This is the honest answer to the watch-flag.

## Net
Both runs sound; nothing weakened; canonical core untouched; CTPH hold lifted; GH-grounding is real for
GHJ/PH3 and honestly-partial for GHcoercive/PH4b. My RUN-1 method had a broken grep — conclusion
re-confirmed by a correct scan + reading. Label stays trusted-from-prover (operator: sufficient).
