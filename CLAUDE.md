# CLAUDE.md — Temporal (GH branch) · shared, always-loaded truth

**Temporal Exchange** is a single-file HTML simulator for a DeFi options-AMM whose invariant prices
`value ∝ S^(−γ)` (γ>1) across a continuum of perpetual-option strikes, on a **generalized-hyperbolic
(GH)** reserve curve. The deliverable is one HTML file; a CTO (external human) propagates the math to
a Go backend separately. `INIT.md` is the bootstrap/architecture spec that produced this repo.

## 1. The store is the filesystem (not a chat ledger)
The old multi-chat world re-emitted a `TEMPORAL-CONTEXT-LEDGER` snapshot every reply. **Obsolete.**
Here the repository is the durable store:
- Each agent owns one curated **`.claude/agent-memory/<name>/MEMORY.md`** — a tight *current-state*
  doc (read it at task start; rewrite the changed bits before finishing). The **manager's MEMORY.md**
  is the cross-role rollup (who's mid-what, what's blocked, last verdicts) — it replaces the
  session-tree ledger. Git history is the mechanical audit trail.
- Briefs, findings, decisions are **files/handoffs**, not implied context. A request and its reply
  are **two** handoffs, never an edit of one.
- **Never claim a file persisted unless it's actually written/committed.**
- One canonical home per fact: `CLAUDE.md` = shared truth; per-agent `MEMORY.md` = mutable role
  state. Don't run two sessions of the same agent on one branch (memory write-collision).

## 2. Team (hub-and-spoke; the operator talks only to the manager)
- **manager** — main thread. Design authority, independent verifier (re-derives every number, never
  rubber-stamps), **sole git/GitHub actor**, escalation hub. Delegates to the four below.
- **research-lead** — states Lean conjectures precisely, relays to the external prover **Aristotle**,
  audits returned proofs. (Aristotle is external — not an agent.)
- **intern** — HTML/engine implementation; surgical, blob-safe edits.
- **tester** — live Playwright browser + Node oracle; evidence with FLAG verdicts.
- **paper** — AfT/WINE/FMBC drafting from locked decisions.
- **CTO** — external human (Go backend); an address, not an agent.

## 3. ⛔ FILE-SAFETY GATE (the real guardrail — every engine HTML edit)
The engine HTML embeds **two base64 blobs** (bg webp ~line 74, logo svg ~line 1060) and **three
`<script>` blocks** parsed via `new Function`. Touching a blob naively destroys the session; a bad
splice silently corrupts the build while gates stay green.
- **Blobs never enter context and are never hand-edited.** Inspect by size/md5 only
  (`awk '{print length($0),NR}' file.html | sort -nr | head`; `sed -n 'Np' file | md5sum`).
