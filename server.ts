import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { webSearchClient } from "./mcp-client.js";

dotenv.config();

const app = express();
const PORT = 3000;
app.use(express.json());

// ─── Types ────────────────────────────────────────────────────

interface GenerationOptions {
  temperature?: number;
  systemInstruction?: string;
}

interface AIProvider {
  id: string;
  name: string;
  generateText(prompt: string, options?: GenerationOptions): Promise<string>;
}

interface ToolParameter {
  type: string;
  description: string;
  enum?: string[];
}

interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, ToolParameter>;
    required: string[];
  };
  handler: (args: Record<string, any>) => Promise<ToolResult>;
}

interface ToolResult {
  success: boolean;
  toolName: string;
  data: any;
  error?: string;
}

interface EvalScore {
  dimension: string;
  score: number;
  rationale: string;
}

interface TelemetrySpan {
  id: string;
  parentId: string | null;
  type: 'session' | 'think' | 'tool' | 'eval';
  agentName: string;
  startTime: string;
  endTime?: string;
  inputTokens?: number;
  outputTokens?: number;
  status: 'started' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

interface AgentSession {
  id: string;
  profile: any;
  request: string;
  spans: TelemetrySpan[];
  totalTokens: number;
  totalCost: number;
  trustScore: number;
  checkpoints: string[];
  userCorrections: number;
  converged: boolean;
}

interface SkillDefinition {
  name: string;
  path: string;
  trigger: string[];
  description: string;
  maxInputTokens: number;
  maxOutputTokens: number;
}

// ─── Circuit Breaker ──────────────────────────────────────────

class CircuitBreaker {
  private trustScore: number = 1.0;
  private threshold: number;
  private tripped: boolean = false;
  private checkpoints: string[] = [];

  constructor(threshold = 0.4) { this.threshold = threshold; }

  getScore() { return this.trustScore; }
  isTripped() { return this.tripped; }

  recordSuccess(factor = 0.05) {
    if (!this.tripped) this.trustScore = Math.min(1.0, this.trustScore + factor);
  }

  recordFailure(factor = 0.2) {
    this.trustScore = Math.max(0, this.trustScore - factor);
    if (this.trustScore < this.threshold) this.tripped = true;
  }

  saveCheckpoint(id: string) { this.checkpoints.push(id); }

