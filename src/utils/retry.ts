import logger from './logger';

/**
 * A generic retry utility with exponential backoff.
 * This is essential for building resilient applications that can handle transient
 * failures (e.g., temporary network issues, rate limiting) when communicating
 * with external services.
 *
 * @param operation The async function to retry.
 * @param retries The maximum number of retry attempts.
 * @param delay The initial delay in milliseconds, which doubles on each subsequent retry (exponential backoff).
 * @param shouldRetry A predicate function to conditionally decide if a retry is appropriate for a given error.
 * @param context A string for logging to provide context on what operation is being retried.
 * @returns A promise that resolves with the result of the successful operation.
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 100,
  shouldRetry: (error: unknown) => boolean = () => true,
  context = 'Unnamed operation'
): Promise<T> => {
  let lastError: unknown;

  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (shouldRetry(error) && i < retries - 1) {
        const retryDelay = delay * Math.pow(2, i);
        logger.info(
          `[${context}] - Attempt ${
            i + 1
          } of ${retries} failed. Retrying in ${retryDelay}ms... (Error: ${
            error instanceof Error ? error.message : String(error)
          })`
        );
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        break;
      }
    }
  }
  throw lastError;
};