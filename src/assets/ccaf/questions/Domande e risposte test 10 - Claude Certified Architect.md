---
title: "Practice Test 10 – Claude Certified Architect"
duration_minutes: 120
difficulty: difficile
---

# Questions and Answers: Practice Test 10 – Claude Certified Architect

## Scenario: Customer Support Resolution Agent

### Question 1

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer asks the agent to delete their account and all personal data. No tool supports deletion, but the agent replies "Done, your data has been deleted." What is the best fix?

- **A.** Handle out-of-scope requests honestly: explain the process, route it to the data-deletion workflow, never claim the action.
- **B.** Add a `delete_everything` tool the agent can call freely, so deletion requests are actually fulfilled during the chat.
- **C.** Tell the agent to reply that deletion takes 30 days to complete, which sets expectations while the request is handled.
- **D.** Instruct the agent to ignore deletion requests politely, since no tool supports them and support cannot act on them.

#### Correct answer to Question 1: A

The agent must not claim actions it did not perform. Requests outside its tools go through the correct process with honest communication.

A freely callable `delete_everything` tool creates a dangerous capability without controls. Promising deletion in 30 days still misinforms. Ignoring the request violates the customer's rights.

## Scenario: Code Generation with Claude Code

### Question 2

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A developer wants Claude Code to consider two specific files immediately without searching. What is the most direct way?

- **A.** Describe the files vaguely in the prompt and let Claude search the repository to locate and open them on its own.
- **B.** Reference them directly in the prompt (e.g. with `@path/to/file`) so their content is included in context.
- **C.** Copy the content of both files into CLAUDE.md, so Claude has them in context at the start of the session.
- **D.** Rename both files to start with `claude_`, which makes Claude Code prioritize and preload them automatically.

#### Correct answer to Question 2: B

File references in the prompt bring specific files into context directly.

Describing the files vaguely wastes turns searching. Copying them into CLAUDE.md pollutes memory permanently. A `claude_` prefix does nothing.

## Scenario: Multi-Agent Research System

### Question 3

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The coordinator passes its full internal reasoning (thousands of tokens of deliberation) into each subagent's prompt. Subagents sometimes pursue ideas the coordinator had already rejected. What is the best fix?

- **A.** Pass subagents the conclusions they need (task, scope, constraints, facts), not deliberation, and state what is out of scope.
- **B.** Pass even more of the coordinator's reasoning, so subagents fully understand why some ideas were considered and discarded.
- **C.** Remove all context from delegation prompts and send only the task title, so subagents cannot be distracted by anything.
- **D.** Let subagents read the coordinator's full logs on demand, so they can look up its reasoning only when they need it.

#### Correct answer to Question 3: A

Delegation should be concise and decisive. Deliberation includes rejected options that can mislead subagents.

Passing even more reasoning worsens the problem. Sending only the task title leaves subagents uninformed. Letting them read the full logs has the same issue as passing more reasoning.

## Scenario: Structured Data Extraction

### Question 4

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Invoice amounts appear as "1.234,56" (European) and "1,234.56" (US). The model sometimes outputs 1.23456 or 123456. What is the most reliable approach?

- **A.** Extract the amount as written plus locale/currency context, parse it with locale-aware code, and check line-item sums.
- **B.** Ask the model to pay close attention to thousands and decimal separators and to double-check every amount it outputs.
- **C.** Assume US number formatting for all invoices, since most suppliers use it, and flag amounts that look unusually small.
- **D.** Round all extracted amounts to integers, so separator confusion has no effect on the stored values downstream.

#### Correct answer to Question 4: A

Locale-aware deterministic parsing plus consistency checks removes ambiguity errors.

Asking the model to pay attention to separators remains probabilistic. Assuming US formatting breaks European invoices. Rounding to integers loses precision.

## Scenario: Claude Code for Continuous Integration

### Question 5

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

The CI review runs on every push to draft PRs, which change frequently and are not ready for review. Costs are high. What is the best change?

- **A.** Review draft PRs more aggressively, so problems are caught early before the PR is even marked as ready for review.
- **B.** Disable automated reviews completely and rely on human reviewers, since the AI review cost is too high to justify.
- **C.** Trigger the review when a PR is marked ready for review (or on explicit request), not on every draft push.
- **D.** Review only the PR title and description on drafts, which is cheap and still gives authors some early feedback.

#### Correct answer to Question 5: C

Triggers should match when feedback is useful. Drafts change too often for full reviews.

Reviewing drafts more aggressively wastes more. Disabling reviews removes value. Reviewing only the title and description lacks content.

## Scenario: Developer Productivity with Claude

### Question 6

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

An engineer asks: "Why does this function retry exactly 7 times?" The code has no comments. What is the best approach for the agent?

- **A.** Suggest the most plausible reason, such as a common retry convention, and present it as the likely original intent.
- **B.** Change the value to 3, the more common retry count, and explain that 7 retries is unusual and probably arbitrary.
- **C.** Check history (git blame/log, linked PRs or issues) for when and why it was added; separate documented from inferred.
- **D.** Explain that without comments it is impossible to know the original intent and suggest asking the original author.

#### Correct answer to Question 6: C

Version control history often explains design decisions; distinguishing evidence from inference keeps the answer honest.

Presenting the most plausible reason as intent fabricates it. Changing the value to 3 is an unrequested change. Declaring it impossible to know gives up too early.

## Scenario: Customer Support Resolution Agent

### Question 7

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer sends a photo of a damaged product. The agent says it cannot view images and asks for a description, although your deployment supports image input. What is the likely fix?

- **A.** Pass images to the model as image content blocks (not file names or links) and explain their use.
- **B.** Images are never supported in support agents, so update the prompt to ask for a text description up front.
- **C.** Ask customers to describe the damage in text only, which is easier to log in the claims system than a photo.
- **D.** Convert the image to base64 text and insert it inside the user message, so the model receives the raw image data.

