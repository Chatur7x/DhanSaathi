export interface RetryConfig {
  maxRetries: number;
  initialBackoffMs: number;
  maxBackoffMs: number;
}

export function getRetryConfig(): RetryConfig {
  const maxRetries = Math.max(
    0,
    parseInt(process.env.MAX_RETRIES || "3", 10) || 0
  );
  const initialBackoffMs = Math.max(
    0,
    parseInt(process.env.INITIAL_BACKOFF_MS || "1000", 10) || 1000
  );
  const maxBackoffMs = Math.max(
    initialBackoffMs,
    parseInt(process.env.MAX_BACKOFF_MS || "10000", 10) || 10000
  );
  return { maxRetries, initialBackoffMs, maxBackoffMs };
}

export function computeBackoffMs(
  attempt: number, // 0-based: 0 = delay before 2nd attempt
  initialBackoffMs: number,
  maxBackoffMs: number
): number {
  const exponential = initialBackoffMs * Math.pow(2, attempt);
  const capped = Math.min(exponential, maxBackoffMs);
  // ±20% jitter to avoid synchronized retry bursts
  const jitter = capped * 0.2 * (Math.random() * 2 - 1);
  return Math.max(0, Math.round(capped + jitter));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Run `fn` with exponential-backoff retries.
 * `fn` is attempted (maxRetries + 1) times total. No infinite retries.
 * `onRetry` fires before each backoff sleep (useful for logging).
 */
export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  config: RetryConfig = getRetryConfig(),
  onRetry?: (attempt: number, error: unknown, delayMs: number) => void
): Promise<T> {
  let lastError: unknown;
  const totalAttempts = config.maxRetries + 1;

  for (let attempt = 0; attempt < totalAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (attempt >= totalAttempts - 1) break;
      const delayMs = computeBackoffMs(
        attempt,
        config.initialBackoffMs,
        config.maxBackoffMs
      );
      if (onRetry) {
        try {
          onRetry(attempt, error, delayMs);
        } catch {
          // never let logging break retries
        }
      }
      await sleep(delayMs);
    }
  }

  throw lastError;
}
