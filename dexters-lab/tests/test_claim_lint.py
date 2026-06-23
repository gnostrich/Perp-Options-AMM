"""Tests for bin/claim_lint.py. Hermetic: fixtures live in tmp_path and the
CLI runs with DEXTERS_LAB_CONFIG pointing at a temp lab config."""

import importlib.util
import json
import os
import subprocess
import sys
from pathlib import Path

import pytest

HERE = Path(__file__).resolve().parent
BIN = HERE.parent / "bin" / "claim_lint.py"


def _load_module():
    spec = importlib.util.spec_from_file_location("claim_lint", BIN)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


cl = _load_module()


TEX_CONTENT = r"""\section{Fixture}
\label{sec:fixture}

The router achieved a 94.7\% cost reduction across 1{,}580 decisions \cite{lakherwal2026smt}.
This paragraph is fully cited and must produce no finding.

The system delivers a 38x speedup with $R^2 = 0.61$ on 1,580 prompts.

Published in 2026. See Section 7.4 of version 2.4 (v2.4) for details.
The run finished on 2026-03-24 and the label is \ref{tab:prod_cost}.

Accuracy reached 83.63\% on the held-out set (results/fit_routerbench.json).

Costs total 398 endpoint profiles in this batch.\footnote{From the spend ledger.}

We logged 1,593 prompts in shadow mode (source: shadow_decisions.db).

\begin{table}[h]
\begin{tabular}{lr}
Baseline & 99,660 \\
Routed & 5,300 \\
\end{tabular}
\end{table}
"""

MD_CONTENT = """# Fixture

This line has an em dash — and must be flagged.

The range 2013–2014 uses an en dash outside math.

The math span $a–b$ keeps its en dash and is allowed.

We will leverage the new tooling here.

A clean closing line with no numbers and no dashes.
"""


@pytest.fixture()
def tex_fixture(tmp_path):
    p = tmp_path / "sample_claims.tex"
    p.write_text(TEX_CONTENT, encoding="utf-8")
    return p


@pytest.fixture()
def md_fixture(tmp_path):
    p = tmp_path / "sample_writing.md"
    p.write_text(MD_CONTENT, encoding="utf-8")
    return p


def make_lab_env(tmp_path, writing_rules=None):
    """Write a temp lab config (temp lab_home) and return the CLI env."""
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
    if writing_rules is not None:
        cfg["writing_rules"] = writing_rules
    cfg_path = tmp_path / "lab.config.json"
    cfg_path.write_text(json.dumps(cfg), encoding="utf-8")
    env = dict(os.environ)
    env["DEXTERS_LAB_CONFIG"] = str(cfg_path)
    return env


def run_cli(env, *args):
    proc = subprocess.run([sys.executable, str(BIN)] + list(args),
                          capture_output=True, text=True, timeout=60, env=env)
    return proc


# ------------------------------------------------------------- tex fixture

def test_tex_fixture_findings(tex_fixture):
    findings = cl.lint_file(tex_fixture)
    evidence = [f for f in findings if f["missing"] == "evidence"]
    # exactly one uncited paragraph: the 38x / R^2 / 1,580 sentence
    assert len(evidence) == 1
    f = evidence[0]
    assert "38x" in f["detail"]
    assert "1,580" in f["detail"]
    assert "r_squared" in f["detail"]
    assert f["line"] == 7
    # no writing-rule findings on tex files
    assert all(f["missing"] == "evidence" for f in findings)


def test_cited_paragraph_is_clean(tex_fixture):
    findings = cl.lint_file(tex_fixture)
    assert not any("94.7" in f["sentence"] for f in findings)


def test_results_path_footnote_and_source_count_as_evidence(tex_fixture):
    findings = cl.lint_file(tex_fixture)
    joined = " ".join(f["sentence"] for f in findings)
    assert "83.63" not in joined   # results/fit_ path
    assert "398" not in joined     # \footnote
    assert "1,593" not in joined   # (source: ...)


def test_years_sections_versions_labels_not_flagged(tex_fixture):
    findings = cl.lint_file(tex_fixture)
    joined = " ".join(f["sentence"] for f in findings)
    assert "2026" not in joined
    assert "Section 7.4" not in joined
    assert "v2.4" not in joined


def test_tabular_numbers_not_flagged(tex_fixture):
    findings = cl.lint_file(tex_fixture)
    joined = " ".join(f["sentence"] for f in findings)
    assert "99,660" not in joined


# ------------------------------------------------------------- md fixture

def test_md_writing_rules(md_fixture):
    findings = cl.lint_file(md_fixture)
    rules = [f for f in findings if f["missing"] == "writing_rule"]
    details = sorted(f["detail"] for f in rules)
    assert len(rules) == 3
    assert any("em dash" in d for d in details)
    assert any("en dash" in d for d in details)
    assert any("banned word: leverage" in d for d in details)


