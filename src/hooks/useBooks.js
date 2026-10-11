import { useEffect, useState } from "react";

const KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY;

async function fetchOpenLibraryBooks(query, signal) {
  const params = new URLSearchParams({
    q: query,
    limit: "12",
    fields: "key,title,author_name,cover_i",
  });
  const response = await fetch(
    `https://openlibrary.org/search.json?${params}`,
    { signal },
  );

  if (!response.ok) throw new Error("Open Library request failed");

  const data = await response.json();
  return (data.docs || []).map((book) => ({
    id: book.key || book.title,
    volumeInfo: {
      title: book.title,
      authors: book.author_name || [],
      imageLinks: book.cover_i
        ? {
            thumbnail: `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`,
          }
        : undefined,
    },
  }));
}

export default function useBooks({ category, q } = {}) {
  const query = q || (category ? `subject:${category}` : "subject:fiction");

  const [result, setResult] = useState({
    query: null,
    books: [],
    error: false,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadBooks() {
      try {
        let books = [];

        try {
          const url =
            `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12` +
            (KEY ? `&key=${KEY}` : "");
          const response = await fetch(url, { signal: controller.signal });

          if (response.ok) {
            const data = await response.json();
            books = data.items || [];
          }
        } catch (err) {
          if (err.name === "AbortError") throw err;
        }

        if (books.length === 0) {
          books = await fetchOpenLibraryBooks(query, controller.signal);
        }

        setResult({ query, books, error: false });
      } catch (err) {
        if (err.name !== "AbortError") {
          setResult({ query, books: [], error: true });
        }
      }
    }

    loadBooks();

    return () => controller.abort();
  }, [query]);

  const loading = result.query !== query;

  return {
    books: loading ? [] : result.books,
    loading,
    error: !loading && result.error,
  };
}
