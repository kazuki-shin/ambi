import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  console.error('ERROR 💥', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went very wrong!';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Optional: show stack in dev
  });
};

export default errorHandler; 