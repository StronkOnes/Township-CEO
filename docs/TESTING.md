# Testing Strategy

To ensure production-grade reliability across the Township CEO operating system, we employ a multi-layered testing strategy.

---

## 🧪 Testing Matrices

| Test Class | Focus | Target File Location | Simulated Framework |
| :--- | :--- | :--- | :--- |
| **Unit Tests** | Helper calculations, currency formats, break-even margin solvers | `src/utils.test.ts` | Vitest / Jest |
| **Integration Tests** | Provider Abstraction adapters, JSON model serialization | `server.test.ts` | Supertest |
| **End-to-End Tests** | Full multi-agent solve run, form persistence, tabs routing | `tests/e2e/` | Playwright |

---

## 💻 Manual Verification Protocol

During the sandbox phase, run the following command sequence to ensure code compile hygiene:

### 1. Syntax Validation
```bash
npm run lint
```
Checks for missing imports, syntax errors, and dangling brackets.

### 2. Build Verification
```bash
npm run build
```
Ensures Vite and Esbuild compile client-side static assets and bundlers successfully into `/dist` without errors.
