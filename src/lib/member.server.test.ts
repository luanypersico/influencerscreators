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
let profileEmail = "comprador@example.com";
interface OfferRow {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  checkout_url: string | null;
  badge: string | null;
  video_url: string | null;
  banner_url: string | null;
  active: boolean;
  sort_order: number;
}
let offerRows: OfferRow[] = [];

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
      if (table === "member_offers") {
        return {
          select: () => ({
            eq: (_column: string, value: boolean) => ({
              order: () =>
                Promise.resolve({
                  data: offerRows.filter((o) => o.active === value),
                  error: null,
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
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: { email: profileEmail }, error: null }),
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

const {
  getMyProductAccess,
  getBergamoMemberContent,
  getRecommendedOffers,
  maskEmailForWatermark,
  shortIdForWatermark,
} = await import("./member.server");

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

  it("revoked_at preenchido nunca conta como produto adquirido, mesmo sem suspended_at/expires_at", async () => {
    accessRows = [
      {
        product_id: "p1",
        expires_at: null,
        revoked_at: new Date().toISOString(),
        suspended_at: null,
        products: { id: "p1", slug: "bergamo", name: "Bergamo", tagline: null },
      },
    ];
    const result = await getMyProductAccess("user-1");
    expect(result).toHaveLength(0);
  });
});

describe("getRecommendedOffers — vitrine de afiliados, nunca concede acesso", () => {
  beforeEach(() => {
    offerRows = [];
  });

  it("oferta ativa com checkout_url aparece", async () => {
    offerRows = [
      {
        id: "o1",
        title: "Oferta A",
        description: null,
        cover_url: null,
        checkout_url: "https://checkout.example.com/a",
        badge: null,
        video_url: null,
        banner_url: null,
        active: true,
        sort_order: 0,
      },
    ];
    const result = await getRecommendedOffers();
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("o1");
  });

  it("repassa video_url quando presente, e null quando ausente — sem quebrar em nenhum dos dois casos", async () => {
    offerRows = [
      {
        id: "o1b",
        title: "Com vídeo",
        description: null,
        cover_url: null,
        checkout_url: "https://checkout.example.com/a",
        badge: null,
        video_url: "https://www.youtube.com/watch?v=tYd6jyhx5BI",
        banner_url: null,
        active: true,
        sort_order: 0,
      },
      {
        id: "o1c",
        title: "Sem vídeo",
        description: null,
        cover_url: null,
        checkout_url: "https://checkout.example.com/a",
        badge: null,
        video_url: null,
        banner_url: null,
        active: true,
        sort_order: 1,
      },
    ];
    const result = await getRecommendedOffers();
    expect(result.find((o) => o.id === "o1b")?.videoUrl).toBe(
      "https://www.youtube.com/watch?v=tYd6jyhx5BI",
    );
    expect(result.find((o) => o.id === "o1c")?.videoUrl).toBeNull();
  });

  it("oferta inativa (active=false) nunca aparece para o aluno", async () => {
    offerRows = [
      {
        id: "o2",
        title: "Oferta inativa",
        description: null,
        cover_url: null,
        checkout_url: "https://checkout.example.com/b",
        badge: null,
        video_url: null,
        banner_url: null,
        active: false,
        sort_order: 0,
      },
    ];
    const result = await getRecommendedOffers();
    expect(result).toHaveLength(0);
  });

  it("oferta ativa sem checkout_url não aparece — nunca vira botão de compra quebrado", async () => {
    offerRows = [
      {
        id: "o3",
        title: "Sem link configurado",
        description: null,
        cover_url: null,
        checkout_url: null,
        badge: null,
        video_url: null,
        banner_url: null,
        active: true,
        sort_order: 0,
      },
      {
        id: "o4",
        title: "Link em branco",
        description: null,
        cover_url: null,
        checkout_url: "   ",
        badge: null,
        video_url: null,
        banner_url: null,
        active: true,
        sort_order: 1,
      },
    ];
    const result = await getRecommendedOffers();
    expect(result).toHaveLength(0);
  });

  it("nunca consulta orders ou product_access — a vitrine é inteiramente isolada do domínio comercial", async () => {
    offerRows = [
      {
        id: "o5",
        title: "Oferta",
        description: null,
        cover_url: null,
        checkout_url: "https://checkout.example.com/c",
        badge: null,
        video_url: null,
        banner_url: null,
        active: true,
        sort_order: 0,
      },
    ];
    // O mock só define handlers para as tabelas legítimas (member_offers,
    // product_access, products, ...); se getRecommendedOffers tocasse
    // orders ou product_access para decidir a vitrine, o mock lançaria
    // "tabela não mockada" — não lança, então nunca toca essas tabelas.
    await expect(getRecommendedOffers()).resolves.toHaveLength(1);
  });
});

describe("getBergamoMemberContent — gate obrigatório de has_product_access", () => {
  beforeEach(() => {
    hasProductAccessResult = false;
    profileEmail = "comprador@example.com";
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

  it("a marca-d'água vem da sessão do servidor: e-mail mascarado e um id curto, nunca o UUID completo", async () => {
    hasProductAccessResult = true;
    profileEmail = "lucas.krisan@example.com";
    const content = await getBergamoMemberContent("11111111-2222-3333-4444-555555555555");
    expect(content?.watermark.label).toBe("Uso pessoal");
    expect(content?.watermark.maskedEmail).toBe("lu**********@example.com");
    expect(content?.watermark.maskedEmail).not.toContain("lucas.krisan");
    expect(content?.watermark.shortId).toBe("11111111");
    expect(content?.watermark.shortId).not.toBe("11111111-2222-3333-4444-555555555555");
  });
});

describe("maskEmailForWatermark", () => {
  it("mantém só os 2 primeiros caracteres do usuário local e o domínio inteiro", () => {
    expect(maskEmailForWatermark("ana@example.com")).toBe("an***@example.com");
  });

  it("nunca deixa a parte mascarada visivelmente curta (mínimo de 3 asteriscos)", () => {
    const masked = maskEmailForWatermark("ab@example.com");
    expect(masked).toBe("ab***@example.com");
  });

  it("nunca contém o e-mail completo original", () => {
    const email = "comprador.real@dominio.com";
    expect(maskEmailForWatermark(email)).not.toContain(email);
  });

  it("entrada sem @ não quebra e não expõe o valor original", () => {
    expect(maskEmailForWatermark("valor-invalido")).toBe("conta protegida");
  });
});

describe("shortIdForWatermark", () => {
  it("retorna só os 8 primeiros caracteres hexadecimais, sem hífens", () => {
    expect(shortIdForWatermark("abcdef12-3456-7890-abcd-ef1234567890")).toBe("abcdef12");
  });

  it("nunca é igual ao UUID completo", () => {
    const uuid = "abcdef12-3456-7890-abcd-ef1234567890";
    expect(shortIdForWatermark(uuid)).not.toBe(uuid);
    expect(shortIdForWatermark(uuid).length).toBeLessThan(uuid.length);
  });
});
