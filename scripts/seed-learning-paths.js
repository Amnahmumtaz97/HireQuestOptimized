#!/usr/bin/env node

/**
 * Seed the full learning-path catalog + level-aware stages with catalog bindings.
 *
 * Usage (local or after deploy): npm run seed:learning-paths
 */

const fs = require('fs')
const path = require('path')
const { MongoClient, ObjectId } = require('mongodb')

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return
  const content = fs.readFileSync(envPath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue
    const separatorIndex = line.indexOf('=')
    if (separatorIndex < 0) continue
    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()
    if (key && process.env[key] === undefined) process.env[key] = value
  }
}

loadEnvFile()

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI')
  process.exit(1)
}

const SE = 'software_engineering'
const DS = 'data_science'
const AI = 'artificial_intelligence'
const IT = 'information_technology'

/**
 * Build leveled stages:
 * 1 Foundations (concept) → practice levels 2..5 → Mock level 6 → optional AI feedback
 */
function buildLevelStages({
  foundationCopy,
  practices = [],
  mockTopics,
  mockUnlock = 70,
  dept,
  specs,
  interviewType = 'technical',
  ratio = 85,
  behavioralStage = null,
  withFeedback = true,
  mockTitle = 'Mock Interview',
  mockDifficulty = 'Hard',
  mockQuestions = 15,
}) {
  const stages = [
    {
      order: 1,
      level: 1,
      title: 'Foundations',
      type: 'concept',
      contentRef: foundationCopy,
      unlockMinScore: null,
    },
  ]

  let order = 2
  const practiceList = [...practices]
  if (behavioralStage) {
    practiceList.push({
      title: behavioralStage.title || 'Behavioral Round',
      topics: behavioralStage.topics || [
        'Communication',
        'Teamwork',
        'Leadership',
        'Problem Solving',
      ],
      difficulty: behavioralStage.difficulty || 'Medium',
      questions: behavioralStage.questions || 10,
      interviewType: 'behavioral',
      ratio: 0,
      contentRef: behavioralStage.contentRef,
    })
  }

  practiceList.forEach((p, i) => {
    const level = Math.min(2 + i, 5)
    const itype = p.interviewType || interviewType
    const techRatio =
      typeof p.ratio === 'number'
        ? p.ratio
        : itype === 'behavioral' || itype === 'hr'
          ? 0
          : ratio
    stages.push({
      order: order++,
      level,
      title: p.title,
      type: 'practice',
      contentRef:
        p.contentRef ||
        `Practice interview focused on: ${(p.topics || []).join(', ')}.`,
      unlockMinScore: null,
      departmentKey: p.dept || dept,
      specializationKeys: p.specs || specs,
      interviewType: itype,
      difficulty: p.difficulty || (i === 0 ? 'Easy' : i < 2 ? 'Medium' : 'Hard'),
      suggestedTopics: p.topics || [],
      totalQuestions: p.questions || 10,
      technicalQuestionRatio: techRatio,
    })
  })

  stages.push({
    order: order++,
    level: 6,
    title: mockTitle,
    type: 'mock_interview',
    contentRef: `Full mock interview covering: ${(mockTopics || []).join(', ')}. Score ≥ ${mockUnlock} to unlock the next stage.`,
    unlockMinScore: mockUnlock,
    departmentKey: dept,
    specializationKeys: specs,
    interviewType,
    difficulty: mockDifficulty,
    suggestedTopics: mockTopics || [],
    totalQuestions: mockQuestions,
    technicalQuestionRatio:
      interviewType === 'behavioral' || interviewType === 'hr' ? 0 : ratio,
  })

  if (withFeedback) {
    stages.push({
      order: order++,
      level: 6,
      title: 'AI Feedback',
      type: 'ai_feedback',
      contentRef:
        'Review dimension scores, weak topics, and improvement notes from your mock session.',
      unlockMinScore: null,
    })
  }

  return stages
}

function techPractices(topics, label) {
  const chunks = []
  const mid = Math.ceil(topics.length / 2)
  chunks.push({
    title: `${label} Core`,
    topics: topics.slice(0, mid),
    difficulty: 'Easy',
    questions: 10,
  })
  chunks.push({
    title: `${label} Intermediate`,
    topics: topics.slice(mid),
    difficulty: 'Medium',
    questions: 12,
  })
  chunks.push({
    title: `${label} Advanced`,
    topics: topics,
    difficulty: 'Hard',
    questions: 12,
  })
  return chunks
}

function estimateMinutes(stages, difficultyLabel = 'Intermediate') {
  const interviewStages = stages.filter(
    (s) => s.type === 'practice' || s.type === 'mock_interview',
  )
  const per =
    difficultyLabel === 'Beginner' ? 25 : difficultyLabel === 'Advanced' ? 35 : 30
  return interviewStages.length * per + 15
}

function pathMeta({
  slug,
  title,
  description,
  targetAudience,
  category,
  subcategory = '',
  tags = [],
  difficultyLabel = 'Intermediate',
  estimatedMinutes = null,
  isFeatured = false,
  stages,
}) {
  const interviewStages = stages.filter(
    (s) => s.type === 'practice' || s.type === 'mock_interview',
  )
  return {
    slug,
    title,
    description,
    targetAudience,
    category,
    subcategory,
    tags,
    difficultyLabel,
    estimatedMinutes:
      typeof estimatedMinutes === 'number'
        ? estimatedMinutes
        : estimateMinutes(stages, difficultyLabel),
    isFeatured: Boolean(isFeatured),
    estimatedInterviews: interviewStages.length,
    stages,
  }
}

function techPath(slug, title, specKey, topics, meta = {}) {
  const difficultyLabel = meta.difficultyLabel || 'Beginner'
  const stages = buildLevelStages({
    foundationCopy: `Build a solid foundation in ${title} before progressing through core, intermediate, and advanced practice interviews.`,
    practices: techPractices(topics, title),
    mockTopics: topics,
    mockUnlock: 70,
    dept: meta.dept || SE,
    specs: [specKey],
    interviewType: 'technical',
    ratio: 85,
  })
  return pathMeta({
    slug,
    title,
    description: `Technology path for ${title}: foundations → progressive practice → mock interview with AI feedback.`,
    targetAudience: meta.targetAudience || 'beginner',
    category: 'technology',
    subcategory: meta.subcategory || 'languages',
    tags: ['technology', specKey, 'technical', ...(meta.tags || [])],
    difficultyLabel,
    estimatedMinutes: meta.estimatedMinutes,
    isFeatured: Boolean(meta.isFeatured),
    stages,
  })
}

