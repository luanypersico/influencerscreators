/**
 * Testes mockados (o cliente anon substituído via mock.module) — sem
 * banco real, sem RPC real. Prova que o catálogo público (a) nunca usa
 * supabaseAdmin/service_role, (b) nunca devolve o texto completo do
 * prompt para itens que não são amostra gratuita, e (c) filtra
 * published de novo em código como segunda trava independente da RPC.
 */
import { beforeEach, describe, expect, it, mock } from "bun:test";

interface FakeItem {
  code: string;
  title: string;
  category: string;
  description: string | null;
  is_free: boolean;
  prompt: string | null;
  status: string;
}

let items: FakeItem[] = [];

mock.module("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: (fn: string) => {
      if (fn !== "get_bergamo_public_catalog") {
        throw new Error(`rpc não mockada neste teste: ${fn}`);
      }
      return Promise.resolve({ data: items, error: null });
    },
  },
}));

const { getBergamoPublicCatalog } = await import("./bergamo-catalog.server");

describe("getBergamoPublicCatalog — nunca vaza prompt completo de item bloqueado", () => {
  beforeEach(() => {
    items = [
      {
        code: "01",
        title: "Livre",
        category: "Executivo",
        description: "desc",
        is_free: true,
        prompt: "prompt completo livre",
        status: "published",
      },
      {
        code: "02",
        title: "Bloqueado",
        category: "Executivo",
        description: "desc",
        is_free: false,
        prompt: "PROMPT SECRETO QUE NUNCA PODE VAZAR",
        status: "published",
      },
      {
        code: "03",
        title: "Rascunho",
        category: "Executivo",
        description: "desc",
        is_free: false,
        prompt: "rascunho não publicado",
        status: "draft",
      },
    ];
  });

  it("item gratuito publicado vem com o prompt completo", async () => {
    const catalog = await getBergamoPublicCatalog();
    const free = catalog.items.find((i) => i.code === "01");
    expect(free?.prompt).toBe("prompt completo livre");
  });

  it("item bloqueado publicado nunca inclui o texto do prompt", async () => {
    const catalog = await getBergamoPublicCatalog();
    const locked = catalog.items.find((i) => i.code === "02");
    expect(locked?.prompt).toBeNull();
    expect(JSON.stringify(catalog)).not.toContain("PROMPT SECRETO QUE NUNCA PODE VAZAR");
  });

  it("itens em draft nunca aparecem no catálogo público (segunda trava em código, mesmo que a RPC devolva um por engano)", async () => {
    const catalog = await getBergamoPublicCatalog();
    expect(catalog.items.find((i) => i.code === "03")).toBeUndefined();
    expect(catalog.totalCount).toBe(2);
  });

  it("categorias são derivadas só dos itens publicados", async () => {
    const catalog = await getBergamoPublicCatalog();
    expect(catalog.categories).toEqual(["Executivo"]);
  });
});
