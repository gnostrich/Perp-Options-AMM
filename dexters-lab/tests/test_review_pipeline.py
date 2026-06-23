"""Tests for the deep-review pipeline deliverables (bin/lab_review.sh,
templates/review_workflow.template.js, examples/review-example/).

Hermetic: every run of lab_review.sh goes through DEXTERS_LAB_CONFIG pointing
at a temp config with a temp lab_home. No network, no claude CLI required
(a stub stands in for it). Owned by the review-pipeline builder.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SCRIPT = REPO / "bin" / "lab_review.sh"
TEMPLATE = REPO / "templates" / "review_workflow.template.js"
EXAMPLE = REPO / "examples" / "review-example"

OWNED_FILES = [
    SCRIPT,
    TEMPLATE,
    REPO / "docs" / "REVIEW_PIPELINE.md",
    REPO / ".claude" / "commands" / "lab-review.md",
    EXAMPLE / "README.md",
    EXAMPLE / "paper.md",
    EXAMPLE / "claims_ledger.json",
    EXAMPLE / "attack_math.json",
    EXAMPLE / "VERDICT_SUMMARY.json",
    EXAMPLE / "REFEREE_REPORT.md",
]


def make_lab_env(tmp):
    """Write a temp lab config + lab_home; return env for subprocesses."""
    home = Path(tmp) / "lab-home"
    cfg = {
        "lab_name": "test-lab",
        "lab_home": str(home),
        "registry_path": "{lab_home}/rq_registry.json",
        "ledger_path": "{lab_home}/TASK_LEDGER.md",
        "verdict_log_path": "{lab_home}/VERDICT_LOG.md",
        "reviews_dir": "{lab_home}/reviews",
        "drafts_dir": "{lab_home}/drafts",
        "budget": {"monthly_cap_usd": 40,
                   "spend_ledger": "{lab_home}/spend.jsonl"},
        "openrouter": {"api_key_env": "OPENROUTER_API_KEY",
                       "panel_models_preference": ["test/model-a"]},
    }
    cfg_path = Path(tmp) / "lab.config.json"
    cfg_path.write_text(json.dumps(cfg))
    env = dict(os.environ)
    env["DEXTERS_LAB_CONFIG"] = str(cfg_path)
    return env, home


def run_script(args, env, cwd):
    return subprocess.run(
        ["bash", str(SCRIPT)] + args,
        capture_output=True, text=True, env=env, cwd=cwd, timeout=120,
    )


class TestLabReviewScript(unittest.TestCase):
    def test_bash_syntax(self):
        r = subprocess.run(["bash", "-n", str(SCRIPT)],
                           capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, r.stderr)

    def test_usage_on_no_args(self):
        with tempfile.TemporaryDirectory() as tmp:
            env, _ = make_lab_env(tmp)
            r = run_script([], env, tmp)
            self.assertEqual(r.returncode, 2)
            self.assertIn("usage:", r.stderr)

    def test_missing_paper_is_clear_error(self):
        with tempfile.TemporaryDirectory() as tmp:
            env, _ = make_lab_env(tmp)
            r = run_script([str(Path(tmp) / "nope.pdf")], env, tmp)
            self.assertEqual(r.returncode, 1)
            self.assertIn("paper not found", r.stderr)

    def test_degrades_gracefully_without_claude_cli(self):
        with tempfile.TemporaryDirectory() as tmp:
            env, home = make_lab_env(tmp)
            env["CLAUDE_BIN"] = str(Path(tmp) / "no-such-claude")
            paper = Path(tmp) / "toy_paper.md"
            paper.write_text("# toy\n")
            r = run_script([str(paper)], env, tmp)
            self.assertEqual(r.returncode, 127)
            self.assertIn("claude CLI was not found", r.stderr)
            self.assertIn("Nothing was run", r.stderr)
            # config was still resolved and the budget note printed
            self.assertIn("panel budget 8 USD", r.stdout)
            self.assertTrue((home / "reviews").is_dir())

    def test_stub_claude_run_end_to_end(self):
        with tempfile.TemporaryDirectory() as tmp:
            env, home = make_lab_env(tmp)
            stub = Path(tmp) / "stub-claude"
            stub_log = Path(tmp) / "stub-args.txt"
            stub.write_text(
                "#!/bin/bash\n"
                f"printf '%s\\n' \"$@\" > '{stub_log}'\n"
                "echo '{\"total_cost_usd\": 0.123}'\n"
            )
            stub.chmod(0o755)
            env["CLAUDE_BIN"] = str(stub)
            paper = Path(tmp) / "toy_paper.md"
            paper.write_text("# toy\n")
            r = run_script(
                [str(paper), "--domain", "toy mechanisms", "--budget", "3",
                 "--slug", "review-toy-test"],
                env, tmp)
            self.assertEqual(r.returncode, 0, r.stderr)
            outdir = home / "reviews" / "review-toy-test"
            self.assertTrue(outdir.is_dir())
            prompt = (outdir / "review_prompt.txt").read_text()
            self.assertIn(f"PAPER_PATH: {paper}", prompt)
            self.assertIn(f"OUTDIR: {outdir}", prompt)
            self.assertIn("PANEL_BUDGET_USD: 3", prompt)
            self.assertIn("/lab-review", prompt)  # skill text embedded
            # stub got headless flags
            args = stub_log.read_text()
            self.assertIn("--permission-mode", args)
            self.assertIn("acceptEdits", args)
            self.assertIn("--output-format", args)
            # session JSON captured and cost recorded on the spend ledger
            self.assertTrue((outdir / "lab_review_run.json").exists())
            ledger_lines = (home / "spend.jsonl").read_text().splitlines()
            row = json.loads(ledger_lines[-1])
            self.assertEqual(row["consumer"], "lab_review")
            self.assertAlmostEqual(row["cost_usd"], 0.123)

    def test_default_slug_is_derived_from_paper_name(self):
        with tempfile.TemporaryDirectory() as tmp:
            env, home = make_lab_env(tmp)
            env["CLAUDE_BIN"] = str(Path(tmp) / "no-such-claude")
            paper = Path(tmp) / "My Toy_Paper v2.md"
            paper.write_text("# toy\n")
            run_script([str(paper)], env, tmp)
            stamp = time.strftime("%Y%m%d")
            expect = home / "reviews" / f"review-my-toy-paper-v2-{stamp}"
            self.assertTrue(expect.is_dir(),
                            list((home / "reviews").iterdir()))


class TestTemplate(unittest.TestCase):
    def test_placeholders_present(self):
        text = TEMPLATE.read_text()
        for ph in ("__PAPER_PATH__", "__PAPER_TXT__", "__OUTDIR__",
                   "__DOMAIN__", "__VENUE__", "__REPO_ROOT__",
                   "__PANEL_BUDGET_USD__", "__PANEL_MODELS__"):
            self.assertIn(ph, text, f"missing placeholder {ph}")

    def test_schema_and_phase_skeleton(self):
        text = TEMPLATE.read_text()
        for needle in ("EXTRACT_SCHEMA", "ATTACK_SCHEMA", "VERDICT_SUMMARY",
                       "REFEREE_REPORT.md", "lab_baseline.json",
                       "phase('Extract')", "phase('Attack')",
                       "phase('Verify')", "phase('Synthesize')",
                       "phase('Critique')"):
            self.assertIn(needle, text, f"missing {needle}")

    def test_node_syntax_if_node_available(self):
        node = shutil.which("node")
        if not node:
            self.skipTest("node not installed; syntax not machine-checked")
        # The Workflow runner executes the template as an async function
        # body (top-level await + final return), so wrap before checking.
        body = "".join(
            line.replace("export ", "", 1) if line.startswith("export ")
            else line
            for line in TEMPLATE.read_text().splitlines(keepends=True))
        with tempfile.TemporaryDirectory() as tmp:
            mjs = Path(tmp) / "check.mjs"
            mjs.write_text(
                "export const __check = async () => {\n" + body + "\n}\n")
            r = subprocess.run([node, "--check", str(mjs)],
                               capture_output=True, text=True)
            self.assertEqual(r.returncode, 0, r.stderr)


class TestExampleFixtures(unittest.TestCase):
    def test_jsons_parse_and_are_labeled_synthetic(self):
        for name in ("claims_ledger.json", "attack_math.json",
                     "VERDICT_SUMMARY.json"):
            data = json.loads((EXAMPLE / name).read_text())
            self.assertIn("synthetic", data.get("_synthetic", "").lower(),
                          f"{name} must self-declare as synthetic")

    def test_verdict_summary_key_structure(self):
        data = json.loads((EXAMPLE / "VERDICT_SUMMARY.json").read_text())
        for key in ("recommendation", "confidence", "soundness_verdicts",
                    "fatal_issues", "major_issues", "novelty_verdict",
                    "panel_cost_usd", "reconciliation_note"):
            self.assertIn(key, data)
        self.assertIsInstance(data["soundness_verdicts"], dict)
        self.assertIsInstance(data["panel_cost_usd"], float)

    def test_claims_ledger_shape(self):
        data = json.loads((EXAMPLE / "claims_ledger.json").read_text())
        for key in ("summary", "claims", "results_audit", "notable"):
            self.assertIn(key, data)
        for claim in data["claims"]:
            for key in ("id", "statement", "where", "kind", "evidence",
                        "load_bearing"):
                self.assertIn(key, claim)

    def test_attack_shape_and_error_caught(self):
        data = json.loads((EXAMPLE / "attack_math.json").read_text())
        for key in ("angle", "verdicts", "findings", "strengths",
                    "questions_for_authors"):
            self.assertIn(key, data)
        d3 = [v for v in data["verdicts"] if v["claim_id"] == "D3"]
        self.assertEqual(len(d3), 1)
        self.assertEqual(d3[0]["verdict"], "error")

    def test_optional_jsonschema_validation(self):
        try:
            import jsonschema
        except ImportError:
            sys.stderr.write(
                "WARNING: jsonschema not importable; skipping schema "
                "validation of example fixtures\n")
            self.skipTest("jsonschema not installed (optional)")
        ledger_schema = {
            "type": "object",
            "required": ["summary", "claims", "results_audit", "notable"],
            "properties": {"claims": {"type": "array", "items": {
                "type": "object",
                "required": ["id", "statement", "where", "kind",
                             "evidence", "load_bearing"]}}},
        }
        data = json.loads((EXAMPLE / "claims_ledger.json").read_text())
        jsonschema.validate(data, ledger_schema)


class TestPortability(unittest.TestCase):
    def test_no_personal_absolute_paths(self):
        forbidden = "/Use" + "rs/pranav"
        for f in OWNED_FILES:
            self.assertNotIn(forbidden, f.read_text(),
                             f"personal path leaked into {f}")

    def test_no_dashes_or_banned_words(self):
        # built from fragments so this file stays grep-clean itself
        banned_words = ("del" + "ve", "lever" + "age", "rob" + "ust",
                        "seam" + "less")
        for f in OWNED_FILES:
            text = f.read_text()
            self.assertNotIn("\u2014", text, f"em dash in {f}")
            self.assertNotIn("\u2013", text, f"en dash in {f}")
            low = text.lower()
            for w in banned_words:
                self.assertNotIn(w, low, f"banned word '{w}' in {f}")


if __name__ == "__main__":
    unittest.main()