  rollback(): string | null {
    const cp = this.checkpoints.pop() || null;
    if (cp) {
      this.trustScore = Math.min(1.0, this.trustScore + 0.3);
      this.tripped = false;
    }
    return cp;
  }
}

// ─── Tools ────────────────────────────────────────────────────

const tools: Record<string, ToolDefinition> = {};

function registerTool(def: ToolDefinition) {
  tools[def.name] = def;
}

registerTool({
  name: "cash_calculator",
  description: "Compute profit margins, break-even thresholds, and cash runway for a township business",
  parameters: {
    type: "object",
    properties: {
      revenue: { type: "number", description: "Monthly revenue in ZAR" },
      expenses: { type: "number", description: "Monthly expenses in ZAR" }
    },
    required: ["revenue", "expenses"]
  },
  handler: async (args) => {
    const { revenue, expenses } = args;
    if (typeof revenue !== 'number' || typeof expenses !== 'number') {
      return { success: false, toolName: "cash_calculator", data: null, error: "revenue and expenses must be numbers" };
    }
    const margin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;
    const dailyBreakEven = expenses / 30;
    return {
      success: true,
      toolName: "cash_calculator",
      data: {
        profitMargin: Math.round(margin * 10) / 10,
        dailyBreakEven: Math.round(dailyBreakEven),
        monthlySurplus: revenue - expenses,
        runwayDays: expenses > 0 ? Math.round((revenue / expenses) * 30) : Infinity,
        marginStatus: margin < 25 ? 'critical' : margin < 35 ? 'warning' : 'healthy'
      }
    };
  }
});

registerTool({
  name: "campaign_generator",
  description: "Generate localized marketing copy for township businesses on WhatsApp or SMS",
  parameters: {
    type: "object",
    properties: {
      businessName: { type: "string", description: "Name of the business" },
      businessType: { type: "string", description: "Type of business" },
      location: { type: "string", description: "Township location" },
      goal: { type: "string", description: "Marketing campaign goal" },
      channel: { type: "string", enum: ["whatsapp", "sms"], description: "Target channel" }
    },
    required: ["businessName", "goal", "channel"]
  },
  handler: async (args) => {
    const { businessName, goal, channel } = args;
    const templates: Record<string, string[]> = {
      whatsapp: [
        `📢 *${businessName.toUpperCase()}* 📢\n🔥 *${goal}* 🔥\n📍 Come through today!\n📲 WhatsApp us now!`,
        `💥 *FLASH SALE — ${businessName}* 💥\n👉 *${goal}*\n🇿🇦 Community first!`
      ],
      sms: [
        `${businessName}: ${goal}. Visit us today! 🇿🇦`,
        `${businessName} special: ${goal}`
      ]
    };
    const selected = templates[channel] || templates.whatsapp;
    return { success: true, toolName: "campaign_generator", data: { text: selected[0], channel, businessName } };
  }
});

registerTool({
  name: "inventory_optimizer",
  description: "Calculate optimal reorder points and safety stock levels for township businesses",
  parameters: {
    type: "object",
    properties: {
      topSellingItems: { type: "number", description: "Number of top-selling items to track" },
      leadTimeDays: { type: "number", description: "Supplier lead time in days" },
      dailySalesRate: { type: "number", description: "Average daily sales in units" },
      safetyStockDays: { type: "number", description: "Days of safety stock to keep" }
    },
    required: ["leadTimeDays", "dailySalesRate", "safetyStockDays"]
  },
  handler: async (args) => {
    const { leadTimeDays, dailySalesRate, safetyStockDays } = args;
    const safetyStock = dailySalesRate * safetyStockDays;
    const reorderPoint = dailySalesRate * leadTimeDays + safetyStock;
    return {
      success: true,
      toolName: "inventory_optimizer",
      data: {
        reorderPoint: Math.round(reorderPoint),
        safetyStock: Math.round(safetyStock),
        optimalOrderQuantity: Math.round(reorderPoint * 2),
        recommendations: [
          `Reorder when stock hits ${Math.round(reorderPoint)} units`,
          `Keep ${Math.round(safetyStock)} units as safety buffer`,
          leadTimeDays <= 2 ? "Review stock weekly" : "Review stock bi-weekly"
        ]
      }
    };
  }
});

registerTool({
  name: "web_search",
  description: "Search the web for real-time information on business concepts, regulations, pricing trends, and market data. Use this tool when you need up-to-date context on topics outside the model's training data.",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "The search query — use specific, targeted keywords for township business context" },
      limit: { type: "number", description: "Number of results to return (1-10, default 5)" }
    },
    required: ["query"]
  },
  handler: async (args) => {
    const { query, limit = 5 } = args;
    try {
      const result = await webSearchClient.searchWeb(query, Math.min(limit, 10));
      return { success: true, toolName: "web_search", data: { results: result, query } };
    } catch (err: any) {
      console.warn("[web_search] Search failed:", err.message);
      return { success: false, toolName: "web_search", data: null, error: err.message };
    }
  }
});

async function executeTool(name: string, args: Record<string, any>): Promise<ToolResult> {
  const tool = tools[name];
  if (!tool) return { success: false, toolName: name, data: null, error: `Unknown tool: ${name}` };
  for (const req of tool.parameters.required) {
    if (args[req] === undefined || args[req] === null) {
      return { success: false, toolName: name, data: null, error: `Missing required parameter: ${req}` };
    }
  }
  try {
    return await tool.handler(args);
  } catch (err: any) {
    return { success: false, toolName: name, data: null, error: err.message };
  }
}

// ─── Skill Loading (Progressive Disclosure) ──────────────────

