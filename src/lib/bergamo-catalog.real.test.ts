/**
 * Teste REAL (banco vivo, sem mock), deliberadamente separado de
 * bergamo-catalog.server.test.ts (mockado). Chama a RPC
 * get_bergamo_public_catalog() de verdade, usando só as duas chaves
 * públicas já presentes no `.env` deste projeto (SUPABASE_URL,
 * SUPABASE_PUBLISHABLE_KEY/VITE_SUPABASE_PUBLISHABLE_KEY) — o mesmo
 * cliente anon que qualquer visitante do /bergamo usa, nunca
 * SUPABASE_SERVICE_ROLE_KEY. Prova que a página pública funciona sem
 * o secret de service role.
 */
import { describe, expect, it } from "bun:test";

const SUPABASE_URL = process.env["SUPABASE_URL"];
const SUPABASE_PUBLISHABLE_KEY =
  process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
const canRun = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

const ALLOWED_KEYS = new Set([
  "code",
  "title",
  "category",
  "description",
  "position",
  "is_free",
  "status",
  "prompt",
]);

describe("get_bergamo_public_catalog — RPC real, cliente anon, sem service_role", () => {
  it.skipIf(!canRun)("retorna exatamente 90 itens, 3 gratuitos e 87 bloqueados", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const anon = createClient(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!);

    const { data, error } = await anon.rpc("get_bergamo_public_catalog");
    expect(error).toBeNull();
    expect(data).toHaveLength(90);

    const free = (data ?? []).filter((row: { is_free: boolean }) => row.is_free === true);
    const locked = (data ?? []).filter((row: { is_free: boolean }) => row.is_free === false);
    expect(free).toHaveLength(3);
    expect(locked).toHaveLength(87);
  });

  it.skipIf(!canRun)(
    "os 87 bloqueados sempre têm prompt = null; os 3 gratuitos podem ter prompt",
    async () => {
      const { createClient } = await import("@supabase/supabase-js");
      const anon = createClient(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!);

      const { data } = await anon.rpc("get_bergamo_public_catalog");
      const rows = (data ?? []) as Array<{ is_free: boolean; prompt: string | null }>;

      for (const row of rows.filter((r) => !r.is_free)) {
        expect(row.prompt).toBeNull();
      }
      const freeWithPrompt = rows.filter((r) => r.is_free && r.prompt);
      expect(freeWithPrompt.length).toBeGreaterThan(0);
    },
  );

  it.skipIf(!canRun)(
    "nenhuma chave inesperada aparece no JSON (sem created_by/updated_by/imagem/caminho privado)",
    async () => {
      const { createClient } = await import("@supabase/supabase-js");
      const anon = createClient(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!);

      const { data } = await anon.rpc("get_bergamo_public_catalog");
      const rows = (data ?? []) as Array<Record<string, unknown>>;
      expect(rows.length).toBeGreaterThan(0);

      for (const row of rows) {
        for (const key of Object.keys(row)) {
          expect(ALLOWED_KEYS.has(key)).toBe(true);
        }
      }

      const serialized = JSON.stringify(rows);
      for (const forbidden of [
        "created_by",
        "updated_by",
        "image_url",
        "original_url",
        "gallery",
      ]) {
        expect(serialized).not.toContain(forbidden);
      }
    },
  );

  it.skipIf(!canRun)(
    "chamar a RPC com um argumento de product_id/slug forjado é rejeitado (a função não aceita argumentos)",
    async () => {
      const { createClient } = await import("@supabase/supabase-js");
      const anon = createClient(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!);

      const { error } = await anon.rpc("get_bergamo_public_catalog", {
        product_id: "outro-produto-qualquer",
      } as never);
      expect(error).not.toBeNull();
    },
  );
});
