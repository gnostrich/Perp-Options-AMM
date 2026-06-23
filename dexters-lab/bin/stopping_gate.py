#!/usr/bin/env python3
"""stopping_gate.py: machine gate for the 5 universal stopping rules.

Every empirical RQ in the lab is scored against the same 5 rules. This
script turns the human scorecard into a deterministic, testable gate.
Stdlib only. All paths and thresholds come from the shared lab config
(lib/labconfig.py).

Usage:
    stopping_gate.py score <verdict_input.json> [--prereg [registry.json]]
                            [--apply-side-effects] [--no-events]

verdict_input.json schema:
    {
      "rq_id": str,                 required. Stable id from the registry.
      "claim": str,                 required. One-sentence claim under test.
      "effect": {                   required. The headline effect estimate.
          "name": str,              what the effect is.
          "point": float,           point estimate.
          "ci_low": float,          lower bound of the 95% CI.
          "ci_high": float          upper bound of the 95% CI.
      },
      "r2": float | null,           R^2 of the headline fit. null -> rule2
                                    not_applicable.
      "strata": [                   optional, default []. Per-stratum effect
          {"name": str,             estimates (per-ecosystem, per-engine,
           "effect": float}         per-cohort...). Fewer than 2 strata ->
      ],                            rule3 not_applicable.
      "instrument": {               required key.
          "precision": float|null,  measurement-instrument precision on gold.
                                    null -> rule4 not_applicable.
          "kappa": float | null     inter-rater Cohen's kappa. null -> rule5
                                    not_applicable.
      },
      "prereg_sha": str | null,     sha of the pre-registered plan, if any.
      "sources": [str, ...],        result files the numbers came from.
      "notes": str                  free text: caveats, derivations.
    }

The 5 rules (thresholds from lab.config.json "stopping_rules"; the
defaults below apply when a key is absent):
    rule1  effect 95% CI excludes zero (ci_low > 0 or ci_high < 0; a CI
           touching zero fails). Config key rule1_ci_excludes_zero is a
           bool; false disables the rule (not_applicable), which also
           removes the FALSIFIED verdict path.
    rule2  r2 >= rule2_r2_min (default 0.5).
    rule3  per-stratum effect spread <= rule3_stratum_spread_max (default
           3.0). Spread = max(|effect|)/min(|effect|) over same-sign
           nonzero effects. Mixed signs fail outright (the spread is then
           computed over the majority-sign subset and reported with a
           "mixed signs" note). Fewer than 2 usable strata ->
           not_applicable.
    rule4  instrument precision >= rule4_instrument_precision_min
           (default 0.85). precision null -> not_applicable.
    rule5  Cohen's kappa >= rule5_kappa_min (default 0.7). kappa null ->
           not_applicable.

Output: scorecard JSON to stdout AND written next to the input. If the
input path ends in ".json" the scorecard path replaces that suffix with
".scorecard.json"; otherwise ".scorecard.json" is appended.

Exit codes:
    0  VALIDATED   all applicable rules pass.
    2  PARTIAL     >= 1 applicable rule fails but rule1 passes.
    3  FALSIFIED   rule1 fails (effect CI includes zero).
    4  pre-registration refusal: the registry entry for rq_id carries a
       prereg_sha that differs from the input's prereg_sha. No scorecard
       is written.
    1  usage / input error (missing file, bad JSON, missing fields).

Pre-registration guard: --prereg takes an optional registry path; with
no value it uses the config registry_path. The registry may be the lab
registry ({"entries": [{"rq_id": ..., "prereg_sha": ...}, ...]}), a dict
keyed by rq_id, or a bare list of entries. If the entry for this rq_id
has a non-null prereg_sha and the input's prereg_sha differs (including
input null), scoring is refused with exit 4. No entry, or an entry
without a prereg_sha, means no constraint.

Side effects (only with --apply-side-effects):
    (a) Append a one-line dated row to the verdict log at the config
        verdict_log_path. Created with a header if absent. Columns:
        | date | rq_id | verdict | rules_passed | scorecard_path |.
    (b) Unless --no-events: if the config milestone_hook is a non-null
        string, run it as a shell command with the milestone event JSON
        on stdin (timeout 60s). This is the integration point where an
        org wires its own event bus, chat webhook, or database insert.
        Any hook failure degrades to a stderr warning; the gate's exit
        code is always the verdict code.
"""

import json
import pathlib
import subprocess
import sys
from datetime import datetime, timezone

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "lib"))
import labconfig  # noqa: E402

GATE_VERSION = "1.0.0"
HOOK_TIMEOUT_S = 60

DEFAULT_RULES = {
    "rule1_ci_excludes_zero": True,
    "rule2_r2_min": 0.5,
    "rule3_stratum_spread_max": 3.0,
    "rule4_instrument_precision_min": 0.85,
    "rule5_kappa_min": 0.7,
}

