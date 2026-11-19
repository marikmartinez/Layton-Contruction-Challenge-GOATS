/*
 * Profile page data.
 *
 * SAMPLE DATA: there's no sign-in or backend yet, so the profile and report
 * history are hard-coded. Record IDs, jobs and report text are borrowed from the
 * Layton 2026 dataset; statuses are
 * illustrative. Reports submitted in the app are also shown, read from this
 * browser's storage (see "myReports" in app.js).
 *
 * INTEGRATION POINT: replace with the signed-in user's profile and reports.
 * Report shape:
 *   recordId  dataset id          formId   id in FORMS
 *   daysAgo   (sample) or at: ISO timestamp
 *   status    label shown         kind     "resolved" | "update" | "filed"
 *   fields    { DATASET_COLUMN: value } using the form's field names
 */

/* eslint-disable no-unused-vars */

const SAMPLE_PROFILE = {
  name: "Jordan Reyes",
  role: "Carpenter Foreman",
  company: "Layton Construction",
  homeJob: "JOB-001",
  memberSince: "2024-01",
};

const SAMPLE_REPORTS = [
  {
    recordId: "ISS-000002", formId: "issue", daysAgo: 3, status: "Closed", kind: "resolved",
    fields: {
      JOB_ID: "JOB-007", ISSUE_DESCRIPTION: "An unprotected floor opening was observed without a secured cover or guardrail.",
      HAZARD_CATEGORY: "Fall Protection", SEVERITY: "High", ROOT_CAUSE: "Guarding", STATUS: "Closed",
    },
  },
  {
    recordId: "GC-000002", formId: "good-catch", daysAgo: 4, status: "Completed", kind: "resolved",
    fields: {
      JOB_ID: "JOB-007", HAZARD_CATEGORY: "Electrical", GOOD_CATCH_DESCRIPTION: "A damaged extension cord was found before tools were energized.",
      POTENTIAL_SEVERITY: "Medium", IMMEDIATE_ACTION_TAKEN: "Cord removed from service.", FOLLOW_UP_REQUIRED_FLAG: "Y", FOLLOW_UP_STATUS: "Completed",
    },
  },
  {
    recordId: "ISS-000001", formId: "issue", daysAgo: 6, status: "In Progress", kind: "update",
    fields: {
      JOB_ID: "JOB-002", ISSUE_DESCRIPTION: "An unprotected floor opening was observed without a secured cover or guardrail.",
      HAZARD_CATEGORY: "Fall Protection", SEVERITY: "High", ROOT_CAUSE: "Guarding", STATUS: "In Progress",
    },
  },
  {
    recordId: "ISS-000003", formId: "issue", daysAgo: 9, status: "Closed", kind: "resolved",
    fields: {
      JOB_ID: "JOB-008", ISSUE_DESCRIPTION: "The permit board lacked an updated atmospheric test.",
      HAZARD_CATEGORY: "Confined Space", SEVERITY: "Critical", ROOT_CAUSE: "Procedure", STATUS: "Closed",
    },
  },
  {
    recordId: "INC-00002", formId: "incident", daysAgo: 12, status: "Review complete", kind: "resolved",
    fields: {
      JOB_ID: "JOB-001", INCIDENT_CLASSIFICATION: "First Aid", OSHA_HAZARD_CATEGORY: "Other",
      HAZARD_SUBCATEGORY: "Manual Material Handling", BODY_PART_INJURED: "Wrist",
      INCIDENT_DESCRIPTION: "While performing work involving manual material handling, the worker sustained a minor injury to the wrist. Basic first aid was provided on site.",
    },
  },
  {
    recordId: "GC-000003", formId: "good-catch", daysAgo: 14, status: "Follow-up open", kind: "update",
    fields: {
      JOB_ID: "JOB-001", HAZARD_CATEGORY: "Struck-By", GOOD_CATCH_DESCRIPTION: "Spotter stopped a backing vehicle before it entered a pedestrian route.",
      POTENTIAL_SEVERITY: "High", IMMEDIATE_ACTION_TAKEN: "Traffic stopped; route barricaded.", FOLLOW_UP_REQUIRED_FLAG: "Y", FOLLOW_UP_STATUS: "Open",
    },
  },
  {
    recordId: "GC-000001", formId: "good-catch", daysAgo: 21, status: "No follow-up needed", kind: "resolved",
    fields: {
      JOB_ID: "JOB-002", HAZARD_CATEGORY: "Electrical", GOOD_CATCH_DESCRIPTION: "Damaged extension cord was found before tools were used.",
      POTENTIAL_SEVERITY: "Medium", IMMEDIATE_ACTION_TAKEN: "Cord removed from service.", FOLLOW_UP_REQUIRED_FLAG: "N", FOLLOW_UP_STATUS: "Not Required",
    },
  },
  {
    recordId: "DJ-000001", formId: "daily-journal", daysAgo: 22, status: "Filed", kind: "filed",
    fields: {
      JOB_ID: "JOB-001", HEADCOUNT: "42", REGULAR_HOURS: "336", OVERTIME_HOURS: "34.4", TOTAL_HOURS: "370.4",
      WORK_ACTIVITY: "Structural framing", WEATHER: "Snow",
    },
  },
];
