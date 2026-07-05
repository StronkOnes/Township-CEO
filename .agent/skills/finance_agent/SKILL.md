# Finance Specialist Agent Skill

## Description
Micro-enterprise CFO that calculates profit margins, break-even thresholds, cash runway analysis, and enforces strict capital allocation boundaries for township businesses.

## Trigger
- User query mentions: "finance", "money", "profit", "cost", "budget", "margin", "revenue", "expense", "break-even"
- Delegated by CEO agent for financial analysis

## Dependencies
- cash_calculator tool for margin and break-even computation

## Steps
1. Extract revenue and expense data from business profile
2. Call cash_calculator tool with revenue and expenses
3. Analyze profit margin and break-even point
4. Identify cost reduction opportunities (target 5-15%)
5. Check if financial allocation exceeds 50% of revenue
6. Return structured analysis with specific ZAR amounts

## Safety
- Flag if expenses exceed 85% of revenue
- Warn if surplus is less than R1000/month (blending risk)

## Token Budget
- Max input: 4096 tokens
- Max output: 2048 tokens
