---
title: "Practice Test 3 – Claude Certified Architect"
duration_minutes: 120
---

# Questions and Answers: Practice Test 3 – Claude Certified Architect

## Scenario: Developer Productivity with Claude

### Question 1

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A Claude Agent SDK productivity assistant is configured with two MCP servers: `symbols-index`, which exposes tools for locating definitions and call sites across a monorepo, and `GitHub-review`, which exposes tools for reading pull request comments and posting review notes. A developer asks the agent to trace a deprecated helper, update the affected files, and leave a summary on the pull request. Which statement best describes the agent’s MCP tool access in this setup?

- **A.** For each request, the agent chooses one active MCP server, so it must finish all code-index work before starting a separate GitHub-review request.
- **B.** The agent must query the symbols-index server, then the GitHub-review server, and continue probing servers at runtime until it finds a matching tool for each action.
- **C.** At session start, the agent discovers the tools of both configured MCP servers and can call both sets of tools within the same refactoring workflow.
- **D.** The engineer must label each prompt segment with either symbols-index or GitHub-review so the agent knows which MCP server should handle that part.

#### Correct answer to question 1: C

All configured MCP servers are connected when the session starts, and their tools are discovered up front. The agent sees one combined tool list, so it can mix `symbols-index` and `GitHub-review` tools in the same workflow. It doesn't pick a single server, probe at runtime, or need the user to label each step. (The source file marked D, which is wrong: routing is done by the model from the tool descriptions, not by labels on the prompt.)

## Scenario: Code Generation with Claude Code

### Question 2

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A developer adds a custom skill for investigating flaky tests with this frontmatter in its skill directory:

```yaml

---

name: flaky-test-detective

description: Trace intermittent test failures and summarize likely causes

context: fork

---

```

During a long Claude Code session, the developer invokes the skill to inspect logs, test helpers, and recent commits. What does the `context: fork` setting do for this skill invocation?

- **A.** Claude Code lets the skill read and update the active conversation context directly, so its findings reshape the current session as it works.
- **B.** Claude Code runs the skill in a separate sub-agent context, so its investigation notes and scratch work stay out of the main session history.
- **C.** Claude Code schedules the skill to run concurrently with the current request, so the developer can continue issuing commands while it completes.
- **D.** Claude Code creates a temporary fork of the project repository, so the skill can edit files without affecting the developer's current Git branch.

#### Correct answer to question 2: B

`context: fork` runs the skill in an isolated sub-agent context. The exploration (logs, helpers, commits) stays out of the main conversation, and only the final result comes back. This keeps the main context clean. It doesn't fork the Git repo, and it doesn't make the skill run in the background in parallel.

## Scenario: Customer Support Resolution Agent

### Question 3

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A support resolution agent is piloting a new “billing adjustment” flow. During testing, the apply_credit MCP tool sometimes returns free-form messages like “cannot apply credit,” causing the agent to ask customers to re-enter valid account details when the real issue is an expired staff permission, and to escalate immediately when the credit service is briefly unavailable. You want the same recovery logic to work reliably across apply_credit, get_customer, and lookup_order. What is the best approach?

- **A.** Create a new diagnose_tool_failure MCP tool that the agent calls after any failed lookup_order or process_refund result to infer the likely cause before continuing.
- **B.** Add more few-shot examples to the agent prompt showing how to interpret common error phrases from tool outputs, such as “not found,” “locked,” and “temporarily unavailable.”
- **C.** Make each MCP tool return a consistent error object (error_code, failure_category, retryable, user_safe_message, suggested_recovery) so the agent can decide how to proceed.
- **D.** Wrap all MCP calls in the same policy: retry twice with exponential backoff, then escalate the customer to a human if the call still fails.

#### Correct answer to question 3: C

The root cause is ambiguous, unstructured errors. A consistent, structured error contract (category, retryable, safe message, suggested recovery) lets the agent tell the cases apart: permission problem, temporary outage, bad input. The same logic then works for every tool. Few-shot examples on phrases are fragile, a single retry-then-escalate policy treats every error the same, and a diagnostic tool adds a step without fixing the bad data.

## Scenario: Multi-Agent Research System

### Question 4

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

In a multi-agent research system, the document-analysis subagent uses an MCP tool called `archive_scan` to search a licensed historical database for scanned lab notebooks. The credentials are valid, the database query completes normally, and the database returns zero records for the requested date range. Which tool response configuration best lets the coordinator distinguish this outcome from an actual tool failure?

- **A.** Return `isError: true` with metadata such as `{ "category": "SearchFailure", "detail": "zero matching entries" }`.
- **B.** Return `isError: false` with a structured payload such as `{ "matches": [], "query": "...", "count": 0 }` for the search.
- **C.** Throw a `NoResultsFound` exception from the MCP tool handler and let the coordinator catch it as a fallback trigger.
- **D.** Return `isError: false` with a text field saying `ERROR: no archive entries matched this request`.

#### Correct answer to question 4: B

A query that succeeds with zero results is a valid result, not an error. Return `isError: false` with a structured payload (`matches: []`, `count: 0`) so the coordinator can tell "no data" apart from "the tool failed". Marking it as an error or throwing an exception would trigger needless retries or fallbacks, and an "ERROR" string inside a success response is ambiguous.

## Scenario: Code Generation with Claude Code

### Question 5

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A team is adding a `warehouse-inventory` MCP server to Claude Code for a monorepo used by contractors and full-time engineers. The server needs a per-user bearer token, but the team also wants to commit the MCP server definition so everyone gets the same tool name and launch command. Which configuration choice best avoids exposing the token while keeping the setup shareable?

- **A.** Commit a `.mcp.json` that references `${INVENTORY_MCP_TOKEN}` in the server environment, and have each developer set that variable in their own shell, keychain profile or other untracked source.
- **B.** Store the token in `.claude/mcp-secrets.enc`, add a custom decryption step to the server command in `.mcp.json`, and commit both files so the setup works consistently for everyone.
- **C.** Set `.mcp.json` to load credentials from `./.env.mcp.local`, keep that dotenv file next to the MCP configuration, and rely on Claude Code to pass those values to the server at launch.
- **D.** Place the vendor token directly in `.mcp.json`, restrict the file to owner-only permissions, and remind developers not to paste the configuration in issue comments or pull requests.

#### Correct answer to question 5: A

The `.mcp.json` file is committed and shared. It supports expanding environment variables like `${VAR}`, so the server definition is shared while each developer's secret stays in their own untracked environment. Putting the token in the file, even with restricted permissions, or committing encrypted secrets exposes the credentials. A local dotenv file is not loaded automatically by Claude Code.

## Scenario: Claude Code for Continuous Integration

### Question 6

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A mobile platform team has Claude Code comment on every pull request before merge. For a change touching a Swift view model, a Kotlin API adapter, and shared OpenAPI schema files, the current CI prompt asks for null-safety bugs, missing tests, naming inconsistencies, schema compatibility, and client/server interaction risks in one large review. The team sees confident but irrelevant comments on unchanged helper code, while real mismatches between schema defaults and adapter behavior are sometimes missed. Which rationale best supports restructuring the review into staged Claude Code passes?

- **A.** Use repeated file and integration passes until Claude Code reports no more issues, because staged review can guarantee that the final pull request is defect-free.
- **B.** Use two passes mainly because smaller prompts finish faster in CI, so the reduced queue time will make the review comments more reliable for developers.
- **C.** Use a second pass primarily to detect any files, generated artifacts, or test fixtures that the first pass forgot to include in the review scope.
- **D.** Inspect each modified file in its own pass for bounded local concerns, then run a separate pass on cross-file contracts, dependencies and consistency.

#### Correct answer to question 6: D

Splitting the review into a per-file pass (local problems) and a cross-file integration pass (contracts, schema versus adapter) reduces attention dilution. It cuts false positives on code that wasn't touched and catches inconsistencies between files. No pass guarantees zero defects, and the main reason for staging is quality, not speed or coverage of forgotten files.

## Scenario: Developer Productivity with Claude

### Question 7

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A Claude Agent SDK assistant is being added to an internal developer tool to investigate an intermittent checkout bug: a small percentage of regional users see their cart total become zero after retrying payment, but the order record is still created. The repository includes an API gateway, locale/session middleware, checkout orchestration code, pricing services, Redis-backed cart state, database persistence, and MCP servers exposing logs and distributed traces. Which investigation strategy should the agent use?

- **A.** Have the agent first build a complete map of every checkout execution path, retry branch, regional configuration, and persistence outcome before reading incident-specific logs or traces.
- **B.** Have the agent launch simultaneous scans across all route definitions, middleware hooks, service handlers, cache keys, database writes, and MCP observability endpoints before selecting a likely cause.
- **C.** Have the agent follow a fixed runbook that checks the gateway, session middleware, checkout handler, pricing module, cache, and database in the same order and depth for every incident.
- **D.** Start from a few failing request IDs and their recent trace/log evidence, inspect the first implicated boundary, then revise the hypothesis and pick the next focused layer to examine.

#### Correct answer to question 7: D

Debugging should be iterative and evidence-driven: start from concrete failing requests and their traces, examine the first boundary involved, then update the hypothesis and pick the next layer. Mapping everything up front or scanning everything in parallel wastes context. A fixed runbook doesn't adapt to what the evidence shows.

## Scenario: Code Generation with Claude Code

### Question 8

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A team is using Claude Code to replace a custom event-bus state layer in a large dashboard application. One developer wants to introduce a centralized store first, another wants to migrate feature areas one by one, and a third suggests removing the event bus only after adding integration tests around the current behavior. The change spans dozens of components and would be painful to revert if the wrong path is chosen. What is the best way to use Claude Code for this work?

