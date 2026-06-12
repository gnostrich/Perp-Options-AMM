# CLAUDE.md — Temporal (GH branch) · shared, always-loaded truth

**Temporal Exchange** is a single-file HTML simulator for a DeFi options-AMM whose invariant prices
`value ∝ S^(−γ)` (γ>1) across a continuum of perpetual-option strikes, on a **generalized-hyperbolic
(GH)** reserve curve. The deliverable is one HTML file; a CTO (external human) propagates the math to
a Go backend separately. `INIT.md` is the bootstrap/architecture spec that produced this repo.

## 0. The motive (operator, 2026-06-10 — keep this in frame; it gets lost otherwise)
**A curve-warp AMM grown out of Balancer, whose purpose is a kurtosis knob — everything else stays
the same.** Balancer `x^w·y^(1−w)=k` is the base; the position-dependent weight is the warp; the
kurtosis knob `τ` rounds the ATM elbow with wings staying exact power-laws; carry/rebase,
value∝S^(−γ), ITM smooth-pasting, funding, and the dollar pipe are unchanged. The curve/invariant
decision is always the operator's. ⚠ HOW the current GH engine relates to the proposed τ-family is
**OPEN** — the "GH = one (W) setting, τ≡δ EXACTLY" identity was BROKEN by the skeptic 2026-06-10
(manager-verified on the live engine: GH puts the kernel in the latent SCORE, (W) in the WEIGHT —
different curves; see `notes/skeptic/VERDICT_KURTOSIS_KNOB_2026-06-10.md`). Full checklist:
`docs/feature_inventory.md` — design/brainstorm notes must disposition every item there (the
skeptic enforces this).

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
- `engine/builds/HEAD_temporal_mvp_v28_lens.html` — **canonical HEAD** (md5 `989752294…`;
  **PROMOTED 2026-06-12 by operator ruling, entries 84/94/96/106**). **v24 plain-Balancer pool +
  a static polar LENS in the query/write layer.** The AMM pool curve is **unchanged plain v24**
  (`tradeUpdate`/`arbitrageToOracle`/`rebase` byte-identical to v24; x,y,w move; ~6% / 285-line edit
  off v24). A polar lens `h_τ(u)=√(τ²+u²)−τ`, centred on the live 45°-tangent point (mode = getSNorm
  = (1−w)/w, manager-verified), reshapes the option-value view: lensed local exponent
  `g_loc(K)=γ·h′(|u|)`, u = log-divergence in the sNorm coordinate, 0 at the tangent point → γ in the
  frozen power-law wings (asymptotes preserved). **One static knob τ = kurtosis/vol.** Everything
  **read** (pricing, option chart, settlement, funding, portfolio value) AND **written** (trades,
  settle-at-lensed, entry 96) goes through the ONE shared helper (`gLoc`/`markLensed`) at the live
  mode — single-basis, forward-read only (the lens is never inverted; pool stays plain Balancer).
  Settlement = smooth-paste `S*=K·g_loc/(g_loc+1)` (the v24 ATM-jump gap fixed). Gate =
  `engine/verify/lens_selfcheck.js` (**23 PASS [HARD]** — centred-on-tangent-point, symmetric,
  frozen-wings, cap-free `|dG|≤γ`, settle==lensed, cross-layer single-basis, pool-byte-identical
  regression; auto-routed in run_all by `function markLensed` && !`function wField`). Verified:
  **no far-OTM blow-up / no strike cap** (multiplicative bound by γ, not the old hyperbolic 1/w′;
  dust trade reshapes ~0.0001% at every strike incl. 4×); round-trip pool-favourable (skeptic #32);
  warp legible on a trade (tester FINAL 27/27, ~10k px). Feature changelog: `engine/builds/CHANGELOG_v28_lens.md`.
  Known-OPEN: warp∘rebase-commute / φ-anchor lemmas [needs-Aristotle]; FINDING-RT (two-leg round-trip
  display shows raw_net>0 — skeptic #32 ruled NOT-A-LEAK, full P&L pool-favourable; display caveat only);
  payoff chart + strike marker still drawn on the unbent curve (cosmetic, operator-excluded entry 101).
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
