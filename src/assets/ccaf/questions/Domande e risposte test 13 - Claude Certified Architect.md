---
title: "Practice Test 13 – Inferno – Claude Certified Architect"
duration_minutes: 120
difficulty: inferno
---

# Questions and Answers: Practice Test 13 – Inferno – Claude Certified Architect

## Scenario: Customer Support Resolution Agent

### Question 1

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A `PreToolUse` hook already blocks every `process_refund` above $500 and routes it to `escalate_to_human`; it works perfectly. Product now adds a second rule: "When the customer has no stated preference, offer store credit before a cash refund; if they decline, refund normally." Refund volume is high, latency must not grow, and the compliance team says this rule is a commercial preference, not a legal or financial control. An engineer proposes to reuse the same hook mechanism for the new rule. What should you do?

- **A.** Extend the existing hook so that it blocks any `process_refund` call unless the transcript shows that store credit was offered and refused, returning an error that tells the agent to offer it first.
- **B.** Force `tool_choice` to a new `offer_store_credit` tool on the turn after `lookup_order`, so that the offer is always made before the model is free to choose the refund tool on later turns.
- **C.** Express the preference in the system prompt with explicit criteria and a few examples of when to offer credit, keeping the hook only for the $500 limit that needs a deterministic guarantee.
- **D.** Add a `PostToolUse` hook on `lookup_order` that appends a store-credit reminder to every tool result, so that the instruction sits at the end of the context right before the refund decision.

#### Correct answer to Question 1: C

Hooks exist for rules that need a **deterministic guarantee** (financial limits, identity checks, compliance). This rule depends on a judgment ("no stated preference", "declined") that the model must interpret in conversation, and the compliance team explicitly says it is a soft preference: probabilistic compliance through clear criteria and few-shot examples is the appropriate tool, and it adds no latency or brittle logic.

A would be right for a hard ordering rule with verifiable state (like verification before refund), but here the hook would have to parse the transcript to decide whether an offer was "refused", which is fragile and blocks legitimate refunds. B is the right technique to force a first step in a fixed pipeline, but forcing a tool call on every refund conversation ignores customers who already stated a preference. D misuses `PostToolUse`, whose role is normalizing tool results, and pollutes every result with instructions.

## Scenario: Code Generation with Claude Code

### Question 2

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Your project root `CLAUDE.md` is shared through Git. A senior developer recently added two lines to it: "Use tabs for indentation in all TypeScript files" (an agreed team standard enforced in review) and "Always answer me in Italian and explain every change in detail" (his own preference). Since then, several colleagues complain that Claude answers them in Italian with very long explanations, while one new hire who cloned the repository last week says indentation is still inconsistent in his sessions because he deleted the root file "to reduce noise". What is the correct fix?

- **A.** Keep the tabs rule in the project `CLAUDE.md`, move the language and verbosity preference to that developer's `~/.claude/CLAUDE.md`, and restore the project file for the new hire.
- **B.** Move both lines to the developer's `~/.claude/CLAUDE.md`, so that personal and team preferences live in one place and the shared project file stays as small as possible.
- **C.** Move both lines to a `.claude/rules/style.md` file with `paths: ["**/*.ts"]`, so they load only when TypeScript files are touched and stop affecting unrelated sessions.
- **D.** Keep both lines in the project `CLAUDE.md` but prefix the language line with the developer's name, so that Claude understands it applies only when he is the one using the session.

#### Correct answer to Question 2: A

The hierarchy separates **team** instructions (project level, versioned and shared) from **personal** ones (user level, `~/.claude/CLAUDE.md`, never shared through VCS). The tabs standard belongs to everyone; the language preference belongs to one person. The new hire's problem is simply that he removed the shared file.

B is the classic hierarchy mistake in reverse: team standards at user level are invisible to colleagues, which is exactly the "new member does not get the rule" diagnosis. C would be correct for file-type conventions, but a conversational language preference has nothing to do with file paths and would still apply to everyone. D relies on the model guessing who is typing; Claude has no reliable notion of the user's identity inside the shared file.

## Scenario: Multi-Agent Research System

### Question 3

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

For a market report, the coordinator first needs a subagent to identify the five largest companies in a niche (the list is not known in advance), and then needs patent analyses for each of those companies. A latency review notes that the run takes 14 minutes and suggests "always spawning all subagents in parallel in the first coordinator turn". Costs are acceptable, and the patent subagent's prompt requires the company names as input. What is the best design?

- **A.** Spawn the company-identification subagent and five generic patent subagents together in the first turn, asking the patent subagents to guess the likely leaders so that no time is lost waiting.
- **B.** Have a single subagent do both the identification and the five patent analyses sequentially, so the dependency is handled inside one context and the coordinator spawns only one task.
- **C.** Let the identification subagent spawn the five patent subagents directly once it knows the names, so the dependent work starts immediately without a round trip through the coordinator.
- **D.** Run the identification step first, then, in a single later coordinator turn, emit five `Task` calls in parallel, one per company, passing each company's name and context in its prompt.

#### Correct answer to Question 3: D

Parallel `Task` calls in one coordinator turn are the right optimization only for **independent** work. Here the patent analyses depend on the output of the identification step, so the dependency forces one sequential step, after which the five analyses are independent and can run in parallel, with the needed context passed explicitly in each prompt.

A is the general advice ("spawn in parallel") applied where it does not hold: subagents without the company names would research guesses. B removes the dependency problem but serializes five independent analyses in one growing context, losing both latency and isolation. C breaks the hub-and-spoke pattern: subagent-to-subagent delegation bypasses the coordinator's routing, error handling and observability.

## Scenario: Structured Data Extraction

### Question 4

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Your pipeline receives documents of unknown type and has three type-specific extraction tools (`extract_invoice`, `extract_receipt`, `extract_contract`) plus `extract_metadata`. Downstream systems require that `extract_metadata` runs before any type-specific extraction on every document, because its output selects the storage partition. After that step, the model must pick the right type-specific tool and must never answer in plain text. How should you configure `tool_choice` across the two requests?

- **A.** Use `tool_choice: "any"` on both requests and list `extract_metadata` first in the tools array, so that the model is required to call a tool and will naturally start from the metadata step.
- **B.** Force `{"type": "tool", "name": "extract_metadata"}` on the first request, then use `tool_choice: "any"` on the second so the model must call one of the type-specific tools but chooses which.
- **C.** Use `tool_choice: "auto"` on both requests with a system prompt that states the required order, so that the model can still explain in text when a document matches none of the types.
- **D.** Force `{"type": "tool", "name": "extract_metadata"}` on both requests, and let the type-specific extraction be returned inside an extra free-form field of the metadata schema.

#### Correct answer to Question 4: B

Two different guarantees are needed. **Ordering** of a specific step is guaranteed by forcing that tool; **"some tool, never text, model chooses which"** is exactly what `"any"` provides. Combining them across the two requests satisfies both constraints.

A guarantees a tool call but not *which* one first: the order of the tools array is not an ordering guarantee. C is probabilistic and explicitly allows plain-text answers, which the pipeline forbids. D keeps the ordering but abandons the strict per-type schemas, turning the structured extraction into an unvalidated free-form field.

## Scenario: Claude Code for Continuous Integration

### Question 5

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Your organization runs three Claude workloads on the repository: (1) a pre-merge review that blocks the merge button and must finish within 20 minutes, (2) a nightly audit of all services for outdated dependencies, read the next morning, and (3) a weekly generation of documentation drafts. Finance asks to cut costs by moving workloads to the Message Batches API, which gives a 50% discount. Which proposal is the LEAST appropriate?

- **A.** Move the nightly dependency audit to the Batches API, submitting it early enough in the evening that even the worst-case processing window still completes before the team reads it.
- **B.** Move the weekly documentation drafts to the Batches API, using `custom_id` on each request so that results can be matched back to their modules when the batch completes.
- **C.** Move the pre-merge review to the Batches API and use the savings to run it on every push, since most batches complete well within the 20 minutes that the merge gate allows.
- **D.** Keep the pre-merge review on the synchronous API and refine the batch prompts on a representative sample of services before running the full nightly and weekly jobs.

#### Correct answer to Question 5: C

The Batches API offers up to 24 hours of processing and **no latency SLA**: it suits non-blocking workloads, never blocking ones. A pre-merge gate with a 20-minute requirement cannot rely on "most batches finish quickly": the absence of a guarantee is the decisive point.

A is appropriate as long as submission timing respects the 24-hour window. B is the textbook non-blocking use, and `custom_id` is how batch results are correlated. D is good practice on both counts: synchronous for the blocking check, and sample-based prompt refinement before large-scale batch runs.

## Scenario: Developer Productivity with Claude

### Question 6

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

An engineer asks the agent to find every place where `sendInvoice` is called in a TypeScript monorepo of 6,000 files. The function is defined in `billing/core/send.ts`, but `billing/index.ts` re-exports it as `dispatchInvoice`, and most packages import that alias. A first attempt used Grep for `sendInvoice` and found only 3 call sites, while production logs show the function being invoked from at least a dozen services. What should the agent do next?

- **A.** Grep for the export statements that re-export `sendInvoice`, identify the alias names, then Grep for each alias across the repository and Read only the files where they are imported and called.
- **B.** Use Glob with `**/*invoice*` to list every file related to invoices, then Read each of them in full so that no call site is missed, regardless of how the function was imported.
- **C.** Read `billing/index.ts` and every file in the `billing` package in full, since all call sites must ultimately go through that package and the wrapper modules live inside it.
- **D.** Repeat the Grep for `sendInvoice` with a case-insensitive pattern and a wider context window, so that indirect references and comments around the call sites are also captured.

#### Correct answer to Question 6: A

Tracing usage through **wrapper modules** requires following the re-export: Grep for the export to find the alias, then Grep for the alias, then Read only what matters. This builds understanding incrementally without flooding the context.

B confuses Glob (file names) with content search: callers in `orders/` or `payments/` need not have "invoice" in the file name, and reading everything in full wastes context. C searches in the wrong place: the call sites are in the consuming packages, not in `billing`. D still searches for the original name, which the consumers never use; case-insensitivity does not reveal an alias.

## Scenario: Customer Support Resolution Agent

