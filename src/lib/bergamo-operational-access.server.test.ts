/**
 * Testes mockados da preparação operacional do Bergamo (conta de
 * validação Hotmart + vínculo do coprodutor real). `supabaseAdmin` é
 * substituído por um mini-banco em memória e um mapa fake de usuários do
 * Auth (mock.module) — nenhum acessa o banco real, nenhum e-mail real é
 * enviado, nenhum usuário real do Supabase Auth é criado. Cobre a matriz
 * de autorização, a garantia de que a conta de validação nunca recebe
 * papel/colaborador, a idempotência dos vínculos, e que a senha nunca
 * aparece em nenhuma resposta ou registro de auditoria.
 */
import { beforeEach, describe, expect, it, mock } from "bun:test";

type Row = Record<string, unknown>;
type Filter = [string, "eq" | "is" | "in", unknown];

const db: Record<string, Row[]> = {
  products: [],
  user_roles: [],
  product_collaborators: [],
  product_access: [],
  profiles: [],
  admin_audit_log: [],
};

type AuthUser = { id: string; email: string; password: string; email_confirm: boolean };
let authUsers: Record<string, AuthUser> = {};
let authIdSeq = 0;

function resetAll() {
  for (const key of Object.keys(db)) db[key] = [];
  authUsers = {};
  authIdSeq = 0;
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
        revoked_at: null,
        suspended_at: null,
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
    upsert: (payload: Row) => {
      const id = payload["id"];
      const existing = id != null ? db[table]!.find((r) => r["id"] === id) : undefined;
      if (existing) {
        Object.assign(existing, payload);
      } else {
        db[table]!.push({ created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...payload });
      }
      return Promise.resolve({ data: null, error: null });
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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

mock.module("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    from: (table: string) => makeQuery(table),
    rpc: (fn: string, args: Record<string, unknown>) => {
      if (fn === "find_user_id_by_email") {
        const email = normalizeEmail(String(args["_email"]));
        const found = Object.values(authUsers).find((u) => u.email === email);
        return Promise.resolve({ data: found?.id ?? null, error: null });
      }
      throw new Error(`rpc não mockada neste teste: ${fn}`);
    },
    auth: {
      admin: {
        createUser: (params: { email: string; password: string; email_confirm?: boolean }) => {
          const email = normalizeEmail(params.email);
          if (Object.values(authUsers).some((u) => u.email === email)) {
            return Promise.resolve({
              data: { user: null },
              error: { message: "e-mail já registrado" },
            });
          }
          authIdSeq += 1;
          const id = `auth-user-${authIdSeq}`;
          authUsers[id] = {
            id,
            email,
            password: params.password,
            email_confirm: Boolean(params.email_confirm),
          };
          return Promise.resolve({ data: { user: { id } }, error: null });
        },
        updateUserById: (id: string, patch: { password?: string; email_confirm?: boolean }) => {
          const user = authUsers[id];
          if (!user) return Promise.resolve({ data: null, error: { message: "usuário não encontrado" } });
          if (patch.password !== undefined) user.password = patch.password;
          if (patch.email_confirm !== undefined) user.email_confirm = patch.email_confirm;
          return Promise.resolve({ data: { user: { id } }, error: null });
        },
        deleteUser: (id: string) => {
          delete authUsers[id];
          return Promise.resolve({ error: null });
        },
        inviteUserByEmail: (email: string) => {
          const normalized = normalizeEmail(email);
          authIdSeq += 1;
          const id = `auth-user-${authIdSeq}`;
          authUsers[id] = { id, email: normalized, password: "", email_confirm: false };
          return Promise.resolve({ data: { user: { id } }, error: null });
        },
      },
    },
  },
}));

const {
  provisionHotmartValidationAccount,
  revokeHotmartValidationAccess,
  deleteHotmartValidationUser,
  listHotmartValidationAccounts,
  linkBergamoCoproducer,
  revokeBergamoCoproducerLink,
  listBergamoCoproducers,
  setBergamoCoproducerMemberPreview,
} = await import("./bergamo-operational-access.server");

