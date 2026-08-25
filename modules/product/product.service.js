import { NotFoundError } from "../../lib/errors/app-error.js";
import {
  createProductSchema,
  isObjectId,
  listProductsQuerySchema,
  productIdentifierSchema,
  searchQuerySchema,
  toPublicProduct,
  updateProductSchema,
} from "./product.dto.js";
import * as repository from "./product.repository.js";

const SEARCH_STRATEGIES = [
  {
    name: "text",
    run: (q, limit) => repository.searchProductsByText(q, limit),
  },
  {
    name: "loose",
    run: (q, limit) => repository.searchProductsLoosely(q, limit),
  },
];

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

export async function searchProducts(rawQuery = {}) {
  const { q, limit } = searchQuerySchema.parse(rawQuery);

  for (const strategy of SEARCH_STRATEGIES) {
    const items = await strategy.run(q, limit);

    if (items.length > 0) {
      return {
        items: items.map(toPublicProduct),
        strategy: strategy.name,
        query: q,
      };
    }
  }

  return { items: [], strategy: "none", query: q };
}

export async function getProduct(rawIdentifier) {
  const identifier = productIdentifierSchema.parse(rawIdentifier);

  let product = isObjectId(identifier)
    ? await repository.findProductById(identifier)
    : null;

  product ??= await repository.findProductBySlug(identifier);

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
