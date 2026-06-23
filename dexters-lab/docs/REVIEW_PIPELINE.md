# The Deep-Review Pipeline

The lab's flagship capability: a full-depth adversarial review of an external
paper or technical document. Five phases, four attack angles, a heavy
open-model verification panel with a hard budget, a referee-report synthesis,
and a completeness critic that re-checks the result against the source.

The pipeline is domain agnostic. It has been run on a mechanism-design
submission for a top crypto-finance venue, but nothing in the method depends
on that domain. You supply the paper, the domain label, and a budget. The
pipeline supplies the verdict.

## Where things live

All paths come from the shared config loader, never from hardcoded locations.
Every tool resolves config the same way:

```python
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "lib"))
import labconfig
cfg = labconfig.ensure_home()
```

Keys the review pipeline uses:

| Config key | Use |
|---|---|
| `reviews_dir` | every review gets its own subdirectory here |
| `budget.monthly_cap_usd` | monthly spend ceiling for the whole lab |
| `budget.spend_ledger` | JSONL file; every paid call appends a line |
| `openrouter.api_key_env` | env var name holding the panel API key |
| `openrouter.panel_models_preference` | ordered list of panel model ids |

Confidentiality rule: papers under review are often anonymous submissions.
All review material stays under `reviews_dir` (which lives in `lab_home`,
outside the repo). Never commit a reviewed paper's content, claims, or
verdicts into this repository.

## Pipeline at a glance

```
Phase 1  EXTRACT     two parallel agents: claims ledger + system spec
Phase 2  ATTACK      four parallel agents: math, domain, novelty, verification
Phase 3  VERIFY      heavy open-model panel on the load-bearing claims
Phase 4  SYNTHESIZE  one senior agent writes the referee report + verdict JSON
Phase 5  CRITIQUE    completeness critic re-checks the report against the source
```

Three ways to run it:

1. Slash command: `/lab-review <paper-path> [domain]` (see
   `.claude/commands/lab-review.md`).
2. Headless: `bin/lab_review.sh <paper-path> --domain "..."`.
3. Manual: fill the placeholders in
   `templates/review_workflow.template.js` and pass it to a Claude Code
   Workflow call.

## Phase 0: intake

Before any agent runs:

- Pick an output directory: `<reviews_dir>/<slug>/` where the slug names the
  paper and the date. Create it first.
- If the paper is a PDF, also produce a plain-text extraction (for example
  `pdftotext` or a Read-and-dump pass) next to it in a temp location. Text
  extraction mangles math. The text copy is for grep only. Any disputed
  equation must be read from the original pages.
- Decide the panel budget. Default is a small fraction of
  `budget.monthly_cap_usd` (the reference run spent under 5 USD on 15 panel
  calls plus retries).

## Phase 1: extract

Two agents run in parallel, both against the source document, both returning
the same structured shape (the extract schema below). Two extractors beat
one: the claims ledger optimizes for coverage, the system spec optimizes for
letting attackers work without re-reading the paper.

**Extractor A, claims ledger.** Reads the entire document including
appendices. Enumerates every distinct technical claim: definitions that do
real work, identities, theorems, mechanism rules, economic or applied
assertions, verification claims, empirical claims. Each claim gets:

- `id`: C1..Cn, stable for the rest of the pipeline
- `statement`: a faithful paraphrase
- `where`: section and page
- `kind`: `definition | identity | theorem | mechanism | economic | verification | empirical`
- `evidence`: what backs it: `derivation | formal-proof | numerical-example | data | prose | none`
- `load_bearing`: boolean; does the paper's contribution rest on it

It also writes a `results_audit`: one precise paragraph on what results the
paper actually has. Theorems? Simulations? Data? Only derivations plus one
worked example? Reviewers anchor on this later, so it must be exact. And a
`notable` list: anonymity breadcrumbs, missing sections, ordering quirks,
notation problems.

**Extractor B, system spec.** Reconstructs the mechanism or system precisely
enough that attackers never need the source again: the objects, the governing
equations (5 to 8, listed as claims with `kind=identity`), the update rules,
the lifecycle, the exact wording of any formal-verification claims (quoted
verbatim), and the numbers from any worked example.

The two outputs are serialized to one JSON context blob that every later
agent receives.

### Extract schema