VERDICT_LOG_HEADER = (
    "# Verdict Log\n"
    "\n"
    "Append-only log of stopping-gate verdicts. One row per scored RQ.\n"
    "Written by bin/stopping_gate.py with --apply-side-effects.\n"
    "\n"
    "| date | rq_id | verdict | rules_passed | scorecard_path |\n"
    "|---|---|---|---|---|\n"
)


def _err(msg):
    print(f"stopping_gate: ERROR: {msg}", file=sys.stderr)


def _warn(msg):
    print(f"stopping_gate: WARNING: {msg}", file=sys.stderr)


def _require(d, key, typ, ctx):
    if key not in d:
        raise ValueError(f"missing required field '{key}' in {ctx}")
    v = d[key]
    if typ is float:
        if not isinstance(v, (int, float)) or isinstance(v, bool):
            raise ValueError(f"field '{key}' in {ctx} must be a number")
        return float(v)
    if not isinstance(v, typ):
        raise ValueError(f"field '{key}' in {ctx} must be {typ.__name__}")
    return v


def _num_or_none(d, key, ctx):
    v = d.get(key)
    if v is None:
        return None
    if not isinstance(v, (int, float)) or isinstance(v, bool):
        raise ValueError(f"field '{key}' in {ctx} must be a number or null")
    return float(v)


def resolve_rules(cfg):
    """Merge the config stopping_rules over the defaults."""
    rules = dict(DEFAULT_RULES)
    configured = cfg.get("stopping_rules")
    if isinstance(configured, dict):
        for k in DEFAULT_RULES:
            if k in configured:
                rules[k] = configured[k]
    return rules


# ---------------------------------------------------------------------------
# Rules
# ---------------------------------------------------------------------------

def rule1_ci_excludes_zero(effect, enabled=True):
    lo, hi = effect["ci_low"], effect["ci_high"]
    base = {
        "name": "effect 95% CI excludes zero",
        "value": [lo, hi],
        "threshold": "ci_low > 0 or ci_high < 0",
    }
    if not enabled:
        return {
            **base,
            "status": "not_applicable",
            "note": "rule1 disabled by lab config (rule1_ci_excludes_zero: false)",
        }
    return {**base, "status": "pass" if (lo > 0 or hi < 0) else "fail"}


def rule2_r2(r2, r2_min=0.5):
    base = {"name": f"R^2 >= {r2_min}", "threshold": r2_min}
    if r2 is None:
        return {
            **base,
            "value": None,
            "status": "not_applicable",
            "note": "r2 is null in the input",
        }
    return {**base, "value": r2, "status": "pass" if r2 >= r2_min else "fail"}


def rule3_stratum_spread(strata, spread_max=3.0):
    base = {
        "name": f"per-stratum effect spread <= {spread_max}x",
        "threshold": spread_max,
    }
    effects = [s["effect"] for s in strata if s.get("effect") not in (None, 0)]
    if len(effects) < 2:
        return {
            **base,
            "value": None,
            "status": "not_applicable",
            "note": f"{len(effects)} usable strata (< 2)",
        }
    pos = [e for e in effects if e > 0]
    neg = [e for e in effects if e < 0]
    if pos and neg:
        majority = pos if len(pos) >= len(neg) else neg
        mags = [abs(e) for e in majority]
        spread = max(mags) / min(mags) if len(mags) >= 2 else None
        return {
            **base,
            "value": spread,
            "status": "fail",
            "note": (
                f"mixed signs ({len(pos)} positive / {len(neg)} negative); "
                "spread computed over the majority-sign subset"
            ),
        }
    mags = [abs(e) for e in effects]
    spread = max(mags) / min(mags)
    return {
        **base,
        "value": spread,
        "status": "pass" if spread <= spread_max else "fail",
    }


def rule4_precision(instrument, precision_min=0.85):
    base = {
        "name": f"instrument precision >= {precision_min}",
        "threshold": precision_min,
    }
    p = instrument.get("precision")
    if p is None:
        return {
            **base,
            "value": None,
            "status": "not_applicable",
            "note": "precision is null in the input",
        }
    return {**base, "value": p, "status": "pass" if p >= precision_min else "fail"}


def rule5_kappa(instrument, kappa_min=0.7):
    base = {"name": f"Cohen's kappa >= {kappa_min}", "threshold": kappa_min}
    k = instrument.get("kappa")
    if k is None:
        return {
            **base,
            "value": None,
            "status": "not_applicable",
            "note": "kappa is null: inter-rater agreement not applicable",
        }
    return {**base, "value": k, "status": "pass" if k >= kappa_min else "fail"}


# ---------------------------------------------------------------------------
# Scoring
# ---------------------------------------------------------------------------

