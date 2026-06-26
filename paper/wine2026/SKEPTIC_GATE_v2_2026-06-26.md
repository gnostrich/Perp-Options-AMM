# Skeptic gate — WINE2026 v2 from-scratch rewrite (run a0d1c617, 2026-06-26)

**Verdict: CLEAR-TO-COMMIT after one fix (applied).**

## FLAG-OMISSION (entry-247) — FIXED
`temporal_wine2026_v2.tex` contributions bullet wrote `S*=Kγ/(γ+1)` with γ/K unglossed in the
intro (γ not defined until §4). The storytelling rewrite dropped the inline gloss the LNCS source
carried. **Manager fix:** glossed inline — "with K the dollar strike and γ>1 the curve's convexity
exponent (larger γ = steeper option-value curve)." Structural recheck PASS ($ even, braces balanced).

## CLEAR (skeptic attacked, held)
Claims-vs-proofs (solvency conditional, American=deterministic+Snell-named, |Γ|≤1 exact/>1 approx,
trusted-from-prover never "verified"); Balancer-not-GH; novelty placement (curve-family-not-contribution,
QuantAMM prior, no TFMM); Merton wording (γ(γ+1)=2r/σ², symmetric pairing, r>σ², faith_merton gate — the
06-23 seam-gate trap NOT reintroduced); entry-247 elsewhere (abstract clean, "carry" introduced first);
appendix relocation (supplement fully commented out, no dangling refs, no lost hedge).

## CARRIED — NOT a halt, ESCALATED to operator (pre-exists in BOTH source drafts)
Worked example: prose writes the at-boundary value fraction as `1/(γ+1)` and says `S*` "depends on γ,
not m," but the table's m=3 cell is `1/(g_loc+1)=0.143` (g_loc=mγ=6), and the LIVE ENGINE settles at
`S*=K·g_loc/(g_loc+1)` (CLAUDE.md), i.e. the lens DOES move the boundary in the engine. Potential
paper↔engine inconsistency on whether the lens shifts the exercise boundary S*. Needs research-lead
adjudication before submission. v2 copied this faithfully from the sources — not a rewrite regression.

---

## S*/lens boundary correction — skeptic gate (run a37bc046, 2026-06-26)
research-lead adjudicated + manager re-derived + re-verified numbers: the smooth-paste boundary moves
with the lens — `S*=K·g_loc/(g_loc+1)=K·mγ/(mγ+1)`, fraction `1/(g_loc+1)`, g_loc=mγ. Engine/Lean/gates
were ALREADY correct (paper-only fix). Old papers wrongly said `S*=Kγ/(γ+1)` "depends on γ not m" with a
triple-inconsistent m=3 table. Fixed in both papers + `specs/SPEC_itm_exercise_smoothpaste_NEXT.md`.
**Skeptic verdict:** boundary correctness CONFIRMED (tracks g_loc, C¹ forces shared exponent); m=3 table
all cells CONFIRMED (S*=85.71; $80→0.200 intrinsic, 0.107/0.057/0.019); Merton convention intact; entry-279
not-forced framing engine-VERIFIED accurate; entry-247 g_loc glossed. **One FLAG-OMISSION (WINE only):**
two stale base-γ summary sites (L148 intro, L722 conclusion) — the recurring "headline summary lines left
stale" pattern; American paper + spec were clean. **Manager fix:** L148 + L722 → `K·mγ/(mγ+1)` (base form
at m=1), matching the American paper's phrasing. Post-fix: no uncontextualized bare boundary remains,
structure sound. CLEAR-TO-COMMIT.

---

## Tone + diagram revision — skeptic gate (run a8ae9223, 2026-06-26) — CLEAR-TO-COMMIT
Entry-280: crisp the flowy language (keep flow), revert flowy title, QC/fix diagrams. Skeptic re-derived
both figures + diffed every hedge vs the prior cleared version. Verdict CLEAR: (1) no hedge/gloss lost in
the de-flow (conditional solvency, |Γ|≤1, deterministic+Snell-named, trusted-from-prover, Balancer-not-GH,
curve-family-not-contribution, QuantAMM-prior all survived; "needed"→crisper not weaker); (2) entry-247
preserved (γ/m/g_loc/carry glossed; L148/L722 keep the m-qualified S*=K·mγ/(mγ+1)); (3) S* correction +
Merton convention intact (not regressed); (4) title "A Single Dynamic AMM Pricing American-Style Perpetual
Options" accurate — a de-escalation from the old "…that IS a book" identity claim; (5) all 3 figures correct
— Fig 1 rebuilt (genuine power laws crossing uniquely at T=(1.164,1.804) on the ray, no +0.18 offset),
Fig 2 axis relabeled log-strike (makes e^(-mγ|x|)=value∝S^(-mγ) honest), Fig 3 untouched. Manager
independently QC'd Fig 1 geometry + verified title/de-flow/invariants.
