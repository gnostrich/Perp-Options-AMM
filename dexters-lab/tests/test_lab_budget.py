"""Tests for bin/lab_budget.py: the shared spend ledger + governor.

Hermetic: every test points DEXTERS_LAB_CONFIG at a temp config whose
lab_home (and so spend ledger) lives under tmp_path. The live machine
config and any real ledger are never touched.
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
BIN = ROOT / "bin" / "lab_budget.py"


def _load_module():
    spec = importlib.util.spec_from_file_location("lab_budget", BIN)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


lb = _load_module()


def make_config(tmp_path: Path, cap_usd: float = 40) -> Path:
    """Write a full temp lab config and return its path."""
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
            "monthly_cap_usd": cap_usd,
            "spend_ledger": "{lab_home}/spend.jsonl",
        },
        "openrouter": {"api_key_env": "OPENROUTER_API_KEY"},
    }
    path = tmp_path / "lab.config.json"
    path.write_text(json.dumps(cfg, indent=2))
    return path


@pytest.fixture()
def hermetic(tmp_path, monkeypatch):
    """Point the loader at a temp config; clear the cap env override."""
    cfg_path = make_config(tmp_path)
    monkeypatch.setenv("DEXTERS_LAB_CONFIG", str(cfg_path))
    monkeypatch.delenv(lb.CAP_ENV, raising=False)
    return tmp_path


def _ledger(tmp_path: Path) -> Path:
    return tmp_path / "lab-home" / "spend.jsonl"


# ------------------------------------------------------------- budget math

def test_empty_ledger_is_zero(hermetic):
    assert lb.month_to_date() == 0.0
    ok, mtd = lb.check_budget()
    assert ok is True and mtd == 0.0


def test_record_then_mtd_reflects(hermetic):
    lb.record_spend("openrouter", 1.25, {"model": "test/model"})
    lb.record_spend("lab_executor", 0.75, None)
    mtd = lb.month_to_date()
    assert abs(mtd - 2.0) < 1e-9, mtd
    rows = [json.loads(x) for x in _ledger(hermetic).read_text().splitlines()]
    assert rows[0]["consumer"] == "openrouter" and rows[0]["cost_usd"] == 1.25
    assert rows[0]["model"] == "test/model"
    assert rows[0]["ts"].startswith(lb._current_month())


def test_meta_cannot_clobber(hermetic):
    lb.record_spend("evil", 0.10,
                    {"cost_usd": 999, "consumer": "spoof", "ts": "1999-01"})
    row = json.loads(_ledger(hermetic).read_text().splitlines()[0])
    assert row["cost_usd"] == 0.10 and row["consumer"] == "evil"
    assert not row["ts"].startswith("1999")


def test_other_month_lines_not_counted(hermetic):
    led = _ledger(hermetic)
    led.parent.mkdir(parents=True, exist_ok=True)
    with led.open("a") as fh:
        fh.write(json.dumps({"ts": "2001-01-01T00:00:00Z",
                             "consumer": "old", "cost_usd": 500.0}) + "\n")
    lb.record_spend("now", 1.0)
    assert lb.month_to_date() == 1.0


def test_garbage_lines_are_skipped(hermetic):
    led = _ledger(hermetic)
    led.parent.mkdir(parents=True, exist_ok=True)
    led.write_text("not json at all\n\n")
    lb.record_spend("now", 2.5)
    assert lb.month_to_date() == 2.5


def test_over_cap_blocks(hermetic):
    lb.record_spend("big", 85.0)
    ok, mtd = lb.check_budget(cap_usd=80)
    assert ok is False and mtd == 85.0
    ok2, _ = lb.check_budget(cap_usd=100)
    assert ok2 is True


def test_cap_zero_halts(hermetic):
    ok, mtd = lb.check_budget(cap_usd=0)
    assert ok is False and mtd == 0.0


# --------------------------------------------------------- cap resolution

def test_cap_from_config(hermetic, monkeypatch):
    # the temp config sets monthly_cap_usd=40
    assert lb._resolve_cap(None) == 40.0


def test_env_overrides_config_cap(hermetic, monkeypatch):
    monkeypatch.setenv(lb.CAP_ENV, "5.5")
    assert lb._resolve_cap(None) == 5.5
    lb.record_spend("x", 6.0)
    ok, _ = lb.check_budget()
    assert ok is False  # 6.0 >= 5.5 env cap, even though config cap is 40


def test_explicit_arg_beats_env(hermetic, monkeypatch):
    monkeypatch.setenv(lb.CAP_ENV, "10")
    assert lb._resolve_cap(7) == 7.0


def test_bad_env_cap_falls_back_to_config(hermetic, monkeypatch):
    monkeypatch.setenv(lb.CAP_ENV, "not-a-number")
    assert lb._resolve_cap(None) == 40.0


# ----------------------------------------------------------------- CLI

def _run_cli(args, cfg_path, extra_env=None, expect_rc=0):
    env = {**os.environ, "DEXTERS_LAB_CONFIG": str(cfg_path)}
    env.pop(lb.CAP_ENV, None)
    if extra_env:
        env.update(extra_env)
    proc = subprocess.run(
        [sys.executable, str(BIN), *args],
        capture_output=True, text=True, env=env,
    )
    assert proc.returncode == expect_rc, \
        f"rc={proc.returncode} stdout={proc.stdout} stderr={proc.stderr}"
    return proc


def test_cli_record_status_guard(tmp_path):
    cfg_path = make_config(tmp_path, cap_usd=10)

    out = _run_cli(["record", "lab_lit", "3.25", '{"rc": 0}'], cfg_path).stdout
    row = json.loads(out)
    assert row["consumer"] == "lab_lit" and row["cost_usd"] == 3.25
    assert row["rc"] == 0

    status = json.loads(_run_cli(["status"], cfg_path).stdout)
    assert status["mtd_usd"] == 3.25
    assert status["cap_usd"] == 10
    assert status["remaining_usd"] == 6.75
    assert status["ok"] is True
    assert status["ledger_exists"] is True

    # under cap: guard passes
    _run_cli(["guard"], cfg_path, expect_rc=0)

    # push over cap: guard halts with rc 1
    _run_cli(["record", "lab_executor", "7.00"], cfg_path)
    proc = _run_cli(["guard"], cfg_path, expect_rc=1)
    assert "HALT" in proc.stderr


def test_cli_guard_honors_env_cap(tmp_path):
    cfg_path = make_config(tmp_path, cap_usd=100)
    _run_cli(["record", "x", "2.0"], cfg_path)
    # config cap 100 passes, env cap 1 halts
    _run_cli(["guard"], cfg_path, expect_rc=0)
    _run_cli(["guard"], cfg_path, extra_env={lb.CAP_ENV: "1"}, expect_rc=1)


def test_cli_record_usage_error(tmp_path):
    cfg_path = make_config(tmp_path)
    _run_cli(["record", "only-consumer"], cfg_path, expect_rc=2)


def test_cli_unknown_command(tmp_path):
    cfg_path = make_config(tmp_path)
    _run_cli(["bogus"], cfg_path, expect_rc=2)


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
