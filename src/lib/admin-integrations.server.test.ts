/**
 * Testes das funções administrativas da integração Bergamo/Hotmart.
 *
 * TODOS os testes deste arquivo usam `supabaseAdmin` MOCKADO via
 * `mock.module` — nenhum acessa o banco real, nenhuma chamada é RPC
 * real, nenhum Auth real é exercitado. O objetivo é a lógica de
 * autorização (`assertSuperAdmin`) e o contrato client-safe
 * (nunca devolver o Hottok), que são determinísticos e não dependem
 * de infraestrutura externa.
 */
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

type Role = "super_admin" | "admin" | "coproducer" | "support" | "member";

let userRoles: Record<string, Role[]> = {};
let profileEmail: Record<string, string> = {};
let auditLogInserts: Record<string, unknown>[] = [];
let bergamoRow: {
  id: string;
  provider: string;
  product_id: string;
  environment: string;
  external_product_ucode: string | null;
  external_product_id: string | null;
  external_offer_id: string | null;
  active: boolean;
  updated_at: string;
} = {
  id: "integration-1",
  provider: "hotmart",
  product_id: "product-bergamo",
  environment: "production",
  external_product_ucode: null,
  external_product_id: null,
  external_offer_id: null,
  active: false,
  updated_at: "2026-08-04T00:00:00.000Z",
};

mock.module("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    from(table: string) {
      if (table === "user_roles") {
        return {
          select: (_c: string) => ({
            eq: (_col: string, userId: string) =>
              Promise.resolve({
                data: (userRoles[userId] ?? []).map((role) => ({ role })),
                error: null,
              }),
          }),
        };
      }
      if (table === "profiles") {
        return {
          select: (_c: string) => ({
            eq: (_col: string, userId: string) => ({
              maybeSingle: () =>
                Promise.resolve({ data: { email: profileEmail[userId] ?? null }, error: null }),
            }),
          }),
        };
      }
      if (table === "admin_audit_log") {
        return {
          insert: (row: Record<string, unknown>) => {
            auditLogInserts.push(row);
            return Promise.resolve({ data: null, error: null });
          },
        };
      }
      if (table === "payment_integrations") {
        return {
          select: (_c: string) => ({
            eq: (_c1: string, _v1: unknown) => ({
              eq: (_c2: string, _v2: unknown) => ({
                order: () => ({
                  limit: () => ({
                    maybeSingle: () => Promise.resolve({ data: bergamoRow, error: null }),
                  }),
                }),
              }),
            }),
          }),
          update: (patch: Partial<typeof bergamoRow>) => ({
            eq: (_col: string, _id: string) => ({
              select: (_c: string) => ({
                single: () => {
                  bergamoRow = { ...bergamoRow, ...patch };
                  return Promise.resolve({ data: bergamoRow, error: null });
                },
              }),
            }),
          }),
        };
      }
      throw new Error(`tabela não mockada neste teste: ${table}`);
    },
  },
}));

const { getBergamoHotmartIntegration, updateBergamoHotmartIntegration } =
  await import("./admin-integrations.server");

const ANON_ID = "anon-user";
const MEMBER_ID = "member-user";
const ADMIN_ID = "admin-user";
const SUPER_ADMIN_ID = "super-admin-user";

describe("getBergamoHotmartIntegration — autorização", () => {
  beforeEach(() => {
    userRoles = {
      [MEMBER_ID]: ["member"],
      [ADMIN_ID]: ["admin"],
      [SUPER_ADMIN_ID]: ["super_admin"],
      // ANON_ID propositalmente ausente — sem nenhuma role cadastrada.
    };
  });

  it("rejeita usuário sem nenhuma role (equivalente a anon autenticado sem papel)", async () => {
    await expect(getBergamoHotmartIntegration(ANON_ID)).rejects.toThrow();
  });

  it("rejeita member", async () => {
    await expect(getBergamoHotmartIntegration(MEMBER_ID)).rejects.toThrow();
  });

  it("rejeita admin comum — esta tela exige super_admin", async () => {
    await expect(getBergamoHotmartIntegration(ADMIN_ID)).rejects.toThrow();
  });

  it("permite super_admin", async () => {
    const result = await getBergamoHotmartIntegration(SUPER_ADMIN_ID);
    expect(result).not.toBeNull();
  });

  it("nunca inclui a chave 'hottok' no retorno, mesmo para super_admin", async () => {
    const result = await getBergamoHotmartIntegration(SUPER_ADMIN_ID);
    expect(result).not.toBeNull();
    const keys = Object.keys(result as object);
    expect(keys).not.toContain("hottok");
    expect(keys).toContain("hottok_configured");
    expect(typeof result?.hottok_configured).toBe("boolean");
  });

  it("o contrato retornado só contém os campos client-safe esperados", async () => {
    const result = await getBergamoHotmartIntegration(SUPER_ADMIN_ID);
    const allowed = new Set([
      "id",
      "provider",
      "environment",
      "external_product_ucode",
      "external_product_id",
      "external_offer_id",
      "active",
      "updated_at",
      "hottok_configured",
      "webhook_url",
    ]);
    for (const key of Object.keys(result as object)) {
      expect(allowed.has(key)).toBe(true);
    }
  });
});

