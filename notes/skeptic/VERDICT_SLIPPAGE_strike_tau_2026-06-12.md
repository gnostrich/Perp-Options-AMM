# VERDICT — Slippage per dollar vs strike & τ (build-as-is vs trade-point mechanic)

_Skeptic, 2026-06-12. READ-ONLY. Re-derived independently in Node from the live HEAD
`engine/builds/HEAD_temporal_mvp_v28_lens.html` (md5 `7e1ae39b…` — confirmed) by transcribing the
v28 primitives (lines 1600–1772) myself: `getW`/`getSNorm`/`getMP_raw`/`hpTau`/`lensU`/`gLoc`/
`markLensed`/`tradeUpdate`. Scripts `/tmp/skeptic_v28.js` … `/tmp/skeptic_v28d.js`._

Artifacts under review: `notes/research/SLIPPAGE_per_dollar_strike_tau_2026-06-12.md` (research-lead)
+ the manager's entry-114 brainstorm claim handed to me. The manager could NOT independently
re-derive (3 failed measurements: moving/mode-relative strikes + NaN). This verdict is the
load-bearing check before the manager corrects the operator.

---

## The four rulings (crisp)

### (1) Research-lead's build-as-is finding — CORRECT. PASS (attack attempted, failed).
The option-price %move on a fixed-dollar swap **FALLS monotonically further OTM**, and the "more
with sharper τ" effect is an **ATM** effect, not an OTM one. Reproduced byte-level and explained.

- **Table (iv) reproduced exactly.** At pool w=0.6 (γ=1.5, mode sNorm=0.667), dy=+5, τ=0.3, my
  |%move| of the lensed call mark: ATM **60.976**, 1.5x **16.575**, 2x **14.171**, 3x **13.495** —
  matches the note's 60.98 / 16.57 / 14.17 / 13.50 to the digit. It **falls** ATM→wing.
