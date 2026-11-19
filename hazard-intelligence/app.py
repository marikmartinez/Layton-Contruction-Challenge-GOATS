
from pathlib import Path
import pandas as pd
import streamlit as st

# ============================================================
# 1. PAGE CONFIGURATION
# ============================================================

st.set_page_config(
    page_title="Hazard Intelligence & Escalation Engine",
    page_icon="⚠️",
    layout="wide"
)

SNAPSHOT_DATE = pd.Timestamp("2026-09-30")
BASE_DIR = Path(__file__).resolve().parent

st.title("⚠️ Hazard Intelligence & Escalation Engine")
st.caption(
    "Evidence-based safety monitoring for construction leadership "
    "| Reporting cutoff: September 30, 2026"
)

# ============================================================
# 2. LOAD DATA
# ============================================================

@st.cache_data
def load_csv(filename):
    possible_paths = [
        BASE_DIR / "data" / filename,
        BASE_DIR / filename,
        BASE_DIR.parent / "data" / filename,
    ]

    for path in possible_paths:
        if path.exists():
            return pd.read_csv(path)

    raise FileNotFoundError(
        f"Cannot find {filename}. "
        "Place the CSV in hazard-intelligence/data/."
    )


try:
    jobs = load_csv("jobs.csv")
    issues = load_csv("issues.csv")
    incidents = load_csv("safety_incidents.csv")

except (FileNotFoundError, pd.errors.ParserError) as error:
    st.error(str(error))
    st.stop()


# ============================================================
# 3. VALIDATE REQUIRED COLUMNS
# ============================================================

required_jobs = [
    "JOB_ID",
    "PROJECT_STATUS"
]

required_issues = [
    "ISSUE_ID",
    "JOB_ID",
    "OPEN_DATE",
    "HAZARD_CATEGORY",
    "SEVERITY",
    "STATUS",
    "DUE_DATE",
    "CLOSURE_DATE",
    "ISSUE_DESCRIPTION"
]

required_incidents = [
    "INCIDENT_ID",
    "JOB_ID",
    "INCIDENT_DATE",
    "INCIDENT_CLASSIFICATION",
    "OSHA_HAZARD_CATEGORY",
    "HAZARD_SUBCATEGORY"
]


def validate_columns(df, required, dataset_name):
    missing = [col for col in required if col not in df.columns]

    if missing:
        st.error(
            f"{dataset_name} is missing required columns: {missing}"
        )
        st.stop()


validate_columns(jobs, required_jobs, "jobs.csv")
validate_columns(issues, required_issues, "issues.csv")
validate_columns(
    incidents,
    required_incidents,
    "safety_incidents.csv"
)

# ============================================================
# 4. PREPARE DATA
# ============================================================

for column in ["OPEN_DATE", "DUE_DATE", "CLOSURE_DATE"]:
    issues[column] = pd.to_datetime(
        issues[column],
        errors="coerce"
    )

incidents["INCIDENT_DATE"] = pd.to_datetime(
    incidents["INCIDENT_DATE"],
    errors="coerce"
)

jobs["PROJECT_STATUS"] = (
    jobs["PROJECT_STATUS"]
    .astype("string")
    .str.strip()
    .str.title()
)

issues["SEVERITY"] = (
    issues["SEVERITY"]
    .astype("string")
    .str.strip()
    .str.title()
)

issues["STATUS"] = (
    issues["STATUS"]
    .astype("string")
    .str.strip()
    .str.lower()
)

issues["HAZARD_CATEGORY"] = (
    issues["HAZARD_CATEGORY"]
    .astype("string")
    .str.strip()
)

# Restrict records to the dataset reporting cutoff.
# Unknown dates are retained separately for quality checks.

future_issues = issues[
    issues["OPEN_DATE"] > SNAPSHOT_DATE
].copy()

future_incidents = incidents[
    incidents["INCIDENT_DATE"] > SNAPSHOT_DATE
].copy()

issues = issues[
    issues["OPEN_DATE"].isna()
    | (issues["OPEN_DATE"] <= SNAPSHOT_DATE)
].copy()

incidents = incidents[
    incidents["INCIDENT_DATE"].isna()
    | (incidents["INCIDENT_DATE"] <= SNAPSHOT_DATE)
].copy()

# Attach project status to issue records.
if jobs["JOB_ID"].duplicated().any():
    st.error("Duplicate JOB_ID values found in jobs.csv.")
    st.stop()

