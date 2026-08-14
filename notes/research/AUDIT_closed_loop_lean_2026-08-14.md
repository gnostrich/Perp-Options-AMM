# Cementing the closed loop — local kernel check + statement audit of `sims/v3-maps-lean`, and the two missing links

**research-lead, 2026-08-14.** Operator entries 504–506 (autonomous Aristotle authorized; loop first,
Lean cements after). Non-blocking pass. **No git action, no `engine/` edit.** All build/prover work was
done on throwaway copies under the session scratchpad; the working tree was read-only for me.

---

## 1. BUILD STATUS — **locally kernel-checked. The honest label upgrades from trusted-from-prover.**

I did not have a Lean toolchain; I installed one and ran the real build.

| step | result |
|---|---|
| toolchain | `leanprover/lean4:v4.28.0` fetched direct from the lean4 release (elan not needed / `github.com` HTML is proxy-403 but the release asset is reachable). `Lean 4.28.0 … commit 7e01a1bf5c70fc6167d49c345d3bf80596e9a79b`, `Lake 5.0.0-src+7e01a1b`. |
| deps | `lake update -R` resolved every pin in `lake-manifest.json`; `lake exe cache get` pulled the Mathlib oleans from the Azure cache (8010 files). |
| build | **`lake build` → `Build completed successfully (3107 jobs)`, rc=0.** `Built BOOK_FORMAL (5.6s)` · `Built MAP_FORMAL (6.3s)` · `Built BASIS_FORMAL (4.0s)`. Zero errors. The only ⚠ is a `linter.unusedVariables` warning in BOOK_FORMAL. |
| source identity | the built copies are **byte-identical** to the working tree: `BOOK_FORMAL fe8335b1…` · `MAP_FORMAL 48831997…` · `BASIS_FORMAL eca4e43f…` (md5, both sides). |
| token scan | no `sorry` / `admit` / `axiom` / `native_decide` / `sorryAx` / `opaque` / `unsafe` in any of the three files. (The one grep hit for "admit" is the English word "admits" in a BOOK_FORMAL comment.) |
| **`#print axioms`** | **all 54 theorems** → `[propext, Classical.choice, Quot.sound]`. **Nothing else. No `sorryAx` anywhere.** |
| count | README's "54 lemmas" is exact: 11 (BOOK) + 25 (MAP) + 18 (BASIS) = 54, plus 32 defs/structures. |

**Honest label.** The three files were **elaborated and kernel-checked here, in a real Lean 4.28.0
kernel**, with a clean axiom set on every named theorem. The one caveat worth stating rather than
hiding: Mathlib's own `.olean`s came from the Mathlib CI cache (`lake exe cache get`) rather than being
rebuilt from source — that is the universal practice and is what "kernel-checked against Mathlib
v4.28.0" means everywhere, but it is not a from-scratch rebuild of Mathlib. **My recommendation to the
manager: promote `sims/v3-maps-lean` from `trusted-from-prover` to `verified`.** The label flip is the
manager's call, not mine; the evidence above is what it rests on.

Side benefit: I now have a working local Lean+Mathlib in this session, so the two Aristotle returns
below can be **re-verified locally**, not merely trusted.

---

## 2. STATEMENT AUDIT — do the names match what is actually proved?

Compiling is not the gate. I re-derived each load-bearing statement and checked it against its name,
its docstring, and the use the loop makes of it.

### 2.1 The four the loop leans on — all four are **sound as stated**

**`MapFormal.share_strike_invariant`** *(Stage 2)* — `(D²·βᵢ)⁻¹ / Σⱼ(D²·βⱼ)⁻¹ = share β i`, hypothesis
`D ≠ 0`. **Correct, and stronger than advertised**: it carries *no positivity hypothesis on β* — the
`(D²)⁻¹` cancels by `mul_div_mul_left`, which needs only `D ≠ 0`. `D ≠ 0` is genuinely load-bearing,
not hygiene: at `D = 0` every transported slope is `0`, `share` reads `0/0 = 0` for every LP at once,
and the conclusion is false. BASIS §5's docstring says exactly this. Matches the manager's numeric
check (0.625/0.25/0.125 identical across all 5 strikes to 5.6e-17). **No vacuity, no weakening.**

