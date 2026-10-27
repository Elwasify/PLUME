const CACHE_TTL = 5 * 60 * 1000;
const CACHE_LIMIT = 160;
const TIMEOUT = 12000;
const responseCache = new Map();
const inflight = new Map();

class HttpError extends Error {}

function abortError() {
  return new DOMException("The request was aborted", "AbortError");
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function raceAbort(promise, signal) {
  if (!signal) return promise;
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(abortError());
    if (signal.aborted) onAbort();
    else signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
}

function readCache(url) {
  const entry = responseCache.get(url);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    responseCache.delete(url);
    return null;
  }
  responseCache.delete(url);
  responseCache.set(url, entry);
  return entry.value;
}

function writeCache(url, value, ttl) {
  if (ttl <= 0) return;
  responseCache.delete(url);
  responseCache.set(url, { value, expiresAt: Date.now() + ttl });
  while (responseCache.size > CACHE_LIMIT) {
    responseCache.delete(responseCache.keys().next().value);
  }
}

function retryDelay(response, attempt) {
  const header = response.headers.get("Retry-After");
  const retryAfter = Number(header);
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return Math.min(retryAfter * 1000, 3000);
  }
  const retryAt = Date.parse(header || "");
  if (Number.isFinite(retryAt)) {
    return Math.min(Math.max(0, retryAt - Date.now()), 3000);
  }
  return 500 * (attempt + 1);
}

async function load(url, ttl) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    let delay = 500 * (attempt + 1);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (response.ok) {
        const data = await response.json();
        writeCache(url, data, ttl);
        return data;
      }

      if (![429, 503].includes(response.status) || attempt === 2) {
        throw new HttpError(
          `Request failed (${response.status} ${response.statusText})`,
        );
      }

      delay = retryDelay(response, attempt);
    } catch (error) {
      if (error instanceof HttpError) throw error;
      if (attempt === 2) {
        throw controller.signal.aborted
          ? new Error("Request timed out")
          : error;
      }
    } finally {
      clearTimeout(timer);
    }

    await wait(delay);
  }

  throw new Error("Request failed after multiple attempts");
}

export function requestJson(url, { signal, ttl = CACHE_TTL } = {}) {
  const cached = readCache(url);
  if (cached !== null) return Promise.resolve(cached);

  let pending = inflight.get(url);
  if (!pending) {
    pending = load(url, ttl).finally(() => inflight.delete(url));
    inflight.set(url, pending);
  }

  return raceAbort(pending, signal);
}