- **A.** Use direct execution after asking Claude Code for a high-level plan, because once a plan is produced the resulting edits no longer need detailed inspection.
- **B.** Ask Claude Code in plan mode to automatically select the best migration strategy and proceed without team input once it identifies the lowest-risk option.
- **C.** Start in plan mode: have Claude outline the main migration strategies, affected files and rollback risks, then let the team choose an approach before edits.
- **D.** Start in plan mode because it will run the refactor faster by precomputing the edits, then switch to direct execution once the plan has been cached.

#### Correct answer to question 8: C

It's a high-impact change with several valid strategies, so plan mode is the right tool: explore and compare approaches, affected files, and risks without changing anything. The team then picks the path. Plan mode isn't for "speeding up" or caching edits, and the decision shouldn't be left to the model alone without human review.

## Scenario: Code Generation with Claude Code

### Question 9

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Your team created a Claude Code command, `/refactor-safety`, for generated refactors in a shared TypeScript library. The command checks whether behavior changed unintentionally, but developers notice that the same reviewer often confidently misses edge-case breakages and sometimes keeps defending questionable findings when asked to re-check. Which review architecture is the best approach for making the command’s results more trustworthy?

- **A.** Have the original Claude Code reviewer run a second pass with a stricter checklist and treat that result as equivalent to an independent reviewer’s validation.
- **B.** One Claude Code instance produces the initial defect list; separate review instances then independently assess the patch and reconcile any disagreements.
- **C.** Use independent Claude Code reviewers only for issues the first reviewer labels as severe, and rely on self-checking for all low and medium findings.
- **D.** Have the same Claude Code instance append a required “audit my conclusions” section after it finishes the original review, using the same context and notes.

#### Correct answer to question 9: B

A model reviewing its own work in the same context carries the same blind spots and tends to defend its earlier conclusions. Independent instances, without the first reviewer's reasoning, assess the patch on their own and reveal disagreements. Self-review with a stricter checklist or an "audit" section in the same context is not independent validation.

## Scenario: Developer Productivity with Claude

### Question 10

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A Claude Agent SDK-based assistant is adding a TypeScript `GcsThumbnailCache` adapter to a media service. Using `Glob`, `Grep`, and `Read`, it finds several existing cache adapters that catch cloud SDK exceptions, log a short message with `cacheLogger` and the asset ID, wrap the original exception in the project’s `ThumbnailCacheError`, and rethrow it for the HTTP middleware to translate. What is the best approach for the assistant when generating the new adapter?

- **A.** Introduce a new `ResilientCacheError` hierarchy, a retry policy registry, and a cross-provider error mapper before implementing the adapter methods.
- **B.** Reuse the local try/catch structure: log the provider error with the existing `cacheLogger` fields, wrap it in `ThumbnailCacheError`, and rethrow.
- **C.** Generate only the successful upload and lookup paths, allowing storage-provider failures to surface however the runtime reports them during execution.
- **D.** Stop generation and ask the user whether this adapter should log errors, wrap them, retry them, or let callers inspect the original provider exception.

#### Correct answer to question 10: B

When generating code, the agent should follow the conventions already in the codebase: same try/catch, `cacheLogger`, wrapping in `ThumbnailCacheError`, and rethrowing to the middleware. Building new hierarchies is over-engineering, ignoring errors breaks the contract, and asking the user is unnecessary when the pattern is clear and consistent.

## Scenario: Claude Code for Continuous Integration

### Question 11

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A payments team uses Claude Code in CI to scan pull requests for risky migration changes and generate regression test recommendations. Most review batches finish in under 7 minutes, but schema-heavy changes sometimes take 30 minutes; engineering leadership wants every pull request that reaches the merge queue to enter Claude Code review within a predictable 10-minute window. Which orchestration approach best supports this requirement?

- **A.** Start a new review batch every 10 minutes from the merge-queue intake, letting batches overlap, and track each batch's status and SLA timer by its own run ID.
- **B.** Run only one Claude Code review batch at a time, queueing all new merge-queue items until the active batch has completed and posted feedback.
- **C.** Reduce each Claude Code batch to at most five files changed, splitting larger pull requests into smaller batches before submitting them to the review pipeline.
- **D.** Configure the CI orchestrator to submit the next Claude Code batch immediately after the previous batch reports a terminal success or failure state.

#### Correct answer to question 11: A

The requirement is that every PR enters review within 10 minutes, while some batches take 30. Starting batches on a fixed schedule and letting them overlap, tracked by run ID, decouples intake from completion time. Serial or "next after the previous one" approaches get blocked by long batches, and capping files doesn't guarantee start latency.

## Scenario: Claude Code for Continuous Integration

### Question 12

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A Bitbucket Pipelines job runs Claude Code after every push to a feature branch. It scans the commit range, proposes regression tests, and writes a single build-summary comment to the pull request; developers only read the completed comment after the pipeline finishes. The team wants to shorten job time and is choosing how to configure Claude Code for this fully automated step. Which configuration is the best fit?

- **A.** Enable plan mode whenever the patch exceeds a configured threshold, such as 500 changed lines, and otherwise use -p direct execution.
- **B.** Run Claude Code with the -p flag and have it execute the review-and-test-generation prompt directly, without enabling plan mode.
- **C.** Keep plan mode enabled for all CI runs so Claude Code can expose architectural concerns before generating comments and test suggestions.
- **D.** Enable plan mode only for the payments and authentication directories, while using direct execution for lower-risk folders.

#### Correct answer to question 12: B

In a fully automated pipeline with nobody approving a plan, plan mode adds latency for no benefit. `-p` (non-interactive mode) with direct execution is the right choice. Plan mode is for interactive cases where a human evaluates the approach before the edits.

## Scenario: Customer Support Resolution Agent

### Question 13

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A support engineering team is splitting its Claude Code work into several repositories: `vip-support-agent` handles refunds and account recovery, `release-notes-bot` drafts changelogs, and `qa-triage` summarizes bug reports. Everyone should have access to a generic internal-docs search MCP tool, but only `vip-support-agent` should be able to call `get_customer`, `lookup_order`, `process_refund`, and `escalate_to_human`. Which MCP configuration choice best supports this setup while minimizing unnecessary tool exposure?

- **A.** Keep all MCP server definitions in a central runtime service catalog, and have each agent query the catalog at startup to decide which support tools to register for the current session.
- **B.** Register the customer, order, refund, escalation, analytics, and admin MCP tools globally, then instruct the support agent through prompts and `tool_choice` guidance to use only the relevant support tools.
- **C.** Copy the full `~/.claude.json` MCP configuration into every repository, then comment out the unsupported tools in projects such as `release-notes-bot` and `qa-triage`.
- **D.** Put the company-wide utilities in the user-level `~/.claude.json`, and add a project `.mcp.json` in `vip-support-agent` exposing only the customer, order, refund and escalation servers.

#### Correct answer to question 13: D

MCP configuration scopes: user-level (`~/.claude.json`) for tools available everywhere, and project-level `.mcp.json` for tools specific to one repo. This way only `vip-support-agent` sees the sensitive tools (least privilege). Registering everything globally and relying on the prompt doesn't really restrict access, and copying or commenting out configs is fragile.

## Scenario: Customer Support Resolution Agent

### Question 14

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

During a test of a support resolution agent, the cancel_subscription and lookup_order MCP tools both return HTTP 400 with a short text string when something goes wrong. In practice, the agent sometimes asks a customer to correct their order number when the real issue is an expired service token, and sometimes retries a cancellation that failed because the subscription is already terminated. What is the best way to redesign the tool error handling so the agent can make reliable recovery decisions?

- **A.** Add more few-shot examples to the agent prompt showing how to interpret messages like “order unavailable,” “customer not found,” and “refund blocked” for the most common failure cases.
- **B.** Create a separate explain_last_tool_failure MCP tool that the agent can call after any failed backend action to ask for a more detailed diagnosis before deciding what to do next.
- **C.** Wrap all MCP calls in the same failure handler that retries twice with exponential backoff, then escalates to a human if the third attempt does not succeed.
- **D.** Have each MCP tool return a consistent error object with fields such as error_category, error_code, retryable, safe_to_retry_after and recommended_recovery, then branch on them.

#### Correct answer to question 14: D

Same principle as question 3: a generic 400 with plain text doesn't let the agent tell a bad order number from an expired token, or a temporary error from a permanent one (subscription already terminated). Structured fields such as `error_category`, `retryable`, and `recommended_recovery` support deterministic recovery decisions.

## Scenario: Claude Code for Continuous Integration

### Question 15

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A CI pipeline for an infrastructure-as-code repository uses Claude Code to comment on pull requests that modify Terraform modules. After a recent change passed review but later broke network isolation rules, the team wants to redesign the prompt workflow so findings are more complete without flooding maintainers with speculative comments. Which rationale best supports using multiple independent Claude Code review instances before posting a consolidated pull request summary?

- **A.** Use several isolated Claude Code review jobs so their agreement can be treated as objective, since separate runs eliminate subjective judgments and model-specific blind spots from the review.
- **B.** Use several isolated Claude Code review jobs mainly because they can run at the same time, making the pipeline faster and therefore more likely to catch defects before merge.
- **C.** Use several isolated Claude Code review jobs because independent reviewers are easier to configure than maintaining one well-structured review prompt with output requirements.
- **D.** Run several isolated review jobs on the same pull request, each with a distinct rubric, then merge their findings, since separate analyses expose non-overlapping defects.

#### Correct answer to question 15: D

