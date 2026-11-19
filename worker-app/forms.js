/*
 * Form definitions for the Layton safety form filler.
 *
 * Each form maps 1:1 to a record type in the Layton 2026 dataset. Field `name`s
 * use the dataset's column names so a submitted record lines up with the CSVs.
 * Columns the system derives (IDs, DAYS_OPEN, OVERDUE_FLAG, TOTAL_HOURS) are
 * either omitted or rendered read-only.
 *
 * Field shape:
 *   name        dataset column name
 *   label       shown to the user (English; translated via t() in i18n.js)
 *   type        text | textarea | select | date | number | yesno | job | computed
 *   required    boolean
 *   options     for select: array of strings, or [{ value, label }]
 *   showIf      (values) => boolean — field is hidden (and skipped) when false
 *   hint        helper text under the label
 *   compute     for computed: (values) => string
 *   noFuture    date may not be after today
 *   wide        take the full row (long options)
 *   notFromPhoto  a photo can't show this (what someone did, treatment, the injury),
 *                 so photo-only AI filling never sends or fills it
 *   notBefore   date may not be before the named date field
 */

/* eslint-disable no-unused-vars */

const JOBS = [
  { id: "JOB-001", name: "Canyon Commercial Project 01", status: "Active" },
  { id: "JOB-002", name: "Canyon Healthcare Project 02", status: "Active" },
  { id: "JOB-003", name: "Canyon Education Project 03", status: "Active" },
  { id: "JOB-004", name: "Canyon Residential Project 04", status: "Completed" },
  { id: "JOB-005", name: "Canyon Industrial Project 05", status: "Completed" },
  { id: "JOB-006", name: "Canyon Infrastructure Project 06", status: "Completed" },
  { id: "JOB-007", name: "Canyon Civic Project 07", status: "Completed" },
  { id: "JOB-008", name: "Canyon Commercial Project 08", status: "Completed" },
  { id: "JOB-009", name: "Summit Healthcare Project 09", status: "Completed" },
  { id: "JOB-010", name: "Summit Education Project 10", status: "Completed" },
  { id: "JOB-011", name: "Summit Residential Project 11", status: "Completed" },
  { id: "JOB-012", name: "Summit Industrial Project 12", status: "Completed" },
  { id: "JOB-013", name: "Summit Infrastructure Project 13", status: "Active" },
  { id: "JOB-014", name: "Summit Civic Project 14", status: "Completed" },
  { id: "JOB-015", name: "Summit Commercial Project 15", status: "Completed" },
  { id: "JOB-016", name: "Summit Healthcare Project 16", status: "Completed" },
  { id: "JOB-017", name: "Copper Education Project 17", status: "Active" },
  { id: "JOB-018", name: "Copper Residential Project 18", status: "Completed" },
  { id: "JOB-019", name: "Copper Industrial Project 19", status: "Completed" },
  { id: "JOB-020", name: "Copper Infrastructure Project 20", status: "Completed" },
  { id: "JOB-021", name: "Copper Civic Project 21", status: "Active" },
  { id: "JOB-022", name: "Copper Commercial Project 22", status: "Active" },
  { id: "JOB-023", name: "Copper Healthcare Project 23", status: "Completed" },
  { id: "JOB-024", name: "Copper Education Project 24", status: "Active" },
  { id: "JOB-025", name: "Riverview Residential Project 25", status: "Active" },
  { id: "JOB-026", name: "Riverview Industrial Project 26", status: "Completed" },
  { id: "JOB-027", name: "Riverview Infrastructure Project 27", status: "Active" },
  { id: "JOB-028", name: "Riverview Civic Project 28", status: "Completed" },
  { id: "JOB-029", name: "Riverview Commercial Project 29", status: "Active" },
  { id: "JOB-030", name: "Riverview Healthcare Project 30", status: "Active" },
  { id: "JOB-031", name: "Riverview Education Project 31", status: "Active" },
  { id: "JOB-032", name: "Riverview Residential Project 32", status: "Active" },
  { id: "JOB-033", name: "Juniper Industrial Project 33", status: "Active" },
  { id: "JOB-034", name: "Juniper Infrastructure Project 34", status: "Active" },
  { id: "JOB-035", name: "Juniper Civic Project 35", status: "Active" },
  { id: "JOB-036", name: "Juniper Commercial Project 36", status: "Active" },
  { id: "JOB-037", name: "Juniper Healthcare Project 37", status: "Active" },
  { id: "JOB-038", name: "Juniper Education Project 38", status: "Active" },
  { id: "JOB-039", name: "Juniper Residential Project 39", status: "Active" },
  { id: "JOB-040", name: "Juniper Industrial Project 40", status: "Active" },
];