```json
{
  "summary": "string",
  "claims": [
    { "id": "C1", "statement": "...", "where": "Sec 3 p4",
      "kind": "identity", "evidence": "derivation", "load_bearing": true }
  ],
  "results_audit": "string",
  "notable": ["string"]
}
```

## Phase 2: attack (four angles, parallel)

Four agents run in parallel. Each receives the extracted context, the source
path, and one angle. Each returns the same attack schema. Adversarial but
fair: the goal is the truth about the paper, not a takedown.

### Angle 1: formal / math re-derivation

Re-derive every load-bearing identity and theorem from scratch. By hand, and
with a CAS where one is available (try `python3 -c "import sympy"`; if absent,
hand algebra with explicit steps). Must include:

- substitute the stated update rules into the claimed invariants and simplify
  fully; do not accept "by construction"
- verify any closed-form formula on the paper's own worked example
- run every dimensional check the paper claims
- for any biconditional, derive both directions, and check counterexample
  arithmetic
- flag everything that only holds under unstated assumptions (a parameter
  held constant during an update, no fees, continuity, sign conditions,
  domain restrictions, poles)

The reasoning field must contain the actual algebra. "Looks right" is not a
verdict.

### Angle 2: domain-mechanism attack

This is the angle parameterized by `DOMAIN`. The attacker asks: would this
survive contact with its real environment? Generic checklist, instantiated
per domain:

- adversaries: who can game the mechanism, and how (manipulation, wash
  behavior, last-mover dynamics, oracle or input poisoning)
- counterparties: who bleeds when the system is mispriced or miscalibrated;
  is participating ever rational for each role
- external benchmarks: the paper may prove internal consistency only; compare
  against the external market, ground truth, or incumbent systems
- operational realities the model omits: costs, discreteness, latency, fees,
  failure modes
- incentive analysis: payoff profiles for every participant class

This angle is allowed live search (WebSearch / WebFetch) for the external
literature it needs to make the comparison concrete.

### Angle 3: novelty and prior art (live search)

Mandatory live search. Establish the closest 5 to 8 prior works and the
genuine delta. Procedure:

- search each contribution claim's key phrases, plus the obvious adjacent
  framings the authors might not cite
- search the venue's recent years for the same topic
- if the paper claims formal verification, search how prior work in the field
  handles mechanized proofs, to judge whether that angle is itself novel
- check double-blind integrity: project names, filenames, artifact links, or
  phrasing that deanonymizes the authors
- for each prior work: what it does, the exact overlap, what this paper adds
  beyond it

Verdict per contribution claim: `novel | incremental | known`. Write the full
dossier to `<outdir>/prior_art_dossier.md` with URLs for every source.

### Angle 4: verification and results-standards audit

Two parts.

Part 1, formal-verification claims (if any): read the verification statements
word by word. Determine exactly which statements are formalized, what they
quantify over, whether the formalization covers the system's dynamics or only
static algebra, whether the artifact is available and checkable by a
reviewer, and state precisely what is and is not certified. A machine-checked
algebraic identity proves the algebra, not the semantics around it.

Part 2, results standards: audit what a program-committee member at the
target venue expects against what exists. For each expected result class
(simulations, real-data evaluation, cost analysis, comparison against
incumbents, ablations, incentive analysis): confirm or refute its absence by
reading the document, and rate how fatal each absence is for that venue. Also
audit the limitations section: what do the authors concede, and what known
issue is missing from it.

### Attack schema

```json
{
  "angle": "string",
  "verdicts": [
    { "claim_id": "C3",
      "verdict": "holds | holds-with-caveats | gap | error | cannot-evaluate",
      "reasoning": "the actual derivation or argument, not a vibe",
      "severity": "fatal | major | minor | none" }
  ],
  "findings": ["issues not tied to one claim"],
  "strengths": ["string"],
  "questions_for_authors": ["string"]
}
```

## Phase 3: verify (heavy open-model panel)

Independent verification of the load-bearing claims by strong open models
through OpenRouter, under a hard budget. The point is independence: models
that share none of the session's context re-derive the contested math from a
self-contained prompt.

### Claim selection and prompts

- Select 3 to 6 claims: load-bearing, contested or fatal-if-wrong, and
  checkable from a self-contained statement.