Independent instances with distinct rubrics (for example network security, IAM, compliance) look at the same PR from different angles and find defects that don't overlap. The results are then merged into one summary. Agreement between runs is not "objective", parallelism isn't the main reason, and configuring it isn't simpler.

## Scenario: Code Generation with Claude Code

### Question 16

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A documentation repo has a root CLAUDE.md with company-wide writing standards, a docs/CLAUDE.md with documentation style guidance, and scoped convention files selected by globs such as docs/**/*.md, examples/**/*.ts, **/*.test.ts, and infra/**/*.yaml. A writer asks Claude Code to revise docs/reference/api/payments.md. Which configuration behavior should you expect?

- **A.** The root CLAUDE.md, the docs/CLAUDE.md, and any scoped rules whose glob patterns match this file, such as docs/**/*.md or **/*.md.
- **B.** Claude Code will use only the root CLAUDE.md unless docs/CLAUDE.md and the Markdown rules are explicitly imported from that root file.
- **C.** Claude Code will select the most specific matching instruction source, such as docs/reference/api/**, and ignore the root CLAUDE.md and broader Markdown rules.
- **D.** Claude Code will load the root CLAUDE.md plus every rule file in the repository, including rules for tests, React components, and database migrations.

#### Correct answer to question 16: A

The CLAUDE.md files are hierarchical and additive: the root and `docs/CLAUDE.md` both apply to files under `docs/`. Scoped rules are added when their glob matches the file being worked on. Rules whose globs don't match (tests, infra) are not loaded. No explicit import is needed, and the most specific source doesn't override the others.

## Scenario: Structured Data Extraction

### Question 17

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A corporate legal team uses Claude to extract renewal deadlines, indemnity caps, governing-law clauses, and notice requirements from supplier contracts into JSON. The data feeds an internal system that automatically alerts business owners and starts approval workflows for contract amendments, so incorrect extractions can create legal and financial exposure. Which validation and oversight strategy is the best fit for this pipeline?

- **A.** Require every output to pass a strict JSON Schema with mandatory fields and enumerated types, then allow downstream systems to rely on any record that conforms to the schema.
- **B.** Run JSON Schema checks first, then domain rules comparing extracted clauses and dates to the contract text; route low-confidence or high-impact fields to reviewers and log provenance.
- **C.** Run a benchmark on a representative contract set, and if field-level accuracy exceeds the legal team’s target, disable routine review except for parser failures or missing JSON fields.
- **D.** Send extracted JSON to an external legal data API for validation and accept its returned status as the sole approval signal before updating internal obligation trackers.

#### Correct answer to question 17: B

A schema only guarantees the shape, not that the content is correct. For high-impact legal data you need layers: schema validation, semantic rules checked against the source text, routing of low-confidence or high-impact fields to human review, and provenance for auditing. A good benchmark doesn't justify removing oversight, and an external API isn't enough as the only signal.

## Scenario: Customer Support Resolution Agent

### Question 18

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer contacts support saying: “My overnight package shows ‘delivery attempted’ even though I was home, my annual membership renewal was billed at the wrong tier, and I need to know whether the cracked tablet I bought in March is still covered.” Your Claude Agent SDK resolution agent can call MCP tools for customer lookup, order lookup, billing adjustments, warranty checks, and human escalation. Which orchestration approach is best for this conversation?

- **A.** Have the main agent launch parallel subagents for the three topics and stream their outputs directly to the customer as they finish, because the Agent SDK automatically reconciles the subagent conclusions into a coherent final answer.
- **B.** Have the main agent spawn three subagents with only the customer's raw message and no customer profile or order context, because decomposition lets each subagent independently infer whatever background it needs from the available tools.
- **C.** Treat the delivery exception, subscription charge and warranty question as separate workstreams; delegate each one to a focused subagent with the case context, then synthesize a single response handling dependencies and escalations.
- **D.** Have the main agent run shipping, billing, and warranty subagents in parallel and promise resolution during the same chat, because parallel execution eliminates uncertainty from missing records, policy exceptions, or required human approvals.

#### Correct answer to question 18: C

The request contains three independent topics. The coordinator breaks them down, delegates with the Task tool to specialized subagents, and explicitly passes the customer and case context (subagents don't inherit it). It then synthesizes a single answer, handling dependencies and escalations. Subagents without context, unreconciled outputs, or promises nobody can guarantee are wrong.

## Scenario: Code Generation with Claude Code

### Question 19

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A documentation team is adding a Claude Code skill named `schema-notes` that scans migration files and model definitions to draft database documentation. It should be able to locate and read repository files, but it must not modify files or run terminal commands. Which configuration best enforces that constraint?

- **A.** Define the skill in `SKILL.md` with frontmatter `allowed-tools: [Read, Glob]`, so it can inspect and search files but cannot edit or run shell commands.
- **B.** Add a frontmatter value such as `no-write: true` in `SKILL.md`, so Claude Code automatically disables every mutating operation for that skill.
- **C.** Place a rule in the project `CLAUDE.md` saying the skill may only read files, so Claude Code enforces that instruction as the skill’s tool boundary.
- **D.** Install the skill only under the project’s `.claude/skills/` directory instead of the user skills directory, so it inherits project-local read-only permissions.

#### Correct answer to question 19: A

The `allowed-tools` field in the `SKILL.md` frontmatter limits which tools the skill can use. That is a real technical boundary. A `no-write` field doesn't exist, a rule in CLAUDE.md is only guidance (not enforcement), and where the skill is installed doesn't change its permissions.

## Scenario: Code Generation with Claude Code

### Question 20

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Your team created a Claude Code slash command, `/make-migrator`, that generates Python data-migration scripts for customer account records. The scripts pass linting, but they keep making inconsistent choices about legacy `tier` values, blank renewal dates, and whether archived accounts should be skipped. Which prompt improvement is the best next step to make the generated migrations more consistently correct?

- **A.** Update `CLAUDE.md` with stricter naming rules for generated migration functions, including prefixes, suffixes, and preferred helper names.
- **B.** Revise `/make-migrator` to include several representative before-and-after schema examples and a small set of migration tests for defaults, renames and enum mappings.
- **C.** Add the full database DDL history and every past migration file to the command context so Claude Code has more background before generating the next migrator.
- **D.** Require the team to run `/make-migrator` only in plan mode first, then approve the plan before Claude Code writes any migration code.

#### Correct answer to question 20: B

The inconsistencies come from ambiguous business rules (legacy tiers, empty dates, archived accounts). Concrete before/after examples and tests that define the expected behavior remove the ambiguity. Naming rules don't affect correctness, dumping all the history dilutes the context, and plan mode doesn't define the rules.

## Scenario: Developer Productivity with Claude

### Question 21

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A Claude Agent SDK productivity agent is migrating 32 Python modules from an old `@timed_task(...)` decorator to a new `telemetry.track(...)` pattern. Some modules already import `telemetry`, some alias the old metrics package, and several decorators include file-specific arguments that must be preserved. Which approach should the agent use to make the migration most reliably?

- **A.** Send the complete file list to a bulk-edit MCP server and request one combined patch, prioritizing throughput and reviewing only the final repository-wide diff.
- **B.** Have the agent generate a standalone migration script that rewrites every candidate module, then ask a developer to run the script locally and report back any failures after it completes.
- **C.** Run a single Bash command with a recursive substitution over the repository, then use Grep afterward to confirm that the old decorator text no longer appears anywhere.
- **D.** Find candidate modules with Glob or Grep, then handle them one at a time: Read the file, apply a targeted Edit, check the updated content, and only then move on.

#### Correct answer to question 21: D

For a migration with file-specific variations, the reliable way is to find the candidates with Grep/Glob, then for each file Read, apply a targeted Edit, and check the result. A blind global substitution, a single bulk patch, or an unverified script don't handle aliases, existing imports, and arguments that must be preserved.

## Scenario: Multi-Agent Research System

### Question 22

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

A due-diligence assistant built with the Claude Agent SDK has a coordinator and five specialists: `Signal` monitors news and web sources, `Vault` searches uploaded deal-room files, `Ledger` analyzes spreadsheets, `Briefsmith` synthesizes findings, and `Dossier` formats the final memo. Requests vary from “check whether this contract mentions exclusivity” to “build a cited risk brief on a supplier using web signals, financial trends, and attached audits.” Which orchestration approach is the best fit?

- **A.** Start every investigation by running the web, database, spreadsheet, synthesis, and report agents in parallel, then ask the coordinator to discard outputs that are not useful.
- **B.** Have the coordinator inspect each request, reason about the needed evidence and deliverable, then invoke only the relevant specialists with scoped subtasks, recording its routing rationale in the run's history.
- **C.** Put a permanent instruction in the coordinator prompt that market questions always go to the web agent, technical questions always go to the document agent, and executive questions always go to the report agent.
- **D.** Maintain a large routing table in a deployment file that maps every known research category, such as pricing, regulation, patents, and competitors, to a fixed specialist sequence.

#### Correct answer to question 22: B

Requests vary widely in complexity, so routing should be dynamic. The coordinator analyzes each request and invokes only the specialists it needs with well-scoped subtasks, recording why. Running everything in parallel wastes resources, and fixed rules or routing tables can't adapt to new or mixed requests.

## Scenario: Structured Data Extraction

### Question 23

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A legal operations team uses Claude to extract obligation data from vendor contracts into a JSON payload consumed by an approval system. In some image-only exhibits, Claude can infer a syntactically valid `counterpartyName` from a signature block, but assigns 0.52 confidence; this field affects whether the contract is routed to sanctions screening. What is the best approach for handling this field in the structured extraction workflow?

- **A.** Return the parsed `counterpartyName` with provenance and a confidence/quality flag, letting the approval workflow decide whether analyst review is needed.
- **B.** Reject the entire contract package whenever `counterpartyName` confidence is low, leaving the field blank and stopping all downstream processing.
- **C.** Return the parsed `counterpartyName` in the normal contract JSON because it matches the schema, and avoid exposing confidence data to keep integrations simple.
- **D.** Automatically run the same extraction again whenever `counterpartyName` confidence is below the threshold, and use the second result as the final value.

#### Correct answer to question 23: A

With uncertain extraction on a critical field, don't hide the uncertainty and don't block everything. Return the value with provenance and a confidence flag so the downstream workflow can decide (proceed, be cautious, or send to an analyst). Simply re-running the extraction doesn't make the result more reliable.

## Scenario: Customer Support Resolution Agent

### Question 24

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A Claude Agent SDK support agent handles subscription downgrade and overcharge complaints. Its `assemble_billing_context` MCP tool can identify the customer's plan, renewal date, refund eligibility, and open chargeback status in under a second, but itemized invoices and internal audit notes often take 7-10 seconds to retrieve. Leaders want the agent to start helping sooner while still making accurate final decisions. What is the best approach?

- **A.** Stream a compact entitlement-and-risk summary as soon as it is available, let the agent start drafting the resolution path from it, and merge invoice-line details and audit notes as they arrive.
- **B.** Stop calling the billing-history tool during the initial turn, and have the agent resolve disputes using only the customer profile and the customer's description unless the user complains.
- **C.** Have the agent immediately acknowledge the request and explain that billing checks can take up to 10 seconds, then wait silently for the full tool result before reasoning.
- **D.** Keep the tool response atomic and focus on reducing database query time through indexing, connection pooling, and cache warming before changing the agent workflow.

#### Correct answer to question 24: A

The latency problem is solved by streaming and progressive disclosure: the compact summary arrives quickly and the agent starts working, then the slower details (invoices, audit notes) are merged in before the final decision. Skipping data compromises accuracy, waiting in silence doesn't reduce latency, and optimizing only the database doesn't change the flow.

## Scenario: Developer Productivity with Claude

### Question 25

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A developer productivity team is deploying a Claude Agent SDK assistant for an on-call engineering group that maintains several incident-management services. The agent can already use Read, Grep, Glob, Bash, and Write to inspect repositories, but it struggles with questions such as, “Why do severity escalations bypass the normal queue during regional failovers?” because the answer depends on operational policies recorded in the company’s runbook and design-decision system. What is the best approach to improve the assistant’s reliability for these questions?

- **A.** Have the agent ask engineers to paste the relevant runbook pages into the chat whenever a question depends on team-specific terminology or operational history.
- **B.** Build a small custom tool that returns a weekly exported bundle of Markdown files from the runbook repository whenever the agent needs background context.
- **C.** Keep using Read, Grep, Glob and Bash to inspect the services, and add an MCP server that queries the company's live runbook and design-record system for authoritative answers.
- **D.** Rely on Read, Grep, Glob, and Bash to trace call paths and configuration until the agent can infer the operational rationale without adding external documentation access.

#### Correct answer to question 25: C

The missing information isn't in the code, it's in the operational documentation. An MCP server that queries the live runbook and design-decision system gives authoritative, up-to-date access. Asking users to paste it isn't scalable, a weekly export goes stale, and inferring the rationale from code alone is unreliable.

## Scenario: Multi-Agent Research System

### Question 26

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

In your research system, the evidence-gathering subagent has two MCP tools in its allowedTools list. `DataVault` is described as “retrieve supporting evidence from internal collections,” and `InterviewFinder` is described as “locate relevant source material from archived interviews.” In evaluation runs, prompts such as “pull the latest adoption-rate statistics by region” sometimes call `InterviewFinder`, while prompts asking for “firsthand practitioner quotes about rollout barriers” sometimes call `DataVault`. What is the best root-cause diagnosis and remediation?

- **A.** Rewrite each MCP tool description with its evidence type, out-of-scope requests, selection cues and short examples, keeping both tools available.
- **B.** Classify the wrong InterviewFinder calls as hallucinated tool invocations and add a fallback that retries the same request whenever the returned evidence is not numeric.
- **C.** Restrict the evidence subagent’s allowedTools list to only DataVault so all evidence retrieval goes through a single, predictable data-access path.
- **D.** Add a sentence to the coordinator prompt saying “use DataVault for numbers and InterviewFinder for quotes,” but leave the MCP tool names and descriptions as they are.

#### Correct answer to question 26: A

The model chooses tools mainly from their descriptions. If they are vague and overlap ("evidence" versus "source material"), routing is wrong. The fix is clear, differentiated descriptions: what each tool does, what it doesn't do, selection cues, and examples. Removing a tool loses capability, and a note in the coordinator prompt doesn't fix the descriptions the subagent sees.

## Scenario: Structured Data Extraction

### Question 27

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A legal operations team uses Claude to extract renewal dates, parties, and termination clauses from 12,000 archived service contracts each week. The outputs are validated against a JSON Schema before being loaded into a contract intelligence database, but some documents are image-only scans, some are in unsupported languages, and some responses contain fields that fail validation. What is the best error-handling design for this batch extraction workflow?

- **A.** Return a batch manifest with each contract's status, validated payload when available, and machine-readable error codes such as `parse_error`, then keep processing.
- **B.** Immediately resubmit every failed contract to Claude up to five times and only record an error if all retries fail, without storing the intermediate failure reasons.
- **C.** Abort the entire batch as soon as one contract fails schema validation, mark the run as failed, and require an operator to restart the batch after correcting that contract.
- **D.** Exclude any contract that does not produce valid JSON from the export file so downstream systems only receive clean records and the daily completion rate is not delayed by bad inputs.

#### Correct answer to question 27: A

In batch processing, isolate failures for each item: a manifest with per-contract status, the validated payload, and machine-readable error codes, and keep processing the rest. Aborting the whole batch, silently dropping failures, or retrying blindly without keeping the reasons all hurt reliability and debugging.

## Scenario: Code Generation with Claude Code

### Question 28

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A backend team adds `.claude/rules/api-migration.yaml` with guidance for replacing a legacy Express pattern. The file includes:

```yaml

paths:

- "packages/api/routes/**/*.js"

