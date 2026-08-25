import { AppError, ValidationError } from "../errors/app-error.js";
import { fail } from "./response.js";
import logger from "../logger.js";

/**
 * Wraps a route handler so no route ever writes try/catch again.
 *
 * The important asymmetry: an error we recognise gets its real message and
 * status; anything we do not recognise is a bug, so it is logged in full but
 * returned as a bare 500. Stack traces, driver internals and query shapes never
 * reach the browser. The requestId appears in both the log and the response, so
 * a user can quote it and we can find the exact line.
 */

function zodDetails(error) {
  return error.issues.map((issue) => ({
    path: issue.path.join(".") || "(root)",
    message: issue.message,
  }));
}

/**
 * Mongo/Mongoose errors are matched by `name` rather than `instanceof` on
 * purpose: importing mongoose here would make the HTTP layer depend on the
 * database layer, which is exactly the coupling this architecture avoids.
 */
function translate(error) {
  if (error instanceof AppError) return error;

  if (error?.name === "ZodError" && Array.isArray(error.issues)) {
    return new ValidationError("Request validation failed", zodDetails(error));
  }

  if (error?.name === "ValidationError" && error.errors) {
    return new ValidationError(
      "Document validation failed",
      Object.entries(error.errors).map(([path, e]) => ({
        path,
        message: e.message,
      })),
    );
  }

  if (error?.name === "CastError") {
    return new ValidationError(`Invalid value for "${error.path}"`);
  }

  if (error?.code === 11000) {
    return new AppError("That value is already taken", {
      status: 409,
      code: "CONFLICT",
      details: Object.keys(error.keyPattern ?? {}).map((path) => ({
        path,
        message: "must be unique",
      })),
      cause: error,
    });
  }

  if (
    error?.name === "MongooseServerSelectionError" ||
    error?.name === "MongoNetworkError" ||
    error?.name === "MongoNetworkTimeoutError"
  ) {
    return new AppError("Database temporarily unavailable", {
      status: 503,
      code: "SERVICE_UNAVAILABLE",
      cause: error,
    });
  }

  return null; // unknown -> treat as a bug
}

export function withRoute(handler, { name } = {}) {
  return async function routeHandler(request, context) {
    const requestId = crypto.randomUUID();
    const startedAt = Date.now();
    const route = name ?? `${request.method} ${new URL(request.url).pathname}`;

    try {
      const response = await handler(request, {
        ...context,
        requestId,
        logger,
      });

      logger.info("request completed", {
        requestId,
        route,
        status: response.status,
        durationMs: Date.now() - startedAt,
      });

      return response;
    } catch (error) {
      const known = translate(error);

      if (known) {
        logger.warn("request failed", {
          requestId,
          route,
          status: known.status,
          code: known.code,
          durationMs: Date.now() - startedAt,
          error,
        });
        return fail({ ...known, message: known.message, requestId });
      }

      logger.error("unhandled error", {
        requestId,
        route,
        durationMs: Date.now() - startedAt,
        error,
      });
      return fail({ status: 500, code: "INTERNAL_ERROR", requestId });
    }
  };
}
