# PH UNIFICATION — the whole exchange as ONE pure-math object, solvency = passivity-under-admissible-inputs

> **═══ GATE RESULT (manager audit + skeptic af6b17ad, 2026-06-13) — CLEAR-AS-CONJECTURE ═══**
> Skeptic gate: **CLEAR** to fold as a CONJECTURE (not proven) and relay as the morning answer; no
> "geometry closes solvency" leak. Manager independently spot-verified the structure determination's
> anchors (7 Aristotle archives exist; `SingleCore.lean:43 omega:=v*w−w*v ≡0` in 1-D; CgfClean
> `cgf_deriv_mean_and_variance`+`cgf_convexOn` present). Two binding corrections from the gate:
> 1. **ENCOMPASSING-STRUCTURE FRAMING (operator entry 239): lead with the INFORMATION-GEOMETRIC BASE**
>    — ONE convex potential μ = the GH cumulant-generating function (price=∇μ, dissipation R=∇²μ=Fisher
>    metric); **port-Hamiltonian is its FORCED cotangent LIFT, not a second axiom; NOT "metriplectic"**
>    (the 1-D base's symplectic form ω≡0). PH and info-geo are DUAL VIEWS of one object, not rivals.
>    The §3 internal-passivity below should read "R=∇²μ=Fisher⪰0 on the base, lifted to CTPH," not
>    "assume a PH system." (Math/predicates/conjecture below UNCHANGED — this is headline emphasis.)
> 2. **The reduction over-credits passivity.** The proved reduction `solvency ⟸ input-admissibility`
>    needs ONLY the admissibility hypothesis; **passivity earns its keep in the INTERNAL no-free-money
>    half, not in the external solvency implication.** Do not write `solvency ⟸ passivity ∧ admissibility`
>    as if passivity is load-bearing for the external implication.
> ⚠ **WATCH-FLAG (skeptic, for any fold to shared truth):** `MonolithConstM` `Temporal.solvent` /
> `TemporalAMM.solvent_forever` have unconditional-*sounding* docstrings but discharge SOLELY from a
> carried `[OBLIGATION B1]` structure field — NEVER from geometry. This note correctly does not cite
> them; they remain a latent "solvent_forever sounds proven" trap. The internal-passivity Aristotle
> proof (task 80cd7ba4) is NOT yet returned — separate audit when it lands (esp. that n=1 `R.PosSemidef`
> is genuinely witnessed by `R_psd`, not re-stubbed).
> _(Below is research-lead's original conjecture note, gate-CLEARED as-is; the two corrections above
> are binding on any subsequent fold/relay. Manager edit, post-gate — research-lead's prose unaltered.)_

# (original note follows)
## PH UNIFICATION — the whole exchange as ONE pure-math object, solvency = passivity-under-admissible-inputs

_Owner: research-lead. 2026-06-13. Operator entries 237/238 ("the whole exchange comprehensively
can be a single pure mathematical object"; "if solvency is a rest-of-world / port related thing
doesn't it close out cleanly?"). Sharpens the entry-179 single-structure unification onto the FULL
exchange. **This is a CONJECTURE note + pinned-predicate spec, NOT a proof claim.**_

## 0. The honest headline (read this first; it is the whole point)

The value of this object is **LEGIBILITY**, not making solvency vanish. The conjecture splits the
exchange cleanly into two halves at the port boundary:

- **INTERNAL half (closes structurally — the prover target):** with stored energy `H` bounded below
  on the operating domain and the resistive port `R ⪰ 0`, the system is **passive** — it cannot
  manufacture value internally; storage at any horizon ≤ initial storage + cumulative supply through
  the ports. This is `no-internal-free-money`. It is provable from `R_psd` + Casimir-conserving trade
  flow + the CTPH sampled-passivity telescoping that already exists trusted-from-prover.

- **EXTERNAL half (does NOT self-close — stays a named hypothesis):** **solvency** =
  passivity-holds-AND-the-obligation-floor-is-met FOR ALL ADMISSIBLE INPUTS. The reduction
  `solvency ⟸ passivity ∧ input-port-admissibility` is provable; the **input-port-admissibility
  predicate itself is the irreducible B1/B3/B4 hypothesis** and is NOT discharged from geometry.
  This is exactly PH-4b "port/funding necessary-never-sufficient." κ is extrinsic; geometry cannot
  close it.

**⚠ ANTI-OVERCLAIM TRIPWIRE.** Nothing here lets a reader conclude "geometry closes solvency."
The operator's question — "doesn't it close out cleanly?" — has the precise answer: **the INTERNAL
half closes cleanly and structurally; the EXTERNAL half localizes to ONE minimal named hypothesis
on the input port (the price-path / collateralization / funding-adequacy bound) and stays open.**
Localizing ≠ closing. The deliverable is the localization, made rigorous.

## 1. What already exists (re-derived from the returned archives, not memory)

Three trusted-from-prover pieces are the load-bearing inputs; this note welds them, it does not
re-prove them:

1. **`MonolithConstM.TemporalAMM`** (run `6016ec57`/task `3f85462d`,
   `formal/aristotle_runs/MONOLITH_CONSTM/`). The single object: fields `alpha,beta,y,m` (+
   positivity `halpha,hbeta,hy:β<y,hm:0<m`). Carries the conserved trade charges `alpha,beta`
   (Casimirs), one state coord `y`, the kurtosis scalar `m`. Proven in-object:
   `price_is_grad` (price = μ′(y), the gradient of `poolPotential μ(t)=(t−β)³/(3αβ)`),
   `R_psd` (μ″(t)=2(t−β)/αβ ≥ 0 for t≥β — the resistive/dissipation curvature is PSD on-domain),
   `trade_conserves`/`trade_flow_group` (α,β conserved; trade is a one-parameter group = the
   lossless conservative flow), `rebase_*_invariant` (the gauge), `g_eq_m_gamma`/`thetaTx_*`/
   `warp_linear` (the constant-m lens), `paste_value`/`paste_slope` (smooth-paste C¹ at the
   settlement seam, ∀ g>0), `engineInstance` (m=1 = the calibrated pool), `single_object`.

2. **`CTPH.sampled_passivity`** (`formal/aristotle_runs/CTPH_clean/`). The abstract discrete
   passivity: with `J.transpose = −J` (skew interconnection, `skew_quadForm_zero`) and `R.PosSemidef`
   (`psd_quadForm_nonneg`), per-tick dissipation ≥ 0 (`sampled_dissip_nonneg`), the exact
   forward-Euler increment `H(k+1) = H(k) + supplied − dissipated` (`sampled_increment`), and the
   telescoped bound `Hs N ≤ H0 + Σ supplied` (`sampled_passivity`). **This is the internal-half
   theorem in abstract matrix form** — the no-internal-free-money law. CTPH deliberately does NOT
   instantiate a storage floor (that is external).

3. **`B1.solvent_of_port_covers`** + **`B1.port_necessity_note`**
   (`formal/aristotle_runs/B1/`). The conditional reduction: with `equity = V + support` and the
   coverage hypothesis `hcov : ∀ s, floor − V s ≤ support s`, then `∀ s, floor ≤ V s + support s`;
   and the coverage condition is EXACTLY the solvency condition (↔). **This is the external-half
   reduction** — solvency ⟸ port covers the deficit, and the coverage condition is never weaker than
   solvency, so geometry (which gives no reserve floor, PH-4b) cannot supply it.

The conjecture: **these three are facets of ONE object.** (1) is the storage + conservative flow +
gauge + lens + settlement seam; (2) is the passivity dynamics on its ports; (3) is the external
solvency reduction at the obligation port. Welding them into a single structure makes the split
between "closes structurally" and "stays a hypothesis" a TYPED, machine-checked seam.

## 2. THE UNIFIED OBJECT (conjecture statement)

Wrap (do not weaken) `TemporalAMM` with the port and obligation data. One structure; every exchange
component is a member / morphism / port.

```
structure Exchange where
  amm        : TemporalAMM                          -- §1.1: storage + conservative flow + gauge + lens
  -- obligation / output port (settlement is bound IN here)
  obligation : ℝ → ℝ                                -- O(p): the convex claim the pool owes per strike/price
  -- resistive / dissipative port (funding, through the lens, ±m·γ)
  funding    : ℝ → ℝ                                -- support(s): funding-port inflow at state s
  -- co-energy / units map (the dollar/USD pipe)
  dollar     : ℝ → ℝ                                -- units map reserve-coord → USD (forward, monotone)
  -- close-mechanic: position → state/payoff. PENDING DESIGN (Q14). PARAMETRIZED, NOT assumed.
  close      : ℝ → ℝ → ℝ                            -- close (position) (state) → payoff; choice deferred
  -- floor the obligation port must clear (extrinsic; B1 ship-gate)
  floor      : ℝ
  -- admissibility predicate on the INPUT port (oracle/price-path bound, collateralization, funding
  -- adequacy) — the irreducible B1/B3/B4 hypothesis, named explicitly, NOT discharged.
  admissible : (ℕ → ℝ) → Prop                       -- admissible price/oracle path
```

Component → member/morphism/port mapping (operator entry 179 "mapping components within"):

| Exchange component        | bound in as                                  | provenance / status |
|---------------------------|----------------------------------------------|---------------------|
| **storage** = curve (Balancer + lens m) | `amm.poolPotential` / `amm.price_is_grad`     | trusted-from-prover (MonolithConstM) |
| **flow** = trades (Casimir-conserving)  | `amm.trade` + `trade_conserves`/`trade_flow_group` | trusted-from-prover |
| **gauge** = rebase                      | `amm.rebase` + `rebase_*_invariant`           | trusted-from-prover |
| **resistive port** = funding (±m·γ slope-dev) | `funding` member; `R_psd` (μ″≥0) is the PSD curvature | trusted; PSD-from-engine-formula OPEN (B3) |
| **boundary output port** = settlement   | `paste_value`/`paste_slope` bound IN as a `settle` morphism (C¹ at S*) | trusted-from-prover (the C¹ seam) |
| **co-energy / units** = dollar/USD pipe | `dollar` member (forward monotone units map)  | no-Lean (label honest) |
| **dissipation functional on trade port** = slippage (A15) | (named, **UNBUILT** — slippage A15 not built) | OPEN, flagged unbuilt |
| **close-mechanic** = position→state/payoff | `close` member — **PARAMETRIZED, design pending Q14** | OPEN design choice, NOT assumed |
| **solvency** = passivity-under-admissible-inputs | the theorem split in §3/§4 | INTERNAL trusted-target; EXTERNAL hypothesis |

## 3. INTERNAL HALF — the structural passivity theorem (the prover target, §3.x pinned)

**Claim (no-internal-free-money).** With `H` (sampled storage built from the funding-supplied power
minus dissipated power) and the resistive port `R ⪰ 0`, the system is passive:

```
Hs N ≤ Hs 0 + Σ_{k<N} supplied k         (storage never exceeds initial + cumulative port supply)
```

and the conservative trade flow contributes ZERO net power (the skew/Casimir leg: `J` skew ⇒
`zᵀJz = 0`; trade conserves `α,β` ⇒ no storage created by a pure trade). This is `CTPH.sampled_passivity`
welded to `TemporalAMM`'s `R_psd` and `trade_conserves` so the abstract `R.PosSemidef` /
`J.transpose=−J` are WITNESSED by the concrete object (μ″≥0 supplies the PSD diagonal; α,β-conservation
supplies the lossless flow).

**Pinned predicates (READY TO SUBMIT — every predicate pinned, entry-179 discipline):**

- The storage rate is `dH = supplied − dissipated`, `dissipated = Δt·zᵀRz ≥ 0`, `supplied = Δt·uᵀGᵀz`
  (CTPH forms, verbatim — `supplied`/`dissipated`/`Hs` defs already pinned in CTPH.lean).
- The PSD witness for `R` on the concrete object: `R_psd : ∀ t, β ≤ t → 0 ≤ deriv (deriv poolPotential) t`
  (MonolithConstM, verbatim) — the 1×1 resistive curvature is PSD on the operating domain `t ≥ β`.
  PIN: the welding lemma states the scalar dissipation `μ″(t)·v² ≥ 0` (`R_psd` × square ≥ 0); the
  matrix `PosSemidef` form is the n=1 specialization.
- The lossless conservative leg: `trade_conserves : (trade D).alpha = alpha ∧ (trade D).beta = beta`
  (verbatim) — the Casimirs `α,β` are conserved, so a pure trade injects no storage. PIN: the welding
  lemma states `poolPotential` evaluated on a pure trade changes only through the supplied port, never
  spontaneously (`trade_no_spontaneous_storage`).
- Headline: `internal_passivity : Hs N ≤ Hs 0 + Σ supplied` — **identical to `CTPH.sampled_passivity`,
  re-exported on the welded structure** with `hR` discharged by `R_psd` (n=1) and `hΔt:0≤Δt`.
- Corollary `no_internal_free_money : Hs N − Hs 0 ≤ Σ supplied` (the closed-cycle / no-arb internal
  reading: with zero net supply over a closed cycle, storage cannot increase).

**Why this is reachable now:** `sampled_passivity` is ALREADY proved (CTPH_clean, trusted-from-prover);
`R_psd` and `trade_conserves` are ALREADY proved (MonolithConstM). The new content is purely the
**welding** — instantiate the abstract `R.PosSemidef` at n=1 with the concrete `R_psd` curvature, and
re-export. This is a low-risk Aristotle submit (mostly `exact`/specialization).

## 4. EXTERNAL HALF — solvency reduces to passivity ∧ input-admissibility (HONEST: conjecture-with-hypothesis)

**Claim (the reduction — provable).** Solvency at the obligation/output port reduces to:

```
solvency  ⟸  internal_passivity  ∧  input_port_admissibility
```

where, with `equity s = poolValue s − obligation s + funding s` (= storage − claim + port inflow):

- `solvency : ∀ s, floor ≤ equity s`   (the obligation port is always covered)
- the reduction is `B1.solvent_of_port_covers`: given `hcov : ∀ s, floor − (poolValue s − obligation s)
  ≤ funding s`, then `∀ s, floor ≤ (poolValue s − obligation s) + funding s`. **Provable, trivially
  (`linarith`), and ALREADY trusted-from-prover in `B1.lean`.**

**Claim (the irreducible hypothesis — NOT discharged).** The coverage hypothesis `hcov` is EXACTLY
the input-port-admissibility predicate, and `B1.port_necessity_note` proves it is **equivalent** to
solvency (neither stronger nor weaker). Therefore:

- **PH-4b (necessary-never-sufficient) is HONORED, machine-checked:** `reserves_have_no_floor`
  (PH4b) shows the reserve part `poolValue − obligation` has NO lower bound on `Ioi 0` once the
  obligation is unbounded against bounded reserves. So `hcov` CANNOT be supplied by geometry — the
  funding port is NECESSARY. And `port_necessity_note` (↔) shows covering the deficit is exactly
  solvency — so the port is SUFFICIENT only under `hcov`, which is never discharged.
- **The MINIMAL input-port admissibility predicate.** How small can the irreducible hypothesis be
  made? The conjecture: `admissible` decomposes as the conjunction of three named bounds, and `hcov`
  follows from their conjunction (each maps to one of B1/B3/B4):
  - **B3 (resistive adequacy):** the funding port runs the right sign — `∀ s, 0 ≤ funding s` is NOT
    enough; the engine `arbitrageToOracle`/funding rate must be `R⪰0` AND large enough. The PSD half
    (`arb_nonneg`) is the proved/necessary part; magnitude is extrinsic.
  - **B4 (price-path / oracle bound):** the admissible oracle path `(ℕ → ℝ)` is bounded so the convex
    obligation deficit `obligation s − poolValue s` is bounded over the path — an unbounded adversarial
    price path makes the deficit unbounded above (PH-4b), defeating any fixed funding rate. This is
    the **adversarial-price-path** non-closure: the EXTERNAL half does not self-close precisely here.
  - **B1 (collateralization / floor coverage):** the residual extrinsic κ — the funding port plus
    collateral must cover whatever deficit the (bounded) admissible path produces, down to `floor`.
    This is the ship-gate constant. κ extrinsic; geometry cannot close it.
  - **MINIMALITY conjecture:** `hcov` is equivalent to "B3 ∧ B4 ∧ B1" being jointly the statement
    `∀ admissible path, floor − (poolValue − obligation) ≤ funding`. We cannot shrink it below `hcov`
    itself, because `port_necessity_note` proves `hcov ↔ solvency` — i.e. **the minimal hypothesis IS
    solvency restricted to admissible inputs.** That is the precise sense in which solvency "localizes
    to one named hypothesis" without closing: the hypothesis is irreducible by the ↔.

**What is provable here (and will be stated as such):** the reduction `solvent_of_port_covers` and the
equivalence `port_necessity_note` (both ALREADY trusted-from-prover) + the PH-4b no-reserve-floor
necessity. **What stays a hypothesis:** `admissible`/`hcov` itself — the adversarial-price-path bound,
collateralization, funding magnitude. **NO LEAN STATEMENT asserts solvency unconditionally.** Any
Exchange-level "solvency" theorem carries `hcov` (or `admissible`) as an explicit `→` premise.

## 5. The single-object headline (conjecture, to be the wrap theorem)

```
theorem exchange_solvency_split (E : Exchange) (N : ℕ) (Δt : ℝ) (hΔt : 0 ≤ Δt) ... :
  -- INTERNAL (unconditional): passivity / no-internal-free-money
  (Hs ... N ≤ Hs ... 0 + Σ supplied)
  ∧
  -- EXTERNAL (conditional): solvency UNDER the named input-port hypothesis
  ( (∀ s, E.floor - (E.amm.poolPotential s - E.obligation s) ≤ E.funding s)
      → ∀ s, E.floor ≤ (E.amm.poolPotential s - E.obligation s) + E.funding s )
```

The conjunction IS the legibility deliverable: one object, internal half discharged, external half
a single explicit `→` premise. The premise is the minimal named B1/B3/B4 admissibility hypothesis.

## 6. What is OPEN / honest-gap list (do not let these be read as closed)

- The `Exchange` wrap structure is **not yet submitted/returned** — §2/§5 are conjecture statements.
- **B3 PSD-from-engine-formula** (funding rate ≥ 0 from `arbitrageToOracle`) — scaffolded, not grounded.
- **B4 adversarial-price-path bound** — the precise admissibility predicate is named, not proven minimal.
- **B1 κ coverage** — extrinsic ship-gate, operator's call. NOT closed.
- **close-mechanic (Q14)** — PARAMETRIZED `close` member; the AMM-tx-or-not design choice is the
  operator's. No theorem assumes a specific close.
- **slippage (A15)** — dissipation functional on the trade port, named, UNBUILT.
- **dollar/USD pipe** — co-energy units map, no Lean.
- The internal-half welding (§3) is a **ready-to-submit** Aristotle target, not yet returned.

## 7. Provenance label discipline

trusted-from-prover ≠ verified. Solvency is NOT closed by this note — it is localized to a named
hypothesis (`hcov`/`admissible`). Any wording that blurs internal-closes vs external-stays-open is a
self-FLAG. Hand to manager for independent audit + skeptic gate BEFORE this is shared truth or folded
as more than a conjecture.
