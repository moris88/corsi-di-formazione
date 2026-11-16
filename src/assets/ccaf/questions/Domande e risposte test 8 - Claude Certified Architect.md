---
title: "Practice Test 8 – Claude Certified Architect"
duration_minutes: 120
difficulty: difficile
---

# Questions and Answers: Practice Test 8 – Claude Certified Architect

## Scenario: Customer Support Resolution Agent

### Question 1

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer asks the agent to delete their account and all personal data. No tool supports deletion, but the agent replies "Done, your data has been deleted." Deletion requests have a legal deadline of 30 days and must go through a workflow that verifies identity, and the agent can open tickets in that workflow. What is the best fix?

- **A.** Handle out-of-scope requests honestly: explain the process, route it to the data-deletion workflow, never claim the action.
- **B.** Add a `request_data_deletion` tool that deletes the account immediately once the customer confirms twice in the chat.
- **C.** Add an output check that blocks replies containing "deleted" unless a tool call in the same turn succeeded.
- **D.** Handle the request honestly and route it to the deletion workflow by opening a ticket, telling the customer the data has been deleted.

#### Correct answer to Question 1: A

No tool can delete data, and deletion has a legal deadline and identity checks: the agent must explain the process honestly and open a ticket in the workflow, never claiming the action.

Opening the ticket is right, but saying the data has been deleted still claims an action that has not happened. Deleting on chat confirmation skips identity checks. A word filter does not handle the request.

## Scenario: Code Generation with Claude Code

### Question 2

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A developer starts a session to fix a bug and already knows the two relevant files: `src/billing/invoice.ts` and its test. The repository has 8,000 files, and the developer wants Claude Code to work on those two files immediately, without spending turns searching and without adding them to the instructions loaded in every future session. What is the most direct way?

- **A.** Ask Claude to run `cat` on both files with Bash at the start, so their content appears in the conversation.
- **B.** Reference them directly in the prompt (e.g. with `@path/to/file`) so their content is included in context.
- **C.** Reference both files with `@path` in the project CLAUDE.md, so their content is included in context immediately.
- **D.** Add both paths to `additionalDirectories` in settings, so that they are loaded into context when the session starts.

#### Correct answer to Question 2: B

The developer already knows the two files: `@` references put them in context immediately, without searching and without changing the instructions loaded in future sessions.

An `@` reference in CLAUDE.md loads the files in every future session too. Running `cat` is indirect. Additional directories grant access but load nothing.

## Scenario: Multi-Agent Research System

### Question 3

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The coordinator passes thousands of tokens of its own internal deliberation into each subagent's prompt. Subagents sometimes pursue ideas the coordinator had already rejected, and subagent costs are 30% over budget. Each subagent still needs the task, scope, constraints and the facts found so far. What is the best fix?

- **A.** Pass subagents the conclusions they need (task, scope, constraints, facts), not deliberation, and state what is out of scope.
- **B.** Pass subagents the task, scope and constraints, plus the coordinator's full list of considered and rejected ideas.
- **C.** Send subagents only the task and the original user question, leaving them to work out the scope on their own.
- **D.** Let subagents read the coordinator's full logs on demand, so they can look up its reasoning only when they need it.

#### Correct answer to Question 3: A

Subagents need the task, scope, constraints and facts, not the deliberation: passing conclusions and stating what is out of scope stops them from reviving rejected ideas and cuts cost.

Passing every rejected idea brings back the deliberation and its cost; stating what is out of scope is enough. A summary of the reasoning has the same problem. Only the task and question leave subagents without constraints.

## Scenario: Structured Data Extraction

### Question 4

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Invoice amounts appear both as "1.234,56" (European style) and "1,234.56" (US style), and the model sometimes outputs 1.23456 or 123456. Invoices come from 22 countries, some suppliers use one style even when billing from another country, and amounts feed automatic payments. What is the most reliable approach?

- **A.** Extract the amount as written plus locale/currency context, parse it with locale-aware code, and check line-item sums.
- **B.** Ask the model to pay close attention to thousands and decimal separators and to double-check every amount it outputs.
- **C.** Extract the amount as written plus the invoice's country, and parse it in code using that country's separator convention.
- **D.** Add few-shot examples of both formats showing the correct numeric value, and keep the output field as a number.

#### Correct answer to Question 4: A

Some suppliers use a style that does not match their country, and amounts feed payments: extract the string as written, parse it with locale-aware code, and check it against line-item sums.

Country is not a reliable signal, since some suppliers use another style; parsing must use the locale context of the document and be checked against line-item sums. Asking for attention or examples leaves parsing to the model.

## Scenario: Claude Code for Continuous Integration

### Question 5

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

The CI review runs on every push to draft PRs, which receive 15 pushes on average before they are ready, so review costs are four times the budget. Developers say feedback on drafts is useless, but they sometimes want an early review on demand. What is the best change?

- **A.** Keep reviewing every push, but switch draft PRs to a smaller model to reduce the cost of each draft review.
- **B.** Debounce the trigger so the review runs at most once per hour on each draft PR, whatever the push frequency.
- **C.** Trigger the review when a PR is marked ready for review (or on explicit request), not on every draft push.
- **D.** Trigger the review only when a PR is marked ready for review, with no way to request one on a draft.

#### Correct answer to Question 5: C

Drafts get about 15 pushes and feedback on them is useless, but early reviews are sometimes wanted: trigger on ready-for-review or on explicit request.

Developers sometimes want an early review on demand; removing that option loses it. A smaller model or a debounce still review drafts.

## Scenario: Developer Productivity with Claude

### Question 6

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

An engineer asks: "Why does this function retry exactly 7 times?" The code has no comments, the function is 6 years old, and the repository links every commit to a ticket in the issue tracker, which the agent can query through an MCP tool. The engineer will decide whether to change the value based on the answer. What is the best approach for the agent?

- **A.** Explain the usual reasons for choosing a retry count (backoff budget, SLA) and say which one 7 most likely reflects.
- **B.** Search the codebase for other retry counts and report whether 7 matches the project's usual convention.
- **C.** Check history (git blame/log, linked PRs or issues) for when and why it was added; separate documented from inferred.
- **D.** Check git blame and the linked ticket for when the value was added, and present the most plausible reason as the original intent.

#### Correct answer to Question 6: C

Commits link to tickets the agent can query: git history and the linked issue can show why 7 was chosen, and the answer must separate what is documented from what is inferred.

The history is the right source, but presenting a plausible reason as intent hides what is documented and what is inferred. General reasons for retry counts are inference. Comparing with other values shows consistency, not intent.

## Scenario: Customer Support Resolution Agent

### Question 7

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer sends a photo of a damaged product. The agent replies that it cannot view images and asks for a description, although the model and your deployment support image input. In the logs, the harness stores uploads in object storage and adds the file name and URL to the user message. Damage claims require photo evidence. What is the likely fix?

- **A.** Pass images to the model as image content blocks (not file names or links) and explain their use.
- **B.** Pass images to the model as image content blocks, after resizing them to small thumbnails to reduce token cost.
- **C.** Upload the photo to storage and include its URL in the user message, so the model can open and inspect it.
- **D.** Convert the image to base64 text and insert it inside the user message, so the model receives the raw image data.

