# VERDICT — WINE v2 §3.2 mark rewrite (focused confirm) — 2026-07-02

**Artifact:** `git diff paper/wine2026/temporal_wine2026_v2.tex` — one hunk, lines 357–372
(old barrier-era eq:mark = min(slope,1/slope) + "climbs toward 1 near the money" → smooth-pasted
American value, forward-ref §5). Companion diff: paper agent MEMORY.md only (not paper body).
Operator basis: entries 326/327/330 (fix the retired mark teaching), 331 (no disclosure prose).

## VERDICT: PASS (CLEAR to commit)

### Attacks attempted (all failed)
1. **Re-derived the definition against the shipped object** (python, exact rationals):
   ATM continuation at g=2 is V = (1/(g+1))·(S*/S)^g with S*/K = g/(g+1) ⇒ 4/27 = 0.148148 —
   matches the new text's "0.148 at γ=2" and the §5 table cell ($100=K, m=1 column), which I
   re-derived cell-by-cell on 07-02 (R6 verdict) and which the tester DOM-verified at 4dp on
   HEAD 9fdde1de/7015c22c (J1, settled ground). Equivalently V = [g^g/(g+1)^(g+1)]·(K/S)^g —
   i.e. literally "a power of that read times a constant fixed at the smooth join"; the ATM
   value IS the seam-fixed constant. The sentence is exact, not just gestural.
2. **Attacked "(0,1]" vs §5's "a single uncapped option wing keeps growing past 1"** (line 563):
   no contradiction — the new escrow-unit gloss ("fraction of the wing's escrow unit, one full
   perpetual future") pins the mark to the bounded/spread object; the shipped engine arms are
   1−S/K and 1−K/S ∈ (0,1], cap attained only at full exercise, matching §5.1 line 557 verbatim
   and the entry-234 caption ruling. (0,1] was also in the old text; it is now correctly
   justified rather than newly claimed.
3. **Attacked the continuation/exercised split**: the text splits at the FREE BOUNDARY, not the
   strike — correct. The ITM-before-boundary region (e.g. put at $80 with S*=$66.67, mark 0.231
   = continuation) is covered: "out-of-the-money ⇒ continuation" is true, and "past the free
   boundary ⇒ exercised" is the correct complement; §5 states the strike-is-interior fact
   explicitly. No false clause to break.
4. **Attacked the power-claim scope**: "the WAITING value is a power of that read" — scoped to
   the continuation arm only; the exercised arm is named "exercised (parity) value" with no
   power claim. Does not claim the whole mark is a power. Holds.
5. **Dangling-reference sweep**: zero `eq:mark`, zero `min(slope`, zero "climbs toward",
   zero "lesser of" anywhere in v2 body or rendered supplement. Diff = exactly 1 tex hunk;
   §5.1's prior-treatment lift paragraph (lines 533–537) byte-untouched and is now the sole
   prior-treatment mention — entry-331 honored (no disclosure prose in the new text).
6. **Entry-247 glosses**: γ pre-introduced (intro line 141 via γ(γ+1)=2r/σ², contributions
   lines 185–186 "convexity exponent"); escrow unit, continuation, free boundary, parity,
   notional all glossed inline by apposition; "moneyness" defined by its own clause (strike
   ray's slope vs pool ray). m correctly NOT mentioned (not yet introduced at §3.2).

### Advisories (non-blocking, logged for the record)
- (a) "0.148 at γ=2" under-pins the worked-example column — the table has TWO γ=2 columns
  (m=1 → 0.148, m=3 → 0.057); only the number itself picks m=1. m cannot be cited pre-§4, and
  the worked-example pointer disambiguates, so advisory only.
- (b) `temporal_wine2026_lncs.tex` (operator-uploaded v1 reference draft, commit 5ac452d, out
  of this diff's scope) still RENDERS the retired eq:mark min(slope,1/slope) at its lines
  261–265 — fine as a retained historical upload; must never be mistaken for a shippable draft.
- (c) `temporal_wine2026_v2_supplement.tex` line 44: the fully commented-out Appendix-A glossary
  still carries the retired mark row in its dormant text — renders nowhere today; if that
  glossary is ever uncommented the barrier-era definition resurfaces silently.

**skeptic**
