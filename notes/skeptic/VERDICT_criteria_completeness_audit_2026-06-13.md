# SKEPTIC VERDICT — "does it meet all my criteria / things I kept asking for?" (operator, 2026-06-13 11:18:47 UTC)

Audited against `docs/feature_inventory.md`, `docs/COMPONENT_REGISTER.md`, and the verbatim
transcript `history/operator/2026-06-10_kurtosis-curve-family-brief.md` (entries 1–231). HEAD =
`8f897edc` constant-m lens. Gates re-run by me this session: `lens_selfcheck` 13/13, `a16_atm_gate`
5/5. Funding/carry/rebase probed in the live HEAD engine.

## NET VERDICT: MOSTLY PASS, with TWO FLAGS the operator must hear before he treats his picture as complete.

The manager's ledger is HONEST on what it lists and I independently confirm the headline MET items.
But the ledger is INCOMPLETE on the "everything else stays the same" contracts — it silently omits
that ONE of them (funding) has CHANGED behavior under the knob, and it omits that FOUR inherited
contracts are still labelled needs-verify (never live-confirmed on this HEAD). Those are the holes.

---

## WHAT I CONFIRMED (the operator's picture holds here)

- **Constant slope multiplier (entries 226/229/231).** CM1 g_loc=m·γ constant at every strike;
  CM7 g_loc↑ AND θ_tx↑ co-move with m, polarity-locked. Re-run green. This is EXACTLY entry 226's
  ask ("steeper when I set for higher vol, WITH otm→otm+"). The multi-day τ-direction war
  (212–231) is genuinely dissolved by redefinition, not papered over.
- **"Transact at what looks like the true strike" (216/220).** θ_tx=mode·(chosen/mode)^m: choose
  the displayed OTM- point, execute further out at θ_tx (OTM+), settle at the chosen strike.
  CM5 verified (≤1e-9), m=1⇒θ_tx=chosen. Matches 220 verbatim.
