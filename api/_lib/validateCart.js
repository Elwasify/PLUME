import { calculateCartTotal } from "../../src/data/bookPricing.js";

const ID_PATTERN = /^[A-Za-z0-9]{3,20}$/;
const MAX_QTY = 20;
const MAX_ITEMS = 30;

export function validateCart(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_ITEMS) {
    return { ok: false, error: "Invalid cart" };
  }

  const cleanItems = [];

  for (const item of items) {
    const id = String(item?.id || "")
      .trim()
      .toUpperCase();
    const qty = Number(item?.qty);

    if (!ID_PATTERN.test(id)) {
      return { ok: false, error: "Invalid book id" };
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      return { ok: false, error: "Invalid quantity" };
    }

    cleanItems.push({ id, qty });
  }

  const totalEgp = calculateCartTotal(cleanItems);
  const amountCents = Math.round(totalEgp * 100);

  return { ok: true, items: cleanItems, totalEgp, amountCents };
}
