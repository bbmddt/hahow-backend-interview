import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';
import logger from '../utils/logger';

// This is the global error handler for Express. The four-argument signature
// is what tells Express that this is an error-handling middleware.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  // AppError is our custom, operational error. We can trust its message and status code.
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // For all other unexpected errors, we log them for debugging purposes
  // and send a generic, non-revealing message to the client.
  logger.error('UNEXPECTED ERROR:', err);

  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
};

export default errorHandler;