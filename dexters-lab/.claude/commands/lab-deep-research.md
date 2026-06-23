---
description: Run the Dexter's Lab deep-research pipeline on a question (fan-out web search, fetch, adversarially verify, synthesize a cited report)
argument-hint: <question> [--depth N] [--budget USD] [--slug name]
---

# /lab-deep-research: grounded deep research

Take a question, fan out web searches, fetch the sources, adversarially verify
every load-bearing claim, and write a cited report where each claim carries a
URL. Full methodology: `docs/DEEP_RESEARCH.md` in this repo. Read it before
running if anything below is unclear.

Arguments: `$ARGUMENTS`

## Step 1: parse arguments and resolve config

- The question is the argument text minus any `--flag` tokens. If no question
  is present, ask the user for one and stop. Do not invent a question.
- `--depth N`: target number of sub-queries, 3 to 8. Default 5. Clamp to
  [3, 8].
- `--budget USD`: hard cap for the optional heavy second opinion in the verify
  phase. Default 4.
- `--slug name`: output directory name. Default:
  `deepres-<question, lowercased, first ~6 words, non-alphanumerics to
  dashes>-<YYYYMMDD>`.

Resolve the lab config with the shared loader (run from the repo root):

```bash
python3 -c "
import sys, pathlib
sys.path.insert(0, 'lib')
import labconfig, json
cfg = labconfig.ensure_home()
print(json.dumps({k: cfg.get(k) for k in ('reviews_dir', 'drafts_dir', 'budget', 'openrouter')}))
"
```

Set `OUTDIR = <reviews_dir>/<slug>` and `mkdir -p` it. If the user would rather
the report land in drafts, use `<drafts_dir>/<slug>` instead. Drafts only:
everything goes under OUTDIR. No DB writes, no sends, no git, no deploy.

Before you start, check the kill switch: if `<lab_home>/pause` exists, stop and
say the lab is paused.

## Step 2: run the pipeline

Preferred path: the Workflow tool.

1. Read `templates/deep_research_workflow.template.js` from this repo.
2. Replace the placeholders: `__QUESTION__`, `__OUTDIR__`, `__DEPTH__`,
   `__REPO_ROOT__` (this repo's absolute path), `__PANEL_BUDGET_USD__`, and
   `__PANEL_MODELS__` (comma-separated, from
   `cfg["openrouter"]["panel_models_preference"]`).
3. Run the filled script as a Workflow. Do not edit the prompts or schemas
   beyond the placeholders.

Fallback path (no Workflow tool available): run the same four phases with
subagents (the Task tool), same prompts and structured-output schemas as the
template, in this order:

1. **Decompose**: one subagent breaks the question into 3 to 8 falsifiable
   sub-queries (id `Q1..Qn`, the query, why it matters, a good-source
   description), plus what a true answer must show and what would refute the
   leading answer. It does not search yet.
2. **Research**: one subagent PER sub-query, in parallel. Each one: WebSearch
   the sub-query, prefer primary sources, WebFetch the top results (one extra
   hop allowed to a cited primary source), extract 1 to 3 atomic falsifiable
   claims, attach the exact URL + title + passage to each. If search returns
   nothing usable, return `status: no_sources_found`. Never fabricate a URL.
3. **Verify**: one subagent PER load-bearing claim, in parallel. Each skeptic
   tries to REFUTE the claim: re-read the cited passage (downgrade if the
   extractor overstated it), WebSearch the opposite and fetch the strongest
   contradiction, judge source quality. Optional heavy second opinion via
   `bin/lab_openrouter.py ask <model>` only for genuinely hard claims, under
   the remaining budget; if the tool or its API key is missing, skip it and
   say so. Verdict: `supported | contested | refuted | unverifiable`.
4. **Synthesize**: one subagent writes `OUTDIR/RESEARCH_REPORT.md` (question,
   answer with every sentence sourced, contradictions, what did not hold up,
   gaps, confidence, sources) and `OUTDIR/claims.json` with exactly:
   `question, depth, sub_queries, claims, contradictions, no_sources_found,
   report_path, second_opinion_cost_usd`.

Ops rules that bind in both paths:

- Inject context as size-capped JSON strings; point agents at file paths for
  anything large.
- Every subagent's final action is its structured output.
- **Never fabricate a citation.** No source, no claim. Record
  `no_sources_found` instead.
- Use only `supported` and `contested` claims in the answer. Put `refuted`
  claims in the "what did not hold up" section with their reason.
- Surface contradictions; cite both sides. Do not pick a side silently.
- The second-opinion budget is hard. Append each paid call as a JSON line to
  `cfg["budget"]["spend_ledger"]`.

## Step 3: report back

When the pipeline finishes, print:

- the one-line answer
- the claim counts: supported / contested / refuted / unverifiable
- any sub-queries that came back `no_sources_found`
- the heavy second-opinion cost in USD (0 if skipped, and say it was skipped)
- the paths: `RESEARCH_REPORT.md`, `claims.json`

If every load-bearing claim came back `refuted` or `unverifiable`, say so first:
the question could not be answered from public sources, which is itself a
result.
