import { describe, expect, it } from "bun:test";
import type { SupabaseClient } from "@supabase/supabase-js";

import { signOutAuthenticatedSession } from "./useLogout";

type SignOutAuth = Pick<SupabaseClient["auth"], "signOut">;

describe("logout autenticado", () => {
  it("encerra a sessao pelo Supabase antes de limpar o cache autenticado", async () => {
    const calls: string[] = [];
    const auth = {
      signOut: async () => {
        calls.push("signOut");
        return { error: null };
      },
    } as unknown as SignOutAuth;

    await signOutAuthenticatedSession(auth, () => calls.push("clearCache"));

    expect(calls).toEqual(["signOut", "clearCache"]);
  });

  it("nao limpa o cache como se o logout tivesse funcionado quando o Supabase falha", async () => {
    let cacheWasCleared = false;
    const auth = {
      signOut: async () => ({ error: new Error("logout failed") }),
    } as unknown as SignOutAuth;

    await expect(
      signOutAuthenticatedSession(auth, () => {
        cacheWasCleared = true;
      }),
    ).rejects.toThrow("logout failed");
    expect(cacheWasCleared).toBe(false);
  });
});
