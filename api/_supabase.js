// Shared Supabase helpers for the /api functions (files starting with _ aren't routes).
// The secret key never leaves the server.

function request(path, { method = "GET", json, raw, contentType, prefer } = {}) {
  const { SUPABASE_URL, SUPABASE_SECRET_KEY: key } = process.env;
  if (!SUPABASE_URL || !key) throw Object.assign(new Error("Database isn't set up (SUPABASE_URL / SUPABASE_SECRET_KEY)."), { status: 503 });
  // New keys (sb_secret_...) go in `apikey` only; legacy service_role JWTs (eyJ...) also need Authorization.
  const headers = { apikey: key };
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`;
  if (json !== undefined) headers["Content-Type"] = "application/json";
  if (contentType) headers["Content-Type"] = contentType;
  if (prefer) headers.Prefer = prefer;
  const body = json !== undefined ? JSON.stringify(json) : raw;
  return fetch(`${SUPABASE_URL.replace(/\/$/, "")}/${path}`, { method, headers, body });
}

/** Database table API: supabase("reports?id=eq.1", { method, body, prefer }) */
export function supabase(path, { method, body, prefer } = {}) {
  return request(`rest/v1/${path}`, { method, json: body, prefer });
}

// Report photos live in a private Storage bucket (see db/photos.sql).
export const PHOTO_BUCKET = "report-photos";

export function uploadPhoto(path, bytes) {
  return request(`storage/v1/object/${PHOTO_BUCKET}/${path}`, { method: "POST", raw: bytes, contentType: "image/jpeg" });
}

/** Short-lived links so the app can show private photos. Returns { path: url }. */
export async function signPhotos(paths, expiresIn = 3600) {
  if (!paths.length) return {};
  const r = await request(`storage/v1/object/sign/${PHOTO_BUCKET}`, { method: "POST", json: { expiresIn, paths } });
  if (!r.ok) return {};
  const base = process.env.SUPABASE_URL.replace(/\/$/, "");
  return Object.fromEntries((await r.json()).filter((s) => s.signedURL).map((s) => [s.path, `${base}/storage/v1${s.signedURL}`]));
}

export function deletePhotos(paths) {
  if (!paths.length) return Promise.resolve();
  return request(`storage/v1/object/${PHOTO_BUCKET}`, { method: "DELETE", json: { prefixes: paths } });
}
