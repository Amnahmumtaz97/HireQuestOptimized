/** System design interview topic bank (static). */
export const SYSTEM_DESIGN_TOPICS = [
  'Scalability',
  'Load Balancing',
  'Caching',
  'Databases',
  'CAP Theorem',
  'Microservices',
  'Event Driven Architecture',
  'Message Queues',
  'API Design',
  'Distributed Systems',
  'Consistency',
  'Availability',
  'CDN',
  'Storage',
  'Monitoring',
] as const

export type SystemDesignTopic = (typeof SYSTEM_DESIGN_TOPICS)[number]

export const SYSTEM_DESIGN_TOPIC_SET = new Set<string>(SYSTEM_DESIGN_TOPICS)
