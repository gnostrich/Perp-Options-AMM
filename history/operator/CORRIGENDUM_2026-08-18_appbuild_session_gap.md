# Corrigendum — 2026-08-18 — transcription gap: the 2026-08-14 app-build session

**Manager, owned.** The 2026-08-14 session that built the RFQ MM console (`app/`, builds 1–11,
commits `75abb52`…`ebd774e`) and landed the Burr-2 Lean (`269a6a3`) **did not transcribe its
operator messages**. The canonical transcript
(`2026-06-10_kurtosis-curve-family-brief.md`) ends at entry 541 (2026-08-14, the realtime-LP-tuning
ruling), before the app work began. This is a §2.2 violation by that session's manager turn(s);
recording it here rather than hiding it.

**What survives (labelled reconstruction, NOT verbatim transcript):** fragments of operator
messages quoted inside the build commit messages at the time —

| build | commit | operator fragment quoted in the commit |
|---|---|---|
| 6 | `caf6c71` | "that was the OB" (take the reference UX elements, not the orderbook mechanics) |
| 8 | `07370be` | "still seeing rungs, not seeing buy and sell curves separately." |
| 9 | `7650a2a` | "why seeing discrete quotes [in the] quote sheet?" |
| 10 | `7fd1325` | "why u need box separately" |
| 11 | `ebd774e` | "the other tabs were delinked", Transact should show the aggregate curve |

These commit-message fragments are quotes-at-the-time, not a transcript; gaps between them are
unrecoverable from this side. **Standing request to the operator:** export the 2026-08-14
app-build session transcript into `history/` so the verbatim record can be restored (same remedy
as the pre-policy 2026-06-08/09 sessions).
