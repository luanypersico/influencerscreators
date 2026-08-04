# Bergamo — Hotmart Access Foundation (Rodada 1 de 2)

Escopo unico: backend seguro de venda e liberacao de acesso do produto `bergamo` via Hotmart. Nada de Casa do Influencer AI, KawaiPay, creditos, assinaturas, marketplace ou geracao de IA.

## Estado atual verificado
- Branch/SHA/working tree: nao posso reportar nem criar branch. Neste ambiente o git e gerenciado pela plataforma — nao executo `git` (branch, commit, push). Todo o trabalho vai para a branch que a Lovable ja usa, em um unico conjunto de mudancas revisavel antes de publicar. Se voce quiser branch e PR de verdade, conecte o repositorio no GitHub e eu descrevo o commit para voce aplicar la.
- `AGENTS.md`: contem apenas o aviso da Lovable para nao reescrever historico publicado.
- Migrations existentes: 3 (`20260804211555`, `20260804211619`, `20260804211643`) — criaram todo o schema do admin.
- `products`: `id, slug, name, tagline, description, cover_url, price_cents, compare_at_cents, currency, checkout_url, checkout_url_secondary, status, is_coproduction, coproducer_name, coproducer_email, revenue_share_pct, sort_order, created_by, created_at, updated_at`. Linhas: `bergamo` (R$ 37,00 = 3700 centavos, is_coproduction true, share 50%) e o placeholder `influencers-creators` (nao sera tocado).
- `orders`: `id, product_id, user_id, buyer_email, buyer_name, amount_cents, currency, status, provider, provider_ref, paid_at, notes, created_at, updated_at`.
- `product_access`: `id, user_id, product_id, source, granted_by, expires_at, revoked_at, created_at, updated_at`.
- `profiles`: `id, email, full_name, avatar_url, phone, notes, status, last_seen_at, created_at, updated_at`.
- Auth: Supabase Auth com papeis em `user_roles` (`super_admin` ja aplicado a trafegocomkrisan@gmail.com); login por e-mail/senha em `/auth`; nenhum provedor social configurado.
- `src/routes/api/` nao existe: hoje nao ha nenhum webhook.

## 1. Produto Bergamo
Atualizar **somente** a linha `slug = 'bergamo'`:
- `price_cents = 2700` (R$ 27,00), moeda BRL, pagamento unico.
- Mantem `is_coproduction = true` e `coproducer_*` apenas como identificacao/relatorio. O app nao calcula, nao paga e nao distribui comissao — o split 50/50 e da Hotmart. O campo de percentual passa a ser tratado como informativo e sai dos calculos financeiros do painel.
- `status` fica `draft` (nao vendendo) e vira `active` somente quando o checkout real estiver cadastrado.
- Nenhuma outra linha de `products` e alterada.

## 2. Configuracao Hotmart (sem segredos)
Nova tabela `payment_integrations`, uma linha por produto+provedor+ambiente, ligada por `product_id`:
- `provider` ('hotmart'), `product_id` (FK obrigatoria), `environment` ('test' | 'production'), `external_product_id`, `external_offer_id`, `checkout_url`, `active`, `created_at`, `updated_at`.
- Unicidade por (provider, product_id, environment) e separacao explicita teste/producao.
- Nenhum token, hottok, chave ou segredo entra nesta tabela. O token da Hotmart fica exclusivamente como secret do projeto (`HOTMART_HOTTOK_PRODUCTION` e `HOTMART_HOTTOK_TEST`).

## 3. Eventos de webhook
Nova tabela `webhook_events`:
- `provider`, `product_id`, `integration_id`, `external_event_id`, `event_type`, `payload` (jsonb), `processing_status` ('received' | 'processed' | 'ignored' | 'error'), `error_message`, `received_at`, `processed_at`.
- Idempotencia por indice unico (provider, environment, external_event_id): o mesmo evento nunca e processado duas vezes.
- RLS habilitada, zero leitura publica, zero leitura para `authenticated` comum — somente admin le; somente o servidor escreve.
- O payload guardado e reduzido: apenas os campos necessarios (transacao, produto, oferta, status, e-mail e nome do comprador, valor). Nada de dados sensiveis extras nos logs de aplicacao — logs so com id do evento e status.

