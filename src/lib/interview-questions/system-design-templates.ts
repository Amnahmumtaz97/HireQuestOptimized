import type { InterviewQuestionItem } from '@/lib/interview-questions/schema'
import type { Difficulty } from '@/lib/interview-questions/difficulty'
import { SYSTEM_DESIGN_TOPICS } from '@/lib/interview-config/banks/system-design-topics'

export type SystemDesignTemplate = {
  id: string
  topic: (typeof SYSTEM_DESIGN_TOPICS)[number]
  title: string
  difficulty: Difficulty
  question: string
}

/**
 * Curated system-design prompts (template bank), keyed to SYSTEM_DESIGN_TOPICS.
 * Same role as CODING_PROBLEM_BANK for coding interviews.
 */
export const SYSTEM_DESIGN_PROBLEM_BANK: SystemDesignTemplate[] = [
  {
    id: 'sd-url-shortener',
    topic: 'Scalability',
    title: 'Design a URL Shortener',
    difficulty: 'Medium',
    question: `## Design a URL Shortener

Design a service like bit.ly that turns long URLs into short codes and redirects with low latency.

### Requirements
- Create short links and redirect (read-heavy)
- Custom aliases (optional), expiry, basic analytics (click counts)
- Target: ~100M new links/day, ~10B redirects/day

### Discuss
1. API design and ID generation (hash vs base62 counter)
2. Storage choice and sharding strategy
3. Caching for hot redirects
4. How you scale reads vs writes and handle collisions`,
  },
  {
    id: 'sd-rate-limiter-scale',
    topic: 'Scalability',
    title: 'Rate Limiter at Scale',
    difficulty: 'Hard',
    question: `## Global Rate Limiter

Design a distributed rate limiter used by an API gateway for millions of clients.

### Requirements
- Per-API-key and per-IP limits (token bucket / sliding window)
- Low added latency on the hot path
- Consistent limits across many gateway nodes

### Discuss
Algorithms, Redis (or equivalent) data model, clock skew, failure modes when the limiter store is down, and how you roll out new limit configs safely.`,
  },
  {
    id: 'sd-load-balancer',
    topic: 'Load Balancing',
    title: 'Design a Load Balancer',
    difficulty: 'Medium',
    question: `## Design an L7 Load Balancer

Design a reverse proxy / load balancer in front of a fleet of HTTP services.

### Requirements
- Round-robin, least-connections, and weighted strategies
- Health checks and draining
- Sticky sessions (optional)
- TLS termination

### Discuss
Data plane vs control plane, how you discover backends, what happens when half the fleet is unhealthy, and how you avoid thundering herds on recovery.`,
  },
  {
    id: 'sd-lb-geo',
    topic: 'Load Balancing',
    title: 'Geo DNS + Regional Failover',
    difficulty: 'Hard',
    question: `## Multi-Region Traffic Routing

Design how user traffic is steered across 3 regions with automatic failover.

### Discuss
DNS vs Anycast vs global LB, health signals, RTO/RPO trade-offs, split-brain risks, and how you test failover without hurting production.`,
  },
  {
    id: 'sd-cache-layer',
    topic: 'Caching',
    title: 'Multi-Layer Caching Strategy',
    difficulty: 'Medium',
    question: `## Caching for a Read-Heavy Product Feed

Design caching for a product catalog / news feed with 100:1 read:write ratio.

### Discuss
CDN vs edge vs app cache vs Redis, cache keys and TTLs, stampede prevention, invalidation vs short TTL, and when you choose write-through vs write-behind.`,
  },
  {
    id: 'sd-cache-invalidation',
    topic: 'Caching',
    title: 'Cache Invalidation Across Services',
    difficulty: 'Hard',
    question: `## Cross-Service Cache Invalidation

Several microservices cache the same user profile. Profile updates must become visible within a few seconds everywhere.

### Discuss
Pub/sub invalidation, versioned keys, eventual consistency UX, and how you debug "stale for some users" incidents.`,
  },
  {
    id: 'sd-db-choice',
    topic: 'Databases',
    title: 'Choose the Right Database',
    difficulty: 'Medium',
    question: `## Database Selection for a Marketplace

You are building a marketplace (buyers, sellers, listings, orders, payments).

### Discuss
Which workloads need SQL vs document vs search vs KV, how you model orders and inventory, indexing strategy, and when you introduce read replicas or a separate analytics store.`,
  },
  {
    id: 'sd-sharding',
    topic: 'Databases',
    title: 'Shard a Growing SQL Database',
    difficulty: 'Hard',
    question: `## Horizontal Sharding Plan

A single Postgres primary is nearing capacity (CPU + storage). Design a sharding migration.

### Discuss
Shard key choice, resharding, cross-shard transactions, orphaned data, dual-write cutover, and rollback.`,
  },
  {
    id: 'sd-cap',
    topic: 'CAP Theorem',
    title: 'CAP Trade-offs in Practice',
    difficulty: 'Easy',
    question: `## CAP in a Real System

Pick one product (chat, payments, or inventory) and walk through what you prioritize under network partitions.

### Discuss
Concrete user-visible failures, how you communicate degraded mode, and which consistency model you choose and why (not just "CP vs AP" slogans).`,
  },
  {
    id: 'sd-cap-multi-master',
    topic: 'CAP Theorem',
    title: 'Multi-Master Writes',
    difficulty: 'Hard',
    question: `## Multi-Region Writable Database

Product wants writes in every region with "eventual sync". Challenge the design.

### Discuss
Conflict resolution, last-write-wins hazards, CRDTs where useful, and when to refuse the requirement.`,
  },
  {
    id: 'sd-microservices',
    topic: 'Microservices',
    title: 'Split a Monolith',
    difficulty: 'Medium',
    question: `## Monolith → Microservices Migration

An e-commerce monolith is painful to deploy. Propose a strangler-fig migration.

### Discuss
Service boundaries, shared DB anti-patterns, auth between services, deployment order, and how you keep one business transaction reliable during the split.`,
  },
  {
    id: 'sd-service-mesh',
    topic: 'Microservices',
    title: 'Inter-Service Communication',
    difficulty: 'Medium',
    question: `## Service Communication Patterns

Design communication for 20+ services: sync APIs, async events, and batch jobs.

### Discuss
When to use REST/gRPC vs queues, idempotency, retries/timeouts/circuit breakers, and observability (trace IDs).`,
  },
  {
    id: 'sd-eda',
    topic: 'Event Driven Architecture',
    title: 'Event-Driven Order Pipeline',
    difficulty: 'Medium',
    question: `## Event-Driven Checkout

Design checkout so inventory, payments, fulfillment, and email run via events.

### Discuss
Event schema, outbox pattern, at-least-once delivery, ordering, and compensating transactions if payment succeeds but inventory fails.`,
  },
  {
    id: 'sd-cqrs',
    topic: 'Event Driven Architecture',
    title: 'CQRS Read Models',
    difficulty: 'Hard',
    question: `## CQRS for Analytics Dashboards

Write path is transactional; dashboards need flexible aggregations with seconds of lag OK.

### Discuss
Projection rebuilds, schema evolution of events, and how you explain lag to users.`,
  },
  {
    id: 'sd-queues',
    topic: 'Message Queues',
    title: 'Design a Job Queue',
    difficulty: 'Medium',
    question: `## Background Job System

Design a durable job queue for emails, image processing, and webhooks.

### Discuss
Broker choice, visibility timeout, poison messages, priority, delayed jobs, and horizontal worker scaling.`,
  },
  {
    id: 'sd-exactly-once',
    topic: 'Message Queues',
    title: 'Idempotent Consumers',
    difficulty: 'Hard',
    question: `## "Exactly Once" Processing

Product asks for exactly-once side effects from a queue. Explain what you can and cannot guarantee.

### Discuss
Idempotency keys, dedupe stores, transactional outbox, and UX when duplicates still happen.`,
  },
  {
    id: 'sd-api-design',
    topic: 'API Design',
    title: 'Public REST API Design',
    difficulty: 'Easy',
    question: `## Design a Versioned Public API

Design REST (or GraphQL—justify) APIs for a notes app used by third-party clients.

### Discuss
Resource modeling, pagination, error format, auth (API keys/OAuth), rate limits, and backward-compatible versioning.`,
  },
  {
    id: 'sd-api-gateway',
    topic: 'API Design',
    title: 'API Gateway Responsibilities',
    difficulty: 'Medium',
    question: `## Edge Gateway Design

What belongs in the API gateway vs each microservice?

### Discuss
Authn/authz, request validation, aggregation, caching, and how you avoid a "god gateway".`,
  },
  {
    id: 'sd-distributed',
    topic: 'Distributed Systems',
    title: 'Distributed Lock / Leader Election',
    difficulty: 'Hard',
    question: `## Distributed Lock Service

Design a lock / lease service used by many jobs that must not run concurrently.

### Discuss
TTL leases, fencing tokens, clock assumptions, Redis vs ZooKeeper/etcd trade-offs, and failure if the lock holder dies.`,
  },
  {
    id: 'sd-consensus',
    topic: 'Distributed Systems',
    title: 'Config Consensus',
    difficulty: 'Hard',
    question: `## Strongly Consistent Config Store

Design a small strongly consistent store for feature flags used by thousands of servers.

### Discuss
Raft/Paxos at a high level, quorum reads/writes, membership changes, and read scalability.`,
  },
  {
    id: 'sd-consistency',
    topic: 'Consistency',
    title: 'Consistency Models for a Feed',
    difficulty: 'Medium',
    question: `## Feed Consistency

Users post updates; followers see a feed. What consistency do you promise?

### Discuss
Read-your-writes, monotonic reads, causal consistency, fan-out on write vs read, and stale-read UX.`,
  },
  {
    id: 'sd-transactions',
    topic: 'Consistency',
    title: 'Cross-Service Consistency',
    difficulty: 'Hard',
    question: `## Money Transfer Across Services

Wallet service and ledger service must agree on balances without a shared DB transaction.

### Discuss
Sagas, two-phase commit (and why you often avoid it), reconciliation jobs, and auditability.`,
  },
  {
    id: 'sd-availability',
    topic: 'Availability',
    title: '99.99% Availability Plan',
    difficulty: 'Medium',
    question: `## High Availability Architecture

Design a customer-facing API targeting 99.99% monthly availability.

### Discuss
Redundancy, blast radius, graceful degradation, dependency SLOs, chaos testing, and error budgets.`,
  },
  {
    id: 'sd-dr',
    topic: 'Availability',
    title: 'Disaster Recovery',
    difficulty: 'Hard',
    question: `## Region Outage Runbook

Primary region is gone. Design DR for RPO ≤ 5 min and RTO ≤ 30 min.

### Discuss
Backups vs replication, warm standby, DNS cutover, data loss communication, and drill cadence.`,
  },
  {
    id: 'sd-cdn',
    topic: 'CDN',
    title: 'CDN for Static + Dynamic',
    difficulty: 'Easy',
    question: `## CDN Strategy

Design how a global web app uses a CDN for assets and optionally HTML.

### Discuss
Cache-Control, signed URLs, purge APIs, origin shield, and when dynamic content should not be cached at the edge.`,
  },
  {
    id: 'sd-cdn-video',
    topic: 'CDN',
    title: 'Video Delivery',
    difficulty: 'Hard',
    question: `## Adaptive Bitrate Video Delivery

Design CDN + packaging for streaming video to mobile and desktop.

### Discuss
Origin storage, HLS/DASH, hot-spot popular titles, geo restrictions, and cost control.`,
  },
  {
    id: 'sd-storage',
    topic: 'Storage',
    title: 'Object Storage for Uploads',
    difficulty: 'Medium',
    question: `## User File Uploads

Design upload/download for images and PDFs up to 5GB with virus scanning.

### Discuss
Direct-to-object-store uploads, multipart, metadata DB, lifecycle tiers, and access control.`,
  },
  {
    id: 'sd-storage-dedupe',
    topic: 'Storage',
    title: 'Deduplicated Blob Store',
    difficulty: 'Hard',
    question: `## Content-Addressed Storage

Design a blob store that dedupes identical files across tenants.

### Discuss
Hashing, garbage collection of unreferenced blobs, encryption per tenant, and performance of small vs large objects.`,
  },
  {
    id: 'sd-monitoring',
    topic: 'Monitoring',
    title: 'Observability Stack',
    difficulty: 'Easy',
    question: `## Monitoring & Alerting Design

Design metrics, logs, and traces for a production SaaS.

### Discuss
SLIs/SLOs, alert fatigue, cardinality, PII in logs, and on-call dashboards for a latency regression.`,
  },
  {
    id: 'sd-monitoring-incident',
    topic: 'Monitoring',
    title: 'Incident Detection Pipeline',
    difficulty: 'Medium',
    question: `## Detect Silent Failures

Error rate is flat but conversions drop. How would monitoring catch this?

### Discuss
Business metrics as SLIs, anomaly detection, synthetic checks, and how you page the right owners.`,
  },
]

