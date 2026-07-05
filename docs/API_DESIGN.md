# API Design Specification

This document details the REST API endpoints exposed by the Township CEO Express backend server.

All endpoints utilize standard JSON request and response payloads. The server runs on port `3000`.

---

## 🟢 1. Health Probe
*   **Endpoint**: `GET /api/health`
*   **Description**: Confirms the Express server and container routing layer are live and healthy.
*   **Response**:
    ```json
    {
      "status": "ok",
      "timestamp": "2026-07-05T13:00:00Z"
    }
    ```

---

## 🟢 2. Orchestrated Agent Discussion / Solve Task
*   **Endpoint**: `POST /api/agents/solve`
*   **Description**: Passes a business profile and a user request to the CEO Agent, triggering a multi-agent problem-solving loop.
*   **Request Body**:
    ```json
    {
      "profile": {
        "id": "spaza_shop",
        "name": "Sizwe's Spaza",
        "type": "Spaza Shop",
        "location": "Soweto, Johannesburg",
        "revenue": 5500,
        "expenses": 3200,
        "challenges": "Sourcing stock is expensive, delivery logistics are slow.",
        "goals": "Expand snack offerings, negotiate better prices."
      },
      "request": "How do I cut down on my wholesale procurement costs?"
    }
    ```
*   **Response**:
    ```json
    {
      "success": true,
      "messages": [
        {
          "id": "msg_001",
          "sender": "CEO Agent",
          "receiver": "User",
          "content": "A procurement audit has been initiated. delegating research and financial feasibility...",
          "timestamp": "13:02:15",
          "type": "request"
        },
        {
          "id": "msg_002",
          "sender": "Research Agent",
          "receiver": "CEO Agent",
          "content": "Competitor pricing trends indicate that joining a local buying cooperative can reduce bulk snack procurement by 12%...",
          "timestamp": "13:02:18",
          "type": "response"
        }
      ],
      "summary": "Join a bulk buying cooperative in Soweto to cut snack wholesale costs by 12-15% immediately."
    }
    ```

---

## 🟢 3. Specialized Agent Dedicated Tool Endpoints

### Marketing Generation
*   **Endpoint**: `POST /api/agents/marketing`
*   **Request**: `{ "profile": {...}, "campaignGoal": "string" }`
*   **Response**: `{ "campaignText": "string", "channel": "WhatsApp" }`

### Financial Feasibility Calculator
*   **Endpoint**: `POST /api/agents/finance`
*   **Request**: `{ "profile": {...}, "proposal": "string" }`
*   **Response**: `{ "breakEvenPoint": number, "profitMargin": number, "analysis": "string" }`

### Customer Service Response Builder
*   **Endpoint**: `POST /api/agents/customer-service`
*   **Request**: `{ "profile": {...}, "complaint": "string" }`
*   **Response**: `{ "suggestedResponse": "string", "tone": "string" }`