issues = issues.merge(
    jobs[["JOB_ID", "PROJECT_STATUS"]],
    on="JOB_ID",
    how="left",
    validate="many_to_one"
)

# Reconstruct documented unresolved status at the cutoff.
# A closure after the cutoff does not count as closed at the cutoff.
# Missing closure dates are treated as missing closure evidence.

issues["UNRESOLVED_AT_SNAPSHOT"] = (
    issues["CLOSURE_DATE"].isna()
    | (issues["CLOSURE_DATE"] > SNAPSHOT_DATE)
)

issues["IS_OVERDUE"] = (
    issues["UNRESOLVED_AT_SNAPSHOT"]
    & issues["DUE_DATE"].notna()
    & (issues["DUE_DATE"] < SNAPSHOT_DATE)
)

issues["IS_CRITICAL"] = (
    issues["SEVERITY"] == "Critical"
)

issues["IS_HIGH"] = (
    issues["SEVERITY"] == "High"
)

unresolved_issues = issues[
    issues["UNRESOLVED_AT_SNAPSHOT"]
].copy()

# ============================================================
# 5. BUILD HAZARD INTELLIGENCE
# ============================================================

recurring_hazards = (
    unresolved_issues
    .dropna(subset=["JOB_ID", "HAZARD_CATEGORY"])
    .groupby(
        ["JOB_ID", "PROJECT_STATUS", "HAZARD_CATEGORY"],
        dropna=False,
        as_index=False
    )
    .agg(
        unresolved_count=("ISSUE_ID", "count"),
        critical_count=("IS_CRITICAL", "sum"),
        high_count=("IS_HIGH", "sum"),
        overdue_count=("IS_OVERDUE", "sum"),
        first_report=("OPEN_DATE", "min"),
        latest_report=("OPEN_DATE", "max")
    )
)

# The review order is rule-based, not a validated risk score.

def assign_priority(row):
    if row["PROJECT_STATUS"] == "Completed":
        return "Closure Documentation Review"

    if row["PROJECT_STATUS"] != "Active":
        return "Verify Project Status"

    if row["critical_count"] > 0:
        return "Urgent Review"

    if row["overdue_count"] >= 2:
        return "High Priority Review"

    if row["high_count"] > 0:
        return "High Priority Review"

    return "Routine Review"


def assign_review_type(row):
    if row["PROJECT_STATUS"] == "Active":
        return "Active Site Safety Review"

    if row["PROJECT_STATUS"] == "Completed":
        return "Closure Documentation Review"

    return "Project Status Verification Required"


def recommend_action(row):
    if row["PROJECT_STATUS"] == "Completed":
        return (
            "Audit closure documentation and verify whether "
            "corrective actions were completed before project closeout."
        )

    if row["PROJECT_STATUS"] != "Active":
        return (
            "Verify the project status and determine "
            "the appropriate review workflow."
        )

    if row["critical_count"] > 0:
        return (
            "Promptly notify the site safety lead. Verify current "
            "conditions, documented controls, and corrective actions."
        )

    if row["overdue_count"] > 0:
        return (
            "Review overdue reports, confirm corrective actions, "
            "and assign an accountable owner."
        )

    return (
        "Review recurring reports and verify whether "
        "corrective actions have been documented."
    )


recurring_hazards["PRIORITY"] = (
    recurring_hazards.apply(assign_priority, axis=1)
)

recurring_hazards["REVIEW_TYPE"] = (
    recurring_hazards.apply(assign_review_type, axis=1)
)

recurring_hazards["RECOMMENDATION"] = (
    recurring_hazards.apply(recommend_action, axis=1)
)

priority_order = {
    "Urgent Review": 0,
    "High Priority Review": 1,
    "Routine Review": 2,
    "Closure Documentation Review": 3,
    "Verify Project Status": 4
}

recurring_hazards["PRIORITY_ORDER"] = (
    recurring_hazards["PRIORITY"].map(priority_order)
)

recurring_hazards = recurring_hazards.sort_values(
    [
        "PRIORITY_ORDER",
        "critical_count",
        "overdue_count",
        "unresolved_count"
    ],
    ascending=[True, False, False, False]
)

# ============================================================
# 6. PROJECT REVIEW QUEUES
# ============================================================

