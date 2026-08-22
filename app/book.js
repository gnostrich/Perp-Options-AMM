/* ─── Book.js — ONE aggregate-then-spread book model ─────────────────────────
   Replaces three disagreeing price models in app/index.html:
     1. Trading   (aggBook/ladderAt/landedFrom)  — CORRECT, operator-ruled.
     2. Marks/closes (renderPortfolio's bookMid/closePx) — spread-FIRST envelope
        (min-ask / max-bid across makers), which CAN cross, so a close can pay
        above its own mark (measured −$1,009, a "profit" that should be a cost).
     3. Earn (calc's book/sorted)                — cheapest-first ladder, under
        which the top-ranked maker can fill nothing while Yield still counts it.

   This file is the single source of truth going forward: AGGREGATE FIRST
   (mid = share-weighted mean of maker curves), SPREAD AFTER (one h_agg applied
   to the aggregate). That order makes crossing structurally impossible — see
   index.html's own comment block above aggBook() (operator entry 580) and
   sims/scripts/aggregate_then_spread_check.js, which measured 0% crossings at
   every divergence under this order versus 97-100% under spread-then-aggregate.

   Plain browser script — no ES modules. Attaches window.Book. Also usable from
   Node (require()) for testing: falls back to `global` when `window` doesn't
   exist, exactly the way this project's other vanilla scripts are tested
   (see sims/scripts/*.js, which vm.runInContext the extracted <script> block).
─────────────────────────────────────────────────────────────────────────── */
(function (root) {
  'use strict';

  var DEFAULT_LAM = 0.01; // sheet 'Trade'!B11 — see index.html LAM comment, same constant.

  /**
   * Book.make(makers, opts)
   *
   * makers: [{ name, me, cap, curve, hBps }, ...]
   *   name  — display label (also the apportion/shares key)
   *   me    — boolean, true on (at most) one entry: your own maker quote.
   *           Self-exclusion (mark/closePx with excludeMe=true) filters on this.
   *   cap   — capital (BTC), the liquidity-density weight for aggregation.
   *   curve — { CALL(k), PUT(k), ATM } — a Burr-2 (or any) pricing curve.
   *   hBps  — this maker's own half-spread, in basis points.
   *
   * opts: { LAM } — impact constant, defaults to 0.01 (sheet 'Trade'!B11).
   */
  function make(makers, opts) {
    if (!Array.isArray(makers) || makers.length === 0) {
      throw new Error('Book.make: makers must be a non-empty array');
    }
    opts = opts || {};
    var LAM = typeof opts.LAM === 'number' ? opts.LAM : DEFAULT_LAM;

    // ---- internal: build the full API over an arbitrary SUBSET of makers ----
    // Used both for the top-level (full book) object and, with the 'me' maker
    // filtered out, for self-excluded mark()/closePx() reads.
    function bookFor(subset) {
      var totCap = subset.reduce(function (t, m) { return t + m.cap; }, 0);
      var hasLiquidity = subset.length > 0 && totCap > 0;

      // hAgg: "the book is as tight as its tightest" — min half-spread, not a
      // capital-weighted one. (index.html aggBook: hAgg=Math.min(...hs)/1e4)
      var hAgg = hasLiquidity
        ? Math.min.apply(null, subset.map(function (m) { return m.hBps; })) / 1e4
        : NaN;

      function mid(k) {
        if (!hasLiquidity) return NaN;
        return subset.reduce(function (t, m) {
          return t + (m.cap / totCap) * m.curve.CALL(k);
        }, 0);
      }
      function midPut(k) {
        if (!hasLiquidity) return NaN;
        return subset.reduce(function (t, m) {
          return t + (m.cap / totCap) * m.curve.PUT(k);
        }, 0);
      }
      // DORMANCY DIVIDER (operator entries 606/607, replaces aggregate-then-spread).
      // mid(k) is the single spread-free aggregate = the divider. Each maker's own
      // bid/ask stands as posted; a quote CROSSING the divider is DORMANT — never
      // matched, never clipped, wakes when the divider moves or the maker requotes.
      // Structural guarantees: live asks >= divider >= live bids (never crossed),
      // and NEITHER side can be empty, because the divider is a weighted MEAN of
      // the mids — the dearest maker's ask and cheapest maker's bid always survive.
      function ask(k) {
        var d = mid(k), best = Infinity;
        for (var i = 0; i < subset.length; i++) {
          var a = subset[i].curve.CALL(k) * (1 + subset[i].hBps / 1e4);
          if (a >= d && a < best) best = a;
        }
        return best === Infinity ? d : best;   // unreachable for nonempty books; d = safe fallback
      }
      function bid(k) {
        var d = mid(k), best = -Infinity;
        for (var i = 0; i < subset.length; i++) {
          var b = subset[i].curve.CALL(k) * (1 - subset[i].hBps / 1e4);
          if (b <= d && b > best) best = b;
        }
        return best === -Infinity ? d : best;
      }

      // Depth combines in PARALLEL: 1/slope_agg = Σ (0.01·capᵢ)/(LAM·ATMᵢ).
      // Matches index.html ladderAt exactly (sheet 'Trade'!B35). Does not
      // depend on k — accepting it keeps the call-site interface uniform and
      // leaves room for a future strike-dependent slope without a signature
      // change; today it is the same number at every k, same as the source.
      function slope(k) { // eslint-disable-line no-unused-vars
        if (!hasLiquidity) return NaN;
        var invSlope = subset.reduce(function (t, m) {
          return t + (0.01 * m.cap) / (LAM * m.curve.ATM);
        }, 0);
        // Manager, integration: a zero-capacity maker made invSlope 0 and slope NaN,
        // which then poisoned landed(). A book with no capital has no depth, so the
        // honest value is INFINITE slope — any size moves the price without limit —
        // and landed() must then decline to quote rather than return NaN.
        return invSlope > 0 ? 1 / invSlope : Infinity;
      }

      // landed(k, Q, side): what you actually pay/receive at size Q.
      //   buy:  ask + ½·slope·Q   (price moves AGAINST a buyer: pays MORE)
      //   sell: bid − ½·slope·Q   (price moves AGAINST a seller: receives LESS)
      // Q beyond capacity => null ("doesn't fit"), never a fabricated fill.
      function landed(k, Q, side) {
        if (side !== 'buy' && side !== 'sell') {
          throw new Error("landed: side must be 'buy' or 'sell', got " + side);
        }
        if (!hasLiquidity || Q > totCap) return null;
        var s = slope(k);
        if (!isFinite(s)) return null;      // no capital ⇒ no price
        return side === 'buy' ? ask(k) + 0.5 * s * Q : bid(k) - 0.5 * s * Q;
      }

      return { totCap: totCap, hasLiquidity: hasLiquidity, hAgg: hAgg,
        mid: mid, midPut: midPut, ask: ask, bid: bid, slope: slope, landed: landed };
    }

    var full = bookFor(makers);
    var notMe = makers.filter(function (m) { return !m.me; });
    var excluded = bookFor(notMe); // computed once; self-exclusion never changes at read time

    // shares(): capᵢ/Σcap over the FULL book (liquidity density / fill routing weight).
    function shares() {
      return makers.map(function (m) {
        return { name: m.name, cap: m.cap, share: full.totCap > 0 ? m.cap / full.totCap : NaN };
      });
    }

    // apportion(Q): pro-rata split of a taker fill of size Q across all makers.
    // Sum equals Q by construction (Σ shareᵢ = 1 exactly, so Σ shareᵢ·Q = Q up
    // to float rounding — verified to ~1e-12 for realistic maker counts in the
    // proof script; see book_model_check.js #3).
    function apportion(Q) {
      return makers.map(function (m) {
        var share = full.totCap > 0 ? m.cap / full.totCap : 0;
        return { name: m.name, qty: share * Q };
      });
    }

    // mark(k, side, excludeMe): the aggregate MID (never ask/bid — a mark is
    // not a trade), your own curve excluded when excludeMe. `side` selects
    // which leg you're marking: 'put' -> midPut, anything else (default) ->
    // mid (call). This mirrors the top-level mid(k)/midPut(k) split — a mark
    // needs to know call vs put, but is never itself a bid/ask.
    // No-counterparty guard (UX_FORMALISM invariant #8): if excluding yourself
    // leaves no liquidity, there is no price — return NaN, never a fabricated one.
    function mark(k, side, excludeMe) {
      var b = excludeMe ? excluded : full;
      if (!b.hasLiquidity) return NaN;
      return side === 'put' ? b.midPut(k) : b.mid(k);
    }

    // closePx(k, side, Q, excludeMe): the price you ACTUALLY get closing size Q
    // — landed(), not mid — with your own curve excluded (own-quote self-dealing
    // is not a market price). `side` is the direction of the CLOSING trade:
    // closing a long -> 'sell', closing a short -> 'buy'. Because landed() moves
    // against the taker on both sides (ask rises, bid falls with size), and mark
    // is the mid the ask/bid straddle, close is ALWAYS worse than mark for the
    // taker: mark - closePx('sell', Q) >= 0 and closePx('buy', Q) - mark >= 0.
    // No-counterparty guard: if excluding yourself leaves nobody, or Q doesn't
    // fit the remaining book, there is no close price — null.
    function closePx(k, side, Q, excludeMe) {
      var b = excludeMe ? excluded : full;
      if (!b.hasLiquidity) return null;
      return b.landed(k, Q, side);
    }

    return {
      mid: full.mid,
      midPut: full.midPut,
      hAgg: full.hAgg,
      ask: full.ask,
      bid: full.bid,
      slope: full.slope,
      capacity: full.totCap,
      landed: full.landed,
      shares: shares,
      apportion: apportion,
      mark: mark,
      closePx: closePx
    };
  }

  var Book = { make: make };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Book; // allows `require('./book.js')` directly in Node tests
  }
  root.Book = Book;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
