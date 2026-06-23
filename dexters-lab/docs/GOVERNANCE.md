# Governance: The Research Doctrine

This document is the constitution of the lab. The tools in `bin/` mechanize it. If a tool and this document disagree, fix one of them; do not work around the gap.

## 1. The five stopping rules

Every empirical research question (RQ) is scored against the same five rules. The gate (`bin/stopping_gate.py`) applies them deterministically. Pass means proceed. Fail means PARTIAL or FALSIFIED. There is no third option.

| Rule | Test | Default threshold | Why it exists |
|---|---|---|---|
| 1 | Effect 95% CI excludes zero | `ci_low > 0` or `ci_high < 0` | If the confidence interval touches zero, you have not shown an effect. Direction must hold before anything else matters. |
| 2 | Fit quality | R² >= 0.5 | An effect that explains less than half the variance is a hint, not a finding. |
| 3 | Per-stratum effect spread | max/min <= 3x | If the effect is 10x stronger in one stratum than another, you found a property of one stratum, not a general law. Mixed signs across strata fail outright. |
| 4 | Instrument precision on gold | >= 0.85 | A finding measured with a sloppy instrument inherits the slop. Calibrate the measuring tool before trusting its output. |
| 5 | Inter-rater agreement | Cohen's kappa >= 0.7 | Where humans (or agents) label data, raters must agree, or the labels measure the raters and not the phenomenon. |

Rules 2 through 5 can be `not_applicable` when the input honestly lacks them (null R², fewer than 2 strata, no instrument, no raters). Not applicable is not a pass; the scorecard reports passed/applicable counts.

Verdict semantics:

- **VALIDATED**: every applicable rule passes.
- **PARTIAL**: rule 1 passes (the direction holds) but at least one other applicable rule fails.
- **FALSIFIED**: rule 1 fails. The CI includes zero. The claimed effect is not there.

Thresholds live in `lab.config.json` under `stopping_rules`. Changing a threshold is a governance change (class H4 below), not a tuning knob.

## 2. Pre-registration hashing

Before an RQ touches data, its plan declares, inside a fenced ` ```prereg ` block: hypothesis, observable, dataset, decision rules, and expected n. The compiler (`bin/rq_compile.py`) takes the sha-256 of the exact prereg text and stores it in the registry.

The hash is the commitment device. When the gate scores a result, it compares the prereg hash in the verdict input against the registry. A mismatch means the plan changed after registration, and the gate refuses to score (a distinct exit code, no scorecard written). You cannot quietly move the goalposts; you can only openly register a new RQ.

Editing one character of the prereg block changes the hash. That is the point.

## 3. Fail-closed gates

Every gate in the lab refuses rather than guesses:

- Missing required fields in a verdict input: error, no scorecard.
- Prereg hash mismatch: refusal, no scorecard.
- A ledger task whose verify command exits nonzero: the row stays not-DONE. Prose in a verify cell that cannot execute fails too, which is the honest outcome.
- Results files newer than the documentation that should describe them: the doc truth gate fails the build.
- Budget cap reached: spending tools halt politely instead of spending.

A gate that passes by default when its input is broken is a hole in the doctrine. Report such a gate as a bug.

## 4. Honest-negative culture

**FALSIFIED is a success.** A clean falsification with a diagnosis is a finished piece of research. It closes a branch, frees budget, and stays in the verdict log forever as a result, not as an embarrassment.

Concretely:

- Never massage features, prune strata, or re-slice data to flip a verdict. If you believe the observable was wrong, register a new RQ that says so and explains why.
- Agent-labeled gold sets are reported as agent-labeled. Never present them as human-labeled.
- Tool false positives are reported separately from real defects.
- "Rerun until green" is forbidden. One pre-registered analysis, one verdict.

## 5. Errata loops

When a logged verdict or published claim turns out to be wrong:

1. Do not edit the original row. The verdict log is append-only.
2. Append an erratum row that names the original RQ id, states what was wrong, and links the evidence.
3. Register a corrective RQ if the question still matters.
4. If the claim left the lab (a paper, a review, a public number), the correction must leave the lab through the same channel.

An erratum filed by the author is a credit. An erratum forced by a reader is a debt.

## 6. Evidence admissibility

Numbers must earn the right to appear in a verdict input:

- **Minimum n >= 40** for any headline fit or rate. Below that, results are labeled exploratory and cannot produce a VALIDATED verdict. Small-n pilots exist to size the real run, not to make claims.
- **Variance gates.** Point estimates without spread are inadmissible. Every effect carries a 95% CI. Comparisons between conditions report overlap, not just means.
- **Stratified reporting.** If the data has natural strata (ecosystems, cohorts, engines, days), report per-stratum effects so rule 3 can do its job. Pooling that hides strata is a form of massage.
- **Provenance.** Every number in a verdict input names its source file. Every quantitative sentence in a draft carries an evidence pointer (`bin/claim_lint.py` enforces this).
- **Gold sets** state who labeled them, with what instructions, and what the inter-rater agreement was.

## 7. Human sign-off classes

Four classes of decisions are reserved for humans. The compiler emits them as `PENDING_HUMAN` rows in the ledger. The executor never runs them, never skips them, and never marks them DONE. A human flips them after doing the work.

| Class | Gate | What the human signs |
|---|---|---|
| **H1** | Plan approval | A new RQ plan and its prereg block, before compilation. Is the question worth the budget? Is the observable the right one? |
| **H2** | Verdict acceptance | The scorecard after the gate runs. Accept the verdict, file an erratum, or register a follow-up. The machine scores; the human owns the conclusion. |
| **H3** | External release | Anything leaving the lab: a paper, a review sent to authors, a public claim. Requires a clean `claim_lint` and a green `paper_sync_check` first. |
| **H4** | Governance change | Edits to stopping-rule thresholds, the monthly budget cap, gate versions, or this document. Logged with a one-line rationale. |

A `PENDING_HUMAN` row sitting open is not a bug. It is the system working.

## 8. Budget governance

Research that cannot account for its spend gets its spend taken away.

- One append-only spend ledger (JSONL), one monthly cap (`budget.monthly_cap_usd`).
- Every paid call made through lab tools records its estimated cost before the result is used.
- At or over the cap, spending tools exit politely and say so. Raising the cap is an H4 decision.
- The cap governs lab tools only. It cannot see spending that bypasses them, so do not bypass them.