project_queue = (
    recurring_hazards
    .groupby(
        ["JOB_ID", "PROJECT_STATUS"],
        as_index=False,
        dropna=False
    )
    .agg(
        unresolved_reports=("unresolved_count", "sum"),
        critical_reports=("critical_count", "sum"),
        high_reports=("high_count", "sum"),
        overdue_reports=("overdue_count", "sum"),
        hazard_categories=("HAZARD_CATEGORY", "nunique")
    )
)

active_queue = (
    project_queue[
        project_queue["PROJECT_STATUS"] == "Active"
    ]
    .sort_values(
        [
            "critical_reports",
            "overdue_reports",
            "high_reports",
            "unresolved_reports"
        ],
        ascending=False
    )
    .copy()
)

completed_queue = (
    project_queue[
        project_queue["PROJECT_STATUS"] == "Completed"
    ]
    .sort_values(
        ["overdue_reports", "unresolved_reports"],
        ascending=False
    )
    .copy()
)

# ============================================================
# 7. HISTORICAL INCIDENT CATEGORY MAPPING
# ============================================================

# Explicit mappings based on reviewed category relationships.
# These are analytical associations, not causal relationships.
# Add more mappings only after checking the actual dataset values.

hazard_mapping = {
    "Ladders": [
        "Ladder Fall"
    ],
    "Fall Protection": [
        "Fall from Elevated Work Surface"
    ],
    "Electrical": [
        "Contact with Energized Equipment",
        "Temporary Power or Electrical Equipment Contact"
    ]
}

# ============================================================
# 8. DASHBOARD NAVIGATION
# ============================================================

tab1, tab2, tab3, tab4 = st.tabs([
    "🏢 Portfolio Overview",
    "🔎 Project Investigation",
    "📚 Historical Incidents",
    "🧪 Data Quality"
])

# ============================================================
# TAB 1: PORTFOLIO OVERVIEW
# ============================================================

with tab1:

    st.header("Portfolio Safety Overview")

    col1, col2, col3, col4 = st.columns(4)

    col1.metric(
        "Total Projects",
        jobs["JOB_ID"].nunique()
    )

    col2.metric(
        "Active Projects Flagged",
        active_queue["JOB_ID"].nunique()
    )

    col3.metric(
        "Completed Projects for Closure Review",
        completed_queue["JOB_ID"].nunique()
    )

    col4.metric(
        "Active Critical Reports",
        int(active_queue["critical_reports"].sum())
    )

    st.divider()

    st.subheader("🚨 Active-Site Safety Review Queue")

    st.caption(
        "Projects are ordered by unresolved Critical reports, "
        "overdue reports, High-severity reports, and total "
        "unresolved reports."
    )

    st.dataframe(
        active_queue,
        hide_index=True,
        width="stretch"
    )

    st.subheader("📁 Completed-Project Closure Review Queue")

    st.caption(
        "These records require documentation review. "
        "They do not establish that hazards remain on-site."
    )

    st.dataframe(
        completed_queue,
        hide_index=True,
        width="stretch"
    )

    st.divider()

    st.subheader("Hazard Categories Requiring Review")

    category_summary = (
        recurring_hazards
        .groupby("HAZARD_CATEGORY", as_index=False)
        .agg(
            unresolved_reports=("unresolved_count", "sum"),
            critical_reports=("critical_count", "sum"),
            overdue_reports=("overdue_count", "sum")
        )
        .sort_values(
            "unresolved_reports",
            ascending=False
        )
    )

    st.bar_chart(
        category_summary.set_index("HAZARD_CATEGORY")[
            "unresolved_reports"
        ]
    )

    st.caption(
        "Counts reflect documented issue reports, not "
        "unique physical hazards or predicted injuries."
    )

# ============================================================
# TAB 2: PROJECT INVESTIGATION
# ============================================================

