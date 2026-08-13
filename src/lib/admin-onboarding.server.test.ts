import { beforeEach, describe, expect, it, mock } from "bun:test";

type Access = { revoked_at: string | null; suspended_at: string | null; expires_at: string | null };
let roles: string[] = [];
let userId: string | null = null;
let paidOrderEmail: string | null = null;
let access: Access | null = null;
let invited: Array<{ email: string; redirectTo?: string }> = [];
let recovery: Array<{ email: string; redirectTo?: string }> = [];
let deletedAuthUsers: string[] = [];
let audit: Record<string, unknown>[] = [];

mock.module("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    rpc: () => Promise.resolve({ data: userId, error: null }),
    auth: {
      admin: {
        inviteUserByEmail: (email: string, options: { redirectTo?: string }) => {
          invited.push({ email, ...options });
          return Promise.resolve({ data: { user: { id: "new-user" } }, error: null });
        },
        deleteUser: (id: string) => {
          deletedAuthUsers.push(id);
          return Promise.resolve({ data: null, error: null });
        },
      },
      resetPasswordForEmail: (email: string, options: { redirectTo?: string }) => {
        recovery.push({ email, ...options });
        return Promise.resolve({ data: {}, error: null });
      },
    },
    from(table: string) {
      if (table === "user_roles") {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: roles.map((role) => ({ role })), error: null }),
          }),
        };
      }
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({ data: { email: "admin@example.com" }, error: null }),
            }),
          }),
        };
      }
      if (table === "products") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: { id: "bergamo" }, error: null }),
            }),
          }),
        };
      }
      if (table === "orders") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: (column: string, value: string) => ({
                  limit: () =>
                    Promise.resolve({
                      data:
                        column === "buyer_email" && value === paidOrderEmail
                          ? [{ id: "order" }]
                          : [],
                      error: null,
                    }),
                }),
              }),
            }),
          }),
        };
      }
      if (table === "product_access") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({ maybeSingle: () => Promise.resolve({ data: access, error: null }) }),
            }),
          }),
        };
      }
      if (table === "admin_audit_log") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  gte: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }),
                }),
              }),
            }),
          }),
          insert: (row: Record<string, unknown>) => {
            audit.push(row);
            return Promise.resolve({ data: null, error: null });
          },
        };
      }
      throw new Error(`unmocked table ${table}`);
    },
  },
}));

const { previewArsenalOnboarding, resendArsenalOnboarding } = await import("./admin.server");

beforeEach(() => {
  roles = ["super_admin"];
  userId = null;
  paidOrderEmail = null;
  access = null;
  invited = [];
  recovery = [];
  deletedAuthUsers = [];
  audit = [];
});

describe("reenviar onboarding Arsenal", () => {
  const base = { actorId: "admin", email: "buyer@example.com" };

  it("convida usuário inexistente com compra válida para o host Arsenal", async () => {
    paidOrderEmail = base.email;
    const result = await resendArsenalOnboarding({ ...base, confirm: true });
    expect(result.method).toBe("INVITE");
    expect(invited).toEqual([{ email: base.email, redirectTo: "https://arsenal.obergamo.com.br" }]);
    expect(recovery).toHaveLength(0);
  });

  it("usa recovery para usuário existente com acesso ativo, sem excluir Auth", async () => {
    userId = "buyer";
    access = { revoked_at: null, suspended_at: null, expires_at: null };
    const result = await resendArsenalOnboarding({ ...base, confirm: true });
    expect(result.method).toBe("RECOVERY");
    expect(recovery).toEqual([
      {
        email: base.email,
        redirectTo: "https://arsenal.obergamo.com.br/auth/callback?next=/auth/set-password",
      },
    ]);
    expect(invited).toHaveLength(0);
    expect(deletedAuthUsers).toHaveLength(0);
  });

  it("usa igualdade exata de e-mail — nunca casamento tipo wildcard de ILIKE", async () => {
    paidOrderEmail = "joao_silva@gmail.com";

    const nonMatches = ["joaoXsilva@gmail.com", "joao-silva@gmail.com", "joaoasilva@gmail.com"];
    for (const email of nonMatches) {
      await expect(previewArsenalOnboarding({ actorId: "admin", email })).rejects.toThrow(
        "Comprador sem compra Bergamo aprovada nem acesso legítimo",
      );
    }

    const preview = await previewArsenalOnboarding({
      actorId: "admin",
      email: "joao_silva@gmail.com",
    });
    expect(preview.hasPaidOrder).toBe(true);
  });

  it("bloqueia comprador sem compra nem acesso legítimo", async () => {
    await expect(previewArsenalOnboarding(base)).rejects.toThrow(
      "Comprador sem compra Bergamo aprovada nem acesso legítimo",
    );
  });

  it("sinaliza entitlement ausente antes de enviar recovery", async () => {
    userId = "buyer";
    paidOrderEmail = base.email;
    const result = await resendArsenalOnboarding({ ...base, confirm: true });
    expect(result.status).toBe("ENTITLEMENT_REPAIR_REQUIRED");
    expect(result.sent).toBe(false);
    expect(invited).toHaveLength(0);
    expect(recovery).toHaveLength(0);
  });

  it("bloqueia quem não é super_admin", async () => {
    roles = ["admin"];
    await expect(previewArsenalOnboarding({ ...base, controlledTest: true })).rejects.toThrow(
      "Somente o super admin",
    );
  });

  it("registra auditoria sem token ou segredo", async () => {
    userId = "buyer";
    access = { revoked_at: null, suspended_at: null, expires_at: null };
    await resendArsenalOnboarding({ ...base, confirm: true });
    expect(audit).toHaveLength(1);
    expect(audit[0]?.["action"]).toBe("arsenal.onboarding.resend");
    expect(audit[0]?.["entity"]).toBe("buyer");
    expect(audit[0]?.["entity_id"]).toBe(base.email);
    expect(JSON.stringify(audit[0])).not.toContain("token_hash");
  });
});
