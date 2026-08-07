import { describe, expect, it } from "bun:test";
import type { JwtPayload, Session, SupabaseClient } from "@supabase/supabase-js";

import {
  completePasswordSetup,
  getPasswordSetupMethod,
  verifyPasswordSetupSession,
} from "./passwordSetup";

type TestAuth = Pick<
  SupabaseClient["auth"],
  "getClaims" | "getUser" | "signInWithPassword" | "signOut" | "updateUser"
>;

const NOW = Math.floor(Date.now() / 1000);
const USER_ID = "11111111-1111-4111-8111-111111111111";

function claims(method: string, timestamp = NOW): JwtPayload {
  return {
    aal: "aal1",
    amr: [{ method, timestamp }],
    aud: "authenticated",
    exp: NOW + 3_600,
    iat: NOW,
    iss: "https://project.supabase.co/auth/v1",
    role: "authenticated",
    session_id: "22222222-2222-4222-8222-222222222222",
    sub: USER_ID,
  } as JwtPayload;
}

function session(): Session {
  return {
    access_token: "signed-access-token",
    expires_at: NOW + 3_600,
    expires_in: 3_600,
    refresh_token: "single-use-refresh-token",
    token_type: "bearer",
    user: { id: USER_ID, email: "user@example.com" },
  } as Session;
}

function authFor(method: string, timestamp = NOW) {
  const calls = { getUser: 0, signIn: 0, signOut: 0, update: 0 };
  const nextSession = session();
  const auth = {
    getClaims: async () => ({ data: { claims: claims(method, timestamp) }, error: null }),
    getUser: async () => {
      calls.getUser += 1;
      return { data: { user: { id: USER_ID } }, error: null };
    },
    updateUser: async () => {
      calls.update += 1;
      return { data: { user: { id: USER_ID } }, error: null };
    },
    signOut: async () => {
      calls.signOut += 1;
      return { error: null };
    },
    signInWithPassword: async () => {
      calls.signIn += 1;
      return { data: { session: nextSession, user: nextSession.user }, error: null };
    },
  } as unknown as TestAuth;

  return { auth, calls, nextSession };
}

describe("prova Supabase para definir senha", () => {
  for (const role of ["member", "coproducer", "admin", "super_admin"]) {
    it(`nega sessão normal de ${role}`, async () => {
      const { auth, calls } = authFor("password");
      expect(await verifyPasswordSetupSession(auth, session(), NOW)).toBeNull();
      expect(calls.getUser).toBe(0);
    });
  }

  it("permite recovery válido e verificado pelo Auth", async () => {
    const { auth, calls } = authFor("recovery");
    expect(await verifyPasswordSetupSession(auth, session(), NOW)).toBe("recovery");
    expect(calls.getUser).toBe(1);
  });

  it("permite convite válido e verificado pelo Auth", async () => {
    const { auth } = authFor("invite");
    expect(await verifyPasswordSetupSession(auth, session(), NOW)).toBe("invite");
  });

  it("nega recovery expirado", () => {
    expect(getPasswordSetupMethod(claims("recovery", NOW - 901), USER_ID, NOW)).toBeNull();
  });

  it("nega replay depois que a sessão especial foi substituída", () => {
    const replay = claims("token_refresh");
    replay.amr = [
      { method: "token_refresh", timestamp: NOW },
      { method: "recovery", timestamp: NOW - 10 },
    ];
    expect(getPasswordSetupMethod(replay, USER_ID, NOW)).toBeNull();
  });

  it("nega claim válido para outro usuário", () => {
    expect(
      getPasswordSetupMethod(claims("recovery"), "33333333-3333-4333-8333-333333333333", NOW),
    ).toBeNull();
  });

  it("não usa query string, localStorage, sessionStorage ou role como prova", () => {
    const normal = claims("password");
    normal.user_metadata = {
      next: "/auth/set-password",
      passwordSetup: true,
      role: "super_admin",
    };
    expect(getPasswordSetupMethod(normal, USER_ID, NOW)).toBeNull();
  });

  it("nunca chama updateUser para sessão sem recovery/invite", async () => {
    const { auth, calls } = authFor("password");
    await expect(completePasswordSetup(auth, session(), "correct-horse-battery")).rejects.toThrow(
      "Invalid password setup session",
    );
    expect(calls.update).toBe(0);
    expect(calls.signOut).toBe(0);
    expect(calls.signIn).toBe(0);
  });

  it("revalida, atualiza, encerra a sessão especial e cria sessão normal", async () => {
    const { auth, calls, nextSession } = authFor("recovery");
    expect(await completePasswordSetup(auth, session(), "correct-horse-battery")).toBe(nextSession);
    expect(calls.update).toBe(1);
    expect(calls.signOut).toBe(1);
    expect(calls.signIn).toBe(1);
  });
});
