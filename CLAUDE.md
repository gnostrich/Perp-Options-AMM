# CLAUDE.md — Temporal (GH branch) · shared, always-loaded truth

**Temporal Exchange** is a single-file HTML simulator for a DeFi options-AMM whose invariant prices
`value ∝ S^(−γ)` (γ>1) across a continuum of perpetual-option strikes, on a **generalized-hyperbolic
(GH)** reserve curve. The deliverable is one HTML file; a CTO (external human) propagates the math to
a Go backend separately. `INIT.md` is the bootstrap/architecture spec that produced this repo.

## 0. The motive (operator, 2026-06-10 — keep this in frame; it gets lost otherwise)
**A curve-warp AMM grown out of Balancer, whose purpose is a kurtosis knob — everything else stays
the same.** Balancer `x^w·y^(1−w)=k` is the base; a trade warps the curve; the kurtosis/vol knob is a
**CONSTANT SLOPE MULTIPLIER `m`** (operator-RULED 2026-06-13, entries 229/231): the option-value
curve's power-law steepness is `m·γ` at every strike (`m=1` = plain v24 curve; bigger m = steeper
EVERYWHERE and a trade lands further out — both rise with m, one direction). carry/rebase,
value∝S^(−γ), ITM smooth-pasting, funding, the dollar pipe are unchanged. **⛔ SUPERSEDED 2026-06-13
(entry 231):** the old "knob `τ` rounds the ATM elbow with wings frozen at γ" / position-dependent
`√(τ²+u²)` lens is DEAD — no elbow-rounding, no flat-top/cusp, wings are exact power-laws of exponent
`m·γ` (still power-laws; not pinned at γ). Trade map: `θ_tx = mode·(chosen/mode)^m`. The curve/invariant
decision is always the operator's. Full checklist: `docs/feature_inventory.md`.

**Operator rulings 2026-06-10 (transcript entry 14, verbatim source `history/operator/`):**
1. **Engine-faithfulness pivot UN-HELD and ordered FIRST** — built and gated before any new
   theory work (the live engine must reproduce every proven construct; the unproved spec↔engine
   gap is where the dodging lived).
2. **Trades bend the curve: YES — and it is w that a trade changes** (entry 16 verbatim: "yes its
   w that the trade changes (while x and y also change to be faithful to actual reserves, refer
   the paper) and that warps it"). Reference spec = the paper's Trade Formula (α=x·w, β=y·(1−w)
   individually conserved; w=α/x derived; paper line 33: "Trades skew the AMM curve instead of
   moving the reserves point along it"). Standing UNIMPLEMENTED requirement (inventory item 16) —
   today's engine moves a point on a fixed curve and does NOT implement the paper's core trade
   mechanic; no design note may imply otherwise. Build target sequenced AFTER the pivot.
3. **Kurtosis = "steepness / flatness of the curve, we set it so the curve is appropriate for
   pricing perpetual american style options for an asset of some vol, and it isn't / doesn't have
   to be changed by trades."** The knob is the curve's geometry, vol-calibrated at setup, static
   under trading — NOT a trader-measured statistic (the moment-coupling at β=1 is therefore not a
   defect of the knob as the operator defines it).

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
  rubber-stamps), **sole git/GitHub actor**, escalation hub. Delegates to the five below.
- **research-lead** — states Lean conjectures precisely, relays to the external prover **Aristotle**,
  audits returned proofs. (Aristotle is external — not an agent.)
