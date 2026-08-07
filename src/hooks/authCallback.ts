export type AuthCallbackDestination =
  "/auth/set-password" | "/membros" | "/admin" | "/coprodutor/bergamo";

const ALLOWED_NEXT_PATHS = new Set<AuthCallbackDestination>([
  "/auth/set-password",
  "/membros",
  "/admin",
  "/coprodutor/bergamo",
]);

export function getSafeAuthCallbackNext(search: string): AuthCallbackDestination | null {
  const next = new URLSearchParams(search).get("next");
  return next && ALLOWED_NEXT_PATHS.has(next as AuthCallbackDestination)
    ? (next as AuthCallbackDestination)
    : null;
}
