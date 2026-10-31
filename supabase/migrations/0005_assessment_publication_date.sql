-- Track the actual publication date separately from the assessment creation date.
alter table public.assessments add column if not exists published_at timestamptz;
create index if not exists assessments_published_at_idx on public.assessments(kind,is_published,published_at desc);
