// Local dev: serves worker-app/ and the /api functions on http://localhost:3000
// Run: npm run dev   (reads OPENAI_API_KEY from .env)
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import extract from "./api/extract.js";
import transcribe from "./api/transcribe.js";
import submitReport from "./api/submit.js";
import reports from "./api/reports.js";
import dashboard from "./api/dashboard.js";
import assistant from "./api/assistant.js";
import leader from "./api/leader.js";

const API = { "/api/extract": extract, "/api/transcribe": transcribe, "/api/submit": submitReport, "/api/reports": reports, "/api/dashboard": dashboard, "/api/assistant": assistant, "/api/leader": leader };

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml" };

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const api = API[url.pathname];
  if (api) {
    req.query = Object.fromEntries(url.searchParams);
    let body = "";
    for await (const chunk of req) body += chunk;
    try { req.body = body ? JSON.parse(body) : {}; } catch { req.body = {}; }
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (obj) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(obj)); };
    return api(req, res).catch((e) => res.status(500).json({ error: String(e) }));
  }
  const path = normalize(decodeURIComponent(req.url.split("?")[0]));
  const file = join("worker-app", path.endsWith("/") ? `${path}index.html` : path);
  try {
    const data = await readFile(file);
    res.setHeader("Content-Type", TYPES[extname(file)] || "application/octet-stream");
    res.end(data);
  } catch {
    res.statusCode = 404;
    res.end("Not found");
  }
}).listen(3000, () => console.log("http://localhost:3000"));
