import type { JwtPayload, Session, SupabaseClient } from "@supabase/supabase-js";

export type PasswordSetupMethod = "otp";

type PasswordSetupAuthClient = Pick<
  SupabaseClient["auth"],
  "getClaims" | "getUser" | "signInWithPassword" | "signOut" | "updateUser"
>;

const PASSWORD_SETUP_MAX_AGE_SECONDS = 15 * 60;
const CLOCK_SKEW_SECONDS = 60;

function getLatestAuthenticationMethod(
  claims: JwtPayload,
): { method: string; timestamp: number } | null {
  const [latest] = claims.amr ?? [];

  if (typeof latest === "string") {
    return { method: latest, timestamp: claims.iat };
  }

  if (!latest || typeof latest.method !== "string" || !Number.isFinite(latest.timestamp)) {
    return null;
  }

  return { method: latest.method, timestamp: latest.timestamp };
}

/**
 * Accepts only a recent, signed Supabase Auth claim issued specifically for
 * recovery or invitation. URL parameters and browser storage are deliberately
 * not inputs to this decision.
 */
export function getPasswordSetupMethod(
  claims: JwtPayload,
  expectedUserId: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): PasswordSetupMethod | null {
  if (claims.sub !== expectedUserId || claims.exp <= nowSeconds) return null;

  // Supabase Auth (GoTrue) tags both recovery-link and invite-link consumption
  // with the generic "otp" authentication method — never the literal strings
  // "recovery"/"invite" — confirmed against real production session data.
  // A normal password login is tagged "password", so this still rejects it.
  const latest = getLatestAuthenticationMethod(claims);
  if (!latest || latest.method !== "otp") return null;

  const ageSeconds = nowSeconds - latest.timestamp;
  if (ageSeconds < -CLOCK_SKEW_SECONDS || ageSeconds > PASSWORD_SETUP_MAX_AGE_SECONDS) return null;

  return "otp";
}

export async function verifyPasswordSetupSession(
  auth: PasswordSetupAuthClient,
  session: Session,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<PasswordSetupMethod | null> {
  const { data: claimsData, error: claimsError } = await auth.getClaims(session.access_token);
  if (claimsError || !claimsData?.claims) return null;

  const method = getPasswordSetupMethod(claimsData.claims, session.user.id, nowSeconds);
  if (!method) return null;

  const { data: userData, error: userError } = await auth.getUser(session.access_token);
  if (userError || userData.user?.id !== session.user.id) return null;

  return method;
}

/**
 * Revalidates the recovery/invite proof immediately before changing the
 * authenticated user's password. Afterwards it replaces the special Auth
 * session with a normal password session so revisiting the route is denied.
 */
export async function completePasswordSetup(
  auth: PasswordSetupAuthClient,
  session: Session,
  password: string,
): Promise<Session> {
  const method = await verifyPasswordSetupSession(auth, session);
  const email = session.user.email;
  if (!method || !email) throw new Error("Invalid password setup session");

  const { error: updateError } = await auth.updateUser({ password });
  if (updateError) throw updateError;

  const { error: signOutError } = await auth.signOut({ scope: "global" });
  if (signOutError) throw signOutError;

  const { data: signInData, error: signInError } = await auth.signInWithPassword({
    email,
    password,
  });
  if (signInError || !signInData.session) {
    throw signInError ?? new Error("Unable to establish the normal password session");
  }

  return signInData.session;
}
