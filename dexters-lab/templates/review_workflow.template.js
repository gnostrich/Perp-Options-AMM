// Dexter's Lab deep-review workflow template.
//
// Fill the placeholders below, then paste the whole file into a Claude Code
// Workflow call. Methodology: docs/REVIEW_PIPELINE.md.
//
//   __PAPER_PATH__        absolute path to the document under review (PDF or text)
//   __PAPER_TXT__         absolute path to a plain-text extraction (grep only; "" if none)
//   __OUTDIR__            absolute output dir: <cfg reviews_dir>/<slug>
//   __DOMAIN__            one line, e.g. "AMM mechanism design" or "longevity biology"
//   __VENUE__             target venue or standard, e.g. "a top systems conference"
//   __REPO_ROOT__         absolute path to the dexters-lab repo checkout
//   __PANEL_BUDGET_USD__  hard panel cap, e.g. 8
//   __PANEL_MODELS__      comma-separated model ids from cfg openrouter.panel_models_preference
//
// Confidentiality: OUTDIR lives under lab_home, outside the repo. Nothing
// from the reviewed paper may be written into the repo itself.
//
// Note on syntax: the Workflow runner executes this file as an async function
// body with `phase`, `parallel`, and `agent` injected, so it uses top-level
// await and ends with a `return`. A plain `node --check` therefore needs the
// body wrapped, e.g.:
//   { echo 'export const __check = async () => {'; sed 's/^export //' FILE; \
//     echo '}'; } > /tmp/t.mjs && node --check /tmp/t.mjs

export const meta = {
  name: 'dexters-lab-deep-review',
  description: 'Full-depth adversarial review: extraction, 4-angle attack, heavy open-model verification panel, referee report, completeness critic',
  phases: [
    { title: 'Extract', detail: 'claims ledger + system spec from the document' },
    { title: 'Attack', detail: 'math, domain, novelty, verification audits in parallel' },
    { title: 'Verify', detail: 'open-model panel on load-bearing claims, hard budget' },
    { title: 'Synthesize', detail: 'referee report + VERDICT_SUMMARY.json' },
    { title: 'Critique', detail: 'completeness critic vs the source document' },
  ],
}

const PAPER = '__PAPER_PATH__'
const TXT = '__PAPER_TXT__'
const OUTDIR = '__OUTDIR__'
const DOMAIN = '__DOMAIN__'
const VENUE = '__VENUE__'
const REPO = '__REPO_ROOT__'
const ORTOOL = `${REPO}/bin/lab_openrouter.py`
const PANEL_MODELS = '__PANEL_MODELS__'
const PANEL_BUDGET_USD = Number('__PANEL_BUDGET_USD__') || 8

const COMMON = `You are a reviewer agent in Dexter's Lab performing a full-depth external review. Domain: ${DOMAIN}. Document under review: "${PAPER}" (use the Read tool with page ranges; read ALL pages relevant to your task, including appendices). ${TXT ? `A plain-text extraction (imperfect on math) is at ${TXT} for grep only; read the original pages for any equation that matters.` : ''} Write any working files under ${OUTDIR}/ (mkdir -p first). Your final message is structured data for a synthesis program, so your final action MUST be the structured-output call. Be adversarial but fair: the goal is the truth about this document, not a takedown. No em dashes or en dashes in anything you write to disk.`

const EXTRACT_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    claims: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' }, statement: { type: 'string' }, where: { type: 'string' },
      kind: { type: 'string', description: 'definition|identity|theorem|mechanism|economic|verification|empirical' },
      evidence: { type: 'string', description: 'what backs it: derivation|formal-proof|numerical-example|data|prose|none' },
      load_bearing: { type: 'boolean' } }, required: ['id','statement','where','kind','evidence','load_bearing'] } },
    results_audit: { type: 'string', description: 'Exactly what RESULTS the document has: theorems? simulations? data? cost analyses? only a worked example? Be precise.' },
    notable: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'claims', 'results_audit', 'notable'],
}