### Question 7

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer writes: "My order arrived damaged. I don't want to deal with a bot, put me through to a person." The agent has already called `lookup_order` and can see that the item is eligible for an automatic replacement that it could complete with one tool call in a few seconds. Your first-contact resolution metric is at 78%, below the 80% target, and the human queue currently has a 25-minute wait. What should the agent do?

- **A.** Complete the automatic replacement first, since it takes only seconds, and then offer the escalation if the customer still wants to speak with someone after seeing that the problem is solved.
- **B.** Escalate immediately with `escalate_to_human`, passing a structured summary with the customer, the order, the damage and the eligible replacement, without attempting the resolution first.
- **C.** Tell the customer about the 25-minute wait and ask whether they would prefer the instant replacement, escalating only if they confirm that they still want a person.
- **D.** Escalate only after verifying the customer with `get_customer`, since a handoff to a human without verified identity would force the operator to restart the conversation.

#### Correct answer to Question 7: B

An **explicit request for a human** is an immediate escalation trigger: the agent must not keep investigating or negotiate. The work already done is not wasted, because it goes into a structured handoff so the operator does not re-ask anything. The FCR metric and the queue length do not change this rule.

A and C are the right behaviour for a customer who is frustrated **but has not asked** for a human: offering a quick resolution first is then appropriate. Here, insisting turns a clear instruction into a negotiation. D adds a precondition that the material does not require for escalation; gating the handoff behind further tool calls delays exactly what the customer asked for.

## Scenario: Code Generation with Claude Code

### Question 8

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Your team is midway through a plan-mode migration of 52 services from a legacy HTTP client to a new SDK. Four situations come up during the same week. For which of them is plan mode the LEAST appropriate choice?

- **A.** Deciding whether services with custom retry logic should keep it or adopt the SDK's retry policy, which affects how 11 teams handle failures in production.
- **B.** Designing how to roll out the migration in waves, since several services share a connection pool and the order in which they move determines what can break at each step.
- **C.** Evaluating two possible adapter designs for the services that stream responses, where each design implies different changes in about 20 files across the repository.
- **D.** Fixing a null-pointer exception in one already-migrated service, with a clear stack trace pointing at a single line where an optional header is read without a check.

#### Correct answer to Question 8: D

Plan mode suits tasks with **architectural implications**, many files, or several viable approaches. A single-file fix backed by a **clear stack trace** is the canonical case for direct execution, even when it happens inside a larger planned project.

A involves an architectural decision with production impact across teams. B is about ordering and dependencies across many services, exactly what safe exploration before changes is for. C compares alternative designs touching about 20 files. All three benefit from planning; only D does not.

## Scenario: Multi-Agent Research System

### Question 9

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The synthesis subagent receives two findings on the same metric: a 2021 government survey reports that 41% of small firms use cloud accounting, and a 2024 industry study reports 63%. Both sources are credible, they use comparable definitions, and the report is about how adoption has evolved. The current synthesis writes "Sources disagree on adoption (41% vs 63%)" in a "Contested findings" section. What is the best correction?

- **A.** Present both figures with their sources and collection dates as a time series showing growth, since the difference reflects the measurement period rather than a contradiction between sources.
- **B.** Keep the figures in the "Contested findings" section but add both sources, since conflicting statistics must always be annotated as conflicts rather than resolved by the synthesis.
- **C.** Report only the 2024 figure with its source, since the more recent study supersedes the older one and presenting both would confuse readers about current adoption levels.
- **D.** Send the two figures back to the coordinator for reconciliation, asking it to launch a third search to determine which of the two sources is the more reliable one.

#### Correct answer to Question 9: A

Publication and collection **dates** exist precisely so that temporal differences are not misread as contradictions. With comparable definitions and a report about evolution, 41% in 2021 and 63% in 2024 are two points of a trend, each with its attribution.

B applies the right rule (annotate conflicts, do not pick one arbitrarily) to a case that is not a conflict. C discards a sourced data point and the trend the report is about. D is the right escalation path for a genuine conflict that needs reconciliation, but here there is nothing to reconcile.

## Scenario: Structured Data Extraction

### Question 10

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

After three months in production, your extraction system shows 97% field-level accuracy on a random validation sample. Management wants to stop human review of all extractions with model confidence above 0.9, which are 85% of the volume. The sample was drawn uniformly, and 80% of documents are standard invoices; the remainder are scanned customs forms and handwritten delivery notes, which feed a tax filing. What should you do before deciding?

- **A.** Raise the threshold from 0.9 to 0.97 so that only the most confident extractions skip review, since the higher bar compensates for any weaker document types in the mix.
- **B.** Run a second uniform random sample of the same size, to confirm that 97% is stable over time before removing review from the high-confidence extractions.
- **C.** Measure accuracy separately by document type and field with stratified random sampling, including the high-confidence extractions, and automate only the segments that prove reliable.
- **D.** Ask the model to re-evaluate its own confidence on the customs forms and handwritten notes, and remove review only for the documents where its second estimate is also above 0.9.

#### Correct answer to Question 10: C

An **aggregate** metric dominated by standard invoices can hide poor performance on minority types, which here feed a tax filing. Stratified sampling by type and field, including high-confidence items, is the way to validate segment by segment before automating.

A raises a threshold based on an uncalibrated confidence score, without knowing per-type error rates. B repeats the same flawed (unstratified) measurement: stability of the average says nothing about the segments. D relies on self-reported confidence, which the material treats as an unreliable indicator unless calibrated against labelled data.

## Scenario: Claude Code for Continuous Integration

### Question 11

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Your CI job runs `claude -p "Review this PR and output findings as JSON"`. The job never hangs, but about 1 run in 15 fails at the parsing step because the output contains a sentence before the JSON or a field with a different name than the script expects. The script posts each finding as an inline comment on the PR. What is the most effective fix?

- **A.** Add few-shot examples of the exact JSON to the prompt and a strong instruction to output nothing else, so that the model consistently reproduces the expected format and field names.
- **B.** Add `--output-format json` with a `--json-schema` describing the findings structure, so the CLI returns structured output that conforms to the fields the script expects.
- **C.** Wrap the parsing in a retry loop that re-runs the whole Claude job when parsing fails, since the failure rate is low and a second run almost always produces valid JSON.
- **D.** Replace `-p` with an interactive session driven by a script, so the pipeline can inspect the output and ask Claude to fix the format when the first answer is not valid JSON.

#### Correct answer to Question 11: B

`-p` already solves the hanging problem (it is not the issue here). Format and field-name drift is solved by **structured output**: `--output-format json` with `--json-schema` makes the CLI return data that conforms to a declared schema, which is what a downstream script needs.

A improves consistency but remains probabilistic, so occasional drift persists. C hides the problem at double the cost and still produces nondeterministic failures. D throws away non-interactive mode, the very thing that makes Claude Code usable in a pipeline.

## Scenario: Developer Productivity with Claude

### Question 12

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

On Monday the agent spent three hours mapping a payment module, producing a long named session. Over the following two days, other teams rewrote about 70% of the files it analyzed, renamed two core classes and deleted one service. On Thursday the engineer wants to continue the investigation of the module. What is the most reliable way to proceed?

- **A.** Resume the named session with `--resume` and tell the agent which files changed, so it can re-read them selectively while keeping the rest of its earlier analysis in context.
- **B.** Fork the Monday session with `--fork-session` so the original analysis stays intact, and continue the investigation in the fork while comparing old and new findings side by side.
- **C.** Resume the named session with `--resume` and ask the agent to run `/compact` first, so that the stale details are condensed and the new exploration has more room in context.
- **D.** Start a new session with a structured summary of the still-valid conclusions from Monday, and let the agent re-explore the rewritten parts of the module from scratch.

#### Correct answer to Question 12: D

Resuming is right when the earlier context is **still valid**. With most analyzed files rewritten, classes renamed and a service deleted, the old tool results would mislead the agent; a fresh session seeded with a structured summary of what still holds is more reliable.

A is the correct pattern when **a few** files changed: tell the agent what changed and re-read selectively. B is for exploring alternative approaches from a shared, valid base, not for working on an obsolete one. C compacts stale information instead of discarding it, so the summary would carry outdated conclusions forward.

## Scenario: Customer Support Resolution Agent

### Question 13

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

`process_refund` is an MCP tool. When a refund breaks policy (for example, the item was bought more than 90 days ago), the tool currently returns `isError: true` with the text "Refund failed". Traces show the agent retrying the same call two or three times, then telling the customer "there was a technical problem, please try again later". Database timeouts produce the same response. What change fixes both behaviours?

- **A.** Return structured error metadata: a business category with `isRetryable: false` and a customer-facing explanation for policy violations, and a transient category marked retryable for timeouts.
- **B.** Add a system prompt instruction telling the agent never to retry `process_refund` more than once, and to tell customers about the 90-day policy whenever a refund fails for any reason.
- **C.** Return `isError: false` with an empty result for policy violations, so that the agent treats them as normal outcomes, and keep `isError: true` with "Refund failed" only for genuine timeouts.
- **D.** Add a `PreToolUse` hook that blocks refunds older than 90 days before they reach the tool, so policy violations never produce an error and only timeouts can still fail.

#### Correct answer to Question 13: A

The agent cannot choose a recovery strategy from a generic message. **Structured errors** distinguish the category (business vs transient) and retryability, and give a user-facing explanation: the agent stops retrying policy violations and explains them correctly, while it can still retry timeouts.

B misinforms customers when the cause is a timeout, and caps retries even when retrying is right. C hides the violation as an apparent success with no explanation, the same anti-pattern as confusing an error with a valid empty result. D handles the 90-day rule deterministically, but gives the agent no way to explain the block to the customer and does nothing about the generic timeout message, so only half the problem is fixed.

## Scenario: Code Generation with Claude Code

### Question 14

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Your team created a project skill `/dep-audit` that scans the repository and prints several thousand lines of dependency analysis. Two problems emerged: after running it, the main session's answers become vague and lose earlier details; and once, while "fixing" an outdated version it found, the skill edited `package.json` without being asked. The skill must stay shared with the team. Which two-part change addresses both problems?

