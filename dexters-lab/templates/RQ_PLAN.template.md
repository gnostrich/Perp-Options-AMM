# RQ Plan: {RQ_ID} {short title}

One plan file per research question. Copy this template, fill every
section, then compile it into the ledger:

    bin/rq_compile.py --plan <this file> --rq {RQ_ID}

## Question

What you want to know, in one or two sentences.

## Hypothesis

The falsifiable claim. It must match the registry entry's `claim`.

## Pre-registration

The fenced block below is the frozen registration. bin/rq_compile.py
extracts it, hashes the exact text between the fence lines (sha-256,
utf-8), and writes that sha into the registry. Editing one character
changes the sha; bin/stopping_gate.py then refuses to score results
against the stale registration (exit 4).

Block rules, enforced fail-closed by the compiler:
- Exactly one block per plan. It opens with a line that is exactly
  ` ```prereg ` and closes with a line that is exactly ` ``` `.
- Inside: one `key: value` pair per line. Blank lines and lines
  starting with `#` are ignored.
- Required keys: hypothesis, observable, dataset, rules, expected_n.
- The hypothesis line must name the rq_id or the source hypothesis id.

```prereg
hypothesis: {RQ_ID} one-line falsifiable hypothesis naming the rq_id
observable: the quantity you will measure, with units
dataset: where the data comes from and its expected size
rules: numeric stopping thresholds, semicolon-separated
expected_n: 100
```

## Method

How the measurement runs: instruments to build, fitting procedure,
strata, and the exact command that reproduces the result.

## Stopping rules

Score against the 5 universal rules (thresholds come from
lab.config.json `stopping_rules`; defaults shown):

1. Effect 95% CI excludes zero.
2. R^2 >= 0.5.
3. Per-stratum effect spread <= 3x.
4. Measurement instrument precision >= 0.85 on gold.
5. Inter-rater agreement Cohen's kappa >= 0.7 (where applicable).

Pass all applicable rules: VALIDATED. Rule 1 holds but another fails:
PARTIAL. Rule 1 fails: FALSIFIED. The verdict comes from
bin/stopping_gate.py, never from prose.

## Cost and wall-clock

Expected spend (USD) and elapsed time. Note anything calendar-bound.

## Honesty notes

Known limits up front: agent-labeled vs human-labeled data, proxy
observables, confounds you cannot rule out.
