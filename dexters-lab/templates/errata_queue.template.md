# Errata Queue

Adversarial findings against your OWN published claims, surfaced by the nightly
post-publication monitor (bin/lab_monitor.sh) and routed here by
bin/lab_triage.py. One fenced block per finding.

Schema, per entry:
  claim_id      stable id ERR-<hash>, one per distinct claim challenge
  attack        category: the published claim being challenged
  evidence      where it was found (monitor report + item), plus the evidence
                bullets and citation URLs the monitor verified
  claim_status  weakened | refuted (upheld findings are never queued)
  resolution    a human fills this when the issue is addressed (empty = open)
  status        OPEN | RESOLVED

Lifecycle: a finding lands OPEN with an empty resolution. It stays OPEN until a
human investigates, writes the resolution, and flips status to RESOLVED. The
same finding re-found on a later night is suppressed by monitor_state.json, so
this queue only grows when the monitor finds something genuinely new. To
permanently silence a fixed issue, mark its hash RESOLVED in monitor_state.json.

---

```
claim_id:      ERR-1a2b3c4d5e6f7a8b
attack:        attribution: the central identity is presented as original, but
               an equivalent form was published earlier under a different name.
evidence:      monitor/2026-06-13.md item 2 (REFUTED 88%); equivalent result in
               prior work, see citation; the derivation matches line for line;
               citations: https://example.org/prior-2019; https://example.org/note
claim_status:  refuted
resolution:    Added an attribution paragraph and a citation to the prior work
               in the published note; the contribution is now framed as the
               applied extension, not the identity itself.
status:        RESOLVED
```

```
claim_id:      ERR-9f8e7d6c5b4a3210
attack:        new-evidence: the empirical effect size is challenged by a result
               published after the claim.
evidence:      monitor/2026-06-13.md item 5 (WEAKENED 74%); a later study reports
               a smaller effect in a larger sample; citations:
               https://example.org/replication-2026
claim_status:  weakened
resolution:
status:        OPEN
```
