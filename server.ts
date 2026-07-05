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
    
    const isMarketing = systemInstruction.includes("Marketing") || prompt.includes("Create a promotional campaign");
    const isCustomerService = systemInstruction.includes("Customer Service") || prompt.includes("Generate a warm customer care response");
    const isResearch = systemInstruction.includes("Research") || prompt.includes("Analyze competitor trends");
    const isFinance = systemInstruction.includes("Finance") || prompt.includes("Perform a gross profit margin");
    const isOperations = systemInstruction.includes("Operations") || prompt.includes("Design operational and load-shedding safeguards");
    const isCEO = systemInstruction.includes("CEO") || prompt.includes("Summarize the specialist reports");

    // Helper to extract fields using regex
    const extract = (regex: RegExp, defaultVal: string): string => {
      const match = prompt.match(regex);
      return match ? match[1].trim() : defaultVal;
    };

    // Extract fields dynamically from prompt
    const businessType = extract(/for a ([^at\n]+) at/i, "Township Micro-Enterprise");
    const location = extract(/at ([^facing\n,]+)/i, "Local Township");
    const challenges = extract(/(?:facing|details):\s*"([^"]+)"/i, "Operational cost pressures and regional supply constraints");
    
    // Request can come from multiple formats
    let request = extract(/(?:address|question|based on):\s*"([^"]+)"/i, "");
    if (!request) {
      request = extract(/Goal:\s*([^\n.]+)/i, "");
      if (!request) {
        request = extract(/issue:\s*"([^"]+)"/i, "How to optimize business operations and profitability?");
      }
    }

    const revenueValStr = extract(/Revenue\s*=\s*R?([0-9,.]+)/i, "12000");
    const expensesValStr = extract(/Expenses\s*=\s*R?([0-9,.]+)/i, "7500");
    const revenue = parseFloat(revenueValStr.replace(/,/g, "")) || 12000;
    const expenses = parseFloat(expensesValStr.replace(/,/g, "")) || 7500;

    const businessName = extract(/(?:plan for|Campaign for|Business:)\s*([^\n(.]+)/i, "Our Enterprise");

    if (isMarketing) {
      return `📢 *WhatsApp Status & Flyer Promotion Deal* 📢

Hey community! The team at **${businessName}** has an exclusive offer just for you! 🇿🇦

🔥 *${request.toUpperCase()}* 🔥

We are proud to serve you with top-tier **${businessType}** solutions in **${location}**. We know times are tough, so we're giving you maximum value:

✨ *THE EXCLUSIVE DEAL* ✨
Get our premium service and professional care at a special discounted price!

📍 **Find us**: Stand 42, ${location}
⏰ **Offer valid**: Mon - Thu only!

Reply directly to this WhatsApp message to secure your spot or place your order now! 📲`;
    }

    if (isCustomerService) {
      return `🤝 *Customer Care Response Template* 🤝

"Hi, thank you so much for bringing this to our attention. We sincerely apologize for the experience regarding: *${request}*.

As a proud local business in ${location}, we highly value your support and want to resolve this immediately. We are putting extra operational safeguards in place to ensure this doesn't happen again.

To show our appreciation, we would love to offer you a **15% discount** or a **complimentary upgrade** on your next visit to **${businessName}**. Please show this message to our team!"

---

*Operational Customer Retention Guide*:
- Check in with the customer via WhatsApp 48 hours later to ensure they are fully happy.
- Log customer feedback in your diary to identify and solve frequent friction points.`;
    }

    if (isResearch) {
      return `🔍 *Research Specialist - Regional Wholesaler & Competitor Intel* 🔍

We analyzed competitive benchmarks and supplier options for a **${businessType}** business operating in **${location}**.

1. 📊 *Competitor Landscape in ${location}*:
   Most operators facing similar challenges ("${challenges}") see customer loyalty fluctuate based on immediate availability and price consistency. Securing a low-cost, reliable supply chain is key.

2. 🚛 *Wholesale & Sourcing Intel*:
   - **Option A (Bulk Sourcing Hub)**: We recommend auditing wholesalers within a 15km radius of ${location} for cash-and-carry volume tiers.
   - **Option B (Trader Cooperatives)**: Joining local township buyer syndicates can unlock 12% to 15% wholesale discounts.

3. 🎯 *Direct Action Plan for: "${request}"*:
   Benchmark your top 3 high-volume items. Standardize supplier checks every Monday morning to catch price cuts early.`;
    }

    if (isFinance) {
      const netSurplus = revenue - expenses;
      const margin = revenue > 0 ? (netSurplus / revenue) * 100 : 0;
      const dailyExpenses = expenses / 30;
      const dailyBreakEven = margin > 0 ? dailyExpenses / (margin / 100) : dailyExpenses;
      const runwayDays = expenses > 0 ? (revenue / expenses) * 30 : 30;

      return `📊 *Finance Specialist - Profit Margins & Capital Allocations* 📊

We completed a financial baseline audit for **${businessName}** based on your inputs:
- **Monthly Revenue Baseline**: R${revenue.toLocaleString('en-ZA')}
- **Monthly Expenses Baseline**: R${expenses.toLocaleString('en-ZA')}
- **Net Monthly Surplus**: R${netSurplus.toLocaleString('en-ZA')} (Margin: **${margin.toFixed(1)}%**)

1. 📈 *Break-Even Analysis*:
   - **Daily Fixed Overhead Cost**: R${dailyExpenses.toFixed(2)} (Overhead to keep doors open).
   - **Daily Break-Even Revenue Target**: You must generate at least **R${dailyBreakEven.toFixed(2)}** daily to sustain current operations.

2. 💳 *Runway & Working Capital*:
   - Your current estimated operational runway is **${runwayDays.toFixed(0)} days** based on cash flow cycles.
   - To address **"${request}"**, we recommend cutting unnecessary overhead by 12% to extend your monthly cash reserve by R${(expenses * 0.12).toFixed(0)}.

3. 🔒 *Financial Discipline rule*:
   Keep a separate container/tin for business cash. Never mix business revenue with immediate household purchases.`;
    }

    if (isOperations) {
      return `📦 *Operations Specialist - Inventory & Continuity Safeguards* 📦

To address your query: **"${request}"**, we have prepared operational safeguards tailored to your business challenges ("${challenges}"):

1. ⚡ *Load-Shedding & Infrastructure Safeguards*:
   - Establish a shift/hours calendar that matches regional municipal load-shedding slots.
   - Equip your work station with dual-rechargeable LED lighting and a basic offline backup solution to keep operations running during outages.

2. 🛒 *Inventory Control*:
   - Apply a "3-Unit Safety Stock Limit" on your highest-velocity items to prevent stock-outs.
   - Set up standard reorder thresholds with wholesalers to guarantee reliable delivery.

3. 🛡️ *Risk Mitigation*:
   - Standardize a digital record of daily transactions on your mobile device to prevent paper loss during peak periods.`;
    }

    // Default / CEO
    const netSurplus = revenue - expenses;
    const margin = revenue > 0 ? (netSurplus / revenue) * 100 : 0;
    const dailyExpenses = expenses / 30;
    const dailyBreakEven = margin > 0 ? dailyExpenses / (margin / 100) : dailyExpenses;

    return `🤝 *CEO Orchestrator - Consolidated Strategic Masterplan* 🤝

I have consolidated the specialist recommendations for **${businessName}** in **${location}** to answer your query:

> **"${request}"**

---

### 1. 🔍 Sourcing & Positioning (Research Agent)
- Audit bulk-buying distributors in **${location}** to negotiate volume pricing.
- Minimize stock-out risks by forming loose cooperative purchasing alliances with neighboring traders.

### 2. 📊 Cash Flow & Margins (Finance Agent)
- Maintain your solid gross profit margin (**${margin.toFixed(1)}%**).
- Focus daily efforts on exceeding your **R${dailyBreakEven.toFixed(2)}** break-even revenue target.
- Reinvest at least 25% of your monthly surplus (R${(netSurplus * 0.25).toFixed(0)}) back into high-margin stock.

### 3. 📦 Operations & Continuity (Operations Agent)
- Minimize disruptions from local service or power outages through off-grid adjustments and scheduling.
- Standardize safety stock controls to ensure you never run out of core materials.

---

### 🚀 Immediate 3-Step Action Plan:
1. **Days 1-3**: Reach out to 2 local suppliers to quote volume tier pricing for your top 3 supplies.
2. **Days 4-7**: Establish a separate daily business savings pocket using digital money transfers.
3. **Weekly**: Review your target daily sales of **R${dailyBreakEven.toFixed(2)}** every Sunday afternoon to plan the upcoming week.`;
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