const ATTACK_SCHEMA = {
  type: 'object',
  properties: {
    angle: { type: 'string' },
    verdicts: { type: 'array', items: { type: 'object', properties: {
      claim_id: { type: 'string' }, verdict: { type: 'string', description: 'holds|holds-with-caveats|gap|error|cannot-evaluate' },
      reasoning: { type: 'string', description: 'the actual derivation/argument, not a vibe' },
      severity: { type: 'string', description: 'fatal|major|minor|none' } }, required: ['claim_id','verdict','reasoning','severity'] } },
    findings: { type: 'array', items: { type: 'string' }, description: 'issues not tied to one claim' },
    strengths: { type: 'array', items: { type: 'string' } },
    questions_for_authors: { type: 'array', items: { type: 'string' } },
  },
  required: ['angle', 'verdicts', 'findings', 'strengths', 'questions_for_authors'],
}

phase('Extract')
const [claims, mech] = await parallel([
  () => agent(`${COMMON}
TASK: build the complete claims ledger. Read the ENTIRE document including appendices. Enumerate every distinct technical claim: definitions that do real work, identities, theorems, mechanism or system rules, applied/economic assertions, formal-verification claims, empirical claims. For each: id C1..Cn, exact statement (faithful paraphrase), where (section/page), kind, what evidence backs it, load_bearing flag. In results_audit state precisely what results exist: any empirical/simulation/cost/comparison data, or only derivations plus a worked example? In notable: anything odd (anonymity breadcrumbs, names that deanonymize, missing sections, ordering quirks, notation problems).`,
    { label: 'extract:claims', phase: 'Extract', schema: EXTRACT_SCHEMA }),
  () => agent(`${COMMON}
TASK: reconstruct the system precisely enough that attackers can work without re-reading the document. Read all pages. Produce in summary a dense but COMPLETE spec: the objects and their definitions, the governing equations or rules, every update/transition rule with exact formulas, the lifecycle of the core object, any closed-form results with their stated checks, and the exact wording of any formal-verification claims (read that section verbatim and quote it in notable). Put the numbers of any worked example in notable too. claims field: the 5-8 equations or rules that everything rests on, as claims with kind=identity. results_audit: one sentence.`,
    { label: 'extract:system-spec', phase: 'Extract', schema: EXTRACT_SCHEMA }),
])

const CONTEXT = JSON.stringify({ claims_ledger: claims, system_spec: mech })

phase('Attack')
const attacks = await parallel([
  () => agent(`${COMMON}
EXTRACTED CONTEXT:
${CONTEXT}
ANGLE: formal/mathematical re-derivation. Re-derive every load-bearing identity and theorem yourself, by hand and with a CAS if available (try \`python3 -c "import sympy"\`; if absent, do explicit hand algebra and say so). At minimum: (1) substitute the stated update rules into every claimed invariant and simplify fully; never accept "by construction"; (2) verify every closed-form result on the document's own worked example, recomputing the numbers; (3) run every dimensional or sanity check the document claims; (4) for any biconditional or iff claim, derive both directions and recheck any counterexample arithmetic; (5) flag anything that only holds under unstated assumptions (a parameter held constant during an update, no fees/friction, continuity, sign conditions, domain restrictions, poles). Where the text extraction mangles math, read the original pages. Save any scripts you write as ${OUTDIR}/verify_*.py. Verdict per claim with the algebra in reasoning.`,
    { label: 'attack:math', phase: 'Attack', schema: ATTACK_SCHEMA }),
  () => agent(`${COMMON}
EXTRACTED CONTEXT:
${CONTEXT}
ANGLE: domain mechanism attack (${DOMAIN}). Ask: would this survive contact with its real environment? Attack systematically: (1) adversaries: who can game the mechanism and how (manipulation, wash behavior, last-mover dynamics, input/oracle poisoning); (2) counterparties: who bleeds when the system is mispriced or miscalibrated; is participating ever rational for each role; what is each role's payoff profile; (3) external benchmarks: internal consistency is not external correctness; compare against the external market, ground truth, or the incumbent systems this document criticizes; (4) omitted operational realities: costs, discreteness, latency, fees, failure modes; (5) parameter governance: who moves the free parameters, and can a participant move them adversarially. Use WebSearch/WebFetch (load via ToolSearch if needed) for the external literature that makes comparisons concrete. Verdicts tied to claim ids where possible.`,
    { label: 'attack:domain', phase: 'Attack', schema: ATTACK_SCHEMA }),
  () => agent(`${COMMON}
EXTRACTED CONTEXT:
${CONTEXT}
ANGLE: novelty and prior art. Use WebSearch + WebFetch extensively (load via ToolSearch if needed). Establish the closest 5-8 prior works and the genuine delta. Procedure: (1) search each contribution claim's key phrases, plus adjacent framings the authors might not cite; (2) search recent years of ${VENUE} and neighboring venues for the same topic; (3) if the document claims formal verification, search how prior work in this field handles mechanized proofs, to judge whether that angle is itself novel; (4) double-blind integrity: search project names, filenames, artifact links, or distinctive phrasing that could deanonymize the authors; (5) for each prior work: what it does, the exact overlap, what this document adds beyond it. Write the full dossier with URLs to ${OUTDIR}/prior_art_dossier.md. Verdict per contribution claim: novel | incremental | known.`,
    { label: 'attack:novelty', phase: 'Attack', schema: ATTACK_SCHEMA }),
  () => agent(`${COMMON}
EXTRACTED CONTEXT:
${CONTEXT}
ANGLE: formal verification + results standards. Part 1, verification claims (skip if none): read the verification statements word by word from the original pages. Determine exactly which statements are formalized; what they quantify over; whether the formalization covers the system's DYNAMICS or only static algebraic identities; whether the artifact is available and checkable by a reviewer at all; and state precisely what is and is not certified (a machine-checked identity proves the algebra, not the semantics around it). Part 2, results standards: ${VENUE} sets the bar; audit what a program-committee member there expects vs what exists: simulations, real-data evaluation, cost/implementation analysis, comparison vs incumbents, ablations, incentive analysis. Confirm or refute each absence by reading the document, and rate how fatal each absence is for this venue. Also audit the limitations section: what the authors concede, and what known issue is missing from it.`,
    { label: 'attack:verification', phase: 'Attack', schema: ATTACK_SCHEMA }),
])

