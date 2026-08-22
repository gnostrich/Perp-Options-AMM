# HANDOFF — the v24 + polar-lens architecture (operator-specified, 2026-06-11)

_Purpose: self-contained handoff of the lens development for the session working on the
overarching singular mathematical object. Status: **architecture fully specified by the operator**
(transcript entries 80–88); derivation run in flight (read-only); **nothing built** — engine HEAD
untouched at md5 `928cde1c`. Source transcript: `history/operator/2026-06-10_kurtosis-curve-family-brief.md`._

## The object in one paragraph

A plain weighted-Balancer pool carries ALL liquidity mechanics; a single **polar lens** in the
query layer carries ALL kurtosis. The pool curve is `x^w·y^(1−w)=k` with one steepness knob `w`
(weights of x and y always complementary, sum to 1). Every option-facing query — trade execution
at a strike, settlement, funding — reads the strike's coordinate **through a lens** `h_τ` that
splays distances around the mode (the at-the-money ray): near the money, lensed distances
compress (flat top on the option surface); far out, the lens goes to identity (wings keep their
exact power-law asymptotes — **no saturation, no premium floor**). Trades skew the pool curve
(dynamic skew); the lens never moves (static kurtosis); put/call asymmetry is produced natively
by the pricing layer, not by pool shape.

## Core formulas

| What | Formula | Plain English |
|---|---|---|
| Pool curve | `x^w · y^(1−w) = k` | plain Balancer; w = the ONE steepness knob; γ = w/(1−w) is the curve's bend |
| Trade mechanic | `α = x·w`, `β = y·(1−w)` conserved per trade; `w = α/x` after | trades change w — the curve skews instead of a dot sliding (v24 mechanic, paper-faithful) |
| The lens | `h_τ(u) = √(τ² + u²) − τ`, `u` = log-moneyness from the mode | one knob τ = lens extent; h′ runs 0 (at mode) → 1 (wings) |
| Option value law (curve 2) | local decay exponent = `γ · h′_τ(u)` | flat top around the money melting into frozen power-law wings of exponent γ |
| Warp goal-seek | post-trade slope restored at **the trade point, in the lensed coordinate** | operator ruling, entry 88 |
| Settlement | smooth-pasting free boundary re-derived through the lens (ATM-jump fix ported) | in flight (derivation item b) |

## Operator rulings that define it (each cites its transcript entry)

| Ruling | Entry |
|---|---|
| Pool needs exactly ONE flatness/steepness knob; put/call asymmetry is native to the second-graph pricing logic, not pool shape | 80 |
| Kurtosis = lens extent, query layer, splaying around the mode; AMM tx + settlement + funding work through the lens | 84 |
| Implements upon v24, surgical; warp goal-seek and the vertical-spread one-tx shortcut stay intact; settlement ATM-jump fix ported at feature level | 85 |
| **Goal-seek = trade point seen through the lens** | 88 |
| Skew is dynamic, from trading (x, y, w); steepness/kurtosis static, vol-set | 3, 14, 16 |
| Asymptotes preserved — any construction that floors/saturates the deep wings is disqualified | 55(1), 60 |
| Monotonicity (no-arbitrage) is a binding gate | 55(3) |
| Balancer axiom: the two weights are complementary and sum to 1, always | 73 |

## Verified so far (manager, numeric, 2026-06-11)

| Claim | Evidence |
|---|---|
| Lens gives a one-knob kurtosis on curve 2 with frozen wings and untouched pool curve | local-decay table: at γ=2.64, slope near mode 0.18–1.87 by τ, all columns → 2.64 in wings |
| Lens slope strictly positive ⇒ value monotone (basic no-arb) | h′ = u/√(τ²+u²) > 0 for u>0 |
| At a resting (arbed) pool, every w gives the same tangent at the live point; w shows in resting depth (y = x·oracle/γ) and second-order bend (×(γ+1)) | resting-pool table: w=0.5 ⇒ y=$800k, w=0.725 ⇒ $303,448, w=0.9 ⇒ $88,889; slope $80,000 in all three |

## Derivation RESULTS (research-lead `notes/research/V24_LENS_derivation_2026-06-11.md`; skeptic-checked `notes/skeptic/VERDICT_V24_LENS_derivation_2026-06-11.md`; manager-reproduced where noted)