def validate_input(data):
    """Validate the verdict_input dict. Returns the normalized dict.

    Raises ValueError on any schema violation.
    """
    ctx = "verdict_input"
    _require(data, "rq_id", str, ctx)
    _require(data, "claim", str, ctx)
    effect = _require(data, "effect", dict, ctx)
    _require(effect, "name", str, "effect")
    _require(effect, "point", float, "effect")
    effect["ci_low"] = _require(effect, "ci_low", float, "effect")
    effect["ci_high"] = _require(effect, "ci_high", float, "effect")
    if effect["ci_low"] > effect["ci_high"]:
        raise ValueError("effect.ci_low > effect.ci_high")
    data["r2"] = _num_or_none(data, "r2", ctx)
    strata = data.get("strata") or []
    if not isinstance(strata, list):
        raise ValueError("strata must be a list")
    for i, s in enumerate(strata):
        if not isinstance(s, dict):
            raise ValueError(f"strata[{i}] must be an object")
        _require(s, "name", str, f"strata[{i}]")
        s["effect"] = _require(s, "effect", float, f"strata[{i}]")
    data["strata"] = strata
    instrument = _require(data, "instrument", dict, ctx)
    instrument["precision"] = _num_or_none(instrument, "precision", "instrument")
    instrument["kappa"] = _num_or_none(instrument, "kappa", "instrument")
    return data


def score(data, stopping_rules=None):
    """Score a validated verdict_input dict. Returns the scorecard dict."""
    r = dict(DEFAULT_RULES)
    if stopping_rules:
        r.update(stopping_rules)
    rules = {
        "rule1": rule1_ci_excludes_zero(
            data["effect"], enabled=bool(r["rule1_ci_excludes_zero"])
        ),
        "rule2": rule2_r2(data["r2"], r2_min=r["rule2_r2_min"]),
        "rule3": rule3_stratum_spread(
            data["strata"], spread_max=r["rule3_stratum_spread_max"]
        ),
        "rule4": rule4_precision(
            data["instrument"], precision_min=r["rule4_instrument_precision_min"]
        ),
        "rule5": rule5_kappa(data["instrument"], kappa_min=r["rule5_kappa_min"]),
    }
    applicable = [v for v in rules.values() if v["status"] != "not_applicable"]
    passed = [v for v in applicable if v["status"] == "pass"]
    if rules["rule1"]["status"] == "fail":
        verdict = "FALSIFIED"
    elif len(passed) == len(applicable):
        verdict = "VALIDATED"
    else:
        verdict = "PARTIAL"
    return {
        "rq_id": data["rq_id"],
        "claim": data["claim"],
        "verdict": verdict,
        "rules": rules,
        "rules_passed": f"{len(passed)}/{len(applicable)}",
        "scored_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "gate_version": GATE_VERSION,
    }


VERDICT_EXIT = {"VALIDATED": 0, "PARTIAL": 2, "FALSIFIED": 3}


def scorecard_path_for(input_path):
    if input_path.endswith(".json"):
        return input_path[: -len(".json")] + ".scorecard.json"
    return input_path + ".scorecard.json"


# ---------------------------------------------------------------------------
# Pre-registration guard
# ---------------------------------------------------------------------------

def prereg_check(registry_path, rq_id, input_sha):
    """Returns (ok: bool, message: str)."""
    with open(registry_path) as f:
        registry = json.load(f)
    entries = None
    entry = None
    if isinstance(registry, dict) and isinstance(registry.get("entries"), list):
        entries = registry["entries"]
    elif isinstance(registry, list):
        entries = registry
    elif isinstance(registry, dict):
        entry = registry.get(rq_id)
    if entries is not None:
        for e in entries:
            if isinstance(e, dict) and e.get("rq_id") == rq_id:
                entry = e
                break
    if not isinstance(entry, dict):
        return True, f"no registry entry for '{rq_id}': no prereg constraint"
    registered = entry.get("prereg_sha")
    if registered is None:
        return True, f"registry entry for '{rq_id}' has no prereg_sha"
    if input_sha != registered:
        return False, (
            f"prereg_sha mismatch for '{rq_id}': registry has "
            f"{registered!r}, input has {input_sha!r}. Refusing to score."
        )
    return True, "prereg_sha matches the registry"


# ---------------------------------------------------------------------------
# Side effects
# ---------------------------------------------------------------------------

def append_verdict_log(scorecard, scorecard_path, cfg):
    log_path = pathlib.Path(cfg["verdict_log_path"])
    log_path.parent.mkdir(parents=True, exist_ok=True)
    if not log_path.exists():
        log_path.write_text(VERDICT_LOG_HEADER)
    date = scorecard["scored_at"][:10]
    row = (
        f"| {date} | {scorecard['rq_id']} | {scorecard['verdict']} "
        f"| {scorecard['rules_passed']} | {scorecard_path} |\n"
    )
    with open(log_path, "a") as f:
        f.write(row)
    return str(log_path)


