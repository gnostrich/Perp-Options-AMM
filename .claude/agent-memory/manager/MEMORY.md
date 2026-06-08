# MEMORY — manager (cross-role rollup = state of the whole project)
_Last updated: 2026-06-08, bootstrap. This is the project's state-of-the-whole; git history is the
mechanical audit trail. Rewrite the changed bits at the end of every task._

## HEAD / verification
- **HEAD = `engine/builds/HEAD_temporal_mvp_v26a.html`, md5 `89ae89e9df229186b134ca6638726d0c`.**
  GH curve swap (v25) + v26a barrier-remnant fixes + slippage units fix.
- **Manager-verified at the Node level (2026-06-08):** ran `engine/verify/run_all.sh` myself —
  7 GH gates PASS (γ∈{1.5,2,3,4}), curveTrace 401/401 on the GH curve (worst slope err 5.16e-12),
  marker on-curve (getMP_raw(eq)=136000.00), slippage splice-level PASS (0.99%/$3.46 → 71.45%/$6240.94),
  loud-NaN guard OK. **UI still owed to tester** (browser visual). Lean = trusted-from-prover.
- Blobs intact: webp `ab663f5c…` (line 74), svg `c505b08a…` (line 1060). File-safety hook live.

## Build lineage (engine/builds/BUILD_LINEAGE.md)
| file | md5 | what |
|---|---|---|
| temporal_mvp_v24_rebase_fixed_2 | 6f606f52 | clean barrier base (pre-GH) |
| temporal_mvp_v25_gh | 9910c699 | barrier→GH swap; 4 curve fns + calibration; 7 gates |
| temporal_mvp_v26a_fixes | 951d16eb | 3 barrier remnants fixed |
| temporal_mvp_v26a_2c0337e8_slipWIP | 2c0337e8 | slippage WIP — **known-broken (~97% flat)**, lineage only |
| **HEAD_temporal_mvp_v26a** | **89ae89e9** | slippage units fix (both paths → mpGeom) — **work from this** |

