---
title: "Questions and Answers: Practice Test 1 – Claude Certified Architect"
duration_minutes: 120
difficulty: facile
---

# Questions and Answers: Practice Test 1 – Claude Certified Architect

## Scenario: Customer Support Resolution Agent

### Question 1

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A support agent ends its loop when the response text contains the phrase "Can I help you with anything else?". In production, it sometimes stops before the customer receives the refund, and other times it keeps calling tools endlessly. What is the most correct fix?

- **A.** Increase `max_tokens` to give Claude more room to conclude the refund before writing the closing phrase.
- **B.** Stop the loop after three iterations, using the iteration count as the only exit criterion for every case.
- **C.** Ask Claude in the system prompt to write "DONE" at the end of every final response, and exit on that word.
- **D.** Exit the loop when `stop_reason` is `end_turn`, with an iteration limit only as a secondary safety net.

#### Correct answer to question 1: D

The loop must end on `stop_reason`, not on the text content. An iteration limit is only a fallback protection.

## Scenario: Customer Support Resolution Agent

### Question 2

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

For a customer requesting a refund, the agent must always call `get_customer` as its first tool, before any other action. Which `tool_choice` value guarantees this in the first turn?

- **A.** `{"type": "auto"}`
- **B.** `{"type": "none"}`
- **C.** `{"type": "tool", "name": "get_customer"}`
- **D.** `{"type": "any"}`

#### Correct answer to question 2: C

The named `tool` form is the only one that forces a specific tool. `any` guarantees a call, but lets Claude choose which tool.

## Scenario: Customer Support Resolution Agent

### Question 3

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

The team wants to prevent `process_refund` from running if the customer has not been verified. What is the most reliable solution?

- **A.** A `PreToolUse` hook on `process_refund` that blocks execution until `get_customer` has returned a verified ID.
- **B.** A clear line in the system prompt saying "never issue a refund without first verifying the customer's identity".
- **C.** A `PostToolUse` hook that cleans up or reverts the refund result when the customer turns out to be unverified.
- **D.** Setting the temperature to 0, so that Claude behaves more cautiously and follows the verification step.

#### Correct answer to question 3: A

Financial rules should be enforced deterministically, with a hook before execution. An instruction in the prompt is probabilistic.

## Scenario: Customer Support Resolution Agent

### Question 4

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

`process_refund` returns a business error: the requested refund ($180) exceeds the automatic approval limit of $100. How should the agent react?

- **A.** Retry the call with progressive backoff, since the approval limit might be raised or change in the meantime.
- **B.** Explain the refund policy to the customer, or escalate the case to a human agent who is able to approve it.
- **C.** Correct the amount downward and retry the call until the request falls within the limit and passes.
- **D.** Retry the call with different parameters until the refund operation finally succeeds for the customer.

#### Correct answer to question 4: B

Business errors are not solved by retrying: they must be explained or passed to a person.

## Scenario: Customer Support Resolution Agent

### Question 5

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

A customer writes in capital letters, "I'M FURIOUS!!!", about a duplicate $5 charge that is clearly visible in the history. What is the correct action?

- **A.** Escalate immediately to a human agent, because writing in capital letters signals urgency and distress.
- **B.** Escalate the case, because the very heated tone of the message signals a more complex underlying problem.
- **C.** Ask the model for a reliability score on its own assessment and decide whether to escalate based on that.
- **D.** Resolve the problem while acknowledging the frustration: a simple charge does not need escalation.

#### Correct answer to question 5: D

Emotion and tone are not the same as complexity. The case is simple and the agent can resolve it.

## Scenario: Customer Support Resolution Agent

### Question 6

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

After the conversation was compacted, the agent refers to order number 67890 as "a recent order" and can no longer confirm the exact amount of $149.99. Which solution would have prevented this?

- **A.** Increase the size of the context window, so that compaction is triggered later in the conversation.
- **B.** Extract the case facts (order numbers, amounts, dates) into a persistent block that is not summarized.
- **C.** Disable compaction entirely, so that the full conversation history is always kept in the context.
- **D.** Repeat all the order details in every user message, so they are always present in the latest turns.

#### Correct answer to question 6: B

A summary turns exact numbers into paraphrases. The fact block keeps them verbatim.

## Scenario: Customer Support Resolution Agent

### Question 7

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

The agent calls `lookup_order` and receives a 503 error (service unreachable). It tells the customer: "There is no order with this number." What is the problem and the fix?

- **A.** There is no problem: the agent should always answer the customer with confidence, even when tools fail.
- **B.** The search never ran because the service failed: the agent must say so, retry, or report the failure.
- **C.** The coordinator must stop the entire case workflow as soon as any tool returns a server error.
- **D.** The `max_tokens` value must be increased to leave the agent more room to formulate its answer.