#### Correct answer to Question 7: A

The harness sends file names and URLs, which the model cannot open: passing the photo as an image content block lets the model see the damage that the claim requires.

Thumbnails can hide the damage that the claim must prove; pass the image at a useful resolution. A URL or base64 in the text is not an image block. A description service loses detail.

## Scenario: Code Generation with Claude Code

### Question 8

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A new 300k-line repository has no CLAUDE.md. The team wants useful project memory this week, covering build and test commands, conventions and architecture, without spending days writing it, and wants it reviewed like code. What is a good starting point?

- **A.** Write a CLAUDE.md that documents every module in detail, so Claude never needs to explore the code to understand it.
- **B.** Start from another team's well-maintained CLAUDE.md, removing the sections about tools your project does not use.
- **C.** Run `/init` to generate a CLAUDE.md from the codebase, then review and curate it (commands, conventions, architecture).
- **D.** Run `/init` to generate a CLAUDE.md from the codebase and commit it as generated, without reviewing it.

#### Correct answer to Question 8: C

`/init` produces a draft from the codebase in minutes, covering commands, conventions and architecture, which the team then reviews and curates like code.

An unreviewed generated file can contain wrong or noisy guidance; the team should curate it. Documenting every module bloats the file. Another team's file brings its conventions.

## Scenario: Multi-Agent Research System

### Question 9

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

In the Agent SDK, your coordinator never spawns subagents, even though four subagent definitions exist with clear descriptions and the system prompt tells it to delegate. Its configuration lists `allowedTools: ["Read", "WebSearch"]`, and logs show it doing all the searches itself. What is a likely cause?

- **A.** The coordinator lacks the delegation tool (e.g. Task is not in its allowed tools), so it cannot spawn.
- **B.** The coordinator lacks the Task tool in its allowed tools, and the subagent definitions also need an explicit `model` field.
- **C.** Subagents run only when the coordinator's permission mode is `bypassPermissions`, and it is not set.
- **D.** The coordinator's prompt never says "use subagents", and without that instruction the SDK does not expose them.

#### Correct answer to Question 9: A

The configuration lists only Read and WebSearch: without the Task tool the coordinator cannot spawn subagents, whatever its prompt says.

Task missing from the allowed tools is the cause; the `model` field is optional. Delegation does not depend on bypassing permissions or on special phrases.

## Scenario: Structured Data Extraction

### Question 10

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Documents of unknown type arrive in one queue and can be any of 6 types; the extraction always uses the invoice schema and produces nonsense for the other five. About 4% of documents match none of the six types, and putting them in the wrong system causes accounting errors. What is the best design?

- **A.** Use one huge schema that combines all fields of the 6 types as optional, so any document can be extracted in one pass.
- **B.** Add a classification step (with `unknown/other`) that routes each document to its matching schema, unknowns to review.
- **C.** Add a classification step that routes each document to one of the six schemas, choosing the closest type when unsure.
- **D.** Have the model classify and extract in one call, picking one of the six schemas itself and reporting which it used.

#### Correct answer to Question 10: B

Some documents match none of the six types and misrouting causes accounting errors: classify first, with an `unknown` route to review, then extract with the matching schema.

Choosing the closest type forces documents of no known type into a schema, which causes accounting errors; an `unknown` route to review is needed. One huge optional schema weakens validation.

## Scenario: Claude Code for Continuous Integration

### Question 11

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Claude-generated PR descriptions sometimes describe changes that are not in the PR, and reviewers have approved two PRs based on wrong descriptions. Commit messages in the team are often vague ("fix", "wip"), and the author of each PR must stay responsible for its description. What is the best approach?

- **A.** Generate descriptions from the PR's commit messages only, since each commit already summarizes its own change.
- **B.** Generate descriptions from the actual diff and commit messages, ask for factual summaries only, and have the author review them.
- **C.** Have a second Claude call check each description for invented content before it is posted on the PR.
- **D.** Generate descriptions from the actual diff and commit messages, asking for factual summaries, and post them without author review.

#### Correct answer to Question 11: B

Commit messages are often vague, so the diff must be the source: factual summaries generated from the diff and commits, reviewed by the author, who stays responsible.

The author must stay responsible, so the description needs their review before posting. Commit messages alone are vague. A second call without the diff has nothing to check.

## Scenario: Developer Productivity with Claude

### Question 12

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

An engineer asks the agent to upgrade a major dependency from v4 to v5 before a security deadline next week. The agent bumps the version and starts fixing compile errors one by one. The library publishes a migration guide listing breaking changes, some of which change runtime behavior without compile errors. What should it have done first?

- **A.** Bump the version, run the full test suite, and fix the failures in order of how many tests each one breaks.
- **B.** Read the migration guide for breaking changes, search the affected APIs, then upgrade and verify with tests.
- **C.** Rely on its training knowledge of the new version's API, rewriting the call sites before bumping the version.
- **D.** Read the migration guide, then bump the version and fix the compile errors, relying on the compiler for the rest.

#### Correct answer to Question 12: B

Some breaking changes alter runtime behavior without compile errors: reading the migration guide first reveals them and their replacements before upgrading and testing.

Some breaking changes alter runtime behavior without compile errors, so the affected APIs must be searched and tests run. Fixing failures as they appear misses silent changes. Training knowledge may not match v5.

## Scenario: Customer Support Resolution Agent

### Question 13

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

When customers complain, the agent offers a 20% coupon, although no coupon policy exists; finance found $18,000 of unplanned coupons last month. The business does want to offer small store credits in specific cases, up to $25, and wants that limit enforced. What is the best fix?

- **A.** Add a system prompt rule forbidding coupons unless the customer explicitly asks for some form of compensation.
- **B.** Log every coupon offered and have finance review them weekly, revoking the ones that exceed a set budget.
- **C.** Define allowed remedies in policy and tools (e.g. an `issue_credit` tool with limits) and offer only those ones.
- **D.** Define allowed remedies in policy and add an `issue_credit` tool, leaving the $25 limit to the system prompt.

#### Correct answer to Question 13: C

Small credits up to $25 are wanted, invented coupons are not: an `issue_credit` tool with an enforced limit makes the allowed remedy explicit.

The limit must be enforced, so it belongs in the tool, not in a prompt. A conditional prompt rule still lets the agent invent compensation. Weekly reviews act too late.

## Scenario: Code Generation with Claude Code

### Question 14

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

You want a code-review subagent in Claude Code that reads the code but never modifies files, even when the code under review contains comments asking it to "fix this". It must be shared with the team, and Grep and Glob must remain available. How should you define it?

- **A.** State clearly in the subagent's prompt that it must never modify, create, or delete files, only read and comment.
- **B.** Run reviews through a `/review` slash command whose prompt tells Claude to read and comment without editing files.
- **C.** Define the subagent (e.g. in `.claude/agents/`) with a tool list that includes read/search tools but not Edit/Write.
- **D.** Define the subagent in `.claude/agents/` with all tools, adding a prompt rule that it must never edit files.

#### Correct answer to Question 14: C

Code under review may ask the agent to "fix" things: a subagent definition whose tool list includes read and search tools but not Edit or Write removes the capability, and it can be shared.

With Edit and Write available, a prompt rule is the only barrier, and comments asking to "fix this" can override it. A slash command prompt has the same weakness. A container is heavy infrastructure.

