---
title: "Practice Test 6 – Claude Certified Architect"
duration_minutes: 120
---

# Questions and Answers: Practice Test 6 – Claude Certified Architect

## Scenario: Customer Support Resolution Agent

### Question 1

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

Audit logs show that in 3% of refunds the agent called `process_refund` for an order number typed by the customer without first calling `get_customer` to verify that the order belongs to the authenticated account. The system prompt already says "Always verify the customer before refunding." Several of these refunds went to orders owned by other people. What is the most reliable fix?

- **A.** Add a programmatic check that blocks `process_refund` unless a prior `get_customer` call confirmed the order belongs to the customer.
- **B.** Rewrite the instruction in capital letters on the first line of the system prompt, with two few-shot examples of correct verification.
- **C.** Merge `get_customer` and `process_refund` into one tool taking both email and order number, trusting the model to pass consistent values.
- **D.** Ask the customer to confirm "yes, this is my order" before each refund, and proceed only when the customer replies affirmatively.

#### Correct answer to Question 1: A

When a step must always come before another (identity verification before a financial action), the order is enforced in code: a programmatic gate that blocks `process_refund` without a prior successful verification works regardless of how the model reasons.

B stays probabilistic: the instruction was already there and failed in 3% of cases. C does not verify ownership, it only merges calls. D relies on the statement of the person who could be the fraudster.

## Scenario: Code Generation with Claude Code

### Question 2

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A developer is convinced that Claude Code is ignoring the rule "never use default exports" written in a CLAUDE.md file. Other developers do not see the problem. The developer is not sure which memory files their session is actually loading, given that the repository has a root `CLAUDE.md`, two subdirectory files, and the developer also has a user-level file. What is the most direct first diagnostic step?

- **A.** Delete every CLAUDE.md file except the root one and check whether the behavior changes in a new session.
- **B.** Run `/memory` in the session to see which memory files are loaded, then open them to check their content.
- **C.** Ask Claude Code in natural language "Which rules do you remember?" and compare its answer with the root CLAUDE.md.
- **D.** Reinstall Claude Code, since inconsistent memory loading between developers usually indicates a corrupted local installation.

#### Correct answer to Question 2: B

`/memory` shows which memory files are loaded in the current session and lets you open them: it is the direct way to diagnose differences between developers (e.g., a user-level file that contradicts the project one).

A is destructive and imprecise. C relies on the model's recall, not on the actual configuration. D does not address a configuration issue.

## Scenario: Multi-Agent Research System

### Question 3

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

All four subagents are configured with the same full toolset: WebSearch, WebFetch, Read, Write, and Bash. The synthesis subagent, instead of synthesizing the findings it receives, sometimes launches new web searches and adds unvetted sources to the report; the report generator occasionally runs Bash commands. What is the best configuration change?

- **A.** Add "Use only the tools appropriate to your role" to each subagent's prompt, keeping the full toolset for flexibility.
- **B.** Merge synthesis and report generation into a single subagent, so that fewer agents have access to the full toolset.
- **C.** Give each subagent only the tools its role needs (web tools only for search, no web or Bash for synthesis): least privilege.
- **D.** Have the coordinator validate every tool call made by subagents after the fact, discarding results from inappropriate calls.

#### Correct answer to Question 3: C

Tool access should be limited per role: a subagent without web search cannot add unvetted sources. Least privilege improves both focus and safety, and also helps tool selection.

A is probabilistic. B reduces specialization without fixing the cause. D wastes work and detects the problem only afterwards.

## Scenario: Structured Data Extraction

### Question 4

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Suppliers often send a single PDF containing several invoices, from 1 to 15. The current schema describes one invoice as a top-level object. When a PDF contains several invoices, the output contains only the first one, or mixes line items from different invoices into a single object. What schema change best solves this?

- **A.** Keep the single-invoice schema and add the instruction "If there are several invoices, extract only the largest one," processing the others manually.
- **B.** Add a preprocessing step that splits every PDF into single pages and extracts each page as a separate invoice.
- **C.** Run the extraction 15 times per PDF, each time asking for "the invoice number N," and discard empty outputs.
- **D.** Make the top-level schema an object with an `invoices` array, where each element is a complete invoice with its own number, date, line items, and total.

#### Correct answer to Question 4: D

When a document can contain several entities, the schema must model them: an array of complete objects keeps each invoice's line items separate and handles any number of invoices in a single call.

A loses data. B breaks multi-page invoices. C multiplies cost and makes "invoice N" ambiguous.

## Scenario: Claude Code for Continuous Integration

### Question 5

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

The automated review uses the prompt "Find all the bugs in this pull request." On small, clean PRs the reviewer still posts 3–5 comments, many of them speculative ("this could potentially cause issues in some edge cases"). Developers have started dismissing every bot comment without reading. What is the most effective prompt change?

- **A.** State that reporting no issues is a valid outcome, and require each finding to describe a concrete failure scenario and its inputs.
- **B.** Limit the reviewer to at most one comment per PR, so only the single most important finding is ever posted on each PR.
- **C.** Ask the reviewer to prefix speculative comments with "Possible issue:", so developers can recognize and skip them quickly.
- **D.** Run the review only on PRs with more than 200 changed lines, where real bugs are statistically more likely to be present.

#### Correct answer to Question 5: A

"Find all the bugs" implies bugs exist, pushing the model to fill the quota. Saying that "no issues" is valid and requiring a concrete failure scenario for each finding cuts speculative comments and restores trust.

B hides real findings on PRs with several bugs. C still posts the noise. D skips small PRs that can contain bugs.

## Scenario: Developer Productivity with Claude

### Question 6

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

An engineer asks the agent to bump a logging library version and update the deprecated `log.warn(msg, ctx)` call to `log.warning(ctx, msg)` in 230 repositories of the organization. In a pilot, the agent processed repositories one at a time in conversation, and after about 40 repositories it began applying the change inconsistently. What is the best approach?

- **A.** Keep processing repositories in conversation, but start a fresh session every 40 repositories so the context is reset regularly.
- **B.** Have the agent write a script for the change, test it on a few representative repos, review the results, then run it on all.
- **C.** Spawn 230 subagents in parallel, one per repository, each receiving a prompt that describes the change in natural language.
- **D.** Ask the agent to produce one large patch file containing every change for all 230 repositories in a single response.

#### Correct answer to Question 6: B

For repetitive, mechanical changes at scale, the agent is best used to create and validate a deterministic tool (a script), which is then applied uniformly. The result is consistent and verifiable.

A reduces drift but each repository is still reinterpreted. C multiplies 230 independent interpretations of the same change. D exceeds any reasonable output limit and is impossible to review.

## Scenario: Customer Support Resolution Agent

### Question 7

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer writes in a single message: "I want to return the shoes from order 4471, change the delivery address for order 4502 which hasn't shipped yet, and I noticed I was charged twice for my subscription in May." Today the agent addresses only the first request and closes the conversation, forcing the customer to write again. What is the best behavior?

- **A.** Escalate the conversation to a human, since messages containing more than one request are too complex for automated handling.
- **B.** Reply that only one request can be handled per conversation and ask the customer to open separate tickets for the other ones.
- **C.** Split the message into its three requests, investigate each with the relevant tools, and answer all three in a single reply.
- **D.** Address only the request with the highest monetary value, since it has the greatest impact on the customer's satisfaction.

#### Correct answer to Question 7: C

Multi-issue messages should be decomposed into distinct items, each investigated (also in parallel where possible) with the shared context, and then answered in a unified response. This directly increases first-contact resolution.