- **intern** — HTML/engine implementation; surgical, blob-safe edits.
- **tester** — live Playwright browser + Node oracle; evidence with FLAG verdicts. Owns the
  behavioral diff ledger (`engine/builds/DIFF_LEDGER.md`) — **the operator's inventory of record**:
  every build verification appends a feature-keyed entry (inventory #1–#15 + explicit "none
  beyond") AND updates the rolling feature-state table; HEAD promotion is gated on the entry
  existing with its feature mapping.
- **paper** — AfT/WINE/FMBC drafting from locked decisions.
- **skeptic** — adversarial red-team (added 2026-06-10; **PROMOTED ABOVE THE MANAGER on claims,
  operator-directed 2026-06-10**). Read-only; mandatory completeness-and-steelman pass on every
  brainstorm/design note AND manager audit report before merge, audited against
  `docs/feature_inventory.md`; receives operator questions VERBATIM (a manager paraphrase =
  FLAG-PROCESS); verdicts are FLAGs appended unedited, disagreements escalate to the operator
  unreconciled. Has full access to chat transcripts (`history/`), the tester's distilled
  operator-objection record (DIFF_LEDGER OPERATOR-VOICE), and all agent memories — to diagnose
  bullshitting by any agent, the manager included.
- **CTO** — external human (Go backend); an address, not an agent.

### 2.1 Authority order on claims (operator-directed 2026-06-10)
**operator > skeptic > manager > other agents** — on truth claims, labels, and completeness.
Execution mechanics are unchanged (manager remains the main thread, sole git/GitHub actor, and
the only agent that can prompt the operator — these are platform structure, not rank). What the
skeptic's seniority means in practice, and the manager is BOUND by it:
- **A standing skeptic FLAG is a halt condition** (same class as the file-safety gate): the
  manager may NOT merge, HEAD-promote, or encode the flagged claim into shared truth over it.
  Resolution = the manager produces evidence that satisfies the skeptic, or the OPERATOR
  overrules. The manager may answer a FLAG; the manager may never soften, shelve, or out-wait one.
- **The skeptic can summon, not just receive:** it may demand any artifact for review — including
  the manager's MEMORY.md rollup, audit reports, and commit messages — and the manager must
  provide it and relay verdicts to the operator verbatim.
- When skeptic and manager disagree, BOTH positions go to the operator, skeptic's stated first
  and unedited.
- **Universal Skeptic Gate (operator entry 139, 2026-06-12): `notes/skeptic/POLICY_universal_skeptic_gate_2026-06-12.md`**
  — no agent work reaches merge/promote/state-flip unchecked by the skeptic, and no claim-bearing
  operator reply ships unfiltered. Halt-class; the manager cannot route around it. The binding
  take-stock board is `docs/COMPONENT_REGISTER.md` (regression gate: AGREED|VERIFIED→REGRESSED needs
  an explicit operator reopen).

### 2.2 Operator transcription policy (operator-directed 2026-06-10 — full text: `docs/transcription_policy.md`)
The operator's messages are transcribed **VERBATIM** (exact text — case, typos, ellipses; no
cleanup, no paraphrase) by the **manager** (sole operator-facing agent) into
**`history/operator/<date>_<session-slug>.md`** — one append-only file per session, each message
appended within the turn it's acted on and committed with that turn's work. Manager/agent replies
are NOT transcribed (git + memories cover the team side); context notes stay one-line neutral
pointers. Corrections = dated corrigenda, never edits. **tester** cites these as
`[verbatim-transcript]` in the DIFF_LEDGER OPERATOR-VOICE layer; **skeptic** audits agent claims
against them and may demand the current session's transcript at any time — a missing file, gap,
or paraphrase-as-quote is a **FLAG-PROCESS against the manager**. Pre-policy sessions
(2026-06-08/09) stay honestly labelled as reconstruction; standing request to the operator to
export those transcripts into `history/`.

