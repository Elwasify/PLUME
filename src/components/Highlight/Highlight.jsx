import React from "react";

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default function Highlight({ text, terms }) {
  const value = text == null ? "" : String(text);
  const list = (terms || [])
    .map((t) => String(t).trim())
    .filter((t) => t.length > 0)
    .sort((a, b) => b.length - a.length);

  if (list.length === 0 || value === "") return <>{value}</>;

  const pattern = new RegExp(
    "(" + list.map(escapeRegExp).join("|") + ")",
    "gi",
  );
  const parts = value.split(pattern);

  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            className="rounded-sm bg-yellow-200 px-0.5 text-inherit"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}
