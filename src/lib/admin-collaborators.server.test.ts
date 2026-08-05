/**
 * Testes mockados (sem banco real) de criação/revogação de vínculo de
 * colaborador — confirma que a ação sempre passa por auditoria.
 * A unicidade por (product_id, user_id) é garantida pelo banco (UNIQUE
 * constraint na migration), não é reimplementada aqui em memória.
 */
import { beforeEach, describe, expect, it, mock } from "bun:test";

const inserts: Array<{ table: string; row: Record<string, unknown> }> = [];
const updates: Array<{ table: string; patch: Record<string, unknown> }> = [];

mock.module("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    from(table: string) {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: { email: "ceo@example.com" }, error: null }),
          }),
        }),
        insert: (row: Record<string, unknown>) => {
          inserts.push({ table, row });
          return Promise.resolve({ data: null, error: null });
        },
        update: (patch: Record<string, unknown>) => {
          updates.push({ table, patch });
          return {
            eq: () => ({
              eq: () => Promise.resolve({ data: null, error: null }),
            }),
          };
        },
      };
    },
  },
}));

const { createProductCollaborator, revokeProductCollaborator } = await import("./admin.server");

describe("Vínculo de colaborador — sempre auditado", () => {
  beforeEach(() => {
    inserts.length = 0;
    updates.length = 0;
  });

  it("criar um vínculo insere em product_collaborators e registra auditoria", async () => {
    await createProductCollaborator({
      actorId: "super-admin-1",
      productId: "product-bergamo",
      userId: "user-x",
      role: "coproducer",
    });

    expect(inserts.some((i) => i.table === "product_collaborators")).toBe(true);
    const audit = inserts.find((i) => i.table === "admin_audit_log");
    expect(audit).toBeDefined();
    expect(audit?.row["action"]).toBe("collaborator.create");
  });

  it("revogar um vínculo atualiza status para revoked e registra auditoria", async () => {
    await revokeProductCollaborator({
      actorId: "super-admin-1",
      productId: "product-bergamo",
      userId: "user-x",
    });

    const update = updates.find((u) => u.table === "product_collaborators");
    expect(update?.patch["status"]).toBe("revoked");
    const audit = inserts.find((i) => i.table === "admin_audit_log");
    expect(audit?.row["action"]).toBe("collaborator.revoke");
  });
});
