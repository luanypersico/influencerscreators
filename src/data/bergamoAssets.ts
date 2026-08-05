/**
 * Só as imagens do acervo Bergamo — nenhum texto de prompt vive aqui.
 * O conteúdo completo dos prompts foi migrado para product_items e só
 * é servido pelo backend (ver src/lib/bergamo-catalog.server.ts).
 */
const galleryImages = import.meta.glob<string>("../assets/bergamo/gallery/*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
});

export function bergamoImage(code: string): string {
  return galleryImages[`../assets/bergamo/gallery/${code}.jpg`] ?? "";
}
