# Querying Aristotle for the continuous-case warp derivation — what's out there, what it is, what's still owed

_research-lead, 2026-06-10. Operator entry 33. **READ-ONLY / QUERY-ONLY. NO engine edit, NO git, NO
Aristotle SUBMISSION, NO build file touched.** Aristotle queried via the `aristotlelib` CLI
(`uvx --from aristotlelib aristotle {list,show,download}`). Archives extracted to a throwaway
`/tmp/aristotle_query/` (NOT the working tree). Manager re-derives; skeptic before the operator hears it._

Operator (entry 33, verbatim):
> the continuous case thing is on aristotle somewhere if the reseaech guy is able to query our projects
> out there may find it; but yes if need to derive its with respect to the point at which the trade is
> happening, not spot or 45 degree slope point / pool reserves point or any other point

---

## HEADLINE

**The operator is right — there IS continuous-case warp work on Aristotle, and it is trade-point-anchored
exactly as the operator pins it.** It is the **`warp-amm` / `warp-amm-handoff` project cluster** (submitted
~3 weeks ago), a Lean 4 formalization of a "Warp AMM paper" (`warp-amm.tex`), namespace `Temporal.Warp`,
file `RequestProject/Warp.lean`. It anchors the warp at the **trade point on the pre-trade curve** (`σ_B`,
the endpoint tangent at `(x_B, y_B)`) — **not** spot, **not** the 45°/w=½ point, **not** the pool-reserves
point.

**But one honest distinction must travel with this** (it is the difference between "found it" and
"over-claiming"): the Aristotle artifact is the **WARP-AMM rapidity formalization** — the *discrete*
trade-point mode-shift (`w → φ`) plus a *slope-over-rapidity* integral corollary. It is **NOT** the
specific `dw/dy = β/y²` cash-leg integral along the conservation hyperbola `(x−α)(y−β)=αβ` named in the
paper-draft's "Derivation of the Continuous Case" placeholder. Those are two parametrizations of the same
*mechanism* (trade reshapes the weight; tangent matched at the trade point), but they are **not the same
closed-form object**, and the `β/y²` integral itself is not among our ~80 Aristotle projects.

---

## (i) What Aristotle artifacts exist + is the continuous-case derivation among them

### Method `[query-only]`
- Auth: `ARISTOTLE_API_KEY` was **clean this session** — no literal `<>` wrapper (starts `ar`, ends `24`,
  len 49); the memory's strip-the-brackets gotcha did not apply. No auth/host error. CLI present via
  `uvx --from aristotlelib aristotle`; host reachable, all calls returned.
- Enumerated **all ~80 projects** across 8 pages of `aristotle list`; `show` on every warp/trade/
  curve/closed-form-titled project; `download` + extract + token-scan on the two strongest candidates.

### The relevant cluster — FOUND (trade-point-anchored continuous-case warp)

| Project ID | Name | Status | Relevance |
|---|---|---|---|
| `d20dda3a-9fe5-4d28-b2be-99fc96d84a61` | `warp-amm` | COMPLETE | base Warp.lean, 22 claims (§1–§5) |
| `7f933065-8a8d-4b54-816e-88f753614403` | `warp-amm-handoff` | COMPLETE | **Model-C** Warp.lean (most developed §5; `mode_shift_closed_call`) |
| `4e92e3cb-e9b1-419b-ac95-40c2225ac53d` | `warp-amm-handoff` | COMPLETE_WITH_ERRORS | Model-C twin (23 claims) |

These ARE the operator's "continuous case thing on aristotle." (Task IDs: `0a8b420f…` base;
`cfacbc47…` handoff.)

### Warp-adjacent but NOT the continuous-case object (checked + excluded)