- **A.** Move the skill to `~/.claude/skills/` and add an instruction in its body to never modify files, so that each developer can run it privately and only reads the dependency files.
- **B.** Turn the skill into a `.claude/commands/` slash command with a shorter output format, and add a `PreToolUse` hook that blocks every Edit and Write call across the whole project.
- **C.** Add `context: fork` to its `SKILL.md` frontmatter so it runs in an isolated subagent context, and use `allowed-tools` to restrict it to read-only tools such as Read, Grep and Glob.
- **D.** Add `argument-hint` to ask which package to audit, so the output is smaller, and add a line to the project `CLAUDE.md` forbidding changes to `package.json` during audits.

#### Correct answer to Question 14: C

`context: fork` isolates verbose output in a subagent context so the main session is not polluted; `allowed-tools` **restricts** what the skill can use, preventing edits structurally. Both live in the shared `.claude/skills/` frontmatter.

A breaks the sharing requirement and relies on an instruction rather than a restriction. B's hook would block edits everywhere, including legitimate work in normal sessions, and a slash command does not isolate context. D narrows the scope a little and adds a probabilistic instruction, but the audit output still floods the main context.

## Scenario: Multi-Agent Research System

### Question 15

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

To cut latency, a developer changed the system so that the web search subagent hands its results directly to the analysis subagent, which then calls the synthesis subagent; the coordinator only receives the final report. Latency dropped by 20%, but when a report contains a wrong claim nobody can tell which step introduced it, and when the analysis subagent fails the run silently produces a partial report. What is the best response?

- **A.** Keep the direct chain but have each subagent append a log line to a shared file, so that engineers can reconstruct the path of each claim after the fact without slowing down the run.
- **B.** Restore hub-and-spoke routing so every result returns to the coordinator, which handles errors and routing, and recover latency by running independent subagents in parallel.
- **C.** Keep the direct chain and give the synthesis subagent a final check that compares the report with the original search results, so that wrong claims are caught before delivery.
- **D.** Merge analysis and synthesis into a single subagent to shorten the chain, so there is one less handoff in which claims can be distorted and one less step that can fail.

#### Correct answer to Question 15: B

The coordinator owns **all communication, error handling and routing** so that the system is observable and failures are handled. The latency gain is better recovered with legitimate parallelism of independent work than by bypassing the hub.

A adds post-hoc forensics but leaves failure handling with no owner: partial reports still go out silently. C adds a check but still lets a failed step pass unnoticed and keeps routing outside the coordinator. D reduces the number of steps but not the lack of observability or error handling.

## Scenario: Structured Data Extraction

### Question 16

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

You extract data from supplier contracts. The field `penalty_rate` is missing in 18% of outputs. A retry loop resends the document with the validation error ("penalty_rate is required"), but after three retries the success rate on those documents is still near zero. Reading a sample, you notice that those contracts say "penalties as defined in Annex C", and Annex C is a separate file that is not sent to the pipeline. What should you do?

- **A.** Add few-shot examples showing how to infer a plausible penalty rate from the other contract terms, so that the field is always filled and the downstream validation stops rejecting it.
- **B.** Increase the retries to five and include the full list of previous failed attempts in each retry, so that the model has more feedback to correct its extraction of the missing field.
- **C.** Switch to forcing the extraction tool with `tool_choice`, since a forced call guarantees that every required field in the schema is present in the output of each contract.
- **D.** Stop retrying those cases, make `penalty_rate` nullable with a field recording the external reference, and route them so that the annex can be retrieved or reviewed.

#### Correct answer to Question 16: D

Retry-with-feedback works when the information is **in the source** and the model extracted it badly. When the data lives only in an external document, retries are useless: the right design accepts absence (nullable field), records where the value lives, and routes the case for retrieval or review.

A teaches the model to fabricate values. B adds more of an approach that cannot work. C guarantees a tool call and schema-conformant syntax, but a required field the source does not contain still invites an invented value.

## Scenario: Claude Code for Continuous Integration

### Question 17

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A developer uses Claude Code locally to implement a feature, then in the same session asks "Now review your changes thoroughly as a senior engineer would" before opening the PR. The CI pipeline then runs its own review. The team notices that the local self-review almost never finds problems that the CI review catches, even subtle ones. Budget allows one extra review step. Where is it best spent?

- **A.** A review run by an independent Claude instance that receives the diff and project standards but not the generation session's reasoning, so it is not anchored to the original decisions.
- **B.** A second self-review in the same session with a stricter prompt listing the categories to check, so that the model reconsiders each change against explicit criteria before the PR.
- **C.** Asking the generating session to state its confidence for each changed file, and sending only the files below a given confidence threshold to the more expensive CI review step.
- **D.** Extending the generation session with the CI findings of previous PRs, so that the same session learns the issues usually caught downstream and avoids them in its self-review.

#### Correct answer to Question 17: A

Self-review is limited because the model **keeps its own reasoning context** and is less likely to question its decisions. An independent instance without the generation context is more effective at catching subtle issues.

B improves the criteria but keeps the same anchored context, the root cause. C routes on self-reported confidence from the same anchored session, an unreliable signal. D makes the generating context even longer while still reviewing its own work.

## Scenario: Developer Productivity with Claude

### Question 18

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

After two hours exploring a legacy codebase with many long Grep and Read outputs, the agent's answers become generic: it talks about "typical service-layer patterns" instead of the specific classes it examined earlier, and it has started contradicting a finding from the first hour. The exploration still has three phases to go. What is the most effective strategy for the rest of the work?

- **A.** Raise the context limit with a larger model and continue in the same session, since the problem is the size of the context window and not the way the exploration is organized.
- **B.** Restart from scratch in a new session and re-run all the Grep and Read commands of the first two hours, so that the agent rebuilds its knowledge with fresh and consistent context.
- **C.** Write the key findings to a scratchpad file, then delegate each remaining phase's exploration to subagents that return concise results, keeping coordination in the main agent.
- **D.** Ask the agent to summarize everything it has learned so far into its next answer, so that the important findings move to the end of the context where they get more attention.

#### Correct answer to Question 18: C

These are symptoms of **context degradation** in long sessions. A scratchpad preserves findings beyond the context, and subagents isolate verbose exploration output so the main agent keeps only what it needs for coordination.

A treats a structural issue as a capacity issue: verbose output will fill a larger window too. B repeats the same verbose exploration and will degrade again. D keeps everything in the same polluted session; a summary inside the conversation is still exposed to further degradation and does not persist.

## Scenario: Customer Support Resolution Agent

### Question 19

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A caller provides only a full name and a postcode. `get_customer` returns two active accounts that match both. One account has an order placed yesterday that matches the product the customer is describing; the other has had no activity for two years. The customer is in a hurry and asks for an immediate refund of yesterday's order. What should the agent do?

- **A.** Proceed with the recently active account, since yesterday's order matches the product described and the inactive account is very unlikely to be the one the customer means.
- **B.** Escalate to a human, since multiple matches mean the agent cannot safely resolve the case and an operator is better placed to judge which of the two accounts is correct.
- **C.** Ask the customer to confirm the product name of yesterday's order, and proceed with the matching account if the answer agrees with what the order lookup shows.
- **D.** Ask for an additional identifier such as the email address or the order number, and proceed only once it uniquely identifies one of the two accounts.

#### Correct answer to Question 19: D

With **multiple matches**, the agent must request additional identifiers rather than rely on heuristics. Activity, recency or plausibility do not identify a person: acting on the wrong account is a privacy and financial error.

A is the textbook heuristic trap. B escalates a case that is within the agent's scope and solvable with one question. C looks like verification, but the product name is information the agent itself hinted at and a family member could share it: it is not a unique identifier like email or order number.

## Scenario: Code Generation with Claude Code

### Question 20

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A developer created a `/release-notes` command that works well for him. He put it in `~/.claude/commands/release-notes.md` and then wrote in the team chat that everyone can now use it. Two colleagues report that the command does not exist in their Claude Code, and a third says he has a different `/release-notes` from a previous project. The command should be identical for everyone and reviewed like code. What is the correct fix?

- **A.** Ask every colleague to copy the file into their own `~/.claude/commands/`, overwriting older versions, so that everyone has the same command available in every project they open.
- **B.** Move the command to the project's `.claude/commands/` directory and commit it, so that it is versioned, reviewed and available to everyone who works on the repository.
- **C.** Describe the release-notes procedure in the project `CLAUDE.md`, so that Claude follows it whenever someone asks for release notes, without needing a separate command file.
- **D.** Configure the command as a tool of an MCP server in `.mcp.json`, so it is shared through the repository and Claude can invoke it automatically when release notes are needed.

#### Correct answer to Question 20: B

**Project commands** live in `.claude/commands/` and are shared through version control; **user commands** in `~/.claude/commands/` are personal and invisible to others. A versioned, reviewed, identical command for everyone belongs in the repository.

A creates copies that drift and are not reviewed like code, and it leaves name clashes across projects. C turns an on-demand command into always-loaded context and loses explicit invocation. D uses an integration mechanism (MCP) for a prompt template, a much heavier solution than the problem requires.

## Scenario: Multi-Agent Research System

### Question 21

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The final reports contain well-written paragraphs, but the reviewers cannot check them: about a third of the claims have no citation or a citation to the wrong source. Traces show that the search and analysis subagents return findings with URLs and quotes, but the coordinator passes the synthesis subagent a prose summary it writes itself, "to save context". Context budget is tight. What is the most effective fix?

- **A.** Have the coordinator pass the findings to the synthesis subagent as structured claim-to-source mappings (claim, URL or document, quote, date) and require the synthesis to preserve them.
- **B.** Add an instruction to the synthesis subagent's prompt requiring a citation for every claim, so that it searches for supporting sources for any claim that arrives without one.
- **C.** Add a final citation subagent that, after synthesis, searches the web for a source supporting each uncited claim and inserts the best match it finds into the final report.
- **D.** Pass the full raw outputs of the search and analysis subagents to the synthesis subagent instead of the summary, so that no information at all is lost during the handoff.

#### Correct answer to Question 21: A

Attribution is lost when **claim-to-source mappings** are not preserved through aggregation. Passing structured mappings keeps provenance while staying compact, which also respects the tight context budget.