**`MapFormal.beta_transport_parallel`** — ⚠ **the name is fine but the loop map's gloss is not.**
`CLOSED_LOOP_MAP.md` and the task brief both render this as "`1/β_agg = Σ1/βᵢ`". That identity is
**not a theorem here — it is the definition of `betaAgg`** (`betaAgg β := (Σ (βᵢ)⁻¹)⁻¹`). What
`beta_transport_parallel` actually proves is the *transported* version, `Σᵢ(D²βᵢ)⁻¹ = (D²·β_agg)⁻¹`:
transporting every LP by the same delta leaves parallel-addition intact. True, hypothesis-free, and
honest (at `D = 0` both sides are `0`; `depth_unbounded` records the open item from the other side).
The parallel-addition *law itself* is earned elsewhere and properly — `walk_equiv` / `walk_cost_equiv`
derive it from walking a stacked linear ladder to a common marginal price, in price **and** in total
cost. That derivation is the real content and it is sound; note its stated **interior-case** scope
(all N LPs active at a common marginal price; the segmented/active-set form is explicitly a remark,
deliberately unproved) and that it places no sign constraint on `q i`, so it is the algebra of the
ladder, not a certificate that the walk describes a feasible fill.

**`BookFormal.agg_parity` / `agg_midconvex` / `BasisFormal.book_arb_free`** *(the safety claim)* —
**sound.** `agg_parity` needs `Σwᵢ = 1` only (no sign condition; parity is linear). `agg_midconvex`
needs `wᵢ ≥ 0` only, and the "weights fixed across strikes" condition is enforced *structurally* —
`w : Fin n → ℝ` simply cannot depend on `k`. `book_arb_free` chains
`butterfly_nonneg ∘ book_midconvex` over a `bookSurface` whose level is the perp-slope-weighted
average of **arbitrary** midconvex LP curves and whose half-spread is the pointwise `inf'`. So the
load-bearing safety claim — *mixing heterogeneous LP shapes cannot create arbitrage* — **does hold**,
in strong form (any midconvex levels, any weights from the perp basis).

Two scope facts that must travel with that sentence:
- **"Arb-free" here means butterfly-only.** `butterflyCost ≥ 0` is convexity in strike. `vertical_nonneg`
  exists but *assumes* `level b ≤ level a` — nothing in the construction proves the aggregate level is
  monotone, so the vertical-spread leg is conditional. There is no calendar leg (perpetual, so N/A) and
  **no price-bound leg** (`C ≥ max(0, intrinsic)`, `C ≤ S`) anywhere in the project. `CLOSED_LOOP_MAP.md`'s
  unqualified "ONE arb-free book" should read "butterfly-arbitrage-free".
- **The fixed-weight hypothesis is obtained, and its price is priced.** `shares_fixed_of_common_transport`
  (sufficiency) and `common_transport_is_necessary` (necessity, with `βᵢ, τᵢ > 0`) make the vega fork an
  exact dichotomy, not a heuristic. This is genuinely good work and it is correctly labelled.

**`Exposure` readback** *(Stage 7)* — ⛔ **THIS DOES NOT EXIST.** `sims/v3-maps-lean/README.md` line 10
lists "exposure readback (`Exposure`)" among what `BASIS_FORMAL` proves, and `CLOSED_LOOP_MAP.md`
tags Stage 7 `[BASIS Exposure]`. **There is no `Exposure` definition and no readback theorem in any of
the three files** — `grep -i exposure *.lean` returns only doc-comment prose plus
`perpEquivalent D q := D * q`, the *per-fill* atom. The sum `NetPerp + Σ Δ(k)·q(k)` is never written
down in Lean, and nothing proves that the Δ which transports in Map 1 is the Δ that reads back in
Map 3 — which is precisely the sentence the loop's closure rests on. **Stage 7 has zero Lean backing.**
Fix: correct the README row and the loop map, or write the ~10 lines (it is easy — see §5).

### 2.2 Other findings from the statement pass

- **`square_is_the_only_strike_indifferent_exponent`** is real and clean (`g D = g 1 · D²` from
  `∀ D q, g D · q² = f (D·q)`), and it honestly *assumes* the cost is quadratic in size with a
  strike-dependent coefficient — the quadratic form is an ansatz, not derived. Docstring says so.
  Its predecessor `charge_is_perp_equivalent` proves only the forward direction; the file says so
  and supplies the converse. Good discipline.
