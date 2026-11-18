/*
 * Notifications about the status of reports the user submitted.
 *
 * SAMPLE DATA: there is no backend yet, so this feed is hard-coded. Record IDs,
 * jobs and report text are borrowed from the Layton 2026 dataset for realism;
 * the statuses, notes and roles are illustrative. `hoursAgo` keeps
 * the timestamps relative to now so the Today / This week grouping can be seen.
 *
 * INTEGRATION POINT: replace SAMPLE_NOTIFICATIONS with a fetch of the signed-in
 * user's notifications. Shape:
 *   id        unique id (read state is stored against it)
 *   kind      "resolved" | "update"
 *   formId    id of the form in FORMS (good-catch | issue | incident | daily-journal)
 *   recordId  dataset record id, e.g. ISS-000002
 *   jobId     JOB-xxx
 *   status    status after the change
 *   report    what the user originally reported
 *   note      what was done / what changed
 *   by        role of the person who made the change
 *   at        ISO timestamp (or hoursAgo for sample data)
 */

/* eslint-disable no-unused-vars */

const SAMPLE_NOTIFICATIONS = [
  {
    id: "n-001",
    kind: "resolved",
    formId: "issue",
    recordId: "ISS-000002",
    jobId: "JOB-007",
    status: "Closed",
    report: "An unprotected floor opening was observed without a secured cover or guardrail.",
    note: "Opening covered with secured plywood and marked. Guardrail installed on the open side.",
    by: "Site Safety Manager",
    hoursAgo: 2,
  },
  {
    id: "n-002",
    kind: "resolved",
    formId: "good-catch",
    recordId: "GC-000002",
    jobId: "JOB-007",
    status: "Completed",
    report: "A damaged extension cord was found before tools were energized.",
    note: "All cords on level 2 inspected and color-coded for this quarter. Two more were taken out of service.",
    by: "Superintendent",
    hoursAgo: 5,
  },
  {
    id: "n-003",
    kind: "update",
    formId: "issue",
    recordId: "ISS-000001",
    jobId: "JOB-002",
    status: "In Progress",
    report: "An unprotected floor opening was observed without a secured cover or guardrail.",
    note: "Assigned to the framing subcontractor. Temporary barricade in place until the guardrail is installed.",
    by: "Project Engineer",
    hoursAgo: 26,
  },
  {
    id: "n-004",
    kind: "resolved",
    formId: "issue",
    recordId: "ISS-000003",
    jobId: "JOB-008",
    status: "Closed",
    report: "The permit board lacked an updated atmospheric test.",
    note: "Atmospheric test redone and posted. The crew was briefed on testing before each entry.",
    by: "Site Safety Manager",
    hoursAgo: 72,
  },
  {
    id: "n-005",
    kind: "resolved",
    formId: "incident",
    recordId: "INC-00002",
    jobId: "JOB-001",
    status: "Review complete",
    report: "Minor wrist injury during manual material handling. First aid given on site.",
    note: "Incident review complete. Lifting-technique toolbox talk added to next week's schedule.",
    by: "Safety Director",
    hoursAgo: 140,
  },
  {
    id: "n-006",
    kind: "update",
    formId: "good-catch",
    recordId: "GC-000003",
    jobId: "JOB-001",
    status: "Open",
    report: "Spotter stopped a backing vehicle before it entered a pedestrian route.",
    note: "Follow-up opened: the pedestrian route will be rerouted away from the haul road.",
    by: "Superintendent",
    hoursAgo: 220,
  },
];
