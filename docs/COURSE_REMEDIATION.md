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
| 1.2 | Implement static context (system instructions, GEMINI.md, AGENTS.md) | `server.ts`, `.gemini/GEMINI.md`, `AGENTS.md` | COMPLETED |
| 1.3 | Implement dynamic context (on-demand skill loading, tool results, session history) | `server.ts` | COMPLETED |
| 1.4 | Add user correction feedback mechanism after agent output | `App.tsx`, `server.ts` | COMPLETED |
| 1.5 | Create GEMINI.md and AGENTS.md config files | root directory | COMPLETED |

---

## Day 2 — Agent Tools & Interoperability (MCP)

### Gaps Found
1. No MCP server or client implementation
2. Tools are string descriptions — no schema-based function calling
3. No tool result validation or execution feedback loop

### Remediation Tasks

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 2.1 | Implement ToolDefinition with JSON schemas as callable functions | `server.ts` | COMPLETED |
| 2.2 | Wire cash_calculator, campaign_builder, inventory_optimizer as real tools | `server.ts` | COMPLETED |
| 2.3 | Add tool execution engine that validates params and returns structured results | `server.ts` | COMPLETED |
| 2.4 | Feed tool results back into agent context for next iteration | `server.ts` | COMPLETED |
| 2.5 | Add MCP-style server endpoint for external tool discovery | `server.ts` | COMPLETED |
| 2.6 | Integrate web-search-mcp external MCP server for real-time web research | `mcp-client.ts`, `server.ts` | COMPLETED |
| 2.7 | Auto-trigger web search in Research Agent for regulation/pricing/trend queries | `server.ts`, `.agent/skills/research_agent/SKILL.md` | COMPLETED |

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
| 3.1 | Restructure skills/ into proper SKILL.md format with folders | `.agent/skills/*` | COMPLETED |
| 3.2 | Add scripts/, references/, assets/ subdirectories per skill | `.agent/skills/*/` | COMPLETED |
| 3.3 | Define trigger conditions for each skill | `.agent/skills/*/SKILL.md` | COMPLETED |
| 3.4 | Implement progressive disclosure engine (load skill on trigger match) | `server.ts` | COMPLETED |
| 3.5 | Add token budget tracking per skill invocation | `server.ts` | COMPLETED |
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
| 4.1 | Implement 7-dimension evaluation scoring (intent, correctness, cost, quality, trajectory, self-repair, safety) | `server.ts` | COMPLETED |
| 4.2 | Add LLM-as-judge evaluator using Gemini to score agent outputs | `server.ts` | COMPLETED |
| 4.3 | Add telemetry tracing (agent.session, agent.think, agent.tool spans) | `server.ts` | COMPLETED |
| 4.4 | Implement token usage and cost tracking per session | `server.ts` | COMPLETED |
| 4.5 | Add circuit breaker (Agent Trust Score, version checkpoints, rollback) | `server.ts` | COMPLETED |
| 4.6 | Add Agent Behavioural Analytics (AgBOM tracking) | `server.ts` | PENDING |
| 4.7 | Add intent satisfaction check using session prefix as rubric | `server.ts` | COMPLETED |

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
| 5.1 | Create specs/ folder with BDD .feature files for key use cases | `specs/*.feature` | COMPLETED |
| 5.2 | Add Gherkin scenario definitions (Given/When/Then) | `specs/` | COMPLETED |
| 5.3 | Implement test cases (tool use, safe refusals, escalation) | `src/__tests__/` | COMPLETED |
| 5.4 | Add GitHub Actions CI/CD workflow | `.github/workflows/` | COMPLETED |
| 5.5 | Create Dockerfile for containerized deployment | root | COMPLETED |
| 5.6 | Add layered prompt files (GEMINI.md, AGENTS.md) | root, `.gemini/` | COMPLETED |
| 5.7 | Add evaluation-gated CI/CD checks | `.github/workflows/` | COMPLETED |

---

## Summary

| Day | Total | Completed | Pending | Priority |
|-----|-------|-----------|---------|----------|
| Day 1 | 5 | 4 | 1 (iterative loop) | HIGH |
| Day 2 | 7 | 7 | 0 | HIGH |
| Day 3 | 6 | 5 | 1 (eval gates) | HIGH |
| Day 4 | 7 | 6 | 1 (AgBOM) | CRITICAL |
| Day 5 | 7 | 7 | 0 | HIGH |
| **Total** | **32** | **29** | **3** | |

Last updated: 2026-07-06
