"""Tests for bin/stopping_gate.py.

Run from the repo root with: python3 -m pytest tests/test_stopping_gate.py -q

Hermetic: every CLI run points DEXTERS_LAB_CONFIG at a temp config whose
lab_home is a temp directory. Covers: each rule's pass/fail boundary,
not_applicable handling, config-driven thresholds, verdict mapping, CLI
exit codes, scorecard file placement, the pre-registration refusal path
(explicit and config-default registry), the verdict-log side effect, and
the milestone hook (configured, failing, unconfigured, suppressed).
"""

import importlib.util
import json
import os
import subprocess
import sys
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[1]
GATE_PATH = REPO / "bin" / "stopping_gate.py"

spec = importlib.util.spec_from_file_location("stopping_gate", GATE_PATH)
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)


def make_config(tmp_path, **overrides):
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
        "stopping_rules": {
            "rule1_ci_excludes_zero": True,
            "rule2_r2_min": 0.5,
            "rule3_stratum_spread_max": 3.0,
            "rule4_instrument_precision_min": 0.85,
            "rule5_kappa_min": 0.7,
        },
        "budget": {"monthly_cap_usd": 1, "spend_ledger": str(home / "spend.jsonl")},
        "milestone_hook": None,
        "python": "python3",
    }
    cfg.update(overrides)
    p = tmp_path / "lab.config.json"
    p.write_text(json.dumps(cfg))
    return p, cfg


def make_input(**overrides):
    """A baseline input that scores VALIDATED on all 5 rules."""
    data = {
        "rq_id": "test-rq",
        "claim": "test claim",
        "effect": {"name": "alpha", "point": 5.0, "ci_low": 2.0, "ci_high": 8.0},
        "r2": 0.9,
        "strata": [
            {"name": "a", "effect": 10.0},
            {"name": "b", "effect": 20.0},
        ],
        "instrument": {"precision": 0.95, "kappa": 0.85},
        "prereg_sha": None,
        "sources": ["/dev/null"],
        "notes": "synthetic",
    }
    data.update(overrides)
    return data


def score_dict(**overrides):
    return gate.score(gate.validate_input(make_input(**overrides)))


def run_cli(input_path, config_path, *extra):
    env = dict(os.environ)
    env["DEXTERS_LAB_CONFIG"] = str(config_path)
    return subprocess.run(
        [sys.executable, str(GATE_PATH), "score", str(input_path), *extra],
        capture_output=True,
        text=True,
        env=env,
    )


def write_input(tmp_path, name="input.json", **overrides):
    p = tmp_path / name
    p.write_text(json.dumps(make_input(**overrides)))
    return p


# ---------------------------------------------------------------------------
# rule1: effect 95% CI excludes zero
# ---------------------------------------------------------------------------

def test_rule1_positive_ci_passes():
    sc = score_dict(effect={"name": "e", "point": 1, "ci_low": 0.001, "ci_high": 5})
    assert sc["rules"]["rule1"]["status"] == "pass"


def test_rule1_negative_ci_passes():
    sc = score_dict(effect={"name": "e", "point": -3, "ci_low": -5, "ci_high": -1})
    assert sc["rules"]["rule1"]["status"] == "pass"


def test_rule1_ci_touching_zero_fails():
    sc = score_dict(effect={"name": "e", "point": 2, "ci_low": 0.0, "ci_high": 5})
    assert sc["rules"]["rule1"]["status"] == "fail"


def test_rule1_ci_straddling_zero_fails_and_falsifies():
    sc = score_dict(effect={"name": "e", "point": 1, "ci_low": -1, "ci_high": 2})
    assert sc["rules"]["rule1"]["status"] == "fail"
    assert sc["verdict"] == "FALSIFIED"


# ---------------------------------------------------------------------------
# rule2: r2 >= threshold
# ---------------------------------------------------------------------------

def test_rule2_boundary_passes_at_exactly_half():
    sc = score_dict(r2=0.5)
    assert sc["rules"]["rule2"]["status"] == "pass"


