import { requestJson } from "./request";
import { isLatinText } from "../utils/text";

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

  const data = await requestJson(
    `https://en.wikipedia.org/w/api.php?${params}`,
    { signal, ttl: 15 * 60 * 1000 },
  );
  const pages = Array.isArray(data?.query?.pages) ? data.query.pages : [];
  const seen = new Set();

  return pages
    .filter((page) => {
      if (
        !page ||
        typeof page.title !== "string" ||
        !isLatinText(page.title) ||
        !Number.isFinite(Number(page.pageid))
      ) {
        return false;
      }
      const id = String(page.pageid);
      if (seen.has(id)) return false;
      seen.add(id);
      return WRITER_RE.test(page.description || "");
    })
    .sort((a, b) => (a.index || 0) - (b.index || 0))
    .slice(0, Math.max(0, limit))
    .map((page) => ({
      id: String(page.pageid),
      name: page.title.replace(/\s*\([^)]*\)\s*$/, "").trim(),
      description: page.description || "",
      thumbnail: page.thumbnail?.source || "",
    }));
}
