/**
 * mirror-diff — the TS half of the Go↔TS MIRROR GATE (CLAUDE.md, Process
 * improvements). `perp-backend-staging/cmd/mirrorgold` emits a golden of every
 * surface `src/lib/burr2/pricer.ts` claims to mirror; this recomputes the same
 * table through the REAL pricer (imported, never copied) and diffs it cell by
 * cell. Nonzero exit on any miss, first 20 printed with coordinates.
 *
 *   cd perp-backend-staging && go run ./cmd/mirrorgold > /tmp/mirror-golden.json
 *   cd perp-frontend-hyperliquid-staging && npx tsx scripts/mirror-diff.ts /tmp/mirror-golden.json
 *
 * The golden is GENERATED, never committed, and deliberately lands OUTSIDE the
 * checkout: the gate has to compare HEAD's Go against HEAD's TS, a checked-in
 * table would only ever prove itself stale, and an untracked 2 MB file at the
 * repo root is a thing someone eventually commits by accident.
 *
 * NOTHING RUNS AT IMPORT. tsconfig.json includes `**\/*.ts`, so this file is part
 * of the project `next build` type-checks and its workers load; a module-level
 * `process.exit` here killed a build worker and the build died on a missing
 * pages-manifest, with no error naming this file. Everything below is a
 * declaration until `main` is called, and it is called only when this module IS
 * the entry point.
 *
 * TWO OUTCOMES, AND THEY ARE NOT THE SAME THING. A MISS is drift — the mirror
 * claims that cell and got it wrong — and fails the build. A DECLARED entry is a
 * difference the mirror never claimed, named by the golden itself (`why`) and by
 * the tolerance table below; it is MEASURED and PRINTED on every run rather than
 * skipped, so it cannot quietly become the norm. Widening a tolerance or adding
 * a declaration is a spec change, not a fix.
 *
 * WHAT THIS CANNOT SEE: it diffs values, so it catches a formula or a constant
 * that drifts. It does not catch a mirror MISSING a surface the engine has —
 * that is a reading job, and mirrorgold's header holds the surface list.
 */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import {
  COIN_LOT, DELTA, KAPPA_CLAMP, KAPPA_MAX, K_FLOOR, K_STEP, K_SPAN_STEPS, MAX_RUNGS, MOQ_COIN,
  SPREAD, effDelta, ghostRungs, roundCoin, shapeFromDials, wingPrice,
  type Burr2BaseParams, type GhostRung, type GhostShape,
} from "../src/lib/burr2/pricer";
import { halfSpreadBps } from "../src/lib/utils";

/** A cell passes when |ts − go| ≤ abs + rel·|go|. The report prints the WORST
 *  OBSERVED rel and abs per block, so the headroom between a claim and reality
 *  is visible on every run — a tolerance creeping toward its budget is then a
 *  thing you read off the table instead of something you go looking for. */
const HALF_LOT = 0.5 / COIN_LOT; // discretise.go roundCoin's worst error: 5e-6 coin
const TOL: Record<string, { rel: number; abs: number; why: string }> = {
  constants: { rel: 0, abs: 0, why: "exact: both sides are literals of one number" },
  // The pricer proper. pricer.ts substitutes a Lanczos lgamma for Go's
  // math.Lgamma and says so at the top of the file; everything else in
  // Derive/CallWing/PutWing/RegIncBeta is the same arithmetic in the same order.
  // Measured worst 1.2e-14 — the docstring's self-declared ~1e-10 is pessimistic,
  // but the claim here stays at 1e-12 so a libm difference between the CI runner
  // and a laptop cannot make the gate flaky.
  mid: { rel: 1e-12, abs: 0, why: "Lanczos lgamma vs math.Lgamma (measured worst 1.2e-14)" },
  // effDelta is a SEARCH, so a price difference does not stay a price difference:
  // the solve aims at ⌈want/price·coinLot⌉ and either side of that ceiling is a
  // whole coin lot of δ. Off the boundary the two solves agree to the last ulp
  // (measured worst 6.2e-16 relative).
  effDelta: { rel: 1e-12, abs: 0, why: "shared iterative solve; the risk is the ceil() boundary, not the arithmetic" },
  touchHalfSpreadBps: { rel: 1e-12, abs: 0, why: "δ_eff·1e4/2 — inherits effDelta" },
  rungCount: { rel: 0, abs: 0, why: "exact: both filters now test the same rounded product, so a rung one side does not post is drift" },
  // THE LADDER IS COMPARED THROUGH roundCoin, AND THAT IS WHY IT CAN BE EXACT.
  // Requote lands every emitted price and quantity on the 5-dp coin lot; the
  // ghost deliberately does not ("the ghost's OWN emitted rungs stay unrounded",
  // pricer.ts), so the honest comparison applies the mirror's OWN roundCoin and
  // demands bit-identity — 22,336/22,336 on each, zero exceptions.
  //
  // A ½-LOT ABSOLUTE BOUND HERE WAS BLIND, and this is the finding that replaced
  // it (audit of 4c30c88): the ladder is 52% of the gate, and under an injected
  // 1e-3 κ drift the block's worst-rel did not move a bit — the bound was pinned
  // by the rounding envelope, not by agreement. The smallest surviving rung price
  // in the grid is 4e-5 coin, where 5e-6 absolute IS 12.5% relative. (The worst
  // |Δqty| sits ~1.0e-14 coin inside the half lot — close in absolute terms,
  // but the reason for this change is BLINDNESS, not proximity; a 6-digit
  // printout reads it as exactly 5.000000e-6, which is why the envelope line
  // below prints the MARGIN.) The envelope survives as a READING so the
  // rounding stays visible without being what the gate rests on, and a genuine
  // tie now surfaces as a named one-lot miss instead of a pass.
  rungPrice: { rel: 0, abs: 0, why: "exact through the mirror's own roundCoin — the raw envelope is a printed reading, not the claim" },
  rungQty: { rel: 0, abs: 0, why: "exact through roundCoin; Δq's two multiplication orders must still land on one lot" },
  // Pure arithmetic on both sides: add, multiply, clamp. No special function and
  // no rounding step, so anything but bit-identity is a real difference.
  leanKappaPrime: { rel: 0, abs: 0, why: "exact: κ₀ + f·(±κ_max), clamped; no library call on either side" },
};

