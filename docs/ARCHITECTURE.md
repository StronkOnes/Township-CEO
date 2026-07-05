# Architecture Specification

Township CEO is designed using a modular, full-stack architecture that isolates the core client-side presentation, the server-side agent coordination engine, and the provider-agnostic model abstraction layer.

## 🧱 Architectural Topology

```text
       ┌────────────────────────────────────────────────────────┐
       │                 CLIENT (Vite + React)                  │
       │                                                        │
       │  ┌──────────────────┐  ┌────────────────────────────┐  │
       │  │ Business Profile │  │    Interactive Workspace   │  │
       │  └────────┬─────────┘  └──────────────┬─────────────┘  │
       └───────────┼───────────────────────────┼────────────────┘
                   │ HTTP JSON API             │
                   ▼                           ▼
       ┌────────────────────────────────────────────────────────┐
       │                SERVER (Node.js + Express)              │
       │                                                        │
       │  ┌──────────────────────────────────────────────────┐  │
       │  │             Agent Coordination Engine            │  │
       │  │     (CEO, Finance, Marketing, Operations, etc.)   │  │
       │  └────────────────────────┬─────────────────────────┘  │
       │                           │                            │
       │  ┌────────────────────────▼─────────────────────────┐  │
       │  │              Provider Abstraction Layer          │  │
       │  │     (Unified AI Interface & Fallback Router)     │  │
       │  └────────────────────────┬─────────────────────────┘  │
       └───────────────────────────┼────────────────────────────┘
                                   │ HTTPS SDK Requests
                                   ▼
                       ┌───────────────────────┐
                       │     AI PROVIDERS      │
                       │ (Gemini, OpenAI, etc.)│
                       └───────────────────────┘
```

---

## 1. Provider Abstraction Layer (PAL)

To maintain provider independence and avoid vendor lock-in, all LLM communication is processed through a structured interface. No agent or business logic is permitted to import a provider-specific SDK directly.

### The `AIProvider` Interface

```typescript
export interface AIProvider {
  id: string;
  name: string;
  generateText(prompt: string, options?: GenerationOptions): Promise<string>;
  generateJSON<T>(prompt: string, schema: any, options?: GenerationOptions): Promise<T>;
}
```

This layer implements connectors for multiple backends:
*   **Gemini** (using `@google/genai` SDK on the server, leveraging `gemini-3.5-flash`)
*   **OpenAI**, **Anthropic**, **Local Providers** (Ollama, LM Studio) via standardized adapters.

---

## 2. Agent Coordination Protocol

The system utilizes an orchestrator-worker framework:
*   **The Orchestrator (CEO Agent)**: Receives high-level human instructions. Breaks them down into a sequence of agent sub-tasks.
*   **The Specialists (Workers)**: Execute specific business tasks. They operate with tailored system instructions (skills), specific local tools, and a shared memory boundary.

### Inter-Agent Communication Message Envelope

```typescript
export interface AgentMessage {
  id: string;
  sender: string;    // e.g., 'ceo_agent'
  receiver: string;  // e.g., 'finance_agent'
  content: string;
  timestamp: string;
  type: 'request' | 'response' | 'system_log';
}
```

---

## 3. Storage and State Management

*   **Transient Storage**: Active agent chain-of-thought and short-term conversation histories are stored inside the client's memory state and server session.
*   **Local Storage**: The `BusinessProfile` and persistent chat records are committed to standard browser `localStorage` to allow quick caching without requiring complex database credentials in the prototype phase.
*   **Scalable Path**: Designed to seamlessly bind to a Firebase/Firestore backend (using the `firebase-integration` skill) or PostgreSQL via Cloud SQL.
