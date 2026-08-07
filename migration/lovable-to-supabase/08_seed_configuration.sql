-- Dados de configuração/produto; nenhum segredo foi exportado.
BEGIN;

INSERT INTO public."products" ("checkout_url", "checkout_url_secondary", "compare_at_cents", "coproducer_email", "coproducer_name", "cover_url", "created_at", "created_by", "currency", "description", "id", "is_coproduction", "name", "price_cents", "revenue_share_pct", "slug", "sort_order", "status", "tagline", "updated_at") VALUES
(NULL, NULL, 9700, NULL, 'Bergamo Creators', NULL, '2026-08-04T21:15:55.774467+00:00', NULL, 'BRL', NULL, 'e23f2271-3450-4e69-972f-8f9ea0d27130', true, 'Arsenal Prompts Bergamo Creators', 2700, 50, 'bergamo', 1, 'draft', 'Biblioteca de prompts fotorrealistas para criadores', '2026-08-04T22:15:16.17421+00:00'),
(NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-04T21:15:55.774467+00:00', NULL, 'BRL', NULL, '2a7c0c3d-9bc9-4134-95fd-2f54a911b477', false, 'Influencers & Creators Studio', 0, 0, 'influencers-creators', 2, 'active', 'Estudio de prompts para influencers realistas', '2026-08-04T21:15:55.774467+00:00')
ON CONFLICT ("id") DO UPDATE SET "checkout_url"=EXCLUDED."checkout_url", "checkout_url_secondary"=EXCLUDED."checkout_url_secondary", "compare_at_cents"=EXCLUDED."compare_at_cents", "coproducer_email"=EXCLUDED."coproducer_email", "coproducer_name"=EXCLUDED."coproducer_name", "cover_url"=EXCLUDED."cover_url", "created_at"=EXCLUDED."created_at", "created_by"=EXCLUDED."created_by", "currency"=EXCLUDED."currency", "description"=EXCLUDED."description", "is_coproduction"=EXCLUDED."is_coproduction", "name"=EXCLUDED."name", "price_cents"=EXCLUDED."price_cents", "revenue_share_pct"=EXCLUDED."revenue_share_pct", "slug"=EXCLUDED."slug", "sort_order"=EXCLUDED."sort_order", "status"=EXCLUDED."status", "tagline"=EXCLUDED."tagline", "updated_at"=EXCLUDED."updated_at";

INSERT INTO public."app_settings" ("key", "updated_at", "updated_by", "value") VALUES
('brand', '2026-08-04T21:15:55.774467+00:00', NULL, '{"company":"Influencers & Creators","support_email":"trafegocomkrisan@gmail.com"}'::jsonb),
('email', '2026-08-04T21:15:55.774467+00:00', NULL, '{"from_email":"","from_name":"Influencers & Creators"}'::jsonb)
ON CONFLICT ("key") DO UPDATE SET "updated_at"=EXCLUDED."updated_at", "updated_by"=EXCLUDED."updated_by", "value"=EXCLUDED."value";

INSERT INTO public."payment_integrations" ("active", "created_at", "environment", "external_offer_id", "external_product_id", "external_product_ucode", "id", "product_id", "provider", "updated_at") VALUES
(false, '2026-08-04T22:15:16.17421+00:00', 'production', NULL, NULL, NULL, 'aca2e243-a4e7-4bbc-a27d-643898656ca6', 'e23f2271-3450-4e69-972f-8f9ea0d27130', 'hotmart', '2026-08-04T22:15:16.17421+00:00')
ON CONFLICT ("id") DO UPDATE SET "active"=EXCLUDED."active", "created_at"=EXCLUDED."created_at", "environment"=EXCLUDED."environment", "external_offer_id"=EXCLUDED."external_offer_id", "external_product_id"=EXCLUDED."external_product_id", "external_product_ucode"=EXCLUDED."external_product_ucode", "product_id"=EXCLUDED."product_id", "provider"=EXCLUDED."provider", "updated_at"=EXCLUDED."updated_at";

COMMIT;
