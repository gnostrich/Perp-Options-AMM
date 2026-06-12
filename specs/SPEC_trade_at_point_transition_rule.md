# SPEC — The trade-at-point transition rule (off-ATM trade semantics)

_research-lead, 2026-06-12. Formalizes the OPERATOR RULING of 2026-06-12
(`notes/operator_ruling_2026-06-12_offATM_trade_rule.md`; verbatim source
`history/operator/2026-06-12_referee-report-review.md` entries 5–8). This is the precise
transition-system answer to the AFT2026 referee's fatal problem (1) / question 1
(`evidence/aft2026_review/REFEREE_REPORT.md` §3.2-1, §8 Q1): which conserved pair enters the
trade formula at a non-ATM trade point, and what is the induced global (x,y,w) update._

_Every numbered claim below was re-derived independently this pass (exact `Fraction` arithmetic
+ float checks); Lean obligation status is tracked in §9._

---

## 1. State space

A pool state is a triple

```
s = (x, y, w) ∈ S := ℝ>0 × ℝ>0 × (0,1)
```

**w is genuine state** — stored, persisted across trades, NOT derived from reserves. (Off-ATM
trades make `w` unrecoverable from reserves and any initially-frozen pair: Lemma L4. The
submission's §5.1 sentence "the pool state is therefore fully determined by (x,y) … no
additional state storage is required" is **true only on the spot-trade orbit** and must be
retracted/scoped in the paper.)

Derived readouts (never primitive):

- pool curve level `k(s) = x^w · y^(1−w)`;
- global pair `α(s) = x·w`, `β(s) = y·(1−w)` — conserved by **spot** trades only (L2);
- normalised marginal price `sNorm = (1−w)/w` (orientation per the paper's notation table;
  the known sNorm-vs-mp orientation conflict is referee item §3.4, out of scope here).

## 2. The trade-point map T(θ; x, y, w)

A strike ray is `{(x', y') : y' = θ·x'}`, θ > 0. The **trade point** is the intersection of the
ray with the live pool curve:

```
T(θ; s) = (x_T, y_T),   y_T = θ·x_T,   x_T^w · y_T^(1−w) = k(s).
```

**Existence and uniqueness (L1a).** On the ray, `x_T^w·(θx_T)^(1−w) = x_T·θ^(1−w)`, so the curve
equation is *linear* in `x_T` and has the unique positive solution

```
x_T = k(s)·θ^(w−1) = x·(y/(θx))^(1−w),     y_T = θ·x_T = k(s)·θ^w.
```

`T(y/x; s) = (x, y)`: the reserves point is the trade point of its own ray (the spot ray),
and it is the only ray whose trade point is the reserves point.

## 3. The local pair at T

```
α_T = x_T · w,        β_T = y_T · (1 − w).
```

Load-bearing identities (used throughout):

```
y_T − β_T = w·y_T  > 0,        x_T − α_T = (1−w)·x_T > 0.
```

The conservation law is the **per-trade transition generator applied at T** — a local object of
the single trade, NOT a global invariant across off-ATM trades (global α, β drift by design; L4).

## 4. The transition

A trade at ray θ with cash leg Δy (sign convention §5.3) maps `s = (x,y,w)` to

```
Δx = − α_T·β_T·Δy / [ (y_T − β_T) · (y_T + Δy − β_T) ]
Δw =   β_T·Δy / [ y_T · (y_T + Δy) ]

next(s; θ, Δy) = (x + Δx,  y + Δy,  w + Δw).
```