const HAZARD_CATEGORIES_ISSUES = [
  "Confined Space", "Electrical", "Ergonomics", "Excavation", "Fall Protection",
  "Fire Prevention", "Housekeeping", "Ladders", "Scaffolding", "Struck-By",
];

// The 10 unsafe conditions that recur in issues.csv (one per hazard category).
// Picking one lets a new report be matched to past unresolved issues.
const RECURRING_CONDITIONS = [
  "The permit board lacked an updated atmospheric test.",
  "A temporary power cord had damaged insulation near the connector.",
  "A crew manually lifted heavy fixtures without an available lifting aid.",
  "Excavated material was stored too close to the trench edge.",
  "An unprotected floor opening was observed without a secured cover or guardrail.",
  "Hot work began without a documented permit or nearby extinguisher.",
  "Scrap material narrowed the designated access route and created a trip hazard.",
  "An extension ladder was set at an unsafe angle and was not secured.",
  "A scaffold platform had an open gap and lacked a current inspection tag.",
  "Pedestrian travel crossed an equipment route without a spotter.",
];

const FORMS = [
  {
    id: "good-catch",
    title: "Good Catch",
    blurb: "A hazard you spotted and controlled before anyone got hurt.",
    icon: "eye",
    accent: "green",
    voicePrompt:
      "Describe what you saw, where it was, and what you did about it right away.",
    photoPrompt: "Photograph the hazard and, if you can, the fix in place.",
    describeExample:
      "e.g. On level 3 by the east stair I found a frayed extension cord before anyone plugged in. Pulled it from service and told the foreman. No follow-up needed.",
    fields: [
      { name: "JOB_ID", label: "Job", type: "job", required: true },
      { name: "REPORT_DATE", label: "Report date", type: "date", required: true, defaultToday: true, noFuture: true },
      {
        name: "HAZARD_CATEGORY", label: "Hazard category", type: "select", required: true,
        options: ["Electrical", "Ergonomics", "Fall Protection", "Housekeeping", "Material Handling", "Struck-By"],
      },
      {
        name: "GOOD_CATCH_DESCRIPTION", label: "What did you catch?", type: "textarea", required: true,
        placeholder: "e.g. Damaged extension cord found before tools were energized.",
      },
      {
        name: "POTENTIAL_SEVERITY", label: "Potential severity", type: "select", required: true,
        options: ["Medium", "High", "Critical"],
        hint: "How bad could it have been if nobody caught it?",
      },
      {
        name: "IMMEDIATE_ACTION_TAKEN", label: "Immediate action taken", type: "textarea", required: true, notFromPhoto: true,
        placeholder: "e.g. Cord removed from service.",
      },
      { name: "FOLLOW_UP_REQUIRED_FLAG", label: "Follow-up required?", type: "yesno", required: true, notFromPhoto: true },
      {
        name: "FOLLOW_UP_STATUS", label: "Follow-up status", type: "select", required: true, notFromPhoto: true,
        options: ["Open", "Completed"],
        showIf: (v) => v.FOLLOW_UP_REQUIRED_FLAG === "Y",
      },
    ],
    // FOLLOW_UP_STATUS is "Not Required" in the dataset when no follow-up is needed.
    finalize: (v) => (v.FOLLOW_UP_REQUIRED_FLAG === "N" ? { ...v, FOLLOW_UP_STATUS: "Not Required" } : v),
  },

  {
    id: "issue",
    title: "Safety Issue",
    blurb: "An unsafe condition or practice that needs to be corrected.",
    icon: "alert",
    accent: "amber",
    voicePrompt:
      "Describe the unsafe condition, how serious it is, and who or what caused it.",
    photoPrompt: "Photograph the condition so the responsible crew can find it.",
    describeExample:
      "e.g. Floor opening on level 2 near the elevator core has no cover or guardrail. High severity, the framing crew needs to guard it by Friday.",
    fields: [
      { name: "JOB_ID", label: "Job", type: "job", required: true },
      { name: "OPEN_DATE", label: "Date observed", type: "date", required: true, defaultToday: true, noFuture: true },
      {
        name: "OBSERVED_CONDITION", label: "Observed unsafe condition", type: "select", required: true, wide: true,
        options: [...RECURRING_CONDITIONS, { value: "Other", label: "Other (a new condition)" }],
        hint: "Pick the closest match so it can be linked to past unresolved issues. Choose Other if it's new.",
      },
      {
        name: "NEW_CONDITION", label: "Describe the new condition", type: "text", required: true, wide: true,
        placeholder: "e.g. Rebar caps missing on vertical bars near the east wall.",
        hint: "One short sentence. Similar new reports can be grouped later.",
        showIf: (v) => v.OBSERVED_CONDITION === "Other",
      },
      {
        name: "ISSUE_DESCRIPTION", label: "Describe the issue", type: "textarea", required: true,
        placeholder: "e.g. Unprotected floor opening without a secured cover or guardrail.",
      },
      { name: "HAZARD_CATEGORY", label: "Hazard category", type: "select", required: true, options: HAZARD_CATEGORIES_ISSUES },
      { name: "SEVERITY", label: "Severity", type: "select", required: true, options: ["Low", "Medium", "High", "Critical"] },
      { name: "ROOT_CAUSE", label: "Root cause", type: "select", options: ["Coordination", "Equipment", "Guarding", "Housekeeping", "Inspection", "Planning", "Procedure"] },
      { name: "STATUS", label: "Status", type: "select", required: true, options: ["Open", "In Progress", "Closed"], defaultValue: "Open", notFromPhoto: true },
      { name: "DUE_DATE", label: "Correct by", type: "date", required: true, notBefore: "OPEN_DATE" },
      {
        name: "CLOSURE_DATE", label: "Closure date", type: "date", required: true, notBefore: "OPEN_DATE", noFuture: true,
        showIf: (v) => v.STATUS === "Closed",
      },
    ],
  },

  {
    id: "incident",
    title: "Injury / Incident",
    blurb: "Someone was hurt, from first aid through lost time.",
    icon: "cross",
    accent: "red",
    voicePrompt:
      "Say what the worker was doing, what happened, which body part was hurt, and what treatment was given.",
    photoPrompt: "Photograph the area and equipment involved. Don't photograph the injury itself.",
    describeExample:
      "e.g. This morning a laborer carrying block slipped on debris in the stairwell and twisted their ankle. Ice and first aid on site, back to work the same day.",
    fields: [
      { name: "JOB_ID", label: "Job", type: "job", required: true },
      { name: "INCIDENT_DATE", label: "Incident date", type: "date", required: true, defaultToday: true, noFuture: true },
      {
        name: "INCIDENT_CLASSIFICATION", label: "Classification", type: "select", required: true, notFromPhoto: true,
        options: [
          { value: "First Aid", label: "First Aid" },
          { value: "REC", label: "REC (Recordable)" },
          { value: "RECR", label: "RECR" },
          { value: "Lost Time Accident", label: "Lost Time Accident" },
        ],
      },
      {
        name: "OSHA_HAZARD_CATEGORY", label: "OSHA hazard category", type: "select", required: true,
        options: ["Falls", "Struck-By", "Caught-In or -Between", "Electrocution", "Other"],
      },
      {
        name: "HAZARD_SUBCATEGORY", label: "Hazard subcategory", type: "select", required: true,
        options: [
          "Caught Between Equipment and Fixed Object", "Caught in Equipment", "Contact with Energized Equipment",
          "Fall from Elevated Work Surface", "Falling or Shifting Object", "Flying Particles / Debris",
          "Hand Tool Cut or Contact", "Ladder Fall", "Manual Material Handling", "Moving Object or Equipment",
          "Overexertion / Body Mechanics", "Pinched Between Materials or Components", "Same-Level Slip / Trip",
          "Temporary Power or Electrical Equipment Contact", "Thermal Burn / Hot Work", "Walking Surface / Debris",
        ],
      },
      {
        name: "BODY_PART_INJURED", label: "Body part injured", type: "select", required: true, notFromPhoto: true,
        options: ["Ankle / Foot", "Eye", "Forearm", "Hand / Finger", "Knee", "Lower Back", "Lower Leg", "Shoulder", "Wrist"],
      },
      {
        name: "LTA_LESSON_NUMBER", label: "LTA lesson number", type: "text", notFromPhoto: true,
        placeholder: "e.g. LTA-002",
        showIf: (v) => v.INCIDENT_CLASSIFICATION === "Lost Time Accident",
      },
      {
        name: "INCIDENT_DESCRIPTION", label: "What happened?", type: "textarea", required: true,
        placeholder: "What the worker was doing, what happened, the injury, and the treatment given.",
      },
    ],
  },

  {
    id: "daily-journal",
    title: "Daily Journal",
    blurb: "Today's crew size, hours, main activity and weather.",
    icon: "clipboard",
    accent: "blue",
    voicePrompt: "Say how many people were on site, the hours worked, the main activity, and the weather.",
    photoPrompt: "Photograph the sign-in sheet or timecards.",
    // One-line summary for lists (other forms use their description field).
    summarize: (v) => [v.HEADCOUNT && `${v.HEADCOUNT} ${t("on site")}`, v.TOTAL_HOURS && `${v.TOTAL_HOURS} ${t("hrs")}`, v.WORK_ACTIVITY && t(v.WORK_ACTIVITY), v.WEATHER && t(v.WEATHER)].filter(Boolean).join(" · "),
    describeExample:
      "e.g. 42 on site today, 336 regular hours and about 34 overtime. Mostly structural framing. Snowed all morning.",
    fields: [
      { name: "JOB_ID", label: "Job", type: "job", required: true },
      { name: "JOURNAL_DATE", label: "Date", type: "date", required: true, defaultToday: true, noFuture: true },
      { name: "HEADCOUNT", label: "Headcount", type: "number", required: true, min: 0, step: 1 },
      { name: "REGULAR_HOURS", label: "Regular hours", type: "number", required: true, min: 0, step: 0.1 },
      { name: "OVERTIME_HOURS", label: "Overtime hours", type: "number", required: true, min: 0, step: 0.1, defaultValue: "0" },
      {
        name: "TOTAL_HOURS", label: "Total hours", type: "computed",
        compute: (v) => {
          const r = parseFloat(v.REGULAR_HOURS), o = parseFloat(v.OVERTIME_HOURS);
          if (Number.isNaN(r) && Number.isNaN(o)) return "";
          return String(Math.round(((r || 0) + (o || 0)) * 10) / 10);
        },
      },
      {
        name: "WORK_ACTIVITY", label: "Main work activity", type: "select", required: true,
        options: ["Concrete placement", "Drywall and finishes", "Excavation and grading", "Overhead MEP rough-in", "Roofing and envelope", "Structural framing", "Systems testing"],
      },
      {
        name: "WEATHER", label: "Weather", type: "select", required: true,
        options: ["Clear", "Partly Cloudy", "Cloudy", "Rain", "Snow", "High Wind", "Extreme Heat"],
      },
    ],
  },
];
