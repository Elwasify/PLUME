const CACHE_TTL = 5 * 60 * 1000;
const CACHE_LIMIT = 160;
const responseCache = new Map();

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("The request was aborted", "AbortError"));
      return;
    }

    const timeout = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve();
    }, ms);

    function abort() {
      clearTimeout(timeout);
      reject(new DOMException("The request was aborted", "AbortError"));
    }

    signal?.addEventListener("abort", abort, { once: true });
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
  const retryAfter = Number(response.headers.get("Retry-After"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return Math.min(retryAfter * 1000, 3000);
  }
  return 500 * (attempt + 1);
}

export async function requestJson(url, { signal, ttl = CACHE_TTL } = {}) {
  const cached = readCache(url);
  if (cached !== null) return cached;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { signal });
      if (response.ok) {
        const data = await response.json();
        writeCache(url, data, ttl);
        return data;
      }

      if (![429, 503].includes(response.status) || attempt === 2) {
        throw new Error(`Request failed (${response.status} ${response.statusText})`);
      }

      await wait(retryDelay(response, attempt), signal);
    } catch (error) {
      if (error.name === "AbortError" || attempt === 2) throw error;
      if (error.message.startsWith("Request failed (")) throw error;
      await wait(500 * (attempt + 1), signal);
    }
  }

  throw new Error("Request failed after multiple attempts");
}
