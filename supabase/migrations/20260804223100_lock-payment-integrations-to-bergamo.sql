-- =====================================================================
-- BERGAMO — HOTMART ACCESS FOUNDATION (Rodada 2: correção de segurança)
-- Trava estrutural: payment_integrations.product_id só pode apontar
-- para o produto cujo slug é 'bergamo'. A proteção existe no banco,
-- não apenas na interface/admin — nem em INSERT nem em UPDATE de
-- product_id é possível repontar a integração para outro produto
-- (ex.: influencers-creators). `provider` já é restrito a 'hotmart'
-- pelo CHECK constraint original; este trigger reforça o par
-- (provider, product) na gravação.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.enforce_bergamo_only_integration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_slug text;
BEGIN
  IF NEW.provider <> 'hotmart' THEN
    RAISE EXCEPTION 'payment_integrations.provider só aceita ''hotmart'' nesta rodada (recebido: %)', NEW.provider;
  END IF;

  SELECT slug INTO v_slug FROM public.products WHERE id = NEW.product_id;

  IF v_slug IS DISTINCT FROM 'bergamo' THEN
    RAISE EXCEPTION 'payment_integrations.product_id só pode referenciar o produto bergamo (recebido: %)',
      coalesce(v_slug, 'produto inexistente');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS payment_integrations_bergamo_only ON public.payment_integrations;

CREATE TRIGGER payment_integrations_bergamo_only
BEFORE INSERT OR UPDATE OF product_id, provider ON public.payment_integrations
FOR EACH ROW EXECUTE FUNCTION public.enforce_bergamo_only_integration();
