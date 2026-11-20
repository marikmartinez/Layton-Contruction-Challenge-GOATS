/*
 * Worker reports for the Leadership Safety Assistant (worker-app/leadership/).
 *   GET  /api/leader                         → issues, good catches and incidents, newest first,
 *                                              each with firstPhoto (signed link, valid 1 hour)
 *   POST /api/leader  { id, by, note }       → resolve a report (Supabase rpc resolve_report)
 * Protected by DASHBOARD_TOKEN, sent by the page in the x-dashboard-token header.
 * The token is typed in on the page and never stored in the HTML.
 */
import { supabase, signPhotos } from "./_supabase.js";

const COLUMNS = "id,created_at,form_id,reporter,status,job_id,report_date,hazard_category,severity,observed_condition,fields,attachments";

export default async function handler(req, res) {
  const expected = process.env.DASHBOARD_TOKEN;
  if (!expected) return res.status(503).json({ error: "DASHBOARD_TOKEN isn't set." });
  if (req.headers["x-dashboard-token"] !== expected) return res.status(401).json({ error: "Wrong passcode." });

  try {
    if (req.method === "GET") {
      const r = await supabase(`reports?select=${COLUMNS}&form_id=in.(issue,good-catch,incident)&order=created_at.desc&limit=300`);
      if (!r.ok) return res.status(502).json({ error: `Database ${r.status}: ${await r.text()}` });
      const rows = await r.json();
      const firstPaths = rows.map((x) => x.attachments?.photoPaths?.[0] || null);
      const urls = await signPhotos(firstPaths.filter(Boolean));
      return res.status(200).json(rows.map(({ attachments, ...x }, i) => ({ ...x, firstPhoto: urls[firstPaths[i]] || null })));
    }
    if (req.method === "POST") {
      const { id, by, note } = req.body || {};
      if (!Number(id) || !String(by || "").trim() || !String(note || "").trim()) return res.status(400).json({ error: "id, by and note are required" });
      const r = await supabase("rpc/resolve_report", { method: "POST", body: { p_id: Number(id), p_by: String(by).trim(), p_note: String(note).trim() } });
      if (!r.ok) return res.status(502).json({ error: `Resolve failed ${r.status}: ${await r.text()}` });
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: "GET or POST" });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message });
  }
}
