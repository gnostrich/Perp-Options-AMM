# ARCHIVE — pre-RFQ era, frozen 2026-08-15 (operator entry 605)

Hard archive: nothing here is current work. History preserved via `git mv`; nothing deleted.
The live design at freeze: RFQ across maker curves, aggregate-then-spread book (entry 580),
oracle+bias quoting (571/572), margin+exposure-limit LPs (604), paper-wallet closed network (598),
app builds 12–38, formalisms in `docs/UX_FORMALISM.md`.

| folder | what it is | why archived |
|---|---|---|
| `sims_workbooks/` | economics workbooks v1–v5, closed-loop v1–v3, consolidated, curve-adapts | pre-Burr2 or superseded by `sims/BURR2_FULL_LOOP_v1.xlsx` + `sims/LP_EXPOSURE_CURVE_v1.xlsx` |
| `sims_notes/` | their NOTES files, the LP-economics/Varun reports, corrections since settled | content absorbed into transcript entries 486–541 and the current workbooks |
| `specs/` | GH/lens-era engine specs, PARKED fixes, superseded targets | the engine line (`engine/`, untouched) is demoted-retained; these specs describe builds already shipped or superseded by operator rulings 229/231/580+ |
| `notes/` | engine-era one-off notes, CTO changelogs, early reconciliations | superseded by `history/operator/` (verbatim record) and `docs/` |
| `handover_kit/` | the staging-tester zip + SOP (entry ~516) | that test cycle completed |

**Not archived, deliberately:** `engine/` (canonical HEAD line per CLAUDE.md §8 — dormant, not dead;
its file-safety gate and harnesses key off these paths), `formal/` + `sims/v3-maps-lean` (Lean, cited
by provenance docs), `history/` (append-only record, never moves), `notes/research` + `notes/skeptic`
(live audits; skeptic verdicts must stay summonable), `evidence/` (tester artifacts), `sims/scripts/`
(current gates), `docs/` (live formalisms), `.claude/` (agents/memory/hooks).
