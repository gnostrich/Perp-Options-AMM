# NOTES — potentially desirable changes v24 → v26c, "apart from this core" (for future reference)

_Tester, 2026-06-10. Ordered by the operator, entry 28 [verbatim-transcript,
`history/operator/2026-06-10_kurtosis-curve-family-brief.md`]: **"in parallel let the testing /
versioning guy do a feature level diff to confirm any potentially desirable changes we made since
apart from this core, and simply make note for future reference."**
"This core" = the curve/invariant itself — the GH swap (v25_gh) and everything that exists only
because the curve was GH. That core is REPLACED by HEAD v27 (`b245bfda`, (W) family on the v24
Balancer base) and is out of scope here by the operator's own framing._

_Method: BUILD_LINEAGE.md + DIFF_LEDGER.md backfill entries + **byte-level inspection of the four
builds themselves** (`temporal_mvp_v24_rebase_fixed_2.html` `6f606f52`, `temporal_mvp_v25_gh.html`
`9910c699`, `temporal_mvp_v26a.html` `89ae89e9`, `temporal_mvp_v26b.html` `8df9f8a3`,
`temporal_mvp_v26c.html` `6cc73563`, HEAD v27 `b245bfda`) — every (a)/(b) claim below was checked
against the actual HEAD file this run (grep/sed line refs given), not assumed from lineage notes.
Gate state at time of writing: HEAD v27 `wcurve_selfcheck.js` 21 PASS / 0 FAIL; demoted v26c full
GH suite green (`run_all.sh builds/temporal_mvp_v26c.html`); blobs canonical on HEAD
(`ab663f5c…`/`c505b08a…`). **This is a factual inventory — no recommendations, per the ask.**_

Categories:
- **(a) ALREADY PRESENT in v27** (ported, or an independent analogue exists in HEAD);
- **(b) CURVE-AGNOSTIC and PORTABLE** to v27 — exists on the demoted GH line, NOT in HEAD today;
- **(c) GH-SPECIFIC / dead** with the curve swap.

---

