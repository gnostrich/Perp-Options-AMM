# VERDICT — WARP kurtosis sweep, the two FINER table claims (skeptic verdict #15)

_Artifact: `notes/research/WARP_kurtosis_sweep_2026-06-10.md` (research-lead), its MANAGER
VERIFICATION header. Operator entry 26. The sweep CORE (no usable τ matches v24's full warp:
γ₋<1 at the symmetric match; wing leverage collapses ~1/u³) was already manager-re-derived and is
consistent with my reconcile (verdict #13). This pass = the two finer claims that were anchored to
my reconcile baseline but NOT yet independently checked by me. Independent re-derivation:
`/tmp/skeptic_sweep_finer{,2,3}.js`, `/tmp/skeptic_reconcile_f.js` — built fresh, NOT a rerun of
the research-lead's `warp_sweep_*.js`; v27 functions transcribed to match engine
`temporal_mvp_v27_wkurtosis_WIP.html` wField L1631-1644 / tradeUpdate L1719-1741 (verified faithful,
verdict #14); v24 = conserved-hyperbola trade (verdict #13)._

## CLAIM 1 — elbow-warp ceiling: same-sign sup ≈0.9999, only at τ→∞/Δw→0, never 1.0 → **PASS (with a precision footnote)**
Re-derived on my own code path. Two parts, both hold:
- **The structural claim is CORRECT and is the load-bearing one.** The same-sign (correct-direction,
  ratio>0) elbow ratio **NEVER reaches or exceeds 1.0** at ANY setting — my fine sweep flagged
  `ratio>1 anywhere = false` for every τ from 0.3 to 1000. It approaches 1 strictly from below, and
  ONLY as the curve degenerates to flat Balancer: the max same-sign ratio is attained at the smallest
  admissible Δw (→0), where the elbow curvature dw/du(0)=(Δw/2)/τ → 0 — i.e. vanishing kurtosis. At a
  USABLE kurtosis τ=0.3, driving Δw→0 caps the ratio at ~0.996 and only gets there as dw/du(0)→0.
  This is exactly the note's "approaches 1.0 only in the τ→∞, Δw→0 flat-Balancer limit where the
  kurtosis knob is gone."
- **PRECISION FOOTNOTE (not a flag — note already self-frames it):** the literal number "sup ≈0.9999"
  is the research-lead's FINITE-GRID maximum, not the true supremum. `warp_sweep_5.js` caps τ at 3.0
  (line 13), so its max landed at **0.99990 (τ=3, Δw=0.02, f=2%)** — which I reproduced
  byte-comparable on my independent path (**0.999898** at the same point). When I extend the τ-grid
  the sup keeps climbing: 0.99996 (τ=100), 0.999996 (τ=1000). So the true supremum is **1.0, never
  attained**; 0.9999 is just where the τ≤3 grid stopped. The note's prose at L114 already says it
  "only approaches" 1.0 "as the curve degenerates toward flat ordinary Balancer — the τ→∞ limit," so
  it does not OVERSELL 0.9999 as a hard ceiling — it presents it as the approached value tied to the
  degenerate limit. Verdict: the claim as WRITTEN is honest; the number 0.9999 should be read as
  "grid-max ≈ true sup of 1.0, never reached," which is what the note says.

## CLAIM 2 — sign trap: widening Δw past ≈τ/2 lifts |elbow warp| above v24's but FLIPS the sign → **PASS (exact reproduction)**
Reproduced the entire decoupling table (τ=0.3, 10% trade) on my independent path, byte-level vs the
note (note values in parens):
| Δw | my ratio@elbow | note | φ' |
|---|---|---|---|
| 0.15 (=τ/2, matched) | **+0.2508** | +0.251 | −4.63e-2 |
| 0.30 | **−0.9180** | −0.918 | +8.69e-2 |
| 0.50 | **−2.1637** | −2.164 | +1.27e-1 |
| 0.80 | **−4.0583** | −4.058 | +1.48e-1 |
| 0.98 | **−5.2950** | −5.295 | +1.54e-1 |
The named case Δw=0.30, τ=0.3 → **ratio = −0.9180** (note: ≈−0.918) confirmed exactly. The
MECHANISM is confirmed: on the same 10% sell, v24's scalar w moves UP 0.5→0.5455 (one direction)
ALWAYS; v27's φ-recenter is NEGATIVE at the matched Δw=0.15 (φ'=−0.046) and **crosses to POSITIVE**
once Δw>~0.15 (φ'=+0.029 at Δw=0.20, +0.087 at Δw=0.30) — the field recenters the OPPOSITE way, so
the curve bends opposite to v24. So you can force |ratio|>1 by widening Δw, but only by reversing the
deformation direction: it is a DIFFERENT/opposite deformation, NOT a match. Confirmed, not refuted.

## DOES THE OVERALL "NO usable τ match" VERDICT STAND? — **YES.**
Both finer claims hold on my independent re-derivation, and they corroborate (do not contradict) the
manager-verified CORE and my own reconcile (#13). The correct-direction elbow warp never reaches
v24's magnitude except in the degenerate flat-Balancer limit (kurtosis gone); the only way to exceed
it is the sign-flip (wrong-direction deformation); and the matched settings sit at the ordinary-CPMM
w_mid=0.5 comfort point that forces γ₋<1 (CORE, manager-verified). The verdict — **NO usable,
design-valid τ matches v24's full warp** — stands.

## Scope honesty (carried, not re-opened)
- All numbers at the symmetric (10,10), w_mid=0.5 comfort pool — the same caveat the note states at
  L181-184. A shipped asymmetric γ>1 pool is a separate sweep; the sign/ceiling STRUCTURE is
  geometric (uniform-scale vs localized-recenter, frozen wings cap the wings) and carries, but exact
  magnitudes there are not what I verified here. Note is honest about this.
- This was a narrow confirm/refute, NOT a re-open of the verdict (manager-verified core + my #13
  reconcile). Nothing here disturbs the inventory disposition: #1/#2/#3 Considered, #16 the live
  warp-with-trades object (cleared by #12). No new FLAG raised. Convergence-alarm LOW (self-
  adversarial note, every digit reproduced on an independent path; note's prose pre-states the one
  imprecision I found).

_skeptic, 2026-06-10. NO engine edit, NO git, NO Aristotle. Path returned to operator via manager._
