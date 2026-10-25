import { useEffect, useState } from "react";
import { loadCatalog } from "../api/catalog";
import { buildEngine } from "../utils/engine";

let promise = null;
let isReady = false;

function init() {
  if (!promise) {
    promise = loadCatalog()
      .then((books) => {
        buildEngine(books);
        isReady = true;
      })
      .catch((err) => {
        promise = null;
        throw err;
      });
  }
  return promise;
}

export default function useCatalog() {
  const [state, setState] = useState({ ready: isReady, error: false });

  useEffect(() => {
    if (isReady) return;
    let alive = true;
    init()
      .then(() => alive && setState({ ready: true, error: false }))
      .catch(() => alive && setState({ ready: false, error: true }));
    return () => {
      alive = false;
    };
  }, []);

  return state;
}