---
title: "Practice Test 9 – Claude Certified Architect"
duration_minutes: 120
difficulty: difficile
---

# Questions and Answers: Practice Test 9 – Claude Certified Architect

## Scenario: Customer Support Resolution Agent

### Question 1

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

Policy caps refunds at $500 without human approval. You added a PreToolUse hook that blocks any `process_refund` call above $500 and redirects to `escalate_to_human`. In production logs, the agent now resolves a $700 dispute by issuing two consecutive refunds of $350 on the same order. What is the most robust fix?

- **A.** Add a system prompt rule stating that splitting a refund into several smaller payments to stay under the cap is strictly forbidden.
- **B.** Make the hook track the cumulative amount per order, but reset the running total at the start of each new conversation.
- **C.** Make the hook track the cumulative amount refunded per order and block any call that would push the running total above $500.
- **D.** Have `process_refund` return a warning in its result when a second refund hits the same order, so the agent can reconsider.

#### Correct answer to Question 1: C

The policy limits the total refunded per order, so the deterministic check must enforce that invariant: tracking the cumulative amount per order closes the loophole however the payments are split.

Resetting per conversation lets a customer split refunds across conversations. A prompt rule is probabilistic. A warning after the refund does not prevent it.

## Scenario: Code Generation with Claude Code

### Question 2

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Your tech lead documented the team's API conventions in `~/.claude/CLAUDE.md` and Claude Code applies them perfectly for them. A new teammate who cloned the repository reports that Claude ignores the conventions entirely. What is the right fix?

- **A.** Copy the conventions into the new teammate's `~/.claude/CLAUDE.md` as well, so both people load the same rules.
- **B.** Move the conventions to a project-level CLAUDE.md committed to the repository, so every clone loads them.
- **C.** Add an `@import` line pointing to the tech lead's `~/.claude/CLAUDE.md` path in the repository's README.
- **D.** Add a SessionStart hook to the tech lead's settings that copies the file to each teammate's home directory.

#### Correct answer to Question 2: B

Team conventions in a personal file reach only one person: moving them to the committed project CLAUDE.md makes every clone load them.

Another user-level copy keeps the conventions out of the repository, so every new clone repeats the problem. An `@import` of someone's home path fails elsewhere. A hook copying files is fragile.

## Scenario: Multi-Agent Research System

### Question 3

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

Asked about "the impact of generative AI on the creative industries", the system produces an accurate, well-cited report covering only visual art and graphic design. The coordinator's logs show it delegated three subtopics: digital art, illustration, graphic design. Each subagent did its job well. What is the root cause?

- **A.** The coordinator's decomposition was too narrow, omitting music, writing, film and other relevant areas.
- **B.** The decomposition was acceptable, but the search subagent should have broadened its queries to the other creative fields on its own.
- **C.** The synthesis subagent filtered out findings that did not fit the dominant visual art narrative.
- **D.** The report subagent is limited in output length and cut the sections on the remaining sectors.

#### Correct answer to Question 3: A

Every subagent did its job well on what it received: coverage was lost when the coordinator decomposed the topic too narrowly.

Subagents search what they are given; broadening scope on their own pushes decomposition to the wrong level. Synthesis and the report step used everything they received.

## Scenario: Structured Data Extraction

### Question 4

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

You extract invoices with `tool_use` and a strict JSON schema. Schema errors are now zero, but finance finds invoices where the sum of `line_items` does not match `total`, and both were "extracted correctly" according to the schema. What is the best fix?

- **A.** Make the schema stricter by adding `minimum` and `maximum` constraints to every monetary field.
- **B.** Also extract a `calculated_total` and validate it against `stated_total`, flagging discrepancies for review.
- **C.** Also extract a `calculated_total` and, when the two differ, keep the larger value so the payment is never underestimated.
- **D.** Overwrite `total` with the computed sum of the line items, so the data is always consistent.

#### Correct answer to Question 4: B

Schema validation cannot see arithmetic between fields: extracting a calculated total next to the stated one and flagging mismatches catches both model errors and invoices wrong at the source.

Keeping the larger value hides which one is wrong. Numeric bounds do not check relationships. Overwriting the total hides invoices wrong at the source.

## Scenario: Claude Code for Continuous Integration

### Question 5

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Claude Code runs in CI on every PR, and a script must post its review findings as inline comments with file, line and severity. The script must never break on wording changes, the job uses `-p`, and the team does not want an extra model call or an interactive session in the pipeline. What is the most reliable way to get output the script can use?

- **A.** Run with `-p --output-format json --json-schema`, defining a schema for the findings.
- **B.** Run with `-p` and parse the Markdown output with regular expressions to pull out each finding.
- **C.** Run with `-p --output-format json` and parse the findings out of the `result` text with a regex.
- **D.** Run in interactive mode and capture the terminal output with a pseudo-terminal wrapper.

#### Correct answer to Question 5: A

With `-p`, `--output-format json --json-schema` returns findings as fields that the script reads directly, with no extra call and no interactive session.

JSON output without a schema still wraps free text that the regex must parse. Regexes on Markdown break on wording changes. Driving an interactive session is fragile.

## Scenario: Developer Productivity with Claude

### Question 6

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

Before a risk-model change, the agent must explain how `calculateRiskScore` is used in a monorepo of 4,000 files. The function is often called through wrappers with different names, some defined in other packages, and the explanation must list every call path with file references. The agent's context should stay focused for the follow-up design work. What is the most efficient strategy?

- **A.** Read every file under `src/` up front, so the agent has the complete picture before answering.
- **B.** Grep for the definition and direct callers, then Read the relevant files and follow the wrappers incrementally.
- **C.** Grep for the definition and direct callers, then Read every file in each package that contains a caller.
- **D.** Ask the user to list the files that use the function before starting the investigation.

#### Correct answer to Question 6: B

Wrappers with other names hide callers: Grep for the definition and direct callers, then follow the wrappers incrementally, reading only relevant files and delegating broad searches to keep the context focused.

Reading whole packages floods the context; follow the wrappers incrementally. Reading all of `src/` does the same. Asking the user pushes work back.

## Scenario: Customer Support Resolution Agent

### Question 7

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer writes in an angry tone about a delayed shipment but does not ask for a human. The issue is a standard delay that the agent can resolve with a tracking update and a shipping-fee credit, both within policy. A teammate proposes escalating automatically whenever a sentiment classifier scores the message as "very negative". What is the best approach?

- **A.** Acknowledge the frustration and offer the in-policy resolution, escalating only if the customer then asks for a human.
- **B.** Adopt the classifier, because strong negative sentiment reliably signals cases too complex for automated handling.
- **C.** Escalate right away, since resolving an angry customer's issue automatically risks escalating the conflict further.
- **D.** Acknowledge the frustration and offer the in-policy resolution, then escalate anyway because of the strong negative tone.

#### Correct answer to Question 7: A

Strong sentiment is not a reason to escalate a standard, in-policy case: acknowledge the frustration, resolve it, and escalate only if the customer asks.

Escalating a resolved case because of tone sends it to humans for nothing. A sentiment classifier or immediate escalation does the same.

## Scenario: Code Generation with Claude Code

