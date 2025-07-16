import { Request, Response, NextFunction } from 'express';
import { AxiosError } from 'axios';
import { authenticate, HahowApiError } from '../api/hahow.api';
import AppError from '../utils/appError';
import { withRetry } from '../utils/retry';
import logger from '../utils/logger';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const name = req.headers.name as string;
  const password = req.headers.password as string;

  // If no credentials are provided, treat the request as unauthenticated
  // and let the downstream services decide what content to serve.
  if (!name || !password) {
    req.isAuthenticated = false;
    return next();
  }

  try {
    // Attempt to authenticate with a retry mechanism, but only for specific,
    // recoverable errors, like a temporary backend issue (HahowApiError code 1000).
    await withRetry(
      () => authenticate(name, password),
      3,
      200,
      (error: unknown) => {
        return error instanceof HahowApiError && error.code === 1000;
      },
      'authenticate'
    );
    req.isAuthenticated = true;
    next();
  } catch (error) {
    // This is the "graceful degradation" logic. If authentication fails with a 401,
    // we don't block the request. Instead, we mark it as unauthenticated and proceed.
    // This allows users to still see public content.
    if (error instanceof AxiosError && error.response?.status === 401) {
      logger.warn(
        `[Auth Warning] Request from name "${name}" failed authentication (401). Marked as unauthenticated. URL: ${req.originalUrl}`
      );
      req.isAuthenticated = false;
      return next();
    }

    // For any other error (e.g., the auth service is down and retries have failed),
    // we treat it as a critical failure and block the request.
    logger.error('Authentication service error:', error);
    return next(new AppError(503, 'Authentication service is currently unavailable. Please try again later.'));
  }
};