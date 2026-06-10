# Engine behavioral DIFF LEDGER — desirable / undesirable deltas per version

_Created 2026-06-10 (operator-directed). `BUILD_LINEAGE.md` records WHAT each build is (md5 +
one-liner); THIS file records how each version transition BEHAVES — what we like, what we don't,
and whether the undesirables got reconciled. **Owner: tester** populates the entry during build
verification; **the manager gates HEAD promotion on the entry existing.** Backfill below written
by the manager from verified evidence (tester verdicts, manager Node re-derivations, evidence/)._

## Entry template
```
## vX → vY (<one-line scope>)   [status: HEAD-promoted / candidate / demoted]
DESIRABLE:    behavioral improvements, with the number/evidence that shows it
UNDESIRABLE:  regressions/costs, each marked OPEN / RECONCILED-in-vZ / ACCEPTED(why)
NEUTRAL:      visible changes that are neither (renames, layout)
EVIDENCE:     evidence/ paths, gate runs, tester verdict
```

---

## v25 → v26a (barrier→GH remnant fixes + slippage units)   [status: demoted (was HEAD)]
**DESIRABLE:**
- Slippage units fixed: both paths reference `mpGeom = getMP_raw·e^(−ghMu)` — replaces the
  known-broken ~97%-flat WIP (`2c0337e8`, lineage-only). Verified 0.99%/$3.46 → 71.45%/$6240.94
  across the splice-level harness.
- 3 barrier remnants removed; curve renders as GH continuation (tester-confirmed, live browser).
- Frame re-fit: equilibrium dot stays ~fixed while axes rescale. Tester verdict: **KEEP, do NOT
  apply the one-line revert** — freezing the frame clips the GH bend as it climbs out.
**UNDESIRABLE:**
- Slippage magnitude scales hard with collar aggressiveness (0.2 BTC wide collar → 3463%, pool
  spot → ~$0). Display contract correct, magnitude input-driven — **ACCEPTED (operator parked)**.
**EVIDENCE:** `evidence/v26a_pw/`, `evidence/CROSSCHECK_slipfix_numbers.md`, `evidence/slipfix_*`.

## v26a → v26b (ITM / American smooth-pasting)   [status: demoted (was HEAD)]
**DESIRABLE:**
- Mark runs continuation PAST the strike to the free boundary, then intrinsic — smooth, never
  clamps to 1 (0.1231→0.5612 across the sweep; old `markFrac` would saturate at oracle ≥ $84k).
- Seam C¹ at the free boundary: value 0.000%, slope ≤0.0005% (sNorm-space), no-jump ~e-7, both
  wings, all γ. Seam gate negative-controlled (boundary+10% → 9.09% FAIL caught; branch swap →
  80% FAIL caught; injected kink → caught).
- Funding bit-identical via the `mark`/`markFrac` split (funding + polar marker route to the
  verbatim old fraction) — the §4 funding lock held.
- Polar marker stays on the ψ-curve (maxDiff 0, tester-confirmed).
**UNDESIRABLE:**
- Payoff chart x-range (±50% of perp-mark) too narrow to render the deep-ITM uncapped-naked vs
  capped-spread divergence — logic correct, pixels identical (DISPLAY-COVERAGE flag).
  **RECONCILED-in-v26c** (x-range −90%..+200%, clears both free boundaries).
**NEUTRAL:** bands table §5 — 9 cells, "Attrib P&L"/"Strike" renames, empty 4th td.
**EVIDENCE:** `evidence/v26b_pw/` (tester af25ead5), seam-gate runs, manager Node verification.

## v26b → v26c (uniform strike registration θ=sNorm(K))   [status: HEAD-promoted 2026-06-08]
**DESIRABLE:**
- OTM→ITM crossover lands at the dollar strike K for ALL γ (was drifting to oracle₀²/K for γ>1);
  dir_gate crossover |err| = 0 at γ∈{1.5,2,3,4}.
- Chart strike-ray live `K/oracle_now` — Finding-2 ABSORBED: no more entry-θ rotation off the
  locked dollar strike on rebase (tester-confirmed across rebase 80k→120k).
- Chart mark == bands-table mark (worst |diff| 8.6e-11) — basis split between chart and table
  eliminated.
- Premium delta moves toward-correct: +7.69% @ K=82k near-strike, +15.76% @ K=84k (re-derived
  independently by manager, matches intern).
- Old-path extreme/boundary blowup fixed by the registered path.
- Pre-existing `drawPayoff` N_buy bug fixed (state→state.pool, was NaN-fallback; display-only).
- Permanent `dir_gate.js` (crossover@K + directional-consistency + mixed-basis control),
  negative-controlled (basis flip caught; wing swap caught).
**UNDESIRABLE:**
- Payoff ray-legend text overprint — cosmetic. **OPEN** (intern polish item, non-blocking).
- Exec crossover sweep resolution 84005 vs 84000 — cosmetic. **ACCEPTED** (sweep granularity).
**EVIDENCE:** `evidence/v26c_pw/`, dollar-pipe byte-identical check, manager audits in MEMORY +
`run_all.sh` green (7 GH + seam + dir).

---

## Standing reconciliation list (all OPEN undesirables, one place)
| Item | Introduced | Status |
|---|---|---|
| Payoff ray-legend overprint (cosmetic) | v26c | OPEN — intern polish, non-blocking |
| Collar-aggressiveness slippage magnitude | v26a (exposed) | ACCEPTED — operator parked |

_Tester: append new entries above the reconciliation list; update the list every entry._