B asks the synthesis subagent to recover information it never received, inviting new searches or invented citations. C finds *a* source for each claim after the fact, which is not the source the claim came from. D preserves provenance but ignores the context constraint and buries the important data in verbose outputs.

## Scenario: Structured Data Extraction

### Question 22

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

The `document_category` field is an enum of nine values. Every week new kinds of documents arrive (for example, warranty claims) that fit none of them, and the model forces each into the closest category, corrupting reports. Some documents are also so damaged that even a human cannot tell the category. Downstream analysts want to discover new categories over time without a schema change every week. What schema change is best?

- **A.** Remove the enum and make `document_category` a free-text string, so that the model can describe any new kind of document precisely without being forced into an existing value.
- **B.** Add a confidence field next to the category and discard the category when confidence is low, so that only documents the model is sure about end up in the downstream reports.
- **C.** Add `"other"` with a companion `category_detail` text field, and `"unclear"` for documents whose category cannot be determined, keeping the existing nine values unchanged.
- **D.** Extend the enum to thirty values covering every document type the business might plausibly receive, so that the model always has a close match available for new documents.

#### Correct answer to Question 22: C

Extensible categorization is done with **`"other"` plus a descriptive field** (new kinds are captured and can later become values) and **`"unclear"`** for genuinely undeterminable cases. The existing values stay validated.

A loses validation and consistency: the same category would appear under many spellings. B uses an uncalibrated confidence to discard data instead of representing the two distinct situations. D only postpones the problem and makes selection among many close values harder.

## Scenario: Claude Code for Continuous Integration

### Question 23

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Your CI review runs on every push to a pull request. Developers complain that after each new commit the review reposts comments on issues they already fixed, and repeats comments they explicitly marked as "won't fix" in the thread. The review must still catch new problems introduced by later commits. What is the best change?

- **A.** Run the review only once, on the first push of each PR, so that developers receive a single set of comments and can resolve them without being interrupted by repeated feedback.
- **B.** Run the review only on the diff of the latest commit, so that the review cannot comment again on code that was already reviewed in earlier runs on the same pull request.
- **C.** Have the CI script delete all previous review comments before posting new ones, so that the PR always shows only the latest review instead of an accumulation of repeated feedback.
- **D.** Include the previous review findings and their status in the context of each re-run, instructing the review to report only issues that are new or still unresolved.

#### Correct answer to Question 23: D

The material addresses exactly this: when re-running after new commits, **include the prior review results** so the model reports only new or unresolved issues, respecting what was already fixed or dismissed.

A misses issues introduced by later commits. B loses cross-commit context: a problem may arise from the interaction between the latest change and earlier ones. C removes duplicates visually but still re-raises "won't fix" items and erases the discussion history.

## Scenario: Developer Productivity with Claude

### Question 24

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

Every session of your developer agent starts with 10 to 15 exploratory tool calls just to discover which internal API schemas, service catalogs and architecture documents exist, before doing any real work. The documents change weekly, are served by an internal MCP server, and the agent already has a `search_docs` tool that works well once it knows what to look for. What is the most effective change?

- **A.** Paste the full content of every schema and architecture document into the system prompt, so that the agent never needs to search for them at the beginning of a session.
- **B.** Expose the catalog of available schemas and documents as MCP resources, so the agent can see what exists up front and call `search_docs` only for the content it needs.
- **C.** Add a `list_everything` tool that returns all documents with their full content in one call, replacing the 10 to 15 exploratory calls with a single large tool result.
- **D.** Write a section in the project `CLAUDE.md` listing the current documents and their locations, and ask developers to keep it updated whenever the documents change.

#### Correct answer to Question 24: B

MCP **resources** as content catalogs give the agent visibility of what is available and reduce exploratory tool calls; the content is still fetched on demand. Because the server owns the catalog, it stays current with weekly changes.

A floods the context with weekly-changing content most sessions do not need. C replaces many small calls with one enormous result, a disproportionate tool output. D works on paper but depends on manual upkeep of a list that changes every week, and it will drift.

## Scenario: Customer Support Resolution Agent

### Question 25

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer's single message asks for three things: a refund for a damaged blender (order A), a delivery address change for a pending order (order B), and an explanation of a duplicate charge on last month's invoice. Currently the agent handles the refund, writes a long answer, and the other two requests are forgotten in about 40% of such conversations. Each request needs different tools and they do not depend on each other. What is the best design?

- **A.** Decompose the message into distinct items, investigate each with the tools it needs (in parallel where independent), then compose one response that addresses all three items.
- **B.** Escalate every message containing more than one request to a human, since multi-issue conversations exceed the reliable scope of the agent and lower first-contact resolution.
- **C.** Ask the customer to send each request in a separate conversation, so the agent can process one issue at a time with full attention and a clean context for each request.
- **D.** Add a `PostToolUse` hook that, after each tool call, appends the original customer message to the result, so that the agent keeps seeing all three requests until the end.

#### Correct answer to Question 25: A

**Multi-concern requests** should be decomposed into separate items, each investigated with the appropriate tools (independent ones can be handled in parallel), and then synthesized into a single complete answer.

B escalates cases that are fully within the agent's scope. C shifts the burden to the customer and hurts the experience and FCR. D misuses a normalization hook to compensate for a missing decomposition step, and repeatedly bloats the context.

## Scenario: Code Generation with Claude Code

### Question 26

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Your repository has Terraform files in `infra/`, in `services/*/deploy/` (40 services) and in `modules/shared/`. You want Terraform conventions (naming, tagging, state backend) applied whenever Claude edits a `.tf` file, and never loaded when it works on application code. Today the conventions are in the root `CLAUDE.md` and take 300 lines. What is the best configuration?

- **A.** Create a `CLAUDE.md` in `infra/`, one in `modules/shared/` and one in each of the 40 `services/*/deploy/` directories, each importing the same conventions file with `@path`.
- **B.** Move the conventions into a skill called `terraform-conventions`, so that Claude loads them when it judges a task to be infrastructure-related and leaves them out otherwise.
- **C.** Keep the conventions in the root `CLAUDE.md` but move them to the end of the file, so that they do not interfere with the instructions that are relevant for application code.
- **D.** Move the conventions into `.claude/rules/terraform.md` with `paths: ["**/*.tf"]` in its frontmatter, and remove them from the root `CLAUDE.md`.

#### Correct answer to Question 26: D

When conventions apply to a **file type scattered across many directories**, a path-scoped rule with a glob is preferable to directory-level files: it loads only when matching files are edited and is maintained in one place.

A is the directory-level approach: it works but requires 42 files that must be kept in sync, the scenario where the material prefers glob rules. B makes loading depend on the model's judgment, while conventions should apply automatically to matching files. C still loads 300 lines in every session.

## Scenario: Multi-Agent Research System

### Question 27

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The synthesis subagent often needs to verify single facts (a date, a figure, a name) while writing. Today it returns to the coordinator for each check, which then spawns the search subagent: 85% of these round trips are simple lookups and they add 40% latency. The remaining 15% are open questions requiring real investigation. A colleague proposes giving the synthesis subagent the full web search toolset. What is the best design?

- **A.** Give the synthesis subagent the full web search toolset, since it already knows what it needs, and remove the round trip through the coordinator for all verification requests.
- **B.** Keep the round trips but batch them, so that the synthesis subagent collects all its verification needs and the coordinator runs one search subagent for all of them at the end.
- **C.** Give the synthesis subagent a narrowly scoped `verify_fact` tool for simple lookups, and keep routing open-ended investigations through the coordinator to the search subagent.
- **D.** Merge the search and synthesis subagents into one, so that verification happens inside the same context and the coordinator no longer needs to handle round trips between them.

#### Correct answer to Question 27: C

Tools should be **scoped to the role**, plus a small set of cross-role utilities for frequent needs. A constrained `verify_fact` covers the 85% of simple lookups without latency, while real investigations stay with the specialized agent through the coordinator.

A gives the synthesis agent tools outside its specialization, which the material warns leads to misuse (it starts doing its own research). B reduces calls but delays verification until after writing, when it is needed during writing. D removes specialization and isolation.

## Scenario: Structured Data Extraction

### Question 28

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Your system extracts 30 fields from loan applications. A single document-level confidence score is used to decide human review, but auditors find that applications with high overall confidence still contain wrong values in two critical fields (`annual_income` and `employer_name`), while low-confidence applications are often wrong only in trivial fields. You have a labelled validation set of 5,000 applications. What should you implement?

- **A.** Lower the document-level threshold so that more applications go to review, since a more conservative overall threshold catches more of the wrong critical fields as well.
- **B.** Produce field-level confidence scores, calibrate a review threshold per field on the labelled validation set, and route to review based on the critical fields' calibrated scores.
- **C.** Ask the model to explain its confidence in natural language for each application, and route to review those whose explanation mentions uncertainty about income or employer.
- **D.** Send every application to review whenever `annual_income` is above a certain amount, since high-value loans carry more risk regardless of the confidence of the extraction.

#### Correct answer to Question 28: B

Errors concentrate on specific fields, so confidence must be **field-level**, and thresholds must be **calibrated on labelled data** to mean something. The labelled set is the decisive resource here.

A increases review volume without targeting the fields that matter. C relies on uncalibrated self-assessment. D is a business-risk rule, which may be legitimate in itself, but it does not address extraction accuracy and misses wrong values on lower amounts.

## Scenario: Claude Code for Continuous Integration

### Question 29

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Your automated review reports findings in five categories. Analysis of developer reactions over two months shows that "naming and style" findings are dismissed 82% of the time, while "security" and "correctness" findings are accepted 90% of the time. Developers say they have started ignoring the whole bot because of the noise. A quick fix is needed while the prompt is reworked. Which action is most effective now?

- **A.** Temporarily disable the high-false-positive "naming and style" category while you write explicit criteria for it, keeping the accurate categories active.
- **B.** Add "be more conservative and only report issues you are confident about" to the prompt, so that the model reduces the number of findings in all five categories.
- **C.** Have the model attach a confidence score to each finding and post only those above 0.8, so that low-quality findings in any category stop reaching the developers.
- **D.** Lower the severity of all style findings to "info" and collapse them in the PR view, so that developers can still see them but they no longer clutter the review.

