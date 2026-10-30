---
title: "Practice Test 4 – Claude Certified Architect"
duration_minutes: 120
---

# Questions and Answers: Practice Test 4 – Claude Certified Architect

## Scenario: Code Generation with Claude Code

### Question 1

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A repository has the following Claude Code configuration:

- `/CLAUDE.md`: repository-wide guidance for pull requests, error handling, and test coverage

- `/engines/recommendations/CLAUDE.md`: recommendations engine guidance for ranking changes and experiment flags

- `/.claude/rules/python-services.md`: scoped to `engines/**/*.py`

- `/.claude/rules/recs-ranking.md`: scoped to `engines/recommendations/**`

- `/.claude/rules/android-ui.md`: scoped to `clients/android/**/*.kt`

- `/.claude/rules/schema-migrations.md`: scoped to `database/migrations/*.sql`

You ask Claude Code to update `engines/recommendations/src/features/user_vector.py`. Which configuration choice best describes the instructions that should be active for this edit?

- **A.** Use `/CLAUDE.md`, `/engines/recommendations/CLAUDE.md`, `python-services.md`, `recs-ranking.md`, `android-ui.md`, and `schema-migrations.md`, because all rule files are loaded for every edit.
- **B.** Use `/CLAUDE.md`, `/engines/recommendations/CLAUDE.md`, `python-services.md`, and `recs-ranking.md`, because both rule globs match the Python file under the recommendations engine.
- **C.** Use only `/CLAUDE.md` and `/engines/recommendations/CLAUDE.md`, because files in `.claude/rules/` are ignored unless they are linked from a CLAUDE.md file.
- **D.** Use `/CLAUDE.md`, `/engines/recommendations/CLAUDE.md`, and the first matching rule file returned by the filesystem listing of `.claude/rules/`.

#### Correct answer to Question 1: B

Instructions combine: the root `CLAUDE.md` always applies, the `engines/recommendations/CLAUDE.md` is loaded because the edited file lives in that directory, and every `.claude/rules/` file whose `paths` glob matches the file becomes active. Here both `engines/**/*.py` and `engines/recommendations/**` match `user_vector.py`.

Listing every rule file, including the Android and other unrelated ones, is wrong because path-scoped rules load only when their glob matches. Ignoring `.claude/rules/` is wrong because those files are discovered automatically, without links. Taking only the first matching rule file is wrong because there is no "first match wins": all matching rules apply.

## Scenario: Claude Code for Continuous Integration

### Question 2

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

During a pull request validation run, Claude Code calls an MCP tool named `map_impacted_tests` to decide which regression suites to generate. The tool responds with: `{"code":"CACHE_NODE_UNAVAILABLE","message":"The dependency graph cache could not be reached","metadata":{"isRetryable":true,"retryAfterMs":2000}}`. What should the agent workflow do next?

- **A.** Apply the pipeline’s standard MCP error handler, which marks every tool exception as a failed check regardless of metadata.
- **B.** Stop the impacted-test step immediately and mark the pull request as needing manual review because the tool returned an error.
- **C.** Record the cache lookup failure in the job log, skip impacted-test selection, and continue generating the pull request summary.
- **D.** Pause for the interval indicated in the error, then call `map_impacted_tests` again and use the result if the retry succeeds.

#### Correct answer to Question 2: D

The error is explicitly marked `isRetryable: true` with a `retryAfterMs` hint: it is a transient failure. The correct behavior is to honor the metadata, wait the indicated interval and retry, then continue with the real result.

Applying the standard handler or stopping for manual review treats a retryable error as terminal and needlessly fails the check. Logging the failure and skipping test selection silently drops a step whose output (which tests to generate) the workflow actually needs.

## Scenario: Code Generation with Claude Code

### Question 3

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A team wants Claude Code to add offline draft synchronization to a collaborative notes app. The change will touch the local storage adapter, sync queue worker, API client, conflict handling tests, and a short developer guide, and the team is still deciding how to handle simultaneous edits from two devices. What is the best approach before allowing Claude Code to modify the repository?

- **A.** Ask Claude Code to implement the change directly, then spend the saved planning time reviewing the resulting diff and reverting any parts that look inconsistent.
- **B.** Skip plan mode because the real issues with offline behavior will only become visible after Claude Code writes the code and the test suite runs.
- **C.** Keep Claude Code in planning until the team can predict every function signature, edge-case branch, and test assertion that will appear in the final diff.
- **D.** Start in plan mode, review Claude Code's proposed architecture, affected files and sequencing, then approve the plan once the conflict-resolution approach is clear.

#### Correct answer to Question 3: D

The change spans several layers and contains an open design decision (conflict resolution for simultaneous edits). This is exactly the case for plan mode: review the architecture, affected files and sequencing, then approve once intent is clear enough.

Implementing directly or skipping plan mode skips planning on a multi-file, ambiguous change and shifts the cost to rework. Planning until every signature and assertion is predictable goes to the opposite extreme: a plan must clarify direction, not predict every detail of the final diff.

## Scenario: Claude Code for Continuous Integration

### Question 4

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Claude Code reviews schema migration pull requests in your CI pipeline and often leaves the comment, "This migration looks unsafe for production." Developers report that the warning appears on harmless additive changes but sometimes misses risky rollouts that could break old application versions. What is the best way to redesign the review prompt to make this feedback more actionable and reduce false positives?

- **A.** Define "unsafe migration" in the prompt with short examples: flag a column rename without backfill or compatibility layer, but not an additive nullable column with rollback.
- **B.** Remove the migration-safety check from the CI review prompt because production readiness is too context-dependent for automated feedback.
- **C.** Change the comment text to say, "This database change may not meet production-readiness expectations," so the feedback sounds less absolute and more professional.
- **D.** Ask Claude Code to tell authors to consult the data platform team whenever it is uncertain whether a migration is safe for production traffic.

#### Correct answer to Question 4: A

The vague criterion "unsafe" produces both false positives and misses. Defining the criterion explicitly, with short contrasting examples of what to flag (rename without backfill/compatibility layer) and what not to flag (additive nullable column with rollback), makes the review precise and actionable.

Removing the migration-safety check throws away a valuable check. Softening the comment text changes only the wording, not what gets flagged. Sending authors to the data platform team pushes the decision onto another team instead of improving the criterion.

## Scenario: Multi-Agent Research System

### Question 5

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

A research platform runs a weekly “evidence sweep” for 300 client topics. For each topic, a coordinator agent assigns thousands of retrieved abstracts to document-analysis subagents, later asks a synthesis agent to draft conclusions, and then supports a live reviewer who requests narrower claims and citation changes during a 20-minute review session. Which invocation strategy best balances cost, throughput, and responsiveness?

- **A.** Use only real-time calls in the agent loop, because Batch jobs are incompatible with workflows where a coordinator assigns work to multiple specialized agents.
- **B.** Use Batch jobs for the large backlog of article extraction and citation scoring that can finish later, while keeping coordination, clarifications, synthesis and report edits on real-time calls.
- **C.** Keep all search, extraction, analysis, synthesis, and reporting calls synchronous, because mixing invocation modes makes the report pipeline less consistent even when most source review can wait.
- **D.** Route every coordinator decision and subagent request through Batch, since the research system’s monthly volume is high and lower unit cost should take priority across the whole pipeline.

#### Correct answer to Question 5: B

Large volumes of independent work that can finish later (abstract extraction, citation scoring) are ideal for the Message Batches API: lower cost, high throughput. The coordinator and the live review session need low latency, so they stay on real-time calls.

Claiming that batch jobs are incompatible with a coordinator is false: batch and real-time calls can coexist in the same system. Keeping everything synchronous pays full price for work that can wait. Routing every coordinator decision through Batch breaks interactivity, since a batch can take up to 24 hours.

## Scenario: Customer Support Resolution Agent

### Question 6

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A support team uses Claude Code to maintain a resolution agent for subscription cancellations and invoice disputes. Several engineers rely on a custom skill named `dispute-triage-checklist` to update prompts and MCP tool examples, but the skill currently lives only in personal laptop directories. After a laptop replacement, one engineer recreates the skill from memory and introduces guidance that sends more account-lock cases to `process_refund` instead of `escalate_to_human`. What is the clearest configuration risk to address?

- **A.** Keep the triage skills in each engineer’s Claude Code profile because runtime support configuration should not be part of the application repository.
- **B.** Let agents overwrite local triage skills after each evaluation run because skills are short-lived aids that should not need rollback history.
- **C.** Document the triage skills in the repository, but leave the actual skill files local because Claude Code does not support repository-managed skills.
- **D.** Store the shared triage skills in the repository's `.claude/skills/` directory, and require normal git pull requests for any edits.

#### Correct answer to Question 6: D

Skills kept only on personal laptops are not shared, not versioned and cannot be reviewed: that is how the regression in escalation logic slipped in. Placing them in the project's `.claude/skills/` directory and editing them through pull requests gives history, review and rollback.

Keeping the skills in each engineer's profile preserves the drift problem. Letting agents overwrite them removes all control over changes. Documenting them while leaving the files local rests on a false premise: Claude Code supports project-level skills under `.claude/skills/`.

## Scenario: Developer Productivity with Claude

### Question 7

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A platform team is using a Claude Agent SDK assistant to update 58 TypeScript API route handlers from `audit.logRequest(req)` to a new `policyAudit.record({ actor, route, decision })` pattern. The handlers vary: some compute `actor` from session middleware, some have early returns, and a few already include partial policy audit calls. Which approach should the agent use to make the update most reliably?

- **A.** Run a Bash one-liner that performs a repository-wide regular-expression replacement from the old audit call to the new policy call, then inspect only the files that fail tests afterward.
- **B.** Send the full candidate file list to a bulk-refactor MCP server and accept its returned patch set as the default path, using the agent only to summarize the generated diff.
- **C.** Have the agent generate a standalone migration script that rewrites every matching handler, save it in the repository, and ask a developer to run it after reviewing the script comments.
- **D.** Find candidate handlers with Glob or Grep, then for each file: Read its local structure, apply a targeted Edit, and re-read to confirm the result before moving on.

#### Correct answer to Question 7: D

The handlers are heterogeneous (different `actor` sources, early returns, partial calls already present), so a blind textual replacement would break cases. The reliable pattern is: find candidates with Glob/Grep, Read each file, apply a targeted Edit and verify the result.

A repository-wide regex replacement relies on tests to catch errors after the fact. A bulk-refactor MCP server delegates everything to an opaque tool and reduces the agent to summarizing. A standalone migration script is generic and suffers the same variability problems.