- For each, write `panel/prompt_claim<X>.txt`: a self-contained prompt with
  the minimal mechanism context, the exact claim, and the task ("recompute
  everything yourself; do not take the paper's word for any step").
- Every prompt ends with the protocol footer, verbatim:

```
End your answer with exactly two lines:
VERDICT: VERIFIED | REFUTED | INCONCLUSIVE
CONFIDENCE: <integer 0-100>
```

- Before launching the panel, write `panel/lab_baseline.json`: the lab's own
  internal verdict per claim (`{"claimA": {"title", "lab_verdict",
  "expected_panel_if_agree"}, ...}`). Committing the baseline first makes
  panel disagreement informative instead of retrofitted.

### Running the panel

Models come from `cfg["openrouter"]["panel_models_preference"]` (3 models is
the proven shape). The runner is a small shell script written into
`panel/run_panel.sh` that loops claims x models:

- each call: `bin/lab_openrouter.py ask <model> --max-tokens 12000 <
  panel/prompt_claimX.txt > panel/claimX__<model_slug>.txt
  2> panel/claimX__<model_slug>.cost.json`
- model slug: replace `/` with `_` in the model id
- idempotent: skip any output file that already exists non-empty, so re-runs
  only fill gaps
- launch calls in parallel and `wait`

The OpenRouter client prints the model text to stdout and a one-line JSON
metadata object (tokens, `cost_usd`, `finish_reason`) to stderr, which is why
the redirection above captures cost per call for free.

If the OpenRouter tool is missing or the key env var named by
`cfg["openrouter"]["api_key_env"]` is unset, do not fail the review. Write
`panel/SKIPPED.md` explaining why, set the panel cost to 0, and proceed. The
referee report must then say the panel did not run.

### Budget

The panel has a hard cap (the `PANEL_BUDGET_USD` parameter; pick it well
under `budget.monthly_cap_usd`). Enforcement is at harvest time: sum
`cost_usd` across all `.cost.json` files before launching any retry, and skip
retries once the sum reaches the cap. Append every call's cost as a JSON line
to `cfg["budget"]["spend_ledger"]`.

### Harvesting (run as its own agent)

The harvest is deliberately a separate, small-context step:

1. Read `lab_baseline.json` and only the heads of the prompt files (first 40
   lines) to know what each claim is.
2. Parse every `claim*__*.txt` with a parser script
   (`panel/parse_panel.py`): regex out the `VERDICT:` and `CONFIDENCE:`
   lines. The parser must tolerate markdown bold around the verdict and must
   skip menu-echo lines (any line containing two or more of the verdict
   words is the prompt's own menu being echoed, not a verdict).
3. For outputs with no parseable verdict line, read that file's tail only and
   judge the verdict from its conclusion; mark it `parsed_by=human`.
4. For truncated outputs (`finish_reason: length`) or missing files, re-run
   just those calls with a higher `--max-tokens`, named
   `claimX__<model>__retry.txt`, under the remaining budget.
5. Sum total cost, build the panel table, list panel-vs-baseline
   disagreements, and adjudicate each split with one short argument.

Hard rules for the harvester: do not re-read the paper; do not load whole
model outputs into context when the verdict line suffices (grep first); end
with the structured-output call.

### Verify schema

```json
{
  "panel_table": [
    { "claim_id": "claimA", "model": "string", "verdict": "VERIFIED",
      "confidence": 95, "key_argument": "string" }
  ],
  "total_cost_usd": 0.0,
  "disagreements": ["string"],
  "adjudication": "string"
}
```

## Phase 4: synthesize (referee report)

One agent acts as the senior program-committee member. Inputs: the extraction
context, the four attack results, and the panel result, all injected as
sliced JSON (see ops lessons). It writes two files.

**`<outdir>/REFEREE_REPORT.md`**, in this order:

1. Paper summary (one paragraph, fair).
2. What the paper actually delivers (the results audit).
3. Soundness: per-claim verdict table (claim, internal verdict, panel
   verdict, final), then prose on the real problems, with the derivations
   that matter inlined briefly.
4. Novelty: closest prior art with names and years, and the genuine delta or
   lack of it.
5. Significance: would this survive its real environment; the strongest
   objections.
6. Formal verification: what it certifies and what it does not (omit if the
   paper makes no such claim).
7. Recommendation: `accept | weak accept | weak reject | reject`, confidence
   1 to 5, and the 3 changes that would most improve the paper.
8. Questions for authors: merged across attackers, deduplicated, ranked.

Every quantitative statement in the report must trace to an attack or panel
finding.

**`<outdir>/VERDICT_SUMMARY.json`**, exactly these keys:

```json
{
  "recommendation": "reject",
  "confidence": 4,
  "soundness_verdicts": { "C1": "holds", "C3": "error" },
  "fatal_issues": ["string"],
  "major_issues": ["string"],
  "novelty_verdict": "string",
  "panel_cost_usd": 0.0,
  "reconciliation_note": "optional: how internal and panel verdicts were reconciled"
}
```

## Phase 5: critique (completeness critic)

A final agent spot-checks the finished report against the source document
directly. It must:

1. Re-read the paper's worked example and one disputed derivation itself, and
   check the report describes them accurately.
2. Find any section of the paper (limitations, related work, appendices) not
   covered by any reviewer.
3. Find report claims unsupported by the actual source text (misquotes,
   invented page references).
4. Check verdict-severity consistency: does the recommendation follow from
   the listed issues?
5. Steelman check: is there a reading under which a flagged issue is actually
   fine? Fairness is part of completeness.

Output: `missing`, `weak_or_unverified`, `contradictions`, and a one-paragraph
verdict on whether the review is publishable to the authors as-is. Write the
notes to `<outdir>/CRITIC_NOTES.md`. If the critic finds contradictions, fix
the report before delivering it; the critic is a gate, not decoration.

## Output contract

A finished review directory looks like this:

```
<reviews_dir>/<slug>/
  REFEREE_REPORT.md          the deliverable
  VERDICT_SUMMARY.json       machine-readable verdict (keys above)
  CRITIC_NOTES.md            phase 5 output
  prior_art_dossier.md       angle 3 dossier with URLs
  verify_*.py                any re-derivation scripts the math attacker wrote
  panel/
    prompt_claim{A..}.txt    self-contained panel prompts
    lab_baseline.json        internal verdicts, written before the panel ran
    run_panel.sh             idempotent claims-x-models runner
    parse_panel.py           verdict/confidence parser
    claimX__<model>.txt      raw model outputs (plus __retry variants)
    claimX__<model>.cost.json  per-call cost metadata
```

## Ops lessons (paid for, do not relearn)

1. **Keep injected context small.** Pass downstream agents
   `JSON.stringify(...)` slices with explicit character caps (the reference
   run used 110k for extraction context, 140k for attack results). Point
   agents at file paths for anything bigger. Never paste the paper itself
   into a prompt; agents read it from disk with page ranges.
2. **Harvest pattern for panel outputs.** Run the heavy panel as detached
   shell jobs that write raw `.txt` plus `.cost.json` per call. Let a later,
   fresh agent parse them grep-first. An agent that runs the panel and holds
   all outputs in context will blow its window before it can summarize.
3. **Structured-output discipline.** Tell every agent explicitly: "your final
   action MUST be the structured-output call." Agents that end on prose, or
   that write their files and stop, stall the whole workflow. Repeat the
   reminder inside long prompts, not just at the top.
4. **Idempotent runners.** The panel script skips non-empty outputs. Re-runs
   after a partial failure then cost only the missing calls.
5. **Retry truncated calls individually.** Check `finish_reason` in the cost
   JSON. Retry only the truncated claim-model pairs, with a higher token cap,
   named `__retry`, and only while under budget.
6. **Per-call cost capture.** Redirect the client's stderr metadata to a
   `.cost.json` next to each output. The harvester sums these; budget
   enforcement needs no extra bookkeeping.
7. **Text extraction lies about math.** Keep the text copy for grep. Read the
   original pages for every equation that matters.
8. **Two extractors beat one.** Claims ledger for coverage; system spec so
   attackers do not each re-read the whole paper.
9. **Parsers must skip menu echoes.** Model outputs quote the verdict menu
   back. A line with two or more verdict words is a menu, not a verdict.
10. **Baseline before panel.** Write the lab's internal verdicts to disk
    before any panel output exists. Disagreement is only meaningful if the
    baseline could not have been adjusted after the fact.

## Worked example

A fully synthetic worked example (toy paper with one deliberate algebra
error, claims ledger, one attack verdict, verdict summary, referee report)
lives at `examples/review-example/`. None of it comes from a real review.
