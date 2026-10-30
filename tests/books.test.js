import assert from "node:assert/strict";
import { test } from "node:test";
import { searchBooksPage } from "../src/api/books.js";

test("classifies API book subjects for discover category filters", async (t) => {
  const previousFetch = globalThis.fetch;
  let requestUrl;
  globalThis.fetch = async (url) => {
    requestUrl = new URL(url);
    return {
      ok: true,
      json: async () => ({
        numFound: 1,
        docs: [
          {
            key: "/works/OL123456W",
            title: "A Science Fiction Story",
            author_name: ["A. Writer"],
            subject: ["Fiction", "Science fiction"],
            language: ["eng"],
          },
        ],
      }),
    };
  };
  t.after(() => {
    globalThis.fetch = previousFetch;
  });

  const result = await searchBooksPage({
    q: "api category classification test",
    category: "Science fiction",
    orderBy: "newest",
    limit: 20,
  });

  assert.equal(requestUrl.searchParams.get("q"), 'api category classification test subject:"Science fiction"');
  assert.equal(requestUrl.searchParams.get("sort"), "new");
  assert.equal(result.books[0].category, "Science fiction");
});

test("maps API subjects to the storefront category labels", async (t) => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      numFound: 1,
      docs: [
        {
          key: "/works/OL654321W",
          title: "A Book of History",
          subject: ["History", "Biography"],
        },
      ],
    }),
  });
  t.after(() => {
    globalThis.fetch = previousFetch;
  });

  const result = await searchBooksPage({
    q: "api subject category mapping test",
    limit: 20,
  });

  assert.equal(result.books[0].category, "Biography");
});
