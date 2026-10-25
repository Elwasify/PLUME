import { mkdir, writeFile } from "node:fs/promises";

const CATEGORIES = [
  "fantasy",
  "mystery",
  "romance",
  "science fiction",
  "history",
  "biography",
];
const FIELDS = "key,title,author_name,cover_i,first_publish_year";

const cap = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

const okTitle = (s) =>
  /^[\x20-\x7E\u2018\u2019\u201C\u201D\u2013\u2014]+$/.test(s);
const okAuthor = (s) => /^[\x20-\x7E\u00C0-\u024F\u2018\u2019]*$/.test(s);

async function fetchCategory(category) {
  const params = new URLSearchParams({
    q: `subject:"${category}" language:eng`,
    fields: FIELDS,
    limit: "100",
  });
  const res = await fetch(`https://openlibrary.org/search.json?${params}`);
  if (!res.ok) throw new Error(`${category}: ${res.status}`);
  const { docs } = await res.json();
  return docs
    .filter((d) => d.cover_i && d.title && d.key?.startsWith("/works/"))
    .filter(
      (d) => okTitle(d.title.trim()) && okAuthor(d.author_name?.[0] ?? ""),
    )
    .map((d) => ({
      id: d.key.replace("/works/", ""),
      title: d.title.trim(),
      author: d.author_name?.[0] ?? "",
      year: d.first_publish_year ?? null,
      cover: d.cover_i,
      category: cap(category),
    }));
}

const all = (await Promise.all(CATEGORIES.map(fetchCategory))).flat();
const seen = new Set();
const books = all.filter((b) => !seen.has(b.id) && seen.add(b.id));

await mkdir("public", { recursive: true });
await writeFile("public/catalog.json", JSON.stringify(books));
console.log(`Saved ${books.length} books`);
