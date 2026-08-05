/**
 * Só as imagens PÚBLICAS do acervo Bergamo — nenhum texto de prompt vive
 * aqui. O conteúdo completo dos prompts foi migrado para product_items e
 * só é servido pelo backend (ver src/lib/bergamo-catalog.server.ts).
 *
 * Este módulo importa exclusivamente src/assets/bergamo/previews/ — a
 * pasta de arquivos derivados gerada por scripts/generate-bergamo-
 * previews.mjs. Os 3 códigos gratuitos são cópias limpas (amostras
 * intencionalmente públicas); os outros 87 já saem do gerador com blur
 * físico, camada escura, ruído e a marca "ARSENAL BERGAMO — CONTEÚDO
 * BLOQUEADO" — o efeito está nos pixels do arquivo, não em CSS, então
 * não pode ser desfeito pelo DevTools.
 *
 * NUNCA importe src/assets/bergamo/gallery/ (os originais em alta
 * resolução) a partir daqui nem de qualquer outro módulo alcançável pelo
 * navegador — esses arquivos só existem como material-fonte para o
 * script de geração, nunca chegam ao bundle público.
 */
const previewImages = import.meta.glob<string>("../assets/bergamo/previews/*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
});

export function bergamoImage(code: string): string {
  return previewImages[`../assets/bergamo/previews/${code}.jpg`] ?? "";
}
