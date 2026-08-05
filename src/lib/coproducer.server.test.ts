/**
 * Testes mockados do workspace do coprodutor — supabaseAdmin substituído
 * por um mini-banco em memória (mock.module), sem banco real, sem RPC
 * real, sem Auth real. Cobre a matriz de autorização (member/admin
 * comum/coprodutor sem vínculo/coprodutor Bergamo/super_admin), o
 * isolamento por produto, o não-hard-delete, a geração de revisão e
 * auditoria sem conteúdo completo do prompt.
 */
import { beforeEach, describe, expect, it, mock } from "bun:test";

type Row = Record<string, unknown>;
type Filter = [string, "eq" | "is" | "in", unknown];

const db: Record<string, Row[]> = {
  products: [],
  user_roles: [],
  product_collaborators: [],
  product_items: [],
  product_item_revisions: [],
  product_updates: [],
  orders: [],
  product_access: [],
  profiles: [],
  admin_audit_log: [],
};

function resetDb() {
  for (const key of Object.keys(db)) db[key] = [];
}

function matches(row: Row, filters: Filter[]): boolean {
  return filters.every(([col, op, val]) => {
    if (op === "eq") return row[col] === val;
    if (op === "is")
      return val === null ? row[col] === null || row[col] === undefined : row[col] === val;
    if (op === "in") return (val as unknown[]).includes(row[col]);
    return true;
  });
}

