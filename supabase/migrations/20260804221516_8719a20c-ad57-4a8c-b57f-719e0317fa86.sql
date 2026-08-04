-- =====================================================================
-- BERGAMO — HOTMART ACCESS FOUNDATION (Rodada 1)
-- Afeta exclusivamente o produto 'bergamo'.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. PREFLIGHT: aborta se houver duplicatas (nada e apagado/consolidado)
-- ---------------------------------------------------------------------
DO $$
DECLARE v_rows text;
BEGIN
  SELECT string_agg(format('provider=%s provider_ref=%s (%s linhas)', provider, provider_ref, c), '; ')
    INTO v_rows
  FROM (
    SELECT provider, provider_ref, count(*) c
    FROM public.orders
    WHERE provider IS NOT NULL AND provider_ref IS NOT NULL
    GROUP BY 1,2 HAVING count(*) > 1
  ) d;
  IF v_rows IS NOT NULL THEN
    RAISE EXCEPTION 'PREFLIGHT ABORT: orders duplicados por (provider, provider_ref): %', v_rows;
  END IF;

  SELECT string_agg(format('user_id=%s product_id=%s (%s linhas)', user_id, product_id, c), '; ')
    INTO v_rows
  FROM (
    SELECT user_id, product_id, count(*) c
    FROM public.product_access GROUP BY 1,2 HAVING count(*) > 1
  ) d;
  IF v_rows IS NOT NULL THEN
    RAISE EXCEPTION 'PREFLIGHT ABORT: product_access duplicados por (user_id, product_id): %', v_rows;
  END IF;

  SELECT string_agg(format('%s (%s linhas)', e, c), '; ') INTO v_rows
  FROM (
    SELECT lower(trim(email)) e, count(*) c
    FROM public.profiles GROUP BY 1 HAVING count(*) > 1
  ) d;
  IF v_rows IS NOT NULL THEN
    RAISE EXCEPTION 'PREFLIGHT ABORT: profiles com e-mail normalizado duplicado: %', v_rows;
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 1. PRODUTO BERGAMO — somente esta linha
-- ---------------------------------------------------------------------
UPDATE public.products
SET price_cents = 2700,
    currency = 'BRL',
    status = 'draft'
WHERE slug = 'bergamo';

-- ---------------------------------------------------------------------
-- 2. payment_integrations (sem segredos, sem checkout_url duplicado)
-- ---------------------------------------------------------------------
CREATE TABLE public.payment_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL CHECK (provider IN ('hotmart')),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  environment text NOT NULL DEFAULT 'production' CHECK (environment IN ('test','production')),
  external_product_ucode text,
  external_product_id text,
  external_offer_id text,
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_integrations TO authenticated;
GRANT ALL ON public.payment_integrations TO service_role;

ALTER TABLE public.payment_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage payment integrations"
ON public.payment_integrations FOR ALL TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- uma unica integracao ATIVA por provedor+produto externo+oferta
CREATE UNIQUE INDEX payment_integrations_active_unique
ON public.payment_integrations (provider, external_product_ucode, external_offer_id)
WHERE active;

CREATE INDEX payment_integrations_product_idx ON public.payment_integrations (product_id);

CREATE TRIGGER payment_integrations_updated_at
BEFORE UPDATE ON public.payment_integrations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3. webhook_events
-- ---------------------------------------------------------------------
CREATE TABLE public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL CHECK (provider IN ('hotmart')),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  integration_id uuid NOT NULL REFERENCES public.payment_integrations(id) ON DELETE CASCADE,
  external_event_id text NOT NULL,
  event_type text NOT NULL,
  event_occurred_at timestamptz,
  transaction_ref text,
  purchase_status text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  processing_status text NOT NULL DEFAULT 'received'
    CHECK (processing_status IN ('received','processed','ignored','error')),
  error_message text,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.webhook_events TO authenticated;
GRANT ALL ON public.webhook_events TO service_role;

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read webhook events"
ON public.webhook_events FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

CREATE UNIQUE INDEX webhook_events_idem_unique
ON public.webhook_events (integration_id, external_event_id);

CREATE INDEX webhook_events_transaction_idx
ON public.webhook_events (transaction_ref, event_occurred_at DESC);

CREATE TRIGGER webhook_events_updated_at
BEFORE UPDATE ON public.webhook_events
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------
-- 4. product_access: suspensao != revogacao
-- ---------------------------------------------------------------------
ALTER TABLE public.product_access
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz,
  ADD COLUMN IF NOT EXISTS status_reason text;

