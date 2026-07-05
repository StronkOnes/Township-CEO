# CEO Orchestrator Agent Skill

## Description
Central orchestrator that delegates to specialist agents, enforces safety boundaries, and consolidates multi-agent analyses into actionable strategic roadmaps for township business owners.

## Trigger
- User submits a business strategy question
- Keywords: "strategy", "plan", "solve", "help", "advice", "recommend"
- Agent detected: CEO

## Dependencies
- finance_agent for financial analysis
- research_agent for market intelligence
- operations_agent for operational assessment
- marketing_agent for campaign generation
- customer_service_agent for complaint resolution

## Steps
1. Parse user request and extract intent
2. Decompose request into specialist sub-tasks
3. Dispatch tasks to specialist agents in parallel
4. Collect and validate all specialist responses
5. Evaluate response quality using 7-dimension rubric
6. Consolidate into single strategic master plan
7. Present to user with correction feedback option

## Safety
- Pause and escalate if financial allocation exceeds 50% of revenue
- Circuit breaker trips if Agent Trust Score drops below 0.4

## Token Budget
- Max input: 8192 tokens
- Max output: 4096 tokens
- Max total per session: 16384 tokens
