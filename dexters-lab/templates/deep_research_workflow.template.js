// Dexter's Lab deep-research workflow template.
//
// Fill the placeholders below, then paste the whole file into a Claude Code
// Workflow call. Methodology: docs/DEEP_RESEARCH.md.
//
//   __QUESTION__          the research question, one line
//   __OUTDIR__            absolute output dir: <cfg reviews_dir>/<slug>
//   __DEPTH__             target number of sub-queries, 3 to 8
//   __REPO_ROOT__         absolute path to the dexters-lab repo checkout
//   __PANEL_BUDGET_USD__  hard second-opinion cap, e.g. 4
//   __PANEL_MODELS__      comma-separated model ids from cfg openrouter.panel_models_preference
//
// Drafts only: OUTDIR lives under lab_home, outside the repo. The run writes a
// cited report and a claims JSON there and nothing else. No DB, no sends, no
// git, no deploy.
//
// Note on syntax: the Workflow runner executes this file as an async function
// body with `phase`, `parallel`, and `agent` injected, so it uses top-level
// await and ends with a `return`. A plain `node --check` therefore needs the
// body wrapped, e.g.:
//   { echo 'export const __check = async () => {'; sed 's/^export //' FILE; \
//     echo '}'; } > /tmp/t.mjs && node --check /tmp/t.mjs

export const meta = {
  name: 'dexters-lab-deep-research',
  description: 'Fan-out web research: decompose, parallel search + fetch + extract, per-claim adversarial verify, cited synthesis',
  phases: [
    { title: 'Decompose', detail: 'question into 3 to 8 falsifiable sub-queries' },
    { title: 'Research', detail: 'one agent per sub-query: search, fetch, extract atomic claims with URLs' },
    { title: 'Verify', detail: 'one skeptic per load-bearing claim, tries to refute, optional heavy second opinion' },
    { title: 'Synthesize', detail: 'cited report + claims.json with verdicts, contradictions surfaced' },
  ],
}

const QUESTION = '__QUESTION__'
const OUTDIR = '__OUTDIR__'
const DEPTH = Number('__DEPTH__') || 5
const REPO = '__REPO_ROOT__'
const ORTOOL = `${REPO}/bin/lab_openrouter.py`
const PANEL_MODELS = '__PANEL_MODELS__'
const PANEL_BUDGET_USD = Number('__PANEL_BUDGET_USD__') || 4

const COMMON = `You are a research agent in Dexter's Lab running grounded deep research. Question under research: "${QUESTION}". Use your own Claude Code tools (WebSearch, WebFetch, Read, Write, Bash; load WebSearch/WebFetch via ToolSearch if they are deferred). Write any working files under ${OUTDIR}/ (mkdir -p first). HARD RULE: never fabricate a citation or a URL. Every claim you record carries a real URL you actually fetched with WebFetch. If search returns nothing usable, record no_sources_found and move on. Drafts only: no DB writes, no email or Slack, no git, no deploy. Your final message is structured data for a synthesis program, so your final action MUST be the structured-output call. No em dashes or en dashes in anything you write to disk.`

const DECOMPOSE_SCHEMA = {
  type: 'object',
  properties: {
    sub_queries: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string', description: 'Q1..Qn' },
      query: { type: 'string', description: 'a specific, web-answerable search query' },
      why: { type: 'string', description: 'which angle of the question this covers' },
      good_source_looks_like: { type: 'string', description: 'what an authoritative source for this would be' } },
      required: ['id', 'query', 'why', 'good_source_looks_like'] } },
    refutation_targets: { type: 'array', items: { type: 'string' }, description: 'what evidence would refute the leading answer' },
    answer_requires: { type: 'string', description: 'what a true answer would have to show' },
  },
  required: ['sub_queries', 'refutation_targets', 'answer_requires'],
}

