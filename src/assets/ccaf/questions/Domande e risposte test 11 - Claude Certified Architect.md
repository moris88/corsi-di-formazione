---
title: "Practice Test 11 – Advanced – Claude Certified Architect"
duration_minutes: 120
difficulty: avanzato
---

# Questions and Answers: Practice Test 11 – Advanced – Claude Certified Architect

## Scenario: Customer Support Resolution Agent

### Question 1

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

Policy caps refunds at $500 without human approval. You added a PreToolUse hook that blocks any `process_refund` call above $500 and redirects to `escalate_to_human`. In production logs, the agent now resolves a $700 dispute by issuing two consecutive refunds of $350 on the same order. What is the most robust fix?

- **A.** Add a system prompt rule stating that splitting a refund into several smaller payments to stay under the cap is strictly forbidden.
- **B.** Lower the per-call threshold in the hook to $250, so that two split refunds can never exceed the $500 limit on a single order.
- **C.** Make the hook track the cumulative amount refunded per order and block any call that would push the running total above $500.
- **D.** Have `process_refund` return a warning in its result when a second refund hits the same order, so the agent can reconsider.

#### Correct answer to Question 1: C

The policy is about the total refunded per order, so the deterministic check must enforce that invariant. Tracking the cumulative amount per order closes the loophole whatever way the agent splits the payments.

A prompt rule is probabilistic and is exactly what the hook was meant to replace. Lowering the threshold only moves the problem (three refunds of $240 still exceed the cap). A warning returned *after* the refund already executed does not prevent the violation.

## Scenario: Code Generation with Claude Code

### Question 2

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Your tech lead documented the team's API conventions in `~/.claude/CLAUDE.md` and Claude Code applies them perfectly for them. A new teammate who cloned the repository reports that Claude ignores the conventions entirely. What is the right fix?

- **A.** Ask the new teammate to run `/memory` and confirm the conventions file is loaded in their current session.
- **B.** Move the conventions to a project-level CLAUDE.md committed to the repository, so every clone loads them.
- **C.** Add an `@import` line pointing to the tech lead's `~/.claude/CLAUDE.md` path in the repository's README.
- **D.** Add a SessionStart hook to the tech lead's settings that copies the file to each teammate's home directory.

#### Correct answer to Question 2: B

`~/.claude/CLAUDE.md` is user-level memory: it lives only on the lead's machine and is not shared through version control. Shared conventions belong in the project CLAUDE.md, which is committed.

`/memory` only shows what is loaded and does not fix the source. Pointing to a path in someone else's home directory does not work on other machines. A hook in the lead's personal settings never runs for the teammates.

## Scenario: Multi-Agent Research System

### Question 3

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

Asked about "the impact of generative AI on the creative industries", the system produces an accurate, well-cited report covering only visual art and graphic design. The coordinator's logs show it delegated three subtopics: digital art, illustration, graphic design. Each subagent did its job well. What is the root cause?

- **A.** The coordinator's decomposition was too narrow, omitting music, writing, film and other relevant areas.
- **B.** The search subagent's queries were too specific and missed sources from the other creative fields.
- **C.** The synthesis subagent filtered out findings that did not fit the dominant visual art narrative.
- **D.** The report subagent is limited in output length and cut the sections on the remaining sectors.

#### Correct answer to Question 3: A

The logs show the subagents worked correctly on the assigned subtopics: the gap comes from task decomposition, which is the coordinator's responsibility.

The searches were consistent with the subtopics received. The synthesis did not discard anything: those findings never existed. Output length does not explain why entire sectors never appear in the delegations.

## Scenario: Structured Data Extraction

### Question 4

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

You extract invoices with `tool_use` and a strict JSON schema. Schema errors are now zero, but finance finds invoices where the sum of `line_items` does not match `total`, and both were "extracted correctly" according to the schema. What is the best fix?

- **A.** Make the schema stricter by adding `minimum` and `maximum` constraints to every monetary field.
- **B.** Also extract a `calculated_total` and validate it against `stated_total`, flagging discrepancies for review.
- **C.** Ask the model in the prompt to always check that the line items add up to the invoice total.
- **D.** Overwrite `total` with the computed sum of the line items, so the data is always consistent.

#### Correct answer to Question 4: B

Schemas guarantee syntax, not semantic consistency. Extracting both values and validating them in code makes discrepancies (OCR errors, or invoices that are genuinely wrong) visible and routable.

Range constraints do not catch inconsistencies between fields. Asking the model to check is not verifiable. Overwriting the total hides real errors in the source document.

## Scenario: Claude Code for Continuous Integration

### Question 5

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

You want Claude Code in CI to produce review findings that a script then posts as inline comments on the pull request, with file, line and severity. What is the most reliable way to get output the script can use?

- **A.** Run with `-p --output-format json --json-schema`, defining a schema for the findings.
- **B.** Run with `-p` and parse the Markdown output with regular expressions to pull out each finding.
- **C.** Ask Claude in the prompt to write the findings to a JSON file, then read that file.
- **D.** Run in interactive mode and capture the terminal output with a pseudo-terminal wrapper.

#### Correct answer to Question 5: A

`-p` runs non-interactively, and `--output-format json` with `--json-schema` produces structured output that matches a schema: parsing becomes reliable.

Parsing Markdown with regexes is fragile. A file written on the strength of a prompt instruction has no guaranteed format. Interactive mode is not meant for pipelines.

## Scenario: Developer Productivity with Claude

### Question 6

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

The agent must explain how the `calculateRiskScore` function is used in a monorepo of 4,000 files, where it is often called through wrappers with different names. What is the most efficient strategy?

- **A.** Read every file under `src/` up front, so the agent has the complete picture before answering.
- **B.** Grep for the definition and direct callers, then Read the relevant files and follow the wrappers incrementally.
- **C.** Use Glob to list every TypeScript file, then Read them in alphabetical order looking for usages.
- **D.** Ask the user to list the files that use the function before starting the investigation.

#### Correct answer to Question 6: B

Incremental exploration (Grep to find entry points, Read to follow imports and wrappers) builds understanding while spending context only on relevant files.

Reading everything up front exhausts the context. Glob finds files by name, not by content. Asking the user moves onto them work the agent can do.

## Scenario: Customer Support Resolution Agent

### Question 7

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer writes in an angry tone about a delayed shipment but does not ask for a human. The issue is a standard delay that the agent can resolve with a tracking update and a shipping-fee credit, both within policy. A teammate proposes escalating automatically whenever a sentiment classifier scores the message as "very negative". What is the best approach?

- **A.** Acknowledge the frustration and offer the in-policy resolution, escalating only if the customer then asks for a human.
- **B.** Adopt the classifier, because strong negative sentiment reliably signals cases too complex for automated handling.
- **C.** Escalate right away, since resolving an angry customer's issue automatically risks escalating the conflict further.
- **D.** Ask the customer to rate their frustration from 1 to 10 and escalate automatically when the score is above 7.

