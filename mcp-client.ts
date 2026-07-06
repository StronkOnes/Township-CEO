import { spawn, ChildProcess } from "child_process";
import path from "path";
import fs from "fs";

const MCP_SERVER_PATH = path.join(process.cwd(), "mcp-servers", "web-search-mcp", "dist", "index.js");

interface MCPResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: { code: number; message: string };
}

export class WebSearchMCPClient {
  private process: ChildProcess | null = null;
  private pending: Map<number, { resolve: (v: any) => void; reject: (e: any) => void }> = new Map();
  private idCounter = 0;
  private buffer = "";
  private initialized = false;

  async ensureRunning(): Promise<void> {
    if (this.process && !this.process.killed) return;
    if (!fs.existsSync(MCP_SERVER_PATH)) {
      throw new Error(`MCP server not found at ${MCP_SERVER_PATH}. Run: cd mcp-servers/web-search-mcp && npm install && npx playwright install && npm run build`);
    }

    this.process = spawn("node", [MCP_SERVER_PATH], {
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        MAX_CONTENT_LENGTH: "10000",
        BROWSER_HEADLESS: "true",
        DEFAULT_TIMEOUT: "10000",
        FORCE_MULTI_ENGINE_SEARCH: "true"
      }
    });

    this.buffer = "";

    this.process.stdout!.on("data", (data: Buffer) => {
      this.buffer += data.toString();
      this.processBuffer();
    });

    this.process.stderr!.on("data", (data: Buffer) => {
      const msg = data.toString().trim();
      if (msg && !msg.includes("DevTools listening") && !msg.includes("ExperimentalWarning")) {
        console.warn("[MCP:web-search]", msg);
      }
    });

    this.process.on("exit", (code) => {
      console.warn(`[MCP:web-search] process exited with code ${code}`);
      this.process = null;
      for (const [, pending] of this.pending) {
        pending.reject(new Error("MCP process exited unexpectedly"));
      }
      this.pending.clear();
    });

    await this.sendRequest("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "township-ceo", version: "1.0.0" }
    });
    this.initialized = true;
  }

  private processBuffer(): void {
    const lines = this.buffer.split("\n");
    this.buffer = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const msg: MCPResponse = JSON.parse(trimmed);
        const pending = this.pending.get(msg.id);
        if (pending) {
          this.pending.delete(msg.id);
          if (msg.error) {
            pending.reject(new Error(msg.error.message));
          } else {
            pending.resolve(msg.result);
          }
        }
      } catch {
        console.warn("[MCP:web-search] Failed to parse response:", trimmed.slice(0, 200));
      }
    }
  }

  private sendRequest(method: string, params: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.process || this.process.killed) {
        return reject(new Error("MCP process not running"));
      }
      const id = ++this.idCounter;
      this.pending.set(id, { resolve, reject });
      const request = JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n";
      this.process.stdin!.write(request);
    });
  }

  async searchWeb(query: string, limit: number = 5): Promise<string> {
    await this.ensureRunning();
    const result = await this.sendRequest("tools/call", {
      name: "full-web-search",
      arguments: { query, limit, includeContent: true }
    });
    return result?.content?.[0]?.text || JSON.stringify(result);
  }

  async searchSummaries(query: string, limit: number = 5): Promise<string> {
    await this.ensureRunning();
    const result = await this.sendRequest("tools/call", {
      name: "get-web-search-summaries",
      arguments: { query, limit }
    });
    return result?.content?.[0]?.text || JSON.stringify(result);
  }

  async getPageContent(url: string, maxLength: number = 5000): Promise<string> {
    await this.ensureRunning();
    const result = await this.sendRequest("tools/call", {
      name: "get-single-web-page-content",
      arguments: { url, maxContentLength: maxLength }
    });
    return result?.content?.[0]?.text || JSON.stringify(result);
  }

  async close(): Promise<void> {
    if (this.process && !this.process.killed) {
      this.process.kill();
      this.process = null;
    }
    this.initialized = false;
  }
}

export const webSearchClient = new WebSearchMCPClient();
