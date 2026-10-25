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
];

const FIELDS = "key,title,author_name,cover_i,first_publish_year";
const PAGES_PER_CATEGORY = 5;
const PER_AUTHOR = 20;
const DELAY = 350;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const cap = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

const okTitle = (s) =>
  /^[\x20-\x7E\u2018\u2019\u201C\u201D\u2013\u2014]+$/.test(s);
const okAuthor = (s) => /^[\x20-\x7E\u00C0-\u024F\u2018\u2019]*$/.test(s);

const toBook = (d, category) => ({
  id: d.key.replace("/works/", ""),
  title: d.title.trim(),
  author: d.author_name?.[0] ?? "",
  year: d.first_publish_year ?? null,
  cover: d.cover_i,
  category,
});

const usable = (d) =>
  d.cover_i &&
  d.title &&
  d.key?.startsWith("/works/") &&
  okTitle(d.title.trim()) &&
  okAuthor(d.author_name?.[0] ?? "");

async function getDocs(params) {
  for (let attempt = 0; attempt < 3; attempt++) {
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
    await sleep(1500 * (attempt + 1));
  }
  return [];
}

const books = [];
const seen = new Set();

function add(list) {
  let added = 0;
  for (const b of list) {
    if (seen.has(b.id)) continue;
    seen.add(b.id);
    books.push(b);
    added++;
  }
  return added;
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
    total += add(docs.filter(usable).map((d) => toBook(d, cap(category))));
    await sleep(DELAY);
  }
  console.log(`${cap(category)}: ${total} books`);
}

let authorTotal = 0;
for (const name of FEATURED_AUTHORS) {
  const docs = await getDocs({
    q: `author:"${name}" language:eng`,
    fields: FIELDS,
    sort: "editions",
    limit: "60",
  });
  const last = name.split(" ").pop().toLowerCase();
  const list = docs
    .filter(usable)
    .filter((d) => (d.author_name?.[0] ?? "").toLowerCase().includes(last))
    .slice(0, PER_AUTHOR)
    .map((d) => toBook(d, "Classics"));
  const added = add(list);
  authorTotal += added;
  console.log(`${name}: ${added} books`);
  await sleep(DELAY);
}

await mkdir("public", { recursive: true });
await writeFile("public/catalog.json", JSON.stringify(books));
console.log(
  `Saved ${books.length} books (${authorTotal} from featured authors)`,
);