- **Why it falls (decomposition, `/tmp/skeptic_v28c.js`, marginal dy=0.01, τ=0.3).** The %move
  splits cleanly into two pieces:
  - a **bare pool mode-move** = `d ln(sNorm mode)` = **−0.0167% at EVERY strike** (constant), and
  - a **lens re-stamp** term that is **largest at ATM (−0.6743%) and decays monotonically to a
    −0.0128% floor in the wings** (u=0→4: −0.674, −0.090, −0.049, −0.023, −0.015, −0.0135,
    −0.013, −0.0128). Total |%move|: 0.69 → 0.11 → 0.066 → 0.040 → 0.032 → 0.030 → 0.030 → 0.0294.
  This is the kurtosis-knob design working exactly as specified (inventory #2/#3): the **wings are
  frozen power-laws** (`g_loc→γ`, asymptote-respecting) so the mark there feels only the bare pool
  move; the **ATM elbow** is where the lens is mode-sensitive (`g_loc→0`, smooth-paste continuation
  swings hardest as the mode shifts). The option price is MOST mode-sensitive at ATM, by construction.
- **τ direction is an ATM phenomenon.** Sharper τ raises the **ATM** %move (|%move| at ATM: 3.12 /
  0.69 / 0.25 / 0.14 for τ=0.05 / 0.3 / 1 / 2) but the OTM/wing %move is τ-insensitive (frozen wing
  ≈ −0.0294% at every τ). So "sharper τ ⇒ more slippage" is true only at/near ATM — it does NOT make
  OTM slippage rise.
- **The mechanism the note names is right.** `executeLeg` → `dy = ±N·markLensed·oracle`;
  `tradeUpdate(state, dy)` (line 1679) takes **only** `{s, dy}` and runs a plain-Balancer swap at the
  **live pool point (spot)**. Strike θ_K and τ enter the transaction ONLY by sizing `dy` (via the
  lensed premium). At fixed `dy` the pool outcome is a pure function of (pre-pool, dy) — strike/τ never
  reach `tradeUpdate`, so pool-slip % (8.3333%) and cost-$/premium-$ (0.07692) are forced flat across
  all 16 cells. Verified.

### (2) Manager's entry-114 brainstorm claim — WRONG. FLAG-WRONG.
The manager told the operator that in the BUILD the trader's option-price slippage is "more further
OTM, more with a sharper lens, bounded, no cap — via the lens reading a bounded pool move." The
direction is **backwards**. The lens DOES read a bounded pool move, but that bounded move produces a
%move that is **maximal at ATM and falls into the wings** (my decomposition above: the lens re-stamp
is −0.674% at ATM, −0.013% in the wing). "More further OTM" is the exact opposite of what the build
does. The "bounded / no cap" half is true (g_loc ≤ γ, forward-read, no blow-up), but a true bound on
a backwards direction is still a wrong answer to the operator's question. **Counter-evidence:** the
monotone-falling |%move| column, ATM 60.98 → 3x 13.50 at τ=0.3 (and ATM 0.69 → wing 0.0294 marginal).

### (3) Operator's intuition — correct ONLY for the (un-built) trade-point mechanic. CONFIRMED.
If the leg executed AT its strike ray (the paper's trade-point warp) the swap would engage the
**lensed local exponent** there, `g_loc(K) = γ·h′_τ(|u|)`, which **rises 0(ATM)→γ(wings)** and rises
as τ falls. Reproduced exactly (`/tmp/skeptic_v28d.js`, γ=1.5): 1.5x/2x/3x = 1.489/1.496/1.498 (τ=.05),
1.206/1.377/1.447 (τ=.3), 0.564/0.855/1.109 (τ=1), 0.298/0.491/0.722 (τ=2) — matches the note's Q3
table to the digit. So "steeper slope far out ⇒ more slippage per dollar" and "sharper τ ⇒ more" are
**TRUE under the trade-point mechanic** — but that mechanic is NOT in the build (inventory #16:
transformation-faithful, **trade-point anchoring OPEN**; v28's swap is at SPOT, strike-blind). The
operator's geometry is right about a mechanic the engine does not implement today.

### (4) A bounded (no-cap) forward-read trade-point swap DOES exist; delivering strike-dependence does NOT force the inverse-lens cap. CONFIRMED.
- **Forward** Jacobian `dG/du = γ·h″ = γτ²/(τ²+u²)^{3/2}` is bounded, peaks γ/τ at the mode, → 0 in
  the wings (τ=0.3: 0.68 / 0.12 / 0.016 / 0.002 at u=0.5/1/2/4). No blow-up, no strike cap — `g_loc`
  itself saturates at γ.
- **Inverse** `1/h″` blows up in the wings (τ=0.3: 12.6 / 91.9 / 717 / 5701 at u=1/2/4/8). The cap
  only re-appears if a trade-point mechanic *solves for a target slope* (inverts the lens). A mechanic
  that *reads g_loc forward and sizes price-impact by it* stays bounded by γ. The note's Q4 is correct.
- **Honest nuance the operator should hear (the note states it; do not let it be dropped):** the
  trade-point effect SATURATES at γ — "more slippage far out" tops out (and the increments shrink),
  it does NOT run away. Direction = right; magnitude = bounded by γ.

---

## Inventory / completeness audit (`docs/feature_inventory.md`)
The research note is a measurement/diagnosis, not a curve-change design — but it touches load-bearing
items and dispositions them honestly: #2 (warp — names spot-swap vs trade-point warp), #3 (τ — static
knob, frozen wings confirmed), #7 (ITM smooth-paste — markLensed continuation/boundary used correctly,
g=0 inclusive-boundary handled), #10 (slippage basis — % basis, the GOTCHA-adjacent metric), #12 (the
price-vs-slope gotcha — note is careful that g_loc is the LOCAL exponent, not the spot slope the swap
engages), #16 (warp-with-trades — correctly labelled spot-anchored/strike-blind in build, trade-point
anchoring OPEN/operator-tier). No silent absence that changes the verdict. The note correctly routes
the "move the build to the trade-point mechanic" decision to operator-tier, does not decide it.

## Convergence-alarm: LOW.
The research-lead and manager DISAGREE here (research-lead's note explicitly says "the manager's
'flat' finding is correct" for build-as-is but its table (iv) FALLS OTM — which contradicts the
manager's separate entry-114 "more OTM" brainstorm). The research-lead landed the self-adversarial,
build-faithful answer against the manager's confident brainstorm. Every digit reproduced on my own
transcription of the primitives. The note is the honest artifact; the manager's brainstorm is the
defect.

## Net for the manager's correction to the operator
- The build-as-is answer: option-price %move is LARGEST at ATM and FALLS further OTM; sharper τ raises
  the ATM %move only. The manager's "more further OTM" brainstorm answer was WRONG and must be corrected.
- The operator's intuition is correct for the trade-point mechanic (not built); that mechanic can be
  delivered forward-read, bounded by γ, with no cap — the inverse-lens (cap) is only forced if you
  goal-seek a target slope.
- Whether to move the build to the trade-point mechanic is operator-tier (curve-object decision).

**FLAG-WRONG** (manager entry-114 brainstorm: "more further OTM" in the build — direction backwards;
counter: monotone-falling |%move| ATM→wing). **PASS** on the research-lead note (attack failed; all
tables reproduced byte-level; mechanism decomposition confirms the falls-OTM result).
