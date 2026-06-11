#!/usr/bin/env python3
# Tester-applied stale-fact fixes to engine/builds/DIFF_LEDGER.md (markdown only, no engine source).
# Scope: skeptic run-8 condition 6 (row #12 + OQ item 4), 4 stale notes/->curves/ paths
# (slice-1 audit, dc254ad), provenance upgrades now that history/operator/2026-06-10 exists.
# Every replacement asserts count==1 before writing. Tester, 2026-06-11.
import io, sys

P = "/home/user/Perp-Options-AMM/engine/builds/DIFF_LEDGER.md"
txt = io.open(P, encoding="utf-8").read()
orig = txt

def rep(old, new, tag):
    global txt
    n = txt.count(old)
    assert n == 1, f"{tag}: expected 1 occurrence, found {n}"
    txt = txt.replace(old, new)

# R1 — FEATURE-STATE TABLE row #12, wording per skeptic run-8 condition 6 EXACTLY (prefix),
# + tester's own fresh evidence (full suite re-run green 2026-06-11 vs HEAD 6cc73563).
rep(
    "| 12 | getMP_raw price-coord gotcha | Doctrine + partially gated (slope-identity in run_all); full faithfulness gate = HELD pivot | — | GUARDED — pivot pending |",
    "| 12 | getMP_raw price-coord gotcha | 5 faith gates landed green (a8998cf); completeness of the faithfulness program unaudited — tester re-ran full suite green 2026-06-11 vs HEAD `6cc73563` (doctrine + slope-identity gate retained) | 2026-06-10 (a8998cf) | GUARDED — completeness unaudited |",
    "R1 row12",
)

# R2 — OPERATOR OPEN QUESTIONS item 4: hold LIFTED (entry-14 ruling 1, verbatim transcript);
# what stays OPEN is the completeness audit, per condition 6 wording.
rep(
    """4. **Engine-faithfulness PIVOT — HELD by operator instruction.** [#12] "operator is finishing
   config first; do NOT begin the pivot until told" (manager `MEMORY.md:163` [manager-recorded]).
   Standing hold; resumes only on operator lift.""",
    """4. **Engine-faithfulness PIVOT — hold LIFTED by operator ruling; 5 faith gates landed;
   completeness audit still OPEN.** [#12] Original hold: "operator is finishing config first; do
   NOT begin the pivot until told" (manager `MEMORY.md:163` [manager-recorded]). RULED-lifted
   2026-06-10: operator answered **"1 yes"** to the manager's plain-English un-hold question —
   pivot built and gated before any new theory work
   (`history/operator/2026-06-10_project-status-review.md` entry 14 ruling 1
   [verbatim-transcript]; encoded as CLAUDE.md §0 ruling 1). Landed: 5 faith gates landed green
   (a8998cf); completeness of the faithfulness program unaudited — that completeness audit (live
   engine reproduces EVERY proven construct) is what remains OPEN here. Tester re-ran the full
   suite green 2026-06-11 incl. FAITH 1–5 (HEAD `6cc73563`). _(Stale "HELD" fixed 2026-06-11 per
   skeptic run-8 condition 6; tester-applied.)_""",
    "R2 OQ4",
)

# R3..R6 — the 4 stale notes/ paths (skeptic slice-1 audit; moves landed in dc254ad).
# Line refs re-verified by tester against the moved files 2026-06-11:
#   CURVE_SWAP :93 unchanged; KURTOSIS_KNOB :20-22 unchanged; :282-284 -> :284-285; :175-176 -> :177.
rep("`notes/CURVE_SWAP_GH_vs_CES_analysis_2026-06-09.md:93`",
    "`curves/gh/CURVE_SWAP_GH_vs_CES_analysis_2026-06-09.md:93`", "R3 curve_swap path")
rep("`notes/KURTOSIS_KNOB…:20-22`",
    "`curves/balancer_w/KURTOSIS_KNOB_kappa_balancer_native_2026-06-10.md:20-22`", "R4 kk path 1")
rep("`notes/KURTOSIS_KNOB…:282-284`",
    "`curves/balancer_w/KURTOSIS_KNOB…:284-285`", "R5 kk path 2 (+line drift)")
rep("`notes/KURTOSIS_KNOB…:175-176`",
    "`curves/balancer_w/KURTOSIS_KNOB…:177`", "R6 kk path 3 (+line drift)")

# R7 — header mandate cite upgrade: the 2026-06-10 directive is now verbatim on disk (entry 5).
rep(
    """(operator directive
2026-06-10, relayed verbatim in the tester dispatch; encoded in `.claude/agents/tester.md` L44–53)._""",
    """(operator directive
2026-06-10 — now verbatim: `history/operator/2026-06-10_project-status-review.md` entry 5;
encoded in `.claude/agents/tester.md` L44–53)._""",
    "R7 header cite",
)

# R8 — provenance note: original paragraph stays VERBATIM (true at writing); dated UPDATE appended.
rep(
    """> Recommendation: export the 2026-06-08/09/10 chat transcripts into `history/` so this layer can
> be audited against raw words, not reconstructions.""",
    """> Recommendation: export the 2026-06-08/09/10 chat transcripts into `history/` so this layer can
> be audited against raw words, not reconstructions.
> _UPDATE (tester, 2026-06-11):_ **the 2026-06-10 session is NOW verbatim on disk** —
> `history/operator/2026-06-10_project-status-review.md` (backfilled at policy creation; entries
> 1–6 predate the policy within the same session, labelled honestly there); 2026-06-11 sessions
> transcribe live per §2.2. **2026-06-08/09 remain the gap** — the export request stands for those
> two days only. Same pass: the 4 stale `notes/…` cites below refreshed to their post-restructure
> `curves/…` homes (dc254ad); line refs re-verified against the moved files — two had drifted
> (`:282-284`→`:284-285`, `:175-176`→`:177`), quotes re-checked at the new lines.""",
    "R8 provenance update",
)

# R9 — pain-points RESOLVED item: upgrade manager-recorded fragments to verbatim transcript cites.
rep(
    """- **2026-06-10 pain points (3)** — all addressed same day: skeptic agent live, this DIFF_LEDGER
  live + hardened, formal/INDEX.md promoted. Operator approval fragment: "yes to all"
  (`MEMORY.md:32`); hardening fragment: "diligent… feature-level… so I don't ever have to keep
  inventory" (`MEMORY.md:44-45`) [quote fragments, manager-recorded].""",
    """- **2026-06-10 pain points (3)** — all addressed same day: skeptic agent live, this DIFF_LEDGER
  live + hardened, formal/INDEX.md promoted. Operator approval: "yes to all"
  (`history/operator/2026-06-10_project-status-review.md` entry 2 [verbatim-transcript]);
  hardening mandate: "Id especially want the version control agent to be diligent in recording
  features level changes desirable not desirable etc so i dont ever have to keep inventory of the
  same" (same file, entry 4 [verbatim-transcript]). _(Cites upgraded 2026-06-11 from
  manager-recorded fragments — the session transcript now exists verbatim.)_""",
    "R9 pain-points cites",
)

assert txt != orig
io.open(P, "w", encoding="utf-8").write(txt)
print("OK: 9 replacements applied to", P)
