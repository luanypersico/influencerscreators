# Inventário do Lovable Cloud

Snapshot somente leitura em 2026-08-07. Origem: projeto Lovable `2590e38e-30ef-4971-b2ff-daa98e466bbf`, PostgreSQL 17.6.

## Objetos

- 17 tabelas públicas, todas com RLS: admin_audit_log, app_settings, email_campaigns, email_messages, email_templates, leads, orders, payment_integrations, product_access, product_collaborators, product_item_revisions, product_items, product_updates, products, profiles, user_roles e webhook_events.
- 1 enum: `app_role` = super_admin, admin, coproducer, support, member.
- 10 funções/RPCs: enforce_bergamo_only_integration, find_user_id_by_email, get_bergamo_public_catalog, handle_new_user, has_product_access, has_role, is_admin, is_super_admin, process_hotmart_event e set_updated_at.
- 14 triggers próprios: 13 em public e `on_auth_user_created` em auth. Há ainda 4 triggers internos do Storage, não exportados.
- 25 policies: 24 em public e 1 em storage.objects.
- 0 sequences próprias, views ou materialized views.
- Extensões: pgcrypto, uuid-ossp, pg_stat_statements, supabase_vault e plpgsql.

## Contagens e classificação

| Tabela | Linhas | Classe | Tratamento |
|---|---:|---|---|
| products | 2 | configuração/produto | exportada |
| product_items | 90 | conteúdo | exportada integralmente |
| app_settings | 2 | configuração | exportada |
| payment_integrations | 1 | configuração | exportada sem segredo; inativa |
| profiles | 1 | operacional/Auth | recriar após novo Auth |
| user_roles | 1 | operacional/Auth | recriar após novo Auth |
| demais 11 tabelas | 0 | operacional/auditoria | schema preservado; sem seed |

Bergamo: UUID preservado `e23f2271-3450-4e69-972f-8f9ea0d27130`, preço 2700 centavos, status draft, 90 itens (3 grátis e 87 bloqueados), em 12 categorias.

## Segurança observada

Todas as tabelas public têm RLS. Os grants vivos concedem privilégios de tabela amplos a anon/authenticated/service_role e dependem de RLS para filtragem. Funções SECURITY DEFINER têm search_path explícito. Riscos observados: duas triggers de updated_at em product_items; `profiles` UPDATE sem WITH CHECK explícito; execute público na trigger function enforce_bergamo_only_integration; bootstrap de super_admin por e-mail hardcoded (sanitizado no pacote).
