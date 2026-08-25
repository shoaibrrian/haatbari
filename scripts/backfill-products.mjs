/**
 * One-time migration for the 52 products that predate the new schema.
 *
 * Mongoose validates on write, not on read, so those documents were never
 * wrong — they were just missing fields the new schema expects. Adding
 * `required` to a schema does not touch existing rows; you have to come back
 * and fill them in. That is what a migration is.
 *
 * Safe to run twice: every query only matches documents still missing a field.
 */
import mongoose from "mongoose";
import connectDB from "../lib/db/connect.js";
import Product, { slugify } from "../modules/product/product.model.js";

await connectDB();

const active = await Product.updateMany(
  { isActive: { $exists: false } },
  { $set: { isActive: true } },
);
console.log(`isActive backfilled: ${active.modifiedCount}`);

const stock = await Product.updateMany(
  { stock: { $exists: false } },
  { $set: { stock: 25 } },
);
console.log(`stock backfilled:    ${stock.modifiedCount}`);

/**
 * An ObjectId already contains its creation timestamp, so we can recover a real
 * createdAt instead of stamping everything with today's date — which would make
 * "sort by newest" meaningless.
 */
const undated = await Product.find({ createdAt: { $exists: false } })
  .select("_id")
  .lean();
for (const doc of undated) {
  const at = doc._id.getTimestamp();
  await Product.updateOne(
    { _id: doc._id },
    { $set: { createdAt: at, updatedAt: at } },
    {
      // `timestamps: false` stops mongoose stamping updatedAt with "now".
      // `overwriteImmutable` is the one that matters: timestamps:true marks
      // createdAt immutable, and mongoose strips immutable fields from updates
      // silently — no error, and modifiedCount still counts the document. This
      // is the only way to backdate it.
      timestamps: false,
      overwriteImmutable: true,
    },
  );
}
console.log(`timestamps recovered: ${undated.length}`);

// Slugs go one at a time: the index is unique, and two products called
// "Blue Sneakers" would collide. updateMany cannot resolve that.
const used = new Set(
  (
    await Product.find({ slug: { $type: "string" } })
      .select("slug")
      .lean()
  ).map((d) => d.slug),
);
const unslugged = await Product.find({
  $or: [{ slug: { $exists: false } }, { slug: null }],
})
  .select("_id title")
  .lean();

let slugged = 0;
for (const doc of unslugged) {
  const base = slugify(doc.title) || doc._id.toString();
  let slug = base;
  let suffix = 2;
  while (used.has(slug)) slug = `${base}-${suffix++}`;
  used.add(slug);
  await Product.updateOne({ _id: doc._id }, { $set: { slug } });
  slugged++;
}
console.log(`slugs generated:     ${slugged}`);

await mongoose.disconnect();
