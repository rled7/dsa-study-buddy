// ─── System-design deep dives ──────────────────────────────────────────────
// A handful of glossary terms (see ./architecture.ts) are dense enough to
// deserve more than a one-line definition: multiple named strategies, each
// with a runnable-shaped code snippet and an ASCII diagram of the request
// flow. A Concept opts into this by setting `deepDiveId` to the matching
// DeepDive's `id`; the term then links to `#/concepts/:id` instead of
// rendering as plain text. Add a new deep dive by pushing to DEEP_DIVES and
// pointing one or more Concepts at its id.

export interface DeepDiveStrategy {
  name: string;
  description: string;
  code: string;
  /** ASCII diagram of the strategy's request/data flow. */
  diagram: string;
}

export interface DeepDive {
  id: string;
  title: string;
  intro: string;
  strategies: DeepDiveStrategy[];
}

export const DEEP_DIVES: DeepDive[] = [
  {
    id: "caching",
    title: "Caching Strategies",
    intro:
      "Caching isn't one technique — it's a family of strategies that answer three separate questions: " +
      "when does the app talk to the cache vs. the source of truth, when does a stale entry get thrown " +
      "out, and where does the cache physically live. Most real systems combine several of these at once " +
      "(e.g. cache-aside + TTL + LRU eviction, or CDN + browser caching for static assets).",
    strategies: [
      {
        name: "Cache-Aside (Lazy Loading)",
        description:
          "The app checks the cache first. On a miss, it reads from the database itself and writes the " +
          "result into the cache before returning. The most common pattern — simple, and the cache only " +
          "ever holds data that was actually requested.",
        diagram:
          "  Request\n" +
          "     |\n" +
          "     v\n" +
          " +--------+   hit    +--------+\n" +
          " | Cache  |--------->| Return |\n" +
          " +--------+          +--------+\n" +
          "     | miss\n" +
          "     v\n" +
          " +--------+ populate +--------+\n" +
          " |   DB   |--------->| Cache  |---> Return\n" +
          " +--------+          +--------+",
        code:
          "async function getUser(id) {\n" +
          "  let user = await cache.get(`user:${id}`);\n" +
          "  if (user) return user;                 // cache hit\n" +
          "\n" +
          "  user = await db.query('SELECT * FROM users WHERE id = ?', [id]);\n" +
          "  await cache.set(`user:${id}`, user, { ttl: 300 });\n" +
          "  return user;                           // cache miss, now populated\n" +
          "}",
      },
      {
        name: "Read-Through",
        description:
          "Same idea as cache-aside, but the cache library itself owns the miss-fill logic via a " +
          "configured loader function. App code only ever talks to the cache — it never touches the " +
          "database directly for reads.",
        diagram:
          "  Request\n" +
          "     |\n" +
          "     v\n" +
          " +----------------------+\n" +
          " |        Cache          |\n" +
          " |  hit  -----------------> Return\n" +
          " |  miss -> loader(key) -> DB\n" +
          " |          stores + returns\n" +
          " +----------------------+",
        code:
          "const cache = new ReadThroughCache({\n" +
          "  loader: (id) => db.query('SELECT * FROM users WHERE id = ?', [id]),\n" +
          "  ttl: 300,\n" +
          "});\n" +
          "\n" +
          "const user = await cache.get(`user:${id}`); // cache handles the miss internally",
      },
      {
        name: "Write-Through",
        description:
          "Every write goes to the cache and the database in the same synchronous operation, and isn't " +
          "acknowledged until both succeed. The cache is always consistent with the DB, at the cost of " +
          "extra write latency.",
        diagram:
          "  Write(key, val)\n" +
          "       |\n" +
          "       v\n" +
          "  +--------+   sync   +--------+\n" +
          "  | Cache  |--------->|   DB   |\n" +
          "  +--------+          +--------+\n" +
          "       |                   |\n" +
          "       +--------+----------+\n" +
          "                v\n" +
          "     Write acknowledged\n" +
          "   (only after BOTH succeed)",
        code:
          "async function updateUser(id, data) {\n" +
          "  await db.update('users', id, data);   // 1. write DB\n" +
          "  await cache.set(`user:${id}`, data);  // 2. write cache\n" +
          "  // caller waits for both -- cache and DB never disagree\n" +
          "}",
      },
      {
        name: "Write-Behind (Write-Back)",
        description:
          "The write lands in the cache and is acknowledged immediately; the cache asynchronously " +
          "flushes it to the DB later, often batched. Much faster writes, but a crash before the flush " +
          "can lose data — used when throughput matters more than durability.",
        diagram:
          "  Write(key, val)\n" +
          "       |\n" +
          "       v\n" +
          "  +--------+  ack immediately\n" +
          "  | Cache  |------------------> caller continues\n" +
          "  +---+----+\n" +
          "      | async, batched, delayed\n" +
          "      v\n" +
          "  +--------+\n" +
          "  |   DB   |  flushed later\n" +
          "  +--------+",
        code:
          "async function updateUser(id, data) {\n" +
          "  await cache.set(`user:${id}`, data);  // instant ack\n" +
          "  writeQueue.push({ id, data });         // flushed by a background worker\n" +
          "}\n" +
          "\n" +
          "// background worker, runs every few seconds\n" +
          "setInterval(() => flushQueueToDb(writeQueue), 5000);",
      },
      {
        name: "Write-Around",
        description:
          "Writes go straight to the database, bypassing the cache entirely. The cache only gets " +
          "populated later, on a normal cache-aside read. Keeps the cache from filling up with data " +
          "that's written once and rarely re-read (e.g. audit logs).",
        diagram:
          "  Write(key, val)\n" +
          "       |\n" +
          "       v\n" +
          "  +--------+\n" +
          "  |   DB   |   (cache untouched)\n" +
          "  +--------+\n" +
          "\n" +
          "  ...later...\n" +
          "  Read(key) -> Cache MISS -> DB -> populate cache -> Return",
        code:
          "async function logEvent(event) {\n" +
          "  await db.insert('events', event);   // cache never touched on write\n" +
          "}\n" +
          "\n" +
          "async function getEvent(id) {\n" +
          "  // standard cache-aside read path picks it up on first access\n" +
          "  return getUser(id);\n" +
          "}",
      },
      {
        name: "TTL / Time-Based Expiration",
        description:
          "Every cached entry gets a max lifetime. Once it expires it's treated as a miss and reloaded " +
          "on next access — bounds staleness without needing explicit invalidation logic. Usually " +
          "layered on top of one of the strategies above.",
        diagram:
          "  t=0        entry cached, ttl=300s\n" +
          "  t=299      still served from cache\n" +
          "  t=300  --> entry expires (deleted or marked stale)\n" +
          "  t=301      next request = miss, reload from source",
        code:
          "await cache.set(`user:${id}`, user, { ttl: 300 }); // seconds\n" +
          "\n" +
          "// most cache libraries auto-evict on read once past ttl:\n" +
          "const cached = await cache.get(`user:${id}`); // null if expired",
      },
      {
        name: "Eviction Policy — LRU (Least Recently Used)",
        description:
          "When the cache hits its size limit, something has to go. LRU evicts whichever entry hasn't " +
          "been accessed the longest — a cheap, usually-good default. (Variants: LFU evicts the least " +
          "frequently used entry, FIFO evicts the oldest-inserted regardless of use, MRU evicts the " +
          "most-recently-used, useful for cyclic scan patterns.) This is the exact concept the " +
          "'LRU Cache' problem in this app's System Design track codes by hand.",
        diagram:
          "  Capacity = 3        MRU ---------------- LRU\n" +
          "  access A         [ A ]\n" +
          "  access B         [ B, A ]\n" +
          "  access C         [ C, B, A ]\n" +
          "  access A         [ A, C, B ]   (A moves to front)\n" +
          "  access D         [ D, A, C ]   (B evicted -- least recently used)",
        code:
          "class LRUCache {\n" +
          "  constructor(capacity) { this.capacity = capacity; this.map = new Map(); }\n" +
          "  get(key) {\n" +
          "    if (!this.map.has(key)) return undefined;\n" +
          "    const val = this.map.get(key);\n" +
          "    this.map.delete(key); this.map.set(key, val); // move to 'most recent'\n" +
          "    return val;\n" +
          "  }\n" +
          "  set(key, val) {\n" +
          "    if (this.map.has(key)) this.map.delete(key);\n" +
          "    else if (this.map.size >= this.capacity) this.map.delete(this.map.keys().next().value);\n" +
          "    this.map.set(key, val);\n" +
          "  }\n" +
          "}",
      },
      {
        name: "CDN / Edge Caching",
        description:
          "Static (or semi-static) responses are cached at points of presence geographically close to " +
          "users, not just at the origin. Requests hit the nearest edge node first; only a miss travels " +
          "all the way back to the origin server.",
        diagram:
          "  User (Tokyo)              User (London)\n" +
          "      |                          |\n" +
          "      v                          v\n" +
          "  Edge POP (Tokyo)          Edge POP (London)\n" +
          "   hit -> return             hit -> return\n" +
          "   miss |                    miss |\n" +
          "        +----------+--------------+\n" +
          "                   v\n" +
          "             Origin Server\n" +
          "           (single source of truth)",
        code:
          "// response header from the origin -- tells the CDN how long to cache\n" +
          "Cache-Control: public, max-age=3600, s-maxage=86400\n" +
          "// max-age  = browser cache lifetime\n" +
          "// s-maxage = shared/CDN cache lifetime (overrides max-age for edge nodes)",
      },
      {
        name: "Distributed Caching (Redis / Memcached)",
        description:
          "A cache shared across every app server instance, instead of an in-process cache local to one " +
          "server. Needed once you scale horizontally — otherwise each server keeps its own copy, which " +
          "duplicates memory and goes stale independently of the others.",
        diagram:
          "  App Server 1 --+\n" +
          "  App Server 2 --+--> Shared Redis Cluster --> DB\n" +
          "  App Server 3 --+     (one cache, every server sees the same entries)",
        code:
          "const redis = new Redis({ host: 'cache.internal', port: 6379 });\n" +
          "\n" +
          "async function getUser(id) {\n" +
          "  const cached = await redis.get(`user:${id}`);\n" +
          "  if (cached) return JSON.parse(cached);\n" +
          "  const user = await db.query('SELECT * FROM users WHERE id = ?', [id]);\n" +
          "  await redis.set(`user:${id}`, JSON.stringify(user), 'EX', 300);\n" +
          "  return user;\n" +
          "}",
      },
      {
        name: "Browser / HTTP Caching",
        description:
          "The browser caches responses per HTTP headers, skipping the network entirely on a fresh hit, " +
          "or doing a cheap 304 round-trip on a revalidation. Cache-Control governs freshness; " +
          "ETag / If-None-Match governs revalidation once an entry goes stale.",
        diagram:
          "  Request -> Browser cache\n" +
          "    fresh (within max-age)  -> serve from disk/memory, 0 network calls\n" +
          "    stale, has ETag         -> GET + If-None-Match: \"abc123\"\n" +
          "                                304 Not Modified -> serve cached body\n" +
          "                                200 OK           -> new body, re-cache",
        code:
          "// server response headers\n" +
          "Cache-Control: max-age=600\n" +
          "ETag: \"abc123\"\n" +
          "\n" +
          "// browser's follow-up request once stale\n" +
          "GET /data.json\n" +
          "If-None-Match: \"abc123\"\n" +
          "// server replies 304 Not Modified (no body) if the ETag still matches",
      },
      {
        name: "Cache Invalidation (on write)",
        description:
          "Instead of waiting for a TTL to expire a now-stale entry, explicitly delete (or overwrite) it " +
          "the moment the underlying data changes. Guarantees the next read is fresh instead of serving " +
          "stale data for up to a full TTL window.",
        diagram:
          "  Write(key, val)\n" +
          "       |\n" +
          "       v\n" +
          "  +--------+        +-------------------+\n" +
          "  |   DB   |------->| del cache[key]      |  (or overwrite with new val)\n" +
          "  +--------+        +-------------------+\n" +
          "       |\n" +
          "       v\n" +
          "  Next read = guaranteed miss -> reload fresh value",
        code:
          "async function updateUser(id, data) {\n" +
          "  await db.update('users', id, data);\n" +
          "  await cache.del(`user:${id}`);   // invalidate instead of update\n" +
          "  // next read is a guaranteed miss -> cache-aside reloads fresh data\n" +
          "}",
      },
    ],
  },
];

export function findDeepDive(id: string): DeepDive | undefined {
  return DEEP_DIVES.find((d) => d.id === id);
}
