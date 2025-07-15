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
  shouldRetry: (error: unknown) => boolean = () => true
): Promise<T> => {
  let lastError: unknown;

  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (shouldRetry(error) && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      } else {
        break; // Exit loop if shouldRetry is false or retries are exhausted
      }
    }
  }
  throw lastError;
};