## Scenario: Claude Code for Continuous Integration

### Question 8

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A payments company runs a merge-queue validation job that asks Claude Code to inspect about 8,000 independent file diffs and propose missing regression tests. The annotations only need to be posted back to pull requests before the next business day; no developer is waiting in an interactive session. Which Claude API capability should the CI team choose to reduce cost for this workload?

- **A.** Store the review prompt and each changed file in prompt caching so later CI jobs reuse completed output for new diffs.
- **B.** Submit the requests through a prompt-grouping endpoint that combines similar review prompts so the model is billed once per group.
- **C.** Send the independent jobs through the Message Batches API and have CI poll for their completion within the 24-hour window.
- **D.** Call the standard Messages API with streaming enabled so each review begins returning tokens immediately and uses lower-cost delivery.

#### Correct answer to Question 8: C

Thousands of independent requests, no one waiting, deadline the next business day: this is the canonical use case for the Message Batches API, which reduces cost (about 50%) in exchange for asynchronous processing within 24 hours.

Prompt caching is misunderstood here: it caches the input prefix, not the output of other requests. A prompt-grouping endpoint does not exist. Streaming improves perceived latency but does not lower cost.

## Scenario: Customer Support Resolution Agent

### Question 9

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A returns assistant handles vague messages such as, “The headphones arrived broken; send my money back.” In test logs, some runs jump straight to `process_refund` after the user’s first message, even though policy requires a verified customer profile and a matched purchase record before any refund attempt. Which implementation pattern best enforces that requirement while still allowing the agent to handle non-refund cases flexibly?

- **A.** Set `tool_choice` to prefer `get_customer` and `lookup_order` whenever the user mentions a refund, then switch it back to allow `process_refund` once the conversation appears to be about money.
- **B.** Replace the agent’s open-ended reasoning with a single fixed route that always runs `get_customer`, then `lookup_order`, then `process_refund`, then `escalate_to_human` for every billing-related message.
- **C.** Update the system prompt to say that refunds must never be issued until the customer and order have been verified, and include several examples showing the preferred order of tool calls.
- **D.** Add a hook around refund execution that checks the current run's tool history for successful `get_customer` and `lookup_order` calls, returning a structured error if they are missing.

#### Correct answer to Question 9: D

A business prerequisite (verified customer and matched order before a refund) must be guaranteed deterministically. A hook that inspects the run's history and blocks `process_refund` with a structured error enforces the rule while leaving the agent free on everything else.

Steering `tool_choice` from refund keywords depends on fragile conversation heuristics. A single fixed route turns the agent into a rigid pipeline and loses flexibility on non-refund cases. A system prompt rule improves behavior but does not guarantee it, and the logs already show violations.

## Scenario: Multi-Agent Research System

### Question 10

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

A lab’s Claude Code research workspace now has a lead agent that decomposes requests, plus subagents for live source discovery, scanned-contract review, evidence synthesis, and board-ready memo writing. The team is adding lengthy guidance for search query construction, OCR caveats, contradiction handling, and executive formatting, but wants future edits to be easy and wants each agent to see only the guidance it needs. Which configuration approach is best?