const BERGAMO_PRODUCT_ID = "product-bergamo";
const OTHER_PRODUCT_ID = "product-influencers-creators";

const MEMBER_ID = "member-user";
const ADMIN_ID = "admin-user";
const COPRODUCER_ROLE_ID = "global-coproducer-role-user";
const SUPER_ADMIN_ID = "super-admin-user";

function seedBaseline() {
  authUsers[SUPER_ADMIN_ID] = {
    id: SUPER_ADMIN_ID,
    email: "ceo@example.com",
    password: "x",
    email_confirm: true,
  };
  authUsers[ADMIN_ID] = { id: ADMIN_ID, email: "admin@example.com", password: "x", email_confirm: true };
  authUsers[MEMBER_ID] = { id: MEMBER_ID, email: "member@example.com", password: "x", email_confirm: true };
  authUsers[COPRODUCER_ROLE_ID] = {
    id: COPRODUCER_ROLE_ID,
    email: "coprole@example.com",
    password: "x",
    email_confirm: true,
  };

  db["products"]!.push(
    { id: BERGAMO_PRODUCT_ID, slug: "bergamo", name: "Bergamo" },
    { id: OTHER_PRODUCT_ID, slug: "influencers-creators", name: "Influencers Creators" },
  );
  db["user_roles"]!.push(
    { id: "r1", user_id: ADMIN_ID, role: "admin" },
    { id: "r2", user_id: SUPER_ADMIN_ID, role: "super_admin" },
    { id: "r3", user_id: COPRODUCER_ROLE_ID, role: "coproducer" },
  );
  db["profiles"]!.push(
    { id: SUPER_ADMIN_ID, email: "ceo@example.com", full_name: "CEO" },
    { id: ADMIN_ID, email: "admin@example.com", full_name: "Admin" },
    { id: MEMBER_ID, email: "member@example.com", full_name: "Member" },
    { id: COPRODUCER_ROLE_ID, email: "coprole@example.com", full_name: "Coprodutor global" },
  );
  // Linha de outro produto pré-existente, usada para provar isolamento.
  db["product_access"]!.push({
    id: "access-other-1",
    user_id: MEMBER_ID,
    product_id: OTHER_PRODUCT_ID,
    source: "purchase",
    revoked_at: null,
    suspended_at: null,
    expires_at: null,
  });
  db["product_collaborators"]!.push({
    id: "collab-other-1",
    product_id: OTHER_PRODUCT_ID,
    user_id: COPRODUCER_ROLE_ID,
    role: "coproducer",
    status: "active",
    revoked_at: null,
  });
}

beforeEach(() => {
  resetAll();
  seedBaseline();
});

const VALID_PASSWORD = "senha-forte-de-validacao-123";

