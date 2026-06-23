# Deep-Research Worked Example (fully synthetic)

Everything in this directory is invented for documentation. "Zephyrine" is a
fictional supplement. Every URL is fake (`example.invalid`) and labels itself
fake, so nothing here implies a real claim about the real world. No file comes
from a real run.

Methodology this example illustrates: `docs/DEEP_RESEARCH.md`.

## The toy question

Does the (fictional) supplement Zephyrine raise resting heart rate in healthy
adults?

## Files

| File | Pipeline phase | What it shows |
|---|---|---|
| `claims.json` | the full record | 3 sub-queries, 2 fake sources, per-claim verdicts |
| `RESEARCH_REPORT.md` | Phase 4 Synthesize | a one-page cited report in the 7-section format |

## What this example demonstrates

1. **Decompose** (Phase 1): the question splits into three sub-queries, `Q1`
   (the trial evidence), `Q2` (the mechanism), `Q3` (long-term safety).
2. **Research** (Phase 2): `Q1` and `Q2` each return one claim with a source
   URL. `Q3` returns nothing usable and is recorded as `no_sources_found`. An
   empty result is a real result, not a gap to paper over.
3. **Verify** (Phase 3): the skeptic re-reads each load-bearing claim. The
   heart-rate claim (`CQ1_1`) survives and is marked `supported`. The mechanism
   claim (`CQ2_1`) does NOT survive: it came from a secondary blog that the
   primary trial source contradicts, so it is marked `refuted`.
4. **Synthesize** (Phase 4): the report uses the supported claim in its answer,
   surfaces the mechanism contradiction instead of hiding it, lists the refuted
   claim under "what did not hold up", and reports the `Q3` gap plainly.

## The deliberate teaching points, in three lines

- **Never fabricate a citation.** `Q3` found no source, so the run records
  `no_sources_found`. It does not invent one.
- **Adversarial verify catches overstatement.** The blog's mechanism claim was
  refuted by the primary source. The pipeline surfaces the contradiction with
  both URLs, then keeps the answer to what survived.
- **Every claim carries a URL.** No source, no claim.

## Reproducing this shape on a real question

```
bin/lab_deep_research.sh "your real question here" --depth 5 --budget 4
```

or interactively: `/lab-deep-research your real question here`.

Real runs write to the config's `reviews_dir` (under `lab_home`, outside this
repo) and produce the same two file shapes you see here, with real fetched
URLs instead of the fake `example.invalid` ones.
