# AGENTS.md — Shared Multi-Tool Configuration

This file provides cross-platform agent configuration for Township CEO.

## Project Context

Township CEO is a multi-agent AI operating system for South African township businesses (Spaza Shops, Hair Salons, Barber Shops, Mechanics, Street Food Vendors).

## Architecture

- **Orchestrator Pattern**: CEO Agent delegates to specialist agents (Research, Finance, Operations, Marketing, Customer Service)
- **Provider Abstraction**: All LLM calls go through `AIProvider` interface — no direct SDK imports
- **Skill-Based**: Specialist knowledge loaded on demand via SKILL.md files with progressive disclosure

## Conventions

- All agent communication uses the standard message envelope: `{ id, sender, receiver, content, timestamp, type }`
- Tools return `{ success, toolName, data, error }` format
- Skills live in `.agent/skills/` with SKILL.md + scripts/ + references/ + assets/
- Specs live in `specs/` using Gherkin Given/When/Then format
- Evaluation uses LLM-as-judge with 7-dimension scoring rubric

## Safety Rules

1. Never expose API keys to client
2. Pause and ask human if financial allocation exceeds 50% of revenue
3. All tool calls must be logged with timestamps
4. Circuit breaker trips if Agent Trust Score drops below 0.4
5. Always produce version checkpoint before destructive operations
