import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(public statusCode: number, public message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${statusCode} - ${message}`);
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
};
