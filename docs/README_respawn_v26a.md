# Temporal — GH branch respawn package

Self-contained cold-start package for the **curve-baked GH** branch of Temporal Exchange (a
single-file HTML options-AMM simulator pricing `value ∝ S^(−γ)` over a strike continuum).
Built for a Claude Code agent + collaborators sharing a filesystem.

## Read in this order
1. **`CLAUDE.md`** — agent constitution for this environment (roles, discipline, file-safety,
   constraints, the e^μ gotcha). Drop this at the repo root so it loads as project memory. It
   supersedes the old chat-snapshot protocol: **the filesystem is now the store.**
2. **`STATE.md`** — current truth: build lineage, HEAD, open threads + owners, immediate next action.
3. **`GOTCHAS.md`** — the traps that bit us (read before touching the engine or slippage).
4. Then the area you're working in: `engine/GH_MATH.md`, `splices/SPLICE_METHOD.md`, or the spec.

## HEAD
`builds/HEAD_temporal_mvp_v26a.html` — md5 `89ae89e9df229186b134ca6638726d0c`. GH swap + v26a
fixes + slippage units fix; 7 gates green. **Build from this.** (Owed: manager verify + tester
browser re-run; then v26b ITM/American.)

## Validate in one command
```sh
sh verify/run_all.sh          # integrity (md5+blobs) + 7 gates + slope finding + slippage + splice-level
```

## Layout
```
CLAUDE.md            agent memory / constitution (load at repo root)
STATE.md             current truth — keep this updated (the new "snapshot")
GOTCHAS.md           traps & hard-won learnings
README.md            this file

builds/              the lineage; HEAD_… is the one to work from
  BUILD_LINEAGE.md     md5s, what each step changed, the canonical blob baseline + ledger flag
engine/
  gh_engine_reference.js   standalone verified GH engine (= the v25 transplant source)
  gh_verify_reference.py   high-precision (mpmath) gate reference
  gh_gates_reference.py     gate reference
  GH_MATH.md               calibration, tables, the getMP_raw=e^μ·|dy/dx| relationship, numerics
verify/
  verify_v26a_mine.js      7 GH gates × γ{1.5,2,3,4} + curveTrace 401/401 + marker on-curve
  slope_test.js            proves getMP_raw = e^ghMu · |dy/dx|
  slip_accept.js           slippage acceptance targets (γ=2)
  splice_level_check.js    runs the ACTUAL spliced legSlipFrac/legSlipUsd vs targets (gap-closer)
  seam_gate.js             smooth-pasting seam gate (for v26b)
  run_all.sh               one-command validation of HEAD
splices/
  splice_slipfix.py        slippage units fix (best splice template)
  splice_v26a_fixes.py     the three barrier-remnant fixes
  splice_v26a_finish_historical.py   Task A/B (produced the superseded 2c0337e8)
  SPLICE_METHOD.md         the file-safe editing recipe (read before any HTML edit)
specs/
  SPEC_itm_exercise_smoothpaste_NEXT.md   v26b — ITM/American (the next build)
  SLIPPAGE_SPLICE_BRIEF_done.md           the slippage fix brief (done, in HEAD)
  MANAGER_CONTEXT_NOTE.md                 the architect's orientation note (verbatim)
  FIX_NOTE_v26a_historical.md             v26a fixes brief (historical)
  RECUT_NOTE_v26a_historical.md           re-cut note (historical)
notes/
  session_tree_note.md       canonical append-only session history
  temporal_formal_spec.md     Lean formal spec (prover thread)
  rebasing_logic_note.md      rebase semantics
  recipe_html_blob_editing.md blob-editing safety reference
  temporal_paper_draft.md     paper draft (publication context)
```

## The one thing to not forget
`getMP_raw` is the carry **price coordinate** (= oracle at equilibrium), **not** the geometric
reserve slope. `|dy/dx| = getMP_raw · e^(−ghMu)` (e^μ ≈ 44.5 at γ=2, exploding with γ). Anything
that compares a price to a geometric Δy/Δx uses `mpGeom = getMP_raw·e^(−s.ghMu)`. This caused the
slippage bug; it's why we re-derive instead of trusting comments.
