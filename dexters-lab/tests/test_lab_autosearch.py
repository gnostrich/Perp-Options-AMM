"""Tests for bin/lab_autosearch.py: the state-aware discovery planner.

Covers the contract the grounded lane depends on:
1. read-state on a fixture registry returns exactly the OPEN hypotheses and
   surfaces unscoped CANDIDATE rows as gaps.
2. queries derives one query per open question + track and dedupes.
3. propose appends NEW lit targets + discovery-log rows, skips duplicates,
   writes provenance, and invents NO numeric score anywhere.
4. The CLI honors --help on every subcommand without side effects.

Hermetic: DEXTERS_LAB_CONFIG points at a temp config with a temp lab_home.
"""
from __future__ import annotations

import importlib.util
import json
import os
import subprocess
import sys
from pathlib import Path

import pytest

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
BIN = ROOT / "bin" / "lab_autosearch.py"


def _load_module():
    spec = importlib.util.spec_from_file_location("lab_autosearch", BIN)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


asx = _load_module()


def make_config(tmp_path: Path) -> Path:
    home = tmp_path / "lab-home"
    cfg = {
        "lab_name": "test-lab",
        "lab_home": str(home),
        "registry_path": "{lab_home}/rq_registry.json",
        "ledger_path": "{lab_home}/TASK_LEDGER.md",
        "verdict_log_path": "{lab_home}/VERDICT_LOG.md",
        "reviews_dir": "{lab_home}/reviews",
        "drafts_dir": "{lab_home}/drafts",
        "budget": {
            "monthly_cap_usd": 40,
            "spend_ledger": "{lab_home}/spend.jsonl",
        },
    }
    path = tmp_path / "lab.config.json"
    path.write_text(json.dumps(cfg, indent=2))
    return path


def _entry(rq_id, status, title, claim, plan_path=None, track="t"):
    return {
        "rq_id": rq_id, "track": track, "source_hypothesis_id": rq_id + "-H1",
        "title": title, "claim": claim, "status": status,
        "execution_class": "offline", "effort": "S", "plan_path": plan_path,
        "prereg_sha": None, "prereg_thresholds": [], "gates": [],
        "ledger_tasks": [], "blockers": [], "notes": "",
    }


def _fixture_registry() -> dict:
    return {
        "version": "1.0",
        "updated": "2026-06-13",
        "entries": [
            _entry("R1", "CANDIDATE", "Cache hit rate predicts p95",
                   "cache hit rate has a negative effect on p95 latency"),
            _entry("R2", "RUNNING", "Reviewer agreement on labels",
                   "two reviewers agree at kappa >= 0.7",
                   plan_path="plans/r2.md"),
            _entry("R3", "VALIDATED", "Closed already",
                   "this one is closed and should not appear",
                   plan_path="plans/r3.md"),
            _entry("R4", "FALSIFIED", "Dead",
                   "this one is falsified and should not appear"),
        ],
    }


def _write_registry(tmp_path: Path, doc: dict) -> Path:
    p = tmp_path / "rq_registry.json"
    p.write_text(json.dumps(doc, indent=2))
    return p


# ----------------------------------------------------------- read-state

def test_read_state_returns_open_questions_only(tmp_path):
    reg = _write_registry(tmp_path, _fixture_registry())
    state = asx.read_state(reg, None)
    ids = {q["rq_id"] for q in state["open_questions"]}
    assert ids == {"R1", "R2"}  # VALIDATED + FALSIFIED excluded
    r1 = next(q for q in state["open_questions"] if q["rq_id"] == "R1")
    assert r1["title"] == "Cache hit rate predicts p95"
    assert "cache hit rate" in r1["claim"]


def test_read_state_surfaces_unscoped_candidate_as_gap(tmp_path):
    reg = _write_registry(tmp_path, _fixture_registry())
    state = asx.read_state(reg, None)
    # R1 is CANDIDATE with no plan -> a gap. R2 is RUNNING with a plan -> not.
    assert any(g.startswith("R1:") for g in state["gaps"])
    assert not any(g.startswith("R2:") for g in state["gaps"])


