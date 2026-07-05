export interface BusinessProfile {
  id: string;
  name: string;
  type: string;
  location: string;
  revenue: number;
  expenses: number;
  challenges: string;
  goals: string;
}

export interface AgentMessage {
  id: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: string;
  type: 'request' | 'response' | 'system_log';
}

export interface EvalScore {
  dimension: string;
  score: number;
  rationale: string;
}

export interface TelemetrySpan {
  id: string;
  parentId: string | null;
  type: 'session' | 'think' | 'tool' | 'eval';
  agentName: string;
  startTime: string;
  endTime?: string;
  status: 'started' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

export interface TelemetryData {
  sessionId: string;
  totalTokens: number;
  totalCost: number;
  trustScore: number;
  userCorrections: number;
  spans: TelemetrySpan[];
}

export interface CircuitBreakerData {
  trustScore: number;
  tripped: boolean;
}

export interface SkillMatch {
  name: string;
  description: string;
}

export interface ToolResultData {
  cash_calculator?: {
    profitMargin: number;
    dailyBreakEven: number;
    monthlySurplus: number;
    runwayDays: number;
    marginStatus: string;
  };
}

export interface SolverResponse {
  success: boolean;
  sessionId: string;
  messages: AgentMessage[];
  summary: string;
  toolResults: ToolResultData;
  evaluation: EvalScore[];
  overallEvalScore: number;
  matchedSkill: SkillMatch | null;
  circuitBreaker: CircuitBreakerData;
  telemetry: TelemetryData;
}

export interface MarketingResponse {
  campaignText: string;
  channel: string;
  strategy: string;
}

export interface CustomerServiceResponse {
  suggestedResponse: string;
  loyaltyOutline: string;
}

export interface DocFile {
  name: string;
  path: string;
  category: 'system' | 'skills' | 'adr';
}

export const EVAL_DIMENSION_LABELS: Record<string, string> = {
  intent_satisfaction: 'Intent Satisfaction',
  functional_correctness: 'Functional Correctness',
  trajectory_quality: 'Trajectory Quality',
  cost_efficiency: 'Cost Efficiency',
  code_quality: 'Code Quality',
  self_repair: 'Self-Repair',
  safety: 'Safety'
};
