# SKEPTIC VERDICT — CTO upgrade instruction sheet, narrow gate before operator→CTO relay
skeptic, 2026-07-15. Target: `evidence/staging_e2e_2026-07-10/CTO_UPGRADE_INSTRUCTIONS_to_5ce1a76c.md` (manager).
Gated against: authoritative changelog `reference_docs/CHANGELOG_for_CTO.html` (+ `.md` twin
`CTO_CHANGELOG_80f050e2_to_current_2026-07-03.md`); already-gated campaign
`CAMPAIGN_diff_and_changes.md` + `VERDICT_staging_campaign_2026-07-10.md`.

Live evidence re-checked this session:
- `run6_api/marks_grid.json`: `"engine":"v28-lens","gamma":1,"m":1,"g_loc":1`, marks span θ∈[0.5,1.5]. → γ=1 config CONFIRMED live.
- `kit_harness_golden/my_lens_selfcheck_41pass.txt` = `41 PASS, 0 FAIL`; `my_a16_5pass.txt` = `5 PASS, 0 FAIL`; `REPORT_round7` confirms these ran against the **md5-verified** `5ce1a76c` reference build. → "41/41 + 5/5" backed.
- `REPORT_round8_marks_endpoint.md` L31-32 corroborates "`?gamma=2` query ignored — γ is server config."

---