| Project ID | Name | Why excluded |
|---|---|---|
| `f297c53f-31c2-4fff-…` | `trade execution of y against t…` (`derivation.md`, D1–D7) | **DIFFERENT MODEL.** "Self-referential" pool with weight `w = Rₓ/T` (fraction of LP supply), invariant `Rₓ^w Rᵧ^(1−w)=k`. Its continuous case (Appendix, floating-k) integrates `dRᵧ/dRₓ = −Rᵧ/(T−Rₓ)` — **not** the paper's `dw/dy=β/y²`. Found "no elementary closed form" / transcendental. Not our trade mechanic. |
| `4895db4e-54b8-4ce0-…` | `Closed-Form Pricing Surface` (Defs+Theorems, 47 lemmas) | curve-skewing pricing surface `R`, skew/depth maps, T6 path-independence of skew, T8 `R=(a/b)exp(−2α)`. Structural curve-skew algebra; not a cash-leg trade integral. |
| `5f9d64c7-366e-481f-…` | `Barrier-on-Balancer Foundation` (2h ago) | T6 `spot_deriv_in_weight: d/dw spot=(y/x)/(1−w)²` (price strictly mono in weight ⇒ weight warp bijects strikes). Warp's *injectivity*, not its *trade integral*. |
| `0fa8f37d-…` Two-AMM-Surfaces; `1f3b4db8-…` first-deriv-curve lift; `f973f901-…` Γ-curve self-hedge; `7148e23c-…` AMM Metric; misc CST/Lorentzian/PH | off-objective or different layer. |

### Cross-check against local records
`formal/INDEX.md` and `formal/aristotle_runs/RESULTS.md` contain ONLY the formal-spine work (R1–R5,
C1–C3, MERTON, AIRTIGHT, PH-*, GHMaps, B1, UNIFY, frontier). **The warp-amm cluster is NOT indexed
locally** — it predates the INDEX and was never folded into `formal/`. The only RESULTS.md "continuous"
hits are the CTPH **continuous-time port-Hamiltonian** dissipation bridge (unrelated). So this artifact
lives on Aristotle's servers and is not in our local provenance map.

---

## (ii) The derivation that IS out there + its trade-point mapping

Source: `/tmp/aristotle_query/{warp-amm,mc}/…/RequestProject/Warp.lean`. Token-scan CLEAN
(no `sorry`/`admit`/`axiom`/`native_decide`/`opaque`/`unsafe`); summaries assert axioms ⊆
{`propext`,`Classical.choice`,`Quot.sound`}; no inline `#print axioms` in the file (a manager
canonical-build would confirm). **trusted-from-prover provenance NOT re-stamped this pass** — this was a
query/retrieval, not a verification round; treat the audit below as a content read.