const ATTACKS = JSON.stringify(attacks.filter(Boolean))

phase('Verify')
const panel = await agent(`${COMMON}
EXTRACTED CONTEXT:
${CONTEXT.slice(0, 60000)}
ATTACK VERDICT DIGEST (verdicts only, for claim selection):
${JSON.stringify((attacks.filter(Boolean)).map(a => ({ angle: a.angle, verdicts: a.verdicts }))).slice(0, 40000)}
TASK: run the heavy open-model verification panel end-to-end, under a HARD budget of ${PANEL_BUDGET_USD} USD. Work in ${OUTDIR}/panel/ (mkdir -p first).
PRECHECK: the OpenRouter client is ${ORTOOL}. If it does not exist, or its API key env var (see openrouter.api_key_env in the lab config; resolve config via ${REPO}/lib/labconfig.py) is unset, do NOT fail: write ${OUTDIR}/panel/SKIPPED.md explaining why, and return an empty panel_table with total_cost_usd 0 and the skip reason in adjudication.
STEPS: (1) Select 3-6 claims: load_bearing, contested or fatal-if-wrong, checkable from a self-contained statement. Label them claimA, claimB, ... (2) For each, write ${OUTDIR}/panel/prompt_claimX.txt: a self-contained prompt with the minimal system context, the exact claim, and the instruction to recompute everything independently; end every prompt with exactly: "End your answer with exactly two lines:\\nVERDICT: VERIFIED | REFUTED | INCONCLUSIVE\\nCONFIDENCE: <integer 0-100>". (3) BEFORE launching any call, write ${OUTDIR}/panel/lab_baseline.json: {"claimX": {"title", "lab_verdict", "expected_panel_if_agree"}} from the attack results. (4) Write ${OUTDIR}/panel/run_panel.sh: for each claim x each model in [${PANEL_MODELS}], call ${ORTOOL} ask <model> --max-tokens 12000 < prompt_claimX.txt > claimX__<model slug, / replaced by _>.txt 2> claimX__<slug>.cost.json; skip outputs that already exist non-empty; launch in parallel; wait. Run it. (5) Write ${OUTDIR}/panel/parse_panel.py: regex VERDICT and CONFIDENCE from every claim*__*.txt; tolerate markdown bold; skip menu-echo lines (two or more verdict words on one line); sum cost_usd across all .cost.json. Run it. (6) For unparsed outputs, read that file's TAIL only and judge the verdict from its conclusion (mark parsed_by=human). (7) For truncated (finish_reason length) or missing outputs, retry JUST those as claimX__<slug>__retry.txt with a higher --max-tokens, ONLY while summed cost stays under ${PANEL_BUDGET_USD} USD. (8) Append one JSON line per call ({ts, model, claim, cost_usd}) to the lab spend ledger (budget.spend_ledger in the lab config). (9) Build the panel table, list panel-vs-baseline disagreements, adjudicate each split with one short argument.
Do NOT re-read the document under review. Do NOT load whole model outputs into context when the verdict line suffices (grep first). Your final action MUST be the structured-output call.`,
  { label: 'verify:open-model-panel', phase: 'Verify', schema: {
    type: 'object', properties: {
      panel_table: { type: 'array', items: { type: 'object', properties: {
        claim_id: { type: 'string' }, model: { type: 'string' }, verdict: { type: 'string' },
        confidence: { type: 'number' }, key_argument: { type: 'string' } },
        required: ['claim_id','model','verdict','confidence','key_argument'] } },
      total_cost_usd: { type: 'number' },
      disagreements: { type: 'array', items: { type: 'string' } },
      adjudication: { type: 'string' },
    }, required: ['panel_table','total_cost_usd','disagreements','adjudication'] } })

