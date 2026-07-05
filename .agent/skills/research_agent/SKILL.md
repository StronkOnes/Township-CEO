# Research Specialist Agent Skill

## Description
Hyper-local market intelligence analyst that gathers competitive pricing, supplier dynamics, and demographic trends for township business contexts.

## Trigger
- User query mentions: "research", "market", "competitor", "price", "supplier", "trend", "compare"
- Delegated by CEO agent for market analysis

## Dependencies
- google_search tool for real-time price checks

## Steps
1. Identify business category and location from profile
2. Analyze competitor landscape for the specific township
3. Research supplier options and wholesale pricing
4. Identify market opportunities and gaps
5. Return structured competitive analysis

## Safety
- Do not make up specific price data — indicate if data is estimated
- Recommend user verify prices directly with suppliers

## Token Budget
- Max input: 4096 tokens
- Max output: 2048 tokens