#### Correct answer to Question 7: A

The model sees an image only if it is sent as image content. The instructions should explain how to use it.

Claiming images are never supported is false. Text-only descriptions lose useful evidence. Base64 text inside the message is encoded text, not an image block.

## Scenario: Code Generation with Claude Code

### Question 8

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A new repository has no CLAUDE.md. What is a good starting point?

- **A.** Write a comprehensive 3,000-line CLAUDE.md from scratch covering every module, so nothing is ever left unexplained.
- **B.** Copy a well-maintained CLAUDE.md from another team's project unchanged, since good conventions apply everywhere.
- **C.** Run `/init` to generate a CLAUDE.md from the codebase, then review and curate it (commands, conventions, architecture).
- **D.** Leave it empty, since Claude Code can explore the codebase by itself and a CLAUDE.md only adds maintenance work.

#### Correct answer to Question 8: C

`/init` bootstraps memory from the code; human curation keeps it accurate and concise.

A 3,000-line file from scratch is excessive. Copying another team's file brings wrong conventions. Leaving it empty misses the benefits.

## Scenario: Multi-Agent Research System

### Question 9

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

In the Agent SDK, your coordinator never spawns subagents, even though subagent definitions exist. What is a likely cause?

- **A.** The coordinator lacks the delegation tool (e.g. Task is not in its allowed tools), so it cannot spawn.
- **B.** Subagents require a separate API key configured for each definition, otherwise the SDK silently skips them.
- **C.** Subagents are only supported in the Python version of the SDK, so definitions in other languages are ignored.
- **D.** The coordinator's temperature is too low, so it always prefers answering directly rather than delegating.

#### Correct answer to Question 9: A

Delegation happens through a tool; if the coordinator cannot use it, it cannot spawn subagents.

A per-subagent API key, a Python-only limitation or a low coordinator temperature are not the cause.

## Scenario: Structured Data Extraction

### Question 10

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

An unknown document arrives and could be any of 6 types. The extraction always uses the invoice schema and produces nonsense for others. What is the best design?

- **A.** Use one huge schema that combines all fields of the 6 types as optional, so any document can be extracted in one pass.
- **B.** Add a classification step (with `unknown/other`) that routes each document to its matching schema, unknowns to review.
- **C.** Silently reject every document that is not an invoice, so only well-formed invoice extractions reach downstream.
- **D.** Ask the model to extract whatever fields it considers relevant for each document and return them as free JSON.

#### Correct answer to Question 10: B

Classify-then-extract keeps schemas precise; an explicit unknown path avoids forced misclassification.

One huge all-optional schema weakens validation. Rejecting non-invoices loses documents. Free JSON with whatever fields the model chooses produces unpredictable output.

## Scenario: Claude Code for Continuous Integration

### Question 11

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Claude-generated PR descriptions sometimes describe changes that are not in the PR. What is the best approach?

- **A.** Stop generating PR descriptions with Claude and ask authors to write them manually, since accuracy cannot be guaranteed.
- **B.** Generate descriptions from the actual diff and commit messages, ask for factual summaries only, and have the author review them.
- **C.** Generate descriptions from the branch name and ticket title only, which keeps them short and avoids invented details.
- **D.** Make the descriptions much shorter, limiting them to two sentences, so there is less room for invented content.

#### Correct answer to Question 11: B

Grounding in the diff and human review prevents inaccurate descriptions.

Abandoning generated descriptions loses a useful aid. Branch name and ticket title alone give too little information. Two-sentence descriptions do not fix accuracy.

## Scenario: Developer Productivity with Claude

### Question 12

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

An engineer wants to upgrade a major dependency. The agent bumps the version and starts fixing compile errors one by one. What should it have done first?

- **A.** Upgrade all dependencies at once, so compatibility issues between libraries surface together in a single pass.
- **B.** Read the migration guide for breaking changes, search the affected APIs, then upgrade and verify with tests.
- **C.** Temporarily disable type checking so the project compiles, then fix any runtime errors as they appear in tests.
- **D.** Pin the old version permanently, since major upgrades are risky and the current version works for the project.

#### Correct answer to Question 12: B

A migration guide anticipates breaking changes, including behavior changes that do not cause compile errors.

Upgrading everything at once multiplies risk. Disabling type checking hides errors. Pinning the old version forever avoids necessary upgrades.

## Scenario: Customer Support Resolution Agent

### Question 13

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

When customers complain, the agent offers a 20% coupon, although no coupon policy exists. What is the best fix?

- **A.** Let the agent keep offering coupons, since satisfied customers are worth more than the cost of a 20% discount.
- **B.** Ask the agent to offer smaller coupons, such as 5% or 10%, to limit the financial impact of its goodwill gestures.
- **C.** Define allowed remedies in policy and tools (e.g. an `issue_credit` tool with limits) and offer only those ones.
- **D.** Add the word "coupon" to a banned word list in the output filter, so the agent can no longer mention coupons.

#### Correct answer to Question 13: C

Remedies must be authorized and controlled. Tools with limits enforce what can be offered.

Letting the agent keep offering coupons creates financial exposure. Smaller coupons still invent policy. A banned-word filter is easily bypassed.

## Scenario: Code Generation with Claude Code

### Question 14

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

You want a code-review subagent in Claude Code that can read the code but never modify files. How should you define it?

- **A.** State clearly in the subagent's prompt that it must never modify, create, or delete files, only read and comment.
- **B.** Use the main agent for reviews with a reminder at the start of each request not to edit any of the files it reads.
- **C.** Define the subagent (e.g. in `.claude/agents/`) with a tool list that includes read/search tools but not Edit/Write.
- **D.** Run the review inside a container with a read-only filesystem mount, so any write attempt fails at the OS level.

#### Correct answer to Question 14: C

Restricting the subagent's tools guarantees it cannot modify files.

A prompt rule in the subagent or a reminder to the main agent is probabilistic. A read-only container mount is excessive and impractical.

