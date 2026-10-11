import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

const links = [
  { to: "/", label: "Home" },
  { to: "/discover", label: "Discover" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();

  const onSearch = (e) => {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    navigate(`/discover?q=${encodeURIComponent(q)}`);
    setTerm("");
    setOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `text-xs uppercase tracking-[0.2em] transition ${
      isActive
        ? "text-burgundy underline decoration-gold underline-offset-8"
        : "text-muted hover:text-ink"
    }`;

  return (
    <header className="relative z-40 bg-cream">
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-[10px] uppercase text-taupe md:px-10">
          <span>Librairie Parisienne — A literary world</span>
          <span className="hidden sm:block">
            Paris d’esprit · Made for readers
          </span>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6 md:h-[72px] md:px-10">
        <Link
          to="/"
          className="flex items-center gap-2"
          aria-label="PLUME home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-burgundy text-cream">
            <Icon icon="lucide:feather" className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-serif text-2xl font-semibold">
              PLUME
            </span>
            <span className="block font-serif text-[10px] italic text-taupe">
              Every Story Begins with a Word
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={linkClass}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <form
            role="search"
            onSubmit={onSearch}
            className="hidden w-56 items-center border-b border-ink/30 focus-within:border-burgundy lg:flex"
          >
            <Icon icon="lucide:search" className="h-4 w-4 text-muted" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Title, author, subject…"
              aria-label="Search books"
              className="w-full bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted"
            />
          </form>

          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="hover:text-burgundy"
          >
            <Icon icon="lucide:heart" className="h-5 w-5" />
          </Link>

          <Link
            to="/cart"
            aria-label="Cart"
            className="flex items-center gap-2 rounded-sm bg-burgundy px-3 py-2 text-cream"
          >
            <Icon icon="lucide:shopping-bag" className="h-4 w-4" />
            <span className="hidden text-xs sm:block">Cart</span>
          </Link>

          <button
            className="md:hidden"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <Icon
              icon={open ? "lucide:x" : "lucide:menu"}
              className="h-5 w-5"
            />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-cream px-6 py-6 md:hidden">
          <form
            onSubmit={onSearch}
            className="mb-6 flex items-center border-b border-ink/30"
          >
            <Icon icon="lucide:search" className="h-4 w-4 text-muted" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Title, author, subject…"
              aria-label="Search books"
              className="w-full bg-transparent px-2 py-2 text-sm outline-none"
            />
          </form>
          <nav className="flex flex-col gap-5">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
