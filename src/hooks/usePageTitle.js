import { useEffect } from "react";

const DEFAULT_TITLE = "PLUME — Every Story Begins with a Word";

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — PLUME` : DEFAULT_TITLE;
  }, [title]);
}