#### Correct answer to Question 7: A

Sentiment is a poor proxy for case complexity: an angry customer with a simple, in-policy issue is best served by a fast resolution. The right trigger for escalation is an explicit request for a human, a policy gap, or the inability to make progress.

The classifier and the immediate escalation both send solvable cases to humans and hurt first-contact resolution. Asking for a frustration score adds friction and still uses the wrong signal.

## Scenario: Code Generation with Claude Code

### Question 8

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Test files live next to source files across 30 directories (`**/*.test.ts`). You want specific testing conventions applied whenever Claude edits any test file, without loading them during unrelated work. What is the best mechanism?

- **A.** Put the conventions in the root CLAUDE.md, since it is always loaded and therefore always applied.
- **B.** Add a CLAUDE.md file to each of the 30 directories, containing only the testing conventions.
- **C.** Create a `/test-conventions` slash command that developers run before editing any test file.
- **D.** Create a `.claude/rules/testing.md` file with `paths: ["**/*.test.ts"]` frontmatter, so it loads only for matching files.

#### Correct answer to Question 8: D

Rules in `.claude/rules/` with `paths` frontmatter are loaded conditionally on files matching the glob: ideal for conventions tied to a file type spread across the codebase.

The root CLAUDE.md loads the conventions even when they are irrelevant. Thirty per-directory files duplicate content and drift apart. A manual slash command depends on developers remembering to run it.

## Scenario: Multi-Agent Research System

### Question 9

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The final reports contain correct claims, but many have no citations. You find the coordinator passes the synthesis subagent a prose summary of the search subagents' findings. What is the best fix?

- **A.** Instruct the synthesis subagent to always add citations, searching the web for sources when it needs them.
- **B.** Have the report subagent check every sentence and remove any claim that does not come with a citation.
- **C.** Pass structured findings that keep the claim-to-source mapping (URL, excerpt, date) through to synthesis.
- **D.** Increase the length limit of the coordinator's summary, so that more source details make it through.

#### Correct answer to Question 9: C

Provenance is lost when the coordinator compresses findings into prose. Passing structured data that links each claim to its source keeps attribution intact down to the report.

Letting synthesis search for sources after the fact risks attributing claims to the wrong sources. Removing uncited claims throws away correct information. A longer prose summary is still lossy and unstructured.

## Scenario: Structured Data Extraction

### Question 10

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

The schema marks `purchase_order_number` as required. About 30% of documents have no such number, but the field is always filled in, often with plausible values copied from other codes in the document. What is the right fix?

- **A.** Add an instruction to the prompt that says "never invent the purchase order number".
- **B.** Add a regex pattern that rejects any value not formatted like a real purchase order number.
- **C.** Run a second pass that checks each extracted purchase order number against the source text.
- **D.** Make the field optional/nullable, so the model can return null when the value is absent.

#### Correct answer to Question 10: D

A required field pushes the model to produce a value even when there is none: making it nullable removes the pressure that causes fabrication.

The prompt instruction conflicts with the schema. A regex does not stop well-formed made-up values. A verification pass treats the symptom and adds cost.

## Scenario: Claude Code for Continuous Integration

### Question 11

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Every time a developer pushes new commits to a pull request, the review re-runs and posts the same comments again on issues that were already flagged and not yet resolved. Developers have started ignoring the bot. What is the best fix?

- **A.** Run the review only once per pull request, on the first push, ignoring any later commits.
- **B.** Delete all the bot's previous comments before each new run, so that only fresh ones remain.
- **C.** Include the previous findings in the context and ask Claude to report only new or still-unresolved issues.
- **D.** Shorten the review to critical issues only, so that fewer repeated comments are posted.

#### Correct answer to Question 11: C

Giving the reviewer the history of earlier findings lets it avoid duplicates and report only what is new or still open.

Reviewing only once ignores later changes. Deleting and reposting causes noise and loses the discussion. Restricting the scope does not fix the duplication.

## Scenario: Developer Productivity with Claude

### Question 12

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

The agent tries to change a configuration line with Edit, but the operation fails because the text to replace appears three times in the file, in similar blocks. What is the best way to proceed?

- **A.** Retry Edit with the same text, since the tool will pick the first occurrence of the text.
- **B.** Use Bash with `sed` to replace every occurrence of the text across the whole file.
- **C.** Give up on the change and ask the user to make it by hand, since the file is ambiguous.
- **D.** Include more surrounding context to make the match unique, or Read and rewrite the file with Write.

#### Correct answer to Question 12: D

Edit needs a unique match: you extend the context until the anchor is unambiguous, or as a fallback you read the file and rewrite it in full in a controlled way.

Edit does not pick the first occurrence: it fails. `sed` on every occurrence changes blocks that should not be touched. Giving up is premature.

## Scenario: Customer Support Resolution Agent

### Question 13

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

Human agents who receive escalations say they spend minutes re-asking customers for information the AI agent had already collected. Escalation currently passes the customer ID and a free-text reason such as "refund dispute, needs review". Humans can open the ticket but cannot see the AI conversation. What should the agent pass to `escalate_to_human`?

- **A.** The full raw transcript, since humans then have every detail and can scan only the parts that matter for the case.
- **B.** A short reason code from a fixed list, so escalations can be routed to the right queue more quickly and reliably.
- **C.** A personalized apology for the customer, so the human can pick up the conversation without restating anything.
- **D.** A structured summary: verified customer and order IDs, root cause, actions attempted, amounts, and the recommended next step.

#### Correct answer to Question 13: D

The receiving human lacks the conversation, so the handoff must be self-contained: verified identifiers, what was investigated, what was attempted, the amounts involved and why the case is being escalated. That removes the re-asking.

A raw transcript moves the analysis work onto the human. A reason code helps routing but carries none of the facts. An apology text does not solve the missing-context problem.

## Scenario: Code Generation with Claude Code

### Question 14

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Your team created an `/analyze-deps` skill that scans the whole repository and prints long dependency reports. After running it, developers notice Claude's later answers in the same session get worse and less focused. What is the best fix?

- **A.** Add `allowed-tools` to the skill's frontmatter to limit it to Read and Grep, so it produces less output.
- **B.** Tell developers to run `/compact` right after the skill finishes, to shrink the context it created.
- **C.** Set `context: fork` in the skill's frontmatter, so it runs in an isolated subagent context and returns only its result.
- **D.** Turn the skill into a slash command, since commands do not add their output to the conversation context.

#### Correct answer to Question 14: C

`context: fork` runs the skill in a separate sub-agent context: the verbose exploration stays isolated and only the final result comes back to the main session.

`allowed-tools` restricts tools but not the volume of output. `/compact` is a manual, lossy remedy after the damage is done. Slash command output also enters the context.