| Item | Verdict | Detail (honest labels) |
|---|---|---|
| (a) divergence / strike cap | **WORKS — no cap needed** | Plain Balancer has no `w(u)` field ⇒ no root-find ⇒ no `1/w′→∞` channel; the (W)-era cap was an artifact of the frozen-wing field, gone with the field. Goal-seek = the lens MODE tracks the live marginal (a readout, no solve); round-trip exact, path-independent. **CRITICAL HONEST LABEL (skeptic-required): the trade reshape is STRIKE-BLIND — a trade is closed-form in cash `dy` alone (v24 `tradeUpdate` takes no strike arg); same-cash trade gives the identical warp at every strike. This is the B-style warp, by the operator's own design (entries 84/59), NOT the strike-dependent path-A warp. Strike-dependence did not vanish — it moved to the pricing read `g_loc(\|u−u_mode\|)`.** The scalar `w` moves on trades (pool curve warps); the lens never warps (static kurtosis). |
| (b) settlement | **WORKS-WITH-BOUND** | `S*=K·g_loc/(g_loc+1)` closed form per strike; v26b ATM-jump smooth-paste ports exact (machine-zero). BOUND: flat-top band `\|ln K\|<τ/√(γ²−1)` (±13% at τ=0.3,γ=2.64) where the local exponent g_loc<1 and the American-exercise reading degenerates — **operator-tier settlement-semantics, and it COLLIDES with OPEN-#1 (the γ>1 lock): rule on the g<1 object ONCE, here at the readout layer.** |
| (c) no-arb bound on τ | **WORKS** | butterfly + monotonicity hold ∀τ; asymptotes preserved ∀τ; τ is NOT no-arb-bounded — only flat-top-width is a calibration choice. |
| (d) funding | **CHANGED — LOCKED CONTRACT ALTERED, operator-tier** (skeptic re-classed up from "works") | routing γ→g_loc(u_K) zeroes ATM funding and makes its scale strike-dependent; inventory #9 funding is LOCKED ("not touched by mark/strike changes"). Same operator-tier class as carry #5/#10. Must be ruled, not assumed. |
| (e) vertical-spread shortcut | **PARTIAL: execution survives, closed-form PRICING breaks** | per-leg `g_loc(u_i)` breaks the `√(θ₁θ₂)` price shortcut (manager-reproduced ≈39%/12%/1% error near/mid/deep). One-tx EXECUTION is unaffected (a 2-leg spread is still one strike-free pool tx). **Live tension with operator entry 85 ("keep the VS shortcut") — if closed-form spread PRICING is a hard requirement, the lens spec needs rework.** |
| (f) slippage | **WORKS** | strike-invariant per unit cash (no strike channel in the warp); strike enters only the lensed premium sizing the cash leg. |

### Inventory items still UN-dispositioned (skeptic FLAG-OMISSION — to close before a build spec)
`#4 carry (P=Ny/Nx)`, `#5 rebase` (the lens-mode∘rebase **commute lemma is OPEN** — the (W) warp∘rebase lemma reborn for the lens), `#13 solvency` (plain-Balancer reserve bound + the flat-top g<1 value law), plus #8/#11/#12/#14/#15. None derived yet.

## Vocabulary guard (collisions that caused real confusion)

| Term | Means here | Does NOT mean |
|---|---|---|
| anchor curve | the static w=½ gray reference (funding yardstick); never moves | anything about where the warp applies |
| goal-seek point | where the post-trade slope is restored; in the derived architecture this resolves to the lens MODE tracking the live marginal (strike-blind warp) | "anchoring" (term retired); NOT strike-dependent path-A warp |
| kurtosis / steepness | operator uses them interchangeably for the curve's bend; in THIS architecture: pool bend = w, option-surface bend = lens τ | a 4th-moment trader statistic |

## Pointers

- Base build for pool mechanics: `engine/builds/temporal_mvp_v24_rebase_fixed_2.html`
- Current HEAD (untouched by all of this): `engine/builds/HEAD_temporal_mvp_v27_wkurtosis.html`, md5 `928cde1c…`
- Verbatim operator transcript: `history/operator/2026-06-10_kurtosis-curve-family-brief.md` (entries 80–88)
- Open operator decisions: `docs/OPEN_OPERATOR_QUESTIONS.md` (the w>0.5 floor question, item 1, applies to the one-knob pool here too)