- "packages/api/models/**/*.js"

```

What does this `paths` field mean in Claude Code?

- **A.** It declares that generated unit tests for the API migration should be written only under `packages/api/routes/` and `packages/api/models/`.
- **B.** It tells Claude Code to look for this YAML rule file under `packages/api/routes/` or `packages/api/models/` instead of under `.claude/rules/`.
- **C.** It causes Claude Code to load additional instruction snippets from matching JavaScript files and append them to the rule before responding.
- **D.** It scopes the rule so Claude Code considers it only when work involves files matching `packages/api/routes/**/*.js` or `packages/api/models/**/*.js`.

#### Correct answer to question 28: D

In `.claude/rules/` files, the `paths` field defines glob patterns that make the rule conditional: it's loaded only when Claude is working on files that match those patterns. It doesn't specify where to write tests or where to look for the rule file, and it doesn't import content from the JS files.

## Scenario: Structured Data Extraction

### Question 29

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A legal technology company must convert 120,000 legacy supplier contracts into structured JSON for a renewal-risk dashboard. Each output must satisfy a schema with nested fields for parties, payment terms, renewal windows, and termination clauses. The dashboard import is scheduled for next week, but it only needs the completed dataset, not live document-by-document results. Early tests suggest that older scanned amendments and unusual renewal language may cause repeated validation failures. What is the best extraction workflow?

- **A.** Submit the entire archive to batch processing immediately, then examine schema validation failures afterward and rerun any documents affected by prompt mistakes.
- **B.** Pilot interactively on a representative slice, analyze recurring schema and extraction errors, fix the prompt, then submit the batch.
- **C.** Divide the archive into ten equal batch waves, review every wave manually, and change the prompt after each wave before starting the next one.
- **D.** Process all contracts through synchronous API calls so the team can inspect failures as they happen, then patch each prompt issue while the full job continues running.

#### Correct answer to question 29: B

Large volume, no need for real-time results, and a risk of systematic errors. The right flow is to iterate on the prompt first with a small, representative interactive pilot, then run the stabilized prompt with the Batch API (lower cost, asynchronous). Submitting everything right away multiplies the errors, synchronous calls cost more, and manual waves are slow.

## Scenario: Claude Code for Continuous Integration

### Question 30

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A Claude Code pull request workflow invokes an MCP tool named `screenshot-diff-linter` once per changed frontend file. For `src/render/diagram.ts`, the tool returns:

```json

{

"message": "SVG snapshot generation is not supported for this renderer",

"isRetryable": false,

"errorCategory": "tool_unavailable_for_file_type"

}

