import { Link, NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/discover", label: "Discover" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  return (
    <header className="border-b border-gold/40 bg-cream">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link
          to="/"
          className="font-serif text-2xl font-bold tracking-widest text-burgundy"
        >
          PLUME
        </Link>

        <ul className="hidden gap-8 md:flex">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  `text-sm uppercase tracking-wider transition hover:text-burgundy ${
                    isActive ? "text-burgundy" : "text-ink/70"
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex gap-5 text-sm">
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="hover:text-burgundy"
          >
            ♡
          </Link>
          <Link to="/cart" aria-label="Cart" className="hover:text-burgundy">
            Cart
          </Link>
        </div>
      </nav>
    </header>
  );
}
