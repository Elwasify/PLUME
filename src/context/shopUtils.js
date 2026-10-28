import { latinNames } from "../utils/text";
import { CURRENCY_CODE, getBookPrice } from "../data/bookPricing";

export function toItem(book) {
  if (!book || typeof book.id !== "string" || !book.id.trim()) return null;

  if (!book.volumeInfo) {
    const title =
      typeof book.title === "string" && book.title.trim()
        ? book.title.trim()
        : "Untitled";
    return {
      id: book.id.trim(),
      title,
      authors: Array.isArray(book.authors)
        ? latinNames(book.authors)
        : typeof book.authors === "string" && book.authors.trim()
          ? latinNames([book.authors])
          : [],
      cover:
        typeof book.cover === "string"
          ? book.cover.replace(/^http:/, "https:")
          : "",
      price: getBookPrice(book.id),
    };
  }

  const info = book.volumeInfo;
  const title =
    typeof info.title === "string" && info.title.trim()
      ? info.title.trim()
      : "Untitled";
  return {
    id: book.id,
    title,
    authors: Array.isArray(info.authors) ? latinNames(info.authors) : [],
    cover: info.imageLinks?.thumbnail?.replace(/^http:/, "https:") || "",
    price: getBookPrice(book.id),
  };
}

export function formatPrice(amount) {
  const safeAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: CURRENCY_CODE,
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(safeAmount);
}
