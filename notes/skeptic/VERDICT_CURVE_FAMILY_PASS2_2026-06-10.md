# VERDICT — CURVE_FAMILY_settlement_pass2_2026-06-10.md (skeptic, 2026-06-10)

Artifact: `notes/research/CURVE_FAMILY_settlement_pass2_2026-06-10.md` (research-lead).
This is the follow-up that answers the ONE question I isolated in VERDICT_CURVE_FAMILY (is value
locally a single power through the elbow?). Audited against the verbatim brief, the manager
CORRECTION HEADER, `evidence/manager_audit_CURVE_FAMILY`, my prior verdicts, and inventory #1–#16.
Every number below independently re-derived (python3 + scipy `solve_ivp` rtol 1e-12, `brentq`);
scripts `/tmp/skeptic_riccati.py`, `_riccati2.py`, `_sstar.py`, `_tension.py`, `_robust.py`.

---

## PASS (attack attempted, failed) — the Riccati setup, the `-p`=slope identity, the divergence

I re-derived the operator and the Riccati from scratch and they are CORRECT:
- `V=e^{-γx}` ⇒ `(σ²/2)γ²+μ(-γ)-r=0`, with `μ=-σ²/2` ⇒ `γ(γ+1)=2r/σ²`. Matches §1.
- `p=V'/V`, `V''=(p'+p²)V` ⇒ `(σ²/2)(p'+p²)-(σ²/2)p-r=0` ⇒ **`p' = 2r/σ² + p − p²`**. Exact match.
- `-p = -d lnV/dx` IS the value's log-log slope (x=lnS), by definition. Sound.
- Decaying branch `p=-γ_+` is the backward attractor; backward integration from the right wing is
  the correct way to isolate the sub-dominant eigenfunction. Sound.
- **Divergence reproduced:** my table (w_mid=0.7, Δw=0.2, tanh profile) gives at τ=0.3, u=0:
  −p=2.861 vs γ_loc=2.333, **dev +0.527** (note +0.498); wings agree to ~1e-4. τ-scaling:
  τ=0.05 max|dev|=1.49 (note 1.406), τ=0.30→0.540 (note 0.520). Same magnitude; the small
  differences are the note's unstated exact `w(u)` profile / registration. **Verdict NO
  (single-power-through-elbow is false under Reading B) is CORRECT** — value is a genuine blend.

## PASS (attack attempted, failed) — the `γ_loc′/(2γ_loc+1)` correction is NOT a retrofit

