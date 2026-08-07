# Plano de cutover (não executar nesta rodada)

## Antes

Lovable Cloud continua sendo produção. Congele mudanças, refaça contagens e exporte qualquer dado criado após este snapshot. Importe os arquivos 00–11 em ordem num ambiente controlado, conclua o Auth e valide RLS/RPCs.

## Depois de validado

No Cloudflare, trocar somente `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` e os secrets server-side apropriados. Configurar valores de secrets diretamente nos cofres/plataformas; nunca em SQL ou Git. Variáveis esperadas incluem `SUPABASE_SERVICE_ROLE_KEY`, `HOTMART_HOTTOK` e credenciais de e-mail, sem valores neste repositório.

## Validação

Executar `11_post_migration_validation.sql`, testes de login/admin, catálogo público, bloqueio de prompt pago, webhook em sandbox e verificação de logs. Storage privado permanece fora do cutover até decisão específica.

## Rollback

Reverter as variáveis do Cloudflare para a URL e chave publicável do Lovable Cloud atual. Não apagar nem modificar a origem até a janela de observação terminar.
