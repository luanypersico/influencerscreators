create or replace function public.get_my_post_auth_destination()
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  if exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('super_admin', 'admin')
  ) then return '/admin'; end if;

  if exists (
    select 1 from public.product_collaborators pc
    join public.products p on p.id = pc.product_id
    where pc.user_id = auth.uid() and p.slug = 'bergamo'
      and pc.role = 'coproducer' and pc.status = 'active'
  ) then return '/coprodutor/bergamo'; end if;

  return '/membros';
end;
$$;

revoke all on function public.get_my_post_auth_destination() from public, anon;
grant execute on function public.get_my_post_auth_destination() to authenticated;
