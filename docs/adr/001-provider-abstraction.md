# ADR 001: Provider Abstraction Layer

## Context

Different large language model (LLM) providers (Gemini, OpenAI, Anthropic, DeepSeek, etc.) offer varying capabilities, latency characteristics, pricing models, and region availabilities. Tying Township CEO's agent prompts and workflows directly to a single provider's proprietary SDK causes severe vendor lock-in. It limits our ability to switch to cost-effective or offline-capable local models (like Ollama or LM Studio) in low-connectivity township settings.

---

## Decision

We will implement a unified **Provider Abstraction Layer (PAL)**. No agent or business logic inside our Express backend or React client is allowed to import or invoke an LLM SDK directly.

All requests must route through a standard `AIProvider` class interface that translates high-level prompts and configuration options into provider-specific payloads.

---

## Status

**Approved**

---

## Consequences

*   **Positive**: Zero vendor lock-in. Changing the model from Gemini to Anthropic or Ollama is a single-line configuration change in the backend environment.
*   **Positive**: Streamlined testing. We can easily substitute a mock provider during offline testing or local development.
*   **Negative**: We must manage our own abstract retry, token budgeting, and formatting layers, which standard proprietary SDKs might handle out of the box.
