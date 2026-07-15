# SKEPTIC VERDICT — CTO_UPGRADE_TABLE_simple.md (per-factor reference table), narrow gate
skeptic, 2026-07-15. Target: `evidence/staging_e2e_2026-07-10/CTO_UPGRADE_TABLE_simple.md` (manager reformat).
Scope: the NEW risk surface only — the added **code-reference** column (fn names + harness check IDs) and the
**math/formula (iii)** cells. The prose content is the already-CLEARED `CTO_UPGRADE_INSTRUCTIONS_to_5ce1a76c.md`
(verdict `VERDICT_cto_upgrade_2026-07-10.md`); this gate does NOT re-litigate that.

Re-derived against the md5-verified reference engine `builds/HEAD_temporal_mvp_v28_lens.html`
(md5 `5ce1a76c7b75ec3763fda6df9538a841` — CONFIRMED live this session) and harness
`harness/lens_selfcheck.js` + `a16_atm_gate.js`. Both harnesses RE-RUN this session: **41 PASS / 0 FAIL + 5 PASS / 0 FAIL**.

---

## Item 1 — Code-reference column accuracy → **CLEAR** (one soft note)
Every named function EXISTS in `<script id="engine">` with a signature matching (or subsuming) the table's cite —
grepped the definitions directly:
- `markLensed(wing, theta, sNorm, g)` == table `markLensed(wing,θ,sNorm,g)` ✓ EXACT
- `gLoc(state, theta_K, m)` == table `gLoc(state,θ,m)` ✓
- `tradeUpdateAt(s, dy, rho)` == table `tradeUpdateAt(state,dy,ρ)` ✓
- `tradeUpdate(s, dy)` ✓ · `executeLeg(state, legType, wing, theta_inner, theta_outer, N, oracle, tau)` ✓
- `closeBand(state, band, club, livePerpMark, oracleLive, oracle_initial, tau)` ✓ (engine layer; a distinct UI `closeBand(bandId)` also exists — the row means the engine one)
- `fundingPerStrike(state, strike_theta, wing, N, dt, kappa, oracle, oracle_initial, tau)` ✓
- `legPrice(state, wing, theta_inner, theta_outer, N, tau)` ✓
Each function does what its row says, corroborated by the harness: `executeLeg` swaps via `tradeUpdateAt` (CM8-v2.5);
`closeBand` routes reversal via `tradeUpdateAt`, no two-case branch (CM6-v3.5, CM12); `fundingPerStrike` zero on
balanced pool (FS.2/b); `legPrice` returns the pre-trade option value `.V` (CM12). **No invented function.**

Check IDs — all real in the harness:
- `CM4-v2` ✓ (seam C⁰/C¹) · `CM10` ✓ (value≥intrinsic, the O2 witness) · `CM1`–`CM3` ✓ · `CM12` ✓ ·
  `CM8-v2` / `CM8-v2.1` / `CM8-v2.2` ✓ · `FS.2/b` ✓ (table writes `FS.2b`) · `FE` ✓ (FE.1/FE.4) ·
  `CM6-v3` ✓ (CM6-v3.1…6) · `a16_atm_gate` ✓ (5 checks).
- `O1` (Factor 1 header) is a **Lean-model provenance label** (harness L214 "Lean model O1 PasteLin"; also in golden MEMO §1), cited alongside `CM4-v2` exactly as the MEMO does — not a fabricated harness check. ✓
- **Soft note (non-blocking):** Factor 4 cites "checks `CM6/CM12`". `CM12` is the correct close-continuity check;
  the bare `CM6` no longer exists as a standalone check — the harness has `CM6-v2` (RETIRED, comments only) and the
  live `CM6-v3.x` family (which Factor 9 cites correctly). "CM6" resolves to that family (grep-hits CM6-v3), so it is
  loose, not wrong. Tightening Factor 4 to `CM6-v3/CM12` would be airtight. Not halt-class.

## Item 2 — Formula (iii column) accuracy → **CLEAR**
Re-derived every cell numerically off the engine:
- **Factor 1:** put seam `S*=K·g/(g+1)`, call `K·(g+1)/g`, seam value `1/(g+1)`, ATM `1/((g+1)·((g+1)/g)^g)`,
  hard rule `mark≥max(0,intrinsic)`. Engine: g=2 → **66.67K / 150 / 0.3333 / 0.1481**; g=6 → **85.71 / 116.67 /
  0.1429(⅐) / 0.0567**. Matches the table's 0.667K, ⅓, 0.148 and m=3 → 85.71K, ⅐, 0.057 EXACTLY. Seam/C¹ = CM4-v2,
  ATM = a16 A16.2, value≥intrinsic = CM10. ✓
- **Factor 2:** `(x_T+Δx)·w′=α_T`, `(y_T+dy)·(1−w′)=β_T`, `x_T=x·ρ^(w−1)`, `y_T=y·ρ^w` == harness CM8-v2.4
  (L670–674) verbatim. ρ=1→spot == CM8-v2.3. Exhibit: engine `tradeUpdateAt({10,10,½},1,4)` ⇒ w′=**0.52380952…=11/21**
  (not 22/43=0.5116). ✓ Table correctly presents **11/21** as golden, 22/43 as the wrong old value.
