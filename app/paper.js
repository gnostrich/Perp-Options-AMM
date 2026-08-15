/* PAPER WALLET — closed-network test money (operator entry 598).
   Lifted in shape from the reference's own design, which already solved this:
     perp-backend-staging/paper/models.go  — "closed-system paper-trading wallet …
     Every participant is seeded $1,000,000 paper USD; balances/positions live in
     the DB, real market data is kept, and real on-chain/Hyperliquid execution is
     bypassed."
     perp-backend-staging/execmode/execmode.go — EXECUTION_MODE=paper|live, so
     paper bypasses EXECUTION while market DATA stays real.
   Same idea here: prices, curves and impact are the real engine; only settlement
   is paper. The reason tags are the reference's vocabulary verbatim so a later
   backend can adopt this ledger without a translation layer. */
(function (root) {
  'use strict';

  var SEED_USD = 1000000;                       // reference: paper.SeedUSD

  var REASON = {                                // reference: paper.Reason
    SEED: 'seed', PERP_MARGIN: 'perp_margin', LP_DEPOSIT: 'lp_deposit',
    SETTLEMENT: 'settlement', HEDGE_FILL: 'hedge_fill', WITHDRAW: 'withdraw',
    LP_FEE: 'lp_fee', FAUCET: 'faucet'
  };

  function create(opts) {
    opts = opts || {};
    var seed = opts.seedUSD == null ? SEED_USD : opts.seedUSD;
    var accounts = {};                          // id -> {id, name, balanceUSD}
    var entries = [];                           // append-only, newest last
    var seq = 0;

    function touch(id, name) {
      if (!accounts[id]) {
        accounts[id] = { id: id, name: name || id, balanceUSD: 0 };
        move(id, seed, REASON.SEED, null, 'seeded on first touch');
      }
      return accounts[id];
    }

    // The ONLY way a balance changes. balanceUSD is the running sum of the
    // ledger, moved with the entry — never set independently, so the two cannot
    // drift (the reference calls this "materialized running sum … moved
    // transactionally with each debit/credit").
    function move(id, usd, reason, ref, note) {
      if (!accounts[id]) accounts[id] = { id: id, name: id, balanceUSD: 0 };
      if (!isFinite(usd)) return { ok: false, reason: 'amount must be a number' };
      var a = accounts[id];
      if (usd < 0 && a.balanceUSD + usd < -1e-9) {
        return { ok: false, reason: 'insufficient paper balance: has $' +
          a.balanceUSD.toFixed(2) + ', needs $' + Math.abs(usd).toFixed(2) };
      }
      a.balanceUSD += usd;
      entries.push({ seq: ++seq, at: Date.now(), accountId: id, amountUSD: usd,
                     reason: reason || 'unspecified', ref: ref || null,
                     note: note || '', balanceAfter: a.balanceUSD });
      return { ok: true, balanceUSD: a.balanceUSD };
    }

    function faucet(id, usd) {
      touch(id);
      return move(id, usd == null ? seed : usd, REASON.FAUCET, null, 'test money');
    }

    function balance(id) { return touch(id).balanceUSD; }
    function ledger(id) { return id ? entries.filter(function (e) { return e.accountId === id; }) : entries.slice(); }
    function list() { return Object.keys(accounts).map(function (k) { return accounts[k]; }); }

    // Closed-network check: in a closed system nothing is created or destroyed by
    // trading — only by seed/faucet/withdraw. So the sum of all balances must
    // equal the sum of everything that entered or left. If a settlement leaks,
    // this is where it shows.
    function conserved() {
      var bal = list().reduce(function (t, a) { return t + a.balanceUSD; }, 0);
      var ext = entries.filter(function (e) {
        return e.reason === REASON.SEED || e.reason === REASON.FAUCET || e.reason === REASON.WITHDRAW;
      }).reduce(function (t, e) { return t + e.amountUSD; }, 0);
      return { balances: bal, external: ext, drift: bal - ext, ok: Math.abs(bal - ext) < 1e-6 };
    }

    // A settlement between two participants: one pays, one receives, same amount.
    // Written as one call so a closed-network transfer cannot be half-applied.
    function settle(fromId, toId, usd, ref, note) {
      touch(fromId); touch(toId);
      if (usd < 0) { var t = fromId; fromId = toId; toId = t; usd = -usd; }
      var d = move(fromId, -usd, REASON.SETTLEMENT, ref, note || 'paid');
      if (!d.ok) return d;
      return move(toId, usd, REASON.SETTLEMENT, ref, note || 'received');
    }

    return { REASON: REASON, seedUSD: seed, touch: touch, move: move, faucet: faucet,
             balance: balance, ledger: ledger, list: list, settle: settle, conserved: conserved };
  }

  var Paper = { create: create, SEED_USD: SEED_USD, REASON: REASON };
  if (typeof module !== 'undefined' && module.exports) module.exports = Paper;
  root.Paper = Paper;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
