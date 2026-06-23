#!/usr/bin/env python3
"""lab_init.py: bootstrap a lab_home from the repo templates. Idempotent.

What it does:
    1. Loads the shared lab config (lib/labconfig.py) and creates the
       lab_home directory tree via labconfig.ensure_home().
    2. Copies seed files into lab_home, only where the target is absent:
         templates/rq_registry.seed.json   -> config registry_path
         templates/TASK_LEDGER.template.md -> config ledger_path
         templates/RQ_PLAN.template.md     -> {lab_home}/RQ_PLAN.template.md
    3. Prints a status table: one row per item, with the resolved path
       and whether it was created this run or already existed.

Existing files are never overwritten, so running this twice (or after
months of lab work) is safe. The seed registry ships empty except for
two example entries marked "example": true; delete them once the lab
has real hypotheses.

Stdlib only. Exit 0 on success, 1 if a repo template is missing.

Usage:
    lab_init.py
"""

import pathlib
import shutil
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "lib"))
import labconfig  # noqa: E402

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
TEMPLATES = REPO_ROOT / "templates"


def seed_jobs(cfg):
    """(item, source template, destination) triples for this config."""
    lab_home = pathlib.Path(cfg["lab_home"])
    return [
        ("rq registry", TEMPLATES / "rq_registry.seed.json",
         pathlib.Path(cfg["registry_path"])),
        ("task ledger", TEMPLATES / "TASK_LEDGER.template.md",
         pathlib.Path(cfg["ledger_path"])),
        ("rq plan template", TEMPLATES / "RQ_PLAN.template.md",
         lab_home / "RQ_PLAN.template.md"),
    ]


def print_table(rows):
    widths = [max(len(r[i]) for r in rows) for i in range(3)]
    fmt = "  {0:<%d}  {1:<%d}  {2}" % (widths[0], widths[1])
    print(fmt.format("item", "status", "path"))
    print(fmt.format("-" * widths[0], "-" * widths[1], "-" * widths[2]))
    for item, status, path in rows:
        print(fmt.format(item, status, path))


USAGE = """lab_init.py: create the lab home and seed registry, ledger, and plan template.

Usage: lab_init.py            (no arguments; idempotent)

Reads the active lab config (DEXTERS_LAB_CONFIG, ./lab.config.json, or the
example), creates the lab_home tree, and copies the seed files in only if they
are absent. Safe to run repeatedly. Run it once after editing lab.config.json."""


def main():
    if any(a in ("-h", "--help") for a in sys.argv[1:]):
        print(USAGE)
        return 0
    try:
        cfg = labconfig.ensure_home()
    except (OSError, ValueError, KeyError) as e:
        print(f"lab_init: ERROR: cannot load lab config: {e}", file=sys.stderr)
        return 1

    print(f"lab_init: config = {cfg.get('_config_path', '?')}")
    print(f"lab_init: lab_home = {cfg['lab_home']}")
    print()

    rc = 0
    rows = [("lab_home tree", "ready", cfg["lab_home"])]
    for key in ("reviews_dir", "drafts_dir"):
        rows.append((key, "ready", cfg[key]))

    for item, src, dst in seed_jobs(cfg):
        if dst.exists():
            status = "exists (kept)"
        elif not src.is_file():
            status = "ERROR: template missing: " + str(src)
            rc = 1
        else:
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(str(src), str(dst))
            status = "created"
        rows.append((item, status, str(dst)))

    rows.append(("verdict log", "written by stopping_gate on first verdict",
                 cfg["verdict_log_path"]))

    print_table(rows)
    print()
    if rc == 0:
        print("lab_init: done. Next: edit the registry, write an RQ plan "
              "from the template, then run bin/rq_compile.py.")
    else:
        print("lab_init: FAILED: see ERROR rows above.", file=sys.stderr)
    return rc


if __name__ == "__main__":
    sys.exit(main())
