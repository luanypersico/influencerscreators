/**
 * A deploy rotates hashed JS/CSS filenames; a tab left open from before the
 * deploy then fails to fetch its old chunk. This matches only that specific
 * browser/Vite error signature — never a generic app exception — so a real
 * bug still surfaces in the error boundary instead of being silently reloaded away.
 */
const CHUNK_ERROR_PATTERN =
  /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|unable to preload css/i;

export function isChunkLoadErrorMessage(message: string): boolean {
  return message.length > 0 && CHUNK_ERROR_PATTERN.test(message);
}

export function extractErrorMessage(reason: unknown): string {
  if (reason instanceof Error) return reason.message;
  if (typeof reason === "string") return reason;
  return "";
}

/** One reload attempt per session: a second failure right after reloading means the deploy itself is broken, not just a stale tab — let the ErrorBoundary take over instead of looping. */
export function shouldReloadForChunkError(alreadyAttempted: boolean): boolean {
  return !alreadyAttempted;
}