## Scenario: Multi-Agent Research System

### Question 15

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

Search queries generated by the coordinator are phrased to confirm the user's hypothesis, such as "evidence that X causes Y", and reports are one-sided. Users often phrase questions as hypotheses on purpose, to focus the research, and clients rely on the reports for policy decisions. What is the best fix?

- **A.** Ask the user to rephrase their request as a neutral hypothesis before research starts, so queries are unbiased.
- **B.** Increase the number of results per search query, so the coordinator sees a wider range of sources for each claim.
- **C.** Make queries neutral and search for counter-evidence, but leave the balance found out of the report to keep it concise.
- **D.** Make queries neutral, explicitly search for counter-evidence and alternatives, and report the balance found.

#### Correct answer to Question 15: D

Users phrase hypotheses on purpose, so the hypothesis stays as focus: queries must be neutral, look explicitly for counter-evidence, and the report must state the balance.

Clients making policy decisions need to see the balance of evidence. Asking users to rephrase fights their intent. More results for confirmatory queries return more confirmation.

## Scenario: Structured Data Extraction

### Question 16

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

The same contract extracted 5 times yields 2 different `termination_notice_days` values. The contract contains a general clause (30 days) and an amendment for one site (60 days), and the prompt does not say which prevails. Auditors require reproducible, explainable values. What is the best set of actions?

- **A.** Make the extraction rule state which clause prevails, and accept the first value returned without measuring agreement.
- **B.** Run the extraction three times and store the majority value, flagging the contracts where the runs disagree.
- **C.** Add a `termination_notice_source` field quoting the clause, so reviewers can check which value is right.
- **D.** Make extraction rules unambiguous (which clause prevails), lower randomness, and measure run-to-run agreement.

#### Correct answer to Question 16: D

The values differ because the prompt does not say which clause prevails: an explicit rule, lower randomness and measured agreement give reproducible, explainable values.

Without measuring run-to-run agreement, auditors have no evidence of reproducibility. Temperature 0 alone makes one answer repeatable but not justified. Majority voting hides the cause.

## Scenario: Claude Code for Continuous Integration

### Question 17

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Claude-generated tests cover only the happy path. A recent incident came from an empty input list, and the team's existing tests follow a clear style that new tests must match. Coverage reports are already green on these modules. What is the best prompt improvement?

- **A.** Provide one project test file with edge-case tests as an example and ask the model to follow its structure.
- **B.** Have the model list edge cases first (boundaries, invalid input, error paths), then test them in the existing style.
- **C.** Have the model list edge cases first and test them, ignoring the existing test style so it can choose the clearest format.
- **D.** Ask the model to write tests from the function's docstring instead of its code, so the tests do not mirror it.

#### Correct answer to Question 17: B

Coverage is already green and an incident came from an empty list: listing edge cases first makes them explicit, and the existing style keeps tests consistent.

New tests must match the team's style. An example file teaches style, not this function's edge cases. Coverage is already green.

## Scenario: Developer Productivity with Claude

### Question 18

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

The agent must read 12 independent configuration files to answer a question about service settings. It reads them one per turn, and the answer takes almost a minute. The files are small, and the agent needs their exact contents to compare values. What is the best improvement?

- **A.** Spawn a subagent that reads the 12 files and returns a summary, keeping the main agent's context small.
- **B.** Concatenate all 12 files with a single Bash command into one large output, reading everything in one step.
- **C.** Issue the 12 independent Read calls in parallel in a single turn, so they are all retrieved at once.
- **D.** Issue the 12 Read calls in parallel in a single turn through a subagent, which returns a summary of the values.

#### Correct answer to Question 18: C

The 12 files are small and independent, and their exact contents are needed: parallel Read calls in one turn retrieve them at once.

A summary loses the exact values the agent needs to compare. A concatenated Bash output is unstructured. Parallel reads in the main agent are enough.

## Scenario: Customer Support Resolution Agent

### Question 19

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

The agent calls `lookup_order` for the same order 6 times in one conversation, each returning identical data, so latency and cost grow. Order status can change during a conversation, for example after a cancellation, and the agent must then see the new state. What is the best fix?

- **A.** Add a cache inside `lookup_order` so repeated calls return instantly, without changing the agent's behavior.
- **B.** Add a system prompt rule limiting `lookup_order` to one call per conversation, whatever the customer says later.
- **C.** Keep key results in the case facts and have the agent reuse them, re-fetching only when a change is expected.
- **D.** Keep key results in the case facts and reuse them for the whole conversation, never calling `lookup_order` again.

#### Correct answer to Question 19: C

Status can change mid-conversation, so the agent must not stop calling the tool altogether: reuse known facts and re-fetch only when a change is expected.

Status can change, for example after a cancellation, so the agent must re-fetch when a change is expected. A cache keeps every call in the loop. Disabling tools blocks other actions.

## Scenario: Code Generation with Claude Code

### Question 20

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Over several steps, Claude Code made a series of bad edits to five files, some of which were not yet committed, and the developer wants to return to the state before those edits, including the conversation. Unrelated uncommitted work in other files must be kept. What is the best option?

- **A.** Run `git reset --hard` to the last commit, which restores the files and the conversation to that point.
- **B.** Use Claude Code's checkpoint/rewind feature to restore the earlier state (and/or git to restore the edited files).
- **C.** Use `git checkout` on the five files to restore their last committed version, then continue in the same conversation.
- **D.** Edit the affected files manually line by line, comparing them against the versions shown earlier in the chat.

#### Correct answer to Question 20: B

Unrelated uncommitted work must be kept and the conversation rewound too: Claude Code checkpoints restore Claude's edits and the conversation, with git as a complement.

Checkout loses earlier uncommitted work in those files and leaves the conversation as it is. `git reset --hard` also discards unrelated work. `/clear` reverts nothing.

## Scenario: Multi-Agent Research System

### Question 21

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

Two analysis subagents interpret the same clause of a regulation differently, and synthesis picks one of them arbitrarily. Both subagents quoted the clause text in their findings, and clients use the report to plan compliance. When the text is genuinely ambiguous, clients want to know. What is the best approach?

- **A.** Detect the disagreement and adjudicate against the quoted text, reporting the conclusion or flagging it uncertain.
- **B.** Detect the disagreement and keep the interpretation that best matches the quoted text, without telling clients it was disputed.
- **C.** Present both interpretations side by side in the report, without assessing which one the text supports.
- **D.** Have synthesis keep the interpretation from the subagent that reports the higher confidence in its reading.

#### Correct answer to Question 21: A

Both subagents quoted the clause: adjudicating against that text gives a conclusion, and a genuinely ambiguous clause is flagged as uncertain for clients.

When the text is genuinely ambiguous, clients want to know; hiding the dispute removes that. A majority vote counts opinions. Self-reported confidence is uncalibrated.

## Scenario: Structured Data Extraction

### Question 22

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Account numbers extracted from scanned bank forms sometimes contain OCR errors, such as O instead of 0 or l instead of 1. Accounts are IBANs with check digits, wrong accounts send payments to strangers, and other fields on the same forms legitimately contain letters. What is the best safeguard?

