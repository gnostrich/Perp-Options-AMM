# Resume State — where the work stands

Seed each agent's memory from the relevant slices of this file, and resume from here.

## Engine (intern / manager)
- **Latest verified build: v26a** (GH-curve swap on the clean v24 base). v25 introduced
  the GH swap; independent review then caught three barrier remnants the gates missed —
  all fixed in v26a:
  1. `margPrice` was using the barrier slope formula (~32% off post-trade) → fixed to GH.
  2. `curveTraceExplicit` was still drawing the Balancer weight-form curve → fixed.
  3. inline arb duplicate (`xEq/yEq`) used the barrier formula for the equilibrium
     marker → fixed.
- v26a verified surgical: diff = exactly those three fixes (+ one necessary `{...p}` snap
  spread). All 7 engine gates pass; 401/401 `curveTrace` points on the GH curve
  (slope error ~5e-12); equilibrium marker confirmed on-curve.
- **In-flight item: the tester run on v26a** — live-browser pixel/visual confirmation.
  This is the one open execution item; nothing is blocked behind it.

## Locked direction (research-lead / manager)
- GH-only curve (γ > 1, no barrier, no δ-limit); one path, no branching.
- ITM settlement moves from barrier-style (from entry mark) to **American-style (from
  strike)**, via **smooth-pasting**: free boundary falls out closed-form,
  `S* = K·γ/(γ+1)`, `sNorm* = θ·((γ+1)/γ)^γ`. Handoff is below the strike (tangency).
- Funding is **orthogonal to intrinsic** — a function of curve-slope deviation from the
  anchor at the strike ray, not of intrinsic value. Anchor stays at w=½; strike ray
  shifts with rebase as θ → θ/r.
- Convexity knob γ on the convex range (roughly γ∈(1,4)); γ=1 recovers the barrier case.

## Open / undischarged
- Solvency hypotheses **B1/B3/B4 are NOT discharged** against the real engine — the
  funding port is necessary but not sufficient. B1 funding-coverage sweep is a ship-gate.
- **Finding 2 (human decision):** is the American's strike a ratio peg that floats off
  the dollar price after open (→ UX-clarity fix only), or should "$120k call" stay
  anchored to dollars (→ a real engine change)? Manager to surface; human to decide.

## Aristotle proof queue (research-lead)
- **C1** — composite-ray shortcut extends to ITM settlement under effective-strike
  substitution (original strike if OTM, spot if ITM). (Cited as verified inline in the
  paper draft — confirm against the relay.)
- **C2** — no costless-collar arb in a symmetric (w=½) pool: bought-leg value mirror-
  symmetric to sold-leg for a given budget; surplus = 0.
- **C3** — no-arb is a symmetry phenomenon, not an instrument one (a different symmetric
  curve + perpetual-American power-law value family gives the same no-free-arb result).

## Publication pipeline (paper)
- AfT 2026 — submitted; notification ~July 15, 2026.
- WINE 2026 — deadline ~July 2 (confirm).
- FMBC 2027 — targeted for the Lean verification paper (OASIcs + JLAMP special issue).
- Must-cite: Singh et al. (LVR as a continuum of perpetual options) — for future
  versions / AfT rebuttal if raised.

## Tooling
- Single-file HTML simulator (canonical), versioned v17 → v26a.
- Node regression harness (byte-stable oracle) + American-layer harness (|γ|>1 contract).
- Lean 4 + Mathlib (Aristotle runs: sorry-free, standard axioms).
- Python/scipy/mpmath for high-precision references. Playwright for browser UI tests
  (needs `storage.googleapis.com` on the network allowlist).