with tab2:

    st.header("Project Hazard Investigation")

    workflow = st.radio(
        "Choose review workflow",
        [
            "Active-Site Safety",
            "Completed-Project Closure"
        ],
        horizontal=True
    )

    if workflow == "Active-Site Safety":
        selected_queue = active_queue
    else:
        selected_queue = completed_queue

    if selected_queue.empty:
        st.info("No projects found in this review queue.")

    else:
        selected_job = st.selectbox(
            "Select project",
            selected_queue["JOB_ID"].tolist(),
            key="investigation_job"
        )

        project_summary = selected_queue[
            selected_queue["JOB_ID"] == selected_job
        ].iloc[0]

        col1, col2, col3, col4 = st.columns(4)

        col1.metric(
            "Unresolved Reports",
            int(project_summary["unresolved_reports"])
        )

        col2.metric(
            "Critical Reports",
            int(project_summary["critical_reports"])
        )

        col3.metric(
            "Overdue Reports",
            int(project_summary["overdue_reports"])
        )

        col4.metric(
            "Hazard Categories",
            int(project_summary["hazard_categories"])
        )

        st.divider()

        project_alerts = recurring_hazards[
            recurring_hazards["JOB_ID"] == selected_job
        ].copy()

        st.subheader("Hazards Requiring Review")

        st.dataframe(
            project_alerts[
                [
                    "HAZARD_CATEGORY",
                    "unresolved_count",
                    "critical_count",
                    "high_count",
                    "overdue_count",
                    "PRIORITY",
                    "REVIEW_TYPE"
                ]
            ],
            hide_index=True,
            width="stretch"
        )

        # ----------------------------------------------------
        # HAZARD DRILL-DOWN
        # ----------------------------------------------------

        st.subheader("🔍 Investigate a Hazard Category")

        selected_category = st.selectbox(
            "Select hazard category",
            project_alerts["HAZARD_CATEGORY"].tolist(),
            key="investigation_category"
        )

        selected_alert = project_alerts[
            project_alerts["HAZARD_CATEGORY"] == selected_category
        ].iloc[0]

        st.write(
            f"**Review Priority:** {selected_alert['PRIORITY']}"
        )

        st.write(
            f"**Review Type:** {selected_alert['REVIEW_TYPE']}"
        )

        st.info(selected_alert["RECOMMENDATION"])

        evidence = unresolved_issues[
            (unresolved_issues["JOB_ID"] == selected_job)
            & (
                unresolved_issues["HAZARD_CATEGORY"]
                == selected_category
            )
        ].copy()

        st.write(
            f"### Supporting Issue Records ({len(evidence)})"
        )

        evidence_columns = [
            "ISSUE_ID",
            "OPEN_DATE",
            "ISSUE_DESCRIPTION",
            "SEVERITY",
            "STATUS",
            "DUE_DATE",
            "CLOSURE_DATE",
            "IS_OVERDUE"
        ]

        st.dataframe(
            evidence[evidence_columns].sort_values("OPEN_DATE"),
            hide_index=True,
            width="stretch"
        )

        # ----------------------------------------------------
        # HISTORICAL INCIDENT COMPARISON
        # ----------------------------------------------------

        st.subheader("Related Historical Incidents")

        project_incidents = incidents[
            incidents["JOB_ID"] == selected_job
        ].copy()

        if selected_category not in hazard_mapping:
            st.info(
                "No reviewed incident mapping exists for this "
                "hazard category. Historical incident relevance "
                "has not been evaluated."
            )

        else:
            matching_subcategories = (
                hazard_mapping[selected_category]
            )

            related_incidents = project_incidents[
                project_incidents["HAZARD_SUBCATEGORY"].isin(
                    matching_subcategories
                )
            ].copy()

            if related_incidents.empty:
                st.warning(
                    "No matching historical incidents were found "
                    "for this project and hazard category. "
                    "This does not mean the hazard is risk-free."
                )

            else:
                st.success(
                    f"Found {len(related_incidents)} potentially "
                    "related historical incident(s)."
                )

                st.dataframe(
                    related_incidents[
                        [
                            "INCIDENT_ID",
                            "INCIDENT_DATE",
                            "INCIDENT_CLASSIFICATION",
                            "OSHA_HAZARD_CATEGORY",
                            "HAZARD_SUBCATEGORY"
                        ]
                    ].sort_values("INCIDENT_DATE"),
                    hide_index=True,
                    width="stretch"
                )

        st.caption(
            "Historical incident matches are contextual evidence. "
            "They do not demonstrate that a reported issue caused "
            "an incident."
        )

# ============================================================
# TAB 3: HISTORICAL INCIDENTS
# ============================================================