### Question 8

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Test files live next to source files across 30 directories (`**/*.test.ts`). You want 150 lines of testing conventions applied whenever Claude edits any test file, for every developer and in CI, without loading them during the 75% of sessions that do not touch tests. What is the best way to configure this?

- **A.** Put the conventions in the root CLAUDE.md, since it is always loaded and therefore always applied.
- **B.** Create a `.claude/rules/testing.md` file with `paths: ["tests/**"]` frontmatter, so it loads only for test work.
- **C.** Create a `/test-conventions` slash command that developers run before editing any test file.
- **D.** Create a `.claude/rules/testing.md` file with `paths: ["**/*.test.ts"]` frontmatter, so it loads only for matching files.

#### Correct answer to Question 8: D

A rules file with `paths: ["**/*.test.ts"]` loads the conventions only when test files are touched, for everyone and in CI.

Tests live next to source files, so `tests/**` matches none of them. The root CLAUDE.md loads the conventions everywhere. A slash command depends on memory.

## Scenario: Multi-Agent Research System

### Question 9

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

Final reports contain correct claims, but 40% have no citation, although the search subagents return findings with URLs and excerpts. The coordinator passes the synthesis subagent its own prose summary of those findings, to save context, and synthesis has no web access. Reviewers must be able to check every claim. What is the best fix?

- **A.** Instruct the synthesis subagent to always add citations, searching the web for sources when it needs them.
- **B.** Have the report subagent check every sentence and remove any claim that does not come with a citation.
- **C.** Pass structured findings that keep the claim-to-source mapping (URL, excerpt, date) through to synthesis.
- **D.** Pass the synthesis subagent the list of collected URLs and excerpts, alongside the coordinator's prose summary.

#### Correct answer to Question 9: C

The search subagents already return URLs and excerpts: passing them to synthesis as claim-to-source mappings keeps every claim checkable, without web access.

URLs and excerpts beside prose still leave synthesis to guess which claim belongs to which source. Searching after writing attaches unsupported citations. Removing uncited claims loses content.

## Scenario: Structured Data Extraction

### Question 10

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

The schema marks `purchase_order_number` as required. About 30% of documents have no such number, but the field is always filled in, often with plausible values copied from other codes in the document. What is the right fix?

- **A.** Add an instruction to the prompt that says "never invent the purchase order number".
- **B.** Add a regex pattern that rejects any value not formatted like a real purchase order number.
- **C.** Make the field nullable, but keep the instruction to fill it whenever a code resembling a PO number appears.
- **D.** Make the field optional/nullable, so the model can return null when the value is absent.

#### Correct answer to Question 10: D

A required field forces a value for the 30% of documents without one: making it nullable lets the model return null instead of copying another code.

Filling it from any similar code keeps the fabrication. A prompt rule alone conflicts with a required field. A regex rejects malformed, not plausible, values.

## Scenario: Claude Code for Continuous Integration

### Question 11

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Every time a developer pushes to a pull request, the review re-runs and posts the same comments again, including ones the team discussed and marked "won't fix". Developers have started muting the bot. New commits can still introduce real problems, which must be reported, and open findings must stay visible. What is the best fix?

- **A.** Run the review only once per pull request, on the first push, ignoring any later commits.
- **B.** Delete all the bot's previous comments before each new run, so that only fresh ones remain.
- **C.** Include the previous findings in the context and ask Claude to report only new or still-unresolved issues.
- **D.** Include previous findings and report only new issues, dropping every earlier finding even if it is still unresolved.

#### Correct answer to Question 11: C

Real new problems must be reported and open findings stay visible: passing previous findings with their status and reporting only new or unresolved ones respects "won't fix".

Dropping unresolved findings hides open problems. Reviewing only the first push misses later ones. Deleting old comments erases the discussion.

## Scenario: Developer Productivity with Claude

### Question 12

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

The agent must change `max_connections: 50` to `100` only in the `reporting` block of a configuration file, but Edit fails because the same line appears in three similar blocks. The file has comments that must be preserved, and the other two blocks must not change. What is the best way to proceed?

- **A.** Retry Edit with `replace_all: true`, since the three blocks are similar and the change probably applies to all.
- **B.** Include surrounding context from the first block to make the match unique, since the first block is usually the one intended.
- **C.** Use Grep with line numbers to find the right occurrence, then pass that line number to Edit.
- **D.** Include more surrounding context to make the match unique, or Read and rewrite the file with Write.

#### Correct answer to Question 12: D

Only the `reporting` block must change and comments must stay: a unique `old_string` with surrounding context, or a careful Read-then-Write, edits exactly that line.

Unique context from the wrong block edits the wrong line; it must come from `reporting`. `replace_all` changes all three blocks. Edit matches text, not line numbers.

## Scenario: Customer Support Resolution Agent

### Question 13

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

Human agents who receive escalations say they spend minutes re-asking customers for information the AI agent had already collected. Escalation currently passes the customer ID and a free-text reason such as "refund dispute, needs review". Humans can open the ticket but cannot see the AI conversation. What should the agent pass to `escalate_to_human`?

- **A.** A structured summary with the customer ID and the issue, leaving out the actions attempted to keep it short.
- **B.** A short reason code from a fixed list, so escalations can be routed to the right queue more quickly and reliably.
- **C.** The agent's confidence that escalation was needed, so the human can prioritize the uncertain cases.
- **D.** A structured summary: verified customer and order IDs, root cause, actions attempted, amounts, and the recommended next step.

#### Correct answer to Question 13: D

Operators re-ask what the agent already collected: a structured summary with verified IDs, root cause, actions, amounts and next step removes the re-asking.

Without the actions attempted and the amounts, operators still re-ask. A reason code carries no facts. A confidence score says nothing verified.

## Scenario: Code Generation with Claude Code

### Question 14

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

An `/analyze-deps` skill scans the whole repository and prints several thousand lines of dependency analysis before a short summary. After running it, Claude's later answers in the same session get worse and forget earlier instructions. The skill is shared by the team, and only the summary is needed afterward. What is the most appropriate change?

- **A.** Set `context: fork`, and also print the full dependency report at the end so developers can read it.
- **B.** Tell developers to run `/compact` right after the skill finishes, to shrink the context it created.
- **C.** Set `context: fork` in the skill's frontmatter, so it runs in an isolated subagent context and returns only its result.
- **D.** Turn the skill into a slash command, since commands do not add their output to the conversation context.

#### Correct answer to Question 14: C

Only the short summary is needed afterward: `context: fork` runs the skill in an isolated context and returns just its result to the shared session.

Printing the full report brings the bloat back into the session. Compacting afterward is manual and lossy. Commands also add their output to the conversation.

## Scenario: Multi-Agent Research System

### Question 15

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The coordinator must run four independent searches for a report. Traces show it creates one subagent, waits for the result, then creates the next, so total time is about four times the slowest search. Product wants the same depth per search and does not care about token cost, only latency. What is the best fix?

- **A.** Lower the token limit of each search subagent, so that each one finishes its work faster.
- **B.** Have the coordinator emit all four Task tool calls in a single response, so they run in parallel.
- **C.** Merge the four searches into one subagent that runs all of the queries in sequence.
- **D.** Have the coordinator emit all four Task calls in one response, with a lower token limit for each so they finish sooner.

