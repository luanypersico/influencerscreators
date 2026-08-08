-- Snapshot read-only do schema public do Lovable Cloud em 2026-08-07.
BEGIN;
SET LOCAL search_path = public, extensions;

CREATE TABLE IF NOT EXISTS public."admin_audit_log" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "actor_id" uuid,
  "actor_email" text,
  "action" text NOT NULL,
  "entity" text,
  "entity_id" text,
  "meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public."app_settings" (
  "key" text NOT NULL,
  "value" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "updated_by" uuid,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public."email_campaigns" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "subject" text NOT NULL,
  "body_html" text NOT NULL,
  "audience" text DEFAULT 'all'::text NOT NULL,
  "product_id" uuid,
  "manual_recipients" text[],
  "status" text DEFAULT 'draft'::text NOT NULL,
  "sent_count" integer DEFAULT 0 NOT NULL,
  "failed_count" integer DEFAULT 0 NOT NULL,
  "scheduled_at" timestamptz,
  "sent_at" timestamptz,
  "created_by" uuid,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public."email_messages" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "campaign_id" uuid,
  "to_email" text NOT NULL,
  "subject" text NOT NULL,
  "status" text DEFAULT 'queued'::text NOT NULL,
  "error" text,
  "provider_ref" text,
  "sent_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public."email_templates" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "name" text NOT NULL,
  "subject" text NOT NULL,
  "body_html" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public."leads" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "name" text,
  "phone" text,
  "source" text,
  "product_id" uuid,
  "meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public."orders" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid,
  "user_id" uuid,
  "buyer_email" text NOT NULL,
  "buyer_name" text,
  "amount_cents" integer DEFAULT 0 NOT NULL,
  "currency" text DEFAULT 'BRL'::text NOT NULL,
  "status" text DEFAULT 'pending'::text NOT NULL,
  "provider" text,
  "provider_ref" text,
  "paid_at" timestamptz,
  "notes" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public."payment_integrations" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "provider" text NOT NULL,
  "product_id" uuid NOT NULL,
  "environment" text DEFAULT 'production'::text NOT NULL,
  "external_product_ucode" text,
  "external_product_id" text,
  "external_offer_id" text,
  "active" boolean DEFAULT false NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public."product_access" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "source" text DEFAULT 'manual'::text NOT NULL,
  "granted_by" uuid,
  "expires_at" timestamptz,
  "revoked_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "suspended_at" timestamptz,
  "status_reason" text
);

CREATE TABLE IF NOT EXISTS public."product_collaborators" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "role" text NOT NULL,
  "status" text DEFAULT 'active'::text NOT NULL,
  "created_by" uuid,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "revoked_at" timestamptz
);

CREATE TABLE IF NOT EXISTS public."product_item_revisions" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "item_id" uuid NOT NULL,
  "version" integer NOT NULL,
  "title" text NOT NULL,
  "category" text,
  "description" text,
  "prompt" text,
  "status" text NOT NULL,
  "changed_by" uuid,
  "reason" text,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public."product_items" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid NOT NULL,
  "code" text,
  "title" text NOT NULL,
  "category" text,
  "prompt" text,
  "image_url" text,
  "is_free" boolean DEFAULT false NOT NULL,
  "status" text DEFAULT 'draft'::text NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "item_type" text DEFAULT 'prompt'::text NOT NULL,
  "description" text,
  "created_by" uuid,
  "updated_by" uuid,
  "published_at" timestamptz,
  "member_image_path" text
);

CREATE TABLE IF NOT EXISTS public."product_updates" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid NOT NULL,
  "title" text NOT NULL,
  "content" text NOT NULL,
  "status" text DEFAULT 'draft'::text NOT NULL,
  "created_by" uuid,
  "published_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public."products" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "name" text NOT NULL,
  "tagline" text,
  "description" text,
  "cover_url" text,
  "price_cents" integer DEFAULT 0 NOT NULL,
  "compare_at_cents" integer,
  "currency" text DEFAULT 'BRL'::text NOT NULL,
  "checkout_url" text,
  "checkout_url_secondary" text,
  "status" text DEFAULT 'draft'::text NOT NULL,
  "is_coproduction" boolean DEFAULT false NOT NULL,
  "coproducer_name" text,
  "coproducer_email" text,
  "revenue_share_pct" numeric(5,2) DEFAULT 0,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_by" uuid,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public."profiles" (
  "id" uuid NOT NULL,
  "email" text NOT NULL,
  "full_name" text,
  "avatar_url" text,
  "phone" text,
  "notes" text,
  "status" text DEFAULT 'active'::text NOT NULL,
  "last_seen_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public."user_roles" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "role" "public"."app_role" NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public."webhook_events" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "provider" text NOT NULL,
  "product_id" uuid NOT NULL,
  "integration_id" uuid NOT NULL,
  "external_event_id" text NOT NULL,
  "event_type" text NOT NULL,
  "event_occurred_at" timestamptz,
  "transaction_ref" text,
  "purchase_status" text,
  "payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "processing_status" text DEFAULT 'received'::text NOT NULL,
  "error_message" text,
  "received_at" timestamptz DEFAULT now() NOT NULL,
  "processed_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

COMMENT ON COLUMN public.product_items.member_image_path IS 'Caminho interno de imagem privada; exportado por fidelidade ao estado vivo, mas o bucket permanece bloqueado até revisão.';

COMMIT;
