-- UPSC Practice Engine 2.0 — reusable question bank foundation.
-- Additive migration: existing assessment/question rows and scoring RPCs remain compatible.
begin;

-- Existing questions become reusable bank records. Keep assessment_id for legacy
-- readers until the application has fully moved to assessment_questions.
alter table public.questions
  alter column assessment_id drop not null,
  add column if not exists question_type text not null default 'single_choice',
  add column if not exists difficulty_level text,
  add column if not exists source_name text,
  add column if not exists source_year smallint,
  add column if not exists source_reference text,
  add column if not exists is_verified boolean not null default false,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists topic_id uuid;

alter table public.questions
  add constraint questions_question_type_check
  check (question_type in ('single_choice','multiple_select','true_false'))
  not valid;
alter table public.questions
  validate constraint questions_question_type_check;

alter table public.questions
  add constraint questions_source_year_check
  check (source_year is null or source_year between 1950 and 2100)
  not valid;
alter table public.questions
  validate constraint questions_source_year_check;

-- A normalized topic tree supports Subject -> Topic -> Subtopic without
-- forcing the current free-text topic field to change immediately.
create table if not exists public.question_topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete restrict,
  parent_id uuid references public.question_topics(id) on delete restrict,
  slug text not null,
  title_en text not null,
  title_hi text not null,
  level smallint not null default 2 check (level between 1 and 3),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(subject_id, slug)
);

create index if not exists question_topics_subject_parent_idx
  on public.question_topics(subject_id, parent_id, sort_order);

alter table public.questions
  add constraint questions_topic_id_fkey
  foreign key (topic_id) references public.question_topics(id) on delete set null;

-- Assessment membership is now independent of the question record. This lets
-- the same verified question appear in a drill, topic practice and mock test.
create table if not exists public.assessment_questions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  position integer not null default 0 check (position >= 0),
  marks numeric(6,2) not null default 2 check (marks >= 0),
  negative_marks numeric(6,2) not null default 0 check (negative_marks >= 0),
  section_title text,
  created_at timestamptz not null default now(),
  unique(assessment_id, question_id),
  unique(assessment_id, position)
);

create index if not exists assessment_questions_question_idx
  on public.assessment_questions(question_id);
create index if not exists assessment_questions_order_idx
  on public.assessment_questions(assessment_id, position);

-- Backfill all current assessment/question relationships without changing IDs.
insert into public.assessment_questions(assessment_id, question_id, position)
select q.assessment_id, q.id,
       row_number() over (partition by q.assessment_id order by q.created_at, q.id) - 1
from public.questions q
where q.assessment_id is not null
on conflict (assessment_id, question_id) do nothing;

-- Reusable question bank records are readable only by admins until attached
-- to a published assessment. Existing published-assessment read policy remains.
alter table public.question_topics enable row level security;
alter table public.assessment_questions enable row level security;

drop policy if exists "question topics authenticated read" on public.question_topics;
create policy "question topics authenticated read"
  on public.question_topics for select to authenticated
  using (is_active or public.is_admin());

drop policy if exists "question topics admin manage" on public.question_topics;
create policy "question topics admin manage"
  on public.question_topics for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "assessment question membership read" on public.assessment_questions;
create policy "assessment question membership read"
  on public.assessment_questions for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.assessments a
      where a.id = assessment_questions.assessment_id and a.is_published
    )
  );

drop policy if exists "assessment question membership admin manage" on public.assessment_questions;
create policy "assessment question membership admin manage"
  on public.assessment_questions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Helpful lookup indexes for bank filters and existing assessment readers.
create index if not exists questions_subject_topic_difficulty_idx
  on public.questions(subject_id, topic_id, difficulty);
create index if not exists questions_source_year_idx
  on public.questions(source_year) where source_year is not null;
create index if not exists questions_unassigned_bank_idx
  on public.questions(created_at desc) where assessment_id is null;

commit;
