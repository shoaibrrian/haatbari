import readJson from "@/lib/http/read-json";
import { created, ok } from "@/lib/http/response";
import { withRoute } from "@/lib/http/with-route";
import { listOrders, placeOrder } from "@/modules/order/order.service";

export const POST = withRoute(async (request) => {
  const order = await placeOrder(await readJson(request));

  return created(order);
});

export const GET = withRoute(async (request) => {
  const { searchParams } = new URL(request.url);

  const orders = await listOrders(Object.fromEntries(searchParams));

  return ok(orders);
});
