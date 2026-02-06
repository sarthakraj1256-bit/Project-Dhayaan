/**
 * Silent Retry Utility for API calls
 * Implements exponential backoff with jitter for resilient API connections
 */

interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  silent?: boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 5000,
  silent: true,
};

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number, baseDelay: number, maxDelay: number): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * exponentialDelay; // 0-30% jitter
  return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wraps an async function with silent retry logic
 * Retries on failure without showing user-facing errors until all retries are exhausted
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | unknown = null;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt
      if (attempt < opts.maxRetries) {
        const delay = calculateDelay(attempt, opts.baseDelayMs, opts.maxDelayMs);
        
        // Only log in development mode and if not silent
        if (!opts.silent && import.meta.env.DEV) {
          console.warn(`[API Retry] Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms...`);
        }
        
        await sleep(delay);
      }
    }
  }

  // All retries exhausted - throw the last error
  throw lastError;
}

/**
 * Creates a retryable version of any async function
 */
export function createRetryableFn<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: RetryOptions = {}
): (...args: TArgs) => Promise<TResult> {
  return (...args: TArgs) => withRetry(() => fn(...args), options);
}

/**
 * Retry wrapper specifically for Supabase queries
 * Handles common Supabase error patterns
 */
export async function withSupabaseRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: { message: string } | null }>
): Promise<T> {
  const result = await withRetry(async () => {
    const { data, error } = await queryFn();
    if (error) throw new Error(error.message);
    return data as T;
  });
  
  return result;
}
