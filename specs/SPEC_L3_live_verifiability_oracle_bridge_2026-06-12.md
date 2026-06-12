# SPEC — L3 live-verifiability test (the oracle bridge), v28 HEAD

_research-lead · 2026-06-12 overnight (operator entry 153 #9: a runnable live-verifiability test,
operator-accepted as the honest L3; register PART D L3). SPEC ONLY — intern builds it (one pass);
NO engine edit tonight. Target build = a self-test that checks the **LIVE** HTML functions against
**Lean-mirrored reference values** on fixed grids._

## 0. What this is and is not (the honesty line — print it in the test output)
- It is a **TEST, not a proof**: float64 on a finite grid vs ℝ-theorems. It bridges
  L2 (Lean defs) ↔ the live JS; it never makes the HTML "Lean-verified."
- It must call the **live** engine functions (`Engine.gLoc`, `Engine.markLensed`,
  `Engine.tradeUpdate`, …) — NEVER re-transcriptions of them. The entire value is catching drift
  between HEAD and the Lean-mirrored formulas; a transcription would test itself.
- Every check is keyed to the Lean theorem/def it instantiates (names below), so a FAIL points at
  the exact seam (JS bug, def drift, or stale reference file).

## 1. Architecture
- **Reference file** `engine/verify/l3_reference.json` — grids + expected values + tolerances +
  per-block the Lean def/theorem name and `formal/` archive it mirrors. Generated ONCE by
  `engine/verify/l3_genref.js` (a standalone generator that evaluates the CLOSED FORMS as stated in
  the Lean defs — each generator function carries a comment `// mirrors RequestProject/<file>.lean :: <def>`;
  the generator is the def-transcription, the LIVE engine is the thing under test — they are
  independent evaluation paths). When the local Lean toolchain lands (entry 146), regenerate the
  same JSON from Lean (`#eval`-extracted rationals/floats) and diff — that upgrade closes the
  generator-trust gap; until then the generator is labeled as hand-mirrored.
- **Node harness** `engine/verify/l3_livecheck.js` — loads HEAD HTML, sandboxes the
  `<script id="engine">` via `vm.runInNewContext` (existing run_all pattern), runs all blocks,
  prints a PASS/FAIL table `[block] [Lean name] [grid size] [max err] [tol] [verdict]`. Wire into
  `engine/verify/run_all.sh` (auto-route on `function markLensed` presence).
- **In-page button** (intern, blob-safe splice): a "Self-test (L3)" control in a dev/diagnostics
  corner that runs the same blocks against the same JSON (fetched or embedded) and renders the
  table — the operator's runnable in-page check. Identical block code; one source file injected in
  both places.