def test_rule2_just_below_fails():
    sc = score_dict(r2=0.499)
    assert sc["rules"]["rule2"]["status"] == "fail"
    assert sc["verdict"] == "PARTIAL"


def test_rule2_null_is_not_applicable():
    sc = score_dict(r2=None)
    assert sc["rules"]["rule2"]["status"] == "not_applicable"
    assert sc["verdict"] == "VALIDATED"


# ---------------------------------------------------------------------------
# rule3: per-stratum spread <= threshold
# ---------------------------------------------------------------------------

def test_rule3_spread_exactly_3x_passes():
    sc = score_dict(strata=[{"name": "a", "effect": 1.0}, {"name": "b", "effect": 3.0}])
    assert sc["rules"]["rule3"]["status"] == "pass"
    assert sc["rules"]["rule3"]["value"] == pytest.approx(3.0)


def test_rule3_spread_above_3x_fails():
    sc = score_dict(strata=[{"name": "a", "effect": 1.0}, {"name": "b", "effect": 3.01}])
    assert sc["rules"]["rule3"]["status"] == "fail"
    assert sc["verdict"] == "PARTIAL"


def test_rule3_negative_same_sign_uses_magnitudes():
    sc = score_dict(strata=[{"name": "a", "effect": -2.0}, {"name": "b", "effect": -4.0}])
    assert sc["rules"]["rule3"]["status"] == "pass"
    assert sc["rules"]["rule3"]["value"] == pytest.approx(2.0)


def test_rule3_mixed_signs_fail():
    sc = score_dict(
        strata=[
            {"name": "a", "effect": 1.0},
            {"name": "b", "effect": 1.5},
            {"name": "c", "effect": -1.0},
        ]
    )
    assert sc["rules"]["rule3"]["status"] == "fail"
    assert "mixed signs" in sc["rules"]["rule3"]["note"]


def test_rule3_single_stratum_not_applicable():
    sc = score_dict(strata=[{"name": "a", "effect": 1.0}])
    assert sc["rules"]["rule3"]["status"] == "not_applicable"


def test_rule3_empty_strata_not_applicable():
    sc = score_dict(strata=[])
    assert sc["rules"]["rule3"]["status"] == "not_applicable"
    assert sc["verdict"] == "VALIDATED"


# ---------------------------------------------------------------------------
# rule4: instrument precision >= threshold
# ---------------------------------------------------------------------------

def test_rule4_boundary_passes_at_085():
    sc = score_dict(instrument={"precision": 0.85, "kappa": 0.85})
    assert sc["rules"]["rule4"]["status"] == "pass"


def test_rule4_just_below_fails():
    sc = score_dict(instrument={"precision": 0.849, "kappa": 0.85})
    assert sc["rules"]["rule4"]["status"] == "fail"
    assert sc["verdict"] == "PARTIAL"


def test_rule4_null_precision_not_applicable():
    sc = score_dict(instrument={"precision": None, "kappa": 0.85})
    assert sc["rules"]["rule4"]["status"] == "not_applicable"


# ---------------------------------------------------------------------------
# rule5: Cohen's kappa >= threshold (not_applicable when null)
# ---------------------------------------------------------------------------

def test_rule5_boundary_passes_at_07():
    sc = score_dict(instrument={"precision": 0.95, "kappa": 0.7})
    assert sc["rules"]["rule5"]["status"] == "pass"


def test_rule5_just_below_fails():
    sc = score_dict(instrument={"precision": 0.95, "kappa": 0.699})
    assert sc["rules"]["rule5"]["status"] == "fail"
    assert sc["verdict"] == "PARTIAL"


def test_rule5_null_kappa_not_applicable_and_can_validate():
    sc = score_dict(instrument={"precision": 0.95, "kappa": None})
    assert sc["rules"]["rule5"]["status"] == "not_applicable"
    assert sc["verdict"] == "VALIDATED"
    # 4 applicable (rule5 dropped), all pass
    assert sc["rules_passed"] == "4/4"


