/*
 * POST /api/submit — save a finished report to Supabase (table `reports`, see db/schema.sql).
 * Body: { formId, fields, attachments, transcript, reporter, photos: [base64 JPEG, ...] }
 * Photos go to the private "report-photos" bucket; their paths are kept in attachments.photoPaths.
 * Voice recordings are not stored, only the transcript.
 * Returns { id, status, createdAt, photosSaved }. The Supabase key stays on the server.
 */
import { randomUUID } from "node:crypto";
import { supabase, uploadPhoto } from "./_supabase.js";

const FORM_IDS = ["good-catch", "issue", "incident", "daily-journal"];
const MAX_PHOTOS = 5;            // the app shrinks photos first, so 5 fit in one request
const MAX_PHOTO_CHARS = 1_500_000; // ~1.1 MB per photo after base64

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { formId, fields, attachments = {}, transcript = "", reporter = "", photos = [] } = req.body || {};
  if (!FORM_IDS.includes(formId) || !fields || typeof fields !== "object" || Array.isArray(fields)) {
    return res.status(400).json({ error: "formId and fields are required" });
  }
  try {
    // Upload photos first, so the report row can point at them.
    const folder = randomUUID();
    const photoPaths = [];
    for (const [i, photo] of (Array.isArray(photos) ? photos : []).slice(0, MAX_PHOTOS).entries()) {
      if (typeof photo !== "string" || photo.length > MAX_PHOTO_CHARS) continue;
      const path = `${folder}/${i + 1}.jpg`;
      const up = await uploadPhoto(path, Buffer.from(photo, "base64"));
      if (up.ok) photoPaths.push(path);
      else console.error("[submit] photo upload failed", up.status, await up.text());
    }

    const r = await supabase("reports", {
      method: "POST",
      prefer: "return=representation",
      body: {
        form_id: formId,
        fields,
        attachments: { ...attachments, photoPaths },
        transcript: String(transcript).slice(0, 5000),
        reporter: String(reporter).slice(0, 100),
        // A daily journal is just a record; everything else waits for the safety team.
        status: formId === "daily-journal" ? "Filed" : "Submitted",
      },
    });
    if (!r.ok) return res.status(502).json({ error: `Supabase ${r.status}: ${await r.text()}` });
    const [row] = await r.json();
    return res.status(200).json({ id: row.id, status: row.status, createdAt: row.created_at, photosSaved: photoPaths.length });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message });
  }
}
