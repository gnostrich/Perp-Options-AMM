"""Tests for bin/rq_compile.py plus the seed registry and its schema.

Run from the repo root with: python3 -m pytest tests/test_rq_compile.py -q

Hermetic: every CLI run points DEXTERS_LAB_CONFIG at a temp config whose
lab_home is a temp directory, and compiles against a temp copy of the
seed registry. jsonschema is optional; the schema test skips without it.
"""

import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[1]
COMPILER = REPO / "bin" / "rq_compile.py"
SEED_REGISTRY = REPO / "templates" / "rq_registry.seed.json"
SCHEMA = REPO / "templates" / "rq_registry.schema.json"
LEDGER_TEMPLATE = REPO / "templates" / "TASK_LEDGER.template.md"

PLAN_TEXT = """# RQ Plan: EX-H1 cache hit rate vs p95 latency

Scope: regression over the archived demo request logs.

```prereg
hypothesis: EX-H1 cache hit rate has a negative effect on p95 latency
observable: regression slope of p95 latency on cache hit rate, with 95% CI
dataset: 100 archived demo request-log rows
rules: effect 95% CI excludes zero; R^2 >= 0.5
expected_n: 100
```

Notes: ~$0, archived data only.
"""

PREREG_RE = re.compile(r"^```prereg[ \t]*\n(.*?)^```[ \t]*$", re.M | re.S)


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


def expected_sha(plan_text):
    block = PREREG_RE.findall(plan_text)[0]
    return hashlib.sha256(block.encode("utf-8")).hexdigest()


def run_compile(config_path, plan, rq, ledger=None, registry=None, tasks=None):
    cmd = [sys.executable, str(COMPILER), "--plan", str(plan), "--rq", rq]
    if ledger is not None:
        cmd += ["--ledger", str(ledger)]
    if registry is not None:
        cmd += ["--registry", str(registry)]
    if tasks is not None:
        cmd += ["--tasks", str(tasks)]
    env = dict(os.environ)
    env["DEXTERS_LAB_CONFIG"] = str(config_path)
    return subprocess.run(cmd, capture_output=True, text=True, env=env)


@pytest.fixture
def workspace(tmp_path):
    config, cfg = make_config(tmp_path)
    registry = tmp_path / "rq_registry.json"
    shutil.copy(SEED_REGISTRY, registry)
    plan = tmp_path / "EXH1_PLAN.md"
    plan.write_text(PLAN_TEXT, encoding="utf-8")
    ledger = tmp_path / "LEDGER.md"
    return config, cfg, registry, plan, ledger


# ---------- Component A: seed registry + schema ----------

def test_seed_registry_validates_against_schema():
    jsonschema = pytest.importorskip("jsonschema")
    schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
    registry = json.loads(SEED_REGISTRY.read_text(encoding="utf-8"))
    validator = jsonschema.Draft202012Validator(schema)
    errors = sorted(validator.iter_errors(registry), key=lambda e: str(e.json_path))
    assert not errors, "\n".join(f"{e.json_path}: {e.message}" for e in errors)


def test_seed_registry_ships_only_marked_examples():
    registry = json.loads(SEED_REGISTRY.read_text(encoding="utf-8"))
    entries = registry["entries"]
    assert len(entries) == 2
    assert all(e.get("example") is True for e in entries)
    classes = sorted(e["execution_class"] for e in entries)
    assert classes == ["human_labeling", "offline"]
    # The human-gated example carries an explicit blocker.
    human = [e for e in entries if e["execution_class"] == "human_labeling"][0]
    assert human["blockers"], "human-gated example must show a blocker"
    # Fresh seed: nothing scoped, nothing hashed.
    for e in entries:
        assert e["status"] == "CANDIDATE"
        assert e["plan_path"] is None
        assert e["prereg_sha"] is None
        assert e["ledger_tasks"] == []


def test_seed_registry_has_no_personal_paths():
    text = SEED_REGISTRY.read_text(encoding="utf-8")
    assert "/Users/" not in text


# ---------- Component B: the compiler ----------

