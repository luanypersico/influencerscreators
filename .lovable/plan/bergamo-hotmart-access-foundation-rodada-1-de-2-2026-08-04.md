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
- Colunas, e nada mais: `provider` ('hotmart'), `product_id` (FK obrigatoria), `environment` ('test' | 'production'), `external_product_ucode`, `external_product_id`, `external_offer_id`, `active`, `created_at`, `updated_at`.
- **Fonte unica do checkout**: `products.checkout_url` continua sendo o link oficial do Bergamo. `checkout_url` **nao** e duplicado em `payment_integrations`.
- O ambiente vem **da integracao encontrada**, nunca do payload — a Hotmart nao garante campo de ambiente.
- Indice unico parcial garantindo **uma unica integracao ativa** por (provider, external_product_ucode, external_offer_id), evitando duas integracoes ativas ambiguas para a mesma conta/produto/oferta.
- Nenhum token, hottok, chave ou segredo entra nesta tabela. O Hottok e unico por conta Hotmart e fica apenas como secret do projeto: **`HOTMART_HOTTOK`** (um so; nada de variantes de teste/producao, a menos que existam duas contas Hotmart distintas de fato).
- A migracao cria **apenas a estrutura**. Nenhuma integracao ativa ficticia e inserida: enquanto voce nao fornecer product ucode, product id, offer code, Hottok e checkout, a integracao do Bergamo permanece **inativa** e o produto continua `draft`.

## 3. Eventos de webhook
Nova tabela `webhook_events`:
- `provider`, `product_id`, `integration_id`, `external_event_id`, `event_type`, `payload` (jsonb), `processing_status` ('received' | 'processed' | 'ignored' | 'error'), `error_message`, `received_at`, `processed_at`.
- Colunas adicionais para ordenacao real dos eventos: `event_occurred_at` (derivado de `creation_date` da Hotmart), `transaction_ref` e `purchase_status` recebido.
- Idempotencia por `UNIQUE (integration_id, external_event_id)` — o ambiente ja esta implicito na integracao, sem coluna redundante.
- Reforcos de integridade fora da tabela de eventos: `orders` unico por (`provider`, `provider_ref`) e `product_access` unico por (`user_id`, `product_id`). Assim `PURCHASE_APPROVED` e `PURCHASE_COMPLETE` da mesma transacao nunca geram pedido nem acesso duplicado.
- **Preflight antes dos indices unicos**: a migracao audita duplicatas em (`provider`,`provider_ref`) de `orders` e (`user_id`,`product_id`) de `product_access`. Havendo duplicata, a migracao **para** e relata os registros conflitantes — nada e apagado nem consolidado automaticamente.
- Reprocessamento seguro por evento existente: `processed` ou `ignored` devolvem **200 sem repetir efeitos**; `error` ou `received` podem ser reprocessados. Dois processamentos simultaneos do mesmo evento sao impedidos por lock transacional.
- RLS habilitada, zero leitura publica, zero leitura para `authenticated` comum — somente admin le; somente o servidor escreve.
- O payload guardado e reduzido: apenas os campos necessarios (transacao, produto, oferta, status, e-mail e nome do comprador, valor) e **somente para eventos do Bergamo**. Nada de dados sensiveis extras nos logs de aplicacao — logs so com id do evento e status.
- Como `integration_id` e obrigatorio, eventos de produtos/ofertas fora do Bergamo **nao entram nesta tabela**. A integridade da tabela nao e enfraquecida para guardar eventos fora de escopo.

## 4. Endpoint
`src/routes/api/public/webhooks/hotmart.ts`:
- Aceita somente POST; qualquer outro metodo responde **405**.
- Valida `X-HOTMART-HOTTOK` contra o secret **antes de qualquer gravacao**; invalido = **401**, nada persistido.
- Identificacao lida do payload: `data.product.ucode` (identificador externo principal), `data.product.id` (auxiliar numerico), `data.purchase.offer.code` (oferta) e `data.purchase.transaction` (referencia unica do pedido).
- Campos obrigatorios: identificador oficial do evento no payload (usado como `external_event_id`), transacao, tipo do evento, produto e oferta. Faltando qualquer um deles o payload e **invalido**: resposta **400**, sem criar usuario, pedido, perfil ou acesso e sem persistir dados pessoais. Nunca e fabricado um identificador aleatorio — isso quebraria a idempotencia.
- Resolve a integracao ativa pelo ucode + codigo da oferta. Sem correspondencia com a integracao ativa do Bergamo (Hottok valido, produto/oferta de outro produto): responde **200 como ignorado** para a Hotmart nao re-tentar, e **nao armazena nome, e-mail, valor nem payload completo**, nao cria order, perfil, usuario ou acesso. Fica somente log tecnico minimo, sem dado pessoal: `external_event_id`, `event_type`, product ucode, offer code e motivo da rejeicao.
- Eventos oficiais do webhook de compras v2 processados: `PURCHASE_APPROVED`, `PURCHASE_COMPLETE`, `PURCHASE_BILLET_PRINTED`, `PURCHASE_DELAYED`, `PURCHASE_EXPIRED`, `PURCHASE_CANCELED`, `PURCHASE_PROTEST`, `PURCHASE_REFUNDED`, `PURCHASE_CHARGEBACK`. Tipos desconhecidos ficam como `ignored`, **sem nenhum efeito comercial**.
- Respostas: **200** somente depois de persistir e processar de forma duravel (evento concluido ou ignorado com seguranca); **500** em falha temporaria, para a Hotmart re-tentar.

