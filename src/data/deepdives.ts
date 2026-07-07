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
  {
    id: "rate-limiting",
    title: "Rate Limiting Strategies",
    intro:
      "Rate limiting answers 'how many requests can this client make, how fast' — and the five common " +
      "algorithms differ mainly in how precisely they track time and whether they allow short bursts " +
      "through. Simpler algorithms are cheaper but let bursts slip past window boundaries; more precise " +
      "ones cost more memory or computation per request.",
    strategies: [
      {
        name: "Fixed Window Counter",
        description:
          "Divide time into fixed-size windows (e.g. every 60s), count requests per window, and reset " +
          "the counter when the window rolls over. Cheap, but a client can send the full limit right at " +
          "the end of one window and the full limit again right at the start of the next — up to 2x the " +
          "limit in a very short burst around the boundary.",
        diagram:
          "  window: [0-60s]        [60-120s]       [120-180s]\n" +
          "  count:     0->limit        0->limit        0->limit\n" +
          "                     ^ reset            ^ reset\n" +
          "  Problem: a burst at 0:59 + a burst at 1:00 = 2x limit in ~1 second",
        code:
          "const counters = new Map(); // key -> { count, windowStart }\n" +
          "\n" +
          "function allow(key, limit = 100, windowMs = 60000) {\n" +
          "  const now = Date.now();\n" +
          "  const entry = counters.get(key);\n" +
          "  if (!entry || now - entry.windowStart >= windowMs) {\n" +
          "    counters.set(key, { count: 1, windowStart: now });\n" +
          "    return true;\n" +
          "  }\n" +
          "  if (entry.count >= limit) return false;\n" +
          "  entry.count++;\n" +
          "  return true;\n" +
          "}",
      },
      {
        name: "Sliding Window Log",
        description:
          "Keep a timestamped log of every request in the last window; on each new request, drop " +
          "timestamps older than the window and check the log's length against the limit. Exact — no " +
          "boundary-burst problem — but memory grows with request volume since every timestamp is kept.",
        diagram:
          "  now = t\n" +
          "  log = [t-58, t-40, t-12, t-3]   (all within the last 60s)\n" +
          "  drop anything < t-60\n" +
          "  if log.length < limit -> allow, push(t)\n" +
          "  else -> reject",
        code:
          "const logs = new Map(); // key -> timestamps[]\n" +
          "\n" +
          "function allow(key, limit = 100, windowMs = 60000) {\n" +
          "  const now = Date.now();\n" +
          "  const arr = (logs.get(key) || []).filter((t) => now - t < windowMs);\n" +
          "  if (arr.length >= limit) { logs.set(key, arr); return false; }\n" +
          "  arr.push(now);\n" +
          "  logs.set(key, arr);\n" +
          "  return true;\n" +
          "}",
      },
      {
        name: "Sliding Window Counter",
        description:
          "A cheaper approximation of the sliding log: keep just two fixed-window counters (current + " +
          "previous) and weight the previous window's count by how much of it still overlaps the sliding " +
          "window. Smooths out the fixed-window boundary-burst problem without storing every timestamp.",
        diagram:
          "  |---- prev window ----|---- current window ----|\n" +
          "                     now-60s                    now\n" +
          "  weighted count = prevCount * overlapFraction + currCount",
        code:
          "function allow(key, limit, windowMs, store) {\n" +
          "  const now = Date.now();\n" +
          "  const { prevCount, currCount, currStart } =\n" +
          "    store.get(key) ?? { prevCount: 0, currCount: 0, currStart: now };\n" +
          "  const elapsed = now - currStart;\n" +
          "  const overlap = Math.max(0, (windowMs - elapsed) / windowMs);\n" +
          "  const weighted = prevCount * overlap + currCount;\n" +
          "  if (weighted >= limit) return false;\n" +
          "  store.set(key, { prevCount, currCount: currCount + 1, currStart });\n" +
          "  return true;\n" +
          "}",
      },
      {
        name: "Token Bucket",
        description:
          "A bucket holds up to N tokens and refills at a steady rate; every request consumes one token " +
          "and is rejected if the bucket is empty. Naturally allows short bursts (up to the bucket size) " +
          "while still enforcing a long-run average rate.",
        diagram:
          "    refill rate: 10 tokens/sec\n" +
          "    +------------------+\n" +
          "    |  * * * * * * *   |  <- bucket (max 20 tokens)\n" +
          "    +------------------+\n" +
          "         | request consumes 1 token\n" +
          "         v\n" +
          "    tokens > 0 ? allow : reject",
        code:
          "function allow(bucket, now, capacity = 20, refillPerSec = 10) {\n" +
          "  const elapsed = (now - bucket.lastRefill) / 1000;\n" +
          "  bucket.tokens = Math.min(capacity, bucket.tokens + elapsed * refillPerSec);\n" +
          "  bucket.lastRefill = now;\n" +
          "  if (bucket.tokens < 1) return false;\n" +
          "  bucket.tokens -= 1;\n" +
          "  return true;\n" +
          "}",
      },
      {
        name: "Leaky Bucket",
        description:
          "Requests queue into a fixed-size bucket that 'leaks' (processes) at a constant rate; if the " +
          "bucket is full, new requests are dropped. Unlike token bucket, this smooths output to a " +
          "strictly constant rate instead of letting bursts through.",
        diagram:
          "   requests -> [ bucket (max size N) ] -> leaks out at fixed rate\n" +
          "                       |\n" +
          "                 full? -> reject new requests",
        code:
          "class LeakyBucket {\n" +
          "  constructor(capacity, leakPerSec) {\n" +
          "    this.capacity = capacity; this.leakPerSec = leakPerSec;\n" +
          "    this.queue = 0; this.lastLeak = Date.now();\n" +
          "  }\n" +
          "  allow() {\n" +
          "    const now = Date.now();\n" +
          "    const leaked = ((now - this.lastLeak) / 1000) * this.leakPerSec;\n" +
          "    this.queue = Math.max(0, this.queue - leaked);\n" +
          "    this.lastLeak = now;\n" +
          "    if (this.queue >= this.capacity) return false;\n" +
          "    this.queue += 1;\n" +
          "    return true;\n" +
          "  }\n" +
          "}",
      },
    ],
  },
  {
    id: "load-balancing",
    title: "Load Balancing Strategies",
    intro:
      "Load balancing decides which server handles the next request. The five common algorithms trade " +
      "off simplicity, fairness under uneven server capacity, adaptiveness to real-time load, and whether " +
      "the same client reliably lands on the same server.",
    strategies: [
      {
        name: "Round Robin",
        description:
          "Cycle through the server list in order, one request per server, wrapping back to the start. " +
          "Simple and fair when all servers and requests are roughly equal — doesn't account for server " +
          "load or request cost.",
        diagram:
          "  servers: [A, B, C]\n" +
          "  req1 -> A\n" +
          "  req2 -> B\n" +
          "  req3 -> C\n" +
          "  req4 -> A   (wraps around)",
        code:
          "let i = 0;\n" +
          "function pickServer(servers) {\n" +
          "  const server = servers[i % servers.length];\n" +
          "  i++;\n" +
          "  return server;\n" +
          "}",
      },
      {
        name: "Weighted Round Robin",
        description:
          "Same rotation, but servers with more capacity get proportionally more turns — a weight-3 " +
          "server is picked 3x as often as a weight-1 server. Fixes plain round robin's blindness to " +
          "heterogeneous server capacity.",
        diagram:
          "  A(weight 3), B(weight 1)\n" +
          "  sequence: A, A, A, B, A, A, A, B, ...",
        code:
          "function pickServer(servers) { // [{ server, weight }]\n" +
          "  const pool = servers.flatMap((s) => Array(s.weight).fill(s.server));\n" +
          "  return pool[Math.floor(Math.random() * pool.length)];\n" +
          "}",
      },
      {
        name: "Least Connections",
        description:
          "Route each new request to whichever server currently has the fewest active/in-flight " +
          "connections. Adapts to uneven request costs (some requests are slow, some fast) better than " +
          "round robin, at the cost of tracking live connection counts.",
        diagram:
          "  A: 12 active   B: 4 active   C: 9 active\n" +
          "  new request -> B  (fewest active connections)",
        code:
          "function pickServer(servers) { // [{ server, activeConnections }]\n" +
          "  return servers.reduce((min, s) =>\n" +
          "    s.activeConnections < min.activeConnections ? s : min\n" +
          "  ).server;\n" +
          "}",
      },
      {
        name: "IP Hash (Source Hashing)",
        description:
          "Hash the client's IP (or another stable key) to deterministically map it to the same server " +
          "every time. Gives you 'sticky sessions' without a session store — the same client always " +
          "lands on the same backend.",
        diagram:
          "  hash(clientIP) % serverCount = index\n" +
          "  client 203.0.113.7 -> always server[hash(...) % N]",
        code:
          "function hashCode(str) {\n" +
          "  let h = 0;\n" +
          "  for (const c of str) h = (h * 31 + c.charCodeAt(0)) | 0;\n" +
          "  return Math.abs(h);\n" +
          "}\n" +
          "function pickServer(servers, clientIp) {\n" +
          "  return servers[hashCode(clientIp) % servers.length];\n" +
          "}",
      },
      {
        name: "Consistent Hashing",
        description:
          "Map both servers and keys onto a hash ring; a key routes to the next server clockwise from " +
          "its position. Adding/removing a server only reshuffles the keys between it and its neighbor " +
          "on the ring, instead of remapping almost everything the way plain `hash % N` would when N " +
          "changes — critical for caches/shards that must stay stable as the fleet resizes.",
        diagram:
          "          server A (hash=10)\n" +
          "             .\n" +
          "    key X (hash=95) .      . server B (hash=40)\n" +
          "                ring goes clockwise\n" +
          "             .\n" +
          "          server C (hash=70)\n" +
          "\n" +
          "    key X (95) -> next server clockwise -> A (wraps to 10)",
        code:
          "class ConsistentHashRing {\n" +
          "  constructor(servers) {\n" +
          "    this.ring = servers\n" +
          "      .map((s) => ({ server: s, hash: hashCode(s) }))\n" +
          "      .sort((a, b) => a.hash - b.hash);\n" +
          "  }\n" +
          "  pickServer(key) {\n" +
          "    const h = hashCode(key);\n" +
          "    const next = this.ring.find((entry) => entry.hash >= h);\n" +
          "    return (next ?? this.ring[0]).server; // wrap around the ring\n" +
          "  }\n" +
          "}",
      },
    ],
  },
  {
    id: "sharding",
    title: "Sharding Strategies",
    intro:
      "Sharding splits one dataset across multiple databases so no single machine has to hold (or serve) " +
      "all of it. The four common strategies differ in what they optimize for: fast range queries, even " +
      "write distribution, rebalancing flexibility, or physical proximity to users.",
    strategies: [
      {
        name: "Range-Based Sharding",
        description:
          "Partition rows by a key range (e.g. user_id 1-1,000,000 -> shard 1, 1,000,001-2,000,000 -> " +
          "shard 2). Range queries stay fast (a scan hits one shard), but traffic/data can skew badly if " +
          "writes cluster at one end of the range — e.g. auto-incrementing ids all landing on the newest " +
          "shard.",
        diagram:
          "  shard 1: user_id  1          - 1,000,000\n" +
          "  shard 2: user_id  1,000,001  - 2,000,000\n" +
          "  shard 3: user_id  2,000,001  - 3,000,000\n" +
          "        (new signups all pile onto shard 3 -- hot shard risk)",
        code:
          "function shardFor(userId, rangeSize = 1_000_000) {\n" +
          "  return `shard-${Math.floor((userId - 1) / rangeSize) + 1}`;\n" +
          "}",
      },
      {
        name: "Hash-Based Sharding",
        description:
          "Hash the shard key and mod by shard count to pick a shard. Spreads writes evenly (no hot " +
          "shard from sequential ids), but range queries ('all users signed up this week') now have to " +
          "fan out to every shard since related rows are scattered.",
        diagram:
          "  shard = hash(userId) % shardCount\n" +
          "  user 4821 -> hash -> shard 2\n" +
          "  user 4822 -> hash -> shard 0   (neighbors land on different shards)",
        code:
          "function shardFor(userId, shardCount) {\n" +
          "  return hashCode(String(userId)) % shardCount;\n" +
          "}",
      },
      {
        name: "Directory-Based (Lookup Table) Sharding",
        description:
          "A separate lookup service/table explicitly maps each key to its shard, instead of computing " +
          "it. Most flexible — you can rebalance by moving individual keys and updating the map — but " +
          "the lookup service becomes a new dependency and potential bottleneck/single point of failure.",
        diagram:
          "  key -> [ Lookup Service ] -> shard id\n" +
          "            id: 501 -> shard-2\n" +
          "            id: 502 -> shard-1\n" +
          "            id: 503 -> shard-2\n" +
          "    (rebalancing = just update the map, no rehashing everything)",
        code:
          "const shardMap = new Map(); // userId -> shardId, persisted somewhere durable\n" +
          "\n" +
          "function shardFor(userId) {\n" +
          "  return shardMap.get(userId) ?? assignNewUserToLeastLoadedShard(userId);\n" +
          "}",
      },
      {
        name: "Geo-Based Sharding",
        description:
          "Shard by the user/data's geographic region (e.g. US-East shard, EU shard, APAC shard) so " +
          "data stays physically close to the users reading/writing it. Cuts latency and can satisfy " +
          "data-residency/compliance rules, but cross-region queries and users who travel/relocate get " +
          "more complicated.",
        diagram:
          "  user in Germany -> EU shard (Frankfurt)\n" +
          "  user in Japan    -> APAC shard (Tokyo)\n" +
          "  user in Ohio     -> US shard (Ohio)\n" +
          "    each shard's data physically lives near its region's users",
        code:
          "const REGION_SHARDS = { EU: 'eu-frankfurt', APAC: 'apac-tokyo', US: 'us-ohio' };\n" +
          "\n" +
          "function shardFor(userRegion) {\n" +
          "  return REGION_SHARDS[userRegion] ?? REGION_SHARDS.US; // fallback region\n" +
          "}",
      },
    ],
  },
  {
    id: "replication",
    title: "Replication Strategies",
    intro:
      "Replication keeps copies of the same data on multiple nodes for durability and read scalability. " +
      "The three common topologies trade off write-path simplicity, multi-region write latency, and how " +
      "conflicts between concurrent writes get resolved.",
    strategies: [
      {
        name: "Leader-Follower (Primary-Replica)",
        description:
          "All writes go to a single leader, which replicates changes to one or more followers; reads " +
          "can be served from either. Simple to reason about (one source of truth for writes), but the " +
          "leader is a write bottleneck and a failover — promoting a follower — is needed if it goes " +
          "down.",
        diagram:
          "         writes\n" +
          "           |\n" +
          "           v\n" +
          "       +--------+   replicate   +------------+\n" +
          "       | Leader |-------------->| Follower 1 |\n" +
          "       +--------+                +------------+\n" +
          "           |        replicate    +------------+\n" +
          "           +--------------------->| Follower 2 |\n" +
          "                                   +------------+\n" +
          "    reads can hit the leader OR any follower",
        code:
          "async function write(data) {\n" +
          "  await leaderDb.write(data);          // only the leader accepts writes\n" +
          "  // followers pick up the change async via replication log\n" +
          "}\n" +
          "async function read(query, { allowStale = true } = {}) {\n" +
          "  return allowStale ? followerDb.read(query) : leaderDb.read(query);\n" +
          "}",
      },
      {
        name: "Multi-Leader",
        description:
          "Multiple nodes each accept writes independently and replicate to each other — useful for " +
          "multi-datacenter setups where you want low-latency local writes in each region. The tradeoff " +
          "is conflict resolution: two leaders can accept conflicting writes to the same record before " +
          "they've synced.",
        diagram:
          "   US Leader <----replicate----> EU Leader\n" +
          "      ^                              ^\n" +
          "    local writes                 local writes\n" +
          "      (both accept writes; conflicting edits need resolution)",
        code:
          "function resolveConflict(writeA, writeB) {\n" +
          "  // last-write-wins by timestamp is the simplest (and lossy) strategy;\n" +
          "  // real systems often use vector clocks or CRDTs instead\n" +
          "  return writeA.timestamp >= writeB.timestamp ? writeA : writeB;\n" +
          "}",
      },
      {
        name: "Leaderless (Quorum-Based)",
        description:
          "Any node can accept a read or write; a write is considered successful once it's acknowledged " +
          "by W of N replicas, and a read queries R replicas and returns the most recent value. As long " +
          "as W + R > N, every read is guaranteed to overlap with the latest write (Dynamo-style).",
        diagram:
          "   N = 5 replicas\n" +
          "   write: send to all 5, wait for W=3 acks -> success\n" +
          "   read:  query R=3 replicas, return the newest timestamp among them\n" +
          "   W + R (3+3=6) > N (5) -> every read set overlaps the write set",
        code:
          "async function write(key, value, replicas, W = 3) {\n" +
          "  const acks = await Promise.allSettled(replicas.map((r) => r.write(key, value)));\n" +
          "  const succeeded = acks.filter((a) => a.status === 'fulfilled').length;\n" +
          "  if (succeeded < W) throw new Error('write quorum not reached');\n" +
          "}\n" +
          "async function read(key, replicas, R = 3) {\n" +
          "  const results = await Promise.all(replicas.slice(0, R).map((r) => r.read(key)));\n" +
          "  return results.sort((a, b) => b.timestamp - a.timestamp)[0]; // newest wins\n" +
          "}",
      },
    ],
  },
  {
    id: "consistency-models",
    title: "Consistency Models",
    intro:
      "Once data is replicated, 'consistency' asks: after a write, what can a read see, and when? The " +
      "four common models trade off how immediately correct every read is against how available and " +
      "fast the system stays — this is the tension behind the 'C' in CAP theorem.",
    strategies: [
      {
        name: "Strong Consistency",
        description:
          "Every read reflects the most recent write, everywhere, immediately — as if there were only " +
          "one copy of the data. Easiest to reason about, but requires coordination (e.g. a quorum or " +
          "single leader) on every operation, which costs latency and can block during a network " +
          "partition — the 'C' in CAP, traded against availability.",
        diagram:
          "  write(x=5) completes\n" +
          "        |\n" +
          "        v\n" +
          "  ANY subsequent read, on ANY replica, sees x=5 immediately\n" +
          "  (no window where a replica can return a stale value)",
        code:
          "async function write(key, value) {\n" +
          "  await Promise.all(allReplicas.map((r) => r.write(key, value))); // wait for ALL\n" +
          "}\n" +
          "async function read(key) {\n" +
          "  return leaderReplica.read(key); // reads always go to the single source of truth\n" +
          "}",
      },
      {
        name: "Eventual Consistency",
        description:
          "Writes propagate to all replicas asynchronously; reads may return a stale value for a while, " +
          "but every replica converges to the same value once updates stop arriving. Trades immediate " +
          "correctness for availability and low write latency — the 'AP' side of CAP.",
        diagram:
          "  t=0     write(x=5) hits replica A\n" +
          "  t=0     read from replica B still returns x=4 (stale)\n" +
          "  t=50ms  replication catches up\n" +
          "  t=50ms  read from replica B now returns x=5 (converged)",
        code:
          "async function write(key, value) {\n" +
          "  await replicaA.write(key, value);          // ack immediately\n" +
          "  replicateAsync(key, value, otherReplicas);  // fire-and-forget to the rest\n" +
          "}\n" +
          "async function read(key, replica) {\n" +
          "  return replica.read(key); // may be stale depending on which replica you hit\n" +
          "}",
      },
      {
        name: "Causal Consistency",
        description:
          "Writes that are causally related (B happened after seeing A) are seen by every replica in " +
          "that same order; unrelated writes can be seen in any order. A middle ground — cheaper than " +
          "strong consistency, but stronger than plain eventual consistency (e.g. a reply always " +
          "appears after the comment it replies to, even if replicas disagree on unrelated posts' " +
          "ordering).",
        diagram:
          "  A: \"Anyone up for lunch?\"                        (write 1)\n" +
          "  B: \"Yes! 12pm?\"  (reply, causally depends on A)   (write 2)\n" +
          "\n" +
          "  Every replica must show A before B.\n" +
          "  An unrelated post C, with no causal link, can appear in any order.",
        code:
          "async function write(key, value, dependsOn = []) {\n" +
          "  await waitForDependencies(dependsOn);   // ensure causally-prior writes are visible first\n" +
          "  return replica.write(key, value, { vectorClock: nextClock(dependsOn) });\n" +
          "}",
      },
      {
        name: "Read-Your-Writes Consistency",
        description:
          "A specific, narrower guarantee — a client is guaranteed to see its own writes on its " +
          "subsequent reads, even if other clients might still see a stale value. Common trick: route a " +
          "client's reads to whichever replica handled its last write (or the leader) for a short window " +
          "after writing.",
        diagram:
          "  Client X writes x=5 to replica A\n" +
          "  Client X reads x -> guaranteed to see 5 (routed back to replica A, or leader)\n" +
          "  Client Y reads x from replica B -> might still see the old value",
        code:
          "async function write(clientId, key, value) {\n" +
          "  const replica = await leaderReplica.write(key, value);\n" +
          "  stickySession.set(clientId, { replica, until: Date.now() + 5000 });\n" +
          "}\n" +
          "async function read(clientId, key) {\n" +
          "  const sticky = stickySession.get(clientId);\n" +
          "  const replica = sticky && sticky.until > Date.now() ? sticky.replica : anyReplica();\n" +
          "  return replica.read(key);\n" +
          "}",
      },
    ],
  },
];

export function findDeepDive(id: string): DeepDive | undefined {
  return DEEP_DIVES.find((d) => d.id === id);
}
