# Google Agents Intensive — Course Compliance Remediation Plan

This document tracks all changes required for Township CEO to fully comply with the Google 5-Day AI Agents Intensive whitepapers (June 2026). Each section maps to a course day, lists gaps found, and prescribes the fix with implementation status.

---

## Day 1 — Agent Loop & Context Engineering

### Gaps Found
1. Agents fire once and stop — no observe/iterate cycle
2. No differentiation between static vs dynamic context
3. No user feedback loop after agent output
4. No context engineering (6 context types not layered)

### Remediation Tasks

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 1.1 | Add iterative agent loop: perceive → plan → act → observe → iterate | `server.ts` | PENDING |
| 1.2 | Implement static context (system instructions, GEMINI.md, AGENTS.md) | `server.ts`, new files | PENDING |
| 1.3 | Implement dynamic context (on-demand skill loading, tool results, session history) | `server.ts` | PENDING |
| 1.4 | Add user correction feedback mechanism after agent output | `App.tsx`, `server.ts` | PENDING |
| 1.5 | Create GEMINI.md and AGENTS.md config files | root directory | PENDING |

---

## Day 2 — Agent Tools & Interoperability (MCP)

### Gaps Found
1. No MCP server or client implementation
2. Tools are string descriptions — no schema-based function calling
3. No tool result validation or execution feedback loop

### Remediation Tasks

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 2.1 | Implement ToolDefinition with JSON schemas as callable functions | `server.ts` | PENDING |
| 2.2 | Wire cash_calculator, campaign_builder, inventory_optimizer as real tools | `server.ts` | PENDING |
| 2.3 | Add tool execution engine that validates params and returns structured results | `server.ts` | PENDING |
| 2.4 | Feed tool results back into agent context for next iteration | `server.ts` | PENDING |
| 2.5 | Add MCP-style server endpoint for external tool discovery | `server.ts` | PENDING |

---

## Day 3 — Agent Skills (SKILL.md Format)

### Gaps Found
1. Skills are flat markdown files — no SKILL.md folder structure
2. No progressive disclosure (skills loaded on demand by trigger)
3. No token budget tracking
4. No skill evaluation (trigger gates, output quality, tool trajectory)

### Remediation Tasks

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 3.1 | Restructure skills/ into proper SKILL.md format with folders | `skills/*` | PENDING |
| 3.2 | Add scripts/, references/, assets/ subdirectories per skill | `skills/*/` | PENDING |
| 3.3 | Define trigger conditions for each skill | `skills/*/SKILL.md` | PENDING |
| 3.4 | Implement progressive disclosure engine (load skill on trigger match) | `server.ts` | PENDING |
| 3.5 | Add token budget tracking per skill invocation | `server.ts` | PENDING |
| 3.6 | Implement skill evaluation gates | `server.ts` | PENDING |

---

## Day 4 — Security & Evaluation

### Gaps Found
1. No evaluation framework (7 evaluation dimensions missing)
2. No LLM-as-judge scoring
3. No observability (OpenTelemetry, tracing, spans)
4. No sandboxing for agent execution
5. No circuit breakers or version checkpoints
6. No Red/Blue/Green SecOps
7. No cost/token tracking
8. No intent satisfaction measurement

### Remediation Tasks

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 4.1 | Implement 7-dimension evaluation scoring (intent, correctness, cost, quality, trajectory, self-repair, safety) | `server.ts` | PENDING |
| 4.2 | Add LLM-as-judge evaluator using Gemini to score agent outputs | `server.ts` | PENDING |
| 4.3 | Add OpenTelemetry tracing (agent.session, agent.think, agent.tool spans) | `server.ts` | PENDING |
| 4.4 | Implement token usage and cost tracking per session | `server.ts` | PENDING |
| 4.5 | Add circuit breaker (Agent Trust Score, version checkpoints, rollback) | `server.ts` | PENDING |
| 4.6 | Add Agent Behavioural Analytics (AgBOM tracking) | `server.ts` | PENDING |
| 4.7 | Add intent satisfaction check using session prefix as rubric | `server.ts` | PENDING |

---

## Day 5 — Spec-Driven Development & Production

### Gaps Found
1. No specs/ folder with BDD/Gherkin feature files
2. No CI/CD pipeline
3. No tests implemented (documented but missing)
4. No deployment config (Dockerfile, Cloud Run)
5. No A2A protocol between agents
6. No layered system prompts (GEMINI.md, AGENTS.md)

### Remediation Tasks

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 5.1 | Create specs/ folder with BDD .feature files for key use cases | `specs/*.feature` | PENDING |
| 5.2 | Add Gherkin scenario definitions (Given/When/Then) | `specs/` | PENDING |
| 5.3 | Implement 5 test cases (tool use, safe refusals, escalation) | `src/__tests__/` | PENDING |
| 5.4 | Add GitHub Actions CI/CD workflow | `.github/workflows/` | PENDING |
| 5.5 | Create Dockerfile for containerized deployment | root | PENDING |
| 5.6 | Add layered prompt files (GEMINI.md, AGENTS.md) | root, `.gemini/` | PENDING |
| 5.7 | Add evaluation-gated CI/CD checks | `.github/workflows/` | PENDING |

---

## Summary

| Day | Tasks | Priority |
|-----|-------|----------|
| Day 1 | 5 tasks | HIGH |
| Day 2 | 5 tasks | HIGH |
| Day 3 | 6 tasks | HIGH |
| Day 4 | 7 tasks | CRITICAL |
| Day 5 | 7 tasks | HIGH |
| **Total** | **30 tasks** | |

Last updated: 2026-07-06
