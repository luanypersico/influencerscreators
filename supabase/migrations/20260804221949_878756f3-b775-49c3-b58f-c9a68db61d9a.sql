ALTER TABLE public.product_access DROP CONSTRAINT product_access_source_check;
ALTER TABLE public.product_access ADD CONSTRAINT product_access_source_check
  CHECK (source = ANY (ARRAY['manual'::text, 'purchase'::text, 'gift'::text, 'trial'::text, 'hotmart'::text]));