A escalates cases the agent can resolve. B and D leave requests unresolved and force new contacts.

## Scenario: Code Generation with Claude Code

### Question 8

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

The team wants every file edited by Claude Code to be automatically formatted with the project's formatter (`prettier --write`) immediately after each edit, without depending on developers or Claude remembering to do it. The configuration must be shared with the whole team. What should you configure?

- **A.** A line in the project `CLAUDE.md` stating: "After editing any file, always run prettier --write on it before continuing."
- **B.** A `/format` slash command in `.claude/commands/` that developers run at the end of each session to format edited files.
- **C.** A Git pre-commit hook that formats staged files, so any unformatted edits are fixed automatically at commit time.
- **D.** A `PostToolUse` hook in the project `.claude/settings.json` that matches the edit tools and runs the formatter on the file.

#### Correct answer to Question 8: D

Claude Code hooks run deterministically on lifecycle events: a `PostToolUse` hook on the edit tools, configured in the project's `.claude/settings.json` (shared through version control), formats every file immediately after each edit.

A is a probabilistic instruction. B depends on manual action. C works only at commit, so intermediate edits and diffs reviewed during the session stay unformatted.

## Scenario: Multi-Agent Research System

### Question 9

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The web search subagent returns to the coordinator the full text of every page it fetched, on average 25 pages of 6,000 words per subtopic. After two subtopics the coordinator's context is nearly full, and its delegation decisions for later subtopics become noticeably worse. What is the best change?

- **A.** Have the search subagent return condensed, structured findings (claim, source, date, excerpt), not raw pages.
- **B.** Have the coordinator delete the oldest subagent results from its context whenever usage exceeds 70% of the window.
- **C.** Increase the coordinator's `max_tokens`, so it can still write long, detailed delegation messages despite the full context.
- **D.** Limit the web search subagent to fetching three pages per subtopic, regardless of how broad the subtopic actually is.

#### Correct answer to Question 9: A

Subagents exist precisely to absorb verbose work in their own context and return only what matters. Condensed, structured findings (with provenance preserved) keep the coordinator's context lean.

B throws away results the coordinator needs. C concerns output, not the input that saturates the context. D sacrifices coverage on broad topics.

## Scenario: Structured Data Extraction

### Question 10

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

The pipeline submits 40,000 extraction requests to the Message Batches API each night. In the morning, the results show 380 requests ended with errors (some for documents exceeding the context limit, others for invalid request formatting), while all the others succeeded. What is the most efficient way to handle this?

- **A.** Resubmit the entire batch of 40,000 requests, since a batch that contains errors cannot be considered reliable as a whole.
- **B.** Find failed requests by `custom_id`, fix the cause (split big documents, fix formatting), resubmit only those.
- **C.** Discard the 380 failed documents, since a failure rate below 1% is acceptable for a nightly job of this size.
- **D.** Switch the whole nightly job to synchronous calls, since synchronous requests never fail because of document size.

#### Correct answer to Question 10: B

Batch results are correlated by `custom_id`: you can isolate the failed requests, fix the specific cause, and resubmit only those, without reprocessing what already succeeded.

A doubles cost for nothing. C loses data silently. D does not solve the size problem and loses the batch discount.

## Scenario: Claude Code for Continuous Integration

### Question 11

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

The CI job generates tests with Claude Code and needs to run the test suite to confirm the tests pass, but the security team does not want the job to be able to execute arbitrary shell commands. The project's test command is `npm test`. Which tool configuration best balances these needs?

- **A.** Allow all Bash commands, but add to the prompt: "Run only `npm test` and nothing else in the shell during this job."
- **B.** Disallow Bash entirely and let a separate CI step run the tests after Claude Code finishes, without feeding results back.
- **C.** Allow Bash only for the needed command pattern (e.g. `Bash(npm test:*)`) plus editing tools, denying any other command.
- **D.** Run Claude Code in a container with root privileges, so any command it runs is confined to that container.

#### Correct answer to Question 11: C

Claude Code permissions support rules scoped to specific commands: allowing only `npm test` lets the agent verify the tests and iterate, without the ability to run arbitrary commands.

A is a probabilistic instruction. B takes away the agent's ability to iterate on failing tests. D isolates but still allows arbitrary commands inside the container, and root privileges increase the risk.

## Scenario: Developer Productivity with Claude

### Question 12

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

The platform team wants to prevent the agent, used by 300 engineers, from running destructive commands such as `rm -rf`, `git push --force`, or `DROP TABLE`, regardless of how the engineer phrases the request. Engineers should still be able to use Bash for normal tasks. What is the most reliable mechanism?

- **A.** A `PreToolUse` hook on Bash that inspects each command and blocks destructive patterns before execution, giving a reason.
- **B.** A system prompt section listing the forbidden commands, with a clear explanation of why each one of them is dangerous.
- **C.** Remove the Bash tool from the agent entirely and replace it with dedicated MCP tools for each permitted operation.
- **D.** Log every Bash command to an audit system and review the logs weekly to identify engineers requesting destructive commands.

#### Correct answer to Question 12: A

A `PreToolUse` hook intercepts the command before execution and blocks it deterministically, returning a reason the agent can use to adjust. Normal Bash use stays possible.

B is probabilistic. C removes a broadly useful capability and requires a tool for every operation. D only detects afterwards, when the damage is done.

## Scenario: Customer Support Resolution Agent

### Question 13

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

When the agent calls `escalate_to_human`, the human operator receives only a ticket ID and must read the full 25-turn transcript before acting. Average handling time after escalation is 9 minutes, and customers complain about having to repeat information. What is the best change to the escalation tool?

- **A.** Attach the full raw transcript to the ticket, highlighted in bold, so the operator immediately sees the entire conversation.
- **B.** Have the agent send the customer a summary of the chat, asking them to forward it to the operator after the transfer.
- **C.** Escalate after at most 5 turns, so conversations are shorter and the transcripts are much quicker for operators to read.
- **D.** Make `escalate_to_human` take a structured summary: identity, problem, actions taken and their results, reason, next step.

#### Correct answer to Question 13: D

The handoff to a human must be self-contained: the operator does not have the agent's context. A structured summary (who, what, what was done, why it is escalated, what is proposed) cuts handling time and avoids the customer repeating information.

A does not reduce reading work. B shifts the burden onto the customer. C escalates cases the agent could resolve.

## Scenario: Code Generation with Claude Code

### Question 14

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A product manager asks for a "smart notification digest" feature. The requirements are vague: nobody has decided the batching window, whether users can configure it, what happens with urgent notifications, or how it interacts with existing email preferences. A developer wants to use Claude Code to get started. What is the most effective first step?

- **A.** Ask Claude Code to implement the most common digest design found in similar apps, adjusting once the product manager sees it.
- **B.** Ask Claude Code to interview the developer, surfacing the open questions (window, configurability, urgency) before designing.
- **C.** Use direct execution and generate the feature with every option configurable, so any decision is already supported.
- **D.** Start writing the database migration for the digest table, since the data model is needed whatever the final decisions are.

#### Correct answer to Question 14: B

When requirements are ambiguous, having Claude interview you to bring out decisions and edge cases before designing prevents rework. It clarifies scope before writing any code.

A and C produce code based on assumptions (C also adds unnecessary complexity). D commits to a data model before knowing the requirements it depends on.

## Scenario: Multi-Agent Research System

### Question 15

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

To reduce latency, a developer proposes letting the web search subagent send its findings directly to the synthesis subagent, and the synthesis subagent send drafts directly to the report generator, bypassing the coordinator. In tests, when one step fails, nobody notices and the final report is silently incomplete. What architecture should you recommend?

