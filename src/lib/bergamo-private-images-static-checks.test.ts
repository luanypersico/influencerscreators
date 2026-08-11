import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const readSrc = (path: string) => readFileSync(join(ROOT, path), "utf8");

describe("entrega segura das imagens Bergamo", () => {
  it("mantém catálogo público sem URL privada", () => {
    const publicCatalog = readSrc("src/lib/bergamo-catalog.server.ts");
    expect(publicCatalog).toContain("imageUrl: null");
    expect(publicCatalog).not.toContain("createSignedUrls");
  });

  it("assina no servidor somente depois da autorização", () => {
    const viewer = readSrc("src/lib/bergamo-viewer.server.ts");
    const privateImages = readSrc("src/lib/bergamo-private-images.server.ts");
    expect(viewer).toContain("authorization.hasFullAccess");
    expect(viewer).toContain("attachBergamoPrivateImages");
    expect(privateImages).toContain("createSignedUrls(paths, SIGNED_IMAGE_TTL_SECONDS)");
    expect(privateImages).toContain('const BERGAMO_PRIVATE_BUCKET = "bergamo-private-gallery"');
  });

  it("usa original assinado com fallback seguro para a prévia pública", () => {
    for (const file of [
      "src/components/bergamo/BergamoHero.tsx",
      "src/components/bergamo/BergamoGallery.tsx",
    ]) {
      expect(readSrc(file)).toContain("item.imageUrl ?? bergamoImage(item.code)");
    }
  });

  it("bucket versionado permanece privado e sem policy pública", () => {
    const migration = readSrc("supabase/migrations/20260808203020_bergamo_private_gallery.sql");
    expect(migration).toContain("'bergamo-private-gallery'");
    expect(migration).toMatch(/public,\s*file_size_limit[\s\S]*false,/);
    expect(migration).not.toMatch(/create\s+policy/i);
  });
});

describe("vitrine pública limitada ao hero", () => {
  it("assina somente os seis códigos fixos e parte do catálogo público", () => {
    const constants = readSrc("src/lib/bergamo-public-hero.constants.ts");
    const privateImages = readSrc("src/lib/bergamo-private-images.server.ts");
    const functions = readSrc("src/lib/bergamo-catalog.functions.ts");

    expect(constants).toContain('BERGAMO_PUBLIC_HERO_CODES = ["01", "04", "26", "40", "71", "13"]');
    expect(privateImages).toContain("getBergamoPublicHeroImages");
    expect(privateImages).toContain("BERGAMO_PUBLIC_HERO_CODES.map");
    expect(functions).toContain("getBergamoPublicHeroFn");
    expect(functions).toContain("getBergamoPublicCatalog()");
    expect(functions).not.toContain("getBergamoFullCatalog");
  });
});
