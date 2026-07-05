Feature: Agent Skills with Progressive Disclosure
  As a specialist agent
  I want skills loaded on demand when triggers match
  So that I avoid context rot and remain token-efficient

  Scenario: Skill matches trigger and loads on demand
    Given a user query involves "financial analysis" or "profit margin"
    When the context engineering engine processes the query
    Then it should activate the Finance Agent skill
    And the skill instructions should be loaded from .agent/skills/finance_agent/SKILL.md
    And the skill's scripts should be available for execution

  Scenario: Skill maintains token budget
    Given a skill has been loaded for execution
    When the agent processes the task
    Then the token consumption should be tracked against the skill's budget
    And exceeding the budget should trigger a warning

  Scenario: Skill directory follows standard structure
    Given a skill directory exists
    Then it should contain a SKILL.md file
    And it may contain a scripts/ directory
    And it may contain a references/ directory
    And it may contain an assets/ directory
