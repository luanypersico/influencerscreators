-- Prevent authenticated callers from using authorization helpers to inspect another user.
-- Existing RLS policies preserve their current calls with auth.uid(); trusted server calls
-- retain cross-user capability only when made with a service_role JWT.

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when (select auth.role()) = 'service_role'
      then exists (
        select 1
        from public.user_roles
        where user_id = _user_id
          and role = _role
      )
    when _user_id = (select auth.uid())
      then exists (
        select 1
        from public.user_roles
        where user_id = _user_id
          and role = _role
      )
    else false
  end;
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when (select auth.role()) = 'service_role'
      then exists (
        select 1
        from public.user_roles
        where user_id = _user_id
          and role in ('super_admin', 'admin')
      )
    when _user_id = (select auth.uid())
      then exists (
        select 1
        from public.user_roles
        where user_id = _user_id
          and role in ('super_admin', 'admin')
      )
    else false
  end;
$$;

create or replace function public.is_super_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when (select auth.role()) = 'service_role'
      then exists (
        select 1
        from public.user_roles
        where user_id = _user_id
          and role = 'super_admin'
      )
    when _user_id = (select auth.uid())
      then exists (
        select 1
        from public.user_roles
        where user_id = _user_id
          and role = 'super_admin'
      )
    else false
  end;
$$;

create or replace function public.has_product_access(_user_id uuid, _product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when (select auth.role()) = 'service_role'
      then exists (
        select 1
        from public.product_access
        where user_id = _user_id
          and product_id = _product_id
          and revoked_at is null
          and suspended_at is null
          and (expires_at is null or expires_at > now())
      ) or public.is_admin(_user_id)
    when _user_id = (select auth.uid())
      then exists (
        select 1
        from public.product_access
        where user_id = _user_id
          and product_id = _product_id
          and revoked_at is null
          and suspended_at is null
          and (expires_at is null or expires_at > now())
      ) or public.is_admin(_user_id)
    else false
  end;
$$;

-- Helpers used by RLS require authenticated execution; their bodies now enforce
-- identity ownership. Server-side cross-user checks require service_role.
revoke all on function public.has_product_access(uuid, uuid) from public, anon;
revoke all on function public.has_role(uuid, public.app_role) from public, anon;
revoke all on function public.is_admin(uuid) from public, anon;
revoke all on function public.is_super_admin(uuid) from public, anon;

grant execute on function public.has_product_access(uuid, uuid) to authenticated, service_role;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;
grant execute on function public.is_admin(uuid) to authenticated, service_role;
grant execute on function public.is_super_admin(uuid) to authenticated, service_role;

-- Keep the public catalog deliberately narrow and the remaining RPCs server-only.
revoke all on function public.get_bergamo_public_catalog() from public;
grant execute on function public.get_bergamo_public_catalog() to anon, authenticated, service_role;

revoke all on function public.find_user_id_by_email(text) from public, anon, authenticated;
grant execute on function public.find_user_id_by_email(text) to service_role;

revoke all on function public.process_hotmart_event(uuid, uuid, text, text, timestamptz, text, text, jsonb, uuid, text, text, integer) from public, anon, authenticated;
grant execute on function public.process_hotmart_event(uuid, uuid, text, text, timestamptz, text, text, jsonb, uuid, text, text, integer) to service_role;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.enforce_bergamo_only_integration() from public, anon, authenticated;
