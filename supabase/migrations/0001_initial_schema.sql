-- Gyankunj fresh Supabase schema — run in Supabase SQL Editor.
-- Safe baseline: no user data is inserted. RLS is enabled on every application table.
create extension if not exists pgcrypto;

create type public.app_role as enum ('student','faculty','admin');
create type public.resource_type as enum ('text','pdf','image');
create type public.assessment_kind as enum ('quiz','daily_drill','mock');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role public.app_role not null default 'student',
  exam_target text,
  preferred_language text not null default 'hi-en',
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null,
  name_hi text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  is_published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create table public.batches (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete set null,
  name text not null,
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now()
);
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  batch_id uuid not null references public.batches(id) on delete cascade,
  status text not null default 'active',
  enrolled_at timestamptz not null default now(),
  unique(student_id,batch_id)
);
create table public.study_resources (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references public.subjects(id) on delete set null,
  title_en text not null,
  title_hi text,
  topic text,
  resource_type public.resource_type not null default 'text',
  content_text text,
  storage_path text,
  is_published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  constraint resource_payload_check check (
    (resource_type='text' and content_text is not null) or
    (resource_type in ('pdf','image') and storage_path is not null)
  )
);
create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind public.assessment_kind not null,
  subject_id uuid references public.subjects(id) on delete set null,
  duration_minutes int not null default 15,
  negative_mark numeric(5,2) not null default 0,
  is_published boolean not null default false,
  available_from timestamptz,
  available_until timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references public.assessments(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  topic text,
  question_en text not null,
  question_hi text not null,
  options_en jsonb not null,
  options_hi jsonb not null,
  correct_option smallint not null check(correct_option between 0 and 3),
  explanation_en text,
  explanation_hi text,
  difficulty text not null default 'moderate',
  created_at timestamptz not null default now(),
  constraint options_en_four check(jsonb_typeof(options_en)='array' and jsonb_array_length(options_en)=4),
  constraint options_hi_four check(jsonb_typeof(options_hi)='array' and jsonb_array_length(options_hi)=4)
);
create table public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  score numeric(8,2),
  started_at timestamptz not null default now(),
  submitted_at timestamptz
);
create table public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  faculty_id uuid references public.profiles(id) on delete set null,
  batch_id uuid references public.batches(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  delivery_mode text not null default 'online',
  meeting_url text,
  recording_path text,
  status text not null default 'draft',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  constraint class_time_valid check(ends_at>starts_at)
);
create table public.student_activity (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  activity_type text not null,
  reference_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  is_published boolean not null default false,
  published_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create or replace function public.current_user_role()
returns public.app_role language sql stable security definer set search_path=public
as $$ select role from public.profiles where id=auth.uid() $$;
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select coalesce(public.current_user_role()='admin',false) $$;
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public
as $$ begin
  insert into public.profiles(id,email,full_name)
  values(new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',''));
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Prevent users from promoting themselves by editing their own profile.
create or replace function public.protect_profile_role()
returns trigger language plpgsql set search_path=public
as $ begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only an administrator can change account roles';
  end if;
  return new;
end; $;
create trigger protect_profile_role_before_update
before update on public.profiles
for each row execute procedure public.protect_profile_role();

do $$ declare t text; begin
  foreach t in array array['profiles','subjects','courses','batches','enrollments','study_resources','assessments','questions','assessment_attempts','class_sessions','student_activity','announcements'] loop
    execute format('alter table public.%I enable row level security',t);
  end loop;
end $$;

create policy "profiles read self or admin" on public.profiles for select using(id=auth.uid() or public.is_admin());
create policy "profiles update self or admin" on public.profiles for update using(id=auth.uid() or public.is_admin()) with check(id=auth.uid() or public.is_admin());
create policy "subjects visible to authenticated" on public.subjects for select to authenticated using(true);
create policy "subjects admin manage" on public.subjects for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "published courses readable" on public.courses for select to authenticated using(is_published or public.is_admin());
create policy "courses admin manage" on public.courses for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "batches admin manage" on public.batches for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "enrollments student or admin read" on public.enrollments for select to authenticated using(student_id=auth.uid() or public.is_admin());
create policy "enrollments admin manage" on public.enrollments for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "published resources readable" on public.study_resources for select to authenticated using(is_published or public.is_admin());
create policy "resources admin manage" on public.study_resources for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "published assessments readable" on public.assessments for select to authenticated using(is_published or public.is_admin());
create policy "assessments admin manage" on public.assessments for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "questions readable with published assessment" on public.questions for select to authenticated using(public.is_admin() or exists(select 1 from public.assessments a where a.id=assessment_id and a.is_published));
create policy "questions admin manage" on public.questions for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "attempts student or admin" on public.assessment_attempts for select to authenticated using(student_id=auth.uid() or public.is_admin());
create policy "attempts student insert" on public.assessment_attempts for insert to authenticated with check(student_id=auth.uid());
create policy "attempts student update" on public.assessment_attempts for update to authenticated using(student_id=auth.uid() and submitted_at is null) with check(student_id=auth.uid());
create policy "class sessions published read" on public.class_sessions for select to authenticated using(status='published' or public.is_admin() or faculty_id=auth.uid());
create policy "class sessions admin manage" on public.class_sessions for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "activity student or admin read" on public.student_activity for select to authenticated using(student_id=auth.uid() or public.is_admin());
create policy "activity student insert" on public.student_activity for insert to authenticated with check(student_id=auth.uid());
create policy "announcements published read" on public.announcements for select to authenticated using(is_published or public.is_admin());
create policy "announcements admin manage" on public.announcements for all to authenticated using(public.is_admin()) with check(public.is_admin());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values
 ('study-resources','study-resources',false,52428800,array['application/pdf','image/jpeg','image/png','image/webp']),
 ('class-recordings','class-recordings',false,524288000,array['video/mp4','video/webm'])
on conflict(id) do nothing;
create policy "study resources authenticated read" on storage.objects for select to authenticated using(bucket_id='study-resources' and (public.is_admin() or exists(select 1 from public.study_resources r where r.storage_path=name and r.is_published)));
create policy "study resources admin upload" on storage.objects for insert to authenticated with check(bucket_id='study-resources' and public.is_admin());
create policy "study resources admin update" on storage.objects for update to authenticated using(bucket_id='study-resources' and public.is_admin()) with check(bucket_id='study-resources' and public.is_admin());
create policy "study resources admin delete" on storage.objects for delete to authenticated using(bucket_id='study-resources' and public.is_admin());
create policy "recordings admin manage" on storage.objects for all to authenticated using(bucket_id='class-recordings' and public.is_admin()) with check(bucket_id='class-recordings' and public.is_admin());
