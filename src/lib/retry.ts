/**
 * Shared retry utility for transient network failures (Supabase, fetch, etc.)
 * Implements exponential backoff with jitter.
 */

/** Format any error into a readable string (handles Supabase PostgrestError, TypeError, etc.) */
export function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null) {
    const e = error as Record<string, unknown>;
    if (e.message) {
      return `${e.message}${e.code ? ` (code: ${e.code})` : ""}${e.details ? ` — ${e.details}` : ""}`;
    }
    // Avoid logging empty `{}`
    const str = JSON.stringify(error);
    return str === "{}" ? "[Unknown error — empty object]" : str;
  }
  return String(error);
}

/** Retry an async operation with exponential backoff + jitter */
export async function withRetry<T>(
  fn: () => Promise<T>,
  {
    maxRetries = 3,
    baseDelayMs = 500,
    label = "operation",
  }: { maxRetries?: number; baseDelayMs?: number; label?: string } = {}
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries - 1) {
        const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 100;
        console.warn(
          `[Retry] ${label} attempt ${attempt + 1}/${maxRetries} failed: ${formatError(err)}. Retrying in ${Math.round(delay)}ms...`
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}
