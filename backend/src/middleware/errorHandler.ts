import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";

  // Handle common database errors
  if (error.message.includes("duplicate key")) {
    statusCode = 400;
    message = "A record with this data already exists";
  }

  if (error.message.includes("foreign key constraint")) {
    statusCode = 400;
    message = "Invalid reference to related record";
  }

  if (error.message.includes("not found")) {
    statusCode = 404;
    message = "Record not found";
  }

  // Log error details in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
    });
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && {
      stack: error.stack,
      details: error,
    }),
  });
};

export const createError = (
  message: string,
  statusCode: number = 500,
): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
