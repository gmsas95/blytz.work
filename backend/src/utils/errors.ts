export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path?: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export function createApiError(message: string, statusCode: number, code?: string): AppError {
  return new AppError(message, statusCode, code);
}

export function handleApiError(error: any): ApiError {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      timestamp: new Date().toISOString(),
    };
  }

  if (error.name === 'ValidationError') {
    return {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input data',
      details: error.details,
      timestamp: new Date().toISOString(),
    };
  }

  // Log unexpected errors
  console.error('Unexpected error:', error);
  
  return {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  };
}