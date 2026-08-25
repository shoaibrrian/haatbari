import { isProduction } from "./config/env.js";

/**
 * Structured logging, not bare console.log.
 *
 * Two reasons. First, in production Vercel/Atlas log viewers can filter and
 * search JSON but not prose. Second, redaction: one careless
 * `console.log(someObject)` is exactly how a connection string or API key ends
 * up in a log file forever, so redaction lives here rather than at every call.
 */

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const threshold = LEVELS[isProduction ? "info" : "debug"];

const REDACT =
  /pass(word)?|secret|token|api[-_]?key|authorization|cookie|mongo_uri/i;

function redact(value, depth = 0) {
  if (depth > 4 || value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  const out = {};
  for (const [key, v] of Object.entries(value)) {
    out[key] = REDACT.test(key) ? "[redacted]" : redact(v, depth + 1);
  }
  return out;
}

/** JSON.stringify drops Error properties, so unpack them by hand. */
function serializeError(error) {
  if (!(error instanceof Error)) return error;
  return {
    name: error.name,
    message: error.message,
    code: error.code,
    stack: error.stack,
    ...(error.cause ? { cause: serializeError(error.cause) } : {}),
  };
}

function emit(level, message, context = {}) {
  if (LEVELS[level] < threshold) return;

  const { error, ...rest } = context;
  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...redact(rest),
    ...(error ? { error: serializeError(error) } : {}),
  };

  // One JSON line in production (machine-readable); a real object in dev, so
  // the terminal pretty-prints and collapses it for us.
  const line = isProduction ? JSON.stringify(entry) : entry;

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

const logger = {
  debug: (message, context) => emit("debug", message, context),
  info: (message, context) => emit("info", message, context),
  warn: (message, context) => emit("warn", message, context),
  error: (message, context) => emit("error", message, context),
};

export default logger;
