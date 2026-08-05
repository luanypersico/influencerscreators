/**
 * Declaração mínima do runner de testes nativo do Bun, só com o que a
 * suíte deste projeto usa. Evitamos depender do pacote `@types/bun`
 * completo porque ele reescreve tipos globais (`fetch`, `Request`,
 * `Response`) de um jeito incompatível com o resto do código, que é
 * escrito contra os tipos padrão do DOM/lib.
 */
declare module "bun:test" {
  export function describe(name: string, fn: () => void): void;

  type TestFn = (name: string, fn: () => void | Promise<void>) => void;

  export const it: TestFn & {
    skip: TestFn;
    skipIf: (condition: boolean) => TestFn;
    only: TestFn;
  };

  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;

  export interface Matchers<T> {
    toBe(expected: T): void;
    toEqual(expected: unknown): void;
    toBeNull(): void;
    toBeUndefined(): void;
    toBeDefined(): void;
    toContain(expected: unknown): void;
    toMatch(expected: RegExp | string): void;
    toThrow(expected?: unknown): void;
    toBeInstanceOf(expected: unknown): void;
    toHaveLength(length: number): void;
    toHaveProperty(path: string, value?: unknown): void;
    toBeGreaterThan(value: number): void;
    toBeGreaterThanOrEqual(value: number): void;
    toBeLessThan(value: number): void;
    toBeLessThanOrEqual(value: number): void;
    not: Matchers<T>;
    rejects: {
      toThrow(expected?: unknown): Promise<void>;
    };
    resolves: Matchers<T>;
  }

  export function expect<T>(value: T): Matchers<T>;

  export const mock: {
    module: (specifier: string, factory: () => unknown) => void;
  };
}
