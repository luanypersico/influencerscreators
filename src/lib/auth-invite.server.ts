export const ARSENAL_ORIGIN = "https://arsenal.obergamo.com.br";

/**
 * Redirect base for Bergamo/Arsenal invites only.
 *
 * The shared Supabase project keeps Studio's Site URL unchanged. The invite
 * template appends `/auth/invite?token_hash={{ .TokenHash }}&type=invite` to
 * this explicit RedirectTo value, so no shared APP_ORIGIN is consulted here.
 */
export function getPasswordSetupRedirectUrl(): string {
  return ARSENAL_ORIGIN;
}
