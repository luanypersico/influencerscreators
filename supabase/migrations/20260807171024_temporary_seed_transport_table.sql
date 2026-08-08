CREATE UNLOGGED TABLE IF NOT EXISTS public._migration_seed_chunks (
  batch integer NOT NULL,
  idx integer NOT NULL,
  data text NOT NULL,
  PRIMARY KEY (batch, idx)
);