describe("provisionHotmartValidationAccount — autorização", () => {
  it("rejeita member", async () => {
    await expect(
      provisionHotmartValidationAccount({
        actorId: MEMBER_ID,
        email: "validacao@example.com",
        password: VALID_PASSWORD,
        label: "Validação Hotmart",
        confirmEmail: false,
        confirmOperation: true,
      }),
    ).rejects.toThrow();
  });

  it("rejeita admin comum", async () => {
    await expect(
      provisionHotmartValidationAccount({
        actorId: ADMIN_ID,
        email: "validacao@example.com",
        password: VALID_PASSWORD,
        label: "Validação Hotmart",
        confirmEmail: false,
        confirmOperation: true,
      }),
    ).rejects.toThrow();
  });

  it("rejeita usuário com papel global 'coproducer'", async () => {
    await expect(
      provisionHotmartValidationAccount({
        actorId: COPRODUCER_ROLE_ID,
        email: "validacao@example.com",
        password: VALID_PASSWORD,
        label: "Validação Hotmart",
        confirmEmail: false,
        confirmOperation: true,
      }),
    ).rejects.toThrow();
  });

  it("permite super_admin", async () => {
    const result = await provisionHotmartValidationAccount({
      actorId: SUPER_ADMIN_ID,
      email: "validacao@example.com",
      password: VALID_PASSWORD,
      label: "Validação Hotmart",
      confirmEmail: false,
      confirmOperation: true,
    });
    expect(result.userId).toBeDefined();
  });

  it("rejeita sem confirmOperation, mesmo para super_admin", async () => {
    await expect(
      provisionHotmartValidationAccount({
        actorId: SUPER_ADMIN_ID,
        email: "validacao@example.com",
        password: VALID_PASSWORD,
        label: "Validação Hotmart",
        confirmEmail: false,
        confirmOperation: false,
      }),
    ).rejects.toThrow();
  });

  it("rejeita senha curta", async () => {
    await expect(
      provisionHotmartValidationAccount({
        actorId: SUPER_ADMIN_ID,
        email: "validacao@example.com",
        password: "curta",
        label: "Validação Hotmart",
        confirmEmail: false,
        confirmOperation: true,
      }),
    ).rejects.toThrow();
  });

  it("exige motivo documentado quando confirmEmail é true", async () => {
    await expect(
      provisionHotmartValidationAccount({
        actorId: SUPER_ADMIN_ID,
        email: "validacao@example.com",
        password: VALID_PASSWORD,
        label: "Validação Hotmart",
        confirmEmail: true,
        confirmEmailReason: "",
        confirmOperation: true,
      }),
    ).rejects.toThrow();
  });

  it("recusa reaproveitar um e-mail que já tem papel administrativo", async () => {
    await expect(
      provisionHotmartValidationAccount({
        actorId: SUPER_ADMIN_ID,
        email: "admin@example.com",
        password: VALID_PASSWORD,
        label: "Validação Hotmart",
        confirmEmail: false,
        confirmOperation: true,
      }),
    ).rejects.toThrow();
  });

  it("recusa reaproveitar um e-mail que já é colaborador de outro produto", async () => {
    await expect(
      provisionHotmartValidationAccount({
        actorId: SUPER_ADMIN_ID,
        email: "coprole@example.com",
        password: VALID_PASSWORD,
        label: "Validação Hotmart",
        confirmEmail: false,
        confirmOperation: true,
      }),
    ).rejects.toThrow();
  });
});

describe("provisionHotmartValidationAccount — isolamento de dados concedidos", () => {
  it("concede somente product_access ao Bergamo — nenhuma role, nenhum product_collaborator", async () => {
    const result = await provisionHotmartValidationAccount({
      actorId: SUPER_ADMIN_ID,
      email: "validacao@example.com",
      password: VALID_PASSWORD,
      label: "Validação Hotmart",
      confirmEmail: false,
      confirmOperation: true,
    });

    const roles = db["user_roles"]!.filter((r) => r["user_id"] === result.userId);
    expect(roles.length).toBe(0);

    const collaborators = db["product_collaborators"]!.filter((r) => r["user_id"] === result.userId);
    expect(collaborators.length).toBe(0);

    const access = db["product_access"]!.filter((r) => r["user_id"] === result.userId);
    expect(access.length).toBe(1);
    expect(access[0]!["product_id"]).toBe(BERGAMO_PRODUCT_ID);
    expect(access[0]!["source"]).toBe("manual_validation");
  });

  it("nunca inclui a senha na resposta", async () => {
    const result = await provisionHotmartValidationAccount({
      actorId: SUPER_ADMIN_ID,
      email: "validacao@example.com",
      password: VALID_PASSWORD,
      label: "Validação Hotmart",
      confirmEmail: false,
      confirmOperation: true,
    });
    expect("password" in result).toBe(false);
    expect(JSON.stringify(result)).not.toContain(VALID_PASSWORD);
  });

  it("nunca inclui a senha na auditoria", async () => {
    await provisionHotmartValidationAccount({
      actorId: SUPER_ADMIN_ID,
      email: "validacao@example.com",
      password: VALID_PASSWORD,
      label: "Validação Hotmart",
      confirmEmail: false,
      confirmOperation: true,
    });
    const serialized = JSON.stringify(db["admin_audit_log"]);
    expect(serialized).not.toContain(VALID_PASSWORD);
  });

  it("repetir o provisionamento com o mesmo e-mail não duplica usuário nem acesso", async () => {
    const first = await provisionHotmartValidationAccount({
      actorId: SUPER_ADMIN_ID,
      email: "validacao@example.com",
      password: VALID_PASSWORD,
      label: "Validação Hotmart",
      confirmEmail: false,
      confirmOperation: true,
    });
    const second = await provisionHotmartValidationAccount({
      actorId: SUPER_ADMIN_ID,
      email: "Validacao@Example.com ",
      password: "outra-senha-forte-123",
      label: "Validação Hotmart",
      confirmEmail: false,
      confirmOperation: true,
    });

    expect(second.userId).toBe(first.userId);
    expect(second.restored).toBe(true);
    expect(
      Object.values(authUsers).filter((u) => u.email === "validacao@example.com").length,
    ).toBe(1);
    expect(db["product_access"]!.filter((r) => r["user_id"] === first.userId).length).toBe(1);
  });
});

