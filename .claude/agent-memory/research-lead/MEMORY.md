# MEMORY — research-lead
_Last updated: 2026-06-08, PH recap + provenance-label sync pass. Rewrite changed bits at task end._

### THIS PASS (2026-06-08, provenance-label sync after the operator's no-local-re-verify clarification)
Recap memo + label reconciliation. Verified my owned PH docs already comply with the process update
(`notes/PH_RECAP_2026-06-08.md`, `specs/port_hamiltonian_consistency.md`, this MEMORY) — they retired
PENDING-LEAN and use `trusted-from-prover` correctly. Synced the two research-lead-owned AUDIT
artifacts that still carried stale "proved + re-verified" / local-`lake build`-gate framing:
`formal/smoke/README.md` (now: server compile IS the build; verdict labels = proved (trusted-from-
prover) / counterexample; SMOKE STATUS folded in) and `formal/MANAGER_VERIFICATION.md` (§0/§1/§5
reframed: the canonical-env build is a **label upgrade to "verified"**, not a trust-removal of an
unbuilt sketch). NOT touched (out of my scope — manager owns them): `.claude/agent-memory/manager/
MEMORY.md`, `.claude/agents/research-lead.md`, `docs/routines/aristotle_ph_loop.md` — these still say
"local re-verify / proved+re-verified / PENDING-LEAN" and are STALE vs the process update.
**ESCALATION to manager:** those three manager-owned docs need the same PENDING-LEAN→trusted-from-prover
/ drop-local-re-verify-gate edit; I cannot edit them (manager-owned). No engine/git actions taken; no
new heavy submit run (recap only, per task constraint).

## Role (UPDATED — I am my own prover interface; no courier)
I am the **theory owner AND my own prover interface**: I decide what to prove, structure the Lean, own
the PH-scaffold reasoning, phrase obligations, **submit to Harmonic's Aristotle myself via the
aristotlelib CLI**, audit returned candidates, emend mechanical backend diffs, and interpret verdicts.
The standalone `aristotle` peer agent is **GONE** — its job is folded into me. Flow is now direct:
me → `aristotle submit` → poll → **zero-cost artifact audit** → one verdict → I interpret.
**All raw prover/poll output stays in MY context.** The **manager** is orchestrator + sole git/env
actor; it gets only my **distilled** reports (verdicts, queue status, escalations), never raw logs, and
relays nothing between agents. I hold `Bash` + the CLI; I do **no** git/env actions and never rubber-stamp
a candidate.

### PROCESS UPDATE (operator, 2026-06-08) — no local re-verify gate; Aristotle's server compile IS the build
Operator clarified: **Aristotle actually compiles/builds at its end, in the matching toolchain (Lean
4.28.0 / Mathlib v4.28.0).** Consequences, applied throughout this memory:
- **DROP the PENDING-LEAN framing as a blocker.** A returned candidate Aristotle compiled is a genuine
  compiled proof, not a sketch. Do NOT park results in PENDING-LEAN limbo, and do NOT use the
  PENDING-LEAN label anymore. The absence of a local lean/lake toolchain in this container is no longer
  a verdict-blocker.
- **No local `lake build` re-verify is required as a gate.** The manager may still build in the
  canonical env later; that's a label upgrade, not a gate I owe.
- **KEEP the zero-cost artifact audit** on every returned archive (needs no toolchain): (1) token-scan
  (`sorry`/`admit`/real `axiom` decls/`native_decide`/`sorryAx`/`opaque`/`unsafe`; kernel `decide` ok),
  (2) read Aristotle's own `#print axioms` — must be ONLY `propext`/`Classical.choice`/`Quot.sound`,
  (3) diff every unscoped module byte-for-byte to confirm no statement was weakened / no false hypothesis
  added, (4) re-derive the math (Lean validity ≠ intended claim). **A clean server build can still be a
  clean proof of a WEAKENED statement — the audit is what catches that, so it stays mandatory.**
- **LABEL:** a returned, server-compiled, clean-axiom, audited candidate = **trusted-from-prover**
  (Aristotle's kernel ran, ours didn't). NOT "verified" (that's the operator's word to grant later),
  NOT PENDING-LEAN.

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

## Zero-cost artifact audit (non-negotiable gate — I never rubber-stamp; needs NO toolchain)
_Aristotle's server compile is the build (operator, 2026-06-08), so there's no local `lake build` step.
The audit below is what I still owe — it catches a clean build of a WEAKENED statement, which a green
compile alone never would._
1. Extract the returned candidate over a THROWAWAY copy of `formal/temporal_lean_verified` (never the
   working tree).
2. Confirm `lean-toolchain` = `leanprover/lean4:v4.28.0` and lakefile mathlib `rev = v4.28.0` UNCHANGED
   in the returned archive (Aristotle built against these; an altered pin is a red flag).
