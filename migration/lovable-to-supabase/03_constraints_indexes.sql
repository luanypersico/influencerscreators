-- Constraints e índices observados no banco vivo.
BEGIN;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_audit_log_actor_id_fkey' AND conrelid = 'public."admin_audit_log"'::regclass) THEN
    ALTER TABLE public."admin_audit_log" ADD CONSTRAINT "admin_audit_log_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_audit_log_pkey' AND conrelid = 'public."admin_audit_log"'::regclass) THEN
    ALTER TABLE public."admin_audit_log" ADD CONSTRAINT "admin_audit_log_pkey" PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'app_settings_updated_by_fkey' AND conrelid = 'public."app_settings"'::regclass) THEN
    ALTER TABLE public."app_settings" ADD CONSTRAINT "app_settings_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'app_settings_pkey' AND conrelid = 'public."app_settings"'::regclass) THEN
    ALTER TABLE public."app_settings" ADD CONSTRAINT "app_settings_pkey" PRIMARY KEY (key);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'email_campaigns_audience_check' AND conrelid = 'public."email_campaigns"'::regclass) THEN
    ALTER TABLE public."email_campaigns" ADD CONSTRAINT "email_campaigns_audience_check" CHECK (audience = ANY (ARRAY['all'::text, 'buyers'::text, 'leads'::text, 'product'::text, 'manual'::text]));
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'email_campaigns_status_check' AND conrelid = 'public."email_campaigns"'::regclass) THEN
    ALTER TABLE public."email_campaigns" ADD CONSTRAINT "email_campaigns_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'sending'::text, 'sent'::text, 'failed'::text]));
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'email_campaigns_created_by_fkey' AND conrelid = 'public."email_campaigns"'::regclass) THEN
    ALTER TABLE public."email_campaigns" ADD CONSTRAINT "email_campaigns_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'email_campaigns_product_id_fkey' AND conrelid = 'public."email_campaigns"'::regclass) THEN
    ALTER TABLE public."email_campaigns" ADD CONSTRAINT "email_campaigns_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'email_campaigns_pkey' AND conrelid = 'public."email_campaigns"'::regclass) THEN
    ALTER TABLE public."email_campaigns" ADD CONSTRAINT "email_campaigns_pkey" PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'email_messages_status_check' AND conrelid = 'public."email_messages"'::regclass) THEN
    ALTER TABLE public."email_messages" ADD CONSTRAINT "email_messages_status_check" CHECK (status = ANY (ARRAY['queued'::text, 'sent'::text, 'failed'::text]));
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'email_messages_campaign_id_fkey' AND conrelid = 'public."email_messages"'::regclass) THEN
    ALTER TABLE public."email_messages" ADD CONSTRAINT "email_messages_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id) ON DELETE SET NULL;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'email_messages_pkey' AND conrelid = 'public."email_messages"'::regclass) THEN
    ALTER TABLE public."email_messages" ADD CONSTRAINT "email_messages_pkey" PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'email_templates_pkey' AND conrelid = 'public."email_templates"'::regclass) THEN
    ALTER TABLE public."email_templates" ADD CONSTRAINT "email_templates_pkey" PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'email_templates_slug_key' AND conrelid = 'public."email_templates"'::regclass) THEN
    ALTER TABLE public."email_templates" ADD CONSTRAINT "email_templates_slug_key" UNIQUE (slug);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_product_id_fkey' AND conrelid = 'public."leads"'::regclass) THEN
    ALTER TABLE public."leads" ADD CONSTRAINT "leads_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_pkey' AND conrelid = 'public."leads"'::regclass) THEN
    ALTER TABLE public."leads" ADD CONSTRAINT "leads_pkey" PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_status_check' AND conrelid = 'public."orders"'::regclass) THEN
    ALTER TABLE public."orders" ADD CONSTRAINT "orders_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'disputed'::text, 'refunded'::text, 'chargeback'::text, 'canceled'::text]));
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_product_id_fkey' AND conrelid = 'public."orders"'::regclass) THEN
    ALTER TABLE public."orders" ADD CONSTRAINT "orders_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_user_id_fkey' AND conrelid = 'public."orders"'::regclass) THEN
    ALTER TABLE public."orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_pkey' AND conrelid = 'public."orders"'::regclass) THEN
    ALTER TABLE public."orders" ADD CONSTRAINT "orders_pkey" PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payment_integrations_environment_check' AND conrelid = 'public."payment_integrations"'::regclass) THEN
    ALTER TABLE public."payment_integrations" ADD CONSTRAINT "payment_integrations_environment_check" CHECK (environment = ANY (ARRAY['test'::text, 'production'::text]));
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payment_integrations_provider_check' AND conrelid = 'public."payment_integrations"'::regclass) THEN
    ALTER TABLE public."payment_integrations" ADD CONSTRAINT "payment_integrations_provider_check" CHECK (provider = 'hotmart'::text);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payment_integrations_product_id_fkey' AND conrelid = 'public."payment_integrations"'::regclass) THEN
    ALTER TABLE public."payment_integrations" ADD CONSTRAINT "payment_integrations_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payment_integrations_pkey' AND conrelid = 'public."payment_integrations"'::regclass) THEN
    ALTER TABLE public."payment_integrations" ADD CONSTRAINT "payment_integrations_pkey" PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_access_source_check' AND conrelid = 'public."product_access"'::regclass) THEN
    ALTER TABLE public."product_access" ADD CONSTRAINT "product_access_source_check" CHECK (source = ANY (ARRAY['manual'::text, 'purchase'::text, 'gift'::text, 'trial'::text, 'hotmart'::text, 'manual_validation'::text, 'coproducer_preview'::text]));
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_access_granted_by_fkey' AND conrelid = 'public."product_access"'::regclass) THEN
    ALTER TABLE public."product_access" ADD CONSTRAINT "product_access_granted_by_fkey" FOREIGN KEY (granted_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_access_product_id_fkey' AND conrelid = 'public."product_access"'::regclass) THEN
    ALTER TABLE public."product_access" ADD CONSTRAINT "product_access_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_access_user_id_fkey' AND conrelid = 'public."product_access"'::regclass) THEN
    ALTER TABLE public."product_access" ADD CONSTRAINT "product_access_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_access_pkey' AND conrelid = 'public."product_access"'::regclass) THEN
    ALTER TABLE public."product_access" ADD CONSTRAINT "product_access_pkey" PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_access_user_id_product_id_key' AND conrelid = 'public."product_access"'::regclass) THEN
    ALTER TABLE public."product_access" ADD CONSTRAINT "product_access_user_id_product_id_key" UNIQUE (user_id, product_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_collaborators_role_check' AND conrelid = 'public."product_collaborators"'::regclass) THEN
    ALTER TABLE public."product_collaborators" ADD CONSTRAINT "product_collaborators_role_check" CHECK (role = ANY (ARRAY['coproducer'::text, 'editor'::text, 'support'::text]));
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_collaborators_status_check' AND conrelid = 'public."product_collaborators"'::regclass) THEN
    ALTER TABLE public."product_collaborators" ADD CONSTRAINT "product_collaborators_status_check" CHECK (status = ANY (ARRAY['active'::text, 'revoked'::text]));
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_collaborators_created_by_fkey' AND conrelid = 'public."product_collaborators"'::regclass) THEN
    ALTER TABLE public."product_collaborators" ADD CONSTRAINT "product_collaborators_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_collaborators_product_id_fkey' AND conrelid = 'public."product_collaborators"'::regclass) THEN
    ALTER TABLE public."product_collaborators" ADD CONSTRAINT "product_collaborators_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_collaborators_user_id_fkey' AND conrelid = 'public."product_collaborators"'::regclass) THEN
    ALTER TABLE public."product_collaborators" ADD CONSTRAINT "product_collaborators_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_collaborators_pkey' AND conrelid = 'public."product_collaborators"'::regclass) THEN
    ALTER TABLE public."product_collaborators" ADD CONSTRAINT "product_collaborators_pkey" PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_collaborators_product_id_user_id_key' AND conrelid = 'public."product_collaborators"'::regclass) THEN
    ALTER TABLE public."product_collaborators" ADD CONSTRAINT "product_collaborators_product_id_user_id_key" UNIQUE (product_id, user_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_item_revisions_changed_by_fkey' AND conrelid = 'public."product_item_revisions"'::regclass) THEN
    ALTER TABLE public."product_item_revisions" ADD CONSTRAINT "product_item_revisions_changed_by_fkey" FOREIGN KEY (changed_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_item_revisions_item_id_fkey' AND conrelid = 'public."product_item_revisions"'::regclass) THEN
    ALTER TABLE public."product_item_revisions" ADD CONSTRAINT "product_item_revisions_item_id_fkey" FOREIGN KEY (item_id) REFERENCES product_items(id) ON DELETE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_item_revisions_pkey' AND conrelid = 'public."product_item_revisions"'::regclass) THEN
    ALTER TABLE public."product_item_revisions" ADD CONSTRAINT "product_item_revisions_pkey" PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_item_revisions_item_id_version_key' AND conrelid = 'public."product_item_revisions"'::regclass) THEN
    ALTER TABLE public."product_item_revisions" ADD CONSTRAINT "product_item_revisions_item_id_version_key" UNIQUE (item_id, version);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_items_status_check' AND conrelid = 'public."product_items"'::regclass) THEN
    ALTER TABLE public."product_items" ADD CONSTRAINT "product_items_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]));
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_items_created_by_fkey' AND conrelid = 'public."product_items"'::regclass) THEN
    ALTER TABLE public."product_items" ADD CONSTRAINT "product_items_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_items_product_id_fkey' AND conrelid = 'public."product_items"'::regclass) THEN
    ALTER TABLE public."product_items" ADD CONSTRAINT "product_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_items_updated_by_fkey' AND conrelid = 'public."product_items"'::regclass) THEN
    ALTER TABLE public."product_items" ADD CONSTRAINT "product_items_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_items_pkey' AND conrelid = 'public."product_items"'::regclass) THEN
    ALTER TABLE public."product_items" ADD CONSTRAINT "product_items_pkey" PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_updates_status_check' AND conrelid = 'public."product_updates"'::regclass) THEN
    ALTER TABLE public."product_updates" ADD CONSTRAINT "product_updates_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]));
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_updates_created_by_fkey' AND conrelid = 'public."product_updates"'::regclass) THEN
    ALTER TABLE public."product_updates" ADD CONSTRAINT "product_updates_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_updates_product_id_fkey' AND conrelid = 'public."product_updates"'::regclass) THEN
    ALTER TABLE public."product_updates" ADD CONSTRAINT "product_updates_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_updates_pkey' AND conrelid = 'public."product_updates"'::regclass) THEN
    ALTER TABLE public."product_updates" ADD CONSTRAINT "product_updates_pkey" PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_status_check' AND conrelid = 'public."products"'::regclass) THEN
    ALTER TABLE public."products" ADD CONSTRAINT "products_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'active'::text, 'archived'::text]));
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_created_by_fkey' AND conrelid = 'public."products"'::regclass) THEN
    ALTER TABLE public."products" ADD CONSTRAINT "products_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_pkey' AND conrelid = 'public."products"'::regclass) THEN
    ALTER TABLE public."products" ADD CONSTRAINT "products_pkey" PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_slug_key' AND conrelid = 'public."products"'::regclass) THEN
    ALTER TABLE public."products" ADD CONSTRAINT "products_slug_key" UNIQUE (slug);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_status_check' AND conrelid = 'public."profiles"'::regclass) THEN
    ALTER TABLE public."profiles" ADD CONSTRAINT "profiles_status_check" CHECK (status = ANY (ARRAY['active'::text, 'blocked'::text]));
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_fkey' AND conrelid = 'public."profiles"'::regclass) THEN
    ALTER TABLE public."profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_pkey' AND conrelid = 'public."profiles"'::regclass) THEN
    ALTER TABLE public."profiles" ADD CONSTRAINT "profiles_pkey" PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_fkey' AND conrelid = 'public."user_roles"'::regclass) THEN
    ALTER TABLE public."user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_pkey' AND conrelid = 'public."user_roles"'::regclass) THEN
    ALTER TABLE public."user_roles" ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_role_key' AND conrelid = 'public."user_roles"'::regclass) THEN
    ALTER TABLE public."user_roles" ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE (user_id, role);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'webhook_events_processing_status_check' AND conrelid = 'public."webhook_events"'::regclass) THEN
    ALTER TABLE public."webhook_events" ADD CONSTRAINT "webhook_events_processing_status_check" CHECK (processing_status = ANY (ARRAY['received'::text, 'processed'::text, 'ignored'::text, 'error'::text]));
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'webhook_events_provider_check' AND conrelid = 'public."webhook_events"'::regclass) THEN
    ALTER TABLE public."webhook_events" ADD CONSTRAINT "webhook_events_provider_check" CHECK (provider = 'hotmart'::text);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'webhook_events_integration_id_fkey' AND conrelid = 'public."webhook_events"'::regclass) THEN
    ALTER TABLE public."webhook_events" ADD CONSTRAINT "webhook_events_integration_id_fkey" FOREIGN KEY (integration_id) REFERENCES payment_integrations(id) ON DELETE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'webhook_events_product_id_fkey' AND conrelid = 'public."webhook_events"'::regclass) THEN
    ALTER TABLE public."webhook_events" ADD CONSTRAINT "webhook_events_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'webhook_events_pkey' AND conrelid = 'public."webhook_events"'::regclass) THEN
    ALTER TABLE public."webhook_events" ADD CONSTRAINT "webhook_events_pkey" PRIMARY KEY (id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS admin_audit_created_idx ON public.admin_audit_log USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS email_messages_campaign_idx ON public.email_messages USING btree (campaign_id);
CREATE INDEX IF NOT EXISTS leads_email_idx ON public.leads USING btree (email);
CREATE INDEX IF NOT EXISTS orders_email_idx ON public.orders USING btree (buyer_email);
CREATE INDEX IF NOT EXISTS orders_product_idx ON public.orders USING btree (product_id);
CREATE UNIQUE INDEX IF NOT EXISTS orders_provider_ref_unique ON public.orders USING btree (provider, provider_ref) WHERE ((provider IS NOT NULL) AND (provider_ref IS NOT NULL));
CREATE UNIQUE INDEX IF NOT EXISTS payment_integrations_active_unique ON public.payment_integrations USING btree (provider, external_product_ucode, external_offer_id) WHERE active;
CREATE INDEX IF NOT EXISTS payment_integrations_product_idx ON public.payment_integrations USING btree (product_id);
CREATE INDEX IF NOT EXISTS product_access_user_idx ON public.product_access USING btree (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS product_access_user_product_unique ON public.product_access USING btree (user_id, product_id);
CREATE INDEX IF NOT EXISTS product_item_revisions_item_idx ON public.product_item_revisions USING btree (item_id, version DESC);
CREATE UNIQUE INDEX IF NOT EXISTS product_items_product_code_unique ON public.product_items USING btree (product_id, code) WHERE (code IS NOT NULL);
CREATE INDEX IF NOT EXISTS product_items_product_id_idx ON public.product_items USING btree (product_id);
CREATE INDEX IF NOT EXISTS product_items_status_idx ON public.product_items USING btree (product_id, status);
CREATE INDEX IF NOT EXISTS product_updates_product_idx ON public.product_updates USING btree (product_id, status, published_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_normalized_unique ON public.profiles USING btree (lower(TRIM(BOTH FROM email)));
CREATE UNIQUE INDEX IF NOT EXISTS webhook_events_idem_unique ON public.webhook_events USING btree (integration_id, external_event_id);
CREATE INDEX IF NOT EXISTS webhook_events_transaction_idx ON public.webhook_events USING btree (transaction_ref, event_occurred_at DESC);

COMMIT;
