# Port-Hamiltonian consistency spec — Temporal (GH branch)

_Owner: research-lead. Last updated: 2026-06-08. Status doc for the PH obligation queue._

## 0. Purpose and reading order

This spec maps the **port-Hamiltonian (PH) structure** of the Temporal AMM onto a list of
**named Lean obligation targets** (PH-1 … PH-7). It is the consistency contract between the math
(port-Hamiltonian dynamics on the GH reserve geometry) and the Lean scaffold
(`formal/temporal_lean_verified/RequestProject/{Temporal,AMMCurve,Seam}.lean` and the self-contained
prompt `formal/prompts/aristotle_prompt_port_hamiltonian.md`).

A discrete-time PH system is the tuple `(H, J, R, ports)` with energy balance

```
H(next) = H(now) + supplied(ports) − dissipated ,   dissipated ≥ 0 ,
```

where `J` is a skew-symmetric (lossless) interconnection that routes power without creating or
destroying it, and `R ⪰ 0` is the dissipation/resistive structure. Passivity is the statement that
`H` cannot be manufactured: storage at any horizon ≤ initial storage + cumulative supply. The
abstract core of this is already proved curve-agnostically in `§1` of the prompt
(`Temporal.PassiveSystem`); the work here is to **instantiate each PH ingredient on the GH curve**
and to prove the consistency facts that the seams depend on.

**Provenance discipline.** Anything marked `proved-in-prompt` is *trusted-from-prover* at best:
it compiles in the self-contained prompt file but is not yet folded into the `RequestProject` build
and not yet built locally by the manager. Do not upgrade these to "verified" until the manager
builds them. The prover loop is **direct**: research-lead phrases the obligation, submits it to
Harmonic's Aristotle itself (aristotlelib CLI), and re-verifies the returned candidate locally — no
courier, no separate prover agent. research-lead reports only distilled verdicts up to the manager.

**Status legend:** `open` (not yet stated as Lean) · `scaffolded` (structure/field exists, claim not
proved) · `proved-in-prompt` (proof present in a prompt file, awaiting local build) · `proved-folded`
(in RequestProject and built locally by the manager — none yet).

**Escalation discipline.** Each target is tagged **AUTONOMOUS** (pure formalization — research-lead
may phrase and queue it without an operator decision) or **ESCALATE** (would require an
economic-object / settlement-semantics change to the engine, which is the operator's call via the
manager). research-lead does not decide escalations; it flags them. If any PH property *as written*
would force a real engine change, stop and flag rather than re-phrasing it into something the engine
does not actually do.

---

## PH-1 — H ↔ GH curve (stored energy identified with the reserve geometry)

**Informal.** The PH storage function `H` is the pool equity, and its reserve component is the GH
reserve geometry's value: `H = poolValue(p) − O(p) + support`, where `poolValue` is the lower
envelope of the reserve frontier (already the storage in `Seam.lean`), `O` is the convex obligation
the pool owes, `support` is accrued external port (funding/hedge), and the carry `P = Ny/Nx` is the
anchor of the price coordinate `u = log price − log P`.

**GH instantiation required.** An `AMMCurve` instance for the GH frontier `y(x)` with bounded
domain `X ∈ (0, Nx)`, `Y ∈ (0, Ny·M)` (this is the GH gate-discharge, see PH-4 for the coercivity
watch). Until that instance lands, PH-1 holds *abstractly* for any `AMMCurve` via `Seam.lean`'s
`intrinsic`/`CurvePool.equity`.

**Lean shape.** Reuse `TemporalSeam.intrinsic (C : AMMCurve) (O) (p) := C.poolValue p − O p` and
`CurvePool.equity s := intrinsic C O (price s) + support s`. The PH-1 consistency claim is that this
`equity` is exactly the `H` field of the reduced `TemporalAMM` / `PassiveSystem` — already witnessed
by `CurvePool.toTemporalAMM` and `TemporalAMM.toPassiveSystem`. The remaining content is the GH
`AMMCurve` instance so that `H` is the *GH* geometry, not a placeholder curve.

**Status:** `scaffolded` (abstract `H` wired in `Seam.lean`; GH-specific instance is `open`, shared
with PH-4 / GH gate-discharge).

**Tag:** AUTONOMOUS. Pure formalization — instantiating an existing structure on the GH frontier;
no engine semantics change. (The GH frontier formula is already fixed in `engine/knowledge/`.)

---

## PH-2 — Skew-symmetric interconnection J (lossless power routing)

**Informal.** Trades route power between the X and Y ports without creating or destroying stored
energy: the interconnection `J` is skew-symmetric, i.e. `power_in_via_J = 0` along a pure trade.
Concretely a trade is the hyperbolic boost on the invariant `Φ = X·Y`, and the boost conserves `Φ`.
Conservation of the invariant *is* the discrete witness that `J` contributes zero net power — the
lossless / power-continuous interconnection of the PH form.

