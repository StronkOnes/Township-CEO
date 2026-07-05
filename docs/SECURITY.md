# Security Architecture

Township CEO enforces strict data privacy, secure authorization practices, and robust API key management.

---

## 🛡️ Key Protection Safeguards

### 1. No Client-Side Secrets (MANDATORY)
*   **Under no circumstances** may the `GEMINI_API_KEY` or any other provider API keys be sent to or loaded inside the client browser.
*   All keys are loaded on the server via `process.env.GEMINI_API_KEY` and are isolated from browser DevTools inspect panels.
*   All LLM API calls are channeled through the server route `/api/agents/solve`.

### 2. Data Segregation
*   Multiple user profiles are isolated inside browser `localStorage` under distinct keys (e.g., `township_ceo_profile_123`).
*   Data packets transmitted over HTTP APIs are sanitized to prevent scripting injections or malformed inputs.

### 3. Local Offline Scenarios
*   If an LLM provider goes offline, the Provider Abstraction layer degrades gracefully, outputting offline-ready calculations and local strategy models to ensure the entrepreneur can continue operating.
