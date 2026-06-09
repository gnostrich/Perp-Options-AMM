# Manager verification — v24 vs GH slippage / equivalence (CORRECTS research-lead) · 2026-06-09

research-lead (agent a040670244d2) returned a confident verdict on v24↔GH equivalence. I independently
verified (`engine/verify/slip_exp_v24_vs_gh.cjs`, sandboxing both engines, measuring
`d ln(getMP_raw)/d ln(getSNorm)` across states via arbitrageToOracle sweeps). **research-lead's GH
slippage exponent is WRONG; I caught it. Did NOT relay its "operator has it backwards" framing.**

## MEASURED (clean, reproducible)
- **v24 (Balancer):** `d ln(mp)/d ln(sNorm) = −2.0000`, CONSTANT across states (w drifts 0.83→0.17).
  ⇒ v24 slippage exponent is FIXED/state-independent. [matches research-lead]
- **GH (playground):** `d ln(mp)/d ln(sNorm) = −0.667 / −0.500 / −0.333` at γ=1.5/2/3 = **−1/γ**.
  Derivable: mp∝S (eq), sNorm∝S^(−γ) ⇒ −1/γ. **research-lead claimed −(γ+1) (−2.5/−3/−4) — WRONG.**

## CONSEQUENCES
- **v24 ≠ GH (not equivalent): CONFIRMED** — operator's conclusion holds. v24 exp −2 (fixed); GH exp
  −1/γ (fixed, γ-tunable). Both fixed power laws, different values ⇒ genuinely different slippage.
- **v24↔GH correspondence is AMBIGUOUS (metric-dependent), NOT the clean "γ=1" research-lead claimed:**
  - by SLIPPAGE (−2 = −1/γ): v24 ≈ GH at **γ=½**.
  - by VALUE LAW (value∝S^(−γ)): v24 = GH at **γ=1**.
  This is the SAME ½-vs-1 contradiction baked into the project's own materials
  (`engine/knowledge/ARISTOTLE_hyperbolic_curve.md` says "γ=½ recovers Balancer, verified";
  `gh_gates_reference.py`/`INTERN_NOTE` say γ=½ invalid for the Esscher GH). UNRESOLVED.
- **DOUBLE-COUNT (manager-right claim): NOT settled.** research-lead's double-count conclusion leaned on
  the wrong −(γ+1); do NOT treat it as established. Needs clean re-derivation.

## STATUS
Operator's instinct (not equivalent, slippage differs) borne out. research-lead's clean
"GH=v24 at γ=1, GH slippage −(γ+1), double-count confirmed" verdict is partly erroneous (exponent) and
partly over-clean (½-vs-1 ambiguity). **Clean re-derivation owed** before any conclusion on the warp/
double-count — value-law vs slippage coordinate relationships, the real correspondence, then double-count.
Did NOT relay research-lead's "operator misunderstanding" framing to the operator.
