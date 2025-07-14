class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);

    // Ensure the new error has the correct prototype chain
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;

    // 'isOperational' helps distinguish between our controlled, predictable errors
    // and unexpected programming errors.
    this.isOperational = isOperational;

    // Capture the stack trace, excluding the constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;