## Scenario: Multi-Agent Research System

### Question 15

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The coordinator must run four independent searches. Traces show it creates one subagent, waits for its result, then creates the next, over four turns. Total time is about four times the slowest single search. What change reduces latency the most?

- **A.** Lower the token limit of each search subagent, so that each one finishes its work faster.
- **B.** Have the coordinator emit all four Task tool calls in a single response, so they run in parallel.
- **C.** Merge the four searches into one subagent that runs all of the queries in sequence.
- **D.** Cache the results of earlier searches, so that repeated queries return instantly.

#### Correct answer to Question 15: B

Independent subagents can be launched in parallel by emitting several Task calls in the same response: total time drops to roughly that of the slowest one.

Cutting tokens degrades quality without removing the serialization. A single sequential subagent keeps the same total time. Caching only helps for repeated queries.

## Scenario: Structured Data Extraction

### Question 16

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Your system accepts invoices, receipts and contracts, with one extraction tool per type. The document type is not known in advance, and a downstream service always requires structured output. With `tool_choice: auto`, the model sometimes replies in plain text. Which configuration is most appropriate?

- **A.** Force the invoice tool with `tool_choice` set to a specific tool, since invoices make up most of the volume.
- **B.** Keep `tool_choice: auto` and add a prompt instruction that always requires using one of the tools.
- **C.** Use `tool_choice: any`, so the model must call one tool but picks the one that fits the document.
- **D.** Merge the three tools into a single generic schema with every field optional, and force that tool.

#### Correct answer to Question 16: C

`any` guarantees a tool call (structured output) while leaving the model to choose the right schema for the document type.

Forcing one tool applies the wrong schema to the other types. `auto` plus an instruction does not guarantee a call. A generic all-optional schema loses type-specific validation.

## Scenario: Claude Code for Continuous Integration

### Question 17

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Analysis of the findings shows that "style and naming" findings have an 80% false-positive rate, while "security" and "correctness" are mostly accurate. Developers are losing trust in all the findings. What is the best short-term action?

- **A.** Lower the severity of style findings, while still posting them as informational comments.
- **B.** Temporarily disable the high false-positive categories while you improve their prompts with explicit criteria.
- **C.** Add a note to each comment telling developers that some findings may be false positives.
- **D.** Switch to a larger model, which should reduce false positives in every category.

#### Correct answer to Question 17: B

False positives in one category erode trust in the accurate ones as well. Temporarily disabling them protects the credibility of the security and correctness findings while you work on criteria.

Posting them at lower severity still produces noise. A generic note does not restore trust. A bigger model does not fix poorly defined criteria.

## Scenario: Developer Productivity with Claude

### Question 18

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

The agent must (1) find every migration file in any directory named `migrations`, at any depth, and (2) find where the deprecated function `legacyAuth(` is called. Which pair of tools is right?

- **A.** Glob with `**/migrations/**` for (1), Grep for `legacyAuth\(` for (2).
- **B.** Grep for "migration" for (1), Glob with `**/*legacyAuth*` for (2).
- **C.** Grep for both, since it can search both file paths and file contents.
- **D.** Glob for both, using patterns based on each file's name and extension.

#### Correct answer to Question 18: A

Glob finds files by path patterns, which suits (1). Grep searches inside file contents, which suits (2), finding the calls.

The second option swaps the tools. Grep searches content, not structure. Glob cannot find calls inside files.

## Scenario: Customer Support Resolution Agent

### Question 19

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

In long conversations, the agent progressively summarizes older turns to save context. QA finds cases where, after 25+ turns, the agent quotes a disputed charge as $48.50 when the `lookup_order` result said $84.50, and confuses two order numbers. What is the most effective fix?

- **A.** Stop summarizing and keep the full history, relying on the model's large context window to retain every detail.
- **B.** Keep a persistent case-facts block (IDs, amounts, dates, statuses) extracted from tool results and include it in every request.
- **C.** Instruct the summarizer to be more precise with numbers and to copy order identifiers exactly as they appear.
- **D.** Re-call `lookup_order` before every reply, so that amounts always come straight from the backend system.

#### Correct answer to Question 19: B

Progressive summarization compresses transactional facts into vague prose and introduces errors. Keeping the critical facts in a structured block outside the summarized history makes them durable and always visible.

Keeping everything does not scale and suffers from details getting lost in the middle of long inputs. A more careful summarizer is still lossy. Re-calling the tool on every reply wastes calls and does not cover facts the customer stated.

## Scenario: Code Generation with Claude Code

### Question 20

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

You must replace the in-house logging library with a structured logging framework across about 60 files. There are two plausible approaches (a gradual adapter layer or a direct replacement) with different implications for the log pipeline. How should you use Claude Code?

- **A.** Start in plan mode to explore the usages and compare the two approaches, then switch to direct execution to implement the approved plan.
- **B.** Use direct execution from the start, letting Claude choose the approach as it encounters each file in turn.
- **C.** Use plan mode for the whole task, including implementing the changes, so every edit stays reviewable.
- **D.** Implement both approaches with direct execution on separate branches, then pick the one whose tests pass.

#### Correct answer to Question 20: A

Large changes with architectural choices benefit from plan mode for exploration and decision-making. Once the plan is approved, direct execution is efficient for applying it.

Direct execution from the start risks inconsistent per-file choices. Plan mode is for exploring and planning, not for applying edits. Implementing both approaches doubles the work, and passing tests do not settle the architectural trade-offs.

## Scenario: Multi-Agent Research System

### Question 21

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

When the web search subagent hits repeated timeouts, it returns "Search unavailable" to the coordinator. The coordinator then either aborts the whole research or carries on as if the topic had no sources. What is the best fix?

- **A.** Have the subagent retry indefinitely until the search succeeds, so the coordinator never sees an error.
- **B.** Have the subagent return an empty successful result, so the coordinator can carry on without interruption.
- **C.** Abort the whole workflow on any subagent error, so that a report is never incomplete.
- **D.** Return structured error context: failure type, query attempted, partial results, and possible alternatives.

#### Correct answer to Question 21: D

The coordinator can make good recovery decisions (retry, change query, report a coverage gap) only if it knows what failed and what is still available.

Infinite retries block the system. An empty success hides the failure and leads to wrong conclusions. Aborting everything on any error wastes the partial work.

## Scenario: Structured Data Extraction

### Question 22

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

You add a loop that resends the document with the validation error when an extraction fails. On a sample of failures, which case is retry least likely to fix?

- **A.** The required field is missing because that information is not present anywhere in the source document.
- **B.** The date was returned as "03/04/2024" instead of the ISO 8601 format that the schema requires.
- **C.** The `line_items` array was returned as a JSON string instead of a proper array of objects.
- **D.** The value was placed in `shipping_address` when the document indicates it belongs in `billing_address`.

