# ADR 002: Orchestrator-Worker Multi-Agent Architecture

## Context

Complex business problem-solving (e.g., "Sourcing is expensive, how do I fix it?") involves multiple distinct dimensions: pricing research, budget feasibility, customer reaction, and supply chains. Putting all this responsibility into a single prompt results in context bloat, conflicting instructions, and unfocused advice. 

---

## Decision

We will adopt an **Orchestrator-Worker (CEO-Specialist)** agent architecture.
*   The **CEO Agent** serves as the orchestrator. It acts as the direct interface to the user, translates ambiguous business concerns into structured requests, dispatches them to worker agents, and compiles their feedback into a cohesive strategic plan.
*   **Worker Agents** (Research, Finance, Marketing, Operations, Customer Service) are dedicated specialists. They possess tailored skill prompts, access to specific tools, and limited, focused context windows.

---

## Status

**Approved**

---

## Consequences

*   **Positive**: High modularity. Prompts stay highly focused and manageable.
*   **Positive**: Paralellizable processing. The CEO Agent can invoke multiple specialist workers in parallel, improving response latency.
*   **Negative**: Increased API usage cost and higher token footprints as multiple LLM calls are chained during a single user query.