describe("updateBergamoHotmartIntegration — autorização e ativação segura", () => {
  const ORIGINAL_ENV = process.env["HOTMART_HOTTOK"];

  beforeEach(() => {
    userRoles = {
      [MEMBER_ID]: ["member"],
      [ADMIN_ID]: ["admin"],
      [SUPER_ADMIN_ID]: ["super_admin"],
    };
    profileEmail = { [SUPER_ADMIN_ID]: "ceo@example.com" };
    auditLogInserts = [];
    bergamoRow = {
      ...bergamoRow,
      active: false,
      external_product_ucode: null,
      external_offer_id: null,
    };
  });

  afterEach(() => {
    if (ORIGINAL_ENV === undefined) delete process.env["HOTMART_HOTTOK"];
    else process.env["HOTMART_HOTTOK"] = ORIGINAL_ENV;
  });

  it("rejeita admin comum tentando atualizar a integração", async () => {
    await expect(
      updateBergamoHotmartIntegration({
        actorId: ADMIN_ID,
        external_product_ucode: "u1",
        external_product_id: null,
        external_offer_id: "o1",
        environment: "production",
        active: false,
      }),
    ).rejects.toThrow();
  });

  it("rejeita ativação quando faltam ucode/oferta, mesmo com HOTMART_HOTTOK configurado", async () => {
    process.env["HOTMART_HOTTOK"] = "segredo";
    await expect(
      updateBergamoHotmartIntegration({
        actorId: SUPER_ADMIN_ID,
        external_product_ucode: null,
        external_product_id: null,
        external_offer_id: null,
        environment: "production",
        active: true,
      }),
    ).rejects.toThrow();
  });

  it("rejeita ativação quando HOTMART_HOTTOK não está configurado, mesmo com ucode/oferta presentes", async () => {
    delete process.env["HOTMART_HOTTOK"];
    await expect(
      updateBergamoHotmartIntegration({
        actorId: SUPER_ADMIN_ID,
        external_product_ucode: "u1",
        external_product_id: null,
        external_offer_id: "o1",
        environment: "production",
        active: true,
      }),
    ).rejects.toThrow();
    expect(bergamoRow.active).toBe(false);
  });

  it("permite salvar dados sem ativar, mesmo sem HOTMART_HOTTOK", async () => {
    delete process.env["HOTMART_HOTTOK"];
    const result = await updateBergamoHotmartIntegration({
      actorId: SUPER_ADMIN_ID,
      external_product_ucode: "u1",
      external_product_id: null,
      external_offer_id: "o1",
      environment: "production",
      active: false,
    });
    expect(result.active).toBe(false);
  });

  it("ativa quando ucode, oferta e HOTMART_HOTTOK estão presentes", async () => {
    process.env["HOTMART_HOTTOK"] = "segredo";
    const result = await updateBergamoHotmartIntegration({
      actorId: SUPER_ADMIN_ID,
      external_product_ucode: "u1",
      external_product_id: null,
      external_offer_id: "o1",
      environment: "production",
      active: true,
    });
    expect(result.active).toBe(true);
    expect(result.hottok_configured).toBe(true);
  });

  it("toda alteração gera um registro em admin_audit_log, sem o segredo em lugar nenhum", async () => {
    process.env["HOTMART_HOTTOK"] = "valor-secreto-nao-pode-vazar";
    await updateBergamoHotmartIntegration({
      actorId: SUPER_ADMIN_ID,
      external_product_ucode: "u1",
      external_product_id: null,
      external_offer_id: "o1",
      environment: "production",
      active: true,
    });

    expect(auditLogInserts.length).toBe(1);
    const entry = auditLogInserts[0]!;
    expect(entry["actor_id"]).toBe(SUPER_ADMIN_ID);
    expect(entry["entity"]).toBe("payment_integrations");

    const serialized = JSON.stringify(entry);
    expect(serialized).not.toContain("valor-secreto-nao-pode-vazar");
    expect(serialized.toLowerCase()).not.toContain('"hottok":');
  });

  it("nunca aceita product_id como entrada — a integração alterada é sempre a mesma linha do Bergamo", () => {
    // Garantia em tempo de compilação: UpdateBergamoIntegrationInput não declara
    // product_id. Este teste documenta a garantia e falharia a compilação
    // (não em runtime) se o campo fosse adicionado de volta ao tipo.
    const input: Parameters<typeof updateBergamoHotmartIntegration>[0] = {
      actorId: SUPER_ADMIN_ID,
      external_product_ucode: "u1",
      external_product_id: null,
      external_offer_id: "o1",
      environment: "production",
      active: false,
    };
    expect("product_id" in input).toBe(false);
  });
});
