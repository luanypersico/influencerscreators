-- =====================================================================
-- BERGAMO — HOTMART ACCESS FOUNDATION (Rodada 2: correção de segurança)
-- Decisão definitiva: o Hottok NUNCA vive no banco. Ele existe somente
-- como secret server-side (HOTMART_HOTTOK), cadastrado no ambiente.
-- Esta migration é corretiva e aditiva: não toca em nenhuma outra coluna,
-- não altera migrations antigas, e é segura mesmo que `hottok` já
-- contenha algum valor (limpa antes de remover; não copia para lugar
-- nenhum).
-- =====================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'payment_integrations'
      AND column_name = 'hottok'
  ) THEN
    -- Apaga qualquer valor existente antes de remover a coluna.
    UPDATE public.payment_integrations SET hottok = NULL WHERE hottok IS NOT NULL;

    ALTER TABLE public.payment_integrations DROP COLUMN hottok;
  END IF;
END $$;
