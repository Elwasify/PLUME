const BASE = "https://openlibrary.org";
const LIST_FIELDS = "key,title,author_name,cover_i,isbn,first_publish_year";
const LANGS = { en: "eng", fr: "fre", ar: "ara" };
const MAX_ATTEMPTS = 3;

const coverUrl = (id, size = "M") =>
  id
    ? `https://covers.openlibrary.org/b/id/${id}-${size}.jpg?default=false`
    : undefined;

const isbnCoverUrl = (isbn, size = "M") =>
  isbn
    ? `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-${size}.jpg?default=false`
    : undefined;

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("The request was aborted", "AbortError"));
      return;
    }

    const timeout = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve();
    }, ms);

    function abort() {
      clearTimeout(timeout);
      reject(new DOMException("The request was aborted", "AbortError"));
    }

    signal?.addEventListener("abort", abort, { once: true });
  });
}

async function getJson(url, signal) {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, { signal });

      if (response.ok) return await response.json();

      if (
        ![429, 503].includes(response.status) ||
        attempt === MAX_ATTEMPTS - 1
      ) {
        throw new Error(
          `Open Library request failed (${response.status} ${response.statusText})`,
        );
      }
    } catch (error) {
      if (error.name === "AbortError" || attempt === MAX_ATTEMPTS - 1) {
        throw error;
      }

      if (error.message.startsWith("Open Library request failed (")) {
        throw error;
      }
    }

    await delay(500 * (attempt + 1), signal);
  }

  throw new Error("Open Library request failed after multiple attempts");
}

function toBook(doc) {
  if (!doc || typeof doc !== "object") return null;
  const key = typeof doc.key === "string" ? doc.key : "";
  const workId = key.match(/^(?:\/works\/)?(OL\d+W)$/i)?.[1];
  if (!workId) return null;
  const isbns = Array.isArray(doc.isbn) ? doc.isbn : [];
  const cover =
    coverUrl(doc.cover_i) || isbnCoverUrl(isbns[0]);

  return {
    id: workId.toUpperCase(),
    volumeInfo: {
      title:
        typeof doc.title === "string" && doc.title.trim()
          ? doc.title
          : "Untitled",
      authors: Array.isArray(doc.author_name)
        ? doc.author_name.filter(
            (author) => typeof author === "string" && author.trim(),
          )
        : [],
      publishedDate: doc.first_publish_year
        ? String(doc.first_publish_year)
        : undefined,
      imageLinks: cover ? { thumbnail: cover } : undefined,
    },
  };
}

export function authorQuery(name) {
  const escaped = String(name || "")
    .trim()
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"');
  return `author:"${escaped}"`;
}

export async function searchBooks(
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
  if (q.trim()) parts.push(q.trim());
  if (category.trim()) {
    parts.push(`subject:"${category.trim().replaceAll('"', '\\"')}"`);
  }
  if (lang && LANGS[lang]) parts.push(`language:${LANGS[lang]}`);

  const params = new URLSearchParams({
    q: parts.join(" ") || 'subject:"fiction"',
    fields: LIST_FIELDS,
    limit: String(limit),
    offset: String(offset),
  });
  if (orderBy === "newest") params.set("sort", "new");

  const data = await getJson(`${BASE}/search.json?${params}`, signal);
  return (Array.isArray(data.docs) ? data.docs : [])
    .map(toBook)
    .filter(Boolean);
}

async function getWork(id, signal) {
  let workId = String(id || "").trim().toUpperCase();

  for (let redirects = 0; redirects < 3; redirects += 1) {
    if (!/^OL\d+W$/.test(workId)) {
      throw new Error("Invalid Open Library work ID");
    }

    const work = await getJson(
      `${BASE}/works/${encodeURIComponent(workId)}.json`,
      signal,
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
  const authorKeys = (work.authors || [])
    .map((entry) => entry.author?.key)
    .filter((key) => typeof key === "string" && /^\/authors\/OL\d+A$/.test(key));

  const results = await Promise.all(
    authorKeys.map(async (key) => {
      try {
        const author = await getJson(`${BASE}${key}.json`, signal);
        return author.name;
      } catch (error) {
        if (error.name === "AbortError") throw error;
        console.warn(`Unable to load Open Library author ${key}:`, error);
        return null;
      }
    }),
  );

  return results.filter(Boolean);
}

async function getEditions(workId, signal) {
  try {
    const params = new URLSearchParams({ limit: "10" });
    const data = await getJson(
      `${BASE}/works/${encodeURIComponent(workId)}/editions.json?${params}`,
      signal,
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
  const workId = work.key?.split("/").pop() || String(id).toUpperCase();
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
  const description =
    typeof work.description === "string"
      ? work.description
      : work.description?.value;
  const coverId = work.covers?.[0] || edition?.covers?.[0];
  const cover = coverUrl(coverId, "L") || isbnCoverUrl(edition?.isbn_13?.[0] || edition?.isbn_10?.[0], "L");

  return {
    id: workId,
    volumeInfo: {
      title: work.title || "Untitled",
      subtitle: work.subtitle,
      authors,
      description,
      categories: work.subjects?.slice(0, 3),
      publishedDate: edition?.publish_date || work.first_publish_date,
      publisher: edition?.publishers?.[0],
      pageCount: edition?.number_of_pages,
      imageLinks: cover ? { thumbnail: cover } : undefined,
    },
  };
}