#### Correct answer to Question 15: B

Depth must stay and cost does not matter: emitting the four Task calls in one response runs the independent searches in parallel.

Lower token limits reduce depth, which must stay. One subagent running all queries keeps them sequential.

## Scenario: Structured Data Extraction

### Question 16

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Your system accepts invoices, receipts and contracts, with one extraction tool per type. The document type is not known in advance, and a downstream service always requires structured output. With `tool_choice: auto`, the model sometimes replies in plain text. Which configuration is most appropriate?

- **A.** Force the invoice tool with `tool_choice` set to a specific tool, since invoices make up most of the volume.
- **B.** Keep `tool_choice: auto` and add a prompt instruction that always requires using one of the tools.
- **C.** Use `tool_choice: any`, so the model must call one tool but picks the one that fits the document.
- **D.** Use `tool_choice: any`, offering only the invoice tool when the document's type is unknown.

#### Correct answer to Question 16: C

The type is unknown but structured output is required: `tool_choice: any` forces a tool call while letting the model pick the right extraction tool.

Offering only the invoice tool makes `any` force it on receipts and contracts. Forcing the invoice tool does the same. `auto` with an instruction can still return text.

## Scenario: Claude Code for Continuous Integration

### Question 17

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Two months of data show that "style and naming" findings have an 80% false-positive rate, while "security" and "correctness" findings are mostly accurate. Developers are losing trust in all findings, and a security bug was ignored last week. A full prompt rework will take a month. What is the most effective step now?

- **A.** Lower the severity of style findings, while still posting them as informational comments.
- **B.** Temporarily disable the high false-positive categories while you improve their prompts with explicit criteria.
- **C.** Raise the confidence threshold for all categories, so fewer findings of every kind get posted.
- **D.** Temporarily disable every category except security, while you improve the prompts with explicit criteria.

#### Correct answer to Question 17: B

Real bugs are being ignored because of noise and the rework takes a month: disabling the noisy category now restores trust in the accurate ones while its criteria are fixed.

Correctness findings are accurate too, so disabling them loses real bugs. Lower severity still posts wrong comments. A global threshold cuts accurate findings.

## Scenario: Developer Productivity with Claude

### Question 18

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

Before a security patch, the agent must (1) list every migration file in any directory named `migrations`, at any depth, and (2) find every call to the deprecated function `legacyAuth(` across 6,000 files. Results must be complete, and the agent should not read files it does not need. Which pair of tools is right?

- **A.** Glob with `**/migrations/**` for (1), Grep for `legacyAuth\(` for (2).
- **B.** Grep for "migration" for (1), Glob with `**/*legacyAuth*` for (2).
- **C.** Grep for both, since it can search both file paths and file contents.
- **D.** Glob with `**/migrations/*` for (1), Grep for `legacyAuth\(` for (2).

#### Correct answer to Question 18: A

Glob matches paths, so `**/migrations/**` finds migration files at any depth; Grep searches content, so `legacyAuth\(` finds every call across 6,000 files without reading them.

`**/migrations/*` matches only files directly inside each `migrations` directory, missing deeper ones. Grep searches content, not directory names, and Glob cannot find calls.

## Scenario: Customer Support Resolution Agent

### Question 19

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

In long conversations, the agent progressively summarizes older turns to save context. QA finds cases where, after 25+ turns, the agent quotes a disputed charge as $48.50 when the `lookup_order` result said $84.50, and confuses two order numbers. What is the most effective fix?

- **A.** Stop summarizing and keep the full history, relying on the model's large context window to retain every detail.
- **B.** Keep a persistent case-facts block (IDs, amounts, dates, statuses) extracted from tool results and include it in every request.
- **C.** Instruct the summarizer to be more precise with numbers and to copy order identifiers exactly as they appear.
- **D.** Keep a case-facts block extracted from tool results, but store it inside the history that gets summarized.

#### Correct answer to Question 19: B

Amounts confirmed earlier are lost in summarization: a case-facts block extracted from tool results and kept outside the summary preserves them exactly in every request.

Facts inside the summarized history get summarized away. Keeping the full history breaks the budget. A better summarizer still paraphrases.

## Scenario: Code Generation with Claude Code

### Question 20

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

You must replace the in-house logging library with a structured logging framework across about 60 files. There are two plausible approaches (a gradual adapter layer or a direct replacement) with different implications for the log pipeline. How should you use Claude Code?

- **A.** Start in plan mode to explore the usages and compare the two approaches, then switch to direct execution to implement the approved plan.
- **B.** Use direct execution from the start, letting Claude choose the approach as it encounters each file in turn.
- **C.** Start in plan mode to compare the two approaches, then implement both on separate branches to decide between them.
- **D.** Implement both approaches with direct execution on separate branches, then pick the one whose tests pass.

#### Correct answer to Question 20: A

Two approaches with different trade-offs across 60 files: plan mode explores and compares first, then direct execution implements the approved plan.

Implementing both approaches doubles the work that planning should have avoided. Direct execution from the start lets the approach drift file by file.

## Scenario: Multi-Agent Research System

### Question 21

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

When the web search subagent hits repeated timeouts, it returns the string "Search unavailable" to the coordinator, which either aborts the whole research or carries on as if the topic had no sources. Timeouts affect about 5% of searches, and many topics have alternative queries or sources that could work. What is the best design for this subagent's error reporting?

- **A.** Have the subagent retry with exponential backoff for up to ten minutes before returning "Search unavailable".
- **B.** Return a structured error with the failure type and the query, without partial results or alternatives.
- **C.** Have the coordinator treat "Search unavailable" as a gap and add a generic disclaimer to the report.
- **D.** Return structured error context: failure type, query attempted, partial results, and possible alternatives.

#### Correct answer to Question 21: D

Many timeouts have alternative queries or sources: structured error context with the failure type, the query, partial results and alternatives lets the coordinator retry or reroute instead of aborting.

Without partial results or alternatives, the coordinator still has little to act on. Retrying for ten minutes ends with an unstructured message. A generic disclaimer gives nothing to act on.

## Scenario: Structured Data Extraction

### Question 22

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

You add a retry loop that resends the document together with the validation error whenever an extraction fails; the budget allows one retry per document. You review a sample of failures to decide which ones should skip the retry and go straight to a human. Which case is the retry least likely to fix?

- **A.** The required field is missing because that information is not present anywhere in the source document.
- **B.** The date was returned as "03/04/2024" instead of the ISO 8601 format that the schema requires.
- **C.** The `line_items` array was returned as a JSON string instead of a proper array of objects.
- **D.** The value was placed in `shipping_address` when the document indicates it belongs in `billing_address`.

#### Correct answer to Question 22: A

Retries with error feedback fix format and placement errors, but cannot create information absent from the document: those cases should go to a human, or to a nullable field.

A date in the wrong format, an array returned as a string and a value in the wrong field can all be corrected when the model sees the specific error.

## Scenario: Claude Code for Continuous Integration

### Question 23

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

The review prompt says "Be conservative: only report issues you are really sure about." False positives have not gone down, two real bugs have stopped being reported, and the team cannot tell what the model considers "sure". The team has a list of past findings labeled useful or not. What is the most effective fix?

