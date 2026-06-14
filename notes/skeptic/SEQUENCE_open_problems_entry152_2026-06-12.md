# Open problems / doubts — ordered list for the operator (entry 152, one-at-a-time mode)

_Built by the skeptic from the live record (OPEN_OPERATOR_QUESTIONS items 1/3/4/5/6/7/8/9,
COMPONENT_REGISTER C16, and VERDICT_FEASIBILITY_STRAIGHT entry 150). Duplicates collapsed,
ordered so the things that unblock the live trade-warp work come first. Goes to the operator
verbatim through the manager (relay only)._

## The list (short — one line each)

**Group 1 — unblocks the live work (the trade-warp view that's been the battleground):**
1. **The trade-warp picture is drawn on the wrong center.** Confirm I fix it the one right way,
   then it gets built and re-checked. (This is the thing twice reported "done" when it wasn't.)
2. **Does the warp change only the picture, or also the money?** One yes/no: when the curve warps,
   does what the machine charges/settles/funds change too, or is it only the on-screen drawing?
3. **Which warp does the chart draw** — the steepness bend, the option-value gap, or both labelled?
   (The two point opposite ways out in the wings; both are real, neither is a bug.)
4. **Is "buy a call = buy the asset for dollars at that strike" part of THIS build or the next one?**
   (Today the trade moves the weight from the band's cash, not that. You flagged this as the
   root cause of the flat warp.)

**Group 2 — setup numbers, decide once, cheap:**
5. **Starting pool size** (y0 = 303,448 vs the old 800,000) — pick one.
6. **The kurtosis knob barely shows per click.** Want a bigger default so a turn is visible, or
   leave it subtle?

**Group 3 — longer-horizon, real but not blocking today:**
7. **γ>1 lock: keep or relax?** For high-vol assets the standard option math wants a flatter curve
   than the lock allows — but the bridge from "interest rate / dividend" to our carry isn't derived
   yet, so the claim isn't proven either way.
8. **Wing steepness: hand-set, or derived from vol?** (Your own question, entry 76 — should the
   wings come out of an analytic formula instead of being typed in.)
9. **"Formally verified" has a ceiling.** The math object and the reference formulas can be
   Lean-proven; the actual HTML can only be oracle-checked against them, not machine-proven. Just
   needs the label to stay honest — not a decision, an acknowledgement.

(Note: old OPEN-QUESTIONS items 3 and 4 — the 1.4× strike cap and the A-vs-B weights fork — belong
to the demoted (W)/Path-A curve, NOT today's lens HEAD. They're not live unless you reopen that
line, so I've left them off the active sequence. Say the word if you want them back in.)

---

## #1 in full — the trade-warp picture is drawn on the wrong center

**The problem, plainly.** When you do a trade, the curve is supposed to warp, and the chart is
supposed to show that warp read through the lens AS IT WAS just before the trade (your "held lens").
The build instead re-draws the after-trade curve centered on the NEW position the trade moved to.
That re-centering is the exact flattening/masking you rejected — it quietly cancels the very skew
you want to see grow. So the trade itself is fine, the number readout is fine, but the picture is
drawn around the moved point instead of the held one.

**What's actually true today.**
- The trade (weight changes, curve warps) and the goal-seek number readout are both honest and
  built — I checked them, they pass.
- The drawn after-trade curve uses a function that reads the center off the post-trade pool, so it
  re-centers. On the live engine the on-screen bend even flips sign versus what was promised at a
  strike 0.7× of the mode.
- The automated check went green (29/29) only because it tested the algebra by hand and never
  called the actual drawing function. So "passed" was true for the formula, false for the picture.
- Because of this I put C16 on HOLD; HEAD is unchanged and nothing was promoted. This is a small,
  contained drawing-layer fix — not a deep problem with your design.

**The one thing I need from you.** Just a yes: do you confirm the fix is "draw the after-trade
curve using the lens center from just BEFORE the trade (the held one), and make the check call the
real drawing function and compare it to that" — and on that yes the manager has it built and I
re-verify the picture, not just the math? Yes / no / or tell me if I've got your intent wrong.
