# CONSISTENCY CHECKER — the closed component table (2026-06-11, deadline pass)

_Runner (general-purpose, manager-tasked), 2026-06-11. Operator order: entry 17 ("its not just a
curve check gang … all other components … are forced consistent with it .... an internal
consistency check") + entry 20 ("i want it done within the hour"). Spec: skeptic verdict #10
item 4 (`.claude/agent-memory/skeptic/MEMORY.md` run-11): explicit per-component table —
**component | geometry-forced form | check that catches a non-conforming spec** — with the
component list CLOSED and checks runnable. Facts copied from
`framework/FRAMEWORK_curve_agnostic_2026-06-11.md` (ACs, NG-1..10, §16 corrigenda),
`framework/LDF_DEFINITION_CHECK_2026-06-11.md` §2–3, `docs/feature_inventory.md`,
`engine/verify/run_all.sh`, and the operator transcript (entries cited inline). **No new math.
No engine edits.** Companion scripts: manager is building `framework/checks/` concurrently —
CHK ids and specs below are the coordination contract (ids in the manager's build-list order;
suggested filenames `chk<N>_<slug>`)._

---

## 1. TLDR

This is the internal consistency checker's index: one row per component of the machine, what
form the chosen geometry FORCES that component to take, and the runnable check that fails any
spec written independently of the geometry. Point the checker at any component spec; if the
geometry doesn't force what the spec says, the row's check catches it. The component list is
closed by enumeration (§2): a component is anything that reads or writes pool state, and the
readers/writers are exhausted by the engine surface + the paper's objects + the framework's
ports. Existing engine gates (`run_all.sh`, re-run full-green this session on HEAD v26c) cover
ten rows today; six new checks (CHK-1..6) are being built this hour; what waits on the
operator's parked choices or on open math is labelled, not papered over.

---

## 2. Component-list CLOSURE argument

**Closure rule: a component = anything that reads or writes pool state; the reads/writes are
enumerated from the engine surface + paper + ports — nothing else touches state.**

The enumeration, mechanically:

**(a) Engine surface** (live build `engine/builds/HEAD_temporal_mvp_v26c.html`, signatures
asserted by `verify_v26a_mine.js`):
- *State:* reserves (x, y); offsets (α, β); scales (Nx, Ny); carry P = Ny/Nx; curve constants
  (γ; ghMu, ghM — the GH tilt/curvature set, with δ in the knob slot); derived readings
  (w, sNorm); the strike book / open positions; oracle (external INPUT — consumed at exactly
  two points: the arb target, row 3; intrinsic f(oracle, K), row 14 — it has no other read).
- *State writers (all of them):* `tradeUpdate` (row 2) · `arbitrageToOracle` (row 3) ·
  `rebase` (row 4) · `ghCalibrate` (genesis, runs once — folded into row 9, the budget it
  instantiates; engine gate G1 checks its output). No other function writes pool state.
- *State readers:* `getMP_raw`/`getSNorm` (row 6) feeding the display mark, execution/
  settlement value, payoff chart (one mark, v26c — row 12), funding readout (row 13),
  slippage readouts (row 18), solvency/coverage view (row 15).
**(b) Paper objects** (`paper/temporal_paper_draft.md`): Trade Formula (α=x·w, β=y·(1−w)
conserved, w=α/x — row 2/19) · funding (row 13) · rebase (row 4) · settlement (row 11).
**(c) Framework surface** (`framework/FRAMEWORK_curve_agnostic_2026-06-11.md`): ports — trade
(AC-1, row 2), funding (AC-5, row 13), settlement (AC-6, rows 11/14); gauge — carry/rebase
(AC-9.4, rows 4/5); measures — LDF/mode (AC-4/AC-2, rows 7/8), slippage bases (AC-9, row 18),
dollar pipe (AC-9, row 17); solvency (AC-7, row 15) and manipulation (AC-8, row 16); plus the
admission floor itself (generator/validity, spine layer — row 1) and the composition map
(AC-10, row 19).

The union of (a)+(b)+(c) is exactly rows 1–19 below — every writer, every reader, every port,
every measure appears in some row, and no row's subject is outside the union. Fees/frictions
enter only through the trade law's R-leg (rows 2/16). The **file-safety gate** (inventory #15)
is deliberately OUTSIDE the closure: it reads/writes the build FILE, not pool state — it is a
process gate, already running (hook `.claude/hooks/file_safety_gate.sh` + the integrity block
of `run_all.sh`: whole-file md5 + 2 blob md5s, green this session). Anything claiming to touch
pool state from outside this enumeration is itself the non-conformance the checker exists to
catch (it would have to appear as a new writer/reader — caught by CHK-3's state-count audit and
the signature assert in `verify_v26a_mine.js`).

Inventory coverage (all 16, `docs/feature_inventory.md` — skeptic's checklist): #1→rows 2,19 ·
#2→rows 2,7 · #3→row 9 · #4→row 5 · #5→row 4 · #6→row 10 · #7→row 11 · #8→row 12 · #9→row 13 ·
#10→row 18 · #11→row 17 · #12→row 6 · #13→row 15 · #14→rows 2,3 (the engine's CURRENT
fixed-curve law, held by faith_esscher) · #15→process gate above (N-A as state component) ·
#16→rows 2,7,19. No silent absences.

---

## 3. THE TABLE

Status vocabulary: **RUNS-GREEN** = in `engine/verify/run_all.sh`, re-run full-green
end-to-end this session (2026-06-11) on HEAD v26c (md5 `6cc73563…`; `set -e`, hard gates abort
on red) · **BUILT-THIS-HOUR** = CHK script being built by the manager under `framework/checks/`
this hour, in flight — a CHK row claims a RUN only when a green run is cited (tester/manager),
never by this table · **PARAMETERIZED-ON-PARKED-CHOICE(x)** / **BLOCKED-ON-OPEN-MATH(x)** =
final run waits on the named operator choice / named open, per §4.

| # | Component | Form the geometry forces (cite) | Check that catches a non-conforming spec | Status |
|---|-----------|--------------------------------|------------------------------------------|--------|
| 1 | Curve generator & validity gate (admission floor) | Strictly convex generator Φ in the gauge coordinate; R = q′ = 1 + w′/(w(1−w)) > 0; validity = Fisher metric = dissipation metric, one object (spine §1; FW-7) | CHK-5 root-uniqueness leg (a second unit-slope root = gate breach, the LDF-note counter-test); engine instance: G3 monotone + faith_fisher.js (R = Var > 0 shadow) | engine legs RUNS-GREEN; CHK-5 BUILT-THIS-HOUR |
| 2 | Trade execution — `tradeUpdate`-analogue (trade port) | AC-1 slope transport + token faithfulness (dx = −dy/m), finite trade = integral of the law, first integrals exhibited (Balancer: α = x·w, β = y·(1−w) conserved, w = α/x) [RULED entries 7/14/16; paper L75–91] | CHK-4 (warp conservation residual). Catches: one-shot transport (1.2100 vs 1.2000 finite-size discriminator), point-slide-on-fixed-curve specs, non-integrable warps, fee-leg sign errors | CHK-4 BUILT-THIS-HOUR (Balancer instance). Engine conformance to AC-1 = inventory #16 OPEN-UNIMPLEMENTED (build post-pivot); engine's CURRENT fixed-curve law separately held green by faith_esscher.js (RUNS-GREEN) — two different laws, never conflated |
| 3 | Arbitrage / oracle convergence — `arbitrageToOracle`-analogue | Same trade law, NO second mechanism; post-arb mark = oracle (AC-9.3) | Existing G2/5 arb round-trip (getMP_raw after arb = target within 1e-9, γ ∈ {1.5,2,3,4}) + curveTrace 401/401 on-curve; warp-world version = CHK-4 with oracle-slope target (same script, target argument) | RUNS-GREEN (current law); warp version inside #16 build [OPEN] |
| 4 | Rebase — gauge move | P → P/r, θ → θ/r, curve shape/τ untouched, every sNorm (degree-0) quantity invariant (AC-9.4; PH-6 [TFP]; FW-11) | faith_rebase.js (sNorm-invariance under gauge move) + G6 rebase /r | RUNS-GREEN. Anchor-curve rebase rule (AC-5 F3) BLOCKED-ON-OPEN-MATH(anchor-rebase rule unstated) — §4 |
| 5 | Carry P & gauge coordinate | P = Ny/Nx-analogue; u = log p − log P; structure claims valid only in the gauge coordinate s (Stage-0 caveat); mode ray = 45° diagonal in carry gauge — the conjecture FORCES the gauge (AC-4; LDF note §3) | faith_esscher.js (slope = P·e^(u−μ), the carry-coordinate slope law) + CHK-5 gauge-centering assert (mode at ũ = 0 in carry gauge) | engine leg RUNS-GREEN; CHK-5 BUILT-THIS-HOUR. Per-family P-analogue construction thin (skeptic watch-note) — §4 |
| 6 | Mark/price field — `getMP_raw`-analogue + THE gotcha | Candidate must publish the price COORDINATE π AND the Jacobian J with slope = π·J (AC-9.1; GH: J = e^(−ghMu), 11.7/44.5/748.6/13779.9); conflation = the historical slippage bug, invisible to self-consistency gates | slope_test.js (finite-difference |dy/dx| vs getMP_raw; ratio must equal e^ghMu, γ sweep) — re-referenced per candidate (NG-9): claimed J vs measured ratio everywhere | RUNS-GREEN (engine); per-candidate re-reference PARAMETERIZED-ON-PARKED-CHOICE(curve pick) |
| 7 | Mode-at-mark (post-trade mark placement) | Elasticity ε(mark) = 1 after every trade; jointly with AC-1 (regular warps, trades AT the mark) ⟺ the (½, −1/8) germ at every reachable state; violation rate when broken = (2ε′+1)·du (AC-2 [DERIVED+NUM]; **at-the-mark scope only — corrigendum 2 §16**) | CHK-1 (mode-at-mark instance check). Catches: constant-weight skew (drift = du exactly), broken-anchor profiles, one-shot warps (residual fails the scaling law) | BUILT-THIS-HOUR; pass criterion PARAMETERIZED-ON-PARKED-CHOICE(tilt class a/b/c/d, entry 13 #1 parked). Live GH FAILS it by exactly e^(−ghMu) (1/748.62 at γ=3) — known non-membership face [NUM+ENGINE, LDF §2] |
| 8 | LDF & mode well-posedness (liquidity measure) | LDF = HEIGHT function (H1 = min(x,y), H2 = 2xy/√(x²+y²)); mode exists, unique, ON the curve, = unit-tangent-slope point, uniqueness ⟺ validity gate; higher LDF shape is height-choice-dependent (U1 residue — any "kurtosis of the LDF" label must NAME its height) (AC-4 [RULED entry 4 #1]; LDF note §1–3) | CHK-5 (LDF-mode locator): argmax H1 vs argmax H2 agreement; unit-slope root count = 1 inside gate; outside-gate counter-test must find the second root (negative control) | BUILT-THIS-HOUR |
| 9 | Parameter budget & kurtosis knob τ (incl. genesis) | State = exactly (x, y, w) live + τ static; NO fifth dial; γ = γ(w,τ) PUBLISHED and derived; τ vol-calibrated at setup, untouched by trades; wings stay exact power-laws under τ (AC-3 [RULED entry 5 verbatim; 2026-06-10 entry 14 #3]) | CHK-3 (four-number-budget / γ-derivation). Catches: per-wing τ±, free w₋≠w₊ dials, fitted-not-derived γ, trade-mutated τ. Genesis instance: engine G1 (open mp0 exact) | CHK-3 BUILT-THIS-HOUR; G1 RUNS-GREEN. Final per-family run PARAMETERIZED-ON-PARKED-CHOICE(curve pick; wings exploration entries 12/15) |
| 10 | Pricing law / wings — value ∝ S^(−γ) | Exact power-law wings, γ ∈ (1,4) lock; THE accuracy anchor (everything else is self-consistency) (AC-3(i)–(ii); inventory #6) | G4 value∝S^(−γ) (the one accuracy gate, in the verify_v26a_mine battery; ≤0.127% on [1,3] at γ=3 ref) + CHK-3 wing-exactness leg per candidate | RUNS-GREEN (engine); per-candidate PARAMETERIZED-ON-PARKED-CHOICE(curve pick — operator "havent totally ditched asymptote yet", entry 15) |
| 11 | Settlement — American smooth-pasting | Power-law wings ⇒ boundary and coefficients FORCED: S* = Kγ/(γ+1) call / K(γ+1)/γ put, c = 1/((γ+1)·sNorm*), value+slope match; lifts to ANY exact-power-wing family (T1a [TFP]); exercise on the LIVE warped curve [RULED entry 3 #1]; budget ⇒ S* is LIVE (w moves it) (AC-6 propagation fact) | seam_gate.js (value+slope ≤ 0.15% at sNorm* AND directional, per branch, S-direction-keyed) + CHK-6(iv) live-S* recompute per reachable state | RUNS-GREEN (engine seam); CHK-6 BUILT-THIS-HOUR |
| 12 | Strike registration & mark consumers (display/exec/chart) | θ = sNorm(K) in the family's carry coordinate; ONE mark across display/execution/chart; OTM→ITM crossover at the dollar K for ALL γ; chart strike-RAY stays live K/oracle (price-space); funding/isOTM stay price-measure (AC-9 convention; v26c [ENGINE]) | dir_gate.js (crossover@K + 3-sign directional alignment + mixed-basis negative control) [HARD GATE]; chart-mark==table 8.6e-11 (v26c record, DIFF_LEDGER); UI = tester-confirmed (pw_v26c_visual.mjs) | RUNS-GREEN |
| 13 | Funding (port) | F = geometric comparison vs the family's UNSKEWED member at the SAME τ, per strike ray; constraints F1–F6 (zero-iff-unskewed, reflection-odd, rebase-equivariant, per-ray field, anchor exists at every reachable (state,τ), continuous) [RULED entry 3 #2 verbatim]; engine instance = slope-deviation vs w=½ anchor (locked, v26c) | CHK-2 (funding-anchor-existence + F-envelope). Catches: knob-pricing functionals (F1), sign-asymmetric ones (F2), anchor-degenerate families (F5), funding cliffs (F6) | BUILT-THIS-HOUR; functional choice (a)–(d) operator-tier OPEN — final run PARAMETERIZED-ON-PARKED-CHOICE(funding functional); F3 leg BLOCKED-ON-OPEN-MATH(anchor-rebase rule) |
| 14 | Re-pricing semantics / open-position marks | Terms (θ, q, side) immutable; marks float on the live curve; intrinsic = f(oracle, K) ONLY (warp- and rebase-immune); extrinsic = continuation premium (c·sNorm leg) — NO expiry/theta language exists in a perpetual structure [RULED entry 2; AC-6] | CHK-6(iii) intrinsic byte-invariance across the warp sweep at fixed oracle + extrinsic-float observation; process leg: expiry-keyword audit on candidate specs (NG-6) | BUILT-THIS-HOUR (inside CHK-6) |
| 15 | Solvency (boundary + coverage) | Reachable warp set W_reach CHARACTERIZED (Balancer instance: trajectory hyperbola (x−α)(y−β) = αβ) — uncharacterized set = automatic admission failure; report sup over W_reach × book of liability/reserves; depth untouched by re-marking [RULED entry 3 #3]; geometry NEVER closes solvency — B1 stays the extrinsic operator ship-gate (PH-4b necessity-only [TFP]) (AC-7) | CHK-6 (solvency depth sweep), legs (i)+(iv) | BUILT-THIS-HOUR (Balancer W_reach); non-Balancer families BLOCKED-ON-OPEN-MATH(α,β-analogues / W_reach uncharacterized, AC-10c). B1 never discharged by any check here — carried |
| 16 | Manipulation / cost-to-warp | X1 intrinsic floor: mark ≥ intrinsic at EVERY reachable state (frame-break criterion); X2 round-trip attack ≤ 0 — J-leg exactly free, so the bend's price lives ENTIRELY in the stated R-leg friction; X3 S*-trigger honesty (warper can move frontiers with oracle still) (AC-8) | CHK-6(ii) floor scan min(mark − intrinsic) ≥ 0 over W_reach × book + CHK-4 round-trip leg (= 0 fee-free; ≤ 0 with frictions on) + CHK-6(iv) frontier flags | floor + round-trip legs BUILT-THIS-HOUR; X2-with-frictions BLOCKED-ON-OPEN-MATH(per-candidate R-leg friction unstated — NO candidate verified, AC-8 [OPEN]) |
| 17 | Dollar / settlement pipe | Unchanged stage-2→3 chain; ANY new dollar path = §6-class HARD STOP (escalate, never improvise) (AC-9 convention; inventory #11) | splice_level_check.js ($ legs as actually spliced vs slip_accept targets) + per-build byte-identity diff (DIFF_LEDGER record, tester-owned) | RUNS-GREEN |
| 18 | Slippage bases (%, $) | % defined off the geometric marginal mpGeom = π·J and BASIS-INDEPENDENT (J cancels in same-π ratios [TFP R5/R3]); $ = Layer-1 reserve-USD; mixed-basis quantities FORBIDDEN (AC-9; inventory #10) | slip_accept.js (acceptance targets) + splice_level_check.js + dir_gate.js mixed-basis negative control (permanent) | RUNS-GREEN |
| 19 | Composition map M (w_paper ↔ family dial) | M: (x, y, w_paper) → family state must EXIST with: conjugates the paper update; respects the AC-2 pin (local weight at mark fixed at (½, −1/8) ⇒ w_paper canNOT map to local weight — target is center/asymptotic skew); exhibits α,β-analogues; path-independence proven (AC-10 a–d) | CHK-7 (conjugacy harness): paper-law path vs M⁻¹∘family-warp∘M path, state agreement along the whole trajectory (NG-10) | BLOCKED-ON-OPEN-MATH(M unwritten for every family except Balancer, where M = id — the degenerate instance pins the harness; the central unconstructed object, inside inventory #16). Spec'd here; NOT in this hour's build set |

---

## 3.1 CHK specifications (the coordination contract with `framework/checks/`)

Ids in the manager's build-list order. Tolerances copied from the framework's NG text / measured
precedents — no new math, only check engineering.

- **CHK-1 — mode-at-mark instance check** (`chk1_mode_at_mark`, AC-2/NG-2): for a candidate
  (profile, warp rule), run a trade sweep at the mark; compute post-trade ε(mark).
  PASS(exact class): |ε − 1| ≤ 1e-9 (exact families measure ≤ 1e-12); PASS(approx class):
  |ε − 1| matches the violation-rate law (2ε′+1)·du within 1e-3 relative; transport residual
  vs frozen-curve destination must fall ≥ quadratically with step. **Scope: at-the-mark trades
  only (corrigendum 2).**
- **CHK-2 — funding-anchor-existence + F-envelope** (`chk2_funding_anchor`, AC-5/NG-5):
  F(anchor, anchor) ≡ 0 over a ray grid (≤ 1e-12); sign flip under the constructed mirror skew
  (F2, exact); anchor existence sweep — the Δw=0 member's validity margin min[w′ + w(1−w)] > 0
  over the (state, τ) grid (F5); F → 0 continuously as skew → 0 (F6). Functional-agnostic:
  checks the envelope, not a chosen F.
- **CHK-3 — four-number-budget / γ-derivation** (`chk3_budget_gamma`, AC-3/NG-3): serialize the
  candidate's state — count must be EXACTLY 4 (x, y, w, τ); measured wing slope γ_loc(ũ = ±U,
  U large) vs the published γ(w,τ) map ≤ 1e-12; γ_loc invariant under a τ sweep (byte-level
  agreement, the (W) κ∈{0.05,1,30} precedent); any fifth dial ⇒ REJECT.
- **CHK-4 — warp conservation residual** (`chk4_warp_conservation`, AC-1/NG-1):
  micro-integrator (≥ 1e4 steps) of the infinitesimal law vs the family's closed form;
  first-integral drift < 1e-12; round-trip buy-then-sell-back = identity to machine precision
  (fee-free; ≤ 0 with frictions on, feeding row 16); one-shot discriminator: finite-trade
  transported slope must equal the integral value (1.2000), not the one-shot read (1.2100), at
  the worked Balancer numbers.
- **CHK-5 — LDF-mode locator** (`chk5_ldf_mode`, AC-4/NG-4): argmax of H1 and H2 agree in ũ
  ≤ 1e-9; mode sits at ũ = 0 in carry gauge ≤ 1e-9; unit-slope root count = 1 inside the
  validity gate; negative control: the outside-gate point (Δw = −0.3, τ = 0.08) must produce
  the second root at ũ ≈ 0.6135 (LDF note §2).
- **CHK-6 — solvency depth sweep** (`chk6_solvency_sweep`, AC-6/7/8 / NG-6/7/8): grid over
  W_reach (Balancer trajectory hyperbola instance) × strike book; per state: (i) report
  sup Σ qᵢ·markᵢ / reserves, alert ≥ 1; (ii) min(markᵢ − intrinsicᵢ) ≥ 0 (X1 floor, exact);
  (iii) intrinsic at fixed oracle invariant across the grid (≤ 1e-15); (iv) recompute
  S*ᵢ = Kᵢγ/(γ+1) per state from γ(w,τ) and flag frontier crossings (X3 / live-S*).
- **CHK-7 — conjugacy harness** (`chk7_conjugacy`, AC-10/NG-10; **spec-only this hour,
  blocked**): drive the paper law and M⁻¹∘family-warp∘M over the same Δy partition; state
  agreement ≤ 1e-12 along the whole path; today runnable only at M = id (Balancer identity
  instance).

---

## 4. Honest carve-outs (what this table does NOT claim)

1. **Aristotle latency (operator-named carve-out, entry 20):** all FW-1..13 Lean obligations
   remain STATED-ONLY — nothing submitted this pass; the "forced" column's machine-proof layer
   is [TFP] only where cited (T1a, PH-6, PH3_grounded GH form, R2/R5, C3 per `formal/INDEX.md`);
   the rest is [DERIVED]/[NUM]/[RULED] per the framework note. Prover queue latency is outside
   the hour by order.
2. **Parked operator choices (entry 13 #1, entries 12/15) — which rows' FINAL runs wait:**
   - *Tilt class (a frozen-germ / b approximate / c selector-only / d singular, §AC-2.5):*
     row 7 — CHK-1's pass criterion is class-dependent; it runs NOW on available instances
     (anchored (W) family, Balancer as known-fail, GH as known-fail) and reports per-class.
   - *Curve pick (incl. the live "ditch asymptotes?" exploration, entries 12/15):* rows 6, 9,
     10, 13 final per-family runs; CHK-2/3/5 run meanwhile on the same available instances.
   - *Funding functional (a)–(d) (standing operator-tier, framework §15 flag 2):* row 13 —
     CHK-2 checks the F1–F6 envelope only.
3. **Off-mark math status (corrigendum 2, §16):** the AC-2 characterization is proved for
   trades AT the mark; off-mark trades (strike∩curve ≠ mark — the paper's product primitive,
   L41–43) are UNCHARACTERIZED: necessity legs survive, sufficiency/existence is OPEN. CHK-1
   is therefore scoped at-the-mark; no check here can force what no theorem forces — row 7
   carries the qualifier instead of hiding it.
4. **Open math blocking final runs (named):** composition map M + α,β-analogues per family
   (rows 15, 19 — AC-10c, the central unconstructed object); anchor-curve rebase rule (rows 4,
   13 — AC-5 F3); per-candidate R-leg friction spec (row 16 — AC-8 X2, no candidate verified).
5. **Engine vs AC-1 (do not conflate):** the live engine remains fixed-curve / moving-point —
   inventory #16 OPEN-UNIMPLEMENTED, build sequenced after the engine-faithfulness pivot
   [RULED 2026-06-10 ruling 1]. Row 2's green gates hold the engine to its CURRENT proven law
   (faith gates), not to AC-1; CHK-4 green on the Balancer instance is a check of the SPEC'd
   warp law, not of the engine.
6. **Thin spots carried (skeptic watch-notes):** per-family carry-P analogue is asserted, not
   constructed (row 5); "kurtosis of the LDF" stays height-choice-dependent (row 8, U1).
7. **BUILT-THIS-HOUR is a build label, not a run claim:** rows flip to RUNS-GREEN only when a
   green run is cited by the manager/tester. If any CHK script does not land within the hour,
   its rows demote to the spec-only status honestly — this table never asserts an unexecuted
   check passed.

---

## 5. Skeptic hooks

Spec satisfied against verdict #10 item 4: explicit table (§3, 19 rows, three demanded columns
+ status) · component-list closure (§2, rule + mechanical enumeration + inventory 16/16 map) ·
checks runnable (10 rows on `run_all.sh` re-run green this session; 6 CHK scripts specced to
tolerance for the manager's concurrent build; blocked/parked rows named with their blocker).
Every forced-form cell cites its AC / transcript entry / theorem; no new math anywhere; no
claim that any candidate family passes the full table; no GH↔(W) identity used.