#### Correct answer to Question 29: A

False positives in one category **erode trust in all categories**, including the accurate ones. Temporarily disabling the noisy category restores trust immediately, while explicit criteria are developed.

B is the vague instruction the material says works worse than concrete criteria, and it also suppresses accurate findings. C relies on uncalibrated self-reported confidence. D still shows the noise and still trains developers to ignore the bot.

## Scenario: Developer Productivity with Claude

### Question 30

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

The agent must change a single configuration line `timeout: 30` to `timeout: 60` in a YAML file of 400 lines. Edit fails because `timeout: 30` appears in three different blocks, and only the one under `payment_gateway:` must change. The engineer forbids adding comments or reformatting the file, and wants no other line touched. What should the agent do according to the recommended tool fallback?

- **A.** Retry Edit with the same string several times, since the tool will eventually match the occurrence closest to the beginning of the file, which is often the intended one.
- **B.** Use Bash with `sed` to replace every `timeout: 30` in the file with `timeout: 60`, since the three values were probably meant to be identical anyway.
- **C.** Use Grep to count the occurrences, then ask the engineer to change the other two values manually, so that the string becomes unique and the Edit can finally succeed.
- **D.** Read the whole file, change only the `timeout` line inside the `payment_gateway:` block, and Write the file back with every other line left exactly as it was.

#### Correct answer to Question 30: D

The material's fallback when Edit fails because the match is **not unique** is **Read + Write**: read the full content, make the targeted change, write it back unchanged elsewhere.

A misunderstands Edit: a non-unique match fails, it does not pick an occurrence. B changes two values the engineer did not ask to touch. C pushes work onto the engineer and changes unrelated configuration to satisfy a tool limitation.

## Scenario: Customer Support Resolution Agent

### Question 31

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

In conversations longer than 30 turns, the agent progressively summarizes older turns to save context. QA finds cases where, after the summary, the agent offers a refund of "about the order amount" instead of the exact $1,284.50 that was confirmed earlier, or forgets that the customer said the delivery date was 14 March. Context usage must stay under the current budget. What is the best fix?

- **A.** Stop summarizing and keep the full conversation history in every request, since summarization is the cause of the lost details and full history guarantees nothing is ever lost.
- **B.** Summarize more often but with a prompt instructing the summarizer to "preserve all important details", so that amounts and dates survive each round of summarization.
- **C.** Extract transactional facts (amounts, dates, order IDs, confirmed decisions) into a persistent "case facts" block kept outside the summarized history and included in every request.
- **D.** Move the summary to the end of the context, just before the latest customer message, so that the model gives the most attention to the details it contains when deciding.

#### Correct answer to Question 31: C

Progressive summarization tends to condense **numbers, percentages and dates** into vague wording. A persistent **case facts** block separate from the summarized history preserves them exactly while still allowing summarization within budget.

A violates the context budget constraint. B is a vague instruction: summarization still compresses, and "important" is left to judgment. D changes where the summary is, but the exact values have already been lost inside it.

## Scenario: Code Generation with Claude Code

### Question 32

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

You ask Claude Code to add a caching layer in front of a pricing service used by checkout, promotions and invoicing. You know what you want at a high level, but you suspect there are design considerations you have not thought through (invalidation when prices change, behaviour when the cache is down, consistency between checkout and invoice). You have not started any code yet. What is the most effective first step?

- **A.** Ask Claude to interview you about the design before implementing, so that it surfaces the non-obvious considerations (invalidation, failure modes, consistency) and you decide them up front.
- **B.** Ask Claude to implement the cache directly with sensible defaults, then review the code and correct any decisions you disagree with during the review of the pull request.
- **C.** Write a list of test cases for the obvious behaviour first, then let Claude implement the cache and iterate until all those tests pass, adding new ones as problems emerge.
- **D.** Provide two or three input and output examples of cached pricing requests, so that Claude understands precisely the behaviour you expect from the new caching layer.

#### Correct answer to Question 32: A

When **you suspect there are considerations you have not thought through**, the interview pattern is the tool: Claude asks the questions that surface non-obvious design choices such as invalidation and failure modes before any code exists.

B defers design decisions into code review, where they are costlier to change. C is test-driven iteration, excellent once the expected behaviour is known, but tests for "the obvious behaviour" do not surface the unknown considerations. D is the best way to communicate a **known** transformation, not to discover design issues.

## Scenario: Multi-Agent Research System

### Question 33

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The web search subagent calls a search MCP tool. Two situations occur: (1) the provider times out intermittently; (2) a query on a niche topic returns zero results. Today, in both cases, the subagent returns "Search unavailable" to the coordinator, which then either skips the subtopic or aborts the run. The team wants the run to continue when possible and the coordinator to make informed decisions. What should the subagent do?

- **A.** Retry the timeouts locally a few times, and for both situations return a successful empty list to the coordinator, so the run continues without the coordinator having to handle any error.
- **B.** Retry transient timeouts locally; if still failing, propagate a structured error with type, query, partial results and alternatives; report zero results as a valid empty result, not an error.
- **C.** Propagate every failure immediately to the coordinator with full details and let it decide on retries, so that all recovery decisions are centralized in one place for observability.
- **D.** Abort the whole run on the first timeout with a detailed error message, since continuing with incomplete research would produce a report whose coverage cannot be trusted.

#### Correct answer to Question 33: B

Transient errors are **recovered locally** in the subagent; only unrecoverable ones are propagated, with **structured context** (type, attempted operation, partial results, alternatives). An **access failure** must be distinguished from a **valid empty result**.

A suppresses errors silently, an anti-pattern: the coordinator would believe the topic has no sources. C pushes simple transient recovery up to the coordinator unnecessarily. D is the opposite anti-pattern: aborting the whole workflow for a single failure.

## Scenario: Structured Data Extraction

### Question 34

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

You extract line items and totals from invoices with `tool_use` and a strict JSON schema. Schema errors have dropped to zero. Finance now reports invoices where the extracted line items do not add up to the extracted total, and cannot tell whether the error is in a line item, in the total, or in the invoice itself, which is sometimes wrong at the source. What is the best change?

- **A.** Make the JSON schema stricter by adding minimum and maximum values for each amount field, so that implausible values are rejected by the validator before reaching finance.
- **B.** Add an instruction to the prompt asking the model to make sure that line items always add up to the total, correcting either value when they do not match.
- **C.** Use `tool_choice` to force the extraction tool on every request, since forcing the call removes the remaining errors that the model makes when it decides how to answer.
- **D.** Extract both the `stated_total` printed on the invoice and a `calculated_total` from the line items, flag discrepancies, and route flagged invoices for retry or review.

#### Correct answer to Question 34: D

Strict schemas remove **syntax** errors, not **semantic** ones. Extracting both the stated and calculated totals turns inconsistency into a detectable signal and distinguishes extraction errors from invoices wrong at the source.

A rejects only out-of-range values, not inconsistent sums. B pushes the model to "fix" numbers, hiding source errors and inventing values. C is already effectively in place (schema errors are zero) and does nothing for semantic correctness.

## Scenario: Claude Code for Continuous Integration

### Question 35

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

For pull requests touching 20 or more files, the single-pass CI review is inconsistent: some files get detailed comments, others get almost none, and the review misses a bug where a renamed field in `api/schema.ts` breaks a consumer in `web/orders.tsx`. Reviews are blocking and must stay synchronous. What is the best restructuring?

- **A.** Use a larger context window so the single pass can hold all the changed files and their full contents at once, giving the model a complete view of the pull request.
- **B.** Run the same single-pass review three times and keep only the findings reported in at least two runs, so that the inconsistent findings are filtered out of the final result.
- **C.** Review each file in a separate local pass, then run a cross-file integration pass focused on interfaces and data flow between the changed files to catch issues like the renamed field.
- **D.** Split the pull request automatically into smaller PRs of five files each, so that every review stays small enough for the model to give every file the same level of attention.

#### Correct answer to Question 35: C

**Multi-pass review**: per-file local passes keep attention even, and an integration pass catches **cross-file** issues such as a renamed field breaking a consumer. Both passes remain synchronous.

A does not address attention dilution: more files in one pass is the cause. B filters inconsistency but cannot find what no single pass sees, and triples cost. D breaks the PR into pieces that hide exactly the cross-file interactions where the bug lives.

## Scenario: Developer Productivity with Claude

### Question 36

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

After a two-hour investigation into a slow payment reconciliation job, the agent has built a detailed shared understanding of the code. You want to try two refactoring strategies (batching the database writes vs introducing a queue) and compare the results, without either attempt contaminating the other or losing the shared analysis. What is the best approach?

- **A.** Fork the session twice from the analysis point (for example with `--fork-session`), try one strategy in each branch, and compare the outcomes while the original session stays intact.
- **B.** Resume the session with `--resume`, try the batching strategy, then revert the code and try the queue strategy in the same session, comparing the results at the end of the session.
- **C.** Start two brand-new sessions, each with a short description of the job, and let each one rediscover the code before trying its assigned strategy independently of the other.
- **D.** Ask the current session to try both strategies at once in separate directories, so that it can compare them directly while keeping the full context of both attempts available.

#### Correct answer to Question 36: A

Forking creates **independent branches from a shared context**: both strategies start from the same analysis, cannot contaminate each other, and the original session is preserved.

B tries both in one context: the second attempt is biased by the first. C throws away two hours of valid analysis. D mixes both attempts in a single context, the contamination the team wants to avoid.

## Scenario: Customer Support Resolution Agent

### Question 37

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

The agent uses three MCP tools that return timestamps in different formats: `lookup_order` returns Unix epoch seconds, the shipping tool returns ISO 8601 strings, and the returns system returns "DD/MM/YYYY". The agent sometimes concludes that a return window has expired when it has not, especially when comparing dates from different tools. The tools are owned by other teams and cannot be changed this quarter. What is the most reliable fix?

- **A.** Add a system prompt section explaining the three formats with examples, so that the agent converts each timestamp correctly before comparing dates from different tools.
- **B.** Add a `PostToolUse` hook that normalizes every timestamp to a single format (for example ISO 8601) before the results reach the model, so all comparisons use one format.
- **C.** Add a `date_compare` tool that the agent can call whenever it needs to compare two dates, so the computation is done by code rather than by the model's own reasoning.
- **D.** Ask the owning teams to add a note in each tool's description stating the format, so that the agent knows which format each result uses when it reads the tool output.

