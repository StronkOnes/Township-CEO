# Changelog

All notable changes to the Township CEO project are documented here. This project adheres to Semantic Versioning (`0.1.0` style).

---

## [0.1.0] - 2026-07-05
### Added
- Created complete modular planning, system documentation, and architecture specifications.
- Established the **skills/** folder containing prompts, inputs, outputs, and workflows for six specialist agents:
  - CEO Agent (`skills/ceo_agent.md`)
  - Marketing Agent (`skills/marketing_agent.md`)
  - Finance Agent (`skills/finance_agent.md`)
  - Research Agent (`skills/research_agent.md`)
  - Operations Agent (`skills/operations_agent.md`)
  - Customer Service Agent (`skills/customer_service_agent.md`)
- Created three core Architectural Decision Records (ADRs) inside `docs/adr/` regarding:
  - Provider Abstraction
  - Orchestration Architecture
  - Memory Systems
- Developed a robust, server-side Express agent server (`server.ts`) integrating the `@google/genai` SDK and implementing the `ProviderAbstraction` layer.
- Designed a stunning, premium Swiss-style modern React interface in `src/App.tsx` featuring:
  - Interactive Business Profile manager (preset profiles for Spaza Shops, Barber Shops, mechanics, food stalls, etc.).
  - Multi-Agent Collaboration simulator with a real-time message stream.
  - Active Specialist Workspace tabs (Financial calculators, Marketing material generator, FAQ template crafter).
  - Built-in live Document Hub allowing full rendering of all specs and skills in markdown.

### Files Changed
- `/metadata.json`
- `/README.md`
- `/docs/PROJECT_VISION.md`
- `/docs/ARCHITECTURE.md`
- `/docs/PLANNING.md`
- `/docs/ROADMAP.md`
- `/docs/CHANGELOG.md`
- `/docs/API_DESIGN.md`
- `/docs/MEMORY_SYSTEM.md`
- `/docs/TOOL_SYSTEM.md`
- `/docs/AGENT_PROTOCOL.md`
- `/docs/CODING_STANDARDS.md`
- `/docs/TESTING.md`
- `/docs/SECURITY.md`
- `/docs/adr/001-provider-abstraction.md`
- `/docs/adr/002-agent-orchestration.md`
- `/docs/adr/003-memory-architecture.md`
- `/skills/ceo_agent.md`
- `/skills/marketing_agent.md`
- `/skills/finance_agent.md`
- `/skills/research_agent.md`
- `/skills/operations_agent.md`
- `/skills/customer_service_agent.md`
- `/src/types.ts`
- `/src/App.tsx`
- `/server.ts`
- `/package.json`
