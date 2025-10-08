import { IsBoolean, IsString, IsOptional, IsNumber, IsObject } from 'class-validator';

/**
 * Standardized API Response Wrapper
 * Used across all services for consistent response format
 */
export class ApiResponseDto<T = any> {
  @IsBoolean()
  success!: boolean;

  @IsString()
  message!: string;

  @IsOptional()
  data?: T;

  @IsOptional()
  @IsNumber()
  statusCode?: number;

  @IsOptional()
  @IsString()
  timestamp?: string;

  constructor(
    success: boolean,
    message: string,
    data?: T,
    statusCode?: number
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Standardized Success Response
 */
export class SuccessResponseDto<T = any> extends ApiResponseDto<T> {
  constructor(message: string, data?: T, statusCode: number = 200) {
    super(true, message, data, statusCode);
  }
}

/**
 * Standardized Error Response
 */
export class ErrorResponseDto extends ApiResponseDto {
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  path?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    location?: string,
    path?: string
  ) {
    super(false, message, undefined, statusCode);
    this.location = location;
    this.path = path;
  }
}

/**
 * Standardized Paginated Response
 */
export class PaginatedApiResponseDto<T = any> extends ApiResponseDto<{
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}> {
  constructor(
    message: string,
    items: T[],
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    },
    statusCode: number = 200
  ) {
    super(true, message, { items, pagination }, statusCode);
  }
}

/**
 * Health Check Response
 */
export class HealthCheckResponseDto extends ApiResponseDto<{
  service: string;
  status: 'healthy' | 'unhealthy';
  uptime: number;
  timestamp: string;
  version?: string;
}> {
  constructor(
    service: string,
    status: 'healthy' | 'unhealthy' = 'healthy',
    uptime?: number,
    version?: string
  ) {
    super(
      true,
      `${service} is ${status}`,
      {
        service,
        status,
        uptime: uptime || process.uptime(),
        timestamp: new Date().toISOString(),
        version
      },
      200
    );
  }
}

/**
 * Validation Error Response
 */
export class ValidationErrorResponseDto extends ErrorResponseDto {
  @IsOptional()
  @IsObject()
  errors?: Record<string, string[]>;

  constructor(
    message: string = 'Validation failed',
    errors?: Record<string, string[]>,
    path?: string
  ) {
    super(message, 400, 'Validation', path);
    this.errors = errors;
  }
}

/**
 * Not Found Error Response
 */
export class NotFoundErrorResponseDto extends ErrorResponseDto {
  constructor(resource: string, id?: string, path?: string) {
    const message = id 
      ? `${resource} with ID '${id}' not found`
      : `${resource} not found`;
    super(message, 404, 'NotFound', path);
  }
}

/**
 * Unauthorized Error Response
 */
export class UnauthorizedErrorResponseDto extends ErrorResponseDto {
  constructor(message: string = 'Unauthorized access', path?: string) {
    super(message, 401, 'Unauthorized', path);
  }
}

/**
 * Forbidden Error Response
 */
export class ForbiddenErrorResponseDto extends ErrorResponseDto {
  constructor(message: string = 'Access forbidden', path?: string) {
    super(message, 403, 'Forbidden', path);
  }
}

/**
 * Internal Server Error Response
 */
export class InternalServerErrorResponseDto extends ErrorResponseDto {
  constructor(message: string = 'Internal server error', location?: string, path?: string) {
    super(message, 500, location || 'InternalServer', path);
  }
}
