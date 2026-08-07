import { describe, expect, it } from "bun:test";

import { getSafeAuthCallbackNext } from "./authCallback";

describe("Supabase auth callback", () => {
  it("permite apenas destinos internos conhecidos", () => {
    expect(getSafeAuthCallbackNext("?next=/auth/set-password")).toBe("/auth/set-password");
    expect(getSafeAuthCallbackNext("?next=https://example.com")).toBeNull();
    expect(getSafeAuthCallbackNext("?next=//example.com")).toBeNull();
  });
});
