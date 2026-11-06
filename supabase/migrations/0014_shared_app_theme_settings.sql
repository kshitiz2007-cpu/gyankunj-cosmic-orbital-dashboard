-- Shared app-wide appearance settings.
-- Every student reads the same published theme; only active admins can change it.
create table if not exists public.app_theme_settings (
  id text primary key check (id = 'global'),
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

alter table public.app_theme_settings enable row level security;

drop policy if exists "Theme settings readable by everyone" on public.app_theme_settings;
create policy "Theme settings readable by everyone"
  on public.app_theme_settings for select
  to anon, authenticated
  using (id = 'global');

drop policy if exists "Admins can insert global theme settings" on public.app_theme_settings;
create policy "Admins can insert global theme settings"
  on public.app_theme_settings for insert
  to authenticated
  with check (id = 'global' and public.is_admin());

drop policy if exists "Admins can update global theme settings" on public.app_theme_settings;
create policy "Admins can update global theme settings"
  on public.app_theme_settings for update
  to authenticated
  using (id = 'global' and public.is_admin())
  with check (id = 'global' and public.is_admin());

revoke all on public.app_theme_settings from anon, authenticated;
grant select on public.app_theme_settings to anon, authenticated;
grant insert, update on public.app_theme_settings to authenticated;

insert into public.app_theme_settings(id, settings)
values ('global', jsonb_build_object(
  'style','cosmic','theme','dark','density','comfortable','motion','dynamic',
  'palette','nebula','glass','frosted','glassIntensity',72
))
on conflict (id) do nothing;

-- Enable Supabase Realtime so active student sessions receive admin changes.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'app_theme_settings'
  ) then
    alter publication supabase_realtime add table public.app_theme_settings;
  end if;
end $$;
