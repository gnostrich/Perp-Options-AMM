# SKEPTIC VERDICT — notes/KURTOSIS_KNOB_kappa_balancer_native_2026-06-10.md
_skeptic-charter run via general-purpose runner, 2026-06-10. RETROACTIVE review (note already merged
as PR #18/#20; verdict recorded for action, cannot block the merge). Artifact: research-lead's
kurtosis-knob deliverable; supporting notes HETEROGENEOUS_WEIGHT (#17), REPARAM v2 (#15),
CURVE_SWAP (#13). All re-derivations: python3 float64, dense Simpson/trapezoid quadrature
(no mpmath in env); β=0 cross-checks reproduce the note's mpmath digits (2.6530/1.6885/−1.116),
so the machinery is calibrated. Read-only pass; no fixes proposed (charter)._

## Verdict list
1. **FLAG-WRONG** — §0 headline "no clean algebraic invariant F(x,y;w,τ)=k exists" (refuted by counterexample).
2. **FLAG-WRONG** — §1 "τ:=δ EXACTLY / the current engine (δ=0.08) is the single setting τ=0.08" (refuted at β=1 AND β=0).
3. **FLAG-OVERSELL** — §4 kurtosis law sold at engine pins ("= engine", "∈[0,3]") but computed on the β=0 symmetric slice; engine β=1 gives 3.285 ∉ [0,3].
4. **FLAG-OMISSION** — inventory items #8 (strike registration), #9 (funding), #13 (solvency) silently absent; #4 (carry coordinate) mis-stated; §5 invariances ASSERTED-by-carry, not shown.
5. **FLAG-PROCESS** — manager check re-derived one claim (F2) and narrated the rest; both narrated "confident" headliners are the ones that broke, and they propagated same-day into CLAUDE.md §0 + feature_inventory item 2.
6. **PASS (attacks failed)** — asymptote preservation (F2), the kurtosis sign-split + label-direction warning (F5/F6), and the τ-endpoints structure (F1/F3) all survived independent re-derivation.

---

### 1. FLAG-WRONG — the §0 impossibility claim
The note flags, "confident," that **no clean algebraic single-τ invariant F(x,y;w,τ)=k exists**
satisfying (i) Balancer at base + (ii) elbow rounding with exact power-law wings, and argues this
structurally ("the elbow is non-monomial, so no algebraic k-level set carries it"). **The note's own
curve is the counterexample.** Because the √-kernel has an elementary integral
(∫u/√(τ²+u²)du = √(τ²+u²)), the depletion ODE for profile (W) integrates in closed form, and the
frontier is exactly the level set of

    F(x,y) = x^{w_mid} · y^{1−w_mid} · exp( −(Δw/2)·√( τ² + ln²(y/x) ) ) = k        [up to anchor const]

Verified numerically at (γ₋,γ₊,τ) ∈ {(1.5,4,0.3),(1.5,4,0.05),(2,3,1)}: F constant along the (W)
frontier to **5.6e-16** (machine precision); implicit differentiation of F=k returns exactly the
Balancer local-weight price law −dy/dx = (w(u)/(1−w(u)))·(y/x) with u=ln(y/x) (err 8e-10); Δw=0
gives Cobb–Douglas exactly; τ→∞ gives CD in the limit; wings are the same exact power-laws the note
proved for (W). It is "clean" by the note's own standard (the CD base itself is exp/log-form, not
polynomial). The impossibility argument is a non sequitur: it proved the unmodified CD monomial
X^w·Y^{1−w} is non-constant under variable w (true, 4.6e-41 check fine) and concluded no non-monomial
closed form exists (false). Steelman of the algebraic route therefore WINS — and not by relaxing
"exact power-law wings" to "asymptotic"; the invariant exists outright, for the very curve delivered.
Consequence: nothing about the deliverable's geometry breaks (same curve, two representations), but a
"structural, confident" impossibility theorem is now baked into **feature_inventory item 2** and the
§0-adjacent framing — shared truth carries a false theorem. Naming the hole; the correction is the
manager's to make.

### 2. FLAG-WRONG — "τ:=δ EXACTLY"; "the current engine (δ=0.08) is the single setting τ=0.08"
The kernel-shape correspondence is real (the GH latent score is β−α·v/√(δ²+v²); its v-part is the
elbow kernel; sharpness 1/(2·scale) matches). But the note promotes this to a curve identity —
"(W) IS the GH elbow exactly... plain Balancer→GH is one knob setting" — and that is **false at every
β, including the engine's pinned β=1**. Test: any (W) member, read in its own coordinate ũ=ln(Y/X),
must satisfy (ũ−c) = τ·r/√(1−r²) with r=(w−w_mid)/(Δw/2) for ONE constant τ. Computing the GH
frontier's depletion weight w_eff = (dlnY/du)/(dlnY/du − dlnX/du) at α=4, δ=0.08:
**β=1 (engine): τ_implied runs 0.012 → 2.41 across the curve; β=0: 0.05 → 2.40.** No constant
exists, and nothing is near 0.08. Structural reason: GH installs the kernel in the latent **score**;
(W) installs it in the **weight** — (W)'s weight approaches its wing constants polynomially
(O(τ²/u²)), GH's depletion weight approaches its endpoints exponentially; no (w_mid,Δw,τ) can match.
Worse at the engine pin: GH(β=1)'s endpoint weights are **(w₋,w₊)=(1,0)** — outside the open (0,1)
band the note's own role split γ_±=w_±/(1−w_±) and validity gate require; γ₊=0 means **no call-wing
power law**, which is exactly the gh_call_root_out_of_strip fact and exactly what the two-sided-wings
description of (W) cannot represent. The note is also internally inconsistent: §7.4 says the engine
is the **w₋=w₊ slice** of (W) — where Δw=0 makes τ inert (w′(0)=Δw/2τ=0) — so the engine cannot
simultaneously be "the single setting τ=0.08" of an elbow that requires Δw≠0. Net: §§1–4 analyze
curve family (W); §5 specifies un-freezing the engine's ghDelta (the REPARAM MINIMAL fork — a sound,
previously-verified object). These are **two different curves** welded by a broken bridge. The
operator should know which knob they are being offered. This claim too propagated verbatim into
**CLAUDE.md §0** ("the GH engine = ONE warp setting (τ≡δ=0.08), built in weight-profile form") and
**inventory item 2** — shared truth carries the broken identity. What survives: δ itself IS a
kurtosis/elbow dial on the engine (REPARAM, independently solid), and the kernel/sharpness analogy
is a fine heuristic — as an analogy, not an "EXACTLY."

### 3. FLAG-OVERSELL — kurtosis law quoted at the engine that was computed on the symmetric slice
§4's Object-L table (row "0.08 → 2.6530 **(= engine)**") and the claim "excess kurtosis ∈ [0,3],
→3 (Laplace) as τ→0" are computed at **β=0**; the engine is pinned **β=1**. Re-derived at α=4, β=1:
δ=0.08 → skew **+0.917**, excess kurtosis **3.285** (∉[0,3]); δ=0.3 → skew +0.695, kurtosis 2.153.
(β=0 values reproduce the note's 2.6530/1.6885 exactly, so this is the β-effect, not quadrature.)
The τ→0 limit at β=1 is the asymmetric Laplace, whose excess kurtosis exceeds 3 — the "[0,3],
saturates at 3" law is a symmetric-slice statement. The **direction survives** (kurtosis still
monotone-decreasing in τ at β=1: 3.285→2.153), so the load-bearing label warning ("do NOT ship τ up
= fatter"; dial = 1/τ) stands. But a table row labeled "= engine" that is off by 0.63 at the engine's
actual pin, plus a range claim the engine violates, is evidence outrunning its slice — the same
β=0-numerics-for-a-β=1-engine pattern as flag 2.

### 4. FLAG-OMISSION — inventory walk (docs/feature_inventory.md, 15 items)
Considered: #1 base (§0/§3/F1), #2 warp (the deliverable), #3 knob (§§1–4), #6 partially (§5 bullet
+ §7.4 two-root fork), #7 thinly (§5: S* algebraic in γ — asserted, no seam check at varied τ),
#12 (§5 slope-law bullet), #14 partially (Esscher named; conserved-quantity conjecture honestly
left unproven). **Silently absent:** **#8 uniform strike registration** — sNormStrike =
getSNorm∘arbitrageToOracle flows through the τ-keyed kernel; whether crossover@K survives freed τ is
never dispositioned (dir_gate exists precisely for this and isn't cited). **#9 funding** — REPARAM
covered its δ-invariance; this note dropped it, and for the (W) family "the w=½ anchor" is genuinely
ambiguous when w is itself a field. **#13 solvency** — REPARAM §3.5(d) showed δ moves wing reserve
DEPTH by ~an order of magnitude (X/Nx at m=2: 0.034→0.220); a shipped τ knob redistributes the depth
the B1 floor rides on; nothing dispositions it. **#10/#11/#15** absent or implicit only. **#4 carry**
is mis-stated, not just absent: the note defines u = log p − log P, but its own (★) gives
dq/du = 1 + w′/(w(1−w)) ≠ 1 — u cannot be log-price-minus-log-carry in (W) (it is ln(Y/X) recentered);
the carry/rebase story for (W) is never worked. On the operator's specific question — rebase /
conservation / Esscher slope-law / value∝S^(−γ) / seam "all survive τ": **SHOWN (numerically) in
REPARAM for the GH-kernel δ-unfreeze; ASSERTED-by-carry in this note; NOT ESTABLISHED for the (W)
family the note actually constructs** — and the Esscher mechanism (d log slope/du = 1) demonstrably
fails mid-curve for (W) (the note's own F3: dq/du(0) up to 24.8), so with the τ:=δ bridge broken
(flag 2) the §5 invariance bullets do not transfer to (W) at all. Fairness: the inventory was created
the same day (with me); the missing disposition LINES are procedural, but #13, #8, and the #4
coordinate slip are substantive holes regardless of paperwork timing.

### 5. FLAG-PROCESS — the manager check narrated where it mattered
Commit b8605ee says "manager independently verified the load-bearing asymptote-preservation" — and
that one claim (F2) is real: I reproduced it byte-identical (γ_loc errs 3.12e-5/1.25e-4,
τ-independent across three decades). But the merge then carried **"τ:=δ EXACTLY"**, **"NO clean
algebraic invariant exists — structural"**, and **"∈[0,3]"** into the commit message, manager MEMORY,
CLAUDE.md §0, and inventory item 2 the same day, none re-derived. The two claims that broke under
attack are exactly the two narrated ones, and both wear the strongest confidence markers ("EXACTLY,"
"confident," "structural") — the documented team pattern (CURVE_SWAP δ-direction, rfl-tautology)
repeating with the same signature: confidence language correlates with the misses; the claims with
attached numbers (F1–F7) all reproduced. Convergence alarm: research-lead asserts → manager verifies
the easiest-to-verify item → the unverified headliners become shared truth in <24h.

### 6. PASS — what survived attack (settled; documented per charter)
(a) **Asymptote preservation (F2)**: attacked by exact reproduction; γ_loc(±100τ) identical across
τ∈{0.05,1,30}, errs match the note's digits; the τ-independence is exact (pure horizontal rescaling).
HOLDS — and my closed-form invariant (flag 1) makes it analytic: wings are exact CD monomials.
(b) **Kurtosis sign-split (F6) + label direction**: pushforward at τ=0.3, w∓=0.3/0.7 reproduces
**−1.1163** vs note's −1.116; latent positive (and MORE positive at β=1: +3.285); opposite signs
confirmed; "fatness dial = 1/τ, don't ship τ-up=fatter" is correct and operator-relevant. HOLDS.
(c) **Endpoint structure (F1/F3)**: τ→∞ → constant-w CD (exact in my closed form: the √-term
degenerates to an absorbable constant), τ→0 → sharp Laplace step. HOLDS for (W).
(d) β=0 Object-L table values 2.6530/1.6885 reproduce exactly — correct as symmetric-slice facts.

## The single most important finding
**The note's two flagship "confident" claims are both false, and both were promoted into shared truth
(CLAUDE.md §0, feature_inventory item 2) on merge day without re-derivation:** the clean algebraic
invariant the note declares structurally impossible exists in closed form for the note's own curve
(x^{w_mid}y^{1−w_mid}·e^{−(Δw/2)√(τ²+ln²(y/x))}=k), and the "τ:=δ EXACTLY / engine = one warp
setting" identity fails at curve level for every β (τ_implied 0.012→2.41 at the engine's β=1; the
engine's wing weights are the degenerate (1,0), outside the family). The deliverable secretly
contains two different curves — the (W) profile analyzed in §§1–4 and the REPARAM δ-unfreeze
specified in §5 — and the operator's curve decision needs to know which one is on the table.
