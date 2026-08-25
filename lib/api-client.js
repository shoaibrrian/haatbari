/**
 * Browser-side counterpart to lib/http/response.js. Every component talks to
 * the API through this, so the envelope is unwrapped in exactly one place —
 * otherwise `data.data` starts appearing in components and the day we change
 * the envelope we have to edit twenty files.
 *
 * It throws on failure instead of returning an error object, so a component
 * cannot forget to check. `code` is what UI logic should branch on; `message`
 * is for humans.
 */

export class ApiError extends Error {
  constructor({ status, code = "UNKNOWN", message, details, requestId }) {
    super(message || "Something went wrong. Please try again.");
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

export async function apiFetch(path, { method = "GET", body, signal } = {}) {
  const response = await fetch(path, {
    method,
    signal,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  // A crash or a proxy can return HTML, so never assume the body is JSON.
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false) {
    throw new ApiError({ status: response.status, ...(payload?.error ?? {}) });
  }

  return payload; // { success: true, data, meta? }
}
