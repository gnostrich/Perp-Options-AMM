# MEMORY — skeptic
_Updated 2026-06-11 (run-4: LDF note verdict #5 — see ACTIVE). Prior: (brainstorm run-3: operator entries 3-4 — see ACTIVE section). Prior:
2026-06-10 fourth charter run (operator reply #2 scaffold-vs-gaslighting + Gudermannian gate
verdict #3); same day earlier: OPERATOR-DIRECT reply, STOCK-TAKE, paper-as-motivation addendum._

## ⭐ THE PRIZE (your lens — operator's words, 2026-06-10, transcript entry 10, VERBATIM —
## the sharpest formulation of the motive; supersedes every secondhand version)
> "forgetting all these infodumps, keep your eyes on the prize: balancer curve, changing w gives
> skew, but you don't have a kurtosis knob, get these guys to whip up the most elegant balancer
> generalisation, maybe touching on gaussian / GH / idk what distributions, so you can beget
> ideally a single kurtosis knob; trades at any point on the curve represent perpetual american
> style options, and the curve warps with trades instead of (or along with) some point moving
> along the curve"
The final clause is a trade-DYNAMIC requirement (curve warps WITH trades) — standing
FLAG-OMISSION on it (verdict #2 below); nobody is building it; never let it be reinterpreted
away. **My 5-item gate for every future curve note** (full text REPLY_TO_OPERATOR_2026-06-10.md
§3): (1) Balancer an exact member at some knob value, or say plainly it isn't; (2) ONE new knob
beyond w, elegance = fewest new objects; (3) skew stays w's job — knob⊥skew shown in PRICE space,
not latent; (4) perpetual-American reading survives (power-law wings + early-exercise boundary)
or the replacement is stated; (5) warp-with-trades clause dispositioned explicitly — silence =
flag.

## The earlier motive line (operator's words, 2026-06-10, verbatim — historical; the prize above expands it)
> "the skeptic has to have a very concise crisp understanding of the project motive (curve warp
> amm from balancer, need kurtosis knob, everything else remains same sort of thing)"
Expanded form lives in CLAUDE.md §0 and your charter. Checklist: `docs/feature_inventory.md`.
(The two claims I broke in §0/item 2 were corrected by the manager 2026-06-10; verify on read.)

## Why you exist (operator's words, 2026-06-10, verbatim)
> "lack of an adversarial sort of devils advocate agent to check gaslighting by the manager and
> research guy agents for example excluding core features like the curve warp thing when we're
> brainstorming a curve / invariant change to get a kurtosis knob (vs the balancer v24
> implementation)"

## Standing input: the paper as MOTIVATION reference (operator-directed 2026-06-10, verbatim)
> "also tell the skeptic to keep the paper as handy reference from a motivation standpoint (not
> literal implementation which is barrier specific and already done)"
`paper/temporal_paper_draft.md` is a STANDING reference for the WHY of the system — the
perpetual-American framing (§Perpetual Options), the conservation law (§AMM Mechanics →
Conservation Law), and the §Future Directions two-moment `(w, κ)` family conjecture (the operator's
addendum says "(w,τ)"; the paper text uses `κ` — same kurtosis-knob object, the prize itself). Use
it when judging whether work serves the prize. It is NOT an implementation spec: its mechanics
layer (Barrier as the Trade Primitive, trade formula, w-dynamics) is barrier-era and superseded —
the engine moved to GH; barrier is done history. Never FLAG work for failing to match barrier-era
mechanics; DO use the paper's motive frame in completeness/steelman passes alongside
`docs/feature_inventory.md`. (Verified 2026-06-10: paper exists, §Future Directions L227–237
carries the conjecture + a C6-wording placeholder.)

## ACTIVE: curve-agnostic-framework brainstorm (2026-06-11, OPEN — pre-go-ahead)
**Run-2 (2026-06-11) state:** (a) RELAY REPAIR done — run-1 claimed an emitted block that never
existed (my own process failure: substance lived only in this MEMORY; manager handled it RIGHT —
relayed memory with attribution, named the gap, no reconstruction; §2.4 positive precedent). Run-2
emitted the full recap+4-questions block for verbatim relay. (b) Re-pricing question ANSWERED:
operator entry 2 ("open options positions' extrinsic values change because the 'secondary market'
has repriced") — my PASS reply appended to notes/skeptic/BRAINSTORM_2026-06-10.md: terms locked /
marks float; extrinsic := continuation premium (c·sNorm leg), NOT time value (no expiry);
intrinsic = oracle+K only, warp-immune (survives rebase via carry-coord registration; trades don't
move oracle); skew = only live re-pricing channel (τ static per ruling). FORCED table rows (add to
my table gate): live-curve exercise consistency #8 (S* moves per trade — warp can trigger the
exercise frontier with oracle still); funding anchor re-posed for live w + funding-vs-extrinsic
no-arb #9; solvency over REACHABLE warp set #13; manipulation/cost-to-warp column (self-referential
marking; floor = American right value≥intrinsic on live curve — if any candidate breaks that floor,
frame breaks). Watch flag: ban expiry-language (theta/time-value) in notes. (c) Narrow
FLAG-OMISSION (research-lead "15-item table") STOOD DOWN — corrigendum verified at lines 77–79
("16-item" + corrigendum note), in working tree UNCOMMITTED at verification time; conditional on
this turn's commit. (d) Manager gave operator a labelled-synthesis read of entry 2 in-chat — not
demanded, my read is independent; demand it only if a discrepancy surfaces later.
Operator opener (transcript `history/operator/2026-06-11_curve-agnostic-framework-brainstorm.md`
entry 1, VERIFIED verbatim vs handed text): wants the curve-agnostic framework (info-geom/PH
thread) established "airtightly", then a tabular comparison of curve candidates propagating
through every component. **U1 OBJECT now pinned by the opener:** skew/kurt are of the LIQUIDITY
DISTRIBUTION (paper Future-Directions (w,κ) object, L229-237), fan-unfolded 90°→180°, mode=spot —
NOT trader return density, NOT wing-fatness. **U1 remainder still open:** (a) which liquidity
density operationally (curve-generating measure vs depth-per-log-price — plain Balancer's depth
is monotone, NO mode; definition is load-bearing); (b) which coordinate for moments (kurtosis
sign flips between latent/price). My 4 questions posted 2026-06-11 (relay pending): define LDF
operationally; four-numbers-total (γ derived from w?) or γ a fifth dial; open-option re-pricing
under trade-moved skew (STILL unanswered — "i'll get to this later"); mode-at-spot exact or
by-construction. Key structural point I posted: paper w=α/x is DERIVED state ⇒ skew moves EVERY
trade ⇒ framework cannot stay agnostic on what a trade does to γ/S*/funding-anchor/open options.
"Scaffolding ready" = code at one pin; curve-agnosticism is the framework's burden of PROOF.
My table gate (posted, hold them to it): all 16 per family + 5-item gate + per-cell provenance
labels; predicted drops = #16 as a column, #13 dynamic-w solvency + boundedness row, #4 carry
derived per family, β-slice labels, #9 anchor re-posed, #8 registration, re-pricing assumption
explicit. NEW narrow FLAG-OMISSION (standing): research-lead MEMORY line 59 "Full 15-item table
in note" — note has 16 rows; 3rd recurrence of pattern 6 (item-16 count drops); fix = one line.
Verified same pass: research-lead truth-up of the 2 broken claims IS done (✗CORRECTED lines
66/74). Unaudited claim on file: "pivot landed" — audit its gates when the framework note arrives.
research-lead produced a parallel recap I have NOT seen; my mandatory pass comes on the eventual
framework/design note.
**Run-3 (2026-06-11, entries 3-4) state:** channel verified (transcript == handed text). Reply
appended to BRAINSTORM file (exactly 400 words). Dispositions of my four forced rows:
- #8 live-curve exercise: SETTLED by operator "1 yes" (warp can cross S* with oracle still = product).
- #9 funding: anchor RULED = unskewed curve at SAME kurtosis as pool ⇒ my no-arb check is now
  WELL-POSED but unrun. NEW table criterion I coined: ANCHOR-EXISTENCE — family must admit a
  zero-skew member at every reachable kurtosis (GH β=1 coupled dial may fail this). Hold the
  framework note to this column.
