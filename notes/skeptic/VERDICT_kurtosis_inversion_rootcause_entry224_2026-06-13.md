# SKEPTIC VERDICT — entry 224/225 ROOT-CAUSE: is the kurtosis↔τ mapping on chart-2 inverted, and does fixing it dissolve the τ-direction conflict?

date 2026-06-13 · artifact: operator entries 224/225 verbatim (`history/operator/2026-06-10_kurtosis-curve-family-brief.md` L1799 "we probably have the inverse mapping for kurtosis on the second chart" / L1807 "which is confusing you"). HEAD read live: `engine/builds/HEAD_temporal_mvp_v28_lens.html` (lens fns L1630-1644, UI label L1318-1321, tx-map prior-verified executeLeg L1801-1804). All numbers re-derived cold: `/tmp/sk_kurt.js`, `/tmp/sk_chart2.js`, `/tmp/sk_elbow_vs_tail.js`, `/tmp/sk_payoff.js`, `/tmp/sk_compress.js`, `/tmp/sk_label.js`. Read-only.

## BOTTOM LINE (read this first)
- **Is the kurtosis mapping "inverted"? — PARTLY YES, but not as a code bug.** There is NO sign-flip in the engine (already line-verified, MEMORY #lens-dir-reconcile: the UI number passes RAW to `state.tau`). What IS inverted is the **WORD "kurtosis" against the geometry it labels** — and the inversion is not a clean flip, it is an **ambiguity**: the τ knob has TWO faces and the operator (and the team) have been silently using DIFFERENT faces on different days. That genuine confusion is real and the operator's instinct is correct: the label is the root cause.
- **Does fixing it make all three of the operator's wants consistent? — YES, arithmetically, IF the operator rules that "more kurtosis / sharper" means LARGER τ.** Under that one relabel, all three wants hold with **no formula change at all** (re-derived `/tmp/sk_payoff.js`). The conflict I proved "impossible" in the R-218 verdict was impossible only under the OTHER reading (sharper = smaller τ). It dissolves under the relabel.
- **BUT this is a DESIGN-INTENT call, not a fact I can settle — and I will not pick it.** Which τ-end deserves the word "kurtosis" is genuinely underdetermined by finance for THIS knob (§3), and it contradicts the operator's OWN earlier signed usage (§4). The fix is a **label/UI relabel** (does not touch chart-2, settlement, or the tx formula) — but WHICH way to relabel is the operator's curve-semantics call. I name it and stop.

---

## 1. WHAT THE WORD "KURTOSIS" SHOULD MEAN, AND WHICH WAY CHART-2 MOVES
Financial kurtosis, the brief's reading: higher kurtosis = fatter tails = OTM options worth MORE = chart-2 (option value vs strike) decays SLOWER in the wings = more value retained far out. That reading is correct as far as it goes.

Which engine end gives "more value retained OTM"? Re-derived cold (`/tmp/sk_chart2.js`, retained value V(K)/V(mode) along chart-2, γ=2):

| OTM strike | τ=0.05 | τ=0.3 | τ=1 | τ=3 |
|---|---|---|---|---|
| K=1.65× mode | 0.404 | 0.568 | 0.790 | **0.921** |
| K=2.72× mode | 0.149 | 0.226 | 0.437 | **0.723** |
| K=7.39× mode | 0.020 | 0.032 | 0.084 | **0.298** |

**LARGER τ retains MORE value at every OTM strike** = fatter-shouldered = the brief's "more kurtosis." So by the tail/shoulder-fatness reading: **more kurtosis ⇒ LARGER τ ⇒ chart-2's elbow rounds wider and the curve sits HIGHER (flatter, more value) over the near-to-moderate OTM band.**

## 2. WHAT THE ENGINE ACTUALLY DOES, AND THE UI WORD ON IT
`g_loc(K)=γ·h′_τ(|u|)`, `h′_τ(u)=u/√(τ²+u²)`, `u=ln(K/mode)`. This is the LOCAL decay exponent of chart-2 (verified live L1639-1644). Re-derived (`/tmp/sk_kurt.js`): smaller τ ⇒ g_loc climbs to γ over a TIGHTER u-range ⇒ tighter/sharper elbow. Elbow half-width = `τ/√3` (`/tmp/sk_label.js`): τ=0.05→0.029, τ=3→1.73. So the UI label L1321 **"Smaller τ ⇒ sharper elbow" is a TRUE description of the geometry.** No lie there.

The trap is the WORD on the knob ("KURTOSIS τ", L1318). Map the geometry to "kurtosis":
- **Peakedness reading (the classical leptokurtic-is-peaked half):** sharper/tighter peak with the SAME pinned tails = MORE peaked = HIGHER kurtosis ⇒ **SMALLER τ.** This is the reading the engine's own label silently assumes, and it is the reading the operator himself used at entries 841 ("less kurtosis = smaller τ via the inverse knob") and 1656 ("sharper lens (less kurtosis as per UX)").
- **Tail/shoulder-fatness reading (§1, the brief's):** more value held OTM = HIGHER kurtosis ⇒ **LARGER τ.**

**These two halves of "kurtosis" point at OPPOSITE τ-ends for this knob.** The reason is the project's most-defended property: the far-tail exponent is PINNED to γ for every τ (`/tmp/sk_elbow_vs_tail.js`: g_loc→γ as |u|→∞ for all τ — asymptote-respecting, "wings stay exact power-laws"). τ does NOT change the asymptotic tail at all; it only changes the **width of the rounded core**. A real distribution's kurtosis moves peak AND tails together; this knob, by design, moves only the core width and freezes the tail. So "kurtosis" is genuinely AMBIGUOUS here — and the brief's framing (item 1) quietly picks the tail-fatness half while the engine/UI/operator-usage picks the peakedness half. **That undisclosed split IS the inverted mapping the operator named.**

## 3. THE PAYOFF — does correcting the inversion dissolve the conflict? ARITHMETICALLY YES
Prior R-218 verdict proved: under R-216-exact the tx-map is the inverse of the VIEW lens, `u_tx=√(a²+2|a|τ)`, and `d u_tx/dτ>0` ⇒ **larger τ pushes the trade FURTHER out.** Re-confirmed cold (`/tmp/sk_payoff.js`, 2×-mode pick): τ=0.05→2.10×, τ=0.3→2.58×, τ=1→3.92×, τ=3→8.62×. This is the engine's CURRENT tx behaviour (no formula change).

That verdict called the three wants impossible **because it mapped "sharper" to SMALLER τ** (the peakedness reading), under which sharper⇒closer ⇒ R-218 fails. Flip the label:

| Want | Under "sharper = smaller τ" (old reading) | Under "more-kurtosis/sharper = LARGER τ" (relabel) |
|---|---|---|
| (1) transact at what it looks like (R-216/220) | holds (tx = inverse of view) | **holds — same formula, untouched** |
| (2) sharper ⇒ further out (R-218/222) | **FAILS** (sharper=small τ ⇒ closer) | **holds** (sharper=large τ ⇒ further; 8.6× at τ=3) |
| (3) keep today's chart-2 (R-standing) | holds | **holds — no formula touched** |

**All three become consistent under the relabel, with ZERO change to chart-2, settlement, or the tx formula.** The "geometric impossibility" was an artifact of the inverted label, exactly as the operator suspected. The fix that makes him right on all counts is a **pure relabel** (UI/label only): make the knob's "more kurtosis / sharper" direction correspond to LARGER τ, and rewrite UI line L1321 accordingly. It does NOT change chart-2, does NOT change settlement, does NOT change the tx-map, does NOT touch the asymptotes. The view lens already compresses "OTM+ to look OTM-" MORE at larger τ (`/tmp/sk_compress.js`: 2× strike displays at 1.91× at τ=0.05 vs 1.08× at τ=3) — which is exactly the operator's entry-1695 "sharper warp makes OTM+ look OTM-" IF sharper=large τ. So the relabel also reconciles entry 1695.

## 4. WHY I DO NOT PICK THE DIRECTION (the attack on the convenient answer)
The relabel is the answer that unblocks everything — which is precisely the "convenience tell" I flagged in pattern #21 ("this hypothesis would resolve everything" anti-correlates with being right). Two reasons it is NOT automatically correct, both of which make this an operator call:

(a) **It contradicts the operator's OWN earlier signed usage.** Entries 841 and 1656 (verbatim, his words, twice) define **less kurtosis = smaller τ / sharper = less kurtosis**. The relabel ("sharper = MORE kurtosis = larger τ") is the OPPOSITE of how he himself has used the word on prior days. So adopting it means the operator is overruling his own past usage — which he may well intend (entry 224/225 is him noticing the inconsistency), but it is HIS reversal to make, not mine to assume. This is pattern #21 live again: an operator-vs-operator inconsistency hiding under an apparent operator-vs-math conflict. The resolution is an ASK, never an inference.

(b) **Finance does not pin the direction for THIS knob (§2/§3).** Because the tail exponent is frozen at γ, neither τ-end is "more kurtosis" unambiguously — peakedness says small τ, shoulder-fatness says large τ. The brief asserts the shoulder-fatness reading as "the financially correct direction"; that is a CHOICE, not a derived fact. It is defensible, but it is a curve-semantics choice the charter reserves to the operator ("if the financial-correct direction is itself an operator/curve call, name it and stop; do not pick").

## 5. THE FIX, STATED PLAINLY (for the operator to ratify the direction)
**The fix is a relabel, not a curve/settlement change.** Concretely, if the operator rules "more kurtosis / sharper = LARGER τ":
- Touches: the UI knob LABEL and the help text (L1318/L1321 "Smaller τ ⇒ sharper elbow" becomes "Larger τ ⇒ sharper/more-kurtosis", or invert the slider so the number the operator turns UP feeds LARGER τ). Optionally invert the displayed knob value (show 1/τ or `max−τ`) so "turn it up = more kurtosis" while `state.tau` stays raw.
- Does NOT touch: chart-2 shape (h_τ, g_loc, markLensed), the smooth-paste settlement, the frozen power-law wings/asymptotes, the funding anchor, or the tx-map formula. Pool stays plain v24. The tx-map `u_tx=√(a²+2|a|τ)` ALREADY delivers "sharper(=large τ)⇒further" — so under the relabel the HEAD tx behaviour is ALREADY correct and needs no change (this is why earlier verdicts kept finding the formula "backwards": the formula was right for the relabelled reading and wrong only for the labelled one).
- Then the operator's entries 216/218/220/222 directions are all satisfied **with chart-2 and asymptotes INTACT.**

The ONE thing that must reach the operator and be answered IN HIS OWN WORDS before any build: **"Does turning the knob toward MORE kurtosis / sharper mean LARGER τ (wider rounded core, more value held out-of-the-money, trade lands further out) — reversing how you used 'kurtosis' on the earlier days?"** If YES: relabel only, everything else is consistent and already built, the conflict is dissolved. If NO (he keeps sharper=smaller τ): the impossibility from the R-218 verdict stands and he must relax one of the three wants per that verdict's three-way.

## 6. WHAT I DID NOT FIND (honesty on the impossibility's status)
The R-218 verdict's three-way impossibility is **NOT independent of the label** — it was a consequence of the sharper=smaller-τ mapping. Under the relabel it dissolves. I am therefore SOFTENING that verdict's "mutually exclusive, proven" to: *mutually exclusive under the peakedness label; consistent under the tail-fatness relabel.* The operator's root-cause diagnosis (entry 224) is correct: the conflict the team kept hitting was an artifact of an ambiguous "kurtosis" word resolved the wrong way for what he wanted, not a geometric wall. The 4× flip-flop is explained: the team has been oscillating between the two faces of the τ knob with no one naming that "kurtosis" is two-faced here.

## VERDICT
**FLAG-OVERSELL (withdrawn-in-part / corrected):** my own prior R-218/Choice-B verdicts oversold the τ-direction conflict as a label-independent geometric impossibility. It is not; it is label-dependent and dissolves under the relabel "more-kurtosis = larger τ" with no formula change (re-derived `/tmp/sk_payoff.js`). The operator's entry-224 inversion diagnosis is **substantively correct**: the root cause is the ambiguous "kurtosis" word, where the engine/UI/his-own-earlier-usage silently took the peakedness face (small τ = sharper = more kurtosis) while his wants (216/218/220/222) require the tail-fatness face (large τ = sharper-effect = more kurtosis = trade further out).
**Is the mapping inverted: YES (label-vs-want, an ambiguity not a code sign-flip).**
**Does fixing it make all three wants consistent: YES, arithmetically, under one relabel — with chart-2, settlement, and asymptotes intact, and the tx formula already correct.**
**The remaining step is an operator design-intent ruling on which τ-end is "more kurtosis" (§4–§5) — it contradicts his own earlier usage, so it must be confirmed in his words, not inferred. I name the fix and the one question; I do NOT pick the direction.** Do not encode "relabel done / conflict dissolved" as settled until the operator answers §5's question verbatim.

Numbers: `/tmp/sk_kurt.js` `/tmp/sk_chart2.js` `/tmp/sk_elbow_vs_tail.js` `/tmp/sk_payoff.js` `/tmp/sk_compress.js` `/tmp/sk_label.js`. HEAD: lens L1630-1644, UI label L1318-1321, tx-map executeLeg L1801-1804. Operator verbatim: entries 841/1656/1695/216/218/220/222/224/225.
