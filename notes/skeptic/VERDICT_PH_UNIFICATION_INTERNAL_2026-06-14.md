# SKEPTIC VERDICT — PH_UNIFICATION_INTERNAL internal-passivity proof (2026-06-14)

ARTIFACT: `formal/aristotle_runs/PH_UNIFICATION_INTERNAL/extracted/RequestProject/PHUnification.lean`
(md5 d6bef416 — confirmed; 141 lines; Aristotle project ad21b66d / task 80cd7ba4; committed 1b898cd).
Gate: Universal Skeptic Gate BEFORE fold to formal/INDEX as `proved (trusted-from-prover)` internal half.
Prior gate that pre-named the two welds: #ph-unification-gate (entries 237/238/239).

## VERDICT: FLAG-OVERSELL (fold-framing) — NOT clear to fold as "internal half geometry-witnessed."
The individual theorems are all TRUE and REAL (no sorry, no rfl-tautology, non-vacuous). The flag is
NOT against any theorem statement — it is against the FOLD CLAIM. The conjecture promised a *welded*
internal half (`hR` discharged by `R_psd` on the concrete object); what returned is an *abstract*
passivity theorem with `hR` left OPEN, plus a dangling, never-composed geometric lemma. The weld the
gate exists to check is STATED-AS-AVAILABLE but NOT ACTUALLY MADE.

## What I confirmed (re-derived cold, did not rubber-stamp)
1. **Token scan CLEAN.** No sorry/admit/axiom/native_decide/sorryAx/opaque/unsafe/decide; also no
   admitted/proof_wanted/extern/Classical.choice. Confirmed independently.
2. **Math is genuine, NOT vacuous.** `internal_passivity` (L86): `Hs N ≤ H0 + Σ supplied`. Re-derived
   the telescoping: gap = `Σ_{k<N} dissipated k = Σ Rcurv·eff²`. On concrete non-degenerate data the
   inequality is STRICT (gap 6.30 in my probe), =0 only when all dissipation is zero. The bound is the
   real telescoped sum, not a definition rigged to hold for empty reasons. `sampled_increment` (L78,
   `simp[sum_range_succ];ring`) and `sampled_dissip_nonneg` (L72, `mul_nonneg(hR k)(sq_nonneg _)`) are
   real. `no_internal_free_money` (L95) is a real `linarith` corollary. CONFIRMED non-trivial.
3. **Weld (a) — R_psd genuinely witnessed.** `R_psd` (L30) proven by `unfold;norm_num;nlinarith`. CAS
   confirms `μ''(t)=2(t−β)/(αβ)`, ≥0 exactly on `t≥β`; also `price=μ'(y)` so the object is
   geometrically coherent. `exchange_Rcurv_nonneg` (L103) = `exact E.amm.R_psd (st k)(hst k)` — a REAL
   call to the REAL proof, not a stubbed/sorry'd hypothesis. Weld (a) is sound AS A STANDALONE LEMMA.
4. **Weld (b) — no solvency-closed leak.** `solvency_of_coverage` (L114) carries `hcov` as an explicit
   `→` premise (`linarith[hcov s]`); `coverage_iff_solvency` (L123) is pure algebra `a−b≤c ↔ a≤b+c`
   billed honestly as minimality/localization; `exchange_solvency_split` (L134) keeps the external half
   a `→` arrow INSIDE the statement. Solvency is NEVER asserted unconditionally. PH-4b honored. CONFIRMED.

## THE HOLE (why FLAG, not CLEAR)
The conjecture (`notes/research/PH_UNIFICATION_whole_exchange_2026-06-13.md` L159-160, verbatim):
"Headline: `internal_passivity : Hs N ≤ Hs 0 + Σ supplied` — identical to `CTPH.sampled_passivity`,
re-exported on the welded structure **with `hR` discharged by `R_psd` (n=1)**." The deliverable was a
theorem ON THE CONCRETE OBJECT whose PSD hypothesis is CLOSED by geometry.

What returned instead:
- `internal_passivity` (L86) takes `Rcurv : ℕ→ℝ` as a FREE abstract function and `hR : ∀k,0≤Rcurv k`
  as an OPEN hypothesis. `Rcurv` is never identified with `deriv(deriv poolPotential)(st k)`.
- `exchange_Rcurv_nonneg` (L103), the geometric discharge, is a STANDALONE lemma that is NEVER passed
  as the `hR` argument to `internal_passivity` anywhere. Grep confirms zero downstream composition.
