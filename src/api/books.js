import { requestJson } from "./request";
import { isLatinText, latinNames } from "../utils/text";

const BASE = "https://openlibrary.org";
const LIST_FIELDS =
  "key,title,author_name,cover_i,isbn,first_publish_year,subject,edition_count,language";
const LANGS = { en: "eng", fr: "fre", ar: "ara" };

const coverUrl = (id, size = "M") =>
  id
    ? `https://covers.openlibrary.org/b/id/${encodeURIComponent(id)}-${size}.jpg?default=false`
    : undefined;

const isbnCoverUrl = (isbn, size = "M") =>
  isbn
    ? `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-${size}.jpg?default=false`
    : undefined;

function toBook(doc) {
  if (!doc || typeof doc !== "object") return null;
  const key = typeof doc.key === "string" ? doc.key : "";
  const workId = key.match(/^(?:\/works\/)?(OL\d+W)$/i)?.[1];
  if (!workId) return null;

  const isbns = Array.isArray(doc.isbn) ? doc.isbn : [];
  const cover = coverUrl(doc.cover_i) || isbnCoverUrl(isbns[0]);
  const year = Number(doc.first_publish_year);
  const title =
    typeof doc.title === "string" && doc.title.trim()
      ? doc.title.trim()
      : "";
  if (!isLatinText(title)) return null;
  const authors = latinNames(
    Array.isArray(doc.author_name) ? doc.author_name : [],
  );
  const languages = Array.isArray(doc.language) ? doc.language : [];
  const subjects = Array.isArray(doc.subject)
    ? doc.subject.filter((subject) => typeof subject === "string" && subject.trim())
    : [];

  return {
    id: workId.toUpperCase(),
    volumeInfo: {
      title,
      authors,
      languages,
      publishedDate:
        Number.isInteger(year) && year > 0 ? String(year) : undefined,
      categories: subjects.slice(0, 5),
      editionCount: Number.isInteger(doc.edition_count)
        ? doc.edition_count
        : undefined,
      imageLinks: cover ? { thumbnail: cover } : undefined,
    },
  };
}

function normalizeBooks(docs) {
  const seen = new Set();
  const books = [];

  for (const doc of Array.isArray(docs) ? docs : []) {
    const book = toBook(doc);
    if (!book || seen.has(book.id)) continue;
    seen.add(book.id);
    books.push(book);
  }

  return books;
}

export function authorQuery(name) {
  const escaped = String(name || "")
    .trim()
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"');
  return `author:"${escaped}"`;
}

export async function searchBooksPage(
  {
    q = "",
    category = "",
    orderBy = "relevance",
    lang = "",
    offset = 0,
    limit = 12,
  } = {},
  signal,
) {
  const parts = [];
  if (String(q).trim()) parts.push(String(q).trim());
  if (String(category).trim()) {
    const escapedCategory = String(category)
      .trim()
      .replaceAll("\\", "\\\\")
      .replaceAll('"', '\\"');
    parts.push(`subject:"${escapedCategory}"`);
  }
  if (lang && LANGS[lang]) parts.push(`language:${LANGS[lang]}`);

  const safeOffset = Math.max(0, Math.floor(Number(offset) || 0));
  const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 12)));
  const params = new URLSearchParams({
    q: parts.join(" ") || 'subject:"fiction"',
    fields: LIST_FIELDS,
    limit: String(safeLimit),
    offset: String(safeOffset),
  });
  if (orderBy === "newest") params.set("sort", "new");
  if (orderBy === "oldest") params.set("sort", "old");

  const data = await requestJson(`${BASE}/search.json?${params}`, { signal });
  const totalValue = Number(data?.numFound ?? data?.num_found);
  const total = Number.isFinite(totalValue) ? totalValue : null;
  const books = normalizeBooks(data?.docs);
  const received = Array.isArray(data?.docs) ? data.docs.length : 0;

  return {
    books,
    total,
    totalExact: data?.numFoundExact === true || data?.num_found_exact === true,
    received,
    offset: safeOffset,
    limit: safeLimit,
  };
}

