# Drift: Git × banco vivo

## Histórico registrado

O banco registra somente 7 versions, de `20260804211555` a `20260804222626`. Elas correspondem aos sete primeiros arquivos do Git.

## Estado materializado sem version registrada

As migrations da main abaixo não aparecem em `supabase_migrations.schema_migrations`, porém seus efeitos estão no banco vivo total ou substancialmente:

- `20260804223000_remove-hottok-column.sql`: coluna hottok ausente.
- `20260804223100_lock-payment-integrations-to-bergamo.sql`: função e trigger presentes.
- `20260804224000_close-admin-rls-bypass.sql`: revogações principais presentes, mas enforce_bergamo_only_integration ainda tem EXECUTE público.
- `20260805000000_bergamo-member-content-schema.sql`: tabelas/colunas/índices presentes; deixou triggers duplicados em product_items.
- `20260805000100_seed-bergamo-prompts.sql`: 90 itens presentes.
- `20260805010000_bergamo-operational-access-sources.sql`: constraints atuais presentes.
- `20260805020000_bergamo-public-catalog-rpc.sql`: RPC presente.

## WIP aplicado fora da main

A alteração `20260805030000_bergamo-private-member-images.sql` existe apenas na branch `feat/bergamo-private-member-images`, mas seus três efeitos aparecem ao vivo: coluna member_image_path, bucket privado e policy de leitura. O bucket está vazio. Por instrução de segurança, `07_storage.sql` documenta o estado mas não o cria.

## Divergências/riscos

- O histórico de migrations não é fonte suficiente; o pacote foi gerado do catálogo vivo.
- O pacote preserva o schema vivo, mas parametriza o e-mail do bootstrap de super_admin para não gravar PII de autorização no código.
- Recomenda-se remover uma das duas triggers de product_items em uma rodada separada, depois de validar qual nome deve permanecer.
