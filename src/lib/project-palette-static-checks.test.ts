import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

function readSrc(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("paleta Bergamo global", () => {
  const css = readSrc("src/styles.css");
  const rootTokens = css.match(/:root\s*{([\s\S]*?)\n}/)?.[1] ?? "";
  const bergamoScope = css.match(/\.bergamo-theme\s*{([\s\S]*?)\n}/)?.[1] ?? "";

  it("usa os tokens de fundo, superfície e destaque da /bergamo em :root", () => {
    expect(rootTokens).toContain("--background: oklch(0.114 0.056 316.5)");
    expect(rootTokens).toContain("--card: oklch(0.167 0.084 311.4)");
    expect(rootTokens).toContain("--primary: oklch(0.637 0.283 325.3)");
    expect(rootTokens).toContain("--secondary: oklch(0.327 0.166 306.5)");
    expect(rootTokens).toContain("--accent: oklch(0.517 0.229 311.7)");
  });

  it("mantém gradiente, sidebar, gráficos, bordas e foco na mesma família cromática", () => {
    expect(rootTokens).toContain("--gradient-bergamo: linear-gradient(");
    expect(rootTokens).toContain("--sidebar-primary: oklch(0.637 0.283 325.3)");
    expect(rootTokens).toContain("--chart-2: oklch(0.517 0.229 311.7)");
    expect(rootTokens).toContain("--border: oklch(0.637 0.283 325.3 / 24%)");
    expect(rootTokens).toContain("--ring: oklch(0.637 0.283 325.3)");
  });

  it("não mantém uma segunda paleta local que possa divergir da global", () => {
    expect(bergamoScope).not.toMatch(
      /--(?:background|foreground|card|popover|primary|secondary|muted|accent|border|input|ring):/,
    );
  });

  it("remove os tons quentes antigos dos placeholders compartilhados", () => {
    const placeholders = readSrc("src/features/influencers/components/PlaceholderArt.tsx");
    expect(placeholders).toContain("var(--primary)");
    expect(placeholders).toContain("var(--accent)");
    expect(placeholders).not.toMatch(/oklch\(0\.(?:15 0\.008 60|19 0\.01 60)/);
  });

  it("aplica a paleta também à página de erro sem o bundle da aplicação", () => {
    const errorPage = readSrc("src/lib/error-page.ts");
    expect(errorPage).toContain("background: oklch(0.114 0.056 316.5)");
    expect(errorPage).toContain("background: oklch(0.167 0.084 311.4)");
    expect(errorPage).not.toContain("#fafafa");
  });
});
