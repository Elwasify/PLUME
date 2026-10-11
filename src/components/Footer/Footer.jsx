import { Link } from "react-router-dom";

const navigate = [
  { to: "/", label: "Home" },
  { to: "/discover", label: "Discover" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
  { to: "/wishlist", label: "Wishlist" },
  { to: "/cart", label: "Bag" },
];

const categories = [
  "Fiction",
  "Romance",
  "Fantasy",
  "Mystery",
  "Science",
  "History",
  "Philosophy",
  "Business",
  "Technology",
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-secondary/40 text-ink">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.3fr_0.8fr_1fr] md:px-8">
        {/* البراند */}
        <div>
          <p className="font-serif text-3xl tracking-[0.2em]">PLUME</p>
          <p className="mt-3 font-serif text-lg italic text-gold">
            Every Story Begins with a Word.
          </p>
          <p className="mt-6 max-w-sm text-sm opacity-60">
            A portfolio project. Book data courtesy of Google Books. No real
            orders are processed.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-burgundy">
            Navigate
          </p>
          <ul className="mt-4 space-y-2 text-sm opacity-80">
            {navigate.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-burgundy">
            Discover
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm opacity-80">
            {categories.map((c) => (
              <li key={c}>
                <Link
                  to={`/discover?category=${c}`}
                  className="hover:text-gold"
                >
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-6 text-xs opacity-60 md:px-8">
          <span>© 2026 PLUME — a demonstration bookstore.</span>
          <span>Paris d’esprit · Fait avec soin</span>
        </div>
      </div>
    </footer>
  );
}
