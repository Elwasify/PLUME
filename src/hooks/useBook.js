import { useEffect, useState } from "react";
import { getBook } from "../api/books";

export default function useBook(id) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({
    id: null,
    attempt: -1,
    book: null,
    error: false,
  });

  useEffect(() => {
    const controller = new AbortController();

    getBook(id, controller.signal)
      .then((book) => setResult({ id, attempt, book, error: false }))
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("getBook failed:", err);
          setResult({ id, attempt, book: null, error: true });
        }
      });

    return () => controller.abort();
  }, [id, attempt]);

  const loading = result.id !== id || result.attempt !== attempt;

  return {
    book: loading ? null : result.book,
    loading,
    error: !loading && result.error,
    retry: () => setAttempt((current) => current + 1),
  };
}
