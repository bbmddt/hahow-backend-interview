import { Request, Response, NextFunction } from 'express';
import { AxiosError } from 'axios';
import { authenticate } from '../api/hahow.api';
import AppError from '../utils/appError';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const name = req.headers.name as string;
  const password = req.headers.password as string;

  // If no credentials are provided, mark as not authenticated and move on,
  // the downstream controllers will handle the logic for unauthenticated api calling.
  if (!name || !password) {
    req.isAuthenticated = false;
    return next();
  }

  // If credentials are provided, attempt to authenticate,
  // any failure from this point on will result in an error response passed to error handler.
  try {
    req.isAuthenticated = await authenticate(name, password);
    next();
  } catch (error) {
    // handle HTTP 401 Unauthorized error from the Hahow API
    if (error instanceof AxiosError && error.response?.status === 401) {
      // pass a custom AppError to error handler
      return next(new AppError(401, 'Authentication failed: Invalid name or password.'));
    }

    // Handle cases where the Hahow API returns 200 OK but with an error in the response body,
    // as well as unexpected network or server errors. 
    // Considered as a service-side or availability issue.
    console.error('Authentication service error:', error);
    return next(new AppError(503, 'Authentication service is currently unavailable. Please try again later.'));
  }
};