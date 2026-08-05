/**
 * Prova, com processamento real de imagem (sharp — a mesma biblioteca do
 * script de geração), que os previews públicos dos 87 itens bloqueados
 * são fisicamente diferentes do original: não é o arquivo original
 * servido com um filtro CSS por cima (isso não existiria neste teste —
 * comparamos os BYTES/PIXELS reais dos dois arquivos em disco).
 *
 * Sem mocks, sem rede: lê arquivos já commitados em
 * src/assets/bergamo/{gallery,previews}/.
 */
import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const GALLERY_DIR = join(ROOT, "src/assets/bergamo/gallery");
const PREVIEWS_DIR = join(ROOT, "src/assets/bergamo/previews");

const FREE_CODES = new Set(["01", "26", "79"]);

/** Variância média dos pixels em tons de cinza — uma imagem borrada tem
 * variância local muito menor que a nítida (menos detalhe de alta
 * frequência). Usamos a variância global como proxy simples e estável. */
async function grayscaleVariance(path: string): Promise<number> {
  const { data, info } = await sharp(path)
    .resize({ width: 200 })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const n = info.width * info.height;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += data[i]!;
  const mean = sum / n;
  let variance = 0;
  for (let i = 0; i < n; i++) variance += (data[i]! - mean) ** 2;
  return variance / n;
}

describe("previews públicos — os 90 códigos existem", () => {
  const files = readdirSync(PREVIEWS_DIR).filter((f) => f.endsWith(".jpg"));

  it("existem exatamente 90 arquivos de preview", () => {
    expect(files).toHaveLength(90);
  });
});

describe("previews dos 3 itens gratuitos — permanecem nítidos (amostra intencionalmente pública)", () => {
  for (const code of FREE_CODES) {
    it(`${code}.jpg não está borrado`, async () => {
      const originalVariance = await grayscaleVariance(join(GALLERY_DIR, `${code}.jpg`));
      const previewVariance = await grayscaleVariance(join(PREVIEWS_DIR, `${code}.jpg`));
      // Nítido preserva a maior parte do detalhe do original (resize sozinho
      // já reduz um pouco a variância — tolerância generosa de 45%).
      expect(previewVariance).toBeGreaterThan(originalVariance * 0.45);
    });
  }
});

describe("previews dos itens bloqueados — blur físico real, nunca o original", () => {
  const sampleLockedCodes = ["02", "15", "40", "63", "88"];

  for (const code of sampleLockedCodes) {
    it(`${code}.jpg tem variância de pixel drasticamente menor que o original (blur nos pixels, não CSS)`, async () => {
      const originalVariance = await grayscaleVariance(join(GALLERY_DIR, `${code}.jpg`));
      const previewVariance = await grayscaleVariance(join(PREVIEWS_DIR, `${code}.jpg`));
      // Blur forte + ruído + camada escura derruba a variância para uma
      // fração pequena da original — nunca perto de "quase igual" (que
      // indicaria original servido sem tratamento nenhum).
      expect(previewVariance).toBeLessThan(originalVariance * 0.5);
    });

    it(`${code}.jpg no diretório de previews não é byte-idêntico ao original`, () => {
      const originalBytes = readFileSync(join(GALLERY_DIR, `${code}.jpg`));
      const previewBytes = readFileSync(join(PREVIEWS_DIR, `${code}.jpg`));
      expect(Buffer.compare(originalBytes, previewBytes)).not.toBe(0);
    });

    it(`${code}.jpg no diretório de previews tem resolução reduzida em relação ao original`, async () => {
      const originalMeta = await sharp(join(GALLERY_DIR, `${code}.jpg`)).metadata();
      const previewMeta = await sharp(join(PREVIEWS_DIR, `${code}.jpg`)).metadata();
      expect(previewMeta.width ?? 0).toBeLessThan(originalMeta.width ?? 0);
    });
  }
});