def test_compile_default_chain_rows_and_sha(workspace):
    config, _, registry, plan, ledger = workspace
    r = run_compile(config, plan, "EXAMPLE1", ledger=ledger, registry=registry)
    assert r.returncode == 0, r.stderr
    out = json.loads(r.stdout)
    assert out["prereg_sha"] == expected_sha(PLAN_TEXT)
    assert out["rows_appended"] == ["R.EXAMPLE1.1", "R.EXAMPLE1.2", "R.EXAMPLE1.3"]

    text = ledger.read_text(encoding="utf-8")
    assert "## Lane R: Research" in text
    assert "| id | task | status | deps | verify |" in text
    rows = [l for l in text.splitlines() if l.startswith("| R.EXAMPLE1.")]
    assert len(rows) == 3
    # Exact 5-cell format, TODO status, dep chain.
    cells1 = [c.strip() for c in rows[0].strip().strip("|").split("|")]
    assert len(cells1) == 5
    assert cells1[0] == "R.EXAMPLE1.1" and cells1[2] == "TODO" and cells1[3] == "-"
    cells2 = [c.strip() for c in rows[1].strip().strip("|").split("|")]
    assert cells2[3] == "R.EXAMPLE1.1"
    cells3 = [c.strip() for c in rows[2].strip().strip("|").split("|")]
    assert cells3[3] == "R.EXAMPLE1.2"

    reg = json.loads(registry.read_text(encoding="utf-8"))
    entry = [e for e in reg["entries"] if e["rq_id"] == "EXAMPLE1"][0]
    assert entry["status"] == "SCOPED"
    assert entry["plan_path"] == str(plan)
    assert entry["prereg_sha"] == expected_sha(PLAN_TEXT)
    assert entry["ledger_tasks"] == ["R.EXAMPLE1.1", "R.EXAMPLE1.2", "R.EXAMPLE1.3"]


def test_compile_explicit_tasks_json(workspace, tmp_path):
    config, _, registry, plan, ledger = workspace
    tasks = tmp_path / "tasks.json"
    tasks.write_text(json.dumps([
        {"task": "fit the regression model", "verify": "test -f fit.json"},
        {"task": "write the verdict", "verify": "test -f VERDICT.md"},
    ]), encoding="utf-8")
    r = run_compile(config, plan, "EXAMPLE1", ledger=ledger, registry=registry,
                    tasks=tasks)
    assert r.returncode == 0, r.stderr
    text = ledger.read_text(encoding="utf-8")
    assert "| R.EXAMPLE1.1 | fit the regression model | TODO | - | test -f fit.json |" in text
    assert "| R.EXAMPLE1.2 | write the verdict | TODO | R.EXAMPLE1.1 | test -f VERDICT.md |" in text


def test_sha_stable_across_recompiles(workspace, tmp_path):
    config, _, registry, plan, ledger = workspace
    r1 = run_compile(config, plan, "EXAMPLE1", ledger=ledger, registry=registry)
    sha1 = json.loads(r1.stdout)["prereg_sha"]
    registry2 = tmp_path / "registry2.json"
    shutil.copy(SEED_REGISTRY, registry2)
    r2 = run_compile(config, plan, "EXAMPLE1", ledger=tmp_path / "ledger2.md",
                     registry=registry2)
    sha2 = json.loads(r2.stdout)["prereg_sha"]
    assert sha1 == sha2 == expected_sha(PLAN_TEXT)


def test_edited_prereg_changes_sha_and_numbering_continues(workspace):
    config, _, registry, plan, ledger = workspace
    r1 = run_compile(config, plan, "EXAMPLE1", ledger=ledger, registry=registry)
    sha1 = json.loads(r1.stdout)["prereg_sha"]

    edited = PLAN_TEXT.replace("expected_n: 100", "expected_n: 200")
    plan.write_text(edited, encoding="utf-8")
    r2 = run_compile(config, plan, "EXAMPLE1", ledger=ledger, registry=registry)
    assert r2.returncode == 0, r2.stderr
    out2 = json.loads(r2.stdout)
    assert out2["prereg_sha"] != sha1
    assert out2["prereg_sha"] == expected_sha(edited)
    # Numbering continues; the new chain hangs off the old chain's tail.
    assert out2["rows_appended"] == ["R.EXAMPLE1.4", "R.EXAMPLE1.5", "R.EXAMPLE1.6"]
    text = ledger.read_text(encoding="utf-8")
    row4 = [l for l in text.splitlines() if l.startswith("| R.EXAMPLE1.4 ")][0]
    assert [c.strip() for c in row4.strip().strip("|").split("|")][3] == "R.EXAMPLE1.3"
    # Lane header appended once, not twice.
    assert text.count("## Lane R: Research") == 1
    # Registry holds the NEW sha.
    reg = json.loads(registry.read_text(encoding="utf-8"))
    entry = [e for e in reg["entries"] if e["rq_id"] == "EXAMPLE1"][0]
    assert entry["prereg_sha"] == out2["prereg_sha"]


