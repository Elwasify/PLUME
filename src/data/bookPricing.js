export const CURRENCY_CODE = "EGP";

const MARKET_PRICES_EGP = [
  149, 169, 189, 199, 219, 239, 259, 279, 299, 329, 359, 389,
];

export const BOOK_PRICE_OVERRIDES_EGP = {
  OL66554W: 229,
  OL1230613W: 189,
  OL166952W: 179,
  OL498556W: 189,
  OL1063588W: 299,
};

function priceIndex(id) {
  let hash = 0;
  for (const character of id) {
    hash = (hash * 31 + character.charCodeAt(0)) % 9973;
  }
  return hash % MARKET_PRICES_EGP.length;
}

export function getBookPrice(id) {
  const bookId = String(id || "").trim().toUpperCase();
  if (Object.hasOwn(BOOK_PRICE_OVERRIDES_EGP, bookId)) {
    return BOOK_PRICE_OVERRIDES_EGP[bookId];
  }
  return MARKET_PRICES_EGP[priceIndex(bookId)];
}

export function calculateCartTotal(items) {
  const total = items.reduce((sum, item) => {
    const quantity = Number(item.qty);
    return sum + getBookPrice(item.id) * quantity;
  }, 0);
  return Math.round(total * 100) / 100;
}