- **A.** Ask the model to be especially careful with letters and digits that look similar when it reads account numbers.
- **B.** Replace all letters O with 0 and l with 1 across the whole extracted output, since accounts use digits only.
- **C.** Validate the IBAN format and length deterministically, and accept every value that passes those checks.
- **D.** Validate identifiers deterministically (formats, check digits such as IBAN checksums) and route failures to review.

#### Correct answer to Question 22: D

IBANs have check digits and wrong accounts send money to strangers: deterministic format and checksum validation catches misreadings, and failures go to review.

Format and length checks miss substituted characters that keep the length; the checksum catches them. Global character replacement corrupts other fields. Two readings often repeat the same error.

## Scenario: Claude Code for Continuous Integration

### Question 23

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A CI job runs Claude Code with `-p` for a 20-minute refactoring task, and engineers can only see the result at the end; when it fails, they cannot tell where. The team wants to follow progress in the job logs as it happens and to keep the final result machine-readable. What is the best option?

- **A.** Use `--output-format stream-json` and print only the final result event in the job log.
- **B.** Use a streaming output format (e.g. `--output-format stream-json`) and process events as they arrive.
- **C.** Split the task into several `claude -p` calls, one per step, and print each result between the calls.
- **D.** Increase the verbosity level of the CI runner, so that every step of the job is printed in real time.

#### Correct answer to Question 23: B

`stream-json` emits events as they happen, so engineers can follow progress in the logs, and the final event still carries a machine-readable result.

Printing only the final event gives no progress during the 20 minutes. `--output-format json` returns one object at the end. Splitting the task changes how it runs.

## Scenario: Developer Productivity with Claude

### Question 24

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

The agent calls an internal REST API with `curl` in Bash, handling OAuth tokens by hand and parsing raw JSON. About 15% of calls fail on malformed requests, and tokens have appeared in shared logs. The API will be used by three other agents next quarter. What is the better approach?

- **A.** Continue using `curl` in Bash, but ask the agent to be careful with tokens and to validate every JSON response.
- **B.** Wrap the API in a custom MCP tool with a clear schema, keeping the OAuth token handling in the agent's Bash commands.
- **C.** Use the WebFetch tool for the API calls, so that authentication and JSON parsing are handled by Claude Code.
- **D.** Wrap the API in a custom MCP tool with a clear schema, built-in authentication handling, and structured errors.

#### Correct answer to Question 24: D

The API will serve three more agents: an MCP tool with a schema, built-in authentication and structured errors fixes malformed calls and token leaks once, for all of them.

Leaving token handling in Bash keeps tokens in logs and errors in requests; the tool should handle authentication itself. A wrapper script returns raw output. WebFetch is for web pages.

## Scenario: Customer Support Resolution Agent

### Question 25

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer escalated yesterday and comes back today; the agent has no memory of the case and asks them to start over. Conversations are not linked to each other, the human operator recorded the outcome in the ticketing system, and data from one customer must never reach another. What is the best design?

- **A.** Persist a case record and load it at the start of new conversations matched by the customer's name.
- **B.** Have the escalation team send the customer a case number, which the agent asks for at the start of every chat.
- **C.** Keep the conversation session open for several days, so the agent retains context until the case is resolved.
- **D.** Persist a case record (issue, actions, status, handoff summary) and load it at the start of new conversations later.

#### Correct answer to Question 25: D

Conversations are not linked and data must never cross customers: a persisted case record for this customer, with the operator's outcome, loaded at the start gives the agent the facts.

Matching by name risks loading another customer's case; records must be keyed to the authenticated customer. A case number alone gives no facts. A session open for days is impractical.

## Scenario: Code Generation with Claude Code

### Question 26

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

The team adopted a new data-access pattern, but 80% of the existing code still uses the old one, and Claude Code keeps imitating it in new code. Legacy code will be migrated gradually over a year, and new code must use the new pattern from today. What is the best fix?

- **A.** Add a few-shot example of the new pattern to each prompt in which Claude works on data-access code.
- **B.** Document the preferred pattern in project memory with a reference example, without marking the legacy pattern as deprecated.
- **C.** Document the preferred pattern in project memory with a reference example, and mark the legacy one as deprecated.
- **D.** Ask Claude to refactor all legacy code to the new pattern first, so the repository shows a single example.

#### Correct answer to Question 26: C

New code must use the new pattern from today, while legacy migrates over a year: project memory with a reference example and the old pattern marked deprecated steers every session.

Without marking the old pattern deprecated, Claude still sees 80% of the code using it as valid. Lint rules act after writing. Refactoring everything first takes a year.

## Scenario: Multi-Agent Research System

### Question 27

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The coordinator's context overflows after collecting long results from 12 subagents, each returning 15k–25k tokens. Synthesis needs every finding, and occasionally the coordinator must check a detail in a subagent's full output. What is the best fix?

- **A.** Run the 12 subagents in two waves of six, compacting the coordinator's context between the waves.
- **B.** Switch the coordinator to a model with a larger context window, so that all 12 results fit at once.
- **C.** Have subagents store details in files and return concise summaries, without references to the files.
- **D.** Have subagents store details externally (files) and return concise summaries with references for on-demand loading.

#### Correct answer to Question 27: D

Synthesis needs every finding and occasionally a detail: files with the full outputs plus concise summaries with references give both, without overflowing the coordinator.

Without references, the coordinator cannot find the details when it needs to check them. Compacting loses details unpredictably. A larger window postpones the overflow.

## Scenario: Structured Data Extraction

### Question 28

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Extraction from email threads picks up values from quoted older messages instead of the latest one, for example an old delivery address. Email clients quote in different ways, and earlier messages sometimes contain context needed to interpret the latest one. What is the best fix?

- **A.** Extract from every message and keep, for each field, the value associated with the latest date in the text.
- **B.** Define the authoritative part (latest message; quoted ones as context only) and optionally pre-split the messages.
- **C.** Strip quoted text marked with `>` before extraction, and extract only from what remains of the thread.
- **D.** Define the latest message as authoritative and strip all quoted messages before extraction.

#### Correct answer to Question 28: B

Clients quote differently and earlier messages give context: define the latest message as authoritative and use quoted ones only as context, optionally after splitting the thread.

Earlier messages sometimes give context needed to interpret the latest one, so they should stay as context. Dates in text are unreliable. Pushing the choice downstream moves the problem.

## Scenario: Claude Code for Continuous Integration

### Question 29

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Your CI job runs Claude Code with network access and broad tools, although the review only needs the repository. PRs come from external contributors, and you worry about exfiltration through instructions injected in PR content. The job needs a token to post comments. What is the best measure?

- **A.** Restrict tools and network to what the job needs (deny web fetch, limit Bash), and keep secrets out.
- **B.** Restrict tools and network to what the job needs, keeping repository secrets available for convenience.
- **C.** Add an instruction to the CI prompt telling Claude never to send repository data to any external destination.
- **D.** Run the job only on PRs opened by organization members, keeping its network access and tools unchanged.

#### Correct answer to Question 29: A

The review only needs the repository, while external content may carry injections: restricting tools and network and keeping secrets out closes the exfiltration path, with a token scoped to commenting.

Secrets available to a job that reads external content can still be exfiltrated through allowed channels. Scanning content is probabilistic. A prompt rule is probabilistic.

