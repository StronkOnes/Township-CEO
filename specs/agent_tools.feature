Feature: Agent Tool Execution and MCP Interoperability
  As an agent
  I want to call tools with validated parameters
  So that I can execute business calculations and retrieve external data

  Scenario: Cash flow calculator tool computes break-even
    Given a business with revenue 8000 and expenses 5000
    When the cash_calculator tool is called with these values
    Then it should return the profit margin percentage
    And it should return the daily break-even target
    And it should return the monthly surplus

  Scenario: Tool validates required parameters
    Given a tool call with missing required parameters
    When the tool execution engine validates the call
    Then it should return an error indicating the missing parameter
    And it should not execute the tool

  Scenario: MCP server exposes available tools
    Given an MCP client connects to the server
    When it requests the list of available tools
    Then it should receive tool definitions with names and schemas
    And each tool should have a name, description, and input schema

  Scenario: Tool results feed into agent context
    Given a Finance Agent has called cash_calculator
    When the tool returns structured results
    Then the results should be appended to the agent's context
    And the agent should incorporate the numerical data into its analysis
