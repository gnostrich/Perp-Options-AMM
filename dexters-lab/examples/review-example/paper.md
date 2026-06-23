# The Drip Pool: Pressure-Based Pricing on a Constant-Product Faucet

> **SYNTHETIC EXAMPLE.** This one-page "paper" is invented for the Dexter's
> Lab review-pipeline documentation. It describes a fictional mechanism and
> contains one deliberate algebra error. It is not a real submission and
> cites no real work.

## 1. Mechanism

The Drip Pool holds reserves `a` of token A and `b` of token B, bound by the
constant-product invariant

```
a * b = k.                                    (D2 context)
```

A swap of `da` units of A into the pool moves the state to
`(a + da, k / (a + da))`, so the trader receives

```
-db = b * da / (a + da).                      (claim D2)
```

We define the pool's **pressure** as

```
p = a / b.                                    (claim D1)
```

Pressure is the Drip Pool's price signal: faucet payouts are proportional to
`p`.

## 2. The pressure update law

Our central result is a closed form for pressure after a swap:

**Claim D3.** After a swap of `da` units of A into the pool, the new pressure
is

```
p' = p * (a + da) / a.
```

*Proof sketch.* The reserve of A scales by `(a + da)/a` and the invariant
fixes `b'`, so pressure scales by the same factor. (By construction.)

**Worked example.** Take `a = 100`, `b = 100`, `k = 10000`, and `da = 25`.
Then `p = 1` and the update law gives `p' = 1 * 125/100 = 1.25`.

## 3. Round-trip neutrality

**Claim D4.** With zero fees, no trader can profit from a round-trip swap:
swapping `da` in and then swapping the received amount back returns the
trader exactly to their starting balances.

## 4. Verification

**Claim D5.** All identities in this note are machine-checked.

## 5. Limitations

We model no fees, no concurrent traders, and no gas costs.
