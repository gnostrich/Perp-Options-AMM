#!/usr/bin/env python3
"""rq_compile.py: the plan-to-ledger compiler for the lab loop.

Reads an RQ plan markdown containing exactly one fenced prereg block,
hashes it, updates the RQ registry, and appends an R.* task chain to
the task ledger in the exact ledger table format. Default registry and
ledger paths come from the shared lab config (lib/labconfig.py);
--registry and --ledger override.

Prereg fence format (defined here, enforced fail-closed):

    ```prereg
    hypothesis: EX-H1 demo effect direction holds on archived data
    observable: effect size with 95% CI
    dataset: 100 archived demo rows
    rules: effect 95% CI excludes zero; R^2 >= 0.5
    expected_n: 100
    ```

- The block opens with a line that is exactly ```prereg and closes with
  a line that is exactly ```.
- Inside: one "key: value" pair per line. Required keys: hypothesis,
  observable, dataset, rules, expected_n. Blank lines and lines starting
  with # are ignored.
- The prereg sha-256 covers the exact text between the opening fence
  line and the closing fence line (utf-8 encoded). Editing one character
  changes the sha.

Ledger rows are appended as:

    | R.{rq_id}.{n} | task | TODO | deps | verify |

Numbering continues from the highest existing R.{rq_id}.N in the target
ledger. The first new row depends on the last existing row of the same
chain (or "-" if none). Later rows depend on their predecessor.

Registry validation: if the jsonschema package is importable, the
registry is validated against templates/rq_registry.schema.json before
any write and the compiler fails closed on violations. Without
jsonschema it warns and skips validation.

Stdlib only (jsonschema optional). No network. Never touches git.

Usage:
    rq_compile.py --plan PLAN.md --rq EXAMPLE1 [--ledger TASK_LEDGER.md]
        [--registry rq_registry.json] [--tasks tasks.json]
        [--date YYYY-MM-DD]

--tasks points at a JSON list of {"task": ..., "verify": ...} steps so
chains can be authored explicitly. Without it, a default 3-step chain
(instruments -> measurement -> stopping_gate verdict) is generated.
"""

import argparse
import hashlib
import json
import os
import pathlib
import re
import sys
from datetime import date

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "lib"))
import labconfig  # noqa: E402

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
SCHEMA_PATH = REPO_ROOT / "templates" / "rq_registry.schema.json"

PREREG_RE = re.compile(r"^```prereg[ \t]*\n(.*?)^```[ \t]*$", re.M | re.S)
REQUIRED_KEYS = ("hypothesis", "observable", "dataset", "rules", "expected_n")

LANE_HEADER = "## Lane R: Research"
TABLE_HEADER = "| id | task | status | deps | verify |"
TABLE_RULE = "|----|------|--------|------|--------|"

# Statuses the compiler may advance to SCOPED. Anything else (RUNNING,
# VALIDATED, ...) keeps its status; plan_path/prereg_sha still update.
SCOPABLE = ("CANDIDATE", "SCOPED")


def fail(msg):
    print(f"rq_compile: ERROR: {msg}", file=sys.stderr)
    sys.exit(1)


def warn(msg):
    print(f"rq_compile: WARNING: {msg}", file=sys.stderr)


def extract_prereg(plan_text):
    """Return (block_text, sha256_hex). Fail-closed on 0 or >1 blocks."""
    blocks = PREREG_RE.findall(plan_text)
    if len(blocks) == 0:
        fail("no ```prereg fenced block found in the plan")
    if len(blocks) > 1:
        fail(f"{len(blocks)} prereg blocks found; exactly 1 required")
    block = blocks[0]
    sha = hashlib.sha256(block.encode("utf-8")).hexdigest()
    return block, sha


def parse_prereg(block):
    """Parse key: value lines. Fail-closed on missing required keys."""
    fields = {}
    for line in block.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" not in line:
            fail(f"prereg line is not 'key: value': {line!r}")
        key, _, value = line.partition(":")
        fields[key.strip().lower()] = value.strip()
    missing = [k for k in REQUIRED_KEYS if k not in fields or not fields[k]]
    if missing:
        fail(f"prereg block missing required keys: {', '.join(missing)}")
    return fields


def validate_registry(registry, registry_path):
    """Schema-validate the registry. jsonschema is optional: warn + skip
    when it is not importable or the schema file is absent; fail closed
    on actual violations when validation does run."""
    try:
        import jsonschema
    except ImportError:
        warn("jsonschema not installed: registry schema validation skipped")
        return
    if not SCHEMA_PATH.is_file():
        warn(f"schema not found at {SCHEMA_PATH}: validation skipped")
        return
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    validator_cls = getattr(jsonschema, "Draft202012Validator", None)
    if validator_cls is not None:
        errors = sorted(
            validator_cls(schema).iter_errors(registry),
            key=lambda e: str(e.json_path),
        )
        if errors:
            fail(
                f"registry {registry_path} fails schema validation: "
                + "; ".join(f"{e.json_path}: {e.message}" for e in errors[:3])
            )
    else:
        try:
            jsonschema.validate(registry, schema)
        except jsonschema.exceptions.ValidationError as e:
            fail(f"registry {registry_path} fails schema validation: {e.message}")


