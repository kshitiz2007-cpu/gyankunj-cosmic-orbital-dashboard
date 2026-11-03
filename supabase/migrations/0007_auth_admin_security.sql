-- Authentication & Admin Security 2.0
-- Apply this migration in the Supabase SQL Editor before enabling the new admin middleware.

alter table public.profiles
  add column if not exists is_active boolean not null default true;

-- Trusted SQL editor/service operations may bootstrap or repair roles when auth.uid() is null.
-- Authenticated non-admin users cannot change their own role or account activation state.
create or replace function public.protect_profile_security_fields()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'Profile identity cannot be changed';
  end if;

  if auth.uid() is not null and new.email is distinct from old.email
     and auth.uid() = old.id then
    raise exception 'Email must be changed through the authentication provider';
  end if;

  if (new.role is distinct from old.role or new.is_active is distinct from old.is_active)
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Only an administrator can change account roles or access status';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_role_before_update on public.profiles;
create trigger protect_profile_security_fields_before_update
before update on public.profiles
for each row execute procedure public.protect_profile_security_fields();

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  target_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_logs enable row level security;
drop policy if exists "admin audit logs readable by admins" on public.admin_audit_logs;
create policy "admin audit logs readable by admins"
  on public.admin_audit_logs for select to authenticated
  using (public.is_admin());

create or replace function public.audit_profile_security_changes()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.role is distinct from old.role then
    insert into public.admin_audit_logs(actor_id,target_user_id,action,details)
    values(auth.uid(),old.id,'profile.role_changed',
      jsonb_build_object('old_role',old.role,'new_role',new.role));
  end if;

  if new.is_active is distinct from old.is_active then
    insert into public.admin_audit_logs(actor_id,target_user_id,action,details)
    values(auth.uid(),old.id,'profile.access_status_changed',
      jsonb_build_object('old_is_active',old.is_active,'new_is_active',new.is_active));
  end if;

  return new;
end;
$$;

drop trigger if exists audit_profile_security_changes_after_update on public.profiles;
create trigger audit_profile_security_changes_after_update
after update of role,is_active on public.profiles
for each row execute procedure public.audit_profile_security_changes();

create index if not exists admin_audit_logs_created_at_idx
  on public.admin_audit_logs(created_at desc);
create index if not exists admin_audit_logs_target_user_idx
  on public.admin_audit_logs(target_user_id,created_at desc);

-- Keep audit data append-only from authenticated application clients.
revoke insert, update, delete on public.admin_audit_logs from anon, authenticated;
grant select on public.admin_audit_logs to authenticated;