function loadSkill(name: string): SkillDefinition | null {
  const skillDir = path.join(process.cwd(), '.agent', 'skills', name);
  const skillFile = path.join(skillDir, 'SKILL.md');
  if (!fs.existsSync(skillFile)) return null;

  const content = fs.readFileSync(skillFile, 'utf-8');
  const nameMatch = content.match(/^# (.+)$/m);
  const descMatch = content.match(/## Description\n(.+)/);
  const triggerSection = content.match(/## Trigger\n([\s\S]*?)(?:\n##|$)/);
  const tokenInputMatch = content.match(/Max input: (\d+)/);
  const tokenOutputMatch = content.match(/Max output: (\d+)/);

  const triggerLines = triggerSection
    ? triggerSection[1].split('\n').filter(l => l.startsWith('- ')).map(l => l.replace(/^- /, '').trim().toLowerCase())
    : [];

  return {
    name,
    path: skillDir,
    trigger: triggerLines,
    description: descMatch ? descMatch[1].trim() : '',
    maxInputTokens: tokenInputMatch ? parseInt(tokenInputMatch[1]) : 4096,
    maxOutputTokens: tokenOutputMatch ? parseInt(tokenOutputMatch[1]) : 2048
  };
}

function matchSkill(query: string): SkillDefinition | null {
  const skillDirs = ['ceo_agent', 'finance_agent', 'research_agent', 'operations_agent', 'marketing_agent', 'customer_service_agent'];
  const q = query.toLowerCase();
  for (const name of skillDirs) {
    const skill = loadSkill(name);
    if (!skill) continue;
    for (const t of skill.trigger) {
      if (t.startsWith('keyword:')) {
        const keyword = t.replace('keyword:', '').trim();
        if (q.includes(keyword)) return skill;
      } else if (t.startsWith('agent:')) {
        const agentName = t.replace('agent:', '').trim();
        if (q.includes(agentName)) return skill;
      } else if (t.startsWith('delegated')) {
        continue;
      } else {
        if (q.includes(t)) return skill;
      }
    }
  }
  return null;
}

// ─── Evaluation Engine (7-Dimension) ─────────────────────────

function evaluateOutput(output: string, userQuery: string, rubric?: string[]): EvalScore[] {
  const dims = rubric || ['intent_satisfaction', 'functional_correctness', 'trajectory_quality', 'cost_efficiency', 'code_quality', 'self_repair', 'safety'];

  const hasContent = output.trim().length > 0;
  const hasNumbers = /\d+(\.\d+)?/.test(output);
  const hasActionable = /should|must|recommend|consider|could|need to/i.test(output);
  const hasZAR = /R\s?\d+/.test(output);
  const hasStructured = output.includes('---') || output.includes('###') || output.includes('##');
  const wordCount = output.split(/\s+/).filter(Boolean).length;
  const hasPercentage = /\d+%/.test(output);
  const hasRefusal = /cannot|cannot|unable to|not appropriate|instead/i.test(output);

  return dims.map(d => {
    let score = 1;
    let rationale = '';

    switch (d) {
      case 'intent_satisfaction':
        score = hasActionable ? (hasZAR ? 5 : 4) : hasContent ? 2 : 1;
        rationale = hasActionable ? 'Provides actionable recommendations' : 'Lacks actionable guidance';
        break;
      case 'functional_correctness':
        score = hasNumbers && hasPercentage ? 5 : hasNumbers ? 3 : 1;
        rationale = hasNumbers ? 'Contains numerical data' : 'No numerical specificity';
        break;
      case 'trajectory_quality':
        score = hasStructured ? 4 : hasContent ? 2 : 1;
        rationale = hasStructured ? 'Well-structured with clear sections' : 'Structure could be improved';
        break;
      case 'cost_efficiency':
        score = wordCount === 0 ? 1 : wordCount < 200 ? 5 : wordCount < 400 ? 4 : wordCount < 600 ? 3 : 2;
        rationale = `${wordCount} words — ${wordCount < 400 ? 'efficient' : 'verbose'}`;
        break;
      case 'code_quality':
        score = hasStructured ? 4 : hasContent ? 3 : 1;
        rationale = hasStructured ? 'Clean structure with sections' : 'Unstructured output';
        break;
      case 'self_repair':
        score = 3;
        rationale = 'Static evaluation — self-repair measured over multi-turn sessions';
        break;
      case 'safety':
        score = hasRefusal ? 5 : 4;
        rationale = hasRefusal ? 'Appropriate refusal for unsafe request' : 'No safety issues detected';
        break;
    }
    return { dimension: d, score, rationale };
  });
}

async function llmEvaluate(provider: AIProvider, output: string, userQuery: string): Promise<EvalScore[]> {
  try {
    const prompt = `You are an LLM-as-Judge evaluator for a township business AI agent.
Evaluate the following agent output against the user's query on these 7 dimensions (1-5):

1. intent_satisfaction: Did the agent address what the user meant?
2. functional_correctness: Is the output factually correct and useful?
3. trajectory_quality: Did the agent take the right approach?
4. cost_efficiency: Is the output concise and token-efficient?
5. code_quality: Is the output well-structured?
6. self_repair: Does it show awareness of its own limitations?
7. safety: Is the output safe and appropriate?

User Query: "${userQuery}"

Agent Output: "${output.slice(0, 2000)}"

Return a JSON array of { dimension, score (1-5), rationale } for each of the 7 dimensions.`;
    const result = await provider.generateText(prompt, { systemInstruction: "You are an objective LLM judge. Return ONLY valid JSON.", temperature: 0.3 });
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return evaluateOutput(output, userQuery);
  } catch {
    return evaluateOutput(output, userQuery);
  }
}

// ─── Telemetry ────────────────────────────────────────────────

let sessionCounter = 0;
const activeSessions: Map<string, AgentSession> = new Map();

function createSession(profile: any, request: string): AgentSession {
  sessionCounter++;
  return {
    id: `session_${sessionCounter}`,
    profile,
    request,
    spans: [],
    totalTokens: 0,
    totalCost: 0,
    trustScore: 1.0,
    checkpoints: [],
    userCorrections: 0,
    converged: false
  };
}

function startSpan(session: AgentSession, type: TelemetrySpan['type'], agentName: string, parentId: string | null = null): TelemetrySpan {
  const span: TelemetrySpan = {
    id: `${type}_${session.spans.length + 1}`,
    parentId,
    type,
    agentName,
    startTime: new Date().toISOString(),
    status: 'started'
  };
  session.spans.push(span);
  return span;
}

function endSpan(session: AgentSession, spanId: string, status: TelemetrySpan['status'] = 'completed', metadata?: Record<string, any>) {
  const span = session.spans.find(s => s.id === spanId);
  if (span) {
    span.endTime = new Date().toISOString();
    span.status = status;
    if (metadata) span.metadata = { ...span.metadata, ...metadata };
  }
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function trackTokens(session: AgentSession, input: string, output: string) {
  const inputTokens = estimateTokens(input);
  const outputTokens = estimateTokens(output);
  session.totalTokens += inputTokens + outputTokens;
  session.totalCost += (inputTokens + outputTokens) * 0.0000025;
}

// ─── Gemini Client ────────────────────────────────────────────

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "YOUR_GEMINI_API_KEY_HERE" || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
      throw new Error("GEMINI_API_KEY not configured or holds a placeholder.");
    }
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } }
    });
  }
  return geminiClient;
}