function rolePath(slug, title, dept, specs, topics, audience = 'experienced', meta = {}) {
  const difficultyLabel = meta.difficultyLabel || 'Intermediate'
  const stages = buildLevelStages({
    foundationCopy: `Understand the expectations for a ${title} role, then practice core and advanced scenarios before a full mock.`,
    practices: [
      {
        title: `${title} Core`,
        topics: topics.slice(0, Math.ceil(topics.length / 2)),
        difficulty: 'Medium',
        questions: 12,
      },
      {
        title: `${title} Advanced`,
        topics,
        difficulty: 'Hard',
        questions: 14,
      },
    ],
    mockTopics: topics,
    mockUnlock: 70,
    dept,
    specs,
    interviewType: 'technical',
    ratio: 80,
    behavioralStage: {
      title: 'Behavioral Fit',
      topics: ['Communication', 'Teamwork', 'Ownership', 'Conflict Resolution'],
      questions: 8,
    },
  })
  return pathMeta({
    slug,
    title,
    description: `Role-focused prep for ${title} interviews: technical depth plus behavioral fit and a final mock.`,
    targetAudience: audience,
    category: 'role',
    subcategory: meta.subcategory || 'role_based',
    tags: ['role', ...specs, 'career', ...(meta.tags || [])],
    difficultyLabel,
    estimatedMinutes: meta.estimatedMinutes,
    isFeatured: Boolean(meta.isFeatured),
    stages,
  })
}

function companyPath(
  slug,
  title,
  { global = false, regional = false, pakistan = false, international = false } = {},
) {
  const unlock = global || international ? 75 : 70
  const designTopics =
    global || international
      ? [
          'System Design',
          'Scalability',
          'Caching',
          'Microservices',
          'Databases',
          'APIs',
          'Distributed Systems',
        ]
      : ['APIs', 'React', 'Databases', 'Auth', 'Deployment', 'System Design']
  const isPak = pakistan || regional
  const isIntl = international || global
  const stages = buildLevelStages({
    foundationCopy: isPak
      ? `Prep for ${title}: expect full-stack technical depth plus a behavioral round common in regional product/services companies.`
      : `Prep for ${title}-style loops: heavier system design, production reasoning, and a high-bar mock (unlock ≥ ${unlock}).`,
    practices: [
      {
        title: 'Full-Stack Technical',
        topics: designTopics.slice(0, 4),
        difficulty: 'Medium',
        questions: 12,
      },
      {
        title: isIntl ? 'System Design Deep Dive' : 'Product & Scale Scenarios',
        topics: designTopics,
        difficulty: 'Hard',
        questions: isIntl ? 15 : 12,
      },
    ],
    mockTopics: designTopics,
    mockUnlock: unlock,
    dept: SE,
    specs: ['full_stack'],
    interviewType: 'technical',
    ratio: isIntl ? 90 : 80,
    behavioralStage: {
      title: 'Behavioral Round',
      topics: [
        'Communication',
        'Teamwork',
        'Leadership',
        'Problem Solving',
        'Stakeholder Management',
      ],
      questions: 10,
      contentRef: `Behavioral questions tailored to ${title} culture and collaboration styles.`,
    },
    mockDifficulty: 'Hard',
    mockQuestions: isIntl ? 20 : 15,
  })
  const tags = ['company', slug]
  if (isPak) tags.push('pakistan', 'regional')
  if (isIntl) tags.push('international', 'global')
  return pathMeta({
    slug,
    title,
    description: isPak
      ? `Company prep for ${title}: full-stack technical practice, behavioral round, and a realistic mock.`
      : `Global company prep for ${title}: system-design-heavy practice and a strict mock unlock.`,
    targetAudience: isPak ? 'domain:company' : 'experienced',
    category: 'company',
    subcategory: isPak ? 'pakistan' : 'international',
    tags,
    difficultyLabel: isIntl ? 'Advanced' : 'Intermediate',
    isFeatured: isIntl,
    stages,
  })
}

function skillsPath(slug, title, topics, interviewType = 'behavioral', meta = {}) {
  const difficultyLabel = meta.difficultyLabel || 'Intermediate'
  const stages = buildLevelStages({
    foundationCopy: `Build a reusable story bank and frameworks for ${title.toLowerCase()} before live practice.`,
    practices: [
      {
        title: `${title} Practice`,
        topics,
        difficulty: 'Medium',
        questions: 10,
        interviewType,
        ratio: 0,
      },
      {
        title: `${title} Pressure Round`,
        topics,
        difficulty: 'Hard',
        questions: 12,
        interviewType,
        ratio: 0,
      },
    ],
    mockTopics: topics,
    mockUnlock: 65,
    dept: SE,
    specs: ['full_stack'],
    interviewType,
    ratio: 0,
    mockDifficulty: 'Medium',
    mockQuestions: 12,
  })
  return pathMeta({
    slug,
    title,
    description: `Skills path focused on ${title.toLowerCase()}: concept framing, practice, and a soft-skills mock.`,
    targetAudience: 'domain:behavioral',
    category: 'skills',
    subcategory: meta.subcategory || 'behavioral',
    tags: ['skills', interviewType, slug, ...(meta.tags || [])],
    difficultyLabel,
    estimatedMinutes: meta.estimatedMinutes,
    isFeatured: Boolean(meta.isFeatured),
    stages,
  })
}