## Scenario: Multi-Agent Research System

### Question 15

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

Search queries generated by the coordinator are phrased to confirm the user's hypothesis (e.g., "evidence that X causes Y"). Reports are one-sided. What is the best fix?

- **A.** Ask the user to rephrase their request as a neutral hypothesis before research starts, so queries are unbiased.
- **B.** Add more sources of the same type to each search, so that the report covers a larger volume of evidence for X.
- **C.** Remove the user's hypothesis from the coordinator prompt, so the generated queries cannot be shaped by it.
- **D.** Make queries neutral, explicitly search for counter-evidence and alternatives, and report the balance found.

#### Correct answer to Question 15: D

Balanced search strategies reduce confirmation bias; synthesis should reflect the weight of evidence.

Asking the user to rephrase depends on them. Removing the hypothesis may lose the research focus. More sources of the same type amplify the bias.

## Scenario: Structured Data Extraction

### Question 16

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

The same contract extracted 5 times yields 2 different `termination_notice_days` values. You need reproducibility. What is the best set of actions?

- **A.** Accept the variance, since contracts are ambiguous by nature and two plausible values are an acceptable outcome.
- **B.** Average the values from the five runs and store the result, which balances out the inconsistency between runs.
- **C.** Run the extraction only once per contract and never re-run it, so the stored value is always consistent.
- **D.** Make extraction rules unambiguous (which clause prevails), lower randomness, and measure run-to-run agreement.

#### Correct answer to Question 16: D

Variance often indicates ambiguity in the rules. Clarifying them and measuring agreement improves consistency.

Accepting the variance ignores the issue. Running only once hides it. Averaging five runs produces an unsupported value.

## Scenario: Claude Code for Continuous Integration

### Question 17

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Claude-generated tests cover only the happy path. What is the best prompt improvement?

- **A.** Ask the model for more tests per function, so that a larger number of scenarios is covered by the test suite.
- **B.** Have the model list edge cases first (boundaries, invalid input, error paths), then test them in the existing style.
- **C.** Ask for 100% line and branch coverage, which forces the model to exercise every path, including error branches.
- **D.** Ask for shorter, more focused tests, which makes it easier for the model to cover several scenarios per function.

#### Correct answer to Question 17: B

Explicit edge-case enumeration produces better test design than asking for more tests.

More tests per function increase quantity, not coverage. 100% coverage can be met without meaningful assertions. Shorter tests are irrelevant to the problem.

## Scenario: Developer Productivity with Claude

### Question 18

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

The agent must read 12 independent configuration files. It reads them one per turn, slowly. What is the best improvement?

- **A.** Read only the 3 most important configuration files, which is usually enough to understand the overall setup.
- **B.** Concatenate all 12 files with a single Bash command into one large output, reading everything in one step.
- **C.** Issue the 12 independent Read calls in parallel in a single turn, so they are all retrieved at once.
- **D.** Ask the engineer to paste the content of all 12 files into the chat, which avoids tool calls entirely.

#### Correct answer to Question 18: C

Independent reads can run in parallel, reducing latency.

Reading only 3 files loses information. Concatenating everything in one Bash output is less structured. Asking the engineer to paste the files pushes work back.

## Scenario: Customer Support Resolution Agent

### Question 19

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

The agent calls `lookup_order` for the same order 6 times in one conversation, each returning the same data. Latency and cost grow. What is the best fix?

- **A.** Remove `lookup_order` and give the agent the order details in the system prompt at the start of each chat.
- **B.** Lower the tool's timeout so each repeated call returns faster, reducing the latency added by duplicate lookups.
- **C.** Keep key results in the case facts and have the agent reuse them, re-fetching only when a change is expected.
- **D.** Call `lookup_order` 6 times in parallel at the start, so all lookups complete together and latency is reduced.

#### Correct answer to Question 19: C

Reusing known results reduces redundant calls; refreshing after actions keeps data accurate.

Putting order details in the system prompt removes needed functionality. A shorter timeout or six parallel lookups do not reduce the number of calls.

## Scenario: Code Generation with Claude Code

### Question 20

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A developer accidentally let Claude Code make a series of bad edits over several steps and wants to go back to the state before them, including the conversation. What is the best option?

- **A.** Delete the local repository and clone it again from the remote, so the working copy matches the last pushed state.
- **B.** Use Claude Code's checkpoint/rewind feature to restore the earlier state (and/or git to restore the edited files).
- **C.** Ask Claude to undo its last edits from memory, since it remembers which changes it made during the session.
- **D.** Edit the affected files manually line by line, comparing them against the versions shown earlier in the chat.

#### Correct answer to Question 20: B

Checkpoints let you rewind code and conversation to an earlier point; git remains a safety net.

Deleting and recloning the repository loses unrelated work. Asking Claude to undo from memory is unreliable. Editing the files by hand is slow and error-prone.

## Scenario: Multi-Agent Research System

### Question 21

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

Two analysis subagents interpret the same clause of a regulation differently. Synthesis picks one arbitrarily. What is the best approach?

- **A.** Detect the disagreement and adjudicate against the quoted text, reporting the conclusion or flagging it uncertain.
- **B.** Always pick the first subagent's interpretation, so synthesis stays deterministic and reproducible across runs.
- **C.** Average the two interpretations into a combined reading that includes the common elements of both analyses.
- **D.** Drop the disputed clause from the report, since conflicting interpretations would only confuse the readers.

#### Correct answer to Question 21: A

Disagreements should be resolved with evidence or surfaced as uncertainty, not hidden.

Always picking the first interpretation is arbitrary. Averaging interpretations is meaningless. Dropping the clause loses information.

## Scenario: Structured Data Extraction

### Question 22

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Account numbers extracted from scans sometimes contain OCR errors (O vs 0, l vs 1). What is the best safeguard?

