# Manager audit — strong-form trades-warp (the open #16)

_Manager independent re-derivation of `notes/research/TRADE_WARP_strongform_2026-06-10.md` (research-lead).
Tool: python3 float64 `/tmp/verify_warp.py` (transcribed in chat) + hand algebra + HEAD code-read.
NO engine edit. Skeptic mandatory pass PENDING._

## The map (verified)
State `{x,y,φ}`, params `w_mid,Δw,τ`; weight field `w(u;φ)=w_mid+(Δw/2)(u−φ)/√(τ²+(u−φ)²)`, `u=ln(y/x)`.
Cash leg `dy`: conserve `α=x·w`, `β=y·(1−w)` ⇒ `w*=1−β/y'`, `x'=α/w*`; `t=(w*−w_mid)/(Δw/2)`,
`z=t·τ/√(1−t²)`, `φ'=ln(y'/x')−z`. (Step = the paper's slope-goal-seek, field-lifted.)

## Re-derivation results — ALL hold
| check | result |
|---|---|
| field consistency `w(u';φ')==w*` | **exact, \|d\|=0** |
| **same trajectory hyperbola** `(x'−α)(y'−β)=αβ`, α/β conserved | \|d\|=**2.8e-17** (hand-proof: `(x−α)(y−β)=xy·w(1−w)=αβ` identically both pre & post) |
| **pricing curve REshapes** (φ moves) — a warp, NOT a fixed-field point-slide | φ: 0 → 0.0247 ✓ |
| path-independence (0.1 vs 0.04+0.06) | **0.0** |
| τ→∞ recovers Balancer (w→w_mid const) | ✓ |
| wing-range cap: `w*` must stay in `(w_−,w_+)` | over-size dy=0.5 → `w*=0.815 > w_+=0.8` correctly REJECTED |

## Discarded-variant diagnosis (verified against code)
The discarded variant = the GH line `v25_gh→v26c` (HEAD). HEAD `tradeUpdate` (line ~1720) reads:
`Y'=Y+dy; u=Q_{β+1}(Y'/(Ny·M)); X'=Nx·(1−F_β(u)); α,β fixed` — it reads `(x,y)` off **fixed** GH
tables keyed on static shape params and **never writes the shape**. GH puts the kernel in the latent
SCORE ⇒ **no scalar weight `w` for a trade to move** (no `w=α/x` analogue). Confirmed: this is why
the GH warp was never implementable; (W) (kernel-in-WEIGHT) has the weight d.o.f. by construction.

## Manager verdict
The strong-form warp is **DEFINED and manager-verified** (analytic + numeric). It genuinely reshapes
the pricing curve on a trade while reserves ride the conserved hyperbola — i.e. it **meets the
operator's "trades warp the curve, not a dot sliding" acceptance clause** (subject to the skeptic
pass). Honest caveats (research-lead's, confirmed): (1) frozen-wing trade-size cap (calibration:
widen Δw / split orders / saturate-clamp); (2) two open consistency lemmas (warp∘rebase commute;
φ-anchor/funding) `[needs-Aristotle]`, not blockers. Nothing trusted-from-prover/verified-in-Lean.
NOT merged; skeptic pass gates the build resume.