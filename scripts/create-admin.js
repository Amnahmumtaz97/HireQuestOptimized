#!/usr/bin/env node

const bcrypt = require('bcryptjs')
const { MongoClient } = require('mongodb')

const MONGODB_URI = process.env.MONGODB_URI

function parseArgs(argv) {
  const parsed = {}

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]

    if (arg === '--name') {
      parsed.name = argv[i + 1]
      i += 1
      continue
    }

    if (arg === '--firstName') {
      parsed.firstName = argv[i + 1]
      i += 1
      continue
    }

    if (arg === '--lastName') {
      parsed.lastName = argv[i + 1]
      i += 1
      continue
    }

    if (arg === '--email') {
      parsed.email = argv[i + 1]
      i += 1
      continue
    }

    if (arg === '--password') {
      parsed.password = argv[i + 1]
      i += 1
    }
  }

  return parsed
}

function deriveNameFields({ name, firstName, lastName }) {
  if (firstName && lastName) {
    return { firstName: firstName.trim(), lastName: lastName.trim() }
  }

  if (!name || name.trim().length < 2) {
    throw new Error(
      'Provide --firstName and --lastName, or provide --name with at least 2 characters',
    )
  }

  const normalizedName = name.trim().replace(/\s+/g, ' ')
  const [derivedFirstName, ...rest] = normalizedName.split(' ')

  return {
    firstName: derivedFirstName,
    lastName: rest.join(' ').trim() || '-',
  }
}

function validateInput({ firstName, lastName, email, password }) {
  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable')
  }

  if (!firstName || firstName.trim().length < 1) {
    throw new Error('First name is required')
  }

  if (!lastName || lastName.trim().length < 1) {
    throw new Error('Last name is required')
  }

  if (!email || !email.includes('@')) {
    throw new Error('A valid email is required')
  }

  if (!password || password.length < 8) {
    throw new Error('Password is required and must be at least 8 characters')
  }
}

async function createOrPromoteAdmin(args) {
  const { firstName, lastName } = deriveNameFields(args)
  const email = args.email
  const password = args.password

  validateInput({ firstName, lastName, email, password })

  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()

    const db = client.db()
    const users = db.collection('users')
    const normalizedEmail = email.trim().toLowerCase()
    const passwordHash = await bcrypt.hash(password, 12)
    const now = new Date()

    const result = await users.updateOne(
      { email: normalizedEmail },
      {
        $set: {
          firstName,
          lastName,
          email: normalizedEmail,
          passwordHash,
          role: 'admin',
          phoneNumber: '',
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true },
    )

    if (result.upsertedCount > 0) {
      console.log(`Admin user created: ${normalizedEmail}`)
    } else {
      console.log(`Existing user updated to admin: ${normalizedEmail}`)
    }
  } finally {
    await client.close()
  }
}

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2))
    await createOrPromoteAdmin(args)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    console.error(
      'Usage: npm run create:admin -- --firstName "Admin" --lastName "User" --email "admin@example.com" --password "yourStrongPassword"',
    )
    console.error(
      'Legacy usage is still supported: npm run create:admin -- --name "Admin User" --email "admin@example.com" --password "yourStrongPassword"',
    )
    process.exit(1)
  }
}

void main()
