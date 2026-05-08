import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role: 'user' | 'admin'
    }
  }

  interface User {
    role: 'user' | 'admin'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'user' | 'admin'
  }
}
