export function ok(data, { status = 200, headers, meta } = {}) {
  return Response.json(
    { success: true, data, ...(meta ? { meta } : {}) },
    { status, headers },
  );
}

export function created(data, { headers } = {}) {
  return ok(data, { status: 201, headers });
}

export function noContent() {
  return new Response(null, { status: 204 });
}

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