- **A.** Put the coordinator playbook, browser heuristics, PDF extraction rules, synthesis rubric, and report template into one global CLAUDE.md and rely on each agent to ignore unrelated sections.
- **B.** Define roleConditions in a YAML manifest so Claude Code automatically loads instructions from paths such as instructions/web/*.md only when an agent name matches the path.
- **C.** Copy the same citation policy, safety rules, and role-specific operating steps into every AgentDefinition, editing each copy when a research standard changes.
- **D.** Create a small shared CLAUDE.md for project-wide standards, then use @import to compose separate coordinator, retrieval, analysis and reporting instruction files.

#### Correct answer to Question 10: D

A small shared `CLAUDE.md` for common standards plus separate, role-specific files composed with `@import` give modularity (one place to edit) and isolation (each agent sees only what it needs).

One giant file loads everything into everyone's context, wasting tokens and creating confusion. A `roleConditions` YAML manifest is an unsupported, invented mechanism. Copying the same policy into every AgentDefinition duplicates the guidance and makes every update error-prone.

## Scenario: Customer Support Resolution Agent

### Question 11

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A Claude Agent SDK support agent handles subscription cancellations using MCP tools such as get_customer, lookup_order, process_refund, and escalate_to_human. Clear cases are fine, but ambiguous situations vary: a long-time customer charged after a confusing cancellation flow may receive a refund, a service credit, a denial, or an escalation depending on the run. The policy intentionally leaves room for judgment based on tenure, prior refunds, and evidence of confusion. Which prompt-design change would most directly improve consistency for these borderline cases?

- **A.** Add several representative system-prompt examples of borderline disputes, showing when to resolve directly, offer a partial remedy, decline with a rationale, or call escalate_to_human.
- **B.** Keep the system prompt short and avoid examples, because extra sample cases mainly increase prompt length and are unlikely to affect the agent’s support decisions.
- **C.** Wait until the customer conversation contains a similar prior case, because behavioral examples should be learned only from earlier turns rather than placed in the system prompt.
- **D.** Move the borderline dispute examples into a separate test set, because examples are useful for measuring the agent’s behavior but should not be included in runtime instructions.

#### Correct answer to Question 11: A

When the policy leaves room for judgment, inconsistency comes from the model not knowing where the boundaries lie. Representative few-shot examples in the system prompt (resolve, partial remedy, decline with rationale, escalate) calibrate decisions on borderline cases.

Avoiding examples underestimates their effect: they are one of the most effective levers for consistency. Waiting for a similar prior case relies on examples that may never arrive. Test sets are needed to measure behavior, but they do not change it at runtime.

## Scenario: Multi-Agent Research System

### Question 12

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

In your multi-agent research system, the document-analysis subagent uses an MCP tool named `extract_brief_text` to process uploaded legal filings before the synthesis agent compares arguments across sources. One filing fails during extraction because the PDF cannot be read by the parser. What is the best way for the MCP tool to report this failure so the coordinator can guide the user and keep the research workflow reliable?

- **A.** Return `is_error: true` with the message `document extraction failed`, and require the coordinator to call a separate `extraction_troubleshooter` tool to determine the cause and recommended remediation.
- **B.** Return `is_error: true` with only the parser exception class, internal worker ID, storage object URI, and the PDF library's numeric failure code for later engineering investigation.
- **C.** Return `is_error: false` with an empty extraction result, note that the text may become available after reprocessing, and let the synthesis agent proceed as if the source is temporarily delayed.
- **D.** Return a structured `is_error: true` result saying the document appears password-protected, with the file name and stage, and suggest asking the user for an unlocked copy or permission to omit it.

#### Correct answer to Question 12: D

A good tool error must be actionable: `is_error: true`, a probable cause in plain language (password-protected/encrypted PDF), file and stage involved, and a suggested next step (ask for an unlocked copy or permission to omit the source).

A generic "document extraction failed" message is not actionable and adds a needless tool call. Returning only internal diagnostics gives the agent nothing it can use to guide the user. Returning `is_error: false` with an empty result hides the failure and lets synthesis proceed on a missing source.

## Scenario: Structured Data Extraction

### Question 13

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A health insurer uses Claude to extract prior-authorization details from uploaded medical necessity letters into JSON before sending the results to a claims adjudication service. Reviewers must be able to check uncertain values against the original letter months later. Which schema design best supports reliable validation, traceability, and downstream integration?

- **A.** Define the JSON schema with the extracted claim fields plus parser version, temperature setting, prompt template name, and elapsed processing time for each document.
- **B.** Define the JSON schema with only the normalized claim fields needed by the adjudication database, rejecting any metadata not directly stored in the business tables.
- **C.** Define the JSON schema with the extracted claim fields plus compact metadata such as per-field confidence, source file and page/span references, and a timestamp.
- **D.** Define the JSON schema with the extracted claim fields plus the full prompt, model response transcript, retry history, token counts, and worker host diagnostics.

#### Correct answer to Question 13: C

Traceability months later requires concise metadata useful for review: per-field confidence, source references (file, page/span) and an extraction timestamp. These enable validation, routing of uncertain cases and verification against the original.

Parser version, temperature and template name are technical metadata that do not help a reviewer locate the value. Rejecting all metadata removes the needed traceability. Full transcripts, retry history and token counts bloat the record with heavy diagnostics that belong in logs, not in the schema.

## Scenario: Code Generation with Claude Code

### Question 14

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A mobile app team wants Claude Code to apply the same accessibility checklist, secure-storage guidance, and code-review norms across their repository. The lead wants the root CLAUDE.md to contain only a brief overview plus links to the reusable instruction files so it remains easy for developers to maintain. Which configuration choice should they use?

- **A.** Add headings such as #include security.md and #include review-checklist.md at the top of CLAUDE.md to inline those sections during startup.
- **B.** Create separate CLAUDE.md files inside several .claude/guidance/ subdirectories and rely on Claude Code to merge all of them automatically.
- **C.** Move the common instructions into .claude/rules/ so Claude Code treats them as the default reusable standards for every project session.
- **D.** Keep a short root CLAUDE.md that references files such as docs/claude/security.md and docs/claude/review-checklist.md via @import.

#### Correct answer to Question 14: D

The `@path/to/file` syntax in `CLAUDE.md` imports external files, keeping the root concise and the guidance reusable and maintainable separately.

An `#include` directive does not exist in `CLAUDE.md`. `CLAUDE.md` files in arbitrary `.claude/guidance/` subfolders are not merged automatically at startup (they load only when working on files in those folders). Moving everything into `.claude/rules/` does not match the requirement of a short root with links to reusable files.

## Scenario: Developer Productivity with Claude

### Question 15

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A Claude Agent SDK assistant is helping investigate an intermittent issue in a large internal platform: some nightly invoice-generation jobs finish with “completed” status but produce no invoice rows. The monorepo includes a webhook intake service, a job scheduler, queue consumers, feature-flag middleware, invoice business logic, a persistence layer, and MCP servers for logs and traces. Which investigation strategy should the agent use?

- **A.** Begin with a few failing job IDs and their logs or traces, inspect the first implicated subsystem, then revise the hypothesis and choose the next focused code search or tool call from that evidence.
- **B.** Start simultaneous analysis tasks for the webhook handler, scheduler, queue consumer, feature-flag layer, persistence adapter, and dashboard code, then merge all summaries into one large context window.
- **C.** Run a standard reliability checklist in a fixed order: validate queue configuration, inspect worker startup, review retry policy, audit repository methods, and only then compare the findings to the failing job IDs.
- **D.** First map every possible execution path from webhook receipt through all queue, retry, worker, and database branches, then begin checking which path matches the intermittent failures.

#### Correct answer to Question 15: A

An intermittent bug in a large system calls for an evidence-driven, iterative investigation: start from real failing job IDs and their logs/traces, examine the first implicated subsystem, and refine the hypothesis at each step.

Starting analysis of every subsystem at once scatters effort and floods the context with irrelevant summaries. A fixed reliability checklist is disconnected from the evidence. Mapping every execution path up front is costly and not focused on the actual failure.

### Question 16

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A DevEx group is building a Claude Agent SDK documentation agent for a legacy deployment orchestrator. The repository has scheduler modules, cloud-provider plugins, a small REST API, and several shell-based operational workflows. New engineers complain that existing comments help them identify individual functions but not how to understand the system or safely reuse its patterns. What is the best approach for the agent to generate useful documentation?

- **A.** Produce one long Markdown file that walks through every source file in repository order, embedding overview notes, class descriptions, and examples wherever they happen to appear.
- **B.** Plan separate documentation passes for the subsystem map, responsibilities, public classes/functions and runnable scenarios, then link them so readers can move between the levels.
- **C.** Begin by asking the team to rewrite the documentation request into exhaustive acceptance criteria before scanning the repository, since the main risk is ambiguity in a large documentation task.
- **D.** Generate a single alphabetical catalog of exported symbols with inferred parameter descriptions, since maintainers can inspect the source when they need architectural or workflow context.

#### Correct answer to Question 16: B

New engineers need several levels: a subsystem map, component responsibilities, API references and runnable scenarios. Planning separate passes and linking them lets readers move from overview to detail.

One long Markdown file in repository order is organized by file, not by concept. Asking the team for exhaustive acceptance criteria blocks the work when the problem is already clear. An alphabetical catalog of symbols lacks architectural context, which is exactly what is missing today.

## Scenario: Structured Data Extraction

### Question 17

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

An insurance analytics group is using Claude to extract claimant names, incident dates, injury descriptions, reserve amounts, coverage limits, and settlement status into a JSON-schema-validated claims warehouse. The backlog contains 120,000 files, including adjuster narratives, scanned medical invoices, police reports, attorney letters, and standardized claim forms. What is the best approach before running the full archive through the extraction pipeline?

- **A.** Test the pipeline on one recent auto-claim PDF that contains all required fields, confirm that it produces valid JSON, and use that result as approval to process the remaining claim archive.
- **B.** Start the full extraction job with logging enabled, send any records that fail JSON schema validation to a repair queue, and use the production run’s errors to decide whether the prompt needs changes.
- **C.** Use the current prompt and schema across the archive because Claude’s language understanding should transfer from the examples in the prompt to unseen insurance documents without a separate validation phase.
- **D.** Pilot on a representative mix of claim letters, adjuster notes, bills and police reports; have reviewers compare JSON outputs to the sources for missing or wrong values, then refine prompt and schema before the full batch.

#### Correct answer to Question 17: D

With 120,000 heterogeneous documents, the prompt and schema must be validated on a representative pilot covering every document type, with human review against the sources, then refined before the full run.

Testing one ideal PDF does not represent the variety of documents. Starting the full job with a repair queue uses production as a test, with costly errors that are hard to correct. Reusing the current prompt and schema assumes generalization without verification: schema validity does not guarantee correct values.

## Scenario: Customer Support Resolution Agent

### Question 18

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer says, “Your system promised me a $38 loyalty credit after a delayed delivery, but my latest invoice still shows the full amount.” Claude reviews the billing notes and returns an API response with `stop_reason: "tool_use"`; the assistant message content contains a `tool_use` block requesting `process_refund` for a specific invoice transaction and credit amount. What should the agent runtime do next?

- **A.** Treat the response as the completed resolution, send the customer a confirmation that the adjustment is handled, and close the ticket without running any MCP tool.
- **B.** Find the `process_refund` `tool_use` block, execute the MCP tool with its arguments, append the tool result to the conversation, and call Claude again.
- **C.** Read the tool name and refund parameters directly from the `stop_reason` metadata, execute that inferred operation, and summarize the result to the customer.
- **D.** Immediately call Claude again with the same conversation and a reminder to continue resolving the case, without invoking `process_refund` or adding a tool result.

#### Correct answer to Question 18: B

`stop_reason: "tool_use"` means Claude is requesting a tool call. The runtime must extract the `tool_use` block from the content, execute the tool with the given arguments, append the `tool_result` to the conversation and call Claude again to continue the loop.

Treating the response as a completed resolution confuses a tool request with a final answer. Reading parameters from `stop_reason` is wrong: `stop_reason` does not contain them, they live in the `tool_use` block. Calling Claude again without running the tool omits the result and breaks the protocol.

## Scenario: Multi-Agent Research System

### Question 19

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The synthesis subagent in your research system calls an MCP tool named `dataset_resolver` to pull statistics from a commercial data catalog. Load tests show occasional TCP resets, HTTP 429 responses, and short 500-level outages; the catalog also returns clear errors for misspelled dataset IDs, expired workspace tokens, and datasets excluded by the customer’s license. Which design best defines the responsibility boundary between `dataset_resolver` and the agents that depend on it?

- **A.** Implement bounded retries with backoff inside `dataset_resolver` for timeouts, 429s and 5xx, and return structured errors for failures like unknown dataset IDs, expired credentials or license limits.
- **B.** Make `dataset_resolver` convert all exceptions and non-2xx responses into a single `source temporarily unavailable` result so the report generator can continue without exposing vendor-specific details.
- **C.** Configure `dataset_resolver` to retry all failed requests up to five times with the same exponential backoff, including invalid dataset names, unauthorized workspace access, and terms-of-use denials.
- **D.** Have `dataset_resolver` return every failed API call immediately to the synthesis agent with the raw status and message, and let the agent decide whether to retry, reformat the request, or ask another subagent for help.

#### Correct answer to Question 19: A

Transient errors (timeouts, 429, 5xx) are best handled inside the tool with bounded retries and backoff. Permanent errors (wrong ID, expired credentials, license denial) must instead be returned as structured errors so the agent can correct the request or escalate.

Collapsing every failure into "source temporarily unavailable" hides the real cause and prevents correction. Retrying every failure five times wastes retries on errors that will never succeed. Returning every failure raw to the synthesis agent burdens it with transient failures the tool can resolve on its own.

## Scenario: Customer Support Resolution Agent

### Question 20

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A Claude Agent SDK support agent is being added to a retailer's returns queue. Its MCP tool `build_return_packet` can return customer tier, order age, delivery status, and basic return-window eligibility in about 600 ms, but warranty annotations, warehouse inspection exceptions, and fraud-review notes may take another 5–9 seconds. The team wants the agent to feel responsive during chats while still making reliable return, refund, or escalation decisions. What is the best approach?

- **A.** Remove the slow warehouse and warranty sections from `build_return_packet` entirely, allowing the agent to resolve all return requests using only order age and delivery status.
- **B.** Keep the workflow unchanged and focus only on database index tuning and cache warming for `build_return_packet`, since the agent should not reason until the entire lookup payload is complete.
- **C.** Have the agent immediately tell customers that return checks may take up to ten seconds, then remain silent until `build_return_packet` finishes assembling every field.
- **D.** Have `build_return_packet` stream a compact header first (customer tier, order age, delivery status, return-window flags), so the agent can proceed while warranty and warehouse details load.

#### Correct answer to Question 20: D

Streaming a compact header of fast data first lets the agent respond immediately and ask targeted questions, while slower details (warranty, warehouse exceptions, fraud review) arrive afterward. This balances responsiveness and reliable decisions.

Removing the slow sections drops information needed for correct decisions. Focusing only on database tuning accepts a poor user experience while waiting for optimizations. Warning customers and then staying silent keeps the user waiting without using the data already available.

### Question 21

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A billing-support agent is helping a user who says, “I was charged twice; my login email is <dana.reyes@example.net>.” The agent calls the MCP tool `get_customer` with that email, the customer database responds normally, and the query returns no matching account. Which tool response and follow-up behavior best classify and handle this failure mode?

- **A.** Return `{ "isError": false, "customer": { "id": "temp-unknown", "email": "user-supplied", "status": "unverified" } }`, and have the agent continue to search recent orders using the placeholder account.
- **B.** Return `{ "isError": true, "errorCategory": "transient", "isRetryable": true, "message": "Customer record not available yet." }`, and have the agent automatically retry the same lookup several times before responding.
- **C.** Return `{ "isError": true, "errorCategory": "capacity", "isRetryable": true, "message": "Customer service is temporarily overloaded." }`, and have the agent apologize for a system issue before trying again later.
- **D.** Return `{ "isError": true, "errorCategory": "not_found", "isRetryable": false, "message": "No account matched." }`, and have the agent ask the user to verify the email or give another identifier.

#### Correct answer to Question 21: D

A successful query with no results is a "not found" error: not transient and not retryable. The right response states it in structured form (`not_found`, `isRetryable: false`) and the agent asks the user to verify the email or provide another identifier.

Returning a placeholder "temp-unknown" account invents data and proceeds on it. Classifying the error as transient or capacity is wrong: it causes useless retries and misleading messages about system outages.

## Scenario: Code Generation with Claude Code

### Question 22

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A mobile team wants Claude Code to use an internal “test-data” MCP server that generates seeded API fixtures during debugging sessions. The configuration must be available automatically to anyone who checks out the app repository and should be reviewed like other project changes. Where should the team put this MCP server configuration?

- **A.** Commit a project-scoped .mcp.json in the repository root (or in the repository's .claude/ directory) with the test-data MCP server.
- **B.** Create a .mcp/servers.json directory structure in the repository and place the test-data MCP server definition there.
- **C.** Add the test-data MCP server definition under .claude/rules/testing.md so it loads whenever files in the tests directory are opened.
- **D.** Ask each developer to add the test-data MCP server definition to their own ~/.claude.json file before using Claude Code.

#### Correct answer to Question 22: A

Project-scoped MCP servers live in a `.mcp.json` file committed to the repository: anyone who clones gets the configuration, and changes go through normal review.

A `.mcp/servers.json` structure is a non-standard path that Claude Code does not read. Rules files such as `.claude/rules/testing.md` contain instructions, not MCP configuration. Each developer's `~/.claude.json` keeps the configuration personal and unshared, with no review.

### Question 23

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A platform team maintains a monorepo where every service must follow the same incident-response logging rules and database migration checklist. They want Claude Code to load those shared instructions for all sessions, but they do not want the root CLAUDE.md to become a long policy document. Which configuration choice best fits Claude Code’s supported project-instruction workflow?

- **A.** Create .claude/rules/security.md and .claude/rules/migrations.md so Claude Code treats them as general reusable instruction modules for every session.
- **B.** Add YAML front matter to CLAUDE.md, such as includes: [docs/claude/security.md, docs/claude/migrations.md], so Claude Code expands those files before reading the instructions.
- **C.** Keep the root CLAUDE.md focused on high-level project context, and add @import references to detailed files such as docs/claude/security.md and docs/claude/migrations.md.
- **D.** Move each topic into its own .claude/security/CLAUDE.md and .claude/migrations/CLAUDE.md file, relying on Claude Code to automatically merge every nested CLAUDE.md under .claude/.

#### Correct answer to Question 23: C

The workflow supported for a short `CLAUDE.md` is to keep high-level context at the root and use `@import` references to separate files containing detailed policies, loaded in every session.

Path rules in `.claude/rules/` are not what is asked: the question wants the supported mechanism to include reusable instructions from the root `CLAUDE.md`. An `includes:` front matter does not exist. Nested `CLAUDE.md` files under `.claude/` are not merged automatically.

## Scenario: Customer Support Resolution Agent

### Question 24

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A retailer’s Claude Agent SDK support agent can verify identity, inspect loyalty status, look up shipments, issue standard refunds, and transfer cases through MCP tools. In a staging run, it handles routine “missing item” claims well, but ambiguous cases include customers asking for a supervisor, requests for goodwill credits above the agent’s limit, and conversations where all permitted remedies have already been checked. Which escalation design is the best approach?

- **A.** Configure the agent to escalate according to a fixed matrix, such as all enterprise accounts, all orders above $500, and all chargeback-related tickets, regardless of the available MCP tool results.
- **B.** Escalate when the customer asks for a human, when a requested remedy needs approval outside refund and account policies, or when its reasoning shows no policy-compliant tool workflow is likely to move the case forward.
- **C.** Configure the agent to escalate after exactly three unsuccessful MCP calls in a case, whether those calls are repeated failures, normal lookups, or intermediate steps in a viable refund workflow.
- **D.** Configure the agent to escalate whenever the conversation classifier detects anger, sarcasm, or disappointment, even if the order status and refund policy indicate the agent can complete a standard resolution.

#### Correct answer to Question 24: B

Good escalation criteria are observable and tied to real limits: an explicit request for a human, a remedy outside the agent's authority, or no policy-compliant path left. This way the agent resolves what it can and escalates only when needed.

A fixed escalation matrix ignores context and blocks resolvable cases. Escalating after exactly three unsuccessful calls uses an arbitrary counter that also penalizes legitimate steps. Escalating on detected anger or sarcasm hands off cases the agent could resolve, harming first-contact resolution.

## Scenario: Structured Data Extraction

### Question 25

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A healthcare data team uses Claude to extract `patient_id`, `specimen_site`, `collection_time`, and `critical_flag` from scanned pathology reports into JSON for a hospital integration. In a stability test, the same 60 reports are processed three times each; all outputs satisfy the JSON schema, but 11 reports alternate between two `specimen_site` values and 5 reports produce different `collection_time` values across runs. What is the best approach before sending these records to the integration engine?

- **A.** Select the first successful JSON object produced for each lab report as the canonical record, because a schema-valid response should be considered authoritative once generated.
- **B.** Process each report five more times and merge the results by taking the most common categorical value and the average timestamp when runs disagree.
- **C.** Document the observed variation as expected behavior for language-model extraction, keep the current pipeline, and let downstream systems handle occasional differences in `specimen_site` and `collection_time`.
- **D.** Run a consistency-focused debug pass on the repeated outputs, inspect the source passages and criteria for the unstable fields, then tighten instructions, schema constraints and model settings before re-testing.

#### Correct answer to Question 25: D

All outputs are schema-valid, yet some fields are unstable across runs: a sign of ambiguity in the sources or in the instructions. The right path is to diagnose the unstable cases, inspect the source passages, tighten criteria, constraints, settings and ambiguity handling, then re-test.

Taking the first schema-valid object picks an arbitrary result. Rerunning and merging by majority and average produces data that may not exist in the document. Documenting the variation as expected accepts unreliable data in a critical healthcare context.

## Scenario: Multi-Agent Research System

### Question 26

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

In a multi-agent research pipeline, the source-harvesting subagent calls an `extract_evidence_cards` tool that returns short claims, quoted passages, source URLs, retrieval timestamps, and section locators. The synthesis agent has begun treating these evidence cards as trusted inputs, but audits show that some locators and quotes do not match the retrieved pages. Which architecture change best enforces provenance before the evidence cards are used downstream?

- **A.** Expose a citation-audit tool and instruct the document specialist to call it whenever it is uncertain about a quote, locator, or source attribution.
- **B.** Have the coordinator agent review the assembled outline for missing or suspicious references after all specialist agents have finished their research passes.
- **C.** Strengthen the document specialist’s system prompt so it must only produce citations it has verified and must flag any uncertain provenance in its response.
- **D.** Attach a PostToolUse hook to the extraction tool that checks each emitted quote, URL, timestamp and locator against the source payload before accepting it.

#### Correct answer to Question 26: D

Provenance must be verified deterministically before the evidence enters the pipeline. A PostToolUse hook that compares quotes, URLs, timestamps and locators against the actual payload blocks inconsistent records at the source.

A citation-audit tool relies on the agent deciding when it is "uncertain." A final review by the coordinator checks too late, after the evidence has already shaped the work. Strengthening the system prompt is only an instruction: it helps but does not guarantee anything.

## Scenario: Claude Code for Continuous Integration

### Question 27

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A platform team is adding Claude Code checks to CI for pull requests in a GraphQL gateway. A recent incident occurred because a single automated review approved a resolver change while missing a subtle authorization regression. The team wants the new prompt architecture to produce more actionable findings without simply asking one reviewer to re-check its own answer. Which design choice has the strongest quality rationale?

- **A.** Run several isolated Claude Code review jobs against the same merge request mainly so the CI system can execute them in parallel and return the review faster than a single sequential prompt.
- **B.** Run several isolated Claude Code review jobs against the same merge request because multiple agents are easier to configure and maintain than one carefully designed review workflow.
- **C.** Run several isolated Claude Code review jobs against the same merge request because separate model invocations eliminate reviewer bias and make the final PR comment objectively neutral.
- **D.** Run several isolated Claude Code review jobs on the same merge request, each with a distinct rubric (API compatibility, data validation, tests), then merge the findings into one comment.

#### Correct answer to Question 27: D

Multiple independent reviews add value when each has a distinct focus (API compatibility, data validation, test adequacy): they cover different aspects instead of repeating the same check, and their findings are then merged into one comment.

Running parallel jobs mainly for CI speed justifies the choice only by speed. Claiming that multiple agents are easier to configure is false: they are more complex, not simpler. Claiming that separate invocations make the result objectively neutral overstates: they reduce self-confirmation bias, but do not remove it.

## Scenario: Structured Data Extraction

### Question 28

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A legal operations team uses Claude to extract structured lease abstracts from commercial real estate agreements, including commencement date, base rent, escalation formula, renewal options, and termination notice deadlines. The JSON Schema validator rejects malformed records, but attorneys still find cases where an extracted value is plausible and correctly typed yet comes from an exhibit, example calculation, or superseded amendment. The review team can inspect only a small fraction of the daily output. Which quality-control strategy is the best approach?

- **A.** Keep the schema checks unchanged and randomly audit 10% of completed lease records each week, using the audit results as a general quality metric for the extraction pipeline.
- **B.** After JSON Schema validation, send only records with missing required fields or null values to reviewers, and automatically approve records whose required fields have valid strings, numbers, and dates.
- **C.** Rank documents for review mainly by layout signals such as OCR noise, rotated pages, handwritten amendments, and unusual section headings, then inspect the leases with the most formatting anomalies first.
- **D.** Build a labeled validation set of lease abstracts, calibrate confidence separately for key fields like dates, rates and options, and route to reviewers when calibrated risk exceeds thresholds.

#### Correct answer to Question 28: D

Errors are plausible, correctly typed values from the wrong section: schema validation cannot detect them. With limited review capacity, you need confidence calibrated per field on a labeled set, with routing of high-risk cases according to reviewer capacity.

Random weekly audits measure quality but do not route review where it matters. Sending only records with missing fields checks something that is not the problem here. Ranking by layout signals uses cues that do not correlate with the actual error (a value taken from an exhibit or superseded amendment).

## Scenario: Developer Productivity with Claude

### Question 29

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A team is building a Claude Agent SDK assistant that generates React components across several product apps. The source of truth for accessibility labels, token usage, and component composition is maintained in a design-system portal, while individual repos contain a mix of old examples and partial notes. What is the best way to ensure the assistant follows the current design-system rules during code generation?

- **A.** Ask the engineer opening each task to paste the current design-system checklist into the initial prompt before the agent edits any files.
- **B.** Publish the UI library's design-system rules through an MCP server as a resource the agent consults before generating components.
- **C.** Have the agent scan existing component files and infer the required accessibility and styling rules from inline comments near similar implementations.
- **D.** Configure the agent to use Glob and Grep for files such as `*style*`, `*accessibility*`, and `*design*` whenever it starts work in a package.

#### Correct answer to Question 29: B

The source of truth lives outside the repos, which contain outdated examples. Exposing the rules through an MCP server (a resource or tool) gives the agent consistent, always-current access to the official guidance.

Pasting the checklist into every prompt depends on manual, error-prone copy-paste. Inferring the rules from component comments or searching files with Glob and Grep relies on repository code, which the scenario says contains old examples and partial notes.

### Question 30

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A Claude Agent SDK assistant is adding a `rotate-api-keys` command to a Go service's internal CLI. Using Glob, Grep, and Read, it finds that 11 of the 15 commands added in the last year are implemented through a `cmdregistry` package with shared flag parsing and logging, while four older commands define flags directly in `main.go`. The requirements are straightforward and do not require product behavior decisions. What is the best strategy for the agent when generating the new command?

- **A.** Implement the new CLI command with a new decorator-based framework because it reduces boilerplate compared with both patterns found in the repository.
- **B.** Copy the structure of whichever existing CLI command has the closest command name, even if that means using the older inline parser style for this one file.
- **C.** Use the command-registry pattern followed by most existing commands, and note in the implementation summary that it matches the dominant local convention.
- **D.** Pause generation and ask the user to choose between the command-registry module pattern and the older inline parser pattern before writing any code.

#### Correct answer to Question 30: C

When the codebase has a clear dominant convention (11 of 15 recent commands use `cmdregistry`) and requirements are straightforward, the agent should follow that convention and briefly document the choice, without blocking work.

A new decorator-based framework introduces a pattern not present in the project. Copying the command with the closest name chooses the model by name rather than by convention, and may adopt the deprecated style. Pausing to ask the user asks something the evidence already answers.

## Scenario: Claude Code for Continuous Integration

### Question 31

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A team is adding Claude Code to the CI pipeline for a database-backed inventory API. Developers are skeptical because a previous bot flooded pull requests with debatable comments about naming, layering, and possible edge cases. Which rollout approach is most likely to produce actionable feedback while increasing trust in the automated review over time?

- **A.** Start with a small set of explicit, high-confidence checks such as unsafe migration patterns and missing tests on touched modules, measure acceptance, and expand categories only once results are useful.
- **B.** Require the service owner to manually validate every Claude Code finding before it is shown to pull request authors, keeping the same broad prompt set but adding a human gate.
- **C.** Configure Claude Code to flag all suspected design, security, testing, documentation, and maintainability concerns immediately so the team can decide which categories are useful after several sprints.
- **D.** Run Claude Code in a read-only preview job that posts a summary artifact but does not comment on pull requests until developers ask for individual findings to be promoted.

#### Correct answer to Question 31: A

To build trust after a noisy bot, start small: a few explicit, high-confidence categories, measure comment acceptance, and expand only when results are consistently useful.

Requiring the service owner to validate every finding adds manual overhead without improving prompt quality. Flagging every possible concern repeats the flood of comments that destroyed trust. A read-only preview job is so cautious that it delivers no value directly in the pull request workflow.

## Scenario: Customer Support Resolution Agent

### Question 32

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A support resolution agent is handling a cancellation request: “Please cancel the extended warranty on contract C-90217.” It calls the MCP tool `lookup_order` with `contractNumber: "C-90217"`. The warranty service responds successfully, but the query returns no matching contract. Which tool response and agent behavior best handle this failure mode?

- **A.** Return `{ "isError": true, "errorCategory": "capacity", "isRetryable": true, "message": "Subscription service unavailable." }`, then tell the agent to wait briefly and call `lookup_order` again with the same contract number.
- **B.** Return a structured error (`isError: true`, `errorCategory: "not_found"`, non-retryable, clear message), then ask the customer to recheck the contract number or give another identifier such as the account email.
- **C.** Return `{ "isError": true, "errorCategory": "temporary_failure", "isRetryable": true, "message": "No matching row yet; retry may succeed." }`, then have the agent automatically retry three times before asking the customer anything.
- **D.** Return `{ "isError": false, "subscription": { "contractNumber": "C-90217", "status": "active", "customerName": "Unknown" } }`, then let the agent continue the return workflow while marking the account as unverified.

#### Correct answer to Question 32: B

The service responded correctly but found no contract: it is a non-retryable `not_found` error. The agent should report it in structured form and ask the customer to recheck the number or provide an alternative identifier.

Classifying the miss as a capacity or temporary failure triggers useless retries. Returning an "active" contract with an unknown customer fabricates a nonexistent record and continues the workflow on false data.

## Scenario: Multi-Agent Research System

### Question 33

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

A research coordinator invokes several Claude Agent SDK subagents through the Task tool to build a regulatory-change report. The timeline extractor is supposed to return a `ChronologyCard` containing `event_date`, `jurisdiction`, `change_summary`, `source_refs[]`, and `quoted_support`, but intermittent runs produce narrative text with missing dates that later shapes the report outline. Which configuration best enforces the expected result format before the coordinator uses these subagent findings?

- **A.** Let the coordinator proceed normally and add a synthesis instruction that it should ignore any ChronologyCard lacking an event_date, source reference, or quoted support when it composes the final timeline.
- **B.** Update the specialist prompts to say that every ChronologyCard must be valid JSON, include ISO dates, and perform a self-check for citations before sending the answer back.
- **C.** Have each specialist call a separate reviewer agent after drafting its ChronologyCard, with the reviewer returning an approval message that the coordinator can read alongside the original result.
- **D.** Register a PostToolUse hook on the Task calls to specialist agents that validates each ChronologyCard's fields and sources before it enters the coordinator context.

#### Correct answer to Question 33: D

To guarantee the format before the coordinator uses the results, deterministic validation is needed: a PostToolUse hook on the Task calls that parses the `ChronologyCard`, verifies required fields and references, and fails or requests repair.

Telling synthesis to ignore malformed cards still lets bad data into the coordinator context. Prompt rules with self-checks rely on the model and are not guaranteed. A separate reviewer agent adds an approval message but does not block or correct invalid output.

## Scenario: Structured Data Extraction

### Question 34

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A healthcare analytics team uses Claude to extract medication-change events from de-identified clinician notes. Each extracted event is stored as JSON and later used as labeled examples to train a smaller classifier that detects dose increases, discontinuations, and substitutions. The JSON schema validation is reliable, but reviewers worry that some extracted events are plausible-looking yet not clearly supported by the note. Which approach is best for preparing these records for model training?

- **A.** Track the extractor’s overall F1 score on a monthly benchmark and allow any schema-valid record into the corpus as long as the aggregate metric stays above the team’s target.
- **B.** Lower the inclusion threshold so the corpus captures more rare procedure mentions, then rely on the downstream model to generalize away occasional incorrect examples during training.
- **C.** Require each accepted snippet to carry a calibrated confidence score and source span, use conservative thresholds for automatic inclusion, and audit sampled records periodically.
- **D.** Reuse the production extraction workflow unchanged because it already validates JSON shape, retries malformed responses, and logs document-level processing status.

#### Correct answer to Question 34: C

Training data must be high quality: errors propagate into the trained model. You need traceability (source span), calibrated confidence with conservative inclusion thresholds, and periodic human audits.

A good aggregate F1 score can hide specific errors. Lowering the inclusion threshold reduces quality and assumes the model will "generalize away" noise. Reusing the production workflow unchanged validates only JSON shape, which says nothing about whether the content is supported by the note.

### Question 35

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A finance team is building a Claude-based pipeline to extract purchase order numbers, line-item totals, tax amounts, payment terms, and remittance addresses from 250,000 vendor invoices into a JSON-schema-validated accounts payable system. The archive includes emailed PDFs, OCR from paper scans, international invoices, and several vendor-specific layouts. What is the best approach before running the full historical backfill?

- **A.** Pilot on a stratified sample of invoices, review the JSON outputs against the source files, then adjust schema and prompt before the backfill.
- **B.** Start the production batch with monitoring enabled, then use any failures or downstream complaints from the accounting system to tune the prompt afterward.
- **C.** Test the workflow on one recently issued invoice from the standard template, confirm that it passes schema validation, then process the remaining archive.
- **D.** Proceed directly with the full invoice archive because a well-specified JSON schema and a capable model should generalize across the document set.

#### Correct answer to Question 35: A

Before a large, heterogeneous backfill (PDFs, OCR, international invoices, varied layouts), a pilot on a stratified sample with manual review against the sources is needed to refine schema and prompt.

Starting production with monitoring uses production as a test. Testing one standard invoice does not represent the variety. Running the full archive directly assumes that schema plus model is enough without empirical verification.

## Scenario: Claude Code for Continuous Integration

### Question 36

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A repository’s CI review step uses Claude Code to comment on pull requests. The platform team wants Terraform changes under `infra/terraform/` reviewed for state and provider risks, backend TypeScript under `packages/api/` checked against internal error-handling conventions, and Jupyter notebooks under `notebooks/` reviewed only for reproducibility notes. Which configuration approach should you use so Claude Code applies these standards automatically according to the files changed?

- **A.** Create rule files under `.claude/rules/` with path globs such as `infra/terraform/**/*.tf`, each holding the review guidance for that area.
- **B.** Place separate `CLAUDE.md` files inside `infra/terraform/`, `packages/api/`, and `notebooks/` so each directory carries its own local review instructions.
- **C.** Define `/review-infra`, `/review-api`, and `/review-notebooks` commands in `.claude/commands/` and have reviewers rely on the matching command for each pull request.
- **D.** Add a single `.claude-policy.yml` file at the repository root with `if path startsWith(...)` branches that switch review criteria for each folder.

#### Correct answer to Question 36: A

Rule files in `.claude/rules/` with `paths` globs are applied automatically according to the changed files: exactly the requested path-based behavior, across multiple directories and file types.

Separate `CLAUDE.md` files per folder work by directory but are less precise than globs by extension (e.g., `*.tf`, `*.ipynb`). Dedicated slash commands require manual invocation. A `.claude-policy.yml` file with path branches does not exist.

## Scenario: Developer Productivity with Claude

### Question 37

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A Claude Agent SDK-based repository assistant needs to allow deployments from `release/*` branches. The setting lives in an existing `deploy-rules.jsonc` file that includes maintainer comments about production safeguards and uses a consistent indentation pattern that differs from the project formatter. What is the best editing strategy for the agent?

- **A.** Rewrite `deploy-rules.jsonc` with sorted keys, standardized two-space indentation, and no comments while adding the new branch pattern.
- **B.** Ask the user to choose a preferred JSONC formatting convention before changing the branch rule, even though the file already has a consistent style.
- **C.** Read `deploy-rules.jsonc`, update only `protectedBranches` to include `release/*`, and keep comments, ordering and indentation intact.
- **D.** Create a new `deploy-rules.generated.jsonc` with the revised branch rule and configure the workflow to load it before the original file.

#### Correct answer to Question 37: C

When editing an existing configuration file, the change should be minimal and targeted: read the file, update only the needed array, and preserve comments, ordering and indentation (the comments contain important safety information).

Rewriting the file with sorted keys and no comments reformats it and deletes maintainer comments. Asking the user about formatting requests an unnecessary decision, since the file already has a consistent style. A separate generated file creates a duplicate and an ambiguous loading order.

## Scenario: Multi-Agent Research System

### Question 38

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

In a market research system, a SourceCheck subagent verifies quotations from embargoed participant interview transcripts before the synthesis agent writes a trend report. The web-search, synthesis, and report agents should never be able to browse those transcripts, and even SourceCheck should see only excerpts approved for the current client engagement. Which design is the best approach for securing SourceCheck’s access?

- **A.** Give the SourceCheck subagent the full document repository toolset, but include system instructions telling it to open embargoed survey files only when the coordinator says they are needed.
- **B.** Allow the SourceCheck subagent to retrieve complete embargoed survey files, then have the synthesis subagent redact fields that should not appear in the final research brief.
- **C.** Place all embargoed survey tools on a separate MCP server available only to the research workspace, and let any subagent connected to that server call whichever repository tools it exposes.
- **D.** Give the SourceCheck subagent only a scoped `fetch_approved_excerpt` tool that verifies the study ID and project clearance, returns only the permitted passage, and logs each access.

#### Correct answer to Question 38: D

Access to sensitive data must be limited at the tool level (least privilege): SourceCheck receives only a scoped tool that checks clearance, returns only the permitted excerpt and logs every access.

Giving the full toolset with prompt instructions relies on the prompt to protect embargoed data. Retrieving complete files and redacting later exposes the data and redacts too late. A separate MCP server for the workspace grants access to every connected agent, without per-agent or per-engagement scoping.

## Scenario: Structured Data Extraction

### Question 39

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A claims intake team uses Claude to extract policyholder details from uploaded loss notices, adjuster notes, and scanned repair estimates. During testing, the same packet sometimes contains different insured addresses, such as a mailing address in the notice and a property address in the estimate. The claims platform can automatically route records to a review queue when the JSON output marks a field as uncertain.

Which JSON schema design is the best choice for the `insured_address` field?

- **A.** Store `insured_address` as the address string that appears most often across the packet, with validation passing when any address occurs twice.
- **B.** Store `insured_address` as the first address Claude encounters in the packet, using the upload order as the tie-breaker for conflicting values.
- **C.** Make `insured_address` required and reject the entire extraction whenever Claude finds more than one plausible address in the submission packet.
- **D.** Model `insured_address` as an object with `normalized_value`, `candidates` (each address found, with its source section), `has_conflict` and `conflict_note`.

#### Correct answer to Question 39: D

Conflicting values must be modeled, not hidden: an object with a normalized value, a list of candidates with their source, and conflict flags lets the platform route uncertain records to review.

Choosing the most frequent or the first address picks a value heuristically and loses the conflict. Rejecting the whole extraction whenever several addresses appear discards everything instead of reporting the field-level uncertainty.

## Scenario: Code Generation with Claude Code

### Question 40

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A monorepo has a root `CLAUDE.md` with baseline engineering practices and a `packages/ui/CLAUDE.md` with component-library guidance. The team also keeps scoped conventions with selectors such as `packages/ui/**`, `**/*.tsx`, `**/*.stories.tsx`, `apps/api/**`, and `migrations/**/*.sql`. A developer asks Claude Code to update `packages/ui/src/components/DatePicker.stories.tsx`. Which configuration behavior should you expect?

- **A.** Claude Code should select the most specific matching rule, such as the Storybook rule, and ignore broader matches like `packages/ui/**` or `**/*.tsx`.
- **B.** Claude Code should load every convention file in the repository, including backend, database, mobile, and deployment rules, so the edit is checked against the full project policy set.
- **C.** It combines the root instructions, `packages/ui/CLAUDE.md`, and any scoped rules whose globs match the stories file, such as TSX or Storybook conventions.
- **D.** Claude Code should use only the root `CLAUDE.md` unless it explicitly links to `packages/ui/CLAUDE.md` and imports the Storybook convention file by name.

#### Correct answer to Question 40: C

In Claude Code instructions are cumulative: the root `CLAUDE.md`, the `CLAUDE.md` of the folder containing the file, and all scoped rules whose globs match the path (`packages/ui/**`, `**/*.tsx`, `**/*.stories.tsx`).

Selecting only the most specific rule is wrong: there is no "most specific wins" selection, all matching rules apply. Loading every convention file brings in irrelevant rules. Requiring explicit links is wrong: subfolder `CLAUDE.md` files and scoped rules load without them.

## Scenario: Developer Productivity with Claude

### Question 41

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A platform team adds an MCP server to Claude Code with a tool called `api_migration_risk`. The tool can compare OpenAPI specs, generated SDKs, route handlers, serialization code, and release notes to identify which downstream services may break after an endpoint change. In practice, when engineers ask, “Will renaming `customerStatus` in `/v2/accounts` break any clients?”, the agent usually searches the repo with Grep and returns matching files. The current MCP tool description is: “Finds API changes.” What is the best way to improve the agent’s tool selection?

- **A.** Split the MCP tool into separate tools for routes, schemas, generated clients, and changelog entries, so the agent has more specific operations to choose from for each artifact type.
- **B.** Add a project-level instruction telling the agent to prefer the API migration MCP server before using Bash or Grep for any question that mentions endpoints, clients, or schemas.
- **C.** Remove access to the built-in Grep tool for repositories that use the API migration server, so the agent must call the MCP tool whenever engineers ask about endpoint or schema changes.
- **D.** Rewrite the MCP tool's name, description and input schema to explain its API compatibility analysis across clients and versions, and the migration-risk summary it returns.

#### Correct answer to Question 41: D

The agent picks tools based on their metadata. A description like "Finds API changes" does not communicate the tool's value, so the agent falls back to Grep. Rewriting name, description and input schema to explain what it analyzes and what it returns makes it the natural choice.

Splitting the tool into narrower ones fragments the capability without fixing the poor description. A project instruction to prefer the server is a workaround that does not address the cause. Removing Grep takes away a useful tool and forces behavior rigidly.

## Scenario: Customer Support Resolution Agent

### Question 42

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

Your Claude Agent SDK support agent handles subscription disputes for a streaming service. In a pilot, it correctly resolves most “I forgot to cancel” cases, but it sometimes calls process_refund after a user says their account was taken over, the card was charged from a new country, and two recent password reset attempts failed. You want to preserve high first-contact resolution for ordinary billing issues while preventing risky refunds from being issued automatically. Which design is the best approach?

- **A.** Update the system prompt to say, “Be careful with fraud, suspicious accounts, and unusual refund requests; escalate anything risky,” and allow the agent to decide whether process_refund is appropriate in each conversation.
- **B.** Name observable escalation triggers in the prompt and add a PreToolUse guard on process_refund that blocks refunds on signals like unauthorized-charge claims, fraud flags or repeated failed identity checks.
- **C.** Require a supervisor approval step for every process_refund call, regardless of customer history, refund amount, dispute reason, or account risk indicators, so no refund can be issued autonomously by the agent.
- **D.** Accept that some fraud-related refund attempts will slip through because ambiguous support conversations cannot be reliably classified, and focus post-launch monitoring on reversing incorrect refunds after they occur.

#### Correct answer to Question 42: B

Combine two levels: prompt rules with observable triggers (guiding the model) and a deterministic PreToolUse guard on `process_refund` that blocks risky refunds and redirects to `escalate_to_human`. Ordinary cases stay automated.

A generic "be careful with fraud" prompt is vague and unenforceable. Supervisor approval for every refund destroys first-contact resolution. Accepting that some fraud slips through accepts preventable losses.

## Scenario: Multi-Agent Research System

### Question 43

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

A coordinator agent assigns a web-investigation subagent to verify whether a startup’s report about “low-carbon cement credits” is supported by public sources. Initial searches may uncover alternate program names, regional policy differences, or sources that contradict the report’s terminology. Which design is the best approach for this subagent’s search workflow?

- **A.** Configure the coordinator to generate a broad batch of likely searches at the start, have the subagent run all of them in parallel, and summarize whatever comes back.
- **B.** Configure the web-investigation subagent with search and fetch tools, pass it the claim and citation requirements, and let it iterate on queries until it has enough evidence.
- **C.** Configure the coordinator to call the web-investigation subagent once per query, review each returned result itself, and re-prompt the subagent with the next query when needed.
- **D.** Configure the web-investigation subagent to follow a fixed sequence: search the exact claim text, fetch the top three pages, extract snippets, and return without revising the plan.

#### Correct answer to Question 43: B

Web research is exploratory: results reveal alternate names and contradictions that call for new queries. The subagent needs its tools, the goal and the citation requirements, plus the autonomy to iterate until it has enough evidence.

Generating all searches up front fixes the queries before learning anything from the results. Calling the subagent once per query turns the coordinator into a micromanager and wastes its context. A fixed search-and-fetch sequence cannot adapt.

## Scenario: Developer Productivity with Claude

### Question 44

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A developer productivity team integrates an MCP server into Claude Code with a tool named `ci_failure_triage`. The tool can inspect CI logs, recent commits, flaky-test records, dependency changes, and code ownership to explain why a test suite likely failed. However, when engineers ask questions such as “Why did `InventoryReconcileTest` start failing after yesterday’s merge?”, the agent usually runs Grep over the repository and pasted logs, then returns scattered matches. The current tool description is only: “Looks up test failures.” What is the best approach to improve the agent’s tool selection?

- **A.** Rewrite the tool metadata to say `ci_failure_triage` correlates failing tests with recent commits, flaky-test history, ownership and dependency changes, returning ranked hypotheses with evidence.
- **B.** Remove the built-in Grep tool from the agent profile whenever the CI MCP server is enabled, so test-debugging requests cannot be satisfied by ordinary text search across logs and source files.
- **C.** Add a project-level instruction that says, “For any failing test question, call `ci_failure_triage` before using built-in tools,” while keeping the MCP tool name, description, and schema unchanged.
- **D.** Replace `ci_failure_triage` with several narrower MCP tools such as `get_flaky_tests`, `find_recent_commits`, `lookup_test_owner`, and `scan_ci_logs`, each with the same short description format.

#### Correct answer to Question 44: A

The tool exists but the agent does not choose it because the description ("Looks up test failures") is too poor. Describing what it correlates and what it returns (ranked hypotheses, evidence, next commands) improves tool selection.

Removing Grep when the CI server is enabled takes away a tool that is still useful. A project instruction to call the tool first imposes a rule without making the tool understandable. Replacing it with narrower tools fragments it, with descriptions just as poor.

## Scenario: Code Generation with Claude Code

### Question 45

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Your team uses a Claude Code slash command, `/gen-validator`, to create Kotlin validators for checkout API payloads. The generated classes compile and match the project structure, but they repeatedly disagree with product rules for edge cases such as zero-value gift card orders, absent currency fields, and mutually exclusive discount types. Which prompt improvement is the best next step to make the generated validators more consistently correct?

- **A.** Revise `/gen-validator` with representative request/response examples and a few executable tests for boundary amounts, missing currency codes and discounts.
- **B.** Require `/gen-validator` to enter plan mode for every validator task and approve a step-by-step implementation outline before any code is generated.
- **C.** Update `CLAUDE.md` with stricter naming conventions for validator classes, helper methods, and error constants so generated files match the team’s style guide.
- **D.** Increase the maximum repository context loaded by `/gen-validator` so Claude Code can inspect more controllers, DTOs, and prior validator files before writing code.

#### Correct answer to Question 45: A

The code is structurally correct but violates product rules on edge cases: the model does not know the expected semantics. Concrete examples and executable tests on boundary cases (zero amounts, missing currency, conflicting discounts) define the expected behavior unambiguously.

Mandatory plan mode adds process but not knowledge of the rules. Stricter naming conventions in `CLAUDE.md` touch only style. Loading more repository context adds files that do not contain the missing product rules.

## Scenario: Claude Code for Continuous Integration

### Question 46

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A CI workflow runs Claude Code after each pull request to suggest pytest coverage for modified Python services. The tests are syntactically valid, but reviewers repeatedly comment that they ignore the project’s fixture conventions, use different test name phrasing, avoid parametrized cases, and miss the usual boundary-condition checks. What is the best prompting approach to make the generated tests match the team’s established test style?

- **A.** Add a broader testing section to CLAUDE.md describing the repository’s quality standards, then let the CI job rely on that global guidance when creating tests.
- **B.** Include representative pytest files or snippets in the CI prompt, and ask Claude Code to follow their fixture usage, naming, parametrization style and coverage depth.
- **C.** Write a concise paragraph in the prompt explaining that tests should be idiomatic, readable, isolated, and cover normal, boundary, and failure cases.
- **D.** Tell Claude Code to inspect the repository and make the new tests look like the existing test suite without providing any selected examples in the prompt.

#### Correct answer to Question 46: B

To replicate a specific style (fixtures, naming, parametrization, coverage depth), selected examples in the prompt are the most effective technique: they show concretely what generic descriptions cannot convey.

A broader testing section in `CLAUDE.md` or a paragraph about idiomatic tests describes quality in abstract terms that do not capture the team's conventions. Asking Claude to inspect the repository on its own does not tell it which examples are representative.

## Scenario: Structured Data Extraction

### Question 47

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A finance team is using Claude to extract vendor name, invoice total, tax amount, and purchase order number into a JSON schema from expense receipts. The intake folder contains a mix of emailed PDF receipts, photographed paper slips with glare, and old scanned invoices with faded text; the accounts payable system needs to decide which extracted records can be posted automatically and which need review. Which approach is best?

- **A.** Add an ingestion stage that detects document type and quality, runs OCR when needed, and records the steps applied with each extraction.
- **B.** Configure the pipeline to decline any receipt image below a minimum resolution or contrast threshold, accepting only clean digital PDFs for automated JSON extraction.
- **C.** Require vendors to resubmit only high-resolution, upright, machine-generated receipts and exclude preprocessing details from the supplier payment system.
- **D.** Send all uploaded files directly to Claude without OCR or image correction so the fastest path is always used before JSON schema validation runs.

#### Correct answer to Question 47: A

Inputs of varying quality call for a preprocessing stage: detect type and quality, apply OCR/cleanup when needed, and record the steps and quality signals. These signals then feed the decision between automatic posting and review.

Declining low-quality images or requiring vendors to resubmit excludes legitimate documents instead of handling them. Sending everything without OCR skips preprocessing and loses the signals needed to calibrate confidence.

## Scenario: Multi-Agent Research System

### Question 48

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

In your multi-agent research system, the report-generation subagent receives candidate citations from upstream agents and must produce a structured bibliography section with fields for citation text, source reliability, evidence role, and whether the source should be included. The JSON usually validates, but reviewers find that blog posts are sometimes treated like peer-reviewed papers, inaccessible sources are included without warnings, and sources with only tangential relevance are not downgraded. You want to improve the subagent’s consistency using few-shot prompting. Which approach is best?

- **A.** Add a compact set of annotated examples of well-formed, rejected and ambiguous bibliography entries, with the exact structured output expected for each.
- **B.** Show only polished bibliography entries from previous high-scoring reports so the subagent imitates the best final outputs without being exposed to mistakes.
- **C.** Replace examples with a detailed JSON schema describing fields such as source_type, citation_status, confidence, and rejection_reason, then rely on validation to enforce quality.
- **D.** Provide a library of raw source snippets and citation metadata that represent typical inputs, but omit the completed bibliography records to avoid overfitting the format.

#### Correct answer to Question 48: A

Effective few-shot examples cover not only ideal cases but also edge cases and negative cases: well-formed entries, downgraded or rejected entries, ambiguous sources, each with the exact expected output. This teaches the decision criteria.

Showing only polished entries teaches nothing about when to downgrade or reject. A detailed JSON schema validates structure but not judgment. Raw snippets without completed entries provide inputs without the expected outputs, so they do not demonstrate the behavior.

## Scenario: Code Generation with Claude Code

### Question 49

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A team defines a custom Claude Code skill in `.claude/skills/dependency-review/SKILL.md` for investigating transitive package updates before editing code:

```yaml
---
name: dependency-review
description: Inspect lockfile changes and identify risky package upgrades
context: fork
---
```

A developer invokes this skill midway through a long feature implementation session. What does the `context: fork` setting do?

- **A.** It lets the dependency-review skill append all investigation notes directly into the active conversation, so later prompts automatically include every detail it inspected.
- **B.** It runs the dependency-review skill in a separate sub-agent context, so its exploratory file reads and intermediate findings do not become part of the main session history.
- **C.** It creates a temporary Git fork of the repository, so the dependency-review skill can test package changes without touching the developer's working tree.
- **D.** It starts the dependency-review skill as a concurrent worker, so the developer can continue issuing unrelated Claude Code commands while it runs in parallel.

#### Correct answer to Question 49: B

`context: fork` runs the skill in an isolated subagent context: exploratory reads and intermediate findings stay out of the main conversation, which receives only the final result. Useful in long sessions to avoid filling the context.

Appending all notes to the active conversation describes the opposite behavior. A temporary Git fork confuses the term with Git. A concurrent worker is also wrong: the fork is about context isolation, not running in parallel with the main session.

### Question 50

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A backend team is adding a shared “log-inspector” MCP server so Claude Code can query sanitized production traces while developers debug service regressions. The server setup should be picked up by anyone who clones the service repository and should go through pull request review with the rest of the project configuration. Where should this MCP server configuration be placed?

- **A.** Ask each engineer to add the MCP server entry to their personal `~/.claude.json` file during onboarding.
- **B.** Add the MCP server details to `.claude/rules/api.md` so they load when developers work on API-related files.
- **C.** Commit a `.mcp.json` with the shared MCP server definition at the root of the repository or under `.claude/`.
- **D.** Create a `.mcp/servers.json` folder structure in the repository and store the shared MCP endpoint details there.

#### Correct answer to Question 50: C

A shared MCP server that must reach whoever clones the repo, with review, goes in a `.mcp.json` committed to the project.

A personal `~/.claude.json` entry is unshared and unreviewed. Rules files such as `.claude/rules/api.md` are not for MCP configuration. A `.mcp/servers.json` folder is a path Claude Code does not recognize.

## Scenario: Multi-Agent Research System

### Question 51

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

In a multi-agent research system, the synthesis subagent calls an MCP trend-extraction tool after the web and document-analysis subagents gather evidence for a report on coastal flood insurance. The tool returns `isError: false`, but several extracted themes cite nonexistent source IDs, two trend labels contradict the underlying notes, and the confidence field is replaced with free-text comments. What is the best way to handle this failure mode?

- **A.** Add a coordinator hook that inspects every downstream MCP response, repairs questionable theme data centrally, and overrides subagent decisions whenever output quality looks poor.
- **B.** Configure the tool wrapper to retry the same trend-extraction call three times automatically before the synthesis subagent is allowed to inspect the payload.
- **C.** Abort the research run and return a user-facing outage message because malformed theme data means the system can no longer produce a trustworthy report.
- **D.** Treat the result as suspect but nonfatal context, then choose whether to rerun with narrower inputs, request passages, or keep only verifiable themes.

#### Correct answer to Question 51: D

The tool returned `isError: false` but the content is semantically unreliable. The subagent with domain context should treat it as suspect but nonfatal and adapt its strategy (rerun with narrower inputs, request supporting passages, keep only verifiable themes).

A coordinator hook that repairs data centrally lacks the specific context. Retrying the same call three times will likely produce the same problem. Aborting the whole run is excessive when the problem can be recovered locally.

## Scenario: Claude Code for Continuous Integration

### Question 52

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A CI team is piloting Claude Code reviews for a repository that includes a latency-sensitive inference service, Terraform modules, audit logging code, and a large integration-test suite. Pull requests often contain changes that touch several of these areas at once, and the team wants concise PR comments that identify real defects without flooding authors with overlapping findings. Which architecture is the best fit?

- **A.** Assign the pull request to one general Claude Code reviewer with access to all repository tools and a single broad checklist covering security, performance, tests, and maintainability.
- **B.** Run a fixed sequence where a style agent reviews first, then a security agent, then a performance agent, and finally a test agent, with each stage passing only its approved comments to the next stage.
- **C.** Route the diff to security, performance, test-quality and maintainability agents with scoped tools and rubrics; a coordinator then merges findings, removes duplicates and checks interactions.
- **D.** Launch separate security, performance, test-quality, and maintainability agents in parallel, then post each agent's JSON output directly to the pull request as separate review threads.

#### Correct answer to Question 52: C

PRs that touch several domains benefit from specialized agents with scoped tools and rubrics, plus a coordinator that merges, deduplicates and checks cross-domain interactions: in-depth coverage with concise comments.

A single generalist reviewer with a broad checklist is less thorough. A fixed sequence of agents loses parallelism and filters prematurely. Posting each agent's output directly adds duplicates and noise to the pull request.

### Question 53

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A release pipeline now runs separate Claude Code agents for migration review, API contract checks, and changelog drafting before a merge can proceed. The migration reviewer needs database diff tools, the API reviewer needs schema and endpoint inspection tools, and the changelog writer only needs repository read access. Which configuration choice best enforces these role boundaries?

- **A.** Define separate Task configurations for each reviewer agent and set each Task's allowedTools to only the commands, MCP tools, or file operations required for that agent's CI responsibility.
- **B.** Create a shared naming convention such as qaTools, securityTools, and docsTools in the workflow design, then tell each reviewer agent to use only the group matching its assigned label.
- **C.** Put a strict instruction in the system prompt for each reviewer agent stating that it must never call tools unrelated to its review category during pull-request checks.
- **D.** Give every reviewer agent the complete CI toolset, but describe its role narrowly so the model chooses only the capabilities that fit the requested analysis.

#### Correct answer to Question 53: A

Role boundaries are enforced through configuration, not prompts: a separate Task configuration per agent with an `allowedTools` list limited to what is needed (least privilege).

A naming convention or a strict system prompt instruction relies on rules the model may not follow. Giving every agent the full toolset grants full access and hopes the role description is enough.

## Scenario: Structured Data Extraction

### Question 54

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A healthcare revenue team uses Claude to extract procedure dates, payer names, denial reasons, and appeal deadlines from insurance letters into a JSON-validated workflow. New payer portals have started generating letters with different section headings and more free-text policy language, but the extracted objects still usually satisfy the schema. Which monitoring strategy is most appropriate for detecting whether extraction reliability is degrading over time?

- **A.** Track field- and segment-level confidence continuously by vendor, document type and language; alert on sustained drops and route sampled records to validation.
- **B.** Compare a small batch of extracted records with human annotations twice per year and adjust prompts only if the sampled error rate is higher than expected.
- **C.** Run a complete regression test against a frozen benchmark set at the end of each release cycle and use the result as the primary signal of extraction health.
- **D.** Monitor only JSON Schema pass rates and production exception counts, assuming extraction accuracy remains steady unless the schema or Claude prompt is changed.

#### Correct answer to Question 54: A

Degradation shows up as semantically wrong but still schema-valid values. Continuous monitoring of field-level confidence metrics, segmented by vendor/type/language, with alerts and sampled human or benchmark validation, catches drift early.

Comparing a small batch twice a year is too infrequent to catch changes. A frozen benchmark at each release does not include the new letter formats. Monitoring only schema pass rates and exceptions checks the structure, which keeps passing even as content degrades.

## Scenario: Developer Productivity with Claude

### Question 55

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A Claude Code agent has added a “regional invoice export” option to an internal billing app. The work changed a Python API endpoint, a SQLAlchemy query helper, a Vue component, a feature-flag YAML file, and the operator guide that lists export limitations. What is the best next step before the agent tells the engineer the feature is finished?

- **A.** Summarize the files the agent edited, note that the new code follows the existing patterns, and mark the feature complete because the implementation steps were successfully applied.
- **B.** Ask the engineer to pull the branch, run the dashboard locally, and confirm the export results manually because they know the expected workflow better than the agent.
- **C.** Add one new regression test for the export edge case, save it beside the existing tests, and report that the feature is verified because coverage was added for the main behavior.
- **D.** Use Bash to run the project's relevant unit and integration tests and the build or type-check for affected packages, and review changed docs before reporting completion.

#### Correct answer to Question 55: D

Before declaring completion, the agent must verify concretely: run the relevant unit and integration tests, the build or type-check of the affected packages, and review docs/config for consistency.

Summarizing the edits and marking the feature complete declares success without verification. Asking the engineer to test locally delegates checks the agent can run itself. Adding a single regression test treats one test as full verification.

### Question 56

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A Claude Agent SDK assistant helped a platform team understand how warehouse inventory events flow through a .NET service, including projections, retry queues, and generated DTOs. The investigation was saved under a session ID after the agent produced a dependency map and TODO list. Two days later, the team wants to continue generating boilerplate handlers, and the build system reports that only `src/Inventory/OrderProjector.cs` and `schemas/warehouse_events.json` changed since the saved run. What is the best approach for resuming the work?

- **A.** Resume the saved session and ask the agent to reread every file it inspected during the first warehouse-event analysis before doing any new work.
- **B.** Resume the saved session and pass it the list of changed artifacts, so the agent re-checks those areas before extending its earlier map.
- **C.** Start a brand-new session and have the agent rediscover the event pipeline from scratch, ignoring the previously saved investigation notes.
- **D.** Resume the saved session without mentioning file changes, relying on the agent’s previous notes about projections and event schemas to remain valid.

#### Correct answer to Question 56: B

Resuming the session preserves the analysis work; telling the agent which files changed lets it update only the affected areas, efficiently and without relying on stale information.

Rereading every file wastes time and context. A brand-new session throws away useful work. Resuming without mentioning the changes risks building on assumptions they have invalidated.

### Question 57

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A Claude Agent SDK assistant has completed a deep pass over a warehouse inventory system, using Read, Grep, Bash, and an MCP database schema server to identify concurrency hotspots, audit-log requirements, fragile stored procedures, and downstream reporting dependencies. The architects now want Claude to explore three different remediation plans: introducing event sourcing, tightening the existing relational schema, and adding a read-model/cache layer. They need every plan to begin from the same discovery work, but they do not want assumptions or findings from one plan to leak into the others. Which workflow should they use?

- **A.** Resume the original session and ask Claude to evaluate all three proposals sequentially in the same thread, inserting separators between the event-sourcing, schema-hardening, and cache analyses.
- **B.** Resume the original session for the event-sourcing design, then open fresh sessions with exported notes for the schema-hardening and cache proposals so the first path retains the complete history.
- **C.** Fork the post-discovery session into one branch per design (event sourcing, schema hardening, read-model/cache), so each branch inherits the same investigation but evolves independently.
- **D.** Start three brand-new sessions and paste a short written summary of the earlier findings into each before asking Claude to analyze the event-sourcing, schema-hardening, and cache proposals.

#### Correct answer to Question 57: C

Forking from the post-discovery state gives every branch the same complete investigation, but each evolves independently: no contamination between alternatives.

Evaluating the three proposals sequentially in one thread mixes the analyses and lets assumptions leak. Resuming for one design and exporting notes for the others favors one branch and loses detail in the rest. Three new sessions with a short summary replace the full context with a summary.

## Scenario: Customer Support Resolution Agent

### Question 58

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A support agent uses an MCP tool named `apply_account_credit` to resolve billing complaints by issuing courtesy credits. In staging, failed calls look identical to the agent whether the customer has exceeded the courtesy-credit limit, the invoice is already closed, or the billing ledger is temporarily unavailable. What is the best design for the tool’s error response so the agent can handle these cases reliably?

- **A.** Implement automatic retries inside `apply_account_credit` for database locks and return only success or a generic failure after the retry limit is reached.
- **B.** Return a typed error from `apply_account_credit`, such as `{ code, category, retryable, user_message, correlation_id }`, marking ledger outages retryable and explaining policy denials safely.
- **C.** Add a separate `check_credit_eligibility` tool that the agent must call before `apply_account_credit`, while keeping `apply_account_credit` failures as generic exceptions.
- **D.** Return a single natural-language `error` string from `apply_account_credit`, such as “credit could not be posted,” and let Claude decide from the wording whether the customer should be told to wait or be denied.

#### Correct answer to Question 58: B

For the agent to react correctly it must distinguish the cases: a typed error with code, category, retryability, a customer-safe message and a correlation ID. Transient outages are marked as retryable; policy denials come with an explanation.

Internal retries that return a generic failure collapse every case into one. An eligibility tool adds a step but leaves failures indistinguishable. A single natural-language error string forces the agent to infer the cause from ambiguous text.

## Scenario: Multi-Agent Research System

### Question 59

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

A multi-agent research system was interrupted while preparing a compensation benchmark for machine learning engineers. After restarting the coordinator with `--resume`, the product lead changes the assignment: compare only European fintech companies, normalize salaries to EUR, ignore data older than 18 months, and rank sources by auditability. Which context-management approach should the coordinator use before sending more work to its salary-data, document-analysis, synthesis, and report subagents?

- **A.** Abandon the resumed session and start a completely new coordinator run because interrupted sessions cannot be trusted to preserve enough context for reliable downstream research.
- **B.** Resume the coordinator session and invoke the market-data and report-writing subagents normally, relying on them to read the coordinator’s latest messages and align with the new scope.
- **C.** Use fork_session from the original coordinator state and spawn the subagents from the fork, expecting the branch to carry the revised requirements into their work automatically.
- **D.** Resume the coordinator session, summarize the existing findings, and include the new European-only scope, salary-normalization rule, source limits and ranking rubric in each later subagent call.

#### Correct answer to Question 59: D

Subagents do not automatically inherit the coordinator's history. After resuming the session, the coordinator must pass explicitly, in every invocation, a summary of the findings and the new requirements (scope, normalization, source limits, ranking).

Starting a completely new run throws away the existing context. Invoking the subagents normally assumes they read the coordinator's messages, which they do not. Forking the coordinator does not inject the new requirements into the subagents.

## Scenario: Structured Data Extraction

### Question 60

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A legal operations team uses Claude to extract contract terms into a JSON object validated by a schema requiring `counterpartyName`, `leaseStart`, `renewalWindow`, and `terminationNoticeDays`. The JSON is always well formed and includes every required key, but review of commercial leases from different property managers shows `renewalWindow` is frequently `null` even though attorneys can find it in paragraphs, tables, and footnotes using wording such as "extension option," "holdover renewal," or "tenant may extend." What is the best next intervention to improve extraction accuracy?

- **A.** Add few-shot examples showing how to fill `leaseStart`, `renewalWindow` and `terminationNoticeDays` from varied layouts, keeping schema validation.
- **B.** Add a preprocessing script that uses regular expressions for phrases such as "renewal term" and "auto-renews" and copies the next sentence into `renewalWindow`.
- **C.** Make `renewalWindow` optional in the JSON schema so contracts with unusual wording can pass downstream processing without being flagged for review.
- **D.** When `renewalWindow` is blank, automatically resubmit the same prompt up to three times and accept the first response that contains a non-empty value.

#### Correct answer to Question 60: A

The field exists in the documents but is expressed with varied wording and positions (paragraphs, tables, footnotes). Few-shot examples covering layouts and synonyms teach the model to recognize it, while schema validation keeps catching omissions.

Regex preprocessing is fragile and does not handle synonyms and tables. Making `renewalWindow` optional hides the problem. Resubmitting until a value appears hopes for a different answer and may accept invented content.
