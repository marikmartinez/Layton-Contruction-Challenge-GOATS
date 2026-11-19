/*
 * Layton safety form filler — front end only.
 *
 * Voice and photo modes are UI-only: recording is simulated (no microphone
 * access) and photos are previewed locally. The hooks where real processing
 * would plug in are marked "INTEGRATION POINT".
 *
 * All display text goes through t() from i18n.js. Data stays in English
 * (dataset values are stored as-is); only what's shown is translated.
 */
(() => {
  "use strict";

  const app = document.getElementById("app");
  const backBtn = document.getElementById("backBtn");
  const topTitle = document.getElementById("topTitle");
  const toastEl = document.getElementById("toast");

  const MODES = [
    { id: "voice", label: "Talk or type", icon: "mic" },
    { id: "photo", label: "Photo", icon: "camera" },
    { id: "manual", label: "Manual", icon: "pencil" },
  ];

  const ICONS = {
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    alert: '<path d="M12 3l10 18H2L12 3z"/><path d="M12 10v5M12 18h.01"/>',
    cross: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
    clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
    stop: '<rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
    pencil: '<path d="M4 20l1-5L16 4l4 4L9 19z"/><path d="M14 6l4 4"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>',
    heart: '<path d="M12 20s-8-4.6-8-10.5A4.5 4.5 0 0112 7a4.5 4.5 0 018 2.5C20 15.4 12 20 12 20z"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
    sparkle: '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`;

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  /** YYYY-MM-DD in local time (toISOString alone would give the UTC date). */
  const localISO = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const todayISO = () => localISO(new Date());

  const fmtDuration = (ms) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
  };

  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2800);
  }

  /* ---------------- Session state ---------------- */

  let session = null; // active form session, null on the picker

  function newSession(form) {
    const values = {};
    const lastJob = store.get("lastJob");
    for (const f of form.fields) {
      if (f.type === "job") values[f.name] = JOBS.some((j) => j.id === lastJob) ? lastJob : "";
      else if (f.defaultToday) values[f.name] = todayISO();
      else values[f.name] = f.defaultValue ?? "";
    }
    return {
      form,
      values,
      errors: {},
      modes: new Set(["manual"]),
      fieldsExpanded: true,
      dirty: false,
      submitted: false,
      voice: { recording: false, startedAt: 0, timer: null, clips: [], transcript: "" },
      photos: [],
      record: null,
    };
  }

  function endSession() {
    if (!session) return;
    clearInterval(session.voice.timer);
    session.voice.stream?.getTracks().forEach((tr) => tr.stop());
    session.photos.forEach((p) => URL.revokeObjectURL(p.url));
    session = null;
  }

  const isVisible = (f, v) => !f.showIf || f.showIf(v);

  /* ---------------- Routing ---------------- */

  let suppressHashChange = false;
  let currentHash = location.hash;

  function route() {
    closeDrawer(false);
    const m = location.hash.match(/^#\/form\/([\w-]+)/);
    const form = m && FORMS.find((f) => f.id === m[1]);
    if (location.hash === "#/resources") {
      endSession();
      renderResources();
    } else if (location.hash === "#/profile") {
      endSession();
      profileState.filter = "all";
      profileState.expanded.clear();
      profileState.reports = null;
      renderProfile();
      loadMyReports();
    } else if (form) {
      const editId = Number((location.hash.match(/[?&]edit=(\d+)/) || [])[1]);
      if (editId) {
        // Opened from "Edit" in My reports. After a reload there's nothing to edit, so go back.
        if (!pendingEdit || pendingEdit.id !== editId) { location.hash = "#/profile"; return; }
        endSession();
        session = newSession(form);
        session.editId = editId;
        Object.assign(session.values, pendingEdit.fields);
        session.voice.transcript = pendingEdit.transcript || "";
        pendingEdit = null;
      } else if (!session || session.form !== form || session.submitted || session.editId) {
        endSession();
        session = newSession(form);
      }
      renderForm();
    } else {
      endSession();
      renderPicker();
    }
    currentHash = location.hash;
    markCurrentLink();
    toastEl.classList.remove("show");
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }

  window.addEventListener("hashchange", () => {
    if (suppressHashChange) { suppressHashChange = false; return; }
    if (session && session.dirty && !session.submitted) {
      if (!confirm(t("Leave this form? What you've entered will be lost."))) {
        suppressHashChange = true;
        location.hash = currentHash;
        return;
      }
    }
    route();
  });

  window.addEventListener("beforeunload", (e) => {
    if (session && session.dirty && !session.submitted) { e.preventDefault(); e.returnValue = ""; }
  });

  backBtn.addEventListener("click", () => { location.hash = "#/"; });

  /* ---------------- Menu drawer ---------------- */

  const menuBtn = document.getElementById("menuBtn");
  const drawer = document.getElementById("drawer");
  const scrim = document.getElementById("scrim");
  const drawerLinks = document.getElementById("drawerLinks");

  function markCurrentLink() {
    drawerLinks.querySelectorAll("a").forEach((a) => {
      const here = a.getAttribute("href") === (location.hash || "#/");
      if (here) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }

  /** Text that lives outside #app: top bar, menu and crisis link. */
  function renderChrome() {
    document.documentElement.lang = langTag();
    backBtn.setAttribute("aria-label", t("Back to forms"));
    menuBtn.setAttribute("aria-label", t("Open menu"));
    drawer.setAttribute("aria-label", t("Main menu"));
    document.getElementById("drawerClose").setAttribute("aria-label", t("Close menu"));
    document.getElementById("drawerBrand").textContent = t("Layton Safety");
    document.getElementById("langLabel").textContent = t("Language");
    document.getElementById("topLangSelect").setAttribute("aria-label", t("Language"));
    document.getElementById("crisisTitle").textContent = t("Need to talk now?");
    document.getElementById("crisisText").textContent = t("Call or text 988, free and confidential, 24/7");
    drawerLinks.innerHTML = `
      <li><a href="#/">${icon("grid")} ${esc(t("All forms"))}</a></li>
      <li><a href="#/profile">${icon("user")} ${esc(t("My profile & reports"))}</a></li>
      <li class="group" aria-hidden="true">${esc(t("Report"))}</li>
      ${FORMS.map((f) => `<li><a href="#/form/${f.id}">${icon(f.icon)} ${esc(t(f.title))}</a></li>`).join("")}
      <li class="group" aria-hidden="true">${esc(t("Support"))}</li>
      <li><a href="#/resources">${icon("heart")} ${esc(t("Mental health & substance use"))}</a></li>`;
    markCurrentLink();
  }

  function openDrawer() {
    drawer.classList.add("open");
    drawer.removeAttribute("inert");
    drawer.setAttribute("aria-hidden", "false");
    scrim.hidden = false;
    menuBtn.setAttribute("aria-expanded", "true");
    document.getElementById("drawerClose").focus();
  }

  function closeDrawer(returnFocus = true) {
    if (!drawer.classList.contains("open")) return;
    drawer.classList.remove("open");
    drawer.setAttribute("inert", "");
    drawer.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
    if (returnFocus) menuBtn.focus();
  }

  /* ---------------- Language ---------------- */

  // Translations live in i18n.js; t() falls back to English for anything missing.
  // Two pickers, one in the top bar and one in the menu, kept in sync.
  const langSelects = [document.getElementById("topLangSelect"), document.getElementById("langSelect")];
  const topLangCode = document.getElementById("topLangCode");
  function syncLangPickers() {
    langSelects.forEach((sel) => { sel.value = currentLang; });
    topLangCode.textContent = currentLang.toUpperCase();
  }
  langSelects.forEach((sel) => {
    sel.innerHTML = LANGUAGES
      .map((l) => `<option value="${l.code}" lang="${l.htmlLang}">${esc(l.label)}</option>`).join("");
    sel.addEventListener("change", () => {
      setLang(sel.value);
      syncLangPickers();
      renderChrome();
      renderCurrent();
      toast(t("Language set to {lang}.", { lang: LANGUAGES.find((l) => l.code === currentLang).label }));
    });
  });
  syncLangPickers();

  /** Redraw the current screen in place, keeping whatever the user has entered. */
  function renderCurrent() {
    if (session) {
      if (session.submitted) renderDone(session.record); else renderForm();
    } else if (location.hash === "#/resources") renderResources();
    else if (location.hash === "#/profile") renderProfile();
    else renderPicker();
  }

  menuBtn.addEventListener("click", openDrawer);
  scrim.addEventListener("click", () => closeDrawer());
  document.getElementById("drawerClose").addEventListener("click", () => closeDrawer());
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });
  // Clicking the link for the page you're already on doesn't fire hashchange.
  drawerLinks.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a && a.getAttribute("href") === (location.hash || "#/")) { e.preventDefault(); closeDrawer(); }
  });

  /* ---------------- Profile & my reports ---------------- */

  // Reports that couldn't be sent (offline) stay in this browser. Sent ones live in the database.
  function loadLocalReports() {
    try { return JSON.parse(store.get("myReports") || "[]"); } catch { return []; }
  }
  function saveLocalReport(r) {
    store.set("myReports", JSON.stringify([r, ...loadLocalReports()].slice(0, 200)));
  }
  function removeLocalReport(localId) {
    store.set("myReports", JSON.stringify(loadLocalReports().filter((r) => r.localId !== localId)));
  }

  const profileState = { filter: "all", expanded: new Set(), reports: null, error: false };
  let pendingEdit = null; // the report opened with "Edit", picked up by route()

  // How a status is shown (pill colour) and counted (Resolved / Open).
  const RESOLVED = ["Closed", "Completed", "Review complete", "No follow-up needed", "Resolved"];
  const kindOf = (status) => (status === "Filed" ? "filed" : RESOLVED.includes(status) ? "resolved" : "update");

  /** Load this worker's reports from the database (api/reports.js). Only their own. */
  async function loadMyReports() {
    try {
      const res = await fetch(`/api/reports?reporter=${encodeURIComponent(SAMPLE_PROFILE.name)}`);
      if (!res.ok) throw new Error(await res.text());
      profileState.reports = (await res.json()).map((r) => ({
        key: `db-${r.id}`, id: r.id, recordId: `#${r.id}`, formId: r.form_id, at: new Date(r.created_at),
        status: r.status, kind: kindOf(r.status), editable: r.status === "Submitted",
        fields: r.fields, attachments: r.attachments, transcript: r.transcript, photoUrls: r.photoUrls || [],
      }));
      profileState.error = false;
    } catch (e) {
      console.error("[form-filler] loading reports failed", e);
      profileState.reports = [];
      profileState.error = true;
    }
    if (location.hash === "#/profile") renderProfile();
  }

  /** Database reports + unsent ones on this device, newest first. */
  function allReports() {
    const local = loadLocalReports().filter((r) => !r.recordId).map((r) => ({
      key: r.localId, localId: r.localId, recordId: t("Not sent"), formId: r.formId, at: new Date(r.at),
      status: "Saved on device", kind: "local", fields: r.fields, attachments: r.attachments,
    }));
    return [...local, ...(profileState.reports || [])]
      .filter((r) => FORMS.some((f) => f.id === r.formId))
      .sort((a, b) => b.at - a.at);
  }

  function reportSummary(form, fields) {
    if (form.summarize) return form.summarize(fields);
    const text = form.fields.find((f) => f.type === "textarea" && fields[f.name]);
    return text ? fields[text.name] : "";
  }

  function renderProfile() {
    backBtn.hidden = false;
    topTitle.textContent = t("My profile");
    document.title = `${t("My profile")} · ${t("Layton Safety Forms")}`;

    const p = SAMPLE_PROFILE;
    const homeJob = JOBS.find((j) => j.id === p.homeJob);
    const initials = p.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    const since = new Date(`${p.memberSince}-01T00:00:00`).toLocaleDateString(langTag(), { month: "long", year: "numeric" });

    const reports = allReports();
    const stats = [
      { label: "Reports submitted", value: reports.length },
      { label: "Good Catches", value: reports.filter((r) => r.formId === "good-catch").length },
      { label: "Resolved", value: reports.filter((r) => r.kind === "resolved").length },
      { label: "Open", value: reports.filter((r) => r.kind === "update").length },
    ];

    const filters = [{ id: "all", label: "All" }, ...FORMS.map((f) => ({ id: f.id, label: f.title }))]
      .map((f) => ({ ...f, count: f.id === "all" ? reports.length : reports.filter((r) => r.formId === f.id).length }));
    const shown = reports.filter((r) => profileState.filter === "all" || r.formId === profileState.filter);

    const item = (r) => {
      const form = FORMS.find((f) => f.id === r.formId);
      const job = JOBS.find((j) => j.id === r.fields.JOB_ID);
      const open = profileState.expanded.has(r.key);
      const rows = form.fields
        .filter((f) => r.fields[f.name] !== undefined && r.fields[f.name] !== "")
        .map((f) => `<tr><th scope="row">${esc(t(f.label))}</th><td>${esc(displayValue(f, r.fields[f.name]))}</td></tr>`).join("");
      const att = r.attachments && attachmentList(r.attachments.photos, r.attachments.voiceClips, r.attachments.description);
      return `
        <li class="notif report" data-accent="${form.accent}">
          <button type="button" class="notif-main" data-report="${esc(r.key)}" aria-expanded="${open}" aria-controls="rd-${esc(r.key)}">
            <span class="form-icon">${icon(form.icon)}</span>
            <span class="notif-body">
              <span class="notif-title">${esc(t(form.title))}</span>
              <span class="report-summary">${esc(reportSummary(form, r.fields))}</span>
              <span class="notif-row">
                <span class="pill ${r.kind}">${esc(t(r.status))}</span>
                <span>${esc(r.recordId)}</span>
                <time datetime="${r.at.toISOString()}">${r.at.toLocaleDateString(langTag(), { month: "short", day: "numeric" })}</time>
              </span>
            </span>
            <span class="report-chevron" aria-hidden="true">${icon("chevron")}</span>
          </button>
          <div class="notif-detail report-detail" id="rd-${esc(r.key)}" ${open ? "" : "hidden"}>
            <table class="summary"><tbody>
              ${rows}
              ${att ? `<tr><th scope="row">${esc(t("Attachments"))}</th><td>${esc(att)}</td></tr>` : ""}
            </tbody></table>
            ${r.photoUrls?.length ? `
              <div class="thumbs">
                ${r.photoUrls.map((u, i) => `
                  <a class="thumb" href="${esc(u)}" target="_blank" rel="noopener">
                    <img src="${esc(u)}" alt="${esc(t("Photo {n}", { n: i + 1 }))}" loading="lazy">
                  </a>`).join("")}
              </div>` : ""}
            ${r.kind === "local" ? `
              <div class="report-actions">
                <p class="muted">${esc(t("Saved on this device only. It couldn't be sent."))}</p>
                <button type="button" class="btn btn-sm" data-remove-report="${esc(r.localId)}">${icon("trash")} ${esc(t("Remove"))}</button>
              </div>` : r.editable ? `
              <div class="report-actions">
                <p class="muted">${esc(t("You can change or delete this until the safety team picks it up."))}</p>
                <button type="button" class="btn btn-sm" data-edit-report="${r.id}">${icon("pencil")} ${esc(t("Edit"))}</button>
                <button type="button" class="btn btn-sm" data-delete-report="${r.id}">${icon("trash")} ${esc(t("Delete"))}</button>
              </div>` : `
              <p class="muted report-lock">${esc(t("Locked: the safety team has picked this up."))}</p>`}
          </div>
        </li>`;
    };

    app.innerHTML = `
      <section class="panel profile-card">
        <div class="avatar" aria-hidden="true">${esc(initials)}</div>
        <div class="profile-info">
          <h1>${esc(p.name)}</h1>
          <p>${esc(t(p.role))} · ${esc(p.company)}</p>
          <p class="muted">${homeJob ? `${esc(homeJob.name)} · ` : ""}${esc(t("Reporting since {date}", { date: since }))}</p>
        </div>
        <span class="badge profile-badge">${esc(t("Sample profile"))}</span>
      </section>

      <dl class="stats">
        ${stats.map((s) => `<div class="stat"><dt>${esc(t(s.label))}</dt><dd>${s.value}</dd></div>`).join("")}
      </dl>

      <h2 class="profile-h2">${esc(t("My reports"))}</h2>
      <div class="chips" role="group" aria-label="${esc(t("Filter reports by form"))}">
        ${filters.map((f) => `<button type="button" class="chip" data-rfilter="${f.id}" aria-pressed="${f.id === profileState.filter}">${esc(t(f.label))} <span class="muted chip-num">${f.count}</span></button>`).join("")}
      </div>

      ${profileState.error ? `<p class="muted">${esc(t("Couldn't load your reports from the server."))}</p>` : ""}
      ${profileState.reports === null ? `<p class="muted">${esc(t("Loading your reports…"))}</p>`
        : shown.length ? `<ul class="notif-list">${shown.map(item).join("")}</ul>` : `
        <div class="empty">
          <span class="form-icon" data-accent="blue">${icon("clipboard")}</span>
          <h2>${esc(t("No reports yet"))}</h2>
          <p class="muted">${esc(t("Reports you submit will show up here with their status."))}</p>
          <a class="btn btn-primary" href="#/">${esc(t("Start a report"))}</a>
        </div>`}`;

    app.querySelectorAll("[data-rfilter]").forEach((b) => b.addEventListener("click", () => {
      profileState.filter = b.dataset.rfilter;
      renderProfile();
    }));
    app.querySelectorAll("[data-report]").forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.report;
      if (profileState.expanded.has(k)) profileState.expanded.delete(k); else profileState.expanded.add(k);
      renderProfile();
      app.querySelector(`[data-report="${CSS.escape(k)}"]`)?.focus();
    }));
    app.querySelectorAll("[data-edit-report]").forEach((b) => b.addEventListener("click", () => {
      pendingEdit = profileState.reports.find((r) => r.id === Number(b.dataset.editReport));
      location.hash = `#/form/${pendingEdit.formId}?edit=${pendingEdit.id}`;
    }));
    app.querySelectorAll("[data-delete-report]").forEach((b) => b.addEventListener("click", async () => {
      if (!confirm(t("Delete this report? This can't be undone."))) return;
      b.disabled = true;
      const res = await fetch(`/api/reports?id=${b.dataset.deleteReport}&reporter=${encodeURIComponent(SAMPLE_PROFILE.name)}`, { method: "DELETE" })
        .catch(() => null);
      toast(t(res?.ok ? "Report deleted." : "Couldn't delete it. The safety team may have already picked it up."));
      loadMyReports();
    }));
    app.querySelectorAll("[data-remove-report]").forEach((b) => b.addEventListener("click", () => {
      if (!confirm(t("Remove this report from this device?"))) return;
      removeLocalReport(b.dataset.removeReport);
      renderProfile();
      toast(t("Report removed."));
    }));
  }

  /* ---------------- Resources ---------------- */

  function renderResources() {
    backBtn.hidden = false;
    topTitle.textContent = t("Support");
    document.title = `${t("Mental health & substance use")} · ${t("Layton Safety Forms")}`;

    const actionIcon = { call: "phone", text: "chat", web: "globe" };
    const actionBtn = (a, primary) => {
      const external = a.kind === "web" ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a class="btn btn-sm ${primary ? "btn-primary" : ""}" href="${esc(a.href)}"${external}>${icon(actionIcon[a.kind])} ${esc(t(a.label))}</a>`;
    };
    const card = (item) => `
      <article class="panel res-card">
        <h3>${esc(item.name)}</h3>
        <p>${esc(t(item.desc))}</p>
        ${item.tags ? `<div class="tags">${item.tags.map((tag) => `<span class="badge">${esc(t(tag))}</span>`).join("")}</div>` : ""}
        <div class="res-actions">${item.actions.map((a, i) => actionBtn(a, i === 0 && a.kind !== "web")).join("")}</div>
      </article>`;

    const eapActions = [
      EAP.phone && { kind: "call", label: t("Call {phone}", { phone: EAP.phone }), href: `tel:${EAP.phone.replace(/[^\d+]/g, "")}` },
      EAP.url && { kind: "web", label: "Website", href: EAP.url },
    ].filter(Boolean);
    const eapCard = `
      <article class="panel res-card">
        <h3>${esc(EAP.name || t("Employee Assistance Program (EAP)"))}</h3>
        <p>${esc(t("Free, confidential counseling for you and your household, usually including help with stress, grief, money, and alcohol or drug use. EAP services are confidential."))}</p>
        ${eapActions.length
          ? `<div class="res-actions">${eapActions.map((a, i) => actionBtn(a, i === 0 && a.kind === "call")).join("")}</div>`
          : `<p class="res-foot">${esc(t("Ask HR or your superintendent for the EAP phone number."))}</p>`}
      </article>`;

    app.innerHTML = `
      <section class="intro">
        <h1>${esc(t("Mental health & substance use"))}</h1>
        <p>${esc(t("Looking after your head is part of working safe. These services are free and confidential, for you or a coworker."))}</p>
      </section>

      <div class="res-alert" role="note">
        ${icon("alert")}
        <p>${esc(t("If someone is in immediate danger, call 911. Don't leave them alone.")).replace("911", '<a href="tel:911">911</a>')}</p>
      </div>

      ${RESOURCE_SECTIONS.map((s, i) => `
        <section class="res-section" aria-labelledby="res-${s.id}">
          <h2 id="res-${s.id}">${esc(t(s.title))}</h2>
          <p class="intro-text">${esc(t(s.intro))}</p>
          ${s.items.map(card).join("")}
          ${i === 0 ? eapCard : ""}
        </section>`).join("")}

      <section class="res-section" aria-labelledby="res-signs">
        <h2 id="res-signs">${esc(t("Signs a coworker may be struggling"))}</h2>
        <div class="panel"><ul class="res-list">${WARNING_SIGNS.map((s) => `<li>${esc(t(s))}</li>`).join("")}</ul></div>
      </section>

      <section class="res-section" aria-labelledby="res-help">
        <h2 id="res-help">${esc(t("How to help"))}</h2>
        <div class="panel"><ol class="steps">
          ${HOW_TO_HELP.map((s) => `<li><div><strong>${esc(t(s.title))}</strong><span>${esc(t(s.text))}</span></div></li>`).join("")}
        </ol></div>
        <p class="res-foot">${esc(t("Nothing on this page is tracked or reported. Links to outside services open in a new tab."))}</p>
      </section>`;
  }

  /* ---------------- Picker ---------------- */

  function renderPicker() {
    backBtn.hidden = true;
    topTitle.textContent = t("Safety Forms");
    document.title = t("Layton Safety Forms");
    app.innerHTML = `
      <section class="intro">
        <h1>${esc(t("What are you reporting?"))}</h1>
        <p>${esc(t("Pick a form. You can fill it in by voice, photo, typing, or any mix."))}</p>
      </section>
      <div class="form-grid">
        ${FORMS.map((f) => `
          <button class="form-card" type="button" data-accent="${f.accent}" data-form="${f.id}">
            <span class="form-icon">${icon(f.icon)}</span>
            <span><h2>${esc(t(f.title))}</h2><p>${esc(t(f.blurb))}</p></span>
          </button>`).join("")}
      </div>`;
    app.querySelectorAll("[data-form]").forEach((b) =>
      b.addEventListener("click", () => { location.hash = `#/form/${b.dataset.form}`; }));
  }

  /* ---------------- Form screen ---------------- */

  function renderForm() {
    const { form } = session;
    backBtn.hidden = false;
    topTitle.textContent = t(form.title);
    document.title = `${t(form.title)} · ${t("Layton Safety Forms")}`;

    app.innerHTML = `
      <section class="form-head" data-accent="${form.accent}">
        <span class="form-icon">${icon(form.icon)}</span>
        <div><h1>${esc(t(form.title))}</h1><p>${esc(t(form.blurb))}</p></div>
      </section>

      <p class="section-label" id="modeLabel">${esc(t("How do you want to fill it in?"))}</p>
      <div class="mode-bar" role="group" aria-labelledby="modeLabel">
        ${MODES.map((m) => `
          <button type="button" class="mode-btn" data-mode="${m.id}" aria-pressed="${session.modes.has(m.id)}">
            <span class="check">${icon("check")}</span>
            ${icon(m.icon)}<span>${esc(t(m.label))}</span>
          </button>`).join("")}
      </div>

      <div id="voicePanel"></div>
      <div id="photoPanel"></div>
      <div id="fieldsPanel"></div>

      <div class="submit-bar">
        <div class="inner">
          <span class="status" id="submitStatus"></span>
          <button type="button" class="btn btn-primary" id="submitBtn">${esc(t(session.editId ? "Save changes" : "Review & submit"))}</button>
        </div>
      </div>`;

    app.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => toggleMode(b.dataset.mode)));
    app.querySelector("#submitBtn").addEventListener("click", submit);

    renderVoicePanel();
    renderPhotoPanel();
    renderFieldsPanel();
    updateStatus();
  }

  function toggleMode(id) {
    const { modes } = session;
    if (modes.has(id)) {
      if (modes.size === 1) { toast(t("Keep at least one way to fill the form.")); return; }
      if (id === "voice" && session.voice.recording) stopRecording();
      modes.delete(id);
    } else {
      modes.add(id);
    }
    // Manual on → show the fields; manual off → collapse them (still reviewable).
    if (id === "manual") session.fieldsExpanded = modes.has("manual");
    app.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", modes.has(b.dataset.mode)));
    renderVoicePanel();
    renderPhotoPanel();
    renderFieldsPanel();
  }

  /** Send text (typed or transcribed) to AI extraction and fill the form for review. */
  async function fillFromText(text) {
    toast(t("Filling the form…"));
    try {
      const result = await extractFields(session.form, text);
      // Re-filling: undo earlier AI values the new text no longer supports.
      for (const name of session.aiFilled || []) {
        if (name in result) continue;
        const f = session.form.fields.find((x) => x.name === name);
        session.values[name] = f.defaultToday ? todayISO() : f.defaultValue ?? "";
      }
      session.aiFilled = Object.keys(result);
      applyExtracted(result);
      toast(Object.keys(result).length
        ? t("Check the filled fields before you submit.")
        : t("Couldn't find details to fill. Fill the form by hand."));
    } catch (e) {
      console.error("[form-filler] extraction failed", e);
      toast(t("Couldn't fill the form. Try again or fill it by hand."));
    }
  }

  /* ---------------- Voice panel ---------------- */

  function renderVoicePanel() {
    const el = app.querySelector("#voicePanel");
    if (!session.modes.has("voice")) { el.innerHTML = ""; return; }
    const v = session.voice;
    el.innerHTML = `
      <section class="panel ${v.recording ? "recording-on" : ""}" aria-labelledby="voiceTitle">
        <div class="panel-head">
          <h2 id="voiceTitle">${icon("mic")} ${esc(t("Talk or type"))}</h2>
        </div>
        <p class="prompt">${esc(t(session.form.voicePrompt))}</p>
        <div class="voice-stage">
          <button type="button" class="mic-btn ${v.recording ? "recording" : ""}" id="micBtn"
            aria-label="${esc(t(v.recording ? "Stop recording" : "Start recording"))}">
            ${icon(v.recording ? "stop" : "mic")}
          </button>
          <div class="wave" aria-hidden="true">${"<span></span>".repeat(14)}</div>
          <div class="voice-status" id="voiceStatus" aria-live="polite">
            ${esc(v.recording ? t("Recording… {time}", { time: fmtDuration(Date.now() - v.startedAt) }) : t(v.clips.length ? "Tap to add another clip" : "Tap the mic to talk, or type below"))}
          </div>
          ${v.clips.length ? `
            <ul class="clip-list">
              ${v.clips.map((c, i) => `
                <li class="clip">
                  ${icon("mic")}<span class="clip-name">${esc(t("Clip {n}", { n: i + 1 }))}</span>
                  <span class="clip-time">${fmtDuration(c.duration)}</span>
                  <button type="button" class="icon-btn" data-remove-clip="${i}" aria-label="${esc(t("Remove clip {n}", { n: i + 1 }))}">${icon("trash")}</button>
                </li>`).join("")}
            </ul>` : ""}
          ${v.clips.some((c) => c.pending) ? `<div class="transcript" aria-live="polite">${esc(t("Turning your voice into text…"))}</div>` : ""}
          <label for="voiceText" class="transcript-label">${icon("pencil")} ${esc(t("What happened (you can edit this)"))}</label>
          <textarea id="voiceText" class="input voice-text" placeholder="${esc(t(session.form.describeExample || ""))}">${esc(v.transcript)}</textarea>
        </div>
        <div class="panel-foot">
          <button type="button" class="btn btn-sm" id="voiceFillBtn">
            ${icon("sparkle")} ${esc(t("Fill the form with AI"))}
          </button>
        </div>
      </section>`;

    const fillBtn = el.querySelector("#voiceFillBtn");
    const syncFill = () => { fillBtn.disabled = !v.transcript.trim() || v.clips.some((c) => c.pending); };
    syncFill();

    el.querySelector("#micBtn").addEventListener("click", () => (v.recording ? stopRecording() : startRecording()));
    el.querySelectorAll("[data-remove-clip]").forEach((b) => b.addEventListener("click", () => {
      const [clip] = v.clips.splice(Number(b.dataset.removeClip), 1);
      // Take that clip's words out of the transcript too (if the worker hasn't edited them).
      if (clip.text) v.transcript = v.transcript.replace(clip.text, "").replace(/\s+/g, " ").trim();
      renderVoicePanel();
    }));
    // The worker can fix misheard words before filling the form.
    el.querySelector("#voiceText").addEventListener("input", (e) => {
      v.transcript = e.target.value;
      session.dirty = true;
      syncFill();
    });
    fillBtn.addEventListener("click", async () => {
      fillBtn.disabled = true;
      await fillFromText(v.transcript);
      syncFill();
    });
  }

  async function startRecording() {
    const v = session.voice;
    try {
      v.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      console.error("[form-filler] microphone", e);
      toast(t("Couldn't use the microphone. Allow it in your browser settings."));
      return;
    }
    const chunks = [];
    v.recorder = new MediaRecorder(v.stream);
    v.recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    v.recorder.onstop = () => {
      v.stream.getTracks().forEach((tr) => tr.stop());
      transcribeClip(v.clips[v.clips.length - 1], new Blob(chunks, { type: v.recorder.mimeType }));
    };
    v.recorder.start();
    v.recording = true;
    v.startedAt = Date.now();
    session.dirty = true;
    renderVoicePanel();
    v.timer = setInterval(() => {
      const s = app.querySelector("#voiceStatus");
      if (s) s.textContent = t("Recording… {time}", { time: fmtDuration(Date.now() - v.startedAt) });
    }, 250);
  }

  function stopRecording() {
    const v = session.voice;
    clearInterval(v.timer);
    v.recording = false;
    v.clips.push({ duration: Date.now() - v.startedAt, pending: true, text: "" });
    v.recorder?.stop();
    renderVoicePanel();
  }

  async function transcribeClip(clip, blob) {
    const s = session;
    try {
      const audio = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result).split(",")[1]);
        r.onerror = reject;
        r.readAsDataURL(blob);
      });
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio, mimeType: blob.type }),
      });
      if (!res.ok) throw new Error(await res.text());
      clip.text = (await res.json()).text.trim();
      s.voice.transcript = [s.voice.transcript.trim(), clip.text].filter(Boolean).join(" ");
      if (!clip.text) toast(t("Didn't catch any words. Check your microphone and try again."));
    } catch (e) {
      console.error("[form-filler] transcription failed", e);
      toast(t("Couldn't turn the recording into text. Try again."));
    }
    clip.pending = false;
    if (session === s) renderVoicePanel();
  }

  /* ---------------- Photo panel (UI only) ---------------- */

  function renderPhotoPanel() {
    const el = app.querySelector("#photoPanel");
    if (!session.modes.has("photo")) { el.innerHTML = ""; return; }
    el.innerHTML = `
      <section class="panel" aria-labelledby="photoTitle">
        <div class="panel-head">
          <h2 id="photoTitle">${icon("camera")} ${esc(t("Photo"))}</h2>
          <span class="badge">${esc(t("Demo"))}</span>
        </div>
        <p class="prompt">${esc(t(session.form.photoPrompt))}</p>
        <p class="muted demo-note">${esc(t("Demo: photo analysis isn't connected yet, so it fills in sample values."))}</p>
        <div class="photo-actions">
          <label class="btn">${icon("camera")} ${esc(t("Take photo"))}
            <input type="file" accept="image/*" capture="environment" class="visually-hidden" data-photo-input>
          </label>
          <label class="btn">${icon("upload")} ${esc(t("Upload"))}
            <input type="file" accept="image/*" multiple class="visually-hidden" data-photo-input>
          </label>
        </div>
        <div class="dropzone" id="dropzone">${esc(t("or drag images here"))}</div>
        <div class="thumbs" id="thumbs"></div>
        <div class="panel-foot">
          <button type="button" class="btn btn-sm" id="photoFillBtn">${icon("sparkle")} ${esc(t("Fill form from photos"))}</button>
        </div>
      </section>`;

    el.querySelectorAll("[data-photo-input]").forEach((inp) => inp.addEventListener("change", () => {
      addPhotos(inp.files);
      inp.value = "";
    }));
    const dz = el.querySelector("#dropzone");
    dz.addEventListener("dragover", (e) => { e.preventDefault(); dz.classList.add("drag"); });
    dz.addEventListener("dragleave", () => dz.classList.remove("drag"));
    dz.addEventListener("drop", (e) => {
      e.preventDefault();
      dz.classList.remove("drag");
      addPhotos(e.dataTransfer.files);
    });
    el.querySelector("#photoFillBtn").addEventListener("click", async (e) => {
      // DEMO: no real image analysis. Waits a moment, then fills the form's sample values.
      // INTEGRATION POINT: send session.photos[].file to a vision model instead.
      const btn = e.currentTarget;
      btn.disabled = true;
      toast(t("Analyzing photos…"));
      await new Promise((r) => setTimeout(r, 1500));
      // Only fill empty fields, so the demo never overwrites what the worker said or typed.
      const demo = Object.fromEntries(Object.entries(session.form.photoDemo || {})
        .filter(([name]) => !String(session.values[name] ?? "").trim()));
      applyExtracted(demo);
      toast(t("Demo: sample values filled in. Check them before you submit."));
      btn.disabled = !session.photos.length;
    });
    renderThumbs();
  }

  let photoSeq = 0;
  function addPhotos(fileList) {
    const files = [...(fileList || [])].filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    for (const file of files) session.photos.push({ id: ++photoSeq, file, url: URL.createObjectURL(file) });
    if (session.photos.length > MAX_PHOTOS) toast(t("Only the first 5 photos are saved with the report."));
    session.dirty = true;
    renderThumbs();
  }

  function renderThumbs() {
    const el = app.querySelector("#thumbs");
    if (!el) return;
    el.innerHTML = session.photos.map((p, i) => `
      <div class="thumb">
        <img src="${p.url}" alt="${esc(t("Photo {n}", { n: i + 1 }))}: ${esc(p.file.name)}">
        <button type="button" data-remove-photo="${p.id}" aria-label="${esc(t("Remove photo {n}", { n: i + 1 }))}">${icon("x")}</button>
      </div>`).join("");
    const btn = app.querySelector("#photoFillBtn");
    if (btn) btn.disabled = !session.photos.length;
    el.querySelectorAll("[data-remove-photo]").forEach((b) => b.addEventListener("click", () => {
      const idx = session.photos.findIndex((p) => p.id === Number(b.dataset.removePhoto));
      if (idx > -1) { URL.revokeObjectURL(session.photos[idx].url); session.photos.splice(idx, 1); }
      renderThumbs();
    }));
  }

  /* ---------------- Fields ---------------- */

  function renderFieldsPanel() {
    const el = app.querySelector("#fieldsPanel");
    const manual = session.modes.has("manual");
    const expanded = session.fieldsExpanded;
    el.innerHTML = `
      <section class="panel fields-panel ${expanded ? "" : "collapsed"}" aria-labelledby="fieldsTitle">
        <div class="panel-head">
          <h2 id="fieldsTitle">${icon("pencil")} ${esc(t(manual ? "Form details" : "Review fields"))}</h2>
          <button type="button" class="btn btn-ghost btn-sm collapse-btn" id="collapseBtn"
            aria-expanded="${expanded}" aria-controls="fieldsBody">
            ${esc(t(expanded ? "Hide" : "Show"))} ${icon("chevron")}
          </button>
        </div>
        ${manual ? "" : `<p class="prompt">${esc(t("These get filled in from your {sources}. Open them to check or correct anything.", {
          sources: new Intl.ListFormat(langTag(), { type: "conjunction" }).format([...session.modes].map((m) => t({ voice: "voice", photo: "photos" }[m]))),
        }))}</p>`}
        <div class="fields" id="fieldsBody">
          ${session.form.fields.map(renderField).join("")}
        </div>
      </section>`;

    el.querySelector("#collapseBtn").addEventListener("click", () => {
      session.fieldsExpanded = !session.fieldsExpanded;
      renderFieldsPanel();
    });
    wireFields(el);
    refreshConditional();
  }

  function optionList(options) {
    return options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  }

  function renderField(f) {
    const v = session.values[f.name] ?? "";
    const id = `f-${f.name}`;
    const err = session.errors[f.name] ? errorText(session.errors[f.name]) : "";
    const wide = f.wide || f.type === "textarea" || f.type === "job";
    const req = f.required ? '<span class="req" aria-hidden="true">*</span>' : "";
    const describedBy = [f.hint && `${id}-hint`, `${id}-err`].filter(Boolean).join(" ");
    const common = `id="${id}" name="${f.name}" class="input" aria-describedby="${describedBy}" ${f.required ? 'aria-required="true"' : ""} ${err ? 'aria-invalid="true"' : ""}`;

    let control;
    switch (f.type) {
      case "textarea":
        control = `<textarea ${common} placeholder="${esc(t(f.placeholder || ""))}">${esc(v)}</textarea>`;
        break;
      case "select":
        control = `<select ${common}>
          <option value="">${esc(t("Select…"))}</option>
          ${optionList(f.options).map((o) => `<option value="${esc(o.value)}" ${o.value === v ? "selected" : ""}>${esc(t(o.label))}</option>`).join("")}
        </select>`;
        break;
      case "job": {
        const group = (status) => JOBS.filter((j) => j.status === status)
          .map((j) => `<option value="${j.id}" ${j.id === v ? "selected" : ""}>${j.id} · ${esc(j.name)}</option>`).join("");
        control = `<select ${common}>
          <option value="">${esc(t("Select a job…"))}</option>
          <optgroup label="${esc(t("Active"))}">${group("Active")}</optgroup>
          <optgroup label="${esc(t("Completed"))}">${group("Completed")}</optgroup>
        </select>`;
        break;
      }
      case "date":
        control = `<input type="date" ${common} value="${esc(v)}" ${f.noFuture ? `max="${todayISO()}"` : ""}>`;
        break;
      case "number":
        control = `<input type="number" inputmode="decimal" ${common} value="${esc(v)}" min="${f.min ?? ""}" step="${f.step ?? "any"}">`;
        break;
      case "computed":
        control = `<input type="text" ${common} value="${esc(f.compute(session.values))}" readonly tabindex="-1">`;
        break;
      case "yesno":
        return `
          <div class="field ${err ? "invalid" : ""}" data-field="${f.name}">
            <span class="label" id="${id}-label">${esc(t(f.label))}${req}</span>
            <div class="seg" role="radiogroup" aria-labelledby="${id}-label" aria-describedby="${id}-err">
              ${[["Y", "Yes"], ["N", "No"]].map(([val, lab]) => `
                <button type="button" role="radio" data-yesno="${f.name}" data-value="${val}" aria-checked="${v === val}">${esc(t(lab))}</button>`).join("")}
            </div>
            <span class="error" id="${id}-err">${esc(err)}</span>
          </div>`;
      default:
        control = `<input type="text" ${common} value="${esc(v)}" placeholder="${esc(t(f.placeholder || ""))}">`;
    }

    return `
      <div class="field ${wide ? "wide" : ""} ${err ? "invalid" : ""}" data-field="${f.name}">
        <label for="${id}">${esc(t(f.label))}${req}</label>
        ${f.hint ? `<span class="hint" id="${id}-hint">${esc(t(f.hint))}</span>` : ""}
        ${control}
        <span class="error" id="${id}-err">${esc(err)}</span>
      </div>`;
  }

  function wireFields(root) {
    root.querySelectorAll(".input:not([readonly])").forEach((inp) => {
      const handler = () => setValue(inp.name, inp.value);
      inp.addEventListener("input", handler);
      inp.addEventListener("change", handler);
    });
    root.querySelectorAll("[data-yesno]").forEach((b) => b.addEventListener("click", () => {
      setValue(b.dataset.yesno, b.dataset.value);
      root.querySelectorAll(`[data-yesno="${b.dataset.yesno}"]`).forEach((x) => x.setAttribute("aria-checked", x === b));
    }));
  }

  function setValue(name, value) {
    if (session.values[name] === value) return;
    session.values[name] = value;
    session.dirty = true;
    if (session.errors[name]) {
      delete session.errors[name];
      const wrap = app.querySelector(`[data-field="${name}"]`);
      wrap?.classList.remove("invalid");
      wrap?.querySelector(".error")?.replaceChildren();
      wrap?.querySelector(".input")?.removeAttribute("aria-invalid");
    }
    if (name === "JOB_ID" && value) store.set("lastJob", value);
    refreshConditional();
    updateStatus();
  }

  /** Show/hide conditional fields and recompute derived ones. */
  function refreshConditional() {
    const v = session.values;
    for (const f of session.form.fields) {
      const wrap = app.querySelector(`[data-field="${f.name}"]`);
      if (!wrap) continue;
      wrap.hidden = !isVisible(f, v);
      if (f.type === "computed") wrap.querySelector(".input").value = f.compute(v);
    }
  }

  /**
   * INTEGRATION POINT: call with { FIELD_NAME: value } from voice/photo
   * extraction. Fills fields and re-renders so the user can review them.
   */
  function applyExtracted(result) {
    for (const [k, val] of Object.entries(result || {})) {
      if (k in session.values) session.values[k] = String(val ?? "");
    }
    session.dirty = true;
    session.fieldsExpanded = true;
    renderFieldsPanel();
    updateStatus();
  }
  window.formFiller = { applyExtracted }; // exposed for wiring up / manual testing

  /* ---------------- Validation & submit ---------------- */

  // Errors are stored as [English text, vars] and translated when shown,
  // so they follow a language change.
  const errorText = ([text, vars]) => t(text, vars);

  function validate() {
    const v = session.values;
    const errors = {};
    const today = todayISO();
    for (const f of session.form.fields) {
      if (!isVisible(f, v) || f.type === "computed") continue;
      const val = (v[f.name] ?? "").trim();
      if (!val) {
        if (f.required) errors[f.name] = ["This is required."];
        continue;
      }
      if (f.type === "number" && (Number.isNaN(Number(val)) || (f.min != null && Number(val) < f.min))) {
        errors[f.name] = ["Enter a number of {min} or more.", { min: f.min }];
      }
      if (f.type === "date") {
        if (f.noFuture && val > today) errors[f.name] = ["This date can't be in the future."];
        const other = f.notBefore && v[f.notBefore];
        if (other && val < other) {
          const otherLabel = session.form.fields.find((x) => x.name === f.notBefore)?.label;
          errors[f.name] = ["Can't be before “{field}”.", { get field() { return t(otherLabel); } }];
        }
      }
    }
    return errors;
  }

  function updateStatus() {
    const el = app.querySelector("#submitStatus");
    if (!el) return;
    const req = session.form.fields.filter((f) => f.required && isVisible(f, session.values));
    const done = req.filter((f) => String(session.values[f.name] ?? "").trim()).length;
    el.textContent = t("Required: {done} of {total}", { done, total: req.length });
  }

  async function submit() {
    if (session.sending) return;
    if (session.voice.recording) stopRecording();
    session.errors = validate();
    const bad = Object.keys(session.errors);
    if (bad.length) {
      session.fieldsExpanded = true;
      renderFieldsPanel();
      const first = app.querySelector(`[data-field="${bad[0]}"]`);
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      first?.querySelector(".input, [role=radio]")?.focus({ preventScroll: true });
      toast(t("Fields that need attention: {n}", { n: bad.length }));
      return;
    }
    const { form } = session;
    let record = {};
    for (const f of form.fields) {
      if (!isVisible(f, session.values)) continue;
      record[f.name] = f.type === "computed" ? f.compute(session.values) : String(session.values[f.name] ?? "").trim();
    }
    if (form.finalize) record = form.finalize(record);
    const attachments = { photos: session.photos.length, voiceClips: session.voice.clips.length, description: !!session.voice.transcript.trim() };

    const btn = app.querySelector("#submitBtn");
    session.sending = true;
    btn.disabled = true;
    btn.textContent = t("Sending…");

    if (session.editId) {
      // Editing a report that's still "Submitted" (api/reports.js checks that it's this worker's).
      const res = await fetch(`/api/reports?id=${session.editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reporter: SAMPLE_PROFILE.name, fields: record, transcript: session.voice.transcript.trim() }),
      }).catch(() => null);
      session.sending = false;
      if (!res?.ok) {
        btn.disabled = false;
        btn.textContent = t("Save changes");
        toast(t("Couldn't save changes. The safety team may have already picked this up."));
        return;
      }
      session.submitted = true;
      session.record = record;
      renderDone(record, true, true);
      return;
    }

    // Send to the database (api/submit.js → Supabase). If that fails, keep it on this device.
    // Photos are shrunk first and saved with the report; voice recordings aren't (the transcript is).
    const photos = (await Promise.all(session.photos.slice(0, MAX_PHOTOS).map((p) => shrinkPhoto(p.file).catch(() => null)))).filter(Boolean);
    let saved = null;
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: form.id, fields: record, attachments, photos, transcript: session.voice.transcript.trim(), reporter: SAMPLE_PROFILE.name }),
      });
      if (!res.ok) throw new Error(await res.text());
      saved = await res.json();
    } catch (e) {
      console.error("[form-filler] submit failed", e);
    }
    session.sending = false;

    if (!saved) saveLocalReport({ localId: `local-${Date.now()}`, formId: form.id, at: new Date().toISOString(), fields: record, attachments });
    session.submitted = true;
    session.record = record;
    renderDone(record, !!saved, false, saved && saved.photosSaved < session.photos.length);
  }

  const MAX_PHOTOS = 5;

  /** Resize a photo to at most `max` px on its long side, as base64 JPEG (keeps uploads small). */
  async function shrinkPhoto(file, max = 1280) {
    const img = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.75).split(",")[1];
  }

  function displayValue(f, val) {
    if (f.type === "job") {
      const j = JOBS.find((x) => x.id === val);
      return j ? `${j.id} · ${j.name}` : val;
    }
    if (f.type === "yesno") return val === "Y" ? t("Yes") : val === "N" ? t("No") : val;
    if (f.type === "select") return t(optionList(f.options).find((o) => o.value === val)?.label ?? val);
    return val;
  }

  function attachmentList(photos, voiceClips, description) {
    return [
      photos && t("Photos: {n}", { n: photos }),
      voiceClips && t("Voice clips: {n}", { n: voiceClips }),
      description && t("Written description"),
    ].filter(Boolean).join(", ");
  }

  function renderDone(record, sent, edited, photosMissing) {
    const { form } = session;
    toastEl.classList.remove("show");
    const rows = form.fields
      .filter((f) => f.name in record && record[f.name] !== "")
      .map((f) => `<tr><th scope="row">${esc(t(f.label))}</th><td>${esc(displayValue(f, record[f.name]))}</td></tr>`).join("");
    const attach = attachmentList(session.photos.length, session.voice.clips.length, !!session.voice.transcript.trim());

    app.innerHTML = `
      <section class="done">
        <div class="tick">${icon("check")}</div>
        <h1>${esc(t(edited ? "{form} updated" : sent ? "{form} sent" : "{form} saved", { form: t(form.title) }))}</h1>
        <p>${esc(t(edited ? "Your changes are saved. You can follow its status in My reports."
          : sent ? "The safety team can see it now. You can follow its status in My reports."
          : "Couldn't reach the server, so it's saved on this device only. Try again when you're back online."))}</p>
        ${photosMissing ? `<p class="muted">${esc(t("Some photos couldn't be saved. Up to 5 photos are kept with a report."))}</p>` : ""}
        <p><a href="#/profile">${esc(t("View in My reports"))}</a></p>
      </section>
      <section class="panel">
        <table class="summary"><tbody>
          ${rows}
          ${attach ? `<tr><th scope="row">${esc(t("Attachments"))}</th><td>${esc(attach)}</td></tr>` : ""}
        </tbody></table>
      </section>
      <div class="done-actions">
        <button type="button" class="btn" id="againBtn">${esc(t("New: {form}", { form: t(form.title) }))}</button>
        <button type="button" class="btn btn-primary" id="homeBtn">${esc(t("All forms"))}</button>
      </div>`;
    window.scrollTo(0, 0);
    app.querySelector("#againBtn").addEventListener("click", () => route());
    app.querySelector("#homeBtn").addEventListener("click", () => { location.hash = "#/"; });
  }

  renderChrome();
  route();
})();