## Scenario: Developer Productivity with Claude

### Question 30

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

An engineer asks for an architecture diagram of a service for an incident review. The agent infers dependencies from file names and draws calls that do not exist, while missing two real ones made through a generic HTTP client configured in YAML. The diagram must be trustworthy. What is the best fix?

- **A.** Build the diagram from the dependency manifest (`package.json`), showing each library the service uses.
- **B.** Derive dependencies from the actual code (imports, client calls, config), cite the evidence, and mark uncertain links.
- **C.** Have the agent label every arrow with a confidence level, keeping the current way of deriving dependencies.
- **D.** Derive dependencies from imports and client calls in the code, without reading the YAML configuration.

#### Correct answer to Question 30: B

Two real calls go through a generic HTTP client configured in YAML: deriving dependencies from imports, client calls and configuration, citing evidence and marking uncertain links, makes the diagram trustworthy.

Two real calls go through a client configured in YAML, so ignoring configuration misses them. A manifest lists libraries, not calls. Confidence labels keep the inference.

## Scenario: Customer Support Resolution Agent

### Question 31

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A legal disclaimer must appear word for word at the end of every refund confirmation. The agent paraphrases it in about 4% of confirmations, and a regulator has flagged two of them. The rest of each confirmation must stay personalized by the model, and the disclaimer text changes once or twice a year. What is the best fix?

- **A.** Repeat the full disclaimer three times in the system prompt, so the model treats it as critical fixed text.
- **B.** Append the disclaimer deterministically in code (confirmation template or post-processing), not via the model.
- **C.** Instruct the model to copy the disclaimer exactly, character by character, without changing any of its words.
- **D.** Append the disclaimer in a post-processing step only when the model's text does not already contain it.

#### Correct answer to Question 31: B

The disclaimer must be verbatim and has been flagged by a regulator: appending it in code guarantees the wording while the rest stays personalized.

Checking whether the model "already contains" it lets paraphrased versions slip through; append it deterministically every time. Repeating, copying or showing it in examples remain probabilistic.

## Scenario: Code Generation with Claude Code

### Question 32

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

You open a terminal in a project directory where you worked with Claude Code yesterday afternoon and want to continue that most recent conversation directly, without choosing from a list of past sessions. Several other conversations exist for the same directory. What is the right command?

- **A.** `claude --resume`, then pick yesterday's conversation from the list of sessions for this directory.
- **B.** `claude -p --continue`, since `--continue` works only together with non-interactive print mode.
- **C.** `claude --session latest`, which loads the latest saved session for the current directory.
- **D.** `claude --continue`, which resumes the most recent conversation in the current directory.

#### Correct answer to Question 32: D

`claude --continue` resumes the most recent conversation in the current directory directly, without a picker.

That works, but it requires choosing from a list, which was to be avoided. `--continue` also works interactively. There is no `--session latest` option.

## Scenario: Multi-Agent Research System

### Question 33

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The search subagent cannot access paywalled sources and reports nothing about them, so reports cite only open sources and users do not know that key studies were missed. Buying access is not possible this year, and clients value knowing the limits of each report. What is the best fix?

- **A.** Report inaccessible sources as gaps (title, reason) and look for alternatives, noting limits.
- **B.** Retry paywalled sources through a different search provider, and drop them from the results if they still fail.
- **C.** Use the abstract of each paywalled study and cite it as if the full paper had been read and analyzed.
- **D.** Report inaccessible sources as gaps with title and reason, without looking for alternative sources.

#### Correct answer to Question 33: A

Access cannot be bought and clients value knowing the limits: report each inaccessible source as a gap with its reason and look for alternatives.

Alternatives, such as preprints or summaries, can fill part of the gap. Retrying and dropping silently hides it. Abstracts cited as full papers overstate evidence.

## Scenario: Structured Data Extraction

### Question 34

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Your schema for medical reports has 6 levels of nested objects, and 12% of outputs fail validation in the deep nested parts. The downstream system uses only about half of the nested structure, and the reports have clear sections that can be processed separately. What is the best fix?

- **A.** Simplify the schema where possible (flatten nesting, split into focused passes), keeping what downstream needs.
- **B.** Enable extended thinking for the extraction, so the model plans the nested structure before writing the JSON.
- **C.** Simplify the schema by flattening all nesting into one flat object, including the parts downstream uses.
- **D.** Remove schema validation for the nested parts, so outputs are accepted and fixed downstream when needed.

#### Correct answer to Question 34: A

Downstream uses only half the structure and reports have clear sections: flatten what is not needed and split extraction into focused passes.

Flattening everything breaks the structure downstream needs; simplify where possible and split into passes. Extended thinking leaves the deep target. Removing validation hides errors.

## Scenario: Claude Code for Continuous Integration

### Question 35

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A new model version is released, and your CI reviewer uses an alias that updates automatically. After the update, comment volume doubles and developers complain. The team wants to adopt new models when they help, but never be surprised in production again. What practice would have prevented the surprise?

- **A.** Write the alias in the CI configuration file, so that model updates arrive only when the file is redeployed.
- **B.** Monitor comment volume after each update and switch back to the previous alias if it changes by more than 20%.
- **C.** Pin a specific model version in CI, and run the evaluation set on any new version before switching to it.
- **D.** Pin a specific model version in CI and update it whenever a new version is released.

#### Correct answer to Question 35: C

The team wants new models but no surprises: pinning a version and running the evaluation set on each new one before switching gives both.

Updating without running the evaluation set first brings the same surprises. An alias follows the latest version. A comment cap hides the change.

## Scenario: Developer Productivity with Claude

### Question 36

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

Engineers ask the agent to print environment variables to debug configuration, and the output includes API keys that end up in shared logs kept for 90 days. Engineers do need to see non-secret variables, and the agent runs through the Agent SDK with Bash. What is the best fix?

- **A.** Add a CLAUDE.md rule telling the agent never to print secrets and to mask values when it shows variables.
- **B.** Move the API keys into a secrets manager instead of environment variables, leaving the agent's commands unchanged.
- **C.** Block secret-dumping commands with hooks, keeping full output for non-secret commands without redaction.
- **D.** Block secret-dumping commands via hooks, redact secret patterns, show only needed variables.

#### Correct answer to Question 36: D

Engineers need non-secret variables, and logs are kept 90 days: hooks that block secret dumps, redaction of secret patterns and showing only needed variables stop the leak.

Secrets can also appear in other command output, so redaction of secret patterns is still needed. A CLAUDE.md rule is probabilistic. Restricting logs shrinks the audience, not the exposure.

## Scenario: Customer Support Resolution Agent

### Question 37

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

`get_customer` occasionally returns another customer's data when the agent passes a mistyped email, and once the agent read out another person's address. The agent serves authenticated users only, and each session knows the logged-in customer's ID. What is the most important fix?

- **A.** Scope tool access server-side to the authenticated customer, so the agent cannot retrieve other customers' data.
- **B.** Make `get_customer` require both email and order number, so that a single typo cannot match another customer.
- **C.** Have the agent confirm the customer's name before reading out any data returned by `get_customer`.
- **D.** Scope tool access in the system prompt to the authenticated customer's ID, so the agent queries only that customer.

#### Correct answer to Question 37: A