def load_chain(args, hyp_id, plan_path, sha):
    """Return [{task, verify}, ...] from --tasks or the default 3-step chain."""
    if args.tasks:
        with open(args.tasks, encoding="utf-8") as f:
            steps = json.load(f)
        if not isinstance(steps, list) or not steps:
            fail("--tasks JSON must be a non-empty list")
        for i, step in enumerate(steps, 1):
            if not isinstance(step, dict) or "task" not in step or "verify" not in step:
                fail(f"--tasks step {i} must be an object with 'task' and 'verify'")
        return [{"task": str(s["task"]), "verify": str(s["verify"])} for s in steps]
    return [
        {
            "task": f"Build instruments + dataset for {hyp_id} per {plan_path} (prereg {sha[:12]})",
            "verify": f"instruments named in {plan_path} exist and their unit tests pass",
        },
        {
            "task": f"Run the {hyp_id} measurement per {plan_path} -> results JSON",
            "verify": f"results JSON exists per the dataset/observable spec in {plan_path}",
        },
        {
            "task": f"stopping_gate verdict on {hyp_id} results + registry update",
            "verify": "bin/stopping_gate.py exits 0/2/3 on the results descriptor",
        },
    ]


def sanitize_cell(text):
    """Table cells must not contain pipes or newlines."""
    return " ".join(str(text).replace("|", "/").split())


def existing_chain_rows(ledger_text, rq_id):
    """Return sorted list of existing step numbers for R.{rq_id}.N rows."""
    pat = re.compile(r"^\|\s*R\.%s\.(\d+)\s*\|" % re.escape(rq_id), re.M)
    return sorted(int(n) for n in pat.findall(ledger_text))


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--plan", required=True, help="RQ plan markdown with one ```prereg block")
    ap.add_argument("--rq", required=True, help="rq_id token from the registry, e.g. EXAMPLE1")
    ap.add_argument("--ledger", default=None,
                    help="task ledger to append the chain to (default: config ledger_path)")
    ap.add_argument("--registry", default=None,
                    help="RQ registry JSON (default: config registry_path)")
    ap.add_argument("--tasks", default=None, help="JSON list of {task, verify} chain steps")
    ap.add_argument("--date", default=date.today().isoformat())
    args = ap.parse_args()

    registry_path = args.registry
    ledger_path = args.ledger
    if registry_path is None or ledger_path is None:
        try:
            cfg = labconfig.ensure_home()
        except (OSError, json.JSONDecodeError, KeyError) as e:
            fail(f"cannot load lab config: {e}")
        registry_path = registry_path or cfg["registry_path"]
        ledger_path = ledger_path or cfg["ledger_path"]

    plan_path = os.path.abspath(args.plan)
    if not os.path.isfile(plan_path):
        fail(f"plan not found: {plan_path}")
    with open(plan_path, encoding="utf-8") as f:
        plan_text = f.read()

    block, sha = extract_prereg(plan_text)
    fields = parse_prereg(block)

    try:
        with open(registry_path, encoding="utf-8") as f:
            registry = json.load(f)
    except (OSError, json.JSONDecodeError) as e:
        fail(f"cannot read registry {registry_path}: {e}")
    validate_registry(registry, registry_path)
    matches = [e for e in registry.get("entries", []) if e.get("rq_id") == args.rq]
    if not matches:
        fail(f"rq_id {args.rq!r} not in registry {registry_path}")
    entry = matches[0]
    hyp_id = entry.get("source_hypothesis_id") or args.rq

    # Fail-closed identity check: the prereg hypothesis line must name the RQ.
    hyp_line = fields["hypothesis"]
    if hyp_id not in hyp_line and args.rq not in hyp_line:
        fail(
            f"prereg hypothesis line {hyp_line!r} names neither "
            f"{hyp_id} nor {args.rq}"
        )

    chain = load_chain(args, hyp_id, plan_path, sha)

    ledger_text = ""
    if os.path.isfile(ledger_path):
        with open(ledger_path, encoding="utf-8") as f:
            ledger_text = f.read()

    existing = existing_chain_rows(ledger_text, args.rq)
    start = (existing[-1] + 1) if existing else 1
    prev_id = f"R.{args.rq}.{existing[-1]}" if existing else None

    rows = []
    new_ids = []
    for offset, step in enumerate(chain):
        rid = f"R.{args.rq}.{start + offset}"
        dep = prev_id if prev_id else "-"
        rows.append(
            f"| {rid} | {sanitize_cell(step['task'])} | TODO | {dep} "
            f"| {sanitize_cell(step['verify'])} |"
        )
        new_ids.append(rid)
        prev_id = rid

    out = []
    if ledger_text and not ledger_text.endswith("\n"):
        out.append("\n")
    if LANE_HEADER not in ledger_text:
        if ledger_text:
            out.append("\n")
        out.append(f"{LANE_HEADER}\n\n{TABLE_HEADER}\n{TABLE_RULE}\n")
    out.append("\n".join(rows) + "\n")
    pathlib.Path(ledger_path).parent.mkdir(parents=True, exist_ok=True)
    with open(ledger_path, "a", encoding="utf-8") as f:
        f.write("".join(out))

    # Registry update: plan_path, prereg_sha, SCOPED, chain ids.
    entry["plan_path"] = plan_path
    entry["prereg_sha"] = sha
    old_status = entry.get("status", "CANDIDATE")
    if old_status in SCOPABLE:
        entry["status"] = "SCOPED"
    ledger_tasks = entry.setdefault("ledger_tasks", [])
    for rid in new_ids:
        if rid not in ledger_tasks:
            ledger_tasks.append(rid)
    registry["updated"] = args.date
    with open(registry_path, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(json.dumps({
        "rq_id": args.rq,
        "source_hypothesis_id": hyp_id,
        "prereg_sha": sha,
        "status": entry["status"],
        "status_note": (
            "set to SCOPED" if old_status in SCOPABLE
            else f"kept {old_status} (not in {'/'.join(SCOPABLE)})"
        ),
        "plan_path": plan_path,
        "rows_appended": new_ids,
        "ledger": os.path.abspath(ledger_path),
        "registry": os.path.abspath(registry_path),
    }, indent=2))


if __name__ == "__main__":
    main()