## 0. The excluded core (named so the exclusion is explicit, not silent)
GH curve/invariant swap (v25_gh: `getMP_raw, tradeUpdate, arbitrageToOracle, rebase` +
`ghCalibrate`), the GH score-kernel math, the `e^(−ghMu)` price-vs-slope factor and its gotcha
(#12 — moot on (W): price == geometric slope exactly, selfcheck L4 rel 4.33e-7), the GH `faith_*`
math harnesses (Esscher/Fisher/Merton/rebase/reflection as GH-integral checks), GH-specific
premium-delta numbers. All **(c)** — replaced by the (W) core, not inventoried further.

## 1. The inventory

| # | Item | Introduced | What it is | Category | Evidence (HEAD v27 checked) |
|---|------|-----------|------------|----------|------------------------------|
| D1 | Slippage **math** basis discipline (mpGeom, % basis-independent) | v26a | Both slippage paths reference the true geometric marginal, not a mislabeled price coordinate (fixed the ~97%-flat bug, `2c0337e8`) | **(a)** by construction | (W) proves price==slope (selfcheck L4); `mpGeom`/`e^(−ghMu)` machinery itself is (c) — 0 refs in HEAD |
| D2 | Slippage **$-label honesty** ("$ = pool-level price-impact in Layer-1 reserve USD, **not a trader honest-dollar figure**") | v26a | Display-contract honesty label on the Slippage $ readout | **(b) — NOT in HEAD** | HEAD L1176 ships the v24-era tooltip ("$ figure is the actual drift cost (Δy − p₀·Δx)"); v26c L1176/L1931 carries the reserve-USD wording |
| D3 | Curve-draw samples the ENGINE (not a closed-form replica); eq-marker on curve | v26a_fixes | Render layer reads the live engine so curve pixels can't diverge from the math | **(a)** analogue | HEAD's `curveTraceW` samples the (W) engine; eq-marker on curve tester-confirmed (`evidence/v27_pw/A_R01`) |
| D4 | Frame re-fit (marker ~fixed, axes rescale; window follows the live operating point) | v26a (re-fit) → v27's own render fix | Keeps the interesting geometry in frame | **(a)** analogue (independent impl) | HEAD `curveTraceW` auto-centers on 0.5·(u₀+φ), half-width 0.5·|u₀−φ|+6 |
| D5 | `snapshot()` carries the full curve state (no stale scalars) | v26a_fixes | Snapshot spreads/enumerates curve params so Engine.* can sample on a snap | **(a)** analogue | HEAD L3339-3347 enumerates x,y,α,β,τ,w±,φ explicitly |
| D6 | **ITM / American smooth-pasting structure** (continuation past K to free boundary S*=K·γ/(γ+1), closed form; `mark`/`markFrac` split) | v26b | Settlement semantics: mark never clamps at the strike; smooth C¹ paste to intrinsic | **(a) — ported** | HEAD has `markFrac` (L1666-7) + Reading-A g→γ_loc paste; seam value/slope selfcheck PASS. ⚠ Caveat: the split's **funding-protection** purpose is NOT replicated — HEAD funding is re-pointed (price-anchor, theory-risk-accepted), not the GH line's locked w=½ |
| D7 | **Standalone seam gate**, negative-controlled (value+slope ≤0.15% at S*, both wings, γ∈{1.5,2,3,4}; mutations caught: boundary+10%, branch swap, injected kink) | v26b | Mutation-tested gate harness, much stronger than an in-suite spot check | **(b)** | `verify/seam_gate.js` runs only on the GH path; HEAD's `wcurve_selfcheck` has 2 seam checks at one setting, no negative controls, single γ_loc |
| D8 | **Wing-tag-inversion discipline**: bind boundaries to the geometric S-direction, never the wing-tag string | v26b (operator-caught defect) | A defect-class lesson: tag strings can invert; geometry can't | **(b)** discipline | `evidence/wing_tag_inversion_trace.md`; inventory #7 wording carries it |
| D9 | **Payoff x-range −90%..+200%** (was ±50%) | v26b_xrange → v26c | Widens the sweep so the free boundary / deep-ITM region actually renders | **(b) — NOT in HEAD** | HEAD L~4011 `const xMin = -0.5, xMax = 0.5;` (back to v24); v26c L3895-3897 has the −0.9/+2.0 frame |
| D10 | **Payoff naked-leg UNCAPPED intrinsic** (naked/barrier leg grows past 1 deep-ITM; only spread legs cap at 1) | v26b/v26c `legFraction` | Renders the true American uncapped-naked vs capped-spread divergence | **(b) — NOT in HEAD** | HEAD L4062-4067 caps the naked leg at `Math.min(1, mark)` (v24-era); v26c L3955-3963 uncaps the barrier leg |
| D11 | **Uniform strike registration wiring** (`regLeg`: display mark + execution/settlement + payoff chart all carry-registered through θ=sNorm(K); crossover@K for ALL γ; chart-mark==table to 8.6e-11) | v26c | One mark on the curve — the screen can't lie about what trades | **PARTIAL (a)+(b)** | (a): `sNormStrike` ((W) inverse) IS defined+exported in HEAD (L1790, L2254; round-trip 1.46e-15; NaN-loud on bad K). (b): it is **export-only** — 0 `regLeg` refs in HEAD; payoff sweeps price-ratio `sNorm=(1+r)` (L4081), not `sNormStrike`; the v26c one-mark guarantee + all-γ crossover@K are UNVERIFIED on (W) |
| D12 | Live dollar-strike rays `K/oracle_now` (Finding-2 absorption, chart side) | v24 base itself (engine-fix sites 1–3) + v26c carry side | Strike rays/regime tests derived live from the locked dollar K, never entry-frozen θ | **(a)** | HEAD L2077-2081 `liveRay` (K_inner/oNow); the v24 base already had it — v26c's *additional* carry-side registration is item D11 |
| D13 | **`dir_gate.js`** (crossover@K + directional consistency + mixed-basis negative control, all γ) | v26c | Permanent gate for the strike-basis defect class | **(b)** | `verify/dir_gate.js` exists; `run_all.sh` routes (W) builds to `wcurve_selfcheck` only — dir_gate is not exercised on HEAD |
| D14 | **drawPayoff N_buy `state`→`state.pool` fix** (display-only NaN-fallback: N_buy silently = N_sell) | v26c | One-line fix to the engine-derived N_buy in the payoff chart | **(b) — bug PRESENT in HEAD** | HEAD L4034 `Engine.legPrice(state, …)` inside `drawPayoff(Store.state)` — byte-identical to the v24 site v26c diagnosed and fixed (v26c: `const pool = state.pool; legPrice(pool, …)`). Code-level evidence; not runtime-re-confirmed on (W) this pass |
| D15 | Loud-NaN registration guard ("bad K ⇒ NaN, never a silent wrong basis") | v26c | Fail-loud convention on strike registration | **(a)** | HEAD `sNormStrike` returns NaN on bad K (L1791-1795) |
| D16 | Chart-mark == bands-table equality as an acceptance target (|diff| 8.6e-11 on GH) | v26c | Re-usable acceptance check: one basis ⇒ exact agreement | **(b)** pattern | Meaningful on (W) only after D11 wiring; recorded as the test to re-run |
| D17 | Process: keep known-broken builds for diff (`2c0337e8` practice), splice-level slippage harness, mutation/negative controls in every gate | v26a-c era | Verification culture artifacts | **(b)** process | `engine/builds/` retains the lineage; harnesses in `verify/` |

## 2. One-glance summary
- **(a) already in HEAD v27:** slippage math basis (by construction), engine-sampled curve render +
  eq-marker, auto frame-fit, snapshot completeness, ITM smooth-pasting structure (Reading-A port,
  funding caveat), live dollar-strike rays, loud-NaN registration guard, sNormStrike function itself.
- **(b) on the demoted GH line, not in HEAD:** honest reserve-USD $-slippage label (D2);
  negative-controlled standalone seam gate (D7); S-direction-not-tag discipline (D8); payoff x-range
  −90..+200 (D9); payoff naked-leg uncap (D10); uniform-registration WIRING `regLeg` + all-γ
  crossover@K (D11); dir_gate on the (W) path (D13); drawPayoff N_buy pool fix — a live display bug
  in HEAD (D14); chart==table acceptance target (D16); process patterns (D17).
- **(c) dead with the curve:** the GH core + e^(−ghMu) machinery + GH math harnesses + GH-specific
  numbers (§0); also the v26c payoff ray-legend overprint cosmetic (an open item on a GH renderer
  that is no longer HEAD).

_The GH line endpoint is retained intact at `builds/temporal_mvp_v26c.html` (`6cc73563`), suite
green via `run_all.sh builds/temporal_mvp_v26c.html` — every (b) item above has a working, gated
reference implementation there. No recommendations made; this is the note for future reference the
operator asked for. Cross-linked from `DIFF_LEDGER.md` (v27 HEAD-promotion entry)._