def test_compile_fails_closed(tmp_path):
    config, _ = make_config(tmp_path)
    registry = tmp_path / "r.json"
    shutil.copy(SEED_REGISTRY, registry)
    bad = tmp_path / "bad.md"
    # Missing prereg block.
    bad.write_text("# plan with no prereg\n", encoding="utf-8")
    r = run_compile(config, bad, "EXAMPLE1", ledger=tmp_path / "l.md",
                    registry=registry)
    assert r.returncode == 1
    assert "no ```prereg" in r.stderr
    # Missing required key.
    bad.write_text(
        "```prereg\nhypothesis: EX-H1 x\nobservable: y\ndataset: z\nrules: r\n```\n",
        encoding="utf-8",
    )
    r = run_compile(config, bad, "EXAMPLE1", ledger=tmp_path / "l.md",
                    registry=registry)
    assert r.returncode == 1
    assert "expected_n" in r.stderr
    # Unknown rq_id.
    bad.write_text(PLAN_TEXT, encoding="utf-8")
    r = run_compile(config, bad, "NOPE99", ledger=tmp_path / "l.md",
                    registry=registry)
    assert r.returncode == 1
    # Hypothesis line naming a different RQ.
    r = run_compile(config, bad, "EXAMPLE2", ledger=tmp_path / "l.md",
                    registry=registry)
    assert r.returncode == 1
    assert "names neither" in r.stderr
    # Nothing was appended on any failure.
    assert not (tmp_path / "l.md").exists()


def test_compile_keeps_running_status(workspace, tmp_path):
    """Compiling a plan for a RUNNING hypothesis must not downgrade it."""
    config, _, registry, _, ledger = workspace
    reg = json.loads(registry.read_text(encoding="utf-8"))
    for e in reg["entries"]:
        if e["rq_id"] == "EXAMPLE1":
            e["status"] = "RUNNING"
    registry.write_text(json.dumps(reg, indent=2), encoding="utf-8")
    plan = tmp_path / "RUNNING_PLAN.md"
    plan.write_text(PLAN_TEXT, encoding="utf-8")
    r = run_compile(config, plan, "EXAMPLE1", ledger=ledger, registry=registry)
    assert r.returncode == 0, r.stderr
    reg = json.loads(registry.read_text(encoding="utf-8"))
    entry = [e for e in reg["entries"] if e["rq_id"] == "EXAMPLE1"][0]
    assert entry["status"] == "RUNNING"
    assert entry["prereg_sha"] is not None
    assert json.loads(r.stdout)["status_note"].startswith("kept RUNNING")


def test_invalid_registry_fails_closed_when_jsonschema_present(tmp_path):
    pytest.importorskip("jsonschema")
    config, _ = make_config(tmp_path)
    registry = tmp_path / "broken.json"
    # Valid JSON, invalid registry: entries must be a list of entry objects.
    registry.write_text(json.dumps({
        "version": "1.0",
        "updated": "2026-06-12",
        "entries": [{"rq_id": "EXAMPLE1"}],
    }), encoding="utf-8")
    plan = tmp_path / "p.md"
    plan.write_text(PLAN_TEXT, encoding="utf-8")
    r = run_compile(config, plan, "EXAMPLE1", ledger=tmp_path / "l.md",
                    registry=registry)
    assert r.returncode == 1
    assert "schema validation" in r.stderr


# ---------- Component C: config-driven defaults ----------

def test_defaults_come_from_config(workspace):
    """No --ledger / --registry: paths resolve via DEXTERS_LAB_CONFIG."""
    config, cfg, _, plan, _ = workspace
    reg_dst = Path(cfg["registry_path"])
    reg_dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(SEED_REGISTRY, reg_dst)
    r = run_compile(config, plan, "EXAMPLE1")
    assert r.returncode == 0, r.stderr
    out = json.loads(r.stdout)
    assert Path(out["ledger"]).resolve() == Path(cfg["ledger_path"]).resolve()
    assert Path(out["registry"]).resolve() == Path(cfg["registry_path"]).resolve()
    ledger_text = Path(cfg["ledger_path"]).read_text(encoding="utf-8")
    assert "| R.EXAMPLE1.1 |" in ledger_text
    reg = json.loads(reg_dst.read_text(encoding="utf-8"))
    entry = [e for e in reg["entries"] if e["rq_id"] == "EXAMPLE1"][0]
    assert entry["status"] == "SCOPED"


def test_template_ledger_header_not_duplicated(workspace):
    """Appending to a ledger seeded from the template reuses its Lane R."""
    config, _, registry, plan, ledger = workspace
    shutil.copy(LEDGER_TEMPLATE, ledger)
    r = run_compile(config, plan, "EXAMPLE1", ledger=ledger, registry=registry)
    assert r.returncode == 0, r.stderr
    text = ledger.read_text(encoding="utf-8")
    assert text.count("## Lane R: Research") == 1
    assert "| R.EXAMPLE1.1 |" in text
