-- =====================================================================
-- BERGAMO — MEMBER AREA & COPRODUCER WORKSPACE (Rodada 1)
-- Estende product_items (reaproveitado, sem tabela duplicada) e cria
-- product_item_revisions, product_updates e product_collaborators.
-- Fecha o acesso direto do navegador que sobrava em product_items,
-- seguindo o mesmo padrão de dureza da rodada anterior (payment_integrations
-- / webhook_events): tudo sensível passa a depender só de service_role,
-- usado exclusivamente dentro de funções server-side já com autorização
-- verificada (super_admin ou colaborador ativo do Bergamo).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. product_items: novos campos para suportar o fluxo editorial
-- ---------------------------------------------------------------------
ALTER TABLE public.product_items
  ADD COLUMN IF NOT EXISTS item_type text NOT NULL DEFAULT 'prompt',
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- status ganha o vocabulário editorial (draft/published/archived).
-- Linhas antigas com 'active'/'hidden' (não há nenhuma hoje) migram para
-- o equivalente mais próximo antes de trocar a constraint.
UPDATE public.product_items SET status = 'published' WHERE status = 'active';
UPDATE public.product_items SET status = 'archived' WHERE status = 'hidden';

ALTER TABLE public.product_items DROP CONSTRAINT IF EXISTS product_items_status_check;
ALTER TABLE public.product_items ADD CONSTRAINT product_items_status_check
  CHECK (status IN ('draft', 'published', 'archived'));
ALTER TABLE public.product_items ALTER COLUMN status SET DEFAULT 'draft';

-- code é o identificador estável do item dentro do produto (reaproveitado
-- da coluna já existente — era usado como código externo opcional, agora
-- também serve como slug estável "01".."90" do acervo Bergamo).
CREATE UNIQUE INDEX IF NOT EXISTS product_items_product_code_unique
  ON public.product_items (product_id, code)
  WHERE code IS NOT NULL;

CREATE INDEX IF NOT EXISTS product_items_status_idx ON public.product_items (product_id, status);

-- ---------------------------------------------------------------------
-- 2. Fecha o acesso direto do navegador em product_items.
-- Mantém só a leitura pública das amostras gratuitas publicadas (gancho
-- comercial intencional da página de vendas) e a leitura do próprio
-- comprador. Toda escrita passa a exigir função server-side.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "public reads free items" ON public.product_items;
DROP POLICY IF EXISTS "buyers read items" ON public.product_items;
DROP POLICY IF EXISTS "admins manage items" ON public.product_items;

CREATE POLICY "public reads published free items"
ON public.product_items FOR SELECT TO anon, authenticated
USING (status = 'published' AND is_free = true);

-- Sem policy de escrita para authenticated: nem admin, nem coprodutor,
-- nem comprador grava direto. Toda gravação usa service_role dentro de
-- funções server-side (assertSuperAdmin ou assertBergamoCollaborator).

CREATE TRIGGER product_items_updated_at_v2
BEFORE UPDATE ON public.product_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3. Histórico de revisões — nunca exposto a authenticated diretamente.
-- ---------------------------------------------------------------------
CREATE TABLE public.product_item_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.product_items(id) ON DELETE CASCADE,
  version integer NOT NULL,
  title text NOT NULL,
  category text,
  description text,
  prompt text,
  status text NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item_id, version)
);

GRANT ALL ON public.product_item_revisions TO service_role;
ALTER TABLE public.product_item_revisions ENABLE ROW LEVEL SECURITY;
-- Nenhuma policy para anon/authenticated: acesso só via service_role,
-- dentro de funções que já verificaram super_admin ou colaborador ativo.

CREATE INDEX product_item_revisions_item_idx ON public.product_item_revisions (item_id, version DESC);

-- ---------------------------------------------------------------------
-- 4. Atualizações do produto (changelog visível aos membros).
-- ---------------------------------------------------------------------
CREATE TABLE public.product_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.product_updates TO service_role;
ALTER TABLE public.product_updates ENABLE ROW LEVEL SECURITY;
-- Sem policy para anon/authenticated: /membros/bergamo lê via função
-- server-side (já valida product_access antes de devolver qualquer dado).

CREATE INDEX product_updates_product_idx ON public.product_updates (product_id, status, published_at DESC);

CREATE TRIGGER product_updates_updated_at
BEFORE UPDATE ON public.product_updates
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------
-- 5. Vínculo de colaborador (coprodutor/editor/suporte) por produto.
-- Role aqui é ESCOPADA AO PRODUTO — nada a ver com user_roles (que é
-- global). Um coprodutor do Bergamo não ganha nada em outro produto.
-- ---------------------------------------------------------------------
CREATE TABLE public.product_collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('coproducer', 'editor', 'support')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  UNIQUE (product_id, user_id)
);

GRANT ALL ON public.product_collaborators TO service_role;
ALTER TABLE public.product_collaborators ENABLE ROW LEVEL SECURITY;
-- Sem policy para anon/authenticated: só super_admin cria/revoga, só via
-- função server-side; a própria checagem de "sou colaborador ativo" é
-- feita no servidor com service_role, nunca pelo navegador consultando
-- esta tabela diretamente.

CREATE TRIGGER product_collaborators_updated_at
BEFORE UPDATE ON public.product_collaborators
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
