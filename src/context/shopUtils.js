function demoPrice(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 9973;
  return 8.5 + (h % 12);
}

export function toItem(book) {
  if (!book || typeof book.id !== "string" || !book.id.trim()) return null;

  if (!book.volumeInfo) {
    const price = Number(book.price);
    return {
      id: book.id.trim(),
      title: typeof book.title === "string" && book.title.trim()
        ? book.title
        : "Untitled",
      authors: Array.isArray(book.authors)
        ? book.authors.filter((author) => typeof author === "string")
        : typeof book.authors === "string" && book.authors.trim()
          ? [book.authors]
          : [],
      cover: typeof book.cover === "string"
        ? book.cover.replace(/^http:/, "https:")
        : "",
      price: Number.isFinite(price) && price >= 0 ? price : 0,
      demo: book.demo === true,
    };
  }

  const info = book.volumeInfo;
  const sale = book.saleInfo?.listPrice;
  const amount = Number(sale?.amount);
  const real =
    sale?.currencyCode === "USD" && Number.isFinite(amount) && amount > 0;
  return {
    id: book.id,
    title: info.title || "Untitled",
    authors: Array.isArray(info.authors)
      ? info.authors.filter((author) => typeof author === "string")
      : [],
    cover:
      info.imageLinks?.thumbnail?.replace(/^http:/, "https:") || "",
    price: real ? amount : demoPrice(book.id),
    demo: !real,
  };
}

export function formatPrice(amount) {
  const safeAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(safeAmount);
}
