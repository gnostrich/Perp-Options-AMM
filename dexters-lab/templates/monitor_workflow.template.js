// Dexter's Lab post-publication monitor workflow template.
//
// Fill the placeholders below, then paste the whole file into a Claude Code
// Workflow call. This is the interactive twin of bin/lab_monitor.sh: it
// re-attacks your OWN published claims, fans out N adversarial attackers (plus
// an optional heavy open-model panel), emits ONE normalized adversarial-attack
// report, then tells you the one command that routes new findings to the
// errata queue. Methodology: docs/GOVERNANCE.md (errata section).
//
//   __CLAIMS_SOURCE__     absolute path to your published claims: a CLAIMS.md
//                         file or a paper/ directory to read claims from
//   __OUTDIR__            absolute output dir: <cfg reviews_dir>/monitor
//   __REPORT_DATE__       report date stamp, e.g. 2026-06-13 (file is <date>.md)
//   __DOMAIN__            one line, e.g. "AMM mechanism design" or "longevity biology"
//   __REPO_ROOT__         absolute path to the dexters-lab repo checkout
//   __N_ATTACKERS__       how many adversarial attackers to fan out (e.g. 3)
//   __PANEL_BUDGET_USD__  hard cap for the optional open-model panel, e.g. 4 (0 = skip)
//   __PANEL_MODELS__      comma-separated model ids from cfg openrouter.panel_models_preference
//
// Confidentiality: OUTDIR lives under lab_home, outside the repo. The report
// names your published claims and their challenges; write nothing into the repo.
//
// Note on syntax: the Workflow runner executes this file as an async function
// body with `phase`, `parallel`, and `agent` injected, so it uses top-level
// await and ends with a `return`. A plain `node --check` therefore needs the
// body wrapped, e.g.:
//   { echo 'export const __check = async () => {'; sed 's/^export //' FILE; \
//     echo '}'; } > /tmp/t.mjs && node --check /tmp/t.mjs

export const meta = {
  name: 'dexters-lab-post-pub-monitor',
  description: 'Nightly re-attack on your OWN published claims: fan-out adversarial attackers, optional open-model panel, one normalized report, then triage to the errata queue',
  phases: [
    { title: 'Load', detail: 'enumerate the published claims to re-attack' },
    { title: 'Attack', detail: 'N adversarial attackers: soundness, novelty/prior-art, new evidence' },
    { title: 'Panel', detail: 'optional heavy open-model panel on contested claims, hard budget' },
    { title: 'Report', detail: 'one normalized adversarial-attack report for lab_triage.py' },
  ],
}

const CLAIMS_SOURCE = '__CLAIMS_SOURCE__'
const OUTDIR = '__OUTDIR__'
const REPORT_DATE = '__REPORT_DATE__'
const DOMAIN = '__DOMAIN__'
const REPO = '__REPO_ROOT__'
const ORTOOL = `${REPO}/bin/lab_openrouter.py`
const TRIAGE = `${REPO}/bin/lab_triage.py`
const REPORT_PATH = `${OUTDIR}/${REPORT_DATE}.md`
const N_ATTACKERS = Number('__N_ATTACKERS__') || 3
const PANEL_MODELS = '__PANEL_MODELS__'
const PANEL_BUDGET_USD = Number('__PANEL_BUDGET_USD__') || 0

const COMMON = `You are an adversarial monitor agent in Dexter's Lab re-attacking the lab's OWN already-published claims. Domain: ${DOMAIN}. The published claims live at: "${CLAIMS_SOURCE}" (use the Read/Glob/Grep tools; if it is a directory, read CLAIMS.md if present, else the paper's main source). These claims are ALREADY PUBLISHED. Do NOT edit, move, or touch the original; read only. Write any working files under ${OUTDIR}/ (mkdir -p first). Be adversarial but fair: the goal is the truth about the published claims, not a takedown. No em dashes or en dashes in anything you write to disk. Your final action MUST be the structured-output call.`

