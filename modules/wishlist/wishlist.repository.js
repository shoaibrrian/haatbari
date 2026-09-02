import connectDB from "../../lib/db/connect.js";
import Wishlist from "./wishlist.model.js";

export async function addWishlistItem(clerkUserId, productId) {
  await connectDB();

  return Wishlist.findOneAndUpdate(
    { clerkUserId, productId },
    {
      $setOnInsert: {
        clerkUserId,
        productId,
      },
    },
    {
      new: true,
      upsert: true,
    },
  ).lean();
}

export async function removeWishlistItem(clerkUserId, productId) {
  await connectDB();

  return Wishlist.findOneAndDelete({
    clerkUserId,
    productId,
  }).lean();
}

export async function findWishlistItems(clerkUserId) {
  await connectDB();

  return Wishlist.find({ clerkUserId }).sort({ createdAt: -1 }).lean();
}

export async function countWishlistItems(clerkUserId) {
  await connectDB();

  return Wishlist.countDocuments({ clerkUserId });
}
