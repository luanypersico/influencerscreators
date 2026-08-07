import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export type SetPasswordSessionState = "processing" | "valid" | "invalid";

const AUTH_LINK_TIMEOUT_MS = 10_000;

/** Checks only the presence of Auth callback fields; it never reads or logs tokens. */
export function hasAuthCallbackPayload(location: Pick<Location, "hash" | "search">): boolean {
  const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
  const search = new URLSearchParams(location.search);
  return (
    (hash.has("access_token") && hash.has("refresh_token")) ||
    hash.has("type") ||
    search.has("code")
  );
}

export function isSessionEstablishingEvent(event: AuthChangeEvent): boolean {
  return event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "PASSWORD_RECOVERY";
}

/**
 * Waits for the browser Auth client to consume an invite/recovery callback.
 * Invite links use the implicit callback flow, so this deliberately does not
 * require a PKCE `code` or call exchangeCodeForSession.
 */
export function useSetPasswordSession(): {
  session: Session | null;
  state: SetPasswordSessionState;
} {
  const [session, setSession] = useState<Session | null>(null);
  const [state, setState] = useState<SetPasswordSessionState>("processing");

  useEffect(() => {
    let active = true;
    let settled = false;
    const hasCallbackPayload = hasAuthCallbackPayload(window.location);

    function markValid(nextSession: Session) {
      if (!active) return;
      settled = true;
      setSession(nextSession);
      setState("valid");
    }

    function markInvalid() {
      if (!active) return;
      settled = true;
      setSession(null);
      setState("invalid");
    }

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (nextSession && isSessionEstablishingEvent(event)) {
        markValid(nextSession);
        return;
      }

      // An INITIAL_SESSION without a callback payload is a settled, invalid link.
      if (event === "INITIAL_SESSION" && !nextSession && !hasCallbackPayload) markInvalid();
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        markInvalid();
      } else if (data.session) {
        markValid(data.session);
      }
      // A null first result is intentionally not terminal: supabase-js may
      // still be consuming an implicit invite/recovery callback from the URL.
    });

    const timeout = window.setTimeout(() => {
      if (!settled) markInvalid();
    }, AUTH_LINK_TIMEOUT_MS);
    return () => {
      active = false;
      window.clearTimeout(timeout);
      subscription.subscription.unsubscribe();
    };
  }, []);

  return { session, state };
}