## 5. Usuario Auth e processamento atomico (duas etapas distintas)
A criacao do usuario Auth **nao faz parte** da transacao PostgreSQL. Nunca ha insercao direta em `auth.users` por SQL.

Etapa A — identidade (fora da transacao, so no servidor):
Executada **exclusivamente** em `PURCHASE_APPROVED` e `PURCHASE_COMPLETE`. Boleto, atraso, expired, canceled, protest, refund, chargeback e evento desconhecido **nao criam** usuario Auth nem perfil novo: localizam o pedido existente pela `transaction` e, se nao houver pedido correspondente, ficam registrados para revisao/erro controlado, sem identidade ficticia.
1. Normaliza o e-mail do comprador.
2. Procura o usuario pelo cliente administrativo, exclusivamente no servidor.
3. Se nao existir, cria o usuario Auth **sem senha** e **sem confirmar o e-mail automaticamente** (nenhuma credencial enviada, nenhuma presuncao de que o comprador controla o e-mail).
4. Obtem o `user_id`.
5. Em corrida entre `APPROVED` e `COMPLETE`: se a criacao informar que o e-mail ja existe, o usuario e localizado e reutilizado — nunca duplicado.

Etapa B — RPC comercial (transacao unica), recebendo esse `user_id`, atualizando atomicamente somente: `profiles`, `orders`, `product_access`, `admin_audit_log`, `webhook_events`.
- Pedido em `orders`: product_id do Bergamo, valor em centavos, provider `hotmart`, `provider_ref` = `data.purchase.transaction`, status pago, `paid_at`, casando pela transacao.
- Concede ou restaura `product_access` **somente** do Bergamo, `source = 'hotmart'`.
- Auditoria (ator sistema) e marcacao do evento como processado.

Se o usuario Auth for criado e a RPC falhar: o evento fica com status `error`, o endpoint responde **500**, e uma nova tentativa localiza e **reutiliza o mesmo usuario pelo e-mail** — sem usuario duplicado, sem conceder acesso fora da RPC e **sem excluir automaticamente** o usuario Auth. O fluxo completo e idempotente e recuperavel.

O login efetivo do comprador (magic link, OTP ou convite) e Rodada 2.

## 6. Mapeamento de status (nenhum evento toca outro produto)
- `PURCHASE_APPROVED`, `PURCHASE_COMPLETE`: pedido pago, concede/restaura acesso.

### Ordem real dos eventos (nao a ordem de chegada)
Antes de alterar `orders` ou `product_access`, o evento e comparado com o ultimo evento comercial processado **daquela transacao** (por `event_occurred_at` e estado atual):
- `PURCHASE_REFUNDED` e `PURCHASE_CHARGEBACK` sao **terminais** para aquela `transaction`.
- Um `APPROVED`/`COMPLETE` antigo ou atrasado **nunca** restaura acesso depois de reembolso/chargeback.
- Eventos antigos ou incompativeis ficam como `ignored`.
- Recompra legitima chega com outra `transaction` e concede acesso normalmente.

### Suspensao nao e revogacao
`product_access` ganha, de forma retrocompativel, `suspended_at` (nullable) e `status_reason` (nullable):
- `PROTEST`: preenche `suspended_at`, **sem** preencher `revoked_at`.
- `APPROVED`/`COMPLETE` valido e posterior: limpa `suspended_at`.
- `REFUNDED`/`CHARGEBACK`: preenche `revoked_at` e limpa `suspended_at`.
- Acesso ativo exige `revoked_at IS NULL` **e** `suspended_at IS NULL`.
- `revoked_at` nunca representa suspensao temporaria.

