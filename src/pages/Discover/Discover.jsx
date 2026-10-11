import { useSearchParams } from "react-router-dom";
import useBooks from "../../hooks/useBooks";
import BookCard from "../../components/BookCard/BookCard";

export default function Discover() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const q = searchParams.get("q") || "";

  const { books, loading, error } = useBooks({ category, q });

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-serif text-4xl text-burgundy">
        {category || q || "Discover"}
      </h1>

      {loading && (
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] animate-pulse bg-gold/20" />
          ))}
        </div>
      )}

      {error && (
        <p className="mt-10 text-burgundy">
          Something went wrong while loading books. Please try again later.
        </p>
      )}

      {!loading && !error && books.length === 0 && (
        <p className="mt-10 text-ink/70">No books found.</p>
      )}

      {!loading && !error && books.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </section>
  );
}