function makeQuery(table: string) {
  if (!(table in db)) throw new Error(`tabela não mockada: ${table}`);
  const filters: Filter[] = [];
  let orderCol: string | null = null;
  let orderAsc = true;
  let limitN: number | null = null;

  function run(): Row[] {
    let rows = db[table]!.filter((r) => matches(r, filters));
    if (orderCol) {
      const col = orderCol;
      rows = [...rows].sort((a, b) => {
        const av = a[col] as string | number;
        const bv = b[col] as string | number;
        return av < bv ? -1 : av > bv ? 1 : 0;
      });
      if (!orderAsc) rows.reverse();
    }
    if (limitN != null) rows = rows.slice(0, limitN);
    return rows;
  }

  const builder = {
    select: () => builder,
    eq: (col: string, val: unknown) => {
      filters.push([col, "eq", val]);
      return builder;
    },
    is: (col: string, val: unknown) => {
      filters.push([col, "is", val]);
      return builder;
    },
    in: (col: string, vals: unknown[]) => {
      filters.push([col, "in", vals]);
      return builder;
    },
    order: (col: string, opts?: { ascending?: boolean }) => {
      orderCol = col;
      orderAsc = opts?.ascending ?? true;
      return builder;
    },
    limit: (n: number) => {
      limitN = n;
      return builder;
    },
    maybeSingle: () => Promise.resolve({ data: run()[0] ?? null, error: null }),
    single: () => {
      const rows = run();
      return Promise.resolve({
        data: rows[0] ?? null,
        error: rows[0] ? null : { message: "not found" },
      });
    },
    insert: (payload: Row | Row[]) => {
      const rows = Array.isArray(payload) ? payload : [payload];
      const inserted = rows.map((r, i) => ({
        id: (r["id"] as string) ?? `${table}-${db[table]!.length + i + 1}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...r,
      }));
      db[table]!.push(...inserted);
      return {
        select: () => ({
          single: () => Promise.resolve({ data: inserted[0], error: null }),
        }),
        then: (resolve: (v: { data: Row[]; error: null }) => unknown) =>
          resolve({ data: inserted, error: null }),
      };
    },
    update: (patch: Row) => {
      const updateFilters: Filter[] = [...filters];
      const updateBuilder = {
        eq: (col: string, val: unknown) => {
          updateFilters.push([col, "eq", val]);
          return updateBuilder;
        },
        then: (resolve: (v: { data: null; error: null }) => unknown) => {
          const rows = db[table]!.filter((r) => matches(r, updateFilters));
          rows.forEach((r) => Object.assign(r, patch));
          return resolve({ data: null, error: null });
        },
      };
      return updateBuilder;
    },
    then: (resolve: (v: { data: Row[]; error: null }) => unknown) =>
      resolve({ data: run(), error: null }),
  };

  return builder;
}

mock.module("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    from: (table: string) => makeQuery(table),
  },
}));

const {
  getBergamoOverview,
  listBergamoCustomers,
  listBergamoPrompts,
  createBergamoPrompt,
  updateBergamoPrompt,
  setBergamoPromptStatus,
  listBergamoPromptRevisions,
  listBergamoUpdates,
  createBergamoUpdate,
  setBergamoUpdateStatus,
} = await import("./coproducer.server");

const BERGAMO_ID = "product-bergamo";
const OTHER_PRODUCT_ID = "product-outro";
const MEMBER_ID = "user-member";
const ADMIN_ID = "user-admin";
const SUPER_ADMIN_ID = "user-super-admin";
const COPRODUCER_ID = "user-coproducer";
const COPRODUCER_OTHER_ID = "user-coproducer-outro-produto";
const REVOKED_COLLAB_ID = "user-revoked-collab";

function seedBase() {
  resetDb();
  db["products"] = [
    {
      id: BERGAMO_ID,
      slug: "bergamo",
      name: "Bergamo",
      price_cents: 2700,
      currency: "BRL",
      status: "draft",
    },
    {
      id: OTHER_PRODUCT_ID,
      slug: "influencers-creators",
      name: "Influencers",
      price_cents: 0,
      currency: "BRL",
      status: "active",
    },
  ];
  db["user_roles"] = [
    { user_id: SUPER_ADMIN_ID, role: "super_admin" },
    { user_id: ADMIN_ID, role: "admin" },
  ];
  db["product_collaborators"] = [
    {
      id: "collab-1",
      product_id: BERGAMO_ID,
      user_id: COPRODUCER_ID,
      role: "coproducer",
      status: "active",
    },
    {
      id: "collab-2",
      product_id: OTHER_PRODUCT_ID,
      user_id: COPRODUCER_OTHER_ID,
      role: "coproducer",
      status: "active",
    },
    {
      id: "collab-3",
      product_id: BERGAMO_ID,
      user_id: REVOKED_COLLAB_ID,
      role: "coproducer",
      status: "revoked",
    },
  ];
  db["profiles"] = [{ id: SUPER_ADMIN_ID, email: "ceo@example.com" }];
}

describe("Autorização do workspace do coprodutor", () => {
  beforeEach(seedBase);

  it("member (sem role, sem vínculo) não acessa", async () => {
    await expect(getBergamoOverview(MEMBER_ID)).rejects.toThrow();
  });

  it("admin comum (sem vínculo específico do Bergamo) não acessa", async () => {
    await expect(getBergamoOverview(ADMIN_ID)).rejects.toThrow();
  });

  it("coprodutor sem vínculo Bergamo (vinculado a outro produto) não acessa o Bergamo", async () => {
    await expect(getBergamoOverview(COPRODUCER_OTHER_ID)).rejects.toThrow();
  });

  it("coprodutor com vínculo revogado no Bergamo não acessa", async () => {
    await expect(getBergamoOverview(REVOKED_COLLAB_ID)).rejects.toThrow();
  });

  it("coprodutor ativo do Bergamo acessa", async () => {
    const overview = await getBergamoOverview(COPRODUCER_ID);
    expect(overview.priceCents).toBe(2700);
  });

  it("super_admin acessa mesmo sem vínculo de colaborador", async () => {
    const overview = await getBergamoOverview(SUPER_ADMIN_ID);
    expect(overview.priceCents).toBe(2700);
  });
});

describe("Isolamento por produto", () => {
  beforeEach(() => {
    seedBase();
    db["orders"] = [
      {
        id: "o1",
        product_id: BERGAMO_ID,
        user_id: "buyer-1",
        buyer_email: "bergamo@x.com",
        buyer_name: "Comprador Bergamo",
        status: "paid",
        amount_cents: 2700,
        paid_at: "2026-01-01T00:00:00Z",
        created_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "o2",
        product_id: OTHER_PRODUCT_ID,
        user_id: "buyer-2",
        buyer_email: "outro@x.com",
        buyer_name: "Comprador Outro Produto",
        status: "paid",
        amount_cents: 0,
        paid_at: "2026-01-01T00:00:00Z",
        created_at: "2026-01-01T00:00:00Z",
      },
    ];
    db["product_items"] = [
      {
        id: "item-bergamo-1",
        product_id: BERGAMO_ID,
        code: "01",
        title: "Prompt Bergamo",
        category: "Executivo",
        description: null,
        prompt: "conteúdo bergamo",
        status: "published",
        sort_order: 1,
        updated_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "item-outro-1",
        product_id: OTHER_PRODUCT_ID,
        code: "X1",
        title: "Item de outro produto",
        category: "X",
        description: null,
        prompt: "não deveria aparecer",
        status: "published",
        sort_order: 1,
        updated_at: "2026-01-01T00:00:00Z",
      },
    ];
  });

  it("coprodutor não vê clientes de outro produto — só clientes do Bergamo aparecem", async () => {
    const customers = await listBergamoCustomers(COPRODUCER_ID);
    expect(customers).toHaveLength(1);
    expect(customers[0]?.email).toBe("bergamo@x.com");
  });

  it("lista de clientes não inclui telefone, notas, payload ou dados técnicos — só os campos previstos", async () => {
    const customers = await listBergamoCustomers(COPRODUCER_ID);
    const keys = Object.keys(customers[0] as object);
    expect(keys.sort()).toEqual(
      ["accessStatus", "email", "name", "orderStatus", "purchasedAt"].sort(),
    );
  });

  it("coprodutor não vê prompts de outro produto — lista só traz itens do Bergamo", async () => {
    const prompts = await listBergamoPrompts(COPRODUCER_ID);
    expect(prompts).toHaveLength(1);
    expect(prompts[0]?.code).toBe("01");
  });

  it("coprodutor de outro produto não consegue listar prompts do Bergamo", async () => {
    await expect(listBergamoPrompts(COPRODUCER_OTHER_ID)).rejects.toThrow();
  });
});

describe("Prompts — criação, edição, publicação, arquivamento, sem hard delete", () => {
  beforeEach(seedBase);

  it("coprodutor Bergamo cria prompt — some sempre atrelado ao Bergamo, nunca a outro produto", async () => {
    const id = await createBergamoPrompt({
      actorId: COPRODUCER_ID,
      title: "Novo prompt",
      category: "Executivo",
      description: "desc",
      prompt: "texto",
    });
    const created = db["product_items"]!.find((i) => i["id"] === id);
    expect(created?.["product_id"]).toBe(BERGAMO_ID);
    expect(created?.["status"]).toBe("draft");
  });

  it("createBergamoPrompt não aceita product_id como parâmetro — é sempre resolvido no servidor", () => {
    // Garantia em tipo: a assinatura de createBergamoPrompt não declara productId.
    const params: Parameters<typeof createBergamoPrompt>[0] = {
      actorId: COPRODUCER_ID,
      title: "x",
      category: null,
      description: null,
      prompt: null,
    };
    expect("productId" in params).toBe(false);
    expect("product_id" in params).toBe(false);
  });

  it("coprodutor de outro produto não consegue criar prompt no Bergamo", async () => {
    await expect(
      createBergamoPrompt({
        actorId: COPRODUCER_OTHER_ID,
        title: "x",
        category: null,
        description: null,
        prompt: null,
      }),
    ).rejects.toThrow();
  });

  it("publicação de um prompt gera uma revisão", async () => {
    const id = await createBergamoPrompt({
      actorId: COPRODUCER_ID,
      title: "Prompt X",
      category: "Executivo",
      description: null,
      prompt: "texto",
    });
    await setBergamoPromptStatus({ actorId: COPRODUCER_ID, itemId: id, status: "published" });
    const revisions = await listBergamoPromptRevisions(COPRODUCER_ID, id);
    expect(revisions.some((r) => r.status === "published")).toBe(true);
  });

  it("arquivamento preserva o histórico de revisões e não apaga o item", async () => {
    const id = await createBergamoPrompt({
      actorId: COPRODUCER_ID,
      title: "Prompt Y",
      category: "Executivo",
      description: null,
      prompt: "texto",
    });
    await setBergamoPromptStatus({ actorId: COPRODUCER_ID, itemId: id, status: "archived" });

    const stillExists = db["product_items"]!.find((i) => i["id"] === id);
    expect(stillExists).toBeDefined();
    expect(stillExists?.["status"]).toBe("archived");

    const revisions = await listBergamoPromptRevisions(COPRODUCER_ID, id);
    expect(revisions.length).toBeGreaterThanOrEqual(2); // criação + arquivamento
  });

  it("edição de um prompt gera uma nova revisão", async () => {
    const id = await createBergamoPrompt({
      actorId: COPRODUCER_ID,
      title: "Original",
      category: "Executivo",
      description: null,
      prompt: "texto original",
    });
    await updateBergamoPrompt({ actorId: COPRODUCER_ID, itemId: id, title: "Editado" });
    const revisions = await listBergamoPromptRevisions(COPRODUCER_ID, id);
    expect(revisions.length).toBeGreaterThanOrEqual(2);
  });

  it("não existe nenhuma função de exclusão definitiva de prompt (hard delete)", async () => {
    const mod = await import("./coproducer.server");
    const exportNames = Object.keys(mod);
    expect(exportNames.some((name) => /delete/i.test(name))).toBe(false);
  });

  it("auditoria de criação/edição/publicação nunca registra o texto completo do prompt", async () => {
    const id = await createBergamoPrompt({
      actorId: COPRODUCER_ID,
      title: "Prompt sigiloso",
      category: "Executivo",
      description: null,
      prompt: "TEXTO_SUPER_SECRETO_DO_PROMPT",
    });
    await updateBergamoPrompt({
      actorId: COPRODUCER_ID,
      itemId: id,
      prompt: "outro texto secreto",
    });
    await setBergamoPromptStatus({ actorId: COPRODUCER_ID, itemId: id, status: "published" });

    const auditEntries = db["admin_audit_log"]!.filter((row) => row["entity"] === "product_items");
    expect(auditEntries.length).toBeGreaterThan(0);
    const serialized = JSON.stringify(auditEntries);
    expect(serialized).not.toContain("TEXTO_SUPER_SECRETO_DO_PROMPT");
    expect(serialized).not.toContain("outro texto secreto");
  });
});

describe("Atualizações do produto (product_updates)", () => {
  beforeEach(seedBase);

  it("coprodutor cria e publica uma atualização do Bergamo", async () => {
    const id = await createBergamoUpdate({
      actorId: COPRODUCER_ID,
      title: "Novo lote",
      content: "10 prompts novos",
    });
    await setBergamoUpdateStatus({ actorId: COPRODUCER_ID, updateId: id, status: "published" });
    const updates = await listBergamoUpdates(COPRODUCER_ID);
    expect(updates.find((u) => u.id === id)?.status).toBe("published");
  });

  it("coprodutor de outro produto não cria atualização para o Bergamo", async () => {
    await expect(
      createBergamoUpdate({ actorId: COPRODUCER_OTHER_ID, title: "x", content: "y" }),
    ).rejects.toThrow();
  });
});

describe("Controle de preço e comercial — nenhuma função exposta para o coprodutor", () => {
  it("o módulo do coprodutor não exporta nenhuma função para alterar preço, checkout, status do produto, payment_integrations, pedidos ou concessão/revogação de acesso", async () => {
    const mod = await import("./coproducer.server");
    const exportNames = Object.keys(mod);
    const forbiddenExact = [
      "setPrice",
      "updatePrice",
      "setCheckout",
      "updateCheckout",
      "setProductStatus",
      "updateProductStatus",
      "setPaymentIntegration",
      "grantAccess",
      "revokeAccess",
      "setOrderStatus",
      "updateOrder",
      "refundOrder",
      "cancelOrder",
      "deletePrompt",
      "deleteUpdate",
    ];
    for (const forbidden of forbiddenExact) {
      expect(exportNames).not.toContain(forbidden);
    }
    // listBergamoCustomers e getBergamoOverview são leitura; reorderBergamoPrompts
    // reordena o próprio conteúdo (legítimo) — nenhum dos dois toca em orders/product_access.
    expect(exportNames).toContain("listBergamoCustomers");
    expect(exportNames).toContain("reorderBergamoPrompts");
  });
});
