-- Worker app reports. Run once in Supabase: SQL Editor → paste → Run.
-- The app writes through /api/submit (server key); nobody writes from the browser.

create table if not exists reports (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  form_id     text not null check (form_id in ('good-catch', 'issue', 'incident', 'daily-journal')),
  reporter    text,
  status      text not null default 'Submitted',
  fields      jsonb not null,               -- { DATASET_COLUMN: value }, same names as the CSVs
  attachments jsonb not null default '{}',  -- counts only: { photos, voiceClips, description }
  transcript  text,                         -- what the worker said or typed

  -- Copied out of `fields` so dashboards can filter and group without reading JSON.
  job_id             text generated always as (fields->>'JOB_ID') stored,
  report_date        text generated always as (coalesce(fields->>'OPEN_DATE', fields->>'REPORT_DATE', fields->>'INCIDENT_DATE', fields->>'JOURNAL_DATE')) stored,
  hazard_category    text generated always as (coalesce(fields->>'HAZARD_CATEGORY', fields->>'OSHA_HAZARD_CATEGORY')) stored,
  severity           text generated always as (coalesce(fields->>'SEVERITY', fields->>'POTENTIAL_SEVERITY')) stored,
  observed_condition text generated always as (fields->>'OBSERVED_CONDITION') stored,  -- one of the 10 recurring conditions, or 'Other'
  new_condition      text generated always as (fields->>'NEW_CONDITION') stored        -- filled when observed_condition = 'Other'
);

-- Locked by default: with RLS on and no policies, only the server key can read or write.
alter table reports enable row level security;

-- Example for the dashboard: new worker reports per recurring condition and job.
-- select observed_condition, job_id, count(*) as reports
-- from reports where form_id = 'issue'
-- group by 1, 2 order by reports desc;
