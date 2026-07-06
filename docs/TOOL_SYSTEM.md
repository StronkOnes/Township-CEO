# Tool System Architecture

The Township CEO Tool System is built using a decoupled command pattern, making it highly modular and extensible.

All tools share a unified execution signature and return standardized responses that can be read directly by any specialist agent.

---

## 🛠️ Tool Core Interface

```typescript
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
    }>;
    required: string[];
  };
}

export interface ToolResult {
  success: boolean;
  toolName: string;
  data: any;
  error?: string;
}
```

---

## 📦 Supported Core Tools

### 1. Cash-Flow Calculator (`cash_calculator`)
*   **Purpose**: Computes business profit margins, calculates simple break-even thresholds, and reviews operational runway.
*   **Input**: `{ "revenue": number, "expenses": number, "projectedIncrease": number }`

### 2. Search Grounding (`google_search`)
*   **Purpose**: Ground real-time wholesale supply costs and local trends.
*   **Input**: `{ "query": string }`

### 3. Maps Finder (`maps_locator`)
*   **Purpose**: Pinpoints nearby wholesale outlets (e.g., Makro, Cash & Carry, local distributors) in the township.
*   **Input**: `{ "location": string, "category": string }`

### 4. SMS / WhatsApp Builder (`campaign_builder`)
*   **Purpose**: Formats marketing messaging with custom local South African township emojis (e.g., 🇿🇦, 🍲, 💈, 🚗) and handles local slang tags.
*   **Input**: `{ "campaignGoal": string, "slangLanguage": "isiZulu" | "Sotho" | "Tsotsitaal" }`

### 5. Web Search (`web_search` — MCP External Tool)
*   **Purpose**: Real-time web search for business concepts, regulations, pricing trends, and market data not available in model training.
*   **How it works**: Spawns `web-search-mcp` as a subprocess, communicates via JSON-RPC over stdio. Uses Bing → Brave → DuckDuckGo fallback chain.
*   **Triggered by**: Research Agent when query matches patterns like regulation, pricing, trends, licensing, etc.
*   **Input**: `{ "query": string, "limit": number }`
*   **Output**: Structured search results with page content extraction
*   **MCP Tools Exposed**: `full-web-search`, `get-web-search-summaries`, `get-single-web-page-content`
*   **Setup**: Requires `cd mcp-servers/web-search-mcp && npm install && npx playwright install chromium && npm run build`
*   **Graceful Degradation**: Returns error result if MCP server unavailable — agent falls back to its own knowledge
