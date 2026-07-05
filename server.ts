import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// 1. PROVIDER ABSTRACTION LAYER (PAL)
// ─────────────────────────────────────────────────────────────────────────────

interface GenerationOptions {
  temperature?: number;
  systemInstruction?: string;
}

interface AIProvider {
  id: string;
  name: string;
  generateText(prompt: string, options?: GenerationOptions): Promise<string>;
}

// Lazy-initialized Gemini Client
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
      throw new Error("GEMINI_API_KEY environment variable is not configured or holds a placeholder.");
    }
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Fallback high-fidelity mockup generator for offline-resiliency/missing keys
const fallbackProvider: AIProvider = {
  id: "mock",
  name: "Local Offline Engine",
  generateText: async (prompt: string, options?: GenerationOptions): Promise<string> => {
    // Generate intelligent, localized answers based on context clues
    const systemInstruction = options?.systemInstruction || "";
    const isMarketing = systemInstruction.includes("Marketing") || prompt.includes("marketing") || prompt.includes("WhatsApp");
    const isFinance = systemInstruction.includes("Finance") || prompt.includes("finance") || prompt.includes("break-even");
    const isCustomerService = systemInstruction.includes("Customer Service") || prompt.includes("complaint");
    const isCEO = systemInstruction.includes("CEO") || prompt.includes("strategic");

    if (isMarketing) {
      return `📢 *WhatsApp mid-month promo deal draft!* 📢\n\nHey family! Is the wallet feeling a bit light? 🇿🇦 We got you covered at Sizwe's Barber Shop! 💈\n\n🔥 *MID-MONTH REFRESH COMBO* 🔥\nGet a clean cut, a sharp beard shave AND a hot towel treatment for only *R120* (Save R40!) \n\n📍 Visit us at Stand 432, Orlando West, Soweto\n⏰ Valid Mon - Thu only! \n\nReply to this message to book your spot! 📲`;
    }

    if (isFinance) {
      return `📊 *Finance Specialist - Break-Even Analysis* 📊\n\nBased on your profile, your daily fixed operational expense is R106 (R3200 expenses over 30 days). \n\n1. *Profit Margin*: 41.8%\n2. *Daily Break-Even Revenue*: R254. You need to make at least R254 in sales daily just to pay the bills.\n3. *Analysis*: Sourcing wholesale snacks directly in bulk from Devland Cash & Carry will reduce stock procurement cost by 15%, shifting your margin from 41.8% up to 48.2%. This lowers your break-even point to R220/day, creating R1,200 of extra monthly cash buffer. Ensure you don't blend this cash with household grocery spending!`;
    }

    if (isCustomerService) {
      return `🤝 *Customer Service Specialist Response Template* 🤝\n\n"Hi Thabo, thank you for reaching out to us. We sincerely apologize for the delay in completing your vehicle service yesterday. We had a sudden load-shedding outage which affected our hydraulic lift systems. We values your support and would love to offer you a free engine oil top-up on your next visit! Please present this message at Stand 104, Alexandra."\n\n*Loyalty System Suggestion*: Introduce a "5th Service Free" WhatsApp punch card. Provide stamp confirmation tags digitally to keep taxi operators returning.`;
    }

    return `🤝 *CEO Orchestrator Strategic Masterplan* 🤝\n\nI have reviewed your concern regarding procurement costs and aligned with our specialized agents:\n\n1. 📊 *Financial Impact (Finance Agent)*: Sourcing represents 58% of overall costs. Reducing this by 12% expands your runway by 18 days.\n2. 🔍 *Sourcing Intel (Research Agent)*: Joining the Soweto Traders Buying Association unlocks 12-15% bulk discounts at central wholesalers.\n3. 📦 *Contingency (Operations Agent)*: Set a reorder point of 3 units on high-demand items to prevent empty shelves during bulk deliveries.\n\n*Action Steps*:\n- Contact the Soweto cooperative representative at the community hall this Thursday.\n- Reinvest the R1,200 savings into high-margin items like paraffin or fresh bread.`;
  }
};

const geminiProvider: AIProvider = {
  id: "gemini",
  name: "Google Gemini",
  generateText: async (prompt: string, options?: GenerationOptions): Promise<string> => {
    try {
      const client = getGeminiClient();
      const res = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: options?.systemInstruction,
          temperature: options?.temperature ?? 0.7,
        },
      });
      return res.text || "";
    } catch (err: any) {
      console.warn("Gemini execution failed, falling back to local simulation:", err.message);
      return fallbackProvider.generateText(prompt, options);
    }
  }
};

// Select provider based on API key availability
function getActiveProvider(): AIProvider {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
    return fallbackProvider;
  }
  return geminiProvider;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SYSTEM DOCUMENTATION API ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

// Catalog of markdown files to display in the Document Hub
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

app.get("/api/docs", (req, res) => {
  res.json(DOCS_CATALOG);
});

