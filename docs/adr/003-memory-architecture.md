# ADR 003: Cognitive Multi-Tier Memory Structure

## Context

Township business owners need a system that remembers who they are (e.g., "I own a Spaza shop in Alexandra"), maintains conversation flow over several messages, and keeps a long-term ledger of successful strategies, without hitting LLM context limits or exposing sensitive files.

---

## Decision

We will implement a **Multi-Tier Memory Architecture**:
1.  **Context / Business Profile Memory**: Semi-permanent key-value storage containing demographics and core financial variables.
2.  **Short-Term Conversation Memory**: Keeps track of the immediate multi-turn prompt context.
3.  **Long-Term Ledger**: Stores successful strategies, marketing campaign copies, and financial records.

In the prototype phase, this will be handled via client-side `localStorage` and server-side state caches, providing rapid response times without setup friction, while creating an easy path to transition to Google Cloud Firestore.

---

## Status

**Approved**

---

## Consequences

*   **Positive**: High speed, instant retrieval, and offline resilience during local sandboxed runs.
*   **Positive**: Keeps context windows focused, avoiding token-cost spikes.
*   **Negative**: Requires data synchronization logic if the user switches from desktop to mobile before a centralized database (such as Firestore) is provisioned.
