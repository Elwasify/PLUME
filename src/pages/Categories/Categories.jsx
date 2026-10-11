import { Link } from "react-router-dom";

const categories = [
  "Fiction",
  "Fantasy",
  "Mystery",
  "Romance",
  "Science fiction",
  "History",
  "Poetry",
  "Philosophy",
];

export default function Categories() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">
        Find your next read
      </p>
      <h1 className="mt-3 font-serif text-4xl text-burgundy">Categories</h1>
      <p className="mt-4 max-w-xl text-muted">
        Explore books by subject. Choose a category to load matching titles.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category}
            to={`/discover?category=${encodeURIComponent(category)}`}
            className="border border-gold/40 bg-white/30 p-6 font-serif text-xl text-burgundy transition hover:border-burgundy hover:bg-white/60"
          >
            {category}
          </Link>
        ))}
      </div>
    </section>
  );
}
