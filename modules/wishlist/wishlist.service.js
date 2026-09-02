import mongoose from "mongoose";

import Product from "../product/product.model.js";
import {
  addWishlistItem,
  removeWishlistItem,
  findWishlistItems,
  countWishlistItems,
} from "./wishlist.repository.js";

export async function addToWishlist(clerkUserId, productId) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  const product = await Product.findById(productId).select("_id").lean();

  if (!product) {
    throw new Error("Product not found");
  }

  return addWishlistItem(clerkUserId, productId);
}

export async function removeFromWishlist(clerkUserId, productId) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  return removeWishlistItem(clerkUserId, productId);
}

export async function getWishlist(clerkUserId) {
  const [items, count] = await Promise.all([
    findWishlistItems(clerkUserId),
    countWishlistItems(clerkUserId),
  ]);

  return {
    items,
    count,
  };
}