```

Twenty other changed files are still waiting for analysis. What should the workflow do next?

- **A.** Send `src/render/diagram.ts` through the same fallback error path used for network timeouts, retrying only if the whole CI job reaches its generic retry phase.
- **B.** Write the error message for `src/render/diagram.ts` into the PR comment backlog, leave the file in the pending queue, and let a later reporting step decide whether it matters.
- **C.** Retry the screenshot-diff tool for `src/render/diagram.ts` with exponential backoff, because tool errors can clear after the analyzer warms its cache.
- **D.** Mark `src/render/diagram.ts` as skipped with a non-retryable `tool_unavailable_for_file_type` analysis result, then continue running the screenshot-diff analysis for the other files.

#### Correct answer to question 30: D

The error is structured and says it's not retryable (`isRetryable: false`, the tool is unsupported for that file type). Retrying is useless. The right move is to record the file as skipped with the appropriate category and keep analyzing the other files. Treating it like a timeout or leaving it in the pending queue ignores the information the error provides.

## Scenario: Developer Productivity with Claude

### Question 31

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A developer tools team is building a Claude Agent SDK assistant called SpecScout to improve coverage for a Python data-normalization package. The assistant can inspect source with Read and Grep, create test files with Write, and execute commands such as `pytest tests/test_normalizers.py -k ...` through Bash. Which workflow is the best approach for SpecScout to generate dependable tests while keeping failures easy to isolate?

- **A.** Have SpecScout ask the developer for a finalized checklist of every edge case and expected output, then generate tests directly from that checklist without deciding intermediate validation points.
- **B.** Have SpecScout identify a narrow behavior, write one or a few focused tests for it, run the relevant pytest target with Bash, inspect any failures, adjust the tests or its understanding, then repeat.
- **C.** Have SpecScout scan the module once, generate a complete regression suite for every discovered branch, and run the full test suite only after all new test files have been written.
- **D.** Have SpecScout write the proposed tests and send them to the CI coverage service, relying on the service’s final pass/fail and coverage report instead of running local commands during generation.

#### Correct answer to question 31: B

Generating tests incrementally (one narrow behavior, a few tests, run the specific pytest target, analyze, adjust) makes failures easy to isolate and builds quick feedback. Generating everything and running it only at the end, or relying only on CI, makes diagnosis harder.

## Scenario: Claude Code for Continuous Integration

### Question 32

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A CI job uses Claude Code to propose unit tests for changed Go packages before a pull request can be merged. The generated tests usually pass, but maintainers keep editing them because they do not use the project’s table-driven layout, subtest names, shared setup helpers, or expected mix of negative cases. What is the best prompting approach to improve the consistency of the generated tests?

- **A.** Tell Claude Code to inspect the repository and make the new tests look like the existing suite, while keeping the prompt short to avoid constraining the generated cases too much.
- **B.** Write a paragraph in the prompt explaining that tests should use clear names, cover edge cases, avoid brittle assertions, and follow the conventions usually found in mature Go services.
- **C.** Include two or three nearby, well-reviewed Go test files in the prompt and ask Claude Code to follow their table-driven structure, naming style, setup helpers and range of cases.
- **D.** Add a broader testing policy to CLAUDE.md describing that all generated Go tests should be idiomatic, maintainable, and consistent with the repository’s normal review expectations.

#### Correct answer to question 32: C

To get conventions followed precisely, concrete examples from well-reviewed files in the same repo work better than generic descriptions. They show the table-driven structure, naming, helpers, and the mix of cases. Vague instructions ("make them look like...", "idiomatic") don't specify the expected pattern.

## Scenario: Developer Productivity with Claude

### Question 33

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A platform team is creating a Claude Agent SDK tool called RouteProbe to improve test coverage for a microservice’s request-routing layer. The agent can inspect handlers with Read and Grep, create test files with Write, and execute npm test commands through Bash. Which approach should the team use so RouteProbe adds tests reliably while keeping failures easy to diagnose?

- **A.** Have the agent write candidate tests continuously and rely on the repository’s nightly CI job to surface failures, using the next day’s CI report as the first validation checkpoint.
- **B.** Have the agent scan the module, generate a complete regression suite for all discovered branches in one pass, then run the full test suite only after every planned test file has been written.
- **C.** Have the agent ask the engineer to enumerate every expected case and assertion up front, then generate the listed tests exactly as provided without independently running them between additions.
- **D.** Have the agent identify one uncovered behavior at a time, write a focused test, run the relevant test command with Bash, inspect and fix any failure, then select the next behavior.

#### Correct answer to question 33: D

Same principle as question 31: an iterative test-driven loop, one behavior at a time with immediate execution of the relevant test, so each failure can be traced to a specific change. Waiting for nightly CI or generating everything in one pass delays the feedback and mixes the causes of failures together.

## Scenario: Structured Data Extraction

### Question 34

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A legal operations team uses Claude to extract renewal terms from commercial lease PDFs into a JSON object validated by a schema. The schema usually passes, but `renewalNoticeWindowDays` is unreliable: clauses such as “tenant must notify landlord no later than three months before the end date,” “90 days prior written notice,” and “notice by the first day of the final quarter” are sometimes omitted, sometimes copied as text, and sometimes normalized to an integer. The needed information is usually present, but the wording varies across landlords. What is the best prompt-engineering change to improve consistency for this field?

- **A.** Add representative few-shot examples that map complete lease excerpts to the exact JSON expected, including notice wording variants and null cases.
- **B.** Move the extraction job to a larger Claude model so it can infer the intended normalization rules from the lease language without additional examples.
- **C.** Change the JSON schema so `renewalNoticeWindowDays` is always required and restricted to an integer, then reject any output that does not include it.
- **D.** Lower temperature to 0 and keep the current prompt unchanged so Claude produces the same `renewalNoticeWindowDays` value whenever similar text appears.

#### Correct answer to question 34: A

The information is there, but the normalization is inconsistent ("three months", "90 days", "first day of the final quarter"). Few-shot examples that show how different phrasings map to the integer, and when to use null, teach the transformation. A bigger model doesn't define the rules, a stricter schema forces hallucinated values, and temperature 0 doesn't make it correct.

## Scenario: Code Generation with Claude Code

### Question 35

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Your team maintains an on-prem payments library used by five product groups. Its reference material includes thousands of Markdown files for settlement flows, compliance notes, connector quirks, and version-specific upgrade instructions. Developers want Claude Code to consult this material during refactors, but they do not want unrelated pages to displace source files from the conversation. Which configuration is the best fit?

- **A.** Configure Claude Code to prepend the complete documentation bundle to each session so the model can answer without making additional retrieval calls.
- **B.** Create a custom MCP tool named `lookup_manuals` that accepts broad task descriptions and returns synthesized guidance from the documentation for every code generation request.
- **C.** Publish the manuals from an MCP server as resources with a searchable catalog by product, version and topic, so Claude fetches only relevant pages.
- **D.** Add a generated section to `CLAUDE.md` containing links and summaries for every manual page, regenerated nightly as products and versions change.

#### Correct answer to question 35: C

For a large documentation base, the right approach is on-demand access. Expose the documents as MCP resources with a searchable catalog so Claude fetches only the relevant pages, without filling the context. Preloading everything or listing everything in CLAUDE.md wastes context, and a tool that returns "synthesized guidance" is opaque and imprecise.

## Scenario: Multi-Agent Research System

### Question 36

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

A policy-intelligence team uses a coordinator agent to monitor new regulations across 40 jurisdictions. Each night, web and document subagents process tens of thousands of notices and produce structured JSON summaries; each morning, analysts open a dashboard, ask the coordinator why certain items were escalated, and request quick changes to the cited briefing. Which invocation plan best balances cost, volume, and latency for this workflow?

- **A.** Use Batch API jobs for overnight corpus expansion, entity extraction and per-source relevance scoring, and real-time calls for coordination, synthesis planning and revisions.
- **B.** Use Batch API jobs for every agent call, including coordinator routing, synthesis planning, and analyst follow-up edits, because the lower per-call cost is the main constraint at this processing volume.
- **C.** Use real-time invocations for the first coordinator pass, then avoid Batch API entirely because multi-agent loops with delegated subagents require immediate responses at every step.
- **D.** Use real-time invocations for all web retrieval review, extraction, scoring, coordination, synthesis, and report editing so the architecture has one consistent execution mode end to end.

#### Correct answer to question 36: A

The Batch API suits large volumes that aren't urgent (the nightly processing). Interactive work by analysts in the morning, and the coordinator's decisions, need real-time calls. Using batch for everything makes the interactive work slow, and real-time for everything wastes money at high volume.

## Scenario: Code Generation with Claude Code

### Question 37

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Your team has a Claude Code slash command `/lint-fix` that should repair JavaScript lint errors before Claude proposes any code changes. The workspace exposes several MCP tools, including `prettier_format`, `ts_typecheck`, and `eslint_autofix_runner`, but this command must always run `eslint_autofix_runner`; other commands should still be free to choose tools normally. Which configuration best ensures predictable tool use for `/lint-fix`?

- **A.** Shorten the system prompt for `/lint-fix` so Claude has fewer instructions to consider, relying on the shorter prompt to make it pick `eslint_autofix_runner`.
- **B.** Add a `CLAUDE.md` note stating that every exposed code-quality tool is mandatory for `/lint-fix`, including `prettier_format`, `ts_typecheck`, and `eslint_autofix_runner`.
- **C.** Give `prettier_format`, `ts_typecheck`, and `eslint_autofix_runner` the same description, such as “checks and improves code quality,” so Claude treats them uniformly.
- **D.** Configure the `/lint-fix` command to set `tool_choice` to the exact `eslint_autofix_runner` tool, keeping the tool descriptions clear about when each one should be used.

#### Correct answer to question 37: D

`tool_choice` set to a specific tool forces it to be called deterministically. Setting it only in the `/lint-fix` command leaves the other commands free. Shortening the prompt or making descriptions identical makes things worse, and a note in CLAUDE.md is neither selective nor enforced.

## Scenario: Claude Code for Continuous Integration

### Question 38

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A Claude Code CI workflow runs an MCP tool named `api-contract-diff` on each changed OpenAPI specification before posting pull request feedback. For `services/catalog/openapi.yaml`, the tool returns this structured error:

```json

{

"message": "Recursive schema expansion exceeded the analyzer limit",

"isRetryable": false,

"errorCategory": "analysis_limit_exceeded"

}