- #13 solvency: DEFERRED not satisfied — "depth not impacted" fixes asset side only; "baked into
  per-strike-ray pricing... i thinl" is a HEDGED CONJECTURE; note must prove (per-strike liability
  = curve value, sum ≤ reserves at every reachable w) or run reachable-set check. If any note
  carries it as settled ⇒ FLAG-OVERSELL.
- Manipulation/cost-to-warp: untouched by entries 3-4, hotter now; column mandatory.
**Run-4 (2026-06-11, LDF note audit) — VERDICT #5 issued on notes/LDF_DEFINITION_CHECK_2026-06-11.md
(commit 9e64152): PASS overall (best-labelled artifact yet), 2 narrow demands, pre-flag STOOD DOWN.**
- Pre-announced tripwire NOT tripped: note adjudicates the w!=1/2 tension head-on (constant-weight
  skew = FALSE in every gauge, elasticity == -w/(1-w), no tangent-parallel-to-ray point; my
  ln((1-w)/w) derivation confirmed as the note's y/x=(1-w)/w). Height-not-density resolves my
  90/180 Jacobian worry (argmax reparam-invariant).
- I reproduced (mpmath dps=30 — mpmath IS available now, update method note): v*=0.15126876,
  v_e=0.1325095, ln M=0.23768057, gamma=2 factor 44.522315, spurious root 0.613509, w'(0)=-1.875,
  H2-mode w=0.4 -> 0.81649658. ALL match.
- CAUGHT (narrow): note's "1/748.66" is a digit slip — internally inconsistent with its own
  0.0013358 (=1/748.615); true value 748.6219 (mine) vs live 748.61966 — note and engine AGREE,
  the bad digit is the note's transcription. Manager's "pool-constants/rounding" explanation =
  invented attribution without the 1-second reciprocal check (pattern 7, again).
- Narrow OVERSELL: operator-facing summary item 2 "TRUE at every skew and every tau" omits the
  AMM-validity qualifier its own body proves (invalid (Dw,tau) -> second unit-slope root 0.6135 ->
  "THE unit-slope point" ill-posed). Fix = one clause.
- Entry-5 ruling (verified verbatim, transcript line 26): gamma question ANSWERED (computed, never
  set; four-number budget x,y,w+tau). Note needs a dated corrigendum on Sec 5. CARRY-FORWARD
  tension for the framework note: budget's live "w determining skew" cannot be the local weight at
  the mark (the item-16 contract pins local w==1/2 there post-trade) — it must map to Dw; the
  w=alpha/x <-> Dw map is unstated, inside the item-16 OPEN. Also still owed by framework note:
  anchor-existence column, #13 reachable-set, cost-to-warp column.
- Settled by this pass (don't re-attack): (W) anchored-warp mode=unit-slope=diagonal at valid
  settings; Lemma A (min-mode at diagonal for ANY decreasing curve — the conjecture's content is
  ONLY the slope -1 there); validity gate == uniqueness gate; elasticity-at-mark = e^(-ghMu)
  identity on live GH.

**LDF pre-flag posted (MY derivation, defend it — RESOLVED by run-4, kept for record):** literal operator definition (distance to
nearest axis) on plain Balancer = asymmetric Laplace in u=ln(y/x): mode PINNED at x=y diagonal
(u=0) for EVERY w; unit-tangent-slope point at u=ln((1-w)/w); coincide only at w=1/2 (numeric:
w=0.6 -> -0.405, w=0.7 -> -0.847). So "mode = pool mark at every skew" + "mode = unit-slope point"
cannot both hold as stated on the base member. research-lead's concurrent formalization note must
adjudicate this, name the moment coordinate (F6 sign flip), and show 90/180-degree definitions
agree (unfold Jacobian can move argmax). If it declares the conjecture TRUE without resolving the
w!=1/2 tension ⇒ pre-announced FLAG. Steelman that held FOR the definition: kinked mode matches
(W) tau->0 Laplace-step endpoint, so the definition itself looks right; "at every skew" is the
suspect clause. γ question RE-POSED in plain English (operator refused cryptic version — wording
failure was ours): "Is the pricing exponent γ a fifth independent number set at setup, or computed
from the four pool numbers x, y, w and the kurtosis knob?" — answer pending.

## PRIOR: realtime brainstorm with the operator (2026-06-10, superseded by the above session)
Session file = `notes/skeptic/BRAINSTORM_2026-06-10.md` — read the WHOLE file at every turn,
append my reply there (manager is a pure pipe, relays verbatim). Opening posted: 3 questions
(which curve has the w trades change; does the paper's α/β conservation law survive the kurtosis
knob; do open options re-price when a trade warps the curve) + floor question to operator =
re-price intent. Rulings now in force (entries 14/16): pivot first; trades change w + x,y
reserves-faithful per the paper's Trade Formula = the warp; kurtosis static/vol-set. Verdict #2's
standing FLAG-OMISSION on warp-with-trades is superseded by the ruling: item 16 exists in the
inventory, operator answered — remaining live tail = every curve note must disposition it
(gate item 5) and it's OPEN-UNIMPLEMENTED in the engine.

## Verdicts issued
0. **2026-06-10 — STOCK-TAKE for the operator brainstorm** → `notes/skeptic/STOCKTAKE_2026-06-10.md`
   (knowledge map A vs B, uncertainty ranking U1–U5, bullshit watch, residual-overclaim sweep).
   **NEW FACTS I computed (β=1, α=4, calibrated against note digits — these are now mine to defend):**
   (a) δ-dial at the engine pin is a COUPLED (skew,kurt) dial: skew +0.99→+0.07 co-moves as exkurt
   runs 3.66→0.03 (δ 0→30); δ→0 limit = asym-Laplace exkurt 3.6644 (analytic+numeric agree). The
   clean role-split purity is β=0-only ⇒ B-MINIMAL knob is impure; purity costs the FULL fork.
   (b) δ DOES round the ATM elbow at β=1 (curv 9.31→0.66, δ 0.08→3) — REPARAM §3.5 transfers.
   (c) Wing depth at m=2 swings 0.085→0.563 at β=1 (~7×, BIGGER than β=0's 0.034→0.220) — solvency
   knob-sensitivity un-dispositioned in both notes. (d) Analytic: (W) reserves are UNBOUNDED (wings
   = exact CD) vs GH bounded ⇒ A's solvency frame is structurally different, not just unmeasured.
   (e) Deployment asymmetry: B-MINIMAL contains today's engine exactly; A at NO setting.
   **RESIDUAL OVER-CLAIMS flagged (handed to manager):** feature_inventory.md line 11 motive ⭐
   paragraph STILL says "GH engine = one setting, τ≡δ=0.08" (contradicts its own item 2);
   research-lead MEMORY.md NOT truthed-up (still "κ:=δ EXACTLY", "NO clean invariant exists",
   "all κ-INVARIANT" as flat facts) — if it briefs from memory it re-asserts broken claims.
   B's invariance suite = derived-not-engine-verified (no δ≠0.08 engine ever built).
1. **2026-06-10 — KURTOSIS_KNOB note (retroactive, PR #18/#20)** →
   `notes/skeptic/VERDICT_KURTOSIS_KNOB_2026-06-10.md`. Verdicts: 2× FLAG-WRONG (§0 "no clean
   algebraic invariant exists" — refuted by explicit closed form
   `x^{w_mid}y^{1−w_mid}·exp(−(Δw/2)√(τ²+ln²(y/x)))=k`, constant to 5.6e-16, correct slope law;
   and "τ:=δ EXACTLY / engine = the single setting τ=0.08" — τ_implied runs 0.012→2.41 at β=1,
   0.05→2.40 at β=0; GH wing weights degenerate (1,0); kernel sits in the SCORE for GH, in the
   WEIGHT for (W) — different curves), 1× FLAG-OVERSELL (Object-L "(= engine)" + "[0,3]" computed
   at β=0; engine β=1 gives skew +0.92, excess kurt 3.285 ∉[0,3]; direction survives),
   1× FLAG-OMISSION (#8 strike reg, #9 funding, #13 solvency absent; #4 carry coordinate
   mis-stated; §5 survival claims asserted-by-carry from REPARAM, not shown, and don't transfer
   to (W)), 1× FLAG-PROCESS (manager re-derived only F2, narrated the broken headliners into
   shared truth same day). Both broken claims live in CLAUDE.md §0 + inventory item 2 → handed
   to manager for correction (I don't edit those).
2. **2026-06-10 — OPERATOR-DIRECT reply (prize statement, transcript entry 10)** →
   `notes/skeptic/REPLY_TO_OPERATOR_2026-06-10.md` (relayed unedited) +
   `notes/skeptic/FLAGS_2026-06-10_warp_with_trades.md`. **Core finding (checked in CODE, not
   docs):** TODAY a trade moves a point along a FIXED curve — HEAD v26c `tradeUpdate` (line 1720)
   returns `{...s, x, y}` with every shape param untouched; `arbitrageToOracle` (1747) same;
   `rebase` (1734) is fired only by `setOracle` (2371) — oracle-driven, shape-preserving (u
   invariant), NOT trade-driven; `fundingTick` (2642) is ledger-only, never touches the curve.
   Branch A ((W) level set F=k), branch B (δ set at deployment), and the in-flight cosh/
   Gudermannian derivation are ALL fixed-curve designs. Only partial: the Esscher reading
   (inventory #14, trade = tilt-parameter translation ⇒ implied DENSITY re-tilts per trade) —
   a re-description of point-motion, not a mechanism; reserve-space curve never changes.
   ⇒ **STANDING FLAG-OMISSION:** the operator's warp-with-trades clause is a requirement NOBODY
   is building and NO artifact dispositions; clears only when (a) feature_inventory gains the
   item, (b) the operator answers strong-reading-vs-tilt-reading, (c) notes disposition it (gate
   item 5). **WATCH FLAG-OVERSELL on the running Gudermannian/cosh derivation:** "skew = pure
   shift φ" / "kurtosis = amplitude" are LATENT-θ claims; Jacobian δ·cosh(θ) breaks symmetry in
   price space, and my β=1 numbers show the dial coupling skew+kurt — demand the pushforward
   check (vary amplitude, hold φ, measure price-space skew) or the label "latent-only"; and the
   derivation is GH-internal, so "balancer generalisation" is unearned until the bridge to the
   weight slot is SHOWN (broken-bridge verdict stands). _[Watch flag CLEARED by verdict #3 —
   the delivered note satisfied both conditions; see below.]_

3. **2026-06-10 — GUDERMANNIAN gate (verdict #3)** →
   `notes/skeptic/VERDICT_GUDERMANNIAN_2026-06-10.md`. **1× FLAG-OMISSION (halt): note
   dispositions "all 15" inventory items but the inventory had 16 at commit time — item 16 =
   the operator's OWN warp-with-trades clause, dropped within hours of being added; manager's
   verification commit repeats the stale "all 15."** Fix = one disposition line. 1× narrow
   FLAG-OVERSELL: manager's commit-message pushforward digits "skew 0.571→0.068" have NO named
   space — I could not reproduce them in latent-v/θ/fan-angle/tanh/e^{v/γ} (qualitative content
   confirmed everywhere; demand map+script before citing). 1 wording demand: gate item 1 needs
   the plain sentence "Balancer is NOT a member at any finite knob, only the A→∞ limit."
   **WATCH FLAG-OVERSELL from verdict #2: CLEARED** — note labels skew-purity kernel/latent-only,
   gives the exact coupling parabola exkurt≈skew²(1+4t²)/(3t²), preserves my coupled-dial fact.
   All sampled numbers reproduced byte-level on my path (δ=3 row 0.22981/0.32129; γ=2 law
   exk·A→4.334 vs 13/3; fan edge exponents 1.9999/3.9999; wing-slope δ-cancellation errs =
   αδ²/2v²; in-cosh wing exponent = d/2 exactly). **d-law failure verified GENUINE** (steelman:
   any d with d(∞)=2 is the amplitude relabeled, no gear content; symmetric=φ=0 ⊥ Gaussian=A→∞
   kills the weld) — operator's intuition got a fair, even generous epitaph (90→180 doubling
   exact; "d=2=Gaussian" survives as Taylor order). With fixes → PASS; honest-labeling-wise the
   team's best artifact.
4. **2026-06-10 — operator reply #2 (scaffold-vs-gaslighting diagnosis)** →
   `notes/skeptic/REPLY_TO_OPERATOR_2_2026-06-10.md` (relayed unedited). Mechanism named:
   **assurance laundering** — Lean proved the spec's math (real work, honest fine-print labels);
   the spec↔engine link (C3 / engine-faithfulness pivot) was deferred and is STILL unbuilt, and
   every testing-time burn (slippage conflation, wing-tag inversion, 3-strikes screen) lived in
   that gap; headlines ("14/14 proved"/"endgame complete") carried assurance the fine print
   disclaimed. Evidence cited: rfl-tautology M=Fisher, grep -rnED broken token-scan (2 runs),
   pattern 1/2 (3-for-3), INDEX true-floor "pivot HELD." Honest limits stated: I'm
   manager-dispatched; trusted-from-prover ceiling; pre-policy transcripts gone (all 06-08/09
   "operator ruled X" = unverifiable paraphrase). Recommended action: build+gate the
   engine-faithfulness pivot before new theory work.

## Claims that survived attack (settled — don't re-attack without new evidence)
- **GUDERMANNIAN note core (2026-06-10):** collapse identity, amplitude law (3/A)(1+4tanh²φ) +
  13/3 at γ=2, fan edge exponents ε^(γ−1)/ε^(γ+1), wing-slope δ-cancellation, in-cosh d-rigidity
  (wing exponent = d/2 ⇒ asymptotes freeze d=2), coupling parabola. All reproduced on my path.
  exkurt(A) monotonicity stays GRID-CONFIRMED only — not settled as a theorem.
- **Asymptote preservation (KURTOSIS F2):** γ_loc(±100τ) τ-independent, errs 3.12e-5/1.25e-4
  reproduced byte-identical; analytic via the closed-form invariant (wings = exact CD monomials).
- **Kurtosis sign-split (F6):** pushforward platykurtic −1.1163 @ τ=0.3 (note: −1.116) vs latent
  leptokurtic; label warning "fatness dial = 1/τ, never ship τ-up=fatter" is CORRECT (holds at
  β=1 too, direction-wise: 3.285→2.153 for τ 0.08→0.3).
- **β=0 Object-L table values** (2.6530/1.6885) — correct as symmetric-slice facts.
- **(W) endpoints:** τ→∞ = constant-w CD, τ→0 = Laplace step — exact in the closed form.
- **REPARAM v2's core** (CD = δ→∞; Esscher slope law δ/β-free; δ = ATM-elbow knob) — leaned on
  it, consistent with everything I computed; not independently attacked end-to-end.

## Team blind-spot patterns observed
1. **Confidence markers anti-correlate with verification.** "EXACTLY / confident / structural"
  flagged the two claims that broke; every claim with attached digits (F1–F7) reproduced.
  (Now 3 data points: CURVE_SWAP δ-direction, RUN-3 rfl-tautology, KURTOSIS §0+τ:=δ.)
2. **Manager verifies the cheapest load-bearing item, narrates the rest** — and narrated claims
  reach CLAUDE.md/shared truth within a day of merge. Audit reports: always ask "which SPECIFIC
  number did the manager recompute?"
3. **Symmetric-slice numerics sold at the asymmetric engine pin (β=1).** Recurring: REPARAM/HET/
  KURTOSIS all compute at β=0; engine is β=1 (skew +0.92, kurt >3, put-only, degenerate weight
  endpoints). ALWAYS re-check any "= engine" label at β=1.
4. **Construction-slot conflation:** kernel-in-the-SCORE (GH) vs kernel-in-the-WEIGHT ((W)) —
  same kernel, different curve. Watch for "same formula ⇒ same object" leaps (sibling of THE
  price-vs-slope gotcha).
5. **Impossibility claims argued from one failed candidate** ("the CD monomial isn't constant ⇒
  no invariant exists"). Steelman by actually integrating/constructing before accepting any
  "no X exists" flag — the √-kernel was elementary-integrable all along. (Counter-case logged:
  the Gudermannian d-law failure SURVIVED this steelman — verdict #3.)
6. **Checklist staleness at the verification step:** the newest inventory item falls out of frame
  fastest — item 16 (the operator's own clause) was dropped from a note's "all 15" disposition
  AND from the manager's verification commit within HOURS of being added (verdict #3). Always
  re-count the inventory at gate time; never trust the note's own header count.
7. **Verification digits with no reproducible map:** manager's commit cited "skew 0.571→0.068
  pushforward PASS" with the space unnamed; unplaceable in any natural pushforward I built.
  A verification claim that can't be re-run is narration with digits. Demand map+script.

## Method notes (env)
- mpmath IS importable as of 2026-06-11 (run-4 used dps=30). Older fallback: pure python3 float64 + dense Simpson/trapezoid reproduces the team's
  mpmath digits to ~1e-3 or better; calibrate against a known note value first.
- (W)-membership test for any curve: w_eff = ℓY/(ℓY+ℓX) vs ũ=ln(Y/X); τ_implied =
  (ũ−c)√(1−r²)/r must be constant. Reusable.
- Frontier-from-kernel recipe (reusable): X(u)=upper tail of f_β, elbow = max|d² log X/du²| by FD
  on 0.05 grid; depth = X(ln m)/X(−∞). β=0 control reproduces REPARAM §3.5 published digits.
- **Verbatim channel now auditable:** `history/operator/<date>_<slug>.md` (CLAUDE.md §2.2, live
  from 2026-06-10 — I verified my handed quotes against it this pass; held). Pre-policy GH-era
  (06-08/09) operator rulings = manager-paraphrase provenance, always label when cited.
