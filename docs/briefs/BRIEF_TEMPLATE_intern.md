# subagent_briefs/BRIEF_TEMPLATE_intern.md

Fill the brackets, dispatch, then verify the return per `00_ORCHESTRATOR_START_HERE.md` §3/§7. Keep it to one task.

---
**Role:** implementation intern. **Mode:** implement only after the scope below; brainstorm otherwise.
**Base file:** `[path + md5]`. Work on a copy; never edit a read-only mount in place.
**Scope (exact):** `[the one change — what, where, the formula]`.
**Out of scope:** `[everything adjacent you must NOT touch — name it]`. In particular: do **not** touch the GH curve, calibration, or funding unless the scope says so.

**Discipline:**
- `getMP_raw` is the **price coordinate**, not the slope. Geometric slope = `getMP_raw·e^(−ghMu)` (= `mpGeom`). If your change compares a price against a Δy/Δx, use `mpGeom`.
- Diff must be **surgical** — only the scoped regions. Paste the full diff in your report.
- File-safety after the edit (all must hold, else STOP): 3 `<script>` blocks parse via `new Function`; both blobs unchanged at the ratified layer (decoded-binary md5 `8d2e1a84/1b320fc5`); `Engine` IIFE + 4 signatures intact; no blob bytes in a script.

**Acceptance criteria (numbers, not adjectives):** `[exact targets — e.g. seam value-match ≤0.05%, 7 gates pass, specific displayed values]`.

**Stopping condition:** if any acceptance number misses, any file-safety check fails, or the change needs to reach into out-of-scope code — **STOP and report** with the diff + the failing number/output. Do not patch toward green. A clean incomplete stop beats a rushed pass.

**Deliverable:** one zip — patched build + a `WHAT_CHANGED.md` (diff regions + the numbers you hit) + any harness you ran. Address it back to the manager.