def test_all_not_applicable_except_rule1_still_validates():
    sc = score_dict(
        r2=None,
        strata=[],
        instrument={"precision": None, "kappa": None},
    )
    assert sc["verdict"] == "VALIDATED"
    assert sc["rules_passed"] == "1/1"


# ---------------------------------------------------------------------------
# verdict mapping and rules_passed accounting
# ---------------------------------------------------------------------------

def test_rule1_failure_dominates_even_with_other_failures():
    sc = score_dict(
        effect={"name": "e", "point": 0.5, "ci_low": -1, "ci_high": 2},
        r2=0.1,
    )
    assert sc["verdict"] == "FALSIFIED"


def test_rules_passed_counts_applicable_only():
    sc = score_dict(r2=0.2, instrument={"precision": 0.95, "kappa": None})
    # applicable: rule1 pass, rule2 fail, rule3 pass, rule4 pass -> 3/4
    assert sc["rules_passed"] == "3/4"
    assert sc["verdict"] == "PARTIAL"


# ---------------------------------------------------------------------------
# config-driven thresholds
# ---------------------------------------------------------------------------

def test_score_accepts_custom_thresholds_in_process():
    sc = gate.score(
        gate.validate_input(make_input(r2=0.6)),
        stopping_rules={"rule2_r2_min": 0.95},
    )
    assert sc["rules"]["rule2"]["status"] == "fail"
    assert sc["rules"]["rule2"]["threshold"] == 0.95
    assert sc["verdict"] == "PARTIAL"


def test_cli_reads_thresholds_from_config(tmp_path):
    config, _ = make_config(
        tmp_path,
        stopping_rules={"rule2_r2_min": 0.95},
    )
    p = write_input(tmp_path, "v.json", r2=0.9)  # passes default, fails 0.95
    proc = run_cli(p, config)
    assert proc.returncode == 2, proc.stderr
    out = json.loads(proc.stdout)
    assert out["verdict"] == "PARTIAL"
    assert out["rules"]["rule2"]["threshold"] == 0.95


def test_cli_rule1_disabled_in_config(tmp_path):
    config, _ = make_config(
        tmp_path,
        stopping_rules={"rule1_ci_excludes_zero": False},
    )
    p = write_input(
        tmp_path, "v.json",
        effect={"name": "e", "point": 0.5, "ci_low": -1, "ci_high": 2},
    )
    proc = run_cli(p, config)
    assert proc.returncode == 0, proc.stderr
    out = json.loads(proc.stdout)
    assert out["rules"]["rule1"]["status"] == "not_applicable"
    assert out["verdict"] == "VALIDATED"


# ---------------------------------------------------------------------------
# CLI: exit codes and scorecard file
# ---------------------------------------------------------------------------

def test_cli_validated_exit_0_and_scorecard_written(tmp_path):
    config, _ = make_config(tmp_path)
    p = write_input(tmp_path, "v.json")
    proc = run_cli(p, config)
    assert proc.returncode == 0, proc.stderr
    out = json.loads(proc.stdout)
    assert out["verdict"] == "VALIDATED"
    assert out["gate_version"] == gate.GATE_VERSION
    scorecard_file = tmp_path / "v.scorecard.json"
    assert scorecard_file.exists()
    assert json.loads(scorecard_file.read_text()) == out


def test_cli_partial_exit_2(tmp_path):
    config, _ = make_config(tmp_path)
    p = write_input(tmp_path, "p.json", r2=0.1)
    proc = run_cli(p, config)
    assert proc.returncode == 2
    assert json.loads(proc.stdout)["verdict"] == "PARTIAL"


def test_cli_falsified_exit_3(tmp_path):
    config, _ = make_config(tmp_path)
    p = write_input(
        tmp_path,
        "f.json",
        effect={"name": "e", "point": 0.1, "ci_low": -1, "ci_high": 1},
    )
    proc = run_cli(p, config)
    assert proc.returncode == 3
    assert json.loads(proc.stdout)["verdict"] == "FALSIFIED"


