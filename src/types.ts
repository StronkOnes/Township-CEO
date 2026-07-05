/**
 * Township CEO Shared Types
 */

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

export interface SolverResponse {
  success: boolean;
  messages: AgentMessage[];
  summary: string;
}

export interface MarketingResponse {
  campaignText: string;
  channel: string;
  strategy: string;
}

export interface FinanceResponse {
  breakEvenPoint: number;
  profitMargin: number;
  analysis: string;
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
