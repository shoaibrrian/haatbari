/**
 * Every error we deliberately throw extends AppError.
 *
 * Why a class hierarchy instead of returning `{ error: "..." }` from services?
 * Because a service sitting three layers deep cannot build an HTTP response —
 * it has no idea it is even being called over HTTP (a CLI script might call it).
 * It throws a typed error; the route wrapper turns that into a status code.
 *
 * `isOperational` marks errors we *expected* and whose message is safe to show
 * the client. A TypeError from a bug is not operational — that one gets logged
 * in full and shown to the client as a generic 500, so we never leak internals.
 */
export class AppError extends Error {
  constructor(
    message,
    { status = 500, code = "INTERNAL_ERROR", details, cause } = {},
  ) {
    super(message, { cause });
    this.name = new.target.name;
    this.status = status;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, new.target);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Request validation failed", details) {
    super(message, { status: 400, code: "VALIDATION_ERROR", details });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, { status: 401, code: "UNAUTHORIZED" });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to do this") {
    super(message, { status: 403, code: "FORBIDDEN" });
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, { status: 404, code: "NOT_FOUND" });
  }
}

/** Duplicate key, or a state transition that is not allowed. */
export class ConflictError extends AppError {
  constructor(message = "Conflicts with the current state", details) {
    super(message, { status: 409, code: "CONFLICT", details });
  }
}

/** Not enough stock, cart total mismatch — business rules, not bad syntax. */
export class UnprocessableError extends AppError {
  constructor(message = "Cannot process this request", details) {
    super(message, { status: 422, code: "UNPROCESSABLE", details });
  }
}

/** An upstream we do not control is down or out of quota (Atlas, AI provider). */
export class ServiceUnavailableError extends AppError {
  constructor(message = "Service temporarily unavailable", { cause } = {}) {
    super(message, { status: 503, code: "SERVICE_UNAVAILABLE", cause });
  }
}
