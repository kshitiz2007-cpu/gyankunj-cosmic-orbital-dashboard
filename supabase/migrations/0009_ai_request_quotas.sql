-- Per-user, database-backed quota for the Study Companion.
create table if not exists public.ai_request_quotas (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.ai_request_quotas enable row level security;
revoke all on public.ai_request_quotas from anon, authenticated;

create or replace function public.consume_ai_request_quota(
  p_window_seconds integer default 600,
  p_max_requests integer default 10
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_window integer := greatest(60, least(coalesce(p_window_seconds, 600), 3600));
  v_max integer := greatest(1, least(coalesce(p_max_requests, 10), 30));
  v_started timestamptz;
  v_count integer;
begin
  if v_user is null then
    raise exception 'Authentication required';
  end if;

  insert into public.ai_request_quotas(user_id, window_started_at, request_count, updated_at)
  values (v_user, now(), 1, now())
  on conflict (user_id) do update
  set window_started_at = case
        when now() >= public.ai_request_quotas.window_started_at + make_interval(secs => v_window)
          then now()
        else public.ai_request_quotas.window_started_at
      end,
      request_count = case
        when now() >= public.ai_request_quotas.window_started_at + make_interval(secs => v_window)
          then 1
        else public.ai_request_quotas.request_count + 1
      end,
      updated_at = now()
  returning window_started_at, request_count into v_started, v_count;

  return v_count <= v_max;
end;
$$;

revoke all on function public.consume_ai_request_quota(integer, integer) from public, anon;
grant execute on function public.consume_ai_request_quota(integer, integer) to authenticated;