## Roster (5 agents, after 2026-06-08 aristotle-fold config task)
manager · **research-lead (theory owner AND its own prover interface)** · intern · tester · paper.
The standalone `aristotle` agent is **REMOVED** — folded into research-lead. The prover loop is now
**direct, no courier:** research-lead phrases the obligation → calls `aristotle submit` itself (host
Harmonic's Aristotle) → polls → local `lake build` re-verify (emends mechanical backend diffs only) →
records one of 4 verdicts (proved+re-verified / counterexample / still-open / candidate-fails-local-
recheck) → audits/interprets. **research-lead keeps ALL raw prover/poll/lake output in its own context;
I receive only distilled reports** (verdicts, queue status, escalations) and relay nothing between
agents. research-lead holds Bash + the aristotlelib CLI; it does NO git/env actions (I am sole git/env
actor). I do **not** see raw prover output and am no longer a courier.

## Aristotle connection (now research-lead's, for my orchestration awareness only)
- Interface = `aristotlelib` CLI (`aristotle submit/formalize/list/show/download/cancel/tasks/ask`),
  auth `ARISTOTLE_API_KEY` (set, len 51), host `aristotle.harmonic.fun`. `uvx --from aristotlelib
  aristotle …` (uvx present); no official Harmonic MCP → **no `.mcp.json`**; routines use the
  **Harmonic connector**. Full invocation/re-verify procedure lives in research-lead's MEMORY.md — I
  don't run it.
- **Host UNBLOCKED — CONFIRMED 2026-06-08** via a real round-trip (research-lead, direct CLI). The old
  `403 host_not_allowed` is gone; both smoke lemmas submitted, ran, returned archives.
- **API-KEY GOTCHA (escalate to operator):** `$ARISTOTLE_API_KEY` is stored wrapped in literal angle
  brackets `<arstl…>` (len 51); passed verbatim the server returns "Invalid API key". research-lead
  strips the `<>` (→ len 49) to authenticate. **Fix the stored secret to the bare key** so no workaround
  is needed. Provisioning artifact, not a real auth failure.
- **Toolchain gap — OPERATOR ACK'D 2026-06-08: NO ACTION / DEFERRED.** No `lean`/`lake`/`elan` in
  container → **local re-verify is PENDING-LEAN** (needs Lean v4.28.0 + Mathlib v4.28.0). Submit→candidate
  works; re-verify half does not run here — nothing is reported as "proved + re-verified" until a
  toolchain lands. Operator chose to leave it for now; not a blocker for config work.
- **API-key `<>` wrapper — OPERATOR will fix at their end.** Until then research-lead's strip-workaround
  (`k[1:-1]`) stays. Don't treat "Invalid API key" as a real auth failure — it's the wrapper.
- **SMOKE RESULT (2026-06-08, research-lead distilled):** direct loop works end-to-end through
  submit→candidate. `smoke_true` (`2+2=4`) → valid candidate, axioms = propext only; **label: candidate
  returned, re-verify PENDING-LEAN** (NOT proved+re-verified). `smoke_false` (`∀n,n=n+1`) → Aristotle
  did NOT prove it: declared false, gave counterexample n=0→0=1, proved the *negation* instead; **label:
  counterexample (correct refutation), no red flag.** Discrimination test PASSED — prover did not fake
  the false goal, research-lead labeled it `counterexample` not `proved`. (Manager independently
  corroborated against the Harmonic dashboard the operator shared.)
- Routine spec: `docs/routines/aristotle_ph_loop.md` (now the direct, research-lead-only loop).
- PH consistency spec: `specs/port_hamiltonian_consistency.md` (PH-1…PH-7). Conditional escalations
  only (PH-4/B1 ship-gate; PH-5 if-not-C¹) — none forces an engine change as written.

## Open threads (what | owner | status)
1. **Tester browser re-run on HEAD** | tester | **OWED — this is the first resume action.** Confirm
   slippage display (% primary, $ reserve-USD label), v26a frame re-fit (dot ~fixed while axes
   rescale; one-line revert exists), GH-continuation curve. Needs Playwright network grant.
2. **Surface Finding-2** | tester→manager→operator | tester flags during the run; I escalate.
   American strike as a ratio peg floating off dollars (UX fix) vs dollar-anchored "$120k call"
   (real engine change). Operator decides.
3. **v26b — ITM/American build** | intern | CLEARED, NOT STARTED. Build on HEAD per
   `specs/SPEC_itm_exercise_smoothpaste_NEXT.md`; wire `verify/seam_gate.js` into run_all.
4. **Blob-ledger reconcile** | manager + operator | OPEN. Files carry canonical `ab663f5c`/`c505b08a`;
   old ledger lists minified `8d2e1a84`/`1b320fc5`. Fix the ledger; never restore minified blobs.
5. **Layer-2 honest-dollar slippage $** | manager/intern | DEFERRED, non-blocking. Route reserve-USD
   through the existing carved-perp settlement chain; reuse, don't improvise.
6. **Lean GH gate-discharge** | research-lead→Aristotle | OPEN. Instantiate GH, discharge 4 gate
   fields; watch `coercive = BddBelow` (bounded reserves).
7. **Ship-gate B1 — funding-coverage sweep** | manager/intern | OPEN. The one thing geometry can't
   close (κ is extrinsic). Necessary, not sufficient (B1/B3/B4 hypotheses).
8. **Publication** | paper | background. AfT 2026 (notif ~Jul 15), WINE 2026 (~Jul 2), FMBC 2027.

## Locked decisions (don't reopen unless the operator does)
- Curve-baked **GH only, γ>1, no barrier** (barrier exponent is outside the GH family; δ won't
  recover it). Carry **P = Ny/Nx** load-bearing; rebase recomputes P→P/r; anchor w=½, strike ray
  θ→θ/r on rebase; convexity knob γ∈(1,4).
- **Slippage** references `mpGeom = getMP_raw·e^(−ghMu)`; **% is basis-independent**; **$ = Layer-1
  reserve-USD** for now.
- **ITM → American smooth-pasting:** free boundary `sNorm* = θ·((γ+1)/γ)^γ`, price `S* = K·γ/(γ+1)`,
  `c = 1/((γ+1)·sNorm*)`. Funding = slope-deviation ratio vs the w=½ anchor at the strike ray —
  orthogonal to intrinsic, untouched by the ITM change.

## THE gotcha
`getMP_raw` is a **price coordinate**, not the slope: `|dy/dx| = getMP_raw·e^(−ghMu)` (11.7/44.5/749/13780
at γ=1.5/2/3/4). Gates are mostly **self-consistency**; the one accuracy gate is G4 (value∝S^(−γ));
ITM adds a seam gate. A price/slope conflation passes every self-consistency gate. Re-derive against
geometry; comments lie.

## Escalation (Gate 2)
Autonomous = how-to-execute (dispatch spec'd work, harnesses, re-derive, audit proofs, git, blob-safe
passes behind the hook). Escalate to operator = what-we're-building (curve/invariant, settlement
semantics, reopen a locked decision/ship-gate, product calls Finding-2 / |Γ|>1 / Fork A-vs-B,
calibration tier, paper claims). Irreversible/high-blast-radius escalates regardless.

## Git/PR state (2026-06-08, aristotle-fold task)
- Working branch **`claude/upbeat-allen-w07u52`** = thompson base + the two aristotle-fold commits
  (`d4c7055` config collapse, `19e0bc6` smoke result). Pushed to origin. **Supersedes**
  `claude/vigilant-thompson-orizg8` (deleted aristotle files net to zero vs main).
- **PR NOT YET OPENED — blocked in-session:** `gh`/`glab` absent; GitHub MCP tools + ToolSearch
  **not enabled in this context**; new `GH_TOKEN` is **proxy-scoped** (push/merge OK, but 401 "Bad
  credentials" vs api.github.com REST). Manual open link handed to operator:
  `https://github.com/gnostrich/Perp-Options-AMM/pull/new/claude/upbeat-allen-w07u52`. Retry the
  instant any of {MCP connector, gh, REST-scoped token} is enabled. **Operator said PR-only — DO NOT
  merge** even though GH_TOKEN now technically permits push-to-main.

## Waiting on operator (bootstrap)
- **PR open** for the aristotle-fold branch (see Git/PR state) — needs GitHub tooling enabled.
- Playwright network grant + browser install → tester's live v26a run.
- Operator reply **"go"** = checklist done.