type Miss = { block: string; at: string; go: unknown; ts: unknown };
type Curve = { sbar: number; a: number; gamma: number; lambda: number; n: number; kappa: number };

/** M is inlined in ghostRungs, so it is OBSERVED, never restated here — a
 *  harness that recomputes the formula agrees with Go while the mirror drifts. A
 *  ladder whose every rung clears the dust filter by orders of magnitude has
 *  exactly M rungs: p0=1 with a tiny β makes qty·price ≈ 1e3 ≫ MOQ_COIN at every
 *  m, and the ask side fans UP so the price>0 guard cannot drop one either. */
const observedM = (delta: number): number => ghostRungs(1, 1e-6, "ask", delta).length;

/** ell/wing/capacity neutral and finv 0: the dials are offsets, so this IS the
 *  deployed curve, and kappa0 carries κ because the ghost has no separate
 *  fill-state κ (pricer.ts shapeFromDials). */
const shapeOf = (c: Curve): GhostShape => {
  const base: Burr2BaseParams = { Sbar: c.sbar, A: c.a, Gamma: c.gamma, Lambda: c.lambda, N: c.n };
  return shapeFromDials({ ell: 0, kappa0: c.kappa, wing: 0, capacity: 1, finv: 0 }, base);
};

function main(goldenPath: string): number {
  const g = JSON.parse(readFileSync(goldenPath, "utf8"));
  const misses: Miss[] = [];
  const cells: Record<string, number> = {};
  const worst: Record<string, { rel: number; abs: number; at: string }> = {};
  /** why → the divergences that reason accounts for. Counted, sampled, printed. */
  const declared = new Map<string, { n: number; eg: string[] }>();
  /** The ladder's declared sub-lot difference, kept as a READING now that the
   *  gate no longer rests on it — worst |raw ghost − posted| over the grid. */
  const envelope = { price: 0, qty: 0 };

  const declare = (why: string, at: string): void => {
    const d = declared.get(why) ?? { n: 0, eg: [] };
    if (d.eg.length < 3) d.eg.push(at);
    declared.set(why, { n: d.n + 1, eg: d.eg });
  };
  const cmp = (block: string, at: string, go: number, ts: number): void => {
    const t = TOL[block];
    cells[block] = (cells[block] ?? 0) + 1;
    const abs = Math.abs(ts - go);
    const rel = go === 0 ? (abs === 0 ? 0 : Infinity) : abs / Math.abs(go);
    const w = (worst[block] ??= { rel: 0, abs: 0, at: "—" });
    if (rel > w.rel || (rel === w.rel && abs > w.abs)) Object.assign(w, { rel, abs, at });
    if (!(abs <= t.abs + t.rel * Math.abs(go))) misses.push({ block, at, go, ts });
  };
  const same = (block: string, at: string, go: unknown, ts: unknown): void => {
    cells[block] = (cells[block] ?? 0) + 1;
    worst[block] ??= { rel: 0, abs: 0, at: "—" };
    if (go !== ts) misses.push({ block, at, go, ts });
  };

  // ---- constants: pricer.ts's exported literals against the Go they cite -----
  const C = g.constants;
  cmp("constants", "K_FLOOR", C.kFloor, K_FLOOR);
  cmp("constants", "KAPPA_CLAMP", C.kappaClamp, KAPPA_CLAMP);
  cmp("constants", "KAPPA_MAX", C.kappaMaxDefault, KAPPA_MAX);
  cmp("constants", "MOQ_COIN", C.moqCoin, MOQ_COIN);
  cmp("constants", "MAX_RUNGS", C.maxRungs, MAX_RUNGS);
  cmp("constants", "K_STEP", C.kStepBps / 1e4, K_STEP);
  cmp("constants", "K_SPAN_STEPS", C.kSpanBps / C.kStepBps, K_SPAN_STEPS);
  cmp("constants", "SPREAD", C.spreadDial, SPREAD);
  // defaultDelta is unexported in Go, so the golden pins its EFFECT: the min-rung
  // rule never narrows, so the least δ_eff over the grid IS the budget δ both
  // sides start from. The grid deliberately contains capacities above the rule,
  // which is what makes that minimum attained rather than inferred.
  cmp("constants", "DELTA (= min δ_eff over the grid)", Math.min(...g.curves.map((c: Curve & { effDelta: number }) => c.effDelta)), DELTA);

  // ---- curves: mid, effDelta, the touch spread, M, the ladders ---------------
  for (const c of g.curves) {
    const shape = shapeOf(c);
    const d = effDelta(shape);
    cmp("effDelta", c.id, c.effDelta, d);
    cmp("touchHalfSpreadBps", c.id, c.touchHalfSpreadBps, halfSpreadBps(SPREAD, d));
    same("rungCount", `${c.id} M`, c.m, observedM(d));

    for (const m of c.mids) cmp("mid", `${c.id} k=${m.kbps}bps`, m.mid, wingPrice(shape, m.kbps / 1e4));

    for (const lad of c.ladders) {
      const p0 = wingPrice(shape, lad.kbps / 1e4);
      for (const side of ["bid", "ask"] as const) {
        const go: { qty: number; prices: number[] } | null = lad[side] ?? null;
        const ts: GhostRung[] = ghostRungs(p0, shape.beta, side, d);
        const at = `${c.id} k=${lad.kbps}bps ${side}`;
        const gp: number[] = go?.prices ?? [];
        // WHICH END A LADDER LOSES RUNGS FROM is what makes two fans of unequal
        // length still alignable rung-for-rung. Δq is uniform, so a rung's
        // notional q·p orders exactly as its price: the bid fans DOWN, so the
        // dust filter takes a SUFFIX; the ask fans UP, so it takes a PREFIX (a
        // surviving ask ladder can start at m=49 — discretise.go's own note).
        // Survivors are contiguous, so the two fans align at the TOUCH end.
        // Pairing by price instead would be ambiguous exactly where it matters:
        // at premia near MOQcoin the rung spacing δ·P(k) can be smaller than one
        // coin lot, so two different rungs round onto one price.
        const n = Math.min(gp.length, ts.length);
        const touch = (len: number) => (side === "ask" ? len - n : 0);
        const gOff = touch(gp.length), tOff = touch(ts.length);
        for (let i = 0; i < n; i++) {
          cells.rungCount = (cells.rungCount ?? 0) + 1;
          const r = ts[tOff + i];
          cmp("rungPrice", `${at} #${i}`, gp[gOff + i], roundCoin(r.price));
          cmp("rungQty", `${at} #${i}`, go!.qty, roundCoin(r.qty));
          // The declared sub-lot difference itself, measured on the RAW ghost
          // values the FE renders. Reported, never gating.
          envelope.price = Math.max(envelope.price, Math.abs(r.price - gp[gOff + i]));
          envelope.qty = Math.max(envelope.qty, Math.abs(r.qty - go!.qty));
        }
        // Whatever the shorter fan lacks sits at the dust end: indices [n, len)
        // for a bid, [0, len−n) for an ask. Both filters now test the SAME
        // rounded product (pricer.ts's roundCoin, landed for this gate), so an
        // unpaired rung is drift outright — there is no longer a rounding
        // difference for it to be.
        const unpaired = (len: number) => Array.from({ length: len - n }, (_, i) => (side === "ask" ? i : i + n));
        const extra: Array<[number, number]> = [
          ...unpaired(gp.length).map((i): [number, number] => [gp[i], go!.qty]),
          ...unpaired(ts.length).map((i): [number, number] => [ts[i].price, ts[i].qty]),
        ];
        for (const [price, qty] of extra) {
          cells.rungCount = (cells.rungCount ?? 0) + 1;
          const owner = gp.length > ts.length ? "go-only" : "ts-only";
          misses.push({ block: "rungCount", at: `${at} ${owner} rung p=${price} q·p=${(qty * price).toExponential(4)} vs MOQ ${MOQ_COIN}`, go: gp.length, ts: ts.length });
        }
      }
    }
  }

  // ---- lean: the κ composition ----------------------------------------------
  // The ghost has no fill history and no SkewLean dial, so it ports exactly one
  // of Lean's branches: κ′ = κ₀ + f·(±κ_max), clamped. Rows the golden marks
  // out-of-domain still get computed — their divergence is reported, not skipped.
  const lb = g.leanBase;
  const leanBase: Burr2BaseParams = { Sbar: lb.sbar, A: lb.a, Gamma: lb.gamma, Lambda: lb.lambda, N: lb.n };
  const LOADED_WHY =
    "loaded side at f=0: Lean has no inventory sign to read and tie-breaks to Bid, the ghost reads sign(κ₀). Not compared, and nothing reads it there — every production consumer of the loaded side is suspension-gated, and f=0 cannot suspend";
  for (const r of g.lean) {
    const s = shapeFromDials({ ell: 0, kappa0: r.kappa0, wing: 0, capacity: 1, finv: r.frac }, leanBase);
    const at = `${r.config} κ₀=${r.kappa0} f=${r.frac}`;
    if (!r.mirrored) {
      if (s.kappaEff !== r.kappaPrime || s.suspended !== r.suspended) declare(r.why, `${at} go=${r.kappaPrime} ts=${s.kappaEff}`);
      continue;
    }
    cmp("leanKappaPrime", at, r.kappaPrime, s.kappaEff);
    same("leanKappaPrime", `${at} suspended`, r.suspended, s.suspended);
    // The one assumption in this block, routed through declare() rather than a
    // counter so it prints beside the others every run.
    if (r.frac === 0) declare(LOADED_WHY, `${at} go=${r.loaded} ts=${s.loadedSide}`);
    else same("leanKappaPrime", `${at} loaded`, r.loaded, s.loadedSide);
  }

  // ---- report ----------------------------------------------------------------
  const pad = (s: string | number, n: number) => String(s).padEnd(n);
  const e = (x: number) => (x === 0 ? "0" : x.toExponential(2));
  console.log(`MIRROR GATE  golden=${goldenPath}  curves=${g.curves.length}  leanRows=${g.lean.length}`);
  console.log(`${pad("block", 20)}${pad("cells", 9)}${pad("worst rel", 11)}${pad("worst abs", 11)}claim`);
  let total = 0;
  for (const block of Object.keys(TOL)) {
    const n = cells[block] ?? 0;
    total += n;
    const w = worst[block] ?? { rel: 0, abs: 0, at: "—" };
    const t = TOL[block];
    const claim = t.rel === 0 && t.abs === 0 ? "exact" : `${e(t.rel)} rel + ${e(t.abs)} abs`;
    console.log(`${pad(block, 20)}${pad(n, 9)}${pad(e(w.rel), 11)}${pad(e(w.abs), 11)}${claim}  — ${t.why}`);
  }
  console.log(`${pad("TOTAL", 20)}${total}`);
  console.log(`ladder rounding envelope (raw ghost vs posted, a reading not a claim): worst |Δprice| ${envelope.price.toExponential(6)}, |Δqty| ${envelope.qty.toExponential(6)}, margin inside half-lot: price ${(HALF_LOT - envelope.price).toExponential(3)}, qty ${(HALF_LOT - envelope.qty).toExponential(3)}`);

  if (declared.size) {
    console.log(`\nDECLARED — differences the mirror does not claim. Measured, not gating:`);
    declared.forEach((d, why) => console.log(`  ${d.n}×  ${why}\n${d.eg.map((s: string) => `      ${s}`).join("\n")}`));
  }
  if (misses.length === 0) {
    console.log("\nno drift: every claimed cell reproduces inside its stated tolerance.");
    return 0;
  }
  console.log(`\nDRIFT — ${misses.length} miss(es), first 20:`);
  for (const m of misses.slice(0, 20)) console.log(`  [${m.block}] ${m.at}\n      go=${m.go}\n      ts=${m.ts}`);
  return 1;
}

// Entry point only when RUN, never when merely loaded — see the header.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const path = process.argv[2];
  if (!path) {
    console.error("usage: mirror-diff <mirror-golden.json>");
    process.exit(2);
  }
  process.exit(main(path));
}
