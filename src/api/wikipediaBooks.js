import { requestJson } from "./request";

const API = "https://en.wikipedia.org/w/api.php";
const BOOK_DESCRIPTION_RE =
  /\b(novel|novella|short stor(y|ies)|book|collection|fiction|tale|play)\b/i;

function normalizeTitle(title) {
  return String(title || "")
    .replace(/ß/gi, "ss")
    .replace(/\s*\([^)]*\)\s*$/, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/^(the|a|an)\s+/, "")
    .trim();
}

export async function getWikipediaBookInfo(title, author, signal) {
  const expectedTitle = normalizeTitle(title);
  if (!expectedTitle) return null;

  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: [title, author].filter(Boolean).join(" "),
    gsrnamespace: "0",
    gsrlimit: "10",
    prop: "extracts|pageimages|description",
    exintro: "1",
    explaintext: "1",
    piprop: "thumbnail",
    pithumbsize: "500",
    format: "json",
    formatversion: "2",
    origin: "*",
  });
  const data = await requestJson(`${API}?${params}`, {
    signal,
    ttl: 60 * 60 * 1000,
  });
  const authorText = normalizeTitle(author);
  const pages = Array.isArray(data?.query?.pages) ? data.query.pages : [];

  const candidates = pages
    .map((page) => {
      const description = page.description || "";
      const extract = page.extract || "";
      const exactTitle = normalizeTitle(page.title) === expectedTitle;
      const titleEvidence = normalizeTitle(
        `${page.title} ${description} ${extract}`,
      ).includes(expectedTitle);
      const mentionsAuthor =
        authorText &&
        normalizeTitle(`${description} ${extract}`).includes(authorText);

      if (
        !BOOK_DESCRIPTION_RE.test(description) ||
        (!exactTitle && (!titleEvidence || !mentionsAuthor))
      ) {
        return null;
      }

      return {
        page,
        score: Number(exactTitle) * 2 + Number(Boolean(mentionsAuthor)),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  for (const { page } of candidates) {
    return {
      title: page.title,
      description: page.description || "",
      extract: page.extract || "",
      thumbnail: page.thumbnail,
    };
  }

  return null;
}
