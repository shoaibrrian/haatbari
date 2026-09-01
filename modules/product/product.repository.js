import connectDB from "../../lib/db/connect.js";
import Product from "./product.model.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildFilter({
  category,
  subcategory,
  q,
  minPrice,
  maxPrice,
  includeInactive,
}) {
  const filter = {};

  if (!includeInactive) filter.isActive = true;
  if (category) filter.category = category;
  if (subcategory) filter.subcategory = subcategory;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

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

export async function findProductsByIds(ids, options = {}) {
  await connectDB();
  return Product.find({ _id: { $in: ids } }, null, options).lean();
}

export async function searchProductsByText(q, limit) {
  await connectDB();

  return Product.find({ isActive: true, $text: { $search: q } })
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .lean();
}

export async function searchProductsLoosely(q, limit) {
  await connectDB();

  const tokens = q.split(/\s+/).filter(Boolean).slice(0, 5);
  if (tokens.length === 0) return [];

  return Product.find({
    isActive: true,
    $and: tokens.map((token) => {
      const pattern = { $regex: escapeRegex(token), $options: "i" };
      return {
        $or: [
          { title: pattern },
          { category: pattern },
          { description: pattern },
        ],
      };
    }),
  })
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit)
    .lean();
}

export async function createProduct(data) {
  await connectDB();
  const doc = await Product.create(data);
  return doc.toObject();
}

export async function updateProductById(id, patch) {
  await connectDB();
  return Product.findByIdAndUpdate(id, patch, {
    returnDocument: "after",
    runValidators: true,
    context: "query",
  }).lean();
}

export async function deactivateProductById(id) {
  await connectDB();
  return Product.findByIdAndUpdate(
    id,
    { isActive: false },
    { returnDocument: "after" },
  ).lean();
}

export async function activateProductById(id) {
  await connectDB();

  return Product.findByIdAndUpdate(
    id,
    { isActive: true },
    { returnDocument: "after", runValidators: true },
  ).lean();
}

export async function decrementProductStock(id, quantity, options = {}) {
  await connectDB();

  const result = await Product.updateOne(
    { _id: id, isActive: true, stock: { $gte: quantity } },
    { $inc: { stock: -quantity } },
    options,
  );

  return result.modifiedCount === 1;
}

export async function incrementProductStock(id, quantity, options = {}) {
  await connectDB();

  await Product.updateOne({ _id: id }, { $inc: { stock: quantity } }, options);
}
