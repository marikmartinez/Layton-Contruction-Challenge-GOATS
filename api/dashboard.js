/*
 * GET /api/dashboard?token=DASHBOARD_TOKEN  — every report, with photo links, for the leadership dashboard.
 *   &form=issue            only one form (good-catch | issue | incident | daily-journal)
 *   &format=csv            CSV instead of JSON (for Excel / Power BI / Tableau)
 * Photo links are signed and work for 24 hours, so refresh the data at least daily.
 * Read-only. Protected by DASHBOARD_TOKEN (set it in .env and give it only to the dashboard).
 */
import { supabase, signPhotos } from "./_supabase.js";

const FORM_IDS = ["good-catch", "issue", "incident", "daily-journal"];
const COLUMNS = ["id", "created_at", "form_id", "reporter", "status", "job_id", "report_date", "hazard_category",
  "severity", "observed_condition", "new_condition", "photo_count", "photo_urls", "transcript", "fields"];

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });
  const q = req.query || {};
  const expected = process.env.DASHBOARD_TOKEN;
  if (!expected) return res.status(503).json({ error: "DASHBOARD_TOKEN isn't set." });
  if ((q.token || req.headers["x-dashboard-token"]) !== expected) return res.status(401).json({ error: "Wrong or missing token." });

  const filter = FORM_IDS.includes(q.form) ? `&form_id=eq.${q.form}` : "";
  try {
    const r = await supabase(`reports?order=created_at.desc&limit=5000${filter}&select=id,created_at,form_id,reporter,status,job_id,report_date,hazard_category,severity,observed_condition,new_condition,transcript,fields,attachments`);
    if (!r.ok) return res.status(502).json({ error: `Supabase ${r.status}: ${await r.text()}` });
    const rows = await r.json();
    const urls = await signPhotos(rows.flatMap((row) => row.attachments?.photoPaths || []), 60 * 60 * 24);
    const out = rows.map(({ attachments, ...row }) => {
      const photoUrls = (attachments?.photoPaths || []).map((p) => urls[p]).filter(Boolean);
      return { ...row, photo_count: photoUrls.length, photo_urls: photoUrls };
    });

    if (q.format === "csv") {
      const cell = (v) => {
        const s = v == null ? "" : Array.isArray(v) ? v.join(" | ") : typeof v === "object" ? JSON.stringify(v) : String(v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      return res.status(200).end([COLUMNS.join(","), ...out.map((row) => COLUMNS.map((c) => cell(row[c])).join(","))].join("\n"));
    }
    return res.status(200).json(out);
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message });
  }
}
