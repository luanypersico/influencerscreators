-- Pré-requisito de extensão para objetos deste pacote.
-- Não fixa versões: o Supabase instala a versão compatível da plataforma.
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Extensões observadas na origem, mas não requeridas pelo schema nem pelos
-- scripts deste pacote: uuid-ossp, pg_stat_statements, supabase_vault e plpgsql.
-- Elas são gerenciadas pela plataforma e não são instaladas aqui.