I linearized the Riccati by hand: `p=-γ+d` ⇒ RHS `= d(1+2γ) − d²`; adiabatic (`p'≈-γ'`, drop d²)
⇒ `-γ' = d(1+2γ)` ⇒ `d=-γ'/(2γ+1)` ⇒ **`-p ≈ γ_loc + γ_loc'/(2γ_loc+1)`**, lnS-free, correct
positive sign. Numerically it matches the solved Riccati to ~1e-2 in smooth elbows (τ=1,2) and
degrades only at the sharp elbow (τ=0.3, diff ~0.13) exactly where the note says higher-order
terms enter. The claim that this is "the consistent home of pass-1's −γ′ term" is HONEST: it falls
directly out of the pricing ODE, is genuinely distinct from pass-1's mis-differentiated `-γ'·lnS`
artifact, and the note does NOT reinstate the retracted +16% table (§5, §7.2, opening para all
keep it retracted — confirmed clean, item 6 of the brief satisfied).

## FLAG-OVERSELL — "bounded few-percent (3–6%)" is a SINGLE-PARAMETER-POINT result sold as the magnitude answer

The S*-shift table (§5) is a RIGOROUS `brentq` root-solve, not a heuristic — I reproduce it
tightly: τ=0.05 → S*_dyn 63.62 vs note 63.66, localFP 60.00 vs note 60.05; τ=1.0 → 68.16 vs note
68.18. The arithmetic and the method are honest, and S* genuinely stays bounded (no blow-up — the
catastrophe stays retracted). **But "3–6%" is the shift for the ONE parameter set `w_mid=0.7,
Δw=0.2`.** Re-running the identical Gaussian-slice machinery on a wider band `w_mid=0.6, Δw=0.3`
(γ_loc spanning [1.0, 1.86]) gives a put-boundary shift of **+12–13%** at τ=0.05 AND τ=0.30 —
double the note's headline, and this is BEFORE any full-GH-ψ effect (which the note correctly
flags as a further unknown that could enlarge it). The note presents "bounded few-percent ~3–6%,
S* ~60–68, no blow-up" in §5, §7.2, and Flag 2 ("magnitude is small and bounded… the gate is
substantially passable") as the magnitude verdict the operator should act on. It is not the
answer; it is one point. The mechanism for the small base-case number (which the note never
explains): the PUT boundary sits at u*≈-0.45, on the *edge* of the elbow where the slope-deviation
is ~0.25, NOT at the u=0 ATM peak where it is 1.4 — so the headline 6% is a geometric accident of
where S* lands for this Δw, and widening Δw moves S* deeper and roughly doubles it. "Substantially
passable / small obstruction" outruns the evidence; the honest statement is "the boundary shift is
parameter-dependent, a few percent for the narrow band tested, ≥12% for a wider band, on a
generator known to be only the Gaussian slice."

## FLAG-OMISSION (soft) — the §1/§5/§6 Gaussian-slice caveat is honest but the Δw-sensitivity is not in frame

The model-dependent caveat IS prominent (§1 HONESTY CAVEAT, §5 "[numeric, model-dependent]", §6,
Flag 4) — that part is well-labelled and I credit it; the GH-vs-slice gap is not hidden. What is
silently absent is the SECOND dimension of model-dependence I found: the shift's sensitivity to the
band width Δw (the skew handle, inventory #2/#3). The note runs one Δw and reports its number as
"the" magnitude; nowhere does it state that the same generator gives ~2× the shift for a wider
band. A reader takes "3–6%" as robust within the Gaussian slice; it is not even robust there. Name:
the magnitude claim's Δw-dependence is dropped from frame.

## Reading A vs Reading B fork (§4) — LEGITIMATE, and honestly self-incriminating

I checked the brief's worry that Reading A is a circular dodge. The note does NOT dodge: §4 states
in plain English that Reading A "asserts the value law rather than deriving it from an optimal-
stopping problem," and §4/Flag 1 explicitly say the team's OWN locked frame (MERTON_tie/AIRTIGHT
T1a/T1b) IS Reading B, under which the answer is a blend. That is the research-lead naming its own
scaffold as the one that makes the gate only-approximate — the self-adversarial direction I value.
Routing "which reading is the settlement definition" to the operator as settlement-semantics-tier
(same class as the ITM rule, #7) is correct and matches my prior verdict's call that locked-
contract-transfer questions are operator-tier. Not a flag. (One nuance the operator should hear:
Reading A is not free — adopting "value := curve's local power by definition" *abandons* the
optimal-stopping derivation that MERTON_tie provides, i.e. it trades a proved settlement story for
an asserted one. The note says this but softly; it is the real cost of Reading A.)

## Inventory / locked-contract / creep-back — CLEAN

- Settlement (#7) correctly kept operator-tier (§4, §7.1, Flag 1). #6 pricing-law put-only
  treatment is consistent with CLAUDE.md #6 (β=1 GH carries only the put eigenfunction; call root
  leaves the strip) — I checked, call-side is moot at the pin, so put-only is not an omission.
- No retracted pass-1 claim creeps back (item 6 satisfied — verified above).
- This is a narrow follow-up note, not a full curve-family disposition; it does not re-touch
  #4/#5/#9 carry/rebase/funding (those stay where my prior verdict left them — manager still owes
  the "locked contract does not transfer" escalation framing). #16 warp-with-trades is not in this
  note's scope and not implied done — no creep. No silent re-opening.
- `[needs-Aristotle]` ledger (§6) is honest: it correctly says the inherited `Sstar_forced` does
  NOT cover the elbow under Reading B and a NEW lemma (free-boundary stability bound) would be a
  build, not a re-instantiation. No "trusted-from-prover" overclaim. Good.

---

## MOST IMPORTANT FINDING
The note's qualitative verdict (value is a blend through the elbow; correction
`γ_loc'/(2γ_loc+1)`, lnS-free) is CORRECT and survived independent re-derivation — but its
quantitative headline "bounded few-percent (3–6%), gate substantially passable" is a single-
parameter-point result: re-running the note's own Gaussian-slice machinery on a wider skew band
(Δw 0.2→0.3) roughly DOUBLES the boundary shift to ~12–13%, before any full-GH-ψ effect, so
"substantially passable / small obstruction" is OVERSELL — the operator must be told the
magnitude is parameter-dependent (Δw and the GH-vs-slice gap), not a settled few-percent.
