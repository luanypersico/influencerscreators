# Influencers Creators

Aplicação TanStack Start que roda como Worker na Cloudflare, com backend no
Supabase próprio do projeto (`influencers-creators-prod`, região sa-east-1).

Dois públicos, decididos pelo hostname da requisição:

- `arsenal.obergamo.com.br` — Arsenal / Bergamo Creators: página de vendas
  pública, área de membros e catálogo de prompts liberado por acesso pago.
- demais hostnames — site institucional Influencers Creators e o painel
  administrativo em `/admin`.

## Como rodar

Requer [Bun](https://bun.sh).

```sh
bun install
bun run dev
```

Variáveis de ambiente: copie `.env.example` e preencha um `.env.local`
(ignorado pelo Git). Segredos reais nunca vão para `.env` nem para o
repositório — o repositório é público.

```sh
bun test     # testes
bun run lint # eslint + prettier
bun run build
```

## Vendas

O produto Bergamo é vendido pela Hotmart. O webhook em
`src/routes/api/public/webhooks/hotmart.ts` valida o `X-HOTMART-HOTTOK`,
registra o pedido, concede ou revoga o acesso e envia a conversão Purchase
para a API de Conversões do Meta. Ele é idempotente por transação: reenvio
da Hotmart não duplica pedido, acesso nem venda no pixel.

## Publicação

O workflow `.github/workflows/deploy.yml` roda a cada push na `main` e sobe a
aplicação na conta Cloudflare do projeto.

Segredos do Worker (cadastrados com `wrangler secret put`, nunca no Git):

| Secret | Para quê |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | acesso administrativo ao banco, só no servidor |
| `HOTMART_HOTTOK` | valida que o webhook veio mesmo da Hotmart |
| `RESEND_API_KEY` | envio de e-mails (convite, boas-vindas, campanhas) |
| `META_CAPI_ACCESS_TOKEN` | conversão Purchase na API do Meta |
| `APP_ORIGIN` | origem confiável usada nos convites em previews |

## Banco

Migrations em `supabase/migrations/` — veja o README de lá antes de mexer no
histórico. O CLI já está ligado ao projeto de produção.