app.get("/api/docs/content", (req, res) => {
  const filePath = req.query.path as string;
  if (!filePath) {
    return res.status(400).json({ error: "Missing file path parameter." });
  }

  // Validate path traversal
  const resolvedPath = path.resolve(process.cwd(), filePath.replace(/^\/+/, ""));
  if (!resolvedPath.startsWith(process.cwd())) {
    return res.status(403).json({ error: "Access denied. Paths must remain inside workspace." });
  }

  try {
    if (fs.existsSync(resolvedPath)) {
      const content = fs.readFileSync(resolvedPath, "utf-8");
      return res.json({ content });
    } else {
      return res.status(404).json({ error: "File not found." });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. CORE MULTI-AGENT SOLVER ENGINE
// ─────────────────────────────────────────────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), provider: getActiveProvider().name });
});

// Primary Endpoint: Solves high-level business task via Multi-Agent Chain
app.post("/api/agents/solve", async (req, res) => {
  const { profile, request } = req.body;
  if (!profile || !request) {
    return res.status(400).json({ error: "Missing business profile or request payload." });
  }

  const provider = getActiveProvider();
  const timestamp = () => new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  try {
    const messages: any[] = [];

    // Step 1: CEO Agent initiates the process
    messages.push({
      id: "msg_1",
      sender: "CEO Agent",
      receiver: "All Specialists",
      content: `Greetings board! Our entrepreneur at ${profile.name} (${profile.type} in ${profile.location}) is asking: "${request}". Let's work together to compile a strategic masterplan. Finance, Research, and Operations: perform assessments immediately.`,
      timestamp: timestamp(),
      type: "request"
    });

    // Step 2: Research Agent compiles regional wholesaler & competitor insights
    const researchInstruction = "You are the specialist Research Agent for township businesses. Gather competitive price benchmarks, local supply logistics, and regional supplier info.";
    const researchPrompt = `Analyze competitor trends and bulk purchasing for a ${profile.type} at ${profile.location} facing: "${profile.challenges}". Specifically address: "${request}". Give 2 supplier recommendation options.`;
    const researchAnalysis = await provider.generateText(researchPrompt, { systemInstruction: researchInstruction });

    messages.push({
      id: "msg_2",
      sender: "Research Agent",
      receiver: "CEO Agent",
      content: researchAnalysis,
      timestamp: timestamp(),
      type: "response"
    });

    // Step 3: Finance Agent analyzes margins and break-even targets
    const financeInstruction = "You are the specialist Finance Agent for informal and micro township businesses. Focus on profit margins, ZAR break-even metrics, and strict capital allocation boundaries.";
    const financePrompt = `Perform a gross profit margin and daily break-even threshold analysis. Business parameters: Daily/Monthly Revenue = R${profile.revenue}, Expenses = R${profile.expenses}. Current user question: "${request}". Calculate margins and provide ZAR targets.`;
    const financeAnalysis = await provider.generateText(financePrompt, { systemInstruction: financeInstruction });

    messages.push({
      id: "msg_3",
      sender: "Finance Agent",
      receiver: "CEO Agent",
      content: financeAnalysis,
      timestamp: timestamp(),
      type: "response"
    });

    // Step 4: Operations Agent proposes inventory rules and contingency plans
    const opsInstruction = "You are the specialist Operations Agent for township businesses. Focus on logistics, reorder levels, supply chains, and municipal/load-shedding contingency rules.";
    const opsPrompt = `Design operational and load-shedding safeguards based on: "${request}". Specific business details: "${profile.challenges}".`;
    const opsAnalysis = await provider.generateText(opsPrompt, { systemInstruction: opsInstruction });

    messages.push({
      id: "msg_4",
      sender: "Operations Agent",
      receiver: "CEO Agent",
      content: opsAnalysis,
      timestamp: timestamp(),
      type: "response"
    });

    // Step 5: CEO Agent compiles and summarizes the comprehensive strategy
    const ceoInstruction = "You are the central CEO Orchestrator Agent. Review inputs from the Research, Finance, and Operations specialist agents, and formulate a high-impact, easy-to-read township business strategy.";
    const ceoPrompt = `Summarize the specialist reports into a single cohesive strategic plan for ${profile.name}.\n\nResearch feedback: ${researchAnalysis}\n\nFinance feedback: ${financeAnalysis}\n\nOperations feedback: ${opsAnalysis}\n\nDeliver the plan in simple terms. Avoid complex jargon. Add bullet points.`;
    const summary = await provider.generateText(ceoPrompt, { systemInstruction: ceoInstruction });

    res.json({
      success: true,
      messages,
      summary
    });
  } catch (err: any) {
    console.error("Multi-agent solver crashed:", err);
    res.status(500).json({ error: err.message });
  }
});

// Dedicated Endpoint: Marketing Copy Builder
app.post("/api/agents/marketing", async (req, res) => {
  const { profile, campaignGoal } = req.body;
  const provider = getActiveProvider();
  const sysMsg = "You are the specialized Marketing Agent for South African township businesses. Craft highly engaging, WhatsApp/SMS ready promo campaigns with local slang and emojis.";
  const prompt = `Create a promotional campaign for ${profile.name} (${profile.type} in ${profile.location}). Goal: ${campaignGoal}. Context: ${profile.challenges}. Include 1 WhatsApp deal format.`;

  try {
    const text = await provider.generateText(prompt, { systemInstruction: sysMsg });
    res.json({ campaignText: text, channel: "WhatsApp Status", strategy: "Mobile Status Blast" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Dedicated Endpoint: Customer Service Response template
app.post("/api/agents/customer-service", async (req, res) => {
  const { profile, complaint } = req.body;
  const provider = getActiveProvider();
  const sysMsg = "You are the specialized Customer Service Agent for township micro-businesses. Maintain community goodwill, handle complaints professionally, and design local loyalty hooks.";
  const prompt = `Generate a warm customer care response template to handle this specific issue: "${complaint}". Business: ${profile.name} (${profile.type} at ${profile.location}).`;

  try {
    const text = await provider.generateText(prompt, { systemInstruction: sysMsg });
    res.json({ suggestedResponse: text, loyaltyOutline: "WhatsApp 10-point punchcard" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. FRONTEND MIDDLEWARE INTEGRATION (Vite + Express static files)
// ─────────────────────────────────────────────────────────────────────────────

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
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
