-- =====================================================================
-- BERGAMO — OPERATIONAL ACCESS PREPARATION (Rodada 2)
-- Duas origens explícitas e auditáveis de product_access, usadas somente
-- por funções server-side com autorização de super_admin. Nenhuma delas
-- é uma compra real — cada uma existe para uma finalidade operacional
-- isolada e identificável por `source`, sem precisar de coluna nova:
--
--   manual_validation   — conta exclusiva de validação da Hotmart
--                          (nunca vinculada a papel administrativo ou a
--                          product_collaborators).
--   coproducer_preview  — pré-visualização opcional da área de membros
--                          concedida a um coprodutor já vinculado, sempre
--                          um toggle separado do vínculo em
--                          product_collaborators, nunca automático.
-- =====================================================================
ALTER TABLE public.product_access DROP CONSTRAINT product_access_source_check;
ALTER TABLE public.product_access ADD CONSTRAINT product_access_source_check
  CHECK (source = ANY (ARRAY[
    'manual'::text,
    'purchase'::text,
    'gift'::text,
    'trial'::text,
    'hotmart'::text,
    'manual_validation'::text,
    'coproducer_preview'::text
  ]));
