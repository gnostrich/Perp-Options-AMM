# One question for the CTO (funding design, Story Table row 9 — 2026-07-02)

**Q: In the production Go backend, does the perp layer charge standard perp funding on a trader's
origin perp — including the carved slice — while a band is open?**

Why it matters (one paragraph): the sim's perp layer is a stub (perps accrue price P&L only; the only
funding cron services band strikes via `fundingPerStrike` — see the prod mapping comments at HEAD
L1594–1600, which map no perp-funding service). The intended design zeroes ITM *option* funding (the
operator-validated geometry: parity has no warp-sensitivity). That design is complete and loophole-free
**iff** the perp layer itself keeps charging the carve. If YES: nothing further needed; we zero ITM option
funding when that slice is built. If NO: a deep-ITM band + carve would be delta-1 exposure paying no
funding (≈ perp rate × carvedNotional per period for the band's life) — and the fix belongs at the perp
layer (charge the carve), not by re-adding warp-insensitive option funding.
