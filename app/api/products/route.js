import connectDB from "@/lib/db/connect";
import Product from "@/modules/product/product.model";

export async function GET() {
  await connectDB();
  const products = await Product.find();
  return Response.json(products);
}
