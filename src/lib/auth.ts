import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { z } from 'zod'
import { getEnabledOAuthProviders } from '@/lib/oauth-config'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

function splitName(fullName?: string | null): { firstName: string; lastName: string } {
  const parts = (fullName ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return { firstName: 'User', lastName: 'Account' }
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: 'Account' }
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

function buildProviders(): NextAuthOptions['providers'] {
  const providers: NextAuthOptions['providers'] = [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) {
          return null
        }

        const [{ default: bcrypt }, { connectToDatabase }, { UserModel }] = await Promise.all([
          import('bcryptjs'),
          import('@/lib/mongoose'),
          import('@/models/User'),
        ])

        await connectToDatabase()

        const user = await UserModel.findOne({ email: parsed.data.email.toLowerCase() })
        if (!user?.passwordHash) {
          return null
        }

        const isValidPassword = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        )

        if (!isValidPassword) {
          return null
        }

        const fullNameFromFields = [user.firstName, user.lastName]
          .map((value) => value?.trim())
          .filter(Boolean)
          .join(' ')

        return {
          id: user._id.toString(),
          name: fullNameFromFields,
          email: user.email,
          role: user.role,
          image: user.image || undefined,
          firstName: user.firstName?.trim() || splitName(fullNameFromFields).firstName,
        }
      },
    }),
  ]

  const oauth = getEnabledOAuthProviders()

  if (oauth.google) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    )
  }

  if (oauth.github) {
    providers.push(
      GitHubProvider({
        clientId: process.env.GITHUB_ID!,
        clientSecret: process.env.GITHUB_SECRET!,
      }),
    )
  }

  return providers
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth',
  },
  providers: buildProviders(),
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider === 'credentials') {
        return true
      }

      if (account.provider !== 'google' && account.provider !== 'github') {
        return false
      }

      const email = user.email?.toLowerCase().trim()
      if (!email) {
        return false
      }

      const [{ connectToDatabase }, { UserModel }] = await Promise.all([
        import('@/lib/mongoose'),
        import('@/models/User'),
      ])

      await connectToDatabase()

      const { firstName, lastName } = splitName(user.name)
      const image = user.image ?? ''

      const existing = await UserModel.findOne({ email })
      if (existing) {
        const updates: Record<string, string> = {}
        if (image && !existing.image) {
          updates.image = image
        }
        if (!existing.passwordHash && existing.authProvider !== account.provider) {
          updates.authProvider = account.provider
        }
        if (Object.keys(updates).length > 0) {
          await UserModel.updateOne({ _id: existing._id }, { $set: updates })
        }
        user.id = existing._id.toString()
        user.role = existing.role
        return true
      }

      const created = await UserModel.create({
        firstName,
        lastName,
        email,
        image,
        authProvider: account.provider,
        role: 'user',
      })

      user.id = created._id.toString()
      user.role = created.role
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role ?? 'user'
        if (user.id) {
          token.sub = user.id
        }
        if (user.name) {
          token.name = user.name
        }
        if (user.firstName) {
          token.firstName = user.firstName
        } else if (user.name) {
          token.firstName = splitName(user.name).firstName
        }
      }

      if (account && (account.provider === 'google' || account.provider === 'github')) {
        if (user?.id) {
          token.sub = user.id
          token.role = user.role ?? 'user'
        } else if (token.email) {
          const [{ connectToDatabase }, { UserModel }] = await Promise.all([
            import('@/lib/mongoose'),
            import('@/models/User'),
          ])
          await connectToDatabase()
          const dbUser = await UserModel.findOne({
            email: String(token.email).toLowerCase(),
          })
          if (dbUser) {
            token.sub = dbUser._id.toString()
            token.role = dbUser.role
            if (dbUser.firstName) {
              token.firstName = dbUser.firstName
              token.name = [dbUser.firstName, dbUser.lastName].filter(Boolean).join(' ')
            }
          }
        }
      }

      if (token.sub && !token.firstName) {
        const [{ connectToDatabase }, { UserModel }] = await Promise.all([
          import('@/lib/mongoose'),
          import('@/models/User'),
        ])
        await connectToDatabase()
        const dbUser = await UserModel.findById(token.sub).select('firstName lastName').lean()
        if (dbUser?.firstName) {
          token.firstName = dbUser.firstName
          token.name = [dbUser.firstName, dbUser.lastName].filter(Boolean).join(' ')
        }
      }

      if (!token.role) {
        token.role = 'user'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? ''
        session.user.role = (token.role as 'user' | 'admin' | undefined) ?? 'user'
        if (typeof token.name === 'string' && token.name) {
          session.user.name = token.name
        }
        if (typeof token.firstName === 'string' && token.firstName) {
          session.user.firstName = token.firstName
        } else if (session.user.name) {
          session.user.firstName = splitName(session.user.name).firstName
        }
      }
      return session
    },
  },
}