- **A.** Keep direct communication between subagents but add a retry on every hop, so transient failures are recovered automatically.
- **B.** Have each subagent write its output to a shared folder that the next subagent in the chain checks once every minute.
- **C.** Keep hub-and-spoke: all communication goes through the coordinator, which observes results, handles errors, and decides.
- **D.** Have the report generator check at the end whether the report "looks complete", and regenerate it whenever it does not.

#### Correct answer to Question 15: C

In hub-and-spoke orchestration the coordinator mediates every exchange: it has visibility into results and failures, can handle errors and gaps, and maintains control of the flow. Direct communication between subagents loses this observability.

A recovers only transient failures, not those that need a decision. B adds latency and still has no one handling errors. D relies on a vague "looks complete" check at the end.

## Scenario: Structured Data Extraction

### Question 16

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

The system extracts `annual_revenue` from financial statements. Some tables state "(in thousands of EUR)" in a header row, others "(EUR millions)" in a footnote, others give full figures. The downstream system receives values that are off by factors of 1,000 or 1,000,000 in about 11% of cases. What is the best schema-level fix?

- **A.** Instruct the model to always multiply values by 1,000, since thousands is the most common scale used in the corpus.
- **B.** Extract the value as written plus explicit `currency` and `scale` fields (quoting the scale text); normalize later.
- **C.** Reject any extraction where `annual_revenue` is below 10,000, since the real companies in the dataset have higher revenues.
- **D.** Ask the model to return the revenue as a text string including the units, so the downstream system can display it as is.

#### Correct answer to Question 16: B

Making scale and currency explicit as separate fields, with the source text that determined them, makes the interpretation verifiable and the conversion deterministic downstream, avoiding silent errors of orders of magnitude.

A is wrong in every non-thousands case. C is an arbitrary heuristic that does not fix the scale. D removes the structured value downstream systems need.

## Scenario: Claude Code for Continuous Integration

### Question 17

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

For PRs that fix a bug, Claude Code generates a regression test. Review shows that 25% of these tests would pass even without the fix: they assert on behavior that was never broken. What is the most effective way to ensure the generated tests actually cover the bug?

- **A.** Require the test to fail on the pre-fix code and pass on the fixed code, feeding the results back to Claude Code if not.
- **B.** Ask Claude Code to generate five tests for every bug fix instead of one, increasing the chance that one covers the bug.
- **C.** Require each generated regression test to contain at least ten assertions, so it checks the behavior more thoroughly.
- **D.** Ask Claude Code to add a comment to each test explaining which bug it covers, so reviewers can judge its relevance.

#### Correct answer to Question 17: A

A real regression test must fail without the fix and pass with it. Verifying this condition objectively, and returning the result to the agent so it can iterate, ensures the test captures the bug.

B multiplies tests without verifying them. C confuses quantity of assertions with relevance. D only shifts the evaluation to humans.

## Scenario: Developer Productivity with Claude

### Question 18

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

The agent connects to two MCP servers, one for the internal wiki and one for the code search service. Both expose a tool simply called `search` with the description "Searches for content." The agent picks the wrong one in about 40% of cases. You own both servers. What is the best fix?

- **A.** Disconnect the wiki server, since code search is more important than documentation for a developer productivity tool.
- **B.** Add a system prompt rule: "Use the first search tool for documentation and the second search tool for source code."
- **C.** Rename the tools by domain (`search_wiki_pages`, `search_source_code`) and describe what each searches and when to use it.
- **D.** Have the agent always call both search tools and merge the results, so it never misses anything in either system.

#### Correct answer to Question 18: C

The model chooses tools based on names and descriptions. Generic, identical names and descriptions make the choice random; distinctive names and descriptions that explain domain and use differentiate them clearly.

A gives up a capability. B relies on an order that is not stable. D doubles the calls and pollutes the context with irrelevant results.

## Scenario: Customer Support Resolution Agent

### Question 19

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

Logs show that when `process_refund` times out, the agent retries, and in some cases the first call had actually succeeded on the backend, resulting in double refunds. Timeouts happen in about 1% of calls due to a slow payment provider. What is the best design change?

- **A.** Instruct the agent never to retry `process_refund` and to escalate every timeout to a human operator for manual handling.
- **B.** Make `process_refund` idempotent (key per order and request) and report "outcome unknown" on timeout, checking before retry.
- **C.** Increase the `process_refund` timeout from 10 to 120 seconds, so that slow calls complete instead of timing out.
- **D.** Add a nightly reconciliation job that detects double refunds and charges the customer back for the duplicated amount.

#### Correct answer to Question 19: B

An action with financial side effects must be safe to retry: an idempotency key prevents duplicates at the backend level, and a clear error ("outcome unknown") guides the agent to check before retrying.

A turns 1% of transient failures into escalations. C reduces the frequency but not the risk. D causes friction for the customer by charging them back afterwards.

## Scenario: Code Generation with Claude Code

### Question 20

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

The team created a `release-notes` skill that reads the git log since the last tag and drafts release notes. During one run, the skill unexpectedly edited `CHANGELOG.md` and created a git tag, which was not intended. The skill should only read history and produce text. What change to the skill's `SKILL.md` frontmatter is most appropriate?

- **A.** Add `context: fork`, so any changes the skill makes stay in the forked context and are discarded when it finishes.
- **B.** Add `argument-hint: "read-only"`, which tells Claude Code that the skill must not modify files or create tags.
- **C.** Add a sentence at the end of the skill body: "Do not modify any files, do not commit, and never create git tags."
- **D.** Add `allowed-tools` limiting the skill to read-only operations (Read, read-only git commands), so it cannot edit or tag.

#### Correct answer to Question 20: D

`allowed-tools` in the skill frontmatter limits the tools it can use while running: restricting it to read operations makes edits and tag creation impossible.

A isolates the context, not filesystem side effects. B is only a hint for arguments, with no permission effect. C is probabilistic.

## Scenario: Multi-Agent Research System

### Question 21

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

Users ask both deep questions ("comprehensive analysis of semiconductor supply chain risks") and simple ones ("When was the CHIPS Act signed?"). The coordinator currently runs the full pipeline — search, document analysis, synthesis, report — for every query, so simple questions take four minutes and cost as much as deep ones. What is the best change?

- **A.** Have the coordinator assess each query's complexity and invoke only the subagents that query actually needs.
- **B.** Build a separate application for simple questions and ask users to choose which one to use before submitting a query.
- **C.** Cache the full reports for every query, so repeated simple questions are answered instantly from the cache.
- **D.** Reduce every subagent's `max_tokens`, so the full pipeline runs faster for all queries, both simple and complex ones.

#### Correct answer to Question 21: A

A coordinator should route dynamically based on the query, invoking only the needed subagents, instead of always running a fixed pipeline. This reduces latency and cost for simple questions without sacrificing deep ones.

B shifts the choice to users. C helps only identical repeated queries. D degrades deep analyses as well.

## Scenario: Structured Data Extraction

### Question 22

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

The model classifies the `governing_law` of contracts. Some contracts mention two jurisdictions in different clauses ("laws of New York" for the main agreement and "laws of England" for an annex), and others contain inconsistent wording. Currently the enum lists only specific jurisdictions, and the model picks one arbitrarily in these cases. What is the best schema design?

