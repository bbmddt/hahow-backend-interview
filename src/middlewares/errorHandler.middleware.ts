import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';
import logger from '../utils/logger';

// This is an Express error-handling middleware. It's identified by its special
// four-argument signature. The `_next` parameter is unused but required for Express
// to recognize it as an error handler.
const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  // If the error is an instance of custom AppError, trust its properties
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // for unexpected errors, log them for tracking
  logger.error('UNEXPECTED ERROR:', err);

  // send a generic message
  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
};

export default errorHandler;