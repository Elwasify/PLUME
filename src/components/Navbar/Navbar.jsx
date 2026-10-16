import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import Logo from "../Logo/Logo";
import { useShop } from "../../context/useShop";

const links = [
  { to: "/", label: "Home" },
  { to: "/discover", label: "Discover" },
  { to: "/categories", label: "Categories" },
  { to: "/journal", label: "Journal" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const { cartCount, wishlistCount } = useShop();

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
    <header className="relative z-40 bg-cream md:sticky md:top-0">
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-[10px] uppercase text-taupe md:px-10">
          <span>Librairie Parisienne — A literary world</span>
          <span className="hidden sm:block">
            Paris d’esprit · Made for readers
          </span>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6 md:h-[72px] md:px-10">
        <Logo className="shrink-0" />

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
            aria-label={`Wishlist, ${wishlistCount} items`}
            className="relative hover:text-burgundy"
          >
            <Icon icon="lucide:heart" className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-burgundy px-1 font-['Inter',sans-serif] text-[10px] text-cream">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            aria-label={`Cart, ${cartCount} items`}
            className="relative flex items-center gap-2 rounded-sm bg-burgundy px-3 py-2 text-cream"
          >
            <Icon icon="lucide:shopping-bag" className="h-4 w-4" />
            <span className="hidden text-xs sm:block">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 font-['Inter',sans-serif] text-[10px] text-ink">
                {cartCount}
              </span>
            )}
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

      <div className="px-6 pb-3 md:px-10 lg:hidden">
        <form
          role="search"
          onSubmit={onSearch}
          className="mx-auto flex max-w-7xl items-center border-b border-ink/30 focus-within:border-burgundy"
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
      </div>

      {open && (
        <div className="border-t border-line bg-cream px-6 py-6 md:hidden">
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
