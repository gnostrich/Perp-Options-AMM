"""Tests for the deep-research pipeline deliverables
(bin/lab_deep_research.sh, templates/deep_research_workflow.template.js,
examples/deep-research-example/).

Hermetic: every run of lab_deep_research.sh goes through DEXTERS_LAB_CONFIG
pointing at a temp config with a temp lab_home. No network, no claude CLI
required (a stub stands in for it). Owned by the deep-research builder.
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
SCRIPT = REPO / "bin" / "lab_deep_research.sh"
TEMPLATE = REPO / "templates" / "deep_research_workflow.template.js"
EXAMPLE = REPO / "examples" / "deep-research-example"

OWNED_FILES = [
    SCRIPT,
    TEMPLATE,
    REPO / "docs" / "DEEP_RESEARCH.md",
    REPO / ".claude" / "commands" / "lab-deep-research.md",
    EXAMPLE / "README.md",
    EXAMPLE / "claims.json",
    EXAMPLE / "RESEARCH_REPORT.md",
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
                       "panel_models_preference": ["test/model-a",
                                                   "test/model-b"]},
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


class TestArgGuard(unittest.TestCase):
    def test_bash_syntax(self):
        r = subprocess.run(["bash", "-n", str(SCRIPT)],
                           capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, r.stderr)

    def test_no_args_prints_usage_exit_0_no_run(self):
        # The guard must fire BEFORE any side effect: no args -> usage, exit 0.
        with tempfile.TemporaryDirectory() as tmp:
            env, home = make_lab_env(tmp)
            # a stub that would record if it ever ran
            stub = Path(tmp) / "stub-claude"
            ran = Path(tmp) / "ran.txt"
            stub.write_text(f"#!/bin/bash\necho ran > '{ran}'\n")
            stub.chmod(0o755)
            env["CLAUDE_BIN"] = str(stub)
            r = run_script([], env, tmp)
            self.assertEqual(r.returncode, 0)
            self.assertIn("Usage:", r.stdout)
            self.assertFalse(ran.exists(), "agent must NOT launch on no args")
            self.assertFalse((home / "reviews").exists(),
                             "no side effect before the guard")

    def test_help_flag_prints_usage_exit_0_no_run(self):
        with tempfile.TemporaryDirectory() as tmp:
            env, _ = make_lab_env(tmp)
            stub = Path(tmp) / "stub-claude"
            ran = Path(tmp) / "ran.txt"
            stub.write_text(f"#!/bin/bash\necho ran > '{ran}'\n")
            stub.chmod(0o755)
            env["CLAUDE_BIN"] = str(stub)
            for flag in ("-h", "--help"):
                r = run_script([flag], env, tmp)
                self.assertEqual(r.returncode, 0, flag)
                self.assertIn("Usage:", r.stdout)
                self.assertFalse(ran.exists(),
                                 f"agent must NOT launch on {flag}")

    def test_leading_flag_without_question_is_usage(self):
        with tempfile.TemporaryDirectory() as tmp:
            env, _ = make_lab_env(tmp)
            r = run_script(["--depth", "5"], env, tmp)
            self.assertEqual(r.returncode, 0)
            self.assertIn("Usage:", r.stdout)


class TestHeadlessRun(unittest.TestCase):
    def test_degrades_gracefully_without_claude_cli(self):
        with tempfile.TemporaryDirectory() as tmp:
            env, home = make_lab_env(tmp)
            env["CLAUDE_BIN"] = str(Path(tmp) / "no-such-claude")
            r = run_script(["does X raise Y?"], env, tmp)
            self.assertEqual(r.returncode, 127)
            self.assertIn("claude CLI was not found", r.stderr)
            self.assertIn("Nothing was run", r.stderr)
            # config was still resolved and the run setup printed
            self.assertIn("second-opinion budget 4 USD", r.stdout)
            self.assertTrue((home / "reviews").is_dir())

    def test_paused_lab_does_not_run(self):
        with tempfile.TemporaryDirectory() as tmp:
            env, home = make_lab_env(tmp)
            stub = Path(tmp) / "stub-claude"
            ran = Path(tmp) / "ran.txt"
            stub.write_text(f"#!/bin/bash\necho ran > '{ran}'\n")
            stub.chmod(0o755)
            env["CLAUDE_BIN"] = str(stub)
            # ensure_home runs in config resolution; create the pause file
            home.mkdir(parents=True, exist_ok=True)
            (home / "pause").write_text("paused\n")
            r = run_script(["does X raise Y?"], env, tmp)
            self.assertEqual(r.returncode, 0)
            self.assertIn("paused", r.stdout)
            self.assertFalse(ran.exists(), "paused lab must not launch agent")

    def test_stub_claude_run_end_to_end(self):
        with tempfile.TemporaryDirectory() as tmp:
            env, home = make_lab_env(tmp)
            stub = Path(tmp) / "stub-claude"
            stub_log = Path(tmp) / "stub-args.txt"
            stub.write_text(
                "#!/bin/bash\n"
                f"printf '%s\\n' \"$@\" > '{stub_log}'\n"
                "echo '{\"total_cost_usd\": 0.077}'\n"
            )
            stub.chmod(0o755)
            env["CLAUDE_BIN"] = str(stub)
            r = run_script(
                ["Does Zephyrine raise resting heart rate?", "--depth", "3",
                 "--budget", "2", "--slug", "deepres-toy-test"],
                env, tmp)
            self.assertEqual(r.returncode, 0, r.stderr)
            outdir = home / "reviews" / "deepres-toy-test"
            self.assertTrue(outdir.is_dir())
            prompt = (outdir / "deep_research_prompt.txt").read_text()
            self.assertIn("QUESTION: Does Zephyrine raise resting heart rate?",
                          prompt)
            self.assertIn(f"OUTDIR: {outdir}", prompt)
            self.assertIn("DEPTH: 3", prompt)
            self.assertIn("PANEL_BUDGET_USD: 2", prompt)
            self.assertIn("PANEL_MODELS: test/model-a,test/model-b", prompt)
            self.assertIn("/lab-deep-research", prompt)  # skill text embedded
            # stub got headless flags
            args = stub_log.read_text()
            self.assertIn("--permission-mode", args)
            self.assertIn("acceptEdits", args)
            self.assertIn("--output-format", args)
            # session JSON captured and cost recorded on the spend ledger
            self.assertTrue((outdir / "lab_deep_research_run.json").exists())
            ledger_lines = (home / "spend.jsonl").read_text().splitlines()
            row = json.loads(ledger_lines[-1])
            self.assertEqual(row["consumer"], "deep_research")
            self.assertAlmostEqual(row["cost_usd"], 0.077)

    def test_depth_is_clamped(self):
        with tempfile.TemporaryDirectory() as tmp:
            env, home = make_lab_env(tmp)
            env["CLAUDE_BIN"] = str(Path(tmp) / "no-such-claude")
            # depth above 8 should clamp to 8 in the printed setup
            run_script(["q?", "--depth", "99", "--slug", "deepres-clamp"],
                       env, tmp)
            outdir = home / "reviews" / "deepres-clamp"
            # claude was absent so no prompt file; setup still ran via stdout
            # re-run capturing stdout
            r = run_script(["q?", "--depth", "99"], env, tmp)
            self.assertIn("depth: 8 sub-queries", r.stdout)
            r2 = run_script(["q?", "--depth", "1"], env, tmp)
            self.assertIn("depth: 3 sub-queries", r2.stdout)

    def test_default_slug_is_derived_from_question(self):
        with tempfile.TemporaryDirectory() as tmp:
            env, home = make_lab_env(tmp)
            env["CLAUDE_BIN"] = str(Path(tmp) / "no-such-claude")
            run_script(["Does Creatine Help Memory In Adults Over 60 Really?"],
                       env, tmp)
            stamp = time.strftime("%Y%m%d")
            # first ~6 words, lowercased, dashed
            expect = (home / "reviews" /
                      f"deepres-does-creatine-help-memory-in-adults-{stamp}")
            self.assertTrue(expect.is_dir(),
                            list((home / "reviews").iterdir()))


class TestTemplate(unittest.TestCase):
    def test_placeholders_present(self):
        text = TEMPLATE.read_text()
        for ph in ("__QUESTION__", "__OUTDIR__", "__DEPTH__",
                   "__REPO_ROOT__", "__PANEL_BUDGET_USD__", "__PANEL_MODELS__"):
            self.assertIn(ph, text, f"missing placeholder {ph}")

    def test_schema_and_phase_skeleton(self):
        text = TEMPLATE.read_text()
        for needle in ("DECOMPOSE_SCHEMA", "RESEARCH_SCHEMA", "VERIFY_SCHEMA",
                       "RESEARCH_REPORT.md", "claims.json",
                       "no_sources_found", "lab_openrouter.py",
                       "phase('Decompose')", "phase('Research')",
                       "phase('Verify')", "phase('Synthesize')"):
            self.assertIn(needle, text, f"missing {needle}")

    def test_never_fabricate_rule_in_template(self):
        text = TEMPLATE.read_text().lower()
        self.assertIn("never fabricate", text)

    def test_node_syntax_if_node_available(self):
        node = shutil.which("node")
        if not node:
            self.skipTest("node not installed; syntax not machine-checked")
        # The Workflow runner executes the template as an async function body
        # (top-level await + final return), so wrap before checking.
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
    def test_claims_json_parses_and_is_labeled_synthetic(self):
        data = json.loads((EXAMPLE / "claims.json").read_text())
        self.assertIn("synthetic", data.get("_synthetic", "").lower(),
                      "claims.json must self-declare as synthetic")

    def test_claims_json_key_structure(self):
        data = json.loads((EXAMPLE / "claims.json").read_text())
        for key in ("question", "depth", "sub_queries", "claims",
                    "contradictions", "no_sources_found", "report_path",
                    "second_opinion_cost_usd"):
            self.assertIn(key, data)
        self.assertIsInstance(data["claims"], list)
        self.assertIsInstance(data["second_opinion_cost_usd"], float)

    def test_one_claim_supported_one_refuted(self):
        data = json.loads((EXAMPLE / "claims.json").read_text())
        verdicts = {c["id"]: c["verdict"] for c in data["claims"]}
        self.assertIn("supported", verdicts.values())
        self.assertIn("refuted", verdicts.values())
        # the refuted claim carries a counter-evidence URL
        refuted = [c for c in data["claims"] if c["verdict"] == "refuted"]
        self.assertTrue(all(c.get("counter_evidence_url")
                            for c in refuted))

    def test_no_sources_found_is_recorded(self):
        data = json.loads((EXAMPLE / "claims.json").read_text())
        self.assertIn("Q3", data["no_sources_found"])
        q3 = [s for s in data["sub_queries"] if s["id"] == "Q3"][0]
        self.assertEqual(q3["status"], "no_sources_found")

    def test_every_claim_has_a_source_url(self):
        data = json.loads((EXAMPLE / "claims.json").read_text())
        for c in data["claims"]:
            self.assertTrue(c["sources"], f"{c['id']} has no source")
            for s in c["sources"]:
                self.assertTrue(s["url"].startswith("http"),
                                f"{c['id']} source has no url")

    def test_example_urls_are_fake_and_labeled(self):
        # no real-looking URL should imply a real claim; all are example.invalid
        report = (EXAMPLE / "RESEARCH_REPORT.md").read_text()
        claims = (EXAMPLE / "claims.json").read_text()
        for blob in (report, claims):
            import re
            urls = re.findall(r"https?://[^\s)\"]+", blob)
            for u in urls:
                self.assertIn("example.invalid", u,
                              f"example must use only fake URLs, found {u}")

    def test_optional_jsonschema_validation(self):
        try:
            import jsonschema
        except ImportError:
            sys.stderr.write(
                "WARNING: jsonschema not importable; skipping schema "
                "validation of example fixtures\n")
            self.skipTest("jsonschema not installed (optional)")
        claims_schema = {
            "type": "object",
            "required": ["question", "depth", "sub_queries", "claims",
                         "contradictions", "no_sources_found",
                         "second_opinion_cost_usd"],
            "properties": {"claims": {"type": "array", "items": {
                "type": "object",
                "required": ["id", "statement", "sub_query_id", "sources",
                             "verdict", "load_bearing"]}}},
        }
        data = json.loads((EXAMPLE / "claims.json").read_text())
        jsonschema.validate(data, claims_schema)


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