**GH instantiation required.** The §2 seed (`Barrier.boost`, `Phi = X·Y`) is the constant-product
shadow. For GH the conserved quantity is the GH invariant, not `X·Y`; the consistency target is to
show the GH trade map conserves the GH invariant and composes as a one-parameter group. **Watch:**
the GH trade map is `tradeUpdate` in the engine — the Lean `boost` must be the *same* map (price-
coordinate, factor `e^(−ghMu)`), not a re-derived one. If they diverge, that is a finding, not a
fix.

**Lean shape.** Generalize §2: `boost_preserves_Phi`, `boost_zero`, `boost_add` (one-parameter
group) already proved-in-prompt for `Φ = X·Y`. The GH version needs `GHPhi : ℝ → ℝ → ℝ` and
`GHboost`, with `GHboost_preserves_GHPhi` and `GHboost_add`. Skew-symmetry of `J` is the corollary
that the per-tick `supplied` term carries **no** contribution from the trade map alone (trade
energy is fully accounted by the `Φ`-conservation, leaving dissipation = 0 for a pure trade).

**Status:** `proved-in-prompt` for the constant-product seed; `open` for the GH invariant and the
explicit "`J` contributes zero net power" corollary.

**Tag:** AUTONOMOUS, with a stop-and-flag caveat: if reconciling the Lean `boost` with the engine
`tradeUpdate` reveals the engine trade does *not* conserve the stated invariant, that is an engine /
economic-object discrepancy → **flag to manager**, do not silently change either side.

---

## PH-3 — Dissipation R ⪰ 0 ↔ funding / fee (PSD resistive structure)

**Informal.** The resistive structure `R` is positive-semidefinite: the per-tick dissipation (the
arbitrage / LVR leak, net of fees) is `≥ 0`. This is the engine grounding of the abstract
`dissip_nonneg` field and corresponds to PH dissipation `R ⪰ 0`. It is exactly **B3 `arb_nonneg`**.

**GH instantiation required.** The real engine `arbitrageToOracle` / funding accrual must produce a
per-tick leak `arbLeak s ≥ 0` on the GH curve. The abstract claim is a structure field; the engine-
grounded claim is that the engine's actual arb/funding formula discharges it.

**Lean shape.** `arb_nonneg : ∀ s, 0 ≤ arbLeak s` (field of `TemporalAMM` / `CurvePool`). The PSD
upgrade is to express `arbLeak` as a quadratic form `vᵀ R v` with `R ⪰ 0` in the relevant
deviation variable (slope-deviation vs the w=½ anchor), then prove nonnegativity from `R`'s PSD-ness
rather than asserting it. Minimal version stays the field; full version proves it from the engine
formula.

**Status:** `scaffolded` (field exists in `TemporalAMM` and `CurvePool`); engine-grounded PSD proof
is `open` — this is the B3 part of the B1/B3/B4 prize.

**Tag:** AUTONOMOUS for the formalization of "`arbLeak` from the engine arb formula is ≥ 0". Note:
funding port is **necessary, not sufficient** — proving R ⪰ 0 does not by itself close solvency
(that is PH-4 / B1). No engine change required to *state* it; if the engine formula turns out to
admit a negative leak under some state, that is a finding → **flag**.

---

## PH-4 — Passivity / energy-accounting inequality + the floor question

**Informal.** Two distinct claims live here; keep them separate.

  (a) **Passivity / energy accounting** — `H(run s n) ≤ H s + cumSupplied s n`. The system cannot
  manufacture value. This is the home of the abstract passivity theorem and the no-free-lunch
  closed-cycle result.

  (b) **The floor question — `reserves_have_no_floor` vs `H_floor`.** This is the load-bearing
  subtlety. The abstract §1 *assumes* a floor via the `H_floor` / `solvent` field (B1). The harder,
  honest claim is the **opposite** at the reserve level: a strictly convex obligation has **no**
  lower bound from reserves alone — `Seam.lean`'s `reserves_have_no_floor` proves
  `¬ BddBelow (intrinsic (cpmm k) (p ↦ p²) '' Ioi 0)`. The PH reading: **the reserve geometry is
  not intrinsically coercive against a convex claim; the floor is a PORT property, not a storage
  property** — i.e. "convexity must be funded." For GH specifically, the BddBelow/coercive watch is
  whether GH's *bounded reserves* (`X ∈ (0,Nx)`, `Y ∈ (0, Ny·M)`) make `poolValue` bounded below
  intrinsically (the `coercive` gate field), which is a *different* statement from whether
  `equity = poolValue − O` is bounded below (it is not, once `O` is convex and unbounded).

