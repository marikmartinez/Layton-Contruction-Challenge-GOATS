/*
 * POST /api/assistant — text reply for the Leadership Safety Assistant (PTP drafts, "Ask the data").
 * Body: { messages: [{ role: "user" | "assistant", content: string }] }
 * Returns { text }. The OpenAI key stays on the server (OPENAI_API_KEY env var).
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const messages = (req.body?.messages || [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-14);
  if (!messages.length) return res.status(400).json({ error: "messages are required" });

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4.1-mini", messages }),
  });
  if (r.status === 429) return res.status(429).json({ error: "rate_limited" });
  if (!r.ok) return res.status(502).json({ error: `OpenAI ${r.status}: ${await r.text()}` });
  const data = await r.json();
  return res.status(200).json({ text: data.choices?.[0]?.message?.content || "" });
}