#### Correct answer to Question 22: A

Retrying with error feedback works when the information is in the source and the error is in format or placement. If the data is not there, no number of retries can produce it, and it invites fabrication.

Format, structure and field placement errors are exactly what feedback lets the model correct.

## Scenario: Claude Code for Continuous Integration

### Question 23

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

The review prompt says "Be conservative: only report issues you are really sure about." False positives have not gone down, and some real bugs have stopped being reported. What is the most effective fix?

- **A.** Remove the instruction and add "Report every possible issue" to maximize recall.
- **B.** Write the instruction in capitals and repeat it at the end of the prompt as well.
- **C.** Ask Claude to state a confidence percentage and filter out findings below 90% in the script.
- **D.** Define explicit criteria for what to report and what to skip, with concrete examples for each category.

#### Correct answer to Question 23: D

Vague instructions like "be conservative" get applied inconsistently. Explicit criteria with examples (what counts as a bug and what is a stylistic preference) improve precision without sacrificing recall.

Maximizing recall makes false positives worse. Emphasis does not add clarity. Self-reported confidence without calibration is not a reliable filter.

## Scenario: Developer Productivity with Claude

### Question 24

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

You connected an MCP server with a `semantic_code_search` tool that understands the meaning of the code. Its description is "Searches code". The agent keeps using the built-in Grep even for conceptual questions ("where do we handle retries?"), getting incomplete results. What is the best fix?

- **A.** Remove Grep from the agent's tools, so that it is forced to use the semantic search tool.
- **B.** Add a rule to the system prompt: "Always use semantic_code_search first, for every search".
- **C.** Expand the MCP tool's description: what it does, for which questions it beats Grep, and with examples.
- **D.** Rename the tool to `search`, so it looks more general-purpose than the built-in Grep.

#### Correct answer to Question 24: C

The agent chooses tools from their descriptions: a minimal description gives no reason to prefer the MCP tool. Explaining its strengths and when to use it fixes the choice.

Removing Grep throws away the best tool for exact searches. An "always" rule leads to misuse on literal searches. A generic name makes things more ambiguous.

## Scenario: Customer Support Resolution Agent

### Question 25

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer gives only a name and city. `get_customer` returns three active accounts matching both. One of them has a recent order that matches the product the customer describes. What should the agent do?

- **A.** Pick the account with the matching recent order, since it is by far the most likely match for the request.
- **B.** Proceed with the matching account but state in the reply which account was used, so the customer can object.
- **C.** Ask for an additional identifier such as email or order number before taking any account-specific action.
- **D.** Escalate to a human, because ambiguous identity resolution is outside the scope of an automated agent.

#### Correct answer to Question 25: C

With several matches, acting on a heuristic risks exposing or changing another customer's data. Asking for a unique identifier is cheap and resolves the ambiguity safely.

Picking the probable account, even with disclosure, still acts on an unverified identity. Escalation is excessive: disambiguation is a routine step the agent can handle itself.

## Scenario: Code Generation with Claude Code

### Question 26

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Your team has a detailed 200-line procedure for writing database migrations safely. It applies only to the occasional task that involves migrations, and developers want Claude to follow it automatically when such a task comes up, without typing anything. Where should the procedure go?

- **A.** In the project CLAUDE.md, so Claude always has the procedure available whatever the task.
- **B.** In a skill whose description clearly states when it applies, so Claude loads it only for migration tasks.
- **C.** In a `/migration` slash command committed to `.claude/commands/` for the whole team to share.
- **D.** In a PreToolUse hook that injects the procedure into the context before each file write.

#### Correct answer to Question 26: B

Skills are invoked by the model based on their description and loaded on demand: they suit procedures that are long and only occasionally relevant, and they trigger automatically.

CLAUDE.md would load 200 lines into every session. A slash command needs manual invocation. Hooks are for deterministic checks and transformations, not for injecting procedural knowledge on every write.

## Scenario: Multi-Agent Research System

### Question 27

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

You configure the coordinator with `allowedTools: ["Read", "WebSearch"]` and define four subagents with `AgentDefinition`. At runtime the coordinator does the searches itself and never delegates. What is the most likely cause?

- **A.** The coordinator's `allowedTools` does not include "Task", so it cannot spawn any subagent.
- **B.** The subagent descriptions are too short for the coordinator to judge when to use each one.
- **C.** The coordinator's system prompt does not say explicitly that searches must be delegated.
- **D.** Subagents must be registered as MCP servers before the coordinator can call them.

#### Correct answer to Question 27: A

Subagents are spawned through the Task tool: if it is not in the coordinator's `allowedTools`, delegation is impossible and the coordinator falls back on the tools it does have.

Vague descriptions or a missing instruction might lead to poor choices, but they would not prevent delegation entirely. Subagents are not MCP servers.

## Scenario: Structured Data Extraction

### Question 28

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

You have two workloads: (1) a nightly reprocessing of 50,000 archived documents; (2) extraction on documents uploaded by users, who wait for the result on screen. To cut costs, a colleague proposes moving both to the Message Batches API. What is the best decision?

- **A.** Move both, since the 50% savings justify asking users to come back later for their results.
- **B.** Use batches for the nightly reprocessing and keep synchronous calls for interactive extraction.
- **C.** Keep both synchronous, since the Batches API does not support `tool_use` for structured output.
- **D.** Use batches for interactive extraction and synchronous calls at night, to spread the load evenly.

#### Correct answer to Question 28: B

The Batches API halves the cost but has processing windows of up to 24 hours with no latency guarantee: perfect for the nightly job, unsuitable when a user is waiting.

Making users wait hours is unacceptable. Batches do support tools in single requests (what they lack is multi-turn tool use within a request). Reversing the assignment is the worst of both.

## Scenario: Claude Code for Continuous Integration

### Question 29

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

For pull requests touching 15+ files, the single-pass review is inconsistent: detailed on some files, superficial on others, and it misses a bug caused by an interaction between two modules. What is the best structure?

- **A.** A local pass for each file, plus a separate integration pass focused on the interactions between files.
- **B.** A single pass with a larger model, so that all the files fit comfortably in the context window.
- **C.** A single pass that tells Claude to give every file equal attention, with no exceptions.
- **D.** Review only the files with the most changed lines, since they are where bugs are most likely.

#### Correct answer to Question 29: A

Splitting the review avoids diluting attention across many files, and the dedicated integration pass catches cross-file bugs that per-file review would miss.

A bigger window does not solve uneven attention. An instruction does not guarantee uniformity. Filtering by size ignores small but critical changes.

## Scenario: Developer Productivity with Claude

### Question 30

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

In every session the agent spends many tool calls exploring to find out which internal API schemas and documents are available on the documentation MCP server. What is the best improvement?

