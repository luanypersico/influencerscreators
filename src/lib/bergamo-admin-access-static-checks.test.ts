import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const readSrc = (path: string) => readFileSync(join(ROOT, path), "utf8");

describe("/bergamo — catálogo administrativo separado", () => {
  it("mantém a RPC pública intacta e usa uma função autenticada separada", () => {
    const route = readSrc("src/routes/bergamo.tsx");
    const functions = readSrc("src/lib/bergamo-catalog.functions.ts");

    expect(route).toContain("getBergamoPublicCatalogFn");
    expect(route).toContain("getBergamoAuthenticatedExperienceFn");
    expect(route).not.toContain("useRoles");
    expect(functions).toContain(".middleware([requireSupabaseAuth])");
    expect(functions).toContain("context.supabase.auth.getUser()");
  });

  it("autoriza no servidor e fixa o produto Bergamo", () => {
    const server = readSrc("src/lib/bergamo-admin-catalog.server.ts");
    expect(server).toContain("await assertAdmin(userId)");
    expect(server).toContain('.eq("products.slug", "bergamo")');
    expect(server).not.toMatch(/productId\s*:\s*string|slug\s*:\s*string/);
  });

  it("checkout vem do backend e todos os CTAs de compra usam essa URL", () => {
    const route = readSrc("src/routes/bergamo.tsx");
    const offer = readSrc("src/lib/bergamo-offer.server.ts");
    const purchaseComponents = [
      "src/components/bergamo/BergamoHero.tsx",
      "src/components/bergamo/BergamoGallery.tsx",
      "src/components/bergamo/BergamoPricing.tsx",
    ];

    expect(route).toContain("getBergamoOfferFn");
    expect(offer).toContain('.eq("slug", "bergamo")');
    expect(offer).toContain('parsed.protocol !== "https:"');
    for (const file of purchaseComponents) {
      expect(readSrc(file)).toContain("checkoutUrl");
    }
    expect(readSrc("src/components/bergamo/BergamoHeader.tsx")).toContain("ctaHref");
    expect(readSrc("src/components/bergamo/BergamoHeader.tsx")).toContain("viewer.displayName");
    expect(readSrc("src/components/bergamo/BergamoPricing.tsx")).not.toContain('checkoutUrl: "#"');
  });
});