const TECH_TOPICS = {
  mern: ['React', 'Node.js', 'Express', 'MongoDB', 'Auth'],
  react: ['Hooks', 'State', 'Effects', 'Performance', 'Testing'],
  nextjs: ['App Router', 'Server Components', 'Caching', 'API Routes', 'SSR'],
  nodejs: ['Event Loop', 'Streams', 'Modules', 'Async Patterns', 'Performance'],
  express: ['Routing', 'Middleware', 'Error Handling', 'Auth', 'REST APIs'],
  mongodb: ['CRUD', 'Indexes', 'Aggregation', 'Schema Design', 'Transactions'],
  typescript: ['Types', 'Generics', 'Interfaces', 'Utility Types', 'Strict Mode'],
  javascript: ['Closures', 'Prototypes', 'Async', 'ES6', 'DOM'],
  python: ['OOP', 'Async', 'Data Structures', 'Testing', 'Packaging'],
  django: ['ORM', 'Views', 'Auth', 'REST Framework', 'Migrations'],
  fastapi: ['Routing', 'Pydantic', 'Dependency Injection', 'Async', 'OpenAPI'],
  flask: ['Routing', 'Blueprints', 'Jinja', 'Auth', 'Extensions'],
  java: ['OOP', 'Collections', 'Concurrency', 'JVM', 'Streams'],
  spring_boot: ['DI', 'Spring MVC', 'JPA', 'Security', 'Actuator'],
  cpp: ['Memory', 'STL', 'OOP', 'Concurrency', 'Templates'],
  clang: ['Pointers', 'Memory', 'Arrays', 'Structs', 'Compilation'],
  csharp: ['OOP', 'LINQ', 'Async', 'Generics', 'Memory'],
  dotnet: ['ASP.NET', 'EF Core', 'DI', 'Middleware', 'Hosting'],
  golang: ['Goroutines', 'Channels', 'Interfaces', 'Packages', 'Testing'],
  rust: ['Ownership', 'Borrowing', 'Traits', 'Error Handling', 'Concurrency'],
  php: ['OOP', 'Composer', 'Sessions', 'Security', 'Performance'],
  laravel: ['Eloquent', 'Routing', 'Auth', 'Queues', 'Blade'],
  kotlin: ['Coroutines', 'Null Safety', 'Collections', 'Android Basics', 'Multiplatform'],
  ruby: ['OOP', 'Rails Basics', 'Gems', 'Metaprogramming', 'Testing'],
  swift: ['Optionals', 'Protocols', 'Concurrency', 'UIKit/SwiftUI', 'Memory'],
  angular: ['Components', 'RxJS', 'Dependency Injection', 'Routing', 'Forms'],
  vue: ['Composition API', 'Reactivity', 'Vue Router', 'Pinia', 'SSR'],
  svelte: ['Reactivity', 'Stores', 'Components', 'Transitions', 'SvelteKit'],
  html_css: ['Semantics', 'Flexbox', 'Grid', 'Accessibility', 'Responsive'],
  tailwind: ['Utility Classes', 'Responsive', 'Custom Theme', 'Layout', 'Dark Mode'],
  nestjs: ['Modules', 'DI', 'Controllers', 'Guards', 'Pipes'],
  mysql: ['SQL Queries', 'Indexes', 'Joins', 'Transactions', 'Normalization'],
  postgresql: ['SQL Queries', 'Indexes', 'Joins', 'Transactions', 'JSON/JSONB'],
  sqlserver: ['T-SQL', 'Indexes', 'Stored Procedures', 'Transactions', 'Security'],
  oracle_db: ['SQL', 'PL/SQL', 'Indexes', 'Transactions', 'Performance'],
  sqlite: ['SQL Queries', 'Schema Design', 'Indexes', 'Transactions', 'Embedded Use'],
  redis: ['Data Structures', 'Caching', 'Pub/Sub', 'Persistence', 'Clustering'],
  firebase: ['Auth', 'Firestore', 'Realtime DB', 'Cloud Functions', 'Security Rules'],
  dynamodb: ['Keys', 'Indexes', 'Queries', 'Capacity', 'Streams'],
  cassandra: ['Data Modeling', 'CQL', 'Partitioning', 'Consistency', 'Clusters'],
  aws: ['EC2', 'S3', 'IAM', 'Lambda', 'Networking'],
  azure: ['Compute', 'Storage', 'Identity', 'Functions', 'Networking'],
  gcp: ['Compute Engine', 'Cloud Storage', 'IAM', 'Cloud Functions', 'Networking'],
  docker_k8s: ['Containers', 'Images', 'Pods', 'Services', 'Deployments', 'Helm', 'Networking'],
  jenkins: ['Pipelines', 'Jobs', 'Agents', 'Plugins', 'CI/CD'],
  github_actions: ['Workflows', 'Actions', 'Runners', 'Secrets', 'CI/CD'],
  selenium: ['WebDriver', 'Locators', 'Waits', 'Page Object', 'CI Integration'],
  cypress: ['Commands', 'Assertions', 'Fixtures', 'Interception', 'CI'],
  playwright: ['Locators', 'Assertions', 'Tracing', 'Parallel', 'CI'],
  jest: ['Matchers', 'Mocks', 'Async Tests', 'Coverage', 'Snapshots'],
  unity: ['Scenes', 'GameObjects', 'Scripting', 'Physics', 'UI'],
  unreal: ['Blueprints', 'Actors', 'C++ Basics', 'Physics', 'UI'],
  ethical_hacking: ['Reconnaissance', 'Exploitation', 'Privilege Escalation', 'Reporting', 'Tools'],
  secure_coding: ['Input Validation', 'Auth Flaws', 'Crypto Basics', 'Least Privilege', 'Code Review'],
  owasp: ['Injection', 'Broken Auth', 'XSS', 'SSRF', 'Security Misconfiguration'],
  web_security: ['HTTPS/TLS', 'CORS', 'CSRF', 'Session Security', 'Headers'],
  oop: ['Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction', 'SOLID'],
  dbms: ['ER Modeling', 'Normalization', 'Transactions', 'Indexing', 'Concurrency Control'],
  operating_systems: ['Processes', 'Threads', 'Memory Management', 'Scheduling', 'File Systems'],
  computer_networks: ['OSI/TCP-IP', 'Routing', 'DNS', 'HTTP', 'Congestion Control'],
  software_engineering_fundamentals: ['SDLC', 'Requirements', 'Design Patterns', 'Testing', 'Maintenance'],
}

