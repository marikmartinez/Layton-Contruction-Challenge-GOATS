/*
 * POST /api/submit — save a finished report to Supabase (table `reports`, see db/schema.sql).
 * Body: { formId, fields, attachments, transcript, reporter }
 * Returns { id, status, createdAt }. The Supabase key stays on the server.
 */
const FORM_IDS = ["good-catch", "issue", "incident", "daily-journal"];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { formId, fields, attachments = {}, transcript = "", reporter = "" } = req.body || {};
  if (!FORM_IDS.includes(formId) || !fields || typeof fields !== "object" || Array.isArray(fields)) {
    return res.status(400).json({ error: "formId and fields are required" });
  }
  const { SUPABASE_URL, SUPABASE_SECRET_KEY: key } = process.env;
  if (!SUPABASE_URL || !key) return res.status(503).json({ error: "Database isn't set up (SUPABASE_URL / SUPABASE_SECRET_KEY)." });

  // New keys (sb_secret_...) go in `apikey` only; legacy service_role JWTs (eyJ...) also need Authorization.
  const headers = { apikey: key, "Content-Type": "application/json", Prefer: "return=representation" };
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`;

  const r = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/reports`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      form_id: formId,
      fields,
      attachments,
      transcript: String(transcript).slice(0, 5000),
      reporter: String(reporter).slice(0, 100),
    }),
  });
  if (!r.ok) return res.status(502).json({ error: `Supabase ${r.status}: ${await r.text()}` });
  const [row] = await r.json();
  return res.status(200).json({ id: row.id, status: row.status, createdAt: row.created_at });
}
