-- Sample reports for the demo profile (Jordan Reyes). Run after schema.sql.
-- Safe to re-run: it removes the previous sample rows first.
-- The first one is still "Submitted", so it shows Edit / Delete in the app.

delete from reports where attachments->>'seed' = 'true';

insert into reports (form_id, reporter, status, created_at, fields, attachments)
select form_id, 'Jordan Reyes', status, now() - make_interval(days => days_ago),
       -- each sample gets its form's date field, counted back from today
       fields || jsonb_build_object(
         case form_id when 'issue' then 'OPEN_DATE' when 'incident' then 'INCIDENT_DATE'
                      when 'daily-journal' then 'JOURNAL_DATE' else 'REPORT_DATE' end,
         (current_date - days_ago)::text),
       '{"seed": true}'
from (values
  ('good-catch', 1, 'Submitted', '{"JOB_ID": "JOB-001", "HAZARD_CATEGORY": "Ergonomics", "GOOD_CATCH_DESCRIPTION": "A laborer was about to lift a full bundle of drywall alone. Stopped him and brought a cart.", "POTENTIAL_SEVERITY": "Medium", "IMMEDIATE_ACTION_TAKEN": "Used a cart and a second person.", "FOLLOW_UP_REQUIRED_FLAG": "N", "FOLLOW_UP_STATUS": "Not Required"}'::jsonb),
  ('issue', 3, 'Closed', '{"JOB_ID": "JOB-007", "ISSUE_DESCRIPTION": "An unprotected floor opening was observed without a secured cover or guardrail.", "HAZARD_CATEGORY": "Fall Protection", "SEVERITY": "High", "ROOT_CAUSE": "Guarding", "STATUS": "Closed"}'::jsonb),
  ('good-catch', 4, 'Completed', '{"JOB_ID": "JOB-007", "HAZARD_CATEGORY": "Electrical", "GOOD_CATCH_DESCRIPTION": "A damaged extension cord was found before tools were energized.", "POTENTIAL_SEVERITY": "Medium", "IMMEDIATE_ACTION_TAKEN": "Cord removed from service.", "FOLLOW_UP_REQUIRED_FLAG": "Y", "FOLLOW_UP_STATUS": "Completed"}'::jsonb),
  ('issue', 6, 'In Progress', '{"JOB_ID": "JOB-002", "ISSUE_DESCRIPTION": "An unprotected floor opening was observed without a secured cover or guardrail.", "HAZARD_CATEGORY": "Fall Protection", "SEVERITY": "High", "ROOT_CAUSE": "Guarding", "STATUS": "In Progress"}'::jsonb),
  ('issue', 9, 'Closed', '{"JOB_ID": "JOB-008", "ISSUE_DESCRIPTION": "The permit board lacked an updated atmospheric test.", "HAZARD_CATEGORY": "Confined Space", "SEVERITY": "Critical", "ROOT_CAUSE": "Procedure", "STATUS": "Closed"}'::jsonb),
  ('incident', 12, 'Review complete', '{"JOB_ID": "JOB-001", "INCIDENT_CLASSIFICATION": "First Aid", "OSHA_HAZARD_CATEGORY": "Other", "HAZARD_SUBCATEGORY": "Manual Material Handling", "BODY_PART_INJURED": "Wrist", "INCIDENT_DESCRIPTION": "While performing work involving manual material handling, the worker sustained a minor injury to the wrist. Basic first aid was provided on site."}'::jsonb),
  ('good-catch', 14, 'Follow-up open', '{"JOB_ID": "JOB-001", "HAZARD_CATEGORY": "Struck-By", "GOOD_CATCH_DESCRIPTION": "Spotter stopped a backing vehicle before it entered a pedestrian route.", "POTENTIAL_SEVERITY": "High", "IMMEDIATE_ACTION_TAKEN": "Traffic stopped; route barricaded.", "FOLLOW_UP_REQUIRED_FLAG": "Y", "FOLLOW_UP_STATUS": "Open"}'::jsonb),
  ('good-catch', 21, 'No follow-up needed', '{"JOB_ID": "JOB-002", "HAZARD_CATEGORY": "Electrical", "GOOD_CATCH_DESCRIPTION": "Damaged extension cord was found before tools were used.", "POTENTIAL_SEVERITY": "Medium", "IMMEDIATE_ACTION_TAKEN": "Cord removed from service.", "FOLLOW_UP_REQUIRED_FLAG": "N", "FOLLOW_UP_STATUS": "Not Required"}'::jsonb),
  ('daily-journal', 22, 'Filed', '{"JOB_ID": "JOB-001", "HEADCOUNT": "42", "REGULAR_HOURS": "336", "OVERTIME_HOURS": "34.4", "TOTAL_HOURS": "370.4", "WORK_ACTIVITY": "Structural framing", "WEATHER": "Snow"}'::jsonb)
) as s(form_id, days_ago, status, fields);
