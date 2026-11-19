/*
 * AI form filling: sends the worker's text to /api/extract and keeps only
 * values that fit the form (listed options, valid dates and numbers).
 * Computed fields (e.g. total hours) are left to the app.
 */

/* eslint-disable no-unused-vars */

function extractableFields(form) {
  return form.fields
    .filter((f) => f.type !== "computed")
    .map((f) => {
      const opts = f.type === "job" ? JOBS.map((j) => ({ value: j.id, label: `${j.name} (${j.status})` }))
        : f.type === "yesno" ? [{ value: "Y", label: "Yes" }, { value: "N", label: "No" }]
        : f.options ? optionObjects(f.options) : null;
      return {
        name: f.name,
        label: f.label,
        type: f.type,
        hint: [f.hint, f.placeholder].filter(Boolean).join(" ") || undefined,
        options: opts?.map((o) => o.value),
        // Extra words that help the AI match what a worker says (project names, long labels).
        optionLabels: opts?.some((o) => o.label !== o.value) ? opts.map((o) => o.label) : undefined,
      };
    });
}

function optionObjects(options) {
  return options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
}

function cleanExtracted(fields, raw, text = "") {
  const out = {};
  for (const { optionLabels, hint, ...f } of fields) {
    const v = raw?.[f.name];
    if (v == null || v === "") continue;
    const s = String(v).trim();
    if (f.options && !f.options.includes(s)) continue;
    if (f.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(s)) continue;
    if (f.type === "number" && Number.isNaN(Number(s))) continue;
    out[f.name] = s;
  }
  if (out.JOB_ID && jobIsAmbiguous(out.JOB_ID, text)) delete out.JOB_ID;
  return out;
}

// "canyon commercial" matches JOB-001 and JOB-008. Keep the AI's pick only if
// the worker said the job number or named a project that only one job has.
function jobIsAmbiguous(jobId, text) {
  const num = Number(jobId.slice(4));
  if (new RegExp(`(^|\\D)0*${num}(\\D|$)`).test(text)) return false;
  const job = JOBS.find((j) => j.id === jobId);
  const base = job.name.replace(/\s*Project\s*\d+$/i, "").toLowerCase();
  return JOBS.filter((j) => j.name.toLowerCase().startsWith(base)).length > 1;
}

async function extractFields(form, text) {
  const fields = extractableFields(form);
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const res = await fetch("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, fields, today, form: { title: form.title, blurb: form.blurb } }),
  });
  if (!res.ok) throw new Error(await res.text());
  return cleanExtracted(fields, await res.json(), text);
}