- **`hollow_safe_any_exponent`** (`0 ≤ |D|^e · h` for **every real** `e`) is true partly by Mathlib
  junk-value convention: at `D = 0` with `e < 0`, `rpow` gives `0`, so the "half-spread" collapses to
  zero rather than blowing up. Harmless for the safety claim, but do not read it as a statement about
  the `e < 0` economics.
- **Vacuity guards are present where they matter** — `lp_inhabited`, `continuation_nonempty` (the
  `wedge` witness), `shares_vary_if_transport_differs`, `min_not_midconvex`,
  `signed_transport_can_be_negative`. I found **no vacuous statement and no false hypothesis** in the
  54. `PerpQuote` has no explicit inhabitance witness but is trivially inhabited (`slope=1, half=0`).
- **`level_convex_iff_zero_spread_arbfree`** is a genuine iff and is the strongest thing in the project.
- **No individual-rationality theorem.** The book averages the levels but takes the **tightest**
  half-spread (`inf'`). Nothing proves an LP whose private level sits above the aggregate is not
  systematically adversely selected by the mix; `bounded_disagreement` gestures at the pairwise
  don't-cross rule but is never connected to the constructed `bookSurface`. The book is safe **for the
  trader**; per-LP fairness is unmodelled. That matters directly for "LPs choose their own profile".

---

## 3. TWO GAPS FOUND IN THE MECHANIZED LOOP ITSELF (not in the Lean)

**(i) Stage 7's closure is an identity in Δ.** `7_Closure` computes
`exposure = NetPerp + Σ Δ(k)qᵢ(k)` with `NetPerp = −hedge_ratio · Σ Δq`, i.e.
`exposure = (1 − hedge_ratio) · Σ Δq`. At `hedge_ratio = 1` the residual is **identically zero for any
Δ column whatsoever**, and independent of β, w, V and the fill split. The manager's non-tautology
check is correct as far as it goes — the residual *does* move, with `hedge_ratio` — but that knob is
the only thing Stage 7 tests. **"The loop closes" is therefore not evidence that Δ is right.** And Δ
is not innocent: `Inputs` stipulates `Δ(k) = e^(−g|k|)`, which is the **normalized mark** `V(k)/V_atm`,
not `∂V/∂S`. In the Lean, `D` is an uninterpreted real parameter — nothing ties it to a derivative.
So the same unverified object builds Stage 1 and reads back Stage 7, and the circle closes by
construction. To make the closure informative, perturb Δ (or derive it) and check the residual moves.

**(ii) Latent coordinate seam between Stage 3 and the maps' parity anchor.** `3_Pricing` uses
`V(k) = V_atm·e^(−g|k|)` — a power law in **log**-moneyness. The maps' parity anchor is
`C k − P k = −k`, which is **linear** moneyness `k = K/S − 1` (that is the only reading under which
`C − P = (S−K)/S = −k`). In log coordinate `u` the true parity is `C − P = 1 − e^u`, not `−u`; the two
differ by 2.5% at `u=0.05`, 9.7% at `u=0.2`, **22.9% at `u=0.5`**. The workbook is not currently wrong
— Stage 3 never forms a call/put pair — but the seam bites the moment Stage 3 is tied to the maps'
parity. Fix is a one-liner either way: read Stage 3 as `V(k) = V_atm·(1+k)^(∓g)`, or restate parity in
`u`.

---

## 4. THE TWO MISSING FORMAL LINKS — stated as precise Lean conjectures, and submitted

Predicates pinned first, per standing discipline. Both obligation files **elaborate cleanly in my local
Lean 4.28.0 + Mathlib v4.28.0** (statements well-typed; only the intended `sorry` warnings, zero
errors) before being sent — so Aristotle is answering a well-formed question, not a typo.

### Link (a) — per-LP aggregation ⇄ engine pricing · `LINK_PRICING.lean` (imports `BASIS_FORMAL`)

The gap: every aggregation theorem carries `MidConvex` as a **hypothesis**, and nothing in the project
exhibits the curve the engine actually posts or proves it satisfies that hypothesis.

