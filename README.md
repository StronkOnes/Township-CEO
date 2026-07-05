# Township CEO — Google Agents Intensive Capstone

Township CEO is an AI-powered Operating System for South African township businesses (Spaza Shops, Hair Salons, Barber Shops, Mechanics, Street Food Vendors). It coordinates a team of specialist AI agents to help entrepreneurs make data-driven strategic decisions.

This project was built as a capstone for the **Google 5-Day AI Agents Intensive Course (June 2026)** and demonstrates all five days of course concepts: agent architecture, tool interoperability, agent skills, security & evaluation, and spec-driven production development.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENT (Vite + React)                  │
│  Business Profile Controller  │  Agent Arena + Eval UI  │
└───────────────────────────────┬─────────────────────────┘
                                │ HTTP JSON API
┌───────────────────────────────▼─────────────────────────┐
│               SERVER (Node.js + Express)                  │
│  ┌─────────────────────────────────────────────────────┐ │
│  │         Agent Coordination Engine                    │ │
│  │  CEO Agent → Research, Finance, Operations, etc.    │ │
│  └────────────────────────┬────────────────────────────┘ │
│  ┌────────────────────────▼────────────────────────────┐ │
│  │  Evaluation Engine (7-Dimension LLM-as-Judge)       │ │
│  │  + Circuit Breaker + Telemetry (OpenTelemetry)      │ │
│  └────────────────────────┬────────────────────────────┘ │
│  ┌────────────────────────▼────────────────────────────┐ │
│  │  MCP Tool Engine + Provider Abstraction Layer        │ │
│  └────────────────────────┬────────────────────────────┘ │
└───────────────────────────┼─────────────────────────────┘
                            │
                ┌───────────▼───────────┐
                │  AI Providers (Gemini) │
                └───────────────────────┘
```

---

## Course Concepts Demonstrated

### Day 1 — Agent Loop & Context Engineering
- **Agent Loop**: perceive → plan → act → observe → iterate cycle with user correction feedback
- **Context Engineering**: static context (GEMINI.md, AGENTS.md system prompts) separated from dynamic context (on-demand skill loading, tool results)
- **User Feedback Loop**: corrections tracked as labeled failure data per the Day 4 whitepaper

### Day 2 — Agent Tools & Interoperability (MCP)
- **MCP-style Tool Engine**: 3 registered tools with JSON schemas (`cash_calculator`, `campaign_generator`, `inventory_optimizer`)
- **Tool Validation**: parameter schema checking before execution
- **Tool Discovery**: `GET /api/tools` endpoint for MCP discovery
- **Tool Results**: structured results fed back into agent context

### Day 3 — Agent Skills (SKILL.md Format)
- **Progressive Disclosure**: skills loaded on demand when triggers match query intent
- **SKILL.md Format**: each skill has triggers, steps, dependencies, token budget, and safety rules
- **Tool Scripts**: executable scripts in `scripts/` per skill directory
- **Directory Structure**: `.agent/skills/<name>/SKILL.md + scripts/ + references/ + assets/`

### Day 4 — Security & Evaluation
- **7-Dimension Evaluation**: intent satisfaction, functional correctness, trajectory quality, cost efficiency, code quality, self-repair, safety
- **LLM-as-Judge**: Gemini scores agent outputs against user intent rubric
- **Observability**: telemetry spans (session, think, tool, eval) with timing and token tracking
- **Circuit Breaker**: Agent Trust Score with 0.4 threshold, version checkpoints, rollback
- **Unsafe Request Detection**: refusal of harmful queries (tax evasion, fraud, etc.)

### Day 5 — Spec-Driven Development & Production
- **BDD Gherkin Specs**: 4 feature files in `specs/` covering orchestration, evaluation, tools, skills
- **Layered Prompts**: `.gemini/GEMINI.md` (global), `AGENTS.md` (shared), `.agent/skills/` (skills)
- **CI/CD Pipeline**: GitHub Actions with lint → test → build → eval-gate stages
- **Dockerfile**: multi-stage production container
- **Automated Tests**: 16 tests across 3 test suites

---

## Guardrails & Safety

| Guardrail | Implementation |
|---|---|
| No client-side API keys | Keys isolated in `process.env` on server only |
| Human-in-the-loop | CEO pauses if financial allocation > 50% of revenue |
| Unsafe request refusal | Regex pattern detection for illegal/unsafe queries |
| Circuit breaker | Trust score < 0.4 triggers rollback to checkpoint |
| Token budget tracking | Per-session and per-skill token limits enforced |
| Evaluation gate | 7-dimension scoring gates output quality before presentation |

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure Gemini API key
cp .env.example .env
# Edit .env with your real Gemini API key

# 3. Run (server + client on port 3000)
npm run dev

# 4. Open http://localhost:3000
```

**Note**: Without a valid API key, the app runs in DEMO mode with offline mock responses. Set `GEMINI_API_KEY` in `.env` for full AI-powered agent responses.

---

## Testing & Evaluation

```bash
# Run 16 tests across 3 suites
npm test

# TypeScript check
npm run lint

# Production build
npm run build

# Production serve
npm start
```

The evaluation engine scores every agent response across 7 dimensions. Scores are displayed in the UI after each multi-agent solve. The LLM-as-Judge evaluator uses Gemini when available, with a deterministic rule-based fallback.

---

## Deployment

### Docker
```bash
docker build -t township-ceo .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key township-ceo
```

### Production Build (standalone)
```bash
npm run build
cp .env dist/
node dist/server.cjs
```

### CI/CD
Push to `main` triggers GitHub Actions: lint → test → build → eval-gate verification.

---

## Project Structure

```
/
├── .gemini/GEMINI.md        # Global AI profile
├── AGENTS.md                # Shared multi-tool config
├── specs/                   # BDD Gherkin feature files
├── .agent/skills/           # Agent Skills (SKILL.md format)
│   ├── ceo_agent/
│   ├── finance_agent/
│   ├── research_agent/
│   ├── operations_agent/
│   ├── marketing_agent/
│   └── customer_service_agent/
├── docs/                    # System documentation
│   ├── ARCHITECTURE.md
│   ├── AGENT_PROTOCOL.md
│   ├── MEMORY_SYSTEM.md
│   ├── TOOL_SYSTEM.md
│   ├── SECURITY.md
│   └── TESTING.md
├── src/
│   ├── App.tsx              # React UI
│   ├── types.ts             # Shared types
│   └── __tests__/           # Test suites
├── server.ts                # Express server (all API routes)
├── Dockerfile
└── package.json
```

---

## Demo

![Township CEO Demo](assets/demo.gif)

*(Add a screen capture or GIF of the app in action. Record a short clip showing: profile selection, entering a query, the agent reasoning chain, evaluation scores, and the feedback refinement loop.)*
