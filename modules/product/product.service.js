import { NotFoundError } from "../../lib/errors/app-error.js";
import {
  createProductSchema,
  isObjectId,
  listProductsQuerySchema,
  productIdentifierSchema,
  toPublicProduct,
  updateProductSchema,
} from "./product.dto.js";
import * as repository from "./product.repository.js";

/**
 * Business rules live here. Two things this layer deliberately does NOT do:
 * it never builds a `Response` (a CLI script calls these same functions), and
 * it never touches the Mongoose model directly (that is the repository's job).
 *
 * Validation runs here rather than in the route so that every caller gets it,
 * not just HTTP ones. zod's thrown ZodError is translated into a 400 by
 * `withRoute`, so nothing here needs a try/catch.
 */

export async function listProducts(rawQuery = {}) {
  const query = listProductsQuerySchema.parse(rawQuery);

  const { items, total } = await repository.findManyProducts(query);

  return {
    items: items.map(toPublicProduct),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

/**
 * Accepts "68a1..." or "wireless-headphones" so the URL can be readable.
 * A 24-hex string is tried as an id first, then as a slug — a slug that happens
 * to be 24 hex characters is vanishingly unlikely, and falling through covers it.
 */
export async function getProduct(rawIdentifier) {
  const identifier = productIdentifierSchema.parse(rawIdentifier);

  let product = isObjectId(identifier)
    ? await repository.findProductById(identifier)
    : null;

  product ??= await repository.findProductBySlug(identifier);

  // The repository returned null, which is just a fact. Turning that fact into
  // a 404 is a policy decision, and policy belongs in the service.
  if (!product || !product.isActive) throw new NotFoundError("Product");

  return toPublicProduct(product);
}

export async function createProduct(rawInput) {
  const input = createProductSchema.parse(rawInput);
  const created = await repository.createProduct(input);
  return toPublicProduct(created);
}

export async function updateProduct(rawId, rawInput) {
  const id = productIdentifierSchema.parse(rawId);
  const patch = updateProductSchema.parse(rawInput);

  if (!isObjectId(id)) throw new NotFoundError("Product");

  const updated = await repository.updateProductById(id, patch);
  if (!updated) throw new NotFoundError("Product");

  return toPublicProduct(updated);
}

export async function deactivateProduct(rawId) {
  const id = productIdentifierSchema.parse(rawId);
  if (!isObjectId(id)) throw new NotFoundError("Product");

  const updated = await repository.deactivateProductById(id);
  if (!updated) throw new NotFoundError("Product");

  return toPublicProduct(updated);
}