- **A.** Add a rule to always choose the first jurisdiction mentioned in the document, so that the choice is at least deterministic.
- **B.** Remove `governing_law` from the schema for contracts longer than 30 pages, where multiple jurisdictions are more likely.
- **C.** Add `"multiple"` and `"unclear"` to the enum plus a field listing the jurisdictions found and their clauses, to flag them.
- **D.** Ask the model to pick the jurisdiction most favorable to the company, since that is what the legal team would prefer.

#### Correct answer to Question 22: C

When documents can be ambiguous or have multiple values, the schema must be able to represent that: `"multiple"`/`"unclear"` with supporting details make these cases explicit and routable to review.

A is deterministic but often wrong. B loses data on many contracts. D asks for a legal judgment, not an extraction.

## Scenario: Claude Code for Continuous Integration

### Question 23

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

The automated reviewer repeatedly flags the use of `any` in files under `src/generated/`, raw SQL in `db/migrations/`, and `console.log` in `scripts/`. All three are intentional, documented team decisions. Developers spend time dismissing the same comments on every PR. What is the best fix?

- **A.** Exclude `src/generated/`, `db/migrations/` and `scripts/` from review entirely, so no comments are posted on those folders.
- **B.** Document these accepted patterns (folders and reasons) in the reviewer's context, e.g. CLAUDE.md, as things not to report.
- **C.** Post the comments anyway but with `minor` severity, so that developers can filter them out in the PR interface.
- **D.** Ask developers to reply "intentional" to each comment, so the bot learns over time to stop flagging these patterns.

#### Correct answer to Question 23: B

False positives on intentional patterns are reduced by giving the reviewer explicit context about accepted conventions (where and why), as examples of what not to report.

A also gives up finding real bugs in those folders. C keeps the noise. D assumes learning between runs that does not happen without added context.

## Scenario: Developer Productivity with Claude

### Question 24

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

An engineer asks the agent to explain how an HTTP request to `/api/orders` is processed in an unfamiliar legacy Java service with 2,000 files. The prototype agent started by reading every file in the `src/` folder in alphabetical order. What exploration strategy should the agent follow?

- **A.** Read the 50 largest files in the service first, since the core request-handling logic tends to be concentrated in big files.
- **B.** Ask the engineer for a diagram of the request flow before starting, since legacy systems cannot be understood from code alone.
- **C.** Read the build configuration and dependency list to infer the request flow from the libraries used, without opening sources.
- **D.** Find the entry point (Grep for the route), then follow the call chain (controller, service, repository) reading only those files.

#### Correct answer to Question 24: D

Efficient exploration starts from the entry point and follows the code incrementally, reading only the relevant files: it builds understanding without filling the context with unrelated code.

A uses a proxy (size) unrelated to the question. B gives up a capability the agent has. C infers without reading the actual code.

## Scenario: Customer Support Resolution Agent

### Question 25

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

Quality review finds conversations in which the agent told the customer "Your refund has been processed" even though `process_refund` had returned an error ("payment provider rejected: card expired"). The developer's loop code catches tool exceptions and returns an empty string as the tool result. What is the root cause and fix?

- **A.** The model is hallucinating; lower the temperature and add "Never claim an action succeeded unless it did" to the prompt.
- **B.** The loop hides the failure; return the error as a tool result with `is_error: true` and its message, so the agent sees it.
- **C.** The refund tool is unreliable; replace it with an escalation for every refund, so that a human confirms each one of them.
- **D.** The customer was not verified; requiring `get_customer` before every refund will prevent this kind of wrong confirmation.

#### Correct answer to Question 25: B

If the loop returns an empty string, the model has no evidence of the failure and assumes success. Errors must be passed back as tool results with `is_error` and an informative message, so the agent can react correctly.

A treats the symptom; the model lacks the information. C removes automation from all refunds. D concerns another problem.

## Scenario: Code Generation with Claude Code

### Question 26

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A team has unit tests colocated with source files across 40 directories (e.g., `src/cart/cart.test.ts`, `src/auth/session.test.ts`). They want Claude Code to follow specific testing conventions (Arrange-Act-Assert structure, factory functions instead of inline fixtures) whenever it edits a test file, wherever it lives. What is the most maintainable configuration?

- **A.** A rule file `.claude/rules/testing.md` with `paths` frontmatter like `**/*.test.ts`, loaded when Claude edits test files.
- **B.** A `CLAUDE.md` file in each of the 40 directories, each containing its own copy of the team's testing conventions.
- **C.** The conventions in the root `CLAUDE.md`, applied to every file Claude Code touches, including non-test source files.
- **D.** A `/test-conventions` slash command that developers must run every time before asking Claude Code to edit tests.

#### Correct answer to Question 26: A

When the scope is a file type spread across many directories, a rule with a `paths` glob is the right tool: one file, loaded only when the matching files are involved.

B multiplies duplication (40 copies). C loads testing rules even when they are not needed. D depends on manual memory.

## Scenario: Multi-Agent Research System

### Question 27

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The web search subagent returns "No relevant sources found" in two very different situations: when the search returned zero results for a niche topic, and when the search API was unreachable due to a network error. The coordinator treats both the same way and writes in the report "no literature exists on this topic." What is the best fix?

- **A.** Have the coordinator always retry the search three times whenever it receives "No relevant sources found" from the subagent.
- **B.** Have the web search subagent never report zero results, broadening the query step by step until something is found.
- **C.** Treat every "No relevant sources found" as an error and stop the research, asking the user to try again later.
- **D.** Have the subagent distinguish a valid empty result (queries tried) from an access failure (error, retryable).

#### Correct answer to Question 27: D

A valid empty result and an access failure are different situations: the first is information ("no sources with these queries"), the second is an error to handle (retry, annotate the gap). Merging them produces false conclusions.

A wastes calls on real empty results. B leads to irrelevant sources. C blocks research even when the result was legitimately empty.

## Scenario: Structured Data Extraction

### Question 28

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

The team built extraction for loan applications, which requires a multi-turn interaction: the model calls `lookup_credit_bureau` and `verify_employer` tools during extraction and uses their results to fill fields. To save money, they want to move all 5,000 daily applications to the Message Batches API. What should you advise?

- **A.** Move everything to the Message Batches API, since it supports the same tool-calling loop as synchronous requests, automatically.
- **B.** Batches do not run tool loops mid-request: keep this workflow synchronous, or fetch the tool data first and extract in one turn.
- **C.** Move to the Message Batches API and instruct the model to estimate bureau and employer data when tools are unavailable.
- **D.** Move to the Message Batches API but submit each application as 10 sequential batches, one per expected tool call.

#### Correct answer to Question 28: B

Each batch request produces one response: there is no mid-request tool execution loop. Workflows that need multiple turns with tools remain synchronous, unless they are restructured to gather the data beforehand and make the extraction single-turn.

A is false. C introduces fabricated data. D would chain batches with up to 24 hours each, impractical.

## Scenario: Claude Code for Continuous Integration

### Question 29

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

The review job currently passes the entire repository (about 1.2 million tokens across all files) to Claude Code for every PR, regardless of size. Costs are high, runs often hit context limits, and comments sometimes refer to code the PR did not touch. What is the best change?

- **A.** Pass the PR diff with the context needed to judge it (changed files, related callers), reading more on demand.
- **B.** Pass only the changed diff lines with no surrounding context, so the review focuses strictly on what actually changed.
- **C.** Split the repository into 12 chunks and run 12 parallel reviews of the full codebase for every PR, merging the comments.
- **D.** Summarize the whole repository once a month and pass that summary instead of the code to the reviewer for every PR.

#### Correct answer to Question 29: A

The review needs the changes plus the context relevant to evaluate them, not the whole repository. Starting from the diff with related context, with the option to explore more when needed, reduces cost and noise.

