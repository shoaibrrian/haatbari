import { z } from "zod";

/**
 * The contract at the HTTP boundary.
 *
 * Yes, the Mongoose schema also validates. That is not duplication with no
 * purpose: zod runs first and rejects a bad request with a 400 and per-field
 * paths before we open a database connection, and it *coerces* query strings
 * ("?page=2" is the string "2") which Mongoose never sees. Mongoose stays as the
 * last line of defence for writes that arrive from anywhere else, like a CLI
 * seed script. Different jobs, same field names.
 */

export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Apparel",
  "Footwear",
  "Accessories",
];

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;
const SORTS = ["newest", "oldest", "price_asc", "price_desc", "relevance"];

const priceField = z
  .number()
  .min(0, "Price cannot be negative")
  .refine(
    // Same trap as the model: 16.99 * 100 is not an integer in binary floating
    // point. Compare against the rounded value instead of testing integerness.
    (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-9,
    "Price cannot have more than 2 decimal places",
  );

export const listProductsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    // Capped so nobody can ask for 100000 products and exhaust the connection.
    limit: z.coerce.number().int().min(1).max(60).default(12),
    category: z.enum(PRODUCT_CATEGORIES).optional(),
    q: z.string().trim().min(1).max(120).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    sort: z.enum(SORTS).default("newest"),
  })
  .refine(
    (v) =>
      v.minPrice === undefined ||
      v.maxPrice === undefined ||
      v.minPrice <= v.maxPrice,
    { path: ["minPrice"], error: "minPrice cannot be greater than maxPrice" },
  );

export const createProductSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10).max(2000),
  price: priceField,
  category: z.enum(PRODUCT_CATEGORIES),
  image: z.url("Image must be a valid URL"),
  stock: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

/** PATCH semantics: send only what changes, but send at least one thing. */
export const updateProductSchema = createProductSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, {
    error: "Provide at least one field to update",
  });

/** Accepts either a Mongo id or a slug, so URLs can be pretty. */
export const productIdentifierSchema = z
  .string()
  .trim()
  .min(1, "Product identifier is required");

export function isObjectId(value) {
  return OBJECT_ID.test(value);
}

/**
 * The single place that decides what the browser is allowed to see. Whitelist,
 * never blacklist — adding a `costPrice` field to the schema tomorrow must not
 * silently start leaking margins to every visitor.
 */
export function toPublicProduct(doc) {
  if (!doc) return null;
  return {
    id: doc._id?.toString() ?? doc.id,
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    price: doc.price,
    category: doc.category,
    image: doc.image,
    stock: doc.stock,
    inStock: (doc.stock ?? 0) > 0,
    createdAt: doc.createdAt,
  };
}