#### Correct answer to question 7: B

A service error is not an empty result. Saying "it does not exist" when the search was never performed is a silent suppression of the error.

## Scenario: Customer Support Resolution Agent

### Question 8

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

From customer messages, the agent must extract the order number, but customers often do not provide it. The schema requires an `order_number` string field, mandatory. What happens, and what is the fix?

- **A.** It is fine as it is: just increase the number of validation retries to five for these messages.
- **B.** It is fine as it is: just add "always find the order number in the message" to the prompt.
- **C.** The field should be nullable, `["string", "null"]`, since the information may be absent.
- **D.** The field should be moved into a batch request, so that the extraction gets more retries.

#### Correct answer to question 8: C

If information can be missing and everything is mandatory, the model tends to invent it. The value `null` correctly represents absence.

## Scenario: Customer Support Resolution Agent

### Question 9

You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.

The coordinator delegates to a subagent the verification of an order, writing only "analyze the customer's problem" in the prompt. The subagent returns a generic analysis. What is the cause and the fix?

- **A.** The subagent inherits the coordinator's history, so raising its temperature is enough to get specifics.
- **B.** The subagent's turn limit is too low and must be raised, so it has time to dig into the case.
- **C.** The subagent should receive only the tool to call, with no additional instructions in its prompt.
- **D.** Subagents do not inherit context: include customer ID, order, amount and a precise request.

#### Correct answer to question 9: D

Subagents start from zero. Everything they need must be written into their prompt.

## Scenario: Code Generation with Claude Code

### Question 10

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A developer wants their personal working preferences (for example, detailed explanations) to apply to all projects they work on, without sharing them with the team. Where should they be written?

- **A.** `./CLAUDE.md` in the project.
- **B.** `~/.claude/CLAUDE.md`.
- **C.** `./src/CLAUDE.md`.
- **D.** `./CLAUDE.local.md` in the project.

#### Correct answer to question 10: B

The user file applies to all projects and stays personal. `CLAUDE.local.md` applies to a single project only.

## Scenario: Code Generation with Claude Code

### Question 11

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A team must rewrite the authentication system, which involves fifteen files and has several valid approaches. Which mode should they use to start?

- **A.** Plan mode: explore, design, and wait for approval before modifying anything in the codebase at all.
- **B.** Direct execution, one file at a time, verifying each change with tests before moving on.
- **C.** `bypassPermissions`, so the rewrite of the fifteen files is not interrupted by approval prompts.
- **D.** A `general-purpose` subagent that receives the full conversation history and does the rewrite.

#### Correct answer to question 11: A

Changes across several files with architectural decisions require a plan before action.

## Scenario: Code Generation with Claude Code

### Question 12

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A skill deploys to production. The team wants Claude never to trigger it on its own: it must be run only by the user with `/deploy`. Which frontmatter field is needed?

- **A.** A vaguer `description`, so Claude does not recognize it.
- **B.** `user-invocable: false`.
- **C.** `context: fork`.
- **D.** `disable-model-invocation`

#### Correct answer to question 12: D

`disable-model-invocation: true` prevents Claude from invoking the skill, leaving its use only to the user.

## Scenario: Code Generation with Claude Code

### Question 13

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A skill with the steps "1. Analyze, 2. Verify, 3. Summarize" is invoked at the start of the session. Ten turns later, Claude seems to have forgotten step 2. What is the most likely cause and the fix?

- **A.** The context window is too small for the session: a model with a bigger context window is needed.
- **B.** The `SKILL.md` file is reread only on first launch, so the skill should be moved into `CLAUDE.md`.
- **C.** The skill body enters the conversation only once: rules that must persist belong in `CLAUDE.md`.
- **D.** The `context: fork` setting deletes the skill instructions from the session after the first turn.

#### Correct answer to question 13: C

The skill body is not reread in later turns. Rules that must hold for the whole session belong in a file that is always loaded.

## Scenario: Code Generation with Claude Code

### Question 14

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

The team wants its test conventions to apply to all `*.test.ts` files, scattered across many folders. What is the most maintainable approach?

- **A.** A `CLAUDE.md` in every folder that contains tests.
- **B.** A single file in `.claude/rules/` with `paths: ["**/*.test.ts"]`.
- **C.** The conventions in the project's `CLAUDE.md`, with no restrictions.
- **D.** Moving all tests into a `tests/` folder with its own `CLAUDE.md`.

#### Correct answer to question 14: B

