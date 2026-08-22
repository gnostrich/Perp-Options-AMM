/**
 * FE mirror of the Go execmode.IsPaper() switch (v2 §13.2).
 * EXECUTION_MODE is Go-side and defaults to paper; NEXT_PUBLIC_EXECUTION_MODE
 * is the FE's read of that same default — only an explicit "live" opts out.
 */
export const isPaperMode = () =>
  (process.env.NEXT_PUBLIC_EXECUTION_MODE ?? "paper") === "paper";