### The model (rapidity coordinates)
- `σ_θ w θ = (w/(1−w))·tan θ` — marginal slope at strike angle θ (θ = the strike's **ray angle**, so this
  is evaluated AT the strike's trade point, not at spot).
- `ξ θ = log(tan θ)` (strike rapidity), `ξ_m w = log((1−w)/w)` (**mode rapidity** — the weight in rapidity
  coordinates). Prop 1: `log σ = ξ − ξ_m` (log-slope affine in rapidity).
- Premia `P_C, P_P = exp(∓(ξ−ξ_m))`, duality `P_C·P_P = 1`.

### The trade-point warp — Model C, §5 (the operator's pin, formalized)
- **`σ_B w₀ x_B y_B = ((1−w₀)/w₀)·(x_B/y_B)`** — comment in-file: *"Endpoint tangent on pre-trade curve at
  `(x_B, y_B)`."* This is the slope **at the trade point** B, computed on the pre-trade curve. **This is
  exactly the anchoring the operator names: the point at which the trade is happening, not spot, not 45°,
  not reserves.**
- **`w₁ x_s y_s σB = x_s/(x_s + σB·y_s)`** — the post-warp weight that re-seats the curve so its tangent at
  the trade angle equals `σB`. Proven: `warp_tangent_eq_σB` ((1−wn)/wn·(x_s/y_s)=σB) and `warp_passes_anchor`
  (the warped curve still passes through the anchor).
- **`mode_shift` (Thm 2 §5):** `ξ_m(wn) − ξ_m(w₀) = log(y_s/x_s) − log(y_B/x_B)`. The **mode-rapidity shift
  produced by the trade** (this is the φ-recenter in our (W) language) equals the log-displacement between
  the trade point B and the new tangent point.
- **`mode_shift_closed_call` (Cor §5) — the CLOSED FORM:** given `hcurve` (both `(x_s,y_s)` and `(x_B,y_B)`
  on the **same pre-trade curve** `x^{w₀}y^{1−w₀}=…`),
  `log(y_s/x_s) − log(y_B/x_B) = (1/w₀)·log(y_s/y_B)`.
  i.e. the mode/φ shift is `(1/w₀)·log(y_s/y_B)` — a **closed form in the y-displacement**, anchored at the
  trade point.
- **`slope_integral_sum/prod` (Cor §3):** `∫ σ_ξ dξ` over a rapidity interval `[ξ−Δξ, ξ+Δξ]` gives
  `2·σ_ξ·sinh(Δξ)` (sum) and `2·σ_ξ²·(cosh Δξ − 1)` (product). This is the **closed-form integration of the
  slope along the rapidity axis** — the "continuous" integral the formalization actually carries.

### Mapping to the trade-point-anchoring fix
The operator's invariant — *anchor each leg's warp at its ray∩curve trade point* — is **already the
structure of this artifact**: `σ_B` is the tangent at `(x_B,y_B)`=the trade point, and the warp `w₁`/`mode_shift`
is defined relative to it. So the WARP-AMM Lean is a faithful formalization of the trade-point-anchored
warp, and it gives a closed form (`mode_shift_closed_call`) for the resulting φ-shift. If the engine fix is
"anchor the warp at the strike's trade point," **this is the math object to point the implementation at**,
and it is the correct anchoring by construction.

---

## (iii) The honest gap, and the correctly-framed derivation that is still owed

### What is NOT out there
The paper-draft's named placeholder — **"Derivation of the Continuous Case: closed-form integration of the
cash leg along the conservation hyperbola"** (from my entry-30/31 note `WARP_paper_vs_engine_continuous`)
— i.e. integrating

```
dw/dy = β / y²    along    (x − α)(y − β) = α·β,   α = x·w,  β = y·(1−w)
```

is **NOT among our ~80 Aristotle projects.** The WARP-AMM cluster is a *different parametrization* of the
same warp mechanism:
- WARP-AMM works in **rapidity / log-price** coordinates (ξ, mode rapidity ξ_m, weight w(θ)); its "integral"
  is `∫σ_ξ dξ` over rapidity, and its trade-warp is the algebraic `mode_shift` (a *discrete* before/after
  relation, closed-formed via `hcurve`).
- The paper-draft's continuous case works in **reserve / cash-leg** coordinates ((x,y), the `(α,β)`
  conservation hyperbola); its integral is `∫ (β/y²) dy` along that hyperbola.

There is no `(α,β)` first integral, no `β/y²` ODE, and no hyperbola path-integral in the Aristotle Lean.
So: the *trade-point-anchored continuous warp* exists on Aristotle (✓ rapidity form); the *specific
`β/y²`-along-the-hyperbola closed form* does **not** (it remains the paper-draft placeholder).

### If that specific integral is wanted — the correctly-framed (trade-point-anchored) scope
Set the continuous problem up at the **trade point of the leg's ray** (ray∩curve), explicitly NOT at spot,
NOT at the 45°/w=½ point, NOT at the pool-reserves point:

1. **Leg / ray.** Strike θ ↦ its ray (slope) ↦ its intersection with the curve = the trade point
   `(x_θ, y_θ)`. All quantities below are evaluated **at `(x_θ, y_θ)`**, per ray. (This is the degree of
   freedom the current engine drops — it warps at spot.)
2. **Conserved through the (continuous) trade:** `α = x·w`, `β = y·(1−w)`, individually ⇒ the trade point
   slides along `(x−α)(y−β)=αβ`.