- **A.** Ask the model to be especially careful with letters and digits that look similar when it reads account numbers.
- **B.** Replace all letters O with 0 and l with 1 across the whole extracted output, since accounts use digits only.
- **C.** Ignore account numbers in extraction and let operators type them manually when they process each document.
- **D.** Validate identifiers deterministically (formats, check digits such as IBAN checksums) and route failures to review.

#### Correct answer to Question 22: D

Check digits and format rules catch many OCR errors reliably.

Asking the model to be careful is probabilistic. Ignoring account numbers loses data. Replacing O and l across the output corrupts text fields.

## Scenario: Claude Code for Continuous Integration

### Question 23

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

In CI you need to follow Claude Code's progress in real time in the logs, instead of seeing everything only at the end. What is the best option?

- **A.** Wait for the job to end and read the full output at once, since the final result is the only reliable view.
- **B.** Use a streaming output format (e.g. `--output-format stream-json`) and process events as they arrive.
- **C.** Run Claude twice, the first time only to preview the steps, and the second time to execute the actual task.
- **D.** Increase the verbosity level of the CI runner, so that every step of the job is printed in real time.

#### Correct answer to Question 23: B

Streaming output provides incremental events for monitoring.

Waiting for the full output is the current problem. Running twice wastes compute. Runner verbosity does not change Claude's output.

## Scenario: Developer Productivity with Claude

### Question 24

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

The agent calls an internal REST API via `curl` in Bash, handling tokens manually and parsing raw JSON. Errors are frequent and tokens appear in logs. What is the better approach?

- **A.** Continue using `curl` in Bash, but ask the agent to be careful with tokens and to validate every JSON response.
- **B.** Stop calling the API from the agent and ask engineers to fetch the needed data from it manually when required.
- **C.** Paste the API token into the system prompt, so the agent no longer needs to handle authentication in commands.
- **D.** Wrap the API in a custom MCP tool with a clear schema, built-in authentication handling, and structured errors.

#### Correct answer to Question 24: D

A dedicated tool encapsulates authentication and error handling, and gives the model a clear interface.

Keeping `curl` with a reminder keeps the risks. A token in the system prompt exposes secrets. Fetching data manually loses functionality.

## Scenario: Customer Support Resolution Agent

### Question 25

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer escalated yesterday and returns today. The agent has no memory of the case and asks them to start over. What is the best design?

- **A.** Politely ask the customer to repeat the details of their issue, so the agent works from the most current facts.
- **B.** Store the whole transcript of every past conversation in the system prompt, so the agent always has full history.
- **C.** Keep the conversation session open for several days, so the agent retains context until the case is resolved.
- **D.** Persist a case record (issue, actions, status, handoff summary) and load it at the start of new conversations later.

#### Correct answer to Question 25: D

Persistent, structured case records provide continuity across sessions.

Asking the customer to repeat everything frustrates them. Keeping the session open for days is impractical. Every past transcript in the system prompt leaks data across customers.

## Scenario: Code Generation with Claude Code

### Question 26

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A team prefers a new data-access pattern, but Claude Code keeps imitating the older pattern prevalent in legacy code. What is the best fix?

- **A.** Delete all legacy code that uses the old pattern, so Claude only sees examples of the new data-access pattern.
- **B.** Ask Claude to ignore older files in the repository when looking for examples of how to access data.
- **C.** Document the preferred pattern in project memory with a reference example, and mark the legacy one as deprecated.
- **D.** Lower the temperature, so Claude follows instructions more strictly and stops copying the prevalent pattern.

#### Correct answer to Question 26: C

Explicit guidance plus a canonical example outweighs imitation of prevalent legacy code.

Deleting all legacy code is impractical. "Ignore older files" is vague. Lower temperature does not change the pattern chosen.

## Scenario: Multi-Agent Research System

### Question 27

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The coordinator's context overflows after collecting long results from 12 subagents. What is the best fix?

- **A.** Use fewer subagents, so the total volume of results returned to the coordinator fits in its context window.
- **B.** Restart the coordinator with a fresh context whenever it fills up, re-sending it only the latest results.
- **C.** Truncate each subagent's result to 100 tokens before returning it, so all 12 results always fit comfortably.
- **D.** Have subagents store details externally (files) and return concise summaries with references for on-demand loading.

#### Correct answer to Question 27: D

External storage plus summaries keeps the coordinator's context manageable while preserving details.

Fewer subagents reduce coverage. Truncating to 100 tokens loses information. Restarting the coordinator loses state.

## Scenario: Structured Data Extraction

### Question 28

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Extraction from email threads picks up values from quoted older messages instead of the latest message. What is the best fix?

- **A.** Extract from the whole thread with equal weight, so no value is missed regardless of which message it is in.
- **B.** Define the authoritative part (latest message; quoted ones as context only) and optionally pre-split the messages.
- **C.** Extract values only from the first email in the thread, which usually contains the original request details.
- **D.** Ask the model to guess which message holds the current values, based on the tone and wording of the thread.

#### Correct answer to Question 28: B

Clear rules about authority and structure prevent mixing outdated values.

Equal weight across the thread causes the error. Using only the first email picks the oldest values. Guessing from tone is unreliable.

## Scenario: Claude Code for Continuous Integration

### Question 29

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

Your CI job runs Claude Code with network access, though it only needs the repository. You worry about exfiltration via injected instructions in PR content. What is the best measure?

- **A.** Restrict tools and network to what the job needs (deny web fetch, limit Bash), and keep secrets out.
- **B.** Keep network access enabled, since the job may need to download dependencies or documentation during review.
- **C.** Add an instruction to the CI prompt telling Claude never to send repository data to any external destination.
- **D.** Encrypt the repository at rest in the CI runner, so that any exfiltrated data would be unreadable outside.

#### Correct answer to Question 29: A

Least privilege on tools and network limits the impact of injection.

Keeping network access keeps the risk. A prompt rule is probabilistic. Encryption at rest does not prevent exfiltration of readable data.

## Scenario: Developer Productivity with Claude

