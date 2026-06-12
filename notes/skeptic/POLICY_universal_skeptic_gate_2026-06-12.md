# POLICY — Universal Skeptic Gate (operator-directed, entry 139, 2026-06-12)

_Authored by the skeptic at the operator's direct request. Binding on the manager and every agent.
Link from `CLAUDE.md` (§2.1) and the manager charter. The skeptic owns this file; amendments are
operator-directed or skeptic-authored corrigenda, never silent edits by another agent._

## 0. The operator's request (entry 139, VERBATIM — the thing this policy must deliver)
> "also skeptic can you make a policy that no agent's work goes unchecked by you, and no reply comes
> to me without being filtered by you  as per my requirements? and aside from this now lets complete
> whats pending and ship quick"

Two binding requirements, plus a constraint:
- **R-A: No agent's work goes unchecked by the skeptic.**
- **R-B: No reply reaches the operator without the skeptic's filter.**
- **Constraint: "ship quick."** The gate must be FAST or it defeats the same operator's own goal.

This policy ratifies and makes binding the in-line-gate request the skeptic filed in verdict #13
("bind my register-audit as an IN-LINE gate on every HEAD change + every 'X is done' relay, not a
dispatched task") and the register/regression machinery of verdicts #45/#47. It is the structural
fix for blind-spot pattern #18 (agreements evaporate; regressions pass silently) and the bypass-
by-latency the skeptic owned in verdict #13/#46 (post-hoc audit lets regressions reach the operator
first).

## 1. What this changes vs the prior posture
BEFORE: the skeptic was dispatched per-artifact and audited the transcript AFTER the fact. The
operator's lived complaint (entries 137/138) is that this latency is exactly how regressions and
"agreed-then-violated" reach him — the skeptic was a post-hoc reviewer, not a chokepoint.

AFTER: the skeptic is a STANDING IN-LINE GATE at named chokepoints. The manager cannot pass those
chokepoints without a skeptic token (CLEAR or an overridden FLAG). This is a halt-class gate of the
same class as the file-safety gate (CLAUDE.md §3) and the standing-FLAG halt (CLAUDE.md §2.1).

## 2. R-A — No agent's work goes unchecked (the WORK gate)

### 2.1 MANDATORY chokepoints (manager may NOT route around; no token ⇒ no pass)
A skeptic check is REQUIRED, in-line, before each of these actions completes:
1. **Any HEAD/engine HTML change before merge or HEAD-promotion.** (Already halt-class via §2.1;
   restated here as a chokepoint, not a courtesy.)
2. **Any spec before intern dispatch (the R6 scope-gate).** No intern builds from an unscoped spec.
   The skeptic returns **R6-CLEAR** or **R6-HOLD**.
3. **Any component-register STATE flip** (`docs/COMPONENT_REGISTER.md`) — especially any flip TO
   `BUILT`/`VERIFIED`, and ANY flip away from `AGREED`/`VERIFIED` (the regression direction).
   The register-vs-transcript audit is the skeptic's, per verdict #47.