3. Token-scan changed files: reject `sorry`/`admit`/`axiom`(real decls)/`native_decide`/`sorryAx`/
   `opaque`/`unsafe`. Kernel `decide` OK. Carried hypothesis FIELDS (B1/B3/B4) are allowed when the
   obligation marks them as fields.
4. Read Aristotle's own `#print axioms <thm>` for each target — must show ONLY `propext`,
   `Classical.choice`, `Quot.sound` (a `sorryAx` fails). (`ARISTOTLE_SUMMARY.md` reports these.)
5. Diff every module I did NOT scope as changed — must be byte-identical (no silent statement edits /
   weakened hypotheses / added false hypothesis). An unexplained out-of-scope diff is a bounce.
6. Re-derive the math independently and confirm the Lean statement is the INTENDED statement —
   Lean validity ≠ intended claim. This is the step that catches a clean proof of a weakened goal.

## Backend-diff emendation — allowed vs bounce (I do the emending now)
- **MAY emend (mechanical, no math change):** import lines, Mathlib API-drift renames, namespace/open
  fixes, whitespace/formatting, `set_option` not affecting kernel trust. Record every emendation.
- **MUST NOT patch (treat as theory failure, don't go green):** any change to a *statement*, a
  weakened/added hypothesis, a new `axiom`, replacing a proof with `sorry`/`native_decide`, or any math
  change. A candidate that only passes after a forbidden change = `candidate-fails-audit`.

## The four verdicts (exactly one per obligation; distilled to manager)
- **proved (trusted-from-prover)** — Aristotle compiled it server-side (matching toolchain) AND it
  passed the zero-cost artifact audit (clean tokens, axioms ⊆ propext/Classical.choice/Quot.sound,
  no out-of-scope diff, statement is the intended one). Trusted-from-prover (Aristotle's kernel ran,
  ours didn't); the manager may later upgrade to "verified" by building in the canonical env. Attach
  proof for folding. (Was "proved + re-verified" — the local re-verify gate is dropped; the audit is
  the gate.)
- **counterexample** — Aristotle refuted it. Relay verbatim; repairing the statement is MY call.
- **still-open** — no proof / timeout / partial. Record furthest state + blocker.
- **candidate-fails-audit** — host reports proved but the artifact audit fails (dirty axioms/`sorryAx`,
  forbidden token, altered toolchain pin, out-of-scope statement weakening, or only "passes" via a
  forbidden emendation). Record the failing diagnostic. (Was `candidate-fails-local-recheck`; renamed —
  the failure is now an audit failure, not a local-build failure.)

## ⛔ Connection / toolchain status (live) — SMOKE-TESTED 2026-06-08
- Host `aristotle.harmonic.fun`: **UNBLOCKED — CONFIRMED with a real round-trip** (no more
  `403 host_not_allowed`; both smoke lemmas submitted, ran, and returned archives). The old network
  allowlist block is gone.
- **API-KEY GOTCHA (live):** `$ARISTOTLE_API_KEY` in this env is wrapped in literal angle brackets —
  value is `<arstl…H24>` (len 51). Passed verbatim the server returns **"Invalid API key"**. STRIPPING
  the leading `<` and trailing `>` (→ `arstl…`, len 49) authenticates and round-trips. Working pattern:
  `STRIPPED=$(python3 -c "import os;k=os.environ['ARISTOTLE_API_KEY'];print(k[1:-1])")` then pass
  `--api-key "$STRIPPED"`. **Flag to manager/operator:** the env var should hold the bare key (no `<>`);
  this is a provisioning artifact, not a real auth failure.
- **EXACT WORKING INVOCATION (verified):**
  `export PATH="/root/.local/bin:$PATH"` then
  `uvx --from aristotlelib aristotle submit "<instructions>" --project-dir <dir> --api-key "$STRIPPED" --wait --destination <out>`
  CLI = aristotlelib **2.0.0**; verbs: submit · ask · formalize · download · list · show · tasks · cancel.
  `--destination` writes a **gzip tar** (`tar -xzf`), containing `<name>_aristotle/` with the .lean,
  `lakefile.toml`, `lean-toolchain` (= `leanprover/lean4:v4.28.0`, matches canonical), `lake-manifest.json`,
  `README.md`, `ARISTOTLE_SUMMARY.md`. Poll/inspect a task: `aristotle show <project_id> --api-key … --limit 0`.
- No `lean`/`lake`/`elan` toolchain in this container → **but this is no longer a blocker** (operator,
  2026-06-08): Aristotle compiles server-side in the matching toolchain, so the returned candidate IS a
  compiled proof. I do NOT owe a local `lake build`. What I DO owe is the **zero-cost artifact audit**
  (token-scan + read Aristotle's `#print axioms` + unscoped-module diff + math re-derivation) — none of
  which needs a toolchain. A clean, audited candidate is reported **trusted-from-prover** (NOT
  PENDING-LEAN). The PENDING-LEAN label is retired.

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
  CLI. **SMOKE STATUS (2026-06-08): both round-trips COMPLETED.**
  - **smoke_true (`2+2=4`):** task COMPLETE_WITH_ERRORS (no open goal to fill — already proved by
    `norm_num`). Aristotle built it server-side, confirmed it closes, reported `#print axioms` =
    `propext` only (within allowed propext/Classical.choice/Quot.sound). Returned .lean unchanged.
    **Verdict label: proved (trusted-from-prover)** — server-compiled, clean axioms, audit passes.
    (Under the 2026-06-08 process update; was "PENDING-LEAN" before the no-local-re-verify clarification.)
  - **smoke_false (`∀ n:ℕ, n = n+1`):** task COMPLETE. Aristotle correctly did **NOT** prove it —
    declared it false, gave counterexample n=0 → 0=1, commented out the original unprovable theorem,
    and instead proved the *negation* `¬(∀ n, n=n+1) := fun h => by cases h 0`. No fabricated proof of
    the false goal; no active `sorry`. **This is the desired refutation outcome — no red flag.**
    **Verdict label: counterexample (correct refutation).**
  - Net: the direct submit→candidate loop WORKS end-to-end and Aristotle's server compile is the build;
    no local `lake build` gap remains. Discrimination test passed — prover did not "prove" the false one.

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
- **PH-5** C¹ continuity at smooth-pasting S*=Kγ/(γ+1) (value+slope = engine seam gate) — **NEEDS-REPIN
  (v26c, 2026-06-08).** HEAD registers strike at **θ=sNorm(K)=(oracle₀/S)^γ**, NOT θ=K/oracle (PH-5/ITM
  spec text is stale on θ). Same closed form, corrected registration coord — NOT a settlement-semantics
  change. ALSO incomplete: seam gate binds TWO wings (A: call 1−S/K, S*=Kγ/(γ+1)<K; B: put 1−K/S,
  S*=K(γ+1)/γ>K); PH-5 names one branch → extend to branch B. autonomous; ESCALATE only if locked form
  found NOT C¹ (seam gate currently green: value 0.04%, slope 0.1% ≤0.15%).
- **PH-6** rebase structure-preserving θ→θ/r — sNorm gauge proved-in-prompt; J/R preservation open.
  v26c CONSISTENT (cleaner: θ=sNorm(K) reads strike in the gauge-invariant coord; sNorm* tracks θ→θ/r). autonomous.
- **PH-7** funding well bounded below (model floor, H=S−logS) — proved-in-prompt. autonomous.

## Build-derived theory candidates (v26c recap, 2026-06-08 — notes/PH_RECAP_2026-06-08.md)
NOT yet in PH-1…PH-7 / C / B. All AUTONOMOUS formalization; none submitted (recap only). Priority:
- **R1** Re-pin PH-5 → θ=sNorm(K), extend to 2 branches (highest value; only PH item v26c touched).
- **R2** crossover-at-K / coordinate-invariance theorem: θ=sNorm(K) ⇒ OTM→ITM crossover at dollar K
  ∀γ (θ=K/oracle drifts to oracle₀²/K for γ>1; γ−1 gauge defect) + mixed-basis negative control. NEW.
- **R3** small pin `mpGeom=getMP_raw·e^(−ghMu)`, `getMP_raw/slope=e^μ` — prerequisite for PH-2/PH-3 GH
  (slope vars must use mpGeom not getMP_raw price coord; the slippage-bug conflation).
- **R4** directional/orientation lemma: sign(K−oracle)==sign(funding ±2)==sign(d mark/d sNorm); CALL all
  +, PUT all − ; companion to PH-3. CAVEAT funding stays price-measure (θ-swap flips its sign).
- **R5** (opt) %-slippage basis-independence (e^μ cancels) — corollary of R3, not its own obligation.

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

## Audit discipline (before folding any returned archive — zero-cost, no toolchain)
Extract → diff unchanged modules → token-scan (`sorry`/`admit`/`axiom`/`native_decide`/`sorryAx`/
`opaque`/`unsafe`; kernel `decide` ok) → read proofs → **re-derive the math independently** → read
Aristotle's `#print axioms` (must be only `propext`/`Classical.choice`/`Quot.sound`). Server-compiled
+ audited = **trusted-from-prover** (manager may upgrade to "verified" by building canonically; that's
a label upgrade, not a gate I owe). Pin every predicate **before** a run.

## Decisions that route to the operator (flag via manager)
|Γ|>1 scope ("true American" vs "exact replication" are mutually exclusive per wing → ship |Γ|≤1
exact or |Γ|>1 as a *labelled approximation*); calibration tier for Γ (oracle tier needs adversarial
review); any paper claim. Don't over-promote (the "tripwire" failure mode).
