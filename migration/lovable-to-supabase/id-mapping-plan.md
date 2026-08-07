# Plano de mapeamento de IDs

## Preservar

- `products.id`, `product_items.id` e a integração inativa: preservados porque formam o catálogo e suas FKs.
- IDs de dados operacionais reais devem ser preservados quando existirem; hoje essas tabelas têm zero linhas.

## Recriar e mapear

- `auth.users.id`: não copiar. Crie o super_admin pelo fluxo administrativo seguro do novo Supabase, com o mesmo e-mail e uma senha nova/reset.
- O UUID novo deve substituir o UUID de origem em `profiles.id`, `user_roles.user_id`, `product_access.user_id`, `product_collaborators.user_id`, `orders.user_id` e referências equivalentes.
- Mantenha fora do Git uma tabela temporária segura `source_auth_id -> target_auth_id`; valide todas as FKs antes de descartá-la.

## Ordem

1. Importar schema, catálogo e conteúdo.
2. Criar o Auth no destino.
3. Capturar o UUID novo pelo e-mail validado.
4. Criar profile e role `super_admin` com esse UUID.
5. Remapear dados operacionais, se surgirem entre exportação e cutover.
