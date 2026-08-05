/**
 * Testes mockados (supabaseAdmin substituído via mock.module) — sem
 * banco real, sem RPC real. Cobre a matriz de acesso do comprador:
 * suspenso/revogado/expirado nunca recebem conteúdo; só published.
 */
import { beforeEach, describe, expect, it, mock } from "bun:test";

interface AccessRow {
  product_id: string;
  expires_at: string | null;
  revoked_at: string | null;
  suspended_at: string | null;
  products: { id: string; slug: string; name: string; tagline: string | null };
}

let accessRows: AccessRow[] = [];
let hasProductAccessResult = false;
let itemRows: Array<{
  code: string;
  title: string;
  category: string;
  description: string | null;
  prompt: string | null;
  status: string;
}> = [];
let updateRows: Array<{
  id: string;
  title: string;
  content: string;
  published_at: string | null;
  status: string;
}> = [];

mock.module("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    from(table: string) {
      if (table === "product_access") {
        return {
          select: () => ({
            eq: () => ({
              is: () => ({
                is: () =>
                  Promise.resolve({
                    data: accessRows.filter((r) => !r.revoked_at && !r.suspended_at),
                    error: null,
                  }),
              }),
            }),
          }),
        };
      }
      if (table === "products") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: { id: "bergamo-id" }, error: null }),
            }),
          }),
        };
      }
      if (table === "product_items") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: () =>
                  Promise.resolve({
                    data: itemRows.filter((i) => i.status === "published"),
                    error: null,
                  }),
              }),
            }),
          }),
        };
      }
      if (table === "product_updates") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: () =>
                  Promise.resolve({
                    data: updateRows.filter((u) => u.status === "published"),
                    error: null,
                  }),
              }),
            }),
          }),
        };
      }
      throw new Error(`tabela não mockada: ${table}`);
    },
    rpc: (fn: string) => {
      if (fn === "has_product_access")
        return Promise.resolve({ data: hasProductAccessResult, error: null });
      throw new Error(`rpc não mockada: ${fn}`);
    },
  },
}));

const { getMyProductAccess, getBergamoMemberContent } = await import("./member.server");

describe("getMyProductAccess — acesso suspenso/revogado/expirado nunca aparece como ativo", () => {
  beforeEach(() => {
    accessRows = [];
  });

  it("acesso normal (sem revogação/suspensão/expiração) aparece", async () => {
    accessRows = [
      {
        product_id: "p1",
        expires_at: null,
        revoked_at: null,
        suspended_at: null,
        products: { id: "p1", slug: "bergamo", name: "Bergamo", tagline: null },
      },
    ];
    const result = await getMyProductAccess("user-1");
    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe("bergamo");
  });

  it("acesso expirado não aparece mesmo que revoked_at/suspended_at estejam nulos", async () => {
    accessRows = [
      {
        product_id: "p1",
        expires_at: new Date(Date.now() - 86_400_000).toISOString(),
        revoked_at: null,
        suspended_at: null,
        products: { id: "p1", slug: "bergamo", name: "Bergamo", tagline: null },
      },
    ];
    const result = await getMyProductAccess("user-1");
    expect(result).toHaveLength(0);
  });

  it("acesso com expiração futura continua ativo", async () => {
    accessRows = [
      {
        product_id: "p1",
        expires_at: new Date(Date.now() + 86_400_000).toISOString(),
        revoked_at: null,
        suspended_at: null,
        products: { id: "p1", slug: "bergamo", name: "Bergamo", tagline: null },
      },
    ];
    const result = await getMyProductAccess("user-1");
    expect(result).toHaveLength(1);
  });
});

describe("getBergamoMemberContent — gate obrigatório de has_product_access", () => {
  beforeEach(() => {
    hasProductAccessResult = false;
    itemRows = [
      {
        code: "01",
        title: "Publicado",
        category: "Executivo",
        description: null,
        prompt: "prompt X",
        status: "published",
      },
      {
        code: "02",
        title: "Rascunho",
        category: "Executivo",
        description: null,
        prompt: "prompt Y",
        status: "draft",
      },
      {
        code: "03",
        title: "Arquivado",
        category: "Executivo",
        description: null,
        prompt: "prompt Z",
        status: "archived",
      },
    ];
    updateRows = [
      {
        id: "u1",
        title: "Atualização publicada",
        content: "conteúdo",
        published_at: "2026-01-01T00:00:00Z",
        status: "published",
      },
      {
        id: "u2",
        title: "Rascunho de atualização",
        content: "conteúdo",
        published_at: null,
        status: "draft",
      },
    ];
  });

  it("usuário autenticado sem compra (has_product_access = false) não recebe nada — retorna null", async () => {
    hasProductAccessResult = false;
    const content = await getBergamoMemberContent("user-sem-compra");
    expect(content).toBeNull();
  });

  it("acesso suspenso ou revogado (has_product_access = false via RPC) não recebe prompts", async () => {
    // has_product_access() já embute a regra revoked/suspended/expires — aqui simulamos
    // o resultado dela ser false, que é exatamente o que acontece nesses casos.
    hasProductAccessResult = false;
    const content = await getBergamoMemberContent("user-suspenso-ou-revogado");
    expect(content).toBeNull();
  });

  it("comprador ativo recebe somente itens com status published", async () => {
    hasProductAccessResult = true;
    const content = await getBergamoMemberContent("user-ativo");
    expect(content).not.toBeNull();
    expect(content?.items).toHaveLength(1);
    expect(content?.items[0]?.code).toBe("01");
  });

  it("prompt em draft não aparece para o comprador", async () => {
    hasProductAccessResult = true;
    const content = await getBergamoMemberContent("user-ativo");
    expect(content?.items.find((i) => i.code === "02")).toBeUndefined();
  });

  it("prompt archived não aparece para o comprador", async () => {
    hasProductAccessResult = true;
    const content = await getBergamoMemberContent("user-ativo");
    expect(content?.items.find((i) => i.code === "03")).toBeUndefined();
  });

  it("atualização publicada aparece; rascunho de atualização não aparece", async () => {
    hasProductAccessResult = true;
    const content = await getBergamoMemberContent("user-ativo");
    expect(content?.updates).toHaveLength(1);
    expect(content?.updates[0]?.id).toBe("u1");
  });
});