- **A.** Keep the instruction and filter out findings in categories with a high historical false-positive rate.
- **B.** Define explicit criteria for what to report, and keep "be conservative" so the model also filters by its own certainty.
- **C.** Ask Claude to state a confidence percentage and filter out findings below 90% in the script.
- **D.** Define explicit criteria for what to report and what to skip, with concrete examples for each category.

#### Correct answer to Question 23: D

"Be conservative" gives the model no shared definition, so it suppresses real bugs without reducing noise: explicit criteria with examples, drawn from the labeled findings, fix both.

Keeping "be conservative" reintroduces the undefined filter that suppresses real bugs. Filtering by category hides noise. Self-reported confidence is uncalibrated.

## Scenario: Developer Productivity with Claude

### Question 24

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

You connected an MCP server with a `semantic_code_search` tool that understands what the code does; its description is "Searches code". The agent keeps using built-in Grep even for conceptual questions such as "where do we validate discounts?", and misses relevant code. Grep is still the right tool for exact names. What is the best fix?

- **A.** Remove Grep from the agent's tools, so that it is forced to use the semantic search tool.
- **B.** Add a rule to the system prompt: "Always use semantic_code_search first, for every search".
- **C.** Expand the MCP tool's description: what it does, for which questions it beats Grep, and with examples.
- **D.** Expand the MCP tool's description with what it does, and tell the agent in the prompt to stop using Grep.

#### Correct answer to Question 24: C

The model chooses tools by their descriptions: explaining what `semantic_code_search` does, for which questions it beats Grep, with examples, lets the agent use each tool where it fits.

Telling the agent to stop using Grep loses the right tool for exact names, as does removing it. An always-first rule misuses semantic search.

## Scenario: Customer Support Resolution Agent

### Question 25

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer gives only a name and city, and asks to cancel a subscription renewal before it is charged tonight. `get_customer` returns three active accounts matching both, one of which has a recent order matching the product described. A cancellation on the wrong account cannot be undone. What should the agent do?

- **A.** Pick the account with the matching recent order, since it is by far the most likely match for the request.
- **B.** Proceed with the matching account but state in the reply which account was used, so the customer can object.
- **C.** Ask for an additional identifier such as email or order number before taking any account-specific action.
- **D.** Ask for an additional identifier, but if the customer is in a hurry, cancel on the account with the matching recent order.

#### Correct answer to Question 25: C

The cancellation cannot be undone and three accounts match: ask for a unique identifier and act only when exactly one account fits.

Falling back to the likely account on an irreversible cancellation is still a guess. Proceeding while stating the choice is the same guess.

## Scenario: Code Generation with Claude Code

### Question 26

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Your team has a detailed 200-line procedure for writing database migrations safely. It applies only to the few tasks a month that involve migrations, and developers want Claude to follow it automatically when such a task comes up, without typing a command. It must be shared and reviewed like code. Where should it go?

- **A.** In the project CLAUDE.md, so Claude always has the procedure available whatever the task.
- **B.** In a skill whose description clearly states when it applies, so Claude loads it only for migration tasks.
- **C.** In a `/migration` slash command committed to `.claude/commands/` for the whole team to share.
- **D.** In a project skill whose description says only "Database migration procedure", without stating when it applies.

#### Correct answer to Question 26: B

The procedure is needed occasionally, must trigger automatically and be reviewed: a project skill with a clear description loads only for migration tasks.

A description that does not say when it applies gives Claude no trigger. The project CLAUDE.md loads it everywhere. A slash command must be typed.

## Scenario: Multi-Agent Research System

### Question 27

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

You configure the coordinator with `allowedTools: ["Read", "WebSearch"]` and define four subagents with `AgentDefinition`, each with a clear description. The system prompt explicitly asks to delegate searches. At runtime the coordinator does the searches itself and never delegates. What is the most likely cause?

- **A.** The coordinator's `allowedTools` does not include "Task", so it cannot spawn any subagent.
- **B.** The subagent descriptions are too short for the coordinator to judge when to use each one.
- **C.** The coordinator's system prompt does not say explicitly that searches must be delegated.
- **D.** The coordinator's `allowedTools` lacks "Task", and the subagent descriptions are also too short to be chosen.

#### Correct answer to Question 27: A

The descriptions and prompt are fine, but `allowedTools` lacks Task: without it the coordinator cannot spawn subagents and does the work itself.

The descriptions are clear; the missing Task tool alone prevents delegation. Prompt wording is not the cause.

## Scenario: Structured Data Extraction

### Question 28

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

You have two workloads: (1) a nightly reprocessing of 50,000 archived documents; (2) extraction on documents uploaded by users, who wait for the result on screen. To cut costs, a colleague proposes moving both to the Message Batches API. What is the best decision?

- **A.** Move both to batches, emailing interactive users when their extraction is ready to view.
- **B.** Use batches for the nightly reprocessing and keep synchronous calls for interactive extraction.
- **C.** Use batches for the nightly reprocessing without `custom_id`, matching results to documents by their order.
- **D.** Keep both synchronous, but switch interactive extraction to a smaller model to reduce its cost.

#### Correct answer to Question 28: B

Users wait on screen for interactive extraction, while the nightly job can wait: batches for the nightly job, synchronous calls for interactive use.

Batch results are not in request order, so matching by order mismatches documents. Batching interactive extraction breaks the experience. A smaller synchronous model leaves the nightly job at full price.

## Scenario: Claude Code for Continuous Integration

### Question 29

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

For pull requests touching 15+ files, the single-pass review is inconsistent: detailed on some files, superficial on others, and it misses a bug caused by an interaction between two modules. What is the best structure?

- **A.** A local pass for each file, plus a separate integration pass focused on the interactions between files.
- **B.** A single pass with a larger model, so that all the files fit comfortably in the context window.
- **C.** A local pass for each file, plus an integration pass limited to the three files with the most changes.
- **D.** Review only the files with the most changed lines, since they are where bugs are most likely.

#### Correct answer to Question 29: A

Inconsistent depth and a missed cross-module bug: per-file passes for local issues plus a dedicated integration pass for interactions between files.

Limiting the integration pass to the largest files can miss interactions with small ones. A larger model in one pass spreads attention unevenly. Reviewing only large diffs misses small changes.

## Scenario: Developer Productivity with Claude

### Question 30

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

In every session the agent spends 10 to 15 tool calls finding out which internal API schemas and documents exist on the documentation MCP server, before doing real work. The catalog changes weekly, contains 900 documents, and the agent has a search tool that works well once it knows what to look for. What is the best improvement?

- **A.** Add a tool that returns the full content of all the documents in a single call.
- **B.** Expose the catalog of documents and schemas as MCP resources, so the agent knows what exists without exploring.
- **C.** Copy the whole internal documentation into CLAUDE.md, so it is always available in context.
- **D.** Expose the catalog as MCP resources containing the full text of all 900 documents, and remove `search_docs`.

#### Correct answer to Question 30: B

The catalog changes weekly and search works once the agent knows what exists: MCP resources expose the catalog up front without exploratory calls.

Full text of 900 documents floods the context and loses targeted search. A copy in CLAUDE.md goes stale. A higher tool-call limit allows more exploration.

