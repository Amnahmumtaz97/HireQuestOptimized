import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { z } from 'zod'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth',
  },
  providers: [
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

        const user = await UserModel.findOne({ email: parsed.data.email })
        if (!user) {
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
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role ?? 'user'
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
      }
      return session
    },
  },
}
