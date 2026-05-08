#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { MongoClient } = require('mongodb')

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) {
    return
  }

  const content = fs.readFileSync(envPath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) {
      continue
    }

    const separatorIndex = line.indexOf('=')
    if (separatorIndex < 0) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()

    if (key && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

loadEnvFile()

const MONGODB_URI = process.env.MONGODB_URI

const defaultInterviewConfigSeed = [
  {
    industryKey: 'software_it',
    industryLabel: 'Software / IT',
    isActive: true,
    roleCategories: [
      {
        key: 'engineering',
        label: 'Engineering',
        interviewTypes: ['Technical', 'Behavioral'],
        technicalTopics: ['Frontend', 'Backend', 'Full Stack', 'System Design'],
        behavioralTopics: ['Teamwork', 'Conflict Resolution', 'Ownership', 'Communication'],
        technicalQuestionRatio: 70,
        durationEnabled: true,
        durations: [20, 30, 45, 60],
      },
      {
        key: 'quality_assurance',
        label: 'QA / Testing',
        interviewTypes: ['Technical', 'Behavioral'],
        technicalTopics: ['Test Cases', 'API Testing', 'Regression', 'Automation Basics'],
        behavioralTopics: ['Stakeholder Communication', 'Prioritization', 'Bug Reporting'],
        technicalQuestionRatio: 65,
        durationEnabled: true,
        durations: [20, 30, 45],
      },
      {
        key: 'devops_cloud',
        label: 'DevOps / Cloud',
        interviewTypes: ['Technical', 'Behavioral'],
        technicalTopics: ['CI/CD', 'Docker', 'Kubernetes', 'Cloud Monitoring'],
        behavioralTopics: ['Incident Handling', 'Cross-team Collaboration'],
        technicalQuestionRatio: 75,
        durationEnabled: true,
        durations: [30, 45, 60],
      },
    ],
  },
  {
    industryKey: 'data_ai',
    industryLabel: 'Data / AI',
    isActive: true,
    roleCategories: [
      {
        key: 'analytics',
        label: 'Analytics',
        interviewTypes: ['Technical', 'Behavioral'],
        technicalTopics: ['SQL', 'Statistics', 'Dashboards', 'Data Interpretation'],
        behavioralTopics: ['Business Communication', 'Requirement Clarification'],
        technicalQuestionRatio: 70,
        durationEnabled: true,
        durations: [20, 30, 45],
      },
      {
        key: 'data_science_ml',
        label: 'Data Science / ML',
        interviewTypes: ['Technical', 'Behavioral'],
        technicalTopics: ['ML Algorithms', 'Feature Engineering', 'Model Evaluation', 'MLOps'],
        behavioralTopics: ['Problem Framing', 'Experiment Communication'],
        technicalQuestionRatio: 75,
        durationEnabled: true,
        durations: [30, 45, 60],
      },
    ],
  },
  {
    industryKey: 'product',
    industryLabel: 'Product',
    isActive: true,
    roleCategories: [
      {
        key: 'product_management',
        label: 'Product Management',
        interviewTypes: ['Technical', 'Behavioral'],
        technicalTopics: ['Product Metrics', 'Prioritization Frameworks', 'Roadmapping'],
        behavioralTopics: ['Leadership', 'Stakeholder Management', 'Communication'],
        technicalQuestionRatio: 60,
        durationEnabled: true,
        durations: [20, 30, 45],
      },
    ],
  },
  {
    industryKey: 'cybersecurity',
    industryLabel: 'Cybersecurity',
    isActive: true,
    roleCategories: [
      {
        key: 'soc_analyst',
        label: 'SOC Analyst',
        interviewTypes: ['Technical', 'Behavioral'],
        technicalTopics: ['Networking Basics', 'Log Analysis', 'SIEM', 'Incident Response'],
        behavioralTopics: ['Communication', 'Handling Pressure', 'Escalation', 'Teamwork'],
        technicalQuestionRatio: 75,
        durationEnabled: true,
        durations: [20, 30, 45],
      },
      {
        key: 'appsec',
        label: 'Application Security',
        interviewTypes: ['Technical', 'Behavioral'],
        technicalTopics: ['OWASP Top 10', 'Threat Modeling', 'Secure Coding', 'Auth & Sessions'],
        behavioralTopics: ['Ownership', 'Risk Communication', 'Collaboration'],
        technicalQuestionRatio: 80,
        durationEnabled: true,
        durations: [30, 45, 60],
      },
    ],
  },
  {
    industryKey: 'mobile_development',
    industryLabel: 'Mobile Development',
    isActive: true,
    roleCategories: [
      {
        key: 'android',
        label: 'Android Developer',
        interviewTypes: ['Technical', 'Behavioral'],
        technicalTopics: ['Kotlin', 'Android Components', 'Networking', 'Local Storage'],
        behavioralTopics: ['Debugging Mindset', 'Communication', 'Ownership'],
        technicalQuestionRatio: 75,
        durationEnabled: true,
        durations: [20, 30, 45],
      },
      {
        key: 'ios',
        label: 'iOS Developer',
        interviewTypes: ['Technical', 'Behavioral'],
        technicalTopics: ['Swift', 'iOS Architecture', 'Networking', 'Performance'],
        behavioralTopics: ['Teamwork', 'Code Quality', 'Ownership'],
        technicalQuestionRatio: 75,
        durationEnabled: true,
        durations: [20, 30, 45],
      },
    ],
  },
  {
    industryKey: 'systems_networking',
    industryLabel: 'Systems & Networking',
    isActive: true,
    roleCategories: [
      {
        key: 'network_engineering',
        label: 'Network Engineering',
        interviewTypes: ['Technical', 'Behavioral'],
        technicalTopics: ['TCP/IP', 'DNS', 'HTTP', 'Routing & Switching'],
        behavioralTopics: ['Incident Handling', 'Communication', 'Prioritization'],
        technicalQuestionRatio: 80,
        durationEnabled: true,
        durations: [20, 30, 45],
      },
      {
        key: 'systems_programming',
        label: 'Systems Programming',
        interviewTypes: ['Technical', 'Behavioral'],
        technicalTopics: ['Operating Systems', 'Memory', 'Concurrency', 'C/C++ Basics'],
        behavioralTopics: ['Problem Solving', 'Ownership', 'Communication'],
        technicalQuestionRatio: 85,
        durationEnabled: true,
        durations: [30, 45, 60],
      },
    ],
  },
  {
    industryKey: 'databases_backend',
    industryLabel: 'Databases & Backend',
    isActive: true,
    roleCategories: [
      {
        key: 'backend_engineering',
        label: 'Backend Engineer (Junior)',
        interviewTypes: ['Technical', 'Behavioral'],
        technicalTopics: ['APIs', 'Databases', 'Authentication', 'Caching'],
        behavioralTopics: ['Ownership', 'Communication', 'Debugging Mindset'],
        technicalQuestionRatio: 80,
        durationEnabled: true,
        durations: [20, 30, 45],
      },
      {
        key: 'database_engineering',
        label: 'Database / SQL',
        interviewTypes: ['Technical', 'Behavioral'],
        technicalTopics: ['SQL', 'Indexing', 'Transactions', 'Normalization'],
        behavioralTopics: ['Attention to Detail', 'Communication', 'Ownership'],
        technicalQuestionRatio: 85,
        durationEnabled: true,
        durations: [20, 30, 45],
      },
    ],
  },
  {
    industryKey: 'computer_science_core',
    industryLabel: 'Computer Science Core',
    isActive: true,
    roleCategories: [
      {
        key: 'dsa_interview',
        label: 'DSA / Algorithms',
        interviewTypes: ['Technical', 'Behavioral'],
        technicalTopics: ['Arrays', 'Trees', 'Graphs', 'Dynamic Programming'],
        behavioralTopics: ['Problem Solving', 'Communication', 'Handling Pressure'],
        technicalQuestionRatio: 90,
        durationEnabled: true,
        durations: [20, 30, 45, 60],
      },
      {
        key: 'oop_design',
        label: 'OOP / Design Basics',
        interviewTypes: ['Technical', 'Behavioral'],
        technicalTopics: ['OOP Principles', 'Design Patterns', 'Clean Code', 'Testing Basics'],
        behavioralTopics: ['Ownership', 'Collaboration', 'Communication'],
        technicalQuestionRatio: 80,
        durationEnabled: true,
        durations: [20, 30, 45],
      },
    ],
  },
]

async function seedInterviewConfig() {
  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable')
  }

  const client = new MongoClient(MONGODB_URI)
  try {
    await client.connect()
    const db = client.db()
    const collection = db.collection('interviewconfigs')
    const now = new Date()

    for (const config of defaultInterviewConfigSeed) {
      await collection.updateOne(
        { industryKey: config.industryKey },
        {
          $set: {
            ...config,
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        { upsert: true },
      )
      console.log(`Seeded config: ${config.industryLabel}`)
    }
  } finally {
    await client.close()
  }
}

async function main() {
  try {
    await seedInterviewConfig()
    console.log('Interview config seed completed.')
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

void main()