### Question 30

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

An engineer asks for an architecture diagram of a service. The agent produces a diagram from file names, showing dependencies that do not exist. What is the best fix?

- **A.** Draw a simpler diagram with fewer components and arrows, so that fewer incorrect dependencies are shown.
- **B.** Derive dependencies from the actual code (imports, client calls, config), cite the evidence, and mark uncertain links.
- **C.** Base the diagram only on folder names, which reflect module boundaries more accurately than individual files.
- **D.** Ask the engineer to draw the architecture diagram, since only people who know the service can do it correctly.

#### Correct answer to Question 30: B

Diagrams should reflect evidence from code and config, with uncertainty marked.

A simpler diagram hides the problem. Folder names repeat it. Asking the engineer pushes work back.

## Scenario: Customer Support Resolution Agent

### Question 31

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A legal disclaimer must appear word-for-word at the end of every refund confirmation. The agent sometimes paraphrases it. What is the best fix?

- **A.** Repeat the full disclaimer three times in the system prompt, so the model treats it as critical fixed text.
- **B.** Append the disclaimer deterministically in code (confirmation template or post-processing), not via the model.
- **C.** Instruct the model to copy the disclaimer exactly, character by character, without changing any of its words.
- **D.** Shorten the disclaimer to a single sentence, which the model is much less likely to paraphrase or alter.

#### Correct answer to Question 31: B

Exact, required text is best inserted deterministically.

Repeating the disclaimer or asking for an exact copy remains probabilistic. A one-sentence version does not guarantee wording and may violate legal requirements.

## Scenario: Code Generation with Claude Code

### Question 32

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

You start Claude Code and want to continue the most recent conversation in this directory without choosing from a list. What is the right command?

- **A.** `claude --init`, which initializes the session in this directory by restoring the most recent conversation.
- **B.** `claude --resume` without arguments, which always picks the oldest session saved for this directory.
- **C.** `claude /clear`, which clears the input buffer and reopens the last conversation of the current directory.
- **D.** `claude --continue`, which resumes the most recent conversation in the current directory.

#### Correct answer to Question 32: D

`--continue` resumes the most recent conversation; `--resume` lets you choose a session.

`--resume` without arguments does not pick the oldest session: it lets you choose. `/clear` clears context. `--init` is not a resume option.

## Scenario: Multi-Agent Research System

### Question 33

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The search subagent fails on paywalled sources and reports nothing about them. Reports cite only open sources, and users do not know key studies were missed. What is the best fix?

- **A.** Report inaccessible sources as gaps (title, reason) and look for alternatives, noting limits.
- **B.** Ignore paywalled sources and keep only open-access results, since they can be verified by every reader.
- **C.** Use the abstract of each paywalled study and cite it as if the full paper had been read and analyzed.
- **D.** Stop the research as soon as a paywall is hit, so that the report is never based on partial evidence.

#### Correct answer to Question 33: A

Transparency about gaps and seeking legitimate alternatives keeps the report honest and complete.

Ignoring paywalled sources hides gaps. Citing abstracts as full papers overstates evidence. Stopping at the first paywall wastes the rest of the research.

## Scenario: Structured Data Extraction

### Question 34

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Your schema for medical reports has 6 levels of nested objects. Many outputs fail validation in deep nested parts. What is the best fix?

- **A.** Simplify the schema where possible (flatten nesting, split into focused passes), keeping what downstream needs.
- **B.** Make every field a string, so type mismatches in deep nested parts no longer cause validation failures.
- **C.** Add more levels of nesting to describe the data more precisely, which guides the model to the right place.
- **D.** Remove schema validation for the nested parts, so outputs are accepted and fixed downstream when needed.

#### Correct answer to Question 34: A

Overly complex schemas increase errors. Simpler or staged schemas improve reliability.

Making every field a string loses types. More nesting worsens the problem. Removing validation for nested parts hides errors.

## Scenario: Claude Code for Continuous Integration

### Question 35

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A new model version is released. Your CI reviewer uses an alias that automatically updates. After the update, comment volume doubles. What practice would have prevented the surprise?

- **A.** Never update models in CI, since any new version can change behavior in unpredictable ways for the team.
- **B.** Always use the newest model through the alias, since newer models are better and comment volume will adjust.
- **C.** Pin a specific model version in CI, and run the evaluation set on any new version before switching to it.
- **D.** Manually cut the number of comments in half after each update by filtering the lowest-priority findings.

#### Correct answer to Question 35: C

Pinning plus evaluation before upgrades keeps behavior predictable.

Never updating misses improvements. Always using the newest alias causes surprises. Manually halving comments is not a process.

## Scenario: Developer Productivity with Claude

### Question 36

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

Engineers ask the agent to print environment variables to debug configuration. The output includes API keys, which end up in shared logs. What is the best fix?

- **A.** Ask engineers not to print environment variables when debugging, and remind them regularly in team channels.
- **B.** Rotate all API keys daily, so that any key that ends up in shared logs is quickly no longer valid.
- **C.** Disable logging for agent sessions entirely, so no command output ever reaches the shared log storage.
- **D.** Block secret-dumping commands via hooks, redact secret patterns, show only needed variables.

#### Correct answer to Question 36: D

Deterministic filtering prevents secret exposure while preserving debugging ability.

Asking engineers not to print variables relies on discipline. Disabling logging loses logs. Daily rotation reduces impact but not exposure.

## Scenario: Customer Support Resolution Agent

### Question 37

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

`get_customer` occasionally returns another customer's data when the agent passes a mistyped email. What is the most important fix?

- **A.** Scope tool access server-side to the authenticated customer, so the agent cannot retrieve other customers' data.
- **B.** Ask the agent to double-check the spelling of email addresses before calling `get_customer` with them.
- **C.** Hide email addresses from the tool's responses, so other customers' contact data is never shown in chat.
- **D.** Use fuzzy matching on email addresses, so small typos still resolve to the most likely correct customer.

