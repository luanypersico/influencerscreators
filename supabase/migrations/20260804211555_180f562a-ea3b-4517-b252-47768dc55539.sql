create type public.app_role as enum ('super_admin','admin','coproducer','support','member');

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  phone text,
  notes text,
  status text not null default 'active' check (status in ('active','blocked')),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select, insert, update, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role in ('super_admin','admin')
  )
$$;

create or replace function public.is_super_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = 'super_admin'
  )
$$;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text,
  description text,
  cover_url text,
  price_cents integer not null default 0,
  compare_at_cents integer,
  currency text not null default 'BRL',
  checkout_url text,
  checkout_url_secondary text,
  status text not null default 'draft' check (status in ('draft','active','archived')),
  is_coproduction boolean not null default false,
  coproducer_name text,
  coproducer_email text,
  revenue_share_pct numeric(5,2) default 0,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;

create table public.product_items (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  code text,
  title text not null,
  category text,
  prompt text,
  image_url text,
  is_free boolean not null default false,
  status text not null default 'active' check (status in ('active','hidden')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index product_items_product_id_idx on public.product_items(product_id);
grant select on public.product_items to anon;
grant select, insert, update, delete on public.product_items to authenticated;
grant all on public.product_items to service_role;
alter table public.product_items enable row level security;

create table public.product_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  source text not null default 'manual' check (source in ('manual','purchase','gift','trial')),
  granted_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create index product_access_user_idx on public.product_access(user_id);
grant select, insert, update, delete on public.product_access to authenticated;
grant all on public.product_access to service_role;
alter table public.product_access enable row level security;

create or replace function public.has_product_access(_user_id uuid, _product_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.product_access
    where user_id = _user_id and product_id = _product_id
      and revoked_at is null
      and (expires_at is null or expires_at > now())
  ) or public.is_admin(_user_id)
$$;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  buyer_email text not null,
  buyer_name text,
  amount_cents integer not null default 0,
  currency text not null default 'BRL',
  status text not null default 'pending' check (status in ('pending','paid','refunded','chargeback','canceled')),
  provider text,
  provider_ref text,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_product_idx on public.orders(product_id);
create index orders_email_idx on public.orders(buyer_email);
grant select, insert, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  phone text,
  source text,
  product_id uuid references public.products(id) on delete set null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index leads_email_idx on public.leads(email);
grant insert on public.leads to anon;
grant select, insert, update, delete on public.leads to authenticated;
grant all on public.leads to service_role;
alter table public.leads enable row level security;

create table public.email_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  subject text not null,
  body_html text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.email_templates to authenticated;
grant all on public.email_templates to service_role;
alter table public.email_templates enable row level security;

create table public.email_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  body_html text not null,
  audience text not null default 'all' check (audience in ('all','buyers','leads','product','manual')),
  product_id uuid references public.products(id) on delete set null,
  manual_recipients text[],
  status text not null default 'draft' check (status in ('draft','sending','sent','failed')),
  sent_count integer not null default 0,
  failed_count integer not null default 0,
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.email_campaigns to authenticated;
grant all on public.email_campaigns to service_role;
alter table public.email_campaigns enable row level security;

create table public.email_messages (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.email_campaigns(id) on delete set null,
  to_email text not null,
  subject text not null,
  status text not null default 'queued' check (status in ('queued','sent','failed')),
  error text,
  provider_ref text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index email_messages_campaign_idx on public.email_messages(campaign_id);
grant select, insert, update, delete on public.email_messages to authenticated;
grant all on public.email_messages to service_role;
alter table public.email_messages enable row level security;

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,
  action text not null,
  entity text,
  entity_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index admin_audit_created_idx on public.admin_audit_log(created_at desc);
grant select, insert on public.admin_audit_log to authenticated;
grant all on public.admin_audit_log to service_role;
alter table public.admin_audit_log enable row level security;

create table public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.app_settings to authenticated;
grant all on public.app_settings to service_role;
alter table public.app_settings enable row level security;

create policy "own profile select" on public.profiles for select to authenticated using (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid());
create policy "admins read profiles" on public.profiles for select to authenticated using (public.is_admin(auth.uid()));
create policy "admins write profiles" on public.profiles for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "own roles select" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "admins read roles" on public.user_roles for select to authenticated using (public.is_admin(auth.uid()));
create policy "super admin manages roles" on public.user_roles for all to authenticated using (public.is_super_admin(auth.uid())) with check (public.is_super_admin(auth.uid()));

create policy "public reads active products" on public.products for select to anon, authenticated using (status = 'active');
create policy "admins read all products" on public.products for select to authenticated using (public.is_admin(auth.uid()));
create policy "admins manage products" on public.products for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "public reads free items" on public.product_items for select to anon, authenticated
  using (status = 'active' and is_free = true);
create policy "buyers read items" on public.product_items for select to authenticated
  using (status = 'active' and public.has_product_access(auth.uid(), product_id));
create policy "admins manage items" on public.product_items for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "own access select" on public.product_access for select to authenticated using (user_id = auth.uid());
create policy "admins manage access" on public.product_access for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "own orders select" on public.orders for select to authenticated using (user_id = auth.uid());
create policy "admins manage orders" on public.orders for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "anyone can create lead" on public.leads for insert to anon, authenticated with check (true);
create policy "admins manage leads" on public.leads for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "admins manage templates" on public.email_templates for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins manage campaigns" on public.email_campaigns for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins manage messages" on public.email_messages for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "admins read audit" on public.admin_audit_log for select to authenticated using (public.is_admin(auth.uid()));
create policy "admins write audit" on public.admin_audit_log for insert to authenticated with check (public.is_admin(auth.uid()));

create policy "admins read settings" on public.app_settings for select to authenticated using (public.is_admin(auth.uid()));
create policy "super admin manages settings" on public.app_settings for all to authenticated
  using (public.is_super_admin(auth.uid())) with check (public.is_super_admin(auth.uid()));

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger product_items_updated_at before update on public.product_items for each row execute function public.set_updated_at();
create trigger product_access_updated_at before update on public.product_access for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger email_templates_updated_at before update on public.email_templates for each row execute function public.set_updated_at();
create trigger email_campaigns_updated_at before update on public.email_campaigns for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'member')
  on conflict do nothing;

  if new.email = 'trafegocomkrisan@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'super_admin')
    on conflict do nothing;
  end if;

  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, email, full_name)
select id, email, 'CEO' from auth.users where email = 'trafegocomkrisan@gmail.com'
on conflict (id) do nothing;

insert into public.user_roles (user_id, role)
select id, 'super_admin'::public.app_role from auth.users where email = 'trafegocomkrisan@gmail.com'
on conflict do nothing;

insert into public.products (slug, name, tagline, price_cents, compare_at_cents, status, is_coproduction, coproducer_name, revenue_share_pct, sort_order)
values
  ('bergamo', 'Arsenal Prompts Bergamo Creators', 'Biblioteca de prompts fotorrealistas para criadores', 3700, 9700, 'active', true, 'Bergamo Creators', 50, 1),
  ('influencers-creators', 'Influencers & Creators Studio', 'Estudio de prompts para influencers realistas', 0, null, 'active', false, null, 0, 2)
on conflict (slug) do nothing;

insert into public.app_settings (key, value) values
  ('brand', '{"company":"Influencers & Creators","support_email":"trafegocomkrisan@gmail.com"}'::jsonb),
  ('email', '{"from_name":"Influencers & Creators","from_email":""}'::jsonb)
on conflict (key) do nothing;