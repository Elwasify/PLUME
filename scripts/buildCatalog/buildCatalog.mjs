import { mkdir, writeFile } from "node:fs/promises";

const CATEGORIES = [
  "fantasy",
  "mystery",
  "romance",
  "science fiction",
  "history",
  "biography",
];

const FEATURED_AUTHORS = [
  "Franz Kafka",
  "J. R. R. Tolkien",
  "George Orwell",
  "Jane Austen",
  "Charles Dickens",
  "Fyodor Dostoevsky",
  "Leo Tolstoy",
  "Mark Twain",
  "Ernest Hemingway",
  "F. Scott Fitzgerald",
  "Virginia Woolf",
  "Oscar Wilde",
  "Agatha Christie",
  "Stephen King",
  "J. K. Rowling",
  "Gabriel García Márquez",
  "Haruki Murakami",
  "Albert Camus",
  "Victor Hugo",
  "Edgar Allan Poe",
  "Arthur Conan Doyle",
  "William Shakespeare",
  "Mary Shelley",
  "Bram Stoker",
  "Jules Verne",
  "H. G. Wells",
  "Aldous Huxley",
  "Emily Brontë",
  "Charlotte Brontë",
  "Herman Melville",
  "George R. R. Martin",
  "Neil Gaiman",
  "Terry Pratchett",
  "Isaac Asimov",
  "Ray Bradbury",
  "Philip K. Dick",
  "Frank Herbert",
  "Dan Brown",
  "Paulo Coelho",
  "Khaled Hosseini",
  "Naguib Mahfouz",
  "Milan Kundera",
  "Jorge Luis Borges",
  "Umberto Eco",
  "Margaret Atwood",
  "Toni Morrison",
  "John Steinbeck",
  "William Faulkner",
  "J. D. Salinger",
  "Harper Lee",
  "Kurt Vonnegut",
  "Douglas Adams",
  "C. S. Lewis",
  "Roald Dahl",
  "Suzanne Collins",
  "Rick Riordan",
  "Brandon Sanderson",
  "Robert Louis Stevenson",
  "Alexandre Dumas",
  "Thomas Hardy",
  "Miguel de Cervantes",
  "Jenny Han",
];

const ALIASES = {
  "Fyodor Dostoevsky": ["Fyodor Dostoevsky", "Fyodor Dostoyevsky"],
  "Leo Tolstoy": ["Leo Tolstoy", "Lev Tolstoy", "Leo Tolstoi"],
  "Naguib Mahfouz": ["Naguib Mahfouz", "Naguib Mahfuz"],
  "J. R. R. Tolkien": ["J. R. R. Tolkien", "J.R.R. Tolkien"],
};

const MATCH = {
  "Fyodor Dostoevsky": "dostoy",
  "Leo Tolstoy": "tolsto",
  "Naguib Mahfouz": "mahf",
  "Emily Brontë": "bront",
  "Charlotte Brontë": "bront",
};

const FIELDS = "key,title,author_name,cover_i,first_publish_year,edition_count";
const PAGES_PER_CATEGORY = 5;
const PER_AUTHOR = 30;
const DELAY = 400;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const cap = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

const plain = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const okTitle = (s) =>
  /^[\x20-\x7E\u2018\u2019\u201C\u201D\u2013\u2014]+$/.test(s);
const okAuthor = (s) => /^[\x20-\x7E\u00C0-\u024F\u2018\u2019]*$/.test(s);

const toBook = (d, category, author) => ({
  id: d.key.replace("/works/", ""),
  title: d.title.trim(),
  author: author ?? d.author_name?.[0] ?? "",
  year: d.first_publish_year ?? null,
  cover: d.cover_i ?? null,
  category,
});

const usable = (d) =>
  d.cover_i &&
  d.title &&
  d.key?.startsWith("/works/") &&
  okTitle(d.title.trim()) &&
  okAuthor(d.author_name?.[0] ?? "");

const usableFeatured = (d) => d.title && d.key?.startsWith("/works/");

async function getDocs(params) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?${new URLSearchParams(params)}`,
      );
      if (res.ok) {
        const { docs } = await res.json();
        return docs;
      }
    } catch {
      await sleep(1000);
    }
    await sleep(2000 * (attempt + 1));
  }
  return null;
}

const books = [];
const byId = new Map();

function add(list) {
  let added = 0;
  for (const b of list) {
    if (byId.has(b.id)) continue;
    byId.set(b.id, b);
    books.push(b);
    added++;
  }
  return added;
}

function addFeatured(list) {
  let added = 0;
  let reused = 0;
  for (const b of list) {
    const existing = byId.get(b.id);
    if (existing) {
      existing.category = "Classics";
      existing.author = b.author;
      reused++;
      continue;
    }
    byId.set(b.id, b);
    books.push(b);
    added++;
  }
  return { added, reused };
}

for (const category of CATEGORIES) {
  let total = 0;
  for (let page = 1; page <= PAGES_PER_CATEGORY; page++) {
    const docs = await getDocs({
      q: `subject:"${category}" language:eng`,
      fields: FIELDS,
      limit: "100",
      page: String(page),
    });
    total += add(
      (docs ?? []).filter(usable).map((d) => toBook(d, cap(category))),
    );
    await sleep(DELAY);
  }
  console.log(`${cap(category)}: ${total} books`);
}

let authorTotal = 0;
for (const name of FEATURED_AUTHORS) {
  const names = ALIASES[name] ?? [name];
  const match = MATCH[name] ?? plain(name.split(" ").pop());
  const matches = (n) => plain(n).includes(match);
  let docs = [];
  let failed = 0;
  for (const alias of names) {
    const found = await getDocs({
      q: `author:"${alias}"`,
      fields: FIELDS,
      limit: "100",
    });
    if (found === null) failed++;
    docs = docs.concat(found ?? []);
    await sleep(DELAY);
  }
  const list = docs
    .filter(usableFeatured)
    .filter((d) => (d.author_name ?? []).some(matches))
    .sort((a, b) => (b.edition_count ?? 0) - (a.edition_count ?? 0))
    .slice(0, PER_AUTHOR)
    .map((d) => {
      const latin = (d.author_name ?? []).find(
        (n) => matches(n) && okAuthor(n),
      );
      return toBook(d, "Classics", latin ?? name);
    });
  const { added, reused } = addFeatured(list);
  authorTotal += added + reused;
  const note = failed ? ` (${failed} request failed)` : "";
  console.log(
    `${name}: ${added} new, ${reused} moved from other categories${note}`,
  );
}

await mkdir("public", { recursive: true });
await writeFile("public/catalog.json", JSON.stringify(books));
console.log(
  `Saved ${books.length} books (${authorTotal} from featured authors)`,
);