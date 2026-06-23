"""Tests for bin/paper_sync_check.py. Hermetic: paper dirs live in tmp_path
and the CLI runs with DEXTERS_LAB_CONFIG pointing at a temp lab config."""

import importlib.util
import json
import os
import subprocess
import sys
import time
from pathlib import Path

import pytest

HERE = Path(__file__).resolve().parent
BIN = HERE.parent / "bin" / "paper_sync_check.py"

DAY = 86400


def _load_module():
    spec = importlib.util.spec_from_file_location("paper_sync_check", BIN)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


psc = _load_module()


def make_lab_env(tmp_path):
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
    cfg_path = tmp_path / "lab.config.json"
    cfg_path.write_text(json.dumps(cfg), encoding="utf-8")
    env = dict(os.environ)
    env["DEXTERS_LAB_CONFIG"] = str(cfg_path)
    return env


def run_cli(env, *args):
    return subprocess.run([sys.executable, str(BIN)] + list(args),
                          capture_output=True, text=True, timeout=60, env=env)


def make_paper(tmp_path, tex_age_days, pdf_age_days):
    """Build a paper dir; ages are days before now (None = file absent)."""
    now = time.time()
    paper = tmp_path / "paper"
    (paper / "sections").mkdir(parents=True)
    main_tex = paper / "main.tex"
    main_tex.write_text("\\documentclass{article}\n")
    sec = paper / "sections" / "01_intro.tex"
    sec.write_text("\\section{Intro}\n")
    t_tex = now - tex_age_days * DAY
    os.utime(main_tex, (t_tex, t_tex))
    os.utime(sec, (t_tex - DAY, t_tex - DAY))  # older section
    if pdf_age_days is not None:
        pdf = paper / "main.pdf"
        pdf.write_bytes(b"%PDF-1.4 fake")
        t_pdf = now - pdf_age_days * DAY
        os.utime(pdf, (t_pdf, t_pdf))
    return paper


# ------------------------------------------------------------- CLI verdicts

def test_green_when_pdf_fresh(tmp_path):
    env = make_lab_env(tmp_path)
    paper = make_paper(tmp_path, tex_age_days=2, pdf_age_days=1)
    proc = run_cli(env, str(paper))
    assert proc.returncode == 0
    assert "VERDICT: GREEN" in proc.stdout
    assert "tex newest:" in proc.stdout
    assert "main.pdf:" in proc.stdout
    assert "SKIPPED" in proc.stdout  # no --published


def test_red_when_tex_newer_than_pdf(tmp_path):
    env = make_lab_env(tmp_path)
    paper = make_paper(tmp_path, tex_age_days=1, pdf_age_days=3)
    proc = run_cli(env, str(paper))
    assert proc.returncode == 1
    assert "VERDICT: RED" in proc.stdout
    assert "tex is newer than main.pdf" in proc.stdout


def test_red_when_pdf_missing(tmp_path):
    env = make_lab_env(tmp_path)
    paper = make_paper(tmp_path, tex_age_days=1, pdf_age_days=None)
    proc = run_cli(env, str(paper))
    assert proc.returncode == 1
    assert "MISSING" in proc.stdout


def test_report_only_exits_0_on_red(tmp_path):
    env = make_lab_env(tmp_path)
    paper = make_paper(tmp_path, tex_age_days=1, pdf_age_days=10)
    proc = run_cli(env, "--report-only", str(paper))
    assert proc.returncode == 0
    assert "VERDICT: RED" in proc.stdout


def test_missing_main_tex_is_hard_error(tmp_path):
    env = make_lab_env(tmp_path)
    empty = tmp_path / "paper"
    (empty / "sections").mkdir(parents=True)
    proc = run_cli(env, str(empty))
    assert proc.returncode == 2


def test_paper_dir_is_required(tmp_path):
    env = make_lab_env(tmp_path)
    proc = run_cli(env)  # no positional arg
    assert proc.returncode == 2
    assert "paper_dir" in proc.stderr


def test_published_non_git_dir_warns_and_skips(tmp_path):
    env = make_lab_env(tmp_path)
    paper = make_paper(tmp_path, tex_age_days=2, pdf_age_days=1)
    not_git = tmp_path / "not_a_repo"
    not_git.mkdir()
    proc = run_cli(env, str(paper), "--published", str(not_git))
    assert proc.returncode == 0  # still green; published check skipped
    assert "WARNING" in proc.stderr
    assert "VERDICT: GREEN" in proc.stdout


# ------------------------------------------------------------- pure logic

def test_evaluate_green():
    now = time.time()
    red, reasons = psc.evaluate(now - 2 * DAY, now - DAY, now - 3 * DAY)
    assert not red
    assert reasons == []


def test_evaluate_red_tex_leads_pdf():
    now = time.time()
    red, reasons = psc.evaluate(now, now - 2 * DAY, None)
    assert red
    assert any("tex is newer" in r for r in reasons)


def test_evaluate_red_pdf_leads_published():
    now = time.time()
    red, reasons = psc.evaluate(now - 2 * DAY, now - DAY, now - 20 * DAY)
    assert red
    assert any("published HEAD" in r for r in reasons)


def test_evaluate_published_within_14_days_green():
    now = time.time()
    red, _ = psc.evaluate(now - 2 * DAY, now - DAY, now - 10 * DAY)
    assert not red


def test_evaluate_custom_thresholds():
    now = time.time()
    # tex leads pdf by 2 days; with a 3-day threshold this is green
    red, _ = psc.evaluate(now, now - 2 * DAY, None, tex_pdf_days=3.0)
    assert not red


def test_newest_tex_uses_sections(tmp_path):
    paper = make_paper(tmp_path, tex_age_days=5, pdf_age_days=1)
    sec = paper / "sections" / "02_new.tex"
    sec.write_text("\\section{New}\n")
    now = time.time()
    os.utime(sec, (now, now))
    mtime, newest = psc.newest_tex_mtime(paper)
    assert newest.name == "02_new.tex"
    assert abs(mtime - now) < 5
