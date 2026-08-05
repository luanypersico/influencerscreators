-- =====================================================================
-- BERGAMO — IMAGENS PRIVADAS DO COMPRADOR
-- =====================================================================
-- Bucket privado para os 90 originais em alta resolução do Arsenal
-- Bergamo. Só existe um caminho de leitura: um comprador com
-- product_access ATIVO ao Bergamo (a mesma regra de has_product_access
-- já usada por /membros/bergamo) pode gerar uma signed URL de curta
-- duração. Nenhum outro papel tem select/insert/update/delete.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Bucket privado (idempotente — upsert por id)
-- ---------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bergamo-member-images',
  'bergamo-member-images',
  false,
  10485760, -- 10 MB por arquivo, generoso para os JPEGs do acervo
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- ---------------------------------------------------------------------
-- 2. RLS em storage.objects — só SELECT, só para comprador ativo do
-- Bergamo, reaproveitando exatamente has_product_access (a mesma
-- função que já decide o acesso em /membros/bergamo). Sem INSERT,
-- UPDATE ou DELETE para nenhum papel além de service_role (que já
-- ignora RLS por padrão) — o upload é só via script administrativo.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "bergamo buyers read their private images" ON storage.objects;

CREATE POLICY "bergamo buyers read their private images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'bergamo-member-images'
  AND public.has_product_access(
    auth.uid(),
    (SELECT id FROM public.products WHERE slug = 'bergamo')
  )
);

-- Nenhuma policy de INSERT/UPDATE/DELETE é criada para anon/authenticated
-- de propósito — sem elas, o RLS (habilitado por padrão em
-- storage.objects pelo Supabase) bloqueia essas operações para todo
-- mundo exceto service_role.

-- ---------------------------------------------------------------------
-- 3. Mapeamento do arquivo privado por item — só o caminho interno do
-- bucket, nunca uma URL. Nunca selecionado por get_bergamo_public_catalog().
-- ---------------------------------------------------------------------
ALTER TABLE public.product_items
  ADD COLUMN IF NOT EXISTS member_image_path text;

COMMENT ON COLUMN public.product_items.member_image_path IS
  'Caminho interno no bucket privado bergamo-member-images (ex.: bergamo/05.jpg). Nunca uma URL — nem pública, nem assinada. Nunca exposto pela RPC pública get_bergamo_public_catalog().';
