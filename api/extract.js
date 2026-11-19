/*
 * POST /api/extract — fill a form draft from a worker's description.
 * Body: { text, fields: [{ name, label, type, options? }], today: "YYYY-MM-DD" }
 * Returns { FIELD_NAME: value } (the browser re-checks values against options).
 * The OpenAI key stays on the server (OPENAI_API_KEY env var).
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { text, fields, today, form } = req.body || {};
  if (!text?.trim() || !Array.isArray(fields)) return res.status(400).json({ error: "text and fields are required" });

  const fieldList = fields.map((f) => {
    let rule;
    if (f.options) {
      rule = "one of these values (copy the value exactly):\n" + f.options.map((v, i) =>
        `    "${v}"${f.optionLabels && f.optionLabels[i] !== v ? ` = ${f.optionLabels[i]}` : ""}`).join("\n");
    } else if (f.type === "date") rule = "date as YYYY-MM-DD";
    else if (f.type === "number") rule = "number";
    else if (f.type === "textarea") rule = "clear English write-up of everything the worker said that fits this field";
    else rule = "short English text";
    return `- ${f.name} (${f.label})${f.hint ? ` [${f.hint}]` : ""}: ${rule}`;
  }).join("\n");

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You fill in a construction safety form${form?.title ? ` ("${form.title}": ${form.blurb})` : ""} from a worker's description. The description may be in any language and may be casual or have typos.
Read the whole description carefully before filling anything.

Return one JSON object with exactly these keys:
${fieldList}

Rules:
- For fields with values, return one value copied exactly. Never invent one.
- Match by meaning, not exact words. A worker may name a job by number ("job 1", "001") or by project name ("copper civic"); use the words after "=" to match. If two values fit equally well, use null (e.g. "canyon commercial" with no number matches JOB-001 and JOB-008, so JOB_ID is null).
- Pick a value when the details clearly point to it, even if the worker doesn't use the form's words (e.g. "tripped over rebar on the floor" -> Same-Level Slip / Trip; "only needed a bandage" -> First Aid). If it would be a guess, use null.
- Today is ${today}. Turn relative dates ("this morning", "yesterday", "last Friday") into dates.
- Text fields: write in English, keep every concrete detail the worker gave (what, where, equipment, who, what was done). Fix typos. Don't add facts that weren't said, don't add a job name or number the worker didn't say, and don't comment on what's missing.`,
        },
        { role: "user", content: text },
      ],
    }),
  });
  if (!r.ok) return res.status(502).json({ error: `OpenAI ${r.status}: ${await r.text()}` });

  const data = await r.json();
  try {
    return res.status(200).json(JSON.parse(data.choices[0].message.content));
  } catch {
    return res.status(502).json({ error: "AI reply wasn't valid JSON" });
  }
}
