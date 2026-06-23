#!/usr/bin/env python3
"""lit_queue.py: round-robin queue for the scheduled literature lane.

The scheduled lane (lab_lit.sh) asks this helper each night:
  next                  -> the literature target to scan now (least-recently-done first)
  rotate <id> --date D  -> mark that target done on date D and push it to the back
  seed                  -> create the queue from templates/lit_queue.seed.json if missing
  list / validate       -> inspect the queue

The default queue file is <lab_home>/lit_queue.json, resolved through the
shared lab config (lib/labconfig.py). Pass --queue to point elsewhere.

Queue file shape (JSON):
{
  "version": 1,
  "targets": [
    {"id": "...", "slug": "...", "topic": "...", "feeds": "...",
     "status": "pending|done", "last_done": null | "YYYY-MM-DD", "runs": 0}
  ]
}

Selection rule for `next`: a target that has never run (last_done is null) is
most due; among never-run targets the lowest array index wins. Once every
target has run at least once, the one with the oldest last_done wins; ties
break by array index. The lane cycles through all targets fairly, one per night.

Validation is hand-rolled and always on. If the optional `jsonschema`
package is importable, an extra schema check runs too; if it is not
installed, that check is skipped with a warning. Stdlib only otherwise.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import pathlib
from pathlib import Path

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "lib"))
import labconfig  # noqa: E402

REPO_ROOT = Path(__file__).resolve().parent.parent
SEED_TEMPLATE = REPO_ROOT / "templates" / "lit_queue.seed.json"

REQUIRED_STR_FIELDS = ("id", "slug", "topic", "feeds")
VALID_STATUS = ("pending", "done")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

QUEUE_SCHEMA = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "required": ["version", "targets"],
    "properties": {
        "version": {"const": 1},
        "targets": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "object",
                "required": ["id", "slug", "topic", "feeds",
                             "status", "last_done", "runs"],
                "properties": {
                    "id": {"type": "string", "minLength": 1},
                    "slug": {"type": "string", "minLength": 1},
                    "topic": {"type": "string", "minLength": 1},
                    "feeds": {"type": "string", "minLength": 1},
                    "status": {"enum": ["pending", "done"]},
                    "last_done": {
                        "anyOf": [
                            {"type": "null"},
                            {"type": "string",
                             "pattern": r"^\d{4}-\d{2}-\d{2}$"},
                        ]
                    },
                    "runs": {"type": "integer", "minimum": 0},
                },
            },
        },
    },
}


def default_queue_path() -> Path:
    """<lab_home>/lit_queue.json from the shared config."""
    cfg = labconfig.ensure_home()
    return Path(cfg["lab_home"]) / "lit_queue.json"


def load_queue(path: Path) -> dict:
    """Read and parse the queue file. Raises on missing file or invalid JSON."""
    with Path(path).open(encoding="utf-8") as fh:
        return json.load(fh)


def save_queue(path: Path, data: dict) -> None:
    """Write the queue file atomically (temp file then replace)."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False)
        fh.write("\n")
    tmp.replace(path)


def validate_queue(data: object) -> list:
    """Return a list of human-readable shape errors. Empty list means valid."""
    errors = []
    if not isinstance(data, dict):
        return ["top level is not a JSON object"]
    if data.get("version") != 1:
        errors.append("version must be 1")
    targets = data.get("targets")
    if not isinstance(targets, list):
        return errors + ["targets must be a list"]
    if not targets:
        errors.append("targets list is empty")
    seen_ids = set()
    seen_slugs = set()
    for i, t in enumerate(targets):
        where = f"targets[{i}]"
        if not isinstance(t, dict):
            errors.append(f"{where} is not an object")
            continue
        for field in REQUIRED_STR_FIELDS:
            val = t.get(field)
            if not isinstance(val, str) or not val.strip():
                errors.append(f"{where}.{field} must be a non-empty string")
        tid = t.get("id")
        if isinstance(tid, str):
            if tid in seen_ids:
                errors.append(f"{where}.id duplicate: {tid}")
            seen_ids.add(tid)
        slug = t.get("slug")
        if isinstance(slug, str):
            if slug in seen_slugs:
                errors.append(f"{where}.slug duplicate: {slug}")
            seen_slugs.add(slug)
        status = t.get("status")
        if status not in VALID_STATUS:
            errors.append(f"{where}.status must be one of {VALID_STATUS}")
        last_done = t.get("last_done")
        if last_done is not None and not (
            isinstance(last_done, str) and DATE_RE.match(last_done)
        ):
            errors.append(f"{where}.last_done must be null or YYYY-MM-DD")
        runs = t.get("runs")
        if not isinstance(runs, int) or isinstance(runs, bool) or runs < 0:
            errors.append(f"{where}.runs must be an integer >= 0")
    return errors


def jsonschema_check(data: object) -> tuple:
    """Optional extra check. Returns (status, messages) where status is
    one of "ok", "skipped", "invalid"."""
    try:
        import jsonschema
    except ImportError:
        return ("skipped",
                ["jsonschema not installed; schema check skipped "
                 "(pip install jsonschema to enable)"])
    try:
        jsonschema.validate(instance=data, schema=QUEUE_SCHEMA)
    except jsonschema.ValidationError as exc:
        return ("invalid", [exc.message])
    return ("ok", [])


def _due_key(item: tuple) -> tuple:
    """Sort key: never-run first (group 0), then oldest last_done, then array order."""
    idx, t = item
    last_done = t.get("last_done")
    if last_done is None:
        return (0, "", idx)
    return (1, str(last_done), idx)


