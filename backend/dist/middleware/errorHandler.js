"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.createError = exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
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
exports.errorHandler = errorHandler;
const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