- **Failure semantics:** any FAIL = red gate (STOP-ON-RED; report, don't patch toward green).

## 2. Blocks — function · grid · reference · tolerance · Lean key

Pools P1–P4: `y₀=1000`, `w₀∈{0.55, 0.6, 0.725, 0.85}` ⇒ `β=y₀(1−w₀)`, `x₀=100`, `α=x₀w₀`
(hyperbola-consistent by construction). Strike multiples M = {0.05, 0.5, 0.7, 0.9, 1, 1.1, 1.5, 2,
4, 8, 20} × live mode. τ-grid T = {0.05, 0.3, 1, 5}. Trades D = {±1, ±25, ±150, ±400} filtered by
`y+dy−β>0` with margin 1.

| # | Live fn(s) | Check | Reference (closed form, Lean key) | Tol |
|---|---|---|---|---|
| B1 | state getters | `getW==1−β/y`, `getSNorm==β/(y−β)`, `getSNorm==1/γ`, `getMP_raw==βγ²/α` on P1–P4 and on every post-trade state | `LensKernel.w_closed_form / center_closed_form / center_eq_inv_gamma / mpRaw_closed_form` | rel 1e-12 |
| B2 | `tradeUpdate` | α,β post == pre (EXACT, `===`); hyperbola residual `(x−α)(y−β)−αβ`; `γ_post == γ_pre + dy/β` over P×D | `LensKernel.tradeUpdate_alpha/beta` (exact), `tradeUpdate_hyperbola`, `gamma_linear_in_cash` | exact / abs 1e-9 (residual is scale ~αβ≈3e4) / rel 1e-12 |
| B3 | `tradeUpdate` | round-trip `dy` then `−dy` restores (x,y) ; split-vs-jump path independence (N=1 vs N=1000 sub-steps) | hyperbola flow (FW `round_trip`/`semigroup`, sweep; LensKernel flow) | rel 1e-10 |
| B4 | `hTau`,`hpTau` | `hpTau(u)==u/√(τ²+u²)`, `hTau(0)==0`, `0≤hpTau(\|u\|)<1`, monotone in \|u\| (grid-adjacent), wing bound `1−hpTau ≤ τ²/2u²` | `LensKernel.Phi_zero/Phi_nonneg/Phi_lt_one/Phi_strictMonoOn` | rel 1e-13; inequalities strict |
| B5 | `gLoc`,`lensU` | `gLoc==γ·Φ_τ(\|ln(θγ)\|)` over P×M×T; `gLoc(mode)==0` (exact at θ==getSNorm); `0≤gLoc≤γ`; rebase invariance `gLoc(rebase(s,r),θ,τ)==gLoc(s,θ,τ)` for r∈{0.5,2,10} | `LensKernel.gLoc_*`, `gLoc_at_mode`, `gLoc_le_gamma`, `gLoc_rebase_invariant` | rel 1e-12; mode-check abs 1e-15 |
| B6 | `markLensed` | call+put arms: continuation/intrinsic VALUE match at sStar (evaluate both arms AT the boundary); boundary value `==1/(g+1)`; SLOPE continuity via centered FD `h=1e-6·sStar` across the seam; `0≤markLensed≤1` global; g grid {0.05,0.5,1,1.5,2.33,3.5} × 200 log-spaced sNorm pts incl. exact sStar | `LensKernel.valueMatch_g / slopeMatch_g / contCall_at_sStar` (+ B1 solvency ceiling row) | value rel 1e-12; FD slope rel 1e-6 (FD truncation); bounds strict |
| B7 | `legPrice`/`executeLeg`/`closeBand` mark path | open-then-immediate-settle basis identity: `markLensed_open − markLensed_settle == 0` exactly per leg over P×M×T; spread V == leg-by-leg inner−outer | single-basis (A4; algebraic same-fn equality — no Lean theorem, labeled as such) | exact 0 / rel 1e-12 |
| B8 | `tradeUpdate`+`gLoc` composite | warp-integral consistency (C16 calculus, PRE-BUILD reference): N=1000-substep held-center accumulation of `Δγ_step·Φ` vs 64-pt Gauss–Legendre `∫Φdγ` from the generator, on P2×{0.7,1,2,8}×τ=0.3×D={150} | `WarpCalc.warpInt` (+ `warp_le_dgamma`, `warp_roundtrip_zero`: also check accumulated ≤ Δγ and buy-then-sell ≈0) | rel 1.5e-3 (O(1/N)); bound strict; round-trip abs 1e-5 |

Notes:
- B2's exact-equality lines use `Object.is`/`===` (the JS carries α,β through unchanged — Lean's
  `rfl`; a copy-bug shows as inexact).
- B6 FD slope: compare left/right centered differences across sStar to each other AND to the
  closed-form `1/((g+1)·sStar)`.
- B8 is the only block whose Lean side is the WARPCALC run (pending fold); ship the block gated on
  that fold, or ship with the label "reference = quadrature of the audited integral, Lean fold
  pending" — label, don't fake.

## 3. Where reference values come from (the trust chain, stated in-table)
1. Tonight: Lean defs (LENSKERNEL/WARPCALC prompts pin them) → hand-mirrored generator
   `l3_genref.js` (line-cited def-by-def) → JSON. Chain: Lean statement → mirrored closed form →
   JSON → live-JS comparison. Honest label: generator is hand-mirrored, trusted-from-prover on the
   Lean side only after each run's fold.
2. Entry-146 upgrade path: regenerate JSON from the local Lean build itself (`#eval` on ℚ where
   exact, Float-printed where not; Float≠ℝ caveat printed); diff against the hand-mirrored JSON;
   any mismatch = finding.

## 4. Acceptance (for the intern build)
- `node engine/verify/l3_livecheck.js` exits 0 with all blocks PASS on HEAD `7e1ae39b…`;
  run_all.sh stays green; file-safety gate green (blob md5s unchanged, 3 scripts parse).
- In-page button renders the same table with identical verdicts (tester live-confirms; standing UI
  smoke-pass applies).
- Deliberate-fault check (test-the-test): a one-off mutated copy (e.g. `gLoc` with `tau*1.01`)
  must FAIL B5 — include this as a harness self-check using a patched sandbox copy, never the
  working tree.
- Output includes the §0 honesty paragraph verbatim.

## 5. Ownership
Intern builds (one pass, blob-safe splice for the in-page part); tester live-verifies; skeptic
gates the labels (esp. §0 + B8's pending-fold label); manager folds. research-lead owns the
def↔generator correspondence review at each Lean fold.
