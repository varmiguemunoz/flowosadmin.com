/**
 * How an account is labelled in the UI.
 *
 * The API's `full_name` is optional, so `session.user.name` can legitimately be
 * null. Falling back to the email's local part keeps the navbar identifying who
 * is signed in, which is the whole point of showing a name there.
 */

export interface DisplayUser {
  name?: string | null;
  email?: string | null;
}

const FALLBACK_NAME = "Admin";

export function displayName(user: DisplayUser | null | undefined): string {
  const name = user?.name?.trim();
  if (name) {
    return name;
  }

  const email = user?.email?.trim();
  if (email) {
    const localPart = email.split("@")[0]?.trim();
    if (localPart) {
      return localPart;
    }
  }

  return FALLBACK_NAME;
}

/** First character of the display name, for the avatar chip. */
export function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}
