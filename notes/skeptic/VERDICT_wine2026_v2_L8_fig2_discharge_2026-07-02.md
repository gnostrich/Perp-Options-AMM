# SKEPTIC VERDICT — L8 discharge + Fig-2 caption fix (entry 325-A), 2026-07-02 (focused confirm)

Artifact: `git diff paper/wine2026/temporal_wine2026_v2.tex` (the 4 applied edits on top of the pass I
gated in VERDICT_wine2026_v2_lean_annex_pass_2026-07-02.md). Re-derived from: the full diff (340 lines,
all read), formal/INDEX.md row 68 (MERTON), engine/verify/run_all.sh lines 90–108, DIFF_LEDGER display-
slice entry (a6ca02f3 + 7015c22c addendum, entries 292/295/298/301).

## (a) L8 FLAG — DISCHARGED. Confirmed.
- Annex row L8 (tex 907–909) now reads Vieta relations + Merton boundary on the pairing + Gaussian-slice
  limit — all three are genuine Lean per formal/INDEX.md row 68 (`merton_vieta_sum/prod`,
  `Sstar_is_merton_boundary`, `gaussian_limit_quadratic`, ✅ GROUNDED, tfp; Bessel-K layer CARRIED and the
  body's "carried as named hypotheses — exact on the Gaussian slice, conditional beyond it" hedge is intact).
- Both remaining L8 superscript sites render onto Lean content only: tex 640 attaches to "Vieta
  sum/product relations"; tex 647 attaches to the Gaussian-slice limit (the Merton-boundary clause is
  covered by the row). L8 site count unchanged (2), no orphans.
- `faith_merton` survives ONLY in non-rendered comments (tex 29, 54), honestly labelled "ENGINE gate,
  NOT in table". No engine artifact carries Lean/tfp provenance anywhere in the rendered paper —
  comment-stripped check: the only rendered gate mentions (641, 674) are explicitly disclaimed as
  numerical/engine, not Lean.

## (b) Fig-2 replacement — ACCURATE and claim-reducing. Confirmed.
The removed clause ("mirrors the live engine's strike-mark chart") is indeed FALSE post-display-slice:
DIFF_LEDGER (a6ca02f3 entry + 7015c22c addendum, tester live ×2 byte-stable, operator go entries
298/301) records chart-2 deliberately REPLACING the normalized tent depiction with the true markLensed V
(peak=1-at-mode convention RETIRED BY DESIGN; %/$ views, uncapped ITM wings). The replacement sentence —
"the normalisation is schematic — the deployed interface plots the un-normalised option value itself" —
matches that evidence: $ view is literal dollars, % view is the value with no shape re-normalisation.
It swaps a false claim for a weaker tester-evidenced one; no new substantive claim. ("Deployed
interface" = the previously-cleared "shipped instrument/implementation" register — settled advisory,
not re-flagged.)

## (c) Collateral — ONE narrow residual FLAG on the discharge's own new wording.

### FLAG-OVERSELL (narrow) — "enforced against the running implementation" points at the wrong engine
The re-split sentence (tex 639–642) says the Vieta convention is "additionally enforced against the
running implementation by a dedicated engine consistency gate." I re-derived what that gate actually
runs against: `run_all.sh` line 104 hard-wires `node faith_merton.js temporal_mvp_v26b_itm.html` — the
DEMOTED GH-line v26b build, not the v28 lens HEAD. The paper describes exactly one implementation (the
plain-Balancer + lens engine of §4), and its own §5 sentence "the shipped implementation reproduces the
worked-example table" uses "implementation" for HEAD — so "the running implementation" reads as HEAD,
which has no ghCalibrate/σ_eff machinery and is NOT what faith_merton checks. Same referee trap as the
original L8 flag, one notch milder: the artifact exists, but for an engine the paper doesn't describe.
Steelman for the text as-is: the gate DOES execute on every run_all invocation and hard-gates the suite,
and the Merton tie is stated at the unlensed base γ where the GH engine is the natural check — but the
paper gives the reader no second engine to attach "running implementation" to, so the referent is wrong
as rendered. The Lean/engine SPLIT itself is now correct ("a numerical harness, not a Lean result" —
exactly the honesty the original flag demanded); only the gate's target is misattributed. Hole named;
fix is the manager's (this is a phrase-level discharge, not a structural one).

### Everything else: CLEAN
- Full 340-line diff re-read; the only deltas vs my gated pass are the 4 declared edits. All other rows
  L1–L13, preamble, footer, hedges (conditional solvency, |Γ|, Snell ×3, tfp-never-verified, Merton
  regime + how-literally, vol-direction) byte-intact per the diff hunks.
- Header-map comment (line 54) honest. Structure/appendix unchanged. Supplement untouched.
- Standing from the prior verdict, still owed: annex ≤1pp / ≤12pp on the compiled PDF (no LaTeX here).

## Bottom line
(a) DISCHARGED. (b) CONFIRMED accurate. (c) one narrow FLAG-OVERSELL on the new "running
implementation" phrase (gate runs on demoted v26b, not HEAD) — discharge that referent (or disclose the
build) and this artifact is CLEAR. Verdict to be relayed verbatim.
