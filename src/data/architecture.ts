// ─── System-design reference glossary ─────────────────────────────────────
// "Architecture-Level Concepts You Must Know Before Building Any Scalable
// Application" — a browsable reference that complements the 16 DSA patterns.
// Coding interviews test the patterns; system-design interviews test these.
//
// This is a glossary, not a set of runnable problems, so it has its own tiny
// data model (Category → Concept) instead of the Pattern → Problem model in
// ./types.ts. Add a concept by pushing to a category's `concepts` array.

export interface Concept {
  /** The term as you'd hear it in an interview. */
  term: string;
  /** One-line plain-English definition. */
  definition: string;
}

export interface ConceptCategory {
  id: string;
  name: string;
  concepts: Concept[];
}

export const ARCHITECTURE_CATEGORIES: ConceptCategory[] = [
  {
    id: "traffic-networking",
    name: "Traffic & Networking",
    concepts: [
      { term: "Rate Limiting", definition: "Limit requests from clients" },
      { term: "Caching", definition: "Store data for faster access" },
      { term: "Load Balancing", definition: "Distribute traffic evenly" },
      { term: "Reverse Proxies", definition: "Route & protect backend" },
      { term: "API Gateways", definition: "Single entry for APIs" },
      { term: "CI/CD", definition: "Automate build, test, deploy" },
      { term: "Docker", definition: "Package app in containers" },
      { term: "Kubernetes", definition: "Orchestrate containers" },
      { term: "Service Discovery", definition: "Find services dynamically" },
      { term: "Circuit Breakers", definition: "Stop cascading failures" },
      { term: "Timeouts", definition: "Avoid waiting too long" },
      { term: "Retries", definition: "Retry on temporary failures" },
      { term: "Exponential Backoff", definition: "Increase retry delay" },
      { term: "Idempotency", definition: "Prevent duplicate actions" },
    ],
  },
  {
    id: "messaging-architecture",
    name: "Messaging & Architecture",
    concepts: [
      { term: "Message Queues", definition: "Async communication" },
      { term: "Pub/Sub", definition: "Publish events to subscribers" },
      { term: "Event-Driven Architecture", definition: "Decouple services" },
      { term: "Distributed Transactions", definition: "Manage across services" },
      { term: "Saga Pattern", definition: "Maintain consistency" },
      { term: "Dead Letter Queues", definition: "Store failed messages" },
      { term: "Cron Jobs", definition: "Schedule background tasks" },
      { term: "WebSockets", definition: "Real-time two-way communication" },
      { term: "Long Polling", definition: "Real-time-like updates" },
      { term: "Server-Sent Events", definition: "Server to client stream" },
    ],
  },
  {
    id: "database-storage",
    name: "Database & Storage",
    concepts: [
      { term: "Database Indexing", definition: "Speed up queries" },
      { term: "Query Optimization", definition: "Write efficient queries" },
      { term: "N+1 Queries", definition: "Avoid extra DB calls" },
      { term: "Connection Pooling", definition: "Reuse connections" },
      { term: "Read Replicas", definition: "Scale read operations" },
      { term: "Sharding", definition: "Split data across DBs" },
      { term: "Partitioning", definition: "Divide large tables" },
      { term: "Replication", definition: "Keep data copies" },
      { term: "Leader Election", definition: "Choose leader node" },
      { term: "CAP Theorem", definition: "Consistency trade-offs" },
      { term: "Eventual Consistency", definition: "Data syncs over time" },
    ],
  },
  {
    id: "concurrency-reliability",
    name: "Concurrency & Reliability",
    concepts: [
      { term: "Optimistic Locking", definition: "Detect conflicts" },
      { term: "Pessimistic Locking", definition: "Lock before update" },
      { term: "Distributed Locks", definition: "Lock across services" },
      { term: "Race Conditions", definition: "Unpredictable outcome" },
      { term: "Deadlocks", definition: "Processes blocking each other" },
      { term: "Memory Leaks", definition: "Unused memory not freed" },
      { term: "Garbage Collection", definition: "Free unused memory" },
      { term: "Thread Safety", definition: "Safe in multi-threading" },
      { term: "Backpressure", definition: "Handle overload gracefully" },
    ],
  },
  {
    id: "scaling",
    name: "Scaling",
    concepts: [
      { term: "Autoscaling", definition: "Scale based on demand" },
      { term: "Horizontal Scaling", definition: "Add more servers" },
      { term: "Vertical Scaling", definition: "Increase server power" },
      { term: "CDN", definition: "Deliver content globally" },
      { term: "Edge Caching", definition: "Cache near user" },
      { term: "Cache Invalidation", definition: "Keep cache fresh" },
    ],
  },
  {
    id: "deployment-strategies",
    name: "Deployment Strategies",
    concepts: [
      { term: "Feature Flags", definition: "Enable features safely" },
      { term: "Blue-Green Deployments", definition: "Zero downtime" },
      { term: "Canary Releases", definition: "Rollout to few users" },
      { term: "Rolling Deployments", definition: "Update gradually" },
      { term: "Rollbacks", definition: "Revert changes quickly" },
      { term: "Health Checks", definition: "Check service health" },
      { term: "Liveness Probes", definition: "Is service running?" },
      { term: "Readiness Probes", definition: "Is service ready?" },
    ],
  },
  {
    id: "observability",
    name: "Observability",
    concepts: [
      { term: "Monitoring", definition: "Track system health" },
      { term: "Logging", definition: "Record events" },
      { term: "Distributed Tracing", definition: "Trace requests" },
      { term: "Metrics", definition: "Measure performance" },
      { term: "Alerting", definition: "Notify on issues" },
      { term: "SLOs", definition: "Define reliability goals" },
      { term: "SLIs", definition: "Measure reliability" },
      { term: "Error Budgets", definition: "Balance reliability" },
      { term: "Observability", definition: "Logs + metrics + traces" },
    ],
  },
  {
    id: "security",
    name: "Security",
    concepts: [
      { term: "Secrets Management", definition: "Secure credentials" },
      { term: "IAM", definition: "Manage access" },
      { term: "OAuth", definition: "Delegated authorization" },
      { term: "JWT Rotation", definition: "Refresh tokens safely" },
      { term: "TLS", definition: "Encrypt communication" },
      { term: "Encryption at Rest", definition: "Protect stored data" },
      { term: "Encryption in Transit", definition: "Protect data in motion" },
      { term: "WAF", definition: "Filter malicious requests" },
      { term: "DDoS Protection", definition: "Stop traffic attacks" },
      { term: "CORS", definition: "Control cross-origin access" },
      { term: "CSRF", definition: "Prevent forged requests" },
      { term: "SQL Injection", definition: "Prevent malicious queries" },
      { term: "XSS", definition: "Prevent script injection" },
      { term: "SSRF", definition: "Prevent server-side attacks" },
    ],
  },
  {
    id: "data-operations",
    name: "Data & Operations",
    concepts: [
      { term: "Database Migrations", definition: "Update schema" },
      { term: "Schema Versioning", definition: "Track DB changes" },
      { term: "Disaster Recovery", definition: "Recover from failures" },
      { term: "Backups", definition: "Protect data" },
      { term: "Failover", definition: "Switch to healthy system" },
      { term: "Multi-Region Deployments", definition: "Global availability" },
      { term: "Chaos Engineering", definition: "Test system limits" },
      { term: "Cost Optimization", definition: "Reduce costs" },
    ],
  },
  {
    id: "performance-metrics",
    name: "Performance Metrics",
    concepts: [
      { term: "Cold Starts", definition: "Serverless startup delay" },
      { term: "Serverless Limits", definition: "Know platform limits" },
      { term: "Latency", definition: "Time for a request" },
      { term: "Throughput", definition: "Requests per second" },
      { term: "P99 Latency", definition: "Worst 1% latency" },
      { term: "Tail Latency", definition: "Slowest requests" },
      { term: "Network Partitions", definition: "Network failures" },
      { term: "Clock Skew", definition: "Time differences" },
    ],
  },
];

/** Total number of concepts across all categories (for the sidebar count). */
export const ARCHITECTURE_CONCEPT_COUNT = ARCHITECTURE_CATEGORIES.reduce(
  (sum, c) => sum + c.concepts.length,
  0,
);