## 4. Endpoint
`src/routes/api/public/webhooks/hotmart.ts`:
- Aceita somente POST; qualquer outro metodo responde 405.
- Valida o token do header (`x-hotmart-hottok`) contra o secret **antes de qualquer gravacao**; invalido = 401 e nada persistido.
- Resolve a integracao pelo `external_product_id` + `external_offer_id` do payload. Se nao corresponder a uma integracao ativa do Bergamo, o evento e rejeitado (nao processado) — eventos de outros produtos ou outras ofertas nunca criam pedido nem acesso.
- Grava o evento de forma idempotente e processa apenas tipos documentados pela Hotmart: `PURCHASE_APPROVED`, `PURCHASE_COMPLETE`, `PURCHASE_REFUNDED`, `PURCHASE_CHARGEBACK`, `PURCHASE_CANCELED`, `PURCHASE_PROTEST`, `PURCHASE_BILLET_PRINTED`, `PURCHASE_DELAYED`, `PURCHASE_OUT_OF_SHOPPING_CART`. Tipos desconhecidos ficam registrados como `ignored`.
- Responde 200 rapido nos casos tratados para a Hotmart nao re-tentar em excesso.

## 5. Compra aprovada
Para compra valida do Bergamo:
- Cria ou atualiza o pedido em `orders` (product_id do Bergamo, valor em centavos, provider `hotmart`, `provider_ref` = codigo da transacao, `status` pago, `paid_at`), casando pela transacao para nao duplicar.
- Localiza o comprador pelo e-mail; se nao existir, cria a identidade **sem senha** (nenhuma senha gerada, nenhuma senha enviada) e o perfil correspondente.
- Concede `product_access` **somente** ao produto Bergamo, `source = 'hotmart'`, limpando `revoked_at` em recompra.
- Registra auditoria em `admin_audit_log` (ator sistema).
- O acesso fica pronto para o comprador entrar depois por magic link / OTP / criacao de senha — o fluxo de login em si e da proxima rodada.

## 6. Revogacao
Reembolso, chargeback, cancelamento e disputa com perda confirmada: atualiza o `status` do pedido e marca `revoked_at` **apenas** na linha de `product_access` do Bergamo daquele usuario. Acesso a qualquer outro produto permanece intacto.

## 7. Eventos pendentes
Boleto impresso, Pix/pagamento aguardando e pagamento atrasado criam ou atualizam pedido com status pendente e **nunca** concedem acesso.

## 8. Seguranca
- Segredos somente como secrets do projeto (Lovable Cloud); service role somente no servidor, importado dentro do handler e depois da validacao do token.
- Nenhuma senha criada ou enviada; nenhuma chave no frontend; nenhum token no banco.
- RLS habilitada com GRANT explicito nas duas tabelas novas; politicas de leitura restritas a admin, escrita apenas via service role.
- Nenhuma linha de codigo de KawaiPay; nenhum evento de outro produto processado.

## Fora de escopo desta rodada
`/membros`, `/membros/bergamo`, `/admin/integracoes`, e-mail de boas-vindas, links definitivos de checkout, mudancas visuais em `/bergamo`, KawaiPay, Casa do Influencer AI, geracao de IA, creditos, assinaturas, outros produtos.

## Validacao que vou executar
Script de teste local disparando o endpoint com payloads sinteticos, cobrindo: token invalido rejeitado; produto diferente rejeitado; oferta diferente rejeitada; compra aprovada gerando pedido e acesso Bergamo; evento duplicado sem duplicacao; pagamento pendente sem acesso; reembolso revogando so o Bergamo; comprador com acesso a outro produto preservado; evento de ambiente de teste sem efeito na producao. Mais lint, TypeScript, build e conferencia de que `/bergamo`, `/admin/*` e `/auth` continuam funcionando. Ao final entrego a lista de arquivos, a migracao, a matriz de RLS, os eventos implementados, o resultado de cada teste e os riscos.

## Dados que ainda preciso de voce
1. `external_product_id` (id do produto na Hotmart) e `external_offer_id` (codigo da oferta de R$ 27).
2. Hottok do postback da Hotmart — vou pedir como secret; voce cola e fica protegido (um para teste, um para producao, se voce tiver os dois).
3. Link de checkout real da oferta de R$ 27 (sem ele o produto fica `draft`).

Comeco pela migracao e pelo webhook, que nao dependem desses valores; depois so plugamos os codigos e ativamos.