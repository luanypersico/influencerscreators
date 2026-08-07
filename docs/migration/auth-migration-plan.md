# Plano de migração de Auth

## Estado atual

Existe exatamente 1 usuário Auth real: `t***@gmail.com`, provider email, confirmado, com profile e role super_admin. Não possui product_access, colaboração nem histórico comercial. Não há compradores Bergamo reais.

Não foram exportados password hash, tokens, refresh/recovery/confirmation tokens, MFA ou qualquer segredo.

## Super_admin

1. Criar um usuário no novo Supabase pelo fluxo administrativo seguro usando o mesmo e-mail, com senha nova ou reset.
2. Confirmar o e-mail e obter o novo UUID.
3. Criar `profiles` e `user_roles(super_admin)` com o novo UUID, seguindo o mapa de IDs.
4. Não habilitar o setting opcional `app.bootstrap_super_admin_email` até a revisão; por padrão o trigger cria somente member.
5. Testar login, JWT, profile e autorização administrativa antes do cutover.

## Bergamo/compradores

Hoje há zero compradores, orders e acessos. Não existe credencial de cliente para migrar. Novos compradores devem ser criados somente após o cutover; se surgirem antes dele, refaça o snapshot e use convite/reset, nunca copie hashes.