def test_read_state_records_provenance(tmp_path):
    reg = _write_registry(tmp_path, _fixture_registry())
    road = tmp_path / "ROADMAP.md"
    road.write_text("## Reflexion Spine build (next)\n\nbody\n")
    state = asx.read_state(reg, road)
    assert str(reg) in state["sources_read"]
    assert str(road) in state["sources_read"]
    assert "Reflexion Spine build" in state["active_tracks"]


def test_read_state_missing_registry_degrades(tmp_path):
    state = asx.read_state(tmp_path / "nope.json", None)
    assert state["open_questions"] == []
    assert state["gaps"] == []
    assert str(tmp_path / "nope.json") in state["sources_missing"]


def test_read_state_roadmap_headings_filtered(tmp_path):
    reg = _write_registry(tmp_path, {"version": "1.0", "updated": "2026-06-13",
                                     "entries": []})
    road = tmp_path / "ROADMAP.md"
    road.write_text(
        "## Build the router (shipped)\n"
        "## Random prose heading with no signal word\n"
        "### Phase 2 active learning\n"
    )
    state = asx.read_state(reg, road)
    assert "Build the router" in state["active_tracks"]
    assert "Phase 2 active learning" in state["active_tracks"]
    assert not any("Random prose" in t for t in state["active_tracks"])


# --------------------------------------------------------------- queries

def test_queries_one_per_open_question_and_track(tmp_path):
    reg = _write_registry(tmp_path, _fixture_registry())
    road = tmp_path / "ROADMAP.md"
    road.write_text("## Reflexion Spine build (next)\n")
    state = asx.read_state(reg, road)
    queries = asx.intentions_to_queries(state)
    rq_ids = {q["source_rq_id"] for q in queries}
    assert "R1" in rq_ids
    assert "R2" in rq_ids
    assert "roadmap" in rq_ids
    # Each query string is non-empty and mentions its motivating label.
    by_rq = {q["source_rq_id"]: q["query"] for q in queries}
    assert "p95" in by_rq["R1"]


def test_queries_dedupe_identical_text(tmp_path):
    # Two open questions with the same title must collapse to one query.
    doc = {"version": "1.0", "updated": "2026-06-13", "entries": [
        _entry("A1", "CANDIDATE", "Same Title", "claim one is long enough"),
        _entry("A2", "SCOPED", "Same Title", "claim two is long enough",
               plan_path="p.md"),
    ]}
    reg = _write_registry(tmp_path, doc)
    state = asx.read_state(reg, None)
    queries = asx.intentions_to_queries(state)
    texts = [q["query"] for q in queries]
    assert len(texts) == len(set(texts))  # no duplicate query strings
    same_title = [t for t in texts if "Same Title" in t]
    assert len(same_title) == 1


def test_queries_empty_state_yields_nothing(tmp_path):
    reg = _write_registry(tmp_path, {"version": "1.0", "updated": "2026-06-13",
                                     "entries": []})
    state = asx.read_state(reg, None)
    assert asx.intentions_to_queries(state) == []


# --------------------------------------------------------------- propose

def _discoveries_doc():
    return {"discoveries": [
        {"query": "recent prior art for: cache",
         "source_rq_id": "R1",
         "findings": [
             {"title": "Cache Paper 2026", "url": "https://arxiv.org/abs/1",
              "why_relevant": "measures the exact effect R1 tests",
              "kind": "paper"},
             {"title": "An Agent Framework", "url": "https://github.com/x/agent",
              "why_relevant": "could run the measurement",
              "kind": "agent"},
             {"title": "Latency Dataset", "url": "https://data.example/ds",
              "why_relevant": "archived p95 logs to fit on",
              "kind": "dataset"},
         ]},
    ]}