// One normalized finding. claim_status mirrors the heading verdict.
const FINDING_SCHEMA = {
  type: 'object',
  properties: {
    angle: { type: 'string' },
    findings: { type: 'array', items: { type: 'object', properties: {
      claim_id: { type: 'string', description: 'C1..Cn from the published claims' },
      claim: { type: 'string', description: 'the published claim, faithful paraphrase' },
      category: { type: 'string', description: 'soundness|novelty|prior-art|new-evidence|attribution' },
      claim_status: { type: 'string', description: 'upheld|weakened|refuted' },
      confidence: { type: 'number', description: '0 to 1' },
      reasoning: { type: 'string', description: 'the actual argument or derivation' },
      evidence: { type: 'array', items: { type: 'string' }, description: 'each with a URL where applicable' },
      citations: { type: 'array', items: { type: 'string' }, description: 'source URLs you actually fetched' },
    }, required: ['claim_id', 'claim', 'category', 'claim_status', 'confidence', 'reasoning', 'evidence', 'citations'] } },
  },
  required: ['angle', 'findings'],
}

phase('Load')
const ledger = await agent(`${COMMON}
TASK: enumerate the published claims to re-attack. Read the claims source in full. Produce a complete list: id C1..Cn, the exact published statement (faithful paraphrase), where it appears, and whether it is load-bearing. This is the shared target the attackers work against; be precise.`,
  { label: 'load:claims', phase: 'Load', schema: {
    type: 'object', properties: {
      claims: { type: 'array', items: { type: 'object', properties: {
        id: { type: 'string' }, statement: { type: 'string' },
        where: { type: 'string' }, load_bearing: { type: 'boolean' } },
        required: ['id', 'statement', 'where', 'load_bearing'] } },
    }, required: ['claims'] } })

const CLAIMS = JSON.stringify(ledger)

phase('Attack')
// Three standing angles; if N_ATTACKERS asks for more, the extra attackers
// repeat the new-evidence sweep with different search framings.
const ANGLES = [
  `ANGLE: soundness re-check. Re-derive or re-verify every load-bearing claim yourself today. Substitute the stated assumptions, recompute any worked example, run every sanity check the claim relies on. Flag anything that only holds under an unstated assumption. Use a CAS if available (try \`python3 -c "import sympy"\`). Save any scripts as ${OUTDIR}/verify_*.py.`,
  `ANGLE: novelty and prior art. Use WebSearch + WebFetch extensively (load via ToolSearch if needed). For each contribution claim, search its key phrases plus adjacent framings the authors might not have cited. Look hard for prior or concurrent work that anticipates the claim, and for any ATTRIBUTION the publication missed. A one-day-late prior-art or attribution catch is the entire point of this loop. Write the dossier with URLs to ${OUTDIR}/prior_art_dossier.md.`,
  `ANGLE: new evidence since publication. Use WebSearch + WebFetch to find results published AFTER the claim that weaken or refute it: failed replications, corrections, retractions, stronger counter-results. For each, tie it to the specific claim id it threatens.`,
]
const attackerSpecs = []
for (let i = 0; i < N_ATTACKERS; i++) {
  const angle = ANGLES[i] || `${ANGLES[2]} Use search framings distinct from the other attackers (different keywords, venues, and time windows) so coverage is broad.`
  attackerSpecs.push(() => agent(`${COMMON}
PUBLISHED CLAIMS:
${CLAIMS}
${angle}
Return one finding per claim you have something to say about. claim_status is upheld unless you hold evidence to weaken or refute. confidence is 0 to 1. Never fabricate a citation, a URL, or a finding: an honest "upheld, no new evidence" beats an invented attack.`,
    { label: `attack:${i}`, phase: 'Attack', schema: FINDING_SCHEMA }))
}
const attacks = await parallel(attackerSpecs)
const ATTACKS = JSON.stringify(attacks.filter(Boolean))

