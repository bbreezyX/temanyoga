import { NextResponse } from "next/server";

/**
 * Standard error codes for API responses
 * These provide machine-readable error identifiers for client-side handling
 */
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "RATE_LIMITED"
  | "INSUFFICIENT_STOCK"
  | "INVALID_COUPON"
  | "PAYMENT_REQUIRED"
  | "CONFLICT"
  | "INTERNAL_ERROR";

/**
 * API error response structure with error code
 */
interface ApiErrorResponse {
  success: false;
  error: string;
  code: ErrorCode;
  details?: unknown;
}

/**
 * API success response structure
 */
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Generate a unique request ID for error tracing
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Success response helper
 */
export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Generic error response with code
 */
export function apiError(
  message: string,
  status = 500,
  code: ErrorCode = "INTERNAL_ERROR",
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error: message,
    code,
  };
  
  // Include details in development for debugging
  if (details && process.env.NODE_ENV === "development") {
    response.details = details;
  }
  
  return NextResponse.json(response, { status });
}

/**
 * Not found error (404)
 */
export function notFound(resource = "Resource"): NextResponse<ApiErrorResponse> {
  return apiError(`${resource} not found`, 404, "NOT_FOUND");
}

/**
 * Unauthorized error (401)
 */
export function unauthorized(message = "Unauthorized"): NextResponse<ApiErrorResponse> {
  return apiError(message, 401, "UNAUTHORIZED");
}

/**
 * Forbidden error (403)
 */
export function forbidden(message = "Forbidden"): NextResponse<ApiErrorResponse> {
  return apiError(message, 403, "FORBIDDEN");
}

/**
 * Bad request / validation error (400)
 */
export function badRequest(message: string, code: ErrorCode = "VALIDATION_ERROR"): NextResponse<ApiErrorResponse> {
  return apiError(message, 400, code);
}

/**
 * Rate limited error (429)
 */
export function rateLimited(retryAfter = 60): NextResponse<ApiErrorResponse> {
  const response = apiError(
    "Too many requests. Please try again later.",
    429,
    "RATE_LIMITED"
  );
  response.headers.set("Retry-After", String(retryAfter));
  return response;
}

/**
 * Insufficient stock error (400)
 */
export function insufficientStock(productName: string, available: number): NextResponse<ApiErrorResponse> {
  return apiError(
    `Insufficient stock for "${productName}". Available: ${available}`,
    400,
    "INSUFFICIENT_STOCK"
  );
}

/**
 * Invalid coupon error (400)
 */
export function invalidCoupon(message: string): NextResponse<ApiErrorResponse> {
  return apiError(message, 400, "INVALID_COUPON");
}

/**
 * Conflict error (409) - for duplicate resources
 */
export function conflict(message: string): NextResponse<ApiErrorResponse> {
  return apiError(message, 409, "CONFLICT");
}

/**
 * Internal server error (500)
 * Includes request ID for tracing
 */
export function serverError(message = "Internal server error"): NextResponse<ApiErrorResponse> {
  const requestId = generateRequestId();
  console.error(`[Server Error] Request ID: ${requestId}, Message: ${message}`);
  
  return apiError(
    `${message} (Request ID: ${requestId})`,
    500,
    "INTERNAL_ERROR"
  );
}

/**
 * Type guard for checking if a response is an error
 */
export function isApiError<T>(response: ApiResponse<T>): response is ApiErrorResponse {
  return response.success === false;
}

/**
 * Type guard for checking if a response is successful
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true;
}