## Scenario: Customer Support Resolution Agent

### Question 31

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

`lookup_order` returns about 40 fields per order, including warehouse codes, internal SKUs and audit timestamps. Customers with many orders make the context grow quickly, and the agent starts missing relevant details after 4 or 5 lookups. The tool's owners need the full record for other uses, and you control the agent's harness. What is the best fix?

- **A.** Add a PostToolUse hook that trims each result to the fields relevant to support before it enters the agent's context.
- **B.** Instruct the agent in the system prompt to ignore warehouse and audit fields when it reads the order results.
- **C.** Move to a model with a larger context window, so the full order results always fit without any trimming.
- **D.** Add a PostToolUse hook that trims each result to support fields, dropping the order IDs to save tokens.

#### Correct answer to Question 31: A

The tool's owners need the full record, but the agent does not: a PostToolUse hook in your harness trims results to support-relevant fields before they enter the context.

Dropping order IDs makes multiple orders impossible to tell apart. A prompt rule leaves fields in context. A larger window keeps the noise.

## Scenario: Code Generation with Claude Code

### Question 32

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Claude is implementing a date parser. You have described the rules in two pages of prose (ambiguous formats, two-digit years, time zones), but after three iterations it still gets several edge cases wrong. You know exactly the expected output for each tricky input, and the project has a test runner. What is the most effective next step?

- **A.** Rewrite the rules in prose more precisely, using bold text and capitals for the edge cases it misses.
- **B.** Provide concrete examples for the common formats only, leaving the edge cases to the prose rules.
- **C.** Clear the session and restart with the same prose description, to remove the previous failed attempts.
- **D.** Provide concrete input/output examples for the edge cases (ideally as tests) and iterate against them.

#### Correct answer to Question 32: D

You know the expected output for each tricky input: concrete input/output examples, ideally as tests, let Claude iterate against failures instead of reinterpreting prose.

The edge cases are exactly where the prose fails, so they need examples. More precise prose keeps the ambiguity. Restarting repeats the misreadings.

## Scenario: Multi-Agent Research System

### Question 33

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

Two credible sources give different figures for the same metric: a 2022 industry report says 34% and a 2024 academic study says 51%, using slightly different populations. The synthesis subagent reports only 51% without mentioning the other figure, and clients use the report for planning. What is the best approach?

- **A.** Report the more recent value in the text and cite the older one in a footnote as historical context.
- **B.** Present both values with their sources and dates, noting the discrepancy and possible explanations.
- **C.** Present both values with their sources but without dates or explanations, letting readers compare them.
- **D.** Run a third search for a tie-breaking source, and report whichever value that third source supports.

#### Correct answer to Question 33: B

The two figures come from different years and populations: presenting both with sources and dates, noting the discrepancy and possible explanations, lets clients plan with full information.

Without dates and populations, readers cannot understand the gap. A footnote still presents one figure as the answer. A tie-breaking search treats it as a vote.

## Scenario: Structured Data Extraction

### Question 34

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A batch of 10,000 requests comes back with 230 failures: 180 exceed the context limit because the contracts are very long, and 50 hit temporary errors. Results are not in submission order, and the data is needed by tomorrow morning. What is the best strategy?

- **A.** Use `custom_id` to resubmit the 50 transient failures, and drop the 180 long contracts as unsupported.
- **B.** Resubmit all 230 failures in a new batch with a higher `max_tokens`, so the long contracts fit.
- **C.** Resubmit all 230 failures unchanged in a new batch, since the errors are probably transient.
- **D.** Use `custom_id` to resubmit only the failures: the 50 as they are, the 180 after chunking the long documents.

#### Correct answer to Question 34: D

The 180 long contracts will fail again unchanged and the 50 transient errors will not: identify them by `custom_id`, resend the 50 as they are, and chunk the 180.

Dropping the long contracts loses documents that chunking would handle. A higher `max_tokens` does not raise the context limit. Resending all 230 unchanged fails again.

## Scenario: Claude Code for Continuous Integration

### Question 35

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Claude generates unit tests for every pull request. Developers complain that many duplicate scenarios already covered by the existing suite, while edge cases such as empty inputs are missing. The job currently sees only the changed source files, and must stay under 5 minutes. What is the best fix?

- **A.** Include every test file in the repository in the context, so Claude sees everything already covered.
- **B.** Remove duplicate tests with a script after generation, by comparing the test names.
- **C.** Include the existing test files in the context, so Claude can identify what is already covered.
- **D.** Ask Claude to list edge cases first, keeping the existing tests out of the context to save tokens.

#### Correct answer to Question 35: C

The job sees only the changed source files: including the existing tests lets Claude see what is covered, avoid duplicates and target missing edge cases.

The whole suite floods the context and breaks the 5-minute limit; the changed modules' tests suffice. Name-based deduplication misses equivalents. Edge-case lists without the tests still duplicate.

## Scenario: Developer Productivity with Claude

### Question 36

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

In multi-day investigations of a legacy system, the agent loses earlier findings whenever the context is compacted and repeats the same analyses, wasting about an hour a day. Other engineers sometimes continue the investigation on another day. What is the best pattern?

- **A.** Disable automatic compaction, so the context is never compacted during the investigation.
- **B.** Have the agent keep a scratchpad of structured findings in its own context, re-reading it before each phase.
- **C.** Resume the same session every day with `--resume`, so the full history of the investigation stays available.
- **D.** Have the agent keep a scratchpad file of structured findings that it updates and re-reads when needed.

#### Correct answer to Question 36: D

Findings are lost at compaction and others continue the work: a scratchpad file of structured findings, updated and re-read, persists across compactions, days and people.

A scratchpad kept in context is compacted with everything else; it must be a file. Disabling compaction overflows. Resuming the same session still compacts.

## Scenario: Customer Support Resolution Agent

### Question 37

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

When the order database times out, the `lookup_order` MCP tool catches the exception and returns an empty list, and the agent tells customers "You have no orders with us", which triggers complaints. Timeouts happen on 3% of calls at peak, and a genuine empty list is a valid answer for new customers. What is the best redesign?

- **A.** Have the tool retry the query internally up to ten times before returning, so timeouts become very rare.
- **B.** Return a structured error (`isError`, a transient category, `isRetryable: true`) that is distinct from a valid empty result.
- **C.** Return a structured error for timeouts, marked non-retryable so that the agent escalates at once.
- **D.** Return the empty list with a `warning: "timeout"` field, leaving `isError` set to false.

#### Correct answer to Question 37: B

A genuine empty list is valid for new customers, so the tool must not return it for timeouts: a structured, retryable error distinct from an empty result fixes the messages.

Timeouts are transient, so marking them non-retryable escalates cases a retry would solve. Ten internal retries still end looking empty. A fake order invents data.

## Scenario: Code Generation with Claude Code

### Question 38

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

After a two-hour exploration of a legacy codebase with many long Grep and Read outputs, Claude answers with generic phrases like "the typical pattern for this kind of service" instead of the specific classes it read. Three more exploration phases remain, and the findings so far must not be lost. What is the best strategy?