const RESEARCH_SCHEMA = {
  type: 'object',
  properties: {
    sub_query_id: { type: 'string' },
    status: { type: 'string', description: 'answered|no_sources_found' },
    claims: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string', description: 'C<subquery>_<n>, e.g. CQ1_1' },
      statement: { type: 'string', description: 'one atomic falsifiable sentence' },
      sources: { type: 'array', items: { type: 'object', properties: {
        url: { type: 'string' }, title: { type: 'string' }, passage: { type: 'string', description: 'the fetched text the claim was drawn from' } },
        required: ['url', 'title', 'passage'] } },
      primary_source: { type: 'boolean', description: 'true if at least one source is the original study/doc, not an aggregator' },
      load_bearing: { type: 'boolean', description: 'does the answer to the question rest on this claim' } },
      required: ['id', 'statement', 'sources', 'primary_source', 'load_bearing'] } },
    note: { type: 'string', description: 'one line, e.g. why no sources were found' },
  },
  required: ['sub_query_id', 'status', 'claims', 'note'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    claim_id: { type: 'string' },
    verdict: { type: 'string', description: 'supported|contested|refuted|unverifiable' },
    reasoning: { type: 'string', description: 'the actual adversarial check, not a vibe' },
    corrected_statement: { type: 'string', description: 'the claim downgraded to what the source really says, or "" if unchanged' },
    counter_evidence_url: { type: 'string', description: 'URL of the strongest contradicting source, or "" if none' },
    second_opinion: { type: 'string', description: 'heavy-model read if used, or "skipped: <reason>"' },
    second_opinion_cost_usd: { type: 'number' },
  },
  required: ['claim_id', 'verdict', 'reasoning', 'corrected_statement', 'counter_evidence_url', 'second_opinion', 'second_opinion_cost_usd'],
}

phase('Decompose')
const decomposed = await agent(`${COMMON}
TASK: decompose the question into ${DEPTH} sub-queries (between 3 and 8). Each sub-query is a specific, web-answerable search query that covers a different angle: the core mechanism, the counter-evidence, the numbers, the edge cases, and the recency. Give each an id Q1..Qn, the query string, why it matters, and what a good source for it looks like. Then state, in answer_requires, what a true answer to the whole question would have to show, and list in refutation_targets the concrete evidence that would refute the leading answer. Do NOT search yet. This phase only plans the search.`,
  { label: 'decompose:sub-queries', phase: 'Decompose', schema: DECOMPOSE_SCHEMA })

const SUBQ = (decomposed.sub_queries || []).slice(0, 8)
const PLAN = JSON.stringify({ answer_requires: decomposed.answer_requires, refutation_targets: decomposed.refutation_targets })

phase('Research')
const research = await parallel(SUBQ.map((sq) => () => agent(`${COMMON}
ANSWER PLAN (for context, do not re-derive it):
${PLAN}
SUB-QUERY: id ${sq.id}. "${sq.query}". This covers: ${sq.why}. A good source looks like: ${sq.good_source_looks_like}.
TASK: research ONLY this sub-query. Steps: (1) WebSearch the query; take the top results. (2) Drop low-quality domains; prefer primary sources (the study, the official doc, the original data) over aggregators. (3) WebFetch the top results with a focused prompt: extract the main claim about this sub-query in 1 to 3 sentences and list any cited studies with their URLs. One hop further is allowed: if a fetched page cites a more authoritative primary source, WebFetch that too, at most one extra fetch. (4) From each fetched source, extract 1 to 3 ATOMIC, FALSIFIABLE claims (a sentence that could be proven wrong). Reject opinions and framing. (5) Every claim carries the exact URL it came from, the page title, and the passage it was drawn from. A claim without a URL is not recorded. Set primary_source true when at least one source is the original study or doc. Set load_bearing true when the answer to the whole question rests on this claim. Deduplicate within your own claims: if two sources support the same claim, merge them into one claim with two sources. If WebSearch returns nothing usable, set status "no_sources_found", claims to [], and say why in note. NEVER fabricate a URL.`,
  { label: `research:${sq.id}`, phase: 'Research', schema: RESEARCH_SCHEMA })))

const ALL_CLAIMS = []
for (const r of research.filter(Boolean)) {
  for (const c of (r.claims || [])) {
    ALL_CLAIMS.push({ ...c, sub_query_id: r.sub_query_id })
  }
}
const LOAD_BEARING = ALL_CLAIMS.filter((c) => c.load_bearing).slice(0, 12)
const CLAIMS_DIGEST = JSON.stringify(ALL_CLAIMS.map((c) => ({ id: c.id, statement: c.statement, urls: (c.sources || []).map((s) => s.url) }))).slice(0, 40000)

