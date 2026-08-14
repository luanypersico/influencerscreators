-- member_offers: vitrine de ofertas recomendadas (afiliadas) na área de
-- membros. Deliberadamente isolada do domínio comercial interno do Arsenal —
-- nunca participa de orders, product_access, Hotmart ou entitlement. É só
-- conteúdo de recomendação; a compra e a entrega acontecem fora do Arsenal.
BEGIN;

CREATE TABLE IF NOT EXISTS public."member_offers" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "title" text NOT NULL,
  "description" text,
  "cover_url" text,
  "checkout_url" text,
  "badge" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  -- Reservado para uma integração futura (webhook/entitlement automático).
  -- Não usado por nenhuma lógica hoje.
  "provider" text,
  "external_product_id" text,
  "external_offer_id" text,
  "created_by" uuid,
  "updated_by" uuid,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public."member_offers"
  ADD CONSTRAINT member_offers_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD CONSTRAINT member_offers_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS member_offers_active_sort_idx ON public."member_offers" ("active", "sort_order");

DROP TRIGGER IF EXISTS "member_offers_updated_at" ON public."member_offers";
CREATE TRIGGER member_offers_updated_at BEFORE UPDATE ON public."member_offers"
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public."member_offers" ENABLE ROW LEVEL SECURITY;

-- Somente super_admin administra a vitrine (mais restrito que "admin" —
-- pedido explicitamente, é conteúdo comercial/afiliado sensível).
CREATE POLICY "super admin manages member_offers" ON public."member_offers"
  AS PERMISSIVE FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

-- Leitura pública das ofertas ativas — é só recomendação, sem dado sensível,
-- mesmo padrão de "public reads active products".
CREATE POLICY "public reads active member offers" ON public."member_offers"
  AS PERMISSIVE FOR SELECT TO anon, authenticated
  USING (active = true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public."member_offers" TO anon, authenticated, service_role;

COMMIT;
