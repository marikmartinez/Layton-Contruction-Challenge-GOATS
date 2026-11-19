"""Read-only bridge from the team's dashboard API to Streamlit review alerts."""
import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
import pandas as pd


def fetch_reports(base_url: str, token: str):
    """Fetch current worker submissions. Never place the token in a URL."""
    url = base_url.rstrip('/') + '/api/dashboard'
    if not url.startswith(('https://', 'http://localhost:', 'http://127.0.0.1:')):
        raise ValueError('Use an HTTPS deployment URL (or localhost for development).')
    request = Request(url, headers={'x-dashboard-token': token, 'Accept': 'application/json'})
    try:
        with urlopen(request, timeout=15) as response:
            rows = json.load(response)
    except (HTTPError, URLError, TimeoutError, ValueError) as exc:
        raise RuntimeError(f'Cannot load worker reports: {exc}') from exc
    if not isinstance(rows, list):
        raise ValueError('Dashboard API returned an unexpected response.')
    return rows


def build_live_alerts(reports, jobs, historical_issues, today=None):
    """Review candidates, not automatically verified hazards or dispatched notifications."""
    today = pd.Timestamp.today().normalize() if today is None else pd.Timestamp(today).normalize()
    status_by_job = dict(zip(jobs['JOB_ID'].astype(str), jobs['PROJECT_STATUS'].astype(str)))
    history = historical_issues.copy()
    history['JOB_ID'] = history['JOB_ID'].astype(str)
    history['OPEN_DATE'] = pd.to_datetime(history['OPEN_DATE'], errors='coerce')
    history['CLOSURE_DATE'] = pd.to_datetime(history['CLOSURE_DATE'], errors='coerce')
    history = history[(history['OPEN_DATE'].isna()) | (history['OPEN_DATE'] <= today)]
    history = history[history['CLOSURE_DATE'].isna() | (history['CLOSURE_DATE'] > today)]
    alerts = []
    for r in reports:
        form = r.get('form_id')
        if form not in ('issue', 'good-catch', 'incident'):
            continue
        f = r.get('fields') if isinstance(r.get('fields'), dict) else {}
        job = str(r.get('job_id') or f.get('JOB_ID') or '').strip()
        category = str(r.get('hazard_category') or f.get('HAZARD_CATEGORY') or f.get('OSHA_HAZARD_CATEGORY') or '').strip()
        severity = str(r.get('severity') or f.get('SEVERITY') or f.get('POTENTIAL_SEVERITY') or '').strip().title()
        status = str(f.get('STATUS') or r.get('status') or '').strip().lower()
        observed = str(r.get('observed_condition') or f.get('OBSERVED_CONDITION') or '').strip()
        project_status = status_by_job.get(job, 'Unknown')
        related = history[(history['JOB_ID'] == job) & (history['HAZARD_CATEGORY'].astype(str) == category)] if job and category else history.iloc[0:0]
        historical_count = len(related)
        due = pd.to_datetime(f.get('DUE_DATE'), errors='coerce')
        closed = pd.to_datetime(f.get('CLOSURE_DATE'), errors='coerce')
        # Closed form records aren't treated as current hazards; still available in API.
        unresolved = form == 'issue' and status not in ('closed', 'resolved') and (pd.isna(closed) or closed > today)
        overdue = bool(unresolved and pd.notna(due) and due.normalize() < today)
        followup = str(f.get('FOLLOW_UP_REQUIRED_FLAG') or '').strip().upper() == 'Y'
        followup_status = str(f.get('FOLLOW_UP_STATUS') or '').strip().lower()
        if form == 'issue' and not unresolved:
            continue
        if form == 'good-catch' and (not followup or followup_status in ('completed', 'not required')):
            continue
        if project_status == 'Completed':
            priority = 'Closure Documentation Review'
            action = 'Verify project closeout and whether this newly submitted report needs documentation review.'
            signal = 'Process'
        elif project_status != 'Active':
            priority = 'Verify Project Status'
            action = 'Confirm the job ID and project status before assigning a site safety review.'
            signal = 'Process'
        elif severity == 'Critical':
            priority = 'Urgent Review'
            action = 'Notify the site safety lead promptly; verify the condition and immediate controls.'
            signal = 'Process'
        elif severity == 'High' or overdue or form == 'incident':
            priority = 'High Priority Review'
            action = 'Assign a safety lead to review the report and verify corrective actions.'
            signal = 'Process'
        else:
            priority = 'Routine Review'
            action = 'Review the submitted report and determine whether follow-up is required.'
            signal = 'Process'
        if overdue:
            action += ' Confirm overdue corrective-action ownership and a new due date.'
        if historical_count:
            action += f' Review {historical_count} historical unresolved report(s) in this job/category; these may not be distinct conditions.'
        alerts.append({
            'Report ID': str(r.get('id', '')),
            'Submitted': str(r.get('created_at') or ''),
            'Job': job,
            'Project status': project_status,
            'Form': form,
            'Hazard category': category,
            'Observed condition': observed,
            'Severity': severity,
            'Priority': priority,
            'Signal': signal,
            'Overdue': overdue,
            'Historical unresolved (same job/category)': historical_count,
            'Recommended action': action,
            'Manager status': 'Needs review',
        })
    order = {'Urgent Review': 0, 'High Priority Review': 1, 'Routine Review': 2, 'Closure Documentation Review': 3, 'Verify Project Status': 4}
    return pd.DataFrame(alerts).sort_values('Priority', key=lambda s: s.map(order)).reset_index(drop=True) if alerts else pd.DataFrame()