def test_propose_appends_lit_targets_and_log(tmp_path):
    disc = tmp_path / "disc.json"
    disc.write_text(json.dumps(_discoveries_doc()))
    queue = tmp_path / "lit_queue.json"
    log = tmp_path / "discoveries.jsonl"

    summary = asx.propose(disc, queue, log)

    # paper + dataset extend the lit queue; agent does not.
    qdoc = json.loads(queue.read_text())
    topics = {t["topic"] for t in qdoc["targets"]}
    assert "Cache Paper 2026" in topics
    assert "Latency Dataset" in topics
    assert "An Agent Framework" not in topics
    assert summary["queued_to_lit"] == 2

    # all three findings land in the log
    rows = [json.loads(line) for line in log.read_text().splitlines() if line]
    assert len(rows) == 3
    assert summary["logged_discoveries"] == 3


def test_propose_writes_provenance_and_no_score(tmp_path):
    disc = tmp_path / "disc.json"
    disc.write_text(json.dumps(_discoveries_doc()))
    queue = tmp_path / "lit_queue.json"
    log = tmp_path / "discoveries.jsonl"
    asx.propose(disc, queue, log)

    rows = [json.loads(line) for line in log.read_text().splitlines() if line]
    paper = next(r for r in rows if r["kind"] == "paper")
    # provenance present
    assert paper["source_rq_id"] == "R1"
    assert paper["query"] == "recent prior art for: cache"
    assert paper["why_relevant"] == "measures the exact effect R1 tests"
    assert paper["review_status"] == "candidate"
    # NO fabricated numeric score, on any row, under any common key name.
    for r in rows:
        for banned in ("score", "relevance", "relevance_score",
                       "agentic_score", "confidence"):
            assert banned not in r
        # and no stray numeric value masquerading as relevance
        assert isinstance(r["why_relevant"], str)

    # the queued targets carry the source rq_id in feeds, no score field
    qdoc = json.loads(queue.read_text())
    for t in qdoc["targets"]:
        assert t["feeds"] == "R1"
        assert "score" not in t
        assert t["status"] == "pending"
        assert t["runs"] == 0


def test_propose_dedupes_on_rerun(tmp_path):
    disc = tmp_path / "disc.json"
    disc.write_text(json.dumps(_discoveries_doc()))
    queue = tmp_path / "lit_queue.json"
    log = tmp_path / "discoveries.jsonl"

    first = asx.propose(disc, queue, log)
    second = asx.propose(disc, queue, log)

    # second run adds nothing new
    assert second["queued_to_lit"] == 0
    assert second["logged_discoveries"] == 0
    assert second["skipped_duplicate_urls"] == 3

    qdoc = json.loads(queue.read_text())
    assert len(qdoc["targets"]) == first["queued_to_lit"]  # still 2
    rows = [line for line in log.read_text().splitlines() if line]
    assert len(rows) == 3  # still 3, not doubled


def test_propose_skips_malformed_findings(tmp_path):
    doc = {"discoveries": [
        {"query": "q", "source_rq_id": "R1", "findings": [
            {"title": "", "url": "https://x", "why_relevant": "w", "kind": "paper"},
            {"title": "No URL", "url": "", "why_relevant": "w", "kind": "paper"},
            {"title": "Good", "url": "https://good", "why_relevant": "w",
             "kind": "paper"},
        ]},
    ]}
    disc = tmp_path / "disc.json"
    disc.write_text(json.dumps(doc))
    queue = tmp_path / "lit_queue.json"
    log = tmp_path / "discoveries.jsonl"
    summary = asx.propose(disc, queue, log)
    assert summary["logged_discoveries"] == 1  # only the good one
    assert summary["shape_warnings"]  # the two bad rows were flagged


def test_propose_unknown_kind_defaults_to_paper(tmp_path):
    doc = {"discoveries": [
        {"query": "q", "source_rq_id": "R1", "findings": [
            {"title": "Weird", "url": "https://w", "why_relevant": "w",
             "kind": "blogpost"},
        ]},
    ]}
    disc = tmp_path / "disc.json"
    disc.write_text(json.dumps(doc))
    queue = tmp_path / "lit_queue.json"
    log = tmp_path / "discoveries.jsonl"
    summary = asx.propose(disc, queue, log)
    # unknown kind coerced to paper -> queued to lit and logged
    assert summary["queued_to_lit"] == 1
    rows = [json.loads(line) for line in log.read_text().splitlines() if line]
    assert rows[0]["kind"] == "paper"


