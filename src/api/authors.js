import { requestJson } from "./request";
import { isLatinText } from "../utils/text";

const WRITER_RE =
  /\b(writer|author|novelist|poet|playwright|dramatist|essayist|philosopher|journalist|historian|critic|short story)/i;

const fold = (text) =>
  String(text || "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();

export async function searchAuthors(q = "", signal, limit = 3) {
  const term = String(q || "").trim();
  if (term.length < 2) return [];

  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: term,
    gsrlimit: "25",
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
  const words = fold(term).split(/\s+/).filter(Boolean);
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
    .map((page) => {
      const title = fold(page.title);
      return {
        page,
        titleMatch: words.every((word) => title.includes(word)),
      };
    })
    .sort(
      (a, b) =>
        Number(b.titleMatch) - Number(a.titleMatch) ||
        (a.page.index || 0) - (b.page.index || 0),
    )
    .slice(0, Math.max(0, limit))
    .map(({ page }) => ({
      id: String(page.pageid),
      name: page.title.replace(/\s*\([^)]*\)\s*$/, "").trim(),
      description: page.description || "",
      thumbnail: page.thumbnail?.source || "",
    }));
}
