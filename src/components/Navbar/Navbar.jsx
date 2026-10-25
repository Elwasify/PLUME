import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Icon } from "@iconify/react";
import Logo from "../Logo/Logo";
import SearchBox from "../SearchBox/SearchBox";
import { useShop } from "../../context/useShop";

const links = [
  { to: "/", label: "Home" },
  { to: "/discover", label: "Discover" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { cartCount, wishlistCount } = useShop();

  const linkClass = ({ isActive }) =>
    `text-xs uppercase tracking-[0.2em] transition ${
      isActive
        ? "text-burgundy underline decoration-gold underline-offset-8"
        : "text-muted hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-cream">
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-[10px] uppercase text-taupe md:px-10">
          <span>Librairie Plume — A literary world</span>
          <span className="hidden sm:block">Lire · Rêver · Voyager</span>
        </div>
      </div>

      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-6 md:h-20 md:px-10">
        <Logo className="-ml-2 shrink-0" imageClassName="h-12 w-32" />

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
          <SearchBox className="hidden w-56 lg:block" />

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
            aria-label={`Bag, ${cartCount} items`}
            className="relative flex items-center gap-2 rounded-sm bg-burgundy px-3 py-2 text-cream"
          >
            <Icon icon="lucide:shopping-bag" className="h-4 w-4" />
            <span className="hidden text-xs sm:block">Bag</span>
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
        <SearchBox
          className="mx-auto max-w-7xl"
          onDone={() => setOpen(false)}
        />
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