- **Edit only via an on-disk Python splice:** work on a copy; slice the exact old string out by line
  range (don't hand-type Unicode); `assert txt.count(old)==1`; preserve a trailing `\n`; blobs stay
  on disk. Recipe: `engine/recipe_html_blob_editing.md` + `engine/splices/SPLICE_METHOD.md`
  (`splice_slipfix.py` is the best worked template).
- **Canonical blob md5s (line layer):** webp `ab663f5c26f2a461c5b0ef1421d0ad74` · svg
  `c505b08ad0e4c6b0fb9e64e9679fe291`. These are the `sed -n 'Np'|md5sum` line hashes the hook +
  `run_all.sh` key off — keep them canonical. `8d2e1a84`/`1b320fc5` is **the decode of the very same
  blob** (273864 b64 chars ×¾ = 205398 bytes exact; 5168 ×¾ = 3875), recorded as a documented
  *secondary* in `BUILD_LINEAGE.md` — **not** a second or "minified broken cut," so there is nothing
  to "restore." (Earlier sessions compared a decode-layer hash against a line-layer hash and inferred
  two artifacts; verified one blob, three layers, 2026-06-08.) **No asset optimizer / minifier, ever.**
- **After every edit:** 2 blob md5s unchanged · all 3 `<script>` parse · engine IIFE intact · no
  script line >~50k · no signatures changed unless that's the task · `engine/verify/run_all.sh` green.
- A **`PostToolUse` hook** (`.claude/hooks/file_safety_gate.sh`) re-runs these checks and **blocks on
  any red**. **STOP-ON-RED:** treat a block as a *finding* — report the diagnostic, do **not** patch
  toward green, do **not** merge. (Re-derive against geometry; comments lie.)

## 4. Locked architecture (don't reopen unless the operator does)
- Curve-baked **GH only, γ>1, no barrier** (barrier's exponent is outside the GH family; δ won't
  recover it). 4 curve-dependent fns: `getMP_raw`, `tradeUpdate`, `arbitrageToOracle`, `rebase`.
- **Carry P = Ny/Nx** load-bearing: `u = log(price) − log P`; rebase recomputes P→P/r. Anchor w=½;
  strike ray θ→θ/r on rebase; convexity knob γ∈(1,4).
- **Slippage** references the geometric marginal `mpGeom = getMP_raw·e^(−ghMu)`; **% basis-independent**
  (e^μ cancels); **$ = Layer-1 reserve-USD** for now (Layer-2 honest-dollar deferred via the existing
  settlement chain — reuse, don't improvise).
- **ITM → American smooth-pasting** (v26b): continuation `c·sNorm` runs PAST the strike to the free
  boundary `sNorm* = θ·((γ+1)/γ)^γ` (price `S* = K·γ/(γ+1)`, `c = 1/((γ+1)·sNorm*)`), then intrinsic.
  Closed form, no new params. Funding = slope-deviation ratio vs the w=½ anchor at the strike ray —
  orthogonal to intrinsic, untouched by the ITM change.
- **THE gotcha:** `getMP_raw` is a **price coordinate, not the slope** — `|dy/dx| = getMP_raw·e^(−ghMu)`
  (factor 11.7/44.5/749/13780 at γ=1.5/2/3/4). Gates are mostly **self-consistency**; the one
  accuracy gate is G4 (value∝S^(−γ)); ITM adds a seam gate. A price/slope conflation passes every
  self-consistency gate — this caused the slippage bug.

## 5. Environment honesty (label, don't fake)
- **Math: fully verifiable here.** Sandbox `<script id="engine">` in Node (`vm.runInNewContext`);
  `Engine.ghCalibrate(X0,Y0,mp0,γ)` opens a pool. `engine/verify/run_all.sh` runs the harnesses.
- **Lean: trusted-from-prover** until the manager builds it locally.
- **Browser/UI: tester-confirmed** (live Playwright; allowlist `storage.googleapis.com`). Say what
  actually rendered; don't assert pixels you didn't observe.
- Shell is `sh`/bash; node v22, python3. No process substitution in `sh` — use `diff a b`.

## 6. Git policy (fully delegated to the manager)
- The **manager is the sole git/GitHub actor.** Subagents share the working tree and hand edits back.
- Develop on the assigned feature branch. Commit logical units with honest messages.
- **Do NOT open a pull request unless the operator explicitly asks.** Merge to `main` yourself once
  `GH_TOKEN` is present. Push with `git push -u origin <branch>`; retry network failures with backoff.

## 7. Autonomy & escalation
- **Gate 1 (capability):** only the manager holds git/gh/merge/delete — subagents structurally defer
  (return work → manager performs the remote/irreversible action).
- **Gate 2 (decisions):**
  - **Autonomous (how to execute):** implement an already-decided/spec'd fix, run harnesses, blob-safe
    edits, write/run tests + report FLAGs, re-derive numbers, pin predicates / audit proofs, draft
    from locked decisions, git mechanics. (No separate "do a pass" gate — Gate 2 + the file-safety
    hook cover engine passes.)
  - **Escalate to the operator via the manager (what we're building):** curve/invariant or economic
    object, settlement semantics (ITM rule, smooth-pasting boundary), reopening a locked decision or
    ship-gate, product calls (**Finding-2**, |Γ|>1 scope, Fork A-vs-B), calibration tier, paper claims.
  - Anything irreversible / high-blast-radius escalates even if it feels procedural. A procedural task
    that surfaces a strategic question → flag it, don't decide.
- **Chain:** subagents can't prompt the operator (`AskUserQuestion` is main-thread only) → they flag
  in their return → the manager proceeds (procedural) or asks the operator (`AskUserQuestion`).

## 8. Repo map
- `engine/builds/HEAD_temporal_mvp_v26c.html` — **canonical HEAD** (md5 `6cc73563…`); v26c lands the
  **uniform strike registration** in the curve's carry coordinate (`θ=sNorm(K)` via `sNormStrike`=
  getSNorm∘arbitrageToOracle) across the display mark, execution/settlement value, and the payoff
  chart — the OTM→ITM crossover now lands at the dollar strike K for all γ (was drifting to
  oracle₀²/K for γ>1). The chart strike-RAY stays live `K/oracle` (a price-space object); funding/
  isOTM/wingMember stay price-measure (already at K). Permanent `dir_gate.js` (crossover@K +
  directional-consistency + mixed-basis control). **Finding-2 is absorbed** (live chart ray). Builds
  on v26b's ITM/American smooth-pasting. Node-verified (7 GH + seam + dir_gate PASS, dollar-pipe
  byte-identical, premium delta re-derived, chart-mark==table 8.6e-11) + UI tester-confirmed (bands
  cross@K, live ray, payoff==table). Prior HEAD demoted to `temporal_mvp_v26b.html` (`8df9f8a3…`).
  Lineage + `BUILD_LINEAGE.md`/`INTEGRITY.md` in `engine/`. `engine/verify/` harnesses,
  `engine/splices/` recipe+scripts, `engine/knowledge/` GH math + source-of-truth, `engine/GOTCHAS.md`.
- `specs/` formal spec + ITM spec (`SPEC_itm_exercise_smoothpaste_NEXT.md`). `formal/` Lean project +
  `prompts/` + `MANAGER_VERIFICATION.md`. `paper/` draft + docx. `notes/`, `history/`
  (`session_tree_note.md`), `evidence/`. `docs/` operating protocol, personas, orientation, briefs,
  historical context. `.claude/` agents, agent-memory, hooks, commands, settings.

## Glossary
GH = generalized-hyperbolic curve · mpGeom = `getMP_raw·e^(−ghMu)` (geometric marginal) · carry
P = Ny/Nx · sNorm = normalized strike coordinate · seam gate = value+slope match at the smooth-pasting
boundary · trusted-from-prover / tester-confirmed = honest provenance labels · Aristotle = external
Lean 4 prover · Finding-2 = American-strike ratio-peg-vs-dollar-anchored product decision.
