---
description: Run the Dexter's Lab deep-review pipeline on a paper or technical document
argument-hint: <paper-path> [domain] [--venue "..."] [--budget USD] [--slug name]
---

# /lab-review: deep adversarial review

Run the lab's flagship deep-review pipeline on the document at the path given
in the arguments. Full methodology: `docs/REVIEW_PIPELINE.md` in this repo.
Read it before running if anything below is unclear.

Arguments: `$ARGUMENTS`

## Step 1: parse arguments and resolve config

- First token: the paper path. It must exist; if it does not, stop with a
  clear error.
- Optional second token (not starting with `--`): the domain, one line, e.g.
  "AMM mechanism design". Default: infer it from the paper's abstract and say
  which you inferred.
- `--venue "..."`: the standards bar. Default: "a strong peer-reviewed venue
  in this field".
- `--budget USD`: hard panel cap. Default 8.
- `--slug name`: output directory name. Default:
  `review-<paper basename, lowercased, non-alphanumerics to dashes>-<YYYYMMDD>`.

Resolve the lab config with the shared loader (run from the repo root):

```bash
python3 -c "
import sys, pathlib
sys.path.insert(0, 'lib')
import labconfig, json
cfg = labconfig.ensure_home()
print(json.dumps({k: cfg.get(k) for k in ('reviews_dir', 'budget', 'openrouter')}))
"
```

Set `OUTDIR = <reviews_dir>/<slug>` and `mkdir -p` it. If the paper is a PDF,
also produce a plain-text extraction to a temp file for grep (try
`pdftotext`; if unavailable, skip and note it). The text copy is grep-only;
math must be read from the original pages.

Confidentiality: everything about the reviewed paper goes under OUTDIR, which
lives in lab_home outside this repo. Write nothing about the paper into the
repo.

## Step 2: run the pipeline

Preferred path: the Workflow tool.

1. Read `templates/review_workflow.template.js` from this repo.
2. Replace the placeholders: `__PAPER_PATH__`, `__PAPER_TXT__`, `__OUTDIR__`,
   `__DOMAIN__`, `__VENUE__`, `__REPO_ROOT__` (this repo's absolute path),
   `__PANEL_BUDGET_USD__`, and `__PANEL_MODELS__` (comma-separated, from
   `cfg["openrouter"]["panel_models_preference"]`).
3. Run the filled script as a Workflow. Do not edit the prompts or schemas
   beyond the placeholders.

Fallback path (no Workflow tool available): run the same five phases with
subagents (the Task tool), same prompts and structured-output schemas as the
template, in this order:

1. **Extract**: two parallel subagents (claims ledger, system spec). Collect
   both JSON outputs into one context blob.
2. **Attack**: four parallel subagents (math re-derivation, domain mechanism,
   novelty with live WebSearch/WebFetch, verification and results standards),
   each given the context blob.
3. **Verify**: one subagent runs the open-model panel per the template's
   Verify prompt: select 3-6 load-bearing claims, write self-contained
   prompts ending with the VERDICT/CONFIDENCE footer, write
   `panel/lab_baseline.json` before any call, run `bin/lab_openrouter.py`
   per claim x model with per-call `.txt` + `.cost.json`, harvest grep-first,
   retry truncated calls only under the remaining budget. If the OpenRouter
   tool or its API key is missing, write `panel/SKIPPED.md` and continue with
   an empty panel.
4. **Synthesize**: one subagent writes `OUTDIR/REFEREE_REPORT.md` (8 sections
   per the template) and `OUTDIR/VERDICT_SUMMARY.json` with exactly:
   `recommendation, confidence, soundness_verdicts, fatal_issues,
   major_issues, novelty_verdict, panel_cost_usd, reconciliation_note`.
5. **Critique**: one subagent spot-checks the report against the source
   document and writes `OUTDIR/CRITIC_NOTES.md`. If it finds contradictions,
   fix the report before finishing.

Ops rules that bind in both paths:

- Inject context as size-capped JSON strings; point agents at file paths for
  anything large. Never paste the paper into a prompt.
- Every subagent's final action is its structured output.
- The panel budget is hard. Sum `.cost.json` costs before any retry. Append
  each paid call as a JSON line to `cfg["budget"]["spend_ledger"]`.

## Step 3: report back

When the pipeline finishes, print:

- the recommendation and confidence from `VERDICT_SUMMARY.json`
- the top findings (fatal first, then major)
- panel cost in USD (0 if skipped, and say it was skipped)
- the critic's one-paragraph verdict
- the paths: `REFEREE_REPORT.md`, `VERDICT_SUMMARY.json`, `CRITIC_NOTES.md`

If the critic flagged the review as not publishable as-is, say so first and
list what must be fixed.