A single rule with `paths:` covers all files, including those created in the future.

## Scenario: Developer Productivity with Claude

### Question 15

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A developer must understand the architecture of a forty-file codebase, without filling the main conversation with raw file contents. Which solution is most suitable?

- **A.** The built-in `Explore` subagent, with a summary.
- **B.** Asking Claude to read all the files in the main conversation.
- **C.** `bypassPermissions` mode to read faster.
- **D.** The `Write` tool to generate an architecture document.

#### Correct answer to question 15: A

`Explore` is a read-only subagent that returns only the summary, leaving the main context clean.

## Scenario: Developer Productivity with Claude

### Question 16

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

Claude Code must find where a function is defined in an unfamiliar codebase. Which sequence of tools is most efficient?

- **A.** `Read` on every file in the project, one after another, until the function definition is found.
- **B.** `Bash` with `cat` on all the files of the project, then search the output for the function.
- **C.** `Write` to create an index of all files and their functions, then search that index file.
- **D.** `Grep` to find the entry points, then `Read` the relevant files, then follow the imports.

#### Correct answer to question 16: D

Targeted exploration avoids consuming context with irrelevant files.

## Scenario: Code Generation with Claude Code

### Question 17

You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.

A session was interrupted, and the next day the user resumes it with `--resume`. In the meantime, some files in the codebase were modified. What is the correct approach?

- **A.** Resume without saying anything, since the session context updates automatically with the files.
- **B.** Open a completely new session with no summary, so that no outdated information is carried over.
- **C.** Resume with `--resume`, tell Claude explicitly which files changed, and ask it to reanalyze those files.
- **D.** Fork the session, since a forked session automatically inherits the updated versions of the files.

#### Correct answer to question 17: C

Claude does not realize on its own that previous results are outdated: this must be stated explicitly.

## Scenario: Developer Productivity with Claude

### Question 18

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

The `Edit` tool returns an error because the text to replace appears twice in the file. What is the right fix?

- **A.** Use `Bash` with `sed` to replace the text, without checking which occurrence was actually changed.
- **B.** Include more surrounding text, so that the fragment to replace becomes unique in the file.
- **C.** Rewrite the whole file with `Write` from memory, without reading its current content first.
- **D.** Ignore the error and proceed with the next change, leaving this one for the developer to apply.

#### Correct answer to question 18: B

`Edit` requires unique text. More context around the fragment resolves the ambiguity.

## Scenario: Multi-Agent Research System

### Question 19

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

A coordinator must launch three subagents that work in parallel: one searches the web, one analyzes documents, one collects financial data. How should this be done?

- **A.** Three `Agent` calls emitted in the same coordinator response.
- **B.** Three `Agent` calls across three different turns, one after another.
- **C.** A single agent with all three tasks in sequence.
- **D.** The three subagents pass the work directly to each other.

#### Correct answer to question 19: A

Parallelism is obtained by sending multiple `Agent` calls in the same response.

## Scenario: Multi-Agent Research System

### Question 20

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

A synthesis subagent returns a discursive text in which it is unclear which claim comes from which source, or when. Which output format is most useful to the coordinator?

- **A.** A single, well-written summary paragraph, which is the most readable format for the coordinator.
- **B.** The raw text of all the pages consulted, so the coordinator can find the sources by itself.
- **C.** Plain text without dates, because dates clutter the synthesis and rarely matter to the claims.
- **D.** A structure with claim, source, publication date and source type recorded for every single item.

#### Correct answer to question 20: D

Separating content from metadata lets the coordinator evaluate the reliability of each claim.

## Scenario: Multi-Agent Research System

### Question 21

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

Two subagents report different values for the same metric: a press release says $2.3B, an SEC filing says $2.28B. What is the coordinator's best behavior?

- **A.** Compute the average of the two values and report it as the best estimate for the metric.
- **B.** Use the most recent value without flagging anything, since newer data usually supersedes older.
- **C.** Annotate the conflict with both sources and notes, indicating which one is more authoritative.
- **D.** Discard both values and repeat the search until the sources agree on a single figure.

#### Correct answer to question 21: C

Conflicting data must be annotated, not silently resolved.

## Scenario: Multi-Agent Research System

### Question 22

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

A synthesis states "the unemployment rate is 3.7%" without dates. A reader compares it with another value from the following month and concludes the two data points contradict each other. What is the fix?

- **A.** Delete one of the two values from the synthesis, so the reader is not confused by the difference.
- **B.** Add explicit dates to each of the two values: `data_as_of`, `source_published` and `retrieved_on`.
- **C.** Round both values to the same number, so the small difference between them disappears.
- **D.** Merge the two sources into a single claim that reports one combined unemployment rate.

