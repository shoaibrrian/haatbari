import { z } from "zod";
import {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  MAX_QUANTITY_PER_ITEM,
  MAX_ITEMS_PER_ORDER,
} from "./order.constants.js";

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;
const BD_PHONE = /^(?:\+?880|0)1[3-9]\d{8}$/;
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u;

const customerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(60, "First name is too long")
    .regex(NAME_PATTERN, "First name should contain letters only"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(60, "Last name is too long")
    .regex(NAME_PATTERN, "Last name should contain letters only"),
  phone: z
    .string()
    .trim()
    .regex(BD_PHONE, "Enter a valid Bangladeshi mobile number"),
  address: z
    .string()
    .trim()
    .min(15, "Please give a full delivery address")
    .max(500, "Address is too long")
    .refine(
      (value) => value.split(/\s+/).filter(Boolean).length >= 3,
      "Write the address in full — house, road, area and city",
    ),
});

/**
 * THE SECURITY FIX.
 *
 * Notice what is absent: no `price`, no `subtotal`, no `deliveryFee`, no
 * `total`, no `title`. The old route took all of those from the browser and
 * wrote them straight to the database, so anyone could POST `price: 0.01`.
 *
 * The fix is not to validate those fields — it is to refuse to have them.
 * zod strips unknown keys by default, so a tampered payload arrives at the
 * service with the tampering already gone. The client says *what* it wants
 * and *how many*; the server decides what it costs.
 */
export const createOrderSchema = z.object({
  customer: customerSchema,
  items: z
    .array(
      z.object({
        productId: z.string().regex(OBJECT_ID, "Invalid product id"),
        quantity: z
          .number()
          .int("Quantity must be a whole number")
          .min(1, "Quantity must be at least 1")
          .max(
            MAX_QUANTITY_PER_ITEM,
            `Maximum ${MAX_QUANTITY_PER_ITEM} per item`,
          ),
      }),
    )
    .min(1, "Order must contain at least one item")
    .max(MAX_ITEMS_PER_ORDER, "Too many items in one order")
    // A cart with the same product twice would decrement stock twice and
    // produce a confusing invoice. Reject it rather than silently merging.
    .refine(
      (items) =>
        new Set(items.map((item) => item.productId)).size === items.length,
      { error: "Duplicate products in cart — merge them into one line" },
    ),
  paymentMethod: z.enum(PAYMENT_METHODS).default("cash_on_delivery"),
});

export const orderIdSchema = z.string().regex(OBJECT_ID, "Invalid order id");

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(ORDER_STATUSES).optional(),
  phone: z.string().trim().regex(BD_PHONE).optional(),
});

/**
 * Explicit whitelist, same principle as `toPublicProduct`: a new internal field
 * on the schema must never leak to a client just because someone added it.
 */
export function toPublicOrder(doc) {
  if (!doc) return null;

  return {
    id: doc._id?.toString(),
    customer: {
      firstName: doc.customer.firstName,
      lastName: doc.customer.lastName,
      phone: doc.customer.phone,
      address: doc.customer.address,
    },
    items: doc.items.map((item) => ({
      productId: item.productId?.toString(),
      title: item.title,
      slug: item.slug,
      image: item.image,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    subtotal: doc.subtotal,
    deliveryFee: doc.deliveryFee,
    total: doc.total,
    paymentMethod: doc.paymentMethod,
    status: doc.status,
    createdAt: doc.createdAt,
  };
}
