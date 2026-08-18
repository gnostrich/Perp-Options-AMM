# app/spec — specification of the RFQ MM console (builds 1–11) + its Lean corpus

Operator request 2026-08-18 (transcript entry 542): spreadsheet-format and arXiv-format-PDF
spec of "the thing we just did on the rfq version", including all the relevant Lean work.

| file | what |
|---|---|
| `SPEC_RFQ_MM_CONSOLE.xlsx` | spreadsheet spec — 11 sheets: README, kernel, quoting economics, aggregation/RFQ, UI, worked numbers (manager-re-derived 2026-08-18), Lean index (5 packages / 130 theorems), theorem-level listing (76 RFQ-specific), app↔Lean map, build history 1–11, open gaps |
| `SPEC_RFQ_MM_CONSOLE_arxiv.tex` | arXiv-format LaTeX source (canonical) |
| `SPEC_RFQ_MM_CONSOLE_arxiv.pdf` | compiled with pdflatex (TeX Live, this environment), 8 pp |

Provenance: object specified = `app/index.html` build 11 (`ebd774e`). Worked numbers were
re-derived by executing the app's own math in Node, not copied from commit messages; the
build-1 headline APR contrast (commit `75abb52`, pre-basis-fix) is labelled HISTORICAL (does
not reproduce on build-11 defaults). Lean labels: proved + locally kernel-verified (Lean 4.28.0;
Mathlib oleans from CI cache — stated); the trusted-from-prover→verified label flip remains the
operator's call. Skeptic-gated before hand-back (Universal Skeptic Gate): verdict
`notes/skeptic/VERDICT_rfq_spec_docs_2026-08-18.md` — F1 (build-1 attribution), F2 (common level
= chosen/motivated, not forced; crossed book ≠ smile obstruction), F3 (hardcoded readback
residual + put-delta parity bug, reported not fixed) and all nits incorporated.
