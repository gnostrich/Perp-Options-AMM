# Temporal — Claude Code INIT (single source of truth)

> **To start:** in a Claude Code web session on this repo, paste:
> *"Read INIT.md at the repo root and execute it fully."*
> This file is BOTH the init prompt and the architecture spec the session implements.
> It supersedes any earlier architecture/bootstrap docs.

---

## 0. SESSION DIRECTIVE — do this, in order
1. **FIRST, before building anything, output the Human Setup Checklist (§1) to the
   operator**, so they can grant GitHub / env / network access in parallel while you work.
   Then run a quick self-check (`gh auth status`, is `GH_TOKEN` set, is the repo writable)
   and tell them which items are still outstanding.
2. **Build** per §2–§6: extract any archives, dedupe the roles, create the agents +
   seeded memory + `.claude/settings.json` + the file-safety hook, and write `CLAUDE.md`
   from §2–§5. Commit the scaffolding to a branch.
3. **State exactly which final steps are waiting on the operator's grants** — the merge to
   `main` and any live-Playwright steps need `GH_TOKEN` / network in place.
4. **When the operator replies "go"** (checklist done): merge to `main` yourself and begin
   the first resume action (§7). From then on, **run autonomously** — only ever stop to
   ask the operator for the strategic escalations defined in §5 (Gate 2). Do **not** ask
   for procedural or admin steps again.

Be surgical and honest; flag assumptions; obey the FILE-SAFETY GATE; do not edit the
engine during the bootstrap itself.

---

## 1. HUMAN SETUP CHECKLIST  *(echo this to the operator first)*
One-time admin. After this, the team runs without you except for §5 escalations.
1. **Connect GitHub** at claude.ai/code and select this repo (if not already).
2. **Create a GitHub token** — a PAT with **full repo control**: Contents R/W, Pull
   requests R/W, Administration (so branch *delete* works). Copy it.
3. **Environment config** (claude.ai/code → environment selector → settings):
   - Env var: `GH_TOKEN=<your PAT>`
   - Network access: **Custom**, keep defaults, add `storage.googleapis.com`,
     `cdn.playwright.dev`, `playwright.download.prss.microsoft.com` (for the tester's browser).
   - Setup script:
     ```bash
     apt update && apt install -y gh || true
     npx --yes playwright install --with-deps chromium || true
     ```
4. **Plan/access:** confirm Claude Code on the web is enabled for your plan, and no org
   IP-allowlist or Zero-Data-Retention is blocking cloud sessions.
5. **Restart the session** so env/network take effect, then reply **"go"**.

(Note: no secrets store exists yet, so `GH_TOKEN` is visible to anyone who can edit the
environment — fine for a solo repo, worth knowing.)

---

## 2. Org structure / roles
Hub-and-spoke. The operator talks only to the **manager**; the manager delegates.
- **manager** — main thread / coordinator. Design authority, independent verifier
  (re-derives every number, never rubber-stamps), **sole git/GitHub actor**, escalation hub.
- **research-lead** — states Lean conjectures precisely, relays to the external prover
  **Aristotle**, audits returned proofs. (Aristotle is external — not its own agent.)
- **intern** — HTML/engine implementation; surgical, blob-safe edits. ("intern", never "grunt".)
- **tester** — drives the browser (Playwright), produces evidence with FLAG verdicts.
- **paper** — AfT / WINE / FMBC drafting from locked decisions.
- **CTO** — external human (Go backend); a `for-role` address, not an agent.
Dedupe when scanning history: the several "manager"/"Orchestrator" sessions → one
`manager`; "OG research guy" → `research-lead`.

---

## 3. Memory & context persistence
- Each agent owns one curated `MEMORY.md` at `.claude/agent-memory/<name>/` (project
  scope → committed, travels to cloud). Auto-loaded head is ~200 lines / 25KB → keep it a
  tight **current-state** doc; overflow to sibling files it reads on demand.
- Lifecycle: read memory at task start → work → rewrite changed bits before finishing.
  Every agent body instructs this; the manager confirms the update on close.
- **No session-tree ledger.** Its "state of the whole project" job lives in the
  **manager's `MEMORY.md`** (cross-role rollup: who's mid-what, what's blocked, last
  verdicts). Git history is the mechanical audit trail.
