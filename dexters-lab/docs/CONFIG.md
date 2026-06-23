# Configuration Reference

One JSON file configures the whole lab. Copy `lab.config.example.json` to `lab.config.json` and edit `lab_home`. Everything else has sane defaults.

## How tools find the config

Every tool loads paths through `lib/labconfig.py`, in this order:

1. `$DEXTERS_LAB_CONFIG`: an explicit path in the environment. Tests use this to stay hermetic. So can you, to run several labs side by side.
2. `./lab.config.json` in the current working directory.
3. `<repo>/lab.config.json` next to the code.
4. `<repo>/lab.config.example.json` as a last resort, which puts `lab_home` at `~/dexters-lab-home`.

If none of those exist the loader raises. Tools do not invent paths.

## Path expansion

Every path value supports two forms of expansion:

- `~` expands to your home directory.
- `{lab_home}` expands to the resolved `lab_home` value, so the example config works unchanged on any machine.

`labconfig.ensure_home()` creates the `lab_home` directory tree on first use. Tools never fail on a missing folder.

## Keys

### Top level

| Key | Type | Default | Meaning |
|---|---|---|---|
| `lab_name` | string | `"dexters-lab"` | Display name. Used in logs and report headers. |
| `lab_home` | path | `"~/dexters-lab-home"` | The one directory that holds all lab state. Set this first. |
| `registry_path` | path | `"{lab_home}/rq_registry.json"` | The hypothesis registry: one entry per RQ with its prereg sha and status. |
| `ledger_path` | path | `"{lab_home}/TASK_LEDGER.md"` | The task ledger. Markdown table rows: id, task, status, deps, verify. |
| `verdict_log_path` | path | `"{lab_home}/VERDICT_LOG.md"` | Append-only log of stopping-gate verdicts. |
| `reviews_dir` | path | `"{lab_home}/reviews"` | Output directory for paper reviews. |
| `drafts_dir` | path | `"{lab_home}/drafts"` | Output directory for the literature lane. |
| `milestone_hook` | string or null | `null` | Optional command run after each scored verdict, with the scorecard JSON on stdin. Failures warn; they never change the verdict. |
| `python` | string | `"python3"` | Interpreter name the tools use when they spawn helpers. |

### `stopping_rules`

Thresholds for the five gates. Changing any of these is an H4 governance decision (see GOVERNANCE.md).

| Key | Type | Default | Meaning |
|---|---|---|---|
| `rule1_ci_excludes_zero` | bool | `true` | Rule 1 on/off. Leave it on. A CI touching zero fails. |
| `rule2_r2_min` | number | `0.5` | Minimum R² of the headline fit. |
| `rule3_stratum_spread_max` | number | `3.0` | Maximum ratio between the largest and smallest per-stratum effect magnitude. |
| `rule4_instrument_precision_min` | number | `0.85` | Minimum instrument precision on a gold set. |
| `rule5_kappa_min` | number | `0.7` | Minimum Cohen's kappa for inter-rater agreement, where raters exist. |

### `budget`

| Key | Type | Default | Meaning |
|---|---|---|---|
| `monthly_cap_usd` | number | `40` | Hard monthly cap on paid calls made through lab tools. At or over the cap, spending tools halt politely. |
| `spend_ledger` | path | `"{lab_home}/spend.jsonl"` | Append-only JSONL spend records, one object per paid call. |

### `openrouter`

Used only by the review panel (`lab_review`, `lab_openrouter`). Nothing else in the lab talks to a paid API.

| Key | Type | Default | Meaning |
|---|---|---|---|
| `api_key_env` | string | `"OPENROUTER_API_KEY"` | Name of the environment variable that holds your OpenRouter key. The key itself never goes in the config file. |
| `panel_models_preference` | list of strings | `["deepseek/deepseek-r1", "moonshotai/kimi-k2-thinking", "z-ai/glm-4.7"]` | OpenRouter model ids the panel tries, in order. First available model wins. Edit freely; prefer heavyweight reasoning models. |

## Internal keys

The loader injects `_config_path` (the path of the config file it actually used) into the dict it returns. Tools may print it for debugging. Do not set it yourself.

## Environment variables

| Variable | Effect |
|---|---|
| `DEXTERS_LAB_CONFIG` | Absolute path to a config file. Wins over every other location. |
| `OPENROUTER_API_KEY` | The panel's API key (or whatever name you set in `openrouter.api_key_env`). |

## Worked example

Two labs on one machine:

```bash
DEXTERS_LAB_CONFIG=~/labs/ml-safety.config.json python3 bin/stopping_gate.py score run1.json
DEXTERS_LAB_CONFIG=~/labs/biotech.config.json   python3 bin/stopping_gate.py score run2.json
```

Each config points at its own `lab_home`. Registries, ledgers, and budgets stay fully separate.