The flows Δx, Δy **are the actual reserve changes** — computed at T, applied to the global
reserves ("pool reserves change by what actually flowed; and what actually flowed would also be
as per that trade point" — operator, entry 8).

Equivalent simplified forms (exact algebra, used in the Lean file):

```
Δx = − x_T·(1−w)·Δy / (w·y_T + Δy)
Δw = (1−w)·Δy / (y_T + Δy)
w′ = w + Δw = (w·y_T + Δy) / (y_T + Δy)
```

**Execution price (consistency with the ruling's "as per that trade point").** The marginal
price at T is `mp_T = α_T·y_T²/(β_T·x_T²) = [w/(1−w)]·θ` (the paper's mp expression evaluated
at T). The transition executes at exactly this price in the small-trade limit:
`Δx/Δy → −1/mp_T` as Δy → 0 (checked to 2e-6 relative at Δy=1e-6).

## 5. Admissible domain

### 5.1 The pole (local constraint)

The Δx denominator factor `y_T + Δy − β_T = w·y_T + Δy` has its pole at `Δy = −w·y_T`
(equivalently `y_T + Δy = β_T`). Admissibility requires

```
Δy > −w·y_T        (the pole condition;  ⟺  y_T + Δy > β_T).
```

**Consequence (free):** the pole condition alone forces `w′ ∈ (0,1)` — numerator and denominator
of `w′ = (w·y_T+Δy)/(y_T+Δy)` are both positive and numerator < denominator. It also forces
`y_T + Δy > 0`, so the Δw denominator never vanishes on the domain. (Lean: `wNext_mem_Ioo`.)

### 5.2 Global positivity (additional constraints — NOT implied by the pole)

Because the flows are computed at T but applied to the **global** reserves, next-state
positivity is a separate requirement:

```
x + Δx > 0     and     y + Δy > 0.
```

Neither follows from the pole condition. Counterexamples (both exact):

- `(x,y,w) = (10,10,½)`, θ = 100 ⇒ `(x_T,y_T) = (1,100)`, pole at Δy = −50; Δy = −20 passes the
  pole yet `y + Δy = −10 < 0`.
- `(x,y,w) = (10,10,½)`, θ = 0.01 ⇒ `(x_T,y_T) = (100,1)`; Δy = 1000 passes the pole yet
  `x + Δx ≈ −39.98 < 0`.

**Interval characterization.** On the pole domain, `x+Δx` is strictly decreasing and `y+Δy`
strictly increasing in Δy, so the admissible set is an open interval `(Δy_min, Δy_max) ∋ 0`:

```
Δy_min = max( −w·y_T , −y )
Δy_max = x·w·y_T / ( x_T·(1−w) − x )   if x_T·(1−w) > x,   else +∞
```

(checked exactly: θ=0.01 instance gives Δy_max = 0.125 with `x+Δx = 0` there). The Δy → ∞ limit
of −Δx is `x_T·(1−w) = x_T − α_T`: a single off-ATM trade can extract at most the trade point's
x-distance to its own local pair — but that bound can exceed the global reserve x, hence the
constraint.

### 5.3 Sign conventions and the instrument gate (recorded, not re-derived)

Per the paper §5.2 (unchanged by the ruling): `sign(Δy) = (call ? +1 : −1)·(sell ? +1 : −1)`.
Per the paper §3, trade points are used **subject to the ray being OTM** (regime test
θ vs sNorm in the live frame). These are instrument-layer gates sitting ABOVE the algebraic
domain of §5.1–5.2; the algebra here is well-defined on the full domain regardless of wing.

## 6. Lemmas (precise statements)

State s = (x,y,w) ∈ S, θ > 0, T = (x_T, y_T) = T(θ; s), Δy ∈ ℝ.

- **L1 (well-definedness).**
  (a) T(θ; s) exists and is unique (closed form §2).
  (b) If Δy > −w·y_T and x+Δx > 0 and y+Δy > 0, then `next(s; θ, Δy) ∈ S`; the w-component
  condition `w′ ∈ (0,1)` follows from the pole condition alone.
  (c) The positivity constraints in (b) are not removable: explicit counterexamples §5.2.

- **L2 (spot-trade reduction).** If θ = y/x (so T = (x,y) and α_T = α, β_T = β), the transition
  is **exactly** the paper's §5.2 global trade formula, and conserves the global pair:
  `x′·w′ = x·w`, `y′·(1−w′) = y·(1−w)`; consequently the next state lies on the trajectory
  hyperbola `(x′−α)(y′−β) = αβ`. The paper's §5.1 wording is true exactly here.

- **L3 (per-step local conservation).** On the pole domain, identically:
  `(x_T + Δx)·w′ = α_T` and `(y_T + Δy)·(1−w′) = β_T`.
  I.e. viewed FROM the trade point, every trade is a §5.1-conserving trade; T plays the role of
  the reserves point for its own transition. (Exact in `Fraction` arithmetic; Lean
  `local_conservation`.)

- **L4 (w-storage necessity).** There is a state, ray and trade after which `w′ ≠ α₀/x′` for the
  pre-trade global pair α₀ — so w cannot be recovered from reserves plus any frozen pair, and
  must be stored. Exact rational exhibit: `(x,y,w) = (10,10,½)`, θ = 4 ⇒ `(x_T,y_T) = (5,20)`,
  Δy = 1:

  ```
  Δx = −5/22,  Δw = 1/42  ⇒  x′ = 215/22,  w′ = 11/21
  α₀/x′ = 22/43 ≈ 0.5116   ≠   w′ = 11/21 ≈ 0.5238
  α′ = x′w′ = 215/42 ≈ 5.119 (drifted from 5),  β′ = y′(1−w′) = 110/21 ≈ 5.238
  ```

  (The manager's float instance θ = 2, Δy = 1 — w′ = 0.533 vs α₀/x′ = 0.523, α: 5 → 5.097,
  β: 5 → 5.137 — reproduces exactly; the θ = 4 instance is the same phenomenon in pure
  rationals, chosen for the Lean exhibit.)

- **L5 (scope of the global results — the off-ATM trade is a distinct operator).** The
  submission's trajectory-hyperbola reachability (App B/D) and the (α,β)-signature
  three-operator classification (App D: trade (α,β)→(α,β), rebase →(rα,β), liquidity →(λα,λβ))
  are theorems about the **spot-trade operator** and remain true for it (L2). The off-ATM trade
  is a **fourth, distinct operator**: in the L4 exhibit its action on the global pair is
  `α′/α = 43/42`, `β′/β = 44/42` — matching none of the three signatures (not trade: α moves;
  not rebase: β moves; not liquidity: the ratios differ). App D's uniqueness-by-signature
  classification therefore does not classify it, and reachability claims proved along the
  hyperbola do not transfer to trajectories containing off-ATM trades. Paper text quantifying
  over "any trade" must be scoped to spot trades or re-proved.

## 7. Explicitly OUT OF SCOPE (operator-deferred / open interface)

- **Round-trip / path-residual economics.** Same-ray same-frame open-and-reverse leaves a
  pool-favourable residual (manager instance Δx = +6.4e-2). **DEFERRED by the operator**
  (entry 8 verbatim: "round trip stuff can be done later because same problem as dynamic
  function AMMs like Curve which are mainstream accepted" — the Curve analogy is the operator's
  rationale, recorded not project-verified). Nothing here states or implies a round-trip
  neutrality property.
- **The q ↦ Δy mapping (referee Q8).** The mapping from a leg's notional q at ray θ to the swap
  cash leg Δy is an **OPEN INTERFACE**: this spec takes Δy as the transition input and proposes
  nothing about how positions produce it. Any position-layer use of this spec must supply that
  mapping separately.

## 8. Relation to the v27 build (cross-check verdict: DIFFERENT)

The demoted-retained v27 build (`temporal_mvp_v27_wkurtosis.html`, branch
`claude/exciting-archimedes-txs2wx`) implements a **different conservation-consistent
construction**: its `tradeUpdate(s, dy)` (lines 1723–1746) takes **no strike ray**, evaluates
the (W) weight FIELD at the **reserves point** (`u = ln(y/x) − φ`), conserves the **global**
pair `α = x·w(u;φ)`, `β = y·(1−w(u;φ))` through the trade (`w* = 1−β/y′`, `x′ = α/w*`), and
re-centers the field (`φ′ = u′ − z`) so the field reproduces w* at the new reserves point. That
is the **spot-trade operator lifted to the (W) field family** (global-pair + field re-center;
state stored as φ). The ruling's rule (local pair at the ray's trade point, flows at T, scalar
w stored, global pair drifting) is **not** implemented by v27; the two coincide only on the
spot ray. The v27 lineage claim "skeptic-verified the UNIQUE conservation-consistent trade" is
uniqueness *within v27's own global-pair-conservation requirement* — the ruling's rule
deliberately does not satisfy that requirement off-ATM, so there is no contradiction.

## 9. Lean obligation status

Module: `formal/aristotle_runs/OFFATM_trade/OffATMTrade.lean` (standalone, `import Mathlib`,
Lean 4.28.0 / Mathlib v4.28.0). Prompt: `formal/prompts/aristotle_prompt_offatm_trade.md`.

| Obligation | Lean name | Lemma | Status |
|---|---|---|---|
| trade-point existence/uniqueness | `tradePoint_exists_unique` | L1a | see ledger |
| w′ closed form | `wNext_eq` | helper | see ledger |
| pole ⇒ w′∈(0,1) | `wNext_mem_Ioo` | L1b | see ledger |
| next-state validity on domain | `next_state_valid` | L1b | see ledger |
| pole does not bound state | `pole_does_not_bound_state` | L1c | see ledger |
| per-step local conservation | `local_conservation` | L3 | see ledger |
| spot reduction + hyperbola | `spot_reduction_global_conservation` | L2 | see ledger |
| w-storage necessity (exhibit) | `w_storage_necessary` | L4 | see ledger |
| distinct operator signature (exhibit) | `offATM_distinct_operator_signature` | L5 (bonus) | see ledger |

Verdict ledger: `formal/aristotle_runs/RESULTS.md` (OFFATM section). L5 is normatively a scope
remark (§6); the bonus theorem only certifies the numeric signature fact.
