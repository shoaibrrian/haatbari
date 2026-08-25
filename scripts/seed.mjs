/**
 * The old /api/seed as it should have been: a command, not an endpoint.
 *
 * Being a CLI script is itself the security fix. It cannot be reached over the
 * network, it needs shell access and the .env file to run, and destroying data
 * now requires typing --force on purpose.
 */
import { readFile } from "node:fs/promises";
import mongoose from "mongoose";
import connectDB from "../lib/db/connect.js";
import Product from "../modules/product/product.model.js";

const force = process.argv.includes("--force");

await connectDB();

const existing = await Product.countDocuments();

if (existing > 0 && !force) {
  console.error(
    `Refusing to seed: ${existing} products already exist.\n` +
      `Re-run with --force to delete them and reinsert the fixture:\n` +
      `  npm run db:seed -- --force`,
  );
  await mongoose.disconnect();
  process.exit(1);
}

const fixture = JSON.parse(
  await readFile(new URL("./seed-data.json", import.meta.url), "utf8"),
);

if (existing > 0) {
  const { deletedCount } = await Product.deleteMany({});
  console.log(`deleted ${deletedCount} existing products`);
}

/**
 * `create()` rather than `insertMany()`: create runs the full document
 * lifecycle, so the pre('validate') hook fires and every product gets its slug.
 * A seed that bypasses the model's own rules is a seed that plants bad data.
 */
const created = await Product.create(fixture);
console.log(`inserted ${created.length} products`);
console.log(`sample slug: ${created[0].slug}`);

await mongoose.disconnect();
