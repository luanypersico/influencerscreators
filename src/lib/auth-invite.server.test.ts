import { describe, expect, it } from "bun:test";

import { getPasswordSetupRedirectUrl } from "./auth-invite.server";

describe("getPasswordSetupRedirectUrl", () => {
  it("usa produção por padrão", () => {
    expect(getPasswordSetupRedirectUrl({} as NodeJS.ProcessEnv)).toBe(
      "https://influencerscreators.pages.dev/auth/callback?next=/auth/set-password",
    );
  });

  it("aceita somente localhost e previews do projeto", () => {
    expect(getPasswordSetupRedirectUrl({ APP_ORIGIN: "http://localhost:4173" })).toBe(
      "http://localhost:4173/auth/callback?next=/auth/set-password",
    );
    expect(
      getPasswordSetupRedirectUrl({
        APP_ORIGIN: "https://abc123.influencerscreators.pages.dev",
      }),
    ).toBe("https://abc123.influencerscreators.pages.dev/auth/callback?next=/auth/set-password");
  });

  it("rejeita origem arbitrária e credenciais embutidas", () => {
    expect(() =>
      getPasswordSetupRedirectUrl({ APP_ORIGIN: "https://attacker.pages.dev" }),
    ).toThrow();
    expect(() =>
      getPasswordSetupRedirectUrl({
        APP_ORIGIN: "https://usuario:senha@influencerscreators.pages.dev",
      }),
    ).toThrow();
  });
});