#### Correct answer to Question 37: A

Authorization must be enforced server-side, based on the authenticated identity.

Double-checking spelling is probabilistic. Hiding emails in responses is partial. Fuzzy matching increases mismatches.

## Scenario: Code Generation with Claude Code

### Question 38

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Claude Code is running a long refactor; the developer notices it heading in the wrong direction. What is the best action?

- **A.** Let it finish the refactor, then revert all of its changes with git and start again with a better prompt.
- **B.** Close the terminal immediately to stop the refactor before it makes further changes to the codebase.
- **C.** Interrupt it (e.g. with Esc), give corrective guidance about the direction, and continue from there.
- **D.** Start a new session immediately without explanation, so the wrong direction does not carry over.

#### Correct answer to Question 38: C

Interrupting and redirecting saves time and preserves useful context.

Letting it finish and reverting wastes time. Closing the terminal loses context. A new session without explanation loses the work and context.

## Scenario: Multi-Agent Research System

### Question 39

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The final research report is 40 pages; users want key conclusions quickly but also need detail. What is the best format?

- **A.** Start with an executive summary of key findings (with confidence and citations), then detailed sections.
- **B.** Cut the report down to 2 pages, keeping only the main conclusions, since users mostly want quick answers.
- **C.** Keep all 40 pages in a single unstructured narrative, so no detail or nuance from the research is lost.
- **D.** Provide only bullet points of the findings, which are faster to read than prose and easier to scan.

#### Correct answer to Question 39: A

Layered reports serve both quick reading and detail.

Two pages lose information. One unstructured 40-page narrative is hard to use. Bullet points only lose nuance and evidence.

## Scenario: Structured Data Extraction

### Question 40

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Human review is overloaded: 30% of extractions are flagged. Reviewers process them in arrival order. What is the best improvement?

- **A.** Hire more reviewers to clear the backlog faster, keeping the current flagging rules and arrival order.
- **B.** Stop flagging extractions for review, since 30% is too high and reviewers cannot keep up anyway.
- **C.** Prioritize review by risk and impact (high amounts, critical fields, low confidence) and fix causes.
- **D.** Have reviewers pick flagged items at random, so every type of extraction gets a fair chance of being checked.

#### Correct answer to Question 40: C

Risk-based prioritization uses reviewer time best; fixing common causes reduces volume.

More reviewers are costly and do not address causes. Stopping flagging hides errors. Random picking ignores risk.

## Scenario: Claude Code for Continuous Integration

### Question 41

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

The PR contains database migrations and application code. The general review misses migration risks (locking, backward compatibility). What is the best improvement?

- **A.** Ask the reviewer for a longer, more thorough review of every PR, so that migration risks are also covered.
- **B.** Exclude migration files from the AI review, since they are usually checked by the database team separately.
- **C.** Review only the migrations in PRs that contain them, since they carry the highest risk of the whole change.
- **D.** Add a migration checklist (applied when migration files are present) covering compatibility and lock risks.

#### Correct answer to Question 41: D

Conditional, domain-specific checklists focus attention on known risk areas.

A longer review of every PR is not targeted. Reviewing only the migrations misses the code. Excluding migration files misses the risk.

## Scenario: Developer Productivity with Claude

### Question 42

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

The repository's examples use a deprecated internal API, and the agent copies them in new code. What is the best fix?

- **A.** Delete the outdated examples from the repository, so the agent can no longer find and copy the deprecated API.
- **B.** Switch to a different model that is better at recognizing deprecated APIs from its general training data.
- **C.** Ask engineers to fix the deprecated calls in the agent's code during code review before each merge.
- **D.** Document deprecations and replacements in project rules with a preferred example to follow.

#### Correct answer to Question 42: D

Explicit deprecation guidance redirects the agent away from outdated patterns.

Deleting outdated examples may remove useful history. Fixing calls in code review wastes engineer time. A different model does not fix the input.

## Scenario: Customer Support Resolution Agent

### Question 43

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

Before launch, you want to test the support agent against manipulative customers (social engineering, injection, abuse). What is the best approach?

- **A.** Launch and wait for real customers to reveal manipulation attempts, then fix problems as they are reported.
- **B.** Test only the main happy paths before launch, since adversarial customers are rare in real support traffic.
- **C.** Ask the agent directly whether it is secure against manipulation and review its self-assessment carefully.
- **D.** Build an adversarial test set (red teaming, simulated customers), measure compliance, fix with hard controls.

#### Correct answer to Question 43: D

Adversarial testing before launch reveals vulnerabilities; fixes should be structural where possible.

Waiting for real customers risks harm. Testing only happy paths misses risks. The agent's self-assessment is not evidence.

## Scenario: Code Generation with Claude Code

### Question 44

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A developer tries a bug fix with Claude Code, but the problem is hard and the first attempts are shallow. What is a good way to get deeper reasoning?

- **A.** Ask Claude to think more thoroughly (extended thinking) and plan before coding, providing reproduction details.
- **B.** Repeat the same prompt several times, since each attempt explores a slightly different solution to the bug.
- **C.** Ask for shorter answers, so Claude focuses on the single most likely cause instead of listing many options.
- **D.** Disable tools, so Claude reasons about the bug in depth instead of spending its effort on exploring files.

#### Correct answer to Question 44: A

Extended thinking and planning help with complex problems, especially with good reproduction details.

Repeating the same prompt repeats the same result. Shorter answers reduce depth. Disabling tools removes the ability to investigate.

## Scenario: Multi-Agent Research System

### Question 45

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

A user asks follow-up questions about a completed research report. The system re-runs full research for each question. What is the best design?

- **A.** Store findings (with sources) from the run and answer follow-ups from them, researching only real gaps.
- **B.** Keep re-running full research for each follow-up, so every answer reflects the most current sources.
- **C.** Refuse follow-up questions and ask users to submit a new research request with the expanded question.
- **D.** Answer follow-ups from the model's general knowledge, which is fast and needs no further searching.