def test_cli_bad_input_exit_1(tmp_path):
    config, _ = make_config(tmp_path)
    p = tmp_path / "bad.json"
    p.write_text(json.dumps({"rq_id": "x"}))  # missing claim, effect, instrument
    proc = run_cli(p, config)
    assert proc.returncode == 1
    assert "missing required field" in proc.stderr


def test_cli_missing_file_exit_1(tmp_path):
    config, _ = make_config(tmp_path)
    proc = run_cli(tmp_path / "absent.json", config)
    assert proc.returncode == 1


def test_scorecard_path_suffix_handling():
    assert gate.scorecard_path_for("/a/b.verdict_input.json").endswith(
        "b.verdict_input.scorecard.json"
    )
    assert gate.scorecard_path_for("/a/b.dat").endswith("b.dat.scorecard.json")


# ---------------------------------------------------------------------------
# pre-registration guard
# ---------------------------------------------------------------------------

def test_prereg_mismatch_refuses_exit_4_no_scorecard(tmp_path):
    config, _ = make_config(tmp_path)
    p = write_input(tmp_path, "v.json", prereg_sha="abc111")
    reg = tmp_path / "registry.json"
    reg.write_text(json.dumps({"test-rq": {"prereg_sha": "zzz999"}}))
    proc = run_cli(p, config, "--prereg", str(reg))
    assert proc.returncode == 4
    assert "mismatch" in proc.stderr
    assert not (tmp_path / "v.scorecard.json").exists()


def test_prereg_null_input_sha_against_registered_sha_refuses(tmp_path):
    config, _ = make_config(tmp_path)
    p = write_input(tmp_path, "v.json", prereg_sha=None)
    reg = tmp_path / "registry.json"
    reg.write_text(json.dumps({"test-rq": {"prereg_sha": "zzz999"}}))
    proc = run_cli(p, config, "--prereg", str(reg))
    assert proc.returncode == 4


def test_prereg_match_scores_normally(tmp_path):
    config, _ = make_config(tmp_path)
    p = write_input(tmp_path, "v.json", prereg_sha="abc111")
    reg = tmp_path / "registry.json"
    reg.write_text(json.dumps({"test-rq": {"prereg_sha": "abc111"}}))
    proc = run_cli(p, config, "--prereg", str(reg))
    assert proc.returncode == 0
    assert (tmp_path / "v.scorecard.json").exists()


def test_prereg_no_entry_scores_normally(tmp_path):
    config, _ = make_config(tmp_path)
    p = write_input(tmp_path, "v.json")
    reg = tmp_path / "registry.json"
    reg.write_text(json.dumps({"other-rq": {"prereg_sha": "abc"}}))
    proc = run_cli(p, config, "--prereg", str(reg))
    assert proc.returncode == 0


def test_prereg_list_form_registry(tmp_path):
    config, _ = make_config(tmp_path)
    p = write_input(tmp_path, "v.json", prereg_sha="abc111")
    reg = tmp_path / "registry.json"
    reg.write_text(json.dumps([{"rq_id": "test-rq", "prereg_sha": "different"}]))
    proc = run_cli(p, config, "--prereg", str(reg))
    assert proc.returncode == 4


def test_prereg_entries_form_registry(tmp_path):
    """The lab registry shape ({version, updated, entries}) is accepted."""
    config, _ = make_config(tmp_path)
    p = write_input(tmp_path, "v.json", prereg_sha="abc111")
    reg = tmp_path / "registry.json"
    reg.write_text(json.dumps({
        "version": "1.0",
        "updated": "2026-06-12",
        "entries": [{"rq_id": "test-rq", "prereg_sha": "different"}],
    }))
    proc = run_cli(p, config, "--prereg", str(reg))
    assert proc.returncode == 4


