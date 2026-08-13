import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

export const ARSENAL_HOSTNAME = "arsenal.obergamo.com.br";
export const ARSENAL_ORIGIN = `https://${ARSENAL_HOSTNAME}`;

export function isArsenalHostname(host: string | null | undefined): boolean {
  return host?.split(":", 1)[0]?.toLowerCase() === ARSENAL_HOSTNAME;
}

/** Reads the request host on the server; no browser-supplied redirect is trusted. */
export const getRequestHostnameFn = createServerFn({ method: "GET" }).handler(() => {
  return (getRequestHeader("x-forwarded-host") ?? getRequestHeader("host") ?? "").toLowerCase();
});
