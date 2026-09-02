import mongoose from "mongoose";

/**
 * Order lifecycle. Free-form strings were the old design, which meant a typo
 * ("shiped") became a permanent, unqueryable status in the database.
 */
// Constants live in a mongoose-free file so client components can import them.
// Re-exported here for convenience — repository/service import from either.
import {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  ORDER_STATUS_TRANSITIONS,
} from "./order.constants.js";

export { ORDER_STATUSES, PAYMENT_METHODS, ORDER_STATUS_TRANSITIONS };

/**
 * A line item is a *snapshot*, not a live reference. If a product's price
 * changes next month, an order placed today must still show today's price —
 * so title/price/image are copied in. The difference from the old code is
 * *who* writes them: the service reads them from the database, never the client.
 */
const orderItemSchema = new mongoose.Schema(
  {
    // ObjectId + ref, not String. A String productId cannot be `populate()`d,
    // silently accepts garbage, and makes "which orders contain product X"
    // an unindexable string comparison.
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "productId is required"],
    },
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
    image: { type: String, trim: true },

    // Unit price at the moment of purchase.
    unitPrice: {
      type: Number,
      required: true,
      min: [0, "unitPrice cannot be negative"],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "quantity must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "quantity must be a whole number",
      },
    },
    lineTotal: {
      type: Number,
      required: true,
      min: [0, "lineTotal cannot be negative"],
    },
  },
  { _id: false },
);

const customerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 60 },
    lastName: { type: String, required: true, trim: true, maxlength: 60 },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      trim: true,
      index: true,
    },

    customer: { type: customerSchema, required: true },

    items: {
      type: [orderItemSchema],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },

    paymentMethod: {
      type: String,
      enum: {
        values: PAYMENT_METHODS,
        message: "{VALUE} is not a supported payment method",
      },
      default: "cash_on_delivery",
    },

    status: {
      type: String,
      enum: {
        values: ORDER_STATUSES,
        message: "{VALUE} is not a valid order status",
      },
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);

/**
 * Defence in depth. The service is what computes the money, but a bug there
 * should not be able to persist an order whose total disagrees with its own
 * line items. `invalidate` produces a real mongoose ValidationError, which
 * `withRoute` already translates to a 400.
 *
 * 0.005 tolerance, not `!==` — these are floats, and 0.1 + 0.2 !== 0.3.
 */
orderSchema.pre("validate", function checkTotals() {
  const lineSum = this.items.reduce((sum, item) => sum + item.lineTotal, 0);

  if (Math.abs(this.subtotal - lineSum) > 0.005) {
    this.invalidate(
      "subtotal",
      `subtotal (${this.subtotal}) does not match the sum of line items (${lineSum})`,
    );
  }

  const expectedTotal = this.subtotal + this.deliveryFee;
  if (Math.abs(this.total - expectedTotal) > 0.005) {
    this.invalidate(
      "total",
      `total (${this.total}) does not equal subtotal + deliveryFee (${expectedTotal})`,
    );
  }
});

orderSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// "My orders" lookup before auth exists is by phone number; admin lists by
// status + recency. A userId index gets added when authentication lands.
orderSchema.index({ "customer.phone": 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