- **A.** Add a tool that returns the full content of all the documents in a single call.
- **B.** Expose the catalog of documents and schemas as MCP resources, so the agent knows what exists without exploring.
- **C.** Copy the whole internal documentation into CLAUDE.md, so it is always available in context.
- **D.** Increase the session's tool-call limit, so that exploration does not get cut short.

#### Correct answer to Question 30: B

MCP resources expose a catalog of content the agent can consult directly, reducing exploratory calls to discover what is available.

Returning everything blows up the context. Copying the documentation into CLAUDE.md loads it in every session and gets out of date. Raising the limit does not cut wasted calls.

## Scenario: Customer Support Resolution Agent

### Question 31

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

`lookup_order` returns about 40 fields per order (warehouse codes, internal SKUs, audit timestamps). Customers with many orders make the context grow quickly, and the agent starts missing relevant details. You cannot change the backend API. What is the best fix?

- **A.** Add a PostToolUse hook that trims each result to the fields relevant to support before it enters the agent's context.
- **B.** Instruct the agent in the system prompt to ignore warehouse and audit fields when it reads the order results.
- **C.** Move to a model with a larger context window, so the full order results always fit without any trimming.
- **D.** Add a second model call after each lookup that summarizes the order results in natural language for the agent.

#### Correct answer to Question 31: A

A PostToolUse hook transforms tool results deterministically before the model sees them, removing noise at the source without touching the backend.

Telling the model to ignore fields still spends tokens and attention on them. A larger window postpones the problem. An extra summarization call adds latency and cost and can drop or distort exact values.

## Scenario: Code Generation with Claude Code

### Question 32

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Claude is implementing a date parser. You have described the rules in detail in prose (ambiguous formats, two-digit years, time zones), but after three iterations it still gets several edge cases wrong. What is the most effective next step?

- **A.** Rewrite the rules in prose more precisely, using bold text and capitals for the edge cases it misses.
- **B.** Switch to plan mode so Claude can reason about the rules more carefully before writing any code.
- **C.** Clear the session and restart with the same prose description, to remove the previous failed attempts.
- **D.** Provide concrete input/output examples for the edge cases (ideally as tests) and iterate against them.

#### Correct answer to Question 32: D

When prose is interpreted inconsistently, concrete input/output examples, better still as executable tests, remove the ambiguity and give an objective target to iterate against.

More emphatic prose does not resolve interpretive ambiguity. Plan mode does not add information. Restarting with the same description reproduces the same misunderstandings.

## Scenario: Multi-Agent Research System

### Question 33

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

Two credible sources give different figures for the same metric: a 2022 industry report says 34%, a 2024 academic study says 51%. The synthesis subagent reports only 51%, without mentioning the other figure. What is the correct behavior?

- **A.** Report the average of the two values, so that both sources are reflected in the final figure.
- **B.** Present both values with their sources and dates, noting the discrepancy and possible explanations.
- **C.** Always use the more recent value, since it reflects the latest state of knowledge on the topic.
- **D.** Leave the metric out of the report entirely, since the sources do not agree on its value.

#### Correct answer to Question 33: B

Credible conflicting data should be preserved with attribution and context (different dates or methods may explain the gap): the reader can evaluate, while the synthesis does not pick arbitrarily.

An average invents a figure no source reports. Always preferring the most recent ignores differences in methodology. Leaving it out loses relevant information.

## Scenario: Structured Data Extraction

### Question 34

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A batch of 10,000 requests comes back with 230 failures: 180 for exceeding the context limit (very long contracts) and 50 for temporary errors. What is the best strategy?

- **A.** Resubmit the whole batch, since partial results could be inconsistent with those of a new batch.
- **B.** Discard the failed requests, since a 2.3% failure rate is acceptable for a batch workload.
- **C.** Resubmit all 230 failures unchanged in a new batch, since the errors are probably transient.
- **D.** Use `custom_id` to resubmit only the failures: the 50 as they are, the 180 after chunking the long documents.

#### Correct answer to Question 34: D

`custom_id` links each result to its request: you resubmit only what failed and adjust the cause (oversized documents need chunking, transient errors only need a retry).

Resubmitting everything wastes cost and time. Discarding loses data. Resubmitting unchanged repeats the 180 context-limit failures.

## Scenario: Claude Code for Continuous Integration

### Question 35

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Claude generates unit tests for every pull request. Developers complain that many generated tests duplicate scenarios already covered by the existing suite, while edge cases are missing. What is the best fix?

- **A.** Ask Claude to generate fewer tests, focusing only on the functions changed in the pull request.
- **B.** Remove duplicate tests with a script after generation, by comparing the test names.
- **C.** Include the existing test files in the context, so Claude can identify what is already covered.
- **D.** Generate the tests in a batch run at night, so they can be reviewed more carefully the next day.

#### Correct answer to Question 35: C

Without seeing the existing tests, Claude cannot know what is already covered. With them in context it can target the gaps, edge cases included.

Fewer tests does not mean better tests. Comparing names does not catch semantic duplicates. Running at night changes the timing, not the coverage.

## Scenario: Developer Productivity with Claude

### Question 36

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

For multi-day investigations of a legacy system, the agent loses earlier findings when the context is compacted, and repeats the same analyses. What is the best pattern?

- **A.** Disable automatic compaction, so the context is never compacted during the investigation.
- **B.** Ask the agent to remember the important findings, emphasizing it in the system prompt.
- **C.** Restart the investigation from scratch every day, so the context always stays small.
- **D.** Have the agent keep a scratchpad file of structured findings that it updates and re-reads when needed.

#### Correct answer to Question 36: D

A file of findings persists outside the context: it survives compaction and new sessions, and the agent can consult it instead of repeating analyses.

Disabling compaction leads to running out of context. "Remembering" is not possible beyond the context. Restarting from scratch throws away the work done.

## Scenario: Customer Support Resolution Agent

### Question 37

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

When the order database times out, the `lookup_order` MCP tool catches the exception and returns an empty list. The agent then tells customers "You have no orders with us", which triggers complaints. What is the best fix?

- **A.** Have the tool retry the query internally up to ten times before returning, so timeouts become very rare.
- **B.** Return a structured error (`isError`, a transient category, `isRetryable: true`) that is distinct from a valid empty result.
- **C.** Add a prompt instruction telling the agent to treat empty lists as possible errors and to apologize to the customer.
- **D.** Have the tool return a fake placeholder order, so the agent never concludes the customer has no orders.

#### Correct answer to Question 37: B

The real defect is that an access failure and a valid "no results" look identical. Structured error metadata lets the agent retry or tell the customer about a temporary problem instead of stating something false.

Internal retries reduce but do not remove the ambiguity. The prompt instruction leaves the agent guessing between two different situations. A placeholder order is fabricated data.

## Scenario: Code Generation with Claude Code

