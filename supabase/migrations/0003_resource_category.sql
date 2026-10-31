-- Preserve the academic resource classification selected in Admin Content Studio.
alter table public.study_resources add column if not exists category text not null default 'Notes';
