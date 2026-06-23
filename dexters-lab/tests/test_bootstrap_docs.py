"""Self-test for the docs + bootstrap component.

Hermetic: labconfig is exercised through DEXTERS_LAB_CONFIG pointing at a
temp config with a temp lab_home (pytest tmp_path). Hygiene checks are
scoped to the files this component owns, so concurrent work on bin/ never
breaks this suite.

Banned patterns below are built by concatenation on purpose, so a plain
text search over the repo for the banned strings stays clean.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO / "lib"))
import labconfig  # noqa: E402

OWNED_TEXT_FILES = [
    REPO / "README.md",
    REPO / "docs" / "GOVERNANCE.md",
    REPO / "docs" / "ARCHITECTURE.md",
    REPO / "docs" / "CONFIG.md",
    REPO / "setup.sh",
    REPO / ".gitignore",
    REPO / "LICENSE",
]

EM_DASH = "—"
EN_DASH = "–"
BANNED_WORDS = [
    "del" + "ve",
    "lever" + "age",
    "rob" + "ust",
    "seam" + "less",
    "cutting" + "-edge",
    "game" + "-changer",
]
PERSONAL_PATH_FRAGMENT = "/" + "Users" + "/"


# ------------------------------------------------------------- labconfig

def _write_temp_config(tmp_path):
    home = tmp_path / "lab-home"
    cfg = {
        "lab_name": "test-lab",
        "lab_home": str(home),
        "registry_path": "{lab_home}/rq_registry.json",
        "ledger_path": "{lab_home}/TASK_LEDGER.md",
        "verdict_log_path": "{lab_home}/VERDICT_LOG.md",
        "reviews_dir": "{lab_home}/reviews",
        "drafts_dir": "{lab_home}/drafts",
        "budget": {"monthly_cap_usd": 1, "spend_ledger": "{lab_home}/spend.jsonl"},
    }
    cfg_path = tmp_path / "lab.config.json"
    cfg_path.write_text(json.dumps(cfg))
    return cfg_path, home


def test_labconfig_resolves_env_config(tmp_path, monkeypatch):
    cfg_path, home = _write_temp_config(tmp_path)
    monkeypatch.setenv("DEXTERS_LAB_CONFIG", str(cfg_path))
    cfg = labconfig.load()
    assert cfg["_config_path"] == str(cfg_path)
    assert cfg["lab_home"] == str(home)
    assert cfg["registry_path"] == str(home / "rq_registry.json")
    assert cfg["budget"]["spend_ledger"] == str(home / "spend.jsonl")


def test_labconfig_ensure_home_creates_tree(tmp_path, monkeypatch):
    cfg_path, home = _write_temp_config(tmp_path)
    monkeypatch.setenv("DEXTERS_LAB_CONFIG", str(cfg_path))
    assert not home.exists()
    cfg = labconfig.ensure_home()
    assert (home / "reviews").is_dir()
    assert (home / "drafts").is_dir()
    # parents of the state files exist, so first writes never fail
    assert Path(cfg["registry_path"]).parent.is_dir()
    assert Path(cfg["budget"]["spend_ledger"]).parent.is_dir()


# ------------------------------------------------------------- bootstrap

def test_owned_files_exist():
    for path in OWNED_TEXT_FILES:
        assert path.is_file(), f"missing owned file: {path}"


def test_setup_sh_passes_bash_syntax_check():
    proc = subprocess.run(
        ["bash", "-n", str(REPO / "setup.sh")],
        capture_output=True, text=True, timeout=30,
    )
    assert proc.returncode == 0, f"bash -n failed: {proc.stderr}"


def test_setup_sh_is_executable_or_invocable():
    setup = REPO / "setup.sh"
    text = setup.read_text(encoding="utf-8")
    assert text.startswith("#!"), "setup.sh needs a shebang"


def test_gitignore_covers_local_state():
    lines = [
        ln.strip() for ln in (REPO / ".gitignore").read_text().splitlines()
    ]
    for required in ("lab.config.json", "__pycache__/", "*.pyc", ".pytest_cache/"):
        assert required in lines, f".gitignore missing: {required}"


def test_license_is_mit_2026():
    text = (REPO / "LICENSE").read_text(encoding="utf-8")
    assert "MIT License" in text
    assert "2026 Pranav Lakherwal" in text


def test_readme_quickstart_mentions_the_entry_points():
    text = (REPO / "README.md").read_text(encoding="utf-8")
    for needle in (
        "lab.config.example.json",
        "setup.sh",
        "bin/lab_init.py",
        "docs/GOVERNANCE.md",
        "docs/ARCHITECTURE.md",
        "docs/CONFIG.md",
    ):
        assert needle in text, f"README missing reference to {needle}"


def test_governance_covers_the_doctrine():
    text = (REPO / "docs" / "GOVERNANCE.md").read_text(encoding="utf-8")
    for needle in ("FALSIFIED", "PARTIAL", "VALIDATED", "PENDING_HUMAN",
                   "H1", "H2", "H3", "H4", "sha-256", "n >= 40"):
        assert needle in text, f"GOVERNANCE missing: {needle}"


# --------------------------------------------------------------- hygiene

def test_no_machine_specific_absolute_paths_in_owned_files():
    for path in OWNED_TEXT_FILES:
        text = path.read_text(encoding="utf-8")
        assert PERSONAL_PATH_FRAGMENT not in text, (
            f"{path.name} contains a machine-specific absolute path"
        )


def test_no_banned_dashes_or_words_in_owned_files():
    findings = []
    for path in OWNED_TEXT_FILES:
        text = path.read_text(encoding="utf-8")
        if EM_DASH in text:
            findings.append(f"{path.name}: em dash")
        if EN_DASH in text:
            findings.append(f"{path.name}: en dash")
        lowered = text.lower()
        for word in BANNED_WORDS:
            if re.search(r"\b" + re.escape(word), lowered):
                findings.append(f"{path.name}: banned word '{word}'")
    assert not findings, "; ".join(findings)