describe("revokeHotmartValidationAccess", () => {
  it("revoga o acesso sem excluir o usuário do Auth", async () => {
    const { userId } = await provisionHotmartValidationAccount({
      actorId: SUPER_ADMIN_ID,
      email: "validacao@example.com",
      password: VALID_PASSWORD,
      label: "Validação Hotmart",
      confirmEmail: false,
      confirmOperation: true,
    });

    await revokeHotmartValidationAccess({ actorId: SUPER_ADMIN_ID, userId });

    const access = db["product_access"]!.find((r) => r["user_id"] === userId);
    expect(access!["revoked_at"]).not.toBeNull();
    expect(authUsers[userId]).toBeDefined();
  });

  it("recusa revogar um acesso que não seja de validação (ex.: compra real)", async () => {
    db["product_access"]!.push({
      id: "access-real-1",
      user_id: "buyer-1",
      product_id: BERGAMO_PRODUCT_ID,
      source: "hotmart",
      revoked_at: null,
      suspended_at: null,
    });
    await expect(
      revokeHotmartValidationAccess({ actorId: SUPER_ADMIN_ID, userId: "buyer-1" }),
    ).rejects.toThrow();
  });

  it("rejeita admin comum", async () => {
    const { userId } = await provisionHotmartValidationAccount({
      actorId: SUPER_ADMIN_ID,
      email: "validacao@example.com",
      password: VALID_PASSWORD,
      label: "Validação Hotmart",
      confirmEmail: false,
      confirmOperation: true,
    });
    await expect(revokeHotmartValidationAccess({ actorId: ADMIN_ID, userId })).rejects.toThrow();
  });
});

describe("deleteHotmartValidationUser", () => {
  it("exige confirmDeleteAuthUser explícito", async () => {
    const { userId } = await provisionHotmartValidationAccount({
      actorId: SUPER_ADMIN_ID,
      email: "validacao@example.com",
      password: VALID_PASSWORD,
      label: "Validação Hotmart",
      confirmEmail: false,
      confirmOperation: true,
    });
    await expect(
      deleteHotmartValidationUser({ actorId: SUPER_ADMIN_ID, userId, confirmDeleteAuthUser: false }),
    ).rejects.toThrow();
    expect(authUsers[userId]).toBeDefined();
  });

  it("exclui o usuário do Auth quando confirmado e sem papel elevado", async () => {
    const { userId } = await provisionHotmartValidationAccount({
      actorId: SUPER_ADMIN_ID,
      email: "validacao@example.com",
      password: VALID_PASSWORD,
      label: "Validação Hotmart",
      confirmEmail: false,
      confirmOperation: true,
    });
    await deleteHotmartValidationUser({ actorId: SUPER_ADMIN_ID, userId, confirmDeleteAuthUser: true });
    expect(authUsers[userId]).toBeUndefined();
  });

  it("recusa excluir uma conta com papel administrativo ou vínculo de colaborador", async () => {
    db["product_access"]!.push({
      id: "access-admin-1",
      user_id: ADMIN_ID,
      product_id: BERGAMO_PRODUCT_ID,
      source: "manual_validation",
      revoked_at: null,
      suspended_at: null,
    });
    await expect(
      deleteHotmartValidationUser({
        actorId: SUPER_ADMIN_ID,
        userId: ADMIN_ID,
        confirmDeleteAuthUser: true,
      }),
    ).rejects.toThrow();
  });
});