def test_prereg_bare_flag_uses_config_registry(tmp_path):
    """--prereg without a value reads the registry at config registry_path."""
    config, cfg = make_config(tmp_path)
    reg = Path(cfg["registry_path"])
    reg.parent.mkdir(parents=True, exist_ok=True)
    reg.write_text(json.dumps({
        "version": "1.0",
        "updated": "2026-06-12",
        "entries": [{"rq_id": "test-rq", "prereg_sha": "registered000"}],
    }))
    p = write_input(tmp_path, "v.json", prereg_sha="something-else")
    proc = run_cli(p, config, "--prereg")
    assert proc.returncode == 4
    assert "mismatch" in proc.stderr
    # And a matching sha scores normally through the same default path.
    p2 = write_input(tmp_path, "v2.json", prereg_sha="registered000")
    proc2 = run_cli(p2, config, "--prereg")
    assert proc2.returncode == 0, proc2.stderr


# ---------------------------------------------------------------------------
# side effects: verdict log via config verdict_log_path
# ---------------------------------------------------------------------------

def test_verdict_log_created_and_appended(tmp_path):
    config, cfg = make_config(tmp_path)
    p = write_input(tmp_path, "v.json")
    log = Path(cfg["verdict_log_path"])
    proc = run_cli(p, config, "--apply-side-effects", "--no-events")
    assert proc.returncode == 0, proc.stderr
    text = log.read_text()
    assert text.startswith("# Verdict Log")
    assert "| date | rq_id | verdict | rules_passed | scorecard_path |" in text
    assert "| test-rq | VALIDATED | 5/5 |" in text
    # second run appends a row, does not duplicate the header
    proc2 = run_cli(p, config, "--apply-side-effects", "--no-events")
    assert proc2.returncode == 0
    text2 = log.read_text()
    assert text2.count("# Verdict Log") == 1
    assert text2.count("| test-rq | VALIDATED | 5/5 |") == 2


def test_no_side_effects_without_flag(tmp_path):
    config, cfg = make_config(tmp_path)
    p = write_input(tmp_path, "v.json")
    proc = run_cli(p, config)
    assert proc.returncode == 0
    assert not Path(cfg["verdict_log_path"]).exists()


# ---------------------------------------------------------------------------
# side effects: milestone hook (the org-wired event seam)
# ---------------------------------------------------------------------------

def test_milestone_hook_receives_event_json_on_stdin(tmp_path):
    sink = tmp_path / "event.json"
    config, _ = make_config(tmp_path, milestone_hook=f"cat > '{sink}'")
    p = write_input(tmp_path, "v.json")
    proc = run_cli(p, config, "--apply-side-effects")
    assert proc.returncode == 0, proc.stderr
    assert "milestone hook: ok" in proc.stderr
    event = json.loads(sink.read_text())
    assert event["event_type"] == "research.milestone"
    assert event["actor"] == "test-lab"
    assert event["payload"]["rq_id"] == "test-rq"
    assert event["payload"]["verdict"] == "VALIDATED"
    assert event["payload"]["rules_passed"] == "5/5"
    assert event["payload"]["scorecard_path"].endswith("v.scorecard.json")


def test_milestone_hook_failure_degrades_to_warning(tmp_path):
    config, _ = make_config(tmp_path, milestone_hook="exit 9")
    p = write_input(tmp_path, "v.json")
    proc = run_cli(p, config, "--apply-side-effects")
    # Verdict exit code wins; the hook failure is only a warning.
    assert proc.returncode == 0, proc.stderr
    assert "milestone hook exited 9" in proc.stderr
    assert "degraded" in proc.stderr


def test_milestone_hook_null_is_skipped_with_warning(tmp_path):
    config, _ = make_config(tmp_path, milestone_hook=None)
    p = write_input(tmp_path, "v.json")
    proc = run_cli(p, config, "--apply-side-effects")
    assert proc.returncode == 0, proc.stderr
    assert "milestone_hook is not configured" in proc.stderr


def test_no_events_suppresses_configured_hook(tmp_path):
    sink = tmp_path / "event.json"
    config, _ = make_config(tmp_path, milestone_hook=f"cat > '{sink}'")
    p = write_input(tmp_path, "v.json")
    proc = run_cli(p, config, "--apply-side-effects", "--no-events")
    assert proc.returncode == 0, proc.stderr
    assert not sink.exists()