### Question 38

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

During a two-hour exploration of a legacy codebase, Claude ran many Grep and Read commands with long outputs. It now answers with generic phrases like "the typical pattern for this kind of service" instead of citing the specific classes it found an hour ago. What is the best way to prevent this in future sessions?

- **A.** Use a model with a larger context window, so the early exploration outputs remain fully available.
- **B.** Run `/clear` every thirty minutes, so that the context is reset regularly before it degrades.
- **C.** Delegate verbose exploration to an Explore subagent that returns concise findings, keeping the main context clean.
- **D.** Ask Claude to re-read every file it already explored before answering any question about the codebase.

#### Correct answer to Question 38: C

The symptom is context degradation from verbose output. Delegating exploration to a subagent isolates that output and brings only a synthesis back into the main session.

A bigger window postpones the problem. `/clear` throws away findings along with the noise. Re-reading everything worsens the very problem it tries to fix.

## Scenario: Multi-Agent Research System

### Question 39

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The synthesis subagent was given every tool, including web search. It increasingly starts its own searches when it judges a finding weak, slowing runs and producing uncoordinated results. However, about 80% of its checks are simple fact lookups (a date, a name). What is the best design?

- **A.** Leave web search available and add a prompt instruction asking the subagent to use it sparingly.
- **B.** Remove all search tools and let the coordinator handle every verification, however small.
- **C.** Allow search but cap it at three calls per run, so that it cannot slow down every execution.
- **D.** Restrict it to its role and add a narrow `verify_fact` tool, routing broader research back through the coordinator.

#### Correct answer to Question 39: D

Tools should match each agent's role. A narrow tool covers the common simple checks without latency or deviation, while broader research stays under the coordinator.

An instruction does not limit the tool. Routing every check through the coordinator adds round trips for trivial cases. A fixed cap is arbitrary and does not tell simple checks from broad research.

## Scenario: Structured Data Extraction

### Question 40

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Overall extraction accuracy on a validation sample is 97%, and management proposes removing human review entirely. Broken down by document type, handwritten forms (8% of volume) are at 71%. What should you do?

- **A.** Remove human review, since 97% overall exceeds the quality target set for the project.
- **B.** Keep human review on everything until each document type exceeds 97% accuracy.
- **C.** Reduce review only for segments with verified high accuracy, keeping it for handwritten forms.
- **D.** Remove review and add a disclaimer that extracted data may contain occasional errors.

#### Correct answer to Question 40: C

Aggregate metrics can hide segments with poor performance. Reducing review should be decided per segment (document type, field), keeping humans where accuracy is not enough.

The overall figure masks the handwritten forms. Keeping review on everything ignores the savings available on reliable segments. A disclaimer does not protect downstream systems from errors.

## Scenario: Claude Code for Continuous Integration

### Question 41

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

The team runs Claude Code in CI, but the reviews do not reflect the project's standards (fixtures to use, testing conventions, criteria for what counts as a bug). Developers who use Claude Code locally with their personal configurations do not have this problem. What is the best fix?

- **A.** Paste all the standards into the command-line prompt of every CI job.
- **B.** Document the standards in the project CLAUDE.md, which Claude Code in CI loads from the repository.
- **C.** Copy each developer's personal configuration onto the CI runners.
- **D.** Create a dedicated MCP server that serves the project's standards on demand.

#### Correct answer to Question 41: B

The project CLAUDE.md is versioned with the code and loaded automatically by Claude Code in CI too: one source for local and pipeline runs.

Duplicating standards in every job causes drift. Personal configurations are not shared and differ between people. An MCP server is excessive for static context.

## Scenario: Developer Productivity with Claude

### Question 42

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A developer implemented the agentic loop as follows: after each response, if the text contains the word "DONE" the loop ends, otherwise it continues. Sometimes the loop stops in the middle of tool calls, or never ends. What is the correct fix?

- **A.** Base the loop on `stop_reason`: continue while it is "tool_use", stop when it is "end_turn".
- **B.** Ask the model to write "DONE" in capitals and on its own line, to make it easier to detect.
- **C.** Set a fixed limit of 10 iterations, ending the loop when it is reached regardless of state.
- **D.** End the loop when the response contains no text, a sign that the model has nothing left to say.

#### Correct answer to Question 42: A

`stop_reason` is the structured signal for whether the model wants to use tools ("tool_use") or has finished ("end_turn"). Parsing text is fragile.

A more visible keyword stays fragile. A fixed limit is a safeguard, not a control mechanism. Missing text happens precisely during tool calls.

## Scenario: Customer Support Resolution Agent

### Question 43

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer's single message raises three issues: a refund for a damaged item, a shipping address change for a pending order, and a question about a double charge. The agent handles the refund well but ignores the other two. What is the best design change?

- **A.** Ask the customer to send each issue in a separate message, so the agent can handle them one at a time.
- **B.** Add a rule to always end the reply by asking "Is there anything else I can help you with?"
- **C.** Handle the issues sequentially across turns, resolving the refund before even looking at the other two.
- **D.** Decompose the message into distinct issues, investigate each (in parallel where possible), then reply on all of them together.

#### Correct answer to Question 43: D

Multi-concern requests should be decomposed explicitly, with each issue investigated (independent lookups can run in the same turn) and a single synthesized reply that covers all of them.

Asking the customer to split the message shifts the work to them. A closing question still does not ensure the issues already raised get addressed. Strictly sequential handling is slower and makes it easy to lose the remaining issues.

## Scenario: Code Generation with Claude Code

### Question 44

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

The whole team needs a Jira MCP server in Claude Code. Each developer has their own personal API token. What is the best configuration?

- **A.** Commit a project `.mcp.json` that references the token through environment variable expansion (`${JIRA_TOKEN}`).
- **B.** Commit a project `.mcp.json` with a shared service-account token, so the setup works on every machine.
- **C.** Have each developer configure the server in their user-level settings, following a wiki page.
- **D.** Document the server's URL in CLAUDE.md so Claude can call the Jira API directly when needed.

#### Correct answer to Question 44: A

A shared `.mcp.json` with environment variable expansion gives one versioned configuration for everyone while keeping credentials out of the repository.

Committing a token exposes secrets and loses per-user attribution. User-level configuration is not shared and drifts apart. CLAUDE.md does not configure MCP servers.

## Scenario: Multi-Agent Research System

### Question 45

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The document analysis subagent could not access several paywalled sources that are central to the topic. The final report presents its conclusions as exhaustive, without mentioning any limitations. What should change?

- **A.** Instruct the search subagent to bypass the paywalls so that every source is always available.
- **B.** Have the coordinator abort the research whenever a central source turns out to be inaccessible.
- **C.** Have synthesis include coverage annotations that show which areas are well supported and where the gaps are.
- **D.** Have the report subagent add a generic disclaimer about possible incomplete sources to every report.