describe("listHotmartValidationAccounts", () => {
  it("lista só as contas de origem manual_validation, sem nenhum campo de senha", async () => {
    await provisionHotmartValidationAccount({
      actorId: SUPER_ADMIN_ID,
      email: "validacao@example.com",
      password: VALID_PASSWORD,
      label: "Validação Hotmart",
      confirmEmail: false,
      confirmOperation: true,
    });
    const rows = await listHotmartValidationAccounts(SUPER_ADMIN_ID);
    expect(rows.length).toBe(1);
    expect(JSON.stringify(rows)).not.toContain(VALID_PASSWORD);
    for (const row of rows) {
      expect("password" in row).toBe(false);
    }
  });

  it("rejeita quem não é super_admin", async () => {
    await expect(listHotmartValidationAccounts(ADMIN_ID)).rejects.toThrow();
  });
});

describe("linkBergamoCoproducer — autorização e idempotência", () => {
  it("rejeita member", async () => {
    await expect(
      linkBergamoCoproducer({ actorId: MEMBER_ID, email: "coprodutor@example.com" }),
    ).rejects.toThrow();
  });

  it("permite super_admin e cria vínculo escopado só ao Bergamo", async () => {
    const result = await linkBergamoCoproducer({
      actorId: SUPER_ADMIN_ID,
      email: "coprodutor@example.com",
    });
    const links = db["product_collaborators"]!.filter((r) => r["user_id"] === result.userId);
    expect(links.length).toBe(1);
    expect(links[0]!["product_id"]).toBe(BERGAMO_PRODUCT_ID);
    expect(links[0]!["role"]).toBe("coproducer");

    const roles = db["user_roles"]!.filter((r) => r["user_id"] === result.userId);
    expect(roles.length).toBe(0);
  });

  it("vincular duas vezes o mesmo e-mail não duplica o vínculo", async () => {
    const first = await linkBergamoCoproducer({
      actorId: SUPER_ADMIN_ID,
      email: "coprodutor@example.com",
    });
    const second = await linkBergamoCoproducer({
      actorId: SUPER_ADMIN_ID,
      email: "coprodutor@example.com",
    });
    expect(second.userId).toBe(first.userId);
    const links = db["product_collaborators"]!.filter(
      (r) => r["user_id"] === first.userId && r["product_id"] === BERGAMO_PRODUCT_ID,
    );
    expect(links.length).toBe(1);
  });

  it("um vínculo revogado pode ser restaurado ao vincular de novo", async () => {
    const first = await linkBergamoCoproducer({
      actorId: SUPER_ADMIN_ID,
      email: "coprodutor@example.com",
    });
    await revokeBergamoCoproducerLink({ actorId: SUPER_ADMIN_ID, userId: first.userId });
    const restored = await linkBergamoCoproducer({
      actorId: SUPER_ADMIN_ID,
      email: "coprodutor@example.com",
    });
    expect(restored.userId).toBe(first.userId);
    expect(restored.restored).toBe(true);
    const link = db["product_collaborators"]!.find(
      (r) => r["user_id"] === first.userId && r["product_id"] === BERGAMO_PRODUCT_ID,
    );
    expect(link!["status"]).toBe("active");
    expect(link!["revoked_at"]).toBeNull();

    const allLinksForUser = db["product_collaborators"]!.filter((r) => r["user_id"] === first.userId);
    expect(allLinksForUser.length).toBe(1);
  });

  it("nenhum outro produto é afetado ao vincular ou revogar o coprodutor do Bergamo", async () => {
    const before = JSON.stringify(
      db["product_collaborators"]!.filter((r) => r["product_id"] === OTHER_PRODUCT_ID),
    );
    const result = await linkBergamoCoproducer({
      actorId: SUPER_ADMIN_ID,
      email: "coprodutor@example.com",
    });
    await revokeBergamoCoproducerLink({ actorId: SUPER_ADMIN_ID, userId: result.userId });
    const after = JSON.stringify(
      db["product_collaborators"]!.filter((r) => r["product_id"] === OTHER_PRODUCT_ID),
    );
    expect(after).toBe(before);
  });
});