CREATE UNIQUE INDEX product_access_user_product_unique
ON public.product_access (user_id, product_id);

CREATE UNIQUE INDEX orders_provider_ref_unique
ON public.orders (provider, provider_ref)
WHERE provider IS NOT NULL AND provider_ref IS NOT NULL;

CREATE UNIQUE INDEX profiles_email_normalized_unique
ON public.profiles (lower(trim(email)));

-- acesso ativo exige nao revogado E nao suspenso
CREATE OR REPLACE FUNCTION public.has_product_access(_user_id uuid, _product_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  select exists (
    select 1 from public.product_access
    where user_id = _user_id and product_id = _product_id
      and revoked_at is null
      and suspended_at is null
      and (expires_at is null or expires_at > now())
  ) or public.is_admin(_user_id)
$$;

-- ---------------------------------------------------------------------
-- 5. Busca deterministica de usuario por e-mail normalizado (server-only)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.find_user_id_by_email(_email text)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  select id from auth.users
  where lower(trim(email)) = lower(trim(_email))
  limit 1
$$;

REVOKE ALL ON FUNCTION public.find_user_id_by_email(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.find_user_id_by_email(text) FROM anon;
REVOKE ALL ON FUNCTION public.find_user_id_by_email(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.find_user_id_by_email(text) TO service_role;

-- ---------------------------------------------------------------------
-- 6. RPC comercial atomica
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.process_hotmart_event(
  p_integration_id uuid,
  p_product_id uuid,
  p_external_event_id text,
  p_event_type text,
  p_event_occurred_at timestamptz,
  p_transaction_ref text,
  p_purchase_status text,
  p_payload jsonb,
  p_user_id uuid DEFAULT NULL,
  p_buyer_email text DEFAULT NULL,
  p_buyer_name text DEFAULT NULL,
  p_amount_cents integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_event public.webhook_events;
  v_order public.orders;
  v_class text;
  v_new_status text;
  v_user_id uuid := p_user_id;
  v_last_ts timestamptz;
  v_paid boolean;
  v_disputed boolean;
  v_access_exists boolean;
  v_result jsonb;
  v_note text;
BEGIN
  -- lock logico por transacao: impede processamento simultaneo
  PERFORM pg_advisory_xact_lock(hashtextextended(coalesce(p_transaction_ref, p_external_event_id), 0));

  -- registro idempotente do evento
  INSERT INTO public.webhook_events (
    provider, product_id, integration_id, external_event_id, event_type,
    event_occurred_at, transaction_ref, purchase_status, payload, processing_status
  ) VALUES (
    'hotmart', p_product_id, p_integration_id, p_external_event_id, p_event_type,
    p_event_occurred_at, p_transaction_ref, p_purchase_status, coalesce(p_payload, '{}'::jsonb), 'received'
  )
  ON CONFLICT (integration_id, external_event_id) DO NOTHING;

  SELECT * INTO v_event FROM public.webhook_events
  WHERE integration_id = p_integration_id AND external_event_id = p_external_event_id
  FOR UPDATE;

  IF v_event.processing_status IN ('processed','ignored') THEN
    RETURN jsonb_build_object('status', v_event.processing_status, 'skipped', true, 'event_id', v_event.id);
  END IF;

  -- classificacao do evento
  v_class := CASE p_event_type
    WHEN 'PURCHASE_APPROVED' THEN 'grant'
    WHEN 'PURCHASE_COMPLETE' THEN 'grant'
    WHEN 'PURCHASE_BILLET_PRINTED' THEN 'pending'
    WHEN 'PURCHASE_DELAYED' THEN 'pending'
    WHEN 'PURCHASE_EXPIRED' THEN 'closed'
    WHEN 'PURCHASE_CANCELED' THEN 'closed'
    WHEN 'PURCHASE_PROTEST' THEN 'dispute'
    WHEN 'PURCHASE_REFUNDED' THEN 'terminal'
    WHEN 'PURCHASE_CHARGEBACK' THEN 'terminal'
    ELSE 'unknown'
  END;

  IF v_class = 'unknown' THEN
    UPDATE public.webhook_events
    SET processing_status = 'ignored', error_message = 'tipo de evento nao suportado', processed_at = now()
    WHERE id = v_event.id;
    RETURN jsonb_build_object('status','ignored','reason','unsupported_event_type');
  END IF;

  v_new_status := CASE p_event_type
    WHEN 'PURCHASE_APPROVED' THEN 'paid'
    WHEN 'PURCHASE_COMPLETE' THEN 'paid'
    WHEN 'PURCHASE_BILLET_PRINTED' THEN 'pending'
    WHEN 'PURCHASE_DELAYED' THEN 'pending'
    WHEN 'PURCHASE_EXPIRED' THEN 'canceled'
    WHEN 'PURCHASE_CANCELED' THEN 'canceled'
    WHEN 'PURCHASE_PROTEST' THEN 'disputed'
    WHEN 'PURCHASE_REFUNDED' THEN 'refunded'
    WHEN 'PURCHASE_CHARGEBACK' THEN 'chargeback'
  END;

  SELECT * INTO v_order FROM public.orders
  WHERE provider = 'hotmart' AND provider_ref = p_transaction_ref
  FOR UPDATE;

  -- guarda de ordem: evento mais antigo que o ultimo processado da transacao
  SELECT max(event_occurred_at) INTO v_last_ts FROM public.webhook_events
  WHERE transaction_ref = p_transaction_ref AND processing_status = 'processed' AND id <> v_event.id;

  IF p_event_occurred_at IS NOT NULL AND v_last_ts IS NOT NULL AND p_event_occurred_at < v_last_ts THEN
    UPDATE public.webhook_events
    SET processing_status = 'ignored', error_message = 'evento anterior ao ultimo processado desta transacao', processed_at = now()
    WHERE id = v_event.id;
    RETURN jsonb_build_object('status','ignored','reason','stale_event');
  END IF;

  -- REFUNDED/CHARGEBACK sao terminais para a transacao
  IF v_order.id IS NOT NULL AND v_order.status IN ('refunded','chargeback') AND v_class <> 'terminal' THEN
    UPDATE public.webhook_events
    SET processing_status = 'ignored', error_message = 'transacao terminal (reembolso/chargeback) — evento sem efeito', processed_at = now()
    WHERE id = v_event.id;
    RETURN jsonb_build_object('status','ignored','reason','terminal_transaction');
  END IF;

  IF v_class = 'grant' THEN
    IF v_user_id IS NULL THEN
      UPDATE public.webhook_events
      SET processing_status = 'error', error_message = 'user_id ausente para evento de liberacao'
      WHERE id = v_event.id;
      RAISE EXCEPTION 'user_id obrigatorio para % ', p_event_type;
    END IF;

    -- perfil
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (v_user_id, lower(trim(p_buyer_email)), p_buyer_name)
    ON CONFLICT (id) DO UPDATE
      SET full_name = coalesce(public.profiles.full_name, excluded.full_name);

    IF v_order.id IS NULL THEN
      INSERT INTO public.orders (product_id, user_id, buyer_email, buyer_name, amount_cents,
                                 currency, status, provider, provider_ref, paid_at)
      VALUES (p_product_id, v_user_id, lower(trim(p_buyer_email)), p_buyer_name,
              coalesce(p_amount_cents, 0), 'BRL', 'paid', 'hotmart', p_transaction_ref, now())
      RETURNING * INTO v_order;
    ELSE
      UPDATE public.orders
      SET status = 'paid',
          user_id = coalesce(user_id, v_user_id),
          buyer_name = coalesce(buyer_name, p_buyer_name),
          amount_cents = coalesce(nullif(p_amount_cents, 0), amount_cents),
          paid_at = coalesce(paid_at, now())
      WHERE id = v_order.id
      RETURNING * INTO v_order;
    END IF;
  ELSE
    -- eventos que NAO liberam acesso: nunca criam identidade
    IF v_order.id IS NULL THEN
      IF v_class = 'pending' AND p_buyer_email IS NOT NULL THEN
        INSERT INTO public.orders (product_id, user_id, buyer_email, buyer_name, amount_cents,
                                   currency, status, provider, provider_ref)
        VALUES (p_product_id, NULL, lower(trim(p_buyer_email)), p_buyer_name,
                coalesce(p_amount_cents, 0), 'BRL', v_new_status, 'hotmart', p_transaction_ref)
        RETURNING * INTO v_order;
      ELSE
        UPDATE public.webhook_events
        SET processing_status = 'error',
            error_message = 'pedido inexistente para a transacao — revisao manual necessaria',
            processed_at = now()
        WHERE id = v_event.id;
        RETURN jsonb_build_object('status','needs_review','reason','order_not_found');
      END IF;
    ELSE
      -- reembolso parcial: revisao manual, sem revogacao automatica
      IF v_class = 'terminal' AND p_amount_cents IS NOT NULL
         AND v_order.amount_cents > 0 AND p_amount_cents < v_order.amount_cents THEN
        v_note := coalesce(v_order.notes || E'\n', '') || 'revisao manual: reembolso parcial ' || p_amount_cents || ' de ' || v_order.amount_cents;
        UPDATE public.orders SET notes = v_note WHERE id = v_order.id RETURNING * INTO v_order;
        UPDATE public.webhook_events
        SET processing_status = 'processed', error_message = 'reembolso parcial — revisao manual', processed_at = now()
        WHERE id = v_event.id;
        RETURN jsonb_build_object('status','processed','reason','partial_refund_review');
      END IF;

      UPDATE public.orders SET status = v_new_status WHERE id = v_order.id RETURNING * INTO v_order;
    END IF;

    v_user_id := v_order.user_id;
  END IF;

  -- ------------------------------------------------------------------
  -- RECALCULO DE ACESSO considerando TODAS as transacoes do usuario
  -- ------------------------------------------------------------------
  IF v_user_id IS NOT NULL THEN
    SELECT
      bool_or(status = 'paid'),
      bool_or(status = 'disputed')
    INTO v_paid, v_disputed
    FROM public.orders
    WHERE user_id = v_user_id AND product_id = p_product_id
      AND provider = 'hotmart';

    v_paid := coalesce(v_paid, false);
    v_disputed := coalesce(v_disputed, false);

    SELECT EXISTS (SELECT 1 FROM public.product_access
                   WHERE user_id = v_user_id AND product_id = p_product_id)
      INTO v_access_exists;

    IF v_paid THEN
      INSERT INTO public.product_access (user_id, product_id, source, revoked_at, suspended_at, status_reason)
      VALUES (v_user_id, p_product_id, 'hotmart', NULL, NULL, 'paid')
      ON CONFLICT (user_id, product_id) DO UPDATE
        SET revoked_at = NULL, suspended_at = NULL, status_reason = 'paid', source = 'hotmart';
    ELSIF v_disputed THEN
      IF v_access_exists THEN
        UPDATE public.product_access
        SET suspended_at = coalesce(suspended_at, now()), revoked_at = NULL, status_reason = 'dispute'
        WHERE user_id = v_user_id AND product_id = p_product_id;
      END IF;
    ELSE
      IF v_access_exists THEN
        UPDATE public.product_access
        SET revoked_at = coalesce(revoked_at, now()), suspended_at = NULL, status_reason = 'revoked:' || v_new_status
        WHERE user_id = v_user_id AND product_id = p_product_id;
      END IF;
    END IF;
  END IF;

  INSERT INTO public.admin_audit_log (actor_id, actor_email, action, entity, entity_id, meta)
  VALUES (NULL, 'system:hotmart-webhook', 'hotmart.' || lower(p_event_type), 'webhook_events', v_event.id::text,
          jsonb_build_object('transaction', p_transaction_ref, 'order_status', v_new_status,
                             'access_paid', v_paid, 'access_disputed', v_disputed));

  UPDATE public.webhook_events
  SET processing_status = 'processed', error_message = NULL, processed_at = now()
  WHERE id = v_event.id;

  v_result := jsonb_build_object(
    'status','processed',
    'event_id', v_event.id,
    'order_id', v_order.id,
    'order_status', v_new_status,
    'user_id', v_user_id,
    'access_active', coalesce(v_paid, false)
  );
  RETURN v_result;
END $$;

REVOKE ALL ON FUNCTION public.process_hotmart_event(uuid,uuid,text,text,timestamptz,text,text,jsonb,uuid,text,text,integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.process_hotmart_event(uuid,uuid,text,text,timestamptz,text,text,jsonb,uuid,text,text,integer) FROM anon;
REVOKE ALL ON FUNCTION public.process_hotmart_event(uuid,uuid,text,text,timestamptz,text,text,jsonb,uuid,text,text,integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.process_hotmart_event(uuid,uuid,text,text,timestamptz,text,text,jsonb,uuid,text,text,integer) TO service_role;

-- ---------------------------------------------------------------------
-- 7. Integracao do Bergamo criada INATIVA (sem dados externos ainda)
-- ---------------------------------------------------------------------
INSERT INTO public.payment_integrations (provider, product_id, environment, active)
SELECT 'hotmart', id, 'production', false FROM public.products WHERE slug = 'bergamo';