#### Correct answer to Question 45: C

Making coverage gaps explicit, tied to specific areas, lets readers calibrate their trust in each conclusion.

Bypassing paywalls is not legitimate. Aborting wastes the work done. A generic disclaimer does not tell the reader which conclusions are weaker.

## Scenario: Structured Data Extraction

### Question 46

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

You want to send to human review only the extractions that are probably wrong. The model returns a confidence score (0-1) for each field, but you see many errors with confidence above 0.9. What is the best approach?

- **A.** Calibrate the thresholds per field against a labeled validation set, checking how confidence relates to actual accuracy.
- **B.** Raise the review threshold to 0.99, so that only extractions with near-total confidence are accepted.
- **C.** Ignore the model's confidence and send a fixed random sample of 10% of all documents to review.
- **D.** Ask the model to be more conservative in its scores, lowering them whenever it has any doubt.

#### Correct answer to Question 46: A

Self-reported confidence is useful only once calibrated: measuring it against labeled data shows which thresholds actually separate correct from wrong extractions, field by field.

Raising the threshold blindly sends almost everything to review without solving the miscalibration. Random sampling alone throws away a useful signal (although it stays useful for monitoring). Asking for more conservative scores is not a calibration.

## Scenario: Claude Code for Continuous Integration

### Question 47

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Finding severity is inconsistent between runs on similar code: the same pattern (a missing null check on an external input) gets "critical" one day and "minor" the next. What is the most effective fix?

- **A.** Run the review three times and take the most frequent severity among the results.
- **B.** Remove severity from the findings and let developers judge the importance of each one.
- **C.** Set the temperature to 0, so that the output is always identical for the same input.
- **D.** Add few-shot examples for each severity level, with the reasoning behind each classification.

#### Correct answer to Question 47: D

Few-shot examples with reasoning anchor the model to consistent severity criteria and show how to generalize to similar cases.

Majority voting triples cost without fixing the ambiguous criterion. Removing severity loses useful information. Temperature 0 lowers variance but does not make different-yet-similar inputs consistent.

## Scenario: Developer Productivity with Claude

### Question 48

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

In the agentic loop, the agent repeats the same tool call over and over with identical parameters. Debugging shows the code runs the tool correctly but does not append the result to the messages before the next request. What is the right fix?

- **A.** Add an instruction to the system prompt telling the model not to repeat calls it has already made.
- **B.** Store the tool results in a cache and return them immediately when an identical call repeats.
- **C.** Append a `tool_result` with the matching `tool_use_id` to the messages before calling the model again.
- **D.** Lower the temperature so the model is less likely to repeat its tool calls.

#### Correct answer to Question 48: C

Without the `tool_result` in the history, the model does not know the tool already ran and asks again. The result must be appended, linked by `tool_use_id`.

A prompt instruction cannot fix missing data. A cache hides the bug without informing the model. Temperature has nothing to do with the problem.

## Scenario: Customer Support Resolution Agent

### Question 49

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

`get_customer` is described as "Retrieves customer information" and `lookup_order` as "Retrieves order information for a customer". For queries like "where is my last order?" the agent often calls `get_customer` first and then answers from the account summary, which contains a stale "last order status" field. Few-shot examples in the system prompt reduced but did not remove the problem. What is the highest-leverage next step?

- **A.** Rewrite both descriptions with clear boundaries: what each returns, its expected inputs, and when to prefer one over the other.
- **B.** Merge the two tools into a single `get_customer_and_orders` tool, so the agent never has to choose between them.
- **C.** Add a classifier in front of the agent that routes order-related queries to a separate, order-only agent.
- **D.** Add even more few-shot examples to the system prompt, covering every order-related phrasing you can find.

#### Correct answer to Question 49: A

Tool descriptions are the model's main input for tool selection. Vague, overlapping descriptions cause misrouting, and stating what each tool returns (including that the account summary status may be stale) fixes the root cause.

Merging the tools inflates every result. A routing classifier adds architecture to compensate for a description problem. More few-shot examples have already shown diminishing returns.

## Scenario: Code Generation with Claude Code

### Question 50

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Yesterday you spent a long session analyzing a module with Claude. Overnight, teammates merged a large refactor touching most of the files you analyzed. Today you need to continue the work. What is the most reliable approach?

- **A.** Resume yesterday's session with `--resume`, since it already contains all the detailed analysis.
- **B.** Start a new session seeded with a structured summary of yesterday's conclusions, and re-analyze the changed files.
- **C.** Resume yesterday's session and ask Claude to assume its earlier analysis still broadly holds.
- **D.** Start a new session without any context, so Claude rebuilds its understanding entirely from scratch.

#### Correct answer to Question 50: B

When most of the earlier tool results are stale, resuming means reasoning on outdated data. A new session with a summary of the conclusions keeps the useful knowledge without the obsolete outputs.

Resuming is fine when few files changed and you can point them out. Assuming the analysis still holds is risky. Starting with no context throws away valuable work.

## Scenario: Multi-Agent Research System

### Question 51

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

Reports on complex topics often have uneven coverage: some subtopics are thorough, others thin. You want the system to fix this on its own before delivering. What is the best pattern?

- **A.** Have the coordinator evaluate synthesis output for gaps, delegate targeted follow-up research, and re-synthesize, with an iteration cap.
- **B.** Always double the number of subagents for complex topics, so that coverage is wider from the very start.
- **C.** Have every subagent self-assess its own completeness and decide on its own whether more research is needed.
- **D.** Have the report subagent fill the thin sections with general considerations, so they look balanced.

#### Correct answer to Question 51: A

An iterative evaluate-and-refine loop driven by the coordinator, which has the full view, finds gaps and requests targeted research. The cap prevents endless loops.

More subagents up front do not guarantee balance. Each subagent sees only its own part, not the overall gaps. Filling with generic content masks the problem.

## Scenario: Structured Data Extraction

### Question 52

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

The `document_category` field is an enum of 12 values. New document types arrive that fit none of them, and the model forces them into the closest category, polluting the downstream reports. What is the best schema change?

- **A.** Remove the enum and accept free text, so that the model can describe any category it finds.
- **B.** Add a prompt instruction asking the model to choose the closest category with more care.
- **C.** Keep adding values to the enum each time a new document type shows up in production.
- **D.** Add an "other" value plus a `category_detail` field that describes the unforeseen type.

#### Correct answer to Question 52: D

"other" plus a detail field preserves the enum's structure for known cases and gives an honest way out for new ones, which you can then analyze and add if they recur.

Free text loses standardization. Asking for more care does not fix a missing option. Chasing every new type in the enum is reactive and leaves forced classifications in the meantime.

## Scenario: Claude Code for Continuous Integration

