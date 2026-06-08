# MEMORY — research-lead
_Last updated: 2026-06-08, aristotle folded in (direct prover interface). Rewrite changed bits at task end._

## Role (UPDATED — I am my own prover interface; no courier)
I am the **theory owner AND my own prover interface**: I decide what to prove, structure the Lean, own
the PH-scaffold reasoning, phrase obligations, **submit to Harmonic's Aristotle myself via the
aristotlelib CLI**, re-verify returned candidates locally, emend mechanical backend diffs, and interpret
verdicts. The standalone `aristotle` peer agent is **GONE** — its job is folded into me. Flow is now
direct: me → `aristotle submit` → poll → local `lake build` re-verify → one verdict → I audit/interpret.
**All raw prover/poll/lake output stays in MY context.** The **manager** is orchestrator + sole git/env
actor; it gets only my **distilled** reports (verdicts, queue status, escalations), never raw logs, and
relays nothing between agents. I hold `Bash` + the CLI; I do **no** git/env actions and never rubber-stamp
a candidate.

## Connection — EXACT invocation (aristotlelib CLI)
- **Library:** `aristotlelib` (PyPI; was v2.0.0). Console script: `aristotle`. Host
  `aristotle.harmonic.fun`. Auth: `ARISTOTLE_API_KEY` env var (set in this env, len 51).
- **Run without persistent install (preferred):** `uvx --from aristotlelib aristotle <verb> ...`
  (uvx present at /root/.local/bin/uvx). Fallback: `pip install aristotlelib` then `aristotle <verb>`.
- **Submit an obligation (fill sorries in a Lean project):**
  ```
  aristotle submit "<my instructions>" \
    --project-dir formal/temporal_lean_verified \
    --wait --destination /tmp/aristotle_out.tar.gz
  ```
  (`--wait` polls to completion; `--destination` saves the solution dir/tar. Without `--wait`, use
  `aristotle list` / `show <id>` / `download <id> --destination …` / `tasks` / `cancel <id>`.)
- **Formalize NL/TeX → Lean:** `aristotle formalize <file> --wait --destination <out.tar.gz>`.
- **Verbs:** submit · formalize · list · show · download · cancel · tasks · ask.
- No official Harmonic **MCP** package exists → **no `.mcp.json`** path. For cloud **routines**, use the
  **Harmonic connector** toggle; for Bash sessions, this CLI is the interface.

## Local re-verify procedure (non-negotiable gate — I never rubber-stamp)
1. Extract the returned candidate over a THROWAWAY copy of `formal/temporal_lean_verified` (never the
   working tree).
2. Confirm `lean-toolchain` = `leanprover/lean4:v4.28.0` and lakefile mathlib `rev = v4.28.0` UNCHANGED.
3. `lake build` (after `lake exe cache get` if available) — must compile clean from a candidate, not
   cache. Doesn't compile → `candidate-fails-local-recheck`.
4. Token-scan changed files: reject `sorry`/`admit`/`axiom`(real decls)/`native_decide`/`sorryAx`/
   `opaque`/`unsafe`. Kernel `decide` OK. Carried hypothesis FIELDS (B1/B3/B4) are allowed when the
   obligation marks them as fields.
5. `#print axioms <thm>` for each target — must show ONLY `propext`, `Classical.choice`, `Quot.sound`.
6. Diff every module I did NOT scope as changed — must be byte-identical (no silent statement edits /
   weakened hypotheses). Then re-derive the math: Lean validity ≠ intended claim.

## Backend-diff emendation — allowed vs bounce (I do the emending now)
- **MAY emend (mechanical, no math change):** import lines, Mathlib API-drift renames, namespace/open
  fixes, whitespace/formatting, `set_option` not affecting kernel trust. Record every emendation.