def test_en_dash_inside_math_allowed(md_fixture):
    findings = cl.lint_file(md_fixture)
    assert not any("$a–b$" in f["sentence"] for f in findings)


def test_md_years_not_flagged_as_claims(md_fixture):
    findings = cl.lint_file(md_fixture)
    assert not any(f["missing"] == "evidence" for f in findings)


# ------------------------------------------------------------- unit checks

def test_find_claims_percentage_and_ratio():
    claims = cl.find_claims("The model cut costs by 94.68% with a 6.5x gain.")
    kinds = {k for k, _t in claims}
    assert kinds == {"percentage", "ratio"}


def test_find_claims_decimals_are_not_counts():
    assert cl.find_claims("The loss was 99.66 at step nine.") == []


def test_find_claims_year_excluded_but_count_kept():
    claims = cl.find_claims("In 2026 we processed 740,803 samples.")
    assert ("count", "740,803") in claims
    assert not any(t == "2026" for _k, t in claims)


def test_find_claims_semver_and_version_excluded():
    assert cl.find_claims("Upgraded from 1.0.3 to v2.4 in one step.") == []


def test_evidence_detection():
    assert cl.paragraph_has_evidence(r"big claim \cite{x}")
    assert cl.paragraph_has_evidence("see results/run.json")
    assert cl.paragraph_has_evidence("see fit_alpha.json")
    assert cl.paragraph_has_evidence("claim (source: ledger.db)")
    assert cl.paragraph_has_evidence("claim [^note1]")
    assert not cl.paragraph_has_evidence("a bare claim of 38x")


# ------------------------------------------------------------- config rules

def test_build_writing_rules_defaults():
    rules = cl.build_writing_rules({})
    assert rules["ban_em_dash"] is True
    assert rules["ban_en_dash"] is True
    assert rules["banned_re"].search("we will leverage this")
    assert rules["banned_re"].search("a robustness claim")
    assert rules["banned_re"].search("cutting edge work")
    assert not rules["banned_re"].search("food and lever")


def test_build_writing_rules_custom_words():
    cfg = {"writing_rules": {"banned_words": ["flux"],
                             "ban_em_dash": False, "ban_en_dash": False}}
    rules = cl.build_writing_rules(cfg)
    assert rules["ban_em_dash"] is False
    assert rules["ban_en_dash"] is False
    assert rules["banned_re"].search("we flux the capacitor")
    assert not rules["banned_re"].search("we leverage the capacitor")


def test_build_writing_rules_empty_word_list_disables_words():
    rules = cl.build_writing_rules({"writing_rules": {"banned_words": []}})
    assert rules["banned_re"] is None


def test_cli_custom_writing_rules(tmp_path, md_fixture):
    env = make_lab_env(tmp_path, writing_rules={
        "banned_words": ["tooling"],
        "ban_em_dash": False,
        "ban_en_dash": False,
    })
    proc = run_cli(env, "--report-only", str(md_fixture))
    assert proc.returncode == 0
    report = json.loads(proc.stdout)
    details = [f["detail"] for f in report["findings"]]
    assert details == ["banned word: tooling"]


def test_cli_invalid_writing_rules_exits_2(tmp_path, md_fixture):
    env = make_lab_env(tmp_path, writing_rules={"banned_words": "leverage"})
    proc = run_cli(env, str(md_fixture))
    assert proc.returncode == 2
    assert "writing_rules" in proc.stderr


# ------------------------------------------------------------- exit codes

def test_exit_1_on_findings(tmp_path, tex_fixture):
    env = make_lab_env(tmp_path)
    proc = run_cli(env, str(tex_fixture))
    assert proc.returncode == 1
    report = json.loads(proc.stdout)
    assert report["counts"]["evidence"] == 1


def test_report_only_exits_0(tmp_path, tex_fixture, md_fixture):
    env = make_lab_env(tmp_path)
    proc = run_cli(env, "--report-only", str(tex_fixture), str(md_fixture))
    assert proc.returncode == 0
    report = json.loads(proc.stdout)
    assert report["counts"]["evidence"] >= 1
    assert report["counts"]["writing_rule"] == 3


def test_exit_0_on_clean_file(tmp_path):
    env = make_lab_env(tmp_path)
    clean = tmp_path / "clean.tex"
    clean.write_text("A qualitative paragraph with no numbers at all.\n")
    proc = run_cli(env, str(clean))
    assert proc.returncode == 0
    report = json.loads(proc.stdout)
    assert report["findings"] == []


def test_json_schema_keys(tmp_path, tex_fixture):
    env = make_lab_env(tmp_path)
    proc = run_cli(env, "--report-only", str(tex_fixture))
    report = json.loads(proc.stdout)
    for f in report["findings"]:
        assert set(f) >= {"file", "line", "sentence", "missing"}
        assert f["missing"] in ("evidence", "writing_rule")