phase('Verify')
const verdicts = await parallel(LOAD_BEARING.map((claim) => () => agent(`${COMMON}
OTHER CLAIMS IN THIS RUN (for context, ids and statements only):
${CLAIMS_DIGEST}
CLAIM TO VERIFY: id ${claim.id}. "${claim.statement}"
ITS SOURCES: ${JSON.stringify((claim.sources || []).map((s) => ({ url: s.url, title: s.title, passage: (s.passage || '').slice(0, 1200) })))}
TASK: your job is to REFUTE this claim, not confirm it. Steps: (1) Re-read the cited passage by WebFetch of the source URL. Does the claim actually follow, or did the extractor overstate it? Overstatement is the most common defect. If overstated, put the downgraded claim in corrected_statement. (2) WebSearch for the OPPOSITE of the claim, for critiques, for failed replications. WebFetch the strongest contradicting source you find; put its URL in counter_evidence_url. (3) Judge source quality: primary vs aggregator, current vs superseded, any conflict of interest. (4) OPTIONAL heavy second opinion, only if this claim is genuinely hard to adjudicate from the page text: call ${ORTOOL} ask <model> --max-tokens 8000 with a self-contained prompt (the exact claim plus its source passage, asking the model to independently judge supported/refuted and explain). Models to try, in order: [${PANEL_MODELS}]. Keep summed second-opinion cost under ${PANEL_BUDGET_USD} USD. If ${ORTOOL} does not exist, or its API key env var (see openrouter.api_key_env in the lab config; resolve config via ${REPO}/lib/labconfig.py) is unset, do NOT fail: set second_opinion to "skipped: <reason>" and second_opinion_cost_usd to 0. The second opinion is never required. (5) Verdict: supported (source holds, no strong counter-evidence), contested (credible sources disagree, cite the counter URL), refuted (claim does not survive: misread, superseded, or contradicted by a stronger source), or unverifiable (no public way to adjudicate). Put the cost of any heavy call in second_opinion_cost_usd.`,
  { label: `verify:${claim.id}`, phase: 'Verify', schema: VERIFY_SCHEMA })))

const VERDICTS = JSON.stringify(verdicts.filter(Boolean))
const SECOND_OPINION_COST = verdicts.filter(Boolean).reduce((a, v) => a + (Number(v.second_opinion_cost_usd) || 0), 0)

phase('Synthesize')
const report = await agent(`${COMMON}
You are the synthesis agent writing the final grounded report. INPUTS:
SUB-QUERIES: ${JSON.stringify(SUBQ)}
ANSWER PLAN: ${PLAN}
ALL EXTRACTED CLAIMS (with sources): ${JSON.stringify(ALL_CLAIMS).slice(0, 120000)}
VERIFY VERDICTS: ${VERDICTS.slice(0, 60000)}
SECOND-OPINION COST SO FAR: ${SECOND_OPINION_COST} USD
(Reminder: after writing the two files, your final action MUST be the structured-output call.)
Write ${OUTDIR}/RESEARCH_REPORT.md, a cited report, honest and specific:
1. The question, restated in one line.
2. Answer: the grounded answer to the question. EVERY factual sentence carries an inline URL to a source. Use ONLY claims whose verdict is supported or contested. Apply any corrected_statement from the verify phase, not the original overstatement.
3. Contradictions: where credible sources disagree, say so and cite BOTH. Never pick a side silently.
4. What did not hold up: list every refuted claim with its refutation reason and the contradicting URL, so a reader sees what was checked and rejected.
5. Gaps: every sub-query that came back no_sources_found, stated plainly.
6. Confidence: one line, low/medium/high, and why.
7. Sources: the distinct URLs used, deduplicated.
Writing rules: no em dashes, no en dashes, short sentences, every factual sentence traceable to a source URL. If a heavy second opinion was skipped for every claim, do not pretend one ran.
Also write ${OUTDIR}/claims.json with exactly these keys: {question, depth, sub_queries: [{id, query, status}], claims: [{id, statement, sub_query_id, sources, verdict, verify_reason, counter_evidence_url, load_bearing}], contradictions: [], no_sources_found: [], report_path, second_opinion_cost_usd}.
Return: the one-line answer, the count of supported/contested/refuted/unverifiable claims, the list of no_sources_found sub-queries, and both file paths.`,
  { label: 'synth:research-report', phase: 'Synthesize', schema: {
    type: 'object', properties: {
      answer: { type: 'string' },
      supported: { type: 'number' }, contested: { type: 'number' },
      refuted: { type: 'number' }, unverifiable: { type: 'number' },
      no_sources_found: { type: 'array', items: { type: 'string' } },
      files: { type: 'array', items: { type: 'string' } },
      second_opinion_cost_usd: { type: 'number' },
    }, required: ['answer', 'supported', 'contested', 'refuted', 'unverifiable', 'no_sources_found', 'files', 'second_opinion_cost_usd'] } })

return { decomposed, research, verdicts, report }
