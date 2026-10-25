import MiniSearch from "minisearch";

let engine = null;
let byId = new Map();
let authorNames = [];

const fuzzyByLength = (term) => (term.length <= 5 ? false : 0.2);

export function buildEngine(books) {
  const docs = books.map((b) => ({
    id: b.id,
    title: b.volumeInfo.title,
    author: (b.volumeInfo.authors || []).join(", "),
    category: b.category || "",
  }));

  byId = new Map(books.map((b) => [b.id, b]));

  const names = new Set();
  books.forEach((b) => {
    (b.volumeInfo.authors || []).forEach((n) => {
      if (n) names.add(n);
    });
  });
  authorNames = [...names];

  engine = new MiniSearch({
    fields: ["title", "author", "category"],
    storeFields: ["category"],
    searchOptions: {
      boost: { title: 3, author: 2 },
      prefix: true,
    },
  });
  engine.addAll(docs);
}

export function search(query, { category = "" } = {}) {
  const q = query.trim();
  if (!engine || q.length < 2) return { hits: [], facets: {} };

  let all = engine.search(q, { fuzzy: false });
  if (all.length < 5) {
    all = engine.search(q, { fuzzy: fuzzyByLength });
  }

  const facets = all.reduce((acc, h) => {
    if (h.category) acc[h.category] = (acc[h.category] || 0) + 1;
    return acc;
  }, {});

  const hits = all
    .filter((h) => !category || h.category === category)
    .map((h) => ({ ...byId.get(h.id), terms: h.terms }));

  return { hits, facets };
}

export function searchAuthorsLocal(query, limit = 2) {
  const q = query.trim().toLowerCase();
  if (!engine || q.length < 2) return [];
  const words = q.split(/\s+/).filter(Boolean);
  return authorNames
    .filter((name) => {
      const lower = name.toLowerCase();
      return words.every((w) => lower.includes(w));
    })
    .slice(0, limit);
}

export const suggest = (q) =>
  !engine || q.trim().length < 2
    ? []
    : engine
        .autoSuggest(q, { fuzzy: fuzzyByLength })
        .slice(0, 5)
        .map((s) => s.suggestion);

export const didYouMean = (q) => {
  const text = q.trim();
  if (!engine || text.length < 3) return "";
  const list = engine.autoSuggest(text, { fuzzy: 0.25, prefix: false });
  const found = list.find((s) => s.suggestion !== text.toLowerCase());
  return found ? found.suggestion : "";
};
