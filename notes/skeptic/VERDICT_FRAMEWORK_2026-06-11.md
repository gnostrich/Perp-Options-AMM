# SKEPTIC VERDICT #8 — `framework/FRAMEWORK_curve_agnostic_2026-06-11.md` (commit 212d3e0)

_run-9, 2026-06-11. Charter pass: completeness audit vs `docs/feature_inventory.md`, steelman of
exclusions, attack on the strongest claim (AC-2), audit of the manager's hand-verification.
All numerics below re-run by me (mpmath dps=30, `/tmp/skeptic_run9.py`); all quotes checked
against `history/operator/2026-06-11_curve-agnostic-framework-brainstorm.md` and the paper._

## TLDR
**PASS-WITH-FLAGS — 3 narrow standing flags, all corrigendum-sized; the core result survived
every attack I ran.** The AC-2 joint characterization (ε′(mark)=−½, i.e. weight ½ with slope
−1/8) is real: I re-derived all six legs by hand and reproduced every quoted number, several to
all printed figures. The flags: (1) the germ-cascade digits scale as the CUBE of the step, not
the claimed du², and their measurand formula is missing; (2) the headline "iff" is derived for
trades AT the mark only, while AC-1's own trade set (and paper L41–43) includes trades at other
strike points — sufficiency there is unexamined and the headline carries no qualifier; (3) the
AC-2.5 operator menu omits the singular-warp escape the note itself admits is open. Inventory
disposition is 16/16 with no silent absences — first artifact to clear my table gate in full.

## Verdict list
| Section | Verdict |
|---|---|
| §1 spine | PASS (FW-8 lift honestly an obligation, not a claim) |
| AC-1 warp principle | PASS — attacked and held (see numerics) |
| AC-2 joint characterization | PASS-WITH-FLAGS 1, 2, 3 |
| AC-3 budget | PASS (entry-5 quote character-exact; watch-note on "δ=τ" wording) |
| AC-4 LDF | PASS (adopts LDF note as corrected; height-residue honest) |
| AC-5 funding | PASS (F5 anchor-existence = my forced column, credited; F3 honest OPEN) |
| AC-6 re-pricing | PASS (expiry-ban honored; live-S* propagation fact is a genuine catch) |
| AC-7 solvency | PASS (my run-3 conditions honored; NOT carried as settled; B1 stays extrinsic) |
| AC-8 manipulation | PASS (X1 = my intrinsic floor, adopted; X2 J-leg-is-free observation is true and sharp) |
| AC-9 engine pipe | PASS (gotcha promoted to API deliverable — right move) |
| AC-10 composition map | PASS (opens (a)–(d) all dispositioned, held open, no smuggling) |
| §12–§13 obligations/gates | PASS (stated-not-submitted, honest) |
| §14 inventory | PASS — 16/16, no silent absences |
| §15 flags/escalations | PASS except the AC-2.5 relay inherits flags 2+3 |
| **Overall** | **PASS-WITH-FLAGS (3 narrow, standing per CLAUDE.md §2.1)** |

## The flags

**FLAG-OVERSELL (narrow) — germ-cascade scaling label contradicts its own digits; measurand
formula missing.** AC-2 claims the translating linear-germ family has "per-step residuals scaling
as du² (1.668e−10 → 1.667e−13 → 1.667e−16 as the step drops 10×)". Those digits fall 1000× per
decade — cubic, not quadratic. I reconstructed the measurand that reproduces them exactly:
[re-anchored germ slope at the OLD point] − [frozen slope field at the token-faithful NEW point],
steps h = Δy/y ∈ {1e−3, 1e−4, 1e−5}; law R = h³/6 + h⁴/6 (= du³/48 in du = 2h units). My values:
1.668336e−10, 1.666833e−13, 1.666683e−16 — all three of the note's digits, to six figures. The
note's preamble promises "every quoted number is restated with its formula here"; this one is
not (I had to reverse-engineer the convention). The conclusion is UNAFFECTED — cubic beats
quadratic, and under my stricter slide-destination convention the residual is cleanly O(h²)
(2.505e−7 → 2.501e−9 → 2.500e−11, ratio 100), so integral-limit exactness stands either way;
mode residual exactly 0 confirmed. Fix = one corrected sentence + the measurand formula.