Pinned objects, in the maps' own linear-moneyness coordinate `k = K/S − 1`:
```
atmMark g   = 1 / ((g+1) * ((g+1)/g)^g)                   -- the shipped c = 1/((g+1)·sNorm*)
engineCall g k = if 0 ≤ k        then atmMark g * (1+k)^(-g)       -- OTM power law
                 else if -1 ≤ k  then atmMark g * (1+k)^g - k      -- ITM, by parity off the OTM put
                 else -k                                            -- non-positive strike: intrinsic
enginePut  g k = engineCall g k + k                                 -- so C − P = −k definitionally
```
Targets:
- `atm_kink_bound : 0 < g → 2 * g * atmMark g ≤ 1` — the sharp ATM slope condition. **Re-derived by
  hand: it is exactly `(g+1)·log(1 + 1/g) ≥ log 2`,** and the stronger `≥ 1 > log 2` follows from
  `log(1+x) ≥ x/(1+x)` at `x = 1/g`. Numerically `2g·A_g` rises monotonically to **2/e ≈ 0.7358**; the
  margin never closes.
- `engine_call_midconvex : 1 ≤ g → MidConvex (engineCall g)` — **the bridge.** Second derivatives:
  `A·g(g+1)(1+k)^(−g−2) > 0` on `k>0`; `A·g(g−1)(1+k)^(g−2) ≥ 0` on `−1<k<0` (*this is where `g ≥ 1`
  is load-bearing — and `g = m·γ` with `γ>1, m≥1` supplies it*); affine below `−1`. At `k=0` the slope
  jumps **up** by `1 − 2gA_g ≥ 0` (the lemma above); at `k=−1` both one-sided slopes are `−1`, so it is
  C¹ there. Checked numerically over ~10⁴ midpoint pairs at g ∈ {1, 1.2, 1.5, 2, 3, 4, 8}: **zero
  violations.**
