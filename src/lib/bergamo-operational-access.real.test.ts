/**
 * Testes REAIS (banco vivo), deliberadamente separados dos testes
 * mockados em bergamo-operational-access.server.test.ts e
 * bergamo-operational-access-static-checks.test.ts.
 *
 * Este arquivo nunca cria uma conta de validação real nem um vínculo
 * real de coprodutor — ele só verifica, com um cliente `anon` de
 * verdade contra o Supabase vivo (usando `SUPABASE_URL`/
 * `SUPABASE_PUBLISHABLE_KEY`, as duas chaves públicas já presentes no
 * `.env` deste projeto), que a trava de RLS das duas novas origens
 * operacionais (`manual_validation`, `coproducer_preview`) continua de
 * pé: ninguém não-autenticado grava em product_access ou
 * product_collaborators pelo navegador, e product_collaborators segue
 * sem nenhuma policy de leitura para anon.
 *
 * O sandbox local desta rodada não tem `SUPABASE_SERVICE_ROLE_KEY` no
 * ambiente (limitação já registrada em rodadas anteriores) — por isso
 * este arquivo cobre só o lado `anon` (não requer o secret). Cenários que
 * exigiriam service_role (provisionar e depois inspecionar de verdade a
 * conta de validação ponta a ponta) foram confirmados via SQL direto
 * (Lovable MCP `query_database`) — ver relatório de entrega — e não são
 * reproduzidos aqui como teste versionado por depender de um secret que
 * não existe neste ambiente.
 */
import { describe, expect, it } from "bun:test";

const SUPABASE_URL = process.env["SUPABASE_URL"];
const SUPABASE_PUBLISHABLE_KEY = process.env["SUPABASE_PUBLISHABLE_KEY"];
// Testes contra o banco vivo são opt-in. Ambientes locais, CI e previews podem
// possuir as variáveis públicas sem terem acesso de rede ao projeto Supabase.
const canRun =
  process.env["RUN_REAL_SUPABASE_TESTS"] === "true" &&
  Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

describe("RLS ao vivo — product_access / product_collaborators (anon)", () => {
  it.skipIf(!canRun)(
    "anon não consegue inserir um product_access com source manual_validation",
    async () => {
      const { createClient } = await import("@supabase/supabase-js");
      const anon = createClient(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!);
      const { error } = await anon.from("product_access").insert({
        user_id: "00000000-0000-0000-0000-000000000000",
        product_id: "00000000-0000-0000-0000-000000000000",
        source: "manual_validation",
      });
      expect(error).not.toBeNull();
    },
  );

  it.skipIf(!canRun)(
    "anon não consegue inserir um product_collaborators para o Bergamo",
    async () => {
      const { createClient } = await import("@supabase/supabase-js");
      const anon = createClient(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!);
      const { error } = await anon.from("product_collaborators").insert({
        user_id: "00000000-0000-0000-0000-000000000000",
        product_id: "00000000-0000-0000-0000-000000000000",
        role: "coproducer",
      });
      expect(error).not.toBeNull();
    },
  );

  it.skipIf(!canRun)(
    "anon não consegue ler product_collaborators (sem policy de select)",
    async () => {
      const { createClient } = await import("@supabase/supabase-js");
      const anon = createClient(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!);
      const { data } = await anon.from("product_collaborators").select("id").limit(1);
      expect(data ?? []).toHaveLength(0);
    },
  );
});