phase('Synthesize')
const report = await agent(`${COMMON}
You are the senior program-committee member writing the consolidated referee report. INPUTS:
CLAIMS LEDGER + SYSTEM SPEC: ${CONTEXT.slice(0, 110000)}
ATTACK RESULTS: ${ATTACKS.slice(0, 140000)}
HEAVY PANEL: ${JSON.stringify(panel)}
(Reminder: after writing the two files, your final action MUST be the structured-output call.)
Write ${OUTDIR}/REFEREE_REPORT.md, a ${VENUE} program-committee style review, honest and specific:
1. Summary (one paragraph, fair).
2. What the document actually delivers (results audit, per the extractors).
3. Soundness: per-claim verdict table (claim, internal verdict, panel verdict, final), then prose on the real problems found, with the derivations that matter inlined briefly.
4. Novelty: the closest prior art with names and years, and the genuine delta, or lack of it.
5. Significance: would this survive its real environment; the strongest objections.
6. Formal verification: what it certifies and what it does not (omit if no such claim).
7. Recommendation: accept / weak accept / weak reject / reject, with confidence (1-5) and the 3 changes that would most improve the document.
8. Questions for authors (merged, deduplicated, ranked).
Writing rules: no em dashes, no en dashes, short sentences, every quantitative statement traceable to an attack or panel finding. If the panel was skipped, say so explicitly in section 3.
Also write ${OUTDIR}/VERDICT_SUMMARY.json with exactly these keys: {recommendation, confidence, soundness_verdicts: {claim_id: final_verdict}, fatal_issues: [], major_issues: [], novelty_verdict, panel_cost_usd, reconciliation_note}.
Return: the recommendation, confidence, top 5 findings, and both file paths.`,
  { label: 'synth:referee-report', phase: 'Synthesize', schema: {
    type: 'object', properties: {
      recommendation: { type: 'string' }, confidence: { type: 'number' },
      top_findings: { type: 'array', items: { type: 'string' } },
      files: { type: 'array', items: { type: 'string' } },
      one_paragraph_verdict: { type: 'string' },
    }, required: ['recommendation','confidence','top_findings','files','one_paragraph_verdict'] } })

phase('Critique')
const critic = await agent(`${COMMON}
You are the completeness critic. The referee report is at ${OUTDIR}/REFEREE_REPORT.md (read it) and the verdict summary at ${OUTDIR}/VERDICT_SUMMARY.json. Spot-check both against the source document directly: (1) re-read the document's worked example and ONE disputed derivation yourself; does the report describe them accurately? (2) is any section of the document (especially limitations, related work, appendices) not covered by any reviewer? (3) are any report claims about the document unsupported by the actual source text (misquotes, invented page references)? (4) does the recommendation follow from the listed issues, or is there a verdict-severity mismatch? (5) steelman check: is there a reading under which a flagged issue is actually fine? Write your notes to ${OUTDIR}/CRITIC_NOTES.md. Return missing, weak_or_unverified, contradictions, verdict (one paragraph: is this review publishable to the authors as-is). Your final action MUST be the structured-output call.`,
  { label: 'critic:review-qa', phase: 'Critique', schema: {
    type: 'object', properties: {
      missing: { type: 'array', items: { type: 'string' } },
      weak_or_unverified: { type: 'array', items: { type: 'string' } },
      contradictions: { type: 'array', items: { type: 'string' } },
      verdict: { type: 'string' },
    }, required: ['missing','weak_or_unverified','contradictions','verdict'] } })

return { extraction: { claims, mech }, attacks, panel, report, critic }