- **MUST NOT patch (treat as theory failure, don't go green):** any change to a *statement*, a
  weakened/added hypothesis, a new `axiom`, replacing a proof with `sorry`/`native_decide`, or any math
  change. A candidate that only re-verifies after a forbidden change = `candidate-fails-local-recheck`.

## The four verdicts (exactly one per obligation; distilled to manager)
- **proved + re-verified** — Aristotle closed it AND it passed steps 1–6 (clean axioms). Trusted-from-
  prover until the manager builds it in the canonical env. Attach proof for folding.
- **counterexample** — Aristotle refuted it. Relay verbatim; repairing the statement is MY call.
- **still-open** — no proof / timeout / partial. Record furthest state + blocker.
- **candidate-fails-local-recheck** — host claims proved but local re-verify fails (won't build, dirty
  axioms, forbidden token, or only "works" via a forbidden emendation). Record the failing diagnostic.

## ⛔ Connection / toolchain status (live)
- Host `aristotle.harmonic.fun`: operator reports Harmonic **unblocked** (was `403 host_not_allowed`).
  Verify with a real submit before trusting; if it 403s again, flag to the manager — do not fake.
- No `lean`/`lake`/`elan` toolchain in this container → **local re-verify cannot run here yet.** Needs
  elan + Lean v4.28.0 + Mathlib v4.28.0 (mathlib build is heavy; provision via env setup or worktree).
  Until then a submit→candidate can return, but the re-verify half is **pending Lean** — never reported
  as proved.

## Toolchain / where the Lean lives
- **Lean 4.28.0 + Mathlib v4.28.0** (match `formal/temporal_lean_verified/lean-toolchain`).
  Lakefile `formal/temporal_lean_verified/lakefile.toml`, lib `RequestProject`.
- Modules: `formal/temporal_lean_verified/RequestProject/` — `Temporal.lean` (passivity core,
  = the §1-§4 PH file mirrored in the PH prompt), `AMMCurve.lean` (curve validity gate + short-gamma
  bridge), `Seam.lean` (pool value → value layer → passivity storage; hosts `reserves_have_no_floor`),
  `Audit.lean`, `Main.lean`. Audit template: `formal/MANAGER_VERIFICATION.md`.
  Aristotle prompt templates: `formal/prompts/aristotle_prompt_{port_hamiltonian,seam,curve_gate}.md`.
- Aristotle (the prover) is **external** (no Lean in the agent loop). Contract = prompt + returned archive.
- **PH consistency spec: `specs/port_hamiltonian_consistency.md`** (PH-1…PH-7 obligation targets).
- **Throwaway smoke probes: `formal/smoke/`** (`smoke_true` PROVED, `smoke_false` REFUTED/counterexample;
  excluded from RequestProject build) — first live test of the direct loop. I submit these MYSELF via the
  CLI. See "smoke status" below.

## How I phrase an obligation (then I submit it myself)
Standalone, self-contained: (1) informal statement + intended math meaning; (2) the Lean — embed or
import the verified modules; pin every predicate; (3) explicit proof targets; (4) output spec
(compiles? diff of changes? `#print axioms`? no forbidden tokens?); (5) toolchain line
(Lean 4.28.0 + Mathlib v4.28.0). Mark B1/B3/B4-style hypotheses as FIELDS, not goals, when carried.
Then `aristotle submit` it directly — no handoff to the manager for the prover step.

## PH obligation queue (PH-1…PH-7) — all sent-status "open/staged" (nothing submitted yet)
- **PH-1** H ↔ GH curve geometry — scaffolded (generic wiring proved-in-prompt; GH `AMMCurve` instance open
  = GH gate-discharge). autonomous.
- **PH-2** skew-symmetric J / lossless routing — barrier proved-in-prompt; GH invariant open. autonomous;
  WATCH: if GH trade conserves no clean invariant → ESCALATE (economic object).
- **PH-3** dissipation R⪰0 (B3 arb_nonneg / LVR) — field scaffolded; GH grounding open. autonomous;
  ESCALATE if grounding needs redefining arbLeak (settlement semantics).
- **PH-4a** passivity / no-free-lunch — proved-in-prompt. autonomous.
- **PH-4b** reserves-have-no-floor / "convexity must be funded" — proved-in-prompt for cpmm (O=p²);
  GH analogue open. PIN: this is the NEGATION of an intrinsic floor (not §1 H_floor); makes the funding
  port NECESSARY, not sufficient (sufficiency = B1). autonomous. BddBelow/coercive watch.
- **PH-5** C¹ continuity at smooth-pasting S*=Kγ/(γ+1) (value+slope match = engine seam gate) — open.
  autonomous; ESCALATE/stop-and-flag if locked ITM form is found NOT C¹.
- **PH-6** rebase structure-preserving θ→θ/r — sNorm gauge proved-in-prompt; J/R preservation open. autonomous.
- **PH-7** funding well bounded below (model floor, H=S−logS) — proved-in-prompt. autonomous.

## Framing
Typed interface stack: a change at any seam must type-check at every other seam (enforced by the
type-checker, not inspection). The "self-sandwich bug" was an interface violation (settlement
reaching past its contract into the raw displaced pool) — caught by type under this discipline.

## Live proof queue
- **C1** — composite-ray shortcut extends to ITM via effective-strike substitution. _status: queued._
- **C2** — no costless-collar arb at w=½. _status: queued._
- **C3** — no-arb is symmetry, not instrument. **Proven only as a CONDITIONAL SKELETON; the
  curve-symmetry → reflection arrow is an AXIOM, not proven.** Do not report as fully discharged.
- **GH gate-discharge** — instantiate `AMMCurve` for GH (beyond cpmm/expPool), discharge the 4 gate
  fields. Watch `coercive = BddBelow` — GH has **bounded reserves** X∈(0,Nx), Y∈(0,Ny·M).
- **B1/B3/B4** — solvency hypotheses; the big prize is showing the real engine's trade/funding
  formulas discharge them (conditional solvency → engine-grounded). Funding port is **necessary,
  not sufficient**. B1 funding-coverage sweep is a ship-gate (κ extrinsic — geometry can't close it).

## Audit discipline (before folding any returned archive)
Extract → diff unchanged modules → token-scan (`sorry`/`admit`/`axiom`/`native_decide`/`sorryAx`/
`opaque`/`unsafe`; kernel `decide` ok) → read proofs → **re-derive the math independently** →
`#print axioms` shows only `propext`/`Classical.choice`/`Quot.sound`. Trusted-from-prover until the
manager builds locally. Pin every predicate **before** a run.

## Decisions that route to the operator (flag via manager)
|Γ|>1 scope ("true American" vs "exact replication" are mutually exclusive per wing → ship |Γ|≤1
exact or |Γ|>1 as a *labelled approximation*); calibration tier for Γ (oracle tier needs adversarial
review); any paper claim. Don't over-promote (the "tripwire" failure mode).