**GH instantiation required.** (a) holds for any `AMMCurve` via the reduction — no GH specifics.
(b) needs: the GH `coercive` field (poolValue bounded below on bounded reserves), AND a GH analogue
of `reserves_have_no_floor` showing equity-minus-convex-claim still has no reserve floor, so B1 must
come from the funding port (PH-3 / §3 `Hwell_bddBelow` is the model potential for that port).

**Lean shape.**
  - (a) `PassiveSystem.passivity`, `PassiveSystem.closed_cycle`, and the `TemporalAMM`/`CurvePool`
    corollaries — **proved-in-prompt** (curve-agnostic).
  - (b-floor-is-port) `TemporalSeam.reserves_have_no_floor` — **proved-in-prompt** for cpmm with
    `O = p²`. GH version `open`.
  - (b-coercive) `AMMCurve.coercive` discharged for the GH instance — `open` (GH gate-discharge).
  - **Pin precisely:** "reserves-have-no-floor" = `¬ BddBelow ((intrinsic C O) '' dom)` for the GH
    `C` and a fixed strictly-convex `O` (e.g. `O p = p^2`). This is NOT the negation of the
    `coercive` gate (which is about `poolValue` alone, no `O`). Stating these as the same thing is
    the error to avoid.

**Status:** (a) `proved-in-prompt`; (b) `proved-in-prompt` for cpmm seed, `open` for GH; coercive
gate `open` (GH gate-discharge).

