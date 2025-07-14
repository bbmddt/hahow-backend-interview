import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // If the error is an instance of custom AppError, trust its properties
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // for unexpected errors, log them for tracking
  console.error('UNEXPECTED ERROR:', err);

  // send a generic message
  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
};

export default errorHandler;