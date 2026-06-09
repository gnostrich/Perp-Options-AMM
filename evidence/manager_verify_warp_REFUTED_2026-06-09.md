# Manager verification — GH "γ=w/(1−w) warp" hypothesis REFUTED · 2026-06-09

Hypothesis (manager): slaving the GH convexity γ to the live weight via γ=w/(1−w) (the verified
αh=1/(1−w) tie, applied dynamically) would reproduce the Balancer curve-warp on the GH curve.

## VERIFIED — REFUTED. Harness: engine/verify/verify_gh_balancer_warp.cjs
Measured curve elasticity d ln y/d ln x along the GH curve (Balancer's defining quantity = −γ at w=γ/(γ+1)):

| γ | Balancer −γ | GH @δ=0.08 | GH @δ=30 (Bal-limit) |
|---|---|---|---|
|1.2| −1.20 | −0.19 | −2.34 |
|1.5| −1.50 | −0.09 | −2.08 |
|2.0| −2.00 | −0.02 | −1.75 |
|3.0| −3.00 | −0.00 | −1.30 |
|4.0| −4.00 | −0.00 | −1.02 |

TWO decisive failures:
1. GH elasticity ≠ −γ at any δ (engine δ → ~0 = the flat curve; δ=30 doesn't match either).
2. **γ-trend is ANTI-correlated**: as γ↑, Balancer steepens (−1.2→−4), GH flattens (−2.3→−1.0). Opposite.
   ⇒ the γ↔w tie is a parameter LABEL, not a curve identity. Slaving γ=w/(1−w) does NOT warp like Balancer.

## CONCLUSION
GH and Balancer are GENUINELY DIFFERENT curve families in (x,y) reserve space. Shared: a parameter map
(γ↔w) + a limiting relationship (GH→Balancer only as δ→∞, unreachable). NOT shared: the (x,y) curve shape
(GH is not a constant-elasticity power law) and the warp (Balancer's reshape-on-trade does NOT transfer to GH).
The recurring "GH derives from Balancer + warps via the weight" hope is NOT realizable in (x,y) — now measured.

FORK (settled): GH (value∝S^(−γ) pricing, no (x,y) warp) OR Balancer/CES (warp, re-examine pricing). Not both.

Confidence HIGH (clean monotone anti-trend). Caveat: δ→∞ Gaussian limit may converge but is not buildable.
research-lead to INDEPENDENTLY CHECK this refutation before it becomes canonical. Supersedes the ½-vs-1
contradictions (ARISTOTLE_hyperbolic_curve.md vs gh_gates_reference.py) once research-lead confirms.
