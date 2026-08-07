-- Execute após importar 00..10 e concluir o bootstrap Auth.
DO $$
DECLARE v_categories text[];
BEGIN
  IF (SELECT count(*) FROM public.products) <> 2 THEN RAISE EXCEPTION 'products != 2'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.products WHERE slug='bergamo' AND price_cents=2700 AND status='draft') THEN RAISE EXCEPTION 'Bergamo inválido'; END IF;
  IF (SELECT count(*) FROM public.product_items i JOIN public.products p ON p.id=i.product_id WHERE p.slug='bergamo') <> 90 THEN RAISE EXCEPTION 'Bergamo items != 90'; END IF;
  IF (SELECT count(*) FROM public.product_items i JOIN public.products p ON p.id=i.product_id WHERE p.slug='bergamo' AND i.is_free) <> 3 THEN RAISE EXCEPTION 'Bergamo free != 3'; END IF;
  IF (SELECT count(*) FROM public.product_items i JOIN public.products p ON p.id=i.product_id WHERE p.slug='bergamo' AND NOT i.is_free) <> 87 THEN RAISE EXCEPTION 'Bergamo locked != 87'; END IF;
  SELECT array_agg(DISTINCT i.category ORDER BY i.category) INTO v_categories FROM public.product_items i JOIN public.products p ON p.id=i.product_id WHERE p.slug='bergamo';
  IF v_categories <> ARRAY['Automotivo','Autoridade','Criativo','Editorial & Moda','Estúdio','Executivo','Games','Lifestyle','Old Money','Pets','Urbano','Viagem']::text[] THEN RAISE EXCEPTION 'Categorias divergentes: %',v_categories; END IF;
  IF (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('enforce_bergamo_only_integration','find_user_id_by_email','get_bergamo_public_catalog','handle_new_user','has_product_access','has_role','is_admin','is_super_admin','process_hotmart_event','set_updated_at')) <> 10 THEN RAISE EXCEPTION 'Funções esperadas ausentes'; END IF;
  PERFORM public.get_bergamo_public_catalog();
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND NOT c.relrowsecurity) THEN RAISE EXCEPTION 'Tabela public sem RLS'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.payment_integrations pi JOIN public.products p ON p.id=pi.product_id WHERE p.slug='bergamo' AND NOT pi.active AND pi.external_product_ucode IS NULL AND pi.external_offer_id IS NULL) THEN RAISE EXCEPTION 'Integração Bergamo inválida'; END IF;
  IF (SELECT count(*) FROM public.product_collaborators) <> 0 OR (SELECT count(*) FROM public.product_access) <> 0 OR (SELECT count(*) FROM public.orders) <> 0 THEN RAISE EXCEPTION 'Contagens operacionais divergentes'; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND column_name ILIKE ANY(ARRAY['%hottok%','%password%','%secret%','%token%'])) THEN RAISE EXCEPTION 'Coluna potencialmente secreta encontrada'; END IF;
END $$;

SELECT count(*) AS public_catalog_rows FROM public.get_bergamo_public_catalog(); -- esperado: 90
