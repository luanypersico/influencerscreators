/**
 * Testes puros (sem DOM, sem React) das funções classificadoras usadas
 * pelo PrivacyCurtain. Não testamos o componente React em si (este
 * projeto não tem um ambiente de DOM configurado para bun:test) — só a
 * lógica determinística que decide quando a cortina deve ativar.
 */
import { describe, expect, it } from "bun:test";

import { isPrintScreenKey, isPrintShortcut } from "./PrivacyCurtain";

describe("isPrintScreenKey", () => {
  it("reconhece key === 'PrintScreen'", () => {
    expect(isPrintScreenKey({ key: "PrintScreen", code: "" })).toBe(true);
  });

  it("reconhece code === 'PrintScreen' mesmo se key vier diferente", () => {
    expect(isPrintScreenKey({ key: "", code: "PrintScreen" })).toBe(true);
  });

  it("não reconhece teclas comuns de digitação", () => {
    expect(isPrintScreenKey({ key: "a", code: "KeyA" })).toBe(false);
    expect(isPrintScreenKey({ key: "Enter", code: "Enter" })).toBe(false);
  });
});

describe("isPrintShortcut", () => {
  it("reconhece Ctrl+P", () => {
    expect(isPrintShortcut({ key: "p", ctrlKey: true, metaKey: false })).toBe(true);
  });

  it("reconhece Cmd+P (metaKey, mac)", () => {
    expect(isPrintShortcut({ key: "p", ctrlKey: false, metaKey: true })).toBe(true);
  });

  it("é insensível a maiúsculas/minúsculas", () => {
    expect(isPrintShortcut({ key: "P", ctrlKey: true, metaKey: false })).toBe(true);
  });

  it("não intercepta 'p' sozinho (sem Ctrl/Cmd) — não quebra digitação normal em busca", () => {
    expect(isPrintShortcut({ key: "p", ctrlKey: false, metaKey: false })).toBe(false);
  });

  it("não intercepta outras combinações com Ctrl (ex.: Ctrl+F)", () => {
    expect(isPrintShortcut({ key: "f", ctrlKey: true, metaKey: false })).toBe(false);
  });
});
