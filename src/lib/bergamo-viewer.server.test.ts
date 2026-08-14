import { describe, expect, it } from "bun:test";

import { resolveBergamoViewerAuthorization } from "./bergamo-viewer.server";

describe("Bergamo viewer authorization", () => {
  for (const role of ["super_admin", "admin"]) {
    it(`libera catálogo completo para ${role}`, () => {
      expect(
        resolveBergamoViewerAuthorization({
          roles: [role],
          hasActiveCoproducerLink: false,
          hasActiveProductAccess: false,
        }),
      ).toEqual({ label: "Administrador", destination: "/admin", hasFullAccess: true });
    });
  }

  it("libera catálogo completo para coprodutor Bergamo ativo", () => {
    expect(
      resolveBergamoViewerAuthorization({
        roles: ["member"],
        hasActiveCoproducerLink: true,
        hasActiveProductAccess: false,
      }),
    ).toEqual({
      label: "Coprodutor",
      destination: "/coprodutor/bergamo",
      hasFullAccess: true,
    });
  });

  it("libera catálogo completo para comprador com acesso ativo, e leva para /membros (Minha área), não /prompts", () => {
    expect(
      resolveBergamoViewerAuthorization({
        roles: ["member"],
        hasActiveCoproducerLink: false,
        hasActiveProductAccess: true,
      }),
    ).toEqual({ label: "Aluno Bergamo", destination: "/membros", hasFullAccess: true });
  });

  it("mantém o catálogo público para conta sem acesso ao Bergamo", () => {
    expect(
      resolveBergamoViewerAuthorization({
        roles: ["member"],
        hasActiveCoproducerLink: false,
        hasActiveProductAccess: false,
      }),
    ).toEqual({ label: "Conta conectada", destination: "/membros", hasFullAccess: false });
  });
});
