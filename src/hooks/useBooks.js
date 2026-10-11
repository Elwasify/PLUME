import { useEffect, useState } from "react";
import { searchBooks } from "../api/books";

export default function useBooks(options = {}) {
  const requestKey = JSON.stringify(options);
  const [result, setResult] = useState({
    requestKey: null,
    books: [],
    error: false,
  });

  useEffect(() => {
    const controller = new AbortController();

    searchBooks(JSON.parse(requestKey), controller.signal)
      .then((books) => setResult({ requestKey, books, error: false }))
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("searchBooks failed:", err);
          setResult({ requestKey, books: [], error: true });
        }
      });

    return () => controller.abort();
  }, [requestKey]);

  const loading = result.requestKey !== requestKey;

  return {
    books: loading ? [] : result.books,
    loading,
    error: !loading && result.error,
  };
}
