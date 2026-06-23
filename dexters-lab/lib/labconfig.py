"""Dexter's Lab shared config loader. Stdlib only.

Resolution order:
  1. $DEXTERS_LAB_CONFIG (explicit path)
  2. ./lab.config.json (cwd)
  3. <repo>/lab.config.json
  4. <repo>/lab.config.example.json (defaults; lab_home falls back to
     ~/dexters-lab-home)

Every path value supports `~` and the `{lab_home}` placeholder.
load() returns a dict with all paths expanded; ensure_home() creates the
lab_home directory tree so tools never fail on a missing folder.
"""
import json
import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

PATH_KEYS = ("registry_path", "ledger_path", "verdict_log_path",
             "reviews_dir", "drafts_dir")


def _candidates():
    env = os.environ.get("DEXTERS_LAB_CONFIG")
    if env:
        yield Path(env).expanduser()
    yield Path.cwd() / "lab.config.json"
    yield REPO_ROOT / "lab.config.json"
    yield REPO_ROOT / "lab.config.example.json"


def load():
    for cand in _candidates():
        if cand.is_file():
            cfg = json.loads(cand.read_text())
            cfg["_config_path"] = str(cand)
            break
    else:
        raise FileNotFoundError("no lab config found (set DEXTERS_LAB_CONFIG)")

    home = Path(os.path.expanduser(cfg.get("lab_home", "~/dexters-lab-home")))
    cfg["lab_home"] = str(home)

    def expand(v):
        if not isinstance(v, str):
            return v
        return os.path.expanduser(v.replace("{lab_home}", str(home)))

    for k in PATH_KEYS:
        if k in cfg:
            cfg[k] = expand(cfg[k])
    if isinstance(cfg.get("budget"), dict) and "spend_ledger" in cfg["budget"]:
        cfg["budget"]["spend_ledger"] = expand(cfg["budget"]["spend_ledger"])
    return cfg


def ensure_home(cfg=None):
    cfg = cfg or load()
    for k in ("reviews_dir", "drafts_dir"):
        Path(cfg[k]).mkdir(parents=True, exist_ok=True)
    for k in ("registry_path", "ledger_path", "verdict_log_path"):
        Path(cfg[k]).parent.mkdir(parents=True, exist_ok=True)
    led = Path(cfg["budget"]["spend_ledger"])
    led.parent.mkdir(parents=True, exist_ok=True)
    return cfg