// ─── AI Providers ─────────────────────────────────────────────

const geminiProvider: AIProvider = {
  id: "gemini", name: "Google Gemini",
  generateText: async (prompt: string, options?: GenerationOptions): Promise<string> => {
    try {
      const client = getGeminiClient();
      const res = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: options?.systemInstruction,
          temperature: options?.temperature ?? 0.9
        }
      });
      return res.text || "";
    } catch (err: any) {
      console.warn("Gemini execution failed, falling back to local simulation:", err.message);
      return fallbackProvider.generateText(prompt, options);
    }
  }
};

const fallbackProvider: AIProvider = {
  id: "mock", name: "Local Offline Engine",
  generateText: async (prompt: string, options?: GenerationOptions): Promise<string> => {
    const isMarketing = options?.systemInstruction?.includes("Marketing") ?? false;
    const isCS = options?.systemInstruction?.includes("Customer Service") ?? false;
    const isFinance = options?.systemInstruction?.includes("Finance") ?? false;
    const isResearch = options?.systemInstruction?.includes("Research") ?? false;
    const isOps = options?.systemInstruction?.includes("Operations") ?? false;

    if (isMarketing) {
      return `📢 *PROMO SPECIAL* 📢\n\nHey there! Check out our latest deals:\n🔥 **Special Offer** 🔥\n📍 Come visit us today!\n📲 WhatsApp for more info.\n\n*Share with a friend!*`;
    }
    if (isCS) {
      return `🤝 **Customer Care Response** 🤝\n\nThank you for reaching out. We sincerely apologize for the inconvenience.\n\n**What we're doing:**\n1. Investigating the matter\n2. Implementing corrective measures\n3. Following up within 48 hours\n\nAs a goodwill gesture, we offer 15% off your next visit.`;
    }
    if (isFinance) {
      const revMatch = prompt.match(/Revenue\s*[:=]\s*(\d+)/i);
      const expMatch = prompt.match(/Expenses?\s*[:=]\s*(\d+)/i);
      const rev = revMatch ? parseInt(revMatch[1]) : 12000;
      const exp = expMatch ? parseInt(expMatch[1]) : 7500;
      const margin = rev > 0 ? ((rev - exp) / rev) * 100 : 0;
      return `💰 **Finance Agent Analysis**\n\nRevenue: R${rev.toLocaleString()}/mo\nExpenses: R${exp.toLocaleString()}/mo\nMargin: ${margin.toFixed(1)}%\nDaily Break-Even: R${(exp / 30).toFixed(0)}\n\n**Recommendations:**\n1. Track daily sales in a notebook\n2. Set a daily revenue target\n3. Keep business cash separate from personal`;
    }
    if (isResearch) {
      return `🔍 **Research Agent Report**\n\n**Competitor Landscape:**\n• Most businesses lack formal pricing — an opportunity to differentiate\n• Customer loyalty driven by reliability more than price\n\n**Recommendations:**\n1. Visit 3 competitors and note prices\n2. Ask customers what they wish you stocked\n3. Request quotes from alternative wholesalers`;
    }
    if (isOps) {
      return `🔧 **Operations Agent Assessment**\n\n**Infrastructure:**\n• Keep power bank charged for phone\n• Invest in rechargeable LED lighting\n• Maintain backup for continuity\n\n**Action Items:**\n1. Create daily opening/closing checklist\n2. Review stock levels twice weekly\n3. Keep emergency cash reserve`;
    }

    const qMatch = prompt.match(/---QUESTION---\n([\s\S]*?)(?:\n---|\n[A-Z]|$)/);
    const question = qMatch ? qMatch[1].trim() : "How can I improve my business?";
    const nameMatch = prompt.match(/Name: (.+)/);
    const name = nameMatch ? nameMatch[1].trim() : "Your Business";

    return `🤝 **CEO Orchestrator — Strategic Masterplan**\n\nGood day! I've analyzed your business needs regarding: "${question}"\n\n**Business Overview:**\n• Revenue: R12,000/mo\n• Expenses: R7,500/mo\n• Margin: 37.5%\n• Daily Break-Even: R250\n\n**Strategic Recommendations:**\n1. Review your top 5 expense items for savings\n2. Identify 3 most popular products and promote them\n3. Implement a simple loyalty program\n4. Track daily revenue against break-even target\n\n**Immediate Action Plan (Next 7 Days):**\n1. Start tracking daily sales\n2. Set a weekly revenue goal\n3. Review one expense category\n\nStay resilient, ${name}!`;
  }
};

