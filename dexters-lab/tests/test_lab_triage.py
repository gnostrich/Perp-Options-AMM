"""Tests for bin/lab_triage.py. Hermetic: the errata queue and dedupe state
live in tmp_path and the CLI runs with DEXTERS_LAB_CONFIG pointing at a temp
lab config (temp lab_home)."""

import importlib.util
import json
import os
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
BIN = HERE.parent / "bin" / "lab_triage.py"


def _load_module():
    spec = importlib.util.spec_from_file_location("lab_triage", BIN)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


lt = _load_module()


# --------------------------------------------------------------- fixtures

# Three findings:
#  1. REFUTED, confidence 0.91, NEW            -> should queue
#  2. UPHELD,  confidence 0.95, ignored        -> never queues
#  3. REFUTED, confidence 0.88, already known  -> suppressed by state
REPORT = """# Post-publication monitor report 2026-06-13

## Findings

### 1. [REFUTED] attribution
- **Claim**: The three-part identity is original to this work.
- **Result**: An equivalent form predates it. confidence: 0.91
- **claim_status**: refuted
- **Evidence**:
  - prior result at https://example.org/prior-2019 matches line for line
- **Citations**:
  - https://example.org/prior-2019

### 2. [UPHELD] soundness
- **Claim**: The worked example recomputes correctly.
- **Result**: Recomputed today, still holds. confidence: 0.95
- **claim_status**: upheld
- **Evidence**:
  - recomputed by hand
- **Citations**:

### 3. [REFUTED] novelty
- **Claim**: Heterogeneous routing across models and agents is new.
- **Result**: MoMA (2025) already routes across both. confidence: 0.88
- **claim_status**: refuted
- **Evidence**:
  - https://example.org/moma-2025 covers the same setting
- **Citations**:
  - https://example.org/moma-2025
"""

# A finding at confidence 0.5, below the default 0.7 floor.
LOW_CONF_REPORT = """# report

## Findings

### 1. [WEAKENED] new-evidence
- **Claim**: The effect size is large.
- **Result**: A later study reports a smaller effect. confidence: 0.5
- **claim_status**: weakened
- **Evidence**:
  - https://example.org/replication weaker effect
- **Citations**:
  - https://example.org/replication
"""

# Same two refuted claims as REPORT, one stated on a 0-100 scale, the other 0-1.
SCALE_REPORT = """# report

## Findings

### 1. [REFUTED] attribution
- **Claim**: The three-part identity is original to this work.
- **Result**: Equivalent form predates it. confidence: 91%
- **claim_status**: refuted
- **Evidence**:
  - https://example.org/prior-2019
- **Citations**:
  - https://example.org/prior-2019

### 2. [REFUTED] novelty
- **Claim**: Heterogeneous routing across models and agents is new.
- **confidence**: 88
- **claim_status**: refuted
- **Evidence**:
  - https://example.org/moma-2025
- **Citations**:
  - https://example.org/moma-2025
"""


def write_report(tmp_path, text, name="report.md"):
    p = tmp_path / name
    p.write_text(text, encoding="utf-8")
    return p


def make_lab_env(tmp_path):
    """Write a temp lab config (temp lab_home) and return (env, lab_home)."""
    home = tmp_path / "lab-home"
    cfg = {
        "lab_name": "dexters-lab-test",
        "lab_home": str(home),
        "registry_path": "{lab_home}/rq_registry.json",
        "ledger_path": "{lab_home}/TASK_LEDGER.md",
        "verdict_log_path": "{lab_home}/VERDICT_LOG.md",
        "reviews_dir": "{lab_home}/reviews",
        "drafts_dir": "{lab_home}/drafts",
        "budget": {"spend_ledger": "{lab_home}/spend.jsonl"},
    }
    cfg_path = tmp_path / "lab.config.json"
    cfg_path.write_text(json.dumps(cfg), encoding="utf-8")
    env = dict(os.environ)
    env["DEXTERS_LAB_CONFIG"] = str(cfg_path)
    return env, home


def run_cli(env, *args):
    return subprocess.run([sys.executable, str(BIN)] + list(args),
                          capture_output=True, text=True, timeout=60, env=env)


# --------------------------------------------------------------- parse logic

def test_parse_report_extracts_three_findings():
    findings = lt.parse_report(REPORT)
    assert len(findings) == 3
    assert findings[0]["verdict"].upper() == "REFUTED"
    assert findings[1]["verdict"].upper() == "UPHELD"
    assert findings[2]["verdict"].upper() == "REFUTED"
    assert abs(findings[0]["confidence"] - 0.91) < 1e-9
    assert findings[0]["citations"] == ["https://example.org/prior-2019"]


def test_confidence_both_scales_parse():
    findings = lt.parse_report(SCALE_REPORT)
    # 91% from a Result line, 88 from a dedicated confidence field.
    assert abs(findings[0]["confidence"] - 0.91) < 1e-9
    assert abs(findings[1]["confidence"] - 0.88) < 1e-9


def test_actionable_floor():
    f = {"verdict": "refuted", "confidence": 0.6}
    assert not lt.actionable(f, 0.7)
    assert lt.actionable(f, 0.5)
    assert not lt.actionable({"verdict": "upheld", "confidence": 1.0}, 0.0)
    assert not lt.actionable({"verdict": "refuted", "confidence": None}, 0.0)


