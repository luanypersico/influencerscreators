import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { isArsenalHostname } from "./hostname.functions";

describe("isolamento Arsenal por hostname", () => {
  it("reconhece somente o host canônico do Arsenal", () => {
    expect(isArsenalHostname("arsenal.obergamo.com.br")).toBe(true);
    expect(isArsenalHostname("arsenal.obergamo.com.br:443")).toBe(true);
  });

  it("mantém o host Pages no Studio", () => {
    expect(isArsenalHostname("influencerscreators.pages.dev")).toBe(false);
    expect(isArsenalHostname("preview.influencerscreators.pages.dev")).toBe(false);
    expect(isArsenalHostname("attacker.obergamo.com.br")).toBe(false);
  });

  it("condiciona a home, produto, login e legados ao hostname", () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
    const source = (file: string) => readFileSync(join(root, file), "utf8");
    expect(source("src/routes/_public.index.tsx")).toContain("isArsenalHostname(hostname)");
    expect(source("src/routes/prompts.tsx")).toContain(
      "isArsenalHostname(await getRequestHostnameFn())",
    );
    expect(source("src/routes/entrar.tsx")).toContain(
      "isArsenalHostname(await getRequestHostnameFn())",
    );
    expect(source("src/routes/membros.bergamo.tsx")).toContain('"/prompts" : "/membros"');
  });
});