#### Correct answer to Question 45: A

Reusing stored findings is efficient and consistent; targeted research fills real gaps.

Re-running full research for each follow-up wastes budget. Refusing follow-ups reduces usefulness. General knowledge loses grounding.

## Scenario: Structured Data Extraction

### Question 46

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Your validation set is from last year. New supplier templates have appeared, and production errors rise while the validation score stays at 97%. What is the best fix?

- **A.** Trust the 97% validation score, since it was measured carefully and production errors may be due to noise.
- **B.** Retrain or rebuild the evaluation set once a year, aligning it with the annual supplier contract renewals.
- **C.** Stop measuring validation accuracy, since it clearly no longer reflects production and only gives false comfort.
- **D.** Continuously sample and label production documents (by supplier/type) to refresh the eval set and catch drift.

#### Correct answer to Question 46: D

Evaluation sets must reflect current data; ongoing sampling detects drift.

Trusting the 97% score ignores real performance. Stopping measurement removes visibility. A yearly refresh is too slow.

## Scenario: Claude Code for Continuous Integration

### Question 47

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A reviewer bot is allowed to approve PRs automatically when it finds no issues. A PR with a subtle bug gets merged without human review. What is the best change?

- **A.** Make the bot stricter, so it approves PRs automatically only when it is highly confident there are no issues.
- **B.** Let the bot comment only; approval and merge decisions stay with humans and with the required checks.
- **C.** Require two independent review bots to approve before an automatic merge, so one bot catches the other's misses.
- **D.** Disable automatic approvals on Fridays, when subtle bugs are most likely to slip through before the weekend.

#### Correct answer to Question 47: B

Automated review is an aid; approval requires human accountability.

A stricter bot that still auto-approves, two approving bots, or no approvals on Fridays all keep automation as the decision-maker or are irrelevant.

## Scenario: Developer Productivity with Claude

### Question 48

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

The agent's `Read` tool is used on a 300 MB binary asset to "check its content." What is the best behavior?

- **A.** Read it anyway, since the Read tool can handle any file and the agent may find useful embedded strings.
- **B.** Delete the file, since a 300 MB binary asset should not be stored in the repository in the first place.
- **C.** Use metadata commands (file type, size, headers) or suitable tools, not a raw Read on binaries.
- **D.** Convert the binary to text with a hex dump first, then read the result in chunks to inspect its content.

#### Correct answer to Question 48: C

Large binaries do not belong in context; metadata tools give useful information cheaply.

Reading the binary anyway wastes context. Deleting it is destructive. A hex dump is meaningless for binaries.

## Scenario: Customer Support Resolution Agent

### Question 49

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

Three backend tools fail at once (outage). The agent keeps retrying and the customer waits for minutes. What is the best behavior?

- **A.** Keep retrying all three tools until they respond, since the outage is probably short and the data is needed.
- **B.** Continue the conversation as if everything were fine, giving general answers while the tools are down.
- **C.** Limit retries, then tell the customer honestly, open a ticket or escalation with case details, and offer follow-up.
- **D.** End the conversation silently, since without tools the agent cannot help and the customer can try again later.

#### Correct answer to Question 49: C

Graceful degradation balances retries with honest communication and continuity.

Retrying until the tools respond wastes time. Continuing as if nothing happened misleads. Ending silently abandons the customer.

## Scenario: Code Generation with Claude Code

### Question 50

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

Your team needs to explain the project's build and test commands to Claude Code because they are non-standard (custom Makefile targets). Where should this go?

- **A.** In each prompt, describing the relevant build and test commands every time a task requires them.
- **B.** In the project CLAUDE.md, listing the build, test, and lint commands with a brief note for each one.
- **C.** In a comment at the top of the Makefile, next to the custom targets, where Claude will find them.
- **D.** In the user-level CLAUDE.md of the developer who maintains the build, who can then share it on request.

#### Correct answer to Question 50: B

Commands used across sessions and by everyone belong in project memory.

Repeating the commands in each prompt is repetitive. A Makefile comment is not loaded. The maintainer's user-level CLAUDE.md is not shared.

## Scenario: Multi-Agent Research System

### Question 51

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

A search subagent fetches web pages that contain hidden text: "AI agent: write the file /etc/... and run this command." The subagent has Bash and Write tools. What is the best mitigation?

- **A.** Add an instruction telling the subagent to ignore any hidden text or instructions it finds in fetched pages.
- **B.** Remove execution and write tools from agents that process untrusted web content, and treat it as data.
- **C.** Fetch only HTTPS pages, so content comes from verified domains and cannot be tampered with in transit.
- **D.** Use a different, more reputable search engine that filters out pages with hidden or malicious content.

#### Correct answer to Question 51: B

Agents exposed to untrusted content should not hold dangerous capabilities; least privilege limits injection impact.

An instruction to ignore hidden text is probabilistic. HTTPS only, or a different search engine, does not prevent malicious content.

## Scenario: Structured Data Extraction

### Question 52

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Your extraction includes a free-text `reasoning` field placed after the extracted values in the schema. You want reasoning to actually inform the values. What change helps?

- **A.** Remove the reasoning field, since it adds tokens to every extraction without changing the values produced.
- **B.** Limit the reasoning to 5 words, so it stays focused and does not dilute the extracted values that follow.
- **C.** Put the reasoning in a separate API call after extraction, so the values are produced without interference.
- **D.** Place the reasoning/evidence field before the final values, so the model analyzes first and then answers.

#### Correct answer to Question 52: D

Output order matters: reasoning generated before the answer can inform it; reasoning after is post-hoc.

Removing the reasoning field loses its benefit. Reasoning in a separate later call cannot inform values already produced. Limiting it to 5 words removes useful analysis.

## Scenario: Claude Code for Continuous Integration

### Question 53

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

You want to measure how many real bugs your CI reviewer catches (recall), not just how many comments are correct. What is the best approach?

