# SKEPTIC VERDICT — Carry pass #4 (W-curve) + delegated coordinate call

_skeptic, 2026-06-10. Mandatory §2.1 adversarial pass on
`notes/research/CURVE_FAMILY_carry_pass_2026-06-10.md` (research-lead) and its manager audit
`evidence/manager_audit_CURVE_FAMILY_2026-06-10.md`. PLUS delegated call (operator entry 14
"let the skeptic take the call"). Read-only; manager executes. All re-derivation in python3
float64, `/tmp` scratch; engine inspected at `engine/builds/HEAD_temporal_mvp_v26c.html`._

## Headline
The note's **conclusion is CORRECT and survives attack** — the locked carry coordinate identity
`u = log price − log P` with `dq/du≡1` is a Balancer fact that does NOT transfer to the (W) warp
curve; on (W) `dq/du = 1 + w′/(w(1−w))` (reproduced byte-level: 10.52/6.95/2.59/1.48 at
τ=0.05/0.08/0.3/1.0, →1 in the wings). The carry CONSTANT `P=Ny/Nx` survives as a reserve anchor;
only the COORDINATE identity breaks. The note does NOT oversell (it says exactly this — constant
survives, identity breaks). **But the GH-side "engine-clean" argument is mis-framed, and the
price-vs-slope GOTCHA #12 is glossed in a way that hides WHY the engine is clean.** Net: one
OVERSELL on the GH reasoning (not the verdict), one OMISSION (the definitional fork it rests on),
and a PASS on the (W) derivation itself.

---

## FLAG-OVERSELL — the §2.1 "GH carry is clean" argument is mis-derived (verdict survives, the REASON given is wrong)
The note (§2.1, Test 4) argues the engine carry is clean because "GH's Esscher slope law gives
`ln|dy/dx| = u + ln(Ny·M/Nx)`, whose warp correction is u-INDEPENDENT ⇒ d ln(slope)/du = 1." This
makes the GH-cleanliness look like a substantive structural fact about the SLOPE. It is not the
load-bearing reason. The engine's actual carry coordinate is **`getMP_raw`, the price coordinate —
NOT the slope** (GOTCHA #12; engine line 1640 comment verbatim: "carry price coordinate = e^mu *
|dy/dx|; equals oracle at equilibrium (NOT the geometric slope)"). And `getMP_raw` is **DEFINED**
as `ghP·exp(u)` (line 1639: "marginal price = P·exp(u)"), where `u` is the latent GH score. So
`log(getMP_raw) − log(P) = u` **identically** — `dq/du=1` on GH is a **definitional tautology**:
the engine takes its carry coordinate TO BE the latent score and wires `getMP_raw := P·e^u`. The
note's slope-based argument happens to also yield 1, but only because `ghMu` is a **constant
scalar** (engine line 1630: `mu = u0 − 3`, fixed at calibration; not a function of u along the
curve) — `ln|dy/dx| = ln P + u − ghMu`, derivative 1 because `ghMu` is constant. The note never
states that the GH-cleanliness rests on `ghMu` being a single absorbable scalar; it presents it as
the Esscher slope law being intrinsically u-independent. **Evidence:** engine lines 1619/1630/1639/
1640. **Why it matters:** the asymmetry the note is selling (GH clean / (W) broken) is REAL, but
its true content is "GH absorbs the warp correction into one scalar `ghMu`; (W)'s warp correction
`ln γ_loc(u)` is an irreducible u-dependent sigmoid (range ~0.98 nats, verified) that cannot be a
constant shift." That is the honest statement of the kernel-in-SCORE vs kernel-in-WEIGHT split.
The note's slope-derivation obscures it and, taken at face value, would let a future pass believe
the engine carry is clean "because the slope is clean" — which is exactly the price/slope
conflation GOTCHA #12 exists to prevent. **The manager's audit is HONEST here** (line 85: the β=1
engine-clean claim is "taken as research-lead's claim, not independently engine-reproduced here" —
a correct CARRIED label, not a verified one), so this OVERSELL is the note's, not the auditor's.

