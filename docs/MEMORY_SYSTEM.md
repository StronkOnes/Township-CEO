# Memory System Specification

The Township CEO Memory System is modeled after cognitive neuroscience structures to balance immediate context processing, structured business profile recall, and long-term history persistence.

---

## 🧠 Memory Classifications

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          TOWNSHIP CEO MEMORY                           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  SESSION MEMORY  │      │ BUSINESS PROFILE │      │ LONG-TERM MEMORY │
│                  │      │                  │      │                  │
│ Active agent     │      │ Permanent state: │      │ Historical chain │
│ conversations &  │      │ Location, type,  │      │ outcomes, KPIs   │
│ tool outputs     │      │ cash balances    │      │ & decisions      │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

### 1. Session Memory (Short-Term Workspace)
*   **Content**: Keeps track of current multi-agent messages, intermediate prompt iterations, and tool outputs during a single thread run.
*   **Implementation**: Fast in-memory list or standard state hooks.

### 2. Business Profile Memory (User Context)
*   **Content**: Business types, township, cash records, daily struggles, goals.
*   **Implementation**: Committed to browser cache (`localStorage`) and cached in server sessions.

### 3. Long-Term Memory (Durable Ledger)
*   **Content**: Successfully applied strategies, financial history, previous promotional materials.
*   **Implementation**: Structured records that sync with Firestore or SQL ledgers upon deployment.

---

## Schema Models

```typescript
export interface BusinessProfile {
  id: string;
  name: string;
  type: string;
  location: string;
  revenue: number;
  expenses: number;
  challenges: string;
  goals: string;
}

export interface SystemMemory {
  sessionMessages: Array<{
    id: string;
    sender: string;
    content: string;
    timestamp: string;
  }>;
  appliedDecisions: Array<{
    date: string;
    decision: string;
    agent: string;
    outcome: string;
  }>;
}
```
