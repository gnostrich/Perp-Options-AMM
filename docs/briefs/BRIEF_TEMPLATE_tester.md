# subagent_briefs/BRIEF_TEMPLATE_tester.md

Fill brackets, dispatch, verify the return. The tester drives the real HTML in a browser — the one check the manager can't do from math alone. The manager still cross-checks every reported number against the engine (the V5 lesson: a displayed number matching a *wrong* formula is a PASS that means nothing).

---
**Role:** tester. **Build:** `[path + md5]`. Open in a real/headless browser, devtools console visible the whole run.
**What this run confirms:** `[the browser-only thing — display values, visuals, health]`.

**Checks (each: PASS condition + FAIL signal):**
- `[Check A — e.g. metric reads sane: exact expected neighborhood + the FAIL signal (pinned/NaN/shrinking)]`
- `[Check B — wording/state present, old gone]`
- `[Check C — visual invariant holds through transitions; note any EXPECTED new behavior so it isn't mis-flagged]`
- Health: zero red console errors across the session; `[N]` trades execute and settle.

**Discipline:**
- Report **exact on-screen numbers/text**, not "looks right."
- Distinguish **expected new behavior** from regressions (e.g. the frame re-fit now visibly moves on rebase — intended; flag only clipping or marker-off-curve).

**Stopping condition:** any FAIL signal, blank page / missing blob, or red console errors → STOP and report with: which check, the exact numbers/text, a screenshot, the full console, and your inputs. Don't patch.

**Deliverable:** an evidence PDF/zip — per-check screenshots + parsed values + a one-line verdict per check. Back to the manager, who reproduces the headline numbers from the engine before accepting.