#### Correct answer to question 22: B

Without dates, two values that are each correct for different periods look contradictory. Dates clarify the reference period.

## Scenario: Multi-Agent Research System

### Question 23

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

The coordinator must research "creative industries", but the subtasks only cover visual arts. The final report is incomplete. What is the fix?

- **A.** Accept the result as it is, since visual arts are a legitimate and central part of the topic.
- **B.** Raise the temperature of the subagents, so that they produce broader and more varied answers.
- **C.** Increase `max_tokens` for the subagents, so each one can write a longer, more complete report.
- **D.** Relaunch the work with a broader decomposition and with explicit checks on topic coverage.

#### Correct answer to question 23: D

The coordinator must evaluate the quality of the synthesis and relaunch the work when coverage is insufficient.

## Scenario: Multi-Agent Research System

### Question 24

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

Only one source mentions a planned acquisition. Which phrasing in the synthesis correctly communicates the level of certainty?

- **A.** "The acquisition took place, according to recent reports from the industry press."
- **B.** "Acquisition confirmed by the market, as reported by sources following the company."
- **C.** "The acquisition will probably happen in the coming months, according to analysts."
- **D.** "Single source: so far, only one news report mentions the planned acquisition at all."

#### Correct answer to question 24: D

Syntheses must distinguish levels of certainty and state when a single source supports a claim.

## Scenario: Multi-Agent Research System

### Question 25

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

A researcher wants to test two analysis strategies starting from the same base, without one overwriting the other. Which command or approach is most suitable?

- **A.** `--resume` on both strategies, one after the other, starting each from the same session ID.
- **B.** Resume a single session and pick the most promising strategy by judgment, testing only that one.
- **C.** `--fork-session`, which creates two branches with new session IDs, both starting from the same base.
- **D.** Delete the session and start over from scratch for each strategy, rebuilding the base twice.

#### Correct answer to question 25: C

`--fork-session` creates an independent branch, with a new ID, starting from the same base.

## Scenario: Multi-Agent Research System

### Question 26

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

A research conversation has become long. The team wants to summarize it in a controlled way, keeping the last turns verbatim, and to keep working while the summary is written. Which approach fits best?

- **A.** Threshold compaction, which triggers automatically when the context reaches a set size.
- **B.** On-request compaction, excluding the last few turns from the summary that it writes.
- **C.** Context editing with `clear_tool_uses`, which removes old tool results from the history.
- **D.** Keep the full history with no intervention, since long contexts are handled by the model.

#### Correct answer to question 26: B

On-request compaction lets you control which turns are summarized and continue working in the background.

## Scenario: Multi-Agent Research System

### Question 27

You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.

Subagent A produces data that subagent B must use for its analysis. How should the information pass between them?

- **A.** Subagent A writes its output directly into subagent B's context window when it finishes.
- **B.** The two subagents exchange messages with each other directly until B has what it needs.
- **C.** Subagent B repeats subagent A's search on its own, so it has the same data first-hand.
- **D.** The coordinator receives A's output and passes it on to B, inside B's own prompt.

#### Correct answer to question 27: D

Subagents do not communicate with each other: everything goes through the coordinator.

## Scenario: Developer Productivity with Claude

### Question 28

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A developer registers an MCP server that must be available only in their own work on a specific project, without ending up in the shared repository. Where should it be registered?

- **A.** In the project scope, in the `.mcp.json` file at the root of the project repository.
- **B.** In the user scope, which applies to all of the developer's projects on that machine.
- **C.** In the local scope, stored in `~/.claude.json` and tied to the project's path.
- **D.** In the managed scope, configured by the administrator for the developer's machine.

#### Correct answer to question 28: C

The local scope is the default and is not shared. `.mcp.json` would be shared with the team.

## Scenario: Developer Productivity with Claude

### Question 29

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

An MCP server requires a database password, and the `.mcp.json` file is shared via Git with the team. How should the credential be handled?

- **A.** Write `${DATABASE_URL}` in the file and keep the real value in the environment.
- **B.** Write the password directly in the file, so everyone on the team can find and use it.
- **C.** Put it in a separate `.mcp-secrets.json` file committed together with the project.
- **D.** Insert it into the project's `package.json`, in a dedicated configuration section.

#### Correct answer to question 29: A

The shared file contains only the placeholder, while the secret stays in the environment, outside the repository.

## Scenario: Developer Productivity with Claude

### Question 30

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A team wants to connect Claude to a remote MCP server on the internet that requires OAuth authentication. Which transport should be used?

