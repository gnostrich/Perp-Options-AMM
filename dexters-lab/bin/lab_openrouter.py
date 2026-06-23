#!/usr/bin/env python3
"""Lab OpenRouter client: heavy open-source model calls for large-scale
verification and search tasks explicitly delegated off the main seat.

Usage:
  lab_openrouter.py models                          # list available model ids
  lab_openrouter.py ask <model_id> [--max-tokens N] < prompt.txt
  lab_openrouter.py ask <model_id> --prompt "..."

The API key comes from the environment variable named by the lab config
key `openrouter.api_key_env` (default OPENROUTER_API_KEY). No key files
are read; export the variable before running.

Every `ask` is budget-guarded and its reported cost is logged to the
shared spend ledger via lab_budget (consumer name: "openrouter").

Stdlib only. Prints the model's text to stdout; metadata to stderr.
"""
from __future__ import annotations

import json
import os
import sys
import pathlib
import urllib.request

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "lib"))
import labconfig  # noqa: E402

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import lab_budget  # noqa: E402

BASE = "https://openrouter.ai/api/v1"
CONSUMER = "openrouter"


def api_key(cfg: dict) -> str:
    key_env = cfg.get("openrouter", {}).get("api_key_env", "OPENROUTER_API_KEY")
    key = os.environ.get(key_env)
    if key:
        return key
    sys.exit(f"lab_openrouter: environment variable {key_env} is not set "
             f"(named by openrouter.api_key_env in {cfg.get('_config_path')})")


def req(cfg: dict, path: str, payload: dict | None = None) -> dict:
    url = BASE + path
    data = json.dumps(payload).encode() if payload is not None else None
    r = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {api_key(cfg)}",
            "Content-Type": "application/json",
            "X-Title": cfg.get("lab_name", "dexters-lab"),
        },
        method="POST" if data else "GET",
    )
    with urllib.request.urlopen(r, timeout=900) as resp:
        return json.loads(resp.read())


def cmd_models(cfg: dict) -> None:
    out = req(cfg, "/models")
    for m in out.get("data", []):
        print(m["id"])


def cmd_ask(cfg: dict, model: str, prompt: str, max_tokens: int) -> None:
    ok, mtd = lab_budget.check_budget()
    if not ok:
        sys.exit(f"lab_openrouter: budget cap reached (MTD ${mtd}); halting. "
                 f"Raise {lab_budget.CAP_ENV} or budget.monthly_cap_usd to continue.")
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "usage": {"include": True},
    }
    out = req(cfg, "/chat/completions", payload)
    choice = out["choices"][0]
    text = choice["message"].get("content") or ""
    reasoning = choice["message"].get("reasoning") or ""
    usage = out.get("usage", {})
    cost = usage.get("cost") or 0.0
    meta = {
        "model": out.get("model", model),
        "prompt_tokens": usage.get("prompt_tokens"),
        "completion_tokens": usage.get("completion_tokens"),
        "cost_usd": cost,
        "finish_reason": choice.get("finish_reason"),
    }
    print(json.dumps(meta), file=sys.stderr)
    if cost:
        try:
            lab_budget.record_spend(CONSUMER, float(cost), {"model": model})
        except Exception as e:
            print(f"lab_openrouter: WARNING: spend not logged: {e}",
                  file=sys.stderr)
    if reasoning and not text:
        print(reasoning)
    else:
        print(text)


def main() -> None:
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help"):
        print(__doc__)
        return
    cfg = labconfig.ensure_home()
    if sys.argv[1] == "models":
        return cmd_models(cfg)
    if sys.argv[1] == "ask":
        if len(sys.argv) < 3:
            sys.exit("lab_openrouter: ask needs a model id")
        model = sys.argv[2]
        max_tokens = 8000
        prompt = None
        args = sys.argv[3:]
        i = 0
        while i < len(args):
            if args[i] == "--max-tokens":
                max_tokens = int(args[i + 1]); i += 2
            elif args[i] == "--prompt":
                prompt = args[i + 1]; i += 2
            else:
                i += 1
        if prompt is None:
            prompt = sys.stdin.read()
        return cmd_ask(cfg, model, prompt, max_tokens)
    sys.exit(f"lab_openrouter: unknown command {sys.argv[1]}")


if __name__ == "__main__":
    main()
