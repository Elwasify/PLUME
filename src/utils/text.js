const LATIN_SCRIPT_RE = /^\p{Script=Latin}$/u;

export function isLatinText(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  const letters = value.match(/\p{L}/gu) || [];
  return (
    letters.length > 0 &&
    letters.every((letter) => LATIN_SCRIPT_RE.test(letter))
  );
}

export function latinNames(values) {
  const seen = new Set();
  return values.filter((value) => {
    if (typeof value !== "string" || !isLatinText(value)) return false;
    const normalized = value
      .normalize("NFKD")
      .replace(/\p{M}/gu, "")
      .toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}
