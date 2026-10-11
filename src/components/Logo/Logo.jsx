import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";

export default function Logo({ className = "", light = false }) {
  return (
    <Link to="/" className={`group flex items-center gap-3 ${className}`}>
      <Icon
        icon="lucide:feather"
        className={`h-6 w-6 transition group-hover:-rotate-12 ${
          light ? "text-gold" : "text-burgundy"
        }`}
      />
      <span
        className={`font-serif text-2xl font-medium uppercase leading-none tracking-[0.35em] ${
          light ? "text-cream" : "text-ink"
        }`}
      >
        Plume
      </span>
    </Link>
  );
}