function difficultyRank(d: Difficulty): number {
  if (d === 'Easy') return 0
  if (d === 'Medium') return 1
  return 2
}

function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items]
  let s = seed || 1
  for (let i = arr.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    const j = s % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function uniqueById(list: SystemDesignTemplate[]): SystemDesignTemplate[] {
  const seen = new Set<string>()
  const out: SystemDesignTemplate[] = []
  for (const p of list) {
    if (seen.has(p.id)) continue
    seen.add(p.id)
    out.push(p)
  }
  return out
}

/**
 * Pick curated system-design prompts: unique-first by selected topics, then rest of bank.
 */
export function buildSystemDesignQuestions(params: {
  topics: string[]
  totalQuestions: number
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Adaptive'
  excludeIds?: string[]
}): InterviewQuestionItem[] {
  const topicSet = new Set(params.topics.map((t) => t.trim()).filter(Boolean))
  const excluded = new Set((params.excludeIds || []).map((n) => n.trim()).filter(Boolean))

  const available = SYSTEM_DESIGN_PROBLEM_BANK.filter((p) => !excluded.has(p.id))
  const primary = available.filter((p) => topicSet.size === 0 || topicSet.has(p.topic))
  const secondary = available.filter((p) => topicSet.size > 0 && !topicSet.has(p.topic))

  const seed = hashSeed(
    `${[...topicSet].sort().join('|')}|${params.totalQuestions}|${params.difficulty}|${[
      ...excluded,
    ]
      .sort()
      .join(',')}`,
  )

  let primaryPool = uniqueById(seededShuffle(primary.length ? primary : available, seed))
  let secondaryPool = uniqueById(seededShuffle(secondary, seed ^ 0x9e3779b9)).filter(
    (p) => !primaryPool.some((x) => x.id === p.id),
  )

  const target = params.difficulty === 'Adaptive' ? null : (params.difficulty as Difficulty)

  if (target) {
    const byTarget = (list: SystemDesignTemplate[]) =>
      [...list].sort(
        (a, b) =>
          Math.abs(difficultyRank(a.difficulty) - difficultyRank(target)) -
          Math.abs(difficultyRank(b.difficulty) - difficultyRank(target)),
      )
    primaryPool = byTarget(primaryPool)
    secondaryPool = byTarget(secondaryPool)
  } else {
    const byNative = (list: SystemDesignTemplate[]) =>
      [...list].sort((a, b) => difficultyRank(a.difficulty) - difficultyRank(b.difficulty))
    primaryPool = byNative(primaryPool)
    secondaryPool = byNative(secondaryPool)
  }

  let pool = [...primaryPool, ...secondaryPool]
  if (pool.length === 0) pool = uniqueById([...SYSTEM_DESIGN_PROBLEM_BANK])

  const n = Math.max(0, params.totalQuestions)
  return Array.from({ length: n }, (_, i) => {
    const tpl = pool[i % pool.length]
    const difficulty =
      params.difficulty === 'Adaptive'
        ? tpl.difficulty
        : params.difficulty === 'Easy' ||
            params.difficulty === 'Medium' ||
            params.difficulty === 'Hard'
          ? params.difficulty
          : tpl.difficulty

    return {
      type: 'technical' as const,
      topic: tpl.topic,
      difficulty,
      question: tpl.question,
      kind: 'spoken' as const,
    }
  })
}