Every session knows the logged-in customer: scoping tool access server-side to that ID makes it impossible to read another customer's data, typo or not.

A prompt scope is probabilistic; the restriction must be enforced server-side. Two identifiers still allow querying anyone. Fuzzy matching increases mismatches.

## Scenario: Code Generation with Claude Code

### Question 38

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Claude Code is 10 minutes into a long refactor when the developer notices it is heading in the wrong direction, introducing an abstraction the team rejected. The first part of the work, renaming files, is correct and should be kept. What is the best action?

- **A.** Wait for the current step to finish before typing a correction, since interrupting mid-edit can corrupt files.
- **B.** Let it finish, then ask Claude in the same session to undo all of its changes and try a different approach.
- **C.** Interrupt it (e.g. with Esc), give corrective guidance about the direction, and continue from there.
- **D.** Interrupt it with Esc and restart the whole refactor from the beginning with a better prompt.

#### Correct answer to Question 38: C

The renames are correct and should stay: interrupting with Esc and redirecting keeps that work and stops the unwanted abstraction early.

The renames are correct and should be kept; redirect from the current point. Waiting lets it go further the wrong way. A second session editing the same files causes conflicts.

## Scenario: Multi-Agent Research System

### Question 39

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The final research report is 40 pages. Executives want key conclusions in two minutes, analysts need every detail and source, and both read the same document. Each conclusion has a different level of support in the evidence. What is the best format?

- **A.** Start with an executive summary of key findings (with confidence and citations), then detailed sections.
- **B.** Split the report into 8 separate documents by topic, so users open only the ones relevant to them.
- **C.** Keep all 40 pages in a single unstructured narrative, so no detail or nuance from the research is lost.
- **D.** Start with an executive summary of key findings, without confidence levels or citations, then detailed sections.

#### Correct answer to Question 39: A

Executives and analysts read the same document: an executive summary with confidence and citations, followed by detailed sections, serves both.

Conclusions differ in support, and analysts need sources: the summary needs confidence and citations. Separate documents lose the overview. A table of contents still makes readers dig.

## Scenario: Structured Data Extraction

### Question 40

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Human review is overloaded: 30% of extractions are flagged and reviewers process them in arrival order, so high-value invoices wait days. Most flags come from two recurring causes, and reviewer capacity cannot grow this year. What is the best improvement?

- **A.** Raise the confidence threshold used for flagging, so that only 10% of extractions are sent to human review.
- **B.** Have a second model re-check the flagged items and send only the cases where it disagrees to the reviewers.
- **C.** Prioritize review by risk and impact (high amounts, critical fields, low confidence) and fix causes.
- **D.** Prioritize review by risk and impact, keeping the current flagging rules unchanged.

#### Correct answer to Question 40: C

Capacity cannot grow and two causes produce most flags: prioritizing by risk and impact, and fixing those causes, cuts both delay and backlog.

Two recurring causes produce most flags; fixing them is needed to cut the backlog. A higher threshold drops items regardless of risk. A second model's agreement is not correctness.

## Scenario: Claude Code for Continuous Integration

### Question 41

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A PR contains database migrations and application code. The general review misses migration risks such as long table locks and backward-incompatible column changes; one caused 20 minutes of downtime last month. Only about 10% of PRs contain migrations, and the review prompt is shared by all PRs. What is the best improvement?

- **A.** Include the full schema files in the review context, so the reviewer understands the tables that the migration touches.
- **B.** Run a migration linter in CI and remove migration files from Claude's review, letting the linter cover them.
- **C.** Add a migration checklist to the review prompt for every PR, whether or not it contains migrations.
- **D.** Add a migration checklist (applied when migration files are present) covering compatibility and lock risks.

#### Correct answer to Question 41: D

Only 10% of PRs have migrations and the prompt is shared: a checklist applied when migration files are present targets locking and compatibility risks without burdening other reviews.

Applying the checklist to every PR burdens the 90% without migrations. Schema context gives no criteria. A linter misses data-specific compatibility.

## Scenario: Developer Productivity with Claude

### Question 42

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

The repository's examples use a deprecated internal API, and the agent copies them into new code. The old API will be removed in six months, the examples are still referenced by older documentation, and the replacement API has one good reference implementation. What is the best fix?

- **A.** Delete the outdated examples from the repository, so the agent can no longer find and copy the deprecated API.
- **B.** Mark the deprecated API with a `@deprecated` annotation and rely on the agent to notice it while reading the code.
- **C.** Document deprecations and replacements in project rules, without a preferred example to follow.
- **D.** Document deprecations and replacements in project rules with a preferred example to follow.

#### Correct answer to Question 42: D

The old API disappears in six months and one good reference exists: documenting deprecations and the replacement, with that example, in project rules steers new code now.

Without an example, the agent still has only the deprecated examples to imitate. Deleting examples breaks old documentation. An annotation helps only when the definition is opened.

## Scenario: Customer Support Resolution Agent

### Question 43

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

Before launch, you want to test the support agent against manipulative customers: social engineering, prompt injection and abusive pressure. The agent can issue refunds up to $500, and launch is in three weeks. Normal-traffic evaluations already look good. What is the best approach?

- **A.** Run the existing happy-path eval set with a stricter system prompt that warns the agent about manipulation.
- **B.** Build an adversarial test set and measure compliance, fixing failures by adding rules to the system prompt.
- **C.** Have a second Claude instance score each production reply for manipulation and block the replies it flags.
- **D.** Build an adversarial test set (red teaming, simulated customers), measure compliance, fix with hard controls.

#### Correct answer to Question 43: D

The agent can issue refunds and normal-traffic evals already pass: an adversarial set with simulated manipulative customers, measured compliance and hard controls tests what matters before launch.

Prompt rules can be argued away, as the test will show; refunds need hard controls. A stricter prompt on happy paths proves nothing. A staged launch lets customers find holes.

## Scenario: Code Generation with Claude Code

### Question 44

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A developer is fixing a race condition that appears only under load, with Claude Code. The first two attempts were shallow fixes that moved the symptom elsewhere. The developer has a reproduction script and logs from three failures. What is a good way to get deeper reasoning?

- **A.** Ask Claude to think more thoroughly (extended thinking) and plan before coding, providing reproduction details.
- **B.** Use extended thinking and plan before coding, without sharing the reproduction script or the logs.
- **C.** Paste the whole module's source into the prompt, so Claude sees all the code at once instead of searching.
- **D.** Ask Claude for three alternative fixes at once and try the smallest one first, since it is the least risky.

#### Correct answer to Question 44: A

Shallow fixes moved the symptom: extended thinking with the reproduction script and failure logs gives Claude what it needs to reason about the race condition.

Without the reproduction script and logs, deeper reasoning still lacks the evidence of the race. Pasting the module adds volume. Choosing the smallest fix optimizes the wrong thing.

## Scenario: Multi-Agent Research System

### Question 45

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

After a research report is delivered, users ask follow-up questions, and the system re-runs the full research for each one, at about $20 and 30 minutes per question. Most follow-ups ask about details already found, while a few raise genuinely new questions. What is the best design?

