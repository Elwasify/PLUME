import { useEffect, useState } from "react";
import ShopContext from "./ShopContextValue";
import { toItem } from "./shopUtils";

const CART_KEY = "plume:cart";
const WISHLIST_KEY = "plume:wishlist";

const clampQty = (q) => Math.min(99, Math.max(1, Math.floor(Number(q)) || 1));

function load(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return Array.isArray(parsed) ? parsed.filter((i) => i && i.id) : [];
  } catch {
    return [];
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked: ignore
  }
}

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() =>
    load(CART_KEY).map((i) => ({
      ...i,
      qty: clampQty(i.qty),
      price: Number(i.price) || 0,
    })),
  );
  const [wishlist, setWishlist] = useState(() => load(WISHLIST_KEY));

  useEffect(() => save(CART_KEY, cart), [cart]);
  useEffect(() => save(WISHLIST_KEY, wishlist), [wishlist]);

  const addToCart = (book) => {
    const item = toItem(book);
    setCart((prev) => {
      const found = prev.find((i) => i.id === item.id);
      if (found) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: clampQty(i.qty + 1) } : i,
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((i) => i.id !== id));

  const setQty = (id, qty) =>
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: clampQty(qty) } : i)),
    );

  const clearCart = () => setCart([]);

  const toggleWishlist = (book) => {
    const item = toItem(book);
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
    removeFromCart,
    setQty,
    clearCart,
    toggleWishlist,
    inWishlist: (id) => wishlist.some((i) => i.id === id),
    cartQty: (id) => cart.find((i) => i.id === id)?.qty || 0,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
