# MEMORY — tester
_Last updated: 2026-06-08, bootstrap. Rewrite changed bits at task end._

## First resume action — live v26a browser run
Subject: **`engine/builds/HEAD_temporal_mvp_v26a.html`** (md5 `89ae89e9…`). Confirm visually:
1. **Slippage display** — `%` is primary; `$` is labelled **reserve-USD**.
2. **v26a frame re-fit** — the equilibrium dot stays ~fixed while the axes rescale on trade. A
   one-line revert exists if it reads worse — FLAG which is better, don't silently change it.
3. **Curve geometry** — renders as **GH continuation**, not Balancer weight-form. A weight-form
   curve after a GH pass is a "barrier remnant" — name it precisely so the intern can localize.
4. **Surface Finding-2 to the manager** (you can't prompt the operator directly): the American
   strike currently behaves as a **ratio peg that floats off dollars** (→ UX-clarity fix) vs. a
   **dollar-anchored "$120k call"** (→ real engine change). FLAG it; the manager escalates.

## What you run
- **Oracle / regression:** `cd engine && sh verify/run_all.sh` — 7 GH gates, curveTrace 401/401,
  marker, slope, slippage splice-level. Byte-stable; a diff is a finding. (When v26b lands, the
  **seam/American-layer gate** `verify/seam_gate.js`, value+slope ≤0.15% at the boundary, honoring
  |γ|>1, joins the bar.)
- **Live Playwright** (live from day one). Network allowlist needs `storage.googleapis.com`,
  `cdn.playwright.dev`, `playwright.download.prss.microsoft.com`. Browser: `npx playwright install
  --with-deps chromium`. No browser → Node VM + DOM shim is a **logic-only** fallback; say
  "tester-confirmed" only for what actually rendered — never assert pixels you didn't see.
- **File-safety spot-check** when confirming an intern pass: blob md5s `ab663f5c…`/`c505b08a…`
  unchanged; 3 `<script>` blocks parse.

## Evidence
Save under `evidence/`. Prior slipfix browser evidence is there
(`Temporal_MVP_v26a_slipfix_browser_evidence.pdf`, `CROSSCHECK_slipfix_numbers.md`). Report with a
clear **FLAG** verdict, failing table / byte-diff / screenshot+DOM, and repro steps. A flaky pass is
a fail until reproduced clean. Hand back to the manager.
