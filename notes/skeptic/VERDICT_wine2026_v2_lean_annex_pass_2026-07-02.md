# SKEPTIC VERDICT — WINE2026 v2 final pass (J1 engine stat / J2 O1-O2 / J3 entry-321 annex / J4 entries 318+322), 2026-07-02

Artifact: `git diff paper/wine2026/temporal_wine2026_v2.tex` (154 ins / 39 del; only file modified — supplement untouched, confirmed by `git status`).
Operator ground truth read verbatim: `history/operator/2026-06-10_kurtosis-curve-family-brief.md` entries 316–323.
Evidence re-derived from: `evidence/pkg_itm_v2_acceptance/` (RESULT_runA/B.json, RUN_LOG_runA.txt, INDEX.txt), `engine/builds/DIFF_LEDGER.md` (9fdde1de / a6ca02f3 / 7015c22c entries), `formal/INDEX.md` (O-BATCH, MERTON, T1a/T1b, R2/C1/C2/C3, MonolithConstM, PHUnification, solvency stack), `curves/gh/PIVOT_MAP.md:150`, the current tex, harness `engine/verify/pw_pkg_itm_v2_acceptance.mjs`.

## VERDICT: ONE FLAG-OVERSELL. NOT clear-to-commit as-is; clear once discharged. Everything else attacked and held.

### FLAG-OVERSELL — annex row L8 sells the FAITH-4 `faith_merton` ENGINE gate as a Lean/tfp result
Row L8 ("...a dedicated consistency gate...") and the body site (tex line 638–639, "our machine-checked
Vieta sum/product relations and a dedicated consistency gate^L8") fold `faith_merton` into a table whose
preamble asserts EVERY row is "machine-checked by an external Lean 4 theorem prover and trusted as
compiled (tfp)" and is "statements about the specification-level objects of the formal development, not
about the production engine's code." `faith_merton` is a JS engine harness — `engine/verify/faith_merton.js`
(PIVOT_MAP.md:150; my own 06-23 FIX-1 verdict established it as the ENGINE gate, distinct from the Lean
`merton_vieta_sum/prod`). The header-comment codename map (tex line 54) confirms the intent: "L8
merton_vieta_sum/prod, faith_merton, Sstar_is_merton_boundary, gaussian_limit_quadratic" — one engine
artifact hidden among three Lean ones. The PREVIOUS cleared text kept the distinction exactly right
("our Lean merton_vieta_sum/merton_vieta_prod and the FAITH-4 faith_merton gate"); the de-codenaming
restructure collapsed it, upgrading engine-gate provenance to Lean tfp. Steelman for the text as-is:
"machine-checked" could colloquially cover an engine check — but the annex preamble forecloses that
reading by naming the Lean prover, and "full formal statements available on request" invites a referee
to ask for a Lean artifact that does not exist for the gate. Provenance honesty is this paper's declared
spine (§6.1 "tfp, never verified"); one mislabeled row undermines the whole table. Hole named; fix is the
manager's/paper's to choose.

### J1 — engine sentence (tex 666–672): VERIFIED, factually covered, three non-blocking advisories
- RESULT_runA/B on `9fdde1de` (md5 pre/post unchanged, A==B byte-identical): all 10 paper cells (5 per
  column, incl. both S* rows) DOM-read with |d| = 0.0e+0 at 4dp (RUN_LOG per-cell lines re-read); both
  arms covered (continuation cells + intrinsic cells 0.2000/0.3023/…); both boundary points measured
  (0.3333 at S/K=0.66667; 0.1429 at S/K=0.85715 — the paper's $66.67/$85.71 at K=$100). Sign table
  belowIntrinsic = 0; CM10 value≥intrinsic is in `lens_selfcheck` 16/16 [HARD], negative-controlled
  (old build fails it — not a tautology gate; my R6 FLAG-2 output-path demand was honored: DOM sign
  table + hard gate). "These are engine measurements, not Lean theorems" — correct label.
- HEAD identity: I md5'd `HEAD_temporal_mvp_v28_lens.html` = `7015c22c…`; DIFF_LEDGER (dash-fix entry)
  records engine+state blocks BYTE-IDENTICAL to `9fdde1de` by node string-compare, draw-layer-only fix,
  targeted recheck 17/17 ×2. Chain holds.
- ADVISORY (a): the sweep ran (γ=1, m=2) and (γ=1, m=6) — spec-§6 pinned sandbox values — not the
  table's literal (γ=2, m=1/m=3). Same g_loc ∈ {2,6}; the carry-over rests on mark = f(g_loc, S/K)
  only, which is itself L3-checked and engine-gated (CM1), and the table's columns are parameterized by
  g_loc in the paper's own text. The rendered values were literally produced and matched, so the
  sentence is true of the columns; but "both the m=1 and m=3 columns" reads as literal knob settings —
  a hostile artifact evaluation could surface the substitution. Non-blocking; manager should know it's there.
- ADVISORY (b): "the shipped implementation" — nothing is deployed; the artifact is the single-file
  simulator. Same register as the previously-cleared "the shipped instrument" (tex 727), so not a new
  escalation, and the sentence self-labels as measurement. Non-blocking.
- ADVISORY (c): the table prints 3dp cells; "to four decimal places" is agreement between the DOM and
  the exact model values (which round to the printed cells). Evidence exceeds the claim; wording nit.

### J2 — §5.3 O1/O2 text (tex 605–614) + fig:seam caption: EXACT match to formal/INDEX.md, no overreach
`paste_value_lin`/`paste_slope_lin` (∀ g>0), `Vp_hasDerivAt_seam` ("differentiable AT the seam, not
merely arm-by-arm" — faithful), `paste_unique` (S* and continuation level forced — the text's referent
is the power continuation named in the preceding clause, matching the theorem's power-arm class),
`value_ge_intrinsic` + `value_gt_intrinsic_beyond_seam` (never below, strictly above beyond boundary).
Put-wing disclosure present BOTH in the body parenthetical (612–614) and rows L5/L6; call wing scoped to
value/slope match only — call weld/uniqueness correctly NOT claimed (INDEX: "deliberately not in batch").
O1/O2 are tfp MANAGER-AUDITED 2026-07-02 (O-BATCH section header "audit pending" is stale relative to
its own rows — INDEX hygiene item, not a paper defect). Annex preamble correctly disclaims the engine
bridge ("measured, not extracted"). Fig-3 caption addition ("The weld shown is machine-checked^L5,L6")
faithful — the depicted put weld at g=2 is inside the proven ∀ g>0 class. O5 funding results correctly
NOT cited anywhere (entry-320: funding external; semantics operator-gated).

### J3 — entry-321 restructure: PASS except the L8 flag above
- 26 body superscript sites counted (L1:1 L2:2 L3:1 L4:4 L5:5 L6:3 L7:1 L8:2 L9:2 L10:1 L11:2 L12:4
  L13:1 = 26); every row L1–L13 referenced ≥once; no orphan superscripts; all rows tfp column.
- System introduced at first use: first superscript (L6, line 165) carries the parenthetical
  "(superscripts index the machine-checked results in Appendix ref{app:lean})" — entry-247 satisfied.
- Rendered codenames: comment-stripped scan = only `reserves_have_no_floor` (body 763 + row L12) + the
  three axiom names + `\texttt{axiom}` — exactly the allowed set. Codenames otherwise comment-only.
- Anonymity: comment-stripped scan 0 hits for Temporal/Aristotle/formal//engine//INDEX.md/repo paths.
- "Available on request" footer present.
- Row honesty held under attack: L11 conditional ("GIVEN the B1/B3/B4 hypotheses"), L7 "Snell ... NOT
  formalised", L13 internal-half-only, L9 "posited" surplus, L6 "(put-wing pricing object)", L5 put-wing
  + call-match-only. L4 (valueMatch_g/slopeMatch_g ∀g>0, Sstar_A_forced/coeffA_forced, crossover at K)
  all ✅ GROUNDED in INDEX. L1/L2/L10/L12 exact.
- L3 advisory (non-blocking): "leaves the pool's trade dynamics unchanged" — in the Lean monolith this
  is structural (m enters only the read; `g_eq_gamma_iff_m_one`) rather than a named no-op theorem; the
  engine half is a tester byte-identity fact. Same-or-weaker than the previously-cleared baseline
  wording ("pool-byte-identity ... machine-checked"), so settled ground, noted for the record.
- ≤1pp: 13 rows + 8-line preamble + footer ≈ one LNCS page by line count, but NO LaTeX toolchain exists
  in this env — I could not compile. The ≤1pp condition and the ≤12pp total are UNVERIFIED here; the
  manager must confirm on the compiled PDF before commit counts as satisfying entry-321.
- Off-ATM existence/uniqueness lemmas correctly kept OUT of the annex and still flagged "not counted"
  (tex 341–346).

### J4 — entries 318/322 framing sentence (tex 162–169): FAITHFUL
Operator verbatim: "whatever a trader does is american style consistent, not necessarily optimal" +
"we dont care about optimality, thats a trader choice, the app just has to ensure whatever he does we
give american style payoff as per the traders choice." Sentence delivers exactly that: exercise anytime
(holder-invoked, never automatic — engine-verified in my 06-26 pass: closeBand trader-invoked, no
auto-exercise), value never below payoff^L6, parity by construction, smooth join^L5, and optimality
"additional, exercise timing being the trader's own choice, not a system claim." Superscripts sit ONLY
on the two theorem-backed clauses; the two design-choice clauses are bare. The deterministic-vs-Snell
hedge is NOT weakened: intro (i) untouched, §5.3 616–618 intact, row L7 repeats it. Minor advisory: the
intro's value≥payoff clause is wing-unqualified while L6 is put-wing — the qualification is one hop away
(row L6 + §5.3 parenthetical) and the both-wing statement is engine-gated (CM10) and true by V=max
construction; not a flag.

### J5 — regression sweep: CLEAN
Conditional solvency (§6.2 "assumptions, not claims", "necessary ... never sufficient" — all present,
diff touched only referencing); |Γ|≤1 exact / >1 labelled approximation (157, 727–733); tfp-never-
"verified" (§6.1 heading + text intact, now prefixed by the L1–L13 index sentence); Balancer-not-GH (GH
only as carried Bessel-K layer, 644–645); curve-family-not-contribution (172–175, untouched); Merton
regime r>σ² + "how literally" design-parameter hedge (633–658, untouched); vol-direction (140–146,
untouched, still operator's entry-289 direction). Worked example table untouched (587–591 byte-same);
figures untouched except the fig:seam caption sentence (J2 scope, faithful); supplement file untouched;
no new unglossed symbol.

## Bottom line
Discharge the L8 `faith_merton` misattribution (row L8 + body 638–639 + header map line 54), and confirm
the annex fits 1pp on the compiled PDF — then this pass is clear. Verdict to be relayed verbatim.
