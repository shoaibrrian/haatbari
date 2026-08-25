import readJson from "@/lib/http/read-json";
import { created } from "@/lib/http/response";
import { withRoute } from "@/lib/http/with-route";
import { placeOrder } from "@/modules/order/order.service";

export const POST = withRoute(async (request) => {
  const order = await placeOrder(await readJson(request));
  return created(order);
});