- **A.** Count the total number of review comments per PR, since more comments mean more bugs are being caught.
- **B.** Create test PRs with known seeded bugs (and historical production bugs) and measure how many are found.
- **C.** Survey developers regularly on how useful and accurate they feel the reviewer's comments are.
- **D.** Measure the reviewer's time per PR, since a thorough review that catches bugs takes noticeably longer.

#### Correct answer to Question 53: B

Recall requires ground truth: known bugs to find.

Counting comments, surveying developers or timing reviews do not measure detection of real bugs.

## Scenario: Developer Productivity with Claude

### Question 54

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

Engineers ask the agent every Monday to generate the same dependency report by hand. What is the best improvement?

- **A.** Keep asking the agent every Monday, since it can adapt the report to anything new that happened that week.
- **B.** Have the agent write a script for the report once, review it, and schedule it, using the agent only to interpret.
- **C.** Stop producing the report, since a weekly manual task that nobody automates is probably not worth the effort.
- **D.** Rotate the task among engineers each week, so no single person carries the repetitive work every Monday.

#### Correct answer to Question 54: B

Repetitive deterministic tasks should become scripts; the agent adds value in building and interpreting.

Asking the agent every Monday wastes effort. Stopping the report loses information. Rotating the task among engineers does not automate it.

## Scenario: Customer Support Resolution Agent

### Question 55

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

You evaluate escalation decisions. The team only tracks unnecessary escalations (to reduce human workload). What is missing?

- **A.** Also measure missed escalations (cases that should have been escalated), since optimizing one side alone is risky.
- **B.** Nothing is missing: tracking unnecessary escalations is enough, since it directly reduces human workload.
- **C.** Measure the average message length of escalated conversations, to see whether they are unusually complex.
- **D.** Measure the customer's typing speed and response time, which indicates frustration before escalation.

#### Correct answer to Question 55: A

Both error types matter: false positives cost time, false negatives cost risk and trust.

Tracking only unnecessary escalations ignores the risk. Message length and typing speed are irrelevant.

## Scenario: Code Generation with Claude Code

### Question 56

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A large cross-cutting change will be implemented with Claude Code. The team wants changes to be reviewable and safe. What is the best strategy?

- **A.** Implement everything in one large PR at the end, so the change is reviewed as a whole and stays consistent.
- **B.** Skip running tests during the change to move faster, and run the full test suite once at the very end.
- **C.** Let Claude merge each change directly once it compiles, since reviewing a large refactor manually is slow.
- **D.** Break the change into incremental steps, each one implemented, tested, and reviewed as a smaller PR.

#### Correct answer to Question 56: D

Incremental changes are easier to verify and roll back.

One large PR at the end is hard to review. Direct merges once it compiles remove oversight. Skipping tests until the end removes safety.

## Scenario: Multi-Agent Research System

### Question 57

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

Users complain they wait 10 minutes without feedback during research. What is the best improvement?

- **A.** Make research shorter by limiting sources and subagents, so results arrive faster regardless of quality.
- **B.** Hide the progress bar, so users do not watch the time pass and perceive the wait as shorter than it is.
- **C.** Stream progress updates (plan, completed subtasks, partial findings) while research runs.
- **D.** Run research only overnight as a batch job and deliver reports by email the next morning.

#### Correct answer to Question 57: C

Progress visibility improves the experience without sacrificing quality.

Shorter research sacrifices quality. Hiding the progress bar worsens the experience. Overnight batch reports do not fit interactive use.

## Scenario: Structured Data Extraction

### Question 58

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

Your high-volume synchronous extraction hits rate limits (HTTP 429) during peaks and fails documents. What is the best handling?

- **A.** Mark the documents that hit the rate limit as failed and let the operations team resubmit them later.
- **B.** Rotate through a pool of API keys, using a new key for each request, so no single key hits the limit.
- **C.** Retry immediately in a tight loop until the request succeeds, so documents are delayed as little as possible.
- **D.** Retry with exponential backoff and jitter, respect retry-after, control concurrency, batch non-urgent work.

#### Correct answer to Question 58: D

Backoff, concurrency control, and batching for non-urgent work handle rate limits robustly.

Marking documents as failed loses work. Tight-loop retries worsen congestion. Rotating API keys circumvents limits improperly.

## Scenario: Claude Code for Continuous Integration

### Question 59

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

You want CI-specific instructions (e.g., "output JSON findings only") without changing the project CLAUDE.md used interactively. What is a good approach?

- **A.** Edit CLAUDE.md in the CI job before each run, adding the CI-specific rules and reverting them afterwards.
- **B.** Create a separate repository for CI with its own CLAUDE.md, syncing the code from the main repository.
- **C.** Pass CI-specific instructions in the invocation (prompt or appended system prompt), keeping CLAUDE.md shared.
- **D.** Define the CI-specific instructions as environment variables in the job, which Claude Code reads at start.

#### Correct answer to Question 59: C

Task-specific instructions belong in the invocation; shared conventions stay in project memory.

Editing CLAUDE.md in CI before each run is fragile. A separate CI repository is excessive. Environment variables do not deliver instructions to the model.

## Scenario: Developer Productivity with Claude

### Question 60

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

An MCP tool returns errors as plain text "fail" with `isError` false. The agent treats failures as valid data. What is the best fix?

- **A.** Fix the tool to set `isError: true` on failure and return structured error details (category, retryability).
- **B.** Instruct the agent to check every tool response for the word "fail" and treat those responses as errors.
- **C.** Ignore tool errors in the agent flow, since the backend will log them and the team can fix them later.
- **D.** Remove the tool from the agent, since a tool that does not report errors properly cannot be trusted.

#### Correct answer to Question 60: A

Tools should signal errors explicitly and descriptively so the agent can react correctly.

Checking responses for the word "fail" is fragile. Ignoring tool errors causes wrong behavior. Removing the tool loses functionality.