export async function searchBooks(options = {}, signal) {
  const { books } = await searchBooksPage(options, signal);
  return books;
}

async function getWork(id, signal) {
  let workId = String(id || "").trim().toUpperCase();

  for (let redirects = 0; redirects < 3; redirects += 1) {
    if (!/^OL\d+W$/.test(workId)) {
      throw new Error("Invalid Open Library work ID");
    }

    const work = await requestJson(
      `${BASE}/works/${encodeURIComponent(workId)}.json`,
      { signal },
    );

    if (work.type?.key !== "/type/redirect") return work;

    const location = new URL(work.location, BASE);
    const redirectMatch = location.pathname.match(/^\/works\/(OL\d+W)$/);
    if (location.origin !== BASE || !redirectMatch) {
      throw new Error("Open Library returned an invalid work redirect");
    }
    workId = redirectMatch[1];
  }

  throw new Error("Open Library returned too many work redirects");
}

async function getAuthors(work, signal) {
  const authorKeys = (Array.isArray(work.authors) ? work.authors : [])
    .map((entry) => entry?.author?.key)
    .filter((key) => typeof key === "string" && /^\/authors\/OL\d+A$/.test(key));

  const results = await Promise.all(
    authorKeys.map(async (key) => {
      try {
        const author = await requestJson(`${BASE}${key}.json`, { signal });
        return typeof author.name === "string" && author.name.trim()
          ? author.name.trim()
          : null;
      } catch (error) {
        if (error.name === "AbortError") throw error;
        console.warn(`Unable to load Open Library author ${key}:`, error);
        return null;
      }
    }),
  );

  return latinNames(results.filter(Boolean));
}

async function getEditions(workId, signal) {
  const params = new URLSearchParams({ limit: "10" });
  try {
    const data = await requestJson(
      `${BASE}/works/${encodeURIComponent(workId)}/editions.json?${params}`,
      { signal },
    );
    return Array.isArray(data.entries) ? data.entries : [];
  } catch (error) {
    if (error.name === "AbortError") throw error;
    console.warn(`Unable to load Open Library editions for ${workId}:`, error);
    return [];
  }
}

export async function getBook(id, signal) {
  const work = await getWork(id, signal);
  const workId = (work.key?.split("/").pop() || String(id)).toUpperCase();
  const [authors, editions] = await Promise.all([
    getAuthors(work, signal),
    getEditions(workId, signal),
  ]);

  const edition = editions.find(
    (item) =>
      item.number_of_pages ||
      item.publishers?.length ||
      item.publish_date ||
      item.covers?.length,
  );
  const englishEditionTitle = editions.find(
    (item) => typeof item.title === "string" && isLatinText(item.title),
  )?.title;
  const title = isLatinText(work.title)
    ? work.title.trim()
    : englishEditionTitle?.trim();
  if (!title) return null;
  const description =
    typeof work.description === "string"
      ? work.description
      : work.description?.value;
  const coverId = work.covers?.[0] || edition?.covers?.[0];
  const cover =
    coverUrl(coverId, "L") ||
    isbnCoverUrl(edition?.isbn_13?.[0] || edition?.isbn_10?.[0], "L");

  return {
    id: workId,
    volumeInfo: {
      title,
      subtitle: work.subtitle,
      authors,
      description,
      categories: Array.isArray(work.subjects)
        ? work.subjects
            .filter((subject) => typeof subject === "string" && subject.trim())
            .slice(0, 5)
        : [],
      publishedDate: edition?.publish_date || work.first_publish_date,
      publicationFromEdition: Boolean(edition?.publish_date),
      publisher: edition?.publishers?.[0],
      pageCount: edition?.number_of_pages,
      editionDetailsAvailable: Boolean(edition),
      imageLinks: cover ? { thumbnail: cover } : undefined,
    },
  };
}
