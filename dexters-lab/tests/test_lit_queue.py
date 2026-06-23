"""Tests for bin/lit_queue.py and templates/lit_queue.seed.json.

Covers what the scheduled literature lane depends on:
1. The seed template validates clean and ships 2 generic example targets.
2. Round-robin selection + rotation is correct, as Python functions and
   through the CLI (next / rotate / seed / validate).
3. The default queue path resolves to <lab_home>/lit_queue.json through
   the shared config loader.

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
BIN = ROOT / "bin" / "lit_queue.py"
SEED = ROOT / "templates" / "lit_queue.seed.json"


def _load_module():
    spec = importlib.util.spec_from_file_location("lit_queue", BIN)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


lq = _load_module()


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


def _fresh_queue() -> dict:
    return {
        "version": 1,
        "targets": [
            {"id": "a", "slug": "slug-a", "topic": "topic a", "feeds": "RQ1",
             "status": "pending", "last_done": None, "runs": 0},
            {"id": "b", "slug": "slug-b", "topic": "topic b", "feeds": "RQ2",
             "status": "pending", "last_done": None, "runs": 0},
            {"id": "c", "slug": "slug-c", "topic": "topic c", "feeds": "RQ3",
             "status": "pending", "last_done": None, "runs": 0},
        ],
    }


# ------------------------------------------------------- seed template shape

def test_seed_template_validates_clean():
    data = lq.load_queue(SEED)
    assert lq.validate_queue(data) == []


def test_seed_template_has_two_generic_targets():
    data = lq.load_queue(SEED)
    targets = data["targets"]
    assert len(targets) == 2
    for t in targets:
        assert t["status"] == "pending"
        assert t["last_done"] is None
        assert t["runs"] == 0


# ------------------------------------------------------------ validate_queue

def test_validate_rejects_non_dict():
    assert lq.validate_queue([]) == ["top level is not a JSON object"]


def test_validate_rejects_bad_version():
    data = _fresh_queue()
    data["version"] = 2
    assert "version must be 1" in lq.validate_queue(data)


def test_validate_rejects_empty_targets():
    assert "targets list is empty" in lq.validate_queue(
        {"version": 1, "targets": []})


def test_validate_rejects_missing_field():
    data = _fresh_queue()
    del data["targets"][0]["topic"]
    errors = lq.validate_queue(data)
    assert any("topic must be a non-empty string" in e for e in errors)


def test_validate_rejects_duplicate_id():
    data = _fresh_queue()
    data["targets"][1]["id"] = "a"
    assert any("id duplicate" in e for e in lq.validate_queue(data))


def test_validate_rejects_duplicate_slug():
    data = _fresh_queue()
    data["targets"][1]["slug"] = "slug-a"
    assert any("slug duplicate" in e for e in lq.validate_queue(data))


def test_validate_rejects_bad_status():
    data = _fresh_queue()
    data["targets"][0]["status"] = "running"
    assert any("status must be one of" in e for e in lq.validate_queue(data))


def test_validate_rejects_bad_date():
    data = _fresh_queue()
    data["targets"][0]["last_done"] = "2026/06/12"
    assert any("last_done must be null or YYYY-MM-DD" in e
               for e in lq.validate_queue(data))


def test_validate_rejects_bad_runs():
    data = _fresh_queue()
    data["targets"][0]["runs"] = -1
    assert any("runs must be an integer >= 0" in e
               for e in lq.validate_queue(data))


def test_validate_rejects_bool_runs():
    # bool is an int subclass; the validator must reject it explicitly.
    data = _fresh_queue()
    data["targets"][0]["runs"] = True
    assert any("runs must be an integer >= 0" in e
               for e in lq.validate_queue(data))


# --------------------------------------------------- optional jsonschema

def test_jsonschema_check_skips_when_unavailable(monkeypatch):
    monkeypatch.setitem(sys.modules, "jsonschema", None)
    status, messages = lq.jsonschema_check(_fresh_queue())
    assert status == "skipped"
    assert any("skipped" in m for m in messages)


def test_jsonschema_check_when_available():
    pytest.importorskip("jsonschema")
    status, _ = lq.jsonschema_check(_fresh_queue())
    assert status == "ok"
    bad = _fresh_queue()
    bad["targets"][0]["runs"] = -1
    status_bad, _ = lq.jsonschema_check(bad)
    assert status_bad == "invalid"


# ------------------------------------------------- pick_next / rotate

def test_pick_next_prefers_never_run_lowest_index():
    assert lq.pick_next(_fresh_queue())["id"] == "a"


def test_pick_next_none_on_empty():
    assert lq.pick_next({"targets": []}) is None
    assert lq.pick_next({}) is None


def test_rotate_marks_done_and_increments():
    data = _fresh_queue()
    updated = lq.rotate(data, "a", "2026-06-12")
    assert updated["status"] == "done"
    assert updated["last_done"] == "2026-06-12"
    assert updated["runs"] == 1


def test_rotate_unknown_id_returns_none():
    assert lq.rotate(_fresh_queue(), "nope", "2026-06-12") is None


def test_round_robin_full_cycle():
    """Three nights run a, b, c in order; the fourth wraps back to a."""
    data = _fresh_queue()
    picks = []
    for date in ["2026-06-12", "2026-06-13", "2026-06-14", "2026-06-15"]:
        nxt = lq.pick_next(data)
        picks.append(nxt["id"])
        lq.rotate(data, nxt["id"], date)
    assert picks == ["a", "b", "c", "a"]
    by_id = {t["id"]: t for t in data["targets"]}
    assert by_id["a"]["runs"] == 2
    assert by_id["b"]["runs"] == 1
    assert by_id["c"]["runs"] == 1


def test_oldest_last_done_wins_after_all_run():
    data = _fresh_queue()
    lq.rotate(data, "a", "2026-06-12")
    lq.rotate(data, "b", "2026-06-13")
    lq.rotate(data, "c", "2026-06-14")
    assert lq.pick_next(data)["id"] == "a"


# ------------------------------------------------------ save/load/seed

def test_save_load_round_trip(tmp_path):
    data = _fresh_queue()
    path = tmp_path / "q.json"
    lq.save_queue(path, data)
    assert lq.load_queue(path) == data


def test_save_is_atomic_leaves_no_tmp(tmp_path):
    path = tmp_path / "q.json"
    lq.save_queue(path, _fresh_queue())
    assert list(tmp_path.glob("*.tmp")) == []


def test_seed_queue_creates_and_respects_existing(tmp_path):
    path = tmp_path / "q.json"
    assert lq.seed_queue(path, SEED) is True
    assert lq.validate_queue(lq.load_queue(path)) == []
    # mutate, then confirm a second seed does NOT overwrite
    data = lq.load_queue(path)
    lq.rotate(data, data["targets"][0]["id"], "2026-06-12")
    lq.save_queue(path, data)
    assert lq.seed_queue(path, SEED) is False
    assert lq.load_queue(path)["targets"][0]["runs"] == 1
    # force overwrites back to the pristine template
    assert lq.seed_queue(path, SEED, force=True) is True
    assert lq.load_queue(path)["targets"][0]["runs"] == 0


def test_seed_queue_rejects_invalid_template(tmp_path):
    bad_template = tmp_path / "bad_seed.json"
    bad = _fresh_queue()
    bad["version"] = 9
    bad_template.write_text(json.dumps(bad))
    with pytest.raises(ValueError):
        lq.seed_queue(tmp_path / "q.json", bad_template)


# ----------------------------------------------------------------- CLI

def _run_cli(args, cfg_path, expect_rc=0):
    env = {**os.environ, "DEXTERS_LAB_CONFIG": str(cfg_path)}
    proc = subprocess.run(
        [sys.executable, str(BIN), *args],
        capture_output=True, text=True, env=env,
    )
    assert proc.returncode == expect_rc, \
        f"rc={proc.returncode} stdout={proc.stdout} stderr={proc.stderr}"
    return proc


def test_cli_next_and_rotate(tmp_path):
    cfg_path = make_config(tmp_path)
    path = tmp_path / "q.json"
    lq.save_queue(path, _fresh_queue())

    first = json.loads(_run_cli(["next", "--queue", str(path)], cfg_path).stdout)
    assert first["id"] == "a"

    _run_cli(["rotate", "a", "--queue", str(path), "--date", "2026-06-12"],
             cfg_path)

    after = lq.load_queue(path)
    rotated = next(t for t in after["targets"] if t["id"] == "a")
    assert rotated["status"] == "done"
    assert rotated["last_done"] == "2026-06-12"
    assert rotated["runs"] == 1

    second = json.loads(_run_cli(["next", "--queue", str(path)], cfg_path).stdout)
    assert second["id"] == "b"


def test_cli_rotate_rejects_bad_date(tmp_path):
    cfg_path = make_config(tmp_path)
    path = tmp_path / "q.json"
    lq.save_queue(path, _fresh_queue())
    _run_cli(["rotate", "a", "--queue", str(path), "--date", "nope"],
             cfg_path, expect_rc=2)


def test_cli_next_rejects_invalid_queue(tmp_path):
    cfg_path = make_config(tmp_path)
    path = tmp_path / "bad.json"
    bad = _fresh_queue()
    bad["version"] = 9
    lq.save_queue(path, bad)
    _run_cli(["next", "--queue", str(path)], cfg_path, expect_rc=1)


def test_cli_validate_ok_on_seed_template(tmp_path):
    cfg_path = make_config(tmp_path)
    proc = _run_cli(["validate", "--queue", str(SEED)], cfg_path)
    assert "OK" in proc.stdout


def test_cli_seed_defaults_to_lab_home(tmp_path):
    """Without --queue, seed lands at <lab_home>/lit_queue.json."""
    cfg_path = make_config(tmp_path)
    proc = _run_cli(["seed"], cfg_path)
    assert "seeded" in proc.stdout
    queue = tmp_path / "lab-home" / "lit_queue.json"
    assert queue.is_file()
    assert lq.validate_queue(lq.load_queue(queue)) == []
    # second seed run leaves the existing queue alone
    proc2 = _run_cli(["seed"], cfg_path)
    assert "already exists" in proc2.stdout


def test_cli_next_uses_lab_home_default(tmp_path):
    cfg_path = make_config(tmp_path)
    _run_cli(["seed"], cfg_path)
    nxt = json.loads(_run_cli(["next"], cfg_path).stdout)
    assert nxt["id"] == "example-prior-art"


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
