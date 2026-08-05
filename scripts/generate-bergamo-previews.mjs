/**
 * Gera os arquivos derivados PÚBLICOS do acervo Bergamo, uma única vez,
 * a partir dos 90 originais em src/assets/bergamo/gallery/ (nunca
 * importados por nenhum código do app — só este script lê essa pasta).
 *
 * Saída: src/assets/bergamo/previews/ — a ÚNICA pasta que código
 * alcançável pelo navegador público (bergamoAssets.ts) tem permissão de
 * importar.
 *
 * - Os 3 códigos gratuitos (FREE_CODES) são copiados como estão — já são
 *   amostras intencionalmente públicas.
 * - Os outros 87 recebem um tratamento físico nos pixels (blur forte,
 *   redução de contraste, camada escura, ruído e a marca "ARSENAL
 *   BERGAMO — CONTEÚDO BLOQUEADO" com cadeado) — nunca reversível via
 *   DevTools porque o efeito está no arquivo, não em CSS.
 *
 * Idempotente: nomes de arquivo estáveis (mesmo código de origem),
 * pipeline determinística — rodar de novo apenas regenera os mesmos 90
 * arquivos, nunca duplica nem deixa lixo. Sem serviço externo: só usa a
 * biblioteca `sharp` (processamento local).
 *
 * Uso: `node scripts/generate-bergamo-previews.mjs`
 */
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SOURCE_DIR = join(ROOT, "src/assets/bergamo/gallery");
const PREVIEWS_DIR = join(ROOT, "src/assets/bergamo/previews");

const FREE_CODES = new Set(["01", "26", "79"]);

const PREVIEW_WIDTH = 480;
const BLUR_SIGMA = 26;

function lockedOverlaySvg(width, height) {
  const cx = width / 2;
  const cy = height / 2;
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(24)">
          <path d="M0 18 L18 0" stroke="white" stroke-opacity="0.05" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="${width}" height="${height}" fill="black" fill-opacity="0.46"/>
      <rect width="${width}" height="${height}" fill="url(#grid)"/>
      <g transform="translate(${cx}, ${cy - 26})">
        <rect x="-22" y="-6" width="44" height="34" rx="6" fill="white" fill-opacity="0.92"/>
        <rect x="-13" y="-24" width="26" height="24" rx="13" fill="none" stroke="white" stroke-opacity="0.92" stroke-width="6"/>
        <circle cx="0" cy="10" r="4.5" fill="black" fill-opacity="0.55"/>
      </g>
      <text x="${cx}" y="${cy + 34}" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="700" letter-spacing="2" fill="white" fill-opacity="0.92">ARSENAL BERGAMO</text>
      <text x="${cx}" y="${cy + 54}" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="600" letter-spacing="1.5" fill="white" fill-opacity="0.75">CONTEÚDO BLOQUEADO</text>
    </svg>
  `);
}

async function makeLockedPreview(sourcePath, outputPath) {
  const sourceMeta = await sharp(sourcePath).metadata();
  const sourceWidth = sourceMeta.width ?? PREVIEW_WIDTH;
  const sourceHeight = sourceMeta.height ?? Math.round((PREVIEW_WIDTH * 4) / 3);
  const w = Math.min(PREVIEW_WIDTH, sourceWidth);
  const h = Math.round(sourceHeight * (w / sourceWidth));

  const resized = sharp(sourcePath)
    .resize({ width: w, height: h, fit: "fill" })
    .blur(BLUR_SIGMA)
    .modulate({
      brightness: 0.82,
      saturation: 0.7,
    });

  const noise = await sharp({
    create: {
      width: w,
      height: h,
      channels: 4,
      noise: { type: "gaussian", mean: 128, sigma: 40 },
    },
  })
    .ensureAlpha(0.05)
    .png()
    .toBuffer();

  await resized
    .composite([
      { input: noise, blend: "over" },
      { input: lockedOverlaySvg(w, h), blend: "over" },
    ])
    .jpeg({ quality: 68 })
    .toFile(outputPath);
}

async function makeFreePreview(sourcePath, outputPath) {
  await sharp(sourcePath).resize({ width: PREVIEW_WIDTH }).jpeg({ quality: 82 }).toFile(outputPath);
}

async function main() {
  if (!existsSync(PREVIEWS_DIR)) mkdirSync(PREVIEWS_DIR, { recursive: true });

  const files = readdirSync(SOURCE_DIR).filter((f) => f.endsWith(".jpg"));
  if (files.length === 0) {
    throw new Error(`Nenhum arquivo-fonte encontrado em ${SOURCE_DIR}`);
  }

  let lockedCount = 0;
  let freeCount = 0;

  for (const file of files) {
    const code = file.replace(/\.jpg$/, "");
    const sourcePath = join(SOURCE_DIR, file);
    const previewPath = join(PREVIEWS_DIR, file);

    if (FREE_CODES.has(code)) {
      await makeFreePreview(sourcePath, previewPath);
      freeCount += 1;
    } else {
      await makeLockedPreview(sourcePath, previewPath);
      lockedCount += 1;
    }
  }

  console.log(
    `Previews gerados: ${freeCount} livres (passthrough) + ${lockedCount} bloqueados (blur físico).`,
  );
  console.log(`Saída: ${PREVIEWS_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