- **A.** `stdio`
- **B.** `sse`
- **C.** `ws`
- **D.** `http`

#### Correct answer to question 30: D

Among remote transports, `http` (streamable-http) is the only one that supports OAuth.

## Scenario: Developer Productivity with Claude

### Question 31

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

In an MCP configuration file, an entry has a `url` field but no `type` field. What happens, and what is the fix?

- **A.** No fix is needed: Claude infers the transport from the URL and still uses the server.
- **B.** The entry is ignored: a `type` field that matches the server's transport has to be added.
- **C.** The `url` must be moved into the `env` field, where remote server addresses are read.
- **D.** The file must be renamed, because only correctly named files can declare remote servers.

#### Correct answer to question 31: B

An entry with `url` but without `type` is a configuration error and is ignored.

## Scenario: Claude Code for Continuous Integration

### Question 32

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A pipeline runs `claude -p` and loads an MCP server defined in the project. The team does not want that server used in CI. What is the correct action?

- **A.** Nothing needs to be done: in `-p` mode Claude always asks for approval of project servers.
- **B.** Start the pipeline with automatic approval of all servers, so the configuration is explicit.
- **C.** Explicitly exclude that server, since non-interactive sessions load it without asking.
- **D.** Remove the `-p` flag, so the pipeline runs interactively and the server needs approval.

#### Correct answer to question 32: C

In non-interactive sessions there is no one to approve, so the server must be excluded explicitly.

## Scenario: Developer Productivity with Claude

### Question 33

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A custom subagent has `permissionMode: plan` in its frontmatter. The parent session is started with `bypassPermissions`. What happens?

- **A.** The subagent cannot change its parent's mode, so it stays in `bypassPermissions`.
- **B.** The subagent uses plan mode as written in its frontmatter, overriding the parent session.
- **C.** The subagent asks for confirmation before every tool it uses, as a compromise between modes.
- **D.** The configuration is invalid, so the subagent fails to start and reports an error.

#### Correct answer to question 33: A

Permission modes propagate downward and cannot be loosened or changed by the subagent.

## Scenario: Developer Productivity with Claude

### Question 34

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

A very long session on a large codebase shows signs of degradation: Claude makes assumptions instead of verifying, and forgets earlier findings. What is the most effective mitigation?

- **A.** Keep going in the same session, adding more and more files to the context.
- **B.** Switch to a smaller model to reduce memory usage.
- **C.** Disable compaction to keep the full history.
- **D.** Save stable findings in a scratchpad notes file that survives compression.

#### Correct answer to question 34: D

A notes file keeps findings outside the conversation, so compression does not erase them.

## Scenario: Developer Productivity with Claude

### Question 35

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

An agent sent some orders to the warehouse before payment was confirmed, even though the rule was written in the system prompt. What is the most robust solution?

- **A.** Rewrite the rule with stronger wording and repeat it twice in the system prompt, at start and end.
- **B.** Add a `PreToolUse` hook on `ship_order` that blocks it until `check_payment` returns positive.
- **C.** Add a few-shot example in which `check_payment` is always called before `ship_order`.
- **D.** Lower the model's temperature, so that it follows the order of operations more predictably.

#### Correct answer to question 35: B

A critical rule must be enforced programmatically, not left to instructions alone.

## Scenario: Developer Productivity with Claude

### Question 36

You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.

An agent has eighteen tools and often picks the wrong one. Which architecture is consistent with the principle of four or five tools per agent?

- **A.** A single agent with all eighteen tools and longer descriptions.
- **B.** Eighteen subagents with no tools at all.
- **C.** Specialized subagents, few tools each.
- **D.** An agent with a higher temperature, to explore all the tools.

#### Correct answer to question 36: C

Splitting the tools among specialized subagents reduces confusion when choosing.

## Scenario: Claude Code for Continuous Integration

### Question 37

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A CI pipeline that runs Claude Code for automatic pull request review hangs, waiting for input. Which flag is missing?

- **A.** `-p` / `--print`
- **B.** `--verbose`
- **C.** `--force`
- **D.** `--no-cache`

#### Correct answer to question 37: A

`-p` is required for non-interactive mode. Without it, Claude Code waits for input that never arrives.

## Scenario: Claude Code for Continuous Integration

### Question 38

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

The pipeline must produce a final result readable by a program and verify that it matches a schema. Which combination of flags is correct?

- **A.** `--verbose` with `--bare`, which print the full result and strip the formatting from it.
- **B.** `--bare` with `--safe-mode`, which output a minimal result and check it against the schema.
- **C.** `--safe-mode` with `--restricted`, which constrain the output to a validated structure.
- **D.** `-p` with `--output-format json`, plus `--json-schema` to validate the final result.