const TECH_TITLES = {
  mern: 'MERN Stack',
  react: 'React',
  nextjs: 'Next.js',
  nodejs: 'Node.js',
  express: 'Express.js',
  mongodb: 'MongoDB',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  python: 'Python',
  django: 'Django',
  fastapi: 'FastAPI',
  flask: 'Flask',
  java: 'Java',
  spring_boot: 'Spring Boot',
  cpp: 'C++',
  clang: 'C',
  csharp: 'C#',
  dotnet: '.NET',
  golang: 'Go',
  rust: 'Rust',
  php: 'PHP',
  laravel: 'Laravel',
  kotlin: 'Kotlin',
  ruby: 'Ruby',
  swift: 'Swift',
  angular: 'Angular',
  vue: 'Vue',
  svelte: 'Svelte',
  html_css: 'HTML & CSS',
  tailwind: 'Tailwind CSS',
  nestjs: 'NestJS',
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  sqlserver: 'SQL Server',
  oracle_db: 'Oracle Database',
  sqlite: 'SQLite',
  redis: 'Redis',
  firebase: 'Firebase',
  dynamodb: 'DynamoDB',
  cassandra: 'Cassandra',
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'GCP',
  docker_k8s: 'Docker & Kubernetes',
  jenkins: 'Jenkins',
  github_actions: 'GitHub Actions',
  selenium: 'Selenium',
  cypress: 'Cypress',
  playwright: 'Playwright',
  jest: 'Jest',
  unity: 'Unity',
  unreal: 'Unreal Engine',
  ethical_hacking: 'Ethical Hacking',
  secure_coding: 'Secure Coding',
  owasp: 'OWASP',
  web_security: 'Web Security',
  oop: 'Object-Oriented Programming',
  dbms: 'Database Management Systems',
  operating_systems: 'Operating Systems',
  computer_networks: 'Computer Networks',
  software_engineering_fundamentals: 'Software Engineering Fundamentals',
}

/** subcategory / difficulty / featured hints for technology paths */
const TECH_META = {
  mern: { subcategory: 'backend', difficultyLabel: 'Intermediate', isFeatured: true },
  react: { subcategory: 'frontend', difficultyLabel: 'Beginner', isFeatured: true },
  nextjs: { subcategory: 'frontend', difficultyLabel: 'Intermediate', isFeatured: true },
  nodejs: { subcategory: 'backend', difficultyLabel: 'Intermediate' },
  express: { subcategory: 'backend', difficultyLabel: 'Beginner' },
  mongodb: { subcategory: 'databases', difficultyLabel: 'Beginner' },
  typescript: { subcategory: 'languages', difficultyLabel: 'Intermediate', isFeatured: true },
  javascript: { subcategory: 'languages', difficultyLabel: 'Beginner', isFeatured: true },
  python: { subcategory: 'languages', difficultyLabel: 'Beginner', isFeatured: true },
  django: { subcategory: 'backend', difficultyLabel: 'Intermediate' },
  fastapi: { subcategory: 'backend', difficultyLabel: 'Intermediate' },
  flask: { subcategory: 'backend', difficultyLabel: 'Beginner' },
  java: { subcategory: 'languages', difficultyLabel: 'Intermediate', isFeatured: true },
  spring_boot: { subcategory: 'backend', difficultyLabel: 'Intermediate' },
  cpp: { subcategory: 'languages', difficultyLabel: 'Advanced' },
  clang: { subcategory: 'languages', difficultyLabel: 'Intermediate' },
  csharp: { subcategory: 'languages', difficultyLabel: 'Intermediate' },
  dotnet: { subcategory: 'backend', difficultyLabel: 'Intermediate' },
  golang: { subcategory: 'languages', difficultyLabel: 'Intermediate' },
  rust: { subcategory: 'languages', difficultyLabel: 'Advanced' },
  php: { subcategory: 'languages', difficultyLabel: 'Beginner' },
  laravel: { subcategory: 'backend', difficultyLabel: 'Intermediate' },
  kotlin: { subcategory: 'mobile', difficultyLabel: 'Intermediate' },
  ruby: { subcategory: 'languages', difficultyLabel: 'Intermediate' },
  swift: { subcategory: 'mobile', difficultyLabel: 'Intermediate' },
  angular: { subcategory: 'frontend', difficultyLabel: 'Intermediate' },
  vue: { subcategory: 'frontend', difficultyLabel: 'Beginner' },
  svelte: { subcategory: 'frontend', difficultyLabel: 'Beginner' },
  html_css: { subcategory: 'frontend', difficultyLabel: 'Beginner', isFeatured: true },
  tailwind: { subcategory: 'frontend', difficultyLabel: 'Beginner' },
  nestjs: { subcategory: 'backend', difficultyLabel: 'Intermediate' },
  mysql: { subcategory: 'databases', difficultyLabel: 'Beginner' },
  postgresql: { subcategory: 'databases', difficultyLabel: 'Intermediate', isFeatured: true },
  sqlserver: { subcategory: 'databases', difficultyLabel: 'Intermediate' },
  oracle_db: { subcategory: 'databases', difficultyLabel: 'Advanced' },
  sqlite: { subcategory: 'databases', difficultyLabel: 'Beginner' },
  redis: { subcategory: 'databases', difficultyLabel: 'Intermediate' },
  firebase: { subcategory: 'databases', difficultyLabel: 'Beginner' },
  dynamodb: { subcategory: 'databases', difficultyLabel: 'Intermediate' },
  cassandra: { subcategory: 'databases', difficultyLabel: 'Advanced' },
  aws: { subcategory: 'cloud', difficultyLabel: 'Intermediate', isFeatured: true },
  azure: { subcategory: 'cloud', difficultyLabel: 'Intermediate' },
  gcp: { subcategory: 'cloud', difficultyLabel: 'Intermediate' },
  docker_k8s: { subcategory: 'devops', difficultyLabel: 'Intermediate', isFeatured: true },
  jenkins: { subcategory: 'devops', difficultyLabel: 'Intermediate' },
  github_actions: { subcategory: 'devops', difficultyLabel: 'Beginner' },
  selenium: { subcategory: 'testing', difficultyLabel: 'Intermediate' },
  cypress: { subcategory: 'testing', difficultyLabel: 'Intermediate' },
  playwright: { subcategory: 'testing', difficultyLabel: 'Intermediate' },
  jest: { subcategory: 'testing', difficultyLabel: 'Beginner' },
  unity: { subcategory: 'game_dev', difficultyLabel: 'Intermediate' },
  unreal: { subcategory: 'game_dev', difficultyLabel: 'Advanced' },
  ethical_hacking: { subcategory: 'cybersecurity', difficultyLabel: 'Advanced' },
  secure_coding: { subcategory: 'cybersecurity', difficultyLabel: 'Intermediate' },
  owasp: { subcategory: 'cybersecurity', difficultyLabel: 'Intermediate', isFeatured: true },
  web_security: { subcategory: 'cybersecurity', difficultyLabel: 'Intermediate' },
  oop: { subcategory: 'cs_fundamentals', difficultyLabel: 'Beginner', isFeatured: true },
  dbms: { subcategory: 'cs_fundamentals', difficultyLabel: 'Intermediate' },
  operating_systems: { subcategory: 'cs_fundamentals', difficultyLabel: 'Intermediate' },
  computer_networks: { subcategory: 'cs_fundamentals', difficultyLabel: 'Intermediate' },
  software_engineering_fundamentals: {
    subcategory: 'cs_fundamentals',
    difficultyLabel: 'Beginner',
  },
}

