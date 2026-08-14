-- Banner de destaque (opcional) entre "Meus produtos" e "Produtos
-- recomendados" em /membros, promovendo uma oferta específica. Aditivo,
-- nullable, só em member_offers — mesmo padrão de video_url.
BEGIN;

ALTER TABLE public."member_offers"
  ADD COLUMN IF NOT EXISTS "banner_url" text;

COMMIT;