describe("listBergamoCoproducers", () => {
  it("rejeita quem não é super_admin", async () => {
    await expect(listBergamoCoproducers(ADMIN_ID)).rejects.toThrow();
  });

  it("lista o vínculo com o e-mail resolvido e o estado da pré-visualização", async () => {
    const result = await linkBergamoCoproducer({
      actorId: SUPER_ADMIN_ID,
      email: "coprodutor@example.com",
    });
    const rows = await listBergamoCoproducers(SUPER_ADMIN_ID);
    const row = rows.find((r) => r.userId === result.userId);
    expect(row).toBeDefined();
    expect(row!.email).toBe("coprodutor@example.com");
    expect(row!.memberPreviewActive).toBe(false);
  });
});

describe("setBergamoCoproducerMemberPreview — independente do vínculo", () => {
  it("recusa conceder pré-visualização sem vínculo ativo de coprodutor", async () => {
    await expect(
      setBergamoCoproducerMemberPreview({ actorId: SUPER_ADMIN_ID, userId: MEMBER_ID, enabled: true }),
    ).rejects.toThrow();
  });

  it("concede e revoga a pré-visualização como uma origem própria de product_access", async () => {
    const { userId } = await linkBergamoCoproducer({
      actorId: SUPER_ADMIN_ID,
      email: "coprodutor@example.com",
    });

    await setBergamoCoproducerMemberPreview({ actorId: SUPER_ADMIN_ID, userId, enabled: true });
    let access = db["product_access"]!.find(
      (r) => r["user_id"] === userId && r["product_id"] === BERGAMO_PRODUCT_ID,
    );
    expect(access!["source"]).toBe("coproducer_preview");
    expect(access!["revoked_at"]).toBeNull();

    await setBergamoCoproducerMemberPreview({ actorId: SUPER_ADMIN_ID, userId, enabled: false });
    access = db["product_access"]!.find(
      (r) => r["user_id"] === userId && r["product_id"] === BERGAMO_PRODUCT_ID,
    );
    expect(access!["revoked_at"]).not.toBeNull();
  });

  it("revogar o vínculo de coprodutor não mexe na pré-visualização — são operações independentes", async () => {
    const { userId } = await linkBergamoCoproducer({
      actorId: SUPER_ADMIN_ID,
      email: "coprodutor@example.com",
    });
    await setBergamoCoproducerMemberPreview({ actorId: SUPER_ADMIN_ID, userId, enabled: true });
    await revokeBergamoCoproducerLink({ actorId: SUPER_ADMIN_ID, userId });

    const access = db["product_access"]!.find(
      (r) => r["user_id"] === userId && r["product_id"] === BERGAMO_PRODUCT_ID,
    );
    expect(access!["source"]).toBe("coproducer_preview");
    expect(access!["revoked_at"]).toBeNull();
  });

  it("nunca concede acesso a outro produto", async () => {
    const { userId } = await linkBergamoCoproducer({
      actorId: SUPER_ADMIN_ID,
      email: "coprodutor@example.com",
    });
    await setBergamoCoproducerMemberPreview({ actorId: SUPER_ADMIN_ID, userId, enabled: true });
    const otherAccess = db["product_access"]!.filter(
      (r) => r["user_id"] === userId && r["product_id"] === OTHER_PRODUCT_ID,
    );
    expect(otherAccess.length).toBe(0);
  });
});
