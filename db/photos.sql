-- Private Storage bucket for report photos. Run once in Supabase: SQL Editor → paste → Run.
-- Private = no public links. The app gets short-lived signed links through /api/reports.
insert into storage.buckets (id, name, public)
values ('report-photos', 'report-photos', false)
on conflict (id) do nothing;