- **A.** Store findings (with sources) from the run and answer follow-ups from them, researching only real gaps.
- **B.** Keep the final report in the conversation and answer each follow-up by re-reading the whole report.
- **C.** Store findings from the run and answer every follow-up only from them, never researching again.
- **D.** Answer follow-ups from the model's general knowledge, which is fast and needs no further searching.

#### Correct answer to Question 45: A

Most follow-ups ask about details already found: answering from stored findings with sources, and researching only new questions, avoids $20 and 30 minutes per question.

A few follow-ups raise genuinely new questions that need research. The report alone omits evidence. General knowledge loses grounding.

## Scenario: Structured Data Extraction

### Question 46

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Your validation set was built last year. New supplier templates have appeared, production errors are rising, and the validation score stays at 97%. About 15% of production documents now come from templates absent from the set, and the team can label 200 documents a month. What is the best fix?

- **A.** Continuously sample production documents and add them to the eval set, without labeling them by supplier or type.
- **B.** Retrain or rebuild the evaluation set once a year, aligning it with the annual supplier contract renewals.
- **C.** Use the error rate reported by users in production as the only quality metric from now on.
- **D.** Continuously sample and label production documents (by supplier/type) to refresh the eval set and catch drift.

#### Correct answer to Question 46: D

15% of documents come from templates absent from the set: continuously sampling and labeling production documents, within the 200 per month, keeps the eval set representative.

Without labels by supplier and type, the set cannot show which templates drift. New examples in the prompt do not measure anything. A yearly refresh is too slow.

## Scenario: Claude Code for Continuous Integration

### Question 47

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A reviewer bot can approve PRs automatically when it finds no issues, and a PR with a subtle bug was merged without human review. The bot catches many real issues and the team wants to keep it, and branch protection already requires one approval and green checks. What is the best change?

- **A.** Make the bot stricter, so it approves PRs automatically only when it is highly confident there are no issues.
- **B.** Let the bot comment only; approval and merge decisions stay with humans and with the required checks.
- **C.** Require two independent review bots to approve before an automatic merge, so one bot catches the other's misses.
- **D.** Let the bot comment only, and allow merges with the bot's comments resolved instead of a human approval.

#### Correct answer to Question 47: B

The bot finds real issues, and branch protection already requires human approval: the bot should comment, leaving approval to humans and required checks.

Resolved comments are not a human approval; branch protection should keep requiring one. A stricter or doubled automatic approval keeps automation as decision-maker.

## Scenario: Developer Productivity with Claude

### Question 48

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

The agent runs Read on a 300 MB binary asset to "check its content" while investigating why an image pipeline fails. The engineer wants to know the file's format, dimensions and whether its header is corrupted. The agent has Bash with the usual command-line tools. What is the best behavior?

- **A.** Use metadata commands to read the format, then Read the first few kilobytes to check the header.
- **B.** Delegate the Read to a subagent, so the 300 MB of content is consumed in the subagent's context instead.
- **C.** Use metadata commands (file type, size, headers) or suitable tools, not a raw Read on binaries.
- **D.** Convert the binary to text with a hex dump first, then read the result in chunks to inspect its content.

#### Correct answer to Question 48: C

The engineer needs format, dimensions and header integrity: metadata commands and format-specific tools answer exactly that, without reading 300 MB.

Read on binary data returns noise even for a few kilobytes; format tools inspect headers properly. A subagent still loads unusable content. A hex dump is not meaningful content.

## Scenario: Customer Support Resolution Agent

### Question 49

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

Three backend tools fail at once during an outage, and the agent keeps retrying while the customer waits for several minutes. Outages like this last 20 to 60 minutes. The customer's issue needs those tools, and a ticketing system is still available. What is the best behavior?

- **A.** Retry all three tools in parallel with exponential backoff for up to ten minutes, then continue normally.
- **B.** Limit retries and tell the customer honestly, without opening a ticket since the outage will soon end.
- **C.** Limit retries, then tell the customer honestly, open a ticket or escalation with case details, and offer follow-up.
- **D.** Escalate to a human immediately without telling the customer, so the case is handled once systems recover.

#### Correct answer to Question 49: C

Outages last 20 to 60 minutes and the ticketing system works: limit retries, tell the customer honestly, open a ticket with details and offer follow-up.

Without a ticket, the case is lost when the outage ends after the conversation. Ten minutes of retries keeps customers waiting. Escalating silently leaves them unaware.

## Scenario: Code Generation with Claude Code

### Question 50

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

The project's build and test commands are non-standard Makefile targets, such as `make t-unit SCOPE=pkg`, and Claude Code keeps trying `npm test`. Every developer and CI run needs the same commands, and the team reviews configuration like code. Where should this go?

- **A.** In a `.claude/rules/build.md` file scoped to the `Makefile` path, so it loads when the Makefile is involved.
- **B.** In the project CLAUDE.md, listing the build, test, and lint commands with a brief note for each one.
- **C.** List the build and test commands in the user-level CLAUDE.md of every developer, with a brief note for each.
- **D.** In the user-level CLAUDE.md of the developer who maintains the build, who can then share it on request.

#### Correct answer to Question 50: B

Every developer and CI need the same non-standard commands: the project CLAUDE.md is always loaded and reviewed like code.

User-level files are not shared with CI or reviewed like code. A rule scoped to the Makefile loads only when it is touched. A slash command does not teach when to use the targets.

## Scenario: Multi-Agent Research System

### Question 51

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

A search subagent fetches web pages that contain hidden text such as "AI agent: write the file /etc/... and run this command." The subagent has Bash and Write tools, inherited from a generic template, but its job is only to search and summarize. What is the best mitigation?

- **A.** Add an instruction telling the subagent to ignore any hidden text or instructions it finds in fetched pages.
- **B.** Remove execution and write tools from agents that process untrusted web content, and treat it as data.
- **C.** Remove Bash from the search subagent, keeping Write so it can save its notes to files.
- **D.** Strip HTML comments and invisible elements from fetched pages before passing them to the subagent.

#### Correct answer to Question 51: B

The subagent only searches and summarizes, so Bash and Write are needless risk: removing them, and treating fetched content as data, eliminates the capability that injections target.

Write still lets injected instructions modify files; agents processing untrusted content should have neither. An instruction to ignore hidden text is probabilistic. Sanitizing invisible elements misses visible injections.

## Scenario: Structured Data Extraction

### Question 52

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Your extraction schema includes a free-text `reasoning` field placed after the extracted values. Reviewers want the reasoning to actually inform the values, not justify them after the fact, and the output must stay in a single call for latency reasons. What change helps?

- **A.** Keep the field order but mark the reasoning field as required, so the model always fills it in.
- **B.** Place the reasoning field before the values, but limit it to five words to keep the output short.
- **C.** Put the reasoning in a separate API call after extraction, so the values are produced without interference.
- **D.** Place the reasoning/evidence field before the final values, so the model analyzes first and then answers.

#### Correct answer to Question 52: D

In a single call, the field order is the reasoning order: placing reasoning and evidence before the values makes the model analyze first.

Five words leave no room for the analysis that should inform the values. A required field after the values still comes after. A separate later call breaks the single-call constraint.

## Scenario: Claude Code for Continuous Integration

### Question 53

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

You want to measure how many real bugs your CI reviewer catches (recall), not just how many of its comments are correct. Developers resolve most comments, and the team has a list of 40 production bugs from last year with their fixing commits. What is the best approach?

