import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable')
}

function formatMongoConnectionError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error)
  const normalized = message.toLowerCase()

  if (normalized.includes('bad auth') || normalized.includes('authentication failed')) {
    return new Error(
      'MongoDB authentication failed. Verify your MONGODB_URI credentials (username/password) and Atlas Network Access/IP allowlist.',
    )
  }

  if (normalized.includes('enotfound') || normalized.includes('ecconnrefused') || normalized.includes('etimedout')) {
    return new Error(
      'MongoDB connection failed. Verify your MONGODB_URI host, network connectivity, and Atlas Network Access/IP allowlist.',
    )
  }

  return new Error(message || 'MongoDB connection failed')
}

declare global {
  var mongooseConnection:
    | {
        conn: typeof mongoose | null
        promise: Promise<typeof mongoose> | null
      }
    | undefined
}

const cached = global.mongooseConnection ?? { conn: null, promise: null }

if (!global.mongooseConnection) {
  global.mongooseConnection = cached
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).catch((error: unknown) => {
      throw formatMongoConnectionError(error)
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
