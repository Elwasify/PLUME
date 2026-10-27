import MiniSearch from "minisearch";

let engine = null;
let byId = new Map();
let authorNames = [];

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "of",
  "and",
  "in",
  "on",
  "at",
  "to",
  "for",
  "by",
  "with",
  "or",
]);

const fuzzyByLength = (term) => (term.length <= 5 ? false : 0.2);

const prefixOnLastTerm = (term, index, terms) => index === terms.length - 1;

const fold = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/ø/g, "o")
    .replace(/đ/g, "d")
    .replace(/ß/g, "ss")
    .replace(/æ/g, "ae")
    .replace(/œ/g, "oe");

const authorKey = (name) =>
  fold(name)
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const cleanName = (name) => name.replace(/\s+/g, " ").trim();

function dedupeBooks(books) {
  const kept = [];
  const indexByKey = new Map();

  books.forEach((book) => {
    const info = book.volumeInfo || {};
    const title = authorKey(info.title || "");
    const author = authorKey((info.authors && info.authors[0]) || "");
    const key = `${title}|${author}`;

    if (!title) {
      kept.push(book);
      return;
    }

    const at = indexByKey.get(key);
    if (at === undefined) {
      indexByKey.set(key, kept.length);
      kept.push(book);
      return;
    }

    const currentHasCover = Boolean(kept[at].volumeInfo?.imageLinks);
    const nextHasCover = Boolean(info.imageLinks);
    if (!currentHasCover && nextHasCover) kept[at] = book;
  });

  return kept;
}

function matchScore(book, query, words) {
  const info = book?.volumeInfo || {};
  const title = authorKey(info.title || "");
  const authors = authorKey((info.authors || []).join(" "));
  const text = ` ${title} ${authors} `;
  const last = words.length - 1;

  let run = 0;
  for (let i = 0; i < words.length; i += 1) {
    for (let j = i; j < words.length; j += 1) {
      const needle = ` ${words.slice(i, j + 1).join(" ")}${j === last ? "" : " "}`;
      if (!text.includes(needle)) break;
      run = Math.max(run, j - i + 1);
    }
  }

  let ordered = 0;
  let from = 0;
  words.forEach((word, i) => {
    const needle = ` ${word}${i === last ? "" : " "}`;
    const index = text.indexOf(needle, from);
    if (index !== -1) {
      ordered += 1;
      from = index + word.length + 1;
    }
  });

  const starts = ` ${title}`.startsWith(` ${query}`) ? 1 : 0;

  return { starts, run, ordered };
}

export function buildEngine(allBooks) {
  const books = dedupeBooks(allBooks);

  const docs = books.map((b) => ({
    id: b.id,
    title: b.volumeInfo.title,
    author: (b.volumeInfo.authors || []).join(", "),
    category: b.category || "",
  }));

  byId = new Map(books.map((b) => [b.id, b]));

  const names = new Map();
  books.forEach((b) => {
    (b.volumeInfo.authors || []).forEach((n) => {
      if (!n) return;
      const key = authorKey(n);
      if (key && !names.has(key)) names.set(key, cleanName(n));
    });
  });
  authorNames = [...names.entries()].map(([key, name]) => ({ key, name }));

  engine = new MiniSearch({
    fields: ["title", "author", "category"],
    storeFields: ["category"],
    processTerm: (term) => fold(term),
    searchOptions: {
      boost: { title: 3, author: 2 },
      prefix: prefixOnLastTerm,
    },
  });
  engine.addAll(docs);
}

function findAll(text, normalized, words) {
  let all = engine.search(text, { fuzzy: false, combineWith: "AND" });
  if (all.length < 5) {
    all = engine.search(text, { fuzzy: fuzzyByLength, combineWith: "AND" });
  }

  if (all.length === 0) {
    const meaningful = words.filter((w) => !STOP_WORDS.has(w));
    if (meaningful.length > 0 && meaningful.length < words.length) {
      all = engine.search(meaningful.join(" "), {
        fuzzy: fuzzyByLength,
        combineWith: "AND",
      });
    }
  }

  if (all.length === 0 && words.length >= 3) {
    const needed = Math.ceil(words.length * 0.75);
    all = engine
      .search(text, { fuzzy: fuzzyByLength, combineWith: "OR" })
      .filter((h) => (h.queryTerms || h.terms || []).length >= needed);
  }

  if (words.length >= 2) {
    const phrase = all.filter(
      (h) => matchScore(byId.get(h.id), normalized, words).run === words.length,
    );
    if (phrase.length > 0) return { all, shown: phrase };
  }

  return { all, shown: all };
}

export function search(query, { category = "" } = {}) {
  const q = query.trim();
  if (!engine || q.length < 2) return { hits: [], facets: {} };

  const normalized = authorKey(q);
  const words = normalized.split(" ").filter(Boolean);

  const { shown } = findAll(q, normalized, words);

  const facets = shown.reduce((acc, h) => {
    if (h.category) acc[h.category] = (acc[h.category] || 0) + 1;
    return acc;
  }, {});

  const hits = shown
    .filter((h) => !category || h.category === category)
    .map((h) => {
      const book = byId.get(h.id);
      return {
        book: { ...book, terms: h.terms },
        score: matchScore(book, normalized, words),
      };
    })
    .sort(
      (a, b) =>
        b.score.starts - a.score.starts ||
        b.score.run - a.score.run ||
        b.score.ordered - a.score.ordered,
    )
    .map((item) => item.book);

  return { hits, facets };
}

export function searchAuthorsLocal(query, limit = 2) {
  const q = authorKey(query);
  if (!engine || q.length < 2) return [];
  const words = q.split(" ").filter(Boolean);
  return authorNames
    .filter(({ key }) => words.every((w) => key.includes(w)))
    .slice(0, limit)
    .map(({ name }) => name);
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
  const folded = fold(text);
  const list = engine.autoSuggest(text, { fuzzy: 0.25, prefix: false });
  const found = list.find((s) => s.suggestion !== folded);
  return found ? found.suggestion : "";
};
