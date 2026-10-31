-- Student-owned syllabus completion state. Safe additive migration.
create table if not exists public.student_topic_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  exam_key text not null default 'upsc-cse',
  paper_key text not null,
  topic_key text not null,
  topic_title text not null,
  item_text text not null,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(student_id, exam_key, topic_key)
);

alter table public.student_topic_progress enable row level security;
drop policy if exists "topic progress select own" on public.student_topic_progress;
create policy "topic progress select own" on public.student_topic_progress
  for select to authenticated using(student_id = auth.uid() or public.is_admin());
drop policy if exists "topic progress insert own" on public.student_topic_progress;
create policy "topic progress insert own" on public.student_topic_progress
  for insert to authenticated with check(student_id = auth.uid());
drop policy if exists "topic progress update own" on public.student_topic_progress;
create policy "topic progress update own" on public.student_topic_progress
  for update to authenticated using(student_id = auth.uid()) with check(student_id = auth.uid());
drop policy if exists "topic progress delete own" on public.student_topic_progress;
create policy "topic progress delete own" on public.student_topic_progress
  for delete to authenticated using(student_id = auth.uid());

create index if not exists student_topic_progress_student_idx
  on public.student_topic_progress(student_id, exam_key, completed_at desc);
create index if not exists student_activity_student_created_idx
  on public.student_activity(student_id, created_at desc);
create index if not exists assessment_attempts_student_submitted_idx
  on public.assessment_attempts(student_id, submitted_at desc);