```

Several other changed specs have not been analyzed yet. What should the workflow do next?

- **A.** Schedule several more attempts for the catalog spec because MCP tool failures may clear when worker load, cache state, or network conditions change.
- **B.** Mark the catalog API check as needing manual review with `analysis_limit_exceeded`, do not re-invoke the diff tool for that file, and continue with the rest.
- **C.** Treat the exception like any other tool crash, abort the contract-review stage, and rerun the whole CI job with the default exponential backoff policy.
- **D.** Add the full error payload to the PR summary, leave the catalog file in the standard retry queue, and continue processing the remaining changed specs.

#### Correct answer to question 38: B

Like question 30: the error is structured, not retryable, and of type `analysis_limit_exceeded`. Calling the tool again on that file is pointless. Mark it for manual review with the category, then continue with the other specs. Aborting everything or leaving the file in the retry queue ignores the error's semantics.

## Scenario: Customer Support Resolution Agent

### Question 39

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A return-resolution agent handles chats where customers often change their explanation midstream. In one trace, the agent calls get_customer to verify the account and lookup_order to retrieve delivery status, payment method, and return-window details; later in the same chat, it calls the same tools again before drafting the refund note, checking exception eligibility, and deciding whether to escalate. Which configuration best reduces this repeated lookup latency while keeping the agent’s decisions grounded in the retrieved records?

- **A.** Enable a five-minute cache inside the MCP server for get_customer and lookup_order, and continue instructing the agent to call the tools whenever it needs those fields.
- **B.** Cache only missing-customer and order-not-found responses from the MCP tools, so the agent avoids retrying unavailable records during the same return or refund conversation.
- **C.** Treat prior get_customer and lookup_order outputs as case-scoped conversation state and check them before repeating an identical call; use server TTL caching only as a backup.
- **D.** Keep the workflow unchanged because the tool responses usually return in less than a second, and rely on the agent to complete the extra checks without adding explicit reuse behavior.

#### Correct answer to question 39: C

The data has already been retrieved in the same conversation. Treat it as case state and reuse it before repeating identical calls. That cuts latency while the decisions stay based on the actual records. Server-side caching is a secondary optimization, caching only negative responses doesn't help, and doing nothing ignores the problem.

## Scenario: Code Generation with Claude Code

### Question 40

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A platform team is building a Claude Code slash command, `/add-audit-event`, for a repository that always uses the same delivery path: first create the event schema and registration files, then implement the emitter calls in the affected module, and finally generate regression tests from the resulting diff. The output of each phase becomes the input to the next. Which orchestration approach is the better trade-off for this command?

- **A.** Avoid prompt chaining unless the team can predefine every possible file change, error condition, and test case the command might encounter.
- **B.** Use prompt chaining: the scaffolding step's output feeds the implementation step, whose completed changes then feed test generation.
- **C.** Use dynamic task decomposition so Claude can decide at runtime whether scaffolding, implementation, or tests should happen first for each new service.
- **D.** Treat prompt chaining and dynamic task decomposition as equivalent, and select whichever is simpler to configure in the team’s CLAUDE.md file.

#### Correct answer to question 40: B

The flow is fixed and predictable, and each phase's output feeds the next. That is the textbook case for prompt chaining (a sequential pipeline). Dynamic decomposition is for open-ended tasks where the steps aren't known in advance. The two approaches aren't equivalent, and you don't need to predefine every case to use chaining.

## Scenario: Customer Support Resolution Agent

### Question 41

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A support team is tuning a Claude Agent SDK workflow for a new “case closer” agent. In one pilot conversation, `lookup_order` receives a warehouse API maintenance response, `process_refund` receives a card-network hard decline, and `get_customer` receives an account record that has been merged into another profile. Which MCP tool error-handling configuration would best support reliable retry, alternate-path, and escalation decisions?

- **A.** Let backend SDK exceptions propagate out of the MCP tool unchanged so the Agent SDK receives the original stack trace, exception class, and default framework error message.
- **B.** Return HTTP 200-style tool results for every backend outcome, with fields such as `refundStatus: blocked` or `orderLookupStatus: unavailable` for the agent to interpret from the normal result payload.
- **C.** Have each tool return a plain-language string such as `payment service is down` or `account cannot be changed` whenever something goes wrong, and rely on the agent prompt to parse the text.
- **D.** Define a shared MCP error response contract for all tools that sets `isError: true` with `errorCategory`, `isRetryable`, a stable code, and a concise explanation for next steps.

#### Correct answer to question 41: D

A shared error contract (`isError: true`, `errorCategory`, `isRetryable`, a stable code, and an explanation) lets the agent tell a temporary outage (retry), a hard decline (alternate path or communicate it), and a merged account (escalation or alternative lookup) apart. Raw exceptions, fake 200 results, or free text all force unreliable interpretation.

## Scenario: Code Generation with Claude Code

### Question 42

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Mateo works in a data-platform repository that includes a committed `.mcp.json` for a metrics MCP server everyone uses during debugging. He wants Claude Code to also connect to a Confluence MCP server backed by his own account so he can pull notes from a private architecture space while planning refactors. The rest of the team should not inherit this server or need his Confluence setup. Where should he configure this MCP server?

- **A.** Create a project-local `.mcp.local.json` file and put the Confluence MCP server definition there.
- **B.** Commit the Confluence MCP server to the repository's `.mcp.json` alongside the shared metrics server.
- **C.** Store the Confluence MCP server in `.claude/mcp-personal.json` under the repository root.
- **D.** Add the Confluence MCP server to the user-level configuration in `~/.claude.json`.

#### Correct answer to question 42: D

Personal configurations that shouldn't be shared go in user scope (`~/.claude.json`), or the local scope that Claude Code stores there as well. Committing to `.mcp.json` imposes the server on the team. `.mcp.local.json` and `.claude/mcp-personal.json` are not standard MCP configuration files.

## Scenario: Structured Data Extraction

### Question 43

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A commercial insurance platform uses Claude to extract quote data from broker PDFs into a JSON object with fields such as `base_premium`, `policy_fee`, `broker_fee`, and `annual_total`. A downstream binding system rejects records when `annual_total` does not equal the deterministic sum of the fee fields. In one batch, several PDFs show a printed annual total that differs from the calculated sum by small but material amounts, and the values may affect legally binding policy documents. What is the best approach for this extraction workflow?

- **A.** Store the reported premium, fees and total as extracted, add a calculated total and mismatch flag, and route material differences to underwriting review.
- **B.** Add more few-shot examples showing correct premium-plus-fee arithmetic so Claude learns to output totals that match the schema before records are submitted.
- **C.** Replace the extracted total with the sum of the extracted premium and fees whenever the JSON schema's arithmetic check fails, then pass the corrected record downstream.
- **D.** Send any inconsistent record to a second Claude call and treat the second model's chosen total as authoritative if it returns valid JSON.

#### Correct answer to question 43: A

Don't silently "fix" source data that has legal value. Store the extracted values exactly as printed, add the calculated total and a mismatch flag, and send material differences to human review. Overwriting the total, teaching the model to "make the numbers add up", or trusting a second model hides real discrepancies.

## Scenario: Claude Code for Continuous Integration

### Question 44

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A fintech team is adding Claude Code to its CI checks for pull requests that modify transaction-processing services. The team wants separate assessments for database migration safety, race-condition risk, test coverage impact, and logging/metrics completeness, with each assessment using its own rubric and the final result posted as one concise comment on the pull request. Which architecture should they choose?

- **A.** Create a shared Claude Code review room where schema, concurrency, test, and observability personas all inspect the same conversation history and collaboratively edit a single findings list.
- **B.** Configure one comprehensive pull-request reviewer agent with a long checklist covering schema migrations, concurrency hazards, test impact, and observability requirements, and have it produce the complete verdict alone.
- **C.** Use a coordinator agent that receives the pull request diff, dispatches separate focused reviews to schema-migration, concurrency, test-impact, and observability subagents in isolated contexts, then merges their findings into one PR comment.
- **D.** Run the pull request through a fixed sequence where one agent first evaluates schema migrations, passes its notes to a concurrency reviewer, then continues through test-impact and observability reviewers before posting the final comment.

#### Correct answer to question 44: C

Independent assessments with distinct rubrics call for a coordinator that delegates to specialized subagents in isolated contexts (no cross-contamination), then aggregates the results into one comment. A shared room introduces bias, one reviewer with a long checklist dilutes attention, and a sequential chain makes the reviews depend on each other.

## Scenario: Claude Code for Continuous Integration

### Question 45

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A platform team is adding Claude Code to a release-gating workflow for a service repository. For each pull request, they want independent checks for API compatibility, test adequacy, deployment-risk indicators, and coding style, each using a different rubric, before posting a single concise approval/blocking summary in the PR. Which architecture should they choose?

- **A.** Place all Claude Code reviewers in the same long-lived conversation so API, testing, deployment, and style reviewers can see and respond to one another’s intermediate notes before posting feedback.
- **B.** A coordinator agent receives the PR diff, launches separate subagents for API compatibility, test adequacy, deployment risk and style with isolated prompts, then merges findings into one comment.
- **C.** Run a single Claude Code review chain where API compatibility findings are produced first, then test adequacy, then deployment-risk, then style, with each stage editing the previous stage’s conclusions.
- **D.** Create one general-purpose Claude Code reviewer with a comprehensive rubric covering API compatibility, test adequacy, deployment-risk, and style, and have it produce the final PR comment directly.

#### Correct answer to question 45: B

Same pattern as question 44: independent checks with different rubrics mean parallel subagents with isolated prompts and contexts, coordinated by an agent that merges the findings into one summary. Shared conversations, chains that edit earlier conclusions, or a single general-purpose reviewer lose the independence and focus.

## Scenario: Code Generation with Claude Code

### Question 46

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A data platform team is adding a Claude Code slash command, `/generate-migration`, that creates a draft database migration checklist for any branch in the `warehouse-core` repository. The command should be available to all contributors after they clone the repo and pull the latest changes. Where should the command definition be placed?

- **A.** .claude/commands/generate-migration.md at the repository root, then commit it with the rest of the project files.
- **B.** ~/.claude/commands/generate-migration.md on the lead developer’s machine, then ask teammates to copy it locally.
- **C.** .claude/generate-migration.md at the repository root, then commit it so the team receives it.
- **D.** tools/claude-commands/generate-migration.md at the repository root, then document the folder in the README.

#### Correct answer to question 46: A

Project slash commands live in `.claude/commands/` in the repository and are committed, so everyone gets them with a pull. `~/.claude/commands/` is personal. `.claude/generate-migration.md` or a custom folder are not recognized as commands.

## Scenario: Structured Data Extraction

### Question 47

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A healthcare analytics team uses Claude to extract discharge-note data into a JSON object with required fields `diagnosis`, `medicationChanges`, `followUpAction`, and `riskFlags`. The JSON always validates against the schema, but a review of notes from three hospital systems shows `followUpAction` is often returned as `null` even when clinicians clearly mention it in free text, tables, or section headers with different wording. What is the best next intervention to improve extraction accuracy?

- **A.** Change the schema so `followUpAction` is optional and allow an empty string whenever the note does not use the exact heading expected by the downstream system.
- **B.** Add a preprocessing step that searches for a fixed set of phrases near `followUpAction` and copies the following sentence into the JSON before validation runs.
- **C.** Add several reviewed examples showing how to extract the same fields from different report formats, including label variants such as "discharge plan" or "next steps".
- **D.** Automatically call Claude again whenever `followUpAction` is blank, using the same prompt and schema until the field is populated or three attempts have been made.

#### Correct answer to question 47: C

The value is in the document but appears under different labels and formats. Few-shot examples showing extraction from varied formats ("discharge plan", "next steps", "follow-up instructions") teach how to generalize. Making the field optional hides the problem, fixed phrases are fragile, and retrying with the same prompt doesn't change the result.

## Scenario: Structured Data Extraction

### Question 48

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A grants-management platform uses Claude to extract applicant details from scanned foundation applications into JSON validated by a schema. The schema accepts an `organizationType` enum with values such as `NONPROFIT_501C3`, `GOVERNMENT`, and `EDUCATIONAL_INSTITUTION`, but Claude handles this field inconsistently: “registered 501(c)(3),” “public charity,” and “NPO tax-exempt status confirmed” are sometimes omitted, sometimes copied verbatim, and sometimes normalized correctly. The relevant wording is usually present in the document. What is the best prompt-engineering change to improve consistency for this field?

- **A.** Set temperature to 0 and keep the current prompt unchanged so identical source wording always produces the same `organizationType` value.
- **B.** Move the workflow to the newest available Claude model so the extractor has more general reasoning capacity when it encounters unfamiliar nonprofit terminology.
- **C.** Change the JSON schema so `organizationType` is always required and fails validation whenever the field is missing from the extracted object.
- **D.** Add representative few-shot examples mapping excerpts to JSON, showing how terms like "NPO" or "501(c)(3)" populate `organizationType`.

#### Correct answer to question 48: D

Like question 34: inconsistent mapping to an enum from varied phrasings is solved with few-shot examples showing excerpt-to-JSON mappings with the approved enum values. Temperature 0 only makes the error deterministic, a newer model doesn't define the mapping, and a required field can push the model toward invented values.

## Scenario: Multi-Agent Research System

### Question 49

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

In a multi-agent research system, the synthesis subagent calls an MCP tool named `buildEvidenceBundle` to retrieve source snippets for a report section. During testing, the tool sometimes receives a short-lived 503 from the internal search index or a socket timeout from the citation cache, and it also sometimes receives invalid arguments such as an empty `topic`, an unsupported `source_set`, or `max_sources: 0`. Which error-handling design is the best approach for this tool?

- **A.** Have the coordinator rerun any failed MCP tool call three times with the same arguments, then mark the evidence bundle unavailable if all attempts produce any kind of error.
- **B.** Have the tool keep returning a generic `ToolError`, but add prompt guidance telling the research subagents to inspect the report plan carefully and retry calls that seem temporarily broken.
- **C.** Have the MCP tool classify errors as `transient_infrastructure` or `invalid_request`; retry socket timeouts and 503s internally with bounded backoff, and return structured validation errors naming the field.
- **D.** Have the MCP tool return every failure immediately with the raw provider message, and require the coordinator agent to infer whether a retry, parameter change, or user-facing warning is appropriate.

#### Correct answer to question 49: C

Different errors need different handling. Transient errors (503s, timeouts) should be retried inside the tool with bounded exponential backoff. Invalid input should not be retried; return a structured error naming the field and the correction so the agent can fix the call. Generic retries with the same arguments, generic errors, or raw messages don't allow correct recovery.

## Scenario: Structured Data Extraction

### Question 50

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A controller’s office is using Claude to extract pension plan disclosures from scanned actuarial reports into JSON for a footnote automation tool. The output includes fields such as `beginning_obligation`, `service_cost`, `benefit_payments`, `ending_obligation`, `discount_rate`, `currency`, and `source_location`. The team needs a validation design that can support financial-reporting reliability and audit traceability before the data is marked approved. Which approach is best?

- **A.** Load all schema-valid extractions into the reporting queue and rely on the external audit team to identify any inaccurate balances during their normal year-end testing.
- **B.** Require the extracted JSON to pass a strict schema with required numeric fields, ISO dates, currency codes, and no additional properties before loading it into the financial close system.
- **C.** Accept records when Claude returns a high confidence score and valid citations, and only rerun extraction for outputs below the confidence threshold set by the reporting team.
- **D.** Validate the schema, then run finance checks (sign, range, roll-forward totals), reconcile each value to cited source text or cells, and sample periodically for manual review.

#### Correct answer to question 50: D

Financial data that needs to be auditable calls for layered validation: schema, domain checks (sign, range), arithmetic reconciliation of the roll-forward, tracing each value back to its source, and periodic sampling for human review. A schema alone, the model's self-reported confidence, or relying on the external auditor are not enough.

## Scenario: Customer Support Resolution Agent

### Question 51

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer says, “My annual plan renewed yesterday, but I never received the premium kit. If you can’t ship it today, refund the renewal—but don’t close my workspace.” The support agent first calls the MCP tool get_customer and receives: workspace is active, annual renewal is paid, premium kit entitlement exists only for plans renewed before a cutoff date, shipping address was changed yesterday, account is flagged for manual review after two recent chargeback disputes, and policy says refunds on reviewed accounts require either verified ownership or human escalation. What should the agent do next in the agentic workflow?

- **A.** Bypass additional model reasoning and apply a rules table that refunds any customer with active membership, blocks anyone with address changes, and escalates only when the refund amount exceeds a preset threshold.
- **B.** Continue the original planned sequence by calling process_refund next, because the workflow began as a refund request and intermediate account-risk details should not change the tool order.
- **C.** Use the returned entitlement, address and fraud-review details as updated context, and let Claude decide whether to refund, look up carrier evidence, ask a clarifying question, or escalate per the policy.
- **D.** Configure the MCP orchestrator to inspect the get_customer JSON and automatically select the next tool from fields such as membership_status, address_changed, and fraud_review without returning the data to Claude.

#### Correct answer to question 51: C

The agentic loop is built on the fact that each tool result becomes new context for the model. Claude then decides the next step dynamically based on the policy and the new risk factors. Keeping to a predetermined sequence, fixed rules tables, or orchestration that keeps the data away from the model all lose the reasoning the situation requires.

## Scenario: Customer Support Resolution Agent

### Question 52

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A Claude Agent SDK support agent is helping a customer who says, “I was promised an $18 credit after last month’s outage, but my new invoice still shows the full amount.” The agent successfully uses `get_customer` and `lookup_order`-style billing tools to verify the account, the affected service period, and that the customer qualifies for the outage credit. When it calls an MCP tool to apply the billing adjustment, the tool returns a structured timeout error from the invoicing service and no adjustment ID. What is the best response strategy for the agent?

- **A.** Stop discussing the account findings and immediately transfer the customer to a billing specialist because any failed MCP tool call means the automated agent should no longer participate.
- **B.** Confirm the subscription is eligible for the promised credit per the records, explain the credit failed because the billing tool timed out, and offer one retry or an escalation.
- **C.** Tell the customer that the $18 credit has been added because the account and invoice data prove they qualify, and note that the adjustment should appear on the next billing cycle.
- **D.** Keep the chat open and continue calling the billing adjustment tool until it returns a confirmation, telling the customer that the system is still processing and that no other action is needed yet.

#### Correct answer to question 52: B

Be transparent: report what was verified (eligibility), state clearly that applying the credit didn't complete (a timeout, so no adjustment ID), and offer concrete options (one retry or an escalation with the context attached). Claiming the credit was applied is false, retrying indefinitely is wrong, and abandoning the conversation throws away the work already done.

## Scenario: Structured Data Extraction

### Question 53

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A nonprofit platform uses Claude to extract strict JSON records from large government grant packets, including indirect cost rates, reporting deadlines, allowable expense categories, subrecipient requirements, and special award conditions. Packets often include revised budgets and attachments where the same field may be repeated with a different value. Which architecture is the best approach for maintaining extraction quality as packet size grows?

- **A.** Extract only from the executive summary, first budget page, and first award letter, since those areas usually contain the highest-value fields and reduce the chance of conflicting values.
- **B.** Split each grant packet into coherent sections (narrative, budget tables, award terms, appendices), run schema-guided extraction on each, then merge the partial JSON, flagging conflicting duplicate fields.
- **C.** Send the entire grant packet in one request with a stricter system prompt, requiring Claude to return one complete JSON object and to pay equal attention to every page regardless of document length.
- **D.** First ask Claude to create a concise summary of the full packet, then run the JSON extraction only against that summary to reduce token usage and normalize the document.

#### Correct answer to question 53: B

For long documents with repeated values, a single huge prompt suffers from attention dilution and summaries lose detail. Split the document into coherent sections, extract with the schema from each one, then merge with rules that flag conflicting duplicate values. Extracting only from the first pages ignores revisions and attachments.

## Scenario: Developer Productivity with Claude

### Question 54

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A Claude Agent SDK tool is assigned to reorganize a legacy CSV import module used by an operations dashboard. The module has no tests, but support engineers warn that odd behaviors around blank columns, duplicate headers, and malformed timestamps may be relied on by old customer exports. The requested work is only to simplify the implementation, not alter outputs. Which approach should the agent take?

- **A.** Have Claude inspect the importer's current behavior, generate characterization tests for its CSV quirks, run them on the unchanged code, then refactor and rerun the same tests before proposing.
- **B.** Use Claude to rewrite the importer into smaller functions immediately, compare the new code visually with the old code, and ask it to summarize any logic it believes stayed equivalent.
- **C.** Use Claude to produce a refactor branch and a checklist of risky cases for the owning team, then wait for maintainers to decide whether they want to add tests before merging.
- **D.** Use Claude to run the TypeScript compiler, ESLint, and formatting checks on the rewritten importer, then accept the refactor if all static checks pass cleanly.

#### Correct answer to question 54: A

For a pure refactor of untested code with undocumented behaviors, write characterization tests first that capture the current behavior (quirks included). Check that they pass on the original code, then refactor and run them again. Visual comparison, waiting for others, or relying only on static checks doesn't guarantee behavior is preserved.

## Scenario: Claude Code for Continuous Integration

### Question 55

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A team adds a Claude Code step to its release pipeline that checks database migration pull requests by calling an internal MCP server named `schema-diff`. The check must run in the hosted CI environment and also work for any developer who clones the repository and runs the same Claude Code command locally. Where should the MCP server configuration be placed?

- **A.** Commit the `schema-diff` MCP server definition in the repository’s `.mcp.json` so the pipeline and local checkouts load the same tool configuration.
- **B.** Add the `schema-diff` MCP server definition to the lead engineer’s `~/.claude.json` and have the CI job authenticate as that account.
- **C.** Document the `schema-diff` endpoint and required arguments in `CLAUDE.md` so Claude Code can infer how to start the MCP server.
- **D.** Create a `.mcp-ci.json` file containing the `schema-diff` server and configure the pull request workflow to run Claude Code from the repository root.

#### Correct answer to question 55: A

Project-scoped `.mcp.json` committed to the repo means CI and every local clone load the same configuration. Personal configs (`~/.claude.json`) and borrowed accounts aren't reproducible, CLAUDE.md doesn't configure MCP servers, and a non-standard `.mcp-ci.json` isn't loaded automatically.

## Scenario: Code Generation with Claude Code

### Question 56

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A team maintains a large TypeScript monorepo and adds a Claude Code command, `/audit-inventory-change`, for changes to the warehouse allocation engine. The proposed workflow runs one pass only on the modified allocation files for invariants, edge cases, and missing tests, then a second pass over order fulfillment, stock reservation, and event publishing paths for integration regressions. What is the best conceptual reason to structure the review this way?

- **A.** Use separate passes: first contained issues in the touched modules, then architectural and integration risks with surrounding context.
- **B.** Use repeated passes over the same files with the same checklist so Claude has more opportunities to catch anything it missed the first time.
- **C.** Use multiple passes mainly so several Claude Code sessions can run at the same time and finish the review faster than a single reviewer would.
- **D.** Use a single prompt that asks Claude to inspect style, logic, security, tests, dependencies, and rollout risks across the entire repository in one run.

#### Correct answer to question 56: A

Splitting the review into a local pass (invariants and tests in the modified files) and an integration pass (fulfillment, reservation, events) lets each one focus on a different kind of risk, with the right context. Repeating the same checklist adds nothing, parallelism isn't the conceptual reason, and one prompt over the whole repo dilutes attention.

## Scenario: Code Generation with Claude Code

### Question 57

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A team adds a Claude Code slash command, `/scan-review-flags`, that reads reviewer comments in source files and outputs CSV columns `fileArea`, `risk`, `ticket`, and `action`. It works for comments such as `// REVIEW(auth): risk=medium ticket=SEC-18 rotate token secret`, but it produces inconsistent CSV when comments have no risk tag, mention two tickets, say both “low risk” and “blocking,” or span several lines. What is the best prompt engineering change to improve consistency across typical and edge-case comments?