### Acesso recalculado por TODAS as transacoes (nao pelo ultimo webhook)
`orders` e a fonte da verdade por transacao. Cada evento primeiro atualiza **somente** o pedido de `provider = 'hotmart'` + `provider_ref = data.purchase.transaction`. Depois a RPC **recalcula** `product_access` olhando todos os pedidos do mesmo `user_id` + product_id do Bergamo:
- existe ao menos uma transacao paga valida -> acesso ativo (`revoked_at = null`, `suspended_at = null`);
- nenhuma paga, mas alguma em protesto/disputa -> `suspended_at` preenchido, `revoked_at = null`;
- nenhuma paga valida nem disputa recuperavel -> `revoked_at` preenchido, `suspended_at = null`.

Consequencias garantidas: reembolso/chargeback/protesto da transacao A nao afeta acesso valido da transacao B; boleto, atraso, expiracao ou cancelamento de uma compra nao afetam outra compra paga; recompra legitima reativa o acesso; a decisao nunca depende so do ultimo webhook recebido.

### `orders.user_id` — verificacao previa
Antes de implementar, confirmo a nullability de `orders.user_id` e documento a decisao (sem alterar nada silenciosamente):
- aceita NULL -> pedido pendente e gravado com `buyer_email` e `user_id` nulo;
- nao aceita NULL -> nao crio usuario so por boleto/atraso; o evento fica em `webhook_events` e o `order` e criado apenas em `APPROVED`/`COMPLETE`.

### Busca segura do usuario por e-mail
Sem varredura paginada de `listUsers`. Mecanismo server-only deterministico sobre e-mail normalizado `lower(trim(email))`, com unicidade do e-mail normalizado em `profiles` apos preflight de duplicatas. Em conflito de criacao concorrente, recupero o `user_id` existente por esse mecanismo server-only e reutilizo o usuario. Nunca consultar `auth.users` do navegador; nunca expor service role.
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
Script de teste local disparando o endpoint com payloads sinteticos, cobrindo: token invalido rejeitado; payload incompleto respondendo 400 sem persistencia; produto diferente rejeitado; oferta diferente rejeitada; compra aprovada gerando pedido e acesso Bergamo; evento duplicado sem duplicacao; pagamento pendente sem acesso; reembolso revogando so o Bergamo; comprador com acesso a outro produto preservado; evento de ambiente de teste sem efeito na producao.

Testes adicionais obrigatorios:
- criacao do usuario Auth bem-sucedida seguida de **falha simulada da RPC** (evento em `error`, resposta 500);
- repeticao do mesmo evento depois dessa falha;
- confirmacao de reutilizacao do usuario existente (sem duplicata);
- confirmacao de que nao existe pedido duplicado;
- confirmacao de que o acesso so e concedido depois de a RPC concluir;
- evento de outro produto nao persiste nenhum dado pessoal.

Validacoes de ordem e estado:
- `REFUNDED` processado antes de uma repeticao atrasada de `APPROVED`;
- `APPROVED` antigo nao restaura acesso revogado;
- `PROTEST` suspende sem revogar;
- `COMPLETE` posterior e valido remove a suspensao;
- boleto nao cria usuario Auth;
- refund sem pedido existente nao cria usuario;
- dois eventos simultaneos da mesma compra nao duplicam Auth, order nem acesso;
- `products.checkout_url` continua sendo a unica fonte de checkout.

Cenario multi-transacao obrigatorio: compra A aprovada; compra B aprovada; reembolso de A; acesso continua ativo por B; reembolso de B; somente entao o acesso e revogado; protesto em A com B paga nao suspende o acesso.

Mais lint, TypeScript, build e conferencia de que `/bergamo`, `/admin/*` e `/auth` continuam funcionando. Ao final entrego a lista de arquivos, a migracao, a matriz de RLS, os eventos implementados, o resultado de cada teste e os riscos — e **paro antes de publicar** qualquer alteracao comercial.

## Dados que ainda preciso de voce
1. `data.product.ucode` (ucode do produto na Hotmart), `data.product.id` (id numerico) e o codigo da oferta de R$ 27.
2. Hottok da conta Hotmart — vou pedir como secret `HOTMART_HOTTOK`; voce cola e fica protegido.
3. Link de checkout real da oferta de R$ 27 (sem ele o produto fica `draft`).

Comeco pela migracao e pelo webhook, que nao dependem desses valores; depois so plugamos os codigos e ativamos.