#### Correct answer to Question 37: B

`PostToolUse` hooks intercept tool results **before the model consumes them**: this is exactly the place to normalize heterogeneous formats deterministically, without changing the tools owned by other teams.

A remains probabilistic. C helps only when the model remembers to call it and still requires it to parse three formats correctly. D needs changes from the other teams, which the constraints exclude, and still leaves the conversion to the model.

## Scenario: Code Generation with Claude Code

### Question 38

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

You ask Claude Code to implement a function that converts free-text duration strings ("1h30", "90 min", "1.5 hours", "PT1H30M") into seconds. You have described the rules in two paragraphs of prose, but after three iterations Claude still misinterprets ambiguous cases like "1.5h" and "1h 5". You know exactly what output you expect for each format. What is the most effective next step?

- **A.** Rewrite the prose rules more precisely and in more detail, numbering each rule and adding an explicit order of precedence for the ambiguous formats that keep failing.
- **B.** Switch to plan mode so that Claude explores the codebase and designs an approach before writing the parser, since the repeated failures suggest an architectural problem.
- **C.** Provide two or three concrete input and output examples, including the ambiguous cases, and ideally tests encoding them so that Claude can iterate on failures.
- **D.** Ask Claude to interview you about the requirements, so that it can discover the considerations behind each format before attempting another implementation.

#### Correct answer to Question 38: C

**Concrete input/output examples** are the most effective way to communicate expectations for a transformation, and tests turn them into test-driven iteration. You already know the expected outputs, so examples (not more prose) remove the ambiguity.

A adds more of what is already failing. B is for architectural tasks; a parser for known formats is not one. D is for surfacing unknown design considerations, but here the requirements are fully known.

## Scenario: Multi-Agent Research System

### Question 39

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

Asked to research "the impact of remote work on urban economies", the system produces well-cited reports, but they cover only office real estate and public transport, ignoring retail, tax revenue and housing. Traces show that the coordinator decomposed the topic into "office vacancy rates" and "commuter transit use", and the subagents did excellent work on exactly those. What is the root cause and fix?

- **A.** The search subagent's queries are too narrow: broaden its prompt so it looks for any economic effect of remote work, even beyond the subtopic it was assigned.
- **B.** The synthesis subagent is filtering out relevant material: instruct it to include every economic dimension it finds, even when only a few sources support it.
- **C.** The number of sources is too low: raise the limit of results per search so the subagents surface more sources and, with them, the missing economic areas.
- **D.** The coordinator's decomposition is too narrow: revise it to cover the topic's main dimensions and evaluate coverage of the synthesis, re-delegating the gaps found.

#### Correct answer to Question 39: D

The subagents did their assigned work well; the gaps come from the **coordinator's decomposition**. The fix is in the coordinator: broader task decomposition plus an iterative refinement loop that evaluates coverage and reallocates work.

A blurs the subagents' scope and causes duplication instead of fixing the plan. B cannot include material that was never collected. C produces more sources on the same two subtopics.

## Scenario: Structured Data Extraction

### Question 40

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A batch of 12,000 extraction requests returns with 310 failures: 240 failed because the documents (long technical contracts) exceeded the context limit, and 70 failed for transient reasons. The batch results are not returned in submission order, and the nightly job must finish by morning. What is the best handling?

- **A.** Identify the failures by `custom_id`; resubmit the 70 transient failures as they are, and split the 240 long contracts into chunks before resubmitting them in a new batch.
- **B.** Resubmit the entire batch of 12,000 requests with a larger context model, so that both kinds of failure are handled together and the results are consistent with each other.
- **C.** Resubmit all 310 failed requests unchanged in a new batch, since batch failures are usually transient and most of them will succeed on a second attempt.
- **D.** Match the failures to the documents by their position in the results file, then process the 310 failed documents one by one with the synchronous API to finish faster.

#### Correct answer to Question 40: A

Failures are handled by **resubmitting only the failed documents, identified by `custom_id`**, and with the right fix per cause: transient failures as they are, oversized documents after chunking.

B reprocesses 11,690 successful documents. C resubmits 240 requests that will fail again for the same reason. D relies on result ordering, which batch results do not guarantee; `custom_id` exists precisely for correlation.

## Scenario: Claude Code for Continuous Integration

### Question 41

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Claude Code runs in CI to review pull requests and generate tests. The output is technically correct, but does not follow the team's practices: it ignores the existing fixtures in `tests/fixtures/`, uses a mocking library the team abandoned, and does not apply the review criteria agreed on last quarter. Developers' local Claude Code sessions do apply these practices because each of them has the instructions in a personal file. What is the best fix?

- **A.** Copy the developers' personal instruction file into the CI runner's home directory at the start of each job, so that the CI run uses exactly the same configuration as the local sessions.
- **B.** Document the testing standards, available fixtures and review criteria in the project `CLAUDE.md` committed to the repository, so that CI runs and every developer get the same context.
- **C.** Pass all the standards in the `-p` prompt of each CI job, so that the instructions arrive with every request and there is no dependence on configuration files in the repository.
- **D.** Configure an MCP server in `.mcp.json` that exposes the team's practices as a tool, so that Claude in CI can query the standards whenever it needs them during a review.

#### Correct answer to Question 41: B

`CLAUDE.md` provides the **project context** (testing standards, fixtures, review criteria) to Claude Code runs started by CI. The underlying problem is the hierarchy: the practices live at user level, where neither CI nor new colleagues see them.

A propagates a personal file that is not versioned or reviewed and may differ between developers. C duplicates standards in pipeline scripts and drifts from what developers use locally. D adds an integration where a project file is the intended mechanism, and depends on the model choosing to call it.

## Scenario: Developer Productivity with Claude

### Question 42

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A developer wants to connect two MCP servers to Claude Code for the whole team: the official community GitHub server and an internal server for the team's deployment system. Each developer has a personal token for both. One developer is also trying an experimental server for a personal note-taking app. Tokens must never be committed. What is the correct configuration?

- **A.** Put all three servers in the project `.mcp.json` with each developer's tokens written directly in their local copy, and add `.mcp.json` to `.gitignore` so the tokens are never committed.
- **B.** Put all three servers in each developer's `~/.claude.json`, so tokens stay on each machine and the experimental server is configured in the same place as the team servers.
- **C.** Put the GitHub and deployment servers in the project `.mcp.json` using environment variable references such as `${GITHUB_TOKEN}`, and the experimental server in that developer's `~/.claude.json`.
- **D.** Write a custom MCP server that wraps both GitHub and the deployment system with a shared service token, configured in `.mcp.json`, and keep the experimental server out of Claude Code.

#### Correct answer to Question 42: C

Team servers belong in the project **`.mcp.json`** (shared through VCS) with **environment variable substitution** for secrets; personal or experimental servers belong in the user-level **`~/.claude.json`**.

A defeats the purpose of a shared project configuration: once ignored, the team configuration is no longer shared. B works per machine but leaves the team setup unversioned and inconsistent. D replaces a community server for a standard integration with a custom one, the opposite of the recommended preference, and replaces personal tokens with a shared one.

## Scenario: Customer Support Resolution Agent

### Question 43

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

Traces show that when customers ask "where is my order?", the agent calls `get_customer` instead of `lookup_order` about 30% of the time, then answers with account information. The descriptions are: `get_customer`: "Gets customer information"; `lookup_order`: "Gets order information for the customer". The system prompt says "Always start by understanding the customer". Which change is most likely to fix the misrouting?

- **A.** Merge the two tools into a single `get_customer_or_order` tool, so the agent can no longer choose the wrong one and always receives both customer and order data in one call.
- **B.** Force `tool_choice` to `lookup_order` whenever the customer's message contains the word "order", so that the right tool is called for every order-related question.
- **C.** Add few-shot examples to the system prompt showing order questions resolved with `lookup_order`, leaving the tool descriptions and the system prompt wording as they are.
- **D.** Rewrite both descriptions to state inputs, typical queries, and when to use each instead of the other, and reword the system prompt line that biases the agent toward `get_customer`.

#### Correct answer to Question 43: D

Tool **descriptions are the primary mechanism** for tool selection: vague, overlapping descriptions cause misrouting. The system prompt wording can also create **unwanted associations** with a tool ("understanding the customer" pulls toward `get_customer`). Both causes must be fixed.

A creates a generic tool that hides two responsibilities. B is keyword routing, brittle for "my package" or "delivery" and wrong for "cancel my order". C can help, but leaves the root causes in place: the overlapping descriptions and the biased prompt line.

## Scenario: Multi-Agent Research System

### Question 44

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

You define four subagents with `AgentDefinition` (search, analysis, synthesis, report), each with a clear description, system prompt and tool restrictions. The coordinator's configuration is `allowedTools: ["Read", "WebSearch"]`. In testing, the coordinator never delegates: it runs web searches itself and writes the report on its own, and the logs contain no subagent invocations. What is the most likely cause?

- **A.** The coordinator's `allowedTools` does not include `Task`, the tool used to spawn subagents, so it cannot delegate and falls back to doing the work with its own tools.
- **B.** The subagents' descriptions are not specific enough, so the coordinator cannot tell which one to use and decides that doing the work itself is the safer option.
- **C.** The coordinator's system prompt does not tell it to delegate, so it follows its default behaviour of solving the task directly instead of spawning specialized subagents.
- **D.** The coordinator has `WebSearch` among its tools, so it prefers to use it directly; removing it would force the coordinator to delegate the searches to the subagent.

#### Correct answer to Question 44: A

Subagents are spawned through the **`Task` tool** (called `Agent` in current Claude Code documentation), and the coordinator's `allowedTools` must include it. With no invocations at all in the logs, the coordinator simply lacks the capability.

B and C would cause poor or rare delegation, not the complete absence of the spawning tool. D is a reasonable scoping improvement once delegation works, but removing `WebSearch` without adding `Task` would leave the coordinator unable to do anything useful.

## Scenario: Structured Data Extraction