- `exchange_solvency_split` (L140) instantiates passivity with the ABSTRACT `Rcurv`/`hR`, not with the
  geometric curvature. There is NO `exchange_internal_passivity` theorem joining the two — ABSENT.
- The conjecture's second welding lemma `trade_no_spontaneous_storage` (note L158, the lossless-trade
  leg from `trade_conserves`) is ABSENT entirely; `trade_conserves` itself is proved (L37, ⟨rfl,rfl⟩
  — real but trivial) yet dangles, unused by any passivity theorem.

Net structural reading: the file proves (i) abstract telescoped passivity for ANY nonneg `Rcurv`, and
(ii) separately, that the GH curvature is nonneg on-domain. It does NOT prove that THE TEMPORAL EXCHANGE
is passive BECAUSE its geometry is PSD. The economically load-bearing step — that the resistive port of
the concrete object actually IS the nonneg curvature feeding the dissipation — is the one line of
`exact`/specialization the conjecture itself called "the new content" (note L165-167), and it is the
line that did not get written. This is precision-note #2 from my prior gate (passivity free-rider)
recurring, now sharper: passivity is not just over-credited in the external half, it is UN-WELDED to the
object in the internal half too.

## Steelman of folding it anyway (and why it loses)
Steelman: every piece needed for the weld EXISTS in one file (`internal_passivity` + the matching-shape
`exchange_Rcurv_nonneg`); the composition is a one-liner a reader can mentally perform; CTPH-style
abstract-passivity + separate PSD-witness is the established trusted-from-prover idiom; and nothing
false is committed. So fold it as "internal half proved, geometry-witnessed."
Why it loses: the gate's entire reason to exist on THIS artifact (per my prior gate L3130) was to verify
the WELD is made, not merely that both halves exist. "Both halves present in one file, composition left
to the reader" is exactly the M=Fisher/rfl-class pattern in a new costume: a proven-SOUNDING headline
("internal half geometry-witnessed") whose load-bearing join is not in the Lean. A reader of the INDEX
entry will believe the Temporal exchange is proven passive from its geometry. It is not — only that an
abstract system with a nonneg port is passive, and that the geometry's port happens to be nonneg, with
the "happens to be THE port" link unproven. Label-accuracy is the deliverable here, and this label
would outrun the Lean.

## Coherence with prior CLEAR
My prior gate CLEARED the CONJECTURE (entries 237/239) and explicitly flagged at L3130: on return,
"check §3 welding: n=1 R.PosSemidef witnessed by R_psd, not re-stubbed." R_psd is not re-stubbed (good)
— but the welding that the conjecture-gate was clearing toward (`hR discharged by R_psd`) DID NOT LAND.
The returned statements drifted from what was conjectured: the headline kept its hypothesis open. So
this is consistent with — not a reversal of — my prior position: I cleared the plan to weld; the weld
did not arrive.

## What would turn this to CLEAR (naming the hole, not the fix)
A theorem in the same file with NO open `hR` for the concrete exchange — i.e. `internal_passivity`
applied with its `Rcurv`/`hR` instantiated by `exchange_Rcurv_nonneg` (so the only remaining premises
are object data + `eff`/`st`-domain), OR the INDEX/relay wording downgraded to state precisely what IS
proved: "abstract telescoped passivity (hR open) + standalone on-domain PSD curvature witness; the
geometry→passivity weld is NOT composed in Lean." I do not prescribe which.

## Self-containment caveat (Q3) — additionally required in the label regardless
Honest only if the INDEX entry carries BOTH: (i) self-contained re-declared minimal `TemporalAMM`
(L10)/`Exchange` (L49), NOT the canonical types; (ii) NOT wired into the canonical project build (no
lakefile; lone `PHUnification.lean` in RequestProject) — SAME status as MonolithConstM, i.e.
trusted-from-prover + self-contained + NOT-integrated, never "verified/integrated." Without both
caveats a reader will treat it as wired in. (This is necessary but not sufficient — the weld hole above
stands independently of these caveats.)

## NET
FLAG-OVERSELL on the FOLD CLAIM. Do NOT fold as "internal half proved, geometry-witnessed." The
theorems are individually true and the math is non-vacuous; the geometry→passivity WELD the gate exists
to verify is not composed in the Lean, and `trade_no_spontaneous_storage` is absent. Folding requires
EITHER the composed theorem OR an INDEX/relay label that states the un-welded reality plain — plus the
self-contained + not-integrated caveats. Relay this verdict to the operator unedited; fold only after
resolution.
