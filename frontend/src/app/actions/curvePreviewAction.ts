"use server";

import {
  fetchCurvePreview as fetchCurvePreviewFromDAL,
  type CurvePreviewRequest,
} from "@/lib/data/api/curve";
import type { SchedulePreview } from "@/lib/data/api/contracts";

// The ladder discretiser now runs to MaxRungs=60 per (wing,strike,side) (v2 ladder
// rebuild, 2026-07-25 — see frontend-builder memory's LADDER SEMANTICS CHANGED entry),
// so `ladder` can carry ~19k entries (~2MB JSON) at high N. Nothing in the FE reads it —
// EarnComponent shows only the honest `rungs` COUNT plus the scalar summary stats, and
// the chart overlay is fed by callCurve/putCurve (61 points, unaffected). Cap what
// crosses this server-action boundary into client/Zustand state so the 300ms-debounced
// live preview never ships megabytes to the browser on every keystroke. `rungs` itself
// is left untouched — it must stay the true total, not this display cap.
// NOTE: this only trims the Next server -> browser leg. POST /api/amm/curve-preview
// has no `limit`/pagination param, so the Go backend -> Next server leg still transmits
// the full payload every call; a real fix needs a backend param (flagged, not added
// here — out of scope for a frontend-only pass).
const LADDER_PREVIEW_ROWS = 50;

/**
 * Server action for the live (pre-deploy) LP curve schedule preview.
 * Returns null on failure so the caller can keep showing the last preview.
 */
export async function curvePreviewAction(
  req: CurvePreviewRequest
): Promise<SchedulePreview | null> {
  try {
    const preview = await fetchCurvePreviewFromDAL(req);
    // Go serialises a nil slice (e.g. no live mark yet) as JSON null, not [].
    return { ...preview, ladder: (preview.ladder ?? []).slice(0, LADDER_PREVIEW_ROWS) };
  } catch (e) {
    console.error("curvePreviewAction error:", e);
    return null;
  }
}
