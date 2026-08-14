/**
 * Verificações estáticas (leitura de arquivos-fonte, sem mocks) da nova
 * área de membros e da vitrine de ofertas recomendadas: garante, por
 * inspeção do código, que a vitrine nunca cria order/product_access, que
 * o checkout externo abre em nova aba com rel seguro, que só o Arsenal
 * leva para /prompts, e que o CRUD do admin só toca member_offers.
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

describe("OwnedProductCard.tsx — só o Arsenal leva para /prompts", () => {
  const source = readSrc("src/components/member/OwnedProductCard.tsx");

  it("usa Link para /prompts somente quando slug === bergamo", () => {
    expect(source).toContain('to="/prompts"');
    expect(source).toMatch(/isBergamo\s*=\s*product\.slug\s*===\s*"bergamo"/);
  });

  it("produto não-Bergamo nunca vira link clicável (o fallback final é um <div>, não um <Link>)", () => {
    expect(source).toContain("return <div");
  });
});

describe("RecommendedOfferCard.tsx — abre o detalhe, nunca concede acesso", () => {
  const source = readSrc("src/components/member/RecommendedOfferCard.tsx");

  it("clicar no card abre o modal de detalhe, não um checkout direto (ver member-offer-detail-static-checks.test.ts para a cobertura completa dessa mudança)", () => {
    expect(source).toContain("onSelect(offer)");
  });

  it("nunca referencia orders, product_access ou entitlement", () => {
    expect(source).not.toMatch(/orders|product_access|entitlement/i);
  });
});

describe("member.server.ts — getRecommendedOffers isolada do domínio comercial", () => {
  const source = readSrc("src/lib/member.server.ts");

  it("getRecommendedOffers só consulta member_offers, nunca orders/product_access", () => {
    const start = source.indexOf("export async function getRecommendedOffers");
    expect(start).toBeGreaterThan(-1);
    const nextExport = source.indexOf("\nexport ", start + 1);
    const fnBody = source.slice(start, nextExport === -1 ? undefined : nextExport);
    expect(fnBody).toContain('"member_offers"');
    expect(fnBody).not.toMatch(/"orders"|"product_access"/);
  });

  it("filtra por active=true e exige checkout_url não vazio", () => {
    expect(source).toMatch(/\.eq\("active",\s*true\)/);
    expect(source).toMatch(/checkout_url\?\.trim\(\)/);
  });
});

describe("admin.ofertas.tsx — CRUD isolado, super_admin only via RLS", () => {
  const source = readSrc("src/routes/admin.ofertas.tsx");

  it("só toca a tabela member_offers, nunca products/orders/product_access", () => {
    expect(source).toContain('"member_offers"');
    expect(source).not.toMatch(/from\("products"\)|from\("orders"\)|from\("product_access"\)/);
  });

  it("nav do admin marca a rota como restrita a super_admin", () => {
    const adminNav = readSrc("src/routes/admin.tsx");
    expect(adminNav).toMatch(/to:\s*"\/admin\/ofertas"[^}]*superAdminOnly:\s*true/);
  });
});

describe("member_offers migration — RLS restringe escrita a super_admin, leitura só de ativos", () => {
  const source = readSrc("supabase/migrations/20260814020000_member_offers.sql");

  it("política de escrita usa is_super_admin, não is_admin", () => {
    expect(source).toMatch(/USING \(is_super_admin\(auth\.uid\(\)\)\)/);
  });

  it("leitura pública é restrita a active = true", () => {
    expect(source).toMatch(/USING \(active = true\)/);
  });

  it("nunca cria FK para orders/product_access — a vitrine é isolada", () => {
    expect(source).not.toMatch(/REFERENCES public\.orders|REFERENCES public\.product_access/);
  });
});

describe("member_offers migration corretiva — remove exposição desnecessária a anon/authenticated", () => {
  const source = readSrc("supabase/migrations/20260814023000_member_offers_restrict_read.sql");

  it("derruba a policy pública anterior", () => {
    expect(source).toMatch(/DROP POLICY IF EXISTS "public reads active member offers"/);
  });

  it("revoga todo grant de anon nesta tabela", () => {
    expect(source).toMatch(/REVOKE ALL ON public\."member_offers" FROM anon/);
  });

  it("só toca member_offers — nenhuma outra tabela nesta migration corretiva", () => {
    expect(source).not.toMatch(/ON public\.(?!"member_offers")/);
  });
});

describe("prompts.tsx — reaproveita member_offers só como leitura, nunca duplica MemberHome", () => {
  const source = readSrc("src/routes/prompts.tsx");

  it("BergamoPromptsExperience continua sendo a experiência canônica do Arsenal", () => {
    expect(source).toContain("BergamoPromptsExperience");
  });

  it("lê ofertas recomendadas via memberGetRecommendedOffersFn (mesma função de /membros), sem reimplementar MemberHome", () => {
    expect(source).toContain("memberGetRecommendedOffersFn");
    expect(source).not.toContain("MemberHome");
  });

  it("reaproveita o mesmo OfferDetailModal (com vídeo) de /membros — mesmo formato do card, sem reimplementar o modal", () => {
    expect(source).toContain(
      'import { OfferDetailModal } from "@/components/member/OfferDetailModal"',
    );
  });
});
