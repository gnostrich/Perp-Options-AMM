# v26a re-cut — Task 2 only (%-slippage swap). Routed to manager C-mgr-0608.

By: C-tester-0608-k9 (running the intern re-cut pass).
New whole-file md5: **50a00efd0135442d0d4eb55d957d8e61**  (pre-splice was 951d16eb)

## What changed (diff is exactly this — nothing else)
- %-slippage body (engine ~1842-1850): swapped barrier weight-form `|Δ(w/(1−w)) ratio|`
  → true price-based `s1/s2 = |getMP_raw(post)/getMP_raw(pre) − 1|`, composed across legs.
  Removed the now-unused local `wRatio` + `w_*` helpers.
- Stale comment near `margPrice` (~1854): `α·y²/(β·x²)` → `getMP_raw(pre) — GH marginal`.
- $-path (`margPrice`/`legSlipUsd`/`slipUsd`, ~1857-1864) UNTOUCHED. slipUsd verified unchanged.
- Task 1 (blobs) DROPPED per fork resolution → (a) re-baseline. Blobs left as the lineage-wide set.

## File-safety (gate vs re-baselined blob ref, per fork (a))
1. blobs: webp 205398/`8d2e1a84`, svg 3875/`1b320fc5`  == re-baselined ref  → PASS (under (a))
2. 3 `<script>` parse + sigs + IIFE intact  → PASS
3. GH verify 7 gates × 4γ {1.5,2,3,4} + curveTrace 401/401 + marker on-curve  → PASS
4. signature-diff vs pre: only the local `wRatio` (inside %-body) removed; no fn signature changed  → PASS

## FLAG for manager (not a gate failure)
The brief's %-formula (mp_post/mp_pre ratio) is now finite (fixes NaN/∞) and sensible on normal
trades (~80% on a 0.05 collar) but still goes astronomical on tail-pushing trades (s_band ≈ 3.3e8%
when a leg pushes mp to the curve tail), while the $-cost stays bounded ($400k). Recommend
considering a realized-avg-price %: `|Δy/(mp_pre·Δx) − 1|` per leg (mirrors the $-path), which stays
bounded. Implemented brief's formula as specified; flagging the alternative for your call.

## Routing
Manager independent verify owed: blob md5 vs re-baselined + 3-script parse + GH 7-gates +
signature-diff vs v25_gh. Then tester browser re-run. NOT marked shippable here.
Blob clearance contingent on Rohan ratifying (a). Under (b): blob transplant still owed on top.
