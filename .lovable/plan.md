# Colocar o /bergamo para vender — Webhook Hotmart + /admin/integracoes

## O que ja existe
- Pagina de vendas `/bergamo` pronta (90 prompts, tema roxo/magenta).
- Banco com `products` (bergamo cadastrado: R$ 37, co-producao 50%), `orders`, `product_access`, `profiles`, `leads`, `app_settings`, `admin_audit_log`.
- Painel `/admin` completo (visao geral, produtos, usuarios, pedidos, e-mails, auditoria, configuracoes).

## O que esta faltando (lista completa)
1. Nenhum endpoint de webhook existe — nao ha nada em `src/routes/api/`. A Hotmart nao tem para onde enviar a compra.
2. Nenhuma tabela de integracoes — nao ha onde guardar a configuracao da Hotmart nem o log dos eventos recebidos.
3. Sem pagina `/admin/integracoes` — nao existe no menu do painel.
4. Sem liberacao automatica de acesso — hoje o acesso so e dado manualmente no painel.
5. Sem e-mail de boas-vindas com credenciais — o comprador nao recebe nada apos pagar.
6. Sem area de membros — mesmo com acesso liberado, o cliente nao tem onde consumir os prompts.
7. Botoes de checkout do /bergamo sem link — falta a URL de checkout.
8. Sem chave do provedor de e-mail — nenhum e-mail sai sem ela.
9. Sem tratamento de reembolso, chargeback e cancelamento — o acesso precisa ser revogado automaticamente.

## O que vou construir

### 1. Banco (uma migracao)
- `integrations`: uma linha por provedor (hotmart, kawaipay), com produto vinculado, ativo/inativo, ambiente (teste/producao) e os codigos de produto/oferta do provedor.
- `webhook_events`: log de tudo que chega — provedor, tipo de evento, id unico do evento (idempotencia), payload cru, status (recebido/processado/erro), mensagem de erro e data. Impede processar a mesma compra duas vezes.
- Os tokens do provedor ficam como secret do projeto, nunca no banco.

### 2. Endpoint publico do webhook
`/api/public/webhooks/hotmart` — URL estavel e imutavel, pronta para colar no painel da Hotmart:
- Valida o token do header antes de qualquer processamento; token invalido devolve 401.
- Grava o evento e ignora se aquele id ja foi processado.
- Eventos tratados: compra aprovada/completa libera acesso; reembolso, chargeback, cancelamento e disputa revogam o acesso; boleto gerado e pagamento atrasado registram pedido pendente.
- Na compra aprovada: encontra ou cria o usuario pelo e-mail (senha temporaria gerada), atualiza o perfil, grava em `orders` (provedor, valor, referencia da transacao), grava `product_access` com origem hotmart, dispara o e-mail de boas-vindas com link de acesso e credenciais, e registra na auditoria.
- Responde 200 rapido para a Hotmart nao ficar re-tentando sem necessidade.

### 3. Pagina `/admin/integracoes`
Novo item no menu do painel, contendo:
- Card Hotmart: ligar/desligar, escolher o produto (/bergamo), colar os codigos de produto e oferta, ver a URL do webhook com botao copiar, indicador de token configurado e um botao de teste que simula uma compra aprovada de ponta a ponta.
- Card KawaiPay (para Casa dos Influencers IA): ja criado, desativado, pronto para a proxima etapa.
- Ultimos eventos recebidos: tabela com data, provedor, evento, e-mail do comprador, status e detalhe do erro, com botao reprocessar.
- Campo dos links de checkout do produto (principal e secundario), que alimentam os botoes do /bergamo.

### 4. Area de membros (minimo para poder vender)
- `/membros`: lista os produtos que o usuario comprou.
- `/membros/bergamo`: os 90 prompts liberados (sem blur), com busca, filtro por categoria e copiar prompt.
- Sem acesso ao produto: tela de "voce ainda nao tem esse produto" com botao de compra.

### 5. Vendas ligadas na pagina
- Botoes do `/bergamo` passam a usar o link de checkout cadastrado no admin (nada fixo no codigo), com fallback caso esteja vazio.
- CTA discreto "ja comprei, quero acessar" apontando para o login.

## O que preciso de voce
1. Link de checkout da Hotmart do Arsenal Bergamo (e o segundo, se houver o plano de R$ 47).
2. Codigos da Hotmart: id do produto e id da oferta.
3. Token de postback da Hotmart — vou pedir como secret, voce cola e ele fica protegido.
4. Chave do provedor de e-mail para os e-mails de boas-vindas sairem.
5. Confirmar o remetente do e-mail (o dominio produtospuertomadero.com ja esta verificado).

Pode mandar o que ja tiver: comeco pela migracao, pelo webhook e pela pagina de integracoes, que nao dependem desses valores, e depois so plugamos.

## Detalhes tecnicos
- Webhook como server route em `src/routes/api/public/webhooks/hotmart.ts`; o prefixo `/api/public/*` dispensa auth de site, a seguranca e a validacao do token dentro do handler.
- Escrita privilegiada com o cliente admin importado dentro do handler, apenas apos validar o token.
- Idempotencia por indice unico no id do evento em `webhook_events`.
- Funcoes do admin via `createServerFn` com `requireSupabaseAuth` e checagem de papel, no mesmo padrao de `admin.functions.ts`.
- Todas as tabelas novas com RLS habilitada, GRANT explicito e politicas restritas a admin.