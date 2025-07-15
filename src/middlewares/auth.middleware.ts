import { Request, Response, NextFunction } from 'express';
import { AxiosError } from 'axios';
import { authenticate, HahowApiError } from '../api/hahow.api';
import AppError from '../utils/appError';
import { withRetry } from '../utils/retry';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const name = req.headers.name as string;
  const password = req.headers.password as string;

  // If no credentials are provided, mark as not authenticated and move on.
  // Downstream services will handle logic for unauthenticated requests.
  if (!name || !password) {
    req.isAuthenticated = false;
    return next();
  }

  try {
    // Attempt to authenticate with a retry mechanism for specific, recoverable errors.
    await withRetry(
      () => authenticate(name, password),
      3, // Retry up to 3 times
      200, // Start with a 200ms delay, which will be doubled on each retry
      (error: unknown) => {
        // Only retry if the error is a HahowApiError with code 1000 (Backend Error).
        return error instanceof HahowApiError && error.code === 1000;
      }
    );
    // If authentication is successful, mark as authenticated.
    req.isAuthenticated = true;
    next();
  } catch (error) {
    // Handle HTTP 401 Unauthorized: gracefully degrade to unauthenticated state.
    if (error instanceof AxiosError && error.response?.status === 401) {
      req.isAuthenticated = false;
      return next();
    }

    // For all other errors (including failed retries or other API/network issues),
    // log the error and pass a service unavailable error to the handler.
    console.error('Authentication service error:', error);
    return next(new AppError(503, 'Authentication service is currently unavailable. Please try again later.'));
  }
};