# VERDICT — R6 scope-gate: PKG-ITM (a) V=max/re-seam engine fix + (b) display slice (2026-07-02)

**Artifact:** the itemized (a)+(b) dispatch scope as shown to the operator (entry-297 reply), go = entry 298
("ok lets go!"), rigor mandate = entry 299 (verbatim: "but its a bit of an act / leap of trust for me, so just
make sure you've got me covered by being rigorous").

**VERDICT: CLEAR-TO-DISPATCH conditional on three FLAGs below.** (a) may dispatch the moment FLAG-1 and FLAG-2
are discharged; FLAG-3 must be discharged before (b) dispatches. The core scope is citation-backed, contains no
smuggled item, and the manager's contested reading (OTM quotes shift) is CONFIRMED citation-backed — no extra
operator sentence is strictly required (evidence chain below).

## Attack performed (not narrated)
- **Re-derived both paper columns from scratch** (python, exact): re-seamed put continuation
  V(S)=(1/(g+1))·(S*/S)^g with S*=K·g/(g+1) reproduces EVERY cited cell — m=1 (g=2): 0.333@66.67 / 0.2315@80 /
  0.1829@90 / 0.1481@100 / 0.1029@120; m=3 (g=6): 0.1429@85.71 / 0.200@80 (intrinsic, 80<85.71) / 0.1066@90 /
  0.0567@100 / 0.0190@120. Byte-matches `paper/wine2026/temporal_wine2026_v2.tex` §5.2 (lines 551–555; checked
  in-file). Matches my prior 06-23/06-26 verified passes.
- **Re-read the actual entry-286 sweep evidence** (`evidence/dexters_lab/oracle_sweep_2026-06-26/RESULT_runA.json`,
  25 rows): today's engine continuation mark = (g^g/(g+1)^(g+1))·K/S = 0.1481·K/S exactly (verified at every
  sampled S/K). Manager's cited numbers CONFIRMED: 0.1481@ATM (agrees with paper), 0.1852@S/K=0.8 (vs paper
  0.231), seam empirically at 0.444K, first below-intrinsic dip at S/K=0.80, crossover ≈0.819.
- **Sharpened a claim the manager understates (accuracy note, not a flag):** the fix is BIGGER than "the re-seam
  moves the whole continuation constant." Today's swept continuation is LINEAR in K/S; the target is (K/S)^g-shaped.
  ATM is the UNIQUE agreement point (both equal g^g/(g+1)^(g+1) there; θ·A and θ^g·B cross only at θ=1). So OTM
  quotes DROP (0.1235→0.103 at S/K=1.2; 0.0988→0.066 at 1.5) while near-ITM continuation RISES (0.185→0.231 at
  0.8). Say it that way in the operator report — "the whole continuation reshapes; ATM alone is unchanged."
- **Motive/locked-architecture check:** the fix RESTORES locked truth, it does not reopen it — CLAUDE.md §4 and
  the motive both state S*=K·γ/(γ+1) (lensed: K·g/(g+1)); the sweep proved the live engine sits at 0.444K instead.
  Pool curve/tradeUpdate untouched (motive line 4 intact); funding excluded ✓; knob m untouched (S* tracks
  g_loc=m·γ, matching the lens-corrected shipped paper).