## FLAG-OMISSION — the definitional fork ("what IS price in the carry contract?") is never surfaced
The whole non-transfer hinges on a choice the note makes silently: on (W) it takes "price" = the
marginal SLOPE `(w/(1−w))·(y/x)` (the slope law, derivation-note line 53), while on GH the carry
"price" is the latent-score price coordinate `getMP_raw`, NOT the slope. These are unlike objects
(GOTCHA #12). The note compares slope-on-(W) against a clean GH and concludes asymmetry — without
stating that GH got to CHOOSE its latent score as the carry coordinate and absorb the rest into a
constant. **Steelman of the dropped alternative:** one could DEFINE the (W) carry coordinate to be
the reserve-ratio leg `u=ln(y/x)` itself (the GH-style "latent coordinate is the carry coordinate"
move); then `du/du=1` trivially and (W) carry is "clean" too — at the cost that "price" then means
the reserve ratio, not the true marginal exchange rate, which re-wires the mark/oracle semantics
(drops the `γ_loc` factor). The note's verdict beats this steelman — but only because it implicitly
requires "price" = the true marginal exchange rate (slope), and it never SAYS so. That requirement
is the load-bearing premise of the entire non-transfer and it is the thing the operator is being
asked to ratify. It must be on the table in plain words: **"On (W) we require the carry coordinate
to track the true marginal exchange rate, which carries an irreducible u-dependent γ_loc warp;
that is why u=ln(y/x) is not the carry coordinate."** Without that sentence, the §6 flag to the
operator reads as "a coordinate broke" when the real content is "a pricing-semantics choice forces
a coordinate redefinition."

## PASS (attack failed) — the (W) carry derivation itself
- `q = ln p = u + ln γ_loc(u) + C` and `dq/du = 1 + w′/(w(1−w))` with `w′=(Δw/2)τ²/(τ²+u²)^{3/2}`:
  re-derived independently (analytic = numeric to 1e-6); table reproduced exactly.
- Warp step `ln(γ₊/γ₋)=0.9808`, wing limits `ln 1.5=0.4055`/`ln 4=1.3863`: reproduced to 1e-4.
- Anchor decoupling §1.4: `p=P ⇔ w=½` at anchor reserves — re-derived analytically and numerically
  (wmid=0.5 → p/(y/x)=1.000; wmid=0.7 → 2.333). The "w=½ anchor is a single point u_½, not a
  global slice, and may be out of range for skewed w_mid≠½" observation is correct and is a genuine
  downstream trap for #5/#9.
- The note does NOT overstate: it explicitly separates carry-constant-survives from
  coordinate-identity-breaks; it labels every claim [analytic]/[numeric]; the [needs-Aristotle]
  ledger is honestly empty (no Lean obligation is ripe pre-ratification); nothing
  trusted-from-prover or verified is claimed.

## Inventory dispositions — HONEST, all 16 present, no silent absences
#4 correctly marked **Changed→does-not-transfer (operator-tier)** — this is the escalation tier my
verdict #5 demanded a locked non-transfer be filed at (not softened to "research to-do"); the note
got it right this time. #5/#9/#11/#8 marked **Noted-not-worked** with the `q`-coordinate flag
carried — correct sequencing, no over-claim. #12 (the gotcha) is marked **N-A this pass** — that is
the one disposition I'd push back on: #12 is NOT N-A here, it is the LOAD-BEARING object (the carry
"price" coordinate IS the getMP_raw-vs-slope distinction). Marking it N-A is how the OVERSELL above
slipped in. Not a silent absence (it's listed), so not a separate FLAG-OMISSION — but the
disposition label is wrong: #12 is **Considered (load-bearing)**, not N-A. #16 dispositioned
(skew-center φ interaction) — gate item 5 satisfied. β=1-not-β=0 honored throughout.

---

## PART 2 — THE CALL: (a) or (b)?

**RULING: (a) PROCEED — adopting `q=ln p` as the (W) carry coordinate is within the delegated
(W)-curve-DESIGN scope; it does NOT reopen the CLAUDE.md §4 locked architecture.**

**One-line reason:** §4's locked carry (`P=Ny/Nx`, `u=log price−log P`) describes the GH engine,
where `getMP_raw := P·e^u` makes `q=ln p` and the carry coordinate the SAME object already — so
working the unbuilt (W) research target in `q=ln p` is not a change to the locked GH contract, it
is the (W) curve correctly inheriting the SAME "carry coordinate = log-price leg" definition the
engine already uses; what "breaks" is only the Balancer accident `q=u`, which was never the locked
contract, only its Balancer special case.

This is the crux that keeps it (a) not (b): the locked contract is `u = log price − log P`. On the
engine that IS the price leg (`getMP_raw = P·e^u`). The note's "redefinition to `q=ln p`" is
therefore not a redefinition of the locked contract at all — it is the (W) curve being made to
honor the EXISTING contract (carry coordinate = log-price), and discovering that on (W) the
log-price leg ≠ the reserve-ratio leg. No locked-architecture WORDING changes; the (W) curve is an
unbuilt research target and choosing its internal coordinates is design-scope.

**Green light + guards for the #5/#9/#11/#8 batch:**
1. **GUARD-1 (the price-definition sentence — blocking):** before the batch runs, the note (or the
   batch brief) must state in plain words that "(W) carry coordinate = log of the TRUE marginal
   exchange rate (slope), which carries the irreducible u-dependent γ_loc warp." This is the
   premise the whole `q`-not-`u` instruction rests on (FLAG-OMISSION above). Without it the batch
   inherits the price/slope conflation. This is a one-sentence fix, not a re-derivation.
2. **GUARD-2 (#12 re-labeled):** treat GOTCHA #12 as **load-bearing** in every batch pass, not
   N-A. The carry "price" is the price coordinate, not the slope; any "clean on GH" claim must cite
   that `getMP_raw := P·e^u` (definitional) and `ghMu` is a constant scalar — not "the slope is
   clean."
3. **GUARD-3 (anchor pinning — already flagged by the note, endorse it):** #9 funding and #5
   rebase must each pin WHICH anchor (reserve-anchor `p=P` vs weight-anchor `w=½`) they reference
   BEFORE re-deriving; on (W) these are different points and `w=½` may be out of range. This is the
   real operator-tier question lurking under #9/#5 — flag it as it surfaces, do not pick it.
4. **GUARD-4 (escalate-non-transfer):** if #5/#9/#11 also fail to transfer (likely for #9, given
   the anchor decoupling), file each as "locked contract does not transfer — operator-tier," same
   as #4 — NOT as an ordinary research to-do.

**Where (b) WOULD bite (so the manager does not over-read this ruling):** if any downstream pass
proposes to change the ENGINE's carry wiring, the §4 text, or the mark/oracle semantics (e.g. wire
the mark to `e^u` and drop the `γ_loc` factor — the rejected steelman), THAT crosses into locked
architecture and must go to the operator. Adopting `q=ln p` as the (W) research coordinate does
not; re-wiring the shipped engine's carry does. The manager may dispatch the #5/#9/#11/#8 batch on
the (W) target under GUARDs 1–4; the manager may NOT touch any §4 wording, the engine carry, or
the mark/oracle pipe without an operator ratification.

---

## MOST IMPORTANT
The (W) carry verdict is right and honestly filed at operator-tier — but the engine is "carry-clean"
because `getMP_raw` is DEFINED as `P·e^u` with `ghMu` a constant scalar (GOTCHA #12), NOT because
"the slope is clean"; the note's slope-based GH argument glosses exactly the price/slope conflation
the gotcha exists to catch, so the #5/#9/#11/#8 batch must carry GOTCHA #12 as load-bearing (not
N-A) and state the price-definition premise in plain words before it runs.

## Convergence-alarm
LOW. The note is self-adversarial (it sets the skeptic's own trap and lands a non-transfer against
team momentum), labels honestly, and the manager's audit correctly marks the β=1 claim CARRIED not
verified. The miss is a framing/labeling oversell on the GH side, not a fabricated number — all
digits reproduced.
