class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);

    // Restore the prototype chain, a common issue when extending built-in classes like Error.
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;

    // 'isOperational' is key for our global error handler to distinguish between
    // our own controlled, predictable errors and unexpected bugs.
    this.isOperational = isOperational;

    // Capture a clean stack trace, excluding the constructor call.
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;