def pick_next(data: dict) -> dict | None:
    """Return the most-due target object, or None if there are no targets."""
    targets = data.get("targets") or []
    if not targets:
        return None
    indexed = list(enumerate(targets))
    indexed.sort(key=_due_key)
    return indexed[0][1]


def rotate(data: dict, target_id: str, date: str) -> dict | None:
    """Mark target_id done on `date` (runs += 1). Return the updated target or None."""
    for t in data.get("targets") or []:
        if t.get("id") == target_id:
            t["status"] = "done"
            t["last_done"] = date
            t["runs"] = int(t.get("runs") or 0) + 1
            return t
    return None


def seed_queue(path: Path, template: Path, force: bool = False) -> bool:
    """Create the queue at `path` from the seed template.
    Returns True if written, False if it already existed (and not force)."""
    path = Path(path)
    if path.exists() and not force:
        return False
    data = load_queue(template)
    errors = validate_queue(data)
    if errors:
        raise ValueError("seed template invalid: " + "; ".join(errors))
    save_queue(path, data)
    return True


# ----------------------------------------------------------------- CLI

def _resolve_queue(args: argparse.Namespace) -> Path:
    if args.queue is not None:
        return Path(args.queue)
    return default_queue_path()


def _cmd_next(args: argparse.Namespace) -> int:
    queue = _resolve_queue(args)
    data = load_queue(queue)
    errors = validate_queue(data)
    if errors:
        sys.stderr.write("lit_queue: invalid queue:\n  " + "\n  ".join(errors) + "\n")
        return 1
    nxt = pick_next(data)
    if nxt is None:
        sys.stderr.write("lit_queue: no targets in queue\n")
        return 3
    print(json.dumps(nxt, ensure_ascii=False))
    return 0


def _cmd_rotate(args: argparse.Namespace) -> int:
    date = args.date
    if not DATE_RE.match(date):
        sys.stderr.write(f"lit_queue: --date must be YYYY-MM-DD, got {date!r}\n")
        return 2
    queue = _resolve_queue(args)
    data = load_queue(queue)
    errors = validate_queue(data)
    if errors:
        sys.stderr.write("lit_queue: invalid queue:\n  " + "\n  ".join(errors) + "\n")
        return 1
    updated = rotate(data, args.id, date)
    if updated is None:
        sys.stderr.write(f"lit_queue: no target with id {args.id!r}\n")
        return 3
    save_queue(queue, data)
    print(json.dumps(updated, ensure_ascii=False))
    return 0


def _cmd_list(args: argparse.Namespace) -> int:
    data = load_queue(_resolve_queue(args))
    print(json.dumps(data.get("targets") or [], ensure_ascii=False, indent=2))
    return 0


def _cmd_validate(args: argparse.Namespace) -> int:
    queue = _resolve_queue(args)
    try:
        data = load_queue(queue)
    except FileNotFoundError:
        sys.stderr.write(f"lit_queue: queue file not found: {queue}\n")
        return 1
    except json.JSONDecodeError as exc:
        sys.stderr.write(f"lit_queue: queue is not valid JSON: {exc}\n")
        return 1
    errors = validate_queue(data)
    if errors:
        sys.stderr.write("lit_queue: INVALID\n  " + "\n  ".join(errors) + "\n")
        return 1
    status, messages = jsonschema_check(data)
    if status == "skipped":
        sys.stderr.write("lit_queue: WARNING: " + messages[0] + "\n")
    elif status == "invalid":
        sys.stderr.write("lit_queue: INVALID (jsonschema)\n  "
                         + "\n  ".join(messages) + "\n")
        return 1
    print(f"lit_queue: OK ({len(data.get('targets') or [])} targets)")
    return 0


def _cmd_seed(args: argparse.Namespace) -> int:
    queue = _resolve_queue(args)
    template = Path(args.template) if args.template else SEED_TEMPLATE
    if not template.is_file():
        sys.stderr.write(f"lit_queue: seed template not found: {template}\n")
        return 1
    try:
        written = seed_queue(queue, template, force=args.force)
    except ValueError as exc:
        sys.stderr.write(f"lit_queue: {exc}\n")
        return 1
    if written:
        print(f"lit_queue: seeded {queue} from {template}")
    else:
        print(f"lit_queue: queue already exists, not overwritten: {queue}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Round-robin literature target queue.")
    sub = p.add_subparsers(dest="cmd", required=True)

    p_next = sub.add_parser("next", help="print the next target to scan (JSON)")
    p_next.add_argument("--queue", type=Path, default=None)
    p_next.set_defaults(func=_cmd_next)

    p_rot = sub.add_parser("rotate", help="mark a target done on a date")
    p_rot.add_argument("id")
    p_rot.add_argument("--queue", type=Path, default=None)
    p_rot.add_argument("--date", required=True, help="YYYY-MM-DD")
    p_rot.set_defaults(func=_cmd_rotate)

    p_list = sub.add_parser("list", help="print all targets (JSON)")
    p_list.add_argument("--queue", type=Path, default=None)
    p_list.set_defaults(func=_cmd_list)

    p_val = sub.add_parser("validate", help="validate queue shape")
    p_val.add_argument("--queue", type=Path, default=None)
    p_val.set_defaults(func=_cmd_validate)

    p_seed = sub.add_parser(
        "seed", help="create the queue from the seed template if missing")
    p_seed.add_argument("--queue", type=Path, default=None)
    p_seed.add_argument("--template", type=Path, default=None)
    p_seed.add_argument("--force", action="store_true",
                        help="overwrite an existing queue")
    p_seed.set_defaults(func=_cmd_seed)
    return p


def main(argv: list) -> int:
    args = build_parser().parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