- `engine_book_arb_free` / `engine_book_parity` — the payoff: a book of LPs **each pricing with its own
  `g i`** (the operator's per-LP exposure profile) is butterfly-arb-free and stays parity-anchored.
  This is the actual discharge of link (a)'s positive half.
- `mixture_strict_log_convex` + `mixture_not_single_lens` — **the obstruction, and the reason this
  conjecture was worth stating.** A single lens is log-**affine** in log-strike on the OTM side
  (`log C = log A_g − g·log(1+k)`). A nontrivial mixture of two **distinct** lenses is strictly
  log-**convex** there (Cauchy–Schwarz; equality would force `g₁(s−t) = g₂(s−t)`). Hence the aggregate
  OTM mark equals `c·(1+k)^(−g)` for **no** `c > 0` and **no** `g`.

  **In plain terms: heterogeneous LP steepness generates a smile, and the single-`m` lens is a pure
  power law that structurally cannot represent it.** "Each LP picks its own profile" and "the engine
  prices the book with one lens" are formally incompatible. That makes **L1 a structural obstruction,
  not an implementation gap** — a multi-lens / smile representation, or a constraint binding LPs to a
  common `m`, is required. **Operator-tier; flagged, not decided.**

### Link (b) — settlement units→cash, station 17 · `LINK_SETTLEMENT.lean` (self-contained over Mathlib)

Pinned objects:
```
units   V q   = Σ i, q i * V i                  -- legs net in PERP UNITS (mark = fraction of one escrow unit)
cashOne E L V q = units V q * (E * L)           -- station 17: ONE doorway, at the exit
cashPer F V q = Σ i, q i * V i * F i            -- the counterfactual: a per-STRIKE doorway
```
Targets: `units_add` / `units_smul` / `cashOne_add` (netting is well defined);
`cashOne_zero_iff`, `cashOne_pos_iff` (the doorway neither creates value nor flips a sign);
`exit_timing_irrelevant` (a netted-flat book settles to zero cash for **every** closing equity and
leverage — you cannot arb the doorway by choosing *when* to cross it); and the load-bearing pair
```
common_doorway_necessary : (∀ q, units V q = 0 → cashPer F V q = 0) → F i = F j
per_strike_doorway_unbounded_arb : F i ≠ F j → ∀ M, ∃ q, units V q = 0 ∧ M < cashPer F V q
doorway_arbfree_iff_common      : (∀ q, units V q = 0 → cashPer F V q = 0) ↔ (∀ i j, F i = F j)
```
Witness: long `1/Vᵢ` at strike `i`, short `1/Vⱼ` at strike `j` — exactly zero net perp units, cash
`Fᵢ − Fⱼ`, scalable without bound. **So station 17's single common conversion factor is not a
convenience — it is exactly the class of unit→cash doorways that admits no arbitrage.** This is the
settlement analogue of `common_transport_is_necessary`, and it is the honest formal content of
"dollars enter only at the very end".

### Submission

`aristotlelib` CLI via `uvx --from aristotlelib aristotle`, host `aristotle.harmonic.fun` **reachable**
(HTTP 200), `ARISTOTLE_API_KEY` present and accepted. Both submitted with
`--project-dir` = a scratch copy of `sims/v3-maps-lean` + the one new file, so the three context files
are rebuilt server-side as a by-product (an independent second opinion on §1). Instructions carry the
standing constraints verbatim: **context files fixed byte-for-byte; no statement/hypothesis may be
changed; if a statement is false, leave the `sorry` and report the counterexample rather than weaken
it; no `sorry`/`admit`/`axiom`/`native_decide`/`opaque`/`unsafe`; `#print axioms` ⊆ {propext,
Classical.choice, Quot.sound}.**

- link (a): project `20fa5993-74b2-49e4-b797-a5f17cbad7bf`, task `b1e0c962-86f7-4805-9af4-f47c8259b3af`
- link (b): project `ce3c2190-14d4-430f-ad48-076f3c22fca7`, task `aa5f90f8-0b7d-4f52-ae30-2426ac4666d9`

**Verdicts and the audit of whatever returns are recorded in `.claude/agent-memory/research-lead/MEMORY.md`.**
Because a local kernel now exists in-session, any candidate is re-verified here rather than trusted.

---

## 5. WHAT THE LOOP'S LEAN BACKING DOES **NOT** COVER (honest gaps)

| # | gap | severity |
|---|---|---|
| G1 | **Stage 7 readback has no Lean at all.** `Exposure` is cited in the README and the loop map and does not exist. | **high — mislabel** |
| G2 | **Stage 3 pricing ⇄ Stages 1–2 aggregation** — no theorem connects them. This is link (a), now submitted; the `mixture_not_single_lens` half looks like a genuine **obstruction**. | **high** |
| G3 | **Settlement / units→cash** — nothing in the project. This is link (b), now submitted. | **high** |
| G4 | **The option LEVEL curve is never derived from the perp book.** The map issues **depth and spread only** (`slope`, `hollow` / `slopeAt`, `halfAt`); every level `C i` enters as an abstract midconvex function. `CLOSED_LOOP_MAP.md` Stage 1's "perp book → its OWN option curve" overstates this: it is "→ its own depth and spread profile". | medium — wording |
| G5 | **"Arb-free" = butterfly only.** No unconditional vertical leg, no price bounds (`C ≥ intrinsic`, `C ≤ S`), no calendar (N/A). | medium |
| G6 | **No individual-rationality / adverse-selection theorem for LPs** under averaged level + tightest spread. Combined with the workbook's own "LP refraction" finding (one LP's β move re-prices every other LP's APR), this is the sharp edge of "LPs choose their own profile". | medium — product |
| G7 | **`D` is uninterpreted.** Nothing ties the transport delta to `∂V/∂S`; Stage 7 closes for any Δ (§3(i)). | medium |
| G8 | **`walk_equiv` is the interior case only** (all N LPs active at a common marginal price); the segmented/active-set form is an explicit unproved remark. Real books are segmented. | low–medium |
| G9 | **`depth_unbounded`** — nothing caps posted depth as `D → 0`; the binding exposure cap lives outside the map. Already recorded honestly in-file. | low, known |
| G10 | **Funding / Stage 4 rate law** has no Lean and is operator-open (L2, update-2). Unchanged. | known-open |
| G11 | **Nothing here is wired to the engine.** All three files say so; L1 remains an operator-tier decision, now with G2's obstruction attached to it. | known-open |

---

## 6. Flags for the operator (via the manager — I cannot prompt the operator)

1. **L1 is a structural obstruction, not just an unbuilt feature.** If LPs choose their own steepness,
   the aggregate book has a smile and the single-`m` lens cannot price it (conjecture A, §4). The
   product choice is: multi-lens/smile pricing, or bind LPs to a common `m` and let them differ only in
   depth/spread/level. Scope call is the operator's.
2. **Per-LP yield is coupled** (the workbook's own refraction finding) **and there is no theorem that a
   heterogeneous mix treats each LP fairly** (G6). "Set your own profile" needs that disclosed, and
   ideally proved.
3. **`Exposure` must be either written or de-cited** (G1) before the loop's Lean backing is described
   anywhere externally.

**Discipline note.** Nothing above upgrades the engine's own seam results, and none of this is a ship
gate. The loop stays the priority; this is the cementing pass.
