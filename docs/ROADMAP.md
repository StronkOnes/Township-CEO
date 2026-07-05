# Development Roadmap

This roadmap defines the visual, strategic, and functional journey of the Township CEO application.

```text
   ┌─────────────────────────────────────────────────────────────┐
   │                  PHASE 1: THE CORE PLATFORM                 │
   │  ✔ Architect multi-agent workspace (CEO, Marketing, Finance)│
   │  ✔ Establish server-side Provider Abstraction Layer        │
   │  ✔ Launch Live Interactive Architecture & Spec Doc Hub      │
   └──────────────┬──────────────────────────────────────────────┘
                  │
                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                PHASE 2: DEEP TOOL INTEGRATION               │
   │  □ Google Search & Maps Grounding for competitor pricing    │
   │  □ Live Weather-demand algorithms for street food kiosks    │
   │  □ Calculator, receipt parser, and WhatsApp campaign export │
   └──────────────┬──────────────────────────────────────────────┘
                  │
                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │               PHASE 3: DURABLE CLOUD STORAGE                │
   │  □ Migrate local storage states to Google Cloud Firestore   │
   │  □ Provision Firebase Auth for secure business logging      │
   │  □ Shared supplier boards and real-time community price check│
   └─────────────────────────────────────────────────────────────┘
```

---

## Milestones and Deliverables

### Milestone 1: Capstone Interface & AI Bridge
*   **Objective**: Deliver a completely functional React single-page application with an Express backend that demonstrates multi-agent reasoning.
*   **Deliverables**:
    *   Unified, beautiful UI with workspace modules for Spaza Shops, Mechanics, Salons, etc.
    *   CEO agent orchestrator which invokes specialist worker chains.
    *   Comprehensive Markdown Document Reader embedded directly into the workspace.

### Milestone 2: Production Readiness & External Grounding
*   **Objective**: Enable real-world research tools so agents can consult real active databases.
*   **Deliverables**:
    *   Search-grounded pricing sheets.
    *   PDF download capabilities for marketing fliers and financial cash-flow reports.
