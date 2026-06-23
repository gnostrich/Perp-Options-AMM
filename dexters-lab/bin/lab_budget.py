#!/usr/bin/env python3
"""Single spend ledger + governor for ALL headless lab consumers.

Every tool that spends money headlessly (the nightly executor, the
literature lane, OpenRouter calls) logs its per-run cost to ONE
append-only JSONL ledger and asks ONE governor whether it may proceed.

Paths and caps come from the shared lab config (lib/labconfig.py):
  budget.spend_ledger      where spend events land (JSONL, append-only)
  budget.monthly_cap_usd   monthly cap in USD
The environment variable LAB_BUDGET_CAP_USD overrides the config cap.

Contract (so a new consumer cannot silently disagree):
- Ledger line = one JSON object per spend event with at least:
    {"ts": "<UTC ISO8601>", "consumer": "<name>", "cost_usd": <float>, ...meta}
  `ts` MUST start with "YYYY-MM" so month-to-date summing is a prefix match.
- Month-to-date (MTD) = sum of cost_usd over lines whose ts starts with
  the current UTC month.
- A consumer halts when MTD >= cap. `guard` exits nonzero in that case.

Python API:
    import lab_budget
    ok, mtd = lab_budget.check_budget()           # before spending
    lab_budget.record_spend("lab_lit", 0.12, {"rc": 0})

CLI:
    lab_budget.py status                          # prints MTD + remaining
    lab_budget.py guard                           # exit 1 if MTD >= cap
    lab_budget.py record <consumer> <cost_usd> [json_meta]
"""
from __future__ import annotations

import datetime
import json
import os
import sys
import pathlib

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "lib"))
import labconfig  # noqa: E402

CAP_ENV = "LAB_BUDGET_CAP_USD"
DEFAULT_CAP = 40.0


def _cfg() -> dict:
    return labconfig.ensure_home()


def _ledger_path(ledger: pathlib.Path | None = None) -> pathlib.Path:
    if ledger is not None:
        return pathlib.Path(ledger)
    return pathlib.Path(_cfg()["budget"]["spend_ledger"])


def _utc_now_iso() -> str:
    return datetime.datetime.now(datetime.timezone.utc).strftime(
        "%Y-%m-%dT%H:%M:%SZ")


def _current_month() -> str:
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m")


def _resolve_cap(cap_usd: float | None = None) -> float:
    """Cap resolution order: explicit arg, $LAB_BUDGET_CAP_USD, config, default."""
    if cap_usd is not None:
        return float(cap_usd)
    env = os.environ.get(CAP_ENV)
    if env is not None and env.strip() != "":
        try:
            return float(env)
        except ValueError:
            pass
    try:
        cfg_cap = _cfg().get("budget", {}).get("monthly_cap_usd")
        if cfg_cap is not None:
            return float(cfg_cap)
    except Exception:
        pass
    return DEFAULT_CAP


def record_spend(consumer: str, cost_usd: float, meta: dict | None = None,
                 ledger: pathlib.Path | None = None) -> dict:
    """Append one spend event to the ledger and return the row written."""
    led = _ledger_path(ledger)
    row = {"ts": _utc_now_iso(), "consumer": str(consumer),
           "cost_usd": round(float(cost_usd or 0.0), 6)}
    if meta:
        # never let a meta key clobber the load-bearing fields
        for k, v in meta.items():
            if k not in ("ts", "consumer", "cost_usd"):
                row[k] = v
    led.parent.mkdir(parents=True, exist_ok=True)
    with led.open("a") as fh:
        fh.write(json.dumps(row) + "\n")
    return row


def month_to_date(ledger: pathlib.Path | None = None,
                  month: str | None = None) -> float:
    """Sum cost_usd over ledger lines whose ts starts with the given UTC month."""
    led = _ledger_path(ledger)
    month = month or _current_month()
    total = 0.0
    if not led.exists():
        return 0.0
    for line in led.read_text().splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            r = json.loads(line)
        except Exception:
            continue
        if str(r.get("ts", "")).startswith(month):
            try:
                total += float(r.get("cost_usd") or 0.0)
            except (TypeError, ValueError):
                pass
    return round(total, 6)


def check_budget(cap_usd: float | None = None,
                 ledger: pathlib.Path | None = None) -> tuple:
    """Return (ok, mtd). ok is False once MTD >= cap (consumer must halt)."""
    cap = _resolve_cap(cap_usd)
    mtd = month_to_date(ledger)
    return (mtd < cap, mtd)


def _cmd_status() -> int:
    cap = _resolve_cap(None)
    led = _ledger_path(None)
    ok, mtd = check_budget()
    print(json.dumps({
        "month": _current_month(),
        "mtd_usd": mtd,
        "cap_usd": cap,
        "remaining_usd": round(cap - mtd, 6),
        "ok": ok,
        "ledger": str(led),
        "ledger_exists": led.exists(),
    }))
    return 0


def _cmd_guard() -> int:
    ok, mtd = check_budget()
    cap = _resolve_cap(None)
    if not ok:
        sys.stderr.write(f"lab budget HALT: MTD={mtd} >= CAP={cap} "
                         f"(raise {CAP_ENV} or budget.monthly_cap_usd)\n")
        return 1
    return 0


def _cmd_record(argv: list) -> int:
    if len(argv) < 2:
        sys.stderr.write(
            "usage: lab_budget.py record <consumer> <cost_usd> [json_meta]\n")
        return 2
    consumer, cost = argv[0], argv[1]
    meta = None
    if len(argv) >= 3:
        try:
            meta = json.loads(argv[2])
        except Exception:
            meta = {"note": argv[2]}
    row = record_spend(consumer, float(cost), meta)
    print(json.dumps(row))
    return 0


USAGE = """lab_budget.py: spend ledger and monthly-cap governor.

Usage:
  lab_budget.py status                       show month-to-date spend and cap
  lab_budget.py guard                         exit 1 if MTD spend >= cap, else 0
  lab_budget.py record <consumer> <usd> [meta]  append a spend row

Cap comes from config budget.monthly_cap_usd (env LAB_BUDGET_CAP_USD overrides).
Ledger path is config budget.spend_ledger."""


def main(argv: list) -> int:
    if not argv or argv[0] in ("-h", "--help"):
        out = sys.stdout if argv and argv[0] in ("-h", "--help") else sys.stderr
        out.write(USAGE + "\n")
        return 0 if argv else 2
    cmd, rest = argv[0], argv[1:]
    if cmd == "status":
        return _cmd_status()
    if cmd == "guard":
        return _cmd_guard()
    if cmd == "record":
        return _cmd_record(rest)
    sys.stderr.write(f"unknown command: {cmd}\n")
    return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