- **Factor 3:** `g_loc=m·γ` constant == CM1; `θ_tx=mode·(chosen/mode)^m` == CM5 (L278). ✓
- **Factor 5:** `dev=|c·ln(K/mode)|`, `c=(g_anchor−g)/(g_anchor+1)`, g=m·γ, g_anchor=m == FS.5 source-lock
  (L562–564: `(gA-g)/(gA+1)`, `Math.abs(c*Math.log(strike_theta/mode))`, `gA=tau`). `ln(K/mode)` vs the engine/MEMO
  `ln(θ/mode)` is IDENTICAL — the ratio is scale-invariant (K=θ·oracle cancels), and matches the table's own K-notation
  in Factor 1. "Zero on balanced pool / ATM / ITM" correct: balanced pool ⇒ w=½ ⇒ γ=1 ⇒ g=g_anchor ⇒ c=0.
  **The m=1→c=0 claim (staging-now cell): confirmed correct-as-scoped.** Engine gives c(m=1,γ=1)=**0** (staging);
  c(m=1,γ=2)=**−0.5** (NOT 0). So `(1−1)/2=0` embeds γ=1 — it is the staging (γ=1/balanced) degeneracy labeled "m=1"
  as shorthand; the adjacent "Verify after γ=2 **and a skewed pool**" is the correct disambiguator. Identical wording
  was cleared in the prior sheet. (Soft: the driver is γ=1, not m=1 per se — but staging has both =1, and the Factor 5
  math column correctly attributes the balanced-pool zero to γ=1, not to m=1.)
- **Factor 6:** `tradeUpdate = tradeUpdateAt(·,dy,ρ=1)` == CM8-v2.3 (engine: Δ<1e-12 confirmed); conserves global
  α=x·w, β=y·(1−w) — matches the v24 state definition {alpha:x·w, beta:y·(1−w)} and the byte-identity gate (P/CM8-v2.1). ✓

## Item 3 — Did the reformat REGRESS any cleared correction? → **CLEAR** (improved)
- Round-trip: prior sheet said "Δ=0 **exactly**" (prior verdict soft-flagged it). The NEW table Factor 4 "staging now"
  says **"Δ=0 (display precision) — inconclusive … does NOT distinguish clean-close from old exact-restore."** This
  ADOPTS the prior verdict's suggested fix — a strict improvement, not a regression. ✓
- Staging-status all-UNVERIFIED preserved: Factor 1 UNVERIFIED (γ=1 + outside ±50% window), Factor 2 UNRESOLVED,
  Factor 3 UNVERIFIED (inert), Factor 4 inconclusive, Factor 5 UNVERIFIED. ✓ None flipped to a false PASS.
- No false "staging IS H3": title = "Staging **upgrade** → 8-Jul engine"; header pins staging = v28-lens **at γ=1, m=1**;
  Factor 2 openly keeps the H2/H3 discriminator UNRESOLVED. The closer "Staging is already the right engine … prices
  check out at γ=1" is the SAME line-level (v28-lens vs v24) soft note the prior verdict bounded; not tightened, not
  worsened. ✓

## Item 4 — Factor 2 "staging now" honest / not overclaimed? → **CLEAR**
Table: "every band conserves global α,β = the **spot (ρ=1) law**; the off-spot warp is **UNRESOLVED** — real risk it's
still middle-booked. **Verify:** drive a known ρ≠1 trade; α,β should move to the 11/21-law value." Consistent with our
evidence (α,β conserved on all tested bands) AND correctly NOT overclaimed as a confirmed divergence: conservation on
those bands is consistent with BOTH H2 (old law) and H3-at-ρ=1 (since `tradeUpdateAt(·,dy,1)=tradeUpdate`), so the
discriminator genuinely needs a ρ≠1 drive to resolve — which is exactly what the "Verify" cell prescribes. The
LOCAL-pair-conserved / GLOBAL-α,β-move distinction (math cell vs desired column) matches CM8-v2.4 vs CM8-v2.2 — no
internal contradiction. ✓

---

## BOTTOM LINE — **GATE RESULT: CLEAR TO RELAY as written.**
The added code-reference and formula columns introduce **no invented function and no mis-cited formula**: all 8 fns
exist with matching signatures, every golden number (66.67 / ⅓ / 0.148 / 11/21 / c-formula) re-derives off the
md5-verified engine, and the harness re-ran 41+5 green this session. The reformat did not regress any cleared
correction — it improved the round-trip wording to "display precision / inconclusive." Two optional, non-blocking
tightenings: (a) Factor 4 "CM6" → "CM6-v3" (the bare CM6 check is retired); (b) Factor 5's staging degeneracy is
γ=1-driven, labelled "m=1" as staging shorthand (matches prior cleared sheet). Neither is halt-class.
