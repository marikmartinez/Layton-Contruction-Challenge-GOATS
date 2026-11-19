/*
 * A worker's own reports.
 *   GET    /api/reports?reporter=NAME          → that worker's reports, newest first,
 *                                                each with photoUrls (signed links, valid 1 hour)
 *   PATCH  /api/reports?id=ID  { reporter, fields, transcript }  → edit
 *   DELETE /api/reports?id=ID&reporter=NAME    → delete
 * Edit and delete only work on the worker's own report while it is still "Submitted",
 * i.e. before the safety team has picked it up. Once it's being handled it is a record.
 * NOTE: there is no sign-in yet, so "own" means the reporter name the app sends.
 */
import { supabase, signPhotos, deletePhotos } from "./_supabase.js";

const EDITABLE = "Submitted";

export default async function handler(req, res) {
  const q = req.query || {};
  const reporter = String(q.reporter || req.body?.reporter || "");
  const id = Number(q.id);
  if (!reporter) return res.status(400).json({ error: "reporter is required" });
  const mine = `reporter=eq.${encodeURIComponent(reporter)}`;

  try {
    if (req.method === "GET") {
      const r = await supabase(`reports?${mine}&order=created_at.desc&select=id,created_at,form_id,status,fields,attachments,transcript`);
      if (!r.ok) return res.status(502).json({ error: `Supabase ${r.status}: ${await r.text()}` });
      const rows = await r.json();
      const urls = await signPhotos(rows.flatMap((row) => row.attachments?.photoPaths || []));
      return res.status(200).json(rows.map((row) => ({
        ...row,
        photoUrls: (row.attachments?.photoPaths || []).map((p) => urls[p]).filter(Boolean),
      })));
    }

    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "id is required" });
    // Only the reporter's own row, and only while it's still editable.
    const target = `reports?id=eq.${id}&${mine}&status=eq.${EDITABLE}`;

    if (req.method === "PATCH") {
      const { fields, transcript } = req.body || {};
      if (!fields || typeof fields !== "object" || Array.isArray(fields)) return res.status(400).json({ error: "fields are required" });
      const body = { fields };
      if (typeof transcript === "string") body.transcript = transcript.slice(0, 5000);
      const r = await supabase(target, { method: "PATCH", body, prefer: "return=representation" });
      if (!r.ok) return res.status(502).json({ error: `Supabase ${r.status}: ${await r.text()}` });
      const rows = await r.json();
      if (!rows.length) return res.status(409).json({ error: "This report can't be changed anymore." });
      return res.status(200).json({ id: rows[0].id, status: rows[0].status });
    }

    if (req.method === "DELETE") {
      const r = await supabase(target, { method: "DELETE", prefer: "return=representation" });
      if (!r.ok) return res.status(502).json({ error: `Supabase ${r.status}: ${await r.text()}` });
      const [gone] = await r.json();
      if (!gone) return res.status(409).json({ error: "This report can't be deleted anymore." });
      await deletePhotos(gone.attachments?.photoPaths || []); // the photos go with the report
      return res.status(200).json({ deleted: id });
    }

    return res.status(405).json({ error: "GET, PATCH or DELETE" });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message });
  }
}
