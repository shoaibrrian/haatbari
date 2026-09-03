/**
 * Zero-dependency, so this file is safe to import from a client component.
 * `order.model.js` pulls in mongoose; if the checkout page imported DELIVERY_FEE
 * from there, the whole mongoose driver would land in the browser bundle.
 *
 * One source of truth matters here: the delivery fee used to be hardcoded as 70
 * in app/checkout/page.js and 0 nowhere else. Now the price the customer sees
 * and the price the server charges come from the same line of code.
 */

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export const PAYMENT_METHODS = ["cash_on_delivery"];

export const DELIVERY_FEES = {
  inside_dhaka: 80,
  outside_dhaka: 150,
};

export const MAX_QUANTITY_PER_ITEM = 20;
export const MAX_ITEMS_PER_ORDER = 50;

/** Which status may move to which. Terminal states map to an empty array. */
export const ORDER_STATUS_TRANSITIONS = Object.freeze({
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
});

export const COUPON_CODES = {
  WELCOME10: {
    type: "percentage",
    value: 10,
    minOrder: 500,
  },
  SAVE100: {
    type: "fixed",
    value: 100,
    minOrder: 1000,
  },
};