const AI_TECH = {
  prompt_engineering: {
    title: 'Prompt Engineering',
    topics: ['Prompt Design', 'Few-Shot', 'Chain of Thought', 'Evaluation', 'Safety'],
  },
  ai_agents: {
    title: 'AI Agents',
    topics: ['Tool Use', 'Planning', 'Memory', 'Multi-Agent', 'Evaluation'],
  },
  rag: {
    title: 'RAG',
    topics: ['Chunking', 'Embeddings', 'Retrieval', 'Reranking', 'Grounding'],
  },
}

function techSlug(key) {
  if (key === 'spring_boot') return 'spring-boot'
  if (key === 'html_css') return 'html-css'
  if (key === 'docker_k8s') return 'docker-k8s'
  if (key === 'github_actions') return 'github-actions'
  if (key === 'oracle_db') return 'oracle-db'
  if (key === 'ethical_hacking') return 'ethical-hacking'
  if (key === 'secure_coding') return 'secure-coding'
  if (key === 'web_security') return 'web-security'
  if (key === 'operating_systems') return 'operating-systems'
  if (key === 'computer_networks') return 'computer-networks'
  if (key === 'software_engineering_fundamentals') return 'software-engineering-fundamentals'
  return key.replace(/_/g, '-')
}

const DSA_TOPICS = [
  'Arrays',
  'Strings',
  'Linked Lists',
  'Stacks',
  'Queues',
  'Trees',
  'BST',
  'Heaps',
  'Graphs',
  'Dynamic Programming',
  'Greedy',
  'Backtracking',
]

const SYSTEM_DESIGN_TOPICS = [
  'Scalability',
  'Caching',
  'Load Balancers',
  'Databases',
  'Sharding',
  'Message Queues',
  'Microservices',
  'CAP Theorem',
  'High-Level Design',
  'Low-Level Design',
]

const PROJECT_STAGES = [
  {
    title: 'Project Presentation',
    topics: ['Project Overview', 'Impact', 'Stakeholders'],
    interviewType: 'behavioral',
    ratio: 0,
    difficulty: 'Easy',
  },
  {
    title: 'Architecture',
    topics: ['Architecture', 'Trade-offs', 'Components'],
    interviewType: 'technical',
    ratio: 80,
    difficulty: 'Medium',
  },
  {
    title: 'Database Design',
    topics: ['Schema Design', 'Indexes', 'Data Modeling'],
    interviewType: 'technical',
    ratio: 85,
    difficulty: 'Medium',
  },
  {
    title: 'Authentication',
    topics: ['Auth', 'Sessions', 'Security'],
    interviewType: 'technical',
    ratio: 85,
    difficulty: 'Medium',
  },
  {
    title: 'API Design',
    topics: ['REST APIs', 'Contracts', 'Error Handling'],
    interviewType: 'technical',
    ratio: 85,
    difficulty: 'Medium',
  },
  {
    title: 'Challenges Faced',
    topics: ['Problem Solving', 'Debugging', 'Trade-offs'],
    interviewType: 'behavioral',
    ratio: 20,
    difficulty: 'Medium',
  },
  {
    title: 'Optimizations',
    topics: ['Performance', 'Caching', 'Profiling'],
    interviewType: 'technical',
    ratio: 90,
    difficulty: 'Hard',
  },
  {
    title: 'Future Improvements',
    topics: ['Roadmap', 'Tech Debt', 'Scalability'],
    interviewType: 'both',
    ratio: 50,
    difficulty: 'Medium',
  },
]

