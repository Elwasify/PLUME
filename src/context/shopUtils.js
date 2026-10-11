function demoPrice(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 9973;
  return 8.5 + (h % 12);
}

export function toItem(book) {
  if (!book.volumeInfo) return book;
  const info = book.volumeInfo;
  const sale = book.saleInfo?.listPrice;
  const real = sale && sale.currencyCode === "USD" && sale.amount > 0;
  return {
    id: book.id,
    title: info.title || "Untitled",
    authors: info.authors || [],
    cover: info.imageLinks?.thumbnail?.replace("http://", "https://") || "",
    price: real ? sale.amount : demoPrice(book.id),
    demo: !real,
  };
}

export function formatPrice(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