### Question 45

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A compliance team requires that an archive of documents be fully re-extracted with a new schema within 30 hours of each regulatory update, and wants to minimize cost. You will use the Message Batches API, whose processing can take up to 24 hours. Updates can arrive at any time of day, and work for an update cannot start until the update is published. How often should the pipeline submit batches of pending work?

- **A.** Once a day at midnight, since the Batches API usually completes in a few hours and a single nightly submission is the simplest and most cost-effective schedule to maintain.
- **B.** At least every 4 to 6 hours, so that waiting time before submission plus up to 24 hours of processing still fits within the 30-hour requirement for any update.
- **C.** Immediately and synchronously for each update, since any batch schedule would risk breaking the 30-hour requirement and compliance work cannot depend on batch timing.
- **D.** Every 12 hours, since that halves the waiting time of a nightly schedule while keeping the number of batch submissions low enough to stay easy to monitor.

#### Correct answer to Question 45: B

Submission frequency is planned from the SLA: with a 30-hour requirement and up to **24 hours of processing**, the wait before submission must not exceed about 6 hours. The material's example uses 4-hour windows for exactly this case.

A can make an update wait almost 24 hours, plus 24 of processing: up to 48 hours. C gives up the 50% discount although the deadline is achievable with batches. D can reach 12 + 24 = 36 hours, still too long.

## Scenario: Claude Code for Continuous Integration

### Question 46

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

The same code pattern (an unvalidated external input passed to a database query) is classified as "critical" on one PR, "medium" on another and "low" on a third. The prompt already defines the four severity levels in a sentence each. Developers do not trust the severity labels and have started ignoring the ordering of findings. What is the most effective improvement?

- **A.** Add an instruction asking the model to be consistent with the severity it assigned in previous reviews, so that similar issues receive the same severity across different pull requests.
- **B.** Run the classification three times per finding and take the most frequent severity, so that the random variation between runs is smoothed out by the majority vote.
- **C.** Replace the four levels with two (blocking and non-blocking), so that the model has fewer boundaries to decide on and inconsistent classifications become less likely.
- **D.** Define explicit criteria for each severity level with code examples per level, including examples that show where borderline patterns like this one should be classified.

#### Correct answer to Question 46: D

Severity consistency comes from **explicit criteria with code examples for each level**: the model sees where patterns like this one belong. One-sentence definitions leave the boundaries open to interpretation.

A asks for consistency without memory of previous reviews or concrete criteria. B triples cost and still has no shared standard. C reduces granularity the team needs without defining where the boundary lies.

## Scenario: Developer Productivity with Claude

### Question 47

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

The agent must answer a multi-phase question about a large legacy monolith: first find all entry points of the reporting subsystem, then trace how report data is aggregated, then propose a refactoring. In the first phase alone, exploration fills over half the context with Grep and Read output, and by the third phase the proposals ignore findings from the first. What is the best approach?

- **A.** Use the Explore subagent for the discovery-heavy phases, so verbose exploration output stays in its own context and only a concise summary returns to the main conversation.
- **B.** Run all three phases with Read on every file of the reporting subsystem upfront, so that the model has a complete view before starting and does not need to search again.
- **C.** Run `/compact` after every single tool call, so that the context never grows large enough for the findings of the first phase to be pushed out by later exploration.
- **D.** Split the question into three separate sessions started from scratch, one per phase, so that each phase has an empty context and cannot be affected by the others.

#### Correct answer to Question 47: A

The **Explore subagent** isolates verbose discovery output, preventing context exhaustion in multi-phase tasks: the main conversation receives the conclusions and keeps the findings needed for the later phases.

B maximizes context consumption upfront. C is useful occasionally during long investigations, but compacting after every call loses detail continuously and adds overhead. D loses continuity: phase three needs phase one's findings, and separate sessions without a handoff would discard them.

## Scenario: Customer Support Resolution Agent

### Question 48

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A developer implemented the agent loop. Traces show the agent calling `lookup_order` with identical parameters five or six times in a row before eventually answering, even though each call returns the correct order. The code checks `stop_reason`, executes the requested tool, and sends a new request containing the original messages plus a short "Tool executed successfully" note. What is the problem?

- **A.** The loop should stop on any `stop_reason` other than `"end_turn"`, so that the repeated `"tool_use"` responses are interrupted before they produce duplicate calls.
- **B.** The tool's description does not tell the model that one call is enough, so the agent keeps calling it to confirm the result; the description should state that results are final.
- **C.** The tool results are not appended to the conversation history, so the model never sees the order data and requests the same call again; each result must be added as a tool result.
- **D.** The loop lacks an iteration cap, so the model can repeat calls indefinitely; a maximum of three iterations would stop the repetition and force a final answer earlier.

#### Correct answer to Question 48: C

In the agentic loop, **tool results must be appended to the conversation history** so that the model can decide the next step. A generic "executed successfully" note gives it no data, so it asks again.

A inverts the logic: `"tool_use"` means the model needs a tool, and stopping would break the loop. B treats a loop bug as a description problem. D is the anti-pattern of using iteration limits as the primary stop mechanism, and would only cut off a model that still has no data.

## Scenario: Code Generation with Claude Code

### Question 49

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Your monorepo has 25 packages. All of them must follow a shared testing standard, but only the 8 packages that expose public APIs must also follow the API conventions, and the 5 data packages must follow a data-handling standard. Each standard is a separate 150-line document in `standards/`. Each package already has its own `CLAUDE.md` for package-specific notes. How should you make each package load exactly the right standards?

- **A.** Paste the relevant standards' full text into each package's `CLAUDE.md`, so that each package is self-contained and does not depend on files outside its own directory.
- **B.** In each package's `CLAUDE.md`, import only the standards that apply with `@path` references (for example `@../../standards/testing.md`), keeping one copy of each standard.
- **C.** Put all three standards in the root `CLAUDE.md`, explaining in the text which packages each standard applies to, so that Claude can decide which conventions to follow.
- **D.** Turn each standard into a skill, so that Claude loads the testing, API or data-handling standard when it decides that the current task in a package needs it.

#### Correct answer to Question 49: B

The **`@path` syntax** lets each package's `CLAUDE.md` selectively include the right standards while keeping a single source for each. The selection follows a fixed per-package mapping, not file types, so per-package imports fit better than glob rules.

A duplicates 150-line documents across up to 25 files, which will drift. C loads all standards everywhere and leaves applicability to judgment. D makes always-applicable conventions depend on the model's decision to invoke a skill.

## Scenario: Multi-Agent Research System

### Question 50

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The document analysis subagent could not access five paywalled reports that are central to the topic; the search subagent found summaries of three of them in press articles. The coordinator must deliver a report today, and the client values transparency over completeness. Currently the final report presents the findings as complete. What should the final synthesis do?

- **A.** Leave out the subtopics covered by the paywalled reports, since presenting partial findings would lower the perceived quality of a report that otherwise has solid evidence.
- **B.** Delay the report until the paywalled reports can be purchased and analyzed, since the client needs complete research and partial findings would mislead the readers.
- **C.** Annotate coverage: state which findings rest on strong evidence, which rest only on secondary press summaries, and which central sources could not be accessed.
- **D.** Present the press summaries of the three reports as equivalent to the originals, attributing the claims to the paywalled reports since the summaries reflect their content.

#### Correct answer to Question 50: C

The final synthesis must **annotate coverage**: what is backed by strong evidence and where there are information gaps. This matches the client's preference for transparency and today's deadline.

A silently hides gaps. B ignores the deadline. D breaks provenance: a press summary is not the original source, and attributing claims to documents nobody read misrepresents the evidence.

## Scenario: Structured Data Extraction

### Question 51

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

You extract data from medical referral letters. The schema marks `referring_physician_npi` as required. About 25% of letters do not include this identifier, but the field is always filled: an audit finds that most of those values are well-formed numbers that do not exist. All schema validations pass. What is the correct change?

- **A.** Add a validation step that checks each identifier against the registry, and retry the extraction with the validation error until a registered identifier is produced.
- **B.** Add an instruction to the prompt saying that the model must never invent identifiers, so that it only writes a value when it finds one written in the letter.
- **C.** Keep the field required but add a regular expression to the schema for the identifier format, so that malformed or invented identifiers fail validation and are rejected.
- **D.** Make the field optional or nullable, so that the model can express that the letter does not contain the identifier instead of filling a required field with an invented value.

#### Correct answer to Question 51: D

When the source **may not contain** the information, the field must be **optional or nullable**: a required field pushes the model to fabricate values to satisfy the schema.

A retries for information that is not in the source, which the material says is ineffective, and pressures the model toward a "registered" fabrication. B is probabilistic while the schema keeps demanding a value. C rejects malformed values but the invented ones here are already well-formed.

## Scenario: Claude Code for Continuous Integration

### Question 52

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Developers dismiss about 35% of the CI review's findings, but nobody knows why. Some dismissed findings concern real issues developers chose to ignore, others are wrong. You want to identify which kinds of finding are systematically false positives in order to refine the prompt, with minimal disruption to the current workflow. What is the best first step?

- **A.** Add a `detected_pattern` field to each finding recording which pattern triggered it, and analyze dismissals grouped by pattern to find the systematically wrong ones.
- **B.** Ask the model to add a confidence score to each finding and suppress all findings below 0.7, since those are the most likely to be the false positives developers dismiss.
- **C.** Disable the review for two weeks and compare the defect rates, so that you can measure how much value the findings actually bring before investing in refining the prompt.
- **D.** Add an instruction to the prompt asking the model to avoid findings that developers are likely to dismiss, based on the kind of feedback it has seen in previous reviews.

#### Correct answer to Question 52: A

Feedback loop design tracks **the pattern that produced each finding** (`detected_pattern`): grouping dismissals by pattern reveals which ones are systematic false positives without changing what developers see.

B suppresses findings on uncalibrated confidence before understanding the problem. C is disruptive and does not identify which kinds of finding are wrong. D asks the model to predict dismissals without any memory or data about them.

## Scenario: Developer Productivity with Claude