def run_milestone_hook(data, scorecard, scorecard_path, cfg):
    """Run the configured milestone hook with the event JSON on stdin.

    The hook is the lab's own integration seam: any shell command set as
    milestone_hook in lab.config.json (an event-bus publisher, a curl to
    a webhook, a database insert). Degrades to a warning on any failure;
    never changes the gate verdict.
    """
    hook = cfg.get("milestone_hook")
    if not isinstance(hook, str) or not hook.strip():
        _warn("milestone hook skipped: milestone_hook is not configured")
        return False
    event = {
        "event_type": "research.milestone",
        "actor": cfg.get("lab_name", "dexters-lab"),
        "subject": f"{data['rq_id']} scored {scorecard['verdict']} by stopping_gate",
        "payload": {
            "rq_id": data["rq_id"],
            "claim": data["claim"],
            "verdict": scorecard["verdict"],
            "rules_passed": scorecard["rules_passed"],
            "rules": {
                k: {"status": v["status"], "value": v["value"]}
                for k, v in scorecard["rules"].items()
            },
            "effect_name": data["effect"]["name"],
            "effect_point": data["effect"]["point"],
            "effect_ci": [data["effect"]["ci_low"], data["effect"]["ci_high"]],
            "r2": data["r2"],
            "scorecard_path": scorecard_path,
            "sources": data.get("sources", []),
            "gate_version": GATE_VERSION,
            "scored_at": scorecard["scored_at"],
        },
    }
    try:
        proc = subprocess.run(
            hook,
            shell=True,
            input=json.dumps(event),
            capture_output=True,
            text=True,
            timeout=HOOK_TIMEOUT_S,
        )
        if proc.stdout.strip():
            print(proc.stdout.strip(), file=sys.stderr)
        if proc.returncode != 0:
            _warn(
                f"milestone hook exited {proc.returncode}: "
                f"{proc.stderr.strip()[:500]}"
            )
            return False
        return True
    except Exception as e:  # noqa: BLE001 - degrade gracefully, never crash the gate
        _warn(f"milestone hook failed: {e}")
        return False


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

USE_CFG_REGISTRY = "__use_config_registry__"


def main(argv):
    if len(argv) < 2 or argv[0] != "score":
        _err(
            "usage: stopping_gate.py score <verdict_input.json> "
            "[--prereg [registry.json]] [--apply-side-effects] [--no-events]"
        )
        return 1
    input_path = str(pathlib.Path(argv[1]).resolve())
    rest = argv[2:]
    prereg_path = None
    apply_side_effects = False
    no_events = False
    i = 0
    while i < len(rest):
        arg = rest[i]
        if arg == "--prereg":
            if i + 1 < len(rest) and not rest[i + 1].startswith("--"):
                prereg_path = rest[i + 1]
                i += 2
            else:
                prereg_path = USE_CFG_REGISTRY
                i += 1
        elif arg == "--apply-side-effects":
            apply_side_effects = True
            i += 1
        elif arg == "--no-events":
            no_events = True
            i += 1
        else:
            _err(f"unknown argument: {arg}")
            return 1

    try:
        cfg = labconfig.ensure_home()
    except (OSError, json.JSONDecodeError, KeyError) as e:
        _err(f"cannot load lab config: {e}")
        return 1

    try:
        with open(input_path) as f:
            data = json.load(f)
    except (OSError, json.JSONDecodeError) as e:
        _err(f"cannot read input {input_path}: {e}")
        return 1
    try:
        data = validate_input(data)
    except ValueError as e:
        _err(str(e))
        return 1

    if prereg_path == USE_CFG_REGISTRY:
        prereg_path = cfg["registry_path"]
    if prereg_path:
        try:
            ok, msg = prereg_check(prereg_path, data["rq_id"], data.get("prereg_sha"))
        except (OSError, json.JSONDecodeError) as e:
            _err(f"cannot read prereg registry {prereg_path}: {e}")
            return 1
        if not ok:
            _err(msg)
            return 4
        _warn(f"prereg: {msg}")

    scorecard = score(data, stopping_rules=resolve_rules(cfg))
    out_path = scorecard_path_for(input_path)
    with open(out_path, "w") as f:
        json.dump(scorecard, f, indent=2)
        f.write("\n")
    print(json.dumps(scorecard, indent=2))

    if apply_side_effects:
        try:
            log_path = append_verdict_log(scorecard, out_path, cfg)
            _warn(f"verdict log appended: {log_path}")
        except OSError as e:
            _warn(f"verdict log append failed: {e}")
        if not no_events:
            published = run_milestone_hook(data, scorecard, out_path, cfg)
            _warn(
                f"milestone hook: {'ok' if published else 'degraded (see warnings)'}"
            )

    return VERDICT_EXIT[scorecard["verdict"]]


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