#### Correct answer to question 38: D

`--output-format json` makes the result machine-readable, and `--json-schema` validates it.

## Scenario: Claude Code for Continuous Integration

### Question 39

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

The team wants two checks: a blocking review before merge, which the developer waits for, and a technical-debt report generated overnight. The manager proposes the Batch API for both, to save 50%. What is the correct choice?

- **A.** Both on the Batch API.
- **B.** Both in synchronous mode.
- **C.** The pre-merge review in synchronous mode, the overnight report on the Batch API.
- **D.** The pre-merge review on the Batch API with polling, the overnight report in synchronous mode.

#### Correct answer to question 39: C

The Batch API can take up to 24 hours: it suits what is not urgent, not a check that blocks the merge.

## Scenario: Claude Code for Continuous Integration

### Question 40

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A batch of requests finishes, and the results arrive in random order. How is each response matched to the correct request?

- **A.** By the position of each response in the results list, which mirrors the submission order.
- **B.** By `custom_id`, the unique label assigned to each request when it is submitted.
- **C.** By the arrival timestamp of each response, compared with the time each request was sent.
- **D.** By the name of the output file, which contains the index of the original request.

#### Correct answer to question 40: B

Order is not guaranteed: `custom_id` is the correlation key.

## Scenario: Claude Code for Continuous Integration

### Question 41

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A developer asks the same Claude Code session that has just written a feature to review it. What is the problem and the solution?

- **A.** There is no problem: the same session is faster and has the most context about the feature.
- **B.** The `--bare` flag should be used, since it replaces the review with an automatic check.
- **C.** The review should go to the `Plan` subagent, which does not modify code and is impartial.
- **D.** The writer tends to defend its reasoning: use an independent review session instead.

#### Correct answer to question 41: D

Whoever wrote the code is less critical of their own choices. The review should be done in a separate session.

## Scenario: Claude Code for Continuous Integration

### Question 42

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

The automatic review system generates too many false positives: it flags problems that developers consider irrelevant. What is the most effective fix?

- **A.** Define explicit criteria: what to flag, what to exclude, with borderline examples.
- **B.** Raise the temperature, so the reviewer produces more varied and less repetitive assessments.
- **C.** Add more examples of good flags to the prompt, without defining explicit criteria.
- **D.** Add a numeric reliability threshold for each flag, without changing anything else.

#### Correct answer to question 42: A

Explicit criteria with exclusions and borderline examples reduce false positives.

## Scenario: Claude Code for Continuous Integration

### Question 43

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

The team wants to limit the spending of the CI pipeline, which uses Claude Code to generate tests. Which flag is suitable?

- **A.** `--max-turns`
- **B.** `--bare`
- **C.** `--max-budget-usd`
- **D.** `--restricted`

#### Correct answer to question 43: C

`--max-budget-usd` imposes a spending limit, while `--max-turns` limits the number of steps.

## Scenario: Claude Code for Continuous Integration

### Question 44

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

A PR modifies forty files, and a single review pass misses problems across different files. Which strategy is most suitable?

- **A.** A single prompt with all forty files and a longer output, so the review covers everything.
- **B.** One pass per file with the same depth each, then a second pass for cross-file interactions.
- **C.** Increase `max_tokens`, so the single review pass has more room to report every problem.
- **D.** Use the Batch API for the review, because it is cheaper and allows a longer analysis.

#### Correct answer to question 44: B

Multi-pass review avoids losing attention and also checks integration between files.

## Scenario: Claude Code for Continuous Integration

### Question 45

You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.

In the pipeline there is no user who can respond to confirmation requests. Which setting prevents the pipeline from hanging or executing unapproved operations?

- **A.** `--output-format json`
- **B.** `--json-schema`
- **C.** `--max-turns 5`
- **D.** `--permission-prompts none`

#### Correct answer to question 45: D

`--permission-prompts none` automatically denies operations that would require confirmation.

## Scenario: Structured Data Extraction

### Question 46

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

An extraction from invoices uses `strict: true`. Which schema requirement must be met?

- **A.** The `strict` field must also appear in the `required` list of the schema's root object.
- **B.** The schema can have at most five properties, nested objects included, in strict mode.
- **C.** `additionalProperties: false`, and every single property must be listed in `required`.
- **D.** There is no requirement, since `strict` is just an informational flag for the client.

#### Correct answer to question 46: C

These two requirements are needed to enable strict mode.

## Scenario: Structured Data Extraction

### Question 47

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