- `CLAUDE.md` = shared always-loaded truth; per-agent `MEMORY.md` = mutable role state;
  one canonical home per fact. Don't run two sessions of the same agent concurrently on
  one branch (memory write-collision).

---

## 4. Permissions
| Agent | Tools | Bash needs | Git/GitHub | Edit engine? |
|---|---|---|---|---|
| manager | `Agent(research-lead, intern, tester, paper), Read, Edit, Write, Bash, Grep, Glob` | git, gh, node, python3, awk/sed/md5sum | **Full** (sole remote writer) | yes |
| intern | `Read, Edit, Write, Bash, Grep, Glob` | node, python3 (splice), awk/sed/md5sum | none | yes (blob-safe recipe) |
| tester | `Read, Grep, Glob, Bash, Write` (+ Playwright MCP) | node, npx playwright | none | **no** (read-only on source) |
| research-lead | `Read, Grep, Glob, Write, Edit, Bash` | light (Lean is external) | none | no (Lean/specs only) |
| paper | `Read, Grep, Glob, Write, Edit, Bash` | python3 (python-docx) | none | no (paper/spec only) |
- **Posture:** `permissionMode: acceptEdits` at the manager/session level (propagates),
  plus a broad allow-list in `.claude/settings.json` so background runs never silently
  auto-deny: `Bash(git:*)`, `Bash(gh:*)`, `Bash(node:*)`, `Bash(npx:*)`,
  `Bash(python3:*)`, `Bash(awk:*)`, `Bash(sed:*)`, `Bash(md5sum:*)`, `Read`, `Edit`, `Write`.
- **GitHub:** full read/write/commit/branch/merge/delete via `GH_TOKEN`, concentrated in
  the manager as sole remote writer; subagents share the working tree and hand edits back.
- **FILE-SAFETY GATE + hook (mandatory):** the engine HTML carries base64 blobs (bg webp,
  logo SVG) that destroy a session if touched naively — edit only via the blob-safe recipe
  (`awk`/`sed`/`md5sum` to inspect, on-disk Python splice scripts; blobs never enter
  context). Install a `PostToolUse` hook on Edit|Write that, when the HTML changed,
  re-verifies the two blob anchors by md5, confirms the three script blocks parse, and runs
  the regression + American-layer harnesses — **block on failure, do not patch toward
  green, do not merge.** This is the real guardrail; the permission guardrails are
  intentionally wide.
`tools` is tool-granularity, not path/command — "intern edits only the engine",
"subagents don't push", etc. are charter conventions, enforced by the bodies, not hard walls.

---

## 5. Autonomy & escalation
**Gate 1 — permission-sensitive / irreversible actions:** not gated by asking, but by
capability — only the manager holds git/gh/merge/delete, so subagents structurally defer
(return work → manager performs the remote/irreversible action).
**Gate 2 — decisions:**
- **Autonomous (how to execute):** implement an already-decided/spec'd fix, run harnesses,
  blob-safe edits, write/run tests + report FLAGs, re-derive numbers, pin conjecture
  predicates / audit proofs, draft from locked decisions, git mechanics.
