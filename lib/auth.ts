import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'placeholder-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder-client-secret',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, user }) {
      if (user) {
        session.user.id = user.id
      }
      console.log('NextAuth session callback:', { session, user })
      return session
    },
    async signIn({ user, account, profile }) {
      console.log('NextAuth signIn callback:', { user, account, profile })
      return true
    },
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'database',
  },
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-key',
}