An invoice extraction returns a `total_amount` that does not match the sum of the line items, although it is a valid number that conforms to the schema. What is the explanation and the fix?

- **A.** Strict mode guarantees form, not correctness: validate semantics in code.
- **B.** Strict mode is not working correctly in this case, so it must be disabled and retried.
- **C.** Add a `minimum` constraint on the total to the schema, so invalid totals are rejected.
- **D.** The model needs fine-tuning on invoices to learn how totals relate to line items.

#### Correct answer to question 47: A

The schema guarantees conformance, not the correctness of the values.

## Scenario: Structured Data Extraction

### Question 48

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

An extraction from ambiguous documents must classify the invoice type, but the document often does not allow a decision. What is the most suitable schema design?

- **A.** A closed enum with only the values that are certain, and no additional options at all.
- **B.** A mandatory string field, so the model is forced to choose a type for every document.
- **C.** A prompt instruction saying "always guess the most likely type when it is not clear".
- **D.** An enum that includes `"unclear"` for ambiguous cases, so the model need not guess.

#### Correct answer to question 48: D

The `"unclear"` option prevents the model from inventing a classification.

## Scenario: Structured Data Extraction

### Question 49

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

The schema of an extraction in strict mode contains `"quantity": {"type": "integer", "minimum": 1}`. What should be done?

- **A.** Nothing needs to change, since `minimum` is always supported in every JSON schema mode.
- **B.** `minimum` is not supported in strict mode: do that check in your code after the response.
- **C.** Remove `required` from the schema, so the `minimum` constraint becomes optional.
- **D.** Add `oneOf` with the allowed values to replace the `minimum` constraint in the schema.

#### Correct answer to question 49: B

Strict mode does not support some constraints such as `minimum`, `maximum` and `pattern`.

## Scenario: Structured Data Extraction

### Question 50

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

On Fable 5.1, a call with a forced `tool_choice` on an extraction tool returns a `400` error. What is the correct approach to get JSON that conforms to the schema?

- **A.** Use `output_config.format` with `type: json_schema`.
- **B.** Add an assistant prefill starting with `{` to guide the model.
- **C.** Use `tool_choice: {"type": "any"}` in place of the forced form.
- **D.** Remove the schema and validate free text with a regex.

#### Correct answer to question 50: A

On recent models the forced form is not accepted: direct structured output is the recommended path.

## Scenario: Structured Data Extraction

### Question 51

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

An extraction system reports an overall accuracy of 96%. A manager asks whether it is ready for production. What analysis is needed before answering?

- **A.** None: 96% is a sufficient value.
- **B.** A larger random sample from the same set.
- **C.** Compare the system with those of competitors.
- **D.** Break down accuracy by type and field.

#### Correct answer to question 51: D

An aggregate figure can hide very poor performance on specific document types.

## Scenario: Structured Data Extraction

### Question 52

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

An extraction system assigns a confidence score to each field. A manager asks whether the scores can be trusted. Which statement is correct?

- **A.** The scores are reliable, because the model calculates them itself from its own reasoning.
- **B.** A high score guarantees that the field is correct, so those fields can skip review.
- **C.** A 0.9 score should mean correct about 90% of the time, verified on a labeled set.
- **D.** It is enough to ask the model to review its own answers before assigning the scores.

#### Correct answer to question 52: C

Without calibration on labeled data, the score has no meaning.

## Scenario: Structured Data Extraction

### Question 53

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

An extraction from unstructured documents often fails in ambiguous cases. How many examples should be included in the prompt, and how should they be designed?

- **A.** Ten or more examples of simple, typical cases, with no explanations, to show the format.
- **B.** No examples at all: a clear description of the schema and its fields is enough.
- **C.** Twenty examples, one for each field in the schema, each showing that field in isolation.
- **D.** Two to four targeted examples of ambiguous cases, each with input, output and reasoning.

#### Correct answer to question 53: D

A few targeted examples, with the reasoning behind the choices, teach the criterion without saturating the context.

## Scenario: Structured Data Extraction

### Question 54

You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.

An application's system prompt contains the current date and time at the beginning, followed by fixed tools and rules. The prompt cache has a very low hit rate. What is the fix?

- **A.** Move the timestamp into the messages, after the stable content.
- **B.** Disable the cache entirely.
- **C.** Increase the number of tools to stabilize the prefix.
- **D.** Set the temperature to a different value on every request.

#### Correct answer to question 54: A

The timestamp changes on every request and invalidates the prefix. It must be moved after the stable content.

## Scenario: Conversational AI Architecture Patterns

### Question 55

You are designing a long-running conversational application built on the Claude API. Conversations span many turns, use extended thinking and tools, and must stay within the context window through compaction and context editing while preserving prompt caching and conversation state.

