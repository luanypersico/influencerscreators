CREATE OR REPLACE FUNCTION public.__temp_seed_bergamo_items(p_token text, p_rows jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','extensions'
AS $$
DECLARE v_count integer;
BEGIN
  IF encode(extensions.digest(p_token,'sha256'),'hex') <> '0e749d5a074f88f4551f9fb8c0fcca55dc4256b08507e5c5b2d42533b644708e' THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  IF jsonb_typeof(p_rows) <> 'array' OR jsonb_array_length(p_rows) > 20 THEN
    RAISE EXCEPTION 'invalid batch';
  END IF;
  INSERT INTO public.product_items (category,code,created_at,created_by,description,id,image_url,is_free,item_type,member_image_path,product_id,prompt,published_at,sort_order,status,title,updated_at,updated_by)
  SELECT
    x.category,x.code,x.created_at,x.created_by,x.description,x.id,x.image_url,x.is_free,x.item_type,x.member_image_path,x.product_id,x.prompt,x.published_at,x.sort_order,x.status,x.title,x.updated_at,x.updated_by
  FROM jsonb_to_recordset(p_rows) AS x(
    category text, code text, created_at timestamptz, created_by uuid, description text, id uuid,
    image_url text, is_free boolean, item_type text, member_image_path text, product_id uuid,
    prompt text, published_at timestamptz, sort_order integer, status text, title text,
    updated_at timestamptz, updated_by uuid
  )
  WHERE x.product_id='e23f2271-3450-4e69-972f-8f9ea0d27130'::uuid
    AND x.code ~ '^[0-9]{2}$'
  ON CONFLICT (id) DO UPDATE SET
    category=EXCLUDED.category,code=EXCLUDED.code,created_at=EXCLUDED.created_at,created_by=EXCLUDED.created_by,
    description=EXCLUDED.description,image_url=EXCLUDED.image_url,is_free=EXCLUDED.is_free,item_type=EXCLUDED.item_type,
    member_image_path=EXCLUDED.member_image_path,product_id=EXCLUDED.product_id,prompt=EXCLUDED.prompt,
    published_at=EXCLUDED.published_at,sort_order=EXCLUDED.sort_order,status=EXCLUDED.status,title=EXCLUDED.title,
    updated_at=EXCLUDED.updated_at,updated_by=EXCLUDED.updated_by;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END $$;
REVOKE ALL ON FUNCTION public.__temp_seed_bergamo_items(text,jsonb) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.__temp_seed_bergamo_items(text,jsonb) TO anon;
