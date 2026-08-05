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
  member_image_path?: string | null;
}> = [];
let updateRows: Array<{
  id: string;
  title: string;
  content: string;
  published_at: string | null;
  status: string;
}> = [];
let profileEmail = "comprador@example.com";

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
          select: () => {
            const filters: Array<[string, unknown]> = [];
            const builder = {
              eq: (col: string, val: unknown) => {
                filters.push([col, val]);
                return builder;
              },
              order: () =>
                Promise.resolve({
                  data: itemRows.filter((i) => i.status === "published"),
                  error: null,
                }),
              maybeSingle: () => {
                const codeFilter = filters.find(([c]) => c === "code")?.[1];
                const statusFilter = filters.find(([c]) => c === "status")?.[1];
                const row =
                  itemRows.find(
                    (i) => i.code === codeFilter && (!statusFilter || i.status === statusFilter),
                  ) ?? null;
                return Promise.resolve({ data: row, error: null });
              },
            };
            return builder;
          },
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
  getBergamoMemberImageSignedUrl,
  maskEmailForWatermark,
  shortIdForWatermark,
} = await import("./member.server");

type SignedUrlResult = { data: { signedUrl: string } | null; error: { message: string } | null };
let signedUrlResult: SignedUrlResult = {
  data: { signedUrl: "https://signed.example.com/bergamo/05.jpg?token=abc" },
  error: null,
};
let lastSignedUrlCall: { bucket: string; path: string; ttlSeconds: number } | null = null;

function makeFakeUserClient(): Parameters<typeof getBergamoMemberImageSignedUrl>[1] {
  const fake = {
    storage: {
      from: (bucket: string) => ({
        createSignedUrl: (path: string, ttlSeconds: number) => {
          lastSignedUrlCall = { bucket, path, ttlSeconds };
          return Promise.resolve(signedUrlResult);
        },
      }),
    },
  };
  return fake as unknown as Parameters<typeof getBergamoMemberImageSignedUrl>[1];
}

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

  it("hasPrivateImage é true só quando member_image_path existe, e o caminho em si nunca é devolvido", async () => {
    hasProductAccessResult = true;
    itemRows = [
      {
        code: "01",
        title: "Com imagem",
        category: "Executivo",
        description: null,
        prompt: "prompt",
        status: "published",
        member_image_path: "bergamo/01.jpg",
      },
      {
        code: "04",
        title: "Sem imagem",
        category: "Executivo",
        description: null,
        prompt: "prompt",
        status: "published",
        member_image_path: null,
      },
    ];
    const content = await getBergamoMemberContent("user-ativo");
    const withImage = content?.items.find((i) => i.code === "01");
    const withoutImage = content?.items.find((i) => i.code === "04");
    expect(withImage?.hasPrivateImage).toBe(true);
    expect(withoutImage?.hasPrivateImage).toBe(false);
    expect(JSON.stringify(content)).not.toContain("bergamo/01.jpg");
  });
});

describe("getBergamoMemberImageSignedUrl — duas camadas independentes de autorização", () => {
  beforeEach(() => {
    hasProductAccessResult = false;
    signedUrlResult = {
      data: { signedUrl: "https://signed.example.com/bergamo/05.jpg?token=abc" },
      error: null,
    };
    lastSignedUrlCall = null;
    itemRows = [
      {
        code: "05",
        title: "Item bloqueado",
        category: "Executivo",
        description: null,
        prompt: null,
        status: "published",
        member_image_path: "bergamo/05.jpg",
      },
      {
        code: "06",
        title: "Item sem imagem mapeada",
        category: "Executivo",
        description: null,
        prompt: null,
        status: "published",
        member_image_path: null,
      },
      {
        code: "07",
        title: "Item em draft",
        category: "Executivo",
        description: null,
        prompt: null,
        status: "draft",
        member_image_path: "bergamo/07.jpg",
      },
    ];
  });

  it("usuário sem acesso ativo nunca chega a chamar o Storage", async () => {
    hasProductAccessResult = false;
    const url = await getBergamoMemberImageSignedUrl("user-sem-acesso", makeFakeUserClient(), "05");
    expect(url).toBeNull();
    expect(lastSignedUrlCall).toBeNull();
  });

  it("comprador ativo recebe a signed URL para um item com imagem mapeada", async () => {
    hasProductAccessResult = true;
    const url = await getBergamoMemberImageSignedUrl("user-ativo", makeFakeUserClient(), "05");
    expect(url).toBe("https://signed.example.com/bergamo/05.jpg?token=abc");
  });

  it("chama createSignedUrl com o bucket, caminho e TTL corretos (curto, 60–120s)", async () => {
    hasProductAccessResult = true;
    await getBergamoMemberImageSignedUrl("user-ativo", makeFakeUserClient(), "05");
    expect(lastSignedUrlCall).not.toBeNull();
    expect(lastSignedUrlCall?.bucket).toBe("bergamo-member-images");
    expect(lastSignedUrlCall?.path).toBe("bergamo/05.jpg");
    expect(lastSignedUrlCall?.ttlSeconds).toBeGreaterThanOrEqual(60);
    expect(lastSignedUrlCall?.ttlSeconds).toBeLessThanOrEqual(120);
  });

  it("item sem member_image_path nunca chama o Storage", async () => {
    hasProductAccessResult = true;
    const url = await getBergamoMemberImageSignedUrl("user-ativo", makeFakeUserClient(), "06");
    expect(url).toBeNull();
    expect(lastSignedUrlCall).toBeNull();
  });

  it("item em draft nunca gera signed URL, mesmo com member_image_path preenchido", async () => {
    hasProductAccessResult = true;
    const url = await getBergamoMemberImageSignedUrl("user-ativo", makeFakeUserClient(), "07");
    expect(url).toBeNull();
    expect(lastSignedUrlCall).toBeNull();
  });

  it("código inexistente nunca gera signed URL", async () => {
    hasProductAccessResult = true;
    const url = await getBergamoMemberImageSignedUrl("user-ativo", makeFakeUserClient(), "99");
    expect(url).toBeNull();
  });

  it("rejeição da RLS de Storage (segunda camada) nunca vaza detalhe do erro — só null", async () => {
    hasProductAccessResult = true;
    signedUrlResult = { data: null, error: { message: "new row violates row-level security policy" } };
    const url = await getBergamoMemberImageSignedUrl("user-ativo", makeFakeUserClient(), "05");
    expect(url).toBeNull();
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
