-- =====================================================================
-- BERGAMO — CATÁLOGO PÚBLICO SEM SERVICE ROLE
-- =====================================================================
-- A página pública /bergamo (visitante anônimo) não pode depender de
-- SUPABASE_SERVICE_ROLE_KEY — esse secret não existe no ambiente local
-- de build e sua ausência derrubava o catálogo inteiro (0 itens), o
-- mesmo risco existiria em qualquer ambiente de deploy sem o secret
-- configurado. Esta função roda com privilégio de definidor (bypassa a
-- RLS restritiva de product_items, igual a has_product_access e
-- find_user_id_by_email já fazem), mas o contrato de saída é fixo e
-- deliberadamente estreito: só o produto 'bergamo', só itens
-- published, prompt nunca sai fora dos 3 gratuitos.
CREATE OR REPLACE FUNCTION public.get_bergamo_public_catalog()
RETURNS TABLE (
  code text,
  title text,
  category text,
  description text,
  "position" integer,
  is_free boolean,
  status text,
  prompt text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    pi.code,
    pi.title,
    pi.category,
    pi.description,
    pi.sort_order AS "position",
    pi.is_free,
    pi.status,
    CASE WHEN pi.is_free THEN pi.prompt ELSE NULL END AS prompt
  FROM public.product_items pi
  JOIN public.products p ON p.id = pi.product_id
  WHERE p.slug = 'bergamo'
    AND pi.status = 'published'
  ORDER BY pi.sort_order ASC;
$$;

-- Sem argumentos: nenhum product_id/slug pode ser enviado pelo cliente,
-- a função está travada no Bergamo por construção (hardcoded no WHERE).
REVOKE ALL ON FUNCTION public.get_bergamo_public_catalog() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_bergamo_public_catalog() TO anon, authenticated;
