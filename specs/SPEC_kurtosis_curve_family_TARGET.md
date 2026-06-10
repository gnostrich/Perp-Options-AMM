# TARGET SPEC — kurtosis curve family (confirmed framing)

_Manager synthesis (my own words, not any agent's — CLAUDE.md §2.4), of the operator's confirmed
vision. Source of truth = operator transcript `history/operator/2026-06-10_kurtosis-curve-family-brief.md`
(brief = entry 1; flag answers = entries 2–3; **confirmation = entry 4, "yes", 2026-06-10**) +
the polar-lens analogy in `history/operator/2026-06-10_project-status-review.md` entries 8/9/18.
Companion: `notes/skeptic/BRIEF_kurtosis_curve_family_2026-06-10.md` (skeptic disposition + flags)._

**STATUS: framing CONFIRMED; this is a research TARGET, not a build authorization.** Curve/invariant
is operator-tier. The exact closed-form function is OPEN, the contract-survival proofs are unproven
(except settlement, now decided — below), and the rebuild is gated (see §4–§5). Nothing here
authorizes an engine edit.

**★ SETTLEMENT DECISION — LOCKED (operator, 2026-06-10, transcript entry 11 = "a" → Reading A).**
Settlement on the new curve uses the **curve-intrinsic value law**: value ∝ S^(−γ_local) by
definition, γ_local = w(u)/(1−w(u)) the curve's local exponent. Therefore the American smooth-pasting
boundary `S* = K·γ_local(S*)/(γ_local(S*)+1)` is **exact everywhere by construction** (wings AND
elbow) ⇒ **the rebuild gate (#7) PASSES.** Accepted tradeoff (operator-chosen, recorded honestly):
Reading A *asserts* the value law rather than *deriving* it from the dynamic optimal-stopping problem
(Reading B = the team's MERTON/AIRTIGHT frame, under which the elbow value is a blend and S* is a
parameter-dependent ~6–12%+ approximation there — see `notes/research/CURVE_FAMILY_settlement_pass2_2026-06-10.md`
+ skeptic VERDICT_CURVE_FAMILY_PASS2). Formal obligation under Reading A is the trivial `Sstar_forced`
restatement at γ:=γ_local(S*) (immediate from AIRTIGHT T1a; not yet submitted). Reading B / wing-only
registration are NOT the chosen path.

## 1. The vision (plain)
Take plain Balancer and view it as a distribution (the 90°→180° "polar" view). To add kurtosis, bend
it through a **hyperbolic angle** instead of a straight one. The two **wings stay exact straight
power-laws at every setting** — that is the whole point of the hyperbolic-angle lens (wings frozen
for free). The middle (the ATM elbow) rounds as you turn the knob.

## 2. The knobs (operator-confirmed, entries 3–4)
- **ONE static shape knob = steepness = kurtosis = amplitude** (how hard the middle is bent). Set
  **once**, for the asset's vol. Trades never change it. ("steepness and kurtosis are interchangeable
  words from my perspective.")
- **Skew is NOT a set knob — it is produced by trading.** As a trade changes `w` (with `x,y`
  following the real reserves, per the paper's Trade Formula), the curve tilts. Skew = dynamic shift,
  = the warp-with-trades requirement (feature_inventory #16). ("skew determined by x y w (trading).")
- ⇒ "one-parameter family" = **one static knob + skew-from-trading**, NOT three static dials. This
  is the operator's frame; it is NOT the skeptic's 3-static-DOF (W) split (w_mid/Δw/τ) — see §3.

## 3. Existence vs. exact function (what is settled, what is open)
- **Existence is SETTLED in-repo:** a closed form meeting the *geometry* (bow the middle, freeze the
  wings) provably exists — the skeptic's invariant `x^{w_mid}·y^{1−w_mid}·e^{−(Δw/2)√(τ²+ln²(y/x))}=k`
  (manager-verified RK4 4.8e-13, wings = exact monomials, non-trig). So "can't be done" / any
  wing-bender is rejected on arrival.
- **The exact function is OPEN and must EARN its place against the geometry of §1–§2** (operator's
  standing trig flag). Candidates on the table: the cosh / Gudermannian hyperbolic-angle form (the
  operator's lens) and the non-trig √-kernel (the existence witness), or something cleaner. ⚠ One
  Gudermannian "d-law" already FAILED to earn its place (`notes/skeptic/VERDICT_GUDERMANNIAN_2026-06-10`
  — the d was the amplitude relabeled). Reconciling the operator's "one static knob (amplitude) +
  skew-from-trading" frame with whichever closed form is the first derivation task.

## 4. Contracts that MUST survive on the new curve (re-derive, do NOT assume)
Per the brief: "everything else stays the same." Each must be **re-derived on the new curve**, not
inherited (the skeptic's brief §2.2 found these are currently asserted-by-carry, not shown for a
warp family; Esscher slope-law even fails mid-curve for (W)):
- **Carry** `P=Ny/Nx`, `u=log price − log P` (#4) and **rebase** (P→P/r, θ→θ/r, anchor w=½) (#5).
- **Pricing law** value∝S^(−γ), γ∈(1,4) — the one accuracy gate, G4 (#6).
- **American smooth-pasting** S*=Kγ/(γ+1) call / K(γ+1)/γ put, seam C¹ (#7). **GATE: RESOLVED
  (operator 2026-06-10 → Reading A, curve-intrinsic value law) — settlement is exact closed-form
  everywhere by construction; gate PASSES.** See the SETTLEMENT DECISION block at top.
- **Uniform strike registration** θ=sNorm(K), crossover@K all γ (#8).
- **Funding** = slope-deviation vs the w=½ anchor (#9) — must generalise when `w` is a field
  (operator entry 2: "anchor curve and funding must generalise when we swap the curve").
- **Slippage basis / THE gotcha** mpGeom = getMP_raw·e^(−ghMu) (#10/#12).
- **Dollar / settlement pipe** (#11) — §6 HARD-STOP: no new dollar path; reuse the chain.
- **Warp-with-trades** (#16): trades change `w` (and `x,y`) and warp the curve — the skew mechanism
  of §2; reference = the paper's Trade Formula (α=x·w, β=y·(1−w) conserved, w=α/x).

## 5. Base, sequencing, prerequisites
- **Reference base = v24** (`engine/builds/temporal_mvp_v24_rebase_fixed_2.html`), chosen by the
  operator for how the curve-warp shows on UX (entry 2). ⚠ Manager finding: v24's own curve is the
  **barrier** family (not Balancer, not GH) and it has **no smooth-pasting** — so v24 is the
  **UX/scaffold/shell** reference; its curve is replaced by the new family, and settlement (#7),
  strike-reg (#8), anchor/funding are re-derive work.
- **Sequencing:** engine-faithfulness pivot = DONE (5 faith gates HARD, manager-verified); the
  paper's w-warp build (ruling 2) is the standing next build; this curve family is its curve.
- **Prerequisite before research-lead works this:** research-lead MEMORY is QUARANTINED (still
  asserts the broken "τ≡δ EXACTLY / no invariant exists / all-κ-invariant" claims) — it must
  truth-up to the skeptic's manager-verified corrections (CLAUDE.md §0, inventory item 2) before it
  takes the derivation.

## 6. First research task (when greenlit)
State precisely, in the hyperbolic-angle lens: the closed-form curve where **one static amplitude
knob is both steepness and kurtosis**, **skew = the angle shift produced by the w-trade**, and the
**wings are frozen power-laws** — then check §4's contracts survive, settling §7 (American
smooth-pasting closed form) FIRST as the rebuild gate. Skeptic gets the brief verbatim and audits
against the inventory; manager re-derives every number.
