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
Nova tabela `payment_integrations`, ligada por `product_id`:
- `provider` ('hotmart'), `product_id` (FK obrigatoria), `environment` ('test' | 'production'), `external_product_ucode`, `external_product_id`, `external_offer_id`, `checkout_url`, `active`, `created_at`, `updated_at`.
- O ambiente vem **da integracao encontrada**, nunca do payload — a Hotmart nao garante campo de ambiente.
- Indice unico parcial garantindo **uma unica integracao ativa** por (provider, external_product_ucode, external_offer_id), evitando duas integracoes ativas ambiguas para a mesma conta/produto/oferta.
- Nenhum token, hottok, chave ou segredo entra nesta tabela. O Hottok e unico por conta Hotmart e fica apenas como secret do projeto: **`HOTMART_HOTTOK`** (um so; nada de variantes de teste/producao, a menos que existam duas contas Hotmart distintas de fato).

## 3. Eventos de webhook
Nova tabela `webhook_events`:
- `provider`, `product_id`, `integration_id`, `external_event_id`, `event_type`, `payload` (jsonb), `processing_status` ('received' | 'processed' | 'ignored' | 'error'), `error_message`, `received_at`, `processed_at`.
- Idempotencia por `UNIQUE (integration_id, external_event_id)` — o ambiente ja esta implicito na integracao, sem coluna redundante.
- Reforcos de integridade fora da tabela de eventos: `orders` unico por (`provider`, `provider_ref`) e `product_access` unico por (`user_id`, `product_id`). Assim `PURCHASE_APPROVED` e `PURCHASE_COMPLETE` da mesma transacao nunca geram pedido nem acesso duplicado.
- RLS habilitada, zero leitura publica, zero leitura para `authenticated` comum — somente admin le; somente o servidor escreve.
- O payload guardado e reduzido: apenas os campos necessarios (transacao, produto, oferta, status, e-mail e nome do comprador, valor). Nada de dados sensiveis extras nos logs de aplicacao — logs so com id do evento e status.

## 4. Endpoint
`src/routes/api/public/webhooks/hotmart.ts`:
- Aceita somente POST; qualquer outro metodo responde **405**.
- Valida `X-HOTMART-HOTTOK` contra o secret **antes de qualquer gravacao**; invalido = **401**, nada persistido.
- Identificacao lida do payload: `data.product.ucode` (identificador externo principal), `data.product.id` (auxiliar numerico), `data.purchase.offer.code` (oferta) e `data.purchase.transaction` (referencia unica do pedido).
- Resolve a integracao ativa pelo ucode + codigo da oferta. Sem correspondencia com a integracao do Bergamo, o evento e registrado e rejeitado — eventos de outros produtos ou outras ofertas nunca criam pedido nem acesso.
- Eventos oficiais do webhook de compras v2 processados: `PURCHASE_APPROVED`, `PURCHASE_COMPLETE`, `PURCHASE_BILLET_PRINTED`, `PURCHASE_DELAYED`, `PURCHASE_EXPIRED`, `PURCHASE_CANCELED`, `PURCHASE_PROTEST`, `PURCHASE_REFUNDED`, `PURCHASE_CHARGEBACK`. Tipos desconhecidos ficam como `ignored`, **sem nenhum efeito comercial**.
- Respostas: **200** somente depois de persistir e processar de forma duravel (evento concluido ou ignorado com seguranca); **500** em falha temporaria, para a Hotmart re-tentar.

## 5. Processamento atomico
Pedido, `product_access`, perfil, auditoria e status do evento sao atualizados **numa unica funcao PostgreSQL segura (RPC)** chamada pelo servidor — tudo dentro da mesma transacao, sem estado parcial. Se a funcao falhar, nada e aplicado e o endpoint devolve 500 para nova tentativa.

Na compra aprovada/completa do Bergamo:
- Cria ou atualiza o pedido em `orders` (product_id do Bergamo, valor em centavos, provider `hotmart`, `provider_ref` = `data.purchase.transaction`, status pago, `paid_at`), casando pela transacao.
- Localiza o comprador pelo e-mail; se nao existir, cria o registro Auth server-side **sem senha** (nenhuma senha gerada, nenhuma credencial enviada, nenhuma presuncao de que o comprador controla o e-mail) e o perfil correspondente.
- Concede ou restaura `product_access` **somente** do Bergamo, `source = 'hotmart'`.
- Registra auditoria (ator sistema) e marca o evento como processado.
- O login efetivo do comprador (magic link, OTP ou convite) e Rodada 2.

## 6. Mapeamento de status (nenhum evento toca outro produto)
- `PURCHASE_APPROVED`, `PURCHASE_COMPLETE`: pedido pago, concede/restaura acesso.
- `PURCHASE_BILLET_PRINTED`, `PURCHASE_DELAYED`: pedido pendente, sem acesso.
- `PURCHASE_EXPIRED`, `PURCHASE_CANCELED`: pedido encerrado, sem acesso.
- `PURCHASE_PROTEST`: marca disputa e **suspende temporariamente** o acesso — nao e tratado como perda definitiva e pode ser revertido.
- `PURCHASE_REFUNDED`, `PURCHASE_CHARGEBACK`: revoga o acesso do Bergamo.
- Reembolso parcial: marca o pedido para revisao manual, **sem revogacao automatica total**.
- Toda revogacao/suspensao atinge exclusivamente a linha de `product_access` do Bergamo; acesso a outros produtos permanece intacto.

## 7. Eventos pendentes
Boleto impresso e pagamento atrasado criam ou atualizam pedido pendente e **nunca** concedem acesso.

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
1. `data.product.ucode` (ucode do produto na Hotmart), `data.product.id` (id numerico) e o codigo da oferta de R$ 27.
2. Hottok da conta Hotmart — vou pedir como secret `HOTMART_HOTTOK`; voce cola e fica protegido.
3. Link de checkout real da oferta de R$ 27 (sem ele o produto fica `draft`).

Comeco pela migracao e pelo webhook, que nao dependem desses valores; depois so plugamos os codigos e ativamos.