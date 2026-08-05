/**
 * Verificações estáticas (leitura de arquivos-fonte, sem mocks) das
 * imagens privadas do comprador Bergamo: bucket privado, política de
 * Storage correta, nenhuma URL pública, nenhum vazamento de
 * member_image_path para o catálogo público, TTL curto, carregamento
 * sob demanda (nunca em lote), e nenhum segredo no script administrativo.
 */
import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

function readSrc(relPath: string): string {
  return readFileSync(join(ROOT, relPath), "utf8");
}

const MIGRATION = "supabase/migrations/20260805030000_bergamo-private-member-images.sql";

describe("Migration — bucket privado e política de Storage", () => {
  const sql = readSrc(MIGRATION);

  it("cria o bucket com public = false", () => {
    expect(sql).toMatch(/'bergamo-member-images'/);
    expect(sql).toMatch(/false,\s*\n\s*10485760/);
  });

  it("restringe os tipos MIME a imagem (jpeg/png/webp)", () => {
    expect(sql).toContain("image/jpeg");
    expect(sql).toContain("image/png");
    expect(sql).toContain("image/webp");
  });

  it("a policy de storage.objects é só SELECT, só para authenticated", () => {
    expect(sql).toMatch(/CREATE POLICY[^;]*ON storage\.objects FOR SELECT\s*\nTO authenticated/);
  });

  it("a policy reutiliza has_product_access — a mesma regra da área de membros", () => {
    expect(sql).toMatch(/has_product_access\(\s*\n\s*auth\.uid\(\)/);
  });

  it("nenhuma policy de INSERT/UPDATE/DELETE é criada para anon/authenticated", () => {
    expect(sql).not.toMatch(/FOR (INSERT|UPDATE|DELETE)/i);
  });

  it("adiciona member_image_path como coluna de texto (caminho, nunca URL)", () => {
    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS member_image_path text/);
  });
});

describe("Catálogo público — nunca conhece member_image_path", () => {
  it("bergamo-catalog.server.ts nunca referencia member_image_path", () => {
    expect(readSrc("src/lib/bergamo-catalog.server.ts")).not.toContain("member_image_path");
  });

  it("a RPC pública get_bergamo_public_catalog não seleciona member_image_path", () => {
    const sql = readSrc("supabase/migrations/20260805020000_bergamo-public-catalog-rpc.sql");
    expect(sql).not.toContain("member_image_path");
  });

  it("nenhum componente público (Hero/Gallery) referencia member_image_path", () => {
    for (const file of [
      "src/components/bergamo/BergamoGallery.tsx",
      "src/components/bergamo/BergamoHero.tsx",
      "src/data/bergamoAssets.ts",
      "src/routes/bergamo.tsx",
    ]) {
      expect(readSrc(file)).not.toContain("member_image_path");
    }
  });
});

describe("Nenhuma URL pública é usada para as imagens privadas", () => {
  it("getPublicUrl nunca é chamado em todo o código-fonte do app (só citado em comentário, se algum)", () => {
    const files = [
      "src/lib/member.server.ts",
      "src/lib/member.functions.ts",
      "src/routes/membros.bergamo.tsx",
      "scripts/upload-bergamo-member-images.mjs",
    ];
    for (const file of files) {
      expect(readSrc(file)).not.toMatch(/\.getPublicUrl\(/);
    }
  });
});

describe("getBergamoMemberImageSignedUrl — TTL curto e segunda camada de RLS real", () => {
  const source = readSrc("src/lib/member.server.ts");

  it("usa createSignedUrl (nunca getPublicUrl, nunca uma URL fixa)", () => {
    expect(source).toContain("createSignedUrl");
  });

  it("a constante de TTL está entre 60 e 120 segundos", () => {
    const match = source.match(/BERGAMO_IMAGE_SIGNED_URL_TTL_SECONDS\s*=\s*(\d+)/);
    expect(match).not.toBeNull();
    const ttl = Number(match?.[1]);
    expect(ttl).toBeGreaterThanOrEqual(60);
    expect(ttl).toBeLessThanOrEqual(120);
  });

  it("a assinatura roda no cliente autenticado como o usuário (supabaseAsUser), nunca supabaseAdmin", () => {
    expect(source).toMatch(/supabaseAsUser\.storage[\s\S]{0,40}createSignedUrl/);
  });
});

describe("Área de membros — carregamento sob demanda, nunca as 90 de uma vez", () => {
  const source = readSrc("src/routes/membros.bergamo.tsx");

  it("a busca da signed URL acontece dentro de um handler de clique, não em useEffect no mount do card", () => {
    expect(source).toMatch(/async function handleViewImage\(\)/);
    // getSignedUrl só é chamado uma vez em todo o arquivo — dentro do
    // handler de clique. Se aparecesse também dentro de um useEffect
    // (busca automática no carregamento do card), essa contagem subiria.
    const callSites = source.match(/getSignedUrl\(\{/g) ?? [];
    expect(callSites.length).toBe(1);
  });

  it("o botão de ver imagem só aparece quando hasPrivateImage é verdadeiro", () => {
    expect(source).toMatch(/item\.hasPrivateImage\s*&&/);
  });

  it("PrivacyCurtain e SessionWatermark continuam presentes (barreiras já existentes preservadas)", () => {
    expect(source).toContain("<PrivacyCurtain />");
    expect(source).toMatch(/<SessionWatermark/);
  });
});

describe("Script administrativo de upload — nunca expõe segredo", () => {
  const source = readSrc("scripts/upload-bergamo-member-images.mjs");

  it("lê o service role só de process.env, nunca um valor hardcoded", () => {
    expect(source).toMatch(/requireEnv\(["']SUPABASE_SERVICE_ROLE_KEY["']\)/);
    expect(source).not.toMatch(/sb_secret_[A-Za-z0-9_-]{10,}/);
    expect(source).not.toMatch(/eyJ[A-Za-z0-9_-]{20,}/); // formato de um JWT literal colado no código
  });

  it("nunca faz console.log do valor do service role", () => {
    expect(source).not.toMatch(/console\.(log|error|info)\([^)]*SUPABASE_SERVICE_ROLE_KEY\)/);
  });

  it("nunca marca o bucket como público", () => {
    expect(source).not.toMatch(/public:\s*true/);
  });

  it("calcula SHA-256 do arquivo-fonte antes de decidir se reenvia", () => {
    expect(source).toContain("createHash(\"sha256\")");
  });

  it("valida exatamente 90 arquivos-fonte antes de prosseguir", () => {
    expect(source).toMatch(/EXPECTED_COUNT\s*=\s*90/);
  });

  it("não é importado por nenhum código da aplicação (só roda manualmente)", () => {
    const appFiles = [
      "src/routes/membros.bergamo.tsx",
      "src/lib/member.server.ts",
      "src/lib/member.functions.ts",
      "src/routes/bergamo.tsx",
      "src/lib/bergamo-catalog.server.ts",
    ];
    for (const file of appFiles) {
      expect(readSrc(file)).not.toContain("upload-bergamo-member-images");
    }
  });
});