- **A.** Add a compact few-shot section mapping raw comment snippets to the exact CSV rows, including blank tags, multiple ticket IDs and status words.
- **B.** Configure the command to run the same extraction prompt three times and keep the response that appears most complete based on token length.
- **C.** Add a prominent instruction saying to be extremely careful, avoid assumptions, and always preserve consistency when interpreting unusual comments.
- **D.** Replace the current prompt with a longer prose description of every column, why the report matters, and how downstream analytics will consume it.

#### Correct answer to question 57: A

Edge cases (no tags, multiple tickets, contradictory status words, wrapped comments) are best defined with few-shot examples that pair raw input with the exact expected CSV output. "Be careful" instructions don't specify the expected behavior, longer prose doesn't help, and picking the longest of three responses isn't a quality criterion.

## Scenario: Developer Productivity with Claude

### Question 58

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A team is building a Claude Agent SDK assistant that helps engineers modernize old services. While proposing refactors, the assistant must confirm the current Jira epic scope, acceptance criteria, and unresolved dependency tickets associated with the module being changed. What is the best approach for giving Claude access to this Jira information in a production developer workflow?

- **A.** Connect Claude Code to the existing Jira MCP server and expose the needed ticket, epic, and dependency lookups as structured tools for the agent.
- **B.** Add a scheduled job that exports relevant Jira tickets to JSON files in the repository so the agent can read them with the Read and Grep tools.
- **C.** Let the agent run Bash commands that call Jira’s REST API with curl whenever it needs ticket, epic, or dependency details.
- **D.** Build a new internal Jira MCP server from scratch so the agent can query ticket, epic, and dependency data through custom tools.

