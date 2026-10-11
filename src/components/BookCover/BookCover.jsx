import { useState } from "react";
import { Icon } from "@iconify/react";

export default function BookCover({ src, alt, title, className = "" }) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
        className={className}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex aspect-[2/3] flex-col items-center justify-center gap-3 bg-cream p-4 text-center text-burgundy ${className}`}
    >
      <Icon icon="lucide:book-open" className="h-8 w-8 text-gold-deep" />
      <span className="line-clamp-4 font-serif">{title}</span>
    </div>
  );
}