### 2.3 Role-lock — single-agent sessions (operator-directed 2026-06-10)
Any session can be **pinned to a single agent** as a direct, unfiltered line to that agent (the
operator's deliberate bypass of hub-and-spoke — no manager in between). The pinning opener is,
verbatim:
> For this session you are `<agent>`, per `.claude/agents/<agent>.md`; answer as yourself; do not
> act as, speak for, or route through the manager.

A pinned session speaks **ONLY as that agent**: it self-orients from its own charter +
`MEMORY.md`, answers in its own voice, and does not impersonate, summarize for, or defer to the
manager. Role-lock changes who is *speaking*, not the locked capabilities — git/merge authority
and the file-safety gate are unchanged; a read-only agent stays read-only when pinned.

### 2.4 No impersonation — verbatim relay or labelled synthesis (operator-directed 2026-06-10)
The manager — and **every** agent — may **NEVER write in another agent's voice.** To convey a
subagent's output you must do **exactly one** of:
- **(a) actually invoke that agent** (via the Agent/Task tool) and **quote it verbatim** — clearly
  attributed and delimited (e.g. a block-quote labelled `skeptic (run <id>):`), with a pointer to
  the run/transcript; or
- **(b) explicitly label the words as your own synthesis** — "my read of X is…", **never** "X
  says…".

**Never** reconstruct a subagent's findings from memory and present them as that agent's words.
**If you did not invoke the agent this turn, you must say so.** (Entry-19 precedent: presenting a
general-purpose stand-in's output as "the skeptic" was label drift — this rule closes it. It is
the relay-fidelity twin of the §2.2 verbatim duty and the §2.1 skeptic channel.)

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
**⚠ THE OPERATOR REOPENED THE CURVE 2026-06-10 (entry 28): HEAD is now the (W) kurtosis curve
(v27), NOT GH.** The GH-specific lines below describe the demoted GH line (v25→v26c, retained,
suite still green) and stay as its record; v27's architecture = `specs/SPEC_kurtosis_curve_family_TARGET.md`
(√-kernel weight field, static τ knob, strong-form φ trades-warp, Reading-A settlement, γ>1 via
w_±>½, wing-range guard; on (W) price==slope — the e^(−ghMu) gotcha is GH-only). Carry/rebase/
funding/dollar-pipe contracts remain binding on v27 (carry = the price leg `q=ln p`, skeptic-ruled
inheritance); warp∘rebase-commute + φ-anchor/funding lemmas are OPEN [needs-Aristotle].
- _(GH line, demoted)_ Curve-baked **GH only, γ>1, no barrier** (barrier's exponent is outside the GH family; δ won't
  recover it). 4 curve-dependent fns: `getMP_raw`, `tradeUpdate`, `arbitrageToOracle`, `rebase`.
- **Carry P = Ny/Nx** load-bearing: `u = log(price) − log P`; rebase recomputes P→P/r. Anchor w=½;
  strike ray θ→θ/r on rebase; convexity knob γ∈(1,4).
- **Slippage** references the geometric marginal `mpGeom = getMP_raw·e^(−ghMu)`; **% basis-independent**
  (e^μ cancels); **$ = Layer-1 reserve-USD** for now (Layer-2 honest-dollar deferred via the existing
  settlement chain — reuse, don't improvise).
- **ITM → American smooth-pasting** (v26b): continuation `c·sNorm` runs PAST the strike to the free
  boundary `sNorm* = θ·((γ+1)/γ)^γ` (price `S* = K·γ/(γ+1)`, `c = 1/((γ+1)·sNorm*)`), then intrinsic.
  Closed form, no new params. Funding = slope-deviation ratio vs the w=½ anchor at the strike ray —
  orthogonal to intrinsic, untouched by the ITM change. **Operator-ruled entry 232 (2026-06-13):
  funding is evaluated THROUGH THE LENS — the slope-deviation uses the lensed exponent ±g_loc = ±m·γ
  (and a lens-aware mark), so the kurtosis knob `m` re-scales the funding rate BY DESIGN. The
  *mechanism* (slope-deviation vs the w=½ anchor) is what's "unchanged" in the motive; it is a
  through-the-lens read quantity like pricing/settlement/portfolio value, not a knob-independent one.**
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
- **PR management is fully autonomous (operator pre-authorized 2026-06-09).** The manager opens,
  squash-merges, and deletes branches itself with **no operator approval — including strategic
  merges to `main`**. The only gate is **green**: never merge a branch that isn't `clean` AND green
  (§6.2). The old "no PR unless the operator asks / stop for the operator's go" rules are **retired.**
  Push with `git push -u origin <branch>`; retry network failures with backoff.

### 6.1 GitHub ops (manager does all PR actions via the REST API)
There is **no `gh` CLI and no GitHub MCP tool** in this environment. The manager performs every
PR action itself against `api.github.com` (already network-allowed) with the bare `$GH_TOKEN`.
Repo slug is `gnostrich/Perp-Options-AMM`. **Verify the token first, every session that needs it:**
```sh
curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $GH_TOKEN" https://api.github.com/user
```
`200` → good, proceed. `401` → **stop**: the token is bad; tell the operator, do not improvise.
- **Open a PR** (autonomous — no operator approval needed):
  ```sh
  curl -s -X POST -H "Authorization: Bearer $GH_TOKEN" -H "Accept: application/vnd.github+json" \
    https://api.github.com/repos/gnostrich/Perp-Options-AMM/pulls \
    -d '{"title":"<title>","head":"<branch>","base":"main","body":"<body>"}'
  ```
  Capture the returned `.number` for the merge step.
- **Merge a PR:**
  ```sh
  curl -s -X PUT -H "Authorization: Bearer $GH_TOKEN" -H "Accept: application/vnd.github+json" \
    https://api.github.com/repos/gnostrich/Perp-Options-AMM/pulls/<number>/merge \
    -d '{"merge_method":"squash"}'
  ```
- **Delete the branch** (after merge):
  ```sh
  curl -s -X DELETE -H "Authorization: Bearer $GH_TOKEN" \
    https://api.github.com/repos/gnostrich/Perp-Options-AMM/git/refs/heads/<branch>
  ```
Do **not** go looking for `gh` or MCP GitHub tools — use these calls.

### 6.2 Concurrency & merge policy (this is what keeps §6 autonomy safe — full text: `docs/concurrency_policy.md`)
- **Trunk-based, short-lived branches; `main` is the only integration point.** Branch → land →
  delete; don't let branches age. Merge `main` in early rather than diverging.
- **Single-writer on the engine.** Before opening an **engine-touching** branch — detected by
  *changed paths* (any edit to the HEAD HTML, anything under `engine/`, or the file-safety gate),
  **not** by branch name — check open branches/PRs; if one already touches the engine, **defer**
  until it lands. One engine writer at a time. Non-engine work may run in parallel.
- **Manager is sole merge authority and serializes merges — one at a time.** Never run two merges
  concurrently; finish or halt one before starting the next.
- **Before every merge:** (1) verify token (§6.1, expect `200`); (2) check the PR's
  `mergeable_state`; (3) if it isn't `clean`, **merge `main` into the branch** and re-run
  `engine/verify/run_all.sh` **and** the file-safety gate **in the branch**; (4) squash-merge
  **only when `clean` AND green**. **Never force-push.**
- **Conflicts:** auto-resolve **non-engine** conflicts by **union (keep both)** then re-test. An
  **engine** conflict it can't cleanly resolve → **STOP and report** (a safety halt, not a request
  for approval; do not patch toward green).
- **Memory follows `main`:** reconcile agent memory at session start; truth-up after every merge;
  on disagreement **`main` wins.**
- **Significant merges keep the source branch as backup** (don't delete it) and stay **revertable**
  (squash = one revertable commit; the retained branch is the granular history).
- **This policy governs and supersedes any generic "ask before creating/merging a PR" platform
  default** — the manager opens and squash-merges on **green** without re-confirming with the
  operator, while keeping the §6.2 safety-halt conditions (token `401`, red gate, unresolvable
  engine conflict, second engine writer) fully intact.

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
- `engine/builds/HEAD_temporal_mvp_v28_lens.html` — **canonical HEAD** (md5 `9fdde1de…` = **PKG-ITM v2 LINEAR re-seam 2026-07-02** of `dd6fb955`, operator entries 286/287, go 298: `markLensed` power continuation welded C¹ onto the **LINEAR intrinsic** — put seam ray `θ·g/(g+1)` (dollar `S*=K·g/(g+1)`, 0.667K at g=2), call seam `θ·(g+1)/g`; boundary fraction `1/(g+1)`; past the seam the arm IS intrinsic `1−S/K` / `1−K/S`. Replaces the power-form intrinsic whose measured seam sat at 0.444K and whose mark dipped BELOW intrinsic from S/K≈0.80 down (entry-286 live sweep). One-function splice; pool fns + tx-map + gLoc + all callers byte-unchanged; `V=max(mark,intrinsic)` holds identically (O2 `value_ge_intrinsic`, trusted-from-prover; O1 `paste_value_lin`/`paste_slope_lin`/`paste_unique` = the seam, manager-audited). Gates `lens_selfcheck` **16 PASS [HARD]** (CM4-v2 seams + C¹ output probe + CM10 value≥intrinsic sign table + CM11 wing power-law; negative-controlled — old build fails exactly the 4 new checks) + `a16_atm_gate` **5 PASS [HARD]**. Tester live acceptance PASS ×2 byte-stable: every paper worked-example cell |Δ|=0.0 at 4dp DOM-read, belowIntrinsic EMPTY, seam measured 0.667K/0.857K, 17/17 UI smoke. Pre-fix power-arm build RETAINED as `temporal_mvp_v28_lens_powerarm.html` (`dd6fb955`, the revert twin). Known-OPEN: -B289 UI vol-caption contradicts the reversed paper vol-direction (part-2); (b) display slice queued; funding-semantics extension operator-gated. Prior `dd6fb955…` = chart-2 Option-C 2026-06-22 of `9f1e625b`: chart-2 "MARK ACROSS STRIKES" plots the normalized steepness SHAPE `(mode/θ)^(m·γ)` (mode peak=1, wings steepen with m; draw-layer only; resolves entries 226+266). Prior `9f1e625b…` = chart-caption depiction
  fix 2026-06-14 of `80f050e2` [legend/caption corrected: mark=1 is the full-exercise cap not the mode, mode peak
  <1 = the smooth-paste value; 2 text lines, behaviorally identical, gates 13+5 green]; `80f050e2` = comment-cleanup
  of `8f897edc` per operator entry 234, behaviorally identical: dead √-kernel comments→constant-m + gate-detector
  hardened, gates 13+5 green; `8f897edc` constmult source retained as `temporal_mvp_v28_lens_constmult.html`;
  **PROMOTED 2026-06-13 by operator ruling, entries 229/231 — CONSTANT SLOPE-MULTIPLIER lens**).
  The kurtosis/vol knob is now a single scalar `m`: the lensed option-value exponent
  `g_loc(K)=m·γ` is **constant at every strike** (m=1 ⇒ g_loc=γ = plain v24 curve; bigger m =
  steeper everywhere AND the trade lands further out via the frozen tx-map `θ_tx=mode·(chosen/mode)^m`).
  This **REPLACES the position-dependent `√(τ²+u²)` elbow-rounding lens** (which coupled steepness
  and outward-trade-push with OPPOSITE signs — the root of the multi-day τ-direction conflict; a
  constant multiplier couples them the SAME direction, dissolving it). **The AMM pool curve is
  still unchanged plain v24** (`tradeUpdate`/`arbitrageToOracle`/`rebase` byte-identical to v24;
  x,y,w move). Everything **read** (pricing, option chart, settlement, funding, portfolio value)
  AND **written** (trades, settle-at-chosen-strike) goes through the ONE shared helper
  (`gLoc`/`markLensed`) — single-basis, forward-read only (the lens is never inverted; pool stays
  plain Balancer). Settlement = smooth-paste `S*=K·g_loc/(g_loc+1)` at the chosen strike. Gates =
  `engine/verify/lens_selfcheck.js` (**13 PASS [HARD]** — rewritten CM1–CM9: g_loc=m·γ constant,
  m=1=plain, wings power-law m·γ no-floor, frozen tx round-trip + no-free-money, polarity-lock
  steeper⇒further, pool byte-identical, no dead √-kernel) + `engine/verify/a16_atm_gate.js`
  (**5 PASS [HARD]** — no-jump ATM, ATM-cusp RETIRED under constant-m). Manager-verified 13+5;
  skeptic CLEAR-TO-PROMOTE (engine broken 3 ways → gate goes red); tester live PASS 5/5 ×2
  byte-stable (chart-2 steepens every strike, m=1=plain, trade further with m, settle at chosen,
  chart-1 inert). Known-OPEN: warp∘rebase-commute / φ-anchor lemmas [needs-Aristotle, constant-m
  lemmas in flight at Aristotle]. **Revert chain (retained):** inverse-lens `5fea0e8d` =
  `temporal_mvp_v28_lens_invtx.html`; at-strike `de28c937`; continuous-warp `4378bc11`; polar-lens
  `7e1ae39b`. Constant-m source kept as `temporal_mvp_v28_lens_constmult.html`. Feature changelog:
  `engine/builds/CHANGELOG_v28_lens.md`.
  **Prior HEAD demoted to `temporal_mvp_v27_wkurtosis.html`** (`928cde1c…`, the (W) kurtosis line,
  retained; `wcurve_selfcheck.js` 22 PASS via explicit path). **Earlier GH-line endpoint
  `temporal_mvp_v26c.html`** (`6cc73563…`) also retained.
  Lineage + `BUILD_LINEAGE.md`/`INTEGRITY.md` + `DIFF_LEDGER.md` (behavioral deltas per version;
  tester-owned, gates HEAD promotion) in `engine/`. **Standing UI smoke-pass (skeptic-ruled
  2026-06-11, FLAG-OMISSION fix):** HEAD promotion AND any operator hand-back additionally require a
  live tester pass — every control exercised in each state (incl. direction swaps), every drawn
  overlay identified + sanity-located, per-click visible delta measured for any knob the operator is
  told to turn. Episodic happy-path passes don't satisfy this. `engine/verify/` harnesses,
  `engine/splices/` recipe+scripts, `engine/knowledge/` GH math + source-of-truth, `engine/GOTCHAS.md`.
- **`framework/`** — the curve-AGNOSTIC framework, first-class (operator-directed restructure
  2026-06-11): README = warp principle (verbatim) + admission contracts; LDF check note; PH
  recap + PH consistency spec (these two carry a marked GH-instantiated layer). **`curves/`** —
  curve-SPECIFIC work by family: `curves/gh/` (live engine's family; **`PIVOT_MAP.md`** = the
  decision map barrier→v25→v26a→v26b→v26c→faith-gates→queued w-warp, artifacts keyed per pivot)
  + `curves/balancer_w/` ((W)/weight-profile family). Engine paths NOT moved (slice 2, queued,
  engine-touching + serialized).
- `specs/` formal spec + ITM spec (`SPEC_itm_exercise_smoothpaste_NEXT.md`). `formal/` Lean project +
  `prompts/` + `MANAGER_VERIFICATION.md` + **`INDEX.md`** (canonical provenance map over all Aristotle
  results — start there) + `README.md` (layout). `paper/` draft + docx. `notes/`, `history/`
  (`session_tree_note.md`), `evidence/`. `docs/` operating protocol, personas, orientation, briefs,
  historical context, `feature_inventory.md` (the skeptic's checklist). `.claude/` agents,
  agent-memory, hooks, commands, settings.

## Glossary
GH = generalized-hyperbolic curve · mpGeom = `getMP_raw·e^(−ghMu)` (geometric marginal) · carry
P = Ny/Nx · sNorm = normalized strike coordinate · seam gate = value+slope match at the smooth-pasting
boundary · trusted-from-prover / tester-confirmed = honest provenance labels · Aristotle = external
Lean 4 prover · Finding-2 = American-strike ratio-peg-vs-dollar-anchored product decision.