**Tag:** AUTONOMOUS for (a) and (b) as formalization targets. **B1 itself (the real solvency floor
from the funding port, γ>1 included) is the undischarged solvency prize** — proving it from the real
engine funding formula is the open economic work; if the GH funding port as currently specified
cannot cover the convex deficit (κ extrinsic — geometry can't close it), that is the B1 ship-gate
question and must be **flagged to the operator via the manager**, not decided here.

---

## PH-5 — C¹ continuity of H at the smooth-pasting boundary

**Informal.** At the American smooth-pasting boundary `S* = K·γ/(γ+1)` (equivalently
`sNorm* = θ·((γ+1)/γ)^γ`), the storage `H` must be **C¹**: both value AND slope of the continuation
branch `c·sNorm` match the intrinsic branch at `S*`. This is the Lean image of the engine **seam
gate** (value + slope match at the smooth-pasting boundary). Continuity of `H` and `dH` at the seam
is what makes the PH energy balance well-defined across the ITM/OTM boundary (no spurious power
injection at the seam).

**GH instantiation required.** The ITM continuation closed form: `c = 1/((γ+1)·sNorm*)`,
`sNorm* = θ·((γ+1)/γ)^γ`, `S* = K·γ/(γ+1)`. Need the two one-sided expressions for `H` (continuation
vs intrinsic) and their derivatives evaluated at `S*`.

**Lean shape.** New target. Define `Hcont (s) := c * s` and `Hintr (s) := intrinsic value past S*`,
prove `Hcont S* = Hintr S*` (value match, C⁰) and `deriv Hcont S* = deriv Hintr S*` (slope match,
C¹). Likely uses `Real.rpow` for the `((γ+1)/γ)^γ` term and `HasDerivAt`. This ties directly to the
engine's seam gate; the Lean statement should reference the same `S*`, `c`, `sNorm*` constants.

**Status:** `open` (no Lean yet; closed form is fixed in `CLAUDE.md` §4 / the ITM spec).

**Tag:** AUTONOMOUS as a formalization target — the smooth-pasting boundary and continuation form
are *already locked decisions* (v26b, `SPEC_itm_exercise_smoothpaste_NEXT.md`). Formalizing them does
not change the engine. **Caveat / stop-and-flag:** the smooth-pasting boundary itself and the ITM
settlement rule are settlement-semantics — if formalization shows the locked closed form is **not**
actually C¹ (a slope mismatch at `S*`), that is a settlement-semantics finding → **ESCALATE** to the
operator via the manager (it would mean the engine seam rule needs revisiting). The default
expectation is that it IS C¹ by construction; flag only if the proof fails.

---

## PH-6 — Rebase as a structure-preserving coordinate change θ → θ/r

**Informal.** A rebase is a gauge transformation: the strike ray `θ → θ/r` and the carry `P → P/r`,
with reserves/anchor rescaled. It must be **structure-preserving**: it leaves the pricing coordinate
`sNorm` invariant (degree-0 gauge symmetry, §2 seed) AND it preserves both the interconnection `J`
(PH-2) and the dissipation `R` (PH-3) — i.e. passivity and the energy balance are rebase-invariant.
The PH reading: rebase is a symplectomorphism of the PH structure, not a perturbation of it.

**GH instantiation required.** The §2 `sNorm_rebase_invariant` (`sNorm (λX) (λα) = sNorm X α`) is the
seed. Generalize to: (i) `sNorm` invariance under the GH rebase map; (ii) `Φ` (or GH invariant)
covariance so `J` is preserved; (iii) `arbLeak` / `R` invariance under the same rescaling, so the
balance equation has the same form pre- and post-rebase.

**Lean shape.** `sNorm_rebase_invariant` — **proved-in-prompt**. New targets: `J`-preservation
(`GHPhi (rebase X) (rebase Y) = (scale) * GHPhi X Y` with the scale cancelling in the power balance)
and `R`-preservation (`arbLeak (rebase s) = arbLeak s` or the appropriate covariance). Cleanest form:
exhibit a map `Φ_rebase : PassiveSystem → PassiveSystem` and prove it preserves `supplied`,
`dissipated`, and `balance` up to the gauge factor.

**Status:** `proved-in-prompt` for the `sNorm` gauge invariance; `open` for J- and R-preservation
under rebase.

**Tag:** AUTONOMOUS. Rebase semantics (`θ→θ/r`, `P→P/r`, anchor w=½) are locked architecture
(`CLAUDE.md` §4). Formalizing invariance does not change them. Stop-and-flag only if the proof shows
rebase does NOT preserve `J` or `R` (would mean the rebase rule injects/destroys energy → a real
finding) → flag to manager.

---

## PH-7 — End-to-end PH consistency (the seam-propagation contract)

**Informal.** The whole point of the typed scaffold: a change at any one PH ingredient must
type-check at every seam. PH-7 is the meta-target that the chain
`AMMCurve (PH-1,J,R) → Seam (H wiring) → Temporal (passivity)` composes with **no gap**, so that the
three engine corollaries (passivity, solvency-forever, no-free-lunch) hold for the *GH-instantiated*
pool, not just the abstract one.

**GH instantiation required.** All of PH-1…PH-6 discharged for the GH `AMMCurve` instance, then the
`CurvePool`/`TemporalAMM`/`PassiveSystem` corollaries fired on it (as `demoPool` does for cpmm).

**Lean shape.** A GH analogue of `TemporalSeam.demoPool` plus the three corollary applications
(`CurvePool.passivity`, `CurvePool.solvent_forever`, and a `no_free_lunch` corollary). This is the
"it all instantiates" witness.

**Status:** `open` (depends on PH-1/PH-4 GH instance and PH-3/B1 discharge).

**Tag:** AUTONOMOUS as a composition target; inherits the B1 escalation from PH-4 (the solvency
field must be genuinely dischargeable for GH, which is the open economic prize, not a formality).

---

## Dependency / status summary

| Target | Property | Status | Tag |
|--------|----------|--------|-----|
| PH-1 | H ↔ GH curve geometry (carry P=Ny/Nx) | scaffolded (GH instance open) | AUTONOMOUS |
| PH-2 | skew-symmetric J / lossless trade (Φ-conservation) | proved-in-prompt (cpmm seed); GH open | AUTONOMOUS (flag if engine trade diverges) |
| PH-3 | R ⪰ 0 ↔ funding/fee (B3 arb_nonneg) | scaffolded; engine-grounded PSD open | AUTONOMOUS (flag if neg leak) |
| PH-4 | passivity + floor-is-a-port (reserves_have_no_floor; coercive watch) | (a) proved-in-prompt; (b) cpmm proved-in-prompt, GH open; B1 open | AUTONOMOUS formalization; **B1 ship-gate → operator** |
| PH-5 | C¹ continuity of H at S*=Kγ/(γ+1) | open | AUTONOMOUS (ESCALATE if not C¹) |
| PH-6 | rebase θ→θ/r preserves J and R | proved-in-prompt (sNorm gauge); J/R open | AUTONOMOUS (flag if rebase moves energy) |
| PH-7 | end-to-end GH PH consistency | open | AUTONOMOUS (inherits B1) |

## Escalations flagged by this spec (research-lead does NOT decide these)
- **B1 / PH-4** — whether the GH funding port can actually cover the convex deficit to a real floor
  (κ extrinsic; geometry cannot close it). Ship-gate / economic-object call → **operator via
  manager**.
- **PH-5** — if the locked smooth-pasting closed form proves NOT C¹ at `S*`, that is a
  settlement-semantics finding → **operator via manager**. (Default expectation: it is C¹.)
- General stop-and-flag: PH-2/PH-3/PH-6 each carry a "flag, don't fix" trigger if the Lean
  reconciliation reveals the engine map does not actually have the claimed PH property.

No target as written forces a real engine change *to state and queue it*. The only engine-touching
outcomes are conditional findings (the flags above), which are reported, not acted on.
