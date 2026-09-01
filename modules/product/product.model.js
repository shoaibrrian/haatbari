import mongoose from "mongoose";
import { CATEGORIES } from "../../lib/categories.js";

/**
 * "Blue Sneakers" -> "blue-sneakers". Kept local to this module because slugs
 * are a product concern; nothing else in the app needs them yet.
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-") // \p{L}/\p{N} keeps Bangla letters intact
    .replace(/^-+|-+$/g, "");
}

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    /**
     * Sparse unique: the 52 products already in Atlas have no slug field at
     * all, and a plain unique index would see them as 52 duplicate nulls and
     * refuse to build. Sparse skips documents that lack the field entirely.
     */
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    /**
     * Left as a float for now, deliberately. The correct answer is an integer
     * count of minor units (paisa), because 0.1 + 0.2 !== 0.3 in binary
     * floating point and money must add up exactly. Switching means renaming
     * the field everywhere the UI renders a price, so it is scheduled for the
     * frontend phase when we touch those files anyway. The validator below
     * blocks the worst case in the meantime.
     */
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      validate: {
        // Not `Number.isInteger(value * 100)`. That fails on 16.99, because
        // 16.99 * 100 === 1698.9999999999998 — the exact floating point trap
        // this validator exists to warn about. Round-tripping through
        // Math.round is the check that actually works.
        validator: (value) =>
          Number.isFinite(value) &&
          Math.abs(value * 100 - Math.round(value * 100)) < 1e-9,
        message: "Price cannot have more than 2 decimal places",
      },
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      enum: {
        values: CATEGORIES.map((category) => category.name),
        message: "{VALUE} is not a supported category",
      },
    },

    subcategory: {
      type: String,
      required: [true, "Subcategory is required"],
      trim: true,
      validate: {
        validator(value) {
          const category = CATEGORIES.find(
            (item) => item.name === this.category,
          );

          return category?.items.includes(value);
        },
        message: "Subcategory does not belong to the selected category",
      },
    },
    image: {
      type: String,
      required: [true, "Product image is required"],
      trim: true,
      validate: {
        validator: (value) => URL.canParse(value),
        message: "Image must be a valid URL",
      },
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: (values) => values.every((value) => URL.canParse(value)),
        message: "Every product image must be a valid URL",
      },
    },

    /** Whole units only — you cannot hold 2.5 sneakers. */
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number",
      },
    },

    /** Soft unpublish. Deleting a product that appears in past orders is worse. */
    isActive: { type: Boolean, default: true },

    /**
     * `select: false` is the real fix for the payload-bloat bug. Previously
     * every product list shipped 52 embedding arrays to the browser. Excluding
     * it at the schema level means we cannot forget `.select('-embedding')` on
     * some future query — the embedding is opt-in via `.select('+embedding')`.
     */
    embedding: { type: [Number], select: false },

    /**
     * Which model produced the vector above. Without this, changing embedding
     * models silently mixes 384-dim and 1536-dim vectors in one collection and
     * vector search returns garbage instead of an error.
     */
    embeddingModel: { type: String, select: false },
    embeddingDim: { type: Number, select: false },
    embeddedAt: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Auto-slug on create. Runs before validation so the unique index sees a value.
productSchema.pre("validate", function autoSlug() {
  if (!this.slug && this.title) this.slug = slugify(this.title);
});

// Storefront listing: filter by category, hide unpublished, newest first.
productSchema.index({ isActive: 1, category: 1, createdAt: -1 });
// Price sorting and range filters.
productSchema.index({ price: 1 });
// Lexical fallback for when vector search is unavailable (Phase 5).
productSchema.index({ title: "text", description: "text" });

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
