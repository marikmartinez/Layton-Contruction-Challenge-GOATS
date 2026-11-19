/*
 * POST /api/transcribe — turn a voice clip into text (any language).
 * Body: { audio: base64, mimeType: "audio/webm" }
 * Returns { text }. The OpenAI key stays on the server (OPENAI_API_KEY).
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { audio, mimeType = "audio/webm" } = req.body || {};
  if (!audio) return res.status(400).json({ error: "audio is required" });

  // OpenAI uses the file name to tell the format, so give it a matching extension.
  const ext = mimeType.includes("mp4") ? "mp4" : mimeType.includes("ogg") ? "ogg" : mimeType.includes("wav") ? "wav" : "webm";
  const form = new FormData();
  form.append("file", new Blob([Buffer.from(audio, "base64")], { type: mimeType }), `clip.${ext}`);
  form.append("model", process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-transcribe");
  // No language set on purpose: the model detects it, so workers can speak any language.

  const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: form,
  });
  if (!r.ok) return res.status(502).json({ error: `OpenAI ${r.status}: ${await r.text()}` });
  const data = await r.json();
  return res.status(200).json({ text: data.text || "" });
}
