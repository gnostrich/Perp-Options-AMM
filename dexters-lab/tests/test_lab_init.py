"""Tests for bin/lab_init.py.

Run from the repo root with: python3 -m pytest tests/test_lab_init.py -q

Hermetic: every run points DEXTERS_LAB_CONFIG at a temp config whose
lab_home is a temp directory. Covers: tree creation, seed copies,
idempotency (never overwrites), the status table, and an end-to-end
init -> compile pass over the seeded files.
"""

import json
import os
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
LAB_INIT = REPO / "bin" / "lab_init.py"
COMPILER = REPO / "bin" / "rq_compile.py"

PLAN_TEXT = """# RQ Plan: EX-H1 cache hit rate vs p95 latency

```prereg
hypothesis: EX-H1 cache hit rate has a negative effect on p95 latency
observable: regression slope with 95% CI
dataset: 100 archived demo rows
rules: effect 95% CI excludes zero; R^2 >= 0.5
expected_n: 100
```
"""


def make_config(tmp_path):
    """Write a hermetic lab config under tmp_path. Returns (path, cfg)."""
    home = tmp_path / "lab_home"
    cfg = {
        "lab_name": "test-lab",
        "lab_home": str(home),
        "registry_path": str(home / "rq_registry.json"),
        "ledger_path": str(home / "TASK_LEDGER.md"),
        "verdict_log_path": str(home / "VERDICT_LOG.md"),
        "reviews_dir": str(home / "reviews"),
        "drafts_dir": str(home / "drafts"),
        "stopping_rules": {},
        "budget": {"monthly_cap_usd": 1, "spend_ledger": str(home / "spend.jsonl")},
        "milestone_hook": None,
        "python": "python3",
    }
    p = tmp_path / "lab.config.json"
    p.write_text(json.dumps(cfg))
    return p, cfg


def run_init(config_path):
    env = dict(os.environ)
    env["DEXTERS_LAB_CONFIG"] = str(config_path)
    return subprocess.run(
        [sys.executable, str(LAB_INIT)],
        capture_output=True,
        text=True,
        env=env,
    )


def test_first_run_creates_tree_and_seeds(tmp_path):
    config, cfg = make_config(tmp_path)
    proc = run_init(config)
    assert proc.returncode == 0, proc.stderr
    # Directory tree from labconfig.ensure_home.
    assert Path(cfg["reviews_dir"]).is_dir()
    assert Path(cfg["drafts_dir"]).is_dir()
    # Seeded files.
    registry = Path(cfg["registry_path"])
    ledger = Path(cfg["ledger_path"])
    plan_template = Path(cfg["lab_home"]) / "RQ_PLAN.template.md"
    assert registry.is_file()
    assert ledger.is_file()
    assert plan_template.is_file()
    # Status table mentions the items, paths, and "created".
    assert "created" in proc.stdout
    assert str(registry) in proc.stdout
    assert str(ledger) in proc.stdout
    assert str(plan_template) in proc.stdout
    assert cfg["lab_home"] in proc.stdout
    # Verdict log is NOT pre-created; the stopping gate writes it.
    assert not Path(cfg["verdict_log_path"]).exists()


def test_seeded_registry_is_empty_plus_examples(tmp_path):
    config, cfg = make_config(tmp_path)
    run_init(config)
    registry = json.loads(Path(cfg["registry_path"]).read_text(encoding="utf-8"))
    assert registry["version"]
    assert registry["updated"]
    entries = registry["entries"]
    assert len(entries) == 2
    assert all(e.get("example") is True for e in entries)
    assert sorted(e["execution_class"] for e in entries) == [
        "human_labeling", "offline",
    ]


def test_seeded_ledger_has_format_rules_and_empty_lane_r(tmp_path):
    config, cfg = make_config(tmp_path)
    run_init(config)
    text = Path(cfg["ledger_path"]).read_text(encoding="utf-8")
    assert "TODO | IN_PROGRESS | DONE | BLOCKED | FAILED | PENDING_HUMAN" in text
    assert "PENDING_HUMAN" in text
    assert "verify" in text
    assert "## Lane R: Research" in text
    assert "| id | task | status | deps | verify |" in text
    # Empty table: no R.* rows yet.
    assert not [l for l in text.splitlines() if l.startswith("| R.")]


def test_seeded_plan_template_shows_prereg_fence(tmp_path):
    config, cfg = make_config(tmp_path)
    run_init(config)
    text = (Path(cfg["lab_home"]) / "RQ_PLAN.template.md").read_text(encoding="utf-8")
    assert "```prereg" in text
    for key in ("hypothesis:", "observable:", "dataset:", "rules:", "expected_n:"):
        assert key in text


def test_idempotent_never_overwrites(tmp_path):
    config, cfg = make_config(tmp_path)
    assert run_init(config).returncode == 0
    # The lab does real work: registry gains an entry marker, ledger a row.
    registry = Path(cfg["registry_path"])
    edited = registry.read_text(encoding="utf-8").replace(
        '"version": "1.0"', '"version": "1.0-edited"'
    )
    registry.write_text(edited, encoding="utf-8")
    ledger = Path(cfg["ledger_path"])
    with open(ledger, "a", encoding="utf-8") as f:
        f.write("| R.X.1 | hand row | TODO | - | true |\n")
    proc = run_init(config)
    assert proc.returncode == 0, proc.stderr
    assert "exists (kept)" in proc.stdout
    assert "created" not in proc.stdout
    assert '"version": "1.0-edited"' in registry.read_text(encoding="utf-8")
    assert "| R.X.1 |" in ledger.read_text(encoding="utf-8")


def test_init_then_compile_end_to_end(tmp_path):
    """The seeded lab_home is immediately usable by rq_compile defaults."""
    config, cfg = make_config(tmp_path)
    assert run_init(config).returncode == 0
    plan = tmp_path / "EXH1_PLAN.md"
    plan.write_text(PLAN_TEXT, encoding="utf-8")
    env = dict(os.environ)
    env["DEXTERS_LAB_CONFIG"] = str(config)
    proc = subprocess.run(
        [sys.executable, str(COMPILER), "--plan", str(plan), "--rq", "EXAMPLE1"],
        capture_output=True,
        text=True,
        env=env,
    )
    assert proc.returncode == 0, proc.stderr
    out = json.loads(proc.stdout)
    assert out["rows_appended"] == ["R.EXAMPLE1.1", "R.EXAMPLE1.2", "R.EXAMPLE1.3"]
    text = Path(cfg["ledger_path"]).read_text(encoding="utf-8")
    # Template's Lane R section is reused, not duplicated.
    assert text.count("## Lane R: Research") == 1
    assert "| R.EXAMPLE1.1 |" in text
    reg = json.loads(Path(cfg["registry_path"]).read_text(encoding="utf-8"))
    entry = [e for e in reg["entries"] if e["rq_id"] == "EXAMPLE1"][0]
    assert entry["status"] == "SCOPED"
    assert entry["prereg_sha"]