# --------------------------------------------------------------- queueing

def test_exactly_one_queued_with_state_seed(tmp_path):
    """3 findings: 1 new-refuted (queue), 1 upheld (ignore), 1 known (suppress)."""
    report = write_report(tmp_path, REPORT)
    queue = tmp_path / "ERRATA_QUEUE.md"
    state_path = tmp_path / "state.json"

    # Pre-seed the already-known finding (claim 3) as RESOLVED so it is suppressed.
    known_claim = "Heterogeneous routing across models and agents is new."
    h = lt.claim_hash(known_claim)
    state_path.write_text(json.dumps({
        "version": 1,
        "known": {h: {"claim_id": "ERR-seed", "status": "RESOLVED",
                      "note": "already fixed"}},
    }), encoding="utf-8")

    queued = lt.triage(report, queue, state_path, floor=0.7)
    assert len(queued) == 1
    body = queue.read_text(encoding="utf-8")
    # The new refuted attribution claim is in; upheld and known are not.
    assert "attribution" in body
    assert "claim_status:  refuted" in body
    assert "status:        OPEN" in body
    assert "Heterogeneous routing" not in body
    assert "worked example recomputes" not in body


def test_idempotent_rerun_adds_nothing(tmp_path):
    report = write_report(tmp_path, REPORT)
    queue = tmp_path / "ERRATA_QUEUE.md"
    state_path = tmp_path / "state.json"

    first = lt.triage(report, queue, state_path, floor=0.7)
    body1 = queue.read_text(encoding="utf-8")
    second = lt.triage(report, queue, state_path, floor=0.7)
    body2 = queue.read_text(encoding="utf-8")

    # First pass queues the two new refuted claims; second pass queues nothing.
    assert len(first) == 2
    assert second == []
    assert body1 == body2


def test_floor_excludes_low_confidence(tmp_path):
    report = write_report(tmp_path, LOW_CONF_REPORT)
    queue = tmp_path / "ERRATA_QUEUE.md"
    state_path = tmp_path / "state.json"

    queued = lt.triage(report, queue, state_path, floor=0.7)
    assert queued == []
    assert not queue.exists()  # nothing written when nothing queues

    # Lowering the floor below the finding's confidence queues it.
    queued2 = lt.triage(report, queue, state_path, floor=0.4)
    assert len(queued2) == 1


def test_both_scales_queue_under_default_floor(tmp_path):
    report = write_report(tmp_path, SCALE_REPORT)
    queue = tmp_path / "ERRATA_QUEUE.md"
    state_path = tmp_path / "state.json"
    queued = lt.triage(report, queue, state_path, floor=0.7)
    # 0.91 and 0.88 both clear 0.7.
    assert len(queued) == 2


def test_state_records_queued_hashes(tmp_path):
    report = write_report(tmp_path, REPORT)
    queue = tmp_path / "ERRATA_QUEUE.md"
    state_path = tmp_path / "state.json"
    lt.triage(report, queue, state_path, floor=0.7)
    state = json.loads(state_path.read_text(encoding="utf-8"))
    # Two refuted claims recorded as known + queued.
    assert len([k for k, v in state["known"].items() if v.get("queued")]) == 2


def test_dry_run_writes_nothing(tmp_path):
    report = write_report(tmp_path, REPORT)
    queue = tmp_path / "ERRATA_QUEUE.md"
    state_path = tmp_path / "state.json"
    queued = lt.triage(report, queue, state_path, floor=0.7, dry_run=True)
    assert len(queued) == 2  # reports what it WOULD queue
    assert not queue.exists()
    assert not state_path.exists()


# --------------------------------------------------------------- CLI

def test_cli_help_exits_zero():
    proc = subprocess.run([sys.executable, str(BIN), "--help"],
                          capture_output=True, text=True, timeout=60)
    assert proc.returncode == 0
    assert "lab_triage.py" in proc.stdout


def test_cli_uses_config_defaults(tmp_path):
    env, home = make_lab_env(tmp_path)
    report = write_report(tmp_path, REPORT)
    proc = run_cli(env, str(report))
    assert proc.returncode == 0
    # Defaults land in the temp lab_home.
    assert (home / "ERRATA_QUEUE.md").exists()
    assert (home / "monitor_state.json").exists()
    assert "new_queued=2" in proc.stdout


def test_cli_missing_report_is_error(tmp_path):
    env, _ = make_lab_env(tmp_path)
    proc = run_cli(env, str(tmp_path / "nope.md"))
    assert proc.returncode == 2
    assert "report not found" in proc.stderr


def test_cli_explicit_paths_and_idempotent(tmp_path):
    env, _ = make_lab_env(tmp_path)
    report = write_report(tmp_path, REPORT)
    queue = tmp_path / "q.md"
    state_path = tmp_path / "s.json"
    p1 = run_cli(env, str(report), "--queue", str(queue),
                 "--state", str(state_path), "--floor", "0.7")
    assert p1.returncode == 0
    body1 = queue.read_text(encoding="utf-8")
    p2 = run_cli(env, str(report), "--queue", str(queue),
                 "--state", str(state_path), "--floor", "0.7")
    assert p2.returncode == 0
    assert queue.read_text(encoding="utf-8") == body1
    assert "new_queued=0" in p2.stdout