with tab3:

    st.header("Historical Safety Incidents")

    col1, col2 = st.columns(2)

    col1.metric(
        "All Historical Incidents",
        len(incidents)
    )

    recordable_types = [
        "Lost Time Accident",
        "REC",
        "RECR"
    ]

    recordable_incidents = incidents[
        incidents["INCIDENT_CLASSIFICATION"].isin(
            recordable_types
        )
    ]

    col2.metric(
        "Recordable Incidents",
        len(recordable_incidents)
    )

    st.caption(
        "Recordable classification follows the selected "
        "dataset categories; First Aid is excluded."
    )

    st.subheader("Incident Classifications")

    classification_counts = (
        incidents["INCIDENT_CLASSIFICATION"]
        .value_counts()
    )

    st.bar_chart(classification_counts)

    st.subheader("Historical Incident Records")

    incident_projects = sorted(
        incidents["JOB_ID"].dropna().unique().tolist()
    )

    incident_project = st.selectbox(
        "Filter by project",
        ["All Projects"] + incident_projects,
        key="historical_project"
    )

    if incident_project == "All Projects":
        filtered_incidents = incidents
    else:
        filtered_incidents = incidents[
            incidents["JOB_ID"] == incident_project
        ]

    st.dataframe(
        filtered_incidents[
            [
                "INCIDENT_ID",
                "JOB_ID",
                "INCIDENT_DATE",
                "INCIDENT_CLASSIFICATION",
                "OSHA_HAZARD_CATEGORY",
                "HAZARD_SUBCATEGORY"
            ]
        ].sort_values("INCIDENT_DATE"),
        hide_index=True,
        width="stretch"
    )

    st.subheader("Incident Category Relationships")

    category_relationships = (
        incidents[
            [
                "OSHA_HAZARD_CATEGORY",
                "HAZARD_SUBCATEGORY"
            ]
        ]
        .drop_duplicates()
        .sort_values(
            [
                "OSHA_HAZARD_CATEGORY",
                "HAZARD_SUBCATEGORY"
            ]
        )
    )

    st.dataframe(
        category_relationships,
        hide_index=True,
        width="stretch"
    )

# ============================================================
# TAB 4: DATA QUALITY AND METHODOLOGY
# ============================================================

with tab4:

    st.header("Data Quality & Methodology")

    st.subheader("Dataset Validation")

    missing_project_status = (
        issues["PROJECT_STATUS"].isna().sum()
    )

    missing_issue_dates = (
        issues["OPEN_DATE"].isna().sum()
    )

    missing_due_dates = (
        issues["DUE_DATE"].isna().sum()
    )

    missing_incident_dates = (
        incidents["INCIDENT_DATE"].isna().sum()
    )

    quality_metrics = pd.DataFrame({
        "Check": [
            "Issues without matching project status",
            "Issues with missing/invalid open dates",
            "Issues with missing/invalid due dates",
            "Incidents with missing/invalid incident dates",
            "Issues after reporting cutoff (excluded)",
            "Incidents after reporting cutoff (excluded)"
        ],
        "Count": [
            missing_project_status,
            missing_issue_dates,
            missing_due_dates,
            missing_incident_dates,
            len(future_issues),
            len(future_incidents)
        ]
    })

    st.dataframe(
        quality_metrics,
        hide_index=True,
        width="stretch"
    )

    st.subheader("Methodology")

    st.markdown("""
    **1. Unresolved reports**

    Reports without a documented closure date by the
    reporting cutoff are flagged for review.

    **2. Overdue reports**

    Unresolved reports with a due date earlier than
    September 30, 2026 are marked overdue.

    **3. Active-site escalation**

    Critical reports receive urgent review priority.
    Other reports are reviewed based on overdue status
    and severity.

    **4. Completed-project reviews**

    Unresolved reports from completed projects trigger
    closure-documentation reviews rather than claims
    of current on-site danger.

    **5. Historical incident matching**

    Incident subcategories are matched using explicit
    mappings that require human review.

    **6. Limitations**

    - The engine is rule-based, not a predictive ML model.
    - Repeated reports may describe the same condition.
    - Missing closure records do not prove a hazard persists.
    - Incident associations do not establish causation.
    - Historical status changes may not be fully reconstructable.
    - Reporting practices and data quality affect the results.
    """)

    st.subheader("Export Review Data")

    export_data = recurring_hazards.drop(
        columns=["PRIORITY_ORDER"],
        errors="ignore"
    )

    st.download_button(
        label="📥 Download Hazard Review Results",
        data=export_data.to_csv(index=False),
        file_name="hazard_review_results.csv",
        mime="text/csv"
    )

# ============================================================
# FOOTER
# ============================================================

st.divider()

st.caption(
    "Layton Construction Safety Analytics | "
    "Historical reporting snapshot: September 30, 2026 | "
    "Decision-support tool — human safety review required"
)
