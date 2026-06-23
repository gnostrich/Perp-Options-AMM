# Referee Report: The Drip Pool (SYNTHETIC EXAMPLE)

> Fabricated for the Dexter's Lab review-pipeline example. The "paper" is
> `paper.md` in this directory. Not a real review of any real submission.

## 1. Summary

The note defines a two-token constant-product pool, derives the standard swap
payout, introduces a "pressure" signal p = a/b for faucet payouts, claims a
closed-form pressure update law after a swap, asserts round-trip neutrality
under zero fees, and states that all identities are machine-checked.

## 2. What the paper delivers

A correct derivation of the swap payout (D2), a proof sketch plus one worked
numerical example for the pressure law (D3), and prose assertions for
round-trip neutrality (D4) and machine-checking (D5). No simulations, no
data, no cost analysis, no verification artifact.

## 3. Soundness

| Claim | Internal verdict | Panel verdict | Final |
|---|---|---|---|
| D1 pressure definition | holds | (panel skipped) | holds |
| D2 swap payout | holds | (panel skipped) | holds |
| D3 pressure update law | error | (panel skipped) | error |
| D4 round-trip neutrality | holds-with-caveats | (panel skipped) | holds-with-caveats |
| D5 machine-checked | cannot-evaluate | (panel skipped) | cannot-evaluate |

The central result is wrong. From the invariant, b' = a*b/(a+da), so
p' = (a+da)/b' = p*((a+da)/a)^2. The note claims the first power. Its own
worked example decides the question: a=100, b=100, da=25 gives b' = 80 and
p' = 125/80 = 1.5625, not the claimed 1.25. The "by construction" sketch
holds b fixed while a moves, which the invariant forbids. The error
propagates to every payout computed from p.

D4 holds in the frictionless model (the round trip from (100,100) via
(125,80) returns exactly 25 A for 20 B) but only under zero fees, atomic
execution, and exact arithmetic.

## 4. Novelty

The pool itself is a textbook constant-product market maker. The pressure
framing is the only new element, and its governing law is incorrect, so no
novel contribution survives.

## 5. Significance

None as stated. A deployed faucet paying proportional to the claimed p'
would systematically underpay after inflows by a factor of (a+da)/a.

## 6. Formal verification

D5 names no proof assistant and links no artifact, so nothing is certified.
Worse, a machine check of D3 as stated would fail, which makes the claim
doubtful, not just unverifiable.

## 7. Recommendation

**Reject.** Confidence 5/5. The three changes that would most improve the
note: (1) correct D3 to p' = p*((a+da)/a)^2 and recompute the worked example;
(2) either produce the verification artifact or delete D5; (3) add any
empirical result (even a 50-line simulation of payout drift).

## 8. Questions for authors

1. Recompute the worked example from b' = k/(a+da): do you obtain 1.25 or
   1.5625?
2. Which proof assistant checked the identities, and where is the artifact?
3. Under what fee and concurrency assumptions does D4 survive?
