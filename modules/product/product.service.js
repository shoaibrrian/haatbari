import { NotFoundError } from "../../lib/errors/app-error.js";
import {
  createProductSchema,
  isObjectId,
  listProductsQuerySchema,
  productIdentifierSchema,
  searchQuerySchema,
  toPublicProduct,
  toAdminProduct,
  updateProductSchema,
} from "./product.dto.js";
import * as repository from "./product.repository.js";
import { getSubcategories } from "../../lib/categories.js";

const SEARCH_STRATEGIES = [
  {
    name: "text",
    run: (q, limit, includeInactive = false) =>
      repository.searchProductsByText(q, limit, includeInactive),
  },
  {
    name: "loose",
    run: (q, limit, includeInactive = false) =>
      repository.searchProductsLoosely(q, limit, includeInactive),
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

export async function listAdminProducts(rawQuery = {}) {
  const query = listProductsQuerySchema.parse({
    ...rawQuery,
    includeInactive: true,
  });

  const { items, total } = await repository.findManyProducts(query);

  return {
    items: items.map(toAdminProduct),
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
    const items = await strategy.run(q, limit, false);

    if (items.length > 0) {
      return {
        items: items.map(toPublicProduct),
        strategy: strategy.name,
        query: q,
      };
    }
  }

  return {
    items: [],
    strategy: "none",
    query: q,
  };
}

export async function searchAdminProducts(rawQuery = {}) {
  const { q, limit } = searchQuerySchema.parse(rawQuery);

  for (const strategy of SEARCH_STRATEGIES) {
    const items = await strategy.run(q, limit, true);

    if (items.length > 0) {
      return {
        items: items.map(toAdminProduct),
        strategy: strategy.name,
        query: q,
      };
    }
  }

  return {
    items: [],
    strategy: "none",
    query: q,
  };
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

function validateCategorySubcategory(category, subcategory) {
  const allowed = getSubcategories(category);

  if (!allowed.includes(subcategory)) {
    throw new Error(
      `"${subcategory}" is not a valid subcategory for "${category}"`,
    );
  }
}

export async function createProduct(rawInput) {
  const input = createProductSchema.parse(rawInput);
  validateCategorySubcategory(input.category, input.subcategory);
  const created = await repository.createProduct(input);
  return toPublicProduct(created);
}

export async function updateProduct(rawId, rawInput) {
  const id = productIdentifierSchema.parse(rawId);

  if (!isObjectId(id)) {
    throw new NotFoundError("Product");
  }

  const patch = updateProductSchema.parse(rawInput);

  const existing = await repository.findProductById(id);

  if (!existing) {
    throw new NotFoundError("Product");
  }

  const category = patch.category ?? existing.category;
  const subcategory = patch.subcategory ?? existing.subcategory;

  validateCategorySubcategory(category, subcategory);

  const updated = await repository.updateProductById(id, patch);

  if (!updated) {
    throw new NotFoundError("Product");
  }

  return toPublicProduct(updated);
}

export async function deactivateProduct(rawId) {
  const id = productIdentifierSchema.parse(rawId);
  if (!isObjectId(id)) throw new NotFoundError("Product");

  const updated = await repository.deactivateProductById(id);
  if (!updated) throw new NotFoundError("Product");

  return toPublicProduct(updated);
}

export async function activateProduct(rawId) {
  const id = productIdentifierSchema.parse(rawId);

  if (!isObjectId(id)) {
    throw new NotFoundError("Product");
  }

  const updated = await repository.activateProductById(id);

  if (!updated) {
    throw new NotFoundError("Product");
  }

  return toAdminProduct(updated);
}
