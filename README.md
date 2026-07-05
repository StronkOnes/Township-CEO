# Township CEO

Township CEO is an AI-powered Operating System designed specifically for township businesses (such as Spaza Shops, Hair Salons, Barber Shops, Mechanics, Street Food Vendors, and more). It helps township entrepreneurs make data-driven, strategic business decisions by coordinating a team of specialist AI agents working together.

This project is a complete showcase of modular, provider-independent multi-agent architecture, custom memory layers, interchangeable tool integrations, and professional software engineering standards.

---

## 🚀 Key Features

*   **Multi-Agent Coordination**: A central **CEO Agent** orchestrates tasks and delegates them to specialized agents (**Research, Marketing, Finance, Operations, Customer Service**).
*   **Provider Abstraction Layer**: Zero vendor lock-in. A unified interface abstracts LLM providers (Gemini, OpenAI, Anthropic, Ollama, etc.), keeping the core business logic completely provider-agnostic.
*   **Interactive Agent Workspace**: Rich, user-friendly control dashboards tailored to local township business contexts.
*   **Real-Time Simulation**: Run simulated and live-agent problem-solving chains to solve real spaza shop and informal retail challenges.
*   **Built-in Documentation Hub**: Access the complete architectural layout, ADRs, skill specifications, and development roadmaps directly from within the application interface.

---

## 📂 Project Architecture

```text
/
├── docs/                        # Complete System Documentation
│   ├── adr/                     # Architectural Decision Records (ADRs)
│   ├── ARCHITECTURE.md          # System & Orchestration Architecture
│   ├── PROJECT_VISION.md        # Core Mission and Township Demographics
│   ├── PLANNING.md              # Software Planning & Task Workflow
│   ├── ROADMAP.md               # Feature Releases & Milestone Mapping
│   ├── CHANGELOG.md             # Detailed Task Progress and Version History
│   ├── API_DESIGN.md            # HTTP Endpoint Specifications
│   ├── MEMORY_SYSTEM.md         # Context & History Persistence Specs
│   ├── TOOL_SYSTEM.md           # Tool Definition & Dispatch System
│   ├── AGENT_PROTOCOL.md        # Inter-agent Communication Contracts
│   ├── CODING_STANDARDS.md      # Clean Code (SOLID, DRY) Guidelines
│   ├── TESTING.md               # Testing Strategies & Coverage Expectations
│   └── SECURITY.md              # Data Isolation and API Key Protocols
├── skills/                      # Specialist Agent Prompt & Execution Blueprints
│   ├── ceo_agent.md
│   ├── marketing_agent.md
│   ├── finance_agent.md
│   ├── research_agent.md
│   ├── operations_agent.md
│   └── customer_service_agent.md
├── src/
│   ├── App.tsx                  # Elegant Swiss-Modern Interactive UI
│   ├── main.tsx                 # Core React Entry Point
│   ├── types.ts                 # Clean Shared Type Definitions
│   └── server/                  # Full-stack Server (Express)
│       └── server.ts            # Server-Side Agent Router & Provider Abstraction
└── package.json                 # Project Manifest & Dependency Declarations
```

---

## 🛠️ Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Gemini API key (or other provider keys):
```env
GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Run the Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

---

## 📖 Accessing System Documentation
All architectural decisions, agent blueprints, and plans are accessible in two ways:
1.  By exploring files inside the `/docs` and `/skills` folders.
2.  Directly inside the live application by navigating to the **System Documentation** tab, which features a live Markdown rendering engine for all project spec documents!