**FLAG-OVERSELL (narrow, scope) — the headline iff is proved for trades at the mark; AC-1's own
trade set is wider, and the headline does not say so.** The derivation self-scopes mid-paragraph
("Trade at the mark, mode holding pre-trade") but §0, §AC-2.5, inventory row 16, and the commit
message all state the unqualified "can hold together iff ε′(mark) = −½". AC-1 defines the trade
point as "q (= strike ray ∩ curve; = p for spot)", and the paper (L41–43, verified) makes the
off-mark trade the product's primitive: "Trades happen anywhere on the curve… treated as if that
trade point were the reserves point." For q ≠ p, transport binds at q and mode binds at the mark
p — two different points; the characterization says nothing about that case. NECESSITY survives
(spot trades are always available, so ε′(mark)=−½ stays forced, and "symmetric genesis excluded"
stays true); what is scope-limited is SUFFICIENCY — "the germ family satisfies BOTH contracts"
is verified for spot-trade sequences only. Either the warp world has q=p always (then AC-1's
parenthetical is decoration and the paper's anywhere-on-the-curve layer is silently dropped) or
q≠p trades exist (then the off-mark joint contract is an open the note must name). One scope
sentence in the note plus, if needed, one operator sentence — it is his mechanic.

**FLAG-OMISSION (narrow) — AC-2.5's menu omits the option its own text leaves open.** The note
admits "singular warps (update kernel with structure at scale du) evade the necessity only by
blowing up curvature as trades shrink", then offers the operator exactly three options — (a)
frozen-germ/tilted genesis, (b) approximate mode, (c) selector-only — all inside the regular
class. Option (d), examine/accept the singular class, is neither offered nor closed by argument.
Steelman for (d): a curve carrying a genuine peak structure at the mark is not obviously
pathological (the note's own AC-4 names plain Balancer's thickness-LDF as a Laplace tent). My
own sketch says a standing FINITE corner fails transport+mode anyway (transport forces the new
left-branch slope at the old mark below the ray, un-peaking the new corner) — but that argument
is mine and unpublished; the note cannot silently lean on it. Either close (d) with an argument
or list it. The relay to the operator inherits this and flag 2.

## Attack record (what I tried that FAILED — the PASS evidence)
- **Re-derived by hand, all six legs of the headline:** reading-1 transport ⇒ A(mark)=ε′+1;
  mode-at-new-mark ⇒ A(mark)=−ε′; jointly ε′(mark)=−½; ε=w/(1−w) ⇒ (w,w′)=(½,−1/8); validity
  −1/8 > −¼; violation rate (2ε′+1)du; reading-2 ⇒ A(mark)=0 ⇒ ε′=0. All confirm the note and
  the manager's hand derivation.
- **Direction-independence (du<0) is real:** linear in du; measured sell-side mismatch
  coefficient −3.666630 vs buy −3.666703 (√-sigmoid, equal to O(du)).
- **√-sigmoid kill:** mismatch −7.333407e−05 reproduced to all seven quoted figures (predicted
  −(4Δw/τ+1)du = −7.333333e−05); sign-locked zero at Δw=−τ/4 reproduced (−4.428e−14 vs note's
  −4.4e−14). Internal consistency: the locked profile has w′(0)=Δw/(2τ)=−1/8 — exactly the germ.
- **tanh+Gaussian-notch instance:** w′(0)=−0.125 exact; min[w′+w(1−w)] over ũ∈[−6,6] (24001-pt
  grid) = 0.125000000000 at ũ=0; w∈[0.400000,0.600000]; wings 0.6/0.4. All claims hold.
- **AC-1 "α,β-conservation IS the slope-transport law [DERIVED]":** confirmed SYMBOLICALLY at
  generic (x,y,w) — transport forces dw=(1−w)dy/y, which gives dα=dβ=0 identically, and
  conversely; dw integrates to the paper's exact Δw=βΔy/(y·y′). Numerically at the asymmetric
  state (80,150,0.3): α,β drift ≤1.3e−29; transport residual falls exactly 100× per Δy decade
  (O(Δy²) ⇒ exact in the integral limit). Note: the note scopes this [DERIVED] to the Balancer
  foliation (other families' first integrals stay OPEN at AC-10c) — correctly.
- **Violation rate:** (ε_new−1)/du = 1.000001 at Δy=1e−4, as quoted. Bonus: the constant-weight
  law is EXACTLY dε = ε·du (ε(du)=e^{du}; e^{ln1.2}=1.2 exact) — the note's "to first order" is
  conservative, not oversold. FW-4 instance (α/β)(y′/x′)=1.2, slope 1.44 vs ray 1.2 confirmed.
- **Steelman "frozen germ kills the skew channel" — DISSOLVED by the note's own point 3:** the
  germ pins only the 2-jet at the mark; wing deformations with B(mark)=0 preserve both contracts
  at first order (I checked), so skew legitimately lives in the wings; AC-10a holds the dial open.
- **Provenance:** T2 84a6a417 and T1a 3566d93c verified in `formal/aristotle_runs/RESULTS.md`
  (both proved/trusted-from-prover, GROUNDED); PH3_grounded/PH4b(CARRIED)/PH6/B1(CARRIED)/R2/R5/
  C3 match `formal/INDEX.md` including the carried-hypothesis nuances; entry-2/3/5/7 [RULED]
  quotes character-exact vs the transcript; paper L27/L33/L39/L75–91 cites exact — L39 verbatim
  supports reading 1 as the paper's. Go-ahead = entry 9, honest. TLDR-first: compliant.

## Audit of the manager's verification
The manager's six hand-derived AC-2 legs all check out independently — no narration, actual
re-derivation. The NOT-re-run list was disclosed honestly, and the defects I found sit exactly
inside that disclosed zone (the numerics) — the disclosed-unverified zone is where the slips
live; the disclosure habit is improving (second counter-datum to pattern 2). Two trivial framing
slips in the task, neither consequential: my Balancer-instance verification was run-5 not run-6,
and the note does NOT claim α,β⟺transport "generally" — it scopes it to the Balancer foliation.
This verdict is #8 by my ledger (the task said #9; runs ≠ verdicts).

## Watch-notes (no flags)
- AC-3's pinned-slice wording "δ=τ" is budget-slot assignment, not the broken τ≡δ curve identity
  (the note elsewhere honors the broken bridge explicitly) — but the notation invites misreading;
  deliverable B should say "δ fills the τ slot".
- Carry-P per family is thin: the gauge layer says "P = Ny/Nx-analogue" and AC-9 demands a sNorm,
  but no NG checks that a candidate's carry P is well-defined. Watch at deliverable B.
- Run-7 standing flags VERIFIED FIXED on disk this run (CLAUDE.md §8 now maps framework/+curves/;
  framework/README scope sentence restated) — both stood down.

## Standing effect (CLAUDE.md §2.1)
Flags 1–3 are narrow but standing: do not encode the unqualified iff into shared truth; do not
relay §AC-2.5 without the spot-trade scope qualifier and either option (d) or its closure; fix
the cascade sentence and state the measurand. Corrigenda on file (LDF-note pattern) satisfy me.