- **Chart-1 unaffected / chart-2 affected (entry 153 #3).** Pool fns tradeUpdate/arbitrageToOracle/
  rebase byte-identical to v24 (CM8, P, P-num maxAbsDelta=0); arb is lens-free (L4). The lens only
  touches what's READ/WRITTEN through gLoc/markLensed. Confirmed.
- **At-strike mechanic (127/153#4/184–199), ITM direct payout (198), no-jump ATM IMPL (207).**
  a16_atm_gate 5/5 incl. one-sided-limit discriminator + negative control. Confirmed BUILT.
- **Asymptotes preserved / no floor (A5, entries 55/60), monotonicity/no-arb (A6, entry 55#3),
  smooth-paste (C7).** CM2/CM3/CM4 green. Confirmed.
- **Pricing law value∝S^(−γ) (C6).** Under m=1 the curve is plain v24 (CM1 m=1⇒g_loc=γ everywhere).
  Confirmed for the base; see FLAG-2 caveat for m≠1.

---

## FLAG-OMISSION #1 — FUNDING is in the "everything else stays the same" list and it DID change; the ledger does not say so.

CLAUDE.md §0 and feature_inventory item 9 list **funding** among the contracts the knob must leave
**unchanged** ("carry/rebase, value∝S^(−γ), ITM smooth-pasting, **funding**, the dollar pipe are
unchanged"). The manager's ledger to the operator lists funding NOWHERE — not as MET, not as
PARTIAL, not as changed. That silence is the omission.

I probed the live HEAD `fundingPerStrike`: it now uses `gamma = ±g_loc = ±m·γ` (engine L2274),
so **turning the kurtosis knob m changes the funding rate**: at a fixed off-anchor point I measured
funding −6.67e-3 (m=1) → −7.23e-3 (m=2) → −7.55e-3 (m=4). In plain v24 the funding exponent was the
fixed ±γ; here it scales with the knob. The register C9 itself flags this: **"LOCKED CONTRACT
ALTERED … operator acceptance entry 93 was LOOSE ('idc, same geometric thing whatever it implies')
— NOT a crisp ratification … flagged for explicit re-confirm."**

So the true status is: funding is NOT "unchanged" — it now rides the multiplier — and the only
operator sign-off on record is a shrug ("idc") given under the DEAD √-lens design, before the
constant-m redefinition existed. **The operator has never been told, in plain English, that his
kurtosis knob also re-scales funding, nor ratified it for the constant-m curve.** That is precisely
the "agreed on one thing, another silently changed" failure mode he escalated in entries 137/138.
Steelman for leaving it: funding using the live local exponent is arguably the *natural* geometric
choice and m=1 reproduces v24 exactly. But "natural" is not "unchanged," and the motive says
unchanged. This needs an explicit yes/no from the operator, not a carried "idc."

## FLAG-OMISSION #2 — FOUR "everything else" contracts are still needs-verify; the ledger presents the picture as settled without surfacing that.

Register rows C4 (carry P=Ny/Nx), C5 (rebase, incl. **warp∘rebase-commute lemma OPEN
[needs-Aristotle]**), C8 (uniform strike registration), C11 (dollar/settlement pipe) are all
**BUILT(inherited) / needs-verify** — i.e. inherited from v24 and NOT live-confirmed on this lens
HEAD this session. The "Queued confirmation pass" at the bottom of the register explicitly says
tester+skeptic still owe a live confirmation of C4/C5/C8/C9/C11. The manager's ledger does not
mention any of these, so the operator hears "MET + verified" headlines with no signal that a third
of the "stays-the-same" contracts sit on inheritance + a manager assertion, not a green check on
HEAD. This is not a claim that they're broken — it's that calling the picture complete without
naming the needs-verify rows overstates confidence. The rebase-commute lemma in particular is an
OPEN math obligation (needs-Aristotle), not a closed one.

## Items correctly labelled OPEN/PARTIAL (no flag — these are honest)

- A15 slippage haircut (entries 205/206): correctly NOT BUILT / QUEUED. The compounded form
  (entry 212 #10, (1+s1)(1+s2)−1) is captured. Honest.
- Solvency floor C13/B1 (item 13): correctly OPEN — geometry does not close solvency. Honest.
- Monolith theory↔impl: correctly labelled trusted-from-prover NOT verified, with the L3
  extraction-faithfulness gap stated. Honest (and consistent with my monolith-fold verdict this
  session). The one residual: the A16-ATM "corollary" over-attribution I already flagged
  (FLAG-OVERSELL, monolith verdict) — confine Lean credit to the S* seam, not the ATM crossing.

## Nothing the operator explicitly RULED is missing from the build

I walked entries 1–231. Every operator RULING that defines the current object — constant multiplier
(229/231), transact-where-it-looks (216/220), steeper+further same direction (226), pool unchanged
(93#2/153#3), settle at lensed/chosen (96), individual options not spreads (199), ITM direct payout
(198) — is in HEAD and gate-witnessed. The gaps are the two omissions above (funding ratification,
needs-verify inherited contracts) plus the already-queued A15/solvency/monolith-L3 — all of which
are TBD'd, not silently dropped, EXCEPT the funding behavior change which IS silently dropped.

## Bottom line for the operator (plain English)

Your core picture holds: the knob is now one constant steepness multiplier, steeper-for-higher-vol
with trades landing further out, the pool curve untouched, settle where you chose — all built and
machine-checked. TWO things you'd want to know that the ledger didn't tell you: (1) your kurtosis
knob also changes the **funding rate** — that's a change to something you'd listed as "stays the
same," and you've never actually said yes to it for this curve; (2) four of the "stays-the-same"
plumbing pieces (carry, rebase, strike registration, dollar pipe) are inherited from v24 and not
yet freshly tested on this exact build — probably fine, not yet checked. Neither is a bug found;
both are gaps in the assurance you were given.
