import logger from './logger';

/**
 * A utility function to retry an async operation.
 * @param operation The async function to be executed.
 * @param retries The number of times to retry the operation.
 * @param delay The delay in milliseconds between retries.
 * @param shouldRetry A function to determine if a retry should be performed based on the error.
 * @returns A promise that resolves with the result of the operation.
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 100,
  shouldRetry: (error: unknown) => boolean = () => true,
  context = 'Unnamed operation' // Optional context for more descriptive logging
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
        break; // Exit loop if shouldRetry is false or retries are exhausted
      }
    }
  }
  throw lastError;
};