## The five asked checks
1. **Citations:** every (a)/(b) item traces to verbatim operator text — 287 (target arch: separate intrinsic
   module put (K−S)⁺/call (S−K)⁺, V=max, never capped-mark+intrinsic, re-seam 0.444K→0.667K, paper=intended
   product), 286 (sign-of-(mark−intrinsic) headline; "Below-intrinsic anywhere = engine faithfulness bug, not a
   paper edit"), 285 (L4076 stale, settled), 292/295 (chart-2 ITM wings, %→$ toggle, uncapped crossing wings —
   operator's own words), 296 (extend-OTM-machinery direction), 297+298 (itemized walkthrough + go). Item (a)4
   (settlement reads same V) is an ENTAILMENT, correctly so: v28 settlement already reads the ONE shared helper
   (CLAUDE.md §8), so fixing the helper to V=max carries settlement with it; paying below intrinsic is exactly
   the entry-286 bug class. PASS subject to FLAG-1 (provenance of the entry-287 bracket).
2. **Unrequested items: none found.** The two not-operator-named details ((a)5 comment kill — stale per operator's
   own 285 finding; (b) pool-quote-vs-parity styling — a disclosure device) were both IN the itemized list the
   entry-298 go ratified. Nothing detected beyond the list.
3. **R3 control inventory: incomplete — FLAG-3.** The entry-266 tent disposition is present and honest, but
   chart-2's other overlays and one parked operator-flagged caption are silent (detail in FLAG-3).
4. **Paper-table acceptance criterion: FAITHFUL, citation-backed — I agree with the manager's reading.** Chain:
   (i) entry-286 operator frame makes the ENGINE the wrong side ("not a paper edit"); (ii) entry-287 verbatim:
   "paper ships tonight as the linear/0.667 intended product" + "continuation re-seams onto linear →
   S* 0.444K→0.667K" — a re-seamed power-law continuation through (0.667K, 1/(g+1)) mathematically ENTAILS every
   OTM/ITM-continuation quote change, and the operator-edited, operator-ratified, SHIPPED paper table itself
   contains OTM cells (0.103@$120); (iii) entry-297 itemized item 3 says "matches shipped paper"; (iv) entry-298
   go. The OTM shift is the ruling's content, not smuggled scope. No separate operator sentence required.
   Recommended (non-blocking, entry-299 hygiene): one plain-English FYI line in the next operator report stating
   the continuation reshapes with ATM the only fixed point, with the 0.124→0.103 example.
5. **Rigor gaps:** two real ones — FLAG-2 (acceptance-criterion underspecification + tautology risk in the
   rewritten gate) and the FLAG-1 provenance point. Revert posture is covered by standing policy (retained
   source builds + single revertable squash) but the dispatch brief should name the retained-file name as usual.

## FLAG-1 — FLAG-PROCESS (dischargeable by one manager attestation or corrigendum)
The load-bearing citation for the entire (a) build — "Operator decisions: … paper ships tonight as the
linear/0.667 intended product; target arch = … V=max(mark,intrinsic) … re-seams onto linear → S* 0.444K→0.667K"
— sits inside SQUARE BRACKETS within the quoted operator message of entry 287 in
`history/operator/2026-06-10_kurtosis-curve-family-brief.md` (line 2253). Entry 285 in the same file demonstrably
uses brackets/"[...]" as manager condensation inside quotes. If 287's bracket is condensation, that is
paraphrase-inside-quote (§2.2) at exactly the decision the build rests on. Steelman for the manager: the brief's
style (operator-authored task blocks, TEMPORAL-CONTEXT-LEDGER demand) reads operator-authored, and the decision is
corroborated by the 294→298 flow, which presupposes the arch. So this is provenance hygiene, not doubt about the
decision. Discharge: manager attests in the review record that the bracketed text is the operator's exact words,
OR appends a dated corrigendum quoting the original text. Until then the citation label is "manager-condensed
operator decision," not verbatim.

## FLAG-2 — FLAG-OMISSION (acceptance-criterion precision; blocks (a) dispatch until pinned)
(i) **Protocol/column mismatch:** the criterion says "the entry-286 live oracle-sweep protocol re-run … must
reproduce the paper's columns" — but the entry-286 protocol ran the DEFAULT pool w=0.5 ⇒ γ=1 with m=2 (g=2),
while the paper columns are (γ=2, m=1) and (γ=2, m=3), i.e. g=2 and g=6. Re-running the protocol verbatim with
m=1/m=3 gives g=1/g=3 and matches NOTHING; the tester would either spurious-FAIL or quietly adapt the protocol
mid-acceptance — the precise failure entry-299 asks us to prevent. The criterion must pin, in writing, the
(γ, m) pair per column (γ=1&m=2 / γ=1&m=6, or γ=2&m=1 / γ=2&m=3) AND state that column-equivalence-under-fixed-g
is itself asserted, not assumed. (ii) **Tautology risk in the same-pass gate rewrite:** with V=max(mark,intrinsic)
in the code, a gate asserting value≥intrinsic on the FORMULA is an rfl-tautology (the exact failure mode of the
old "M=Fisher" incident). The hard gate must assert on the OUTPUT path — the DISPLAYED mark / settled cash read
the way the entry-286 harness reads DOM text — and the C¹-seam gate must test the re-seamed constant numerically
at 0.667K, not the constructor. Steelman: item 6 already names the entry-286 sign table and tester re-run, which
IS output-path; fine — then the written criterion should say "displayed/settled value," two words, and (i) still
stands regardless.

## FLAG-3 — FLAG-OMISSION (R3 control inventory incomplete; blocks (b) dispatch until dispositioned)
The tent disposition is present, but rewiring chart-2 to the true V=max read with uncapped crossing wings kills
or re-anchors FOUR more user-facing things the scope is silent on: (i) the BAND MARKERS (currently drawn on the
r^g tent via drawStrikeMark — on the V curve they must re-anchor or die; undisposed); (ii) the MODE DASHED LINE
and the peak-at-1 apex convention (dies — uncapped call intrinsic exceeds 1 per entry-287 "may exceed 1", so the
y-axis scale semantics change; undisposed); (iii) the DIFF_LEDGER OPERATOR-VOICE rows entry-226 ("steeper when i
set for higher vol") and L2063 ("mode must reach 1"), both currently RESOLVED-with-evidence against the tent —
the new chart will legitimately FAIL the old L2063 check, so those rows need explicit re-disposition
(RETIRED-by-entry-298-scope), not a silent regression; (iv) the entry-289 PARKED m-slider vol-direction caption:
the operator REVERSED vol calibration in the shipped paper (higher vol ⇒ LOWER knob), the engine UI still says
LARGER M = MORE VOL, and (b) rebuilds exactly the surface where the operator will turn that knob — note also
entry-226's own wording is superseded by the reversal. The scope's EXCLUDED line names funding/vault but gives
this neither an include nor an explicit-defer line; silence is the failure mode. Steelman: (b)'s stated scope is
charts, not sliders, and the caption was parked to "part-2 later" — fine, then the disposition line is one
sentence ("caption fix deferred to <named slice>"); it just has to exist. One disposition line each for (i)–(iv)
discharges this flag.

## Advisory (non-blocking)
At promotion, shared truth must be trued up: CLAUDE.md §4's v26b paragraph asserts the S*=K·γ/(γ+1) dollar
boundary that the entry-286 sweep proved the live engine does NOT exhibit today; after the fix it becomes true —
the §4 text and the DIFF_LEDGER feature rows should be reconciled in the same promotion commit, and the retained
pre-fix build named in the revert chain per standing practice.

— skeptic, 2026-07-02. Relay verbatim.
