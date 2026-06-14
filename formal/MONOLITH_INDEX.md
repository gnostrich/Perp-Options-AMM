# MONOLITH_INDEX — components mapped INTO the single structure `TemporalAMM`

> **⚠ LENS LAYER SUPERSEDED 2026-06-13 (operator entry 229/230 — constant-m).** This mapping is for
> the POLAR-lens `TemporalAMM` (field `lens : LensShape`, 5 axioms, `polarLens τ`, `g=γ·Φ_τ(|u|)`).
> The operator redefined the kurtosis lens to a CONSTANT slope multiplier `m`: the `lens : LensShape`
> field collapses to a single scalar `m : ℝ, 0<m`; `g (P) θ := m·γ` (no θ, no Φ); the warp lemmas
> collapse to the linear `warp_linear : ΔG = m·Δγ`. The current single structure is
> `RequestProject/MonolithConstM.lean` — prompt `formal/prompts/aristotle_prompt_monolith_constm.md`
> — **RETURNED + AUDITED 2026-06-13 → trusted-from-prover** (run `6016ec57`/task `3f85462d`, archive
> `aristotle_runs/MONOLITH_CONSTM/`; the constant-m single object now exists: `g_eq_m_gamma`,
> `g_const_in_strike`, `thetaTx_roundtrip`, `warp_linear`, smooth-paste at g=m·γ, `engineInstance`
> (m=1), `single_object`, plus the unchanged pool/trade/rebase/metriplectic spine; polar facts
> g=0-at-center / g≤γ correctly DELETED; audit PASS — see `formal/INDEX.md` for the full row).
> Object write-up:
> `notes/research/CONSTANT_M_lens_object_sync_2026-06-13.md`. The POOL + smooth-paste + rebase +
> trade-flow + metriplectic rows below are UNCHANGED (constant-m does not touch them); only the
> C3 lens / C16 warp / A5 / A10 rows and the `LensShape` field are superseded.

_research-lead (structure-reorder instance), 2026-06-12, operator entry 179 (verbatim): "and most
importantly ensuring structural unification into a single pure math structure on the lean side,
and then mapping the components within that...." This file IS that mapping: one row per component
(IDs = `docs/COMPONENT_REGISTER.md` Part A) + the binding constraints it realizes, each pointing
at its FIELD / `def` / theorem WITHIN the one structure — not at free-floating theorems._

_⚠ Concurrency note: a second research-lead instance runs the base monolith program (L2 defs /
Aristotle-store sweep / L3 oracle spec) per manager note on commit `66075a7`; reconcile this file
with its output at fold. This instance owns the STRUCTURE and the in-object warp lemmas._

## THE OBJECT
**`TemporalAMM`** (file target `RequestProject/Monolith.lean`; companion warp lemmas
`RequestProject/MonolithWarp.lean`). Carried data — everything else is derived:

| field | meaning | honesty |
|---|---|---|
| `alpha, beta` (+ positivity) | the two CONSERVED trade charges (Casimirs of the trade flow) | core data |
| `y` (+ `beta < y`) | the one state coordinate (cash reserve); `x` is DERIVED | core data |
| `lens : LensShape` | the kurtosis lens Φ with 5 axioms (Φ(0)=0, 0≤Φ≤1, monotone, continuous) | **HONEST GAP — a calibration FIELD, NOT derived from the object's free energy.** The polar lens `u/√(τ²+u²)` is the canonical instance (`polarLens`), axioms discharged concretely. Deriving Φ from H / a free-energy functional is OPEN. |

Derived in-namespace: `x`, `w`, `gamma`, `center`, `price`, `carry`, `poolPotential`, `trade`,
`rebase`, `lensU`, `g`, `warp`, `warpInc`, `warpPot`; object-adjacent: `gammaOfW`, `goalSeekW`,
`sStar`, `pasteC`, `markCont`, `markInt`. Engine instance: `engineInstance` =
⟨725, 275, 1000, polarLens 0.3⟩ — the calibrated worked pool (x=1000, w=29/40, γ=29/11,
center=11/29; the exact pool of `CONTINUOUS_trade_warp_lens_calculus_2026-06-12`).

