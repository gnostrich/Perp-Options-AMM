# Temporal Exchange — formal-verification package for independent audit

**For:** the verifier. **Posture:** trust nothing here; everything below is set up so
you can confirm it yourself. The prover (Aristotle) ran the Lean; I (the research
relay) audited the source and the math but **did not run Lean** (sandbox egress wall).
So the compile result is *trusted-from-prover* — your job is to remove that trust by
building it. The source audit and the math audit you can also reproduce from the
scripts included.

---

## 0. What's in the package

```
temporal_lean_verified/        complete Lean 4 project (build this)
  RequestProject/
    AMMCurve.lean               curve interface + short-gamma bridge
    Temporal.lean               abstract passivity scaffold + engine reduction
    Seam.lean                   the join: curve -> value -> storage -> guarantees
    Audit.lean                  scratch: #print axioms for every key result
    Main.lean                   options only
  lakefile.toml / lean-toolchain / lake-manifest.json
audit.sh                        mechanical source scan (forbidden tokens, axioms)
verify_math.py                  numerical re-check that the STATEMENTS are true/non-vacuous
MANAGER_VERIFICATION.md         this file
```

Toolchain pinned: **Lean 4.28.0 + Mathlib v4.28.0**.

---

## 1. Build it yourself (removes the trusted-from-prover step)

```
cd temporal_lean_verified
elan toolchain install leanprover/lean4:v4.28.0     # if not present
lake exe cache get                                   # prebuilt Mathlib; avoids long build
lake build                                           # EXPECT: 0 errors
lake build RequestProject.Audit                      # prints #print axioms for all results
```

Pass condition: `lake build` exits 0, and every `#print axioms` line from `Audit.lean`
shows **only** `propext`, `Classical.choice`, `Quot.sound` (the standard Mathlib base —
no extra axioms, no `sorryAx`).

---

## 2. Mechanical source audit (`bash ../audit.sh` from inside the project)

Confirms, across all three modules:
- `sorry / admit / native_decide / sorryAx / opaque / unsafe` → **0** (the only `sorry`
  hit is the word inside one comment in `Temporal.lean`; the script prints that line so
  you can see it).
- real `axiom` declarations → **0**. The B1/B3/B4 obligations and the curve gate
  conditions are **structure fields (hypotheses)**, not axioms — the script shows them
  in situ so you can confirm they are fields, not stubs.

I also diffed `AMMCurve.lean` and `Temporal.lean` against the previous prover run:
byte-identical. The seam work added one new file and changed nothing underneath it.

---

## 3. The claims, exactly, with locations

