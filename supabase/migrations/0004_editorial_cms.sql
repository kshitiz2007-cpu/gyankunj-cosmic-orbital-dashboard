create table if not exists public.editorial_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null default 'POLITY & GOVERNANCE',
  title_en text not null,
  title_hi text not null,
  summary_en text not null,
  summary_hi text not null,
  content_en text not null,
  content_hi text not null,
  mains_question text,
  read_minutes int not null default 6 check(read_minutes between 1 and 60),
  is_published boolean not null default false,
  published_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.editorial_articles enable row level security;
drop policy if exists "published editorials readable" on public.editorial_articles;
create policy "published editorials readable" on public.editorial_articles
  for select to authenticated using(is_published or public.is_admin());
drop policy if exists "editorials admin manage" on public.editorial_articles;
create policy "editorials admin manage" on public.editorial_articles
  for all to authenticated using(public.is_admin()) with check(public.is_admin());
create index if not exists editorial_articles_published_date_idx
  on public.editorial_articles(is_published,published_at desc);
