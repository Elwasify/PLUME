const coverUrl = (id) =>
  `https://covers.openlibrary.org/b/id/${id}-M.jpg?default=false`;

export async function loadCatalog(signal) {
  const res = await fetch("/catalog.json", { signal });
  if (!res.ok) throw new Error("Catalog failed to load");
  const rows = await res.json();

  return rows.map((b) => ({
    id: b.id,
    category: b.category,
    volumeInfo: {
      title: b.title,
      authors: b.author ? [b.author] : [],
      publishedDate: b.year ? String(b.year) : undefined,
      imageLinks: b.cover ? { thumbnail: coverUrl(b.cover) } : undefined,
    },
  }));
}
