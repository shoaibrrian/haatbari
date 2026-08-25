import connectDB from "../../lib/db/connect.js";
import Product from "./product.model.js";

/**
 * Data access only. No business rules, no HTTP, no thrown 404s — a repository
 * returning `null` is a fact, and deciding whether that fact is an error is the
 * service's job.
 *
 * `connectDB()` is called here rather than in the route because the connection
 * is a database concern, and because these functions are also called by CLI
 * scripts that have no route to hook into. It resolves a cached promise after
 * the first call, so the repeated await costs nothing.
 */

function buildFilter({ category, q, minPrice, maxPrice, includeInactive }) {
  const filter = {};

  if (!includeInactive) filter.isActive = true;
  if (category) filter.category = category;

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  // Uses the { title: 'text', description: 'text' } index. Whole words only —
  // real substring/semantic search arrives in the vector search phase.
  if (q) filter.$text = { $search: q };

  return filter;
}

function buildSort(sort, hasQuery) {
  switch (sort) {
    case "price_asc":
      return { price: 1 };
    case "price_desc":
      return { price: -1 };
    case "oldest":
      return { createdAt: 1 };
    case "relevance":
      return hasQuery ? { score: { $meta: "textScore" } } : { createdAt: -1 };
    default:
      // Tie-break on _id so page 2 never repeats a row from page 1 when several
      // products share a createdAt timestamp.
      return { createdAt: -1, _id: -1 };
  }
}

export async function findManyProducts({
  category,
  q,
  minPrice,
  maxPrice,
  sort = "newest",
  page = 1,
  limit = 12,
  includeInactive = false,
} = {}) {
  await connectDB();

  const filter = buildFilter({
    category,
    q,
    minPrice,
    maxPrice,
    includeInactive,
  });
  const skip = (page - 1) * limit;

  let query = Product.find(filter).sort(buildSort(sort, Boolean(q)));
  if (q && sort === "relevance") {
    query = query.select({ score: { $meta: "textScore" } });
  }

  // Both queries at once — they are independent, so waiting serially would
  // double the latency of every product page.
  const [items, total] = await Promise.all([
    query.skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  return { items, total };
}

export async function findProductById(id) {
  await connectDB();
  return Product.findById(id).lean();
}

export async function findProductBySlug(slug) {
  await connectDB();
  return Product.findOne({ slug }).lean();
}

/** Used by the order flow to price a cart from the database, never the client. */
export async function findProductsByIds(ids) {
  await connectDB();
  return Product.find({ _id: { $in: ids } }).lean();
}

export async function createProduct(data) {
  await connectDB();
  const doc = await Product.create(data);
  return doc.toObject();
}

export async function updateProductById(id, patch) {
  await connectDB();
  return Product.findByIdAndUpdate(id, patch, {
    new: true,
    runValidators: true,
    // Without this, validators that read other fields see an empty `this`.
    context: "query",
  }).lean();
}

/** Soft delete. Hard-deleting a product referenced by past orders loses history. */
export async function deactivateProductById(id) {
  await connectDB();
  return Product.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  ).lean();
}
