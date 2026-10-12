const WRITER_RE =
  /writer|author|novelist|poet|playwright|dramatist|essayist|philosopher|journalist|historian|critic|short story/i;

export async function searchAuthors(q = "", signal, limit = 3) {
  const term = String(q || "").trim();
  if (term.length < 2) return [];

  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: term,
    gsrlimit: "10",
    gsrnamespace: "0",
    prop: "pageimages|description",
    piprop: "thumbnail",
    pithumbsize: "200",
    format: "json",
    formatversion: "2",
    origin: "*",
  });

  const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, {
    signal,
  });
  if (!res.ok) throw new Error(`Wikipedia request failed (${res.status})`);

  const data = await res.json();
  const pages = Array.isArray(data?.query?.pages) ? data.query.pages : [];

  return pages
    .filter(
      (page) =>
        page &&
        typeof page.title === "string" &&
        WRITER_RE.test(page.description || ""),
    )
    .sort((a, b) => (a.index || 0) - (b.index || 0))
    .slice(0, limit)
    .map((page) => ({
      id: String(page.pageid),
      name: page.title.replace(/\s*\([^)]*\)\s*$/, "").trim(),
      description: page.description || "",
      thumbnail: page.thumbnail?.source || "",
    }));
}