## Check 1 — Are the 5 PORT items faithful to the changelog? → **CLEAR**
Every PORT item + golden number matches `CHANGELOG_for_CTO.html` exactly; nothing invented, altered, or dropped.
- **Item 1 (ITM):** sheet "exercise line **$66.67**, value **⅓**, ATM **0.148**; m=3: **$85.71**, **⅐**, **0.057** … Hard rule: price never below intrinsic" == changelog "the exercise line sits at **$66.67**, value there = **1/3**; value at-the-money = **0.148**. With … m=3: exercise line **$85.71**, value **1/7**, at-the-money **0.057** … an option is never priced below what you'd get by exercising it." Re-derived: S*=K·g/(g+1)=100·2/3=66.67, 1/(g+1)=⅓, ATM=4/27=0.148; m=3⇒g=6⇒85.71/⅐/0.057. ✓
- **Item 2 (trade-point warp):** sheet "pool (10,10,w=½), ray 4, cash-in 1 → **w′ = 11/21** (old wrong = 22/43)" == changelog "trade at ray 4, cash in = 1 → new weight = **11/21** (your old code would give 22/43 — wrong)." ✓ Uses **11/21 not 22/43** as required; "Ordinary spot trades unchanged" matches. (The `.md` twin also lists "NOT 6/11"; the sheet follows the HTML's single 22/43 — faithful, not a drop.)
- **Item 3 (m-knob):** "m=1 normal, bigger = steeper everywhere, trades land further out; set once from vol … g=m·γ" == changelog verbatim intent. ✓
- **Item 4 (one-rule close):** "every leg sells back to the pool at today's price … no two-case; payout smooth across strike, no ½-jump … paid the option value computed **before** the pool trade" == changelog "every leg … sells back through the pool … moves **smoothly** across the strike — no jump … what the trader is **paid** = the option's value, calculated **before** the pool trade." ✓
- **Item 5 (funding dev):** "`dev = |c·ln(K/mode)|`, `c=(g_anchor−g)/(g_anchor+1)`, g=m·γ, g_anchor=m … label **'Funding (ray dev; TBD)'** … zero balanced, zero ATM, zero ITM … DEVIATION input only, not rate/transfer" == changelog `dev = |c·ln(strike/mode)|`, same c, same gating, same `Funding (ray dev; TBD)` label, "INPUT only — not the funding rate, and not the cash transfer." ✓ (K==strike, mode==mode.)

## Check 2 — Is the "Staging status" column honest (all 5 UNVERIFIED at γ=1, no overclaim)? → **CLEAR** (one soft note)
Every row correctly labels its item UNVERIFIED and does **not** claim staging passes it:
- 1: "the ITM-seam region ($66.67 etc.) is **γ=2 + outside our window → UNVERIFIED**." ✓
- 2: "the off-spot warp (11/21) is **UNRESOLVED** — **a real risk it's still spot-booked**." ✓ carries the required unresolved/maybe-spot-booked risk; matches campaign B4 + prior verdict.
- 3: "present but **inert at m=1/γ=1 → UNVERIFIED** that it steepens." ✓
- 4: "round-trip returned **Δ=0 exactly** — but on a shared pool at γ=1, **inconclusive**: it does **NOT distinguish** the new clean close from the old exact-restore." ✓ carries the required "Δ=0 inconclusive, doesn't distinguish clean-close from old exact-restore" point.
- 5: "at m=1, `c=(1−1)/2 = 0` → deviation **identically 0**; balanced-pool-zero is trivially true → formula **UNVERIFIED**." ✓
- **Soft note (non-blocking):** item-4 wording "Δ=0 **exactly**" repeats the word the prior campaign verdict flagged (residuals are display-rounded, not full-precision). Because the same clause immediately calls it "inconclusive" and non-distinguishing, the substantive claim is honest; but "Δ=0 exactly" → "Δ=0 at display precision" would be airtight. Not a blocker.
- Item-2 column does **not** restate the "5 bands" miscount — it says "every band" without a count, so the corrected "4 not 5" is not contradicted. ✓

## Check 3 — STEP 0 (set γ=2): γ=1 confirmed live? "γ∈(1,4) required" correct? → **CLEAR**
- γ=1 is **confirmed live**: `marks_grid.json` reports `"gamma":1,"m":1,"g_loc":1`. ✓
- "the spec requires **γ ∈ (1,4)**" is correct per CLAUDE.md §4 ("convexity knob γ∈(1,4)", "γ>1"). γ=1 is the degenerate boundary; at m=1/γ=1 the knob is inert and funding `(1−1)/2=0`. ✓
- "(Confirmed live: the `?gamma=` query is ignored — γ is server config.)" corroborated in `REPORT_round8` L31-32. ✓

## Check 4 — STEP 6 (41+5 harness) + "only diffed outputs not code" admission honest? → **CLEAR**
- **41+5 numbers correct** and match the authoritative HTML changelog ("**41 checks**", run `lens_selfcheck.js`; + a16 **5**). We **did** reproduce **41/41 + 5/5** against the md5-verified `5ce1a76c` reference (`kit_harness_golden/*` + `REPORT_round7`). The sheet frames this correctly as the CTO's **pass bar to run against the Go engine**, not as a staging pass. ✓
- **Admission honest:** "We could only diff staging's API **outputs**, never your Go source; this harness is how you cover the code paths." Exactly matches campaign B5. ✓
- **Observation (non-blocking, internal-doc discrepancy):** the `.md` changelog twin (03-Jul) says "13 → **24** hard checks"; the HTML changelog (08-Jul, the one tied to `5ce1a76c`) says **41**. The sheet correctly uses the later `5ce1a76c`-current **41**. No action needed, but flagged so the team knows the two reference changelogs disagree on the count.

## Check 5 — update-2 SAFETY warning faithful to the changelog's red box? → **CLEAR**
Sheet: "does **not** perfectly restore the pool: a tiny **~trade-size²** shortfall … **non-extractable** — the trader is only ever paid the option value, never the pool's reserves; **verified in code** … Harmless single-user; in a shared pool the LPs bear the drift. **Do NOT run the shared/multi-party pool without update-2** (the charge-back … designed in `FIX_close_b_receipt_charge_PARKED`, not built) … Also not in this version: funding cash actually moving, and read-smoothing." Every load-bearing element — non-extractable, ~size², LPs bear drift, hold shared pool until update-2, parked-not-built, funding-transfer + read-smoothing deferred — matches the changelog red box + "Not in this version yet" list. ✓ (Only the changelog's "recovers like IL" recovery aside is omitted — a harmless under-statement, not a misstatement.)

## Check 6 — Does the sheet anywhere imply staging IS ALREADY H3, or otherwise over/under-claim? → **CLEAR** (one soft note)
- The sheet does **not** claim staging is already H3/`5ce1a76c`. The title is "**upgrade** staging to the July-8 engine"; item-2 status explicitly flags the **H2-vs-H3 discriminator** (the 11/21 off-spot warp) as **UNRESOLVED / "a real risk it's still spot-booked"** — i.e. it openly preserves that we could not distinguish H2 from H3. ✓ Consistent with campaign B4.
- **Soft note (non-blocking):** the closer "**Staging is already the right engine (v28-lens)** and prices correctly at γ=1" is true only at the **line** level (v28-lens vs v24, established by A1) and is parenthetically scoped to "v28-lens", not `5ce1a76c`. Read in isolation a CTO could hear "already up to date"; the immediately following "items 1–5 are what separate the 8-Jul build from your 14-Jun one" + the item-2 unresolved-discriminator caveat prevent the misread. Tightening to "already on the **v28-lens line**" would remove all ambiguity. Not a blocker.
- No other over/under-claim: option-pricing "matches … **exactly** in the ±50% window" is correctly scoped to γ=1 / θ∈[0.5,1.5] (A2), and the ITM fix is separately marked UNVERIFIED.

---

## BOTTOM LINE
- **Check 1 (PORT fidelity)** — CLEAR. 5/5 items + all golden numbers faithful to `CHANGELOG_for_CTO.html`; none invented, altered, or dropped; 11/21 not 22/43 correct.
- **Check 2 (staging-status honesty)** — CLEAR. All 5 correctly UNVERIFIED at γ=1; item-2 carries the spot-booked risk, item-4 the inconclusive-doesn't-distinguish point. Soft: "Δ=0 exactly" → "at display precision".
- **Check 3 (STEP 0 γ=2)** — CLEAR. γ=1 confirmed live (marks_grid.json); γ∈(1,4) correct; ?gamma ignored corroborated.
- **Check 4 (41+5 + outputs-not-code)** — CLEAR. 41/41+5/5 reproduced against md5-verified 5ce1a76c; admission honest. Note: the two reference changelogs disagree (24 vs 41); sheet correctly took the current 41.
- **Check 5 (update-2 safety)** — CLEAR. Faithful on non-extractable, ~size², hold-shared-pool-until-update-2.
- **Check 6 (implies-already-H3 / over-under-claim)** — CLEAR. No false H3 claim; discriminator openly unresolved. Soft: "already the right engine (v28-lens)" is loose but bounded.

**Gate result: CLEAR TO RELAY as written.** The CTO sheet correctly incorporated the campaign corrections the prior verdict required (round-trip downgraded to inconclusive/does-not-distinguish; no "5 bands" miscount restated; blockers not blanket-attributed to γ=1 — γ=2 is scoped to unblocking items 1/3/5, with the code-path gap owned by STEP 6). Two optional wording tightenings noted (item-4 "exactly"; closer "already the right engine"); neither is halt-class.
