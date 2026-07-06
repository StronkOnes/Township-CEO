# Research Specialist Agent Skill

## Description
Hyper-local market intelligence analyst that gathers competitive pricing, supplier dynamics, and demographic trends for township business contexts. Uses real-time web search via MCP for up-to-date information.

## Trigger
- User query mentions: "research", "market", "competitor", "price", "supplier", "trend", "compare", "regulation", "law", "license", "permit"
- Delegated by CEO agent for market analysis

## Dependencies
- `web_search` tool (MCP external) for real-time web research on regulations, pricing, trends, and business concepts
- `cash_calculator` tool for financial benchmarking

## Steps
1. Identify business category and location from profile
2. Auto-trigger web search if query involves regulations, pricing trends, licensing, or external business concepts
3. Analyze competitor landscape for the specific township
4. Research supplier options and wholesale pricing via web search context
5. Identify market opportunities and gaps
6. Return structured competitive analysis — clearly label web-sourced vs. estimated data

## Safety
- Do not make up specific price data — indicate if data is estimated
- Recommend user verify prices directly with suppliers
- Clearly distinguish web search results from model knowledge

## Token Budget
- Max input: 4096 tokens
- Max output: 2048 tokens