- **A.** Delegate verbose exploration to an Explore subagent that returns its full Grep and Read output to the main agent.
- **B.** Run `/compact` and ask Claude to continue exploring in the same way afterward.
- **C.** Delegate verbose exploration to an Explore subagent that returns concise findings, keeping the main context clean.
- **D.** Ask Claude to save long outputs to files instead of printing them, and keep exploring in the main session.

#### Correct answer to Question 38: C

Three phases remain and the findings must survive: write them to a scratchpad and delegate the verbose exploration to subagents that return concise results.

Returning full output brings the noise back. `/compact` helps once. Saving outputs to files still keeps exploration in the main session.

## Scenario: Multi-Agent Research System

### Question 39

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The synthesis subagent was given every tool, including web search. It increasingly starts its own searches when it judges a finding weak, slowing runs and producing uncoordinated results. However, about 80% of its checks are simple fact lookups (a date, a name). What is the best design?

- **A.** Leave web search available and add a prompt instruction asking the subagent to use it sparingly.
- **B.** Remove all search tools and let the coordinator handle every verification, however small.
- **C.** Restrict it to its role and route every verification, even single facts, back through the coordinator.
- **D.** Restrict it to its role and add a narrow `verify_fact` tool, routing broader research back through the coordinator.

#### Correct answer to Question 39: D

Synthesis needs quick fact checks, not full research: a narrow `verify_fact` tool handles lookups, while broader research goes back through the coordinator.

Routing every single fact through the coordinator keeps the slow round trips. A prompt asking for sparing use is probabilistic. Removing all search has the same cost.

## Scenario: Structured Data Extraction

### Question 40

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Overall extraction accuracy on a validation sample is 97%, and management proposes removing human review entirely. Broken down by document type, typed invoices are at 99% but handwritten forms, 8% of volume, are at 71%, and those forms feed tax filings. What should you do?

- **A.** Reduce review only for segments with high average accuracy, measured once on the current sample.
- **B.** Keep human review on everything until each document type exceeds 97% accuracy.
- **C.** Reduce review only for segments with verified high accuracy, keeping it for handwritten forms.
- **D.** Remove review for all typed documents and keep it only on handwritten forms, without measuring each typed type.

#### Correct answer to Question 40: C

Handwritten forms feed tax filings at 71% accuracy: reduce review only where accuracy is verified, and keep it for those forms.

A one-off sample may hide segments too small to measure; accuracy must be verified per segment. Waiting for 97% everywhere keeps needless review. Dropping review for all typed documents assumes their accuracy.

## Scenario: Claude Code for Continuous Integration

### Question 41

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

The team runs Claude Code in CI, but its reviews ignore the project's standards: which fixtures to use, testing conventions, and what counts as a bug. Developers running Claude Code locally get the standards because each keeps them in a personal file, and the versions have started to differ. What is the best fix?

- **A.** Pass the standards with `--append-system-prompt` in each CI job, keeping them in the workflow file.
- **B.** Document the standards in the project CLAUDE.md, which Claude Code in CI loads from the repository.
- **C.** Copy the standards into the runner's `~/.claude/CLAUDE.md` during job setup, from a page on the wiki.
- **D.** Document the standards in the project CLAUDE.md, while each developer keeps a personal file with their own version.

#### Correct answer to Question 41: B

Personal copies have diverged and CI has none: documenting standards, fixtures and bug criteria in the committed project CLAUDE.md gives CI and every developer the same context.

Keeping divergent personal versions reintroduces the drift. Appending standards in CI creates another copy. Copying user files onto runners repeats the drift.

## Scenario: Developer Productivity with Claude

### Question 42

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A developer implemented the agentic loop so that it ends when the response text contains the word "DONE" and otherwise continues. Sometimes it stops in the middle of tool calls, because the model wrote "DONE with the first step", and other times it never ends. The team wants a reliable stop condition and protection against runaway loops. What is the correct fix?

- **A.** Base the loop on `stop_reason`: continue while it is "tool_use", stop when it is "end_turn".
- **B.** Ask the model to write "DONE" in capitals and on its own line, to make it easier to detect.
- **C.** Set a fixed limit of 10 iterations, ending the loop when it is reached regardless of state.
- **D.** Base the loop on `stop_reason`, but also stop whenever the text contains "DONE", as an extra safety check.

#### Correct answer to Question 42: A

Text such as "DONE with the first step" stops the loop mid-task: the loop must follow `stop_reason`, continuing on `tool_use` and stopping on `end_turn`, with a cap only as a safety net.

Keeping the "DONE" check reintroduces the mid-task stops. A stricter format is still a content heuristic. A fixed limit cuts tasks short.

## Scenario: Customer Support Resolution Agent

### Question 43

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer's single message raises three issues: a refund for a damaged item, an address change for a pending order that ships in two hours, and a question about a double charge. The agent handles the refund well but ignores the other two in about 40% of such conversations. The three issues need different tools and do not depend on each other. What is the best approach?

- **A.** Add a rule to always restate every issue in the customer's message at the start of the reply.
- **B.** Decompose the message and investigate each issue in parallel, replying only about the issues resolved so far.
- **C.** Handle the issues sequentially across turns, resolving the refund before even looking at the other two.
- **D.** Decompose the message into distinct issues, investigate each (in parallel where possible), then reply on all of them together.

#### Correct answer to Question 43: D

Three independent issues, one of them urgent: decompose the message, investigate each with its tools in parallel, and reply on all three together.

Replying only on resolved issues leaves the others unanswered. Restating issues does not ensure each is handled. Sequential handling delays the urgent change.

## Scenario: Code Generation with Claude Code

### Question 44

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

The whole 25-person team needs a Jira MCP server in Claude Code, in every session. Each developer has a personal API token, Jira audits every action by user, configuration changes are reviewed like code, and tokens must never be committed. What is the best configuration?

- **A.** Commit a project `.mcp.json` that references the token through environment variable expansion (`${JIRA_TOKEN}`).
- **B.** Commit a project `.mcp.json` with `${JIRA_TOKEN}`, and set one shared team token in every environment.
- **C.** Have each developer configure the server in their user-level settings, following a wiki page.
- **D.** Document the server's URL in CLAUDE.md so Claude can call the Jira API directly when needed.

#### Correct answer to Question 44: A

Jira audits by user and tokens must not be committed: a committed `.mcp.json` with `${JIRA_TOKEN}` gives everyone the same reviewed configuration with their own token.

One shared token breaks per-user audit. User-level setup drifts. A URL in CLAUDE.md configures nothing.

## Scenario: Multi-Agent Research System

### Question 45

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The document analysis subagent could not access several paywalled sources that are central to the topic, and the final report presents its conclusions as exhaustive. The report is due today, the client values transparency over completeness, and press summaries exist for some of the missing studies. What is the best fix?

- **A.** Have the search subagent use the abstract of each paywalled source and cite it as the source of the claims.
- **B.** Have the coordinator abort the research whenever a central source turns out to be inaccessible.
- **C.** Have synthesis include coverage annotations that show which areas are well supported and where the gaps are.
- **D.** Add coverage annotations listing the inaccessible sources, while presenting the press summaries as primary evidence.

#### Correct answer to Question 45: C

The report is due today and transparency matters more than completeness: coverage annotations show what is well supported, what rests on press summaries and what was inaccessible.