#### Correct answer to question 58: A

If an existing Jira MCP server is already available, use it. It exposes structured, up-to-date tools with authentication handled for you. JSON exports go stale, curl over Bash is fragile and less controlled, and rebuilding a server from scratch is wasted effort.

## Scenario: Multi-Agent Research System

### Question 59

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The document-analysis subagent in your research system must repeatedly apply the same source-quality rubric: classify study design, note sample-size concerns, detect conflicts of interest, and assign an evidence-strength label. You want this rubric to be maintainable and reusable by future analysis subagents without making it an external service. Which Claude Code configuration is the best fit?

- **A.** Package the checklist as a Claude Code skill in `.claude/skills/quality-rubric/` and have the analysis subagent invoke it.
- **B.** Add a `PostToolUse` hook that runs after every document retrieval call and applies the quality rubric to whatever content was returned.
- **C.** Create a custom slash command in `.claude/commands/review-quality.md` so the coordinator can run the same source-quality review whenever a research task begins.
- **D.** Expose the rubric as an MCP tool so every agent can call the source-quality evaluator through the MCP server interface.

#### Correct answer to question 59: A

A reusable rubric that applies when needed, maintained in a versioned file, is exactly what a skill is for (`.claude/skills/<name>/SKILL.md`). A hook would run it on every retrieval indiscriminately, a slash command is for explicit invocation by the user, and an MCP tool would be the external service the scenario says to avoid.

## Scenario: Multi-Agent Research System

### Question 60

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The report-generation subagent calls two MCP tools: `fetchCitationMetadata`, which queries an external bibliography service, and `renderSourceTable`, which formats evidence rows for the final report. In staging, `fetchCitationMetadata` occasionally gets connection resets from the bibliography API, while `renderSourceTable` sometimes receives arguments such as `rows: []`, `sort_by: "impact_score"` when that field is absent, or a malformed DOI string. Which error-handling design is the best approach for these tools?

- **A.** Apply the same retry wrapper to all failed tool calls, using three delayed attempts before returning an error summary, so temporary outages and bad parameters follow one consistent failure path.
- **B.** Return every failure to the coordinator as a generic structured error, including the raw exception and tool name, and let the coordinator decide whether to retry, revise inputs, or ask another subagent to continue.
- **C.** Add system-prompt guidance telling subagents to infer whether a failed call was caused by bad input or an outage, and to rewrite future tool calls based on the wording of any returned exception.
- **D.** Have each tool classify failures into categories, retry transient store or network errors internally with bounded backoff, and return validation errors with fields like `expected_format` and `suggested_fix`.

#### Correct answer to question 60: D

Like question 49: classify errors. Transient errors (connection resets) get internal retries with bounded backoff. Validation errors (empty rows, nonexistent field, malformed DOI) get immediate structured errors with `invalid_parameter`, `expected_format`, and `suggested_fix`. One uniform retry, generic errors, or asking the agent to infer the cause don't allow correct recovery.

