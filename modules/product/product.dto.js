import { z } from "zod";

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
    (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-9,
    "Price cannot have more than 2 decimal places",
  );

export const listProductsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(60).default(12),
    category: z.enum(PRODUCT_CATEGORIES).optional(),
    q: z.string().trim().min(1).max(120).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    sort: z.enum(SORTS).default("newest"),
    includeInactive: z.coerce.boolean().default(false),
  })
  .refine(
    (v) =>
      v.minPrice === undefined ||
      v.maxPrice === undefined ||
      v.minPrice <= v.maxPrice,
    { path: ["minPrice"], error: "minPrice cannot be greater than maxPrice" },
  );

export const searchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, "Type something to search for")
    .max(120, "Search query is too long"),
  limit: z.coerce.number().int().min(1).max(60).default(24),
});

export const createProductSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10).max(2000),
  price: priceField,
  category: z.enum(PRODUCT_CATEGORIES),
  image: z.url("Image must be a valid URL"),
  stock: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, {
    error: "Provide at least one field to update",
  });

export const productIdentifierSchema = z
  .string()
  .trim()
  .min(1, "Product identifier is required");

export function isObjectId(value) {
  return OBJECT_ID.test(value);
}

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

export function toAdminProduct(doc) {
  if (!doc) return null;

  return {
    ...toPublicProduct(doc),
    isActive: doc.isActive !== false,
  };
}
