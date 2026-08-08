import { describe, expect, it } from "bun:test";

import type { BergamoPublicCatalog } from "./bergamo-catalog.server";
import { mergeBergamoSignedImageUrls } from "./bergamo-private-images.server";

const catalog: BergamoPublicCatalog = {
  totalCount: 2,
  categories: ["Executivo"],
  items: [
    {
      code: "01",
      title: "Um",
      category: "Executivo",
      description: null,
      isFree: true,
      prompt: "prompt um",
      imageUrl: null,
    },
    {
      code: "02",
      title: "Dois",
      category: "Executivo",
      description: null,
      isFree: false,
      prompt: "prompt dois",
      imageUrl: null,
    },
  ],
};

describe("galeria privada Bergamo", () => {
  it("associa cada URL assinada ao item correspondente", () => {
    const result = mergeBergamoSignedImageUrls(catalog, [
      { signedUrl: "https://storage.test/01" },
      { signedUrl: "https://storage.test/02" },
    ]);
    expect(result.items.map((item) => item.imageUrl)).toEqual([
      "https://storage.test/01",
      "https://storage.test/02",
    ]);
  });

  it("falha fechado quando falta qualquer imagem", () => {
    expect(() =>
      mergeBergamoSignedImageUrls(catalog, [{ signedUrl: "https://storage.test/01" }]),
    ).toThrow("Galeria privada incompleta");
  });

  it("falha fechado quando o Storage não assina um item", () => {
    expect(() =>
      mergeBergamoSignedImageUrls(catalog, [
        { signedUrl: "https://storage.test/01" },
        { error: "not found" },
      ]),
    ).toThrow("Imagem privada indisponível para o item 02");
  });
});