### Layer A — curve interface (`AMMCurve.lean`)
| decl | line | what it asserts |
|---|---|---|
| `AMMCurve` (structure) | 18 | the substitution **gate**: a curve is valid only if it supplies `convex_dom`, `antitone_y` (monotone), `convex_y` (convex), `coercive`. A shape failing these cannot be constructed, so cannot reach any theorem. |
| `poolValue` | 34 | LP reserve value at price `p` = lower envelope `sInf {p·x + y x}`. |
| `poolValue_concaveOn` | 36 | **short-gamma**: pool value is concave in price, for *any* valid curve. |
| `hedge_gap_concaveOn` | 47 | pool value minus any convex obligation stays concave (the gap can't be hedged by reserves). |
| `cpmm`, `expPool` | 107, 98 | two instances (constant-product = equal-weight Balancer frontier; exponential). Each discharges all gate fields. |
| `example` ×2 | 116, 119 | each instance inherits the bridge **for free** (the transfer is demonstrated, not asserted). |

### Layer B — passivity scaffold (`Temporal.lean`)
| decl | line | what it asserts |
|---|---|---|
| `PassiveSystem` (structure) | 23 | abstract discrete passive system: storage `H`, ports `supplied`/`dissipated`, `dissip_nonneg`, `balance`, `H_floor`. |
| `passivity` | 77 | storage never rises by more than cumulative supplied power (no value manufactured). **Proved.** |
| `solvent` | 84 | storage stays ≥ floor for all time. **Proved** (from the floor hypothesis). |
| `closed_cycle` | 90 | a clean closed loop pays nothing (no pumping). **Proved.** |
| `TemporalAMM` (structure) | 160 | concrete engine data + the three bridge **obligations as fields**: `arb_nonneg` (B3), `ledger` (B4), `solvent` (B1). |
| `TemporalAMM.toPassiveSystem` + corollaries | 179–202 | the reduction; passivity/solvent/no-free-lunch follow. |

### Layer C — the join (`Seam.lean`)
| decl | line | what it asserts |
|---|---|---|
| `intrinsic` | 17 | reserve equity at price `p` = `poolValue p − O p`. Reads only the curve's value + obligation. |
| `intrinsic_concaveOn` | 22 | **propagation**: short-gamma reaches the storage layer — `intrinsic` is concave (one line from `hedge_gap_concaveOn`). |
| `poolValue_le_line` | 30 | value ≤ every reserve-point line (upper bounds from any point). |
| `CurvePool` (structure) | 40 | a pool whose `equity = intrinsic(price) + support`; obligation fields mirror `TemporalAMM`, with **B1 now reading "the port covers the curve's concave deficit."** |
| `toTemporalAMM` | 73 | **the join**: a curve-wired pool reduces to the abstract engine. |
| `CurvePool.passivity`, `.solvent_forever` | 85, 92 | guarantees re-exported for the curve-derived pool: curve → … → solvency, type-wired. |
| `demoPool` | 103 | concrete end-to-end instance (constant-product reserves); the whole stack instantiates. |
| `cpmm_poolValue_le` | 126 | `poolValue p ≤ p + k` (AM-GM, the `x₀=1` line). |
| `reserves_have_no_floor` | 136 | **the headline**: with a convex obligation `O=p²`, reserve value is **unbounded below** — so the solvency floor cannot come from reserves. "Convexity must be funded," as a theorem at the storage interface. |

`reserves_have_no_floor` is the only result the prover proved fresh (the rest were
provided complete or are one-liners); its proof is by contradiction with explicit
witness `p = |b| + k + 2`. Read it at `Seam.lean:136`.

---

## 4. Independent math check (`python3 verify_math.py`)

Lean proves the proofs are valid; this confirms the *statements* are the true,
non-vacuous ones we intend (so the file isn't proving something trivial or wrong):
- pool value concave for both instances, matching closed forms `2√(kp)`, `p − p·log p`;
- inf-of-affine concave on random lines (the abstract bridge);
- `2√(kp) ≤ p + k` everywhere (the AM-GM bound);
- `intrinsic = poolValue − p²` → −∞, and the explicit witness `|b|+k+2` works for 200k
  random bounds;
- `demoPool.solvent` reduces to `x ≤ x` (non-vacuous, real).

---

## 5. What is and is NOT established — read before relying on this

**Established (machine-checked, modulo your build in §1):**
1. The curve gate is real: an invalid curve cannot instantiate `AMMCurve`.
2. Short-gamma is universal across valid curves, and **propagates** into stored value
   and on into the passivity scaffold's storage — by types, not by inspection.
3. Given the port covers the concave deficit (B1), a curve-wired pool is **passive and
   solvent for all time**, and supports **no free lunch**.
4. The port is **necessary**: reserves alone cannot floor a convex claim
   (`reserves_have_no_floor`).

**NOT established — explicit boundaries:**
1. **Solvency is conditional.** B1/B3/B4 are *hypotheses* (structure fields), not
   discharged facts. The scaffold proves *"if the ledger closes, arb is one-way, and
   the port covers the floor, then passivity/solvency."* It does **not** prove the port
   actually pays in the real world — that is the external funding/hedge assumption
   (the dealer's realized-vs-priced-vol question). `reserves_have_no_floor` shows the
   port is *necessary*, not *sufficient*.
2. **The dynamics are abstract.** `price / tick / ledger / portFlow / arbLeak` are
   typed contracts. They are **not** wired to the real HTML engine's numeric formulas.
   This package verifies the interface stack and its propagation; it does **not** prove
   the production engine instantiates these fields correctly. That instantiation
   (engine formulas ⊢ B3/B4/B1) is the next body of work.
3. **Instances are representative, not exhaustive.** `cpmm` is the equal-weight
   Balancer frontier; `expPool` is exponential. Weighted Balancer and the GH/power-sum
   family are not instantiated here (the *mechanism* that they would transfer is what's
   proven, via the abstract interface).
4. **Compile is trusted-from-prover until you run §1.** I audited source + math, not a
   Lean run.
5. **Scope.** This package is the passivity/curve/seam line. A separate prover run on
   no-arb-as-symmetry (the `C3` reflection result) is **not** included here.

---

## 6. Provenance — three prover runs, one project

- Run `88d54e76…` — `Temporal.lean`: abstract passivity core + engine reduction.
  Only change from the handed-in source: three `noncomputable` keywords. Proof logic
  unchanged.
- Run `1c2998e4…` — `AMMCurve.lean`: curve gate + short-gamma bridge + two instances.
  All target sorries closed; no source/API fixes needed.
- Run `e37c447a…` — `Seam.lean`: the join. All provided proofs compiled as-is; the one
  open goal (`reserves_have_no_floor`) closed with the witness proof.

All three on Lean 4.28.0 + Mathlib v4.28.0; all key results report only the standard
axiom base.

---

## 7. One-line verdict to check against your own run

> *Swapping the AMM curve is type-gated, and short-gamma propagates through value into
> the passivity scaffold's storage and solvency guarantee — mechanically, with the sole
> real-world assumption (the port pays) isolated as one named hypothesis (B1).*

If your `lake build` is green and `Audit.lean` shows only the three standard axioms,
that statement holds. If not, the gap is yours to report back.
