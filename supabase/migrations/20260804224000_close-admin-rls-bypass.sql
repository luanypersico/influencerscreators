-- =====================================================================
-- BERGAMO — HOTMART ACCESS FOUNDATION (gate de autorização: fecha bypass)
-- As policies "admins manage payment integrations" e "admins read
-- webhook events" usavam is_admin(auth.uid()), que retorna true tanto
-- para 'admin' quanto para 'super_admin'. Isso permitia que QUALQUER
-- authenticated com papel admin (não só super_admin) lesse/escrevesse
-- payment_integrations e lesse webhook_events diretamente via Supabase
-- REST/JS, contornando por completo a exigência de super_admin das
-- funções server-side (admin-integrations.server.ts).
--
-- Confirmado ao vivo antes desta migration: com a policy antiga, um
-- authenticated (mesmo super_admin) via SELECT direto enxergava a linha
-- real de payment_integrations. Depois de remover a policy, o mesmo
-- SELECT direto passa a retornar zero linhas — só o service_role
-- (rolbypassrls = true, usado exclusivamente dentro de
-- admin-integrations.server.ts, depois de assertSuperAdmin) continua
-- com acesso, exatamente como pretendido.
--
-- Removidas sem substituição: nenhum authenticated (admin ou
-- super_admin) tem mais acesso direto a estas duas tabelas via RLS.
-- Toda leitura/escrita passa a depender só do service_role no servidor.
-- =====================================================================

DROP POLICY IF EXISTS "admins manage payment integrations" ON public.payment_integrations;
DROP POLICY IF EXISTS "admins read webhook events" ON public.webhook_events;
