-- Vídeo opcional de apresentação da oferta recomendada (detalhe premium em
-- /membros). Aditivo, nullable, só em member_offers — nenhuma outra tabela
-- é tocada. RLS existente (super_admin escreve, service_role lê) já cobre
-- a coluna nova automaticamente, sem policy adicional necessária.
BEGIN;

ALTER TABLE public."member_offers"
  ADD COLUMN IF NOT EXISTS "video_url" text;

COMMIT;