4. **Any merge to `main` of an engine-touching branch.** (Subsumes #1 for the merge action.)
5. **Any new or altered operator-tier claim entering shared truth** (CLAUDE.md, feature_inventory,
   the register) — a label change, a "proved/verified" upgrade, a locked-contract disposition.

### 2.2 EXEMPT (so the gate is workable, not infinite)
The following do NOT require a per-instance skeptic token — they are covered by the existing gates
or are non-claim-bearing:
- Pure git/PR mechanics (branch create/delete, push, squash) — platform structure, no claim.
- Intern edits WHILE building an already-R6-CLEAR spec (the spec was gated; the build is verified
  at the §2.1 HEAD chokepoint, not keystroke-by-keystroke).
- Tester behavioral runs and the DIFF_LEDGER per-build deltas (tester's lane; the skeptic audits
  the STATE flip at §2.1.3, not each measurement).
- research-lead derivations that are NOT yet a spec and NOT yet a shared-truth claim (scratch work;
  gated when it becomes a spec at §2.1.2 or a claim at §2.1.5).
- Each agent's own MEMORY.md (private role state).

The exemption principle: **the skeptic gates the CLAIM and the STATE-CHANGE, not every keystroke.**
A keystroke-level gate is the un-shippable form the operator's "ship quick" forbids; the
chokepoint-level gate meets R-A because nothing reaches shared truth, the engine, or the operator
without passing a skeptic token.

### 2.3 Mechanism (fast)
- The skeptic token is one of: **CLEAR**, **R6-CLEAR**, or a **FLAG** (OMISSION/OVERSELL/WRONG/
  PROCESS). A FLAG is a halt until the manager produces satisfying evidence OR the operator
  overrules (CLAUDE.md §2.1).
- The manager records the token at the chokepoint (commit message / register row / spec verdict
  file). A chokepoint passed with NO recorded skeptic token is itself a **FLAG-PROCESS against the
  manager**, retroactively.

## 3. R-B — No reply reaches the operator unfiltered (the REPLY gate)

### 3.1 Replies that REQUIRE a pre-send skeptic pass
Any operator-facing reply that is **claim-bearing** — specifically one that asserts:
- a thing is **done / built / fixed / shipped / verified / proved**, or
- a **technical result** (a number, a derivation outcome, a "this curve does X"), or
- a **promotion / HEAD-change / ship** announcement, or
- a **disposition of a prior operator agreement** ("we kept X", "X is unchanged").

…must be submitted by the manager to the skeptic as a DRAFT before it is sent. The skeptic returns
**CLEAR** (send as-is) or **FLAG** (the flagged claim is wrong/oversold/omits/misrepresents — and
per CLAUDE.md §2.1 the FLAG goes to the operator UNRECONCILED alongside the manager's position; the
manager may not soften or shelve it).

### 3.2 Replies EXEMPT from pre-send (trivial acks — speed)
- Bare acknowledgements with NO claim ("on it", "got it", "starting now").
- Pure questions back to the operator that assert nothing.
- Relaying the operator's own words back for confirmation, verbatim.
These pass without a token. If an "ack" smuggles a claim ("on it — that's already working"), it is
NOT an ack; it is a §3.1 claim-bearing reply and must be gated.

### 3.3 Keeping it FAST (the "ship quick" reconciliation)
A full skeptic re-derivation on every word is not sustainable (see §4). The reply gate runs in two
tiers so it does not become a bottleneck:
- **Tier 1 — pre-send CHECKLIST the skeptic owns, applied by the manager to every §3.1 draft**
  (the manager self-applies; the skeptic spot-audits). The checklist (5 items, each a yes/no):
  1. Does every "done/verified/proved" word have a NAMED gate or transcript entry behind it (not
     narration)? If no → do not send; convert to the honest state word.
  2. Is every number reproduced by a gate/script, not recalled from memory?
  3. Does the reply contradict any `AGREED`/`VERIFIED` register row? If yes → STOP, that is a
     regression, FLAG it.
  4. Is it the response TYPE the operator allows (entry-44 gate: no PR/version mechanics, scoped
     answer, caveat = one plain-English feature sentence)?
  5. Is every coined term replaced by its plain-English meaning (vocabulary discipline)?
  A draft that passes all 5 may send under Tier 1 WITHOUT waiting for a synchronous skeptic reply —
  the skeptic audits the transcript after and FLAGs any miss as a PROCESS failure against the
  manager (the checklist is the manager's standing obligation; misuse is on the manager).
- **Tier 2 — synchronous skeptic pass (BLOCKING) is REQUIRED, not optional, for the high-blast-
  radius subset:** any reply announcing a HEAD-promotion / ship / "the build is done", any reply
  carrying a NEW technical claim the skeptic has not already cleared, and any reply disposing of an
  operator agreement. For these the manager waits for the skeptic's CLEAR/FLAG before sending.

This split is the honest maximum: trivial acks free; routine claim-replies fast under a skeptic-
owned checklist with after-the-fact FLAG teeth; only the genuinely load-bearing replies block on a
live skeptic pass. It meets R-B (nothing claim-bearing is unfiltered — either by live pass or by a
skeptic-owned checklist + binding audit) while preserving "ship quick."

## 4. Bandwidth honesty (the residual the operator must see, not silently narrowed)
**"Literally every reply and every work-item, synchronously, is NOT physically sustainable"** —
stated plainly so it is not silently dropped. A single skeptic instance re-deriving every word and
every keystroke would re-insert exactly the latency bottleneck the operator removed when he killed
hub-and-spoke for direct lines (§2.3). The strongest WORKABLE form that still meets the operator's
requirement is the two-part structure above:
- **R-A is met in full** at the chokepoint level (no engine change, no shared-truth claim, no
  register flip, no intern dispatch passes without a skeptic token) — keystrokes inside an already-
  gated build are covered by the build's own HEAD gate, not re-gated individually.
- **R-B is met in full** for claim-bearing replies (Tier 2 blocking for high-blast-radius; Tier 1
  skeptic-owned checklist + binding after-the-fact FLAG for routine claims); trivial acks are
  exempt.

**Residual flagged to the operator (do not treat as resolved):**
1. **The skeptic is a single serial reviewer.** If many chokepoints/replies arrive at once, Tier 2
   blocking passes serialize and CAN slow shipping. If the operator wants zero residual latency on
   EVERY reply, that requires either (a) accepting the Tier-1 checklist-with-audit form for routine
   claims (what this policy proposes), or (b) a second reviewer / more skeptic bandwidth (headcount
   — operator-tier). The operator should pick; this policy picks (a) as the default.
2. **Tier-1 self-application by the manager is a trust point.** The teeth are the skeptic's
   after-the-fact transcript audit + FLAG-PROCESS; that is post-hoc for the Tier-1 subset, so a
   bad Tier-1 reply CAN reach the operator before the skeptic catches it. The mitigation is the
   narrow Tier-1 scope (routine, already-cleared claims only) and the binding audit. If the
   operator wants Tier-1 also blocking, say so and it becomes blocking (at a speed cost).
3. **Pre-policy and cross-session gaps.** When the skeptic is not running (between dispatches),
   the manager must QUEUE §2.1/§3.1 items, not pass them — a chokepoint reached with the skeptic
   offline waits or is flagged on the skeptic's next pass, never silently passed.

## 5. Teeth (how this binds the manager)
- A chokepoint passed without a skeptic token, or a §3.1 reply sent without CLEAR or a passing
  Tier-1 checklist, is a **FLAG-PROCESS against the manager** — halt-class, escalates to the
  operator unreconciled (CLAUDE.md §2.1).
- A skeptic FLAG at any chokepoint is a halt the manager cannot merge/promote/send over; resolution
  is manager-evidence-that-satisfies or operator-override (CLAUDE.md §2.1).
- This policy does NOT give the skeptic git/dispatch/operator-prompt mechanics (those stay the
  manager's per CLAUDE.md §2.1 / §7) — it binds through the manager's obligations above.

## 6. To be linked from
- `CLAUDE.md` §2.1 (authority order — add: "the universal-gate chokepoints are defined in
  `notes/skeptic/POLICY_universal_skeptic_gate_2026-06-12.md`").
- The manager charter / manager MEMORY.md (the manager's standing pre-merge and pre-send
  obligations).
- `docs/COMPONENT_REGISTER.md` (the STATE-flip chokepoint, §2.1.3).
Linking is the manager's mechanical action; the skeptic flags its absence.
