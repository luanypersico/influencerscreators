import { describe, expect, it } from "bun:test";

import { getPasswordSetupRedirectUrl } from "./auth-invite.server";

describe("getPasswordSetupRedirectUrl", () => {
  it("uses the explicit Arsenal origin", () => {
    expect(getPasswordSetupRedirectUrl()).toBe("https://arsenal.obergamo.com.br");
  });

  it("does not read the Studio shared origin", () => {
    expect(getPasswordSetupRedirectUrl()).not.toContain("influencerscreators.pages.dev");
  });
});