- **Escalate to operator via manager (what we're building):** change the curve/invariant
  or economic object, settlement-semantics changes (ITM rule, smooth-pasting boundary),
  reopen a locked decision or ship-gate, product calls (Finding-2, |Γ|>1 scope, Fork
  A-vs-B), calibration tier, paper claims.
- **Overrides:** anything irreversible / high-blast-radius escalates even if it feels
  procedural; if a procedural task surfaces a strategic question, flag it — don't decide.
**Chain (forced by the platform):** subagents can't prompt the operator directly
(AskUserQuestion is main-thread only) → they flag in their return to the manager → the
manager proceeds (procedural) or stops and asks the operator in the session.

---

## 6. Bootstrap build steps
0. **Extract & organize.** The repo may contain archives the operator dropped in: this
   bundle, the project files, and a full Claude data export (`.zip`/`.dms` of JSON).
   Extract them all. Treat every other file (loose or foldered) as project source material.
1. **Read everything.** This INIT.md; any `context/**`; all source material (current HTML
   build, harnesses, spec, paper, notes — use Explore for bulky files; identify the
   canonical engine by version suffix). In the export, this project is the bulk of the
   account: filter by the session titles/keywords above, enrich roles/state, best-effort
   recover artifacts pasted inline; report what's recovered vs missing.
2. **Finalize roles** (dedupe per §2). Five agents: manager (main thread), research-lead,
   intern, tester, paper. No agent for CTO or Aristotle.
3. **Create agents** — `.claude/agents/<name>.md` with valid frontmatter (name
   lowercase-hyphen, sharp action-oriented description, the §4 tools, `model: inherit`,
   `memory: project`) + a body from its charter. The intern body restates the FILE-SAFETY
   GATE. Write `"agent": "manager"` into `.claude/settings.json` with the §4 allow-list and
   `permissionMode: acceptEdits`. Install the file-safety `PostToolUse` hook (§4).
4. **Seed memory** — `.claude/agent-memory/<name>/MEMORY.md` per agent from §7 + the
   role-relevant material (≤150 lines each).
5. **Write `CLAUDE.md`** — shared brief, the git policy (fully delegated), the FILE-SAFETY
   GATE, the §5 escalation policy, glossary.
6. **Commit** to a branch; merge to `main` once `GH_TOKEN` is present (per §0 step 4).

---

## 7. Resume state — where we are / first action
- **Latest verified build: v26a** (GH-curve swap on clean v24 base). v25 added the GH swap;
  review caught three barrier remnants, all fixed in v26a: `margPrice` (was barrier slope,
  ~32% off post-trade), `curveTraceExplicit` (was drawing barrier weight-form), inline arb
  `xEq/yEq` (barrier formula for the equilibrium marker). v26a verified surgical — all 7
  engine gates pass, 401/401 curveTrace on the GH curve (slope err ~5e-12), marker on-curve.
- **First resume action:** the **tester run on v26a** — live-browser pixel/visual
  confirmation — and surface the **Finding-2** decision to the operator (American strike as
  a ratio peg that floats off dollars → UX-clarity fix, vs dollar-anchored "$120k call" →
  real engine change). The tester flags; the manager escalates; the operator decides.
- Locked direction: GH-only curve; ITM → American smooth-pasting (`S* = K·γ/(γ+1)`,
  `sNorm* = θ·((γ+1)/γ)^γ`); funding orthogonal to intrinsic (curve-slope deviation from the
  anchor at the strike ray); anchor w=½, strike ray θ→θ/r on rebase; convexity knob γ∈(1,4).
- Open/undischarged: solvency hypotheses **B1/B3/B4** (funding port necessary, not
  sufficient); B1 funding-coverage sweep is a ship-gate.
- Aristotle queue (research-lead): **C1** (composite-ray shortcut extends to ITM via
  effective-strike), **C2** (no costless-collar arb at w=½), **C3** (no-arb is symmetry, not
  instrument — note: proven as a *conditional skeleton*; the curve-symmetry→reflection arrow
  is an axiom, not proven).
- Pipeline (paper): AfT 2026 (notif ~Jul 15), WINE 2026 (~Jul 2), FMBC 2027 (Lean paper).
  Must-cite: Singh et al. (LVR as a continuum of perpetual options).

---

## 8. Resolved defaults (former open items — override in one line)
- **Engine-pass autonomy = autonomous for already-decided/spec'd fixes**, protected by the
  file-safety hook; *architectural* engine changes escalate per §5. (i.e. no separate "do a
  pass" gate — Gate 2 + the hook cover it. Say "gate engine passes behind my explicit go"
  to revert to the old discipline.)
- **Tester Playwright = live from day one** (the first resume action needs it; that's why
  the network/Playwright setup is in §1). Say "stub the tester for now" to defer that setup.

---

## Changelog
- v2 — consolidated into the single source of truth: added §0 directive + §1 human
  checklist, absorbed the architecture spec, resolved the two open items as defaults (§8).
