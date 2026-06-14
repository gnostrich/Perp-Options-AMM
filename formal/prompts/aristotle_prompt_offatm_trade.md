# Aristotle prompt — OFFATM_trade (off-ATM trade-at-point transition rule)

_research-lead, 2026-06-12. Formalizes the operator ruling on off-ATM trade semantics
(`notes/operator_ruling_2026-06-12_offATM_trade_rule.md`; spec
`specs/SPEC_trade_at_point_transition_rule.md`). Standalone file, `import Mathlib` only._

## Task

Fill the 9 `sorry`s in `OffATMTrade.lean`. Do NOT change any theorem statement, definition,
hypothesis, or the two `def`s (`deltaX`, `deltaW`). Proof bodies only.

## Mathematical content (all pre-verified numerically/symbolically)

State (x,y,w) ∈ ℝ>0 × ℝ>0 × (0,1). Trade point of ray θ on the pool curve x^w·y^(1−w)=k:
on the ray, x_T^w·(θx_T)^(1−w) = x_T·θ^(1−w) (rpow algebra over positives), so the curve
equation is linear in x_T — unique positive solution x_T = k·θ^(w−1).

Transition: Δx = −α_T β_T Δy/((y_T−β_T)(y_T+Δy−β_T)), Δw = β_T Δy/(y_T(y_T+Δy)) with
α_T = x_T w, β_T = y_T(1−w). Use y_T − β_T = w·y_T and y_T + Δy − β_T = w·y_T + Δy.
Simplified forms: Δx = −x_T(1−w)Δy/(w·y_T+Δy); w′ = w+Δw = (w·y_T+Δy)/(y_T+Δy).

1. `tradePoint_exists_unique` — reduce the curve equation on the ray to linearity via
   `Real.rpow_add`/`mul_rpow` (positivity available); witness x_T = (x^w·y^(1−w))·θ^(w−1).
2. `wNext_eq` — field_simp/ring with yT ≠ 0, yT+dy ≠ 0.
3. `wNext_mem_Ioo` — from hpole: w·yT+dy > 0 and yT+dy = (1−w)·yT + (w·yT+dy) > 0;
   w′ = (w·yT+dy)/(yT+dy) ∈ (0,1) since 0 < numerator < denominator (w < 1, yT > 0).
4. `next_state_valid` — conjunction of hypotheses + item 3.
5. `pole_does_not_bound_state` — arithmetic; middle conjunct is rpow:
   1^(1/2)·100^(1/2) = 10 = 10^(1/2)·10^(1/2) (e.g. via Real.rpow_natCast/sqrt lemmas or
   mul_rpow: 10^(1/2)·10^(1/2) = 100^(1/2)).
6. `local_conservation` — pure field algebra. Nonzero denominators from hypotheses:
   yT ≠ 0; yT+dy > 0 (item 3); yT−yT(1−w) = w·yT ≠ 0; yT+dy−yT(1−w) = w·yT+dy ≠ 0 (pole).
   Both conjuncts are identities after field_simp; verified exactly in ℚ.
7. `spot_reduction_global_conservation` — first two conjuncts = item 6 with xT:=x, yT:=y.
   Third (hyperbola): from conservation, x′−α = x′(1−w′) and y′−β = y′w′, so the product is
   (x′w′)·(y′(1−w′)) = αβ; or direct field_simp/ring.
8. `w_storage_necessary` — exhibit: deltaW 20 (1/2) 1 = 1/42, deltaX 5 20 (1/2) 1 = −5/22;
   11/21 ≠ 22/43 by norm_num. Unfold the defs (they are concrete rationals), then norm_num.
   Middle conjunct rpow: 5^(1/2)·20^(1/2) = 100^(1/2) = 10 = 10^(1/2)·10^(1/2).
9. `offATM_distinct_operator_signature` — same exhibit: α′ = 215/42 ≠ 5; β′ = 110/21 ≠ 5;
   43/42 ≠ 22/21. norm_num after unfolding.

## Constraints

- Toolchain: Lean 4.28.0, Mathlib v4.28.0 (as pinned in the project).
- NO `sorry`/`admit`/`axiom`/`native_decide`/`opaque`/`unsafe`. Kernel `decide` OK.
- Do not weaken any statement; do not add hypotheses; do not touch the defs.
- Prefer concrete closing tactics over `grind`/`exact?` search artifacts in the final file.
- Report `#print axioms` for every theorem (must be ⊆ {propext, Classical.choice, Quot.sound}).

## Output

The completed `OffATMTrade.lean` + build confirmation + axiom report.
