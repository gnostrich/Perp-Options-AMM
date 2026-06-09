# Summary of changes for run 0f1cf133-d95f-4d25-ac3a-f974128b5e3f
All four theorems in `RequestProject/CourantAll4.lean` are fully proved with no sorry, admit, native_decide, opaque, unsafe, or live search tactics (exact?/grind/aesop?):

1. **`courant_on_graph`** — The pairing identity for any matrix A: the Courant pairing on graph(A) equals (Av)·w + (Aw)·v. Proved by `rfl` (definitional equality).

2. **`graph_skew_isotropic`** — The pure skew-symmetric J = !![0,1;-1,0] case: graph(J) IS isotropic for the Courant pairing (recovers the RUN-4 Dirac result). Proved via `courant_on_graph` + `norm_num` + `ring`.

3. **`graph_symmetric_not_isotropic`** — The obstruction for symmetric matrices: for R = !![r,0;0,0] with r ≠ 0, graph(R) is NOT isotropic. Proved by unfolding and `norm_num`/`aesop`.

4. **`dissipation_breaks_isotropy`** — The NO-GO theorem: for A = J − R with J skew and R = !![r,0;0,0] symmetric nonzero, graph(J−R) is NOT an isotropic (Dirac) subspace. Witnesses are provided and the nonzero pairing is computed explicitly. The obstruction statement is not weakened.

All proofs depend only on the standard axioms: `propext`, `Classical.choice`, `Quot.sound`. The `#print axioms` commands are included at the end of the file confirming this.