### Question 53

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Developers dismiss about 40% of findings, but you do not know why. You want to understand which kinds of finding are systematically rejected, in order to improve the prompts. What should you add to the findings' output?

- **A.** A structured field that identifies the pattern or rule detected, so dismissals can be analyzed by category.
- **B.** A longer explanation for each finding, so developers understand it better before deciding.
- **C.** A request to developers to leave a free-text comment whenever they dismiss a finding.
- **D.** A confidence score for each finding, so you can filter out the ones most likely to be dismissed.

#### Correct answer to Question 53: A

A structured field for the detected pattern lets you aggregate dismissals by category and see which rules produce false positives: targeted, measurable improvement.

Longer explanations do not tell you which pattern fails. Free-text comments are hard to aggregate and often skipped. Confidence does not tell you why a finding gets dismissed.

## Scenario: Developer Productivity with Claude

### Question 54

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

The agent uses three MCP tools that return timestamps in different formats (Unix epoch, ISO 8601, "MM/DD/YYYY"). The agent sometimes compares dates incorrectly. You cannot change the MCP servers. What is the best fix?

- **A.** Add instructions to the system prompt explaining how to convert each date format.
- **B.** Add a PostToolUse hook that normalizes every timestamp to ISO 8601 before the agent sees it.
- **C.** Ask the agent to convert dates with a Bash script whenever it needs to compare them.
- **D.** Pick a different model that is better at reasoning about heterogeneous date formats.

#### Correct answer to Question 54: B

A PostToolUse hook normalizes tool results deterministically before they reach the model: the agent always sees a consistent format.

Prompt instructions leave the conversion to probabilistic reasoning. Converting via Bash adds calls and depends on the agent remembering. A different model does not remove the inconsistency at the source.

## Scenario: Customer Support Resolution Agent

### Question 55

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer asks for a price match with a competitor's lower price. Your refund policy covers price adjustments only for price drops on your own website and says nothing about competitors. What should the agent do?

- **A.** Apply the own-site price adjustment rule by analogy, since the customer's intent is essentially the same.
- **B.** Escalate to a human, explaining that the policy does not cover competitor price matching, without promising an outcome.
- **C.** Decline politely, explaining that only price drops on your own website qualify for an adjustment.
- **D.** Offer a small goodwill credit in place of the match, so the customer leaves satisfied without changing policy.

#### Correct answer to Question 55: B

When policy is silent on a case, the agent must not invent one: a policy gap is a classic escalation trigger, handled without making promises.

Applying a rule by analogy or offering an unauthorized credit creates de facto policy. Declining treats silence as a prohibition, which may be wrong: the decision belongs to someone with authority.

## Scenario: Code Generation with Claude Code

### Question 56

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

After an in-depth analysis of a payment module, you want to try two different refactoring strategies starting from the same understanding of the code, without one attempt influencing the other. What should you do?

- **A.** Run both strategies one after the other in the same session, reverting the files between the two attempts.
- **B.** Open two new sessions and repeat the full module analysis independently in each of them.
- **C.** Fork the session (e.g. `--fork-session`) to create two branches that share the analysis baseline.
- **D.** Write the analysis to a file and ask Claude to evaluate both strategies in a single response.

#### Correct answer to Question 56: C

Forking a session creates independent branches from a shared starting point: each strategy inherits the analysis but not the other's attempts.

The same session carries the first attempt's reasoning into the second. Repeating the analysis wastes time and can lead to different conclusions. Comparing on paper is not trying the strategies.

## Scenario: Multi-Agent Research System

### Question 57

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

To speed things up, a developer lets subagents call each other directly (search hands off to analysis, which calls synthesis). Since then, failures have become hard to trace and some reports are internally inconsistent. What should you do?

- **A.** Add detailed logging to each subagent while keeping the direct calls between them.
- **B.** Give each subagent the full conversation history so that it can coordinate with the others.
- **C.** Replace the subagents with a single agent that has every tool, removing coordination problems.
- **D.** Return to hub-and-spoke: all communication goes through the coordinator, which manages flow and errors.

#### Correct answer to Question 57: D

With the coordinator as the single routing point you get observability, consistent error handling and control of information flow.

Logging helps diagnosis but leaves the uncontrolled flow in place. Sharing full histories bloats context and goes against isolation. A single agent loses the benefits of specialization.

## Scenario: Structured Data Extraction

### Question 58

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

To catch errors, after each extraction you ask the same model, in the same conversation, to "review the extraction you just made and fix any errors". The pass finds very few problems, but a human audit finds many. What is the most effective change?

- **A.** Repeat the self-review two or three times in the same conversation, until the output converges.
- **B.** Add a detailed checklist to the self-review prompt, listing the error categories to check.
- **C.** Use an independent model instance that receives only the source document and the extraction, without the previous reasoning.
- **D.** Ask the model to give a confidence score for each field during the self-review.

#### Correct answer to Question 58: C

A model reviewing in the same context tends to confirm its own reasoning. An independent instance, with no access to the original reasoning, evaluates the output with fresh eyes.

Repeating the self-review reinforces the same blind spots. A checklist helps but does not remove the bias of shared context. Confidence scores from the same instance carry the same bias.

## Scenario: Claude Code for Continuous Integration

### Question 59

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A developer created a very effective `/security-review` command and asks you to use it in CI too. In the pipeline the command is not found, while it works on their laptop. What is the most likely cause, and its fix?

- **A.** The command requires interactive mode: rewrite the review logic as a Bash script.
- **B.** The CI uses a different Claude Code version: align versions across laptops and runners.
- **C.** The command is in `~/.claude/commands/`: move it to `.claude/commands/` in the repository.
- **D.** Custom commands are disabled with `-p`: pass the review instructions directly in the prompt.

#### Correct answer to Question 59: C

Commands in `~/.claude/commands/` are personal and only exist on the user's machine. Commands in `.claude/commands/` in the repository are shared with the team and the pipeline.

The other options name plausible causes that do not match the symptom ("works locally, not found in CI"), which points to the file's location.

## Scenario: Developer Productivity with Claude

### Question 60

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

The team wants to integrate the agent with GitHub (issues, pull requests) and with an internal tool that manages team-specific deploy approvals. A colleague proposes writing two custom MCP servers. What is the best choice?

- **A.** Write both custom servers, so you have full control over both integrations.
- **B.** Have the agent call both systems' APIs with `curl` through Bash, without any MCP server.
- **C.** Use a community MCP server for the internal tool and write a custom one for GitHub.
- **D.** Use an existing community MCP server for GitHub and write a custom one only for the internal tool.

#### Correct answer to Question 60: D

For standard integrations like GitHub, mature community servers already exist: building one is wasted effort. A custom server makes sense for team-specific workflows that nobody else covers.

Writing both duplicates existing work. Bare `curl` loses the structured tool interface. Swapping the choices is the reverse of what makes sense.
