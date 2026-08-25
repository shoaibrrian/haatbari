/**
 * One envelope for every response, so the frontend never has to guess:
 *   success -> { success: true, data }
 *   failure -> { success: false, error: { code, message, details? } }
 *
 * A machine-readable `code` matters more than the message — the UI switches on
 * `code`, humans read `message`. That lets us reword messages freely later.
 *
 * We return plain `Response`, not `NextResponse`. App Router accepts either,
 * and plain Response keeps this file importable outside Next (tests, scripts).
 */

export function ok(data, { status = 200, headers } = {}) {
  return Response.json({ success: true, data }, { status, headers });
}

export function created(data, { headers } = {}) {
  return ok(data, { status: 201, headers });
}

export function noContent() {
  return new Response(null, { status: 204 });
}

/** List endpoints. `meta` goes beside the data, never mixed into it. */
export function paginated(items, { page, limit, total }) {
  return Response.json({
    success: true,
    data: items,
    meta: {
      page,
      limit,
      total,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
    },
  });
}

export function fail({
  status = 500,
  code = "INTERNAL_ERROR",
  message = "Something went wrong",
  details,
  requestId,
}) {
  return Response.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
        ...(requestId ? { requestId } : {}),
      },
    },
    { status },
  );
}