def test_propose_extends_existing_queue_without_clobber(tmp_path):
    queue = tmp_path / "lit_queue.json"
    queue.write_text(json.dumps({"version": 1, "targets": [
        {"id": "manual-1", "slug": "kept", "topic": "A hand-added target",
         "feeds": "RQ9", "status": "done", "last_done": "2026-06-01", "runs": 3},
    ]}))
    log = tmp_path / "discoveries.jsonl"
    disc = tmp_path / "disc.json"
    disc.write_text(json.dumps(_discoveries_doc()))
    asx.propose(disc, queue, log)
    qdoc = json.loads(queue.read_text())
    by_id = {t["id"]: t for t in qdoc["targets"]}
    # the hand-added target is preserved untouched
    assert by_id["manual-1"]["runs"] == 3
    assert by_id["manual-1"]["last_done"] == "2026-06-01"
    # new ones were appended
    assert len(qdoc["targets"]) == 3


# ------------------------------------------------------------------- CLI

def _run_cli(args, cfg_path, expect_rc=0):
    env = {**os.environ, "DEXTERS_LAB_CONFIG": str(cfg_path)}
    proc = subprocess.run(
        [sys.executable, str(BIN), *args],
        capture_output=True, text=True, env=env,
    )
    assert proc.returncode == expect_rc, \
        f"rc={proc.returncode} stdout={proc.stdout} stderr={proc.stderr}"
    return proc


def test_cli_help_top_level():
    proc = subprocess.run(
        [sys.executable, str(BIN), "--help"],
        capture_output=True, text=True,
    )
    assert proc.returncode == 0
    assert "read-state" in proc.stdout
    assert "queries" in proc.stdout
    assert "propose" in proc.stdout


def test_cli_help_each_subcommand():
    for sub in ("read-state", "queries", "propose"):
        proc = subprocess.run(
            [sys.executable, str(BIN), sub, "--help"],
            capture_output=True, text=True,
        )
        assert proc.returncode == 0, f"{sub} --help rc={proc.returncode}"
        assert "usage" in proc.stdout.lower()


def test_cli_read_state_uses_config_registry(tmp_path):
    cfg_path = make_config(tmp_path)
    home = tmp_path / "lab-home"
    home.mkdir(parents=True, exist_ok=True)
    (home / "rq_registry.json").write_text(json.dumps(_fixture_registry()))
    proc = _run_cli(["read-state"], cfg_path)
    state = json.loads(proc.stdout)
    ids = {q["rq_id"] for q in state["open_questions"]}
    assert ids == {"R1", "R2"}


def test_cli_queries_writes_out_file(tmp_path):
    cfg_path = make_config(tmp_path)
    home = tmp_path / "lab-home"
    home.mkdir(parents=True, exist_ok=True)
    (home / "rq_registry.json").write_text(json.dumps(_fixture_registry()))
    out = tmp_path / "queries.json"
    _run_cli(["queries", "--out", str(out)], cfg_path)
    doc = json.loads(out.read_text())
    assert doc["count"] == len(doc["queries"]) >= 2


def test_cli_propose_end_to_end(tmp_path):
    cfg_path = make_config(tmp_path)
    home = tmp_path / "lab-home"
    home.mkdir(parents=True, exist_ok=True)
    disc = tmp_path / "disc.json"
    disc.write_text(json.dumps(_discoveries_doc()))
    proc = _run_cli(["propose", "--discoveries", str(disc)], cfg_path)
    summary = json.loads(proc.stdout)
    assert summary["queued_to_lit"] == 2
    assert summary["logged_discoveries"] == 3
    # defaults landed under lab_home
    assert (home / "lit_queue.json").is_file()
    assert (home / "discoveries.jsonl").is_file()


def test_cli_propose_missing_file_errors(tmp_path):
    cfg_path = make_config(tmp_path)
    _run_cli(["propose", "--discoveries", str(tmp_path / "nope.json")],
             cfg_path, expect_rc=1)


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
