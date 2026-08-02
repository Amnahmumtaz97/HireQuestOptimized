import type { PathSubcategoryKey } from '@/lib/learning-paths/constants'

/** Short copy shown on category cards (learning paths home). */
export const PATH_SUBCATEGORY_DESCRIPTIONS: Record<PathSubcategoryKey, string> = {
  languages: 'Language fundamentals and coding-style interview drills.',
  frontend: 'UI frameworks, performance, accessibility, and frontend systems.',
  backend: 'APIs, services, databases, and backend architecture practice.',
  databases: 'SQL/NoSQL modeling, queries, indexing, and data interviews.',
  cs_fundamentals: 'OS, networks, OOP, and core CS theory for screens.',
  system_design: 'Scalability, trade-offs, and architecture mock rounds.',
  ai_ml: 'ML, agents, RAG, and AI engineering interview tracks.',
  cloud: 'AWS, Azure, GCP platform and cloud architecture prep.',
  devops: 'CI/CD, containers, observability, and delivery interviews.',
  testing: 'QA, automation, and quality engineering practice paths.',
  mobile: 'Android, iOS, and cross-platform mobile interview prep.',
  cybersecurity: 'Secure coding, OWASP, and security analyst tracks.',
  game_dev: 'Game loops, engines, and gameplay systems interviews.',
  behavioral: 'STAR stories, soft skills, and HR-style behavioral rounds.',
  role_based: 'Role-shaped journeys for frontend, backend, DevOps, and more.',
  pakistan: 'Full interview loops for Pakistan’s top IT employers.',
  dsa: 'Data structures & algorithms coding interview mastery.',
  project: 'Explain projects, architecture decisions, and trade-offs.',
}
