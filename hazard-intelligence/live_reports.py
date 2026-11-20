"""Read-only bridge from the worker app's Supabase database to Streamlit review alerts.

The worker app (worker-app/ + api/) saves every submission to the Supabase table
`reports` (db/schema.sql) and its photos to the private `report-photos` bucket.
This module reads that same table, so the app and this dashboard share one database.

Configuration (first match wins, each looked up in the environment, then
Streamlit secrets, then the repo-root .env that `npm run dev` also uses):
  SUPABASE_URL + SUPABASE_SECRET_KEY   read the database directly (same keys as the worker app)
  DASHBOARD_URL + DASHBOARD_TOKEN      or go through the deployed /api/dashboard endpoint
"""
import json
import os
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
import pandas as pd

REPO_ROOT = Path(__file__).resolve().parent.parent
PHOTO_BUCKET = 'report-photos'
REPORT_COLUMNS = ('id,created_at,form_id,reporter,status,job_id,report_date,hazard_category,'
                  'severity,observed_condition,new_condition,transcript,fields,attachments')
CONFIG_KEYS = ('SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'DASHBOARD_URL', 'DASHBOARD_TOKEN')
# Each form keeps its free-text description under its own field name (see worker-app/forms.js).
DESCRIPTION_FIELDS = ('GOOD_CATCH_DESCRIPTION', 'ISSUE_DESCRIPTION', 'INCIDENT_DESCRIPTION')


def report_description(report):
    """The worker's written description, whichever form it came from."""
    fields = report.get('fields') if isinstance(report.get('fields'), dict) else {}
    for name in DESCRIPTION_FIELDS:
        text = str(fields.get(name) or '').strip()
        if text:
            return text
    return None


def _read_env_file(path):
    values = {}
    if not path.exists():
        return values
    for line in path.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        values[key.strip().removeprefix('export ').strip()] = value.strip().strip('"\'')
    return values


def load_config(secrets=None):
    """Collect connection settings without ever printing or returning them to the page."""
    env_file = _read_env_file(REPO_ROOT / '.env')
    config = {}
    for key in CONFIG_KEYS:
        value = os.environ.get(key)
        if not value and secrets is not None:
            try:
                value = secrets.get(key)
            except Exception:  # no secrets.toml is fine
                value = None
        config[key] = value or env_file.get(key) or ''
    return config


def data_source(config):
    if config.get('SUPABASE_URL') and config.get('SUPABASE_SECRET_KEY'):
        return 'supabase'
    if config.get('DASHBOARD_URL') and config.get('DASHBOARD_TOKEN'):
        return 'api'
    return None


def _request_json(url, headers, body=None, timeout=15):
    data = None
    if body is not None:
        data = json.dumps(body).encode('utf-8')
        headers = {**headers, 'Content-Type': 'application/json'}
    request = Request(url, data=data, headers={**headers, 'Accept': 'application/json'},
                      method='POST' if data is not None else 'GET')
    with urlopen(request, timeout=timeout) as response:
        return json.load(response)


def _supabase_headers(key):
    # New keys (sb_secret_...) go in `apikey` only; legacy service_role JWTs (eyJ...) also need Authorization.
    headers = {'apikey': key}
    if key.startswith('eyJ'):
        headers['Authorization'] = f'Bearer {key}'
    return headers


def fetch_reports_from_supabase(supabase_url, key, photo_link_seconds=3600):
    """Read the worker app's `reports` table, newest first, with signed photo links."""
    base = supabase_url.rstrip('/')
    headers = _supabase_headers(key)
    rows = _request_json(f'{base}/rest/v1/reports?order=created_at.desc&limit=5000&select={REPORT_COLUMNS}', headers)
    if not isinstance(rows, list):
        raise ValueError('Supabase returned an unexpected response.')

    paths = [p for row in rows for p in ((row.get('attachments') or {}).get('photoPaths') or [])]
    signed = {}
    if paths:
        try:
            result = _request_json(f'{base}/storage/v1/object/sign/{PHOTO_BUCKET}', headers,
                                   body={'expiresIn': photo_link_seconds, 'paths': paths})
            signed = {s['path']: f"{base}/storage/v1{s['signedURL']}" for s in result if s.get('signedURL')}
        except (HTTPError, URLError, TimeoutError, ValueError):
            signed = {}  # reports still load without photos

    out = []
    for row in rows:
        attachments = row.pop('attachments', None) or {}
        urls = [signed[p] for p in (attachments.get('photoPaths') or []) if p in signed]
        out.append({**row, 'photo_count': len(urls), 'photo_urls': urls})
    return out


def fetch_reports_from_api(base_url, token):
    """Fetch worker submissions through the deployed /api/dashboard. Never place the token in a URL."""
    url = base_url.rstrip('/') + '/api/dashboard'
    if not url.startswith(('https://', 'http://localhost:', 'http://127.0.0.1:')):
        raise ValueError('Use an HTTPS deployment URL (or localhost for development).')
    rows = _request_json(url, {'x-dashboard-token': token})
    if not isinstance(rows, list):
        raise ValueError('Dashboard API returned an unexpected response.')
    return rows


def fetch_reports(config):
    """Current worker submissions from whichever source is configured."""
    source = data_source(config)
    try:
        if source == 'supabase':
            return fetch_reports_from_supabase(config['SUPABASE_URL'], config['SUPABASE_SECRET_KEY'])
        if source == 'api':
            return fetch_reports_from_api(config['DASHBOARD_URL'], config['DASHBOARD_TOKEN'])
    except HTTPError as exc:
        raise RuntimeError(f'Cannot load worker reports: HTTP {exc.code} {exc.reason}') from exc
    except (URLError, TimeoutError, ValueError) as exc:
        raise RuntimeError(f'Cannot load worker reports: {exc}') from exc
    raise RuntimeError('No database configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY '
                       '(the same values the worker app uses).')


def reports_table(reports):
    """Flat table of every worker submission for display / export."""
    rows = []
    for r in reports:
        urls = r.get('photo_urls') or []
        rows.append({
            'Report ID': r.get('id'),
            'Submitted': pd.to_datetime(r.get('created_at'), errors='coerce', utc=True),
            'Form': r.get('form_id'),
            'Reporter': r.get('reporter'),
            'Status': r.get('status'),
            'Job': r.get('job_id'),
            'Report date': r.get('report_date'),
            'Hazard category': r.get('hazard_category'),
            'Severity': r.get('severity'),
            'Observed condition': r.get('observed_condition') or None,
            'New condition': r.get('new_condition') or None,
            'Description': report_description(r),
            'Action taken': (r.get('fields') or {}).get('IMMEDIATE_ACTION_TAKEN') or None,
            'Photos': len(urls),
            'First photo': urls[0] if urls else None,
            'Transcript': r.get('transcript'),
        })
    return pd.DataFrame(rows)


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
            'Description': report_description(r),
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
