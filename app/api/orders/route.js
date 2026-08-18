import connectDB from "@/lib/db";
import Order from "@/models/Order";

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.customer || !body.items?.length) {
      return Response.json(
        { error: "Customer details and at least one item are required." },
        { status: 400 },
      );
    }

    await connectDB();
    const order = await Order.create({
      customer: body.customer,
      items: body.items,
      subtotal: body.subtotal,
      deliveryFee: body.deliveryFee,
      total: body.total,
      paymentMethod: body.paymentMethod || "cash_on_delivery",
    });

    return Response.json({ orderId: order._id }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return Response.json({ error: "Unable to place order." }, { status: 500 });
  }
}
