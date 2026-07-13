# VERDICT — Round-6 backend-API reference comparison (skeptic, 2026-07-13)

Artifact: `evidence/staging_e2e_2026-07-10/REPORT_round6_backend_API.md`
Evidence: `evidence/staging_e2e_2026-07-10/run6_api/{health,amm_status_final,strike_bounds_long,strike_bounds_short,perp_create,band_open,band_detail}.json`
Re-derivation done independently (python3). Gate requested by manager relay; scrutinized per the manager's documented over-claim pattern this session.

---

## Item 1 — "Trade warps the curve, α,β conserved (delta 0), w moves" = reference core mechanic → **FLAG-OVERSELL**

The structural half is CLEAR: on the balanced pool `amm_status_final.json` gives
`alpha=5.000315046875 = x·w`, `beta=400025.20375 = y·(1−w)` with x=10.00063009375, y=800050.4075, w=0.5 — reproduced exactly. Report line 22 ("Exact.") is backed.

The **conservation table (lines 27–31) is not backed by saved evidence.** The "after" snapshot
(x=9.97835, y=801840.40, w=0.501116) exists in **no file** in `run6_api/` — a full-tree grep finds
those numbers ONLY in the report itself. The only `amm_status` saved is `amm_status_final.json`, which
is the w=0.5 reset state (= the report's "before" row). So the entire warped-state row rests on an
unsaved curl read, while line 6 asserts "evidence in `run6_api/`".

Worse, the headline number is not re-derivable from the numbers actually printed. Offending sentence
(line 31): **"α delta = 0.00e+00, β delta = 0.00e+00."** From the report's own rounded after-row:
`α_after = 9.97835·0.501116 = 5.00031084` (Δα = −4.2e−6), `β_after = 801840.40·0.498884 = 400025.346`
(**Δβ = +0.142, not zero**). The "delta 0.00e+00" is a claim computed on hidden full-precision reads
that were not saved; at the precision shown, β moves by 0.14. I am NOT calling it WRONG — there is real
internal corroboration: the w′ that conserves α (0.50111642) and the w′ that conserves β (0.50111618)
agree to ~2e−7, which is what you'd see if conservation genuinely held at full precision. But
"conserved exactly, delta 0.00e+00, mechanism confirmed exact" (line 34) **oversells what the saved
evidence can show** — it should read as "consistent with α/β conservation on an unsaved read."

Causation: the report is reasonably careful to claim the *mechanism* rather than the specific trade
(and correctly disclaims the 11/21 toy exhibit). But it never notes that before/after are two reads on
a **shared, multi-wallet** pool, so attributing the specific w 0.5→0.501116 move to "opening the band"
(line 26) is not isolated. The mechanism claim survives that (α=x·w conservation is invariant to who
trades); the specific-delta attribution does not, and the confound is unmentioned.

## Item 2 — "Close reverses the warp" → **FLAG-OVERSELL (mild)**

Offending sentence (line 36): **"3. Close reverses the warp."** The return to w=0.5 IS in evidence
(`amm_status_final.json`: w=0.5, x=10.00063, open_bands=0). But this is asserted at header strength from
a **single** before/after on a shared pool, and — as in item 1 — the *warped* intermediate state was
never saved, so "reverses" compares an unsaved warped read to the saved balanced read. open_bands=0 +
w=0.5 is equally consistent with "pool at its balanced rest state / others' activity netted out" as with
"our close reversed our specific warp." A single observation cannot distinguish these. State it as
"pool returned to balanced after close," not "close reverses the warp."

## Item 3 — "Balanced-pool funding = 0" → **CLEAR** (honestly scoped)

`perp_create.json`: `fundingRate:0, fundingAccrued:0`. The report scopes this correctly (line 41:
"Directional — a fresh position; not the full per-strike deviation sweep."). No funding-FORMULA match is
claimed. Note for the record: `fundingRate:0` on a just-created row is arguably an initialization default,
not a computed balanced-pool evaluation — so this is even weaker than "directional," but the manager did
not overclaim it. Passes.

## Item 4 — restraint on constants / declining g inference → **CLEAR** (restraint correct, no under-claim)

Verified the theta bounds ARE ±50% display caps, not seams: `strike_bounds_long.json` call inner
`max_theta=1.5, max_pct_from_spot=50.0`; put inner `min_theta=0.4999875, min_pct_from_spot=−50.00125`.
The [~0.5, 1.5] range maps one-to-one onto ±50%-from-spot — it carries no smooth-paste-seam information,
so g=m·γ is genuinely unreadable from it. The manager's refusal (lines 53–55) is the correct call, and
line 55 explicitly retracts the first-pass "seam 1.5 ⇒ g=2" temptation. No residual sentence sneaks a
g/seam inference. No under-claim: the defaults (sold inner 86400 = 1.08×spot, bought inner 73600 =
0.92×spot) are ±8% defaults, also not seams — there is no real g match being left on the table. Good
restraint.

## Item 5 — vocabulary / option structure → **CLEAR**

`band_detail.json` confirms every claimed field: `sold_wing:"call"`, `bought_wing:"put"`, `sold_k_tx`,
`bought_k_tx`, `sold_pt_asset`, `bought_pt_asset`, `net_band_payout`, `sold_residual_*`/`bought_residual_*`
bounds, `club_equity_at_open` (report writes "club_equity" — trivially loose). No "lean" substring
present (grep-confirmed). Strike-bounds use `theta` (strike/spot) with call wing above spot / put wing
below. Supported.

---

## NET
Items 3, 4, 5 CLEAR. The two headline mechanic claims (1, 2) are **FLAG-OVERSELL**: the central
conservation table's warped-state read was never saved, and "delta = 0.00e+00 / conserved exactly /
close reverses the warp" outruns what the retained evidence (`amm_status_final.json` = balanced state
only) can demonstrate — β moves 0.14 at the printed precision. Internal consistency (two independent w′
derivations agreeing to 2e−7) keeps this short of FLAG-WRONG, but the manager should (a) save the warped
`amm/status` read, and (b) relabel from "confirmed exact" to "consistent with α/β conservation on a
shared pool, warped snapshot not retained." The honest-negative section (item 4) is the strongest part
of the report and correctly scoped — the over-claim lives entirely in the two positive mechanic headers.
