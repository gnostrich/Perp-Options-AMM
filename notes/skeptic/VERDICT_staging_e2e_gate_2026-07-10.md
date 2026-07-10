# Skeptic verdict — Universal Skeptic Gate (narrow) — staging E2E deliverable 2026-07-10

Artifacts: `evidence/staging_e2e_2026-07-10/REPORT.md` + `notes/FEATURE_DIFF_staging_vs_handover_2026-07-10.md`.
Operator words read verbatim first (`history/operator/2026-07-10_staging-e2e-wallet-test.md`, entries 1–4).

## Attack documented (independent re-derivation, read-only)
- Pulled the live CSP header from `https://app-staging.temporal.exchange/` myself: `connect-src` lists
  `arbitrum-sepolia.publicnode.com`, `arb1.arbitrum.io`, staging-be ws(s), HL mainnet+testnet — and
  `sepolia-rollup.arbitrum.io` is ABSENT while the captured console shows the app fetching exactly that
  host. FLAG-1 CONFIRMED from outside.
- `staging-be.temporal.exchange/health` → HTTP 200 from this host. Filtered both console logs: every
  `staging-be` string (124/128) sits inside CSP-violation text; zero non-hyperliquid `ws.open` events.
  FLAG-2's evidence layer CONFIRMED.
- Key hygiene re-scanned myself: zero 64-hex strings (0x-prefixed or bare) anywhere in the evidence dir;
  only the address appears. CONFIRMED.
- Screenshots inspected (06b blank OPTIONS PRICING panel; 08c BANDS table with FUNDING / INTRINSIC /
  EXTRINSIC / POSITION VALUE / INITIAL INNER+OUTER BOUND / CLOSE headers, skeleton rows, "Page 1 of 0").
  Match the report's descriptions. `earn_text.txt` matches the `--%` / TVL $500 / 5.0x claims.
- Feature-diff reference column cross-checked against the actual CTO changelog at
  `origin/claude/exciting-archimedes-txs2wx` (engine md5 `5ce1a76c` re-hashed by me): "Your version:
  80f050e2 (14 Jun)", 22/43-wrong vs 11/21, balanced-pool funding bug, 41 checks, shared-pool warning —
  all present. Anchors match the entry-3 Drive contents exactly.
- Zero affirmative "lean" usage anywhere (hits are detector regexes in the tester's own scripts).

## Verdicts

**(a) Completeness vs entry-1 DELIVERABLE — CLEAR.** All briefed flows have a verdict row + on-disk
screenshot; per-flow console/network errors are in `e2e_summary.json` (committed) with the two blocking
errors surfaced as FLAG-1/2; divergence list present; wallet ADDRESS only; explicit closing line present
("Wallet login WORKED … connect-only, not funded"). Close-a-position and every reference-number
cross-check are labelled UNOBSERVED at every occurrence I found (row-8 note "No open positions → 0 close
buttons (expected)"; divergence bullet "Could NOT cross-check … not a claim of math divergence"; F1/F2/
F4/F6 cells UNOBSERVED). No sentence quietly implies they were tested. Residual observation, not a flag:
row 8's verdict cell reads "PASS" while the flow label includes "close"; the disclosure is co-located in
the same row, so no reader is misled, but a PASS/UNOBSERVED split per sub-item would be strictly cleaner.

**(b) Overclaim scan — FLAG-OVERSELL (LOW/MED; three sentences, all in the manager-authored layer;
the tester's verbatim text is clean).**
1. Feature-diff §4: "the two HIGH FLAGs blank out all AMM numbers (CSP-blocked RPC → AMM-tree timeout →
   options/bands/LP values never render)" — the arrow `CSP-blocked RPC → AMM-tree timeout` asserts as
   fact the FLAG-1→FLAG-2 causal link that the manager's own REPORT addendum explicitly demoted:
   "recorded as hypothesis, not fact." The two artifacts contradict each other and the diff note is the
   one carrying the conclusion to the operator. Steelman for the causal claim: CSP kills every chain
   read and the AMM-tree subscription may await one — plausible, but from outside nothing distinguishes
   this from a ws client that is simply never wired/enabled in this build; the addendum already
   concedes exactly that.
2. Feature-diff §4: "That is at least H2-era" — unsupported by the note's own matrix. No cell exhibits a
   surface feature present-in-H2-but-absent-in-H1 that staging displays; F9 itself says staging "has its
   own UI (not a mirror)", and F8 concedes the vocabulary evidence is "limited surface: values never
   rendered". A FUNDING column plus INTRINSIC/EXTRINSIC vocabulary in the CTO's independent Next.js UI
   dates nothing. (The adjacent "nothing observed contradicts H3" is vacuously true but honestly
   bracketed by "UNDETERMINED" and "No math divergence claim is made in either direction" — that
   sentence passes.)
3. REPORT divergences bullet: "**Consistent with reference:** … perp mechanics self-consistent" — the
   fourth item is mislabelled: internal arithmetic self-consistency of the Hyperliquid perp form is not
   consistency WITH the reference build (the reference has no perp-creation mechanics). The first three
   items in that bullet are genuine surface matches.
All three are wording-level; a one-line edit each cures. Per §2.1 this flag halts the operator relay of
the flagged sentences until cured or operator-overruled.

**(c) DON'T-FALSE-FLAG compliance — CLEAR.** FLAG-1/2/3 all fall under the brief's step-5 "note anything
broken" mandate (app config, dead subscription, disclaimer persistence); none targets funding-TBD,
charge-back, or staging-lag; no "lean". F7's shared-pool intersection is routed as OBSERVATION
(operator-tier), which mirrors the CTO changelog's own "Don't run the shared pool without it" warning —
compliant, and a catch worth relaying.

**(d) Label/provenance hygiene (§2.4) — CLEAR, with one standing demand.** Tester-verbatim block and
manager addendum are cleanly delimited and the addendum's six checks are real re-derivations (I
re-derived the load-bearing ones independently; all held). No impersonation, no paraphrase-as-quote
found. Demand (summon, not flag): the provenance header claims "QUOTED VERBATIM" but carries no tester
run-id/transcript pointer (§2.4(a) asks for one), so verbatim-ness is not checkable from the repo alone —
the evidence corpus (harness scripts, timestamped logs, the TLS-1.2/NSS reproducibility detail) makes
reconstruction implausible, hence no FLAG-PROCESS, but the manager must append the run id/pointer or a
one-line byte-verbatim attestation before relay. Unmet at relay time, this converts to FLAG-PROCESS.

**(e) Entry-2 satisfaction — CLEAR.** The note delivers what entry 2 asked: the three handed stages are
identified and match the operator's entry-3 Drive screenshot exactly; the matrix uses real
discriminators whose reference values I verified against the changelog itself; the staging column is
filled only from run evidence with UNOBSERVED where blocked; and the "UNDETERMINED from outside this
run" conclusion is the truthful state, converted into a decidable three-step path (CSP fix → values
render; fund wallet → F2/F4 executable; `lens_selfcheck.js` 41 checks against the Go engine — the
frontend-independent acceptance test). Not a dodge — subject to the two §4 sentence fixes under (b).

**Net: one FLAG-OVERSELL (b, three quoted sentences, all curable by one-line edits) + one standing
demand under (d). Everything else CLEAR. The evidence layer itself is solid — the strongest artifacts
in this deliverable are the tester's logs and the addendum's re-derivations, both of which survived
independent attack.**