## Status legend
- **IN-OBJECT/submitted** — stated inside `TemporalAMM`, submitted to Aristotle 2026-06-12
  (runs: monolith_core, monolith_warp); verdict pending audit.
- **GROUNDED (free-floating)** — already trusted-from-prover as a standalone theorem
  (`formal/INDEX.md` row cited); the in-object restatement is what's submitted.
- **N/A** — not a mathematical component of the v28 object (says so honestly).
- **OPEN** — not closed by the structure; named.

## PART A — component → place in the structure

| ID | Component | Place IN `TemporalAMM` | Status |
|----|-----------|------------------------|--------|
| C1 | Balancer base curve | fields `alpha,beta,y` + def `x` + thm `invariant` ((x−α)(y−β)=αβ) + `w_consistency` (α/x = 1−β/y) | IN-OBJECT/submitted (core) |
| C2 | Curve-warp weight FIELD w(u) | **ABSENT BY DESIGN** — v28 has no weight field (demoted v27 object); the warp DOF is the global `gamma` flowing through the lens (`trade` + `warp`) | N/A on the v28 object (honest) |
| C3 | Kurtosis knob τ (the lens) | field `lens : LensShape`; canonical instance `polarLens τ`; thms `g_nonneg`, `g_le_gamma` (cap-free), `g_zero_at_center` | IN-OBJECT/submitted (core); **lens-shape origin = the named HONEST GAP** |
| C4 | Carry / log-coordinate | def `carry := log price`; mode coordinate = `center` with `center_eq_sNorm` ((1−w)/w) and `center_eq_inv_gamma` | IN-OBJECT/submitted (core) |
| C5 | Rebase | def `rebase` + thms `rebase_x_scales`, `rebase_w/gamma/center/g_invariant` + **`trade_rebase_commute`** (the register's OPEN warp∘rebase-commute lemma, now in-object) | IN-OBJECT/submitted (core) |
| C6 | Pricing law value∝S^(−γ) wings | `phi_le_one` + polar wing bound `polar_phi_lower` ⇒ `g → gamma` in wings (frozen power-law asymptotes, A5) | IN-OBJECT/submitted (core+warp) |
| C7 | ITM American smooth-paste | defs `sStar`, `pasteC`, `markCont`, `markInt` + thms `paste_value`, `paste_slope` | IN-OBJECT/submitted (core); GROUNDED free-floating twins: R1 `valueMatch_A`/`slopeMatch_A`, T1a `Sstar_A_forced` (INDEX.md) |
| C8 | Uniform strike registration θ=sNorm(K) | def `lensU θ := log(θ/center)` — ONE coordinate, strikes and mode both in sNorm (MUST-APPLY-1) | IN-OBJECT/submitted (core) |
| C9 | Funding = slope-deviation ±g_loc | def `g` is the funding magnitude per strike; thms `g_zero_at_center` (zero at the 45° point), `g_nonneg` (R-leg sign) | IN-OBJECT/submitted (core); sign/κ scaling extrinsic (engine contract, not object math) |
| C10 | Slippage basis mpGeom | thm `price_eq_slope` (price == slope on the v28 object — the GH e^(−ghMu) wedge does not exist here) | IN-OBJECT/submitted (core); GH-line version N/A |
| C11 | Dollar/settlement pipe (settle-at-lensed) | settlement reads `markCont`/`markInt` of the SAME `g` def every other layer reads — single-basis is structural (one `g`, one `lensU`) | IN-OBJECT/submitted (core); the engine-side wiring stays gate-verified (`lens_selfcheck`), not Lean |
| C12 | THE gotcha (price-coord ≠ slope) | same as C10: `price_eq_slope` shows the v28 object has NO such wedge | IN-OBJECT/submitted (core); GH-only gotcha N/A |
| C13 | Solvency boundary (B1 floor) | **NOT closed by the structure.** B1 stays CARRIED[coverage] (INDEX.md); the object gives mark/value bounds only | OPEN (operator ship-gate) — do not over-promote |
| C14 | Esscher tilt / metriplectic frame | def `poolPotential` + thms `price_is_grad` (price = ∇μ, CONCRETE μ=(t−β)³/3αβ) + `R_psd` (μ″=2(t−β)/αβ ≥ 0) + `single_object` (fix the carried data ⇒ every reading fixed = T2 `single_source` shape on the monolith) | IN-OBJECT/submitted (core); abstract twins GROUNDED: T2 `single_source`/`price_is_grad`/`R_psd`, MERTON tie (μ = cumulant/Laplace exponent) — INDEX.md |
| C15 | File-safety gate | — (process artifact, not mathematics) | N/A |
| C16 | Warp-with-trades / goal-seek | def `trade` (conserves charges: `trade_conserves`; group: `trade_flow_group`; Identity IV: `trade_dx`; `gamma_affine` = steepness linear in cash) + def `warp` (the riding-lens integral with endpoints from the object's own flow) + L1 `warp_eq_potential_diff`/`warp_roundtrip_zero`, L2 `warp_nonneg`/`warp_le_dgamma`/`warp_wing_saturation`, L4 `warp_nonpos_of_sell` (single-signedness), L3 `live_diff_decomposition` (live read = warp + recentering) + readout `goalSeekW` thms `goalSeek_root`/`goalSeek_ge_half`/`goalSeek_strictMono` | IN-OBJECT/submitted (core+warp); math float64-verified vs live engine (note 2026-06-12, ≤5e-15) |

## PART B — binding constraints realized by the structure

| Constraint | Place in the structure |
|---|---|
| A1 trades warp the curve (w changes) | `trade` changes `w`/`gamma` (`gamma_affine`); the point-on-fixed-curve reading is impossible in-object |
| A2 kurtosis static under trades | `lens` is carried UNCHANGED by `trade` (definitional: trade touches only `y`) |
| A5 asymptotes preserved | `phi_le_one` + `polar_phi_lower` (wings → exact power-law γ) |
| A6 monotonicity/no-arb leg | `phi_mono` axiom field + `goalSeek_strictMono`; full no-arb NOT claimed in-object (see C13) |
| A7 weights complementary | structural: `w` and `1−w` are the two readings of one def |
| A10/A11 held-lens warp, skew across the sequence | `warp` = the N→∞ limit of the held-then-update sequence; `live_diff_decomposition` separates warp from recentering (the masked-frame defect, formalized) |
| A12 θ_K stays the settlement strike | `markInt` is parameterized by the SAME θ as `lensU`/`g` — no second strike exists in the object |

## Submissions (this instance, 2026-06-12 overnight)
| Run | File | Targets | State |
|---|---|---|---|
| monolith_core | `RequestProject/Monolith.lean` | structure + 20 core theorem groups + `polarLens` + `engineInstance` | submitted, awaiting candidate → audit |
| monolith_warp | `RequestProject/MonolithWarp.lean` | in-object L1/L2/L4 (P1) + wing saturation, L3 decomposition (P2) | submitted, awaiting candidate → audit |

Prompts: `formal/prompts/aristotle_prompt_monolith_core.md`, `…_monolith_warp.md`. All statements
numerically re-derived pre-submission (paste seam 1e-16; decomposition identity 4.5e-14;
`polar_phi_lower` 0 violations; ΔG(2×)=0.509532 == the research note's table).

## Honest scope lines (carry these into any operator-facing claim)
1. **The lens shape is a parameter.** `LensShape` carries Φ as a field with axioms; nothing here
   derives Φ_τ from the pool's free energy. Emergence is NOT claimed.
2. **L3 of the register (JS computes the Lean def) is NOT closed by this.** The structure + its
   theorems are L1-layer; the engine instance pins the calibrated VALUES, not the running code.
   The oracle gates remain the only engine bridge (register Part D honesty rule).
3. **Solvency (C13/B1) is not discharged** by the monolith; conditional only.
4. Everything returned is at best **trusted-from-prover** after audit — "verified" needs the
   canonical local kernel (env-blocked; entry 146 enabler queued).
