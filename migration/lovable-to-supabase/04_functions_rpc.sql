-- Funções/RPCs do estado vivo. O e-mail de bootstrap foi removido do código.
BEGIN;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  new.updated_at = now();
  return new;
end $function$;
REVOKE ALL ON FUNCTION public."set_updated_at"() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public."set_updated_at"() TO service_role;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$function$;
REVOKE ALL ON FUNCTION public."has_role"(_user_id uuid, _role app_role) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public."has_role"(_user_id uuid, _role app_role) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role in ('super_admin','admin')
  )
$function$;
REVOKE ALL ON FUNCTION public."is_admin"(_user_id uuid) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public."is_admin"(_user_id uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = 'super_admin'
  )
$function$;
REVOKE ALL ON FUNCTION public."is_super_admin"(_user_id uuid) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public."is_super_admin"(_user_id uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.has_product_access(_user_id uuid, _product_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.product_access
    where user_id = _user_id and product_id = _product_id
      and revoked_at is null
      and suspended_at is null
      and (expires_at is null or expires_at > now())
  ) or public.is_admin(_user_id)
$function$;
REVOKE ALL ON FUNCTION public."has_product_access"(_user_id uuid, _product_id uuid) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public."has_product_access"(_user_id uuid, _product_id uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.find_user_id_by_email(_email text)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select id from auth.users
  where lower(trim(email)) = lower(trim(_email))
  limit 1
$function$;
REVOKE ALL ON FUNCTION public."find_user_id_by_email"(_email text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public."find_user_id_by_email"(_email text) TO service_role;

CREATE OR REPLACE FUNCTION public.enforce_bergamo_only_integration()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;
REVOKE ALL ON FUNCTION public."enforce_bergamo_only_integration"() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public."enforce_bergamo_only_integration"() TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_bergamo_public_catalog()
 RETURNS TABLE(code text, title text, category text, description text, "position" integer, is_free boolean, status text, prompt text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    pi.code,
    pi.title,
    pi.category,
    pi.description,
    pi.sort_order AS "position",
    pi.is_free,
    pi.status,
    CASE WHEN pi.is_free THEN pi.prompt ELSE NULL END AS prompt
  FROM public.product_items pi
  JOIN public.products p ON p.id = pi.product_id
  WHERE p.slug = 'bergamo'
    AND pi.status = 'published'
  ORDER BY pi.sort_order ASC;
$function$;
REVOKE ALL ON FUNCTION public."get_bergamo_public_catalog"() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public."get_bergamo_public_catalog"() TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'member')
  on conflict do nothing;

  if new.email = nullif(current_setting('app.bootstrap_super_admin_email', true), '') then
    insert into public.user_roles (user_id, role) values (new.id, 'super_admin')
    on conflict do nothing;
  end if;

  return new;
end $function$;
REVOKE ALL ON FUNCTION public."handle_new_user"() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public."handle_new_user"() TO service_role;

CREATE OR REPLACE FUNCTION public.process_hotmart_event(p_integration_id uuid, p_product_id uuid, p_external_event_id text, p_event_type text, p_event_occurred_at timestamp with time zone, p_transaction_ref text, p_purchase_status text, p_payload jsonb, p_user_id uuid DEFAULT NULL::uuid, p_buyer_email text DEFAULT NULL::text, p_buyer_name text DEFAULT NULL::text, p_amount_cents integer DEFAULT NULL::integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
END $function$;
REVOKE ALL ON FUNCTION public."process_hotmart_event"(p_integration_id uuid, p_product_id uuid, p_external_event_id text, p_event_type text, p_event_occurred_at timestamp with time zone, p_transaction_ref text, p_purchase_status text, p_payload jsonb, p_user_id uuid, p_buyer_email text, p_buyer_name text, p_amount_cents integer) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public."process_hotmart_event"(p_integration_id uuid, p_product_id uuid, p_external_event_id text, p_event_type text, p_event_occurred_at timestamp with time zone, p_transaction_ref text, p_purchase_status text, p_payload jsonb, p_user_id uuid, p_buyer_email text, p_buyer_name text, p_amount_cents integer) TO service_role;

COMMIT;