phase('Panel')
let panel = { panel_table: [], total_cost_usd: 0, note: 'panel skipped (budget 0)' }
if (PANEL_BUDGET_USD > 0) {
  panel = await agent(`${COMMON}
PUBLISHED CLAIMS:
${CLAIMS.slice(0, 40000)}
ATTACK FINDINGS DIGEST:
${ATTACKS.slice(0, 40000)}
TASK: run a heavy open-model panel on the CONTESTED claims only (any claim some attacker marked weakened or refuted), under a HARD budget of ${PANEL_BUDGET_USD} USD. Work in ${OUTDIR}/panel/ (mkdir -p first).
PRECHECK: the OpenRouter client is ${ORTOOL}. If it does not exist, or its API key env var (see openrouter.api_key_env in the lab config; resolve config via ${REPO}/lib/labconfig.py) is unset, do NOT fail: write ${OUTDIR}/panel/SKIPPED.md explaining why and return an empty panel_table with total_cost_usd 0.
STEPS: (1) Select up to 4 contested, self-contained claims; label them claimA, claimB, ... (2) For each, write ${OUTDIR}/panel/prompt_claimX.txt: the minimal context, the exact published claim, and the instruction to recompute independently; end every prompt with exactly: "End your answer with exactly two lines:\\nVERDICT: VERIFIED | REFUTED | INCONCLUSIVE\\nCONFIDENCE: <integer 0-100>". (3) For each claim x each model in [${PANEL_MODELS}], call ${ORTOOL} ask <model> --max-tokens 12000 < prompt_claimX.txt; skip non-empty existing outputs; the tool budget-guards and logs spend itself. Stop launching once summed cost nears ${PANEL_BUDGET_USD} USD. (4) Parse VERDICT and CONFIDENCE from each output; sum cost across .cost.json. Do NOT load whole outputs into context when the verdict line suffices (grep first). Build the panel table and note any panel-vs-attacker disagreement.`,
    { label: 'panel:open-model', phase: 'Panel', schema: {
      type: 'object', properties: {
        panel_table: { type: 'array', items: { type: 'object', properties: {
          claim_id: { type: 'string' }, model: { type: 'string' },
          verdict: { type: 'string' }, confidence: { type: 'number' },
          key_argument: { type: 'string' } },
          required: ['claim_id', 'model', 'verdict', 'confidence', 'key_argument'] } },
        total_cost_usd: { type: 'number' },
        disagreements: { type: 'array', items: { type: 'string' } },
      }, required: ['panel_table', 'total_cost_usd', 'disagreements'] } })
}

phase('Report')
const report = await agent(`${COMMON}
You write the single normalized adversarial-attack report that bin/lab_triage.py will parse. INPUTS:
PUBLISHED CLAIMS: ${CLAIMS.slice(0, 60000)}
ATTACK FINDINGS: ${ATTACKS.slice(0, 120000)}
PANEL: ${JSON.stringify(panel).slice(0, 30000)}
Merge the attacker findings (and panel verdicts) per claim. When attackers disagree on one claim, keep the strongest evidenced verdict and explain the split in Evidence. Then write ${REPORT_PATH} in EXACTLY this schema so triage can read it:

A title line, then a "## Findings" heading, then one numbered section per claim that has a verdict:

### N. [VERDICT] category
- **Claim**: the published claim, faithful paraphrase
- **Result**: one line including 'confidence: 0.NN' (0 to 1)
- **claim_status**: upheld | weakened | refuted
- **Evidence**:
  - one bullet per piece of evidence, each with a URL where applicable
- **Citations**:
  - one bullet per source URL

Rules: VERDICT in the heading is UPHELD, WEAKENED, or REFUTED and MUST match claim_status. Include UPHELD claims too (triage ignores them, but the report is the full record). Use WEAKENED or REFUTED only when evidence backs it. Every quantitative statement traceable to an attacker or panel finding. No em dashes, no en dashes, short sentences.
After writing the file, return its path, the counts of upheld/weakened/refuted, and this exact next-step line for the operator:
  ${REPO}/bin/lab_triage.py ${REPORT_PATH} --floor 0.7
(That command routes the genuinely-new weakened and refuted findings to the errata queue; re-running it adds nothing, which is the point.)`,
  { label: 'report:normalized', phase: 'Report', schema: {
    type: 'object', properties: {
      report_path: { type: 'string' },
      counts: { type: 'object', properties: {
        upheld: { type: 'number' }, weakened: { type: 'number' }, refuted: { type: 'number' } },
        required: ['upheld', 'weakened', 'refuted'] },
      triage_command: { type: 'string' },
    }, required: ['report_path', 'counts', 'triage_command'] } })

return { ledger, attacks, panel, report,
         next_step: `run: ${TRIAGE} ${REPORT_PATH} --floor 0.7` }
