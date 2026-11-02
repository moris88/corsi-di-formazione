---
title: "Questions and Answers: Practice Test 1 – Claude Certified Architect"
duration_minutes: 120
---

# Questions and Answers: Practice Test 1 – Claude Certified Architect

## Scenario: Claude Code for Continuous Integration

### Question 1

You are integrating Claude Code into your continuous integration and delivery (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that produce useful findings and reduce false positives.

Automated code review produces an average of 15 findings per pull request, and developers report a 40% false-positive rate. The bottleneck is the time required to investigate: developers must open each finding to read Claude's reasoning before deciding whether to fix or ignore it. `CLAUDE.md` already contains comprehensive rules about acceptable patterns, and stakeholders have rejected any approach that filters findings before developer review. Which change would best address investigation time?

- **A.** Ask Claude to include its reasoning and confidence assessment directly in each finding.
- **B.** Classify findings as "blocking issues" or "suggestions," applying different review levels.
- **C.** Configure Claude to show only findings it considers highly reliable, filtering uncertain ones before developers see them.
- **D.** Add a post-processor that analyzes finding patterns and automatically suppresses those matching historical false positives.

#### Correct answer to Question 1: A

The problem is not the number of findings or the need to filter them: it is the time developers waste opening them and deciding whether they are worth investigating. If Claude includes its rationale, impact, and confidence level directly in the comment, developers can assess it much more quickly.

The other options introduce automatic filters or priorities, but the scenario says stakeholders have rejected filtering findings before review.

## Scenario: Claude Code for Continuous Integration

### Question 2

Automated reviews identify valid issues, but developers say the feedback is not actionable enough. Findings say things like "complex ticket assignment logic" or "possible null pointer," without specifying what to change. Even when you add detailed instructions such as "always include specific fix suggestions," the model produces inconsistent results: sometimes detailed, sometimes vague. Which prompting technique would produce actionable, consistent feedback most reliably?

- **A.** Add 3–4 few-shot examples showing the exact desired format: the identified issue, the code location, and a specific fix.
- **B.** Expand the context window to include more surrounding code so the model has enough information to suggest specific fixes.
- **C.** Make the instructions for every part of the feedback format even more explicit: location, issue, severity, and suggested fix.
- **D.** Adopt a two-step approach: one prompt identifies issues and a second generates fixes, allowing the models to specialize.

#### Correct answer to Question 2: A

The problem is inconsistency in format and level of detail. Abstract instructions like "be specific" are often not enough; few-shot examples show the model concretely what actionable feedback means.

An example of the pattern to teach:

```text
Issue: Possible null pointer
Location: TicketAllocator.java:84
Why it matters: user.getTeam() could be null if the user has no assigned team.
Suggested fix: Add a null check before accessing .getId(), or use Optional.
```

## Scenario: Claude Code for Continuous Integration

### Question 3

The CI pipeline uses two Claude-based code review modes: a check that blocks pull request merging until it is complete, and an in-depth analysis that runs overnight, periodically checks whether the batch has completed, and then posts detailed suggestions on the pull request. You want to reduce API costs by using the Message Batches API, which saves 50% but requires periodic checks and can take up to 24 hours. Which mode should use batch processing?

- **A.** Both modes.
- **B.** Neither mode.
- **C.** The in-depth analysis only.
- **D.** The pre-merge check only.

#### Correct answer to Question 3: C

The Message Batches API is suitable for asynchronous, non-urgent processes: it costs less, but requires periodic checks and can take up to 24 hours.

- The pre-merge check is blocking and must respond quickly, so it is not suitable.
- The in-depth analysis already runs asynchronously overnight and can wait, so it is suitable.

## Scenario: Claude Code for Continuous Integration

### Question 4

The code review component works iteratively: Claude analyzes a modified file and may then request related files (imports, base classes, tests) through tool calls to understand the context before providing final feedback. Your application defines a tool that lets Claude request file contents; Claude invokes it, receives the results, and continues its analysis. You are considering batch processing to reduce API costs.

What is the main technical constraint to consider for this workflow?

- **A.** The asynchronous model cannot run tools during a request and return their results so that Claude can continue its analysis.
- **B.** Batch processing does not provide request correlation IDs to associate results with the initial requests.
- **C.** The latency, which can reach 24 hours, is too high for pull request feedback, even though the workflow could otherwise work.
- **D.** The Batch API does not support tool definitions in request parameters.

#### Correct answer to Question 4: A

The workflow is iterative:

1. Claude analyzes a file.
2. It requests additional files through a tool call.
3. The application runs the tool.
4. Claude receives the results and continues reasoning.

With batch processing, requests are handled asynchronously, without this real-time interaction. The main constraint is therefore the inability to easily handle the cycle "Claude → tool call → result → Claude continues," not just latency.

## Scenario: Claude Code for Continuous Integration

### Question 5

Automated code review generates test-case suggestions for every pull request. A pull request adds course-completion tracking; Claude suggests 10 test cases, but developers report that 6 duplicate scenarios already covered by the existing suite. Which change would most effectively reduce duplicate suggestions?

- **A.** Reduce the number of requested suggestions from 10 to 5, assuming Claude will prioritize the most useful cases.
- **B.** Implement a post-processor that filters suggestions whose descriptions match keywords in existing test names.
- **C.** Ask Claude to focus only on edge cases and error conditions, rather than successful paths.
- **D.** Include the existing test file in the context so Claude can identify scenarios already covered.

#### Correct answer to Question 5: D

Claude proposes tests that are valid in the abstract, but it does not know which cases are already in the suite. Providing the existing test file lets it compare the new functionality with current coverage and avoid duplicates.

- Requesting fewer suggestions reduces their number but does not guarantee fewer duplicates.
- Filtering by keywords in test names is fragile: names may not represent the scenarios actually covered.
- Focusing only on edge cases may improve quality, but risks missing important tests for the main paths.

## Scenario: Claude Code for Continuous Integration

### Question 6

Automated review analyzes comments and docstrings. The current prompt asks Claude to "verify that comments are accurate and up to date." Findings often flag acceptable patterns, such as TODO markers or simple descriptions, but fail to detect comments that describe behavior no longer implemented by the code. Which change addresses the root cause of this inconsistent analysis?

- **A.** Include `git blame` data so Claude can identify comments that predate recent changes.
- **B.** Set explicit criteria: flag a comment only if it contradicts what the code does.
- **C.** Filter TODO, FIXME, and descriptive-comment patterns before analysis to reduce noise.
- **D.** Add few-shot examples of misleading comments to help the model recognize similar patterns in the code.

#### Correct answer to Question 6: B

The problem is a vague instruction: "verify that comments are accurate and up to date." Claude interprets it broadly and flags acceptable patterns such as TODOs or simple descriptions. The best fix is to make the criterion actionable: flag a comment only when it describes behavior that the code no longer implements or that contradicts the actual behavior.

- `git blame` data can provide timing clues, but an old comment is not automatically wrong.
- Filtering TODO and descriptive-comment patterns reduces noise, but risks hiding genuinely problematic comments.
- Few-shot examples of misleading comments can help, but a clear criterion for what to flag is needed first.

## Scenario: Claude Code for Continuous Integration

### Question 7

The CI/CD system runs three types of Claude-based analysis: (1) quick style checks on every pull request that block merging until they finish; (2) full security scans of the entire codebase, run weekly; and (3) nightly test-case generation for recently modified modules. The Message Batches API saves 50% but can take up to 24 hours. You want to optimize API costs while maintaining an acceptable developer experience. Which combination correctly maps each task to an API type?

- **A.** Use synchronous calls for pull request style checks and nightly test generation; use the Message Batches API only for weekly security scans.
- **B.** Use the Message Batches API for all three tasks to maximize the 50% savings, and configure the pipeline to check batch completion.
- **C.** Use synchronous calls for pull request style checks, and the Batches API for weekly security scans and nightly tests.
- **D.** Use synchronous calls for all three tasks to maintain consistent response times and rely on prompt caching to reduce costs.

#### Correct answer to Question 7: C

- Pull request style checks block merging and require quick responses: use synchronous calls.
- Weekly security scans are scheduled and non-interactive, so they can use the Message Batches API.
- Nightly test generation is asynchronous and can tolerate latency, so it can also use the Message Batches API.

## Scenario: Claude Code for Continuous Integration

### Question 8

Automated code review analysis shows very different false-positive rates across categories: 8% for security and correctness, 18% for performance, 52% for style and naming, and 48% for documentation.

Surveys show declining trust: many developers have started ignoring findings without reading them because "half of them are wrong." Categories with many false positives undermine confidence even in accurate ones. Which approach best restores trust and improves the system?

- **A.** Keep all categories and show a confidence score for each finding, letting developers decide what to review.
- **B.** Uniformly reduce the severity of all categories to bring the overall false-positive rate to an acceptable level.
- **C.** Pause high false-positive categories (style, naming, docs), keep high-precision ones, and improve prompts.
- **D.** Keep all categories enabled and add few-shot examples to improve accuracy over the coming weeks.

#### Correct answer to Question 8: C

The problem is not only technical; it is about **trust**: noisy categories make the entire system seem unreliable, even when security and correctness work well. The best choice is to keep high-precision categories enabled, temporarily disable those with too many false positives, improve prompts, examples, and criteria, and reintroduce them only when quality is adequate.

The other options keep the noise in front of developers and do not solve the main problem: many are already ignoring findings without reading them.

## Scenario: Claude Code for Continuous Integration

### Question 9

After an initial automated review generates 12 findings, a developer submits new commits to fix the issues. The next review produces 8 findings, but developers report that 5 duplicate earlier comments about code already fixed in the new commits. What is the most effective way to eliminate this redundant feedback while maintaining a complete analysis?

- **A.** Limit the review to files changed in the most recent submission, excluding those changed in earlier commits.
- **B.** Run the review only when the pull request is first created and in its final state before merging, skipping intermediate commits.
- **C.** Include previous findings in the context and ask Claude to report only new or still-unresolved issues.
- **D.** Add a post-processing filter that removes findings with file paths and descriptions matching previous ones.

#### Correct answer to Question 9: C

Claude runs a new review without knowing about earlier comments, so it may repost findings that have already been resolved or discussed. Providing previous findings as context lets it distinguish issues that are still present, those that have been resolved, and new issues introduced by later commits.

- Limiting the review to the latest files risks missing issues that remain in files changed in earlier commits.
- Reviewing only at creation and before merge reduces useful feedback during the development cycle.
- A post-processing filter is fragile: matching by path and description does not guarantee that two findings describe the same issue.

## Scenario: Claude Code for Continuous Integration

### Question 10

The automated review system assigns inconsistent severity levels: similar issues, such as null-pointer risks, are classified as "critical" in some pull requests and "medium" in others. Developer trust is declining because teams cannot predict which findings require immediate attention. What is the most effective method for making severity assessments consistent?

- **A.** Add a `CLAUDE.md` file listing issue types and their default severity, and ask Claude to consult this mapping.
- **B.** Ask Claude to explain every severity assignment and use its reasoning to calibrate and manually adjust assessments during review.
- **C.** Include explicit severity criteria in the review prompt, each with concrete code examples showing that level.
- **D.** Ask Claude to assess severity relative to other issues in the same pull request, always assigning "critical" to the most severe finding and classifying the others proportionally.

#### Correct answer to Question 10: C

The problem is **inconsistent calibration**: Claude does not use a stable scale to distinguish "critical," "high," and "medium" severity. The most reliable method is to provide explicit criteria for each level, concrete code examples, and edge cases showing when a null-pointer risk is critical and when it is medium.

A default-severity mapping in `CLAUDE.md` may be useful, but it risks being too generic: the same type of issue can have different severity depending on context, impact, and reachability. Concrete examples are more helpful.

## Scenario: Claude Code for Continuous Integration

### Question 11

Your team uses Claude Code to generate code suggestions, but you notice a pattern: subtle issues—such as performance optimizations that break edge cases or cleanup operations that unexpectedly change behavior—surface only when another team member reviews the pull request. Claude's reasoning during generation shows that it considered these cases but concluded the approach was correct. Which approach directly addresses the root cause of this self-review limitation?

- **A.** Add explicit self-review instructions to the generation prompt, asking Claude to critique its own suggestions before finalizing them.
- **B.** Include complete test files and documentation in the prompt context so Claude better understands the expected behavior during generation.
- **C.** Ask a second, independent Claude Code instance to review the changes without seeing the reasoning of the instance that generated them first.
- **D.** Enable extended thinking during generation to allow deeper analysis before producing suggestions.

#### Correct answer to Question 11: C

This is a typical limitation of **self-review**: the model that generated a solution tends to confirm its own decision, especially if its reasoning has already justified why it considers the solution correct. The best solution is to separate the roles: one instance generates the changes and a second reviews them independently, without being influenced by the generator's reasoning.

## Scenario: Claude Code for Continuous Integration

### Question 12

A pull request modifies 14 files in the inventory tracking module. A single-pass review produces inconsistent results: detailed feedback on some files and shallow feedback on others, obvious bugs go undetected, and comments contradict one another, with the same pattern flagged as problematic in one file and approved in another. How should you restructure the review?

- **A.** Run three independent reviews of the entire pull request and report only issues found in at least two runs.
- **B.** Split into passes: each file alone for local issues, then an integration pass for cross-file data flow.
- **C.** Ask developers to split larger pull requests into submissions of 3–4 files before starting automated review.
- **D.** Switch to a higher-tier model with a larger context window so it can adequately review all 14 files in one pass.

#### Correct answer to Question 12: B

Splitting the review into focused passes addresses the root cause: attention becomes diffuse when many files are processed together. File-by-file analysis ensures consistent depth, while a separate integration pass identifies cross-file issues. Keeping only issues found in at least two of three runs could miss real bugs, because it requires them to be found in multiple runs.

## Scenario: Claude Code for Continuous Integration

### Question 13

The pipeline script runs `claude "Analyze this pull request for security issues"`, but the job hangs. The logs indicate Claude Code is waiting for interactive input. What is the correct way to run Claude Code in an automated pipeline?

- **A.** Add the `--batch` flag: `claude --batch "Analyze this pull request for security issues"`.
- **B.** Redirect standard input from `/dev/null`: `claude "Analyze this pull request for security issues" < /dev/null`.
- **C.** Add the `-p` flag to the command: `claude -p "Analyze this pull request for security issues"`.
- **D.** Set the `CLAUDE_HEADLESS=true` environment variable before running the command.

#### Correct answer to Question 13: C

The `-p` (or `--print`) flag runs Claude Code in non-interactive mode: it processes the prompt, writes the result to standard output, and exits without waiting for input. This is the mode intended for scripts and CI/CD pipelines. `--batch` and `CLAUDE_HEADLESS` are not the features intended for this case; redirecting standard input does not set the correct non-interactive mode.

## Scenario: Claude Code for Continuous Integration

### Question 14

The CI pipeline runs the Claude Code CLI in `--print` mode and uses `CLAUDE.md` to provide project context for reviews. Developers find the reviews useful, but integrating them into the workflow is difficult: Claude produces prose paragraphs that must be manually copied into pull request comments. The team wants to automatically publish each finding as an inline comment at the relevant code location, so structured data is required with file path, line number, severity, and suggested fix. What is the most effective approach?

- **A.** Keep the prose format and add a summary step in which Claude generates a structured JSON summary of the findings.
- **B.** Add explicit formatting instructions to the prompt, asking for each finding to follow a parseable template, such as `[FILE:path] [LINE:n] [SEVERITY:level] ...`.
- **C.** Use `--output-format json` with `--json-schema` for structured findings, then post inline comments via the GitHub API.
- **D.** Add a "Review Output Format" section to `CLAUDE.md`, with examples of structured findings.

#### Correct answer to Question 14: C

Automated inline comments require a **structured, validated format**, with fields such as `file_path`, `line_number`, `severity`, and `suggested_fix`. The `--output-format json` and `--json-schema` flags can enforce this format, which can then be processed through the GitHub API. Formatting instructions in the prompt or in `CLAUDE.md` are more fragile because the model may deviate from them. Generating a JSON summary from prose adds an unnecessary step and can introduce errors.

## Scenario: Claude Code for Continuous Integration

### Question 15

The team wants to reduce API costs for automated analysis. Currently, real-time Claude calls power two workflows: (1) a blocking pre-merge check that must finish before developers can merge, and (2) a technical-debt report generated overnight and reviewed the next morning. The manager proposes moving both to the Message Batches API, which reduces costs by 50%. How do you assess the proposal?

- **A.** Move both to batch processing, with a timeout fallback that starts a real-time call if batches take too long.
- **B.** Move both to batch processing and poll their status to check for completion.
- **C.** Use batch processing only for technical-debt reports and keep real-time calls for pre-merge checks.
- **D.** Keep real-time calls for both workflows to avoid batch result ordering issues.

#### Correct answer to Question 15: C

The pre-merge check is blocking and requires a quick response, so it must remain synchronous. The technical-debt report is generated overnight, does not block developers, and can wait until morning; it is therefore suitable for the Message Batches API and its cost savings. Batches are useful when completion time is not critical.

## Scenario: Multi-Agent Research System

### Question 16

You are building a multi-agent research system with the Claude Agent SDK. A coordinator delegates work to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system conducts research and produces comprehensive reports with citations.

The web research subagent returns results for 3 of the 5 requested source categories: competitor websites and industry reports were queried successfully, but news archives and social media feeds timed out. The document analysis subagent successfully processed all supplied documents. The synthesis agent must now produce a summary from these mixed-quality inputs. What is the most effective strategy for propagating errors?

- **A.** Ask the synthesis agent to request that the coordinator retry the timed-out sources with longer timeouts before proceeding, to ensure complete coverage.
- **B.** Proceed with synthesis using only successfully queried sources, without mentioning which data was unavailable.
- **C.** Ask the synthesis agent to return an error to the coordinator, explaining that upstream data is incomplete and requesting a full retry or failure of the task.
- **D.** Add coverage annotations to the synthesis, marking well-supported findings and gaps from unavailable sources.

#### Correct answer to Question 16: D

The data is **partial but usable**. The best strategy is neither to stop everything nor to hide the limitations, but to carry uncertainty into the final result. The synthesis should indicate which findings are supported by competitor websites, industry reports, and analyzed documents; which areas are less covered because news archives and social media timed out; and which conclusions should be considered provisional.

## Scenario: Multi-Agent Research System

### Question 17

The web research and document analysis agents have completed their respective tasks and returned their results to the coordinator. What is the appropriate next step for producing an integrated research result?

- **A.** The document analysis agent requests the web research results and integrates them on its own.
- **B.** The coordinator passes both result sets to the synthesis agent, which integrates them into one output.
- **C.** The coordinator concatenates the agents' raw outputs and returns them as the final result.
- **D.** Each agent sends its results directly to the report-generation agent, bypassing the coordinator.

#### Correct answer to Question 17: B

In a well-structured multi-agent system, specialized agents produce partial results, the **coordinator** orchestrates the workflow and passes the results to the synthesis agent, which integrates the evidence. A report-generation agent can then turn the synthesis into the final output. The other options compromise role separation or produce an unintegrated result.

## Scenario: Multi-Agent Research System

### Question 18

The document analysis agent discovers that two credible sources report directly conflicting statistics for an important metric: a government report indicates 40% growth, while an industry analysis reports 12%. Both sources seem legitimate, and the discrepancy could significantly affect the research conclusions. How should the document analysis agent handle the situation?

- **A.** Stop the analysis and immediately notify the coordinator, asking it to determine which source is authoritative before processing the remaining documents.
- **B.** Include both values, explicitly noting the conflict with source attribution, and leave it to the coordinator to reconcile them before the synthesis.
- **C.** Include both values in the output without noting the conflict, letting the synthesis agent choose which one to use based on the overall research context.
- **D.** Apply source credibility heuristics to select the likely more accurate value, complete the analysis using that value, and cite the discrepancy in a note.

#### Correct answer to Question 18: B

The document analysis agent should not arbitrarily choose which data to use when both sources are credible and the discrepancy could affect the conclusions. It should transparently report the 40% figure from the government report and the 12% figure from the industry analysis, flag the conflict, and indicate its potential impact. This allows the coordinator and synthesis agent to handle the uncertainty appropriately.

## Scenario: Multi-Agent Research System

### Question 19

The web research subagent times out while investigating a complex topic. You need to design how it should communicate the problem to the coordinating agent. Which error-propagation strategy enables the most effective recovery?

- **A.** Propagate the timeout exception directly to a higher-level handler that stops the entire research workflow.
- **B.** Return structured error context to the coordinator: error type, attempted request, partial results, and possible alternatives.
- **C.** Catch the timeout in the subagent and return an empty result set marked as successful.
- **D.** Implement automatic retries with exponential backoff in the subagent and return a generic "research unavailable" status only after exhausting them.

#### Correct answer to Question 19: B

The coordinator needs to decide whether to retry, use alternative sources, narrow the scope, continue with partial coverage, or report the gap. To do so, it needs structured information: error type, attempted request, sources or partial results collected, missing data, and possible alternatives or retries. A generic error does not provide enough context for effective recovery.

## Scenario: Multi-Agent Research System

### Question 20

During testing, the combined output from the web research agent (85,000 tokens, including page contents) and the document analysis agent (70,000 tokens, including reasoning chains) reaches 155,000 tokens. The synthesis agent performs best with inputs under 50,000 tokens. What is the most effective solution?

- **A.** Add an intermediate summarization agent to compress the results before passing them to the synthesis agent.
- **B.** Ask the synthesis agent to process the results in sequential batches, maintaining state between calls.
- **C.** Store the results in a vector database and give the synthesis agent retrieval tools to use during processing.
- **D.** Have the upstream agents return structured data (key facts, citations, relevance) instead of verbose text.

#### Correct answer to Question 20: D

The problem originates **upstream**: the web research and document analysis agents pass too much raw material, including reasoning chains. The synthesis agent should receive compact, normalized outputs with key findings, sources or citations, relevance, confidence level, and any limitations or conflicts, along with only the strictly necessary excerpts.

The other options may help, but are less direct: an intermediate agent adds a step and may lose details; sequential processing complicates consistency; a vector database is useful for large knowledge bases, but does not fix the fact that the agents return overly verbose outputs.

## Scenario: Multi-Agent Research System

### Question 21

A colleague suggests that the document analysis agent send its output directly to the synthesis agent instead of routing it through the coordinator. What is the main advantage of keeping the coordinator as the central node for all communication between subagents?

- **A.** The coordinator batches multiple subagent requests, reducing the total number of API calls and overall latency.
- **B.** Routing through the coordinator enables automatic retries that direct agent-to-agent calls cannot support.
- **C.** The coordinator observes all interactions, handles errors consistently, and decides what each subagent gets.
- **D.** Subagents have isolated memory, and direct communication would require complex serialization that only the coordinator can perform.

#### Correct answer to Question 21: C

The coordinator's main advantage is **centralized orchestration**: it can observe the overall research state, detect which agents have completed their work, failed, or produced partial results, handle retries and alternatives, and decide what to pass to the synthesis agent. Direct communication between agents reduces global oversight and makes errors, incomplete results, and task dependencies harder to manage.

## Scenario: Multi-Agent Research System

### Question 22

The document analysis subagent encounters a corrupted PDF that it cannot analyze. What is the most effective way to handle this error in the system?

- **A.** Raise an exception that stops the entire research workflow.
- **B.** Silently skip the corrupted file and continue processing the others so the workflow is not interrupted.
- **C.** Return the error and its full context to the coordinating agent, leaving it to decide how to proceed next.
- **D.** Automatically retry document analysis three times with exponential backoff before reporting failure.

#### Correct answer to Question 22: C

The subagent should neither stop everything nor hide the problem. It should return a structured error to the coordinator identifying the unprocessable file, the reason (corrupted PDF or parsing error), any available metadata, the impact on coverage, and which other documents were processed successfully. The coordinator can decide whether to continue with partial coverage, try an alternative method, report the gap, or stop only that part of the workflow.

## Scenario: Multi-Agent Research System

### Question 23

Production monitoring reveals inconsistent synthesis quality. When aggregated results reach about 75,000 tokens, the synthesis agent reliably cites information in the first 15,000 tokens (web research titles and snippets) and the last 10,000 tokens (document analysis conclusions), but often omits important findings in the middle 50,000 tokens, even when they are directly relevant to the research question. How should you reorganize the aggregated input?

- **A.** Place a summary of the key findings at the beginning of the input, and organize the details into clearly separated sections with explicit headings.
- **B.** Alternate the order of subagent results between searches so both sources are equally likely to appear near the beginning over time.
- **C.** Send subagent results to the synthesis agent incrementally, completing the web research results first and adding the document analysis results afterward.
- **D.** Summarize all subagent outputs to under 20,000 tokens before aggregating them, keeping the content within the model's reliable processing range.

#### Correct answer to Question 23: A

The problem is a classic **context-position effect**: the model uses information at the beginning and end well, but may lose information in the middle. It is better to place a summary of the key findings at the beginning and organize details into clear sections with explicit headings, making sources, evidence, and gaps easier to retrieve. Compressing everything below 20,000 tokens could help, but it is more drastic and risks removing useful detail; the question asks to restructure the input, not necessarily compress it heavily.

## Scenario: Multi-Agent Research System

### Question 24

During research on materials, the web research subagent queries three source categories with different results: academic databases return 15 relevant papers, industry reports return "no results," and patent databases time out. How should you communicate the results to the coordinator so it can choose the best recovery strategy?

- **A.** Summarize the results in a single coverage metric, such as "67% of sources available," keeping detailed logs on request.
- **B.** Report both the timeout and the absence of results as errors requiring coordinator intervention.
- **C.** Ask the subagent to retry transient errors internally and report only persistent ones.
- **D.** Separate access failures (timeouts, which may warrant retries) from valid searches that simply returned no matching results.

#### Correct answer to Question 24: D

It is important to distinguish the three outcomes: the academic databases returned 15 papers, so the search succeeded with results; the industry reports returned no matches, but the query still succeeded; the patent databases timed out, indicating a potentially temporary access problem. The coordinator can then decide to retry the patent search without unnecessarily repeating the industry-report search.

## Scenario: Multi-Agent Research System

### Question 25

The document analysis subagent frequently encounters PDF problems: some have corrupted sections that cause parsing errors, others are password-protected, and occasionally the parsing library times out on larger files. Currently, any exception stops the subagent and returns an error to the coordinator, which must decide whether to retry, skip the document, or stop the entire search. This involves the coordinator too heavily in handling routine problems. What is the most effective architectural improvement?

- **A.** Have the subagent recover locally from transient errors and send only unresolvable errors to the coordinator, specifying the attempts made, the error type, and any partial results it obtained.
- **B.** Create a dedicated error-handling agent that monitors subagent failures through a shared queue, decides how to recover independently, and sends retries directly to subagents.
- **C.** Ask the coordinator to validate all documents before assigning them to the subagent, rejecting those that might cause errors.
- **D.** Configure the subagent to always return partial results with a success status and put error details in metadata; the coordinator will treat all responses as successful and filter problematic items during synthesis.

#### Correct answer to Question 25: A

The coordinator is involved too often in routine errors. The document analysis subagent should handle recoverable problems locally, for example retrying after temporary timeouts or extracting valid sections from a partially corrupted PDF. It can clearly report a password-protected PDF and return partial results when available. Only unrecoverable errors should be sent to the coordinator, along with context: what failed, what was attempted, what was recovered, and what is missing.

## Scenario: Multi-Agent Research System

### Question 26

Production monitoring shows that requests like "analyze the quarterly report I uploaded" are routed to the web research agent instead of the document analysis agent 45% of the time. Looking at the tool definitions, you notice that the web research agent has `analyze_content`, described as "analyzes content and extracts key information," while the document analysis agent has `analyze_document`, described as "analyzes documents and extracts key information." How should you fix the misrouting?

- **A.** Add a preliminary classifier to determine whether the user is referring to uploaded files or web content before the coordinator delegates the work.
- **B.** Rename the web tool to `extract_web_results` and update its description to "processes and returns information obtained from web searches and URLs".
- **C.** Expand the document analysis tool description to include use cases such as uploaded PDFs, Word documents, and spreadsheets, leaving the web tool unchanged.
- **D.** Add few-shot examples of correct routing to the coordinator prompt: "user uploads a quarterly report → document analysis agent" and "user asks about a web page → web research agent."

#### Correct answer to Question 26: B

The root cause is **semantic similarity between the tools**: `analyze_content` and `analyze_document` have nearly identical names and descriptions. The best fix is to make the web tool specific in both its name and description, clarifying that it processes web results and URLs, not uploaded documents. Expanding only the document tool description may help, but leaves the web tool ambiguous; few-shot routing examples may improve routing without fixing the structural cause; a preliminary classifier adds complexity to compensate for poorly designed tool definitions.

## Scenario: Multi-Agent Research System

### Question 27

The multi-agent research system is run on the topic "AI's impact on creative industries." Each subagent completes its task correctly: the web research agent finds relevant articles, the document analysis agent accurately summarizes studies, and the synthesis agent produces coherent findings. However, the final reports cover only visual arts, ignoring music, writing, and film production. The coordinator logs show that the topic was split into three tasks: "AI in digital art creation," "AI in graphic design," and "AI in photography." What is the most likely root cause?

- **A.** The web research agent's queries are not comprehensive enough and should include more creative sectors.
- **B.** The coordinator's task decomposition is too narrow and leaves several relevant areas uncovered.
- **C.** The document analysis agent excludes sources about non-visual creative sectors because its relevance criteria are too restrictive.
- **D.** The synthesis agent lacks instructions to identify coverage gaps in the results received from the other agents.

#### Correct answer to Question 27: B

The logs show that the coordinator decomposed "creative industries" into tasks covering only visual arts: digital art, graphic design, and photography. Music, writing, and film were omitted. The subagents worked correctly within the assigned scope: the problem lies in the initial decomposition, not the downstream agents.

## Scenario: Multi-Agent Research System

### Question 28

During system design, you gave the document analysis agent a generic `fetch_url` tool for loading documents from URLs. Production logs show that the agent now often retrieves search-engine results pages to conduct ad hoc web searches, a task that should be assigned to the web research agent. This produces inconsistent results. What is the most effective fix?

- **A.** Replace `fetch_url` with a `load_document` tool that verifies the URLs point to supported document formats.
- **B.** Add instructions to the document analysis agent prompt to use `fetch_url` only to load document URLs, not to conduct searches.
- **C.** Apply a filter that blocks `fetch_url` calls to known search-engine domains while allowing other URLs.
- **D.** Remove `fetch_url` from the document analysis agent and route all URL loading through the coordinator and web research agent.

#### Correct answer to Question 28: A

The document analysis agent has a tool that is too generic: `fetch_url` lets it stray from its role and improvise web searches. It is preferable to constrain the tool to its intended task, allowing it to load PDFs, DOCX, TXT, CSV, and spreadsheets, while validating the MIME type, extension, or content type and rejecting generic HTML pages or search-engine results pages. Web search remains the responsibility of the specialized agent. Prompt instructions leave the tool too powerful; blocking search-engine domains covers only some cases; removing URL loading entirely is excessive because the document agent may need to load documents from URLs.

## Scenario: Multi-Agent Research System

### Question 29

While researching a broad topic, the web research and document analysis agents both investigate the same subtopics. Their results overlap substantially, and token usage is nearly doubled without a proportional increase in research breadth or depth. What is the most effective way to address the problem?

- **A.** Implement shared state in which agents register the areas they are working on so others can dynamically avoid duplication.
- **B.** Have the coordinator divide the research scope before delegating, giving each agent distinct subtopics or sources.
- **C.** Switch to sequential execution: document analysis begins only after web research and uses its results to avoid duplication.
- **D.** Let both agents finish in parallel and ask the coordinator to remove overlapping results before passing them to the synthesis agent.

#### Correct answer to Question 29: B

The problem originates in **orchestration**: agents work in parallel without a clear division of scope, duplicating work and consuming tokens. The coordinator should assign distinct tasks: for example, web research for recent trends, news, and public sources, and document analysis for uploaded studies, internal reports, and PDFs; or separate subtopics such as market, technology, risks, and regulation. Deduplicating at the end removes duplication only after tokens have already been wasted; a shared registry of work areas adds complexity; sequential execution reduces parallelism unnecessarily.

## Scenario: Multi-Agent Research System

### Question 30

During testing, the synthesis agent often needs to verify specific claims while combining results. Currently, when verification is needed, it hands control back to the coordinator, which invokes the web research agent and then calls the synthesis agent again with the results. This adds 2–3 steps per task and increases latency by 40%. Evaluation shows that 85% of verifications are simple fact checks (dates, names, statistics), while 15% require deeper investigation. What is the most effective approach to reduce overhead while maintaining reliability?

- **A.** Ask the web research agent to proactively retain additional information for each source during the initial research, anticipating what the synthesis agent may need to verify.
- **B.** Ask the synthesis agent to collect all required verifications and pass them to the coordinator in a batch at the end of its pass, so they can be sent to the web agent together.
- **C.** Give the synthesis agent access to all web research tools so it can handle every verification directly without going through the coordinator.
- **D.** Give the synthesis agent a constrained `verify_fact` tool for simple checks, while continuing to delegate complex verification to the web research agent through the coordinator.

#### Correct answer to Question 30: D

The current workflow is unnecessarily expensive for simple checks. Since 85% involve dates, names, or statistics, it is useful to give the synthesis agent a limited, controlled tool for quickly verifying facts. It should not receive access to all search tools: the remaining 15% of complex verifications continue to go through the coordinator and web agent.

## Scenario: Customer Support Resolution Agent

### Question 31

You are developing a Claude Agent SDK agent to resolve ambiguous customer support requests, such as returns, billing disputes, and account issues. The agent uses custom MCP tools (`get_customer`, `lookup_order`, `process_refund`, `escalate_to_human`) to access backend systems. The goal is to resolve over 80% of requests on first contact while recognizing when to escalate.

Production metrics show that for complex cases involving billing disputes or returns across multiple orders, customer satisfaction is 15% lower than for simple cases, even when the resolution is technically correct. The agent provides accurate resolutions but explains its reasoning inconsistently: sometimes it omits relevant policy details, other times timelines or next steps. The gaps vary from case to case. You want to improve resolution quality without increasing the human review workload. What is the most effective approach?

- **A.** Ask the agent to ask "Does this fully answer your request?" before closing the case so customers can request more information.
- **B.** Upgrade the model from Haiku to Sonnet for complex cases, routing them based on detected complexity.
- **C.** Add few-shot examples of complete explanations for five common types of complex cases to the system prompt, showing how to include policies, timelines, and next steps.
- **D.** Add a self-critique step in which the agent checks the completeness of its draft: whether it answers the request, includes context, and anticipates follow-ups.

#### Correct answer to Question 31: D

The gaps vary from case to case: sometimes the applicable policy is missing; other times the timeline or next step is missing. Examples for five common cases do not cover every situation, so a dynamic check of the generated response is needed. Before sending, a self-critique step can verify that the resolution is justified, relevant policies and timelines are included, and likely customer questions are anticipated. Asking the customer whether the answer is complete shifts the problem to the customer, a bigger model does not guarantee completeness, and examples for five case types cover only known patterns.

## Scenario: Customer Support Resolution Agent

### Question 32

Production logs show that the agent often calls `get_customer` when users ask about an order's status, even though `lookup_order` is more appropriate. Both tools have minimal descriptions ("retrieves customer information" and "retrieves order details") and accept similar identifier formats. What is the most effective first intervention to improve selection reliability?

- **A.** Expand each tool's description with supported input formats, example requests, edge cases, and when to prefer it over others.
- **B.** Add few-shot examples of correct patterns to the system prompt, with 5–8 examples of order requests routed to `lookup_order`.
- **C.** Implement a routing layer that analyzes the input before each turn and preselects the tool based on detected keywords and identifiers.
- **D.** Consolidate the two tools into a single `lookup_entity` that accepts any identifier and internally chooses which backend to query.

#### Correct answer to Question 32: A

The problem is ambiguity in the descriptions. They are the main signal the model uses to select tools: they should clarify inputs, purpose, edge cases, and boundaries of use. Few-shot examples may help later, but the first step is to fix the tool definitions.

## Scenario: Customer Support Resolution Agent

### Question 33

Production metrics show that the agent averages more than four API steps to resolve a request. Analysis reveals that Claude often requests `get_customer` and `lookup_order` in separate sequential turns, even when both are needed from the start. What is the most effective way to reduce the number of steps?

- **A.** Create composite tools, such as `get_customer_with_orders`, that combine common lookup patterns in a single call.
- **B.** Have Claude group tool requests in the same turn and return results together.
- **C.** Increase `max_tokens` to let Claude plan longer and spontaneously group calls.
- **D.** Implement speculative execution, automatically calling tools that might be needed along with the requested one and returning all results.

#### Correct answer to Question 33: B

Asking Claude to group related calls in a single turn and return their results together uses the model's ability to request multiple tools at once. It reduces sequential behavior with minimal architectural changes.

## Scenario: Customer Support Resolution Agent

### Question 34

Production data shows that in 12% of cases the agent skips `get_customer` and calls `lookup_order` using only the name provided by the customer, sometimes identifying the wrong account and issuing incorrect refunds. Which change addresses the problem most effectively?

- **A.** Add few-shot examples showing the agent always calling `get_customer` first, even when the customer provides order details.
- **B.** Implement a routing classifier that analyzes each request and enables only the tools appropriate to its type.
- **C.** Strengthen the system prompt by specifying that customer verification with `get_customer` is mandatory before any order operation.
- **D.** Add a programmatic prerequisite that blocks `lookup_order` and `process_refund` until `get_customer` returns a verified customer ID.

#### Correct answer to Question 34: D

A programmatic constraint is necessary to guarantee a tool-call sequence required by critical business logic, such as identity verification before processing a refund. Prompts and examples depend on probabilistic compliance and do not provide sufficient guarantees when errors have financial consequences. A routing classifier controls tool availability, not call order.

## Scenario: Customer Support Resolution Agent

### Question 35

The agent resolves 55% of requests on first contact, well below the 80% target. Logs show that it escalates simple cases, such as standard replacements for damaged products accompanied by photos, while attempting to handle complex situations requiring policy exceptions on its own. What is the most effective way to improve escalation calibration?

- **A.** Add explicit escalation criteria and few-shot examples to the system prompt showing when to escalate and when to resolve autonomously.
- **B.** Ask the agent to report a confidence score from 1 to 10 and automatically route requests to an agent when it falls below a threshold.
- **C.** Implement sentiment analysis to detect frustration and trigger escalation when negative sentiment exceeds a threshold.
- **D.** Deploy a classifier trained on historical tickets to predict which requests require escalation before the main agent processes them.

#### Correct answer to Question 35: A

The problem is decision calibration. Explicit criteria and few-shot examples clarify which cases the agent can resolve and which require escalation. For example, it can independently resolve a standard replacement with a valid photo, verified order, and applicable policy; it should escalate policy exceptions, refunds above a threshold, ambiguous accounts, complex disputes, or legal risks. Model-reported confidence scores and sentiment are unreliable indicators of complexity.

## Scenario: Customer Support Resolution Agent

### Question 36

The agent handles single-issue requests with 94% accuracy, for example, "I'd like a refund for order #1234." When the customer includes multiple issues in the same message, such as "I'd like a refund for order #1234 and also update the shipping address for order #5678," tool-selection accuracy drops to 58%. The agent tends to handle only one issue or mix up parameters between requests. What is the most effective approach to improve reliability with multi-issue requests?

- **A.** Consolidate related tools into a smaller number of more generic tools.
- **B.** Implement response validation that detects incomplete answers and automatically asks the agent to address omitted issues.
- **C.** Add few-shot examples showing reasoning for multi-issue requests.
- **D.** Implement a preprocessing layer that uses a separate model call to split the message into individual requests, process them separately, and then combine the results.

#### Correct answer to Question 36: C

The agent already handles individual issues well: it needs examples showing how to decompose and route a request containing more than one issue. This is an effective, low-cost intervention that addresses the difficulty of separating issues and correctly associating parameters without adding a preprocessing layer.

## Scenario: Customer Support Resolution Agent

### Question 37

You are implementing the agent loop for the support agent. After every API call to Claude, you must decide whether to continue the loop by running the requested tools and calling Claude again, or stop and show the customer the final response. What information determines this decision?

- **A.** Analyze Claude's text for phrases like "I'm done" or "Is there anything else I can help with?" that indicate the task is complete.
- **B.** Check whether the response contains assistant text: if Claude generated an explanation, the loop should end.
- **C.** Set a maximum number of iterations, such as 10 calls, and stop when it is reached regardless of what Claude indicates.
- **D.** Check the response's `stop_reason` field: continue the loop when it is `tool_use`, and stop when it is `end_turn`.

#### Correct answer to Question 37: D

The agent loop should rely on the API's structured signal, not natural-language phrases or the presence of text:

- `stop_reason = "tool_use"`: Claude wants to use one or more tools; run them and call Claude again.
- `stop_reason = "end_turn"`: Claude has finished its turn; you can show the final response to the customer.

## Scenario: Customer Support Resolution Agent

### Question 38

Production logs show that the agent sometimes chooses `get_customer` when `lookup_order` would be more appropriate, especially for ambiguous requests like "I need help with my recent purchase." You decide to add few-shot examples to the system prompt to improve tool selection. Which approach would solve the problem most effectively?

- **A.** Add 4–6 examples of ambiguous scenarios, explaining why one tool beats the others.
- **B.** Add explicit guidance to the tool descriptions about when to use them and when not to use them in ambiguous cases.
- **C.** Group the examples by tool: first all `get_customer` scenarios, then `lookup_order` scenarios.
- **D.** Add 10–15 examples of clear, unambiguous requests showing typical use of each tool.

#### Correct answer to Question 38: A

The problem occurs in ambiguous cases. The examples should therefore show how to distinguish between plausible tools: `get_customer` is for identifying or verifying a customer and account; `lookup_order` is for purchases, orders, shipping, returns, refunds, or order status. Edge-case examples are more useful than obvious ones. Guidance in the tool descriptions may be generally useful, but the question asks for a few-shot approach.

## Scenario: Customer Support Resolution Agent

### Question 39

The `get_customer` tool returns all matches found when searching by name. When it receives multiple results, Claude chooses the customer with the most recent order; production data shows that this selects the wrong customer in 15% of cases with multiple matches. How should you address the problem?

- **A.** Have Claude ask for another identifier (email, phone, order) when `get_customer` returns several matches.
- **B.** Implement a confidence-scoring system that proceeds automatically above 85% and asks for clarification below that threshold.
- **C.** Add few-shot examples in which Claude uses conversation context to infer the correct customer without asking for clarification.
- **D.** Modify `get_customer` so it returns only the most likely match according to a ranking algorithm.

#### Correct answer to Question 39: A

The problem is ambiguity about the customer's identity. Choosing the account with the most recent order is risky and already causes errors. Before acting on an account, order, or refund, the agent must ask for an additional identifier. A confidence threshold or inference from context still makes automatic decisions about ambiguous identities; returning only the most likely match hides the ambiguity instead of handling it.

## Scenario: Customer Support Resolution Agent

### Question 40

The agent uses progressive summarization: when the context reaches 70% of capacity, it summarizes older turns and keeps recent ones verbatim. Customers cite specific amounts, such as "the 15% discount I mentioned," but the agent responds with incorrect values. Investigation shows that these details were shared more than 20 turns earlier and summarized in vague phrases like "promotional pricing was discussed." What is the most effective fix?

- **A.** Store the entire conversation history externally and retrieve it when the agent detects phrases such as "as I said before."
- **B.** Increase the summarization threshold from 70% to 85% of capacity so summarization starts later.
- **C.** Keep transactional facts (amounts, dates, orders) in a persistent "case facts" block outside the summary.
- **D.** Change the summarization prompt to preserve verbatim all numerical values, percentages, dates, and expectations stated by the customer.

#### Correct answer to Question 40: C

Summarization can compress important details such as percentages, amounts, dates, order numbers, and customer expectations. These facts should not depend on the conversation's narrative memory: they should be extracted into a structured, persistent section separate from the summarized history, for example:

```text
Case facts:
- The customer mentioned a 15% discount.
- Order number: #12345.
- Promised delivery date: May 12.
- Requested refund amount: $48.90.
```

Asking the summary to preserve numbers verbatim may help, but it is still fragile: even a good summary can lose details. The more robust solution is to separate transactional facts from the conversation history.

## Scenario: Customer Support Resolution Agent

### Question 41

Production logs show that the agent misinterprets data returned by MCP tools: Unix timestamps from `get_customer`, ISO 8601 dates from `lookup_order`, and numeric status codes (1 = pending, 2 = shipped). Some tools belong to third-party MCP servers that you cannot modify. What is the most maintainable method for normalizing data formats?

- **A.** Modify the tools you control to return readable formats and create wrappers for third-party tools.
- **B.** Add detailed documentation of each tool's format conventions to the system prompt.
- **C.** Use a `PostToolUse` hook to transform tool results first.
- **D.** Create a `normalize_data` tool to call after every data retrieval.

#### Correct answer to Question 41: C

The data arrives in different formats, and some third-party MCP tools cannot be modified. A `PostToolUse` hook can normalize results immediately after a tool call and before the agent interprets them, for example by converting status code `2` to `"shipped"` or a Unix timestamp to an ISO 8601 date. Modifying tools and wrapping third-party ones fragments the solution; documenting formats in the system prompt leaves the model responsible for interpreting them; a `normalize_data` tool requires an extra call and depends on the agent remembering to use it.

## Scenario: Customer Support Resolution Agent

### Question 42

During testing, you notice that the agent often calls `get_customer` when users ask about an order's status, even though `lookup_order` would be more appropriate. What should you examine first?

- **A.** Implement a preprocessing classifier that recognizes order requests and routes them directly to `lookup_order`.
- **B.** Review the tool descriptions to make sure their purposes are clearly distinct.
- **C.** Reduce the number of tools available to the agent to simplify selection.
- **D.** Add few-shot examples to the system prompt for every possible phrasing of an order request.

#### Correct answer to Question 42: B

When Claude often chooses the wrong tool, the first thing to check is the descriptions: `get_customer` and `lookup_order` may not be distinct enough. For example, the first should concern identity and account details, while the second should be used for order status, shipping, tracking, purchased items, returns, or refunds associated with an order. The other options are more complex or premature interventions.

## Scenario: Customer Support Resolution Agent

### Question 43

For simple cases, such as "refund order #1234," the agent resolves 91% of requests with 3–4 tool calls. For complex cases, such as "you charged me twice, the discount wasn't applied, and I want to cancel the order," it averages more than 12 calls and resolves only 54% of requests. It often investigates issues sequentially and retrieves the same customer data again for each one. What is the most effective change?

- **A.** Reduce the number of tools by consolidating `get_customer`, `lookup_order`, and billing lookups into one `investigate_issue` tool.
- **B.** Add explicit verification steps that require the agent to confirm each issue is resolved before moving to the next.
- **C.** Decompose the request into distinct issues, investigate them in parallel with shared context, then synthesize.
- **D.** Add few-shot examples to the prompt showing ideal tool-call sequences for different composite billing cases.

#### Correct answer to Question 43: C

The agent treats a composite request as a linear sequence, repeats lookups, and loses efficiency. It is better to separate the issues—duplicate charge, unapplied discount, and cancellation request—use a shared context with customer, account, and order data, and investigate the different threads in parallel or independently. Finally, the agent can synthesize a single, coherent response.

## Scenario: Customer Support Resolution Agent

### Question 44

Production logs show a pattern: when customers include the word "account" in their messages, for example, "I want to check my account for the order I placed yesterday," the agent calls `get_customer` first in 78% of cases. For similar requests without the word "account," for example, "I want to check the order I placed yesterday," it calls `lookup_order` first in 93% of cases. The tool descriptions are clear and unambiguous. What is the most likely cause of the discrepancy?

- **A.** The model needs more training data on multi-concept messages and should be fine-tuned with examples that include both account and order references.
- **B.** The system prompt contains keyword-sensitive instructions, such as rules about "account", that push the model toward undesirable tool-selection patterns.
- **C.** The tool descriptions need additional negative examples specifying when not to use them, to prevent this keyword-triggered confusion.
- **D.** The base training associates the term "account" with customer operations, overriding the tool descriptions.

#### Correct answer to Question 44: B

The decisive detail is that the tool descriptions are already clear and unambiguous. The most likely cause is an instruction in the system prompt, such as "for account-related requests, call `get_customer` first," which makes behavior sensitive to the word "account" even when the intent is about an order.

## Scenario: Customer Support Resolution Agent

### Question 45

After calling `get_customer` and `lookup_order`, the agent has retrieved all available data but does not know how to proceed. Which situation is the most appropriate reason to call `escalate_to_human`?

- **A.** The customer asks a billing question and also requests a return. The agent should escalate because a human can coordinate both requests in one interaction.
- **B.** The customer says they never received the order, but tracking shows it was delivered and signed for at their address three days ago. The agent should escalate to avoid damaging the customer relationship by presenting contradictory evidence.
- **C.** The customer wants to cancel an order shipped yesterday, with delivery expected tomorrow. The agent should escalate because the customer may change their mind after receiving the package.
- **D.** A competitor price match, which the policy does not cover: escalate to clarify.

#### Correct answer to Question 45: D

The agent has all the data, but there is no clear policy: the policy covers price reductions on the company's own site, not competitor prices. The policy must be interpreted or an exception considered, making this an appropriate reason to call `escalate_to_human`.

- A billing question plus a return request can be decomposed and handled without necessarily involving a human.
- A "never received" claim against signed delivery tracking can be handled by carefully explaining the discrepancy and suggesting next steps.
- Cancelling a shipped order falls under the existing policy for shipped orders, cancellations, or returns.

## Scenario: Code Generation with Claude Code

### Question 46

You are using Claude Code to accelerate software development and integrate it into the team's workflow through custom slash commands and `CLAUDE.md` configurations. The codebase includes areas with different conventions: React components use a functional style with hooks, API handlers use `async/await` with specific error handling, and database models follow the repository pattern. Test files are colocated with the code they verify, for example `Button.test.tsx` next to `Button.tsx`; you want them all to follow the same conventions regardless of location. What is the most maintainable way to have Claude automatically apply the correct conventions?

- **A.** Consolidate all conventions in the main `CLAUDE.md`, divide them into sections by area, and rely on Claude to infer which ones to apply.
- **B.** Create skills in `.claude/skills/` for each code type, putting the relevant conventions in the `SKILL.md` files.
- **C.** Create rule files in `.claude/rules/` with glob patterns in their YAML frontmatter, to apply conventions conditionally based on file paths.
- **D.** Put a `CLAUDE.md` file in each subdirectory with area-specific conventions.

#### Correct answer to Question 46: C

Conventions depend on file type or path. Rules in `.claude/rules/` with glob patterns automatically apply the corresponding instructions regardless of directory. For example, `**/*.test.ts` and `**/*.test.tsx` can apply the same rules to all tests without duplicating `CLAUDE.md` in every folder.

## Scenario: Code Generation with Claude Code

### Question 47

The team has used Claude Code for several months. Recently, three developers reported that Claude correctly follows the instruction "always include comprehensive error handling," while a fourth developer, who just joined the team, says Claude does not follow it. Everyone works in the same repository and has downloaded the latest version. What is the most likely cause and the appropriate fix?

- **A.** Claude Code caches `CLAUDE.md` content; the long-time developers use cached versions, while the new member loaded the file after a change. Ask everyone to clear the cache.
- **B.** It lives in senior developers' personal `~/.claude/CLAUDE.md` files rather than the project file; move it to the project-level CLAUDE.md for the whole team.
- **C.** The new developer's `~/.claude/CLAUDE.md` file contains conflicting instructions that override project settings. Ask them to remove the conflicting section.
- **D.** Claude Code develops individual preference patterns over time through interactions. The new developer must repeat the request several times until Claude learns the preference.

#### Correct answer to Question 47: B

Everyone works in the same up-to-date repository, but only three people get the desired behavior: the rule is likely in the long-time developers' personal configuration rather than the shared project configuration. To apply it to the whole team, put it in the project-level `CLAUDE.md`, for example `.claude/CLAUDE.md`.

## Scenario: Code Generation with Claude Code

### Question 48

You have noticed that including 2–3 complete endpoint implementations as examples in the context significantly improves consistency when Claude generates new API endpoints. However, these examples are useful only for creating endpoints, not for fixing bugs, reviewing code, or other tasks in the API directory. What is the most efficient configuration?

- **A.** Manually reference the example endpoints in every generation request, copying the relevant code into the prompt.
- **B.** Configure path-specific rules in `.claude/rules/api/`, include the example code, and activate them when working in the API directory.
- **C.** Add the example endpoint code and pattern documentation to the project's `CLAUDE.md` so they are always available.
- **D.** Create a skill that points to the example endpoints and their patterns, invoked on demand with a slash command.

#### Correct answer to Question 48: D

The example context is needed only when creating new endpoints. It is not useful to load it all the time through `CLAUDE.md` or rules applied to the entire API directory, because that would consume context during reviews and bug fixes too. A dedicated skill can be invoked only when needed, for example with `/create-api-endpoint`.

## Scenario: Code Generation with Claude Code

### Question 49

You need to add Slack as a new notification channel. The existing codebase follows clear, consistent patterns for email, SMS, and push notifications. However, Slack's API offers different integration approaches: incoming webhooks (simple, one-way), bot tokens (allow delivery confirmation and programmatic control), or a Slack App (two-way events, requiring workspace approval). The ticket only says "add Slack support," without specifying the integration method or need for advanced features such as delivery tracking. How should you proceed?

- **A.** Use Plan mode to explore the options and their architectural implications, then present a recommendation before coding.
- **B.** Start directly with incoming webhooks, following the one-way pattern of existing notifications.
- **C.** Start directly with bot tokens to enable delivery confirmations.
- **D.** Start directly by creating the Slack channel class following existing patterns and defer the integration-method decision.

#### Correct answer to Question 49: A

The requirement is ambiguous and involves important architectural decisions: webhooks are simple and one-way; bot tokens offer more control and delivery confirmations; Slack Apps support two-way events but require approval and add complexity. "Add Slack support" is not enough to choose. Claude Code should use Plan mode to analyze the code, compare the options, assess security, permissions, and future features, and propose a plan before changing files.

## Scenario: Code Generation with Claude Code

### Question 50

The team wants to add a GitHub MCP server to look up pull requests and check CI status through Claude Code. Each of the six developers has their own GitHub personal access token. You want to configure the tools consistently for the whole team without putting credentials in version control. What is the most effective approach?

- **A.** Create a wrapper for the MCP server that reads tokens from a `.env` file, forwards requests to the GitHub API, and is added to the project `.mcp.json`.
- **B.** Ask each developer to configure the server at user level with `claude mcp add --scope user`.
- **C.** Add it to the project `.mcp.json` with `${GITHUB_TOKEN}` expansion, documenting the variable in the README.
- **D.** Configure the server at project level with a placeholder token and ask developers to override it in their local user-level configuration.

#### Correct answer to Question 50: C

A project-level configuration provides consistent tools for the whole team; `${GITHUB_TOKEN}` expansion lets it read the token from the environment without storing it in the repository. Each developer sets their own token locally. User-level configuration produces different setups across developers, a placeholder token overridden locally is more fragile, and a custom wrapper adds unnecessary complexity.

In the project's `.mcp.json`, the GitHub server configuration should read the credential from `env.GITHUB_TOKEN: "${GITHUB_TOKEN}"`; the README should explain how developers can set the environment variable locally.

## Scenario: Code Generation with Claude Code

### Question 51

The team created a `/migration` skill that generates database migration files. The skill receives the migration name through `$ARGUMENTS`. Three problems occur in production: (1) developers often invoke the skill without arguments, producing poorly named files; (2) sometimes the skill incorporates database schema details from unrelated previous conversations; (3) a developer accidentally triggered destructive test cleanup while the skill had overly broad tool access. Which configuration solves all three problems?

- **A.** Use positional parameters `$1` and `$2` instead of `$ARGUMENTS`, include explicit references to schema files using `@` syntax, and add a description in the frontmatter warning about destructive operations.
- **B.** Split the skill into `/migration-create` and `/migration-apply`, add instructions to each `SKILL.md` to ask for a migration name if it is missing, and use different `allowed-tools` scopes.
- **C.** Add `argument-hint` to request required parameters, `context: fork` to isolate execution, and limit `allowed-tools` to file-writing operations.
- **D.** Add `$ARGUMENTS` validation instructions to `SKILL.md`, ask Claude to ignore previous context, and list prohibited operations.

#### Correct answer to Question 51: C

This configuration solves all three problems:

- `argument-hint` prompts the developer to provide the migration name;
- `context: fork` isolates execution from previous conversations;
- `allowed-tools` limits available tools and reduces the risk of destructive operations.

Validation instructions in `SKILL.md` rely only on the model and are therefore more fragile. Positional parameters with `@` references do not isolate context or limit tools; splitting into two skills separates creation and application but does not adequately solve the context and missing-argument problems.

## Scenario: Code Generation with Claude Code

### Question 52

You need to add error-handling wrappers to external API calls in a 120-file codebase. The work has three phases: (1) identify all call sites and patterns for API calls; (2) design the error-handling strategy together; (3) implement the wrappers consistently. During the first phase, Claude produces very verbose output, listing hundreds of call sites with their context. The context window is filling quickly before exploration is finished.

What is the most effective approach for completing the work while maintaining implementation consistency?

- **A.** Use the Explore subagent for the first phase, isolating the verbose output and getting a summary; then continue with phases 2 and 3 in the main conversation.
- **B.** Switch to headless mode with `--continue`, transferring explicit context summaries between batch invocations.
- **C.** Define the error-handling pattern in `CLAUDE.md`, then process files in groups across multiple sessions, relying on the shared memory file for consistency.
- **D.** Do all phases in the main conversation, periodically using `/compact` to reduce context while analyzing files.

#### Correct answer to Question 52: A

The exploration phase produces a lot of material: hundreds of call sites, contexts, patterns, and files. It is preferable to separate it from the main conversation: the Explore subagent analyzes the files and returns a concise summary; the main conversation uses that summary to design the approach and implement it consistently. The other options fragment the work, do not properly manage exploratory output, or risk filling the context anyway.

## Scenario: Code Generation with Claude Code

### Question 53

You want to create a custom `/review` slash command that runs the team's standard code review checklist. The command must be available to every developer who clones or updates the repository. Where should you create the command file?

- **A.** In the project's root `CLAUDE.md` file.
- **B.** In a `.claude/config.json` file with a `commands` array.
- **C.** In the project repository's `.claude/commands/` directory.
- **D.** In `~/.claude/commands/` in each developer's home directory.

#### Correct answer to Question 53: C

Because the command must be available to all developers who clone or update the repository, it should be saved in the project and version-controlled, for example in `.claude/commands/review.md`. The personal `~/.claude/commands/` directory would make it available only locally. `CLAUDE.md` contains instructions and context, not slash command definitions.

## Scenario: Code Generation with Claude Code

### Question 54

You have been assigned to restructure the team's monolithic application into microservices. This will require changes across dozens of files and decisions about service boundaries and dependencies between modules. What approach should you take?

- **A.** Use direct execution with complete initial instructions specifying exactly how to structure each service.
- **B.** Start with direct execution and make incremental changes, letting the implementation reveal the natural service boundaries.
- **C.** Start with direct execution and switch to Plan mode only if unexpected complexity emerges during implementation.
- **D.** Use Plan mode to explore the codebase, understand dependencies, and design an implementation approach before making changes.

#### Correct answer to Question 54: D

Transforming a monolith into microservices involves extensive changes, architectural decisions, and multiple possible approaches. Plan mode lets you explore the code, understand dependencies, and design a solution before modifying it, reducing the risk of costly rework. The other options start implementation too early.

## Scenario: Code Generation with Claude Code

### Question 55

The team created an `/analyze-codebase` skill that performs a comprehensive code analysis: dependency scanning, test coverage calculation, and quality metrics. After running it, team members report that Claude responds more slowly and loses track of the original task. What is the most effective way to solve the problem while retaining all analysis capabilities?

- **A.** Ask the skill to condense all results into a brief summary before displaying them.
- **B.** Split the skill into three smaller skills, each with a less extensive output.
- **C.** Add `context: fork` to the skill frontmatter to run the analysis in isolation.
- **D.** Add `model: haiku` to the frontmatter to use a faster, more efficient model for analysis.

#### Correct answer to Question 55: C

The skill produces a lot of context and burdens the main session, making Claude less responsive and distracting it from the original task. With `context: fork`, the analysis runs in an isolated context, preserving the skill's capabilities without overloading or confusing the main conversation.

## Scenario: Code Generation with Claude Code

### Question 56

The team's `CLAUDE.md` has grown to more than 500 lines and mixes TypeScript conventions, testing guidelines, API patterns, and deployment procedures. Developers struggle to find and update the relevant sections. Which approach does Claude Code support for organizing project instructions into focused thematic modules?

- **A.** Define a `.claude/config.yaml` file that maps file patterns to specific sections of `CLAUDE.md`.
- **B.** Split the instructions into `README.md` files in the relevant subdirectories, which Claude would automatically load as instructions.
- **C.** Create separate Markdown files in `.claude/rules/`, each dedicated to a topic, such as `testing.md` or `api-conventions.md`.
- **D.** Create multiple `CLAUDE.md` files at different levels of the directory tree, each overriding the parent file's instructions.

#### Correct answer to Question 56: C

Separate files in `.claude/rules/` make it possible to split an oversized `CLAUDE.md` into smaller, maintainable, focused modules, such as `testing.md`, `api-conventions.md`, `typescript.md`, and `deployment.md`. Nested `CLAUDE.md` files are not the best system for organizing instructions into thematic modules.

## Scenario: Code Generation with Claude Code

### Question 57

You are creating the custom `/explore-alternatives` skill, which the team uses to develop and evaluate different implementation approaches before choosing one. Developers report that after running the skill, Claude's later responses are influenced by the exploration: they sometimes refer to discarded approaches or retain exploratory context that confuses implementation. How should you configure the skill?

- **A.** Add `context: fork` to the skill's frontmatter, so it runs isolated.
- **B.** Create the skill in `~/.claude/skills/` instead of `.claude/skills/`.
- **C.** Split the skill into two skills, `/explore-start` and `/explore-end`, to delimit the exploratory context that should be discarded.
- **D.** Use the `!` prefix in the skill to run the exploratory logic as a Bash process.

#### Correct answer to Question 57: A

The skill produces speculative context, such as discarded approaches, tradeoffs, and provisional ideas. If it remains in the main conversation, it can influence later implementation. With `context: fork`, the exploration happens in an isolated context and only useful results return to the main session.

## Scenario: Code Generation with Claude Code

### Question 58

The team's `CLAUDE.md` is over 400 lines and contains coding standards, testing conventions, a detailed pull request review checklist, deployment instructions, and database migration procedures. You want Claude to always follow the coding standards and testing conventions, but apply review, deployment, and migration guidance only when performing those tasks. What is the most effective way to reorganize the instructions?

- **A.** Keep everything in `CLAUDE.md`, using `@import` syntax to split it into separate files by category.
- **B.** Keep universal standards in `CLAUDE.md`, and create skills for specific workflows that are invoked only when needed.
- **C.** Move all instructions into separate skills by workflow type, leaving only a brief project description in `CLAUDE.md`.
- **D.** Split `CLAUDE.md` into `.claude/rules/` files with path-specific glob patterns so each rule is loaded only for matching file types.

#### Correct answer to Question 58: B

Always-applicable guidance, such as coding standards and testing conventions, should remain in `CLAUDE.md`. Procedures that apply only to specific tasks, such as the pull request checklist, deployment workflow, and migrations, are better suited to dedicated skills. This way, Claude always loads the general standards without carrying unnecessary or misleading instructions into unrelated tasks.

## Scenario: Code Generation with Claude Code

### Question 59

You created the `/commit` skill in `.claude/skills/commit/SKILL.md` for the team. A developer wants to customize it for their own workflow, using a different commit message format and adding checks, without affecting colleagues. What should you recommend?

- **A.** Add conditional logic to the project skill based on the username in the frontmatter.
- **B.** Create a personal version with the same name in `~/.claude/skills/commit/SKILL.md`.
- **C.** Set `override: true` in the personal skill's frontmatter so it takes precedence over the project skill.
- **D.** Create a personal version with a different name in `~/.claude/skills/`, for example `/my-commit`.

#### Correct answer to Question 59: D

Project skills take precedence over personal skills with the same name. To make the customization available alongside the shared team skill, the developer should use a different name in their personal `~/.claude/skills/` directory, for example `/my-commit`.

## Scenario: Code Generation with Claude Code

### Question 60

You asked Claude Code to implement a function that transforms API responses into a normalized internal format. After two iterations, the produced structure still does not match expectations: some fields are nested differently and timestamps are not formatted correctly. You described the requirements in prose, but Claude seems to interpret them differently in each iteration. What is the most effective approach for the next attempt?

- **A.** Provide 2–3 concrete input and output examples showing the expected transformation for representative API responses.
- **B.** Rewrite the requirements in greater technical detail, specifying exact field mappings, nesting rules, and timestamp formats.
- **C.** Write a JSON schema to define the expected output structure and validate Claude's output after each iteration.
- **D.** Ask Claude to explain how it currently interprets the requirements so you can identify differences in understanding.

#### Correct answer to Question 60: A

The prose description is interpreted differently on each iteration. For data transformations, concrete "input → expected output" examples clarify field nesting, name mappings, timestamp formats, and how to handle missing or null values. A JSON schema can be useful for validating the result, but it does not necessarily show how to transform every case correctly.