const SEED = [
  // —— KEEP / upgrade ——
  pathMeta({
    slug: 'internship-preparation',
    title: 'Internship Preparation',
    description:
      'Beginner-friendly path from fundamentals through practice and mock interviews to application readiness.',
    targetAudience: 'beginner',
    category: 'role',
    subcategory: 'role_based',
    tags: ['internship', 'beginner', 'role'],
    difficultyLabel: 'Beginner',
    isFeatured: true,
    stages: buildLevelStages({
      foundationCopy:
        'Learn how HireQuest sessions work, what scoring dimensions mean, and how to pick a department for internship loops.',
      practices: [
        {
          title: 'Technical Fundamentals',
          topics: ['APIs', 'Databases', 'React', 'Auth'],
          difficulty: 'Easy',
          questions: 10,
        },
        {
          title: 'Internship Scenarios',
          topics: ['APIs', 'Databases', 'React', 'Auth', 'Debugging'],
          difficulty: 'Medium',
          questions: 12,
        },
      ],
      mockTopics: ['APIs', 'Databases', 'React', 'Auth'],
      mockUnlock: 60,
      dept: SE,
      specs: ['full_stack', 'backend'],
      interviewType: 'technical',
      ratio: 80,
      mockQuestions: 15,
    }),
  }),
  pathMeta({
    slug: 'experienced-developer',
    title: 'Experienced Developer',
    description:
      'For working engineers leveling up: advanced technical practice, performance analysis, and a readiness mock.',
    targetAudience: 'experienced',
    category: 'role',
    subcategory: 'role_based',
    tags: ['experienced', 'senior', 'role'],
    difficultyLabel: 'Advanced',
    isFeatured: true,
    stages: buildLevelStages({
      foundationCopy:
        'Pick the department and specialization that match the role you are targeting next, then tackle advanced sessions.',
      practices: [
        {
          title: 'Advanced Questions',
          topics: ['System Design', 'APIs', 'Microservices', 'Databases', 'Caching'],
          difficulty: 'Hard',
          questions: 15,
          interviewType: 'both',
          ratio: 70,
        },
        {
          title: 'Senior Scenarios',
          topics: ['System Design', 'Microservices', 'Ownership', 'Trade-offs'],
          difficulty: 'Hard',
          questions: 15,
          interviewType: 'both',
          ratio: 65,
        },
      ],
      mockTopics: ['System Design', 'APIs', 'Microservices', 'Databases', 'Caching'],
      mockUnlock: 70,
      dept: SE,
      specs: ['backend', 'full_stack'],
      interviewType: 'both',
      ratio: 70,
      mockDifficulty: 'Hard',
      mockQuestions: 20,
    }),
  }),
  pathMeta({
    slug: 'behavioral-hr-mastery',
    title: 'Behavioral & HR Mastery',
    description:
      'Non-technical interview strength: STAR storytelling, teamwork, leadership, and common HR screening questions.',
    targetAudience: 'domain:behavioral',
    category: 'skills',
    subcategory: 'behavioral',
    tags: ['behavioral', 'hr', 'skills'],
    difficultyLabel: 'Intermediate',
    isFeatured: true,
    stages: buildLevelStages({
      foundationCopy:
        'Collect 4–6 career stories (conflict, ownership, failure, impact). You will rehearse them in behavioral and HR stages next.',
      practices: [
        {
          title: 'Behavioral Practice',
          topics: [
            'Communication',
            'Teamwork',
            'Leadership',
            'Problem Solving',
            'Stakeholder Management',
          ],
          difficulty: 'Medium',
          questions: 10,
          interviewType: 'behavioral',
          ratio: 0,
        },
        {
          title: 'HR Screen Practice',
          topics: [
            'Self Introduction',
            'Strengths & Weaknesses',
            'Career Goals',
            'Motivation',
            'Handling Pressure',
          ],
          difficulty: 'Medium',
          questions: 10,
          interviewType: 'hr',
          ratio: 0,
        },
      ],
      mockTopics: [
        'Self Introduction',
        'Strengths & Weaknesses',
        'Career Goals',
        'Motivation',
        'Handling Pressure',
      ],
      mockUnlock: 60,
      dept: SE,
      specs: ['full_stack'],
      interviewType: 'hr',
      ratio: 0,
      mockTitle: 'HR Screen Mock',
      mockDifficulty: 'Medium',
      mockQuestions: 10,
    }),
  }),
  pathMeta({
    slug: 'faang-preparation',
    title: 'FAANG Preparation',
    description:
      'High-bar technical prep for FAANG-style screens: system design–heavy practice and a hard mock with a strict unlock score.',
    targetAudience: 'experienced',
    category: 'company',
    subcategory: 'international',
    tags: ['faang', 'company', 'global', 'international', 'system-design'],
    difficultyLabel: 'Advanced',
    isFeatured: true,
    stages: buildLevelStages({
      foundationCopy:
        'Expect depth on system design, trade-offs, and production reasoning. Complete practice before the hard mock unlocks feedback.',
      practices: [
        {
          title: 'Design & Scale Practice',
          topics: ['System Design', 'Microservices', 'Caching', 'Databases', 'APIs'],
          difficulty: 'Medium',
          questions: 15,
        },
        {
          title: 'Distributed Systems Scenarios',
          topics: [
            'Scalability',
            'Caching',
            'Load Balancers',
            'Sharding',
            'Message Queues',
            'CAP Theorem',
          ],
          difficulty: 'Hard',
          questions: 15,
        },
      ],
      mockTopics: ['System Design', 'Microservices', 'Caching', 'Databases', 'APIs'],
      mockUnlock: 75,
      dept: SE,
      specs: ['backend'],
      interviewType: 'technical',
      ratio: 90,
      mockTitle: 'Hard Technical Mock',
      mockDifficulty: 'Hard',
      mockQuestions: 20,
    }),
  }),

  // —— Technology (SE bindings) ——
  ...Object.keys(TECH_TOPICS).map((key) =>
    techPath(techSlug(key), TECH_TITLES[key], key, TECH_TOPICS[key], TECH_META[key] || {}),
  ),

  // —— AI technology (SE bindings; specs also under artificial_intelligence) ——
  ...Object.entries(AI_TECH).map(([key, { title, topics }]) =>
    techPath(techSlug(key), title, key, topics, {
      subcategory: 'ai_ml',
      difficultyLabel: 'Advanced',
      isFeatured: key === 'rag' || key === 'prompt_engineering',
      targetAudience: 'experienced',
      tags: ['ai'],
    }),
  ),

  // —— Role ——
  rolePath(
    'frontend-developer',
    'Frontend Developer',
    SE,
    ['frontend'],
    ['React', 'TypeScript', 'CSS', 'Performance', 'Accessibility'],
    'domain:frontend',
    { difficultyLabel: 'Intermediate', isFeatured: true },
  ),
  rolePath(
    'backend-developer',
    'Backend Developer',
    SE,
    ['backend'],
    ['APIs', 'Microservices', 'System Design', 'Databases', 'Caching'],
    'domain:backend',
    { difficultyLabel: 'Intermediate', isFeatured: true },
  ),
  rolePath(
    'full-stack-developer',
    'Full Stack Developer',
    SE,
    ['full_stack'],
    ['APIs', 'React', 'Databases', 'Auth', 'Deployment'],
    'experienced',
    { difficultyLabel: 'Intermediate', isFeatured: true },
  ),
  rolePath(
    'software-engineer',
    'Software Engineer',
    SE,
    ['full_stack'],
    ['APIs', 'React', 'Databases', 'Auth', 'System Design'],
    'experienced',
    { difficultyLabel: 'Intermediate' },
  ),
  rolePath(
    'ai-ml-engineer',
    'AI / ML Engineer',
    AI,
    ['machine_learning'],
    ['Regression', 'Classification', 'Ensembles', 'Validation', 'Feature Engineering'],
    'domain:ai',
    { difficultyLabel: 'Advanced', subcategory: 'role_based', tags: ['ai'] },
  ),
  rolePath(
    'data-scientist',
    'Data Scientist',
    DS,
    ['machine_learning'],
    ['Supervised Learning', 'Feature Engineering', 'Model Evaluation', 'SQL'],
    'domain:data',
    { difficultyLabel: 'Advanced' },
  ),
  rolePath(
    'data-analyst',
    'Data Analyst',
    DS,
    ['analytics'],
    ['SQL', 'Dashboards', 'A/B Testing', 'Metrics'],
    'domain:data',
    { difficultyLabel: 'Intermediate' },
  ),
  rolePath(
    'devops-engineer',
    'DevOps Engineer',
    SE,
    ['devops'],
    ['CI/CD', 'Docker', 'Kubernetes', 'Monitoring', 'Infrastructure as Code'],
    'domain:devops',
    { difficultyLabel: 'Intermediate' },
  ),
  rolePath(
    'cloud-engineer',
    'Cloud Engineer',
    SE,
    ['devops', 'aws'],
    ['CI/CD', 'Docker', 'Kubernetes', 'Infrastructure as Code', 'Monitoring'],
    'domain:devops',
    { difficultyLabel: 'Intermediate' },
  ),
  rolePath(
    'cybersecurity-analyst',
    'Cybersecurity Analyst',
    IT,
    ['it_security'],
    ['Access Control', 'Incident Response', 'SIEM', 'Endpoint Security'],
    'domain:security',
    { difficultyLabel: 'Advanced' },
  ),
  rolePath(
    'mobile-app-developer',
    'Mobile App Developer',
    SE,
    ['mobile'],
    ['Mobile UI', 'APIs', 'State', 'Offline', 'Release'],
    'domain:mobile',
    { difficultyLabel: 'Intermediate' },
  ),
  rolePath(
    'qa-engineer',
    'QA Engineer',
    SE,
    ['qa'],
    ['Test Design', 'Bug Reporting', 'Regression', 'API Testing', 'Coverage'],
    'domain:qa',
    { difficultyLabel: 'Intermediate' },
  ),
  rolePath(
    'sqa-automation-engineer',
    'SQA Automation Engineer',
    SE,
    ['sqa_automation'],
    ['Selenium', 'Cypress', 'CI Pipelines', 'Assertions', 'Flaky Tests'],
    'domain:qa',
    { difficultyLabel: 'Intermediate' },
  ),
  rolePath(
    'game-developer',
    'Game Developer',
    SE,
    ['game_dev'],
    ['Game Loops', 'Physics', 'Rendering', 'Networking', 'Optimization'],
    'domain:game',
    { difficultyLabel: 'Intermediate' },
  ),

  // —— Company Pakistan (existing regional + new) ——
  ...[
    ['systems-limited', 'Systems Limited'],
    ['tkxel', 'Tkxel'],
    ['arbisoft', 'Arbisoft'],
    ['confiz', 'Confiz'],
    ['devsinc', 'Devsinc'],
    ['netsol', 'NetSol'],
    ['10pearls', '10Pearls'],
    ['venturedive', 'VentureDive'],
    ['careem', 'Careem'],
    ['curemd', 'CureMD'],
    ['techlogix', 'Techlogix'],
    ['contour-software', 'Contour Software'],
    ['motive', 'Motive'],
    ['afiniti', 'Afiniti'],
    ['folio3', 'Folio3'],
    ['sp-global-pakistan', 'S&P Global Pakistan'],
    ['i2c', 'i2c'],
    ['dubizzle-labs', 'Dubizzle Labs'],
    ['bazaar-technologies', 'Bazaar Technologies'],
    ['tajir', 'Tajir'],
    ['postex', 'PostEx'],
    ['creditbook', 'CreditBook'],
  ].map(([slug, title]) => companyPath(slug, title, { pakistan: true, regional: true })),

  // —— Company international (existing global + new) ——
  ...[
    ['microsoft', 'Microsoft'],
    ['amazon', 'Amazon'],
    ['google', 'Google'],
    ['meta', 'Meta'],
    ['apple', 'Apple'],
    ['netflix', 'Netflix'],
    ['tiktok', 'TikTok'],
    ['bytedance', 'ByteDance'],
    ['oracle', 'Oracle'],
    ['ibm', 'IBM'],
    ['nvidia', 'NVIDIA'],
    ['adobe', 'Adobe'],
    ['cisco', 'Cisco'],
    ['atlassian', 'Atlassian'],
    ['uber', 'Uber'],
    ['airbnb', 'Airbnb'],
    ['stripe', 'Stripe'],
    ['shopify', 'Shopify'],
    ['salesforce', 'Salesforce'],
  ].map(([slug, title]) => companyPath(slug, title, { international: true, global: true })),

  // —— Skills ——
  skillsPath(
    'communication-skills',
    'Communication Skills',
    ['Communication', 'Clarity', 'Active Listening', 'Stakeholder Management'],
    'behavioral',
    { isFeatured: true },
  ),
  skillsPath(
    'hr-interviews',
    'HR Interviews',
    [
      'Self Introduction',
      'Strengths & Weaknesses',
      'Career Goals',
      'Motivation',
      'Handling Pressure',
    ],
    'hr',
  ),
  skillsPath(
    'resume-discussion',
    'Resume Discussion',
    ['Experience Walkthrough', 'Impact Stories', 'Role Fit', 'Career Narrative'],
    'behavioral',
  ),
  skillsPath(
    'project-explanation',
    'Project Explanation',
    ['Project Overview', 'Trade-offs', 'Impact', 'Ownership'],
    'behavioral',
  ),
  skillsPath(
    'leadership',
    'Leadership',
    ['Leadership', 'Mentorship', 'Decision Making', 'Conflict Resolution'],
    'behavioral',
    { difficultyLabel: 'Advanced' },
  ),
  skillsPath(
    'problem-solving',
    'Problem Solving',
    ['Problem Solving', 'Root Cause Analysis', 'Prioritization', 'Trade-offs'],
    'behavioral',
  ),
  skillsPath(
    'critical-thinking',
    'Critical Thinking',
    ['Critical Thinking', 'Assumptions', 'Evidence', 'Decision Making'],
    'behavioral',
  ),
  skillsPath(
    'salary-negotiation',
    'Salary Negotiation',
    ['Compensation', 'Negotiation', 'Market Research', 'Offer Evaluation'],
    'hr',
    { difficultyLabel: 'Advanced' },
  ),

  // —— DSA ——
  pathMeta({
    slug: 'dsa',
    title: 'Data Structures & Algorithms',
    description:
      'Sequential DSA practice from Arrays through Backtracking, ending in a comprehensive mock interview.',
    targetAudience: 'experienced',
    category: 'dsa',
    subcategory: 'dsa',
    tags: ['dsa', 'algorithms', 'coding'],
    difficultyLabel: 'Advanced',
    isFeatured: true,
    stages: buildLevelStages({
      foundationCopy:
        'Warm up on complexity analysis and problem patterns. Progress topic-by-topic, then take a full DSA mock.',
      practices: DSA_TOPICS.map((topic, i) => ({
        title: topic,
        topics: [topic],
        difficulty: i < 4 ? 'Easy' : i < 8 ? 'Medium' : 'Hard',
        questions: 8,
      })),
      mockTopics: DSA_TOPICS,
      mockUnlock: 70,
      dept: SE,
      specs: ['dsa'],
      interviewType: 'technical',
      ratio: 95,
      mockTitle: 'DSA Mock Interview',
      mockDifficulty: 'Hard',
      mockQuestions: 15,
    }),
  }),

  // —— System Design ——
  pathMeta({
    slug: 'system-design',
    title: 'System Design',
    description:
      'Progressive system design topics from Scalability through HLD/LLD, capped by a hard design mock.',
    targetAudience: 'experienced',
    category: 'system_design',
    subcategory: 'system_design',
    tags: ['system-design', 'architecture', 'scalability'],
    difficultyLabel: 'Advanced',
    isFeatured: true,
    stages: buildLevelStages({
      foundationCopy:
        'Review core distributed-systems vocabulary, then practice each design pillar before a full HLD/LLD mock.',
      practices: SYSTEM_DESIGN_TOPICS.map((topic, i) => ({
        title: topic,
        topics: [topic],
        difficulty: i < 3 ? 'Medium' : 'Hard',
        questions: 8,
      })),
      mockTopics: SYSTEM_DESIGN_TOPICS,
      mockUnlock: 70,
      dept: SE,
      specs: ['system_design_topics'],
      interviewType: 'technical',
      ratio: 90,
      mockTitle: 'System Design Mock',
      mockDifficulty: 'Hard',
      mockQuestions: 12,
    }),
  }),

  // —— Project ——
  pathMeta({
    slug: 'project-discussion',
    title: 'Project Discussion',
    description:
      'Walk through your own projects: presentation, architecture, data, auth, APIs, challenges, optimizations, and future work.',
    targetAudience: 'experienced',
    category: 'project',
    subcategory: 'project',
    tags: ['project', 'portfolio', 'behavioral', 'technical'],
    difficultyLabel: 'Intermediate',
    isFeatured: true,
    stages: (() => {
      const practices = PROJECT_STAGES.map((s) => ({
        ...s,
        questions: 8,
        contentRef: `Ask the candidate about THEIR real projects — focus on: ${s.title}. Probe decisions, ownership, and measurable outcomes.`,
      }))
      return buildLevelStages({
        foundationCopy:
          'Prepare a crisp overview of 1–2 flagship projects. Later stages will drill architecture, data, auth, APIs, and reflections.',
        practices,
        mockTopics: [
          'Project Overview',
          'Architecture',
          'Trade-offs',
          'Impact',
          'Future Improvements',
        ],
        mockUnlock: 70,
        dept: SE,
        specs: ['full_stack'],
        interviewType: 'both',
        ratio: 60,
        mockTitle: 'Project Deep-Dive Mock',
        mockDifficulty: 'Hard',
        mockQuestions: 12,
      })
    })(),
  }),
]

