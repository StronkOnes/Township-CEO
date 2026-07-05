# Inter-Agent Collaboration Protocol

Specialist agents must communicate according to a strict structured format to prevent chaos and token-bloat in multi-agent discussions.

---

## 🤝 The Coordination Chain

```text
[User Request] ──► [CEO Agent (Orchestrator)]
                        │
                        ├─► Calls Research Agent ──► [Competitor/Price Trends]
                        ├─► Calls Finance Agent ───► [Financial Margin Review]
                        ├─► Calls Marketing Agent ─► [WhatsApp SMS Creative Promo]
                        │
                        ▼
               [CEO Agent Aggregator] ──► [Formatted strategic masterplan] ──► [User]
```

## 📬 Message Schema Protocol

All messages passed between agents inside the Express backend must be wrapped in the following standard envelope:

```json
{
  "id": "string",
  "sender": "ceo_agent" | "research_agent" | "marketing_agent" | "finance_agent" | "operations_agent" | "customer_service_agent",
  "receiver": "ceo_agent" | "user" | "all",
  "content": "string",
  "timestamp": "HH:MM:SS",
  "type": "request" | "response" | "system_log"
}
```

## 📐 Interaction Constraints

1.  **No Direct Specialty Back-channeling**: Specialized agents must route replies through the CEO Agent. They are not allowed to prompt or task-trigger each other directly. This keeps the execution graph clean and prevents circular loops.
2.  **Strict Token Budgets**: A single worker response should not exceed 300 words. It must contain the summary, exact calculated numbers or copy, and clear assumptions.
3.  **Human-in-the-Loop Safeguards**: If an agent chain flags a high financial risk (such as allocating >50% of revenue to inventory), the CEO Agent must immediately pause the loop and prompt the user for validation.
