# BURR-2 KERNEL — the Lean half of the rebuilt loop (operator entry 532)

**Owner:** research-lead. **Prover:** Aristotle (external, Lean 4.28.0 / Mathlib v4.28.0).
**Date:** 2026-08-14. **Status: all 55 stated theorems PROVED and RE-VERIFIED IN A LOCAL KERNEL.**
Label recommendation: **verified** (the flip is the manager's call). Not committed — handed back.

---

## 0. Why this exists / what it replaces

Operator entry 532 ordered the whole loop rebuilt on the **Burr-2 kernel**, spreadsheet plus
corresponding Lean. The spreadsheet half is `sims/BURR2_FULL_LOOP_v1.xlsx`.

**The kernel CHANGED and this supersedes the prior Lean pricing layer.** All earlier Lean
(`sims/v3-maps-lean`, and the two links `LINK_PRICING` / `LINK_SETTLEMENT` proved 2026-08-14) sits on
the **single-power-law / Balancer** model — `V ∝ S^(−g)`, one exponent. The operator's real design is
the **Burr-II / t-family two-shape-parameter** pricer of
`sims/operator_sheets/temporal_burr2_swap_pricer_6.xlsx`.

> **The earlier links are not wrong, they are about a different kernel.** `LINK_PRICING`'s
> `mixture_not_single_lens` in particular is an obstruction for the *single-lens* family. Its Burr-2
> analogue is proved here (§4 below) and is **materially weaker** — that difference is the main
> economic finding of this pass.

## 1. What I stated (the predicates, pinned before submission)

Two obligations, both self-contained over Mathlib (no dependence on the demoted single-power-law
modules — deliberate, so the new kernel stands on its own).

### `BURR2_CORE.lean` — 42 theorems
Definitions transcribed **literally** from the operator's kernel block:

```
kern p s v = (1 + (v/s)^a)^(−(γ+1)/a)                 -- the Burr-II wing kernel
tail p s m = (s/a)·B·(1 − ibeta (uArg s m))           -- wing value = tail integral ∫_m^∞ Δ_s
sR = S̄(1+κ)          sL = S̄(1−κ)
G1 = kern sL 1       I1 = tail sL 1
WR = sR·B/a          WL = (sL·B/a − I1 − G1)/(1 − G1)
qR = WL/(WR+WL)      qL = 1 − qR                       -- THE PEG
AR k  = qR · tail sR |k|
ALm m = if 1 ≤ m then 0 else qL/(1−G1) · (tail sL m − I1 − G1·(1−m))
CALL k = if 0 ≤ k then AR k else −k + AL k
PUT  k = if k ≤ 0 then AL k else  k + AR k
```

**Route taken for the incomplete beta: (a) — carried abstractly, NOT axiomatised.**
Mathlib has no usable regularized-incomplete-beta API. `I_x(1/a, γ/a)` is a **FIELD** `ibeta : ℝ → ℝ`
of the `Params` structure, carrying only the four facts actually used: `ibeta 0 = 0`, `ibeta 1 = 1`,
monotone on `[0,1]`, valued in `[0,1]`. A field is not an `axiom` declaration — nothing is added to
the trusted base, and `#print axioms` stays clean (confirmed, §5). Everything else is the literal
sheet formula, so §1–§3 are theorems about **the actual production formulas**, conditional on nothing
but those four facts.

**One formalisation hazard, handled — worth knowing about.** The sheet writes `u = 1/(1+(s/m)^a)`,
which at `m = 0` (at-the-money) is a division by zero whose Lean junk value (`s/0 = 0`, `0^a = 0`,
hence `u = 1`) is the **wrong limit** — it sends the ATM wing value to `0` and would silently destroy
the ATM target while every theorem still "passed". `uArg` is therefore defined in the algebraically
equal, junk-safe form `m^a/(m^a + s^a)`, and `uArg_eq_sheet` **proves** the two agree for `m > 0`.
**Do not "simplify" it back to the sheet form.**

### `BURR2_MIXTURE.lean` — 13 theorems
The closure-under-mixture question, in the coordinate `Lc a s v = log(1 + (v/s)^a)` in which the
family is exactly log-affine in the tail parameter.

## 2. Target-by-target result (operator's numbering)

| # | Operator's target | Lean name(s) | Result |
|---|---|---|---|
| 1 | `burr2_parity`: `∀k, CALL−PUT = −k` | `burr2_parity`, `burr2_parity_of_ne`, `atm_wings_meet` | **PROVED** |
| 2 | `burr2_atm_wings_meet`: `A_R(0)=A_L(0)` | `atm_wings_meet` | **PROVED** |
| 3 | `burr2_call_at_zero`: `CALL=1`, `PUT=0` at `k=−1` | `call_at_zero_strike`, `put_at_zero_strike`, `AL_glue` | **PROVED** |
| 4 | `burr2_value_nonneg` + monotonicity | `AR_nonneg`, `AL_nonneg`, `CALL_nonneg`, `PUT_nonneg`, `CALL_antitone`, `PUT_monotone`, `CALL_lipschitz` | **PROVED** (conditional on `TailRep`, see §6) |
| 5 | `apportionment_conserves` | `shares_sum_one`, `apportionment_conserves`, `harmonic_law`, `share_eq_agg_ratio`, `share_nonneg` | **PROVED** |
| 6 | `burr2_not_closed_under_mixture` + error bound | `burr2_not_closed_under_mixture`, `mixture_eq_cosh`, `mixture_rel_error_le`, `mixture_aggregate_le`, `burr2_not_closed_under_mixture_scale` | **PROVED — both non-closure AND the bound** |

### Target 1 — a correction to the operator's expectation, and it matters

The operator wrote: *"Should be pure branch bookkeeping and may not need the incomplete beta at all."*

**That is right at every strike except exactly one, and the exception is load-bearing.**

- `k > 0`: `CALL = A_R`, `PUT = k + A_R` ⇒ difference `−k`. Bookkeeping.
- `k < 0`: `CALL = −k + A_L`, `PUT = A_L` ⇒ difference `−k`. Bookkeeping.
- `k = 0`: **both** `if` guards (`0 ≤ k` and `k ≤ 0`) fire, so `CALL(0) − PUT(0) = A_R(0) − A_L(0)`.
  This is `−0 = 0` **iff the two wings meet** — i.e. iff the peg holds.

So `burr2_parity_of_ne` is proved with **no hypotheses at all** (pure bookkeeping, confirming the
operator's instinct), while full `burr2_parity` genuinely consumes `atm_wings_meet`. **Parity at the
money IS the peg** — they are the same fact, not two facts. That is why the numerically-tiny 1.39e-17
parity residual and the 2.44e-13 ATM residual are the same phenomenon.

### Target 2 — the peg is *derived*, not chosen

`A_R(0) = qR·WR` and `A_L(0) = qL·WL` (both need the junk-safe `uArg`, §1). With
`qR = WL/(WR+WL)`, `qL = WR/(WR+WL)`, both sides equal `WR·WL/(WR+WL)`. Only hypothesis:
`WR + WL ≠ 0`. **`qR = WL/(WR+WL)` is exactly the unique split that makes the wings meet** — the peg
is forced by continuity, it is not a modelling choice.

### Target 3 — the `|k| ≥ 1` cutoff is not an artefact

`AL_glue` proves the left wing's **closed form already vanishes** at `m = 1`
(`tail sL 1 − I1 − G1·(1−1) = I1 − I1 − 0 = 0`, definitionally, since `I1 := tail sL 1`). So the
`if 1 ≤ m then 0` branch introduces **no discontinuity**, and `CALL(−1) = 1` / `PUT(−1) = 0` are facts
about the formula rather than about the `if`. This was worth stating separately; a cutoff that papered
over a jump would have made the zero-strike anchor meaningless.

### Target 6 — non-closure PROVED *and* the error bounded (the interesting one)

The operator asked for either non-closure or, "more useful", a bound on the approximation error.
**Both came out.**

The exact identity (`mixture_eq_cosh`), for a 50/50 mixture differing only in the tail parameter:

```
½(Δ_{γ₁} + Δ_{γ₂}) = Δ_{γ̄} · cosh(δ · Lc),     γ̄ = (γ₁+γ₂)/2,  δ = (γ₂−γ₁)/(2a)
```

I verified this numerically to 2.2e-16 — it is an identity, not an approximation.

- **Non-closure** (`burr2_not_closed_under_mixture`): `cosh` is not an exponential. Certificate:
  `Lc` is surjective onto `(0,∞)`, so the assumed identity gives `cosh(δl) = exp(βl)` for all `l>0`;
  at `l = 1, 2` with `cosh 2y = 2cosh²y − 1` this forces `cosh δ = 1`, hence `δ = 0`, contradicting
  `γ₁ ≠ γ₂`.
- **The error bound** (`mixture_rel_error_le`): `mix ≤ Δ_{γ̄} · exp((δ·Lc)²/2)`, i.e. the excess is
  **second order in the LP parameter gap** — because `cosh x − 1 ≈ x²/2`. This is the structural
  reason the measured residual is a fraction of a percent rather than a first-order error.
- **Transfers to books** (`mixture_aggregate_le`): the pointwise bound carries to any finite
  non-negatively-weighted aggregate over strikes — which is how the sheet actually forms prices.
- **STRETCH, also proved** (`burr2_not_closed_under_mixture_scale`): non-closure in the **scale**
  direction (`s` differs, `a, γ` shared). Aristotle found a better route than the one I sketched —
  differentiate the assumed identity twice, read off the 0th/1st/2nd moments of a two-atom positive
  measure, and apply the Cauchy–Schwarz equality identity
  `(p₁+p₂)(p₁x₁²+p₂x₂²) − (p₁x₁+p₂x₂)² = p₁p₂(x₁−x₂)²`, which forces `x₁ = x₂` ⇒ `s₁ = s₂`.
  I confirmed numerically (matching at `v=1`, then measuring): max miss 1.7e-2 / 1.0e-1 / 1.8e-3
  across three parameter sets.

**The economic headline — this is the operator-facing point.** Contrast with the single-lens result:

| | single power law (`LINK_PRICING`) | Burr-2 (this pass) |
|---|---|---|
| closed under mixture? | **No** | **No** |
| nature of the obstruction | member log-**affine**, mixture strictly log-**convex** — a *smile the family cannot represent at all* | member `exp(−cL)`, mixture `exp(−c̄L)·cosh(δL)` — the *same shape times a factor `1+O(δ²)`* |
| size | **first order**, structural | **second order** in the LP spread |

So heterogeneous-LP aggregation is a **genuine but quantitatively mild** obstruction under Burr-2,
where under the single lens it was a hard structural wall. That is a real argument in favour of the
Burr-2 kernel and it is now mechanized.

## 3. Local numeric re-derivation (independent of the prover)

I re-implemented the **Lean definitions** (not the sheet) in Python/scipy and checked against the
operator's own audit figures.

- **Reproduces `sims/operator_sheets/BURR2_PRICER_AUDIT.md` line 23 exactly**, all 10 printed digits:
  at `S̄=0.6, a=1.2705, γ=1.8413, κ=0` → `B=0.9288399661`, `G1=0.0914859758`, `I1=0.0727183316`.
  **The Lean transcription is faithful to the production sheet.**
- Across six parameter sets (incl. `κ = ±0.3` and extremes `a=2.5, γ=0.4, κ=−0.7`):
  parity ≤ 2.2e-16 · ATM gap ≤ 1.1e-16 · `CALL(−1) = 1.000000000000` and `PUT(−1) = 0` exactly ·
  `min A_R > 0`, `min A_L ≥ 0` · `CALL` strictly decreasing · `PUT` non-decreasing ·
  **max `|dCALL/dk|` = 1.0000 exactly** (the Lipschitz constant is attained, so `CALL_lipschitz` is
  tight, not slack).
- **`TailRep` holds at production parameters**: `tail s m` vs. numerically integrated `∫_m^∞ kern`
  agrees to 6.8e-14 … 4.1e-12. See §6 for why this is a *numeric* rather than proved fact.

## 4. Audit findings (the mandatory gate — both obligations)

Ran on throwaway copies; the working tree was never the extraction target.

| check | `BURR2_CORE` | `BURR2_MIXTURE` |
|---|---|---|
| theorem statements byte-identical to submission | **42 / 42** | **13 / 13** |
| `def` / `structure` bodies byte-identical | **22 / 22** | **3 / 3** |
| out-of-scope files (`lakefile.toml`, `lean-toolchain`, `lake-manifest.json`) | **byte-identical** | **byte-identical** |
| forbidden tokens (`sorry`/`admit`/`axiom`/`native_decide`/`sorryAx`/`opaque`/`unsafe`/`implemented_by`) | **none** (only the words inside my own header comments) | **none** (idem) |
| `set_option` affecting kernel trust | none | none |
| **local `lake`-free kernel build (my toolchain)** | **0 errors, rc=0** | **0 errors, rc=0** |
| **`#print axioms`, verified LOCALLY not just reported** | **42/42 = `[propext, Classical.choice, Quot.sound]`** | **13/13 = same** |

**Only diff outside proof bodies, in either file:** `BURR2_MIXTURE` gained one import,
`Mathlib.Analysis.SpecialFunctions.Pow.Deriv` (needed for the derivative of `x ↦ x^p` in the §5
proof). That is squarely in the **MAY-emend** class (import addition, no statement or definition
touched) and I accepted it without patching anything myself.

**Unused-hypothesis warnings — checked, benign.** Seven `unused variable` linter warnings (CORE:
`hs` in `tail_zero`, `hR` in `CALL_nonneg`/`PUT_nonneg`, `h` in `harmonic_law`/`share_eq_agg_ratio`;
MIX: `ha` in `base_pos`/`Lc_pos`). I verified each is genuine slack, not a weakening: e.g.
`CALL_nonneg` does not need `TailRep` on the **right** wing because `A_R ≥ 0` follows from the
`ibeta ≤ 1` field alone, not from the sandwich. An unused hypothesis makes the result *stronger* than
advertised while leaving the statement I wrote byte-unchanged. Aristotle correctly left them in place
rather than tidying the statements.

**No candidate-fails-audit condition arose. Nothing was emended by me.**

## 5. Verdict and label

**`proved` — and beyond trusted-from-prover: RE-VERIFIED IN A LOCAL KERNEL.**

The Lean 4.28.0 toolchain + Mathlib built in the previous session survived the container restart, so
both returned files were compiled in my own kernel with `#print axioms` appended to every one of the
55 targets — 0 errors, all axiom sets exactly `[propext, Classical.choice, Quot.sound]`.

**Recommendation to the manager: promote the label to `verified`.** Standing caveat, same as the
2026-08-14 `v3-maps-lean` check and stated rather than hidden: the Mathlib `.olean`s came from the CI
cache, not rebuilt from source (universal practice). The label flip is the manager's call, not mine.

## 6. What remains OPEN — do not let these be reported as discharged

1. **§4 (sign/order) is conditional on `TailRep`, and the production instance is NOT proved.**
   `TailRep p s` says `tail p s ·` behaves like the tail integral of the antitone kernel (a two-sided
   Riemann sandwich on increments). It is the **one analytic bridge** between the closed form and the
   integral it represents. Proved satisfiable by an explicit witness (`a = γ = 1`, `ibeta = id`), so
   §4 is **not vacuous** — but that witness is a toy. That `TailRep` holds for the **real** incomplete
   beta at production parameters is, at present, **my numerical check only (to ~1e-13)**, not a
   theorem. Closing it properly needs a Mathlib-level incomplete-beta theory. **`CALL_antitone`,
   `PUT_monotone`, `AR_nonneg`, `AL_nonneg` are therefore conditional results.**
2. **The error bound is on the MIDPOINT member, not on the best fit.** `mixture_rel_error_le` bounds
   `mix / Δ_{γ̄}`. My obligation header argues a best fit can only beat the midpoint member and so
   inherits the bound — **that argument is in a comment, it is not proved in Lean**, and measurement
   shows it is *loose*: over `v ∈ [0.05, 3]` at `γ₁=1.8413, γ₂=2.5` the best-fit max relative residual
   is **1.42%** while the midpoint member's is **13.9%**. The bound is valid but roughly an order of
   magnitude conservative as a best-fit bound.
3. **The bound is local in both the parameter gap and the strike.** It grows with `Lc`, i.e. with
   moneyness, and degrades fast for wide gaps: at `γ₁=0.4, γ₂=3.0, v=5` the actual excess is 745% and
   the bound 5281%. **The operator's measured "0.02–0.12%" is a near-the-money, narrow-spread regime
   figure and must not be quoted as a global error bar.**
4. **Non-closure over all four parameters simultaneously is NOT proved.** Proved separately in the
   **tail** direction (`γ`) and the **scale** direction (`s`). Joint non-closure over
   `(S̄, a, γ, κ)` is open.
5. **Only the kernel/pricing layer is rebuilt on Burr-2.** The settlement layer
   (`LINK_SETTLEMENT` — common-doorway necessity) and the book layer (`BOOK_FORMAL`/`MAP_FORMAL`)
   are still stated over the single-power-law model. The `LINK_SETTLEMENT` results are kernel-agnostic
   (they are about units and a common factor, not about the shape), but **that portability is an
   assertion I have not mechanized**. The book layer's `MidConvex` bridge was discharged for the
   *single-lens* curve (`engine_call_midconvex`); **the corresponding Burr-2 bridge is NOT proved** —
   `CALL_antitone` is monotonicity, not midpoint-convexity. This is the next obligation.
6. **The `κ`-dynamics are not formalised at all.** `κ` is the state a swap moves
   (`Δκ = Σ ±w·λ·(Q/1%N)·(ATMp/P)`, clamped ±0.95). Nothing here says a swap leaves the book
   arb-free, or that the peg re-derives correctly after a swap. Everything above is **static, at
   fixed `κ`**.
7. **Latent coordinate seam (carried forward, still unresolved).** These theorems use **linear**
   moneyness `k` (parity `C−P = −k`). Stage 3 of the loop map uses **log**-moneyness. Not yet
   contradictory, but it bites the moment they are tied.

## 7. Artifacts

- `formal/aristotle_runs/BURR2_CORE/` — `OBLIGATION_as_submitted.lean`,
  `INSTRUCTIONS_as_submitted.txt`, `BURR2_CORE_returned.lean`, `ARISTOTLE_SUMMARY.md`,
  `AXIOMS_prover_reported.txt`, `LOCAL_BUILD_axioms.log`, `SUBMISSION_IDS.txt`
- `formal/aristotle_runs/BURR2_MIXTURE/` — same layout plus `REPORT_prover.md`
- Runs: CORE project `820a8643-43c4-46a4-8554-d797399535bc` / task
  `26958f2b-c7dc-4f1b-8240-64fdecb70ebf`; MIXTURE project `920d43a9-ae69-4eb2-8ed1-860c9ef91386` /
  task `e95f6377-2071-4d76-9b43-94f29b591082`.
- **Not committed.** Handed to the manager.

## 8. Operator-tier flags (for the manager to route)

- **The Burr-2 aggregation obstruction is second-order, where the single-lens one was structural.**
  A substantive argument for the kernel change, now mechanized. Paper-claim territory — operator's call.
- **The peg `qR = WL/(WR+WL)` is forced, not chosen.** Worth saying in the paper in exactly those
  words: it is the unique wing split that makes the value continuous at the money.
- **`0.02–0.12%` needs a scope qualifier** wherever it is quoted (see OPEN #2, #3). I would not ship
  it unqualified.