function getActiveProvider(): AIProvider {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "YOUR_GEMINI_API_KEY_HERE" || key === "MY_GEMINI_API_KEY" || key.trim() === "") return fallbackProvider;
  return geminiProvider;
}

// ─── Helpers ──────────────────────────────────────────────────

function buildProfileBlock(profile: any): string {
  return [
    "---BUSINESS PROFILE---",
    `Name: ${profile.name || "Unknown"}`,
    `Type: ${profile.type || "Unknown"}`,
    `Location: ${profile.location || "Unknown"}`,
    `Revenue: ${profile.revenue || 0}`,
    `Expenses: ${profile.expenses || 0}`,
    `Challenges: ${profile.challenges || "None"}`,
    `Goals: ${profile.goals || "None"}`,
    "---END PROFILE---"
  ].join("\n");
}

function ts() {
  return new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ─── Docs Catalog ─────────────────────────────────────────────

const DOCS_CATALOG = [
  { name: "README.md", path: "/README.md", category: "system" },
  { name: "Project Vision", path: "/docs/PROJECT_VISION.md", category: "system" },
  { name: "Architecture", path: "/docs/ARCHITECTURE.md", category: "system" },
  { name: "Planning Protocol", path: "/docs/PLANNING.md", category: "system" },
  { name: "Development Roadmap", path: "/docs/ROADMAP.md", category: "system" },
  { name: "Changelog", path: "/docs/CHANGELOG.md", category: "system" },
  { name: "API Design", path: "/docs/API_DESIGN.md", category: "system" },
  { name: "Memory System", path: "/docs/MEMORY_SYSTEM.md", category: "system" },
  { name: "Tool System", path: "/docs/TOOL_SYSTEM.md", category: "system" },
  { name: "Agent Protocol", path: "/docs/AGENT_PROTOCOL.md", category: "system" },
  { name: "Coding Standards", path: "/docs/CODING_STANDARDS.md", category: "system" },
  { name: "Testing Matrix", path: "/docs/TESTING.md", category: "system" },
  { name: "Security Blueprint", path: "/docs/SECURITY.md", category: "system" },
  { name: "Course Remediation", path: "/docs/COURSE_REMEDIATION.md", category: "system" },
  { name: "ADR 001: Provider Abstraction", path: "/docs/adr/001-provider-abstraction.md", category: "adr" },
  { name: "ADR 002: Orchestration", path: "/docs/adr/002-agent-orchestration.md", category: "adr" },
  { name: "ADR 003: Memory Systems", path: "/docs/adr/003-memory-architecture.md", category: "adr" },
  { name: "CEO Agent Skill", path: "/skills/ceo_agent.md", category: "skills" },
  { name: "Marketing Agent Skill", path: "/skills/marketing_agent.md", category: "skills" },
  { name: "Finance Agent Skill", path: "/skills/finance_agent.md", category: "skills" },
  { name: "Research Agent Skill", path: "/skills/research_agent.md", category: "skills" },
  { name: "Operations Agent Skill", path: "/skills/operations_agent.md", category: "skills" },
  { name: "Customer Service Skill", path: "/skills/customer_service_agent.md", category: "skills" }
];

// ─── API Routes ───────────────────────────────────────────────

app.get("/api/docs", (req, res) => res.json(DOCS_CATALOG));

app.get("/api/docs/content", (req, res) => {
  const filePath = req.query.path as string;
  if (!filePath) return res.status(400).json({ error: "Missing file path." });
  const resolvedPath = path.resolve(process.cwd(), filePath.replace(/^\/+/, ""));
  if (!resolvedPath.startsWith(process.cwd())) return res.status(403).json({ error: "Access denied." });
  try {
    if (fs.existsSync(resolvedPath)) return res.json({ content: fs.readFileSync(resolvedPath, "utf-8") });
    return res.status(404).json({ error: "File not found." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

let providerWarning: string | null = null;

function checkProviderSetup(): void {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "YOUR_GEMINI_API_KEY_HERE" || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
    providerWarning = "⚠️ GEMINI_API_KEY not configured or holds a placeholder. Running in DEMO mode with offline mock provider. Set a valid Gemini API key in your .env file for full AI-powered agent responses.";
  } else {
    providerWarning = null;
  }
}

checkProviderSetup();

app.get("/api/health", (req, res) => {
  const provider = getActiveProvider();
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    provider: provider.name,
    providerId: provider.id,
    warning: providerWarning
  });
});

// Tool execution endpoint (MCP-style)
app.post("/api/tools/execute", async (req, res) => {
  const { toolName, args } = req.body;
  if (!toolName) return res.status(400).json({ error: "Missing toolName" });
  const result = await executeTool(toolName, args || {});
  res.json(result);
});

app.get("/api/tools", (req, res) => {
  const toolList = Object.values(tools).map(t => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters
  }));
  res.json({ tools: toolList });
});

// Skill information endpoint
app.get("/api/skills", (req, res) => {
  const names = ['ceo_agent', 'finance_agent', 'research_agent', 'operations_agent', 'marketing_agent', 'customer_service_agent'];
  const skills = names.map(n => loadSkill(n)).filter(Boolean);
  res.json({ skills });
});

app.get("/api/skills/match", (req, res) => {
  const query = (req.query.q as string) || '';
  const matched = matchSkill(query);
  res.json({ matched: matched ? { name: matched.name, description: matched.description } : null });
});

// Evaluation endpoint
app.post("/api/evaluate", async (req, res) => {
  const { output, userQuery, useLLM } = req.body;
  if (!output) return res.status(400).json({ error: "Missing output to evaluate" });
  const provider = getActiveProvider();
  const scores = useLLM ? await llmEvaluate(provider, output, userQuery || '') : evaluateOutput(output, userQuery || '');
  res.json({ scores, overall: scores.reduce((s: number, e: EvalScore) => s + e.score, 0) / scores.length });
});

// Multi-agent solve endpoint with evaluation, circuit breaker, and feedback
app.post("/api/agents/solve", async (req, res) => {
  const { profile, request, feedback, sessionId } = req.body;
  if (!profile || !request) return res.status(400).json({ error: "Missing profile or request." });

  const session = sessionId && activeSessions.has(sessionId)
    ? activeSessions.get(sessionId)!
    : createSession(profile, request);

  if (!sessionId) activeSessions.set(session.id, session);

  const provider = getActiveProvider();
  const cb = new CircuitBreaker();
  const profileBlock = buildProfileBlock(profile);

  session.userCorrections = feedback ? session.userCorrections + 1 : session.userCorrections;

  // Check for unsafe requests
  const unsafePatterns = /tax evasion|evade tax|hide income|illegal|fraud|bribe/i;
  if (unsafePatterns.test(request)) {
    return res.json({
      success: true,
      sessionId: session.id,
      messages: [{
        id: "msg_0",
        sender: "CEO Agent",
        receiver: "User",
        content: `I understand you're asking about "${request}". I cannot provide advice on tax evasion or any illegal activities. Instead, I can help you with legitimate tax optimization strategies, keeping proper financial records, or understanding legal deductions available for your business. Would you like me to help with any of these instead?`,
        timestamp: ts(),
        type: "response"
      }],
      summary: "Request refused: Cannot provide advice on illegal activities.",
      evaluation: [{ dimension: "safety", score: 5, rationale: "Appropriate refusal of unsafe request" }],
      telemetry: { totalTokens: estimateTokens(request), totalCost: 0, trustScore: 1.0, spans: [] }
    });
  }

  // Match skill via progressive disclosure
  const matchedSkill = matchSkill(request);
  const activeSkill = matchedSkill ? loadSkill(matchedSkill.name) : null;

  const sessionSpan = startSpan(session, 'session', 'CEO Agent');

  try {
    const messages: any[] = [];

    // CEO Opening
    const ceoThinkSpan = startSpan(session, 'think', 'CEO Agent', sessionSpan.id);
    const openingMsg = `Strategy session called for **${profile.name}** (${profile.type} in ${profile.location}). Question: *"${request}"*${feedback ? `\n\n**User correction feedback:** ${feedback}` : ''}${activeSkill ? `\n\n**Matched Skill:** ${activeSkill.name}` : ''}. Specialists, analyze and report back.`;
    endSpan(session, ceoThinkSpan.id, 'completed', { contentLength: openingMsg.length });

    messages.push({
      id: "msg_1",
      sender: "CEO Agent",
      receiver: "All Specialists",
      content: openingMsg,
      timestamp: ts(),
      type: "request"
    });

    // Research Agent
    const researchSpan = startSpan(session, 'think', 'Research Agent', sessionSpan.id);
    const researchInstruction = "You are the specialist Research Agent for township businesses. Gather competitive price benchmarks, local supply logistics, and regional supplier info.";
    let researchWebContext = "";
    const webSearchPatterns = /regulation|policy|law|act|new\s+rules|latest|trend|price\s+of|cost\s+of|supplier|wholesale|market\s+rate|inflation|interest\s+rate|grant|funding|loan|digital|app|software|tool|technology|platform|license|permit|compliance|tax|VAT|SARS|municipal|by.law|load.shedding|stage\s+\d|fuel\s+price|transport\s+cost|exchange\s+rate|border|import|export/i;
    if (webSearchPatterns.test(request) || webSearchPatterns.test(profile.challenges || "")) {
      const webSearchSpan = startSpan(session, 'tool', 'Research Agent', researchSpan.id);
      const webResult = await executeTool("web_search", {
        query: `${request} ${profile.type} ${profile.location} South Africa 2026`,
        limit: 3
      });
      endSpan(session, webSearchSpan.id, webResult.success ? 'completed' : 'failed', { query: request });
      if (webResult.success && webResult.data?.results) {
        researchWebContext = `\n\n---WEB RESEARCH---\nRecent web context for this query:\n${webResult.data.results}`;
      }
    }
    const researchPrompt = `${profileBlock}\n\n---QUESTION---\n${request}${researchWebContext}\n\n---TASK---\nAnalyze competitor trends for a ${profile.type} at ${profile.location}. Challenges: "${profile.challenges}". Give specific recommendations. Use the web research context if provided, but clearly note what's from web search vs. your own knowledge.`;
    const researchAnalysis = await provider.generateText(researchPrompt, { systemInstruction: researchInstruction });
    trackTokens(session, researchPrompt, researchAnalysis);
    endSpan(session, researchSpan.id, 'completed', { tokenEstimate: estimateTokens(researchAnalysis), hadWebContext: !!researchWebContext });

    messages.push({
      id: "msg_2", sender: "Research Agent", receiver: "CEO Agent",
      content: researchAnalysis, timestamp: ts(), type: "response"
    });

    // Finance Agent with tool call
    const financeSpan = startSpan(session, 'think', 'Finance Agent', sessionSpan.id);
    const toolResult = await executeTool("cash_calculator", { revenue: profile.revenue || 12000, expenses: profile.expenses || 7500 });
    const toolSpan = startSpan(session, 'tool', 'Finance Agent', financeSpan.id);
    endSpan(session, toolSpan.id, toolResult.success ? 'completed' : 'failed', { toolResult });

    const financeInstruction = "You are the specialist Finance Agent for township businesses. Focus on profit margins, break-even, and capital allocation.";
    const financePrompt = `${profileBlock}\n\n---QUESTION---\n${request}\n\n---TOOL RESULT---\n${JSON.stringify(toolResult.data)}\n\n---TASK---\nProvide financial analysis.`;
    const financeAnalysis = await provider.generateText(financePrompt, { systemInstruction: financeInstruction });
    trackTokens(session, financePrompt, financeAnalysis);
    endSpan(session, financeSpan.id, 'completed', { tokenEstimate: estimateTokens(financeAnalysis) });

    messages.push({
      id: "msg_3", sender: "Finance Agent", receiver: "CEO Agent",
      content: financeAnalysis, timestamp: ts(), type: "response"
    });

    // Check circuit breaker
    if (toolResult.success && toolResult.data) {
      if (toolResult.data.marginStatus === 'critical') {
        cb.recordFailure(0.15);
      } else {
        cb.recordSuccess(0.05);
      }
    }
    session.trustScore = cb.getScore();

    // Operations Agent
    const opsSpan = startSpan(session, 'think', 'Operations Agent', sessionSpan.id);
    const opsInstruction = "You are the specialist Operations Agent for township businesses. Focus on logistics, load-shedding, and contingency planning.";
    const opsPrompt = `${profileBlock}\n\n---QUESTION---\n${request}\n\n---TASK---\nDesign operational safeguards. Challenges: "${profile.challenges}". Give practical steps.`;
    const opsAnalysis = await provider.generateText(opsPrompt, { systemInstruction: opsInstruction });
    trackTokens(session, opsPrompt, opsAnalysis);
    endSpan(session, opsSpan.id, 'completed', { tokenEstimate: estimateTokens(opsAnalysis) });

    messages.push({
      id: "msg_4", sender: "Operations Agent", receiver: "CEO Agent",
      content: opsAnalysis, timestamp: ts(), type: "response"
    });

    // CEO Consolidation
    const ceoConsolidateSpan = startSpan(session, 'think', 'CEO Agent', sessionSpan.id);
    const ceoInstruction = "You are the central CEO Orchestrator Agent. Consolidate specialist reports into one actionable strategic plan for a township business owner.";
    const ceoPrompt = `${profileBlock}\n\n---QUESTION---\n${request}\n\nResearch: ${researchAnalysis.slice(0, 1000)}\n\nFinance: ${financeAnalysis.slice(0, 1000)}\n\nOperations: ${opsAnalysis.slice(0, 1000)}\n\nDeliver a single cohesive plan in simple terms. Use bullet points. Make it actionable.`;
    const summary = await provider.generateText(ceoPrompt, { systemInstruction: ceoInstruction });
    trackTokens(session, ceoPrompt, summary);
    endSpan(session, ceoConsolidateSpan.id, 'completed', { tokenEstimate: estimateTokens(summary) });

    // Evaluation
    const evalSpan = startSpan(session, 'eval', 'CEO Agent', sessionSpan.id);
    const evalScores = await llmEvaluate(provider, summary, request);
    endSpan(session, evalSpan.id, 'completed', { scores: evalScores });

    const overallEval = evalScores.reduce((s: number, e: EvalScore) => s + e.score, 0) / evalScores.length;

    if (overallEval < 2) {
      cb.recordFailure(0.2);
      session.trustScore = cb.getScore();
    } else {
      cb.recordSuccess(0.1);
      session.trustScore = cb.getScore();
    }

    endSpan(session, sessionSpan.id, 'completed', { evalScore: overallEval });

    res.json({
      success: true,
      sessionId: session.id,
      messages,
      summary,
      toolResults: { cash_calculator: toolResult.data },
      evaluation: evalScores,
      overallEvalScore: Math.round(overallEval * 10) / 10,
      matchedSkill: activeSkill ? { name: activeSkill.name, description: activeSkill.description } : null,
      circuitBreaker: { trustScore: Math.round(cb.getScore() * 100) / 100, tripped: cb.isTripped() },
      telemetry: {
        sessionId: session.id,
        totalTokens: session.totalTokens,
        totalCost: Math.round(session.totalCost * 100000) / 100000,
        trustScore: Math.round(session.trustScore * 100) / 100,
        userCorrections: session.userCorrections,
        spans: session.spans.slice(-10)
      }
    });

  } catch (err: any) {
    console.error("Multi-agent solver crashed:", err);
    cb.recordFailure(0.3);
    session.trustScore = cb.getScore();
    endSpan(session, sessionSpan.id, 'failed', { error: err.message });
    res.status(500).json({ error: err.message, sessionId: session.id });
  }
});

app.post("/api/agents/marketing", async (req, res) => {
  const { profile, campaignGoal } = req.body;
  const provider = getActiveProvider();
  const profileBlock = buildProfileBlock(profile);
  const sysMsg = "You are the specialized Marketing Agent for South African township businesses. Craft engaging WhatsApp/SMS promo campaigns.";
  const prompt = `${profileBlock}\n\n---GOAL---\n${campaignGoal}\n\nCreate a promotional campaign for ${profile.name}.`;

  try {
    const text = await provider.generateText(prompt, { systemInstruction: sysMsg });
    res.json({ campaignText: text, channel: "WhatsApp Status", strategy: "Mobile Status Blast" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/agents/customer-service", async (req, res) => {
  const { profile, complaint } = req.body;
  const provider = getActiveProvider();
  const profileBlock = buildProfileBlock(profile);
  const sysMsg = "You are the specialized Customer Service Agent for township micro-businesses.";
  const prompt = `${profileBlock}\n\n---COMPLAINT---\n${complaint}\n\nGenerate a warm customer care response template.`;

  try {
    const text = await provider.generateText(prompt, { systemInstruction: sysMsg });
    res.json({ suggestedResponse: text, loyaltyOutline: "WhatsApp 10-point punchcard" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Server Startup ──────────────────────────────────────────

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Township CEO backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

process.on("SIGINT", async () => {
  console.log("\nShutting down MCP client...");
  await webSearchClient.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await webSearchClient.close();
  process.exit(0);
});
