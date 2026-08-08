DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'coproducer', 'support', 'member');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