Presenting press summaries as primary evidence still overstates the support, as does citing abstracts as full studies. Aborting misses the deadline.

## Scenario: Structured Data Extraction

### Question 46

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

You want to send to human review only the extractions that are probably wrong. The model returns a confidence score from 0 to 1 for each field, but an audit finds many errors with confidence above 0.9, concentrated in two fields. You have 3,000 labeled documents and a fixed reviewer capacity. What is the best approach?

- **A.** Calibrate the thresholds per field against a labeled validation set, checking how confidence relates to actual accuracy.
- **B.** Raise the review threshold to 0.99, so that only extractions with near-total confidence are accepted.
- **C.** Ignore the model's confidence and send a fixed random sample of 10% of all documents to review.
- **D.** Calibrate one global threshold on the labeled set and apply it to all fields.

#### Correct answer to Question 46: A

High-confidence errors cluster in two fields and capacity is fixed: calibrating thresholds per field on the 3,000 labeled documents routes review where errors actually are.

Errors cluster in two fields, so one global threshold misroutes review. A 0.99 threshold floods reviewers. Random sampling ignores where errors are.

## Scenario: Claude Code for Continuous Integration

### Question 47

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

The same pattern, a missing null check on an external input, is labeled "critical" one day and "minor" the next. Severity decides which findings block merging, and the prompt defines the levels in one sentence each. The team has dozens of past findings with agreed severities. What is the most effective fix?

- **A.** Run the review three times and take the most frequent severity among the results.
- **B.** Add few-shot examples for each severity level, without the reasoning behind each classification.
- **C.** Set the temperature to 0, so that the output is always identical for the same input.
- **D.** Add few-shot examples for each severity level, with the reasoning behind each classification.

#### Correct answer to Question 47: D

Severity decides what blocks merging and one-sentence definitions are not enough: few-shot examples per level, with the reasoning, anchor consistent labels.

Examples without reasoning leave borderline cases unexplained. Majority voting smooths noise. Temperature 0 makes one label repeatable, not consistent across similar code.

## Scenario: Developer Productivity with Claude

### Question 48

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

In a custom agentic loop, the agent calls `lookup_order` again and again with identical parameters. Debugging shows the code runs the tool correctly, but sends the next request with only the original messages plus a note saying "tool executed". Each repeat costs about 2 seconds and the customer is waiting. What is the correct fix?

- **A.** Append the order data as a plain user message after the note, so the model sees the result.
- **B.** Store the tool results in a cache and return them immediately when an identical call repeats.
- **C.** Append a `tool_result` with the matching `tool_use_id` to the messages before calling the model again.
- **D.** Make the tool idempotent, so that repeated calls with the same parameters become harmless.

#### Correct answer to Question 48: C

The model never sees the order data, only a note: appending a `tool_result` with the matching `tool_use_id` gives it the result and stops the repeats.

A plain user message is not linked to the call; it must be a `tool_result` with the matching `tool_use_id`. A cache makes repeats cheaper. Idempotency makes them harmless, not fewer.

## Scenario: Customer Support Resolution Agent

### Question 49

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

`get_customer` is described as "Retrieves customer information" and `lookup_order` as "Retrieves order information for a customer". For questions like "where is my last order?", the agent calls `get_customer` in about 30% of cases and answers with account data. Both tools are needed and are owned by your team. What is the most effective fix?

- **A.** Rewrite both descriptions with clear boundaries: what each returns, its expected inputs, and when to prefer one over the other.
- **B.** Merge the two tools into a single `get_customer_and_orders` tool, so the agent never has to choose between them.
- **C.** Rewrite only `lookup_order`'s description, leaving `get_customer` as "Retrieves customer information".
- **D.** Add even more few-shot examples to the system prompt, covering every order-related phrasing you can find.

#### Correct answer to Question 49: A

Both tools are owned by your team and their descriptions overlap: stating what each returns, its inputs and when to prefer it fixes the misrouting at the source.

The vague `get_customer` description still attracts order questions. Merging tools hides the distinction. More examples leave the overlapping descriptions.

## Scenario: Code Generation with Claude Code

### Question 50

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Yesterday you spent four hours analyzing a module with Claude, and the session is saved. Overnight, teammates merged a large refactor touching about 70% of the files you analyzed and deleting one service. Today you need to continue, and some of yesterday's conclusions are still valid. What is the most reliable approach?

- **A.** Resume yesterday's session with `--resume`, since it already contains all the detailed analysis.
- **B.** Start a new session seeded with a structured summary of yesterday's conclusions, and re-analyze the changed files.
- **C.** Start a new session seeded with yesterday's full transcript, and re-analyze the changed files.
- **D.** Start a new session without any context, so Claude rebuilds its understanding entirely from scratch.

#### Correct answer to Question 50: B

Most files changed overnight but some conclusions still hold: a new session seeded with a structured summary of valid conclusions, re-analyzing the changed files, is reliable.

The full transcript brings the stale analysis back into context. Resuming carries it too. Starting from nothing discards valid conclusions.

## Scenario: Multi-Agent Research System

### Question 51

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

Reports on complex topics often have uneven coverage: some subtopics are thorough, others rest on one weak source. You want the system to fix this on its own before delivery, but some topics are already fully covered after one round, and runs must not exceed a set budget. What is the best pattern?

- **A.** Have the coordinator evaluate synthesis output for gaps, delegate targeted follow-up research, and re-synthesize, with an iteration cap.
- **B.** Always double the number of subagents for complex topics, so that coverage is wider from the very start.
- **C.** Have the coordinator evaluate synthesis for gaps and delegate follow-ups, without any iteration cap.
- **D.** Have synthesis mark thin sections as low-confidence and deliver the report with those markings.

#### Correct answer to Question 51: A

Some topics need more research, others do not, and runs have a budget: evaluate synthesis for gaps, delegate targeted follow-ups, and re-synthesize within an iteration cap.

Without a cap, runs can exceed the budget. Doubling subagents widens coverage blindly. Marking thin sections does not fix them.

## Scenario: Structured Data Extraction

### Question 52

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

The `document_category` field is an enum of 12 values. New document types arrive every month that fit none of them, and the model forces them into the closest category, polluting downstream reports. Analysts want to spot new types over time and add values when a pattern stabilizes. What is the best schema change?

- **A.** Remove the enum and accept free text, so that the model can describe any category it finds.
- **B.** Add an "other" value to the enum without a detail field, and review the "other" documents monthly.
- **C.** Keep adding values to the enum each time a new document type shows up in production.
- **D.** Add an "other" value plus a `category_detail` field that describes the unforeseen type.

#### Correct answer to Question 52: D

Analysts want to discover new types and add values once they stabilize: an `other` value with a detail field records them without forcing a wrong category.

Without a detail field, analysts cannot see what the new types are. Free text loses consistency. Adding values on each arrival bloats the enum.

## Scenario: Claude Code for Continuous Integration

### Question 53

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Developers dismiss about 40% of review findings, and you do not know why. You want to find which kinds of finding are systematically rejected in order to fix the prompts, without adding work for developers. The dismissal action is already recorded by the platform. What should you add to the findings?

