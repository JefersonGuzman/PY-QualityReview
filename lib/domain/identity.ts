// Identity cookie value: "<userId>.<selectedAtEpochMs>". Pure module; time is injected.

export const IDENTITY_COOKIE = "sqr_identity";
export const IDENTITY_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function encodeIdentity(userId: string, selectedAt: number): string {
  return `${userId}.${selectedAt}`;
}

// Returns the user id if the value is well formed and not expired, otherwise null.
export function parseIdentity(value: string | undefined, now: number): string | null {
  if (!value) return null;
  const separator = value.lastIndexOf(".");
  if (separator <= 0) return null;

  const userId = value.slice(0, separator);
  const rawSelectedAt = value.slice(separator + 1);
  if (!/^[a-z0-9-]+$/.test(userId) || !/^\d+$/.test(rawSelectedAt)) return null;

  const selectedAt = Number(rawSelectedAt);
  if (!Number.isSafeInteger(selectedAt) || selectedAt > now + 60_000) return null;
  if (now - selectedAt >= IDENTITY_TTL_MS) return null;
  return userId;
}
