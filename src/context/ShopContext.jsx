import { useEffect, useState } from "react";
import ShopContext from "./ShopContextValue";
import { toItem } from "./shopUtils";
import { latinNames } from "../utils/text";

const CART_KEY = "plume:cart";
const WISHLIST_KEY = "plume:wishlist";

const clampQty = (q) => Math.min(99, Math.max(1, Math.floor(Number(q)) || 1));

function read(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeItem(item) {
  if (!item || typeof item !== "object" || Array.isArray(item)) return null;
  if (typeof item.id !== "string" || !item.id.trim()) return null;
  if (typeof item.title !== "string" || !item.title.trim()) return null;

  const price = Number(item.price);
  const authors = Array.isArray(item.authors)
    ? latinNames(item.authors)
    : typeof item.authors === "string" && item.authors.trim()
      ? latinNames([item.authors])
      : [];

  return {
    id: item.id.trim(),
    title: item.title.trim(),
    authors,
    cover:
      typeof item.cover === "string"
        ? item.cover.replace(/^http:/, "https:")
        : "",
    price: Number.isFinite(price) && price >= 0 ? price : 0,
    demo: item.demo === true,
  };
}

function loadWishlist() {
  const unique = new Map();
  read(WISHLIST_KEY).forEach((item) => {
    const normalized = normalizeItem(item);
    if (normalized && !unique.has(normalized.id)) {
      unique.set(normalized.id, normalized);
    }
  });
  return [...unique.values()];
}

function loadCart() {
  const unique = new Map();
  read(CART_KEY).forEach((item) => {
    const normalized = normalizeItem(item);
    if (!normalized) return;

    const existing = unique.get(normalized.id);
    const qty = clampQty(item.qty);
    unique.set(
      normalized.id,
      existing
        ? { ...existing, qty: clampQty(existing.qty + qty) }
        : { ...normalized, qty },
    );
  });
  return [...unique.values()];
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(loadCart);
  const [wishlist, setWishlist] = useState(loadWishlist);

  useEffect(() => save(CART_KEY, cart), [cart]);
  useEffect(() => save(WISHLIST_KEY, wishlist), [wishlist]);

  const addToCart = (book) => {
    const item = toItem(book);
    if (!item || cart.some((i) => i.id === item.id)) return false;
    setCart((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, { ...item, qty: 1 }];
    });
    return true;
  };

  const moveToCart = (book) => {
    const item = toItem(book);
    if (!item) return;
    setCart((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, { ...item, qty: 1 }];
    });
    setWishlist((prev) => prev.filter((i) => i.id !== item.id));
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((i) => i.id !== id));

  const setQty = (id, qty) =>
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: clampQty(qty) } : i)),
    );

  const clearCart = () => setCart([]);

  const clearWishlist = () => setWishlist([]);

  const toggleWishlist = (book) => {
    const item = toItem(book);
    if (!item) return;
    setWishlist((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item],
    );
  };

  const value = {
    cart,
    wishlist,
    cartCount: cart.reduce((n, i) => n + i.qty, 0),
    wishlistCount: wishlist.length,
    cartTotal:
      Math.round(cart.reduce((s, i) => s + i.price * i.qty, 0) * 100) / 100,
    addToCart,
    moveToCart,
    removeFromCart,
    setQty,
    clearCart,
    clearWishlist,
    toggleWishlist,
    inWishlist: (id) => wishlist.some((i) => i.id === id),
    cartQty: (id) => cart.find((i) => i.id === id)?.qty || 0,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}