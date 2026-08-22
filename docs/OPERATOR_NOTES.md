# OPERATOR NOTES — the standing per-turn log (operator entries 617/626)

**Rule: the manager updates ALL THREE sections EVERY operator-facing turn, before invoking the
operator-interface audit.** An ask that never lands here is how "things getting ignored and mised"
happens; the audit BLOCKS a hand-back whose turn-asks are not logged. Append, never delete —
resolved items get their status flipped and stay as record. Verbatim pointers are entry numbers in
`history/operator/`; this file never paraphrases-as-quote (§2.2).

Format per item: `entry-N — <short name> — OPEN | DONE | BLOCKED(why) | AWAITING-OPERATOR`.

---

## (a) Operator asks — current turn + still-open asks
_Seeded 2026-08-22 by operator-interface from entries 540–628._

- e628 — **IMPORT the reference frontend's actual elements/components** (perp-frontend-hyperliquid-staging / protect.temporal.exchange), RFQ mechanics behind them; NOT a reskin — **OPEN. This is the live build task.**
- e626 — "when can i expect to start moving on things" — **OPEN**; mechanism answer drafted (operator-interface audit 2026-08-22), manager to relay.
- e627 — design language condemned (5th rejection of the same visual result) — **OPEN**, subsumed by e628.
- e617 — principled interaction surface + dedicated agent — **DONE** (contract + register + this file + operator-interface agent; first audit run 2026-08-22 — verdict BLOCK, 2 regressions caught before the operator saw them).
- e611/616 — trader surface = protect layout, drift is a regression — **PARTIAL**: IA/backdrop/stamp gated green, but overlay + hover-quote currently RED (see debt).
- e605 — version-control survey + hard archiving — **PARTIAL**: survey (`docs/VERSION_CONTROL_SURVEY_2026-08-15.md`) + `archive/2026-08-15_pre_rfq_era` exist; **79 commits sit unmerged to `main`**, which is the muddle the operator named — not closed until main is current.
- e595 — tester pass before building further — **NOT DONE**: zero tester passes on builds 17–46. Standing UI smoke-pass rule (CLAUDE.md §8) is unmet on every hand-back since.
- e598 — test money / closed-network paper mode — **DONE** (`app/paper.js`, seeded ledgers).
- e585 — persistent UX agent with formalisms — **DONE** (`.claude/agents/ux.md`, `docs/UX_FORMALISM.md`).
- e544 — Railway API token was pasted in chat and is in use — **AWAITING-OPERATOR: rotate the token** (redaction note in transcript; standing recommendation).

## (b) Debt — promised or ruled, not delivered (the manager may not omit these from any hand-back)
- **LP fill accrual not simulated** — `origin:'lp'` exists in the store but NO path creates an LP-accrued bundle; an LP posts a curve and nothing anywhere reflects it (rulings e589/e590; review F8/Q13/Q15). Owed since build 39.
- **Perp-mark candles absent** — e616 layout shows PERP MARK PRICING as candles + current mark; the pane ships a text note instead.
- **Hover-to-quote regressed** at the nuke rebuild and stayed missing through builds 42–46 (e550/551/552) — now gated, currently **RED**.
- **Backdrop buried again** — uncommitted build 46 raised the overlay to 0.8, regressing the e625 fix — now gated, currently **RED**.
- **UX review F5–F15** (`docs/UX_ENDUSER_REVIEW_build39.md`) — post-nuke dispositions never given. Carrying classes: F5 honesty banner, F6 identity switcher over-claim, F8 LP accrual, F9 firm-quote, F10 dormant-WHERE, F11 sim-controls drawer, F12 hover+depth legend, F13 vocabulary, F14 loop walkability (no open-perp control), F15 funding accrual.
- **Q9 firm-quote window** (expiry + countdown + re-accept; module exists in `views_ticket.js`) — ruled, not wired in the rebuilt FE.
- **Skeptic HALT residue** on `sims/RFQ_ENVELOPE_vs_MIXTURE_2026-08-14.md`: FLAG-3 (parity arb unmeasured), FLAG-4 (feature-inventory disposition 1–16 — never delivered), FLAG-5a (no close-as-taken mechanism), FLAG-7, FLAG-8. Standing halt-class items.
- **79 commits unmerged to `main`** (branch `claude/exciting-archimedes-txs2wx`) — §6.2 short-lived-branch policy violated; merge or state why not.
- **Manager MEMORY.md rollup stops at builds 12–26 / entry 575** — entries 576–628 and builds 27–46 never rolled up: the "no systematic notes" defect of e626, in the manager's own store.
- `bounded_disagreement` discharge write-up; natural-map ceiling note; internal self-matching proposal — owed from the 08-15 session close.

## (c) Questions awaiting the operator
_Nothing here may be re-asked in chat; pointer only. Older math/economics questions live in `docs/OPEN_OPERATOR_QUESTIONS.md` (γ>1 lock, close-mechanic, etc.) — dormant while the app line runs._
- Rotate the Railway token (e544) — yes/no is all that's needed.