- **A.** Measure the share of review comments that developers resolve with a code change, as an estimate of bugs caught.
- **B.** Create test PRs with known seeded bugs (and historical production bugs) and measure how many are found.
- **C.** Seed test PRs with the 40 production bugs and count how many comments the reviewer posts on them.
- **D.** Track production incidents and check whether the reviewer had commented on the files involved.

#### Correct answer to Question 53: B

A list of 40 production bugs with fixes gives a known denominator: seeding them, plus known bugs, into test PRs measures recall directly.

Counting comments does not show whether the bug itself was found; measure detections. Resolved comments measure precision. Human reviewers miss bugs too.

## Scenario: Developer Productivity with Claude

### Question 54

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

Every Monday, engineers ask the agent to produce the same dependency report by hand, with the same structure each time. The report must be identical in format week to week, and occasionally someone wants the agent to explain unusual changes. What is the best improvement?

- **A.** Have the agent write a script for the report once and schedule it, without review, using the agent to explain changes.
- **B.** Have the agent write a script for the report once, review it, and schedule it, using the agent only to interpret.
- **C.** Schedule Claude Code in headless mode every Monday to regenerate the report from scratch with the same prompt.
- **D.** Rotate the task among engineers each week, so no single person carries the repetitive work every Monday.

#### Correct answer to Question 54: B

The format must be identical every week, while unusual changes still need explanation: a reviewed, scheduled script produces the report, and the agent only interprets.

An unreviewed script can carry errors into every weekly report; review it once. A slash command still regenerates the report with the model. A scheduled headless run keeps it nondeterministic.

## Scenario: Customer Support Resolution Agent

### Question 55

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

You evaluate the support agent's escalation decisions. The team tracks only unnecessary escalations, to reduce human workload, and has cut them by 40% this quarter. Last month two customers who threatened legal action were never escalated. What is missing?

- **A.** Also measure missed escalations (cases that should have been escalated), since optimizing one side alone is risky.
- **B.** Also measure missed escalations, but only for conversations that customers later rate as unsatisfactory.
- **C.** Measure customer satisfaction on escalated conversations, to check that humans resolve them well.
- **D.** Track the weekly escalation rate and aim to keep it stable over time as the agent improves.

#### Correct answer to Question 55: A

Two legal threats were never escalated: missed escalations must be measured alongside unnecessary ones, or optimizing one side hides the other.

Many missed escalations, such as legal threats, are not rated at all; they must be measured systematically. Handling time and satisfaction describe escalated cases only.

## Scenario: Code Generation with Claude Code

### Question 56

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A cross-cutting change to error handling will touch about 120 files in 8 services, implemented with Claude Code over two weeks. Reviewers can handle PRs of up to about 300 lines, and production must stay stable throughout. What is the best strategy?

- **A.** Work on one branch with frequent commits, then open a single PR that reviewers read commit by commit.
- **B.** Use plan mode to produce a detailed plan, then let Claude implement it in one pass and run the tests at the end.
- **C.** Break the change into incremental steps, but merge each step without review to keep the two-week schedule.
- **D.** Break the change into incremental steps, each one implemented, tested, and reviewed as a smaller PR.

#### Correct answer to Question 56: D

Reviewers handle about 300 lines and production must stay stable: incremental steps, each implemented, tested and reviewed as a small PR, fit both.

Merging without review loses the safety the small steps are meant to provide. One large PR exceeds what reviewers can read. A single pass finds problems late.

## Scenario: Multi-Agent Research System

### Question 57

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

Users wait about 10 minutes without feedback while research runs, and some abandon the page before the report arrives. Research quality must not drop, and the run's duration cannot be reduced much. What is the best improvement?

- **A.** Cache research results for frequent questions, so that repeated questions return immediately.
- **B.** Stream progress updates only at the end of each research phase, without partial findings.
- **C.** Stream progress updates (plan, completed subtasks, partial findings) while research runs.
- **D.** Run research only overnight as a batch job and deliver reports by email the next morning.

#### Correct answer to Question 57: C

Duration cannot shrink much and quality must stay: streaming the plan, completed subtasks and partial findings gives users continuous feedback.

Phase-end updates still leave long silent stretches; partial findings keep users engaged. Caching helps only repeated questions. An estimate leaves ten silent minutes.

## Scenario: Structured Data Extraction

### Question 58

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

High-volume synchronous extraction hits rate limits (HTTP 429) during morning peaks, and failed documents are dropped. Some documents are urgent, while the backlog uploaded overnight can wait a few hours. What is the best handling?

- **A.** Retry with exponential backoff and jitter, treating urgent documents and the overnight backlog the same way.
- **B.** Rotate through a pool of API keys, using a new key for each request, so no single key hits the limit.
- **C.** Retry after a fixed one-second delay, up to three times, then mark the document as failed for resubmission.
- **D.** Retry with exponential backoff and jitter, respect retry-after, control concurrency, batch non-urgent work.

#### Correct answer to Question 58: D

Urgent documents need priority while the overnight backlog can wait: backoff with jitter, retry-after, concurrency control and batches for the backlog keep peaks under the limits.

Without separating urgent work from the backlog, urgent documents wait behind it at peak. Dropping documents loses work. Rotating keys circumvents limits improperly.

## Scenario: Claude Code for Continuous Integration

### Question 59

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

You want CI-specific instructions, such as "output JSON findings only", without changing the project CLAUDE.md used in interactive sessions. CI runs Claude Code with `-p` from a workflow file in the repository, and the instructions must be reviewed like code. What is a good approach?

- **A.** Commit a `CLAUDE.local.md` with the CI rules, so that it is read only when Claude Code runs in CI.
- **B.** Add a "CI only" section to CLAUDE.md with the rules, so Claude applies them when it runs headless.
- **C.** Pass CI-specific instructions in the invocation (prompt or appended system prompt), keeping CLAUDE.md shared.
- **D.** Pass the CI instructions with `--append-system-prompt`, stored in a CI secret outside the repository.

#### Correct answer to Question 59: C

The CI instructions must be reviewed and must not affect interactive sessions: passing them in the invocation, from the workflow file in the repository, does both.

Instructions outside the repository are not reviewed like code. `CLAUDE.local.md` is personal. A "CI only" section in CLAUDE.md also loads interactively.

## Scenario: Developer Productivity with Claude

### Question 60

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

An MCP tool returns errors as plain text "fail" with `isError` false, and the agent treats failures as valid data, for example reporting an empty refund history. Your team owns the tool, and some failures are transient while others are permanent. What is the best fix?

- **A.** Fix the tool to set `isError: true` on failure and return structured error details (category, retryability).
- **B.** Instruct the agent to check every tool response for the word "fail" and treat those responses as errors.
- **C.** Add a PostToolUse hook that checks each result for the word "fail" and rewrites it as an error message.
- **D.** Fix the tool to set `isError: true` on failure, with the plain text "fail" as the only detail.

#### Correct answer to Question 60: A

Your team owns the tool and failures differ in kind: setting `isError` with a category and retryability lets the agent tell failures from data and act on each.

`isError` alone says something failed but not whether a retry can help; transient and permanent failures need categories. Checking for "fail" patches a broken contract. An empty result looks like a valid answer.

