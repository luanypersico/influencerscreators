const PRODUCTION_ORIGIN = "https://influencerscreators.pages.dev";

/** Builds a password-setup destination from server-controlled origins only. */
export function getPasswordSetupRedirectUrl(env: NodeJS.ProcessEnv = process.env): string {
  const configuredOrigin = env["APP_ORIGIN"]?.trim() || env["CF_PAGES_URL"]?.trim();
  const url = new URL(configuredOrigin || PRODUCTION_ORIGIN);
  const isProduction = url.origin === PRODUCTION_ORIGIN;
  const isLocal = url.origin === "http://localhost:4173";
  const isProjectPreview =
    url.protocol === "https:" &&
    url.port === "" &&
    url.hostname.endsWith(".influencerscreators.pages.dev");

  if (url.username || url.password || (!isProduction && !isLocal && !isProjectPreview)) {
    throw new Error("Origem confiável de convite não configurada.");
  }

  url.pathname = "/auth/callback";
  url.search = "?next=/auth/set-password";
  url.hash = "";
  return url.toString();
}