A conversational application uses server-side compaction, but on every turn it adds only `response.content[0].text` to the history. What is wrong?

- **A.** Nothing is wrong, since the API only needs the text of each response to rebuild the history.
- **B.** The first compaction makes every following request fail with a `400` error from the API.
- **C.** Compaction triggers too early in the conversation, so the threshold should be raised.
- **D.** The compaction state is silently lost, because the full `response.content` is required.

#### Correct answer to question 55: D

Extracting only the text silently destroys the compaction state, and the problem only shows up after many turns.

## Scenario: Conversational AI Architecture Patterns

### Question 56

You are designing a long-running conversational application built on the Claude API. Conversations span many turns, use extended thinking and tools, and must stay within the context window through compaction and context editing while preserving prompt caching and conversation state.

An application uses on-request compaction. In the next request it places the `compaction` block at the beginning, but leaves after it the messages that the block summarizes. What is the correct rule?

- **A.** The block goes first, and the messages it summarizes must not be left after it.
- **B.** Messages must always be left before the block, so the history is not lost.
- **C.** The block must be omitted if there are later messages.
- **D.** The block must be converted into text before being sent.

#### Correct answer to question 56: A

Leaving the summarized messages after the block sends them twice. Leaving them before the block causes an explicit error.

## Scenario: Conversational AI Architecture Patterns

### Question 57

You are designing a long-running conversational application built on the Claude API. Conversations span many turns, use extended thinking and tools, and must stay within the context window through compaction and context editing while preserving prompt caching and conversation state.

In a conversation with Opus 5.5 and thinking enabled, a rule must be added to the system prompt midway through. Which approach does not invalidate the thinking blocks of earlier turns?

- **A.** Rebuild the system prompt on every request, including the new rule from that point on.
- **B.** Delete the thinking blocks of all earlier turns, so they no longer conflict with the rule.
- **C.** Append a `role: "system"` message after the last user turn, keeping `system` intact.
- **D.** Switch to a different model midway through the conversation, starting it with the new rule.

#### Correct answer to question 57: C

A system message appended at the end does not modify the prefix already used for thinking.

## Scenario: Conversational AI Architecture Patterns

### Question 58

You are designing a long-running conversational application built on the Claude API. Conversations span many turns, use extended thinking and tools, and must stay within the context window through compaction and context editing while preserving prompt caching and conversation state.

A harness uses both `clear_tool_uses` and `clear_thinking` in the same context-management request. Which statement is correct?

- **A.** The order does not matter, since each edit is applied independently by the API.
- **B.** `clear_thinking` must come first whenever the two are used together.
- **C.** They must always be sent in separate requests, since they cannot be combined.
- **D.** `clear_tool_uses` cannot be used with recent models, so only one edit applies.

#### Correct answer to question 58: B

When the two edits are used together, `clear_thinking` must come first.

## Scenario: Conversational AI Architecture Patterns

### Question 59

You are designing a long-running conversational application built on the Claude API. Conversations span many turns, use extended thinking and tools, and must stay within the context window through compaction and context editing while preserving prompt caching and conversation state.

An application reads `response.content` without checking `stop_reason`. Occasionally it receives an HTTP `200` response with `stop_reason: "refusal"`. What is the most appropriate fix?

- **A.** Increase `max_tokens`, so that the model has enough room to answer instead of refusing.
- **B.** Ignore the empty content and continue the conversation with the next user message.
- **C.** Retry the request automatically, as many times as needed, until the model answers.
- **D.** Check `stop_reason` before reading content, and handle the refusal explicitly.

#### Correct answer to question 59: D

A refusal arrives with status 200: it must be recognized through `stop_reason`, otherwise it is treated as a successful response.

## Scenario: Conversational AI Architecture Patterns

### Question 60

You are designing a long-running conversational application built on the Claude API. Conversations span many turns, use extended thinking and tools, and must stay within the context window through compaction and context editing while preserving prompt caching and conversation state.

An agentic workflow is cut off midway through a task when it reaches `max_tokens`. Which mechanism lets the model pace itself so it can conclude in an orderly way?

- **A.** Increase `max_tokens` substantially and hope it is enough for the whole task to finish.
- **B.** Disable thinking, so the model saves tokens and has more room for the actual output.
- **C.** A task budget (`output_config.task_budget`) that is visible to the model itself.
- **D.** Set a lower `effort` value, so the model works faster and uses fewer tokens per step.

#### Correct answer to question 60: C

`max_tokens` is a limit the model cannot see. The task budget is visible and lets it plan.
