# Review-Pipeline Worked Example (fully synthetic)

Everything in this directory is invented for documentation. The "paper" is a
fictional one-page mechanism written for this example. It contains exactly
one deliberate algebra error, placed so the pipeline's math attack angle
catches it from the paper's own worked example. No file here comes from a
real review, and no confidential material is involved.

Methodology this example illustrates: `docs/REVIEW_PIPELINE.md`.

## Files

| File | Pipeline phase | What it shows |
|---|---|---|
| `paper.md` | input | the toy claim set (5 claims, one deliberately wrong) |
| `claims_ledger.json` | Phase 1 Extract | a claims ledger in the extract schema |
| `attack_math.json` | Phase 2 Attack | one attack-angle output in the attack schema |
| `VERDICT_SUMMARY.json` | Phase 4 Synthesize | the machine-readable verdict, exact key structure |
| `REFEREE_REPORT.md` | Phase 4 Synthesize | a one-page referee report in the 8-section format |

Phases 3 (open-model panel) and 5 (completeness critic) are not fixtured
here. The panel is skipped (the verdict summary records `panel_cost_usd: 0.0`
and explains why in `reconciliation_note`), which is also the pipeline's
documented behavior when no OpenRouter tool or API key is available.

## The deliberate error, in two lines

The paper claims pressure p = a/b updates as `p' = p*(a+da)/a` after a swap.
Substituting the swap rule gives `b' = a*b/(a+da)`, so
`p' = (a+da)/b' = p*((a+da)/a)^2`: the square, not the first power. The
paper's own worked example (a=100, b=100, da=25) yields 1.5625 where the
paper prints 1.25.

This is the pipeline's core habit on display: never accept "by construction".
Substitute the stated update rule into the claimed law and simplify fully,
then recompute the paper's own numbers.

## Reproducing this shape on a real paper

```
bin/lab_review.sh /path/to/paper.pdf --domain "your domain" --budget 8
```

or interactively: `/lab-review /path/to/paper.pdf "your domain"`.

Real reviews write to the config's `reviews_dir` (under `lab_home`, outside
this repo) and produce the same file shapes you see here, plus
`CRITIC_NOTES.md`, `prior_art_dossier.md`, and a `panel/` directory with raw
model outputs and per-call cost files.
