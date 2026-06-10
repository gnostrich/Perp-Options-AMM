# Engine behavioral DIFF LEDGER — desirable / undesirable deltas per version, FEATURE-KEYED

_Created 2026-06-10 (operator-directed); hardened same day per operator: **this ledger is the
operator's inventory of record — the operator never keeps feature inventory themselves.**
`BUILD_LINEAGE.md` records WHAT each build is (md5 + one-liner); THIS file records how each
version transition BEHAVES — what we like, what we don't, whether undesirables got reconciled —
and every delta is keyed to the named feature it touches (`docs/feature_inventory.md` #1–#15).
**Owner: tester** populates during build verification; **the manager gates HEAD promotion on the
entry existing AND carrying the feature mapping** — an unmapped or lazy entry is a red, bounced,
not waived. Backfill written by the manager from verified evidence._

## ⭐ FEATURE-STATE TABLE (rolling — the at-a-glance inventory; tester updates rows whose feature
changed, every entry, no exceptions)

| # | Feature (inventory) | Current state (as of v26c HEAD `6cc73563`) | Last changed | Verdict |
|---|---|---|---|---|
| 1 | Balancer base | Conceptual base only; engine runs GH (= one warp setting). Theory tie nailed in notes #13–#20 (CD = δ→∞ Gaussian limit) | — (never in engine) | n/a — theory grounded |
| 2 | Curve warp w(u) | Live implicitly via GH score kernel (curve-baked v25); explicit weight-profile form is the τ-knob PROPOSAL (notes only) | v25 (GH bake) | DESIRABLE — stable |
| 3 | Kurtosis knob τ (≡δ) | **NOT in engine**; δ pinned 0.08. Buildable spec exists (KURTOSIS_KNOB note, w(u;w₋,w₊,τ)); awaiting operator curve decision | — (proposal) | PENDING — operator tier |
| 4 | Carry P=Ny/Nx, u=log p−log P | Live, load-bearing, unchanged v25→v26c | v25 | DESIRABLE — stable |
| 5 | Rebase (P→P/r, θ→θ/r, w=½) | Live, unchanged; PH-6 legs proved (trusted-from-prover) | v25 | DESIRABLE — stable |
| 6 | Pricing law value∝S^(−γ) | Live; G4 accuracy gate green at v26c, all γ∈{1.5,2,3,4} | v25 | DESIRABLE — stable |
| 7 | ITM American smooth-pasting | Live both wings, seam C¹ (value 0.000%, slope ≤0.0005%); boundaries bound by S-direction | v26b | DESIRABLE |
| 8 | Uniform strike registration θ=sNorm(K) | Live across display/exec/payoff; crossover@K all γ; Finding-2 absorbed | v26c | DESIRABLE |
| 9 | Funding (w=½ slope-deviation, LOCKED) | Untouched; v26b markFrac split kept it bit-identical; dir_gate guards sign | locked (pre-v25) | DESIRABLE — locked |
| 10 | Slippage basis (mpGeom) | Live; % basis-independent, $=reserve-USD; magnitude-vs-collar item parked | v26a | DESIRABLE; 1 ACCEPTED flag |
| 11 | Dollar/settlement pipe | Byte-identical through v26c (guardrail verified); Layer-2 honest-$ deferred | — (unchanged) | DESIRABLE — stable |
| 12 | getMP_raw price-coord gotcha | Doctrine + partially gated (slope-identity in run_all); full faithfulness gate = HELD pivot | — | GUARDED — pivot pending |
| 13 | Solvency boundary (B1) | OPEN ship-gate; only conditional proved; κ extrinsic | — | OPEN — the known hole |
| 14 | Esscher tilt / rapidity group | Embodied by trade path; GROUNDED in Lean (GHJ); no X·Y invariant (by design) | v25 | DESIRABLE — stable |
| 15 | File-safety gate | Live hook, pinned to v26c md5s; negative-controlled | 2026-06-08 re-pin | DESIRABLE — stable |

## Entry template
```
## vX → vY (<one-line scope>)   [status: HEAD-promoted / candidate / demoted]
FEATURES:     inventory #s touched (and "none beyond" — explicit), per docs/feature_inventory.md
DESIRABLE:    behavioral improvements, with the number/evidence that shows it [feature #]
UNDESIRABLE:  regressions/costs, each marked OPEN / RECONCILED-in-vZ / ACCEPTED(why) [feature #]
NEUTRAL:      visible changes that are neither (renames, layout)
EVIDENCE:     evidence/ paths, gate runs, tester verdict
+ update the FEATURE-STATE TABLE rows for every feature # listed
```

---

## v25 → v26a (barrier→GH remnant fixes + slippage units)   [status: demoted (was HEAD)]
**FEATURES:** #10 (slippage basis — the fix), #2/#6 (curve render purity — remnant removal); none beyond.
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
**FEATURES:** #7 (ITM smooth-pasting — landed), #9 (funding — verified UNTOUCHED via markFrac split); none beyond.
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
**FEATURES:** #8 (uniform registration — landed), #11 (dollar pipe — verified byte-identical), #9 (funding — verified untouched); none beyond.
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
