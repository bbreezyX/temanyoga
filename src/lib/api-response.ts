import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 500) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function notFound(resource = "Resource") {
  return apiError(`${resource} not found`, 404);
}

export function unauthorized(message = "Unauthorized") {
  return apiError(message, 401);
}

export function badRequest(message: string) {
  return apiError(message, 400);
}

export function serverError(message = "Internal server error") {
  return apiError(message, 500);
}