B lacks the context to judge correctness (e.g., a function's contract). C multiplies costs and still reviews code outside the PR. D provides stale, imprecise context.

## Scenario: Developer Productivity with Claude

### Question 30

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

An engineer uses a personal MCP server that connects to their own notes application. It is useful only to them, it requires their personal credentials, and it should be available in every project they work on, but never committed to any team repository. Where should this server be configured?

- **A.** In each project's `.mcp.json`, adding the file to `.gitignore` in every repository so it is never committed by mistake.
- **B.** In the user-level configuration (e.g. `~/.claude.json`), so it is available in all their projects outside any repository.
- **C.** In the project `CLAUDE.md`, describing the server's endpoint so that Claude Code connects to it automatically.
- **D.** In a shared `.mcp.json` in the team repository, with the personal credentials passed through environment variables.

#### Correct answer to Question 30: B

User-scoped MCP configuration is personal and applies to all of the user's projects, without being shared through version control: ideal for personal tools with personal credentials.

A requires repetition in every project and touches team repositories' `.gitignore`. C does not configure MCP servers. D would impose the server on the whole team.

## Scenario: Customer Support Resolution Agent

### Question 31

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer is trying to update the payment method on their account. Over the conversation the agent has tried three times the same suggestion ("clear your browser cache and retry") and each time the customer reports the same error code. The agent is about to suggest it a fourth time. What should happen?

- **A.** Continue suggesting the same fix, since persistence often resolves intermittent browser and caching issues.
- **B.** Close the conversation, telling the customer to try again in 24 hours, when the issue may have resolved itself.
- **C.** Recognize the lack of progress and escalate to a human with a summary of the error code and the steps already tried.
- **D.** Ask the customer to try a different device, then browser, then network, before considering any escalation.

#### Correct answer to Question 31: C

Lack of progress after repeated attempts is an escalation trigger: continuing the same loop frustrates the customer. Escalation with the error code and the steps tried lets the operator pick up the case efficiently.

A repeats a failed solution. B leaves the problem unresolved. D drags on further attempts without new evidence.

## Scenario: Code Generation with Claude Code

### Question 32

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A developer asks Claude Code to write a function that parses free-form shipping address strings into structured fields. After three rounds of feedback like "it still doesn't handle some cases," the function keeps breaking on different inputs. What is the most effective way to iterate?

- **A.** Ask Claude Code to "make the parser more robust", giving it more freedom to choose a general parsing approach.
- **B.** Switch to plan mode and ask for an architecture document of the parser before writing any more code for it.
- **C.** Provide concrete inputs with expected outputs, turn them into tests, and iterate until they pass.
- **D.** Accept the current version and handle failures manually in production as they are reported by users.

#### Correct answer to Question 32: C

Vague feedback produces vague iterations. Concrete input/output examples, turned into tests, give an objective goal the agent can verify and iterate against autonomously.

A is even vaguer. B adds planning without solving the lack of verifiable criteria. D shifts the problem to production.

## Scenario: Multi-Agent Research System

### Question 33

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

A long research session crashed after 3 hours, during synthesis. Before the crash, document analysis had already been completed. Since then, two of the analyzed source documents have been updated by their publishers. The team wants to continue without redoing everything. What is the best approach?

- **A.** Resume the session and tell the agent which documents changed, so it re-analyzes only those and keeps the rest.
- **B.** Resume the session as is, since the earlier analyses remain in context and are still valid for the final report.
- **C.** Discard the session and restart the research from scratch, since any change in sources invalidates prior results.
- **D.** Resume the session and remove the two changed documents from the report, citing only the unchanged ones.

#### Correct answer to Question 33: A

Resuming a session preserves prior work, but its context may contain stale information. Informing the agent about what changed lets it targetedly redo only the affected analyses.

B uses stale analyses without knowing it. C throws away hours of valid work. D unnecessarily removes relevant sources.

## Scenario: Structured Data Extraction

### Question 34

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

The system extracts the `termination_clause` from 180-page master service agreements, sending the whole document in one request. Accuracy is high when the clause is in the first or last 20 pages, but drops sharply when it is buried in the middle of the document. What is the most effective approach?

- **A.** Repeat the extraction instruction three times in the prompt: before, in the middle of, and after the document.
- **B.** Send only the first and last 20 pages of each contract, since that is where the model performs best on extraction.
- **C.** Process the document by sections (table of contents headings), extract candidate clauses from each, then consolidate.
- **D.** Ask the model only whether a termination clause exists (yes or no), avoiding the need to locate it in the document.

#### Correct answer to Question 34: C

Information in the middle of very long contexts is often neglected ("lost in the middle"). Splitting by sections and consolidating ensures each part gets full attention.

A does not change how attention is distributed over the document. B ignores the clauses actually in the middle. D gives up the required information.

## Scenario: Claude Code for Continuous Integration

### Question 35

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Developers say the bot's comments are "true but useless": examples include "This function could be improved" and "Consider error handling here." They rarely act on them. What is the most effective prompt change?

- **A.** Require each finding to give the exact location, the concrete failure scenario, and a specific suggested fix.
- **B.** Ask the bot to write longer comments with more background on software engineering best practices and their reasons.
- **C.** Ask the bot to tag each comment with the developer who wrote that line, so they feel responsible for acting on it.
- **D.** Reduce the number of comments by half, keeping only the ones that the model considers to be the most important.

#### Correct answer to Question 35: A

Actionable feedback states where, what goes wrong and when, and how to fix it. Requiring this structure turns generic comments into concrete actions.

B lengthens without making it more actionable. C does not change content quality. D reduces quantity but not usefulness.

## Scenario: Developer Productivity with Claude

### Question 36

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

After a long debugging session, the engineer decides to compact the context. In earlier sessions, after automatic compaction, the agent forgot the exact failing test name, the environment variable that reproduced the bug, and the three hypotheses already ruled out. What is the best way to compact this time?

- **A.** Avoid compaction and keep working until the session hits the context limit, then start a new session over.
- **B.** Run `/compact` with instructions on what to keep (failing test name, env variable, ruled-out ideas).
- **C.** Run `/clear` to empty the context and restart the debugging, since compaction always loses important details.
- **D.** Copy the entire conversation into a new message right after compacting, so that nothing at all is lost.

#### Correct answer to Question 36: B

`/compact` accepts instructions about what to keep in the summary: specifying the critical details ensures they survive compaction.

A degrades the session up to the limit. C throws away valid progress. D re-introduces all the content compaction was meant to remove.

## Scenario: Customer Support Resolution Agent

### Question 37

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

The agent's system prompt contains 9,000 tokens of policies, product catalog rules, and tone guidelines, identical for every conversation, followed by the conversation-specific messages. The service handles 50,000 conversations per day and the team wants to reduce latency and input cost without changing behavior. What is the most effective change?

- **A.** Shorten the system prompt to 2,000 tokens by removing most of the policy content, keeping only the most frequently used rules.
- **B.** Move the policies into a tool the agent calls at the start of every conversation, so they are not in the system prompt.
- **C.** Use prompt caching on the static system prompt, keeping it as an unchanging prefix placed before the conversation content.
- **D.** Send the system prompt only on the first turn of each conversation and omit it on subsequent turns.

#### Correct answer to Question 37: C

Prompt caching reuses an identical prefix across requests, reducing cost and latency for the cached part. It requires the static content to come first and stay unchanged.

A removes policies the agent needs. B adds a call and still puts the same tokens in context. D removes the instructions from later turns, changing behavior.

## Scenario: Code Generation with Claude Code

### Question 38

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A developer has spent an hour with Claude Code fixing a memory leak in the image processing module. They now want to start an unrelated task: updating the documentation of the authentication API. They notice the new answers are slower and sometimes reference the image module. What should they do?

- **A.** Continue in the same session but start each message with "Forget the previous task."
- **B.** Use `/compact` so the image processing context is summarized but kept, in case it becomes relevant to the authentication docs.
- **C.** Enable plan mode so Claude Code focuses only on planning the documentation update.
- **D.** Use `/clear` (or start a new session) to begin the unrelated task with a clean context.

#### Correct answer to Question 38: D

For an unrelated task, the earlier context is only noise and cost: `/clear` or a new session gives a clean context.

A cannot remove the content from context. B keeps irrelevant information. C does not change the accumulated context.

## Scenario: Multi-Agent Research System

### Question 39

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The coordinator's prompt to the web search subagent is a rigid procedure: "Step 1: search 'X market size'. Step 2: search 'X growth rate'. Step 3: open the first 3 results of each..." When a topic does not fit these queries (e.g., a non-market policy topic), the subagent follows the steps anyway and returns irrelevant results. What is the better way to write delegation prompts?

- **A.** Add more fixed steps to cover non-market topics, so the procedure handles every type of research topic correctly.
- **B.** Describe the research goal, questions to answer, and quality criteria, leaving the subagent free to choose its queries.
- **C.** Have the coordinator perform the searches itself and pass the results to the subagent only for summarization.
- **D.** Give the subagent a single keyword only, so it is never constrained by instructions that do not fit the topic.

#### Correct answer to Question 39: B

Delegating with goals, questions, and quality criteria (rather than rigid procedures) lets the subagent adapt its strategy to the topic while still knowing what counts as a good result.

A makes the procedure even more rigid and long. C takes away specialization and burdens the coordinator. D provides too little context to do good research.

## Scenario: Structured Data Extraction

### Question 40

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

After six months in production with stratified accuracy verified at launch, the team stopped all human review. Recently, a supplier changed its invoice template and, unnoticed for weeks, `due_date` was being extracted from the "issue date" field. What process would have caught this?

- **A.** Ongoing review of a random sample of production extractions, stratified by source, tracking accuracy for drift.
- **B.** Running the original launch test set again every month, since it represents the production distribution of invoices.
- **C.** Having the model output a confidence score and alerting when the average confidence drops below a set threshold.
- **D.** Asking all suppliers to notify the team in advance whenever they change the template of their invoices.

#### Correct answer to Question 40: A

Production distributions change over time. Continuous sampling of real extractions, stratified by source, detects drift that a fixed test set cannot see.

B tests old documents, not new templates. C: the model may be confidently wrong. D depends on third parties.

## Scenario: Claude Code for Continuous Integration

### Question 41

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

The review bot reports "Possible null dereference: `getUser()` may return null" on a call site, but in reality `getUser()` is declared to throw when the user is not found and never returns null. About 20% of the bot's findings are claims of this kind about code outside the diff, made without checking it. What prompt and workflow change best reduces these false positives?

- **A.** Instruct the bot to report only problems inside the modified lines, never mentioning functions defined elsewhere.
- **B.** Lower the bot's temperature, so that its claims about functions outside the diff become more conservative.
- **C.** Ask developers to reply to each false positive, so the bot corrects itself on the same code in the next run.
- **D.** Require it to verify claims about code outside the diff by reading definitions, citing file and line.

#### Correct answer to Question 41: D

Requiring verification and citation of evidence turns assumptions into checked claims: if the definition shows `getUser()` throws, the finding is not reported.

A misses real bugs from interactions with other code. B does not add verification. C relies on learning between runs that does not happen.

## Scenario: Developer Productivity with Claude

### Question 42

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

An MCP tool `fetch_internal_doc` returns full HTML pages from the internal documentation portal, including navigation menus, scripts, and footers — often 40,000 tokens per page, of which the useful text is about 3,000 tokens. Engineers notice the agent fills its context after reading a few pages. What is the best fix?

- **A.** Instruct the agent to read only the first half of each page returned by the tool, which contains most of the text.
- **B.** Have the tool return only the main content (clean text or Markdown with headings), dropping navigation.
- **C.** Have the agent save each page to disk with Write and read it back later with Read when it needs the content.
- **D.** Restrict the agent to reading a single internal documentation page per session, to keep the context under control.

#### Correct answer to Question 42: B

Tool output should be processed before entering the context: returning only the main content in a clean format reduces tokens by an order of magnitude without losing information.

A arbitrarily cuts the useful content. C moves the problem without solving it, reading the same noise later. D limits usefulness.

## Scenario: Customer Support Resolution Agent

### Question 43

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

Logs show the agent often calls `lookup_order` with an email address as the parameter, getting a "not found" error, and only then calls `get_customer`. The current descriptions are: `get_customer`: "Gets customer data"; `lookup_order`: "Looks up order information." What is the best fix?

- **A.** Make `lookup_order` also accept emails by calling `get_customer` internally and returning all of the customer's orders.
- **B.** Expand descriptions with accepted inputs (order ID format vs. email/phone), outputs, and when to use which one.
- **C.** Add a system prompt rule: "Always call get_customer first in every conversation, before any other tool."
- **D.** Rename `lookup_order` to `lookup_order_by_id_not_email`, so that the input constraint is obvious from the name.

#### Correct answer to Question 43: B

Descriptions that specify inputs (format), outputs, and when to use each tool give the model the information it lacks to choose and invoke correctly.

A hides the confusion by enlarging the tool's scope. C imposes an unnecessary call even when the customer gives an order number. D is an awkward name that still does not describe outputs and use cases.

## Scenario: Code Generation with Claude Code

### Question 44

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A developer created a personal skill `explain-like-senior` that explains code in a particular teaching style they like. Teammates are not interested, and it should not appear in the team's repository, but the developer wants to use it in all their projects. Where should the skill be placed?

- **A.** In `.claude/skills/explain-like-senior/SKILL.md` in each repository, adding the folder to `.gitignore`.
- **B.** In the project `CLAUDE.md` of each repository, as a section describing the teaching style.
- **C.** In `~/.claude/skills/explain-like-senior/SKILL.md`, the user-level skills directory available in every project.
- **D.** In `.claude/commands/explain-like-senior.md` in the team repository, marked with "personal" in its description.

#### Correct answer to Question 44: C

User-level skills (`~/.claude/skills/`) are available in all of the user's projects and are not part of any repository: right for personal preferences.

A requires repetition and `.gitignore` changes in every repository. B affects the whole team and loads in every session. D shares it with the team.

## Scenario: Multi-Agent Research System

### Question 45

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The coordinator has an iterative refinement loop: after each round it evaluates coverage and delegates follow-up searches. On some broad topics, the loop continues for over 30 rounds, each finding marginally new sources, and runs exceed the budget by 8×. What is the best change?

- **A.** Remove the refinement loop and perform a single round of searches for every topic, accepting lower coverage.
- **B.** Define stopping criteria (coverage goals, max rounds, budget) and have the coordinator stop and report remaining gaps.
- **C.** Let the loop run until the coordinator's context is full, since a full context means the research is thorough.
- **D.** Have the synthesis subagent decide when to stop the loop, since it knows best what material it still needs.

#### Correct answer to Question 45: B

Iterative loops need explicit stopping conditions (coverage goals, round limit, budget) and transparency about remaining gaps: this balances quality and cost.

A gives up refinement where it is useful. C uses a harmful criterion. D moves the decision without defining criteria.

## Scenario: Structured Data Extraction

### Question 46

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

The team wants to route extractions to human review based on the model's self-reported field-level confidence (0–1). In a pilot, many errors had confidence of 0.9 or higher, and many correct values had confidence below 0.6. Management still wants to use confidence to reduce review volume. What is the right approach?

- **A.** Use a fixed threshold of 0.95, since a very high threshold compensates for the model's tendency to overconfidence.
- **B.** Abandon any confidence signal and keep 100% human review permanently, since self-reported scores are unusable.
- **C.** Ask the model to be "more honest" about its confidence, adding to the prompt that overconfidence will be penalized.
- **D.** Calibrate the threshold on a labeled set, measuring real error rates per confidence band and field, before relying on it.

#### Correct answer to Question 46: D

Self-reported confidence is not reliable on its own: it must be calibrated against labeled data, checking the real error rate for each band and segment, before using it for routing.

A is an arbitrary threshold not validated against real data. B gives up savings without trying calibration. C does not produce calibrated numbers.

## Scenario: Claude Code for Continuous Integration

### Question 47

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

The team wants to improve the automated reviewer over time. Currently they have no data on which comments developers find useful. Some categories (e.g., "performance") feel noisy, while others (e.g., "security") feel valuable, but this is anecdotal. What is the best process?

- **A.** Track developer responses per category, measure false positive rates, and refine noisy categories.
- **B.** Disable the "performance" category immediately, since the team's shared impression is that it is the noisiest one.
- **C.** Increase the number of categories, so that the useful findings are more likely to appear among the comments.
- **D.** Survey developers once a year about the bot's general usefulness and adjust the review prompt accordingly.

#### Correct answer to Question 47: A

Improving with data means measuring outcomes per category: you find out where precision is low and act in a targeted way (refining criteria, adding examples, or disabling the category).

B acts on impressions without data. C increases noise. D is too infrequent and generic to guide specific changes.

## Scenario: Developer Productivity with Claude

### Question 48

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

The platform team wants to stop engineers' agents from running `git push --force` and from reading files in `secrets/`, across all projects in the company, without relying on each engineer's prompt or individual configuration. Engineers should not be able to override this. What is the most appropriate mechanism?

- **A.** A line in each repository's `CLAUDE.md` saying "Never force-push and never read anything under secrets/."
- **B.** Deny rules in each engineer's personal `~/.claude/settings.json`, set up by the platform team during onboarding.
- **C.** Deny rules for force-push and `secrets/**` in managed organization settings that override all others.
- **D.** A weekly audit of git history to identify force pushes and revoke push access from the engineers responsible.

#### Correct answer to Question 48: C

Permission deny rules in managed (organization-level) settings take precedence over user and project settings and cannot be overridden by individuals: they enforce the policy deterministically and uniformly.

A is a probabilistic instruction. B can be modified by the engineer. D detects afterwards.

## Scenario: Customer Support Resolution Agent

### Question 49

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer claims a package was never delivered and asks for a refund of $89. `lookup_order` shows the carrier marked it "delivered" with a photo at the front door. The agent's current prompt says nothing about this case, and its responses vary: sometimes it refunds immediately, sometimes it tells the customer the package was delivered and closes the conversation. What is the best improvement?

- **A.** Instruct the agent to always trust carrier data and refuse refunds whenever the order is marked as delivered.
- **B.** Instruct the agent to always refund delivery disputes under $100, since investigating costs more than the refund.
- **C.** Have the agent ask the customer for a photo proving the package was not delivered before taking any action.
- **D.** Define the delivery-dispute procedure in the prompt (share evidence, policy steps, refund/escalation conditions) with examples.

#### Correct answer to Question 49: D

Inconsistent behavior comes from the lack of explicit guidance for a recurring case. Defining the procedure (steps, conditions, escalation) with examples makes responses consistent and policy-compliant.

A and B are rigid policies invented by the developer, not derived from company policy. C asks for impossible proof (one cannot photograph something absent).

## Scenario: Code Generation with Claude Code

### Question 50

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

The team keeps two kinds of guidance for Claude Code: (1) conventions that apply to every task (language, formatting, branch naming), and (2) a detailed 15-step procedure for preparing a production hotfix, used about twice a month. Both are in the project `CLAUDE.md`, which has become long. What is the best organization?

- **A.** Keep everything in `CLAUDE.md`, since content there is always available whenever Claude Code needs it.
- **B.** Keep universal conventions in `CLAUDE.md` and move the hotfix procedure to a project skill loaded on demand.
- **C.** Move both kinds of guidance into skills, so `CLAUDE.md` stays empty and nothing is loaded unless invoked.
- **D.** Move the hotfix procedure to a wiki page outside the repository and remove it from Claude Code's configuration.

#### Correct answer to Question 50: B

`CLAUDE.md` is for guidance always relevant; specific, occasional procedures fit skills, which load on demand and keep the base context lean.

A loads the procedure in every session unnecessarily. C makes universal conventions optional. D takes the procedure away from Claude Code.

## Scenario: Multi-Agent Research System

### Question 51

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The final report for "trends in electric vehicle battery costs" mixes 2016, 2019, and 2024 figures without dates, making it look as if costs fluctuated wildly. Reviewers find that the subagents' findings never included publication or data-collection dates. What is the best fix?

- **A.** Add source date and data period to findings, and have the report present every figure with its date.
- **B.** Instruct the web search subagent to use only sources published in the last 12 months, so all figures are current.
- **C.** Have the report generator remove all numeric figures and describe the cost trends only in qualitative terms.
- **D.** Have the synthesis subagent average all the figures for each metric, smoothing out the apparent fluctuations.

#### Correct answer to Question 51: A

Temporal metadata is part of provenance: without dates, values from different periods look contradictory. Carrying dates through the whole pipeline allows a correct interpretation (a trend over time).

B loses the historical data needed to describe a trend. C removes key information. D averages values from different periods, producing a meaningless number.

## Scenario: Structured Data Extraction

### Question 52

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

A monthly report job extracts data from 120,000 documents with the Message Batches API. Reports must be delivered to the client by 9:00 on the first day of each month. Documents are available from 18:00 on the last day of the previous month. The team currently submits the batch at 6:00 on the first day of the month, and in two of the last six months results arrived late. What is the best change?

- **A.** Switch to synchronous calls at 6:00, since they are always faster than batch processing for the same documents.
- **B.** Submit at 18:00 the day before, leaving margin in the 24-hour window, with a synchronous fallback for stragglers.
- **C.** Contact support to request a guaranteed one-hour processing time for this specific batch every month.
- **D.** Keep submitting at 6:00 but split the job into 120 smaller batches, which are guaranteed to finish within three hours.

#### Correct answer to Question 52: B

The Message Batches API does not guarantee latency below 24 hours: you must plan the submission with enough margin and have a fallback for incomplete requests.

A: running 120,000 synchronous calls in three hours runs into rate limits and costs double. C: such guarantees are not part of the service. D: smaller batches do not get guaranteed completion times.

## Scenario: Claude Code for Continuous Integration

### Question 53

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

The CI reviewer runs in ephemeral runners, and each job starts with no memory. Reviewers want each new run on a PR to know the outcome of previous runs (which findings were fixed, which were rejected by developers as false positives, and why). What is the most appropriate design?

- **A.** Use `--resume` with the previous run's session ID, since session history is automatically available on any runner.
- **B.** Run the reviewer on a persistent dedicated server, so it keeps its conversation history between CI jobs.
- **C.** Store a structured record of past findings and their status (PR comment or CI artifact) and include it in the next prompt.
- **D.** Ask developers to restate in the PR description which findings to ignore, and keep that list up to date themselves.

#### Correct answer to Question 53: C

In stateless environments, state between runs must be persisted explicitly in a structured form and passed back as context. That is more robust and transparent than depending on session history.

A: sessions are local to the machine they were created on and do not exist on new ephemeral runners. B changes the infrastructure and accumulates growing, noisy history. D relies on manual updates.

## Scenario: Developer Productivity with Claude

### Question 54

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

Engineers ask the agent to generate boilerplate for new microservices: Dockerfile, CI configuration, health check endpoint, logging setup, and folder structure. The generated services work but differ from the 30 existing services (different logging library, health check path `/health` instead of `/healthz`, different CI stages). What is the most effective way to make generated boilerplate consistent?

- **A.** Point the agent to one or two reference services, asking it to replicate their structure and libraries, adapting the rest.
- **B.** Let engineers manually fix each generated service after creation, since every service ends up slightly different anyway.
- **C.** Ask the agent to choose the most modern libraries and conventions available, since newer choices suit new services.
- **D.** Have the agent read all 30 existing services every time it generates a new one, to compute the most common conventions.

#### Correct answer to Question 54: A

Concrete reference examples are the most effective way to communicate conventions: one or two representative services give the model a precise template to replicate.

B shifts the work and keeps inconsistency. C deliberately diverges from the existing standard. D fills the context with 30 services when one or two references suffice.

## Scenario: Customer Support Resolution Agent

### Question 55

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

Product leadership asks to deploy a new model version for the support agent. The current version reaches 82% first-contact resolution with a 1.5% wrong-refund rate. In ad hoc tests the new version "feels better." What is the right way to decide whether to switch?

- **A.** Switch immediately, since newer model versions are always better than older ones at every task they are given.
- **B.** Run both versions on a stratified set of real conversations, comparing resolution, wrong refunds and escalations.
- **C.** Ask the new model to self-evaluate a sample of its own conversations and switch if it rates itself above 8 out of 10.
- **D.** Switch on Monday, and switch back if the number of customer complaints increases noticeably during the week.

#### Correct answer to Question 55: B

Decisions about models should be based on systematic evaluation on representative, stratified data, measuring the metrics that matter (including risky errors such as wrong refunds), before production rollout.

A assumes an improvement without data. C relies on self-evaluation. D uses customers as a test and detects problems late and only through complaints.

## Scenario: Code Generation with Claude Code

### Question 56

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A team wants a `/review-pr` slash command that is invoked with a PR number, e.g. `/review-pr 1423`. Inside the command, the PR number must be used in a `gh pr diff` command and in the title of the generated summary. How should the command file reference the argument?

- **A.** Use the `$ARGUMENTS` placeholder (or positional ones such as `$1`) in the command file wherever the number is needed.
- **B.** Ask the user, in the first line of the command, to type the PR number again in their next message to Claude Code.
- **C.** Read the PR number from a `PR_NUMBER` environment variable that the developer exports before starting Claude Code.
- **D.** Hard-code a `PR_NUMBER_HERE` placeholder and ask Claude Code to replace it by guessing from the current branch name.

#### Correct answer to Question 56: A

Custom slash commands support `$ARGUMENTS` (and positional arguments) to insert what the user types after the command name.

B adds an unnecessary round trip. C requires manual setup outside the command. D relies on guessing.

## Scenario: Multi-Agent Research System

### Question 57

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

A reviewer finds that the report states "Remote work reduced commercial rents by 23% in 2023," citing a source that, when checked, says "commercial rents in some downtown areas fell by up to 23%." The synthesis subagent generalized the claim. What is the most effective safeguard?

- **A.** Remove all percentages from the reports, to avoid misrepresenting numeric claims taken from the cited sources.
- **B.** Have the report generator add a disclaimer at the end stating that all the figures may be approximate.
- **C.** Check each draft claim against the stored excerpt of its source, flagging mismatched scope.
- **D.** Instruct the web search subagent to collect only sources that report exact, unqualified figures.

#### Correct answer to Question 57: C

Comparing each claim with the stored excerpt of its source catches generalizations and lost qualifiers ("some," "up to"): it is a fidelity check made possible by preserved provenance.

A removes valuable information. B is a generic disclaimer that does not fix errors. D discards sources that use proper qualifiers.

## Scenario: Structured Data Extraction

### Question 58

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

The schema defines `effective_date` as a string with the description "The effective date." Outputs contain "March 1st, 2024," "01/03/2024," "2024-03-01," and "upon signature." The downstream system expects ISO 8601 dates and fails on everything else. What is the best fix?

- **A.** Add downstream parsing logic that tries 30 different date formats in sequence until one of them succeeds.
- **B.** Require ISO 8601 with a pattern in the schema, make it nullable with a field for non-dates, and add examples.
- **C.** Ask the model to return the date exactly as written in the document, so no interpretation errors are introduced.
- **D.** Reject every document whose effective date is not already written in ISO 8601 format in the source text.

#### Correct answer to Question 58: B

A precise schema (format, pattern, nullable) and a field for non-date cases, plus examples for ambiguous formats like `01/03/2024`, produce normalized, valid output for downstream use.

A cannot resolve ambiguities like day/month and fails on "upon signature." C passes the problem downstream. D discards almost all documents.

## Scenario: Claude Code for Continuous Integration

### Question 59

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

When running locally, Claude Code follows the team's conventions defined in the project `CLAUDE.md` (e.g., error-handling patterns and forbidden libraries). A developer suggests copying all these conventions into the CI job's prompt, because "CI doesn't use CLAUDE.md." What is correct?

- **A.** The developer is right: `claude -p` ignores CLAUDE.md, so every convention must be duplicated in the CI prompt.
- **B.** CLAUDE.md is read in CI only if the job sets the `--memory` flag, which must be added to the CI command.
- **C.** CI should use a separate `CLAUDE.ci.md` file, which Claude Code automatically prefers in non-interactive mode.
- **D.** Claude Code reads the project `CLAUDE.md` in `-p` mode too; duplicating it would create two sources to sync.

#### Correct answer to Question 59: D

The project `CLAUDE.md` is loaded by Claude Code whenever it runs in the repository, including non-interactive mode (`-p`) in CI. The CI prompt can focus on the task-specific instructions.

A rests on a false premise and creates duplication. B and C describe mechanisms that do not exist.

## Scenario: Developer Productivity with Claude

### Question 60

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

An engineer asks the agent: "Is it safe to delete the `LegacyTaxCalculator` class?" The agent runs Grep for `LegacyTaxCalculator`, finds no references outside its own file, and answers "Yes, it's unused." After deletion, production breaks: the class was loaded by name from a YAML configuration file through reflection, as `"com.acme.tax.LegacyTax" + "Calculator"`. What is the best change to the agent's behavior for this kind of question?

- **A.** Never answer questions about deleting code, and always tell the engineer to check the usages manually instead.
- **B.** Run Grep again with a case-insensitive flag, since references to the class were probably missed due to letter case.
- **C.** Always answer "not safe" to delete questions, since false negatives are much worse than false positives here.
- **D.** State the method's limits, check dynamic usage (config files, reflection, string-built names), and give a calibrated answer.

#### Correct answer to Question 60: D

A single static search cannot exclude dynamic usage. The agent should look for typical indirect references, declare the method's limits, and calibrate its certainty, suggesting verifications (e.g., tests or runtime logs).

A gives up being useful. B does not catch names built from concatenated strings. C is a useless answer that gives the engineer no information.
