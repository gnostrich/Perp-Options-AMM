# The Deep-Research Pipeline

The lab's grounded-knowledge engine: take a question, fan out web searches,
fetch the sources, adversarially verify every load-bearing claim, and write a
cited report where each claim carries a URL. Contradictions get surfaced, not
hidden. No claim ships without a source.

This is the multi-query, multi-source cousin of two tools already in the kit.
`lab_lit` scans ONE literature target on a schedule. `lab_review` runs a deep
adversarial review of ONE document you already have. Deep research starts from
a QUESTION with no document in hand: it decomposes the question, searches the
open web for many angles, and builds the grounded answer from what it finds.

The pipeline is domain agnostic. The same five phases work on a biology
question, a market question, or a "which of these two libraries is faster"
engineering question. You supply the question and a depth. The pipeline
supplies a cited report and a machine-readable claims file with verdicts.

## What it needs to run

Deep research needs the Claude Code CLI for its two core tools, WebSearch and
WebFetch. Those tools belong to the Claude Code session, not to a Python
script. So the pipeline runs one of three ways:

1. Slash command: `/lab-deep-research <question>` inside a Claude Code session
   (see `.claude/commands/lab-deep-research.md`).
2. Headless: `bin/lab_deep_research.sh "<question>"`, which feeds the skill
   plus the question to a headless `claude -p` session.
3. Manual: fill the placeholders in
   `templates/deep_research_workflow.template.js` and pass it to a Claude Code
   Workflow call.

If the claude CLI is not on PATH, the headless entry stops with a clear error
and does nothing. There is no Python fallback for WebSearch; that is by design.

## Where things live

All paths come from the shared config loader, never from hardcoded locations.
Every tool resolves config the same way:

```python
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "lib"))
import labconfig
cfg = labconfig.ensure_home()
```

Keys the deep-research pipeline uses:

| Config key | Use |
|---|---|
| `reviews_dir` | each research run gets its own subdirectory here |
| `drafts_dir` | fallback output dir if `reviews_dir` is not wanted |
| `budget.monthly_cap_usd` | monthly spend ceiling for the whole lab |
| `budget.spend_ledger` | JSONL file; every paid run appends a line |
| `openrouter.api_key_env` | env var name holding the heavy-model API key |
| `openrouter.panel_models_preference` | ordered list of second-opinion model ids |

Drafts only. A research run writes a cited report and a claims JSON under its
output directory. It never writes to a database, never sends email or Slack,
never runs git, never deploys. The morning review stays a reading task.

## Pipeline at a glance

```
Phase 1  DECOMPOSE   one agent: question -> 3 to 8 falsifiable sub-queries
Phase 2  RESEARCH    one agent per sub-query, in parallel: search + fetch + extract
Phase 3  VERIFY      one agent per load-bearing claim, in parallel: refute it
Phase 4  SYNTHESIZE  one agent: cited report + claims.json with verdicts
```

The heavy lifting is the fan-out in Phases 2 and 3. Each sub-query gets its own
researcher so the searches run wide and fast. Each load-bearing claim gets its
own skeptic so verification is genuinely adversarial, not a rubber stamp.

## Phase 1: Decompose

Input: the question, and a DEPTH (the target number of sub-queries, 3 to 8).

One agent reads the question and breaks it into 3 to 8 sub-queries. Good
sub-queries are specific and answerable from public sources. They cover
different angles: the core mechanism, the counter-evidence, the numbers, the
edge cases, the recency. A question like "is creatine safe for the kidneys in
healthy adults" decomposes into the mechanism, the trial evidence, the dose
response, the at-risk subgroups, and the most recent reviews.

The agent also states, up front, what an answer would have to show to be true,
and what evidence would refute the leading hypothesis. That refutation target
drives Phase 3.

Output: a sub-query list (id `Q1..Qn`, the query string, why it matters, what a
good source for it looks like), plus the refutation targets.

## Phase 2: Research (fan-out search + fetch + extract)

One researcher agent per sub-query, run in parallel. Each researcher:

1. **Search**: WebSearch the sub-query. Take the top results.
2. **Filter**: drop low-quality domains; prefer primary sources (the study,
   the official doc, the original data) over aggregators.
3. **Fetch**: WebFetch the top results with a focused prompt: "extract the main
   claim about `{sub-query}` in 1 to 3 sentences, and list any cited studies
   with their URLs". One hop further is allowed: if a fetched page cites a more
   authoritative primary source, fetch that too (at most one extra fetch per
   sub-query).
4. **Extract atomic claims**: for each source, pull 1 to 3 ATOMIC, FALSIFIABLE
   claims. A claim is a sentence that could be proven wrong, like "Creatine at
   5 g/day did not change serum creatinine-adjusted eGFR in a 12-week RCT."
   Reject opinions and framing ("people should try X").
5. **Attach the URL**: every claim carries the exact URL it came from, the
   page title, and the passage it was drawn from. A claim without a URL is not
   recorded.

