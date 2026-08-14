# The closed loop — end to end (draft synthesis, for operator confirmation)

**Operator priority (entries 503–505):** close the WHOLE cycle end-to-end — the v5 economics spreadsheet
completed into the full loop, including the per-LP exposure **map** and the **perp-units settlement** (the open
"units→cash" doorway). Lean/Aristotle **cements** each link, but **the closed loop is the priority.**
BRAINSTORM / non-core. This is my synthesis of where the pieces connect — confirm/correct before we mechanize.

## The cycle
```
        ┌────────────────────────── 0. PERP BOOK (Hyperliquid) ──────────────────────────┐
        │  LP capital + the hedge venue                                                    │
        ▼                                                                                   │
 1. PER-LP SHAPE  (map 1)         each LP: perp book → its OWN option curve                 │
    β(k)=β·Δ², h(k)=h·|Δ|, parity C−P=−k        [v3-maps-lean BASIS/MAP · trusted-fr-prover]│
        ▼                                                                                   │
 2. AGGREGATION   (map 2)         N LP curves → ONE BUTTERFLY-arb-free book                           │
    1/β_agg=Σ1/βᵢ, strike-invariant weights, tightest spread   [BOOK: arb-free/parity/convex]│
        ▼                                                                                   │
 3. PRICING / CURVE (engine v28)  book priced value∝S^(−γ), m-lens, American smooth-paste    │
                                                          [engine, gated · O1/O2 tr-fr-prover]│
        ▼                                                                                   │
 4. TRADE + FUNDING               traders open/close bands; funding = ray-deviation          │
                              [trade-point conservation built · funding RATE law = update-2 OPEN]│
        ▼                                                                                   │
 5. LP ECONOMICS (v5 sheet)       per LP: carry − vol-cost(gamma bleed) + fees + funding      │
                                  − hedge; +HLP     [closed-form from the distribution]        │
        ▼                                                                                   │
 6. SETTLEMENT  units→cash (station 17)   legs net in PERP UNITS (q·mark); dollars only at the │
    exit: net × carved-slice closing equity × L₀   [dollar pipe built · semantics partly OPEN] │
        ▼                                                                                   │
 7. HEDGE READBACK (map 3)        inventory → perp-equivalent: NetPerp + Σ Δ(k)·q(k) ──────────┘
                                  same Δ transports (1) and reads back (3)   [⛔ NO LEAN — `Exposure` does not exist; see AUDIT_closed_loop_lean]
```
**Loop closes:** perp book → per-LP shapes → aggregated book → pricing → trade/funding → economics →
settlement (perp units → cash) → hedge readback → back to the perp book.

## The open links (what must close for the loop to be truly end-to-end)
| # | link | status | who closes it |
|---|---|---|---|
| L1 | per-LP map ⇄ engine | the map (v3-maps-lean) is **NOT in the engine** — engine is single-pool/single-curve. Adopting per-LP shapes = curve/economic-object change | **operator-tier** decision |
| L2 | funding RATE law | update-2, undecided — sets the carry magnitude in the economics AND the ray-deviation→rate | operator (update-2) |
| L3 | perp-units settlement semantics | station 17 accounting added; exact units→cash conversion + close-semantics have open history (A14 seam) | operator-tier settlement |
| L4 | economics per-LP | v5 sheet is **single-LP**; extend to per-LP (each LP's yield from its shape + fill share; the map's "vega fork" — shares depend on transports) | buildable in sims/ |

## Where Lean cements (the Aristotle backstop — priority AFTER the loop)
- **Maps 1/2/3:** `sims/v3-maps-lean` (54 lemmas, no `sorry`, trusted-from-prover — a `lake build` upgrades it to verified).
- **Engine seams:** O1/O2 smooth-paste, trade-point conservation — trusted-from-prover.
- **Settlement/solvency:** B1/B3/B4 carried hypotheses; the settlement no-arb-on-close lemma is pending-submit.
- **To cement the FULL loop** the two missing formal links are: (a) per-LP aggregation ⇄ engine pricing, and (b) settlement units→cash no-arb.

## Proposed next step (mechanize the loop, Lean after)
1. Extend the v5 economics sheet to **per-LP** (each LP picks a shape → its own carry/vol-cost/fill-share), driven
   by map 1/2 (β·Δ² depth, 1/β_agg aggregation).
2. Add the **settlement exit** row: net perp-units → cash at the carved-slice closing equity × L₀ (station 17).
3. Wire the **hedge readback** (map 3) so the LP's net exposure ties back to the perp book — the loop closes numerically.
4. THEN cement with Lean (`lake build` the maps; submit the two missing lemmas to Aristotle).
**Open for operator:** confirm this is the loop you mean; L1–L3 are operator-tier calls that gate a *faithful* mechanization.

---
## ⚠ CORRECTIONS from the Lean audit (`notes/research/AUDIT_closed_loop_lean_2026-08-14.md`, 2026-08-14)
1. **Stage 7 has NO Lean backing.** `Exposure` is cited by the maps' README **and by this map** and
   **does not exist** in any of the three files. De-cited above. (~10 lines would fix it.)
2. **"Arb-free" here means BUTTERFLY-arb-free only** — no unconditional vertical leg, no price bounds
   (`C ≥ intrinsic`, `C ≤ S`), no calendar (N/A for perpetuals).
3. **`1/β_agg = Σ1/βᵢ` is a DEFINITION,** not a proved theorem (the proved statement is its transported form).
4. **Stage 1 issues depth & spread only** — the option LEVEL is never derived from the perp book.
5. **Stage 7's closure is an identity in Δ:** at `hedge_ratio = 1` the residual is zero for *any* Δ
   (verified: even a nonsense Δ≡42 gives residual 0). So "the loop closes" tests the **hedge ratio**, not
   whether Δ is right. *(Separately verified: v2/v3's Δ **is** the true `−∂V/∂lnS`, err ≤4e-11 — the audit's
   "Δ is the normalized mark" applies to v1, which v2 replaced. The identity critique stands regardless.)*
6. **Coordinate seam:** Stage 3 prices in **log**-moneyness; the maps' parity anchor `C−P=−k` is **linear**
   moneyness. Harmless today (Stage 3 forms no call/put pair) but bites the moment they're tied — 22.9%
   divergence at u=0.5.
7. **BUILD UPGRADED:** `sims/v3-maps-lean` is now **locally kernel-checked** (`lake build`, 3107 jobs, rc=0;
   all 54 theorems `#print axioms` = {propext, Classical.choice, Quot.sound}; byte-identical sources).
   Label: **verified** (caveat: Mathlib oleans from the standard CI cache, not a from-scratch rebuild).

## 🚩 L1 IS A STRUCTURAL OBSTRUCTION (not just an unbuilt feature)
Aristotle conjecture (a) contains `mixture_not_single_lens`: a nontrivial mixture of **distinct** lenses is
strictly log-**convex** in log-strike on the OTM side, while a single lens is log-**affine**. So the aggregate
OTM mark equals `c·(1+k)^(−g)` for **no** `c,g`. **Heterogeneous LP steepness generates a SMILE, and the
single-`m` lens structurally cannot represent it.** "Each LP picks its own profile" and "the engine prices the
book with one lens" are **formally incompatible**. Product choice (operator-tier): multi-lens/smile pricing,
**or** bind LPs to a common `m` and let them differ only in depth/spread/level.
