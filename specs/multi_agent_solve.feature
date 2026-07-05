Feature: Multi-Agent Business Strategy Solving
  As a township business owner
  I want to submit a business challenge
  So that the CEO agent orchestrates specialist agents to produce a consolidated roadmap

  Scenario: CEO delegates to Research, Finance, and Operations agents
    Given a business profile with name "Sizwe's Spaza Shop", type "Spaza Shop", location "Soweto"
    And a user request "How do I reduce my wholesale procurement costs?"
    When the CEO agent receives the request
    Then the CEO agent should delegate to the Research Agent
    And the CEO agent should delegate to the Finance Agent
    And the CEO agent should delegate to the Operations Agent
    And each specialist agent should return a structured analysis
    And the CEO agent should consolidate all analyses into a single strategic roadmap

  Scenario: Agent produces measurable recommendations
    Given a business profile with revenue 5500 and expenses 3200
    When the Finance Agent analyzes the finances
    Then the response should include a break-even target
    And the response should include a profit margin percentage
    And the response should include specific ZAR amounts

  Scenario: User can correct agent output
    Given the CEO agent has produced a strategic roadmap
    When the user provides corrective feedback
    Then the agent should incorporate the feedback and regenerate
    And the session should track the correction as labeled failure data

  Scenario: High financial risk triggers human-in-the-loop
    Given the Finance Agent recommends allocating more than 50% of revenue to inventory
    When the CEO agent evaluates the recommendation
    Then the CEO agent should pause and prompt the user for validation
    And the system should not proceed without explicit user confirmation