Hard rule: **never fabricate a citation**. If WebSearch returns nothing usable
for a sub-query, record that sub-query as `no_sources_found` and move on. An
empty result is a real result. A made-up URL is a defect that poisons the whole
report.

Deduplicate as you go: if two sources support the same claim, merge them into
one claim with two citations rather than listing the claim twice.

Output per researcher: a list of claims, each with `{id, statement, sources:
[{url, title, passage}], sub_query_id}`, plus any `no_sources_found` markers.

## Phase 3: Adversarial verify (fan-out, one skeptic per claim)

This is what separates deep research from a search summary. Every load-bearing
claim gets a skeptic agent whose job is to REFUTE it, not confirm it.

Select the load-bearing claims: the ones the report's answer rests on, the
contested ones, the surprising ones. For each, one skeptic agent in parallel:

1. **Re-read the cited passage**: does the claim actually follow from the
   source, or did the extractor overstate it? Overstatement is the most common
   defect. Downgrade the claim to what the source really says.
2. **Search for counter-evidence**: WebSearch for the opposite of the claim, for
   critiques, for failed replications, for "X does not Y". Fetch the strongest
   contradicting source you find.
3. **Check the source quality**: is it primary or an aggregator that may have
   distorted? Is it current or superseded? Is there a conflict of interest?
4. **Optional heavy second opinion**: for a claim that is load-bearing AND
   genuinely hard to adjudicate from the page text, the skeptic may get an
   independent read from a heavy open model via `bin/lab_openrouter.py ask
   <model>` (models from `openrouter.panel_models_preference`). This is
   budget-guarded and logged to the spend ledger like every other paid call. If
   the OpenRouter tool or its API key is missing, the skeptic skips this step
   and says so. It is never required.

Verdict per claim: `supported` (the source holds and no strong counter-evidence
turned up), `contested` (credible sources disagree, both cited), `refuted` (the
claim does not survive: the source was misread, superseded, or a stronger
source contradicts it), or `unverifiable` (no way to adjudicate from public
sources).

Output per skeptic: the verdict, the reasoning, the counter-evidence URL if
any, and the corrected claim text if the original overstated the source.

## Phase 4: Synthesize

One agent writes the cited report and the claims JSON. Inputs: the sub-query
list, the extracted claims, and every verdict.

Report rules:

- Every factual sentence in the body carries an inline URL to a source.
- Use only `supported` and `contested` claims in the answer. `refuted` claims
  go into a short "what did not hold up" section, with the refutation reason and
  the contradicting URL, so a reader sees what was checked and rejected.
- Surface contradictions. If two good sources disagree, say so and cite both.
  Do not pick a side silently.
- If a sub-query came back `no_sources_found`, say that plainly. Do not paper
  over a gap.
- No em dashes, no en dashes, short sentences, no filler.

Two files land in the output directory:

- `RESEARCH_REPORT.md`: the cited report. A title, the question, an answer with
  every claim sourced, a "contradictions" subsection, a "what did not hold up"
  subsection, a confidence line, and a Sources list of distinct URLs.
- `claims.json`: the machine-readable record. Every claim with its sources,
  verdict, and (if refuted) reason. Schema discipline matches the review
  pipeline's `VERDICT_SUMMARY.json`.

## The claims.json shape

```json
{
  "question": "...",
  "depth": 5,
  "sub_queries": [
    {"id": "Q1", "query": "...", "status": "answered|no_sources_found"}
  ],
  "claims": [
    {
      "id": "C1",
      "statement": "...",
      "sub_query_id": "Q1",
      "sources": [{"url": "https://...", "title": "...", "passage": "..."}],
      "verdict": "supported|contested|refuted|unverifiable",
      "verify_reason": "...",
      "counter_evidence_url": "https://... or null",
      "load_bearing": true
    }
  ],
  "contradictions": ["C3 vs C7: ..."],
  "no_sources_found": ["Q4"],
  "report_path": "...",
  "second_opinion_cost_usd": 0.0
}
```

## Budget and safety

- **Budget**: every paid call (only the optional heavy second opinion in
  Phase 3 costs money) goes through `bin/lab_budget.py`. The headless entry
  guards the monthly cap before it starts and records the run cost when it
  finishes, consumer name `deep_research`.
- **Drafts only**: report and claims JSON, nothing else. No DB, no sends, no
  git, no deploy.
- **Kill switch**: a headless run honors `<lab_home>/pause`. If that file
  exists, the run exits without doing anything.
- **Never fabricate**: the single rule that makes the output trustworthy. No
  source, no claim. Record `no_sources_found` instead.

## Worked example

`examples/deep-research-example/` holds a fully synthetic run: a toy question,
three sub-queries, two clearly-labeled fake sources, one claim marked refuted on
verify, and a one-page cited report. Everything there is invented for
documentation. The URLs are fake and labeled fake, so nothing implies a real
claim about the real world. It exists to show the file shapes, not to teach the
toy topic.
