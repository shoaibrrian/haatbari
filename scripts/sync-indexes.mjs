/**
 * Creates every index declared in the schemas, and drops any index on the
 * collection that the schema no longer declares. That second half is why this
 * is a deliberate command and not something that runs on boot.
 */
import mongoose from "mongoose";
import connectDB from "../lib/db/connect.js";
import Product from "../modules/product/product.model.js";
import Order from "../modules/order/order.model.js";

await connectDB();

for (const Model of [Product, Order]) {
  const dropped = await Model.syncIndexes();
  const indexes = await Model.collection.indexes();

  console.log(`\n${Model.modelName}`);
  if (dropped.length) console.log(`  dropped: ${dropped.join(", ")}`);
  for (const index of indexes) {
    const flags = [index.unique && "unique", index.sparse && "sparse"]
      .filter(Boolean)
      .join(" ");
    console.log(`  ${index.name}  ${JSON.stringify(index.key)} ${flags}`);
  }
}

await mongoose.disconnect();
