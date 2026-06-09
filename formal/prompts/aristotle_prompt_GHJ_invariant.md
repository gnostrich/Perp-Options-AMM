# Aristotle prompt — GH J invariant / lossless routing (skew-J) (TIER 2)

**Toolchain:** Lean 4.28.0 + Mathlib v4.28.0.

## Informal statement + intended math (read carefully — this is an economic object)
For the **barrier** curve the trade conserves the algebraic invariant `Φ = X·Y` and a trade is the
boost `(X,Y) ↦ (e^δ X, e^(−δ) Y)` (already proved in `Temporal.lean §2`). For **GH** there is NO such
simple algebraic invariant — the reserves are GH special functions `X(u)=Nx·tail_β(u)`,
`Y(u)=Ny·M·F_{β+1}(u)`. The correct conserved structure is in the **latent coordinate `u`**:

- A GH trade is the **latent translation** `u ↦ u + δ` (equivalently a multiplicative scaling of the
  price coordinate `getMP_raw = P·e^u ↦ P·e^(u+δ)`). Adding `dy` to Y solves for a new `u`, and X
  follows from the SAME `u` — so the trade just slides the reserve point ALONG the GH frontier.
- The conserved invariant is therefore **the frontier itself / the latent parametrization**: the
  reserve point stays a valid GH point `(X(u'), Y(u'))` for `u' = u + δ`. "Being on the curve" is
  conserved — this is the lossless-routing (skew-J) content. There is no creation/destruction of
  a storage quantity; power is routed between the X- and Y-ports along the one-parameter family.
- The latent boost forms a **one-parameter group**: `shift 0 = id`, `shift δ₁ ∘ shift δ₂ = shift (δ₁+δ₂)`.

We model `X, Y : ℝ → ℝ` as ARBITRARY reserve-parametrizations of the latent `u` (the GH special
functions enter only as "some monotone parametrization"; the group/frontier structure does NOT depend
on their closed form). The price coordinate is `mp u = P · Real.exp u` (`P>0`). Define the latent
boost `shift δ u = u + δ` and the reserve map `pt X Y u = (X u, Y u)`.

**WATCH-FLAG honesty note:** GH DOES conserve a clean invariant here (the latent parametrization /
frontier), so this is a genuine skew-J result, NOT a degenerate one. If during proving it turns out the
GH trade conserves NOTHING clean, STOP — do not weaken. (We assert it does: the latent-translation
group structure is exactly the conserved object.)

## Lean (project `RequestProject`, file `RequestProject/GHJ.lean`)
File ships statements + `sorry`. Replace each `sorry`; do not alter statements.

## Proof targets
- `shift_zero` : `shift 0 = id` (latent identity = zero trade).
- `shift_add` : `shift δ₁ ∘ shift δ₂ = shift (δ₁ + δ₂)` (one-parameter group, additive in rapidity).
- `mp_boost` : `mp P (shift δ u) = Real.exp δ * mp P u` (price coordinate scales by e^δ — the boost on
  the price coordinate, matching `getMP_raw ↦ e^δ·getMP_raw`).
- `frontier_preserved` : for the reserve point `pt X Y`, a trade keeps the point ON the frontier:
  `pt X Y (shift δ u) = (X (u+δ), Y (u+δ))` and this is in the range of `pt X Y` (i.e.
  `∃ u', pt X Y (shift δ u) = pt X Y u'`). [the lossless-routing / "stays a valid GH point" content]
- `mp_strictMono` : with `P>0`, `mp P` is `StrictMono` (the price coordinate is a faithful chart of u —
  so the latent group acts faithfully; a nonzero trade strictly moves the price).

## Output spec
- Compiles server-side; no `sorry`/`admit`/`native_decide`/`opaque`/`unsafe`; no new `axiom`.
- `#print axioms` for each target ⊆ `{propext, Classical.choice, Quot.sound}`.
- Only `RequestProject/GHJ.lean` changes.
