# Auto-Search: state-aware discovery

Auto-Search reads the lab's current state, works out what the lab *should* be
searching for, and proposes new work. It never invents a relevance number.

The literature lane (`lab_lit.sh`) scans a fixed queue you maintain by hand.
Auto-Search fills the gap above it: it looks at your open research questions and
your roadmap, derives discovery queries from them, runs a grounded web pass, and
feeds the results back as new lit-queue targets and logged candidates. The queue
stops being a thing you have to keep topping up by hand.

## Two parts

1. **The planner** (`bin/lab_autosearch.py`, stdlib, deterministic). Reads
   state, derives queries, and proposes new rows. Needs no CLI and no money.
2. **The grounded step** (`bin/lab_autosearch.sh`, optional). Runs one headless
   `claude -p` web pass per derived query, collects findings, and calls the
   planner's `propose`. Spends money, so it is budget-guarded and pausable.

Without the claude CLI the planner still runs. `read-state` and `queries` work
on their own. Only the grounded discovery step is skipped.

## How it composes

```
lab_autosearch  ->  lit_queue.json  ->  lab_lit (deep read)  ->  registry CANDIDATE
   (find)             (queued)            (drafts a memo)          (rq_compile scopes it)
       \                                                                |
        \-> discoveries.jsonl (candidate log, prose relevance)          v
                                                              lab_executor (runs it)
                                                                        |
                                                                        v
                                                              stopping_gate (verdict)
```

Auto-Search sits at the front. It does not draft, score, or run anything. It
points the deep-read lane at the right targets and logs everything else it found
so a human can promote it later.

## The no-fabricated-scores rule

This is load-bearing. A one-line web snippet does not justify a confidence
number, so Auto-Search never writes one. Every discovery is recorded with:

- the prose `why_relevant` the model returned (relevance as words, not a score),
- full provenance (the query that found it and the `source_rq_id` that
  motivated that query),
- `review_status: "candidate"`.

There is no `score`, no `relevance`, no `agentic_score` field anywhere in the
output. Promotion to a scored entry is a separate step done by a human or by a
later run with real structured inputs. Inventing a number from a snippet is
exactly the made-up confidence the lab forbids.

## State sources

`read-state` reads, in order, degrading gracefully when one is missing:

| Source | Where | What it yields |
|--------|-------|----------------|
| RQ registry | `cfg registry_path` (default `<lab_home>/rq_registry.json`) | one `open_question` per OPEN hypothesis (status CANDIDATE / SCOPED / RUNNING / PARTIAL), with rq_id, title, claim |
| Registry gaps | same file | CANDIDATE rows with no `plan_path` yet: unscoped work that needs prior art |
| Roadmap | `--roadmap`, `cfg autosearch.roadmap_path`, or `env LAB_AUTOSEARCH_ROADMAP` | one `active_track` per H2/H3 heading that signals a build thread |

A missing registry or roadmap does not raise. It just produces fewer queries,
and the run records which sources it could and could not read.

## Commands

```bash
# What is the lab building right now? (CurrentIntentions JSON)
bin/lab_autosearch.py read-state

# Derive deduped discovery queries from that state. Each carries its source_rq_id.
bin/lab_autosearch.py queries

# Point at a roadmap for active-track queries too.
bin/lab_autosearch.py queries --roadmap ROADMAP.md --out queries.json

# Propose: append new lit targets + discovery-log rows from a grounded run.
bin/lab_autosearch.py propose --discoveries discoveries.json
```

The grounded end-to-end pass (derive -> search -> propose), money-spending:

```bash
bin/lab_autosearch.sh          # no arguments; any argument prints usage and exits
```

Schedule it the same way as the literature lane (see `templates/`). It honors
the kill switch (`touch <lab_home>/pause`) and the monthly budget cap.

## Query shape

`queries` emits one query per open question and one per active track, deduped on
the normalized query text:

```json
{
  "generated": "2026-06-13",
  "count": 2,
  "queries": [
    {"query": "recent prior art and methods for: cache hit rate predicts p95 latency",
     "source_rq_id": "EXAMPLE1"},
    {"query": "recent papers, agents, and tools relevant to: Reflexion Spine build",
     "source_rq_id": "roadmap"}
  ]
}
```

`source_rq_id` traces a discovery back to the state that motivated it: a real
`rq_id`, `"roadmap"` for a track-derived query, or `"gap"` for an unscoped
candidate.

## Discoveries shape (input to `propose`)

The grounded step produces, per query:

```json
{
  "discoveries": [
    {
      "query": "recent prior art and methods for: ...",
      "source_rq_id": "EXAMPLE1",
      "findings": [
        {"title": "A 2026 method paper",
         "url": "https://arxiv.org/abs/...",
         "why_relevant": "directly measures the effect this RQ tests",
         "kind": "paper"}
      ]
    }
  ]
}
```

`kind` is one of `paper | agent | tool | dataset`. `propose`:

- extends `lit_queue.json` with `paper` and `dataset` findings (the deep-read
  lane material), in the exact `lit_queue` format, deduped by topic and slug;
- logs every finding to `<lab_home>/discoveries.jsonl` with provenance, deduped
  by url;
- writes no numeric score, anywhere.

Re-running `propose` on the same discoveries file is safe: duplicates are
skipped by topic (queue) and by url (log).
