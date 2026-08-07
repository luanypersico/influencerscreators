import { describe, expect, it } from "bun:test";

import { hasAuthCallbackPayload, isSessionEstablishingEvent } from "./useSetPasswordSession";

function callbackLocation(hash = "", search = ""): Pick<Location, "hash" | "search"> {
  return { hash, search };
}

describe("initialization of invite and recovery sessions", () => {
  it("keeps an implicit invite/recovery callback in processing while the first session is null", () => {
    expect(
      hasAuthCallbackPayload(callbackLocation("#access_token=x&refresh_token=y&type=invite")),
    ).toBe(true);
  });

  it("recognizes the supported events that establish the password-setting session", () => {
    expect(isSessionEstablishingEvent("SIGNED_IN")).toBe(true);
    expect(isSessionEstablishingEvent("PASSWORD_RECOVERY")).toBe(true);
    expect(isSessionEstablishingEvent("INITIAL_SESSION")).toBe(true);
  });

  it("recognizes an optional PKCE callback without treating its query as authorization", () => {
    expect(hasAuthCallbackPayload(callbackLocation("", "?code=optional-code"))).toBe(true);
    expect(hasAuthCallbackPayload(callbackLocation())).toBe(false);
  });
});
