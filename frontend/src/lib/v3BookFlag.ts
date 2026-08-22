/**
 * v3 read-only book UI gate (additive, off by default — CLAUDE.md "v3
 * transport exponent" version-hygiene: v2 stays deployed and untouched
 * until v3 is blessed). Mirrors execMode.ts's NEXT_PUBLIC_* idiom, opposite
 * default polarity: v2's own toggle/view surfaces must render byte-identically
 * with this unset, so only an explicit "true" opts IN (not opts out).
 */
export const v3BookEnabled = () => process.env.NEXT_PUBLIC_V3_BOOK === "true";