function stageDoc(pathId, s, now) {
  return {
    _id: new ObjectId(),
    pathId,
    order: s.order,
    title: s.title,
    type: s.type,
    contentRef: s.contentRef || '',
    unlockMinScore: s.unlockMinScore ?? null,
    level: typeof s.level === 'number' ? s.level : null,
    departmentKey: s.departmentKey || '',
    specializationKeys: s.specializationKeys || [],
    interviewType: s.interviewType || null,
    difficulty: s.difficulty || null,
    suggestedTopics: s.suggestedTopics || [],
    totalQuestions: typeof s.totalQuestions === 'number' ? s.totalQuestions : null,
    technicalQuestionRatio:
      typeof s.technicalQuestionRatio === 'number' ? s.technicalQuestionRatio : null,
    createdAt: now,
    updatedAt: now,
  }
}

async function main() {
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db()
  const pathsCol = db.collection('learningpaths')
  const stagesCol = db.collection('stages')

  for (const seed of SEED) {
    const now = new Date()
    const existing = await pathsCol.findOne({ slug: seed.slug })
    let pathId
    const meta = {
      title: seed.title,
      description: seed.description,
      targetAudience: seed.targetAudience,
      category: seed.category,
      subcategory: seed.subcategory || '',
      tags: seed.tags || [],
      difficultyLabel: seed.difficultyLabel || null,
      estimatedMinutes:
        typeof seed.estimatedMinutes === 'number' ? seed.estimatedMinutes : null,
      isFeatured: Boolean(seed.isFeatured),
      estimatedInterviews: seed.estimatedInterviews ?? null,
      updatedAt: now,
    }

    if (existing) {
      pathId = existing._id
      await pathsCol.updateOne({ _id: pathId }, { $set: meta })
      await stagesCol.deleteMany({ pathId })
      console.log(`Updated path: ${seed.title}`)
    } else {
      pathId = new ObjectId()
      await pathsCol.insertOne({
        _id: pathId,
        slug: seed.slug,
        ...meta,
        createdAt: now,
      })
      console.log(`Created path: ${seed.title}`)
    }

    const stageDocs = seed.stages.map((s) => stageDoc(pathId, s, now))
    await stagesCol.insertMany(stageDocs)
    console.log(`  → ${stageDocs.length} stages`)
  }

  await client.close()
  console.log(`Done. Seeded ${SEED.length} learning paths.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