3. **Warp rate, at the trade point:** `dw/dy = β / y_θ²` (the infinitesimal limit of the paper's Trade
   Formula `Δw = β·Δy/(y·y′)`, evaluated at the leg's trade point).
4. **Integrate** `dw = (β/y²) dy` from `y_θ` to `y_θ + Δy` along the hyperbola ⇒ closed form
   `Δw = β·(1/y_θ − 1/(y_θ+Δy)) = β·Δy/(y_θ·(y_θ+Δy))` — elementary (it is the antiderivative of `β/y²`,
   trivially). The genuinely load-bearing content is the **path/flow lemma**: that `(α,β)` are first
   integrals so the trade point's motion is confined to that hyperbola and the integral is path-independent.

### Modest derivation, or fresh Aristotle obligation?
- The **integral itself is modest** — `∫β/y² dy = −β/y + C` is elementary; no special functions, no Mathlib
  gap. It does **not** need Aristotle to evaluate.
- The **load-bearing lemma** (the part worth formalizing) is the **`(α,β)`-first-integral / flow-confinement
  claim**: that conserving `α=x·w, β=y·(1−w)` confines the reserves/trade point to `(x−α)(y−β)=αβ` and
  makes the continuous warp path-independent. This is the **same object** I already flagged as
  `needs-Aristotle` in `TRADE_WARP_strongform_2026-06-10.md` (consistency item 1) and
  `WARP_paper_vs_engine_continuous_2026-06-10.md` (flag 3). It is short, algebraic, Mathlib-tractable
  (no special functions) — a clean candidate obligation.

**RECOMMENDATION (no submit this pass):**
1. **Treat the WARP-AMM `Warp.lean` cluster as the existing continuous-case home** — it is trade-point-
   anchored (✓ the operator's pin) and already gives a closed-form φ-shift (`mode_shift_closed_call`). If
   the engine fix is framed in rapidity/mode-shift terms, the math is already proven and on Aristotle. It
   should be **folded into `formal/INDEX.md`** (currently un-indexed) so it stops being lost — a manager
   decision, flagged, not done here.
2. **If the engine fix is specifically framed as the `β/y²`-along-the-hyperbola integral**, that closed form
   is elementary (derive in a note, no Aristotle needed); only the `(α,β)`-flow-confinement lemma warrants a
   **fresh, short Aristotle obligation** — the one already flagged in TRADE_WARP_strongform item 1. **Do NOT
   submit this pass** (operator entry 33 forbids heavy submission while live-playing HEAD); recommend it as
   the next obligation once the operator decides whether the engine moves to trade-point anchoring (a
   curve/economic-object decision, escalation-tier per CLAUDE.md §7).

---

## Flags for the operator (via the manager)
1. **FOUND, and trade-point-anchored as you pinned it.** The continuous-case warp on Aristotle = the
   `warp-amm`/`warp-amm-handoff` cluster (`d20dda3a`, `7f933065`, `4e92e3cb`). `σ_B` = tangent at the
   **trade point**, not spot/45°/reserves. Closed-form φ-shift = `mode_shift_closed_call`:
   `(1/w₀)·log(y_s/y_B)`.
2. **Honest gap (do not over-claim):** that artifact is the **rapidity / mode-shift** form (discrete warp +
   slope-over-rapidity integral). The paper-draft's specific **`dw/dy=β/y²`-along-the-conservation-hyperbola**
   integral is **not** on Aristotle — it is still the placeholder. Same mechanism, different parametrization,
   different closed-form object.
3. **The warp-amm cluster is NOT in `formal/INDEX.md`** — it predates the INDEX and was never folded.
   Recommend the manager fold it (provenance-map it) so it isn't lost again. (Manager call.)
4. **No new submission this pass** (per entry 33). The `β/y²` integral is elementary; the only piece worth a
   fresh obligation is the `(α,β)`-first-integral/flow lemma (already flagged) — recommend, do not submit.
5. **No build/git/engine touch this pass.** Query-only. Archives in throwaway `/tmp/aristotle_query/`.

## Provenance
Aristotle CLI `uvx --from aristotlelib aristotle {list,show,download}` (host reachable, auth clean).
Inspected Lean: `/tmp/aristotle_query/warp-amm_aristotle/RequestProject/Warp.lean` (d20dda3a),
`/tmp/aristotle_query/mc/warp-amm-handoff_aristotle/RequestProject/Warp.lean` (7f933065);
`derivation.md` (f297c53f trade-exec, excluded). Cross-read: `formal/INDEX.md`,
`formal/aristotle_runs/RESULTS.md`, my own `notes/research/WARP_paper_vs_engine_continuous_2026-06-10.md`
and `notes/research/TRADE_WARP_strongform_2026-06-10.md`. Manager re-derives; skeptic before the operator.
