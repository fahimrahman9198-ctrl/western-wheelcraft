/**
 * Cheap, high-confidence spam heuristics for public lead submissions. Pure and
 * dependency-free so it can be unit tested directly.
 *
 * Both signals are things a genuine submission cannot produce by accident, so
 * neither risks dropping a real lead:
 *  - the honeypot field is hidden from users and has no label to autofill
 *  - a scripted filler writes the same string into every text input, so the
 *    message (or name) ends up identical to the email address
 *
 * Deliberately does NOT guess from the name alone. Random-looking names are the
 * most visible symptom, but real single-word names exist and a false positive
 * costs a paying customer.
 */
export interface SpamCheckInput {
  website?: string;
  damageDescription?: string;
  customerEmail: string;
  customerName: string;
}

/** Returns a short reason string when the lead looks automated, else null. */
export function isLikelySpam(payload: SpamCheckInput): string | null {
  if (payload.website && payload.website.trim() !== "") {
    return "honeypot";
  }

  const message = payload.damageDescription?.trim().toLowerCase();
  const email = payload.customerEmail.trim().toLowerCase();
  if (message && message === email) {
    return "message-equals-email";
  }

  const name = payload.customerName.trim().toLowerCase();
  if (name === email) {
    return "name-equals-email";
  }

  return null;
}
