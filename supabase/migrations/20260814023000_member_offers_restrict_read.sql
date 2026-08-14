-- Correção de exposição: member_offers só é lida pelo app através de
-- memberGetRecommendedOffersFn (server function, supabaseAdmin/service_role,
-- que ignora RLS por completo) e escrita através de /admin/ofertas
-- (super_admin, via a policy "super admin manages member_offers"). Nenhum
-- caminho do app depende de leitura direta anon/authenticated no navegador
-- — a policy pública anterior era exposição desnecessária, não usada por
-- nenhuma função real. Corrige só member_offers; nenhuma outra tabela é tocada.
BEGIN;

DROP POLICY IF EXISTS "public reads active member offers" ON public."member_offers";

-- anon nunca precisa tocar esta tabela de jeito nenhum.
REVOKE ALL ON public."member_offers" FROM anon;

-- authenticated mantém o GRANT (é a mesma role de conexão do super_admin —
-- Supabase não tem role de banco por papel de app), mas sem nenhuma policy
-- de SELECT/INSERT/UPDATE/DELETE além da do super_admin, um authenticated
-- comum (não super_admin) fica sem nenhuma linha visível ou editável nesta
-- tabela — RLS nega por padrão quando nenhuma policy casa.

COMMIT;
