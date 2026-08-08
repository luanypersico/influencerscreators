import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

function readSrc(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("paleta InfluencerCreator global", () => {
  const css = readSrc("src/styles.css");
  const rootTokens = css.match(/:root\s*{([\s\S]*?)\n}/)?.[1] ?? "";
  const bergamoScope = css.match(/\.bergamo-theme\s*{([\s\S]*?)\n}/)?.[1] ?? "";

  it("usa os tokens azul-noite e violeta como base global", () => {
    expect(rootTokens).toContain("--background: oklch(0.105 0.028 282)");
    expect(rootTokens).toContain("--card: oklch(0.16 0.045 281)");
    expect(rootTokens).toContain("--primary: oklch(0.67 0.22 292)");
    expect(rootTokens).toContain("--secondary: oklch(0.24 0.075 281)");
    expect(rootTokens).toContain("--accent: oklch(0.58 0.22 306)");
  });

  it("mantem gradiente, sidebar, graficos, bordas e foco na mesma familia cromatica", () => {
    expect(rootTokens).toContain("--gradient-studio: linear-gradient(");
    expect(rootTokens).toContain("--sidebar-primary: oklch(0.67 0.22 292)");
    expect(rootTokens).toContain("--chart-2: oklch(0.58 0.22 306)");
    expect(rootTokens).toContain("--border: oklch(0.64 0.11 289 / 22%)");
    expect(rootTokens).toContain("--ring: oklch(0.67 0.22 292)");
  });

  it("nao mantem uma segunda paleta local que possa divergir da global", () => {
    expect(bergamoScope).not.toMatch(
      /--(?:background|foreground|card|popover|primary|secondary|muted|accent|border|input|ring):/,
    );
  });

  it("mantem os placeholders compartilhados nos tokens globais", () => {
    const placeholders = readSrc("src/features/influencers/components/PlaceholderArt.tsx");
    expect(placeholders).toContain("var(--primary)");
    expect(placeholders).toContain("var(--accent)");
  });
});