### Question 53

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A teammate's agent loop runs until the assistant's text contains "TASK COMPLETE" or 10 iterations have passed. On long tasks it stops at iteration 10 with half-finished work; on short ones it sometimes keeps calling tools after writing "the task is complete, but let me double check". The team still wants a safeguard against runaway costs. What is the best loop design?

- **A.** Raise the cap to 50 iterations and keep the text check, so that long tasks have enough room to finish while the cap still protects against runaway costs.
- **B.** Continue while `stop_reason` is `"tool_use"` and stop on `"end_turn"`, keeping a generous iteration limit only as a safety net rather than as the primary stopping mechanism.
- **C.** Ask the model to output a JSON object with a `done` boolean at the end of each response, and stop the loop when the parsed value is true or the 10-iteration cap is reached.
- **D.** Stop the loop as soon as a response contains no text, since that indicates the model is only calling tools and therefore has not finished the task the user asked for.

#### Correct answer to Question 53: B

The loop is controlled by **`stop_reason`**: continue on `"tool_use"`, finish on `"end_turn"`. Parsing assistant text and arbitrary iteration caps as the **primary** mechanism are both anti-patterns; a generous limit as a cost safeguard is compatible with the requirement.

A keeps both anti-patterns, with a different number. C replaces one text-based signal with another self-reported one. D inverts the meaning: a response with only tool calls is exactly when the loop must continue.

## Scenario: Customer Support Resolution Agent

### Question 54

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer asks the agent to match a competitor's lower price on a TV bought last week. Your policy covers price adjustments only for drops in your own store's price within 14 days; it says nothing about competitor prices. The customer is calm and polite. The agent's own confidence that a partial refund would be "reasonable" is 0.85, above the 0.8 threshold the team uses for autonomous actions. What should the agent do?

- **A.** Grant a partial refund for the difference, since the agent's confidence is above the team's threshold and the customer's calm tone suggests a low-risk, straightforward case.
- **B.** Escalate to a human with a structured summary, because the policy does not address competitor price matching and this is a gap that the agent should not fill on its own judgment.
- **C.** Deny the request politely, since the policy only mentions the store's own price drops and anything it does not explicitly allow should be treated as not permitted.
- **D.** Offer a store credit for the difference as a compromise, since it costs the company less than a refund and satisfies the customer without formally granting a price match.

#### Correct answer to Question 54: B

A **policy gap or ambiguity** is an escalation trigger. The model's self-reported confidence and the customer's sentiment are **unreliable indicators** of whether a case can be resolved autonomously.

A decides on self-assessed confidence and tone, both explicitly unreliable. C interprets the silence of the policy as a prohibition, which is itself a policy decision the agent should not make. D invents a compromise the policy does not provide for.

## Scenario: Code Generation with Claude Code

### Question 55

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Your team has a detailed 200-line procedure for safely writing database migrations (locking strategy, backfill in batches, rollback script, review checklist). It is needed only in the few tasks per month that involve a migration, and developers want to start it explicitly, passing the table name. Today the procedure is in the root `CLAUDE.md`. What is the best place for it?

- **A.** A `.claude/rules/migrations.md` file with `paths: ["**/*"]`, so that the procedure is loaded for every file and is always available when a migration task comes up.
- **B.** The user-level `~/.claude/CLAUDE.md` of the developers who usually write migrations, so that only they load the procedure in their sessions and the others are not affected.
- **C.** A project skill in `.claude/skills/` with an `argument-hint` for the table name, so that it is shared with the team and loaded only when a developer invokes it.
- **D.** A `CLAUDE.md` in the `migrations/` directory, so that it is loaded only when Claude works on files in that directory and is not loaded during other tasks.

#### Correct answer to Question 55: C

A long **procedure used on demand** and **invoked explicitly** with a parameter is a skill: shared in `.claude/skills/`, with `argument-hint` asking for the table name, and out of the context the rest of the time.

A loads it everywhere, the same as now. B hides it from the team and loads it in every session of those developers. D is plausible for conventions tied to existing files, but writing a new migration often starts elsewhere (models, schema) and the developers want explicit invocation with a parameter.

## Scenario: Multi-Agent Research System

### Question 56

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The coordinator receives the outputs of six subagents and passes them to the synthesis subagent as one long block in the order they finished. Reviewers notice that the final reports reliably use the findings of the first and last subagents, but often omit the third and fourth, even when those contain the most important results. Each output is long and has no headings. What is the best change?

- **A.** Pass the six outputs to six separate synthesis subagents, one each, and concatenate their syntheses into the final report without any further integration step.
- **B.** Shuffle the order of the subagent outputs on each run, so that no subagent is systematically placed in the middle and omissions are spread evenly across subagents.
- **C.** Ask the synthesis subagent in its prompt to read every part of the input carefully and give equal weight to the findings from each of the six subagents.
- **D.** Put a summary of key findings at the start of the aggregated input and organize each subagent's output under explicit section headings before passing it to synthesis.

#### Correct answer to Question 56: D

This is the **lost-in-the-middle** effect: content at the start and end of long inputs is processed reliably, the middle less so. The structural fix is to place key information at the beginning and use explicit section headings.

A eliminates integration, producing six disconnected syntheses. B spreads the problem randomly instead of solving it. C is a vague instruction against a structural effect.

## Scenario: Structured Data Extraction

### Question 57

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Your single tool `extract_document` accepts any document and returns a generic object with optional fields for everything (invoice lines, contract clauses, receipt totals). Output for contracts often contains invoice fields filled with nonsense, and downstream consumers must guess which fields apply. The pipeline already knows the document type before extraction for 95% of documents. What is the best redesign?

- **A.** Keep the generic tool but make every field required, so that the model must explicitly fill each one and can no longer leave the wrong fields filled with arbitrary content.
- **B.** Split the tool into type-specific extraction tools with well-defined input and output contracts, and force the tool that matches the known type for the documents that have one.
- **C.** Keep the generic tool and add a long description listing which fields apply to which document type, so that the model knows which fields to leave empty for each type.
- **D.** Keep the generic tool and post-process its output with code that deletes the fields not relevant to the detected document type before sending the result downstream.

#### Correct answer to Question 57: B

Generic tools should be **split into specialized tools** with well-defined contracts. Since the type is known for 95% of documents, the matching tool can be forced (with `"any"` among the specialized tools for the remaining 5%).

A makes things worse, forcing values in irrelevant fields. C improves the description but keeps an ambiguous contract. D hides the symptom downstream while nonsense extraction continues and costs tokens.

## Scenario: Claude Code for Continuous Integration

### Question 58

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Claude Code generates unit tests for each pull request. Developers complain that many generated tests duplicate scenarios already covered in the existing test files and use a different structure from the rest of the suite. The project `CLAUDE.md` already documents the testing conventions and available fixtures, and generation runs in CI with `-p`. What is the most effective improvement?

- **A.** Add an instruction to the prompt telling Claude to avoid duplicates and to follow the suite's existing structure carefully when generating each new test.
- **B.** Run a deduplication script after generation that removes tests whose names match existing ones, so duplicated scenarios never reach the pull request.
- **C.** Include the existing test files for the changed modules in the generation context, so that Claude sees what is already covered and follows the established structure.
- **D.** Generate tests with the Batches API overnight instead of on each PR, so there is more time to compare generated tests with the existing suite before proposing them.

#### Correct answer to Question 58: C

To avoid duplicates and stay consistent, **include the existing test files in the context** when generating new ones. The `CLAUDE.md` already describes the conventions; what is missing is visibility of what already exists.

A asks the model to avoid duplicates it cannot see. B matches names, not scenarios: different names can cover the same case. D changes timing and cost, not the missing information, and delays the feedback developers need on the PR.

## Scenario: Developer Productivity with Claude

### Question 59

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

Your developer agent has 18 tools: the 5 built-in ones plus 13 from MCP servers (Jira, Confluence, deployment, metrics, three different search tools, and others). Tool selection is becoming unreliable: it uses the Confluence search to find code, and the metrics tool to read logs. Most tasks are code exploration; occasionally, a task needs a ticket or a dashboard. What is the most effective change?

- **A.** Give the main agent only the tools relevant to code exploration plus a few shared utilities, and delegate ticket and dashboard tasks to specialized subagents with their own scoped tools.
- **B.** Keep all 18 tools and rewrite every description to be longer and more detailed, so that the model can always distinguish between them regardless of how many there are.
- **C.** Set `tool_choice: "any"` so the model is always forced to call a tool, reducing the chance that it reasons about which tool to use and picks the wrong one by mistake.
- **D.** Merge the three search tools and the Confluence tool into one generic `search` tool, so the model has fewer choices and does not have to decide between them each time.

#### Correct answer to Question 59: A

Too many tools (18 instead of 4 to 5) **reduce selection reliability**, and tools outside an agent's specialization tend to be misused. Scoping the tool set by role, with a few shared utilities, and delegating the rare needs to specialized subagents addresses both.

B improves descriptions but leaves the number of tools and the specialization problem. C forces a call but does nothing to choose the right one. D creates a generic tool, the opposite of the specialized contracts the material recommends.

## Scenario: Customer Support Resolution Agent

### Question 60

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

The agent escalates a billing dispute to a human operator. Operators report spending several minutes reading the full transcript of each escalated conversation, and sometimes asking customers again for the account number and the disputed amount, which the agent already had. The escalation tool currently receives only the conversation ID. Which change best addresses the operators' problem?

- **A.** Escalate earlier in each conversation, before the agent gathers much information, so that the transcript is shorter and the operator can read it in less time.
- **B.** Have the escalation tool attach the full transcript and every tool result, so that the operator has all the available information about the case in a single place.
- **C.** Instruct the agent to tell the customer to repeat the key details to the operator at the start of the call, so that the operator hears them directly from the customer.
- **D.** Pass a structured handoff to the escalation tool: customer ID, disputed amount, the issue, what was already checked, the reason for escalation and a recommended action.

#### Correct answer to Question 60: D

Escalation needs a **structured handoff protocol** (customer ID, reason, recommended action, key facts and steps already taken), so the operator can act without rereading the transcript or re-asking the customer.

A escalates too early, wasting the agent's ability to resolve cases and still not providing structure. B gives more data but no summary: the operator still has to read everything. C shifts the work back to the customer, the very experience the handoff should avoid.