- **A.** A structured field that identifies the pattern or rule detected, so dismissals can be analyzed by category.
- **B.** A structured field with the finding's severity, so dismissals can be analyzed by severity.
- **C.** A request to developers to leave a free-text comment whenever they dismiss a finding.
- **D.** A confidence score for each finding, so you can filter out the ones most likely to be dismissed.

#### Correct answer to Question 53: A

Dismissals are already recorded: adding the detected pattern to each finding lets you group dismissals and find the systematically wrong ones without extra work for developers.

Severity groups unrelated patterns, so it cannot show which rule misfires. Free-text comments add work. Confidence scores do not identify patterns.

## Scenario: Developer Productivity with Claude

### Question 54

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

The agent uses three MCP tools that return timestamps in different formats: Unix epoch, ISO 8601 and "MM/DD/YYYY". It sometimes concludes that a 30-day return window has expired when it has not. You cannot change the MCP servers this quarter, but you control the agent's harness. What is the most reliable fix?

- **A.** Add instructions to the system prompt explaining how to convert each date format.
- **B.** Add a PostToolUse hook that normalizes every timestamp to ISO 8601 before the agent sees it.
- **C.** Ask the agent to convert dates with a Bash script whenever it needs to compare them.
- **D.** Add a PostToolUse hook that converts Unix epoch timestamps to ISO 8601, leaving the other formats as they are.

#### Correct answer to Question 54: B

The servers cannot change but the harness can: a PostToolUse hook normalizes every timestamp to ISO 8601 before the model compares dates.

Leaving "MM/DD/YYYY" unconverted keeps mixed formats. Prompt explanations leave conversion to the model. Bash conversions rely on memory.

## Scenario: Customer Support Resolution Agent

### Question 55

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer asks for a price match with a competitor's lower price on a TV bought last week. The policy covers price adjustments only for drops on your own website within 14 days and says nothing about competitors. The customer is polite, and a specialist team handles policy exceptions within one business day. What should the agent do?

- **A.** Apply the own-site price adjustment rule by analogy, since the customer's intent is essentially the same.
- **B.** Escalate to a human, explaining that the policy does not cover competitor price matching, without promising an outcome.
- **C.** Escalate to a human with a summary, telling the customer that the price match will be approved.
- **D.** Offer a small goodwill credit in place of the match, so the customer leaves satisfied without changing policy.

#### Correct answer to Question 55: B

The policy does not cover competitor prices and a specialist handles exceptions: escalate, explaining the gap, without promising an outcome.

Promising the outcome pre-empts the specialist's decision. Applying the own-site rule invents policy. A goodwill credit invents a remedy.

## Scenario: Code Generation with Claude Code

### Question 56

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

After a two-hour analysis of a payment module, you want to try two refactoring strategies starting from the same understanding of the code, without one attempt influencing the other, and compare the results. Repeating the analysis would cost another two hours. What should you do?

- **A.** Run both strategies one after the other in the same session, reverting the files between the two attempts.
- **B.** Open two new sessions and repeat the full module analysis independently in each of them.
- **C.** Fork the session (e.g. `--fork-session`) to create two branches that share the analysis baseline.
- **D.** Fork the session once and try both strategies one after the other in the fork.

#### Correct answer to Question 56: C

Repeating the two-hour analysis is costly: forking the session gives two branches with the same baseline, isolated from each other, to compare.

Two strategies in one fork still influence each other. Two fresh sessions repeat the analysis. Running both in the original session contaminates it.

## Scenario: Multi-Agent Research System

### Question 57

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

To speed things up, a developer lets subagents call each other directly: search hands off to analysis, which calls synthesis. Latency dropped by 15%, but failures are now hard to trace, some reports are internally inconsistent, and a failed analysis step silently yields partial reports. What is the best fix?

- **A.** Add detailed logging to each subagent while keeping the direct calls between them.
- **B.** Return to hub-and-spoke for errors only, keeping direct calls between subagents for successful results.
- **C.** Replace the subagents with a single agent that has every tool, removing coordination problems.
- **D.** Return to hub-and-spoke: all communication goes through the coordinator, which manages flow and errors.

#### Correct answer to Question 57: D

Failures are untraceable and partial reports pass silently: hub-and-spoke routing through the coordinator restores error handling and flow control, and parallelism can recover latency.

Routing only errors through the coordinator still leaves results untraceable and inconsistent. Logging with direct calls handles no errors. A single agent loses specialization.

## Scenario: Structured Data Extraction

### Question 58

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

To catch errors, after each extraction you ask the same model, in the same conversation, to "review the extraction you just made and fix any errors". The pass finds very few problems, but a human audit finds errors in 9% of documents. You can afford one extra model call per document. What is the best change?

- **A.** Repeat the self-review two or three times in the same conversation, until the output converges.
- **B.** Add a detailed checklist to the self-review prompt, listing the error categories to check.
- **C.** Use an independent model instance that receives only the source document and the extraction, without the previous reasoning.
- **D.** Use an independent instance that receives the source document, the extraction and the first pass's reasoning.

#### Correct answer to Question 58: C

Self-review in the same conversation shares the original reasoning: an independent instance that sees only the source document and the extraction catches what the first pass missed.

Passing the first pass's reasoning reintroduces its anchoring. Repeating self-review keeps it too. A checklist adds structure, not independence.

## Scenario: Claude Code for Continuous Integration

### Question 59

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A developer created an effective `/security-review` command and you want to run it in CI too. In the pipeline the command is not found, while it works on the developer's laptop with the same Claude Code version. The CI runner checks out the repository and has no user home configuration. What is the most likely cause, and the fix?

- **A.** The command is in `~/.claude/commands/`: copy it into the runner's home directory during the CI job.
- **B.** The CI uses a different Claude Code version: align versions across laptops and runners.
- **C.** The command is in `~/.claude/commands/`: move it to `.claude/commands/` in the repository.
- **D.** Custom commands are disabled with `-p`: pass the review instructions directly in the prompt.

#### Correct answer to Question 59: C

The runner has no user home configuration, so a command in `~/.claude/commands/` does not exist there: moving it to the repository's `.claude/commands/` makes it available in CI.

A copy in the runner's home is unreviewed and drifts; the repository is the shared place. Commands work with `-p`, and the version is the same.

## Scenario: Developer Productivity with Claude

### Question 60

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

The team wants the agent to work with GitHub issues and pull requests, and with an internal tool that manages team-specific deploy approvals. A well-maintained community MCP server exists for GitHub, none exists for the internal tool, and a colleague proposes writing two custom MCP servers for full control. What is the best decision?

- **A.** Write a minimal custom GitHub server exposing only the needed operations, plus a custom one for the internal tool.
- **B.** Use the community GitHub server, and write the deploy-approval integration as a Bash script the agent calls.
- **C.** Use the community GitHub server for everything, modelling deploy approvals as GitHub issues with labels.
- **D.** Use an existing community MCP server for GitHub and write a custom one only for the internal tool.

#### Correct answer to Question 60: D

A maintained community server covers GitHub and nothing covers the internal tool: use the community server and build a custom one only for deploy approvals.

A Bash script loses the schemas and structured errors an MCP server provides. A minimal custom GitHub server duplicates maintained work. Modelling approvals as